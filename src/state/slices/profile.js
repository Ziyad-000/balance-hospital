import { createSlice } from "@reduxjs/toolkit"

import {
  changeMyPassword,
  getMyAttendance,
  getMyBasicProfile,
  getMyDataForEditing,
  getMyProfile,
  getMyStatistics,
  getMySummary,
  removeMyPicture,
  updateMyPicture,
  updateMyProfileData,
} from "../act/actProfile"

const extractData = (payload) => payload?.data || payload || null

const extractMessage = (payload, fallback = "") => {
  return (
    payload?.messageAr ||
    payload?.messageEn ||
    payload?.message ||
    payload?.data?.messageAr ||
    payload?.data?.messageEn ||
    fallback
  )
}

const normalizeError = (payload, fallback = "حدث خطأ غير متوقع") => ({
  status: payload?.status || null,
  message:
    payload?.data?.messageAr ||
    payload?.data?.messageEn ||
    payload?.message ||
    fallback,
  errors: payload?.data?.errors || payload?.errors || [],
  raw: payload,
})

const initialState = {
  loadingProfile: false,
  loadingProfileEdit: false,
  loadingProfileAction: false,
  loadingProfileStats: false,
  loadingProfileAttendance: false,

  profileError: null,
  profileMessage: "",

  myBasicProfile: null,
  myProfile: null,
  myEditData: null,

  mySummary: null,
  myStatistics: null,
  myAttendance: null,

  updateSuccess: false,
  changePasswordSuccess: false,
  updatePictureSuccess: false,
  removePictureSuccess: false,
}

const profileSlice = createSlice({
  name: "profile",
  initialState,

  reducers: {
    clearProfileError: (state) => {
      state.profileError = null
    },

    clearProfileMessage: (state) => {
      state.profileMessage = ""
    },

    clearProfileFlags: (state) => {
      state.updateSuccess = false
      state.changePasswordSuccess = false
      state.updatePictureSuccess = false
      state.removePictureSuccess = false
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(getMyBasicProfile.pending, (state) => {
        state.loadingProfile = true
        state.profileError = null
      })
      .addCase(getMyBasicProfile.fulfilled, (state, action) => {
        state.loadingProfile = false
        state.myBasicProfile = extractData(action.payload)
        state.profileMessage = extractMessage(action.payload)
      })
      .addCase(getMyBasicProfile.rejected, (state, action) => {
        state.loadingProfile = false
        state.profileError = normalizeError(
          action.payload,
          "فشل تحميل البيانات المختصرة"
        )
      })

      .addCase(getMyProfile.pending, (state) => {
        state.loadingProfile = true
        state.profileError = null
      })
      .addCase(getMyProfile.fulfilled, (state, action) => {
        state.loadingProfile = false
        state.myProfile = extractData(action.payload)
        state.profileMessage = extractMessage(action.payload)
      })
      .addCase(getMyProfile.rejected, (state, action) => {
        state.loadingProfile = false
        state.profileError = normalizeError(
          action.payload,
          "فشل تحميل بيانات البروفايل"
        )
      })

      .addCase(getMyDataForEditing.pending, (state) => {
        state.loadingProfileEdit = true
        state.profileError = null
      })
      .addCase(getMyDataForEditing.fulfilled, (state, action) => {
        state.loadingProfileEdit = false
        state.myEditData = extractData(action.payload)
        state.profileMessage = extractMessage(action.payload)
      })
      .addCase(getMyDataForEditing.rejected, (state, action) => {
        state.loadingProfileEdit = false
        state.profileError = normalizeError(
          action.payload,
          "فشل تحميل بيانات التعديل"
        )
      })

      .addCase(updateMyProfileData.pending, (state) => {
        state.loadingProfileAction = true
        state.profileError = null
        state.updateSuccess = false
      })
      .addCase(updateMyProfileData.fulfilled, (state, action) => {
        state.loadingProfileAction = false
        state.updateSuccess = true
        state.profileMessage = extractMessage(
          action.payload,
          "تم تحديث بيانات المستخدم بنجاح"
        )
      })
      .addCase(updateMyProfileData.rejected, (state, action) => {
        state.loadingProfileAction = false
        state.updateSuccess = false
        state.profileError = normalizeError(
          action.payload,
          "فشل تحديث بيانات المستخدم"
        )
      })

      .addCase(changeMyPassword.pending, (state) => {
        state.loadingProfileAction = true
        state.profileError = null
        state.changePasswordSuccess = false
      })
      .addCase(changeMyPassword.fulfilled, (state, action) => {
        state.loadingProfileAction = false
        state.changePasswordSuccess = true
        state.profileMessage = extractMessage(
          action.payload,
          "تم تغيير كلمة المرور بنجاح"
        )
      })
      .addCase(changeMyPassword.rejected, (state, action) => {
        state.loadingProfileAction = false
        state.changePasswordSuccess = false
        state.profileError = normalizeError(
          action.payload,
          "فشل تغيير كلمة المرور"
        )
      })

      .addCase(updateMyPicture.pending, (state) => {
        state.loadingProfileAction = true
        state.profileError = null
        state.updatePictureSuccess = false
      })
      .addCase(updateMyPicture.fulfilled, (state, action) => {
        state.loadingProfileAction = false
        state.updatePictureSuccess = true
        state.profileMessage = extractMessage(
          action.payload,
          "تم تحديث صورة المستخدم بنجاح"
        )
      })
      .addCase(updateMyPicture.rejected, (state, action) => {
        state.loadingProfileAction = false
        state.updatePictureSuccess = false
        state.profileError = normalizeError(
          action.payload,
          "فشل تحديث صورة المستخدم"
        )
      })

      .addCase(removeMyPicture.pending, (state) => {
        state.loadingProfileAction = true
        state.profileError = null
        state.removePictureSuccess = false
      })
      .addCase(removeMyPicture.fulfilled, (state, action) => {
        state.loadingProfileAction = false
        state.removePictureSuccess = true
        state.profileMessage = extractMessage(
          action.payload,
          "تم حذف صورة المستخدم بنجاح"
        )
      })
      .addCase(removeMyPicture.rejected, (state, action) => {
        state.loadingProfileAction = false
        state.removePictureSuccess = false
        state.profileError = normalizeError(
          action.payload,
          "فشل حذف صورة المستخدم"
        )
      })

      .addCase(getMySummary.pending, (state) => {
        state.loadingProfileStats = true
        state.profileError = null
      })
      .addCase(getMySummary.fulfilled, (state, action) => {
        state.loadingProfileStats = false
        state.mySummary = extractData(action.payload)
        state.profileMessage = extractMessage(action.payload)
      })
      .addCase(getMySummary.rejected, (state, action) => {
        state.loadingProfileStats = false
        state.profileError = normalizeError(
          action.payload,
          "فشل تحميل ملخص الإحصائيات"
        )
      })

      .addCase(getMyStatistics.pending, (state) => {
        state.loadingProfileStats = true
        state.profileError = null
      })
      .addCase(getMyStatistics.fulfilled, (state, action) => {
        state.loadingProfileStats = false
        state.myStatistics = extractData(action.payload)
        state.profileMessage = extractMessage(action.payload)
      })
      .addCase(getMyStatistics.rejected, (state, action) => {
        state.loadingProfileStats = false
        state.profileError = normalizeError(
          action.payload,
          "فشل تحميل الإحصائيات"
        )
      })

      .addCase(getMyAttendance.pending, (state) => {
        state.loadingProfileAttendance = true
        state.profileError = null
      })
      .addCase(getMyAttendance.fulfilled, (state, action) => {
        state.loadingProfileAttendance = false
        state.myAttendance = extractData(action.payload)
        state.profileMessage = extractMessage(action.payload)
      })
      .addCase(getMyAttendance.rejected, (state, action) => {
        state.loadingProfileAttendance = false
        state.profileError = normalizeError(
          action.payload,
          "فشل تحميل سجل الحضور"
        )
      })
  },
})

export const { clearProfileError, clearProfileMessage, clearProfileFlags } =
  profileSlice.actions

export default profileSlice.reducer