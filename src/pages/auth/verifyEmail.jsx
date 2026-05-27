"use client"

import { useMemo, useRef, useState } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { useFormik } from "formik"
import * as Yup from "yup"
import { useTranslation } from "react-i18next"
import { useDispatch, useSelector } from "react-redux"
import { toast } from "react-toastify"
import Swal from "sweetalert2"
import i18next from "i18next"
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Mail,
  Phone,
  RotateCcw,
  ShieldCheck,
} from "lucide-react"

import {
  resendVerificationByEmail,
  resendVerificationByMobile,
  verifyEmailByEmail,
  verifyPhoneBySms,
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

const maskEmail = (email) => {
  if (!email || !email.includes("@")) return "****"

  const [name, domain] = email.split("@")
  const visibleStart = name.slice(0, 2)
  const visibleEnd = name.length > 4 ? name.slice(-1) : ""

  return `${visibleStart}${"*".repeat(Math.max(name.length - 3, 3))}${visibleEnd}@${domain}`
}

const maskMobile = (mobile) => {
  if (!mobile) return "****"

  if (mobile.length <= 4) {
    return "****"
  }

  return `${mobile.slice(0, 3)}****${mobile.slice(-3)}`
}

const getAvailableMethod = ({ locationEmail, locationMobile, storedEmail, storedMobile }) => {
  if (locationEmail || storedEmail) return "email"
  if (locationMobile || storedMobile) return "mobile"
  return "email"
}

const getStoredIdentifier = ({
  method,
  locationEmail,
  locationMobile,
  storedEmail,
  storedMobile,
}) => {
  if (method === "email") {
    return locationEmail || storedEmail || ""
  }

  return locationMobile || storedMobile || ""
}

function VerifyEmail() {
  const location = useLocation()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { t } = useTranslation()
  const theme = getPageTheme()

  const currentLang = i18next.language || "ar"
  const isRTL = currentLang === "ar"

  const { loadingAuth } = useSelector((state) => state.auth)
  const { mymode } = useSelector((state) => state.mode)

  const isDark = mymode === "dark"

  const locationEmail = location.state?.email || ""
  const locationMobile = location.state?.mobile || ""

  const storedEmail =
    getSafeStorageValue("pendingVerificationEmail") ||
    getSafeStorageValue("signupEmail")

  const storedMobile =
    getSafeStorageValue("pendingVerificationMobile") ||
    getSafeStorageValue("signupMobile")

  const [verifyMethod, setVerifyMethod] = useState(
    getAvailableMethod({
      locationEmail,
      locationMobile,
      storedEmail,
      storedMobile,
    })
  )

  const [focusedIndex, setFocusedIndex] = useState(null)
  const [tokenDigits, setTokenDigits] = useState(new Array(6).fill(""))

  const inputRefs = useRef([])

  const activeIdentifier = getStoredIdentifier({
    method: verifyMethod,
    locationEmail,
    locationMobile,
    storedEmail,
    storedMobile,
  })

  const hasEmailIdentifier = Boolean(locationEmail || storedEmail)
  const hasMobileIdentifier = Boolean(locationMobile || storedMobile)

  const displayedDestination =
    verifyMethod === "email"
      ? maskEmail(activeIdentifier)
      : maskMobile(activeIdentifier)

  const validationSchema = useMemo(() => {
    return Yup.object({
      verificationCode: Yup.string()
        .trim()
        .matches(
          /^[0-9]{6}$/,
          currentLang === "ar"
            ? "كود التفعيل يجب أن يكون 6 أرقام"
            : "Verification code must be 6 digits"
        )
        .required(
          currentLang === "ar"
            ? "كود التفعيل مطلوب"
            : "Verification code is required"
        ),
    })
  }, [currentLang])

  const formik = useFormik({
    initialValues: {
      verificationCode: "",
    },
    validationSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      const verificationCode = values.verificationCode.trim()

      if (!activeIdentifier) {
        Swal.fire({
          title: currentLang === "ar" ? "بيانات التفعيل غير موجودة" : "Missing verification data",
          text:
            currentLang === "ar"
              ? "لم يتم العثور على البريد أو رقم الهاتف المسجل. ارجع لصفحة التسجيل أو تسجيل الدخول مرة أخرى."
              : "The registered email or mobile was not found. Please go back to signup or login again.",
          icon: "warning",
          confirmButtonText: t("common.ok") || "OK",
          confirmButtonColor: "#f59e0b",
          background: isDark ? "#111827" : "#ffffff",
          color: isDark ? "#f9fafb" : "#111827",
        })

        return
      }

      try {
        const response =
          verifyMethod === "email"
            ? await dispatch(
                verifyEmailByEmail({
                  email: activeIdentifier,
                  verificationCode,
                })
              ).unwrap()
            : await dispatch(
                verifyPhoneBySms({
                  mobile: activeIdentifier,
                  verificationCode,
                })
              ).unwrap()

        toast.success(
          getApiMessage(
            response,
            currentLang,
            verifyMethod === "email"
              ? currentLang === "ar"
                ? "تم تفعيل البريد الإلكتروني بنجاح"
                : "Email verified successfully"
              : currentLang === "ar"
              ? "تم تفعيل رقم الهاتف بنجاح"
              : "Mobile verified successfully"
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

        if (verifyMethod === "email") {
          localStorage.removeItem("pendingVerificationEmail")
          localStorage.removeItem("signupEmail")
        }

        if (verifyMethod === "mobile") {
          localStorage.removeItem("pendingVerificationMobile")
          localStorage.removeItem("signupMobile")
        }

        setTimeout(() => {
          navigate("/login")
        }, 800)
      } catch (error) {
        Swal.fire({
          title:
            verifyMethod === "email"
              ? currentLang === "ar"
                ? "تعذر تفعيل البريد"
                : "Failed to verify email"
              : currentLang === "ar"
              ? "تعذر تفعيل رقم الهاتف"
              : "Failed to verify mobile",
          text: getErrorMessage(
            error,
            currentLang,
            currentLang === "ar"
              ? "تأكد من الكود وحاول مرة أخرى"
              : "Check the code, then try again"
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
    formik.setFieldValue("verificationCode", digits.join(""))
  }

  const clearToken = () => {
    const emptyDigits = new Array(6).fill("")
    setTokenDigits(emptyDigits)
    formik.setFieldValue("verificationCode", "")
    inputRefs.current[0]?.focus()
  }

  const handleTokenChange = (event, index) => {
    const rawValue = event.target.value
    const value = rawValue.slice(-1)

    if (!/^[0-9A-Za-z]?$/.test(value)) return

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

    if (!/^[0-9A-Za-z]+$/.test(pastedValue)) return

    const updatedDigits = new Array(6).fill("")

    pastedValue.split("").forEach((char, index) => {
      updatedDigits[index] = char
    })

    setTokenDigits(updatedDigits)
    syncToken(updatedDigits)

    const nextIndex = Math.min(pastedValue.length, 5)
    inputRefs.current[nextIndex]?.focus()
  }

  const handleMethodChange = (method) => {
    if (method === "email" && !hasEmailIdentifier) {
      Swal.fire({
        title: currentLang === "ar" ? "لا يوجد بريد مسجل" : "No registered email",
        text:
          currentLang === "ar"
            ? "لا يوجد بريد إلكتروني محفوظ لهذا الحساب في هذه الجلسة."
            : "There is no email stored for this account in this session.",
        icon: "warning",
        confirmButtonText: t("common.ok") || "OK",
        confirmButtonColor: "#f59e0b",
        background: isDark ? "#111827" : "#ffffff",
        color: isDark ? "#f9fafb" : "#111827",
      })
      return
    }

    if (method === "mobile" && !hasMobileIdentifier) {
      Swal.fire({
        title: currentLang === "ar" ? "لا يوجد رقم مسجل" : "No registered mobile",
        text:
          currentLang === "ar"
            ? "لا يوجد رقم هاتف محفوظ لهذا الحساب في هذه الجلسة."
            : "There is no mobile stored for this account in this session.",
        icon: "warning",
        confirmButtonText: t("common.ok") || "OK",
        confirmButtonColor: "#f59e0b",
        background: isDark ? "#111827" : "#ffffff",
        color: isDark ? "#f9fafb" : "#111827",
      })
      return
    }

    setVerifyMethod(method)
    setTokenDigits(new Array(6).fill(""))
    formik.resetForm({
      values: {
        verificationCode: "",
      },
    })
  }

  const handleResendCode = async () => {
    if (!activeIdentifier) {
      Swal.fire({
        title: currentLang === "ar" ? "بيانات التفعيل غير موجودة" : "Missing verification data",
        text:
          currentLang === "ar"
            ? "لا يوجد بريد أو رقم هاتف محفوظ لإرسال الكود."
            : "There is no saved email or mobile to send the code.",
        icon: "warning",
        confirmButtonText: t("common.ok") || "OK",
        confirmButtonColor: "#f59e0b",
        background: isDark ? "#111827" : "#ffffff",
        color: isDark ? "#f9fafb" : "#111827",
      })

      return
    }

    try {
      const response =
        verifyMethod === "email"
          ? await dispatch(
              resendVerificationByEmail({
                email: activeIdentifier,
              })
            ).unwrap()
          : await dispatch(
              resendVerificationByMobile({
                mobile: activeIdentifier,
              })
            ).unwrap()

      toast.success(
        getApiMessage(
          response,
          currentLang,
          currentLang === "ar"
            ? "تم إرسال كود التفعيل مرة أخرى"
            : "Verification code resent successfully"
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

      clearToken()
    } catch (error) {
      Swal.fire({
        title:
          currentLang === "ar"
            ? "تعذر إعادة إرسال الكود"
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

  const codeHasError = Boolean(
    formik.touched.verificationCode && formik.errors.verificationCode
  )

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
                    ? "تفعيل الحساب"
                    : "Verify your account"}
                </h1>

                <p className="mt-4 text-sm sm:text-base font-bold leading-7 text-[var(--color-text-muted)]">
                  {currentLang === "ar"
                    ? "أدخل كود التفعيل المرسل إلى وسيلة التواصل المسجلة في الحساب. لا يمكن تغيير البريد أو الرقم من هذه الصفحة لحماية الحساب."
                    : "Enter the verification code sent to the registered contact method. Email or mobile cannot be changed here for account security."}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-8">
                <InfoCard
                  icon={Mail}
                  title={currentLang === "ar" ? "Email" : "Email"}
                  value={currentLang === "ar" ? "محمي" : "Protected"}
                  tone="blue"
                />

                <InfoCard
                  icon={Phone}
                  title={currentLang === "ar" ? "Mobile" : "Mobile"}
                  value={currentLang === "ar" ? "محمي" : "Protected"}
                  tone="emerald"
                />

                <InfoCard
                  icon={ShieldCheck}
                  title={currentLang === "ar" ? "Secure" : "Secure"}
                  value={currentLang === "ar" ? "تفعيل" : "Verify"}
                  tone="violet"
                />
              </div>

              <div className="mt-8 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-soft)] p-4">
                <p className="text-xs font-black text-[var(--color-text-muted)]">
                  {currentLang === "ar" ? "مهم" : "Important"}
                </p>

                <p className="mt-1 text-sm font-bold text-[var(--color-text)] leading-6">
                  {currentLang === "ar"
                    ? "بعد تفعيل البريد، سيظل الحساب قيد موافقة الأدمن قبل السماح بتسجيل الدخول."
                    : "After email verification, the account may still require admin approval before login."}
                </p>
              </div>
            </div>
          </div>

          <div className={`${theme.card} rounded-3xl p-6 sm:p-8`}>
            <div className="mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl border-2 border-emerald-500 bg-transparent flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-emerald-500" />
                </div>

                <div>
                  <h2 className="text-2xl font-black text-[var(--color-text)]">
                    {currentLang === "ar"
                      ? "كود التفعيل"
                      : "Verification Code"}
                  </h2>

                  <p className="text-sm font-bold text-[var(--color-text-muted)] mt-1">
                    {currentLang === "ar"
                      ? "اكتب الكود المرسل لك"
                      : "Enter the code sent to you"}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
              <MethodCard
                icon={Mail}
                title={currentLang === "ar" ? "البريد الإلكتروني" : "Email"}
                description={
                  verifyMethod === "email"
                    ? currentLang === "ar"
                      ? `تم إرسال الكود إلى ${displayedDestination}`
                      : `Code sent to ${displayedDestination}`
                    : currentLang === "ar"
                    ? "التفعيل عبر البريد المسجل"
                    : "Verify using registered email"
                }
                tone="blue"
                active={verifyMethod === "email"}
                disabled={!hasEmailIdentifier}
                onClick={() => handleMethodChange("email")}
              />

              <MethodCard
                icon={Phone}
                title={currentLang === "ar" ? "رقم الهاتف" : "Mobile"}
                description={
                  verifyMethod === "mobile"
                    ? currentLang === "ar"
                      ? `تم إرسال الكود إلى ${displayedDestination}`
                      : `Code sent to ${displayedDestination}`
                    : currentLang === "ar"
                    ? "التفعيل عبر الرقم المسجل"
                    : "Verify using registered mobile"
                }
                tone="emerald"
                active={verifyMethod === "mobile"}
                disabled={!hasMobileIdentifier}
                onClick={() => handleMethodChange("mobile")}
              />
            </div>

            <div className="mb-6 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-soft)] p-4">
              <div className="flex items-start gap-3">
                <div
                  className={`w-10 h-10 rounded-xl border-2 bg-transparent flex items-center justify-center shrink-0 ${
                    verifyMethod === "email"
                      ? "border-blue-500"
                      : "border-emerald-500"
                  }`}
                >
                  {verifyMethod === "email" ? (
                    <Mail className="w-5 h-5 text-blue-500" />
                  ) : (
                    <Phone className="w-5 h-5 text-emerald-500" />
                  )}
                </div>

                <div>
                  <p className="text-sm font-black text-[var(--color-text)]">
                    {currentLang === "ar"
                      ? "تم إرسال كود التفعيل"
                      : "Verification code sent"}
                  </p>

                  <p className="mt-1 text-sm font-bold text-[var(--color-text-muted)] leading-6">
                    {currentLang === "ar"
                      ? verifyMethod === "email"
                        ? `الكود تم إرساله إلى البريد الإلكتروني المسجل: ${displayedDestination}`
                        : `الكود تم إرساله إلى رقم الهاتف المسجل: ${displayedDestination}`
                      : verifyMethod === "email"
                      ? `The code was sent to the registered email: ${displayedDestination}`
                      : `The code was sent to the registered mobile: ${displayedDestination}`}
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={formik.handleSubmit} className="space-y-6">
              <input
                type="hidden"
                name="identifier"
                value={activeIdentifier}
                readOnly
              />

              <div>
                <label className="block text-sm font-black text-[var(--color-text)] mb-4">
                  {currentLang === "ar" ? "كود التفعيل" : "Verification Code"}
                </label>

                <div
                  className={`flex flex-wrap justify-center gap-3 sm:gap-4 ${
                    isRTL ? "flex-row-reverse" : ""
                  }`}
                  onPaste={handleTokenPaste}
                >
                  {tokenDigits.map((digit, index) => (
                    <input
                      key={`verify-code-${index}`}
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
                        formik.setFieldTouched("verificationCode", true, false)
                      }}
                      onBlur={() => setFocusedIndex(null)}
                      className={`w-14 h-16 sm:w-16 sm:h-20 lg:w-20 lg:h-20 rounded-2xl text-center text-2xl sm:text-3xl font-black outline-none transition-all border bg-[var(--color-surface)] text-[var(--color-text)] ${
                        codeHasError
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

                {codeHasError && (
                  <p className="mt-3 text-center text-xs font-black text-red-500">
                    {formik.errors.verificationCode}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={loadingAuth || formik.isSubmitting || !activeIdentifier}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--color-success)] px-5 py-3 text-sm font-black text-white border border-emerald-500 shadow-sm transition-all hover:bg-[var(--color-success-hover)] disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loadingAuth || formik.isSubmitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    {currentLang === "ar"
                      ? "جاري التفعيل..."
                      : "Verifying..."}
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    {currentLang === "ar"
                      ? "تفعيل الحساب"
                      : "Verify Account"}
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleResendCode}
                disabled={loadingAuth || !activeIdentifier}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--color-border-strong)] bg-[var(--color-surface)] px-4 py-2 text-sm font-black text-[var(--color-text)] hover:bg-[var(--color-success)] hover:text-white hover:border-emerald-500 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <RotateCcw className="w-4 h-4 text-blue-500" />
                {currentLang === "ar" ? "إعادة إرسال الكود" : "Resend Code"}
              </button>

              <Link
                to="/login"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--color-border-strong)] bg-[var(--color-surface)] px-4 py-2 text-sm font-black text-[var(--color-text)] hover:bg-[var(--color-success)] hover:text-white hover:border-emerald-500 transition-colors"
              >
                {isRTL ? (
                  <ArrowRight className="w-4 h-4 text-blue-500" />
                ) : (
                  <ArrowLeft className="w-4 h-4 text-blue-500" />
                )}
                {currentLang === "ar" ? "رجوع لتسجيل الدخول" : "Back to Login"}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function MethodCard({
  icon: Icon,
  title,
  description,
  tone = "blue",
  active,
  disabled,
  onClick,
}) {
  const toneMap = {
    blue: {
      border: "border-blue-500",
      text: "text-blue-500",
    },
    emerald: {
      border: "border-emerald-500",
      text: "text-emerald-500",
    },
    violet: {
      border: "border-violet-500",
      text: "text-violet-500",
    },
  }

  const selectedTone = toneMap[tone] || toneMap.blue

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`text-start rounded-2xl border p-4 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
        active
          ? `${selectedTone.border} bg-[var(--color-bg-soft)]`
          : "border-[var(--color-border)] bg-[var(--color-surface)] hover:border-emerald-500"
      }`}
    >
      <div
        className={`w-10 h-10 rounded-xl border-2 bg-transparent flex items-center justify-center mb-3 ${
          active ? selectedTone.border : "border-slate-500"
        }`}
      >
        <Icon
          className={`w-5 h-5 ${
            active ? selectedTone.text : "text-slate-500"
          }`}
        />
      </div>

      <p className="text-sm font-black text-[var(--color-text)]">{title}</p>

      <p className="text-xs font-bold text-[var(--color-text-muted)] mt-1 leading-5">
        {description}
      </p>
    </button>
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

export default VerifyEmail