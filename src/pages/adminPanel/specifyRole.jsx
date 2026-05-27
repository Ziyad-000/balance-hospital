"use client"

import React, { useMemo, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import i18next from "i18next"
import {
  ArrowLeft,
  ArrowRight,
  Building,
  CheckCircle,
  GitBranch,
  LayoutDashboard,
  LogOut,
  ShieldCheck,
  Stethoscope,
  UserCog,
  Users,
} from "lucide-react"

import {
  logOut,
  setCategoryManagerRole,
  setDepartmentManagerRole,
} from "../../state/slices/auth"

import Forbidden from "../../components/forbidden.jsx"
import { getPageTheme } from "../../utils/themeClasses"

const safeJsonParse = (value, fallback = null) => {
  try {
    if (!value || value === "undefined" || value === "null") return fallback
    return JSON.parse(value)
  } catch {
    return fallback
  }
}

const getSafeStorageValue = (key, fallback = "") => {
  const value = localStorage.getItem(key)

  if (!value || value === "undefined" || value === "null") {
    return fallback
  }

  return value
}

const isValidId = (value) => {
  return Boolean(value && value !== "0" && value !== "undefined" && value !== "null")
}

const getLocalizedName = (item, currentLang, arKeys = [], enKeys = []) => {
  if (!item) return "-"

  const preferredKeys = currentLang === "ar" ? arKeys : enKeys
  const fallbackKeys = currentLang === "ar" ? enKeys : arKeys

  for (const key of preferredKeys) {
    if (item?.[key]) return item[key]
  }

  for (const key of fallbackKeys) {
    if (item?.[key]) return item[key]
  }

  return "-"
}

const getRoleName = (role, currentLang) => {
  if (!role) return "-"

  return currentLang === "ar"
    ? role.roleNameAr || role.roleNameEn || "-"
    : role.roleNameEn || role.roleNameAr || "-"
}

const getStoredAuthData = () => {
  return {
    token: getSafeStorageValue("token"),
    user: safeJsonParse(localStorage.getItem("authUser")),
    role: safeJsonParse(localStorage.getItem("loginRoleResponseDto")),
    departmentManager: safeJsonParse(localStorage.getItem("departmentManager")),
    categoryManager: safeJsonParse(localStorage.getItem("categoryManager")),
    departmentManagerId: getSafeStorageValue("departmentManagerId", "0"),
    categoryManagerId: getSafeStorageValue("categoryManagerId", "0"),
    categoryArabicName: getSafeStorageValue("categoryArabicName"),
    categoryEnglishName: getSafeStorageValue("categoryEnglishName"),
    departmentArabicName: getSafeStorageValue("departmentArabicName"),
    departmentEnglishName: getSafeStorageValue("departmentEnglishName"),
  }
}

function SpecifyRole() {
  const [selectedRole, setSelectedRole] = useState(null)

  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const theme = getPageTheme()

  const language = i18next.language || "ar"
  const currentLang = language
  const isRTL = currentLang === "ar"

  const stored = useMemo(() => getStoredAuthData(), [])

  const {
    token,
    user,
    loginRoleResponseDto,
    departmentManager,
    categoryManager,
    departmentManagerId,
    categoryManagerId,
  } = useSelector((state) => state.auth)

  const activeToken = token || stored.token

  const activeUser = user || stored.user

  const activeRole = loginRoleResponseDto || stored.role

  const activeDepartmentManager =
    departmentManager || stored.departmentManager || activeUser?.departmentManager

  const activeCategoryManager =
    categoryManager || stored.categoryManager || activeUser?.categoryManager

  const activeDepartmentId =
    activeDepartmentManager?.departmentId ||
    departmentManagerId ||
    stored.departmentManagerId ||
    "0"

  const activeCategoryId =
    activeCategoryManager?.categoryId ||
    categoryManagerId ||
    stored.categoryManagerId ||
    "0"

  const categoryNameFromObject = getLocalizedName(
    activeCategoryManager,
    currentLang,
    ["categoryNameAr", "nameArabic", "nameAr"],
    ["categoryNameEn", "nameEnglish", "nameEn"]
  )

  const departmentNameFromObject = getLocalizedName(
    activeDepartmentManager,
    currentLang,
    ["departmentNameAr", "nameArabic", "nameAr"],
    ["departmentNameEn", "nameEnglish", "nameEn"]
  )

  const categoryName =
    categoryNameFromObject !== "-"
      ? categoryNameFromObject
      : currentLang === "ar"
      ? stored.categoryArabicName || stored.categoryEnglishName || "-"
      : stored.categoryEnglishName || stored.categoryArabicName || "-"

  const departmentName =
    departmentNameFromObject !== "-"
      ? departmentNameFromObject
      : currentLang === "ar"
      ? stored.departmentArabicName || stored.departmentEnglishName || "-"
      : stored.departmentEnglishName || stored.departmentArabicName || "-"

  const userName = getLocalizedName(
    activeUser,
    currentLang,
    ["nameArabic", "fullNameAr", "userNameArabic"],
    ["nameEnglish", "fullNameEn", "userNameEnglish"]
  )

  const roleName = getRoleName(activeRole, currentLang)

  const canChooseCategory = isValidId(activeCategoryId)
  const canChooseDepartment = isValidId(activeDepartmentId)

  const shouldShowForbidden = !canChooseCategory && !canChooseDepartment

  const handleChooseCategory = () => {
    if (!canChooseCategory) return

    setSelectedRole("category")
    dispatch(setCategoryManagerRole())
    navigate(`/admin-panel/category/${activeCategoryId}`)
  }

  const handleChooseDepartment = () => {
    if (!canChooseDepartment) return

    setSelectedRole("department")
    dispatch(setDepartmentManagerRole())
    navigate(`/admin-panel/department/${activeDepartmentId}`)
  }

  const handleGoDashboard = () => {
    navigate("/admin-panel/dashboard")
  }

  const handleLogout = () => {
    dispatch(logOut())
    navigate("/login")
  }

  if (!activeToken) {
    return (
      <div className={theme.page} dir={isRTL ? "rtl" : "ltr"}>
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className={`${theme.card} max-w-lg w-full p-8 text-center rounded-3xl`}>
            <ShieldCheck className="w-16 h-16 mx-auto mb-4 text-red-500" />

            <h1 className="text-2xl font-black text-[var(--color-text)]">
              {currentLang === "ar" ? "جلسة غير صالحة" : "Invalid Session"}
            </h1>

            <p className="mt-2 text-sm font-bold text-[var(--color-text-muted)]">
              {currentLang === "ar"
                ? "من فضلك سجّل الدخول مرة أخرى لاختيار الدور."
                : "Please login again to choose your role."}
            </p>

            <button
              type="button"
              onClick={() => navigate("/login")}
              className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--color-success)] px-5 py-3 text-sm font-black text-white border border-emerald-500 hover:bg-[var(--color-success-hover)] transition-colors"
            >
              {currentLang === "ar" ? "تسجيل الدخول" : "Login"}
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (shouldShowForbidden) {
    return <Forbidden />
  }

  return (
    <div className={theme.page} dir={isRTL ? "rtl" : "ltr"}>
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-6xl space-y-6">
          <div className={`${theme.card} p-6 rounded-3xl`}>
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-3xl border-2 border-blue-500 bg-transparent flex items-center justify-center shrink-0">
                  <GitBranch className="w-8 h-8 text-blue-500" />
                </div>

                <div>
                  <h1 className="text-3xl font-black text-[var(--color-text)]">
                    {t("selectRole.title") ||
                      (currentLang === "ar"
                        ? "اختر طريقة الدخول"
                        : "Choose Access Mode")}
                  </h1>

                  <p className="mt-2 text-sm font-bold text-[var(--color-text-muted)] max-w-3xl">
                    {t("selectRole.subtitle") ||
                      (currentLang === "ar"
                        ? "حسابك لديه صلاحيات على مستوى التخصص والقسم. اختر الدور الذي تريد العمل به الآن."
                        : "Your account has both category and department permissions. Choose which role you want to use now.")}
                  </p>

                  <div className="flex flex-wrap gap-2 mt-4">
                    <Badge tone="blue">
                      {currentLang === "ar" ? "المستخدم" : "User"}: {userName}
                    </Badge>

                    <Badge tone="violet">
                      {currentLang === "ar" ? "الدور الحالي" : "Current Role"}:{" "}
                      {roleName}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handleGoDashboard}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--color-border-strong)] bg-[var(--color-surface)] px-4 py-2 text-sm font-black text-[var(--color-text)] hover:bg-[var(--color-success)] hover:text-white hover:border-emerald-500 transition-colors"
                >
                  <LayoutDashboard size={16} className="text-blue-500" />
                  {currentLang === "ar" ? "لوحة التحكم" : "Dashboard"}
                </button>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-red-500 bg-transparent px-4 py-2 text-sm font-black text-red-500 hover:bg-red-500 hover:text-white transition-colors"
                >
                  <LogOut size={16} />
                  {currentLang === "ar" ? "خروج" : "Logout"}
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <RoleCard
              title={
                t("selectRole.categoryManager.title") ||
                (currentLang === "ar"
                  ? "الدخول كرئيس تخصص"
                  : "Enter as Category Manager")
              }
              subtitle={
                t("selectRole.categoryManager.description") ||
                (currentLang === "ar"
                  ? "إدارة التخصص، الأطباء، الروسترات، التقارير، والأقسام المرتبطة بهذا التخصص."
                  : "Manage category doctors, rosters, reports, and linked departments.")
              }
              entityLabel={currentLang === "ar" ? "التخصص" : "Category"}
              entityValue={categoryName}
              icon={Stethoscope}
              tone="blue"
              disabled={!canChooseCategory}
              selected={selectedRole === "category"}
              disabledText={
                currentLang === "ar"
                  ? "لا يوجد تخصص مرتبط بهذا الحساب."
                  : "No category is linked to this account."
              }
              stats={[
                {
                  icon: Users,
                  label: currentLang === "ar" ? "الأطباء" : "Doctors",
                  value: currentLang === "ar" ? "إدارة" : "Manage",
                  tone: "blue",
                },
                {
                  icon: CheckCircle,
                  label: currentLang === "ar" ? "الروسترات" : "Rosters",
                  value: currentLang === "ar" ? "متابعة" : "Track",
                  tone: "emerald",
                },
                {
                  icon: ShieldCheck,
                  label: currentLang === "ar" ? "الصلاحيات" : "Permissions",
                  value: currentLang === "ar" ? "تخصص" : "Category",
                  tone: "violet",
                },
              ]}
              actionText={
                currentLang === "ar"
                  ? "الدخول كرئيس تخصص"
                  : "Continue as Category"
              }
              onClick={handleChooseCategory}
              isRTL={isRTL}
            />

            <RoleCard
              title={
                t("selectRole.departmentManager.title") ||
                (currentLang === "ar"
                  ? "الدخول كرئيس قسم"
                  : "Enter as Department Manager")
              }
              subtitle={
                t("selectRole.departmentManager.description") ||
                (currentLang === "ar"
                  ? "إدارة القسم، الجداول اليومية، التغطية، GeoFence، وبيانات القسم التفصيلية."
                  : "Manage department schedules, coverage, GeoFence, and department details.")
              }
              entityLabel={currentLang === "ar" ? "القسم" : "Department"}
              entityValue={departmentName}
              icon={Building}
              tone="emerald"
              disabled={!canChooseDepartment}
              selected={selectedRole === "department"}
              disabledText={
                currentLang === "ar"
                  ? "لا يوجد قسم مرتبط بهذا الحساب."
                  : "No department is linked to this account."
              }
              stats={[
                {
                  icon: UserCog,
                  label: currentLang === "ar" ? "الإدارة" : "Management",
                  value: currentLang === "ar" ? "قسم" : "Department",
                  tone: "emerald",
                },
                {
                  icon: CheckCircle,
                  label: currentLang === "ar" ? "الجداول" : "Schedules",
                  value: currentLang === "ar" ? "متابعة" : "Track",
                  tone: "blue",
                },
                {
                  icon: ShieldCheck,
                  label: currentLang === "ar" ? "الصلاحيات" : "Permissions",
                  value: currentLang === "ar" ? "قسم" : "Department",
                  tone: "violet",
                },
              ]}
              actionText={
                currentLang === "ar"
                  ? "الدخول كرئيس قسم"
                  : "Continue as Department"
              }
              onClick={handleChooseDepartment}
              isRTL={isRTL}
            />
          </div>

          <div className={`${theme.card} p-5 rounded-2xl`}>
            <p className="text-sm font-bold text-[var(--color-text-muted)] leading-7">
              {currentLang === "ar"
                ? "ملاحظة: اختيارك هنا لا يغيّر دورك الأساسي في قاعدة البيانات، لكنه يحدد وضع العمل الحالي داخل الواجهة فقط."
                : "Note: Your choice here does not change your main role in the database. It only selects the current working mode in the interface."}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function RoleCard({
  title,
  subtitle,
  entityLabel,
  entityValue,
  icon: Icon,
  tone,
  stats,
  actionText,
  onClick,
  disabled,
  disabledText,
  selected,
  isRTL,
}) {
  const toneMap = {
    blue: {
      border: "border-blue-500",
      text: "text-blue-500",
      button: "bg-blue-500 border-blue-500 hover:bg-blue-600 text-white",
    },
    emerald: {
      border: "border-emerald-500",
      text: "text-emerald-500",
      button:
        "bg-emerald-500 border-emerald-500 hover:bg-emerald-600 text-white",
    },
    violet: {
      border: "border-violet-500",
      text: "text-violet-500",
      button: "bg-violet-500 border-violet-500 hover:bg-violet-600 text-white",
    },
  }

  const selectedTone = toneMap[tone] || toneMap.blue

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`text-start rounded-3xl border bg-[var(--color-surface)] p-6 shadow-sm transition-all relative overflow-hidden ${
        selected ? selectedTone.border : "border-[var(--color-border-strong)]"
      } ${
        disabled
          ? "opacity-60 cursor-not-allowed"
          : "hover:shadow-xl hover:border-emerald-500"
      }`}
    >
      {selected && (
        <span
          className={`absolute top-4 ${
            isRTL ? "left-4" : "right-4"
          } w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center`}
        >
          <CheckCircle size={16} />
        </span>
      )}

      <div className="flex items-start gap-4">
        <div
          className={`w-16 h-16 rounded-3xl border-2 bg-transparent flex items-center justify-center shrink-0 ${selectedTone.border}`}
        >
          <Icon className={`w-8 h-8 ${selectedTone.text}`} />
        </div>

        <div className="pe-8">
          <h2 className="text-2xl font-black text-[var(--color-text)]">
            {title}
          </h2>

          <p className="mt-2 text-sm font-bold text-[var(--color-text-muted)] leading-7">
            {subtitle}
          </p>
        </div>
      </div>

      <div className="mt-5 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-soft)] p-4">
        <p className="text-xs font-black text-[var(--color-text-muted)]">
          {entityLabel}
        </p>

        <p className={`mt-1 text-lg font-black ${selectedTone.text}`}>
          {entityValue || "-"}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-5">
        {stats.map((item, index) => (
          <MiniStat
            key={`${item.label}-${index}`}
            icon={item.icon}
            label={item.label}
            value={item.value}
            tone={item.tone}
          />
        ))}
      </div>

      {disabled && (
        <div className="mt-5 rounded-xl border-2 border-amber-500 bg-transparent p-3">
          <p className="text-sm font-black text-amber-500">{disabledText}</p>
        </div>
      )}

      <div
        className={`mt-6 w-full inline-flex items-center justify-center gap-2 rounded-xl border px-5 py-3 text-sm font-black transition-colors ${selectedTone.button}`}
      >
        {actionText}
        {isRTL ? <ArrowLeft size={16} /> : <ArrowRight size={16} />}
      </div>
    </button>
  )
}

function MiniStat({ icon: Icon, label, value, tone = "blue" }) {
  const toneMap = {
    blue: "text-blue-500 border-blue-500",
    emerald: "text-emerald-500 border-emerald-500",
    violet: "text-violet-500 border-violet-500",
    amber: "text-amber-500 border-amber-500",
    red: "text-red-500 border-red-500",
  }

  const selectedTone = toneMap[tone] || toneMap.blue
  const textTone = selectedTone.split(" ")[0]

  return (
    <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-3">
      <div
        className={`w-10 h-10 rounded-xl border-2 bg-transparent flex items-center justify-center mb-3 ${selectedTone}`}
      >
        <Icon className="w-5 h-5" />
      </div>

      <p className="text-xs font-black text-[var(--color-text-muted)]">
        {label}
      </p>

      <p className={`mt-1 text-sm font-black ${textTone}`}>{value}</p>
    </div>
  )
}

function Badge({ children, tone = "blue" }) {
  const toneMap = {
    blue: "text-blue-500 border-blue-500",
    emerald: "text-emerald-500 border-emerald-500",
    violet: "text-violet-500 border-violet-500",
    amber: "text-amber-500 border-amber-500",
    red: "text-red-500 border-red-500",
  }

  return (
    <span
      className={`inline-flex items-center rounded-full border-2 px-3 py-1 text-xs font-black bg-transparent ${
        toneMap[tone] || toneMap.blue
      }`}
    >
      {children}
    </span>
  )
}

export default SpecifyRole