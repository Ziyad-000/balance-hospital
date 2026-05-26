// src/state/slices/notification.js
import { createSlice } from "@reduxjs/toolkit"
import {
  getNotifications,
  getNotificationById,
  markNotificationAsRead,
  markMultipleAsRead,
  markAllAsRead,
  getUnreadCount,
  deleteNotification,
  deleteMultipleNotifications,
  getNotificationPreferences,
  updateNotificationPreferences,
} from "../act/actNotifications"

const initialState = {
  notifications: [],
  selectedNotification: null,
  unreadCount: 0,
  preferences: null,

  pagination: {
    totalCount: 0,
    page: 1,
    pageSize: 20,
    totalPages: 0,
    hasMore: false,
    hasPrevious: false,
    hasNext: false,
  },

  loading: {
    list: false,
    single: false,
    markAsRead: false,
    delete: false,
    preferences: false,
    unreadCount: false,
  },

  error: {
    list: null,
    single: null,
    markAsRead: null,
    delete: null,
    preferences: null,
    signalr: null,
  },

  signalr: {
    isConnected: false,
    connectionState: "Disconnected",
    error: null,
    lastConnectedAt: null,
  },

  lastUpdated: null,
}

const getMessage = (payload, fallback) => {
  return (
    payload?.messageEn ||
    payload?.messageAr ||
    payload?.message ||
    payload ||
    fallback
  )
}

const getPayloadData = (payload) => payload?.data ?? payload

const getUnreadValue = (payload) => {
  const data = getPayloadData(payload)

  if (typeof data === "number") return data
  if (typeof data?.count === "number") return data.count
  if (typeof data?.unreadCount === "number") return data.unreadCount
  if (typeof data?.unreadNotificationsCount === "number") {
    return data.unreadNotificationsCount
  }
  if (typeof payload?.unreadCount === "number") return payload.unreadCount

  return 0
}

const normalizeNotification = (payload) => {
  const data = payload?.data || payload?.notification || payload || {}

  return {
    ...data,

    id:
      data.id ||
      data.notificationId ||
      data.NotificationId ||
      data.guid ||
      data.Guid ||
      `realtime-${Date.now()}-${Math.random()}`,

    title:
      data.title ||
      data.titleEn ||
      data.titleAr ||
      data.Title ||
      data.TitleEn ||
      data.TitleAr ||
      "New notification",

    message:
      data.message ||
      data.messageEn ||
      data.messageAr ||
      data.Message ||
      data.MessageEn ||
      data.MessageAr ||
      "",

    priority:
      data.priority ||
      data.Priority ||
      data.severity ||
      data.Severity ||
      "Normal",

    type:
      data.type ||
      data.Type ||
      data.kind ||
      data.notificationType ||
      data.NotificationType ||
      "notification",

    isRead: data.isRead ?? data.IsRead ?? false,

    createdAt:
      data.createdAt ||
      data.CreatedAt ||
      data.createdOn ||
      data.CreatedOn ||
      data.timestamp ||
      data.Timestamp ||
      new Date().toISOString(),

    receivedAt: data.receivedAt || new Date().toISOString(),

    isRealtime: data.isRealtime ?? true,
  }
}

const notificationsSlice = createSlice({
  name: "notificationsSlice",
  initialState,

  reducers: {
    clearError: (state, action) => {
      const errorType = action.payload

      if (errorType) {
        state.error[errorType] = null
      } else {
        state.error = {
          list: null,
          single: null,
          markAsRead: null,
          delete: null,
          preferences: null,
          signalr: null,
        }
      }
    },

    clearSelectedNotification: (state) => {
      state.selectedNotification = null
    },

    updatePagination: (state, action) => {
      state.pagination = {
        ...state.pagination,
        ...action.payload,
      }
    },

    addRealtimeNotification: (state, action) => {
      const notification = normalizeNotification(action.payload)

      const exists = state.notifications.some(
        (item) => String(item.id) === String(notification.id)
      )

      if (!exists) {
        state.notifications.unshift(notification)
        state.pagination.totalCount += 1

        if (!notification.isRead) {
          state.unreadCount += 1
        }
      }

      state.lastUpdated = new Date().toISOString()
    },

    setUnreadCount: (state, action) => {
      state.unreadCount = Math.max(0, Number(action.payload) || 0)
    },

    incrementUnreadCount: (state, action) => {
      const value = Number(action.payload) || 1
      state.unreadCount = Math.max(0, state.unreadCount + value)
    },

    setSignalRStatus: (state, action) => {
      const payload = action.payload || {}

      state.signalr.isConnected = Boolean(payload.isConnected)
      state.signalr.connectionState =
        payload.connectionState || payload.state || "Disconnected"
      state.signalr.error = payload.error || null
      state.error.signalr = payload.error || null

      if (payload.isConnected) {
        state.signalr.lastConnectedAt = new Date().toISOString()
      }
    },

    resetState: () => initialState,
  },

  extraReducers: (builder) => {
    builder
      .addCase(getNotifications.pending, (state) => {
        state.loading.list = true
        state.error.list = null
      })

      .addCase(getNotifications.fulfilled, (state, action) => {
        state.loading.list = false

        if (action.payload?.success) {
          const data = action.payload.data || {}
          const list = data.notifications || data.items || data || []

          state.notifications = Array.isArray(list) ? list : []

          state.pagination = {
            totalCount: data.totalCount || state.notifications.length || 0,
            page: data.page || data.currentPage || 1,
            pageSize: data.pageSize || 20,
            totalPages: data.totalPages || 0,
            hasMore: data.hasMore || data.hasNext || data.hasNextPage || false,
            hasPrevious:
              data.hasPrevious || data.hasPreviousPage || false,
            hasNext: data.hasNext || data.hasNextPage || false,
          }

          if (
            typeof data.unreadCount === "number" ||
            typeof data.unreadNotificationsCount === "number"
          ) {
            state.unreadCount =
              data.unreadCount ?? data.unreadNotificationsCount
          }

          state.lastUpdated = data.lastUpdated || new Date().toISOString()
        }
      })

      .addCase(getNotifications.rejected, (state, action) => {
        state.loading.list = false
        state.error.list = getMessage(
          action.payload,
          "Failed to fetch notifications"
        )
      })

      .addCase(getNotificationById.pending, (state) => {
        state.loading.single = true
        state.error.single = null
      })

      .addCase(getNotificationById.fulfilled, (state, action) => {
        state.loading.single = false

        if (action.payload?.success) {
          state.selectedNotification = action.payload.data
        }
      })

      .addCase(getNotificationById.rejected, (state, action) => {
        state.loading.single = false
        state.error.single = getMessage(
          action.payload,
          "Failed to fetch notification"
        )
      })

      .addCase(markNotificationAsRead.pending, (state) => {
        state.loading.markAsRead = true
        state.error.markAsRead = null
      })

      .addCase(markNotificationAsRead.fulfilled, (state, action) => {
        state.loading.markAsRead = false

        const notificationId = action.payload.id

        const notification = state.notifications.find(
          (item) => String(item.id) === String(notificationId)
        )

        if (notification && !notification.isRead) {
          notification.isRead = true
          state.unreadCount = Math.max(0, state.unreadCount - 1)
        }

        if (String(state.selectedNotification?.id) === String(notificationId)) {
          state.selectedNotification.isRead = true
        }
      })

      .addCase(markNotificationAsRead.rejected, (state, action) => {
        state.loading.markAsRead = false
        state.error.markAsRead = getMessage(
          action.payload,
          "Failed to mark notification as read"
        )
      })

      .addCase(markMultipleAsRead.pending, (state) => {
        state.loading.markAsRead = true
        state.error.markAsRead = null
      })

      .addCase(markMultipleAsRead.fulfilled, (state, action) => {
        state.loading.markAsRead = false

        const ids = action.payload.ids || []

        ids.forEach((id) => {
          const notification = state.notifications.find(
            (item) => String(item.id) === String(id)
          )

          if (notification && !notification.isRead) {
            notification.isRead = true
            state.unreadCount = Math.max(0, state.unreadCount - 1)
          }
        })
      })

      .addCase(markMultipleAsRead.rejected, (state, action) => {
        state.loading.markAsRead = false
        state.error.markAsRead = getMessage(
          action.payload,
          "Failed to mark notifications as read"
        )
      })

      .addCase(markAllAsRead.pending, (state) => {
        state.loading.markAsRead = true
        state.error.markAsRead = null
      })

      .addCase(markAllAsRead.fulfilled, (state) => {
        state.loading.markAsRead = false

        state.notifications.forEach((notification) => {
          notification.isRead = true
        })

        state.unreadCount = 0
      })

      .addCase(markAllAsRead.rejected, (state, action) => {
        state.loading.markAsRead = false
        state.error.markAsRead = getMessage(
          action.payload,
          "Failed to mark all as read"
        )
      })

      .addCase(getUnreadCount.pending, (state) => {
        state.loading.unreadCount = true
      })

      .addCase(getUnreadCount.fulfilled, (state, action) => {
        state.loading.unreadCount = false

        if (action.payload?.success) {
          state.unreadCount = getUnreadValue(action.payload)
        }
      })

      .addCase(getUnreadCount.rejected, (state, action) => {
        state.loading.unreadCount = false
        state.error.list = getMessage(action.payload, state.error.list)
      })

      .addCase(deleteNotification.pending, (state) => {
        state.loading.delete = true
        state.error.delete = null
      })

      .addCase(deleteNotification.fulfilled, (state, action) => {
        state.loading.delete = false

        const notificationId = action.payload.id

        const notification = state.notifications.find(
          (item) => String(item.id) === String(notificationId)
        )

        if (notification && !notification.isRead) {
          state.unreadCount = Math.max(0, state.unreadCount - 1)
        }

        state.notifications = state.notifications.filter(
          (item) => String(item.id) !== String(notificationId)
        )

        state.pagination.totalCount = Math.max(
          0,
          state.pagination.totalCount - 1
        )
      })

      .addCase(deleteNotification.rejected, (state, action) => {
        state.loading.delete = false
        state.error.delete = getMessage(
          action.payload,
          "Failed to delete notification"
        )
      })

      .addCase(deleteMultipleNotifications.pending, (state) => {
        state.loading.delete = true
        state.error.delete = null
      })

      .addCase(deleteMultipleNotifications.fulfilled, (state, action) => {
        state.loading.delete = false

        const ids = action.payload.ids || []
        const idSet = new Set(ids.map((id) => String(id)))

        ids.forEach((id) => {
          const notification = state.notifications.find(
            (item) => String(item.id) === String(id)
          )

          if (notification && !notification.isRead) {
            state.unreadCount = Math.max(0, state.unreadCount - 1)
          }
        })

        state.notifications = state.notifications.filter(
          (item) => !idSet.has(String(item.id))
        )

        state.pagination.totalCount = Math.max(
          0,
          state.pagination.totalCount - ids.length
        )
      })

      .addCase(deleteMultipleNotifications.rejected, (state, action) => {
        state.loading.delete = false
        state.error.delete = getMessage(
          action.payload,
          "Failed to delete notifications"
        )
      })

      .addCase(getNotificationPreferences.pending, (state) => {
        state.loading.preferences = true
        state.error.preferences = null
      })

      .addCase(getNotificationPreferences.fulfilled, (state, action) => {
        state.loading.preferences = false

        if (action.payload?.success) {
          state.preferences = action.payload.data
        }
      })

      .addCase(getNotificationPreferences.rejected, (state, action) => {
        state.loading.preferences = false
        state.error.preferences = getMessage(
          action.payload,
          "Failed to fetch notification preferences"
        )
      })

      .addCase(updateNotificationPreferences.pending, (state) => {
        state.loading.preferences = true
        state.error.preferences = null
      })

      .addCase(updateNotificationPreferences.fulfilled, (state, action) => {
        state.loading.preferences = false

        if (action.payload?.success) {
          state.preferences = action.payload.data || state.preferences
        }
      })

      .addCase(updateNotificationPreferences.rejected, (state, action) => {
        state.loading.preferences = false
        state.error.preferences = getMessage(
          action.payload,
          "Failed to update notification preferences"
        )
      })
  },
})

export const {
  clearError,
  clearSelectedNotification,
  updatePagination,
  addRealtimeNotification,
  setUnreadCount,
  incrementUnreadCount,
  setSignalRStatus,
  resetState,
} = notificationsSlice.actions

export const selectNotifications = (state) => state.notifications.notifications

export const selectSelectedNotification = (state) =>
  state.notifications.selectedNotification

export const selectUnreadCount = (state) => state.notifications.unreadCount

export const selectNotificationPreferences = (state) =>
  state.notifications.preferences

export const selectNotificationsLoading = (state) =>
  state.notifications.loading

export const selectNotificationsError = (state) => state.notifications.error

export const selectNotificationsPagination = (state) =>
  state.notifications.pagination

export const selectSignalRStatus = (state) => state.notifications.signalr

export default notificationsSlice.reducer