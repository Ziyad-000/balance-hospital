"use client"

import { useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useTranslation } from "react-i18next"
import UseDirection from "../../hooks/use-direction.js"
import { useNavigate } from "react-router-dom"
import {
  setCategoryManagerRole,
  setDepartmentManagerRole,
} from "../../state/slices/auth.js"
import i18next from "i18next"
import Forbidden from "../../components/forbidden.jsx"

// Icons
const CategoryIcon = ({ className = "" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
    <rect x="7" y="7" width="3" height="3"></rect>
    <rect x="14" y="7" width="3" height="3"></rect>
    <rect x="7" y="14" width="3" height="3"></rect>
    <rect x="14" y="14" width="3" height="3"></rect>
  </svg>
)

const DepartmentIcon = ({ className = "" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M3 21h18"></path>
    <path d="M5 21V7l8-4v18"></path>
    <path d="M19 21V11l-6-4"></path>
    <path d="M9 9v.01"></path>
    <path d="M9 12v.01"></path>
    <path d="M9 15v.01"></path>
    <path d="M9 18v.01"></path>
  </svg>
)

const CheckIcon = ({ className = "" }) => (
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
    <polyline points="20,6 9,17 4,12"></polyline>
  </svg>
)

const iconToneMap = {
  blue: {
    box: "bg-transparent text-blue-500 border-blue-500 dark:bg-transparent dark:text-blue-500 dark:border-blue-500",
    text: "text-blue-500 dark:text-blue-500",
    hover:
      "hover:bg-emerald-600 hover:text-white hover:border-emerald-600 dark:hover:bg-emerald-600 dark:hover:text-white dark:hover:border-emerald-600",
  },
  emerald: {
    box: "bg-transparent text-emerald-500 border-emerald-500 dark:bg-transparent dark:text-emerald-500 dark:border-emerald-500",
    text: "text-emerald-500 dark:text-emerald-500",
    hover:
      "hover:bg-emerald-600 hover:text-white hover:border-emerald-600 dark:hover:bg-emerald-600 dark:hover:text-white dark:hover:border-emerald-600",
  },
  slate: {
    box: "bg-transparent text-slate-500 border-slate-500 dark:bg-transparent dark:text-slate-500 dark:border-slate-500",
    text: "text-slate-500 dark:text-slate-500",
    hover:
      "hover:bg-emerald-600 hover:text-white hover:border-emerald-600 dark:hover:bg-emerald-600 dark:hover:text-white dark:hover:border-emerald-600",
  },
}

const IconBox = ({ icon: Icon, tone = "blue", size = "lg", className = "" }) => {
  const selectedTone = iconToneMap[tone] || iconToneMap.blue

  const sizeMap = {
    sm: { box: "w-8 h-8 rounded-lg", icon: "w-4 h-4" },
    md: { box: "w-10 h-10 rounded-xl", icon: "w-5 h-5" },
    lg: { box: "w-12 h-12 rounded-2xl", icon: "w-6 h-6" },
    xl: { box: "w-16 h-16 rounded-2xl", icon: "w-8 h-8" },
  }

  const selectedSize = sizeMap[size] || sizeMap.lg

  return (
    <span
      className={`${selectedSize.box} ${selectedTone.box} border-2 flex items-center justify-center shrink-0 shadow-sm ${className}`}
    >
      <Icon className={`${selectedSize.icon} shrink-0`} />
    </span>
  )
}

const SpecifyRole = () => {
  const [hoveredRole, setHoveredRole] = useState(null)
  const [selectedRole, setSelectedRole] = useState(null)

  const { t } = useTranslation()
  const { mymode } = useSelector((state) => state.mode)
  const { categoryManagerId, departmentManagerId } = useSelector(
    (state) => state.auth
  )

  const { direction } = UseDirection()
  const isRTL = direction.direction === "rtl"
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const categoryArabicName = localStorage.getItem("categoryArabicName")
  const categoryEnglishName = localStorage.getItem("categoryEnglishName")
  const departmentArabicName = localStorage.getItem("departmentArabicName")
  const departmentEnglishName = localStorage.getItem("departmentEnglishName")

  const language = i18next.language
  const isDark = mymode === "dark"

  if (departmentManagerId == "undefined" || categoryManagerId == "undefined") {
    console.log(categoryManagerId, departmentManagerId)
    return <Forbidden />
  }

  const categoryName =
    language === "ar" ? categoryArabicName : categoryEnglishName
  const departmentName =
    language === "ar" ? departmentArabicName : departmentEnglishName

  const pageClass = isDark
    ? "bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white"
    : "bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50 text-slate-950"

  const mainCardClass = isDark
    ? "bg-gray-900 border-gray-700 shadow-2xl"
    : "bg-white border-slate-200 shadow-xl"

  const roleCardBase =
    "relative rounded-3xl p-6 border-2 transition-all duration-300 cursor-pointer hover:scale-[1.02] hover:shadow-xl overflow-hidden"

  const roleCardIdle = isDark
    ? "bg-gray-800 border-gray-700 hover:border-emerald-500"
    : "bg-white border-slate-200 hover:border-emerald-500"

  const roleCardSelected = isDark
    ? "bg-gray-800 border-emerald-500 ring-2 ring-emerald-500/30"
    : "bg-emerald-50 border-emerald-500 ring-2 ring-emerald-500/20"

  const titleClass = isDark ? "text-white" : "text-slate-950"
  const subtitleClass = isDark ? "text-slate-300" : "text-slate-600"
  const mutedClass = isDark ? "text-slate-300" : "text-slate-700"

  const roles = [
    {
      id: "category-manager",
      titleKey: "selectRole.categoryManager.title",
      descriptionKey: "selectRole.categoryManager.description",
      displayName: categoryName,
      icon: CategoryIcon,
      features: [
        "selectRole.categoryManager.features.rosters",
        "selectRole.categoryManager.features.approve",
        "selectRole.categoryManager.features.doctors",
        "selectRole.categoryManager.features.editCategory",
        "selectRole.categoryManager.features.assignDepartment",
        "selectRole.categoryManager.features.removeDepartment",
      ],
      tone: "blue",
    },
    {
      id: "department-manager",
      titleKey: "selectRole.departmentManager.title",
      descriptionKey: "selectRole.departmentManager.description",
      displayName: departmentName,
      icon: DepartmentIcon,
      features: [
        "selectRole.departmentManager.features.manageDepartment",
        "selectRole.departmentManager.features.staff",
        "selectRole.departmentManager.features.schedules",
        "selectRole.departmentManager.features.resources",
        "selectRole.departmentManager.features.reports",
      ],
      tone: "emerald",
    },
  ]

  const handleRoleClick = (roleId) => {
    setSelectedRole(roleId)

    if (roleId === "category-manager") {
      dispatch(setCategoryManagerRole())

      if (categoryManagerId) {
        navigate(`/admin-panel/category/${categoryManagerId}`)
      } else {
        navigate("/admin-panel/category-manager")
      }
    } else if (roleId === "department-manager") {
      dispatch(setDepartmentManagerRole())

      if (departmentManagerId) {
        navigate(`/admin-panel/department/${departmentManagerId}`)
      } else {
        navigate("/admin-panel/department-manager")
      }
    }
  }

  return (
    <div
      className={`min-h-screen flex items-center justify-center p-4 transition-colors duration-200 ${pageClass}`}
      dir={direction.direction}
    >
      <div className="w-full max-w-5xl">
        <div className={`rounded-3xl border p-6 sm:p-8 ${mainCardClass}`}>
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl border-2 border-blue-500 bg-transparent text-blue-500 flex items-center justify-center shadow-sm">
              <CategoryIcon className="w-8 h-8" />
            </div>

            <h1
              className={`text-3xl sm:text-4xl font-black mb-3 tracking-tight ${titleClass}`}
            >
              {t("selectRole.title")}
            </h1>

            <p className={`text-base sm:text-lg font-semibold ${subtitleClass}`}>
              {t("selectRole.subtitle")}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-4">
            {roles.map((role) => {
              const Icon = role.icon
              const isSelected = selectedRole === role.id
              const isHovered = hoveredRole === role.id
              const selectedTone = iconToneMap[role.tone] || iconToneMap.blue

              return (
                <button
                  key={role.id}
                  type="button"
                  className={`${roleCardBase} ${
                    isSelected ? roleCardSelected : roleCardIdle
                  } text-start group`}
                  onClick={() => handleRoleClick(role.id)}
                  onMouseEnter={() => setHoveredRole(role.id)}
                  onMouseLeave={() => setHoveredRole(null)}
                >
                  {isSelected && (
                    <span
                      className={`absolute top-4 ${
                        isRTL ? "left-4" : "right-4"
                      } w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-sm`}
                    >
                      <CheckIcon className="w-4 h-4" />
                    </span>
                  )}

                  <div className="flex items-start gap-4 mb-5">
                    <IconBox icon={Icon} tone={role.tone} size="lg" />

                    <div className="min-w-0 pe-8">
                      <h3
                        className={`text-xl font-black transition-colors duration-200 ${titleClass}`}
                      >
                        {t(role.titleKey)}
                      </h3>

                      <p
                        className={`text-sm mt-1 font-semibold transition-colors duration-200 ${subtitleClass}`}
                      >
                        {t(role.descriptionKey)}
                      </p>

                      {role.displayName && (
                        <span
                          className={`inline-flex items-center mt-3 px-3 py-1 rounded-full border-2 text-xs font-black ${selectedTone.box}`}
                        >
                          {role.displayName}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3">
                    {role.features.map((featureKey, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <span
                          className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center shrink-0 ${selectedTone.box}`}
                        >
                          <CheckIcon className="w-3.5 h-3.5" />
                        </span>

                        <span
                          className={`text-sm font-bold leading-relaxed ${mutedClass}`}
                        >
                          {t(featureKey)}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div
                    className={`mt-6 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-black border transition-colors ${
                      isSelected
                        ? "bg-emerald-600 text-white border-emerald-600"
                        : "bg-[var(--color-surface)] text-[var(--color-text)] border-[var(--color-border-strong)] hover:bg-emerald-600 hover:text-white hover:border-emerald-600"
                    }`}
                  >
                    <CheckIcon className="w-4 h-4" />
                    {isSelected
                      ? t("selectRole.selected") || "Selected"
                      : t("selectRole.choose") || "Choose"}
                  </div>

                  {isHovered && !isSelected && (
                    <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-emerald-500/10 to-blue-500/10 pointer-events-none transition-opacity duration-300" />
                  )}
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

export default SpecifyRole