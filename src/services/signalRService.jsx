import * as signalR from "@microsoft/signalr"

class SignalRService {
  constructor() {
    this.connection = null
    this.isConnecting = false
    this.reconnectAttempts = 0
    this.maxReconnectAttempts = 5
    this.notificationHandlers = []
    this.errorHandlers = []
    this.hubUrl = import.meta.env.VITE_SIGNALR_HUB_URL
  }

  // ✅ دالة محسّنة لجلب التوكن
  getToken = () => {
    // جرب كل الأماكن الممكنة للتوكن
    const token =
      sessionStorage.getItem("token") ||
      sessionStorage.getItem("jwt") ||
      sessionStorage.getItem("authToken") ||
      localStorage.getItem("token") ||
      localStorage.getItem("jwt") ||
      localStorage.getItem("authToken")

    if (!token) {
      console.error("❌ [SignalR] لا يوجد توكن! تأكد من تسجيل الدخول")
      this.triggerError("NO_TOKEN", "Authentication token not found")
    }

    console.log("🔑 [SignalR] التوكن موجود:", token ? "✓" : "✗")
    return token || ""
  }

  // ✅ دالة بناء الاتصال المحسّنة
  initializeConnection() {
    if (this.connection) {
      return
    }

    const token = this.getToken()
    if (!token) {
      console.error("❌ لا يمكن إنشاء الاتصال بدون توكن")
      return
    }

    console.log("🔧 [SignalR] بناء الاتصال...")

    this.connection = new signalR.HubConnectionBuilder()
      .withUrl(this.hubUrl, {
        accessTokenFactory: this.getToken,
        skipNegotiation: false,
        transport:
          signalR.HttpTransportType.WebSockets |
          signalR.HttpTransportType.ServerSentEvents |
          signalR.HttpTransportType.LongPolling, // إضافة LongPolling كخيار احتياطي
      })
      .withAutomaticReconnect({
        nextRetryDelayInMilliseconds: (retryContext) => {
          if (retryContext.previousRetryCount < 5) return 2000
          if (retryContext.previousRetryCount < 10) return 5000
          return 10000
        },
      })
      .configureLogging(signalR.LogLevel.Debug) // Debug في التطوير
      .build()

    // معالجة الإشعارات
    this.connection.on("notification", (payload) => {
      console.log("📩 [SignalR] إشعار جديد:", payload)
      this.notificationHandlers.forEach((handler) => {
        try {
          handler(payload)
        } catch (error) {
          console.error("❌ خطأ في معالجة الإشعار:", error)
        }
      })
    })

    // معالجة إغلاق الاتصال
    this.connection.onclose((error) => {
      console.warn("⚠️ [SignalR] الاتصال اتقفل:", error)
      this.isConnecting = false

      if (
        error?.message?.includes("401") ||
        error?.message?.includes("Unauthorized")
      ) {
        console.error("❌ مشكلة في التوكن! يرجى تسجيل الدخول مرة أخرى")
        this.triggerError("UNAUTHORIZED", "Token expired or invalid")
        return // لا تحاول إعادة الاتصال
      }

      // محاولة إعادة الاتصال
      setTimeout(() => {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
          this.reconnectAttempts++
          console.log(
            `🔄 محاولة إعادة الاتصال (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`
          )
          this.start()
        } else {
          console.error("❌ فشل الاتصال بعد عدة محاولات")
          this.triggerError("MAX_RETRIES", "Failed after maximum retries")
        }
      }, 3000)
    })

    this.connection.onreconnecting((error) => {
      console.log("🔄 [SignalR] جاري إعادة الاتصال...", error)
    })

    this.connection.onreconnected((connectionId) => {
      console.log("✅ [SignalR] تم إعادة الاتصال بنجاح! ID:", connectionId)
      this.reconnectAttempts = 0
    })
  }

  // ✅ دالة بدء الاتصال المحسّنة
  async start() {
    if (!this.connection) {
      this.initializeConnection()
    }

    if (!this.connection) {
      console.error("❌ فشل إنشاء الاتصال - تحقق من التوكن")
      return false
    }

    if (
      this.isConnecting ||
      this.connection?.state === signalR.HubConnectionState.Connected
    ) {
      console.log("⚠️ الاتصال شغال فعلاً أو جاري الاتصال")
      return true
    }

    this.isConnecting = true

    try {
      console.log("🚀 [SignalR] محاولة الاتصال...")
      await this.connection.start()
      console.log(
        "✅ [SignalR] تم الاتصال بنجاح! ID:",
        this.connection.connectionId
      )
      this.isConnecting = false
      this.reconnectAttempts = 0
      return true
    } catch (error) {
      console.error("❌ [SignalR] فشل الاتصال:", error)
      console.error("تفاصيل الخطأ:", {
        message: error.message,
        statusCode: error.statusCode,
        stack: error.stack,
      })
      this.isConnecting = false

      // تحليل نوع الخطأ
      if (error.message?.includes("401") || error.statusCode === 401) {
        console.error("❌ التوكن غير صالح أو منتهي الصلاحية!")
        this.triggerError("UNAUTHORIZED", "Token is invalid or expired")
      } else if (error.message?.includes("Failed to fetch")) {
        console.error("❌ خطأ في الشبكة - تحقق من الاتصال بالإنترنت")
        this.triggerError("NETWORK_ERROR", "Network connection failed")
      } else if (error.message?.includes("CORS")) {
        console.error("❌ خطأ CORS - تحقق من إعدادات السيرفر")
        this.triggerError("CORS_ERROR", "CORS policy error")
      }

      return false
    }
  }

  async stop() {
    if (
      this.connection &&
      this.connection.state !== signalR.HubConnectionState.Disconnected
    ) {
      try {
        await this.connection.stop()
        console.log("🛑 [SignalR] تم إيقاف الاتصال")
      } catch (error) {
        console.error("❌ خطأ في إيقاف الاتصال:", error)
      }
    }
  }

  onNotification(handler) {
    this.notificationHandlers.push(handler)
    return () => {
      const index = this.notificationHandlers.indexOf(handler)
      if (index > -1) {
        this.notificationHandlers.splice(index, 1)
      }
    }
  }

  // ✅ دالة جديدة للاستماع للأخطاء
  onError(handler) {
    this.errorHandlers.push(handler)
    return () => {
      const index = this.errorHandlers.indexOf(handler)
      if (index > -1) {
        this.errorHandlers.splice(index, 1)
      }
    }
  }

  // ✅ دالة تفعيل الأخطاء
  triggerError(code, message) {
    this.errorHandlers.forEach((handler) => {
      try {
        handler({ code, message })
      } catch (error) {
        console.error("❌ خطأ في معالجة الخطأ:", error)
      }
    })
  }

  getConnectionState() {
    return this.connection?.state || signalR.HubConnectionState.Disconnected
  }

  isConnected() {
    return this.connection?.state === signalR.HubConnectionState.Connected
  }

  async reconnect() {
    await this.stop()
    return await this.start()
  }
}

export const signalRService = new SignalRService()
