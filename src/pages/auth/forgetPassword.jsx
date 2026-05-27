"use client"

import { useMemo, useState } from "react"
import { useNavigate, Link } from "react-router-dom"
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
  IdCard,
  KeyRound,
  Mail,
  Phone,
  RefreshCw,
  ShieldCheck,
} from "lucide-react"

import { forgetPassword } from "../../state/act/actAuth"
import { getPageTheme } from "../../utils/themeClasses"

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

const getResetPayload = (method, value) => {
  if (method === "email") {
    return { email: value.trim() }
  }

  if (method === "mobile") {
    return { mobile: value.trim() }
  }

  return { nationalId: value.trim() }
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

const getIdentifierPlaceholder = (method, currentLang) => {
  if (method === "email") {
    return currentLang === "ar"
      ? "example@email.com"
      : "example@email.com"
  }

  if (method === "mobile") {
    return currentLang === "ar" ? "010xxxxxxxx" : "010xxxxxxxx"
  }

  return currentLang === "ar" ? "اكتب الرقم القومي" : "Enter national ID"
}

const getMethodIcon = (method) => {
  if (method === "email") return Mail
  if (method === "mobile") return Phone
  return IdCard
}

function ForgetPassword() {
  const [resetMethod, setResetMethod] = useState("email")
  const [focusedField, setFocusedField] = useState(null)

  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { t } = useTranslation()
  const theme = getPageTheme()

  const currentLang = i18next.language || "ar"
  const isRTL = currentLang === "ar"

  const { loadingAuth } = useSelector((state) => state.auth)
  const { mymode } = useSelector((state) => state.mode)

  const isDark = mymode === "dark"

  const validationSchema = useMemo(() => {
    if (resetMethod === "email") {
      return Yup.object({
        inputValue: Yup.string()
          .trim()
          .email(t("errors.email_format") || "Invalid email format")
          .matches(
            /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
            t("errors.email_format") || "Invalid email format"
          )
          .required(t("errors.email_required") || "Email is required"),
      })
    }

    if (resetMethod === "mobile") {
      return Yup.object({
        inputValue: Yup.string()
          .trim()
          .matches(
            /^01[0-9]{9}$/,
            t("errors.phone_format") ||
              (currentLang === "ar"
                ? "رقم الهاتف يجب أن يكون 11 رقم ويبدأ بـ 01"
                : "Mobile must be 11 digits and start with 01")
          )
          .required(t("errors.phone_required") || "Mobile is required"),
      })
    }

    return Yup.object({
      inputValue: Yup.string()
        .trim()
        .matches(
          /^[0-9]{14,20}$/,
          t("errors.id_format") ||
            (currentLang === "ar"
              ? "الرقم القومي يجب أن يكون من 14 إلى 20 رقم"
              : "National ID must be 14 to 20 digits")
        )
        .required(t("errors.id_required") || "National ID is required"),
    })
  }, [resetMethod, t, currentLang])

  const formik = useFormik({
    initialValues: {
      inputValue: "",
    },
    validationSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      const identifier = values.inputValue.trim()
      const payload = getResetPayload(resetMethod, identifier)

      try {
        const response = await dispatch(forgetPassword(payload)).unwrap()

        localStorage.setItem("identifier", identifier)
        localStorage.setItem("resetMethod", resetMethod)
        localStorage.setItem("valueReset", identifier)

        toast.success(
          getApiMessage(
            response,
            currentLang,
            t("forgetPassword.success") ||
              (currentLang === "ar"
                ? "تم إرسال كود إعادة تعيين كلمة المرور"
                : "Reset code sent successfully")
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

        navigate("/reset-password")
      } catch (error) {
        Swal.fire({
          title:
            t("forgetPassword.error.title") ||
            (currentLang === "ar" ? "تعذر إرسال الكود" : "Failed to send code"),
          text: getErrorMessage(
            error,
            currentLang,
            t("forgetPassword.error.message") ||
              (currentLang === "ar"
                ? "تأكد من البيانات وحاول مرة أخرى"
                : "Please check your data and try again")
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

  const MethodIcon = getMethodIcon(resetMethod)

  const inputHasError = Boolean(formik.touched.inputValue && formik.errors.inputValue)

  const methodOptions = [
    {
      id: "email",
      icon: Mail,
      title: currentLang === "ar" ? "البريد الإلكتروني" : "Email",
      description:
        currentLang === "ar"
          ? "استلام الكود عبر البريد"
          : "Receive code by email",
      tone: "blue",
    },
    {
      id: "mobile",
      icon: Phone,
      title: currentLang === "ar" ? "رقم الهاتف" : "Mobile",
      description:
        currentLang === "ar"
          ? "استلام الكود عبر الهاتف"
          : "Receive code by mobile",
      tone: "emerald",
    },
    {
      id: "nationalId",
      icon: IdCard,
      title: currentLang === "ar" ? "الرقم القومي" : "National ID",
      description:
        currentLang === "ar"
          ? "البحث باستخدام الرقم القومي"
          : "Find account by national ID",
      tone: "violet",
    },
  ]

  const handleMethodChange = (method) => {
    setResetMethod(method)
    formik.resetForm()
  }

  return (
    <div className={theme.page} dir={isRTL ? "rtl" : "ltr"}>
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
          <div className={`${theme.card} rounded-3xl p-8 sm:p-10 relative overflow-hidden`}>
            <div className="absolute inset-0 pointer-events-none opacity-40">
              <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-blue-500/10 blur-3xl" />
              <div className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-emerald-500/10 blur-3xl" />
            </div>

            <div className="relative h-full flex flex-col justify-between">
              <div>
                <div className="w-16 h-16 rounded-3xl border-2 border-blue-500 bg-transparent flex items-center justify-center mb-6">
                  <KeyRound className="w-8 h-8 text-blue-500" />
                </div>

                <h1 className="text-3xl sm:text-4xl font-black text-[var(--color-text)]">
                  {currentLang === "ar"
                    ? "استعادة كلمة المرور"
                    : "Recover your password"}
                </h1>

                <p className="mt-4 text-sm sm:text-base font-bold leading-7 text-[var(--color-text-muted)]">
                  {currentLang === "ar"
                    ? "اختر طريقة التحقق المناسبة، وسنرسل لك كود إعادة تعيين كلمة المرور."
                    : "Choose a verification method and we will send you a reset code."}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-8">
                <InfoCard
                  icon={Mail}
                  title={currentLang === "ar" ? "Email" : "Email"}
                  value={currentLang === "ar" ? "متاح" : "Available"}
                  tone="blue"
                />

                <InfoCard
                  icon={Phone}
                  title={currentLang === "ar" ? "Mobile" : "Mobile"}
                  value={currentLang === "ar" ? "متاح" : "Available"}
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
                  {currentLang === "ar" ? "ملاحظة" : "Note"}
                </p>

                <p className="mt-1 text-sm font-bold text-[var(--color-text)] leading-6">
                  {currentLang === "ar"
                    ? "بعد استلام الكود، ستنتقل لصفحة تعيين كلمة مرور جديدة."
                    : "After receiving the code, you will continue to the reset password page."}
                </p>
              </div>
            </div>
          </div>

          <div className={`${theme.card} rounded-3xl p-6 sm:p-8`}>
            <div className="mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl border-2 border-emerald-500 bg-transparent flex items-center justify-center">
                  <RefreshCw className="w-6 h-6 text-emerald-500" />
                </div>

                <div>
                  <h2 className="text-2xl font-black text-[var(--color-text)]">
                    {t("forgetPassword.title") ||
                      (currentLang === "ar"
                        ? "نسيت كلمة المرور؟"
                        : "Forgot password?")}
                  </h2>

                  <p className="text-sm font-bold text-[var(--color-text-muted)] mt-1">
                    {currentLang === "ar"
                      ? "اختر طريقة الاستعادة وأدخل البيانات"
                      : "Choose recovery method and enter your data"}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
              {methodOptions.map((option) => (
                <MethodCard
                  key={option.id}
                  option={option}
                  active={resetMethod === option.id}
                  onClick={() => handleMethodChange(option.id)}
                />
              ))}
            </div>

            <form onSubmit={formik.handleSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="inputValue"
                  className="block text-sm font-black text-[var(--color-text)] mb-2"
                >
                  {getIdentifierLabel(resetMethod, currentLang)}
                </label>

                <div className="relative">
                  <div
                    className={`flex items-stretch rounded-xl border transition-all focus-within:ring-4 ${
                      inputHasError
                        ? "border-red-500 focus-within:ring-red-500/10"
                        : "border-[var(--color-border)] focus-within:border-emerald-500 focus-within:ring-emerald-500/10"
                    }`}
                  >
                    <div className="flex items-center justify-center px-3 bg-[var(--color-bg-soft)] border-e border-[var(--color-border)] rounded-s-xl shrink-0">
                      <MethodIcon
                        className={`w-4 h-4 ${
                          resetMethod === "email"
                            ? "text-blue-500"
                            : resetMethod === "mobile"
                            ? "text-emerald-500"
                            : "text-indigo-500"
                        }`}
                      />
                    </div>

                    <input
                      id="inputValue"
                      name="inputValue"
                      type="text"
                      value={formik.values.inputValue}
                      onChange={formik.handleChange}
                      onBlur={(event) => {
                        setFocusedField(null)
                        formik.handleBlur(event)
                      }}
                      onFocus={() => setFocusedField("inputValue")}
                      placeholder={getIdentifierPlaceholder(resetMethod, currentLang)}
                      className="flex-1 min-w-0 bg-transparent text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] text-sm font-bold outline-none px-3 py-3"
                    />
                  </div>
                </div>

                {inputHasError && (
                  <p className="mt-2 text-xs font-black text-red-500">
                    {formik.errors.inputValue}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={loadingAuth || formik.isSubmitting}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--color-success)] px-5 py-3 text-sm font-black text-white border border-emerald-500 shadow-sm transition-all hover:bg-[var(--color-success-hover)] disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loadingAuth || formik.isSubmitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    {currentLang === "ar" ? "جاري الإرسال..." : "Sending..."}
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    {currentLang === "ar" ? "إرسال كود الاستعادة" : "Send reset code"}
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-[var(--color-border)] flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
              <Link
                to="/login"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--color-border-strong)] bg-[var(--color-surface)] px-4 py-2 text-sm font-black text-[var(--color-text)] hover:bg-[var(--color-success)] hover:text-white hover:border-emerald-500 transition-colors"
              >
                {isRTL ? (
                  <ArrowRight className="w-4 h-4 text-blue-500" />
                ) : (
                  <ArrowLeft className="w-4 h-4 text-blue-500" />
                )}
                {currentLang === "ar" ? "رجوع لتسجيل الدخول" : "Back to login"}
              </Link>

              <Link
                to="/signup"
                className="text-sm font-black text-blue-500 hover:text-blue-600 transition-colors text-center"
              >
                {currentLang === "ar" ? "إنشاء حساب جديد" : "Create new account"}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function MethodCard({ option, active, onClick }) {
  const Icon = option.icon

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

  const selectedTone = toneMap[option.tone] || toneMap.blue

  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-start rounded-2xl border p-4 transition-all ${
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

      <p className="text-sm font-black text-[var(--color-text)]">
        {option.title}
      </p>

      <p className="text-xs font-bold text-[var(--color-text-muted)] mt-1">
        {option.description}
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

export default ForgetPassword