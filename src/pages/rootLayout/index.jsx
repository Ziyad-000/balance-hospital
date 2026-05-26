import { Outlet } from "react-router-dom"
import Header from "../../components/Header"
import { useDispatch, useSelector } from "react-redux"
import { toast, ToastContainer } from "react-toastify"
import { useEffect, useMemo } from "react"
import { logOut } from "../../state/slices/auth"
import { useTranslation } from "react-i18next"
import { useSignalR } from "../../hooks/use-singalr"
import ConnectionStatusBadge from "../../components/notifications/ConnectionStatus"

function RootLayout() {
  const { mymode } = useSelector((state) => state.mode)
  const { expiresAt } = useSelector((state) => state.auth)

  const dispatch = useDispatch()
  const { t, i18n } = useTranslation()

  const isDark = mymode === "dark"
  const isRTL = i18n.language === "ar"

  const { isConnected, connectionState, reconnect } = useSignalR()

  const themeStyles = useMemo(() => {
    if (isDark) {
      return {
        "--color-bg": "#020617",
        "--color-bg-soft": "#0f172a",
        "--color-surface": "#111827",
        "--color-surface-muted": "#1f2937",
        "--color-text": "#f8fafc",
        "--color-text-muted": "#cbd5e1",
        "--color-border": "#334155",
        "--color-border-strong": "#475569",

        "--color-success": "#10b981",
        "--color-success-hover": "#059669",
        "--color-success-soft": "transparent",
        "--color-success-border": "#10b981",

        "--color-primary": "#3b82f6",
        "--color-primary-hover": "#2563eb",
        "--color-primary-soft": "transparent",
        "--color-primary-border": "#3b82f6",

        "--color-warning": "#f59e0b",
        "--color-warning-hover": "#d97706",
        "--color-warning-soft": "transparent",
        "--color-warning-border": "#f59e0b",

        "--color-danger": "#ef4444",
        "--color-danger-hover": "#dc2626",
        "--color-danger-soft": "transparent",
        "--color-danger-border": "#ef4444",

        "--color-purple": "#8b5cf6",
        "--color-purple-hover": "#7c3aed",
        "--color-purple-soft": "transparent",
        "--color-purple-border": "#8b5cf6",

        "--color-neutral": "#64748b",
        "--color-neutral-soft": "transparent",
        "--color-neutral-border": "#64748b",

        "--shadow-sm": "0 1px 3px rgba(0, 0, 0, 0.35)",
        "--shadow-md": "0 10px 25px rgba(0, 0, 0, 0.35)",
      }
    }

    return {
      "--color-bg": "#f8fafc",
      "--color-bg-soft": "#f1f5f9",
      "--color-surface": "#ffffff",
      "--color-surface-muted": "#f8fafc",
      "--color-text": "#0f172a",
      "--color-text-muted": "#475569",
      "--color-border": "#e2e8f0",
      "--color-border-strong": "#cbd5e1",

      "--color-success": "#10b981",
      "--color-success-hover": "#059669",
      "--color-success-soft": "transparent",
      "--color-success-border": "#10b981",

      "--color-primary": "#3b82f6",
      "--color-primary-hover": "#2563eb",
      "--color-primary-soft": "transparent",
      "--color-primary-border": "#3b82f6",

      "--color-warning": "#f59e0b",
      "--color-warning-hover": "#d97706",
      "--color-warning-soft": "transparent",
      "--color-warning-border": "#f59e0b",

      "--color-danger": "#ef4444",
      "--color-danger-hover": "#dc2626",
      "--color-danger-soft": "transparent",
      "--color-danger-border": "#ef4444",

      "--color-purple": "#8b5cf6",
      "--color-purple-hover": "#7c3aed",
      "--color-purple-soft": "transparent",
      "--color-purple-border": "#8b5cf6",

      "--color-neutral": "#64748b",
      "--color-neutral-soft": "transparent",
      "--color-neutral-border": "#64748b",

      "--shadow-sm": "0 1px 3px rgba(15, 23, 42, 0.08)",
      "--shadow-md": "0 10px 25px rgba(15, 23, 42, 0.12)",
    }
  }, [isDark])

  useEffect(() => {
    if (!expiresAt) return

    const checkTokenExpiration = () => {
      const currentTime = new Date()
      const expirationTime = new Date(expiresAt)

      if (currentTime >= expirationTime) {
        toast.error(t("session-expired"), {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        })

        dispatch(logOut())
      }
    }

    checkTokenExpiration()

    const intervalId = setInterval(checkTokenExpiration, 60000)

    return () => {
      clearInterval(intervalId)
    }
  }, [expiresAt, dispatch, t])

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        isDark
          ? "bg-gray-950 text-white"
          : "bg-slate-50 text-slate-950"
      }`}
      style={themeStyles}
      dir={isRTL ? "rtl" : "ltr"}
    >
      <style>{`
        html,
        body {
          background: var(--color-bg);
          color: var(--color-text);
        }

        * {
          scrollbar-width: thin;
          scrollbar-color: var(--color-success) var(--color-bg-soft);
        }

        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }

        ::-webkit-scrollbar-track {
          background: var(--color-bg-soft);
        }

        ::-webkit-scrollbar-thumb {
          background: var(--color-success);
          border-radius: 999px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: var(--color-success-hover);
        }

        ::selection {
          background: var(--color-success);
          color: white;
        }

        button,
        input,
        textarea,
        select,
        a {
          transition:
            background-color 0.2s ease,
            color 0.2s ease,
            border-color 0.2s ease,
            box-shadow 0.2s ease,
            transform 0.2s ease;
        }

        button:focus-visible,
        input:focus-visible,
        textarea:focus-visible,
        select:focus-visible,
        a:focus-visible {
          outline: 2px solid var(--color-success);
          outline-offset: 2px;
        }

        input,
        textarea,
        select {
          background: var(--color-surface);
          color: var(--color-text);
          border-color: var(--color-border);
        }

        input::placeholder,
        textarea::placeholder {
          color: var(--color-text-muted);
        }

        a {
          color: inherit;
          text-decoration: none;
        }

        table {
          color: var(--color-text);
        }

        .ui-icon-box {
          background: transparent;
          border-width: 2px;
        }

        .ui-icon-blue {
          color: #3b82f6;
          border-color: #3b82f6;
        }

        .ui-icon-emerald {
          color: #10b981;
          border-color: #10b981;
        }

        .ui-icon-amber {
          color: #f59e0b;
          border-color: #f59e0b;
        }

        .ui-icon-orange {
          color: #f97316;
          border-color: #f97316;
        }

        .ui-icon-violet {
          color: #8b5cf6;
          border-color: #8b5cf6;
        }

        .ui-icon-red {
          color: #ef4444;
          border-color: #ef4444;
        }

        .ui-icon-slate {
          color: #64748b;
          border-color: #64748b;
        }

        .Toastify__toast {
          border-radius: 16px;
          font-weight: 800;
          border: 1px solid var(--color-border);
          background: var(--color-surface);
          color: var(--color-text);
          box-shadow: var(--shadow-md);
        }

        .Toastify__toast--success {
          border-color: var(--color-success);
        }

        .Toastify__toast--error {
          border-color: var(--color-danger);
        }

        .Toastify__toast--warning {
          border-color: var(--color-warning);
        }

        .Toastify__progress-bar {
          background: var(--color-success);
        }
      `}</style>

      <div className="flex min-h-screen flex-col bg-[var(--color-bg)] text-[var(--color-text)]">
        <header className="sticky top-0 z-[1000] border-b border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-sm)]">
          <Header />
        </header>

        <ConnectionStatusBadge
          isConnected={isConnected}
          connectionState={connectionState}
          onReconnect={reconnect}
        />

        <ToastContainer />

        <main className="flex-1 bg-[var(--color-bg)]">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default RootLayout