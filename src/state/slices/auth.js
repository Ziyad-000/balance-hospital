import { createSlice } from "@reduxjs/toolkit"

import UseInitialStates from "../../hooks/use-initial-state"

import {
  autoLogin,
  forgetPassword,
  logIn,
  logoutFromServer,
  refreshToken,
  registerUser,
  resendForgetPasswordCode,
  resendVerificationByEmail,
  resendVerificationByMobile,
  resetPassword,
  validateToken,
  verifyEmail,
  verifyEmailByEmail,
  verifyMobile,
  verifyPhoneBySms,
} from "../act/actAuth"

const { initialStateAuth } = UseInitialStates()

const defaultAuthState = {
  ...initialStateAuth,

  loadingAuth: initialStateAuth?.loadingAuth || false,
  authError: null,
  authMessage: "",

  token: localStorage.getItem("token") || initialStateAuth?.token || "",
  refreshToken:
    localStorage.getItem("refreshToken") ||
    initialStateAuth?.refreshToken ||
    "",
  tokenType: localStorage.getItem("tokenType") || "Bearer",
  expiresAt:
    localStorage.getItem("expiresAt") || initialStateAuth?.expiresAt || "",

  user: JSON.parse(localStorage.getItem("authUser") || "null"),
  userId: localStorage.getItem("userId") || initialStateAuth?.userId || "",

  loginRoleResponseDto: JSON.parse(
    localStorage.getItem("loginRoleResponseDto") || "null"
  ),

  departmentManager: JSON.parse(
    localStorage.getItem("departmentManager") || "null"
  ),
  categoryManager: JSON.parse(localStorage.getItem("categoryManager") || "null"),

  departmentManagerId:
    localStorage.getItem("departmentManagerId") ||
    initialStateAuth?.departmentManagerId ||
    "0",

  categoryManagerId:
    localStorage.getItem("categoryManagerId") ||
    initialStateAuth?.categoryManagerId ||
    "0",

  hyprid: localStorage.getItem("hyprid") || initialStateAuth?.hyprid || "",

  requiresEmailVerification:
    localStorage.getItem("requiresEmailVerification") === "true",

  requiresMobileVerification:
    localStorage.getItem("requiresMobileVerification") === "true",

  registerSuccess: false,
  forgetPasswordSuccess: false,
  resetPasswordSuccess: false,
  resendForgetPasswordSuccess: false,
  verificationSuccess: false,
  tokenValidationResult: null,
}

const extractApiData = (payload) => {
  return payload?.data || payload
}

const extractApiMessage = (payload, fallback = "") => {
  return (
    payload?.messageAr ||
    payload?.messageEn ||
    payload?.data?.messageAr ||
    payload?.data?.messageEn ||
    payload?.message ||
    fallback
  )
}

const normalizeError = (payload, fallback = "حدث خطأ غير متوقع") => {
  return {
    status: payload?.status || payload?.response?.status || null,
    message:
      payload?.data?.messageAr ||
      payload?.data?.messageEn ||
      payload?.message ||
      payload?.response?.data?.messageAr ||
      payload?.response?.data?.messageEn ||
      fallback,
    errors:
      payload?.data?.errors ||
      payload?.errors ||
      payload?.response?.data?.errors ||
      [],
    raw: payload,
  }
}

const clearAuthStorage = () => {
  localStorage.removeItem("token")
  localStorage.removeItem("refreshToken")
  localStorage.removeItem("tokenType")
  localStorage.removeItem("expiresAt")
  localStorage.removeItem("userId")
  localStorage.removeItem("authUser")
  localStorage.removeItem("loginRoleResponseDto")
  localStorage.removeItem("departmentManager")
  localStorage.removeItem("categoryManager")
  localStorage.removeItem("categoryArabicName")
  localStorage.removeItem("categoryEnglishName")
  localStorage.removeItem("departmentArabicName")
  localStorage.removeItem("departmentEnglishName")
  localStorage.removeItem("requiresEmailVerification")
  localStorage.removeItem("requiresMobileVerification")
  localStorage.removeItem("hyprid")

  localStorage.setItem("departmentManagerId", "0")
  localStorage.setItem("categoryManagerId", "0")
}

const persistAuthData = (state, payload) => {
  const authData = extractApiData(payload)

  const accessToken = authData?.accessToken || ""
  const refreshTokenValue = authData?.refreshToken || ""
  const tokenType = authData?.tokenType || "Bearer"
  const expiresAt = authData?.expiresAt || ""
  const user = authData?.user || null

  const role = user?.loginRoleResponseDto || null
  const departmentManager = user?.departmentManager || null
  const categoryManager = user?.categoryManager || null

  const userId = user?.userId || ""

  const departmentManagerId = departmentManager?.departmentId || "0"
  const categoryManagerId = categoryManager?.categoryId || "0"

  localStorage.setItem("token", accessToken)
  localStorage.setItem("refreshToken", refreshTokenValue)
  localStorage.setItem("tokenType", tokenType)
  localStorage.setItem("expiresAt", expiresAt)

  localStorage.setItem("userId", userId)

  if (user) {
    localStorage.setItem("authUser", JSON.stringify(user))
  }

  if (role) {
    localStorage.setItem("loginRoleResponseDto", JSON.stringify(role))
  }

  if (departmentManager) {
    localStorage.setItem("departmentManager", JSON.stringify(departmentManager))
    localStorage.setItem(
      "departmentArabicName",
      departmentManager.departmentNameAr || ""
    )
    localStorage.setItem(
      "departmentEnglishName",
      departmentManager.departmentNameEn || ""
    )
  }

  if (categoryManager) {
    localStorage.setItem("categoryManager", JSON.stringify(categoryManager))
    localStorage.setItem(
      "categoryArabicName",
      categoryManager.categoryNameAr || ""
    )
    localStorage.setItem(
      "categoryEnglishName",
      categoryManager.categoryNameEn || ""
    )
  }

  localStorage.setItem("departmentManagerId", departmentManagerId)
  localStorage.setItem("categoryManagerId", categoryManagerId)

  localStorage.setItem(
    "requiresEmailVerification",
    String(Boolean(authData?.requiresEmailVerification))
  )

  localStorage.setItem(
    "requiresMobileVerification",
    String(Boolean(authData?.requiresMobileVerification))
  )

  state.token = accessToken
  state.refreshToken = refreshTokenValue
  state.tokenType = tokenType
  state.expiresAt = expiresAt

  state.user = user
  state.userId = userId

  state.loginRoleResponseDto = role

  state.departmentManager = departmentManager
  state.categoryManager = categoryManager

  state.departmentManagerId = departmentManagerId
  state.categoryManagerId = categoryManagerId

  state.requiresEmailVerification = Boolean(authData?.requiresEmailVerification)
  state.requiresMobileVerification = Boolean(
    authData?.requiresMobileVerification
  )
}

const resetAuthAsyncFlags = (state) => {
  state.registerSuccess = false
  state.forgetPasswordSuccess = false
  state.resetPasswordSuccess = false
  state.resendForgetPasswordSuccess = false
  state.verificationSuccess = false
  state.tokenValidationResult = null
}

export const authSlice = createSlice({
  name: "authSlice",
  initialState: defaultAuthState,

  reducers: {
    logOut: (state) => {
      clearAuthStorage()

      state.token = ""
      state.refreshToken = ""
      state.tokenType = "Bearer"
      state.expiresAt = ""

      state.user = null
      state.userId = ""

      state.role = ""
      state.loginRoleResponseDto = null

      state.departmentManager = null
      state.categoryManager = null

      state.departmentManagerId = "0"
      state.categoryManagerId = "0"

      state.hyprid = ""

      state.requiresEmailVerification = false
      state.requiresMobileVerification = false

      state.loadingAuth = false
      state.authError = null
      state.authMessage = ""

      resetAuthAsyncFlags(state)
    },

    clearAuthError: (state) => {
      state.authError = null
    },

    clearAuthMessage: (state) => {
      state.authMessage = ""
    },

    clearAuthFlags: (state) => {
      resetAuthAsyncFlags(state)
    },

    setCategoryManagerRole: (state) => {
      const updatedRole = {
        ...state.loginRoleResponseDto,
        roleNameAr: "رئيس تخصص",
        roleNameEn: "Category Manager",

        userCanManageCategory: true,
        userCanManageRole: false,
        userCanManageRostors: true,
        userCanManageUsers: false,

        userCanContractingType: false,
        userCanShiftHoursType: false,
        userCanScientificDegree: false,

        userCanManageDepartments: false,
        userCanManageSubDepartments: false,

        userCanViewReports: false,
        userCanManageSchedules: false,
        userCanManageRequests: false,
      }

      localStorage.setItem("loginRoleResponseDto", JSON.stringify(updatedRole))
      localStorage.setItem("hyprid", "category")

      state.loginRoleResponseDto = updatedRole
      state.hyprid = "category"
    },

    setDepartmentManagerRole: (state) => {
      const updatedRole = {
        ...state.loginRoleResponseDto,
        roleNameAr: "رئيس قسم",
        roleNameEn: "Department Manager",

        userCanManageCategory: false,
        userCanManageRole: false,
        userCanManageRostors: false,
        userCanManageUsers: false,

        userCanContractingType: false,
        userCanShiftHoursType: false,
        userCanScientificDegree: false,

        userCanManageDepartments: true,
        userCanManageSubDepartments: false,

        userCanViewReports: false,
        userCanManageSchedules: false,
        userCanManageRequests: false,
      }

      localStorage.setItem("loginRoleResponseDto", JSON.stringify(updatedRole))
      localStorage.setItem("hyprid", "department")

      state.loginRoleResponseDto = updatedRole
      state.hyprid = "department"
    },
  },

  extraReducers: (builder) => {
    builder
      // =========================
      // Login
      // =========================
      .addCase(logIn.pending, (state) => {
        state.loadingAuth = true
        state.authError = null
        state.authMessage = ""
      })

      .addCase(logIn.fulfilled, (state, action) => {
        state.loadingAuth = false
        state.authError = null
        state.authMessage = extractApiMessage(
          action.payload,
          "تم تسجيل الدخول بنجاح"
        )

        persistAuthData(state, action.payload)
      })

      .addCase(logIn.rejected, (state, action) => {
        state.loadingAuth = false
        state.authError = normalizeError(action.payload, "فشل تسجيل الدخول")
      })

      // =========================
      // Register
      // =========================
      .addCase(registerUser.pending, (state) => {
        state.loadingAuth = true
        state.authError = null
        state.registerSuccess = false
        state.authMessage = ""
      })

      .addCase(registerUser.fulfilled, (state, action) => {
        state.loadingAuth = false
        state.authError = null
        state.registerSuccess = true
        state.authMessage = extractApiMessage(
          action.payload,
          "تم إنشاء الحساب بنجاح"
        )
      })

      .addCase(registerUser.rejected, (state, action) => {
        state.loadingAuth = false
        state.registerSuccess = false
        state.authError = normalizeError(action.payload, "فشل إنشاء الحساب")
      })

      // =========================
      // Forgot Password
      // =========================
      .addCase(forgetPassword.pending, (state) => {
        state.loadingAuth = true
        state.authError = null
        state.forgetPasswordSuccess = false
        state.authMessage = ""
      })

      .addCase(forgetPassword.fulfilled, (state, action) => {
        state.loadingAuth = false
        state.authError = null
        state.forgetPasswordSuccess = true
        state.authMessage = extractApiMessage(
          action.payload,
          "تم إرسال كود إعادة تعيين كلمة المرور"
        )
      })

      .addCase(forgetPassword.rejected, (state, action) => {
        state.loadingAuth = false
        state.forgetPasswordSuccess = false
        state.authError = normalizeError(
          action.payload,
          "تعذر إرسال كود إعادة تعيين كلمة المرور"
        )
      })

      // =========================
      // Reset Password
      // =========================
      .addCase(resetPassword.pending, (state) => {
        state.loadingAuth = true
        state.authError = null
        state.resetPasswordSuccess = false
        state.authMessage = ""
      })

      .addCase(resetPassword.fulfilled, (state, action) => {
        state.loadingAuth = false
        state.authError = null
        state.resetPasswordSuccess = true
        state.authMessage = extractApiMessage(
          action.payload,
          "تم تغيير كلمة المرور بنجاح"
        )
      })

      .addCase(resetPassword.rejected, (state, action) => {
        state.loadingAuth = false
        state.resetPasswordSuccess = false
        state.authError = normalizeError(
          action.payload,
          "تعذر تغيير كلمة المرور"
        )
      })

      // =========================
      // Resend Forgot Password Code
      // =========================
      .addCase(resendForgetPasswordCode.pending, (state) => {
        state.loadingAuth = true
        state.authError = null
        state.resendForgetPasswordSuccess = false
        state.authMessage = ""
      })

      .addCase(resendForgetPasswordCode.fulfilled, (state, action) => {
        state.loadingAuth = false
        state.authError = null
        state.resendForgetPasswordSuccess = true
        state.authMessage = extractApiMessage(
          action.payload,
          "تم إرسال الكود مرة أخرى"
        )
      })

      .addCase(resendForgetPasswordCode.rejected, (state, action) => {
        state.loadingAuth = false
        state.resendForgetPasswordSuccess = false
        state.authError = normalizeError(
          action.payload,
          "تعذر إرسال الكود مرة أخرى"
        )
      })

      // =========================
      // Auto Login
      // =========================
      .addCase(autoLogin.pending, (state) => {
        state.loadingAuth = true
        state.authError = null
      })

      .addCase(autoLogin.fulfilled, (state, action) => {
        state.loadingAuth = false
        state.authError = null
        state.authMessage = extractApiMessage(
          action.payload,
          "تم تسجيل الدخول التلقائي بنجاح"
        )

        persistAuthData(state, action.payload)
      })

      .addCase(autoLogin.rejected, (state, action) => {
        state.loadingAuth = false
        state.authError = normalizeError(
          action.payload,
          "فشل تسجيل الدخول التلقائي"
        )
      })

      // =========================
      // Refresh Token
      // =========================
      .addCase(refreshToken.pending, (state) => {
        state.loadingAuth = true
        state.authError = null
      })

      .addCase(refreshToken.fulfilled, (state, action) => {
        state.loadingAuth = false
        state.authError = null
        state.authMessage = extractApiMessage(
          action.payload,
          "تم تحديث الجلسة بنجاح"
        )

        persistAuthData(state, action.payload)
      })

      .addCase(refreshToken.rejected, (state, action) => {
        state.loadingAuth = false
        state.authError = normalizeError(action.payload, "فشل تحديث الجلسة")
      })

      // =========================
      // Logout From Server
      // =========================
      .addCase(logoutFromServer.pending, (state) => {
        state.loadingAuth = true
        state.authError = null
      })

      .addCase(logoutFromServer.fulfilled, (state) => {
        clearAuthStorage()

        state.loadingAuth = false
        state.token = ""
        state.refreshToken = ""
        state.tokenType = "Bearer"
        state.expiresAt = ""

        state.user = null
        state.userId = ""
        state.loginRoleResponseDto = null

        state.departmentManager = null
        state.categoryManager = null

        state.departmentManagerId = "0"
        state.categoryManagerId = "0"

        state.hyprid = ""
        state.requiresEmailVerification = false
        state.requiresMobileVerification = false

        state.authError = null
        state.authMessage = "تم تسجيل الخروج بنجاح"

        resetAuthAsyncFlags(state)
      })

      .addCase(logoutFromServer.rejected, (state, action) => {
        clearAuthStorage()

        state.loadingAuth = false
        state.token = ""
        state.refreshToken = ""
        state.tokenType = "Bearer"
        state.expiresAt = ""

        state.user = null
        state.userId = ""
        state.loginRoleResponseDto = null

        state.departmentManager = null
        state.categoryManager = null

        state.departmentManagerId = "0"
        state.categoryManagerId = "0"

        state.hyprid = ""
        state.requiresEmailVerification = false
        state.requiresMobileVerification = false

        state.authError = normalizeError(
          action.payload,
          "تم مسح الجلسة محليًا، لكن فشل تسجيل الخروج من السيرفر"
        )

        resetAuthAsyncFlags(state)
      })

      // =========================
      // Verify Email
      // =========================
      .addCase(verifyEmail.pending, (state) => {
        state.loadingAuth = true
        state.authError = null
        state.verificationSuccess = false
      })

      .addCase(verifyEmail.fulfilled, (state, action) => {
        state.loadingAuth = false
        state.authError = null
        state.verificationSuccess = true
        state.requiresEmailVerification = false
        localStorage.setItem("requiresEmailVerification", "false")

        state.authMessage = extractApiMessage(
          action.payload,
          "تم تأكيد البريد الإلكتروني"
        )
      })

      .addCase(verifyEmail.rejected, (state, action) => {
        state.loadingAuth = false
        state.verificationSuccess = false
        state.authError = normalizeError(
          action.payload,
          "فشل تأكيد البريد الإلكتروني"
        )
      })

      // =========================
      // Verify Email By Email
      // =========================
      .addCase(verifyEmailByEmail.pending, (state) => {
        state.loadingAuth = true
        state.authError = null
        state.verificationSuccess = false
      })

      .addCase(verifyEmailByEmail.fulfilled, (state, action) => {
        state.loadingAuth = false
        state.authError = null
        state.verificationSuccess = true
        state.requiresEmailVerification = false
        localStorage.setItem("requiresEmailVerification", "false")

        state.authMessage = extractApiMessage(
          action.payload,
          "تم تأكيد البريد الإلكتروني"
        )
      })

      .addCase(verifyEmailByEmail.rejected, (state, action) => {
        state.loadingAuth = false
        state.verificationSuccess = false
        state.authError = normalizeError(
          action.payload,
          "فشل تأكيد البريد الإلكتروني"
        )
      })

      // =========================
      // Verify Mobile
      // =========================
      .addCase(verifyMobile.pending, (state) => {
        state.loadingAuth = true
        state.authError = null
        state.verificationSuccess = false
      })

      .addCase(verifyMobile.fulfilled, (state, action) => {
        state.loadingAuth = false
        state.authError = null
        state.verificationSuccess = true
        state.requiresMobileVerification = false
        localStorage.setItem("requiresMobileVerification", "false")

        state.authMessage = extractApiMessage(
          action.payload,
          "تم تأكيد رقم الهاتف"
        )
      })

      .addCase(verifyMobile.rejected, (state, action) => {
        state.loadingAuth = false
        state.verificationSuccess = false
        state.authError = normalizeError(action.payload, "فشل تأكيد رقم الهاتف")
      })

      // =========================
      // Verify Phone By SMS
      // =========================
      .addCase(verifyPhoneBySms.pending, (state) => {
        state.loadingAuth = true
        state.authError = null
        state.verificationSuccess = false
      })

      .addCase(verifyPhoneBySms.fulfilled, (state, action) => {
        state.loadingAuth = false
        state.authError = null
        state.verificationSuccess = true
        state.requiresMobileVerification = false
        localStorage.setItem("requiresMobileVerification", "false")

        state.authMessage = extractApiMessage(
          action.payload,
          "تم تأكيد رقم الهاتف"
        )
      })

      .addCase(verifyPhoneBySms.rejected, (state, action) => {
        state.loadingAuth = false
        state.verificationSuccess = false
        state.authError = normalizeError(action.payload, "فشل تأكيد رقم الهاتف")
      })

      // =========================
      // Resend Verification By Email
      // =========================
      .addCase(resendVerificationByEmail.pending, (state) => {
        state.loadingAuth = true
        state.authError = null
        state.authMessage = ""
      })

      .addCase(resendVerificationByEmail.fulfilled, (state, action) => {
        state.loadingAuth = false
        state.authError = null
        state.authMessage = extractApiMessage(
          action.payload,
          "تم إرسال كود تأكيد البريد الإلكتروني"
        )
      })

      .addCase(resendVerificationByEmail.rejected, (state, action) => {
        state.loadingAuth = false
        state.authError = normalizeError(
          action.payload,
          "تعذر إرسال كود تأكيد البريد الإلكتروني"
        )
      })

      // =========================
      // Resend Verification By Mobile
      // =========================
      .addCase(resendVerificationByMobile.pending, (state) => {
        state.loadingAuth = true
        state.authError = null
        state.authMessage = ""
      })

      .addCase(resendVerificationByMobile.fulfilled, (state, action) => {
        state.loadingAuth = false
        state.authError = null
        state.authMessage = extractApiMessage(
          action.payload,
          "تم إرسال كود تأكيد رقم الهاتف"
        )
      })

      .addCase(resendVerificationByMobile.rejected, (state, action) => {
        state.loadingAuth = false
        state.authError = normalizeError(
          action.payload,
          "تعذر إرسال كود تأكيد رقم الهاتف"
        )
      })

      // =========================
      // Validate Token
      // =========================
      .addCase(validateToken.pending, (state) => {
        state.loadingAuth = true
        state.authError = null
        state.tokenValidationResult = null
      })

      .addCase(validateToken.fulfilled, (state, action) => {
        state.loadingAuth = false
        state.authError = null
        state.tokenValidationResult = extractApiData(action.payload)
        state.authMessage = extractApiMessage(action.payload, "التوكن صالح")
      })

      .addCase(validateToken.rejected, (state, action) => {
        state.loadingAuth = false
        state.tokenValidationResult = null
        state.authError = normalizeError(action.payload, "التوكن غير صالح")
      })
  },
})

export default authSlice.reducer

export const {
  logOut,
  clearAuthError,
  clearAuthMessage,
  clearAuthFlags,
  setDepartmentManagerRole,
  setCategoryManagerRole,
} = authSlice.actions

export { logIn }