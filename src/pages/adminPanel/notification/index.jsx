import React, { useCallback, useEffect, useMemo, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  Info,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  ExternalLink,
  Search,
  ChevronLeft,
  ChevronRight,
  Shield,
  Megaphone,
  Inbox,
  MailOpen,
  Mail,
  RefreshCw,
  SlidersHorizontal,
  X,
} from "lucide-react"

import {
  getNotifications,
  markNotificationAsRead,
  markAllAsRead,
  deleteNotification,
  markMultipleAsRead,
  deleteMultipleNotifications,
} from "../../../state/act/actNotifications"

import LoadingGetData from "../../../components/LoadingGetData"
import Swal from "sweetalert2"
import withGuard from "../../../utils/withGuard"
import { getPageTheme } from "../../../utils/themeClasses"

function Notification() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { t, i18n } = useTranslation()
  const theme = getPageTheme()

  const { notifications, unreadCount, pagination, loading, error } =
    useSelector((state) => state.notifications)

  const { mymode } = useSelector((state) => state.mode)
  const isDark = mymode === "dark"
  const currentLang = i18n.language || "ar"
  const isRTL = currentLang === "ar" || i18n.dir() === "rtl"

  const [selectedNotifications, setSelectedNotifications] = useState([])
  const [filterStatus, setFilterStatus] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")

  const safeNotifications = Array.isArray(notifications) ? notifications : []

  const page = pagination?.page || 1
  const pageSize = pagination?.pageSize || 20
  const totalCount = pagination?.totalCount || 0
  const hasMore = pagination?.hasMore || pagination?.hasNextPage || false

  const loadNotifications = useCallback(
    (override = {}) => {
      const nextPage = override.page ?? page
      const nextPageSize = override.pageSize ?? pageSize
      const nextFilter = override.filterStatus ?? filterStatus

      const params = {
        page: nextPage,
        pageSize: nextPageSize,
      }

      if (nextFilter === "unread") params.isRead = false
      if (nextFilter === "read") params.isRead = true

      dispatch(getNotifications(params))
    },
    [dispatch, page, pageSize, filterStatus]
  )

  useEffect(() => {
    loadNotifications()
  }, [loadNotifications])

  useEffect(() => {
    setSelectedNotifications([])
  }, [filterStatus, page])

  const swalTheme = {
    background: isDark ? "#1f2937" : "#ffffff",
    color: isDark ? "#f9fafb" : "#111827",
    customClass: {
      popup: isDark ? "swal2-dark-popup" : "",
    },
  }

  const refreshCurrentList = () => {
    loadNotifications()
  }

  const handleMarkAsRead = async (id) => {
    await dispatch(markNotificationAsRead(id)).unwrap?.()
    refreshCurrentList()
  }

  const handleMarkAllAsRead = async () => {
    await dispatch(markAllAsRead()).unwrap?.()
    setSelectedNotifications([])
    loadNotifications({ page: 1 })
  }

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: t("notifications.delete.title") || "Delete notification?",
      text:
        t("notifications.delete.text") ||
        "Are you sure you want to delete this notification?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: t("notifications.delete.confirm") || "Delete",
      cancelButtonText: t("notifications.delete.cancel") || "Cancel",
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#64748b",
      reverseButtons: true,
      ...swalTheme,
    })

    if (!result.isConfirmed) return

    try {
      await dispatch(deleteNotification(id)).unwrap()
      setSelectedNotifications((prev) => prev.filter((item) => item !== id))
      refreshCurrentList()

      Swal.fire({
        title: t("notifications.delete.success.title") || "Deleted",
        text:
          t("notifications.delete.success.text") ||
          "Notification deleted successfully.",
        icon: "success",
        confirmButtonText: t("common.ok") || "OK",
        confirmButtonColor: "#10b981",
        ...swalTheme,
      })
    } catch {
      Swal.fire({
        title: t("notifications.delete.error.title") || "Error",
        text:
          t("notifications.delete.error.text") ||
          "Failed to delete notification.",
        icon: "error",
        confirmButtonText: t("common.ok") || "OK",
        confirmButtonColor: "#ef4444",
        ...swalTheme,
      })
    }
  }

  const handleBulkMarkAsRead = async () => {
    if (selectedNotifications.length === 0) return

    await dispatch(markMultipleAsRead(selectedNotifications)).unwrap?.()
    setSelectedNotifications([])
    refreshCurrentList()
  }

  const handleBulkDelete = async () => {
    if (selectedNotifications.length === 0) {
      Swal.fire({
        title: t("notifications.bulkDelete.noSelection.title") || "No selection",
        text:
          t("notifications.bulkDelete.noSelection.text") ||
          "Select notifications first.",
        icon: "info",
        confirmButtonText: t("common.ok") || "OK",
        confirmButtonColor: "#3b82f6",
        ...swalTheme,
      })
      return
    }

    const count = selectedNotifications.length

    const result = await Swal.fire({
      title: t("notifications.bulkDelete.title") || "Delete selected?",
      text:
        t("notifications.bulkDelete.text", { count }) ||
        `Delete ${count} selected notifications?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: t("notifications.bulkDelete.confirm") || "Delete",
      cancelButtonText: t("notifications.bulkDelete.cancel") || "Cancel",
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#64748b",
      reverseButtons: true,
      ...swalTheme,
    })

    if (!result.isConfirmed) return

    try {
      await dispatch(deleteMultipleNotifications(selectedNotifications)).unwrap()
      setSelectedNotifications([])
      refreshCurrentList()

      Swal.fire({
        title: t("notifications.bulkDelete.success.title") || "Deleted",
        text:
          t("notifications.bulkDelete.success.text", { count }) ||
          `${count} notifications deleted successfully.`,
        icon: "success",
        confirmButtonText: t("common.ok") || "OK",
        confirmButtonColor: "#10b981",
        ...swalTheme,
      })
    } catch {
      Swal.fire({
        title: t("notifications.bulkDelete.error.title") || "Error",
        text:
          t("notifications.bulkDelete.error.text") ||
          "Failed to delete selected notifications.",
        icon: "error",
        confirmButtonText: t("common.ok") || "OK",
        confirmButtonColor: "#ef4444",
        ...swalTheme,
      })
    }
  }

  const toggleSelectNotification = (id) => {
    setSelectedNotifications((prev) =>
      prev.includes(id) ? prev.filter((nId) => nId !== id) : [...prev, id]
    )
  }

  const getLocalized = (item, baseName, fallback = "-") => {
    if (!item) return fallback

    const arKeys = [
      `${baseName}Ar`,
      `${baseName}Arabic`,
      `${baseName}NameAr`,
      `${baseName}TextAr`,
      "titleAr",
      "messageAr",
      "descriptionAr",
      "typeNameAr",
    ]

    const enKeys = [
      `${baseName}En`,
      `${baseName}English`,
      `${baseName}NameEn`,
      `${baseName}TextEn`,
      "titleEn",
      "messageEn",
      "descriptionEn",
      "typeNameEn",
    ]

    const directKeys = [baseName, "title", "message", "messagePreview", "description"]

    const preferred = isRTL ? arKeys : enKeys
    const fallbackKeys = isRTL ? enKeys : arKeys

    for (const key of preferred) {
      if (item[key]) return item[key]
    }

    for (const key of fallbackKeys) {
      if (item[key]) return item[key]
    }

    for (const key of directKeys) {
      if (item[key]) return item[key]
    }

    return fallback
  }

  const filteredNotifications = useMemo(() => {
    const q = searchTerm.trim().toLowerCase()

    if (!q) return safeNotifications

    return safeNotifications.filter((notification) => {
      const searchable = [
        notification.title,
        notification.titleAr,
        notification.titleEn,
        notification.message,
        notification.messageAr,
        notification.messageEn,
        notification.messagePreview,
        notification.type,
        notification.typeNameAr,
        notification.typeNameEn,
        notification.priority,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()

      return searchable.includes(q)
    })
  }, [safeNotifications, searchTerm])

  const selectAllNotifications = () => {
    const visibleIds = filteredNotifications.map((n) => n.id)
    const allVisibleSelected =
      visibleIds.length > 0 &&
      visibleIds.every((id) => selectedNotifications.includes(id))

    if (allVisibleSelected) {
      setSelectedNotifications((prev) =>
        prev.filter((id) => !visibleIds.includes(id))
      )
    } else {
      setSelectedNotifications((prev) => Array.from(new Set([...prev, ...visibleIds])))
    }
  }

  const handleNotificationClick = async (notification) => {
    if (!notification.isRead) {
      await handleMarkAsRead(notification.id)
    }

    if (notification.actionUrl) {
      window.open(notification.actionUrl, "_blank", "noopener,noreferrer")
    }
  }

  const getNotificationTone = (notification) => {
    const type = String(notification?.type || "").toUpperCase()
    const priority = String(notification?.priority || "").toLowerCase()

    if (priority === "critical" || type === "ERROR" || type === "SECURITY") {
      return {
        key: "red",
        icon: type === "SECURITY" ? Shield : XCircle,
        border: "border-red-500",
        text: "text-red-500",
        label:
          currentLang === "ar"
            ? notification?.typeNameAr || "خطر"
            : notification?.typeNameEn || notification?.type || "Critical",
      }
    }

    if (priority === "high" || type === "WARNING" || type === "REMINDER") {
      return {
        key: "orange",
        icon: AlertTriangle,
        border: "border-orange-500",
        text: "text-orange-500",
        label:
          currentLang === "ar"
            ? notification?.typeNameAr || "تنبيه"
            : notification?.typeNameEn || notification?.type || "Warning",
      }
    }

    if (type === "SUCCESS") {
      return {
        key: "green",
        icon: CheckCircle,
        border: "border-emerald-500",
        text: "text-emerald-500",
        label:
          currentLang === "ar"
            ? notification?.typeNameAr || "نجاح"
            : notification?.typeNameEn || notification?.type || "Success",
      }
    }

    if (type === "ANNOUNCEMENT") {
      return {
        key: "violet",
        icon: Megaphone,
        border: "border-violet-500",
        text: "text-violet-500",
        label:
          currentLang === "ar"
            ? notification?.typeNameAr || "إعلان"
            : notification?.typeNameEn || notification?.type || "Announcement",
      }
    }

    return {
      key: "blue",
      icon: Info,
      border: "border-blue-500",
      text: "text-blue-500",
      label:
        currentLang === "ar"
          ? notification?.typeNameAr || "معلومات"
          : notification?.typeNameEn || notification?.type || "Info",
    }
  }

  const formatTimeAgo = (dateString) => {
    if (!dateString) return ""

    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now - date) / 1000)

    if (Number.isNaN(date.getTime())) return ""

    if (diffInSeconds < 60) return t("notifications.justNow") || "Just now"
    if (diffInSeconds < 3600) {
      return `${Math.floor(diffInSeconds / 60)} ${
        t("notifications.minutesAgo") || "min ago"
      }`
    }
    if (diffInSeconds < 86400) {
      return `${Math.floor(diffInSeconds / 3600)} ${
        t("notifications.hoursAgo") || "hours ago"
      }`
    }
    if (diffInSeconds < 604800) {
      return `${Math.floor(diffInSeconds / 86400)} ${
        t("notifications.daysAgo") || "days ago"
      }`
    }

    return new Intl.DateTimeFormat(currentLang, {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date)
  }

  const unreadVisibleCount = filteredNotifications.filter((n) => !n.isRead).length
  const readVisibleCount = filteredNotifications.filter((n) => n.isRead).length
  const visibleIds = filteredNotifications.map((n) => n.id)
  const allVisibleSelected =
    visibleIds.length > 0 &&
    visibleIds.every((id) => selectedNotifications.includes(id))

  const filterTabs = [
    {
      id: "all",
      label: t("notifications.all") || "All",
      icon: Inbox,
      count: totalCount || safeNotifications.length,
      tone: "blue",
    },
    {
      id: "unread",
      label: t("notifications.unread") || "Unread",
      icon: Mail,
      count: unreadCount || unreadVisibleCount,
      tone: "orange",
    },
    {
      id: "read",
      label: t("notifications.read") || "Read",
      icon: MailOpen,
      count: readVisibleCount,
      tone: "green",
    },
  ]

  if (loading.list || loading.unreadCount) {
    return <LoadingGetData text={t("notifications.loading") || "Loading notifications..."} />
  }

  return (
    <div className={theme.page} dir={isRTL ? "rtl" : "ltr"}>
      <div className="mx-auto max-w-7xl space-y-6">
        <div className={`${theme.card} p-5 md:p-6`}>
          <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex items-start gap-4">
              <IconBox icon={Bell} tone="blue" size="lg" />

              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-3xl font-black text-[var(--color-text)]">
                    {t("notifications.title") || "Notifications"}
                  </h1>

                  {unreadCount > 0 && (
                    <span className="inline-flex items-center rounded-full border-2 border-orange-500 px-3 py-1 text-xs font-black text-orange-500">
                      {unreadCount} {t("notifications.unread") || "Unread"}
                    </span>
                  )}
                </div>

                <p className="mt-1 text-sm font-semibold text-[var(--color-text-muted)]">
                  {unreadCount > 0
                    ? `${unreadCount} ${t("notifications.unreadMessages") || "unread messages"}`
                    : t("notifications.noUnread") || "No unread notifications"}
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <ActionButton
                icon={RefreshCw}
                tone="slate"
                onClick={() => refreshCurrentList()}
                disabled={loading.list}
              >
                {t("common.refresh") || "Refresh"}
              </ActionButton>

              {unreadCount > 0 && selectedNotifications.length === 0 && (
                <ActionButton
                  icon={CheckCheck}
                  tone="green"
                  onClick={handleMarkAllAsRead}
                  disabled={loading.markAsRead}
                >
                  {t("notifications.markAllAsRead") || "Mark all as read"}
                </ActionButton>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <SummaryCard
            icon={Inbox}
            label={t("notifications.all") || "All"}
            value={totalCount || safeNotifications.length}
            tone="blue"
          />
          <SummaryCard
            icon={Mail}
            label={t("notifications.unread") || "Unread"}
            value={unreadCount || 0}
            tone="orange"
          />
          <SummaryCard
            icon={CheckCheck}
            label={t("notifications.selected") || "Selected"}
            value={selectedNotifications.length}
            tone={selectedNotifications.length > 0 ? "violet" : "slate"}
          />
        </div>

        <div className={`${theme.card} p-4`}>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative flex-1">
              <Search
                size={18}
                className={`absolute top-1/2 -translate-y-1/2 text-blue-500 ${
                  isRTL ? "right-3" : "left-3"
                }`}
              />
              <input
                type="text"
                placeholder={t("notifications.search") || "Search notifications..."}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] py-3 text-sm font-bold text-[var(--color-text)] outline-none transition-colors placeholder:text-[var(--color-text-muted)] focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 ${
                  isRTL ? "pr-10 pl-10" : "pl-10 pr-10"
                }`}
              />

              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                  className={`absolute top-1/2 -translate-y-1/2 rounded-lg p-1 text-slate-500 hover:text-red-500 ${
                    isRTL ? "left-3" : "right-3"
                  }`}
                >
                  <X size={16} />
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {filterTabs.map((tab) => (
                <FilterTab
                  key={tab.id}
                  active={filterStatus === tab.id}
                  icon={tab.icon}
                  label={tab.label}
                  count={tab.count}
                  tone={tab.tone}
                  onClick={() => {
                    setFilterStatus(tab.id)
                    loadNotifications({ page: 1, filterStatus: tab.id })
                  }}
                />
              ))}
            </div>
          </div>

          {selectedNotifications.length > 0 && (
            <div className="mt-4 rounded-2xl border-2 border-violet-500 bg-transparent p-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-center gap-3">
                  <IconBox icon={SlidersHorizontal} tone="violet" />
                  <div>
                    <p className="font-black text-[var(--color-text)]">
                      {selectedNotifications.length} {t("notifications.selected") || "selected"}
                    </p>
                    <p className="text-xs font-bold text-[var(--color-text-muted)]">
                      {currentLang === "ar"
                        ? "اختر الإجراء المطلوب على الإشعارات المحددة"
                        : "Choose an action for the selected notifications"}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-2 sm:flex-row">
                  <ActionButton
                    icon={CheckCheck}
                    tone="green"
                    onClick={handleBulkMarkAsRead}
                    disabled={loading.markAsRead}
                  >
                    {t("notifications.markAsRead") || "Mark as read"}
                  </ActionButton>

                  <ActionButton
                    icon={Trash2}
                    tone="red"
                    onClick={handleBulkDelete}
                    disabled={loading.delete}
                  >
                    {t("notifications.delete.title") || "Delete"}
                  </ActionButton>
                </div>
              </div>
            </div>
          )}
        </div>

        {error.list && (
          <div className={`${theme.card} border-2 border-red-500 p-4`}>
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 h-5 w-5 text-red-500" />
              <p className="text-sm font-bold text-red-500">{error.list}</p>
            </div>
          </div>
        )}

        {filteredNotifications.length === 0 ? (
          <EmptyState
            searchTerm={searchTerm}
            currentLang={currentLang}
            t={t}
          />
        ) : (
          <div className={`${theme.card} overflow-hidden`}>
            <div className="flex flex-col gap-3 border-b border-[var(--color-border)] bg-[var(--color-surface-muted)] p-4 sm:flex-row sm:items-center sm:justify-between">
              <label className="flex cursor-pointer items-center gap-3">
                <input
                  type="checkbox"
                  checked={allVisibleSelected}
                  onChange={selectAllNotifications}
                  className="h-4 w-4 rounded border-[var(--color-border-strong)] text-blue-500 focus:ring-blue-500"
                />
                <span className="text-sm font-black text-[var(--color-text)]">
                  {t("notifications.selectAll") || "Select all"}
                </span>
                <span className="text-xs font-bold text-[var(--color-text-muted)]">
                  ({filteredNotifications.length})
                </span>
              </label>

              <p className="text-xs font-bold text-[var(--color-text-muted)]">
                {currentLang === "ar"
                  ? "اضغط على الإشعار لفتح الإجراء أو تعليمه كمقروء"
                  : "Click a notification to open its action or mark it as read"}
              </p>
            </div>

            <div className="divide-y divide-[var(--color-border)]">
              {filteredNotifications.map((notification) => {
                const tone = getNotificationTone(notification)
                const isSelected = selectedNotifications.includes(notification.id)
                const NotificationIcon = tone.icon

                return (
                  <NotificationRow
                    key={notification.id}
                    notification={notification}
                    title={getLocalized(notification, "title")}
                    message={getLocalized(notification, "message", notification.messagePreview || "-")}
                    typeLabel={tone.label}
                    tone={tone}
                    NotificationIcon={NotificationIcon}
                    isSelected={isSelected}
                    isRTL={isRTL}
                    currentLang={currentLang}
                    t={t}
                    loading={loading}
                    formatTimeAgo={formatTimeAgo}
                    onToggle={() => toggleSelectNotification(notification.id)}
                    onClick={() => handleNotificationClick(notification)}
                    onMarkAsRead={() => handleMarkAsRead(notification.id)}
                    onDelete={() => handleDelete(notification.id)}
                  />
                )
              })}
            </div>
          </div>
        )}

        {totalCount > pageSize && (
          <div className={`${theme.card} p-4`}>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm font-bold text-[var(--color-text-muted)]">
                {t("notifications.showing") || "Showing"} {safeNotifications.length}{" "}
                {t("notifications.of") || "of"} {totalCount}
              </p>

              <div className="flex items-center gap-2">
                <ActionButton
                  icon={isRTL ? ChevronRight : ChevronLeft}
                  tone="slate"
                  onClick={() => loadNotifications({ page: page - 1 })}
                  disabled={page === 1 || loading.list}
                  iconOnly
                />

                <span className="min-w-12 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-4 py-2 text-center text-sm font-black text-[var(--color-text)]">
                  {page}
                </span>

                <ActionButton
                  icon={isRTL ? ChevronLeft : ChevronRight}
                  tone="slate"
                  onClick={() => loadNotifications({ page: page + 1 })}
                  disabled={!hasMore || loading.list}
                  iconOnly
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

const toneClasses = {
  blue: "text-blue-500 border-blue-500",
  green: "text-emerald-500 border-emerald-500",
  orange: "text-orange-500 border-orange-500",
  yellow: "text-amber-500 border-amber-500",
  red: "text-red-500 border-red-500",
  violet: "text-violet-500 border-violet-500",
  slate: "text-slate-500 border-slate-500",
}

function IconBox({ icon: Icon, tone = "blue", size = "md" }) {
  const boxSize = size === "lg" ? "h-14 w-14 rounded-2xl" : "h-10 w-10 rounded-xl"

  return (
    <span
      className={`${boxSize} inline-flex shrink-0 items-center justify-center border-2 bg-transparent ${
        toneClasses[tone] || toneClasses.blue
      }`}
    >
      <Icon size={size === "lg" ? 28 : 20} />
    </span>
  )
}

function ActionButton({
  children,
  icon: Icon,
  tone = "blue",
  onClick,
  disabled,
  iconOnly = false,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 rounded-xl border bg-[var(--color-surface)] px-4 py-2 text-sm font-black text-[var(--color-text)] transition-colors hover:bg-[var(--color-success)] hover:text-white disabled:cursor-not-allowed disabled:opacity-50 ${
        iconOnly ? "px-3" : ""
      }`}
    >
      {Icon && (
        <Icon
          size={18}
          className={
            disabled
              ? "text-[var(--color-text-muted)]"
              : toneClasses[tone]?.split(" ")[0] || "text-blue-500"
          }
        />
      )}
      {!iconOnly && children}
    </button>
  )
}

function FilterTab({ active, icon: Icon, label, count, tone, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-black transition-colors ${
        active
          ? "border-[var(--color-success)] bg-[var(--color-success)] text-white"
          : "border-[var(--color-border-strong)] bg-[var(--color-surface)] text-[var(--color-text)] hover:bg-[var(--color-success)] hover:text-white"
      }`}
    >
      <Icon
        size={16}
        className={active ? "text-white" : toneClasses[tone]?.split(" ")[0] || "text-blue-500"}
      />
      <span>{label}</span>
      <span
        className={`rounded-full px-2 py-0.5 text-[11px] ${
          active
            ? "bg-white/20 text-white"
            : "bg-[var(--color-surface-muted)] text-[var(--color-text-muted)]"
        }`}
      >
        {count ?? 0}
      </span>
    </button>
  )
}

function SummaryCard({ icon: Icon, label, value, tone }) {
  return (
    <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-bold text-[var(--color-text-muted)]">
            {label}
          </p>
          <p
            className={`mt-1 text-2xl font-black ${
              toneClasses[tone]?.split(" ")[0] || "text-blue-500"
            }`}
          >
            {value ?? 0}
          </p>
        </div>

        <IconBox icon={Icon} tone={tone} />
      </div>
    </div>
  )
}

function NotificationRow({
  notification,
  title,
  message,
  typeLabel,
  tone,
  NotificationIcon,
  isSelected,
  isRTL,
  currentLang,
  t,
  loading,
  formatTimeAgo,
  onToggle,
  onClick,
  onMarkAsRead,
  onDelete,
}) {
  const unreadClass = !notification.isRead
    ? "bg-blue-500/5"
    : "bg-[var(--color-surface)]"

  return (
    <div
      className={`group relative ${unreadClass} p-4 transition-colors hover:bg-[var(--color-surface-muted)] ${
        isSelected ? "ring-2 ring-violet-500/40" : ""
      }`}
    >
      <div
        className={`absolute top-0 h-full w-1 ${tone.border.replace("border-", "bg-")} ${
          isRTL ? "right-0" : "left-0"
        }`}
      />

      <div className={`flex gap-4 ${isRTL ? "pr-3" : "pl-3"}`}>
        <input
          type="checkbox"
          checked={isSelected}
          onChange={onToggle}
          onClick={(e) => e.stopPropagation()}
          className="mt-2 h-4 w-4 shrink-0 rounded border-[var(--color-border-strong)] text-blue-500 focus:ring-blue-500"
        />

        <button
          type="button"
          onClick={onClick}
          className="flex min-w-0 flex-1 items-start gap-4 text-start"
        >
          <IconBox icon={NotificationIcon} tone={tone.key} />

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3
                className={`line-clamp-1 text-base text-[var(--color-text)] ${
                  !notification.isRead ? "font-black" : "font-bold"
                }`}
              >
                {title}
              </h3>

              {!notification.isRead && (
                <span className="inline-flex items-center rounded-full border border-blue-500 px-2 py-0.5 text-[11px] font-black text-blue-500">
                  {t("notifications.new") || "New"}
                </span>
              )}
            </div>

            <p className="mt-1 line-clamp-2 text-sm font-semibold text-[var(--color-text-muted)]">
              {message}
            </p>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-black ${
                  toneClasses[tone.key] || toneClasses.blue
                }`}
              >
                {typeLabel}
              </span>

              {notification.priority && notification.priority !== "Normal" && (
                <span className="inline-flex items-center rounded-full border border-orange-500 px-2.5 py-1 text-xs font-black text-orange-500">
                  {notification.priority}
                </span>
              )}

              <span className="inline-flex items-center gap-1 text-xs font-bold text-[var(--color-text-muted)]">
                <Clock size={13} className="text-slate-500" />
                {formatTimeAgo(notification.createdAt)}
              </span>
            </div>
          </div>
        </button>

        <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
          {notification.hasAction && notification.actionUrl && (
            <IconAction
              icon={ExternalLink}
              tone="blue"
              title={t("notifications.viewDetails") || "View details"}
              onClick={onClick}
            />
          )}

          {!notification.isRead && (
            <IconAction
              icon={Check}
              tone="green"
              title={t("notifications.markAsRead") || "Mark as read"}
              onClick={onMarkAsRead}
              disabled={loading.markAsRead}
            />
          )}

          <IconAction
            icon={Trash2}
            tone="red"
            title={t("notifications.delete.title") || "Delete"}
            onClick={onDelete}
            disabled={loading.delete}
          />
        </div>
      </div>
    </div>
  )
}

function IconAction({ icon: Icon, tone, title, onClick, disabled }) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation()
        onClick?.()
      }}
      disabled={disabled}
      title={title}
      className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--color-border-strong)] bg-[var(--color-surface)] transition-colors hover:bg-[var(--color-success)] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
    >
      <Icon
        size={18}
        className={toneClasses[tone]?.split(" ")[0] || "text-blue-500"}
      />
    </button>
  )
}

function EmptyState({ searchTerm, currentLang, t }) {
  return (
    <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-12 text-center shadow-sm">
      <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-3xl border-2 border-blue-500 text-blue-500">
        <Bell size={38} />
      </div>

      <h3 className="text-xl font-black text-[var(--color-text)]">
        {searchTerm
          ? currentLang === "ar"
            ? "لا توجد نتائج مطابقة"
            : "No matching results"
          : t("notifications.noNotifications") || "No notifications"}
      </h3>

      <p className="mx-auto mt-2 max-w-md text-sm font-semibold text-[var(--color-text-muted)]">
        {searchTerm
          ? currentLang === "ar"
            ? "جرّب كلمة بحث مختلفة أو غيّر الفلتر الحالي."
            : "Try another search keyword or change the current filter."
          : t("notifications.noNotificationsDesc") ||
            "You do not have notifications at the moment."}
      </p>
    </div>
  )
}

export default withGuard(Notification)