// NotificationBell.jsx
import React, { useEffect, useMemo, useRef, useState } from "react"
import { Bell, Loader2 } from "lucide-react"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { getUnreadCount } from "../../state/act/actNotifications"
import { selectUnreadCount, selectNotificationsLoading } from "../../state/slices/notification"

const NotificationBell = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { t, i18n } = useTranslation()

  const unreadCount = useSelector(selectUnreadCount)
  const loading = useSelector(selectNotificationsLoading)
  const token = useSelector((state) => state.auth.token)

  const [animate, setAnimate] = useState(false)
  const previousCountRef = useRef(Number(unreadCount) || 0)

  const isRTL = i18n.language === "ar"
  const count = Number(unreadCount) || 0

  useEffect(() => {
    if (!token) return
    dispatch(getUnreadCount())
  }, [dispatch, token])

  useEffect(() => {
    if (count > previousCountRef.current) {
      setAnimate(true)
      const timeout = setTimeout(() => setAnimate(false), 700)
      previousCountRef.current = count
      return () => clearTimeout(timeout)
    }

    previousCountRef.current = count
  }, [count])

  const formattedCount = useMemo(() => {
    if (count > 99) return "99+"
    return String(count)
  }, [count])

  if (!token) return null

  const handleClick = () => {
    navigate("/admin-panel/notifications")
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="relative inline-flex h-11 w-11 items-center justify-center rounded-xl border-2 border-blue-500 bg-transparent text-blue-500 shadow-sm transition-colors hover:bg-emerald-600 hover:text-white hover:border-emerald-600"
      aria-label={t("notifications.bellLabel") || "Notifications"}
      title={t("notifications.bellLabel") || "Notifications"}
    >
      {loading?.unreadCount ? (
        <Loader2 size={21} className="animate-spin" />
      ) : (
        <Bell size={22} className={animate ? "animate-bell-ring" : ""} />
      )}

      {count > 0 && (
        <span
          className={`absolute -top-1 ${
            isRTL ? "-left-1" : "-right-1"
          } flex h-[20px] min-w-[20px] items-center justify-center rounded-full border-2 border-[var(--color-surface)] bg-red-500 px-1 text-[11px] font-black text-white shadow-sm animate-badge-pop`}
        >
          {formattedCount}
        </span>
      )}
    </button>
  )
}

export default NotificationBell