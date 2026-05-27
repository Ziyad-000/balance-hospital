"use client"

import { useMemo, useRef, useState } from "react"
import { useTranslation } from "react-i18next"
import { useFormik } from "formik"
import * as Yup from "yup"
import { useDispatch, useSelector } from "react-redux"
import { Link, useNavigate } from "react-router-dom"
import { toast } from "react-toastify"
import Swal from "sweetalert2"
import i18next from "i18next"
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Eye,
  EyeOff,
  KeyRound,
  Lock,
  RefreshCw,
  RotateCcw,
  ShieldCheck,
} from "lucide-react"

import {
  resendForgetPasswordCode,
  resetPassword,
} from "../../state/act/actAuth"

import { getPageTheme } from "../../utils/themeClasses"

const getSafeStorageValue = (key, fallback = "") => {
  const value = localStorage.getItem(key)

  if (!value || value === "undefined" || value === "null") {
    return fallback
  }

  return value
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

const getResendPayload = (method, identifier) => {
  if (method === "email") {
    return { email: identifier }
  }

  if (method === "mobile") {
    return { mobile: identifier }
  }

  return { nationalId: identifier }
}

const getIdentifierLabel = (method, currentLang) => {
  if (method === "email") {
    return currentLang === "ar" ? "البريد الإلكتروني" : "Email"
  }

  if (method === "mobile") {
    return currentLang === "ar" ? "رقم الهاتف" : "Mobile"
  }

  return currentLang === "ar" ? "الرقم القومي" : "National ID"
}

function ResetPassword() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const theme = getPageTheme()

  const currentLang = i18next.language || "ar"
  const isRTL = currentLang === "ar"

  const { loadingAuth } = useSelector((state) => state.auth)
  const { mymode } = useSelector((state) => state.mode)

  const isDark = mymode === "dark"

  const identifier = getSafeStorageValue("identifier")
  const resetMethod = getSafeStorageValue("resetMethod", "email")

  const inputRefs = useRef([])

  const [tokenDigits, setTokenDigits] = useState(new Array(6).fill(""))
  const [focusedIndex, setFocusedIndex] = useState(null)
  const [focusedField, setFocusedField] = useState(null)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const validationSchema = useMemo(() => {
    return Yup.object({
      token: Yup.string()
        .trim()
        .matches(
          /^[0-9]{6}$/,
          currentLang === "ar"
            ? "كود التحقق يجب أن يكون 6 أرقام"
            : "Verification code must be 6 digits"
        )
        .required(
          currentLang === "ar"
            ? "كود التحقق مطلوب"
            : "Verification code is required"
        ),

      newPassword: Yup.string()
        .min(
          8,
          currentLang === "ar"
            ? "كلمة المرور يجب ألا تقل عن 8 أحرف"
            : "Password must be at least 8 characters"
        )
        .max(
          100,
          currentLang === "ar"
            ? "كلمة المرور لا يمكن أن تزيد عن 100 حرف"
            : "Password cannot exceed 100 characters"
        )
        .required(
          currentLang === "ar"
            ? "كلمة المرور الجديدة مطلوبة"
            : "New password is required"
        ),

      confirmNewPassword: Yup.string()
        .oneOf(
          [Yup.ref("newPassword")],
          currentLang === "ar"
            ? "كلمة المرور وتأكيدها غير متطابقين"
            : "Password and confirmation do not match"
        )
        .required(
          currentLang === "ar"
            ? "تأكيد كلمة المرور مطلوب"
            : "Password confirmation is required"
        ),
    })
  }, [currentLang])

  const formik = useFormik({
    initialValues: {
      token: "",
      newPassword: "",
      confirmNewPassword: "",
    },
    validationSchema,
    onSubmit: async (values) => {
      if (!identifier) {
        Swal.fire({
          title: currentLang === "ar" ? "بيانات ناقصة" : "Missing data",
          text:
            currentLang === "ar"
              ? "لم يتم العثور على بيانات الحساب. ارجع لصفحة نسيت كلمة المرور واطلب كود جديد."
              : "Account identifier was not found. Go back to forgot password and request a new code.",
          icon: "warning",
          confirmButtonText: t("common.ok") || "OK",
          confirmButtonColor: "#f59e0b",
          background: isDark ? "#111827" : "#ffffff",
          color: isDark ? "#f9fafb" : "#111827",
        })

        return
      }

      try {
        const response = await dispatch(
          resetPassword({
            token: values.token.trim(),
            identifier,
            newPassword: values.newPassword,
            confirmPassword: values.confirmNewPassword,
          })
        ).unwrap()

        toast.success(
          getApiMessage(
            response,
            currentLang,
            currentLang === "ar"
              ? "تم تغيير كلمة المرور بنجاح"
              : "Password reset successfully"
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

        localStorage.removeItem("identifier")
        localStorage.removeItem("resetMethod")
        localStorage.removeItem("valueReset")

        setTimeout(() => {
          navigate("/login")
        }, 800)
      } catch (error) {
        Swal.fire({
          title:
            t("resetPassword.error.title") ||
            (currentLang === "ar"
              ? "تعذر تغيير كلمة المرور"
              : "Failed to reset password"),
          text: getErrorMessage(
            error,
            currentLang,
            t("resetPassword.error.message") ||
              (currentLang === "ar"
                ? "تأكد من الكود وكلمة المرور وحاول مرة أخرى"
                : "Check the code and password, then try again")
          ),
          icon: "error",
          confirmButtonText: t("common.ok") || "OK",
          confirmButtonColor: "#ef4444",
          background: isDark ? "#111827" : "#ffffff",
          color: isDark ? "#f9fafb" : "#111827",
        })
      }
    },
  })

  const syncToken = (digits) => {
    const value = digits.join("")
    formik.setFieldValue("token", value)
  }

  const handleTokenChange = (event, index) => {
    const rawValue = event.target.value
    const value = rawValue.slice(-1)

    if (!/^[0-9A-Za-z]?$/.test(value)) {
      return
    }

    const updatedDigits = [...tokenDigits]
    updatedDigits[index] = value

    setTokenDigits(updatedDigits)
    syncToken(updatedDigits)

    if (value && index < tokenDigits.length - 1) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleTokenKeyDown = (event, index) => {
    if (event.key === "Backspace" && !tokenDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }

    if (event.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }

    if (event.key === "ArrowRight" && index < tokenDigits.length - 1) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleTokenPaste = (event) => {
    event.preventDefault()

    const pastedValue = event.clipboardData
      .getData("text")
      .trim()
      .replace(/\s/g, "")
      .slice(0, 6)

    if (!/^[0-9A-Za-z]+$/.test(pastedValue)) {
      return
    }

    const updatedDigits = new Array(6).fill("")

    pastedValue.split("").forEach((char, index) => {
      updatedDigits[index] = char
    })

    setTokenDigits(updatedDigits)
    syncToken(updatedDigits)

    const nextIndex = Math.min(pastedValue.length, 5)
    inputRefs.current[nextIndex]?.focus()
  }

  const handleResendCode = async () => {
    if (!identifier) {
      Swal.fire({
        title: currentLang === "ar" ? "بيانات ناقصة" : "Missing data",
        text:
          currentLang === "ar"
            ? "لا يوجد حساب محدد لإرسال الكود. ارجع لصفحة نسيت كلمة المرور."
            : "There is no selected account to resend the code. Go back to forgot password.",
        icon: "warning",
        confirmButtonText: t("common.ok") || "OK",
        confirmButtonColor: "#f59e0b",
        background: isDark ? "#111827" : "#ffffff",
        color: isDark ? "#f9fafb" : "#111827",
      })

      return
    }

    try {
      const response = await dispatch(
        resendForgetPasswordCode(getResendPayload(resetMethod, identifier))
      ).unwrap()

      toast.success(
        getApiMessage(
          response,
          currentLang,
          currentLang === "ar"
            ? "تم إرسال الكود مرة أخرى"
            : "Code resent successfully"
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
    } catch (error) {
      Swal.fire({
        title:
          currentLang === "ar"
            ? "تعذر إرسال الكود"
            : "Failed to resend code",
        text: getErrorMessage(
          error,
          currentLang,
          currentLang === "ar"
            ? "حاول مرة أخرى بعد قليل"
            : "Please try again later"
        ),
        icon: "error",
        confirmButtonText: t("common.ok") || "OK",
        confirmButtonColor: "#ef4444",
        background: isDark ? "#111827" : "#ffffff",
        color: isDark ? "#f9fafb" : "#111827",
      })
    }
  }

  const tokenHasError = Boolean(formik.touched.token && formik.errors.token)
  const newPasswordHasError = Boolean(
    formik.touched.newPassword && formik.errors.newPassword
  )
  const confirmPasswordHasError = Boolean(
    formik.touched.confirmNewPassword && formik.errors.confirmNewPassword
  )

  const getPasswordIconClass = (fieldName, hasValue, hasError) => {
    if (hasError) return "text-red-500"
    if (focusedField === fieldName) return "text-blue-500"
    if (hasValue) return "text-emerald-500"
    return "text-slate-500"
  }

  return (
    <div className={theme.page} dir={isRTL ? "rtl" : "ltr"}>
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
          <div
            className={`${theme.card} rounded-3xl p-8 sm:p-10 relative overflow-hidden`}
          >
            <div className="absolute inset-0 pointer-events-none opacity-40">
              <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-blue-500/10 blur-3xl" />
              <div className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-emerald-500/10 blur-3xl" />
            </div>

            <div className="relative h-full flex flex-col justify-between">
              <div>
                <div className="w-16 h-16 rounded-3xl border-2 border-blue-500 bg-transparent flex items-center justify-center mb-6">
                  <ShieldCheck className="w-8 h-8 text-blue-500" />
                </div>

                <h1 className="text-3xl sm:text-4xl font-black text-[var(--color-text)]">
                  {currentLang === "ar"
                    ? "تعيين كلمة مرور جديدة"
                    : "Set a new password"}
                </h1>

                <p className="mt-4 text-sm sm:text-base font-bold leading-7 text-[var(--color-text-muted)]">
                  {currentLang === "ar"
                    ? "أدخل كود التحقق الذي تم إرساله لك، ثم اختر كلمة مرور جديدة لحسابك."
                    : "Enter the verification code you received, then choose a new password for your account."}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-8">
                <InfoCard
                  icon={KeyRound}
                  title={currentLang === "ar" ? "Code" : "Code"}
                  value={currentLang === "ar" ? "تحقق" : "Verify"}
                  tone="blue"
                />

                <InfoCard
                  icon={Lock}
                  title={currentLang === "ar" ? "Password" : "Password"}
                  value={currentLang === "ar" ? "جديد" : "New"}
                  tone="emerald"
                />

                <InfoCard
                  icon={ShieldCheck}
                  title={currentLang === "ar" ? "Secure" : "Secure"}
                  value={currentLang === "ar" ? "محمي" : "Protected"}
                  tone="violet"
                />
              </div>

              <div className="mt-8 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-soft)] p-4">
                <p className="text-xs font-black text-[var(--color-text-muted)]">
                  {currentLang === "ar" ? "الحساب" : "Account"}
                </p>

                <p className="mt-1 text-sm font-black text-[var(--color-text)] break-all">
                  {identifier || "-"}
                </p>

                <p className="mt-1 text-xs font-bold text-blue-500">
                  {getIdentifierLabel(resetMethod, currentLang)}
                </p>
              </div>
            </div>
          </div>

          <div className={`${theme.card} rounded-3xl p-6 sm:p-8`}>
            <div className="mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl border-2 border-emerald-500 bg-transparent flex items-center justify-center">
                  <Lock className="w-6 h-6 text-emerald-500" />
                </div>

                <div>
                  <h2 className="text-2xl font-black text-[var(--color-text)]">
                    {t("resetPassword.title") ||
                      (currentLang === "ar"
                        ? "إعادة تعيين كلمة المرور"
                        : "Reset Password")}
                  </h2>

                  <p className="text-sm font-bold text-[var(--color-text-muted)] mt-1">
                    {currentLang === "ar"
                      ? "اكتب الكود وكلمة المرور الجديدة"
                      : "Enter the code and new password"}
                  </p>
                </div>
              </div>
            </div>

            {!identifier && (
              <div className="mb-5 rounded-2xl border-2 border-amber-500 bg-transparent p-4">
                <p className="text-sm font-black text-amber-500">
                  {currentLang === "ar"
                    ? "لا يوجد حساب محدد. ارجع لصفحة نسيت كلمة المرور واطلب كود جديد."
                    : "No account selected. Go back to forgot password and request a new code."}
                </p>
              </div>
            )}

            <form onSubmit={formik.handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-black text-[var(--color-text)] mb-3">
                  {currentLang === "ar" ? "كود التحقق" : "Verification Code"}
                </label>

                <div
                  className={`flex gap-2 sm:gap-3 ${
                    isRTL ? "flex-row-reverse justify-end" : ""
                  }`}
                  onPaste={handleTokenPaste}
                >
                  {tokenDigits.map((digit, index) => (
                    <input
                      key={`token-${index}`}
                      ref={(element) => {
                        inputRefs.current[index] = element
                      }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(event) => handleTokenChange(event, index)}
                      onKeyDown={(event) => handleTokenKeyDown(event, index)}
                      onFocus={() => {
                        setFocusedIndex(index)
                        formik.setFieldTouched("token", true, false)
                      }}
                      onBlur={() => setFocusedIndex(null)}
                      className={`w-11 h-12 sm:w-12 sm:h-14 rounded-xl text-center text-xl font-black outline-none transition-all border bg-[var(--color-surface)] text-[var(--color-text)] ${
                        tokenHasError
                          ? "border-red-500 ring-4 ring-red-500/10"
                          : focusedIndex === index
                          ? "border-blue-500 ring-4 ring-blue-500/10"
                          : digit
                          ? "border-emerald-500"
                          : "border-[var(--color-border)]"
                      }`}
                    />
                  ))}
                </div>

                {tokenHasError && (
                  <p className="mt-2 text-xs font-black text-red-500">
                    {formik.errors.token}
                  </p>
                )}
              </div>

              <PasswordField
                id="newPassword"
                name="newPassword"
                label={
                  currentLang === "ar"
                    ? "كلمة المرور الجديدة"
                    : "New Password"
                }
                value={formik.values.newPassword}
                error={formik.errors.newPassword}
                touched={formik.touched.newPassword}
                showPassword={showNewPassword}
                setShowPassword={setShowNewPassword}
                onChange={formik.handleChange}
                onBlur={(event) => {
                  setFocusedField(null)
                  formik.handleBlur(event)
                }}
                onFocus={() => setFocusedField("newPassword")}
                iconClass={getPasswordIconClass(
                  "newPassword",
                  formik.values.newPassword,
                  newPasswordHasError
                )}
                isRTL={isRTL}
              />

              <PasswordField
                id="confirmNewPassword"
                name="confirmNewPassword"
                label={
                  currentLang === "ar"
                    ? "تأكيد كلمة المرور"
                    : "Confirm Password"
                }
                value={formik.values.confirmNewPassword}
                error={formik.errors.confirmNewPassword}
                touched={formik.touched.confirmNewPassword}
                showPassword={showConfirmPassword}
                setShowPassword={setShowConfirmPassword}
                onChange={formik.handleChange}
                onBlur={(event) => {
                  setFocusedField(null)
                  formik.handleBlur(event)
                }}
                onFocus={() => setFocusedField("confirmNewPassword")}
                iconClass={getPasswordIconClass(
                  "confirmNewPassword",
                  formik.values.confirmNewPassword,
                  confirmPasswordHasError
                )}
                isRTL={isRTL}
              />

              <button
                type="submit"
                disabled={loadingAuth || formik.isSubmitting || !identifier}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--color-success)] px-5 py-3 text-sm font-black text-white border border-emerald-500 shadow-sm transition-all hover:bg-[var(--color-success-hover)] disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loadingAuth || formik.isSubmitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    {currentLang === "ar"
                      ? "جاري التحديث..."
                      : "Updating..."}
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    {currentLang === "ar"
                      ? "تغيير كلمة المرور"
                      : "Reset Password"}
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleResendCode}
                disabled={loadingAuth || !identifier}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--color-border-strong)] bg-[var(--color-surface)] px-4 py-2 text-sm font-black text-[var(--color-text)] hover:bg-[var(--color-success)] hover:text-white hover:border-emerald-500 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <RotateCcw className="w-4 h-4 text-blue-500" />
                {currentLang === "ar" ? "إعادة إرسال الكود" : "Resend Code"}
              </button>

              <Link
                to="/forget-password"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--color-border-strong)] bg-[var(--color-surface)] px-4 py-2 text-sm font-black text-[var(--color-text)] hover:bg-[var(--color-success)] hover:text-white hover:border-emerald-500 transition-colors"
              >
                {isRTL ? (
                  <ArrowRight className="w-4 h-4 text-blue-500" />
                ) : (
                  <ArrowLeft className="w-4 h-4 text-blue-500" />
                )}
                {currentLang === "ar" ? "رجوع" : "Back"}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function PasswordField({
  id,
  name,
  label,
  value,
  error,
  touched,
  showPassword,
  setShowPassword,
  onChange,
  onBlur,
  onFocus,
  iconClass,
  isRTL,
}) {
  const hasError = Boolean(touched && error)

  return (
    <div>
      <label
        htmlFor={id}
        className="block text-sm font-black text-[var(--color-text)] mb-2"
      >
        {label}
      </label>

      <div className="relative">
        <div
          className={`flex items-stretch rounded-xl border transition-all focus-within:ring-4 ${
            hasError
              ? "border-red-500 focus-within:ring-red-500/10"
              : "border-[var(--color-border)] focus-within:border-emerald-500 focus-within:ring-emerald-500/10"
          }`}
        >
          <div className="flex items-center justify-center px-3 bg-[var(--color-bg-soft)] border-e border-[var(--color-border)] rounded-s-xl shrink-0">
            <Lock className="w-4 h-4 text-slate-500" />
          </div>

          <input
            id={id}
            name={name}
            type={showPassword ? "text" : "password"}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            onFocus={onFocus}
            autoComplete="new-password"
            className="flex-1 min-w-0 bg-transparent text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] text-sm font-bold outline-none px-3 py-3"
          />

          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="flex items-center justify-center px-3 bg-[var(--color-bg-soft)] border-s border-[var(--color-border)] rounded-e-xl shrink-0 text-[var(--color-text-muted)] hover:text-blue-500 transition-colors"
          >
            {showPassword ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {hasError && (
        <p className="mt-2 text-xs font-black text-red-500">{error}</p>
      )}
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

export default ResetPassword