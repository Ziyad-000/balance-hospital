import React, { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import i18next from "i18next"
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
  Filter,
  Search,
  ChevronLeft,
  ChevronRight,
  Settings,
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

function Notification() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { t } = useTranslation()

  const { notifications, unreadCount, pagination, loading, error } =
    useSelector((state) => state.notifications)

  const { mymode } = useSelector((state) => state.mode)
  const isDark = mymode === "dark"
  const isRTL = i18next.language === "ar"

  const [selectedNotifications, setSelectedNotifications] = useState([])
  const [filterStatus, setFilterStatus] = useState("all") // all, unread, read
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    const params = {
      page: pagination.page,
      pageSize: pagination.pageSize,
    }

    if (filterStatus === "unread") params.isRead = false
    if (filterStatus === "read") params.isRead = true

    dispatch(getNotifications(params))
  }, [dispatch, pagination.page, pagination.pageSize, filterStatus])

  const handleMarkAsRead = async (id) => {
    await dispatch(markNotificationAsRead(id))
  }

  const handleMarkAllAsRead = async () => {
    await dispatch(markAllAsRead())
    dispatch(getNotifications({ page: 1, pageSize: 20 }))
  }

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: t("notifications.delete.title"),
      text: t("notifications.delete.text"),
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: t("notifications.delete.confirm"),
      cancelButtonText: t("notifications.delete.cancel"),
      background: isDark ? "#2d2d2d" : "#ffffff",
      color: isDark ? "#f0f0f0" : "#111111",
      confirmButtonColor: "#d33",
      cancelButtonColor: isDark ? "#4f83cc" : "#3085d6",
      customClass: {
        popup: isDark ? "swal2-dark-popup" : "",
      },
      reverseButtons: true,
    })

    if (result.isConfirmed) {
      try {
        await dispatch(deleteNotification(id)).unwrap()

        Swal.fire({
          title: t("notifications.delete.success.title"),
          text: t("notifications.delete.success.text"),
          icon: "success",
          confirmButtonText: t("common.ok"),
          background: isDark ? "#2d2d2d" : "#ffffff",
          color: isDark ? "#f0f0f0" : "#111111",
          confirmButtonColor: isDark ? "#4f83cc" : "#3085d6",
          customClass: {
            popup: isDark ? "swal2-dark-popup" : "",
          },
        })
      } catch (error) {
        Swal.fire({
          title: t("notifications.delete.error.title"),
          text: t("notifications.delete.error.text"),
          icon: "error",
          confirmButtonText: t("common.ok"),
          background: isDark ? "#2d2d2d" : "#ffffff",
          color: isDark ? "#f0f0f0" : "#111111",
          confirmButtonColor: isDark ? "#4f83cc" : "#3085d6",
          customClass: {
            popup: isDark ? "swal2-dark-popup" : "",
          },
        })
      }
    }
  }

  const handleBulkMarkAsRead = async () => {
    if (selectedNotifications.length > 0) {
      await dispatch(markMultipleAsRead(selectedNotifications))
      setSelectedNotifications([])
    }
  }

  const handleBulkDelete = async () => {
    if (selectedNotifications.length === 0) {
      Swal.fire({
        title: t("notifications.bulkDelete.noSelection.title"),
        text: t("notifications.bulkDelete.noSelection.text"),
        icon: "info",
        confirmButtonText: t("common.ok"),
        background: isDark ? "#2d2d2d" : "#ffffff",
        color: isDark ? "#f0f0f0" : "#111111",
        confirmButtonColor: isDark ? "#4f83cc" : "#3085d6",
        customClass: {
          popup: isDark ? "swal2-dark-popup" : "",
        },
      })
      return
    }

    const result = await Swal.fire({
      title: t("notifications.bulkDelete.title"),
      text: t("notifications.bulkDelete.text", {
        count: selectedNotifications.length,
      }),
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: t("notifications.bulkDelete.confirm"),
      cancelButtonText: t("notifications.bulkDelete.cancel"),
      background: isDark ? "#2d2d2d" : "#ffffff",
      color: isDark ? "#f0f0f0" : "#111111",
      confirmButtonColor: "#d33",
      cancelButtonColor: isDark ? "#4f83cc" : "#3085d6",
      customClass: {
        popup: isDark ? "swal2-dark-popup" : "",
      },
      reverseButtons: true,
    })

    if (result.isConfirmed) {
      try {
        await dispatch(
          deleteMultipleNotifications(selectedNotifications)
        ).unwrap()
        setSelectedNotifications([])

        Swal.fire({
          title: t("notifications.bulkDelete.success.title"),
          text: t("notifications.bulkDelete.success.text", {
            count: selectedNotifications.length,
          }),
          icon: "success",
          confirmButtonText: t("common.ok"),
          background: isDark ? "#2d2d2d" : "#ffffff",
          color: isDark ? "#f0f0f0" : "#111111",
          confirmButtonColor: isDark ? "#4f83cc" : "#3085d6",
          customClass: {
            popup: isDark ? "swal2-dark-popup" : "",
          },
        })
      } catch (error) {
        Swal.fire({
          title: t("notifications.bulkDelete.error.title"),
          text: t("notifications.bulkDelete.error.text"),
          icon: "error",
          confirmButtonText: t("common.ok"),
          background: isDark ? "#2d2d2d" : "#ffffff",
          color: isDark ? "#f0f0f0" : "#111111",
          confirmButtonColor: isDark ? "#4f83cc" : "#3085d6",
          customClass: {
            popup: isDark ? "swal2-dark-popup" : "",
          },
        })
      }
    }
  }
  const toggleSelectNotification = (id) => {
    setSelectedNotifications((prev) =>
      prev.includes(id) ? prev.filter((nId) => nId !== id) : [...prev, id]
    )
  }

  const selectAllNotifications = () => {
    if (selectedNotifications.length === notifications.length) {
      setSelectedNotifications([])
    } else {
      setSelectedNotifications(notifications.map((n) => n.id))
    }
  }

  const handleNotificationClick = async (notification) => {
    if (!notification.isRead) {
      await handleMarkAsRead(notification.id)
    }
    if (notification.actionUrl) {
      window.open(notification.actionUrl, "_blank")
    }
  }

  const getNotificationIcon = (type) => {
    switch (type?.toUpperCase()) {
      case "SUCCESS":
        return CheckCircle
      case "ERROR":
        return XCircle
      case "WARNING":
        return AlertTriangle
      case "INFO":
      default:
        return Info
    }
  }

  const getNotificationColor = (type) => {
    switch (type?.toUpperCase()) {
      case "SUCCESS":
        return "text-green-500 bg-transparent dark:bg-transparent"
      case "ERROR":
        return "text-red-500 bg-transparent dark:bg-transparent"
      case "WARNING":
        return "text-orange-500 bg-transparent dark:bg-transparent"
      case "INFO":
      default:
        return "text-blue-500 bg-transparent dark:bg-transparent"
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case "critical":
        return "border-l-4 border-red-500"
      case "high":
        return "border-l-4 border-orange-500"
      case "low":
        return "border-l-4 border-gray-400"
      case "normal":
      default:
        return "border-l-4 border-blue-500"
    }
  }

  const formatTimeAgo = (dateString) => {
    if (!dateString) return ""
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now - date) / 1000)

    if (diffInSeconds < 60) return t("notifications.justNow")
    if (diffInSeconds < 3600)
      return `${Math.floor(diffInSeconds / 60)} ${t(
        "notifications.minutesAgo"
      )}`
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)} ${t(
        "notifications.hoursAgo"
      )}`
    if (diffInSeconds < 604800)
      return `${Math.floor(diffInSeconds / 86400)} ${t(
        "notifications.daysAgo"
      )}`
    return new Intl.DateTimeFormat(i18next.language, {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date)
  }

  const filteredNotifications = notifications.filter((notification) => {
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      return (
        notification.title?.toLowerCase().includes(searchLower) ||
        notification.messagePreview?.toLowerCase().includes(searchLower)
      )
    }
    return true
  })

  if (loading.list || loading.unreadCount) {
    return <LoadingGetData text={t("notifications.loading")} />
  }

  return (
    <div
      className={`min-h-screen p-6 ${isDark ? "bg-gray-900" : "bg-gray-50"}`}
      dir={isRTL ? "rtl" : "ltr"}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div
                className={`p-3 ${
                  isDark ? "bg-gray-700" : "bg-transparent"
                } rounded-lg`}
              >
                <Bell
                  className={`h-8 w-8 ${
                    isDark ? "text-blue-500" : "text-blue-500"
                  }`}
                />
              </div>
              <div>
                <h1
                  className={`text-3xl font-bold ${
                    isDark ? "text-white" : "text-gray-900"
                  }`}
                >
                  {t("notifications.title")}
                </h1>
                <p
                  className={`text-sm ${
                    isDark ? "text-slate-500" : "text-gray-600"
                  }`}
                >
                  {unreadCount > 0
                    ? `${unreadCount} ${t("notifications.unreadMessages")}`
                    : t("notifications.noUnread")}
                </p>
              </div>
            </div>

            {/* <button
              onClick={() => navigate("preferences")}
              className="flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-slate-500 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              <Settings size={18} />
              <span className="hidden sm:inline">
                {t("notifications.settings")}
              </span>
            </button> */}
          </div>

          {/* Filters and Actions Bar */}
          <div
            className={`${
              isDark ? "bg-gray-800" : "bg-white"
            } rounded-lg shadow-sm border ${
              isDark ? "border-gray-700" : "border-gray-200"
            } p-4`}
          >
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              {/* Search */}
              <div className="flex flex-col sm:flex-row gap-4 mb-4">
                <div className="flex-1 flex items-center gap-2">
                  {/* Search Icon Container - Completely separate from input */}
                  <div
                    className={`flex items-center justify-center w-10 h-10 rounded-lg border transition-all duration-200 ${
                      isDark
                        ? "border-gray-600 bg-gray-700 text-slate-500"
                        : "border-gray-300 bg-white text-slate-500"
                    }`}
                  >
                    <Search size={20} />
                  </div>
                  {/* Input Container */}
                  <div className="relative flex-1">
                    <input
                      type="text"
                      placeholder={t("notifications.search")}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        isDark
                          ? "border-gray-600 bg-gray-700 text-white placeholder-gray-400"
                          : "border-gray-300 bg-white text-gray-900 placeholder-gray-500"
                      }`}
                    />
                  </div>
                </div>
              </div>

              {/* Filter Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setFilterStatus("all")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filterStatus === "all"
                      ? "bg-blue-600 text-white"
                      : isDark
                      ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {t("notifications.all")}
                </button>
                <button
                  onClick={() => setFilterStatus("unread")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filterStatus === "unread"
                      ? "bg-blue-600 text-white"
                      : isDark
                      ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {t("notifications.unread")}
                </button>
                <button
                  onClick={() => setFilterStatus("read")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filterStatus === "read"
                      ? "bg-blue-600 text-white"
                      : isDark
                      ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {t("notifications.read")}
                </button>
              </div>
            </div>

            {/* Bulk Actions */}
            {selectedNotifications.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <span
                    className={`text-sm font-medium ${
                      isDark ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    {selectedNotifications.length} {t("notifications.selected")}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleBulkMarkAsRead}
                      disabled={loading.markAsRead}
                      className="flex items-center gap-2 px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                    >
                      <CheckCheck size={16} />
                      {t("notifications.markAsRead")}
                    </button>
                    <button
                      onClick={handleBulkDelete}
                      disabled={loading.delete}
                      className="flex items-center gap-2 px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                    >
                      <Trash2 size={16} />
                      {t("notifications.delete.title")}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Mark All as Read */}
            {unreadCount > 0 && selectedNotifications.length === 0 && (
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={handleMarkAllAsRead}
                  disabled={loading.markAsRead}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <CheckCheck size={18} />
                  {t("notifications.markAllAsRead")}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Notifications List */}
        {error.list && (
          <div className="mb-6 p-4 bg-transparent dark:bg-transparent border border-red-300 dark:border-red-700 rounded-lg">
            <p className="text-red-500 dark:text-red-500">{error.list}</p>
          </div>
        )}

        {filteredNotifications.length === 0 ? (
          <div
            className={`${
              isDark ? "bg-gray-800" : "bg-white"
            } rounded-lg shadow-sm border ${
              isDark ? "border-gray-700" : "border-gray-200"
            } p-12`}
          >
            <div className="text-center">
              <Bell
                className={`h-16 w-16 mx-auto mb-4 ${
                  isDark ? "text-gray-600" : "text-slate-500"
                }`}
              />
              <h3
                className={`text-xl font-semibold mb-2 ${
                  isDark ? "text-gray-300" : "text-gray-700"
                }`}
              >
                {t("notifications.noNotifications")}
              </h3>
              <p className={`${isDark ? "text-slate-500" : "text-slate-500"}`}>
                {t("notifications.noNotificationsDesc")}
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Select All Checkbox */}
            {filteredNotifications.length > 0 && (
              <div
                className={`${
                  isDark ? "bg-gray-800" : "bg-white"
                } rounded-lg shadow-sm border ${
                  isDark ? "border-gray-700" : "border-gray-200"
                } p-3`}
              >
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={
                      selectedNotifications.length ===
                      filteredNotifications.length
                    }
                    onChange={selectAllNotifications}
                    className="w-4 h-4 text-blue-500 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                  />
                  <span
                    className={`${
                      isRTL ? "mr-2" : "ml-2"
                    } text-sm font-medium ${
                      isDark ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    {t("notifications.selectAll")}
                  </span>
                </label>
              </div>
            )}

            {filteredNotifications.map((notification) => {
              const NotificationIcon = getNotificationIcon(notification.type)
              const isSelected = selectedNotifications.includes(notification.id)

              return (
                <div
                  key={notification.id}
                  className={`${
                    isDark ? "bg-gray-800" : "bg-white"
                  } rounded-lg shadow-sm border ${
                    isDark ? "border-gray-700" : "border-gray-200"
                  } ${getPriorityColor(notification.priority)} ${
                    !notification.isRead ? "ring-2 ring-blue-500/20" : ""
                  } transition-all hover:shadow-md`}
                >
                  <div className="p-4">
                    <div className="flex items-start gap-4">
                      {/* Checkbox */}
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() =>
                          toggleSelectNotification(notification.id)
                        }
                        className="mt-1 w-4 h-4 text-blue-500 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                      />

                      {/* Icon */}
                      <div
                        className={`p-2 rounded-lg ${getNotificationColor(
                          notification.type
                        )} flex-shrink-0`}
                      >
                        <NotificationIcon size={20} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <h3
                              className={`text-base font-semibold ${
                                isDark ? "text-white" : "text-gray-900"
                              } ${!notification.isRead ? "font-bold" : ""}`}
                            >
                              {notification.title}
                            </h3>
                            <p
                              className={`text-sm mt-1 ${
                                isDark ? "text-slate-500" : "text-gray-600"
                              }`}
                            >
                              {notification.messagePreview}
                            </p>

                            <div className="flex items-center gap-3 mt-2">
                              <span
                                className={`text-xs flex items-center gap-1 ${
                                  isDark ? "text-slate-500" : "text-slate-500"
                                }`}
                              >
                                <Clock size={12} />
                                {formatTimeAgo(notification.createdAt)}
                              </span>

                              {notification.priority !== "Normal" && (
                                <span
                                  className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                    notification.priority === "Critical"
                                      ? "bg-transparent text-red-500 dark:bg-red-900/30 dark:text-red-500"
                                      : notification.priority === "High"
                                      ? "bg-transparent text-orange-500 dark:bg-transparent dark:text-orange-500"
                                      : "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-slate-500"
                                  }`}
                                >
                                  {notification.priority}
                                </span>
                              )}

                              {!notification.isRead && (
                                <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-transparent text-blue-500 dark:bg-transparent dark:text-blue-500">
                                  {t("notifications.new")}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {notification.hasAction && notification.actionUrl && (
                          <button
                            onClick={() =>
                              handleNotificationClick(notification)
                            }
                            className="p-2 text-blue-500 hover:bg-transparent dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                            title={t("notifications.viewDetails")}
                          >
                            <ExternalLink size={18} />
                          </button>
                        )}

                        {!notification.isRead && (
                          <button
                            onClick={() => handleMarkAsRead(notification.id)}
                            disabled={loading.markAsRead}
                            className="p-2 text-emerald-500 hover:bg-transparent dark:hover:bg-green-900/20 rounded-lg transition-colors disabled:opacity-50"
                            title={t("notifications.markAsRead")}
                          >
                            <Check size={18} />
                          </button>
                        )}

                        <button
                          onClick={() => handleDelete(notification.id)}
                          disabled={loading.delete}
                          className="p-2 text-red-500 hover:bg-transparent dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50"
                          title={t("notifications.delete.title")}
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Pagination */}
        {pagination.totalCount > pagination.pageSize && (
          <div className="mt-6 flex items-center justify-between">
            <p
              className={`text-sm ${
                isDark ? "text-slate-500" : "text-gray-600"
              }`}
            >
              {t("notifications.showing")} {notifications.length}{" "}
              {t("notifications.of")} {pagination.totalCount}
            </p>

            <div className="flex items-center gap-2">
              <button
                onClick={() =>
                  dispatch(
                    getNotifications({
                      page: pagination.page - 1,
                      pageSize: pagination.pageSize,
                    })
                  )
                }
                disabled={pagination.page === 1 || loading.list}
                className={`p-2 rounded-lg ${
                  isDark
                    ? "bg-gray-700 text-gray-300 hover:bg-gray-600 disabled:bg-gray-800"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:bg-gray-50"
                } disabled:opacity-50 disabled:cursor-not-allowed transition-colors`}
              >
                {isRTL ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
              </button>

              <span
                className={`text-sm font-medium ${
                  isDark ? "text-gray-300" : "text-gray-700"
                }`}
              >
                {pagination.page}
              </span>

              <button
                onClick={() =>
                  dispatch(
                    getNotifications({
                      page: pagination.page + 1,
                      pageSize: pagination.pageSize,
                    })
                  )
                }
                disabled={!pagination.hasMore || loading.list}
                className={`p-2 rounded-lg ${
                  isDark
                    ? "bg-gray-700 text-gray-300 hover:bg-gray-600 disabled:bg-gray-800"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:bg-gray-50"
                } disabled:opacity-50 disabled:cursor-not-allowed transition-colors`}
              >
                {isRTL ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
export default withGuard(Notification)