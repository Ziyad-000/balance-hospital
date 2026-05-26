// src/hooks/use-signalr.js

import { useEffect, useCallback, useRef, useState } from "react"
import { useTranslation } from "react-i18next"
import { useDispatch, useSelector } from "react-redux"
import { toast } from "react-toastify"

import { signalRService } from "../services/signalRService"
import { getUnreadCount } from "../state/act/actNotifications"

import {
  addRealtimeNotification,
  setSignalRStatus,
} from "../state/slices/notification"

export const useSignalR = () => {
  const { t, i18n } = useTranslation()
  const dispatch = useDispatch()

  const token = useSelector((state) => state.auth?.token)

  const [isConnected, setIsConnected] = useState(false)
  const [connectionState, setConnectionState] = useState("Disconnected")
  const [connectionError, setConnectionError] = useState(null)

  const mountedRef = useRef(true)
  // ✅ FIX 4: Use a ref to track if we've already started to prevent
  // rapid re-renders (e.g. StrictMode double-mount) from firing two start() calls
  const startingRef = useRef(false)
  const retryTimeoutRef = useRef(null)

  // ─── Helpers ──────────────────────────────────────────────────────────────

  const getLocalizedValue = useCallback(
    (payload, arKey, enKey, fallbackKey) => {
      if (!payload) return ""

      if (i18n.language === "ar") {
        return payload[arKey] || payload[fallbackKey] || payload[enKey] || ""
      }

      return payload[enKey] || payload[fallbackKey] || payload[arKey] || ""
    },
    [i18n.language]
  )

  const normalizeNotificationPayload = useCallback(
    (payload) => {
      if (!payload) return null

      const title = getLocalizedValue(payload, "titleAr", "titleEn", "title")
      const message = getLocalizedValue(
        payload,
        "messageAr",
        "messageEn",
        "message"
      )

      const id =
        payload.id ||
        payload.notificationId ||
        payload.NotificationId ||
        payload.guid ||
        `${Date.now()}-${Math.random()}`

      return {
        ...payload,
        id,
        title,
        message,
        isRead: payload.isRead ?? false,
        createdAt:
          payload.createdAt ||
          payload.createdOn ||
          payload.timestamp ||
          new Date().toISOString(),
        priority:
          payload.priority ||
          payload.Priority ||
          payload.severity ||
          payload.Severity ||
          "Normal",
        type:
          payload.type ||
          payload.kind ||
          payload.notificationType ||
          "notification",
      }
    },
    [getLocalizedValue]
  )

  const showNotificationToast = useCallback(
    (notification) => {
      if (!notification) return

      const title =
        notification.title || t("notifications.new") || "Notification"
      const message = notification.message || ""

      const toastText = message ? `${title}: ${message}` : title
      const priority = String(notification.priority || "Normal").toLowerCase()

      if (priority === "urgent" || priority === "critical") {
        toast.error(toastText, {
          autoClose: false,
          position: "top-center",
        })
        return
      }

      if (priority === "high") {
        toast.warning(toastText, {
          autoClose: 8000,
          position: "top-right",
        })
        return
      }

      if (priority === "low") {
        toast.success(toastText, {
          autoClose: 3000,
          position: "top-right",
        })
        return
      }

      toast.info(toastText, {
        autoClose: 5000,
        position: "top-right",
      })
    },
    [t]
  )

  // ─── Notification Handler ──────────────────────────────────────────────────

  const handleNotification = useCallback(
    (payload) => {
      console.log("📨 [SignalR] Notification received:", payload)

      if (!payload) return

      if (payload.kind === "diagnostic_ping") {
        toast.info(payload.message || "Ping received!", {
          position: "top-right",
          autoClose: 3000,
        })
        return
      }

      const notification = normalizeNotificationPayload(payload)
      if (!notification) return

      showNotificationToast(notification)
      dispatch(addRealtimeNotification(notification))
      dispatch(getUnreadCount())
    },
    [dispatch, normalizeNotificationPayload, showNotificationToast]
  )

  // ─── Error Handler ─────────────────────────────────────────────────────────

  const handleError = useCallback(
    (error) => {
      console.error("🚨 [SignalR Error]:", error)

      if (!mountedRef.current) return

      setConnectionError(error)

      dispatch(
        setSignalRStatus({
          isConnected: false,
          connectionState: signalRService.getConnectionState(),
          error,
        })
      )

      switch (error?.code) {
        case "NO_TOKEN":
          console.warn("[SignalR] Token is missing — skipping toast")
          break

        case "UNAUTHORIZED":
          toast.error(
            t("signalr.errors.unauthorized") ||
              "Session expired. Please login again.",
            { position: "top-center", autoClose: 5000 }
          )
          break

        case "NETWORK_ERROR":
          toast.error(
            t("signalr.errors.network") || "Network connection error.",
            { position: "top-right", autoClose: 5000 }
          )
          break

        case "MAX_RETRIES":
          toast.error(
            t("signalr.errors.maxRetries") ||
              "SignalR connection failed after several attempts.",
            { position: "top-right", autoClose: 5000 }
          )
          break

        default:
          if (error?.message) {
            console.warn("[SignalR] Unhandled error:", error.message)
          }
          break
      }
    },
    [dispatch, t]
  )

  // ─── Sync local state with signalRService ──────────────────────────────────

  const syncConnectionState = useCallback(() => {
    if (!mountedRef.current) return

    const state = signalRService.getConnectionState()
    const connected = signalRService.isConnected()

    setIsConnected(connected)
    setConnectionState(state)

    dispatch(
      setSignalRStatus({
        isConnected: connected,
        connectionState: state,
        error: connected ? null : connectionError,
      })
    )
  }, [dispatch, connectionError])

  // ─── Start Connection ──────────────────────────────────────────────────────

  const startConnection = useCallback(async () => {
    if (startingRef.current) {
      console.log("[SignalR] ⏳ startConnection() called while already starting — skipping")
      return false
    }

    startingRef.current = true

    try {
      const connected = await signalRService.start()

      if (!mountedRef.current) return connected

      const state = signalRService.getConnectionState()

      setIsConnected(connected)
      setConnectionState(state)

      dispatch(
        setSignalRStatus({
          isConnected: connected,
          connectionState: state,
          error: connected ? null : connectionError,
        })
      )

      if (connected) {
        dispatch(getUnreadCount())
      }

      return connected
    } finally {
      startingRef.current = false
    }
  }, [dispatch, connectionError])

  // ─── Main Effect ───────────────────────────────────────────────────────────

  useEffect(() => {
    mountedRef.current = true

    // No token → disconnect and bail out
    if (!token) {
      setIsConnected(false)
      setConnectionState("Disconnected")

      dispatch(
        setSignalRStatus({
          isConnected: false,
          connectionState: "Disconnected",
          error: null,
        })
      )

      return () => {
        mountedRef.current = false
      }
    }

    // Subscribe to events
    const notificationUnsubscribe =
      signalRService.onNotification(handleNotification)
    const errorUnsubscribe = signalRService.onError(handleError)

    // ✅ FIX 5: Small delay before first connect to avoid React StrictMode
    // double-invoking the effect and firing two simultaneous start() calls
    const initTimeout = setTimeout(() => {
      if (mountedRef.current) {
        startConnection()
      }
    }, 100)

    // ✅ FIX 6: Polling interval — only attempts reconnect when truly Disconnected,
    // not Connecting/Reconnecting. Avoids flooding the server.
    const interval = setInterval(() => {
      if (!mountedRef.current) return

      syncConnectionState()

      const state = signalRService.getConnectionState()

      if (
        state === "Disconnected" &&
        !startingRef.current
      ) {
        console.log("[SignalR] 🔁 Polling detected disconnected — attempting reconnect")
        startConnection()
      }
    }, 10000)

    return () => {
      mountedRef.current = false

      clearTimeout(initTimeout)
      clearInterval(interval)

      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current)
      }

      if (notificationUnsubscribe) notificationUnsubscribe()
      if (errorUnsubscribe) errorUnsubscribe()

      // ✅ NOTE: We intentionally do NOT call signalRService.stop() here.
      // The service is a singleton and survives React re-renders / layout changes.
      // Calling stop() on every unmount breaks reconnection on route changes.
    }
  }, [
    token,
    dispatch,
    handleNotification,
    handleError,
    startConnection,
    syncConnectionState,
  ])

  // ─── Manual Reconnect ──────────────────────────────────────────────────────

  const reconnect = useCallback(async () => {
    console.log("🔄 [SignalR] Manual reconnect...")

    setConnectionError(null)

    dispatch(
      setSignalRStatus({
        isConnected: false,
        connectionState: "Reconnecting",
        error: null,
      })
    )

    const success = await signalRService.reconnect()

    if (!mountedRef.current) return success

    const state = signalRService.getConnectionState()

    setIsConnected(success)
    setConnectionState(state)

    dispatch(
      setSignalRStatus({
        isConnected: success,
        connectionState: state,
        error: success ? null : connectionError,
      })
    )

    if (success) {
      dispatch(getUnreadCount())

      toast.success(
        t("signalr.reconnected") || "Reconnected successfully",
        { position: "top-right", autoClose: 3000 }
      )
    } else {
      toast.error(
        t("signalr.reconnectFailed") || "Reconnect failed",
        { position: "top-right", autoClose: 4000 }
      )
    }

    return success
  }, [dispatch, t, connectionError])

  // ─── Return ────────────────────────────────────────────────────────────────

  return {
    isConnected,
    connectionState,
    connectionError,
    reconnect,
  }
}

export default useSignalR