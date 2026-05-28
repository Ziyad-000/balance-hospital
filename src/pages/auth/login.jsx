"use client"

import React, { useMemo, useState } from "react"
import { Formik, Form, Field, ErrorMessage } from "formik"
import { useDispatch, useSelector } from "react-redux"
import { Link, useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { toast } from "react-toastify"
import Swal from "sweetalert2"
import i18next from "i18next"
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Eye,
  EyeOff,
  Lock,
  LogIn,
  Mail,
  ShieldCheck,
  User,
} from "lucide-react"

import { logIn } from "../../state/act/actAuth"
import UseInitialValues from "../../hooks/use-initial-values"
import UseFormValidation from "../../hooks/use-form-validation"
import UseDirection from "../../hooks/use-direction"
import { signalRService } from "../../services/signalRService"

const getApiData = (payload) => payload?.data || payload || {}

const getApiUser = (payload) => {
  const data = getApiData(payload)
  return data?.user || null
}

const getApiMessage = (payload, currentLang, fallback) => {
  return currentLang === "ar"
    ? payload?.messageAr ||
        payload?.data?.messageAr ||
        payload?.message ||
        fallback
    : payload?.messageEn ||
        payload?.data?.messageEn ||
        payload?.message ||
        fallback
}

const getErrorMessage = (error, currentLang, fallback) => {
  const data = error?.data || error?.response?.data || error?.raw?.response?.data

  if (currentLang === "ar") {
    return (
      data?.messageAr ||
      error?.message ||
      data?.message ||
      error?.response?.data?.messageAr ||
      fallback
    )
  }

  return (
    data?.messageEn ||
    error?.message ||
    data?.message ||
    error?.response?.data?.messageEn ||
    fallback
  )
}

const isSystemAdministrator = (role) => {
  const roleEn = role?.roleNameEn || ""
  const roleAr = role?.roleNameAr || ""

  return (
    roleEn === "System Administrator" ||
    roleEn.toLowerCase().includes("system administrator") ||
    roleAr === "مدير النظام"
  )
}

const isHybridHead = (role) => {
  const roleEn = role?.roleNameEn || ""
  const roleAr = role?.roleNameAr || ""

  return (
    roleEn === "Category & Department Head" ||
    roleEn.toLowerCase().includes("category & department") ||
    roleAr.includes("رئيس تخصص وقسم")
  )
}

const isDepartmentManager = (role) => {
  const roleEn = role?.roleNameEn || ""
  const roleAr = role?.roleNameAr || ""

  return (
    roleEn === "Department Manager" ||
    roleEn === "Department Head" ||
    roleEn.toLowerCase().includes("department") ||
    roleAr.includes("مدير قسم") ||
    roleAr.includes("رئيس قسم")
  )
}

const isCategoryManager = (role) => {
  const roleEn = role?.roleNameEn || ""
  const roleAr = role?.roleNameAr || ""

  return (
    roleEn === "Category Manager" ||
    roleEn === "Category Head" ||
    roleEn.toLowerCase().includes("category") ||
    roleAr.includes("رئيس تخصص") ||
    roleAr.includes("مدير تخصص")
  )
}

const getRoleTargetPath = (user) => {
  const role = user?.loginRoleResponseDto
  const departmentManager = user?.departmentManager
  const categoryManager = user?.categoryManager

  if (isHybridHead(role)) {
    return "/specify-role"
  }

  if (isSystemAdministrator(role)) {
    return "/admin-panel/dashboard"
  }

  if (isDepartmentManager(role) && departmentManager?.departmentId) {
    return `/admin-panel/department/${departmentManager.departmentId}`
  }

  if (isCategoryManager(role) && categoryManager?.categoryId) {
    return `/admin-panel/category/${categoryManager.categoryId}`
  }

  if (user?.userId) {
    return `/admin-panel/doctors/${user.userId}`
  }

  return "/admin-panel/dashboard"
}

const Login = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [focusedField, setFocusedField] = useState(null)

  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { t } = useTranslation()

  const { loadingAuth } = useSelector((state) => state.auth)
  const { mymode } = useSelector((state) => state.mode)

  const currentLang = i18next.language || "ar"
  const isDark = mymode === "dark"

  const { INITIAL_VALUES_LOGIN } = UseInitialValues()
  const { VALIDATION_SCHEMA_LOGIN } = UseFormValidation()
  const { direction } = UseDirection()

  const isRTL = direction?.direction === "rtl" || currentLang === "ar"

  const theme = useMemo(() => {
    return {
      page: isDark
        ? "min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]"
        : "min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]",

      card: isDark
        ? "bg-[var(--color-surface)] border border-[var(--color-border-strong)] shadow-2xl shadow-black/30"
        : "bg-[var(--color-surface)] border border-[var(--color-border-strong)] shadow-2xl shadow-slate-200/70",

      cardSoft:
        "bg-[var(--color-bg-soft)] border border-[var(--color-border)]",

      title: "text-[var(--color-text)]",
      subtitle: "text-[var(--color-text-muted)]",

      input:
        "w-full rounded-xl border bg-[var(--color-surface)] text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] text-sm font-bold outline-none transition-all focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10",

      inputNormal: "border-[var(--color-border)]",
      inputError: "border-red-500 focus:border-red-500 focus:ring-red-500/10",

      label: "text-sm font-black text-[var(--color-text)]",

      primaryButton:
        "w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--color-success)] px-5 py-3 text-sm font-black text-white border border-emerald-500 shadow-sm transition-all hover:bg-[var(--color-success-hover)] disabled:opacity-60 disabled:cursor-not-allowed",

      secondaryButton:
        "inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--color-surface)] px-4 py-2 text-sm font-black text-[var(--color-text)] border border-[var(--color-border-strong)] transition-all hover:bg-[var(--color-success)] hover:text-white hover:border-emerald-500",

      link: "font-black text-blue-500 hover:text-blue-600 transition-colors",

      danger: "text-red-500",
      success: "text-emerald-500",
      blue: "text-blue-500",
      violet: "text-violet-500",
      amber: "text-amber-500",
      muted: "text-[var(--color-text-muted)]",
    }
  }, [isDark])

  const getIconState = ({ hasValue, hasFocus, hasError }) => {
    if (hasError) return "error"
    if (hasFocus) return "focused"
    if (hasValue) return "filled"
    return "default"
  }

  const getIconClass = (state) => {
    const base = "w-4 h-4 transition-all duration-200"

    switch (state) {
      case "error":
        return `${base} text-red-500`
      case "focused":
        return `${base} text-blue-500`
      case "filled":
        return `${base} text-emerald-500`
      default:
        return `${base} text-slate-500`
    }
  }

  const getInputPadding = (_hasRightIcon = false) => ""

  const startSignalR = async () => {
    try {
      const connected = await signalRService.start()

      if (!connected) {
        console.warn("SignalR connection failed")
      }
    } catch (error) {
      console.warn("SignalR connection error:", error)
    }
  }

  
  const showLoginError = (error) => {
    Swal.fire({
      title: t("login.error.title") || "Login failed",
      text: getErrorMessage(
        error,
        currentLang,
        t("login.error.message") || "Invalid login credentials"
      ),
      icon: "error",
      confirmButtonText: t("common.ok") || "OK",
      confirmButtonColor: "#ef4444",
      background: isDark ? "#111827" : "#ffffff",
      color: isDark ? "#f9fafb" : "#111827",
    })
  }

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      const response = await dispatch(
        logIn({
          emailOrMobile: values.email,
          password: values.password,
          rememberMe: Boolean(values.rememberMe),
        })
      ).unwrap()

      const user = getApiUser(response)

      toast.success(
        getApiMessage(
          response,
          currentLang,
          t("login.success") || "Logged in successfully"
        ),
        {
          position: "top-right",
          autoClose: 2500,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        }
      )

      startSignalR()

      navigate(getRoleTargetPath(user))
    } catch (error) {
      const errorStatus = error?.status || error?.response?.status
      const errorMessage =
        error?.message ||
        error?.data?.messageEn ||
        error?.data?.messageAr ||
        error?.response?.data?.messageEn ||
        error?.response?.data?.messageAr ||
        ""

      const normalizedMessage = String(errorMessage).toLowerCase()
      const identifier = values.email?.trim()

      const shouldGoToVerification =
        errorStatus === 403 &&
        (normalizedMessage.includes("verify your email") ||
          normalizedMessage.includes("email first") ||
          normalizedMessage.includes("email verification") ||
          normalizedMessage.includes("تفعيل البريد") ||
          normalizedMessage.includes("تأكيد البريد"))

      if (shouldGoToVerification) {
        const identifier = values.email?.trim()

        if (identifier?.includes("@")) {
          localStorage.setItem("pendingVerificationEmail", identifier)
          localStorage.setItem("signupEmail", identifier)
          navigate("/verify-email", { state: { email: identifier } })
        } else {
          localStorage.setItem("pendingVerificationMobile", identifier)
          localStorage.setItem("signupMobile", identifier)
          navigate("/verify-email", { state: { mobile: identifier } })
        }

        return
      }

      showLoginError(error)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className={theme.page} dir={isRTL ? "rtl" : "ltr"}>
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
          <div
            className={`${theme.card} rounded-3xl p-8 sm:p-10 flex flex-col justify-between overflow-hidden relative`}
          >
            <div className="absolute inset-0 pointer-events-none opacity-40">
              <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-blue-500/10 blur-3xl" />
              <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full bg-emerald-500/10 blur-3xl" />
            </div>

            <div className="relative">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl border-2 border-blue-500 bg-transparent mb-6">
                <ShieldCheck className="w-8 h-8 text-blue-500" />
              </div>

              <h1 className={`text-3xl sm:text-4xl font-black ${theme.title}`}>
                {currentLang === "ar"
                  ? "مرحبًا بك في Balance"
                  : "Welcome to Balance"}
              </h1>

              <p
                className={`mt-4 text-sm sm:text-base font-bold leading-7 ${theme.subtitle}`}
              >
                {currentLang === "ar"
                  ? "سجّل الدخول لإدارة الجداول، الروسترات، الحضور، الأقسام، والتقارير من مكان واحد."
                  : "Sign in to manage schedules, rosters, attendance, departments, and reports from one place."}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-8">
                <InfoCard
                  icon={User}
                  title={currentLang === "ar" ? "الأطباء" : "Doctors"}
                  value={currentLang === "ar" ? "إدارة" : "Manage"}
                  tone="blue"
                />

                <InfoCard
                  icon={CheckCircle}
                  title={currentLang === "ar" ? "الحضور" : "Attendance"}
                  value={currentLang === "ar" ? "متابعة" : "Track"}
                  tone="emerald"
                />

                <InfoCard
                  icon={ShieldCheck}
                  title={currentLang === "ar" ? "الصلاحيات" : "Roles"}
                  value={currentLang === "ar" ? "تحكم" : "Control"}
                  tone="violet"
                />
              </div>
            </div>

            <div className="relative mt-10">
              <div className={`${theme.cardSoft} rounded-2xl p-4`}>
                <p className={`text-xs font-black ${theme.subtitle}`}>
                  {currentLang === "ar" ? "نصيحة أمان" : "Security Tip"}
                </p>
                <p className={`mt-1 text-sm font-bold ${theme.title}`}>
                  {currentLang === "ar"
                    ? "لا تشارك بيانات الدخول أو كود التحقق مع أي شخص."
                    : "Never share your login credentials or verification code."}
                </p>
              </div>
            </div>
          </div>

          <div className={`${theme.card} rounded-3xl p-6 sm:p-8`}>
            <div className="mb-8">
              <div className="flex items-center gap-3">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl border-2 border-emerald-500 bg-transparent">
                  <LogIn className="w-6 h-6 text-emerald-500" />
                </div>

                <div>
                  <h2 className={`text-2xl font-black ${theme.title}`}>
                    {t("login.title") || "Login"}
                  </h2>
                  <p className={`text-sm font-bold mt-1 ${theme.subtitle}`}>
                    {t("login.subtitle") ||
                      (currentLang === "ar"
                        ? "أدخل بيانات حسابك للمتابعة"
                        : "Enter your account details to continue")}
                  </p>
                </div>
              </div>
            </div>

            <Formik
              initialValues={INITIAL_VALUES_LOGIN}
              validationSchema={VALIDATION_SCHEMA_LOGIN}
              onSubmit={handleSubmit}
            >
              {({ values, errors, touched, isSubmitting }) => {
                const emailHasError = Boolean(touched.email && errors.email)
                const passwordHasError = Boolean(
                  touched.password && errors.password
                )

                const emailState = getIconState({
                  hasValue: Boolean(values.email),
                  hasFocus: focusedField === "email",
                  hasError: emailHasError,
                })

                const passwordState = getIconState({
                  hasValue: Boolean(values.password),
                  hasFocus: focusedField === "password",
                  hasError: passwordHasError,
                })

                return (
                  <Form className="space-y-5">
                    <div>
                      <label htmlFor="email" className={theme.label}>
                        {t("login.email") ||
                          (currentLang === "ar"
                            ? "البريد الإلكتروني أو رقم الهاتف"
                            : "Email or mobile")}
                      </label>

                      <div
                        className={`flex items-stretch rounded-xl border transition-all focus-within:ring-4 ${
                          emailHasError
                            ? "border-red-500 focus-within:ring-red-500/10"
                            : "border-[var(--color-border)] focus-within:border-emerald-500 focus-within:ring-emerald-500/10"
                        }`}
                      >
                        <div className="flex items-center justify-center px-3 bg-[var(--color-bg-soft)] border-e border-[var(--color-border)] rounded-s-xl shrink-0">
                          <Mail className="w-4 h-4 text-blue-500" />
                        </div>

                        <Field
                          id="email"
                          name="email"
                          type="text"
                          autoComplete="username"
                          placeholder={
                            t("login.emailPlaceholder") ||
                            (currentLang === "ar"
                              ? "اكتب البريد أو رقم الهاتف"
                              : "Enter email or mobile")
                          }
                          onFocus={() => setFocusedField("email")}
                          onBlur={(event) => {
                            setFocusedField(null)
                            event.target.dispatchEvent(
                              new Event("blur", { bubbles: true })
                            )
                          }}
                          className="flex-1 min-w-0 bg-transparent text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] text-sm font-bold outline-none px-3 py-3"
                        />
                      </div>

                      <ErrorMessage
                        name="email"
                        component="p"
                        className="mt-2 text-xs font-black text-red-500"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between gap-3">
                        <label htmlFor="password" className={theme.label}>
                          {t("login.password") ||
                            (currentLang === "ar"
                              ? "كلمة المرور"
                              : "Password")}
                        </label>

                      </div>

                      <div
                        className={`flex items-stretch rounded-xl border mt-2 transition-all focus-within:ring-4 ${
                          passwordHasError
                            ? "border-red-500 focus-within:ring-red-500/10"
                            : "border-[var(--color-border)] focus-within:border-emerald-500 focus-within:ring-emerald-500/10"
                        }`}
                      >
                        <div className="flex items-center justify-center px-3 bg-[var(--color-bg-soft)] border-e border-[var(--color-border)] rounded-s-xl shrink-0">
                          <Lock className="w-4 h-4 text-slate-500" />
                        </div>

                        <Field
                          id="password"
                          name="password"
                          type={showPassword ? "text" : "password"}
                          autoComplete="current-password"
                          placeholder={
                            t("login.passwordPlaceholder") ||
                            (currentLang === "ar"
                              ? "اكتب كلمة المرور"
                              : "Enter password")
                          }
                          onFocus={() => setFocusedField("password")}
                          onBlur={(event) => {
                            setFocusedField(null)
                            event.target.dispatchEvent(
                              new Event("blur", { bubbles: true })
                            )
                          }}
                          className="flex-1 min-w-0 bg-transparent text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] text-sm font-bold outline-none px-3 py-3"
                        />

                        <button
                          type="button"
                          onClick={() => setShowPassword((prev) => !prev)}
                          aria-label={showPassword ? "Hide password" : "Show password"}
                          className="flex items-center justify-center px-3 bg-[var(--color-bg-soft)] border-s border-[var(--color-border)] rounded-e-xl shrink-0 text-[var(--color-text-muted)] hover:text-blue-500 transition-colors"
                        >
                          {showPassword ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      </div>

                      <ErrorMessage
                        name="password"
                        component="p"
                        className="mt-2 text-xs font-black text-red-500"
                      />
                    </div>

                    <div className="flex items-center justify-between gap-3 flex-wrap">
                      <label className="inline-flex items-center gap-2 cursor-pointer">
                        <Field
                          type="checkbox"
                          name="rememberMe"
                          className="w-4 h-4 rounded border-[var(--color-border)] text-emerald-500 focus:ring-emerald-500"
                        />
                        <span
                          className={`text-sm font-bold ${theme.subtitle}`}
                        >
                          {t("login.rememberMe") ||
                            (currentLang === "ar"
                              ? "تذكرني"
                              : "Remember me")}
                        </span>
                      </label>

                      
                    </div>

                    <button
                      type="submit"
                      disabled={loadingAuth || isSubmitting}
                      className={theme.primaryButton}
                    >
                      {loadingAuth || isSubmitting ? (
                        <>
                          <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                          {currentLang === "ar"
                            ? "جاري تسجيل الدخول..."
                            : "Signing in..."}
                        </>
                      ) : (
                        <>
                          <LogIn className="w-4 h-4" />
                          {
                            (currentLang === "ar"
                              ? "تسجيل الدخول"
                              : "Login")}
                        </>
                      )}
                    </button>
                  </Form>
                )
              }}
            </Formik>

            <div className="mt-6">
                <div className="flex items-center justify-between gap-4">
                  <Link
                    to="/forget-password"
                    className={`${theme.link} text-sm font-black`}
                  >
                    {currentLang === "ar" ? "نسيت كلمة المرور؟" : "Forgot password?"}
                  </Link>

                  <Link
                    to="/signup"
                    className={`${theme.link} text-sm font-black`}
                  >
                    {currentLang === "ar" ? "إنشاء حساب" : "Create account"}
                  </Link>
                </div>
              </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function InfoCard({ icon: Icon, title, value, tone = "blue" }) {
  const toneMap = {
    blue: {
      box: "border-blue-500",
      icon: "text-blue-500",
      value: "text-blue-500",
    },
    emerald: {
      box: "border-emerald-500",
      icon: "text-emerald-500",
      value: "text-emerald-500",
    },
    violet: {
      box: "border-violet-500",
      icon: "text-violet-500",
      value: "text-violet-500",
    },
  }

  const selectedTone = toneMap[tone] || toneMap.blue

  return (
    <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
      <div
        className={`w-10 h-10 rounded-xl border-2 ${selectedTone.box} bg-transparent flex items-center justify-center mb-3`}
      >
        <Icon className={`w-5 h-5 ${selectedTone.icon}`} />
      </div>

      <p className="text-xs font-black text-[var(--color-text-muted)]">
        {title}
      </p>

      <p className={`text-sm font-black mt-1 ${selectedTone.value}`}>
        {value}
      </p>
    </div>
  )
}

export default Login