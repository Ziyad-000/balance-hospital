// signalRService.js
import * as signalR from "@microsoft/signalr"

const DEFAULT_EVENT_NAMES = [
  "notification",
  "Notification",
  "ReceiveNotification",
  "NotificationReceived",
  "NewNotification",
]

class SignalRService {
  constructor() {
    this.connection = null
    this.isConnecting = false
    this.notificationHandlers = new Set()
    this.errorHandlers = new Set()
    this.stateHandlers = new Set()
    this.hubUrl = import.meta.env.VITE_SIGNALR_HUB_URL
    this.eventNames = DEFAULT_EVENT_NAMES
  }

  // ✅ FIX 1: return null instead of "" so SignalR doesn't send empty token
  getToken = () => {
    const token =
      localStorage.getItem("token") ||
      localStorage.getItem("jwt") ||
      localStorage.getItem("authToken") ||
      sessionStorage.getItem("token") ||
      sessionStorage.getItem("jwt") ||
      sessionStorage.getItem("authToken") ||
      null

    if (!token) {
      console.warn("[SignalR] ⚠️ No token found in storage")
      return null
    }

    return token
  }

  getConnectionState() {
    return this.connection?.state || signalR.HubConnectionState.Disconnected
  }

  isConnected() {
    return this.getConnectionState() === signalR.HubConnectionState.Connected
  }

  emitState(error = null) {
    const payload = {
      state: this.getConnectionState(),
      isConnected: this.isConnected(),
      connectionId: this.connection?.connectionId || null,
      error,
    }

    this.stateHandlers.forEach((handler) => {
      try {
        handler(payload)
      } catch (handlerError) {
        console.error("[SignalR] state handler error:", handlerError)
      }
    })
  }

  triggerError(code, message, rawError = null) {
    const payload = { code, message, rawError }

    this.errorHandlers.forEach((handler) => {
      try {
        handler(payload)
      } catch (handlerError) {
        console.error("[SignalR] error handler error:", handlerError)
      }
    })

    this.emitState(payload)
  }

  normalizeNotification(payload) {
    const data = payload?.data || payload?.notification || payload

    return {
      ...data,
      id:
        data?.id ||
        data?.notificationId ||
        data?.NotificationId ||
        `realtime-${Date.now()}`,
      title:
        data?.title ||
        data?.titleEn ||
        data?.titleAr ||
        "New notification",
      message: data?.message || data?.messageEn || data?.messageAr || "",
      isRead: data?.isRead ?? false,
      createdAt: data?.createdAt || data?.timestamp || new Date().toISOString(),
      receivedAt: new Date().toISOString(),
      isRealtime: true,
    }
  }

  initializeConnection() {
    if (this.connection) return true

    if (!this.hubUrl) {
      console.error("[SignalR] ❌ VITE_SIGNALR_HUB_URL is not defined in .env")
      this.triggerError(
        "NO_HUB_URL",
        "VITE_SIGNALR_HUB_URL is missing in environment variables"
      )
      return false
    }

    const token = this.getToken()
    if (!token) {
      this.triggerError("NO_TOKEN", "Authentication token not found")
      return false
    }

    console.log("[SignalR] 🔗 Initializing connection to:", this.hubUrl)

    // ✅ FIX 2: Remove explicit transport flags — let SignalR negotiate automatically.
    // Forcing transport bitmask caused handshake failures with some server configs.
    this.connection = new signalR.HubConnectionBuilder()
      .withUrl(this.hubUrl, {
        accessTokenFactory: this.getToken,
        // ✅ No transport restriction — let it try WebSockets → SSE → LongPolling
      })
      .withAutomaticReconnect([0, 2000, 5000, 10000, 15000, 30000])
      .configureLogging(
        import.meta.env.MODE === "development"
          ? signalR.LogLevel.Information
          : signalR.LogLevel.Warning
      )
      .build()

    // ✅ Register all event name variants to handle case differences
    this.eventNames.forEach((eventName) => {
      this.connection.on(eventName, (payload) => {
        console.log(`[SignalR] 📨 Event received on "${eventName}":`, payload)
        const notification = this.normalizeNotification(payload)

        this.notificationHandlers.forEach((handler) => {
          try {
            handler(notification)
          } catch (handlerError) {
            console.error("[SignalR] notification handler error:", handlerError)
          }
        })
      })
    })

    this.connection.onreconnecting((error) => {
      console.warn("[SignalR] 🔄 Reconnecting...", error)
      this.isConnecting = false
      this.emitState(error)
    })

    this.connection.onreconnected((connectionId) => {
      console.log("[SignalR] ✅ Reconnected! ConnectionId:", connectionId)
      this.isConnecting = false
      this.emitState(null)
    })

    this.connection.onclose((error) => {
      console.warn("[SignalR] 🔌 Connection closed.", error)
      this.isConnecting = false

      if (
        error?.message?.includes("401") ||
        error?.message?.includes("Unauthorized")
      ) {
        this.triggerError("UNAUTHORIZED", "Token expired or invalid", error)
        return
      }

      this.emitState(error || null)
    })

    this.emitState(null)
    return true
  }

  async start() {
    // ✅ FIX 3: If connection exists but is disconnected (e.g. after stop()),
    // destroy it so initializeConnection() rebuilds it fresh with latest token.
    if (
      this.connection &&
      this.connection.state === signalR.HubConnectionState.Disconnected
    ) {
      this.connection = null
    }

    if (!this.connection && !this.initializeConnection()) return false

    if (!this.connection) return false

    if (this.connection.state === signalR.HubConnectionState.Connected) {
      this.emitState(null)
      return true
    }

    if (
      this.connection.state === signalR.HubConnectionState.Connecting ||
      this.connection.state === signalR.HubConnectionState.Reconnecting ||
      this.isConnecting
    ) {
      console.log("[SignalR] ⏳ Already connecting, skipping duplicate start()")
      return true
    }

    this.isConnecting = true
    this.emitState(null)

    try {
      console.log("[SignalR] 🚀 Starting connection...")
      await this.connection.start()
      this.isConnecting = false
      console.log(
        "[SignalR] ✅ Connected! ConnectionId:",
        this.connection.connectionId
      )
      this.emitState(null)
      return true
    } catch (error) {
      this.isConnecting = false
      console.error("[SignalR] ❌ Connection failed:", error)

      if (error?.message?.includes("401") || error?.statusCode === 401) {
        this.triggerError("UNAUTHORIZED", "Token is invalid or expired", error)
      } else if (
        error?.message?.includes("Failed to fetch") ||
        error?.message?.includes("ERR_CONNECTION_REFUSED")
      ) {
        this.triggerError("NETWORK_ERROR", "Network connection failed", error)
      } else if (error?.message?.includes("CORS")) {
        this.triggerError("CORS_ERROR", "CORS policy error", error)
      } else {
        this.triggerError(
          "CONNECTION_ERROR",
          error?.message || "SignalR connection failed",
          error
        )
      }

      return false
    }
  }

  async stop() {
    if (!this.connection) return

    console.log("[SignalR] 🛑 Stopping connection...")
    try {
      if (
        this.connection.state !== signalR.HubConnectionState.Disconnected
      ) {
        await this.connection.stop()
      }
    } finally {
      this.connection = null
      this.isConnecting = false
      this.emitState(null)
    }
  }

  async reconnect() {
    console.log("[SignalR] 🔄 Manual reconnect triggered")
    await this.stop()
    return this.start()
  }

  onNotification(handler) {
    this.notificationHandlers.add(handler)
    return () => this.notificationHandlers.delete(handler)
  }

  onError(handler) {
    this.errorHandlers.add(handler)
    return () => this.errorHandlers.delete(handler)
  }

  onStateChange(handler) {
    this.stateHandlers.add(handler)
    handler({
      state: this.getConnectionState(),
      isConnected: this.isConnected(),
      connectionId: this.connection?.connectionId || null,
      error: null,
    })
    return () => this.stateHandlers.delete(handler)
  }
}

export const signalRService = new SignalRService()
export default signalRService