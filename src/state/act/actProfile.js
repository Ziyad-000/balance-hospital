import { createAsyncThunk } from "@reduxjs/toolkit"
import axiosInstance from "../../utils/axiosInstance"

const PROFILE_BASE = "/api/v1/Profile"

const normalizeProfileError = (error, fallbackMessage = "Request failed") => ({
  status: error?.response?.status,
  data: error?.response?.data,
  message:
    error?.response?.data?.messageAr ||
    error?.response?.data?.messageEn ||
    error?.response?.data?.message ||
    error?.message ||
    fallbackMessage,
  errors: error?.response?.data?.errors || [],
  raw: error,
})

export const getMyBasicProfile = createAsyncThunk(
  "profile/getMyBasicProfile",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get(`${PROFILE_BASE}/MyBasicProfile`)
      return res.data
    } catch (error) {
      return rejectWithValue(
        normalizeProfileError(error, "Failed to get basic profile")
      )
    }
  }
)

export const getMyProfile = createAsyncThunk(
  "profile/getMyProfile",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get(`${PROFILE_BASE}/MyProfile`)
      return res.data
    } catch (error) {
      return rejectWithValue(
        normalizeProfileError(error, "Failed to get profile")
      )
    }
  }
)

export const getMyDataForEditing = createAsyncThunk(
  "profile/getMyDataForEditing",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get(`${PROFILE_BASE}/GetMyDataForEditing`)
      return res.data
    } catch (error) {
      return rejectWithValue(
        normalizeProfileError(error, "Failed to get profile edit data")
      )
    }
  }
)

export const updateMyProfileData = createAsyncThunk(
  "profile/updateMyProfileData",
  async (profileData, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.put(
        `${PROFILE_BASE}/UpdateMyProfileData`,
        profileData
      )
      return res.data
    } catch (error) {
      return rejectWithValue(
        normalizeProfileError(error, "Failed to update profile")
      )
    }
  }
)

export const changeMyPassword = createAsyncThunk(
  "profile/changeMyPassword",
  async (passwordData, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.post(
        `${PROFILE_BASE}/ChangeMyPassword`,
        passwordData
      )
      return res.data
    } catch (error) {
      return rejectWithValue(
        normalizeProfileError(error, "Failed to change password")
      )
    }
  }
)

export const updateMyPicture = createAsyncThunk(
  "profile/updateMyPicture",
  async (file, { rejectWithValue }) => {
    try {
      const formData = new FormData()
      formData.append("img", file)

      const res = await axiosInstance.post(
        `${PROFILE_BASE}/UpdateMyPicture`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      )

      return res.data
    } catch (error) {
      return rejectWithValue(
        normalizeProfileError(error, "Failed to update profile picture")
      )
    }
  }
)

export const removeMyPicture = createAsyncThunk(
  "profile/removeMyPicture",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.delete(`${PROFILE_BASE}/RemoveMyPicture`)
      return res.data
    } catch (error) {
      return rejectWithValue(
        normalizeProfileError(error, "Failed to remove profile picture")
      )
    }
  }
)

export const getMySummary = createAsyncThunk(
  "profile/getMySummary",
  async ({ month, year } = {}, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get(`${PROFILE_BASE}/my/summary`, {
        params: {
          month: month || undefined,
          year: year || undefined,
        },
      })

      return res.data
    } catch (error) {
      return rejectWithValue(
        normalizeProfileError(error, "Failed to get profile summary")
      )
    }
  }
)

export const getMyStatistics = createAsyncThunk(
  "profile/getMyStatistics",
  async ({ month, year } = {}, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get(`${PROFILE_BASE}/my/statistics`, {
        params: {
          month: month || undefined,
          year: year || undefined,
        },
      })

      return res.data
    } catch (error) {
      return rejectWithValue(
        normalizeProfileError(error, "Failed to get profile statistics")
      )
    }
  }
)

export const getMyAttendance = createAsyncThunk(
  "profile/getMyAttendance",
  async (
    { month, year, page = 1, pageSize = 10 } = {},
    { rejectWithValue }
  ) => {
    try {
      const res = await axiosInstance.get(`${PROFILE_BASE}/my/attendance`, {
        params: {
          month: month || undefined,
          year: year || undefined,
          page,
          pageSize,
        },
      })

      return res.data
    } catch (error) {
      return rejectWithValue(
        normalizeProfileError(error, "Failed to get attendance records")
      )
    }
  }
)