"use client"

import React, { useState } from "react"
import { Formik, Form, Field, ErrorMessage } from "formik"
import * as Yup from "yup"
import { logIn } from "../../state/act/actAuth"
import { useDispatch, useSelector } from "react-redux"
import { Link } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { toast } from "react-toastify"
import Swal from "sweetalert2"
import i18next from "i18next"
import UseInitialValues from "../../hooks/use-initial-values"
import UseFormValidation from "../../hooks/use-form-validation"
import UseDirection from "../../hooks/use-direction"
import { useNavigate } from "react-router-dom"

import useDirection from "../../hooks/use-direction"
import { signalRService } from "../../services/signalRService"

const UserIcon = ({ className = "" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
    <circle cx="12" cy="7" r="4"></circle>
  </svg>
)

const MailIcon = ({ className = "" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
    <polyline points="22,6 12,13 2,6"></polyline>
  </svg>
)

const LockIcon = ({ className = "" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
    <circle cx="12" cy="16" r="1"></circle>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
  </svg>
)

const EyeIcon = ({ className = "" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
    <circle cx="12" cy="12" r="3"></circle>
  </svg>
)

const EyeOffIcon = ({ className = "" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
    <line x1="1" y1="1" x2="23" y2="23"></line>
  </svg>
)

const Login = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [focusedField, setFocusedField] = useState(null)
  const { t } = useTranslation()
  const { loadingAuth } = useSelector((state) => state.auth)
  const { mymode } = useSelector((state) => state.mode)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  // Initial form values
  const { INITIAL_VALUES_LOGIN } = UseInitialValues()
  const currentLang = i18next.language

  const { direction } = UseDirection()
  const isRTL = direction.direction === "rtl"

  // Yup validation schema
  const { VALIDATION_SCHEMA_LOGIN } = UseFormValidation()

  const [selectedRole, setSelectedRole] = useState(null)

  const handleRoleSelect = (roleId) => {
    setSelectedRole(roleId)
    // Handle navigation or next steps
    console.log("Selected role:", roleId)
  }

  // Handle form submission
  const handleSubmit = async (values, { setSubmitting }) => {
    dispatch(
      logIn({
        emailOrMobile: values.email,
        password: values.password,
        rememberMe: values.rememberMe,
      })
    )
      .unwrap()
      .then((data) => {
        toast.success(t("login.success"), {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        })
        console.log("data", data.data.user)

        signalRService
          .start()
          .then((connected) => {
            if (connected) {
              console.log("✅ SignalR connected successfully!")
            } else {
              console.warn("⚠️ SignalR connection failed")
            }
          })
          .catch((error) => {
            console.error("❌ SignalR connection error:", error)
          })

        localStorage.setItem(
          "categoryArabicName",
          data.data.user.categoryManager?.categoryNameAr
        )
        localStorage.setItem(
          "categoryEnglishName",
          data.data.user.categoryManager?.categoryNameEn
        )
        localStorage.setItem(
          "departmentArabicName",
          data.data.user.departmentManager?.departmentNameAr
        )
        localStorage.setItem(
          "departmentEnglishName",
          data.data.user.departmentManager?.departmentNameEn
        )
        if (
          data.data.user.loginRoleResponseDto.roleNameEn ==
          "Category & Department Head"
        ) {
          navigate("/specify-role")
        } else if (
          data.data.user.loginRoleResponseDto.roleNameAr === "مدير قسم" &&
          data.data.user.departmentManager?.departmentId
        ) {
          console.log("hello dep head", data.data.user.departmentManager)
          navigate(
            `/admin-panel/department/${data.data.user.departmentManager?.departmentId}`
          )
        } else if (
          data.data.user.loginRoleResponseDto.roleNameAr === "رئيس تخصص" &&
          data.data.user.categoryManager?.categoryId
        ) {
          console.log("hello cat head")
          navigate(
            `/admin-panel/category/${data.data.user.categoryManager?.categoryId}`
          )
        } else if (
          data.data.user.loginRoleResponseDto.roleNameAr === "مدير النظام"
        ) {
          console.log("hello cat head")
          navigate(`/admin-panel/dashboard`)
        } else {
          navigate(`/admin-panel/doctors/${data.data.user.userId}`)
        }
      })
      .catch((error) => {
        console.log("error", error)
        // Error handling with SweetAlert
        Swal.fire({
          title: t("login.error.title"),
          text:
            currentLang === "en"
              ? error?.response?.data?.messageEn
              : error?.response?.data?.messageAr || t("login.error.message"),
          icon: "error",
          confirmButtonText: t("common.ok"),
          confirmButtonColor: "#ef4444",
          background: mymode === "dark" ? "#1f2937" : "#ffffff",
          color: mymode === "dark" ? "#f9fafb" : "#111827",
        })
      })
  }

  // Generate margin class based on direction
  const getMarginClass = () => {
    return isRTL ? "mr-2" : "ml-2"
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  // Enhanced icon state logic
  const getIconState = (fieldName, hasValue, hasFocus, hasError) => {
    if (hasError) {
      return "error"
    }
    if (hasFocus) {
      return "focused"
    }
    if (hasValue) {
      return "filled"
    }
    return "default"
  }

  // Theme-based classes
  const getThemeClasses = () => {
    const isDark = mymode === "dark"
    return {
      container: isDark
        ? "bg-gray-900 text-gray-100"
        : "bg-gray-50 text-gray-900",
      card: isDark
        ? "bg-gray-800 border-gray-700 shadow-xl"
        : "bg-white border-gray-200 shadow-lg",
      iconContainer: isDark
        ? "bg-gray-700 text-gray-300"
        : "bg-gray-100 text-gray-600",
      title: isDark ? "text-gray-100" : "text-gray-900",
      subtitle: isDark ? "text-gray-400" : "text-gray-600",
      label: isDark ? "text-gray-200" : "text-gray-700",
      input: isDark
        ? "bg-gray-700 border-gray-600 text-gray-100 placeholder:text-gray-400 focus:ring-blue-500 focus:border-blue-500"
        : "bg-white border-gray-300 text-gray-900 placeholder:text-gray-500 focus:ring-blue-500 focus:border-blue-500",
      inputError: isDark
        ? "border-red-500 focus:ring-red-500"
        : "border-red-500 focus:ring-red-500",
      // Enhanced icon states
      iconDefault: isDark ? "text-gray-500" : "text-gray-400",
      iconFocused: isDark ? "text-blue-400" : "text-blue-500",
      iconFilled: isDark ? "text-gray-300" : "text-gray-600",
      iconError: isDark ? "text-red-400" : "text-red-500",
      iconHover: isDark ? "hover:text-gray-300" : "hover:text-gray-600",
      checkbox: isDark
        ? "bg-gray-700 border-gray-600 text-blue-600 focus:ring-blue-500"
        : "bg-gray-100 border-gray-300 text-blue-600 focus:ring-blue-500",
      button: isDark
        ? "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500"
        : "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500",
      link: isDark
        ? "text-blue-400 hover:text-blue-300"
        : "text-blue-600 hover:text-blue-700",
    }
  }

  const themeClasses = getThemeClasses()

  // Helper function to get directional classes
  const getDirectionalClasses = () => {
    return {
      // Icon positioning classes
      iconLeft: isRTL ? "right-0 pr-3" : "left-0 pl-3",
      iconRight: isRTL ? "left-0 pl-3" : "right-0 pr-3",
      // Input padding classes
      inputPaddingWithLeftIcon: isRTL ? "pr-9 pl-3" : "pl-9 pr-3",
      inputPaddingWithBothIcons: isRTL ? "pr-9 pl-10" : "pl-9 pr-10",
    }
  }

  const directionalClasses = getDirectionalClasses()

  // Get icon classes based on state
  const getIconClasses = (iconState) => {
    const baseClasses = "transition-all duration-300 ease-in-out transform"

    switch (iconState) {
      case "focused":
        return `${baseClasses} ${themeClasses.iconFocused} scale-105 drop-shadow-sm`
      case "filled":
        return `${baseClasses} ${themeClasses.iconFilled} scale-100`
      case "error":
        return `${baseClasses} ${themeClasses.iconError} scale-105 animate-pulse`
      default:
        return `${baseClasses} ${themeClasses.iconDefault} scale-95`
    }
  }

  const leftStyle = `${direction.left}-[100%]`

  return (
    <div
      className={`min-h-screen flex items-center justify-center p-4 transition-colors duration-200 ${themeClasses.container}`}
      dir={direction.direction}
    >
      <div className="w-full max-w-sm">
        <div
          className={`signin-card rounded-lg p-6 transition-all duration-200 ${themeClasses.card}`}
        >
          <div className="text-center mb-6">
            <div
              className={`inline-flex items-center justify-center w-12 h-12 rounded-full mb-4 transition-colors duration-200 ${themeClasses.iconContainer}`}
            >
              <UserIcon />
            </div>
            <h1
              className={`text-2xl font-semibold mb-2 transition-colors duration-200 ${themeClasses.title}`}
            >
              {t("login.title")}
            </h1>
            <p
              className={`text-sm transition-colors duration-200 ${themeClasses.subtitle}`}
            >
              {t("login.subtitle")}
            </p>
          </div>
          <Formik
            initialValues={INITIAL_VALUES_LOGIN}
            validationSchema={VALIDATION_SCHEMA_LOGIN}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting, errors, touched, values }) => (
              <Form className="space-y-4">
                {/* Email Field */}
                <div className="space-y-2 group">
                  <label
                    className={`text-sm font-medium transition-colors duration-200 ${themeClasses.label}`}
                  >
                    {t("login.email")}
                  </label>

                  <div className="flex items-center space-x-2">
                    {/* Icon Container - Completely separate from input */}
                    <div
                      className={`flex items-center justify-center w-10 h-10 rounded-md border transition-all duration-200 ${getIconClasses(
                        getIconState(
                          "email",
                          values.email,
                          focusedField === "email",
                          errors.email && touched.email
                        )
                      )} ${
                        errors.email && touched.email
                          ? themeClasses.inputError
                          : themeClasses.input
                      }`}
                    >
                      <MailIcon />
                    </div>

                    {/* Input Container */}
                    <div className="relative flex-1">
                      <Field
                        type="email"
                        name="email"
                        placeholder={t("login.emailPlaceholder")}
                        onFocus={() => setFocusedField("email")}
                        onBlur={() => setFocusedField(null)}
                        className={`signin-input w-full px-4 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-300 group-focus-within:shadow-sm ${
                          errors.email && touched.email
                            ? themeClasses.inputError
                            : `${themeClasses.input}`
                        }`}
                      />

                      {/* Field state indicator */}
                      {values.email && !errors.email && (
                        <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                          <div
                            className={`w-1.5 h-1.5 rounded-full ${themeClasses.iconFocused} animate-pulse`}
                          ></div>
                        </div>
                      )}
                    </div>
                  </div>

                  <ErrorMessage
                    name="email"
                    component="div"
                    className="text-red-500 text-xs mt-1 animate-in slide-in-from-top-1 duration-200"
                  />
                </div>
                {/* Password Field */}
                <div className="space-y-2 group">
                  <label
                    className={`text-sm font-medium transition-colors duration-200 ${themeClasses.label}`}
                  >
                    {t("login.password")}
                  </label>

                  <div className="flex items-center space-x-2">
                    {/* Lock Icon Container - Completely separate from input */}
                    <div
                      className={`flex items-center justify-center w-10 h-10 rounded-md border transition-all duration-200 ${getIconClasses(
                        getIconState(
                          "password",
                          values.password,
                          focusedField === "password",
                          errors.password && touched.password
                        )
                      )} ${
                        errors.password && touched.password
                          ? themeClasses.inputError
                          : themeClasses.input
                      }`}
                    >
                      <LockIcon />
                    </div>

                    {/* Input Container */}
                    <div className="relative flex-1">
                      <Field
                        type={showPassword ? "text" : "password"}
                        name="password"
                        placeholder={t("login.passwordPlaceholder")}
                        onFocus={() => setFocusedField("password")}
                        onBlur={() => setFocusedField(null)}
                        className={`signin-input w-full pl-4 pr-12 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-300 group-focus-within:shadow-sm ${
                          errors.password && touched.password
                            ? themeClasses.inputError
                            : `${themeClasses.input}`
                        }`}
                      />

                      {/* Eye toggle button - stays inside input */}
                      <button
                        type="button"
                        onClick={togglePasswordVisibility}
                        style={{ [direction.left]: "100%" }}
                        className={`absolute inset-y-0  flex items-center transition-all duration-200 z-10 ${
                          focusedField === "password"
                            ? themeClasses.iconFocused
                            : themeClasses.iconDefault
                        } ${
                          themeClasses.iconHover
                        } hover:scale-110 focus:outline-none focus:scale-110`}
                      >
                        {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                      </button>

                      {/* Field state indicator - positioned before eye button */}
                      {values.password && !errors.password && (
                        <div className="absolute inset-y-0 right-10 flex items-center pointer-events-none">
                          <div
                            className={`w-1.5 h-1.5 rounded-full ${themeClasses.iconFocused} animate-pulse`}
                          ></div>
                        </div>
                      )}
                    </div>
                  </div>

                  <ErrorMessage
                    name="password"
                    component="div"
                    className="text-red-500 text-xs mt-1 animate-in slide-in-from-top-1 duration-200"
                  />
                </div>

                {/* Remember Me */}
                <div className="flex items-center group">
                  <Field
                    type="checkbox"
                    name="rememberMe"
                    id="rememberMe"
                    className={`w-4 h-4 rounded focus:ring-2 transition-all duration-200 hover:scale-105 ${themeClasses.checkbox}`}
                  />
                  <label
                    htmlFor="rememberMe"
                    className={`text-sm font-medium transition-colors duration-200 cursor-pointer ${
                      themeClasses.label
                    } ${getMarginClass()} group-hover:${
                      themeClasses.iconFocused
                    }`}
                  >
                    {t("login.rememberMe")}
                  </label>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loadingAuth || isSubmitting}
                  className={`w-full disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 cursor-pointer hover:shadow-lg transform hover:scale-[1.02] active:scale-[0.98] ${themeClasses.button}`}
                >
                  {loadingAuth || isSubmitting ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      {t("login.loading")}
                    </div>
                  ) : (
                    t("login.button")
                  )}
                </button>
              </Form>
            )}
          </Formik>

          <div className="mt-6 text-center">
            <Link
              to="/forget-password"
              className={`font-medium hover:underline transition-all duration-200 hover:scale-105 inline-block ${themeClasses.link}`}
            >
              {t("login.forgetPassword")}
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
