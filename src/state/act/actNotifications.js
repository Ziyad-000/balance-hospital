// src/state/act/actNotifications.js
import { createAsyncThunk } from "@reduxjs/toolkit"
import axiosInstance from "../../utils/axiosInstance"

const getToken = () =>
  localStorage.getItem("token") ||
  sessionStorage.getItem("token") ||
  localStorage.getItem("jwt") ||
  sessionStorage.getItem("jwt") ||
  ""

const authHeaders = () => ({
  Authorization: `Bearer ${getToken()}`,
})

const extractError = (error) => {
  return (
    error.response?.data || {
      success: false,
      messageEn: error.message || "Request failed",
      messageAr: "فشل الطلب",
    }
  )
}

export const getNotifications = createAsyncThunk(
  "notificationsSlice/getNotifications",
  async (params = {}, thunkAPI) => {
    const { rejectWithValue } = thunkAPI

    try {
      const { page = 1, pageSize = 20, isRead } = params
      const queryParams = new URLSearchParams()

      queryParams.append("page", page)
      queryParams.append("pageSize", pageSize)
      if (isRead !== undefined && isRead !== null) {
        queryParams.append("isRead", isRead)
      }

      const res = await axiosInstance.get(
        `/api/v1/Notifications?${queryParams.toString()}`,
        { headers: authHeaders() }
      )

      return res.data
    } catch (error) {
      return rejectWithValue(extractError(error))
    }
  }
)

export const getNotificationById = createAsyncThunk(
  "notificationsSlice/getNotificationById",
  async (id, thunkAPI) => {
    const { rejectWithValue } = thunkAPI

    try {
      const res = await axiosInstance.get(`/api/v1/Notifications/${id}`, {
        headers: authHeaders(),
      })

      return res.data
    } catch (error) {
      return rejectWithValue(extractError(error))
    }
  }
)

export const markNotificationAsRead = createAsyncThunk(
  "notificationsSlice/markNotificationAsRead",
  async (id, thunkAPI) => {
    const { rejectWithValue } = thunkAPI

    try {
      const res = await axiosInstance.put(
        `/api/v1/Notifications/${id}/read`,
        {},
        { headers: authHeaders() }
      )

      return { id, data: res.data }
    } catch (error) {
      return rejectWithValue(extractError(error))
    }
  }
)

export const markMultipleAsRead = createAsyncThunk(
  "notificationsSlice/markMultipleAsRead",
  async (ids, thunkAPI) => {
    const { rejectWithValue } = thunkAPI

    try {
      const res = await axiosInstance.put(
        "/api/v1/Notifications/mark-multiple-read",
        ids,
        { headers: authHeaders() }
      )

      return { ids, data: res.data }
    } catch (error) {
      return rejectWithValue(extractError(error))
    }
  }
)

export const markAllAsRead = createAsyncThunk(
  "notificationsSlice/markAllAsRead",
  async (_, thunkAPI) => {
    const { rejectWithValue } = thunkAPI

    try {
      const res = await axiosInstance.put(
        "/api/v1/Notifications/mark-all-read",
        {},
        { headers: authHeaders() }
      )

      return res.data
    } catch (error) {
      return rejectWithValue(extractError(error))
    }
  }
)

export const getUnreadCount = createAsyncThunk(
  "notificationsSlice/getUnreadCount",
  async (_, thunkAPI) => {
    const { rejectWithValue } = thunkAPI

    try {
      const res = await axiosInstance.get("/api/v1/Notifications/unread-count", {
        headers: authHeaders(),
      })

      return res.data
    } catch (error) {
      return rejectWithValue(extractError(error))
    }
  }
)

export const deleteNotification = createAsyncThunk(
  "notificationsSlice/deleteNotification",
  async (id, thunkAPI) => {
    const { rejectWithValue } = thunkAPI

    try {
      const res = await axiosInstance.delete(`/api/v1/Notifications/${id}`, {
        headers: authHeaders(),
      })

      return { id, data: res.data }
    } catch (error) {
      return rejectWithValue(extractError(error))
    }
  }
)

export const deleteMultipleNotifications = createAsyncThunk(
  "notificationsSlice/deleteMultipleNotifications",
  async (ids, thunkAPI) => {
    const { rejectWithValue } = thunkAPI

    try {
      const res = await axiosInstance.delete("/api/v1/Notifications/bulk-delete", {
        data: ids,
        headers: authHeaders(),
      })

      return { ids, data: res.data }
    } catch (error) {
      return rejectWithValue(extractError(error))
    }
  }
)

export const getNotificationPreferences = createAsyncThunk(
  "notificationsSlice/getNotificationPreferences",
  async (_, thunkAPI) => {
    const { rejectWithValue } = thunkAPI

    try {
      const res = await axiosInstance.get("/api/v1/Notifications/preferences", {
        headers: authHeaders(),
      })

      return res.data
    } catch (error) {
      return rejectWithValue(extractError(error))
    }
  }
)

export const updateNotificationPreferences = createAsyncThunk(
  "notificationsSlice/updateNotificationPreferences",
  async (preferences, thunkAPI) => {
    const { rejectWithValue } = thunkAPI

    try {
      const res = await axiosInstance.put(
        "/api/v1/Notifications/preferences",
        preferences,
        { headers: authHeaders() }
      )

      return res.data
    } catch (error) {
      return rejectWithValue(extractError(error))
    }
  }
)