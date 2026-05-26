// ConnectionStatus.jsx
import { useState } from "react"
import { Wifi, WifiOff, RefreshCw, AlertCircle } from "lucide-react"
import { useTranslation } from "react-i18next"

function ConnectionStatusBadge({ isConnected, connectionState, onReconnect }) {
  const { t, i18n } = useTranslation()
  const [reconnecting, setReconnecting] = useState(false)

  const isRTL = i18n.language === "ar"
  const normalizedState = String(connectionState || "Disconnected")

  const isConnecting =
    reconnecting ||
    normalizedState === "Connecting" ||
    normalizedState === "Reconnecting"

  const handleReconnect = async () => {
    if (!onReconnect || reconnecting) return

    try {
      setReconnecting(true)
      await onReconnect()
    } finally {
      setReconnecting(false)
    }
  }

  if (isConnected) {
    return (
      <div
        className={`fixed top-4 ${
          isRTL ? "left-4" : "right-4"
        } z-[9999] hidden sm:flex items-center gap-2 rounded-xl border-2 border-emerald-500 bg-[var(--color-surface)] px-3 py-2 text-emerald-500 shadow-[var(--shadow-md)]`}
      >
        <Wifi size={16} className="shrink-0" />
        <span className="text-sm font-extrabold">
          {t("signalr.connected") || "Connected"}
        </span>
      </div>
    )
  }

  return (
    <div
      className={`fixed top-4 ${
        isRTL ? "left-4" : "right-4"
      } z-[9999] flex items-center gap-2 rounded-xl border-2 ${
        isConnecting
          ? "border-amber-500 text-amber-500"
          : "border-red-500 text-red-500"
      } bg-[var(--color-surface)] px-3 py-2 shadow-[var(--shadow-md)]`}
    >
      {isConnecting ? (
        <RefreshCw size={16} className="shrink-0 animate-spin" />
      ) : (
        <WifiOff size={16} className="shrink-0" />
      )}

      <div className="leading-tight">
        <span className="block text-sm font-extrabold">
          {isConnecting
            ? t("signalr.reconnecting") || "Reconnecting..."
            : t("signalr.disconnected") || "Disconnected"}
        </span>
        <span className="block text-[11px] font-bold opacity-80">
          {normalizedState}
        </span>
      </div>

      {!isConnecting && (
        <button
          type="button"
          onClick={handleReconnect}
          disabled={reconnecting}
          className="ms-1 rounded-lg border border-current p-1 transition-colors hover:bg-red-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
          title={t("signalr.reconnect") || "Reconnect"}
          aria-label={t("signalr.reconnect") || "Reconnect"}
        >
          <RefreshCw size={14} />
        </button>
      )}

      {!onReconnect && !isConnecting && <AlertCircle size={14} />}
    </div>
  )
}

export default ConnectionStatusBadge