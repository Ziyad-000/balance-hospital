import { createAsyncThunk } from "@reduxjs/toolkit"
import axiosInstance from "../../utils/axiosInstance"

const AUTH_BASE = "/api/v1/Auth"

const getAuthHeaders = () => {
  const token = localStorage.getItem("token")

  return token
    ? {
        Authorization: `Bearer ${token}`,
      }
    : {}
}

const normalizeAuthError = (error, fallbackMessage = "Request failed") => {
  return {
    status: error?.response?.status,
    data: error?.response?.data,
    message:
      error?.response?.data?.messageAr ||
      error?.response?.data?.messageEn ||
      error?.response?.data?.message ||
      error?.message ||
      fallbackMessage,
    raw: error,
  }
}

/**
 * Login
 * Backend DTO:
 * {
 *   emailOrMobile: string,
 *   password: string,
 *   rememberMe: boolean
 * }
 */
export const logIn = createAsyncThunk(
  "authSlice/logIn",
  async (userData, { rejectWithValue }) => {
    try {
      const payload = {
        emailOrMobile: userData.emailOrMobile,
        password: userData.password,
        rememberMe: Boolean(userData.rememberMe),
      }

      const res = await axiosInstance.post(`${AUTH_BASE}/login`, payload)
      return res.data
    } catch (error) {
      return rejectWithValue(
        normalizeAuthError(error, "Failed to login")
      )
    }
  }
)

/**
 * Register
 * Backend RegisterRequestDto has optional ProfileImage,
 * but controller currently uses [FromBody], so JSON is safer unless backend changes to [FromForm].
 */
export const registerUser = createAsyncThunk(
  "authSlice/registerUser",
  async (userData, { rejectWithValue }) => {
    try {
      const payload = {
        nameArabic: userData.nameArabic,
        nameEnglish: userData.nameEnglish,
        email: userData.email,
        mobile: userData.mobile,
        nationalId: userData.nationalId,
        password: userData.password,
        printNumber: Number(userData.printNumber),
        contractingTypeId: userData.contractingTypeId
          ? Number(userData.contractingTypeId)
          : null,
        scientificDegreeId: userData.scientificDegreeId
          ? Number(userData.scientificDegreeId)
          : null,
        primaryCategoryId: userData.primaryCategoryId
          ? Number(userData.primaryCategoryId)
          : null,
      }

      const res = await axiosInstance.post(`${AUTH_BASE}/register`, payload)
      return res.data
    } catch (error) {
      return rejectWithValue(
        normalizeAuthError(error, "Failed to register")
      )
    }
  }
)

/**
 * Forgot Password
 * Backend DTO accepts one of:
 * {
 *   email?: string,
 *   mobile?: string,
 *   nationalId?: string
 * }
 */
export const forgetPassword = createAsyncThunk(
  "authSlice/forgetPassword",
  async (userData, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.post(
        `${AUTH_BASE}/forgot-password`,
        userData
      )

      return res.data
    } catch (error) {
      return rejectWithValue(
        normalizeAuthError(error, "Failed to send reset code")
      )
    }
  }
)

/**
 * Reset Password
 * Backend DTO:
 * {
 *   token: string,
 *   identifier: string,
 *   newPassword: string,
 *   confirmPassword: string
 * }
 */
export const resetPassword = createAsyncThunk(
  "authSlice/resetPassword",
  async (userData, { rejectWithValue }) => {
    try {
      const payload = {
        token: userData.token,
        identifier: userData.identifier,
        newPassword: userData.newPassword,
        confirmPassword: userData.confirmPassword,
      }

      const res = await axiosInstance.post(
        `${AUTH_BASE}/reset-password`,
        payload
      )

      return res.data
    } catch (error) {
      return rejectWithValue(
        normalizeAuthError(error, "Failed to reset password")
      )
    }
  }
)

/**
 * Resend Forgot Password Code
 * Same identifier DTO as forgot password.
 */
export const resendForgetPasswordCode = createAsyncThunk(
  "authSlice/resendForgetPasswordCode",
  async (userData, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.post(
        `${AUTH_BASE}/resend-forgot-password`,
        userData
      )

      return res.data
    } catch (error) {
      return rejectWithValue(
        normalizeAuthError(error, "Failed to resend reset code")
      )
    }
  }
)

/**
 * Auto Login
 * Uses cookies if backend set RememberMe cookies.
 */
export const autoLogin = createAsyncThunk(
  "authSlice/autoLogin",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get(`${AUTH_BASE}/auto-login`, {
        withCredentials: true,
      })

      return res.data
    } catch (error) {
      return rejectWithValue(
        normalizeAuthError(error, "Auto login failed")
      )
    }
  }
)

/**
 * Refresh Token
 * Backend DTO:
 * {
 *   accessToken: string,
 *   refreshToken: string
 * }
 */
export const refreshToken = createAsyncThunk(
  "authSlice/refreshToken",
  async (tokenData, { rejectWithValue }) => {
    try {
      const payload = {
        accessToken:
          tokenData?.accessToken || localStorage.getItem("token") || "",
        refreshToken:
          tokenData?.refreshToken || localStorage.getItem("refreshToken") || "",
      }

      const res = await axiosInstance.post(
        `${AUTH_BASE}/refresh-token`,
        payload
      )

      return res.data
    } catch (error) {
      return rejectWithValue(
        normalizeAuthError(error, "Failed to refresh token")
      )
    }
  }
)

/**
 * Logout
 */
export const logoutFromServer = createAsyncThunk(
  "authSlice/logoutFromServer",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.post(
        `${AUTH_BASE}/logout`,
        {},
        {
          headers: getAuthHeaders(),
          withCredentials: true,
        }
      )

      return res.data
    } catch (error) {
      return rejectWithValue(
        normalizeAuthError(error, "Failed to logout")
      )
    }
  }
)

/**
 * Verify Email by JWT user
 * Backend DTO:
 * {
 *   verificationCode: string
 * }
 */
export const verifyEmail = createAsyncThunk(
  "authSlice/verifyEmail",
  async ({ verificationCode }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.post(
        `${AUTH_BASE}/verify-email`,
        { verificationCode },
        { headers: getAuthHeaders() }
      )

      return res.data
    } catch (error) {
      return rejectWithValue(
        normalizeAuthError(error, "Failed to verify email")
      )
    }
  }
)

/**
 * Verify Email by email
 * Backend DTO:
 * {
 *   email: string,
 *   verificationCode: string
 * }
 */
export const verifyEmailByEmail = createAsyncThunk(
  "authSlice/verifyEmailByEmail",
  async ({ email, verificationCode }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.post(
        `${AUTH_BASE}/verify-email-by-email`,
        {
          email,
          verificationCode,
        }
      )

      return res.data
    } catch (error) {
      return rejectWithValue(
        normalizeAuthError(error, "Failed to verify email")
      )
    }
  }
)

/**
 * Verify Mobile by JWT user
 */
export const verifyMobile = createAsyncThunk(
  "authSlice/verifyMobile",
  async ({ verificationCode }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.post(
        `${AUTH_BASE}/verify-mobile`,
        { verificationCode },
        { headers: getAuthHeaders() }
      )

      return res.data
    } catch (error) {
      return rejectWithValue(
        normalizeAuthError(error, "Failed to verify mobile")
      )
    }
  }
)

/**
 * Verify phone by SMS
 * Backend DTO:
 * {
 *   mobile: string,
 *   verificationCode: string
 * }
 */
export const verifyPhoneBySms = createAsyncThunk(
  "authSlice/verifyPhoneBySms",
  async ({ mobile, verificationCode }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.post(
        `${AUTH_BASE}/verify-mobile-by-sms`,
        {
          mobile,
          verificationCode,
        }
      )

      return res.data
    } catch (error) {
      return rejectWithValue(
        normalizeAuthError(error, "Failed to verify mobile")
      )
    }
  }
)

/**
 * Resend verification by email
 */
export const resendVerificationByEmail = createAsyncThunk(
  "authSlice/resendVerificationByEmail",
  async ({ email }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.post(
        `${AUTH_BASE}/resend-verification-by-email`,
        { email }
      )

      return res.data
    } catch (error) {
      return rejectWithValue(
        normalizeAuthError(error, "Failed to resend email verification")
      )
    }
  }
)

/**
 * Resend verification by mobile
 */
export const resendVerificationByMobile = createAsyncThunk(
  "authSlice/resendVerificationByMobile",
  async ({ mobile }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.post(
        `${AUTH_BASE}/resend-verification-by-mobile`,
        { mobile }
      )

      return res.data
    } catch (error) {
      return rejectWithValue(
        normalizeAuthError(error, "Failed to resend mobile verification")
      )
    }
  }
)

/**
 * Validate token
 */
export const validateToken = createAsyncThunk(
  "authSlice/validateToken",
  async ({ token }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.post(
        `${AUTH_BASE}/validate-token`,
        { token }
      )

      return res.data
    } catch (error) {
      return rejectWithValue(
        normalizeAuthError(error, "Failed to validate token")
      )
    }
  }
)