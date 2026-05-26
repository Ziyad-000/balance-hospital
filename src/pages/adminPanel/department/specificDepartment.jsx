import React, { useEffect, useMemo, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate, useParams, Link } from "react-router-dom"
import { useTranslation } from "react-i18next"
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Building2,
  CalendarDays,
  CheckCircle,
  Edit,
  Eye,
  Info,
  Link2,
  MapPin,
  RefreshCw,
  Shield,
  UserCog,
  UserPlus,
  UserX,
  XCircle,
} from "lucide-react"

import {
  getDepartmentById,
  getDepartmentCategories,
  getDepartmentGeoFences,
  getDepartmentMonthList,
} from "../../../state/act/actDepartment"

import {
  clearSingleDepartment,
  clearSingleDepartmentError,
  clearDepartmentCategories,
  clearDepartmentMonthList,
  clearGeoFences,
} from "../../../state/slices/department"

import RemoveManagerModal from "../../../components/modals/RemoveMangerModal"
import Forbidden from "../../../components/forbidden"
import { formatDate } from "../../../utils/formtDate"
import DepartmentGeoFences from "./geofence"
import { getPageTheme } from "../../../utils/themeClasses"

function SpecificDepartment() {
  const { depId: id } = useParams()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { t, i18n } = useTranslation()
  const theme = getPageTheme()

  const [activeTab, setActiveTab] = useState("overview")
  const [showRemoveManagerModal, setShowRemoveManagerModal] = useState(false)

  const currentLang = i18n.language || "ar"
  const isRTL = currentLang === "ar"

  const defaultButtonClass =
    "inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border bg-[var(--color-surface)] text-[var(--color-text)] border-[var(--color-border-strong)] hover:bg-[var(--color-success)] hover:text-white hover:border-[var(--color-success)] active:bg-[var(--color-success-hover)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"

  const selectedButtonClass =
    "inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border bg-[var(--color-success)] text-white border-[var(--color-success)] transition-colors"

  const iconButtonClass =
    "p-2 rounded-lg border border-[var(--color-border-strong)] bg-[var(--color-surface)] text-[var(--color-text)] hover:bg-[var(--color-success)] hover:text-white hover:border-[var(--color-success)] transition-colors"

  const dangerIconButtonClass =
    "p-2 rounded-lg border border-[var(--color-border-strong)] bg-[var(--color-surface)] text-red-500 hover:bg-[var(--color-danger)] hover:text-white hover:border-[var(--color-danger)] transition-colors"

  const dangerButtonClass =
    "inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border bg-[var(--color-surface)] text-red-500 border-[var(--color-border-strong)] hover:bg-[var(--color-danger)] hover:text-white hover:border-[var(--color-danger)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"

  const toneMap = {
    blue: {
      bg: "bg-transparent",
      text: "text-blue-500",
      border: "border-blue-500",
    },
    green: {
      bg: "bg-transparent",
      text: "text-emerald-500",
      border: "border-emerald-500",
    },
    red: {
      bg: "bg-transparent",
      text: "text-red-500",
      border: "border-red-500",
    },
    yellow: {
      bg: "bg-transparent",
      text: "text-amber-500",
      border: "border-amber-500",
    },
    purple: {
      bg: "bg-transparent",
      text: "text-violet-500",
      border: "border-violet-500",
    },
    orange: {
      bg: "bg-transparent",
      text: "text-orange-500",
      border: "border-orange-500",
    },
    neutral: {
      bg: "bg-transparent",
      text: "text-slate-500",
      border: "border-slate-500",
    },
  }


  const { loginRoleResponseDto, departmentManagerId } = useSelector(
    (state) => state.auth
  )

  const {
    selectedDepartment,
    loadingGetSingleDepartment,
    singleDepartmentError,

    departmentLinkedIds,

    departmentCategories,
    loadingGetDepartmentCategories,
    departmentCategoriesError,

    departmentMonthList,
    loadingGetDepartmentMonthList,
    departmentMonthListError,

    loadingGetDepartmentGeofences,
    geofences,
    loadingDeleteGeoFence,
    getDepartmentGeoFencesError,
  } = useSelector((state) => state.department)

  const roleName = loginRoleResponseDto?.roleNameEn

  const depIdsArray = Array.isArray(departmentLinkedIds)
    ? departmentLinkedIds
    : departmentLinkedIds
    ? [departmentLinkedIds]
    : []

  const canCategoryHeadManage = depIdsArray.some(
    (depId) => String(depId) === String(id)
  )

  const isForbiddenForDepartmentManager =
    roleName === "Department Manager" &&
    String(departmentManagerId) !== String(id)

  const isForbiddenForCategoryHead =
    roleName === "Category Head" &&
    depIdsArray.length > 0 &&
    !canCategoryHeadManage

  const canManageDepartment =
    roleName === "System Administrator" ||
    roleName === "Department Manager" ||
    roleName === "Department Head"

  const canManageManager = roleName === "System Administrator"

  useEffect(() => {
    if (!id) return

    dispatch(clearSingleDepartment())
    dispatch(clearDepartmentCategories())
    dispatch(clearDepartmentMonthList())
    dispatch(clearGeoFences())

    dispatch(getDepartmentById(id))
    dispatch(getDepartmentCategories({ departmentId: id }))
    dispatch(getDepartmentGeoFences({ departmentId: id }))
    dispatch(getDepartmentMonthList({ departmentId: id }))

    return () => {
      dispatch(clearSingleDepartment())
      dispatch(clearSingleDepartmentError())
      dispatch(clearDepartmentCategories())
      dispatch(clearDepartmentMonthList())
      dispatch(clearGeoFences())
    }
  }, [dispatch, id])

  const refreshData = () => {
    if (!id) return

    dispatch(getDepartmentById(id))
    dispatch(getDepartmentCategories({ departmentId: id }))
    dispatch(getDepartmentGeoFences({ departmentId: id }))
    dispatch(getDepartmentMonthList({ departmentId: id }))
  }

  const linkedCategories = useMemo(() => {
    if (Array.isArray(departmentCategories) && departmentCategories.length > 0) {
      return departmentCategories
    }

    if (Array.isArray(selectedDepartment?.linkedCategories)) {
      return selectedDepartment.linkedCategories
    }

    if (Array.isArray(selectedDepartment?.categories)) {
      return selectedDepartment.categories
    }

    return []
  }, [departmentCategories, selectedDepartment])

  const safeGeofences = Array.isArray(geofences) ? geofences : []

  const safeMonthList = Array.isArray(departmentMonthList)
    ? departmentMonthList
    : []

  const hasManager = Boolean(
    selectedDepartment?.hasManager ||
      selectedDepartment?.manager ||
      selectedDepartment?.departmentManager
  )

  const overviewStats = useMemo(() => {
    return {
      categories:
        selectedDepartment?.linkedCategoriesCount ??
        selectedDepartment?.categoriesCount ??
        linkedCategories.length ??
        0,
      geofences: safeGeofences.length,
      months: safeMonthList.length,
      schedules:
        selectedDepartment?.activeSchedulesCount ??
        selectedDepartment?.schedulesCount ??
        0,
      manager: hasManager ? 1 : 0,
    }
  }, [
    selectedDepartment,
    linkedCategories.length,
    safeGeofences.length,
    safeMonthList.length,
    hasManager,
  ])

  const getDepartmentName = () => {
    if (!selectedDepartment) return "-"

    return currentLang === "ar"
      ? selectedDepartment.nameArabic ||
          selectedDepartment.nameAr ||
          selectedDepartment.nameEnglish ||
          selectedDepartment.nameEn ||
          "-"
      : selectedDepartment.nameEnglish ||
          selectedDepartment.nameEn ||
          selectedDepartment.nameArabic ||
          selectedDepartment.nameAr ||
          "-"
  }

  const getDepartmentSubName = () => {
    if (!selectedDepartment) return "-"

    return currentLang === "ar"
      ? selectedDepartment.nameEnglish || selectedDepartment.nameEn || "-"
      : selectedDepartment.nameArabic || selectedDepartment.nameAr || "-"
  }

  const getManagerName = () => {
    const manager =
      selectedDepartment?.manager || selectedDepartment?.departmentManager

    if (!manager) return "-"

    return currentLang === "ar"
      ? manager.userNameArabic ||
          manager.nameArabic ||
          manager.fullNameAr ||
          manager.userNameEnglish ||
          manager.nameEnglish ||
          manager.fullNameEn ||
          "-"
      : manager.userNameEnglish ||
          manager.nameEnglish ||
          manager.fullNameEn ||
          manager.userNameArabic ||
          manager.nameArabic ||
          manager.fullNameAr ||
          "-"
  }

  const getCategoryName = (category) => {
    return currentLang === "ar"
      ? category.categoryNameArabic ||
          category.categoryNameAr ||
          category.nameArabic ||
          category.nameAr ||
          category.categoryNameEnglish ||
          category.categoryNameEn ||
          category.nameEnglish ||
          "-"
      : category.categoryNameEnglish ||
          category.categoryNameEn ||
          category.nameEnglish ||
          category.nameEn ||
          category.categoryNameArabic ||
          category.categoryNameAr ||
          category.nameArabic ||
          "-"
  }

  const getMonthName = (item) => {
    if (!item) return "-"

    if (currentLang === "ar") {
      return item.monthNameAr || `${item.month}/${item.year}`
    }

    const date = new Date(Number(item.year), Number(item.month) - 1, 1)

    return date.toLocaleString("en-US", {
      month: "long",
      year: "numeric",
    })
  }

  const getCompletionTone = (percentage = 0) => {
    const value = Number(percentage || 0)

    if (value >= 90) {
      return {
        text: "text-emerald-500",
        bg: "bg-[var(--color-success-soft)]",
        border: "border-[var(--color-success-border)]",
        bar: "bg-[var(--color-success)]",
      }
    }

    if (value >= 70) {
      return {
        text: "text-amber-500",
        bg: "bg-[var(--color-warning-soft)]",
        border: "border-[var(--color-warning-border)]",
        bar: "bg-[var(--color-warning)]",
      }
    }

    return {
      text: "text-red-500",
      bg: "bg-[var(--color-danger-soft)]",
      border: "border-[var(--color-danger-border)]",
      bar: "bg-[var(--color-danger)]",
    }
  }

  const openDepartmentMonth = (monthItem) => {
    if (!monthItem?.month || !monthItem?.year) return

    navigate(`/admin-panel/department/${id}/${monthItem.month}/${monthItem.year}`)
  }

  const handleAssignManager = () => {
    navigate(`/admin-panel/department/assign-manager/${id}?type=department`)
  }

  const handleRemoveManager = () => {
    setShowRemoveManagerModal(true)
  }

  const InlineLoader = ({ text }) => (
    <div className={`${theme.card} p-8 text-center`}>
      <div className="w-9 h-9 mx-auto mb-4 rounded-full border-4 border-[var(--color-border)] border-t-[var(--color-primary)] animate-spin" />
      <p className="text-sm font-bold text-[var(--color-text-muted)]">
        {text}
      </p>
    </div>
  )

  const EmptyState = ({ icon: Icon, title, description }) => (
    <div className={`${theme.card} p-8 text-center`}>
      <Icon className="w-14 h-14 mx-auto mb-4 text-[var(--color-text-muted)]" />
      <h3 className="text-xl font-bold text-[var(--color-text)]">{title}</h3>
      <p className="mt-2 text-[var(--color-text-muted)]">{description}</p>
    </div>
  )

  const InfoItem = ({ label, value }) => (
    <div className={`${theme.cardSoft} p-4`}>
      <p className="text-xs font-bold text-[var(--color-text-muted)] mb-1">
        {label}
      </p>
      <p className="text-sm font-bold text-[var(--color-text)]">
        {value || "-"}
      </p>
    </div>
  )

  const StatCard = ({ icon: Icon, title, value, tone = "blue" }) => {
    const toneStyle = toneMap[tone] || toneMap.blue

    return (
      <div className={`${theme.cardSoft} p-4`}>
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm text-[var(--color-text-muted)]">{title}</p>
            <p className="text-2xl font-extrabold text-[var(--color-text)]">
              {value ?? 0}
            </p>
          </div>

          <div
            className={`w-11 h-11 rounded-xl flex items-center justify-center border ${toneStyle.bg} ${toneStyle.text} ${toneStyle.border}`}
          >
            <Icon className="w-5 h-5" />
          </div>
        </div>
      </div>
    )
  }

  const PermissionItem = ({ enabled, icon: Icon, label }) => (
    <div className={`${theme.cardSoft} p-3 flex items-center gap-3`}>
      <span
        className={`w-7 h-7 rounded-lg flex items-center justify-center border ${
          enabled
            ? "bg-transparent text-emerald-500 border-emerald-500 dark:bg-transparent dark:text-emerald-500 dark:border-emerald-500"
            : "bg-transparent text-red-500 border-red-500 dark:bg-transparent dark:text-red-500 dark:border-red-500"
        }`}
      >
        {enabled ? <CheckCircle size={15} /> : <XCircle size={15} />}
      </span>

      <Icon size={16} className="text-[var(--color-text-muted)]" />

      <span className="text-sm font-semibold text-[var(--color-text)]">
        {label}
      </span>
    </div>
  )

  const TabButton = ({ id: tabId, icon: Icon, label, count }) => {
    const isActive = activeTab === tabId

    return (
      <button
        type="button"
        onClick={() => setActiveTab(tabId)}
        className={isActive ? selectedButtonClass : defaultButtonClass}
      >
        <Icon size={16} />
        {label}
        {count !== undefined && (
          <span
            className={`px-2 py-0.5 rounded-full text-[11px] ${
              isActive
                ? "bg-white/20 text-white"
                : "bg-[var(--color-surface-muted)] text-[var(--color-text-muted)] border border-[var(--color-border)]"
            }`}
          >
            {count}
          </span>
        )}
      </button>
    )
  }

  const renderOverviewTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
        <StatCard
          icon={Link2}
          title={currentLang === "ar" ? "التخصصات" : "Categories"}
          value={overviewStats.categories}
          tone="blue"
        />

        <StatCard
          icon={UserCog}
          title={currentLang === "ar" ? "المدير" : "Manager"}
          value={overviewStats.manager}
          tone="purple"
        />

        <StatCard
          icon={MapPin}
          title="GeoFence"
          value={overviewStats.geofences}
          tone="green"
        />

        <StatCard
          icon={CalendarDays}
          title={currentLang === "ar" ? "شهور الروستر" : "Roster Months"}
          value={overviewStats.months}
          tone="orange"
        />

        <StatCard
          icon={BarChart3}
          title={currentLang === "ar" ? "جداول نشطة" : "Active Schedules"}
          value={overviewStats.schedules}
          tone="yellow"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className={`${theme.card} p-6 xl:col-span-2`}>
          <h2 className="text-xl font-bold text-[var(--color-text)] mb-5 flex items-center gap-2">
            <Info className="w-5 h-5 text-blue-500" />
            {currentLang === "ar" ? "بيانات القسم" : "Department Information"}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InfoItem
              label={currentLang === "ar" ? "الاسم العربي" : "Arabic Name"}
              value={selectedDepartment?.nameArabic}
            />

            <InfoItem
              label={currentLang === "ar" ? "الاسم الإنجليزي" : "English Name"}
              value={selectedDepartment?.nameEnglish}
            />

            <InfoItem
              label={currentLang === "ar" ? "الكود" : "Code"}
              value={selectedDepartment?.code}
            />

            <InfoItem
              label={currentLang === "ar" ? "الحالة" : "Status"}
              value={
                selectedDepartment?.isActive
                  ? currentLang === "ar"
                    ? "نشط"
                    : "Active"
                  : currentLang === "ar"
                  ? "غير نشط"
                  : "Inactive"
              }
            />

            <InfoItem
              label={currentLang === "ar" ? "الموقع" : "Location"}
              value={selectedDepartment?.location}
            />

            <InfoItem
              label={currentLang === "ar" ? "تاريخ الإنشاء" : "Created At"}
              value={formatDate(selectedDepartment?.createdAt)}
            />

            <InfoItem
              label={currentLang === "ar" ? "أنشئ بواسطة" : "Created By"}
              value={selectedDepartment?.createdByName}
            />

            <InfoItem
              label={currentLang === "ar" ? "آخر تعديل" : "Updated At"}
              value={
                selectedDepartment?.updatedAt
                  ? formatDate(selectedDepartment.updatedAt)
                  : "-"
              }
            />
          </div>

          {selectedDepartment?.description && (
            <div className={`${theme.cardSoft} p-4 mt-5`}>
              <p className="text-sm text-[var(--color-text-muted)] mb-1">
                {currentLang === "ar" ? "الوصف" : "Description"}
              </p>
              <p className="text-[var(--color-text)] leading-relaxed">
                {selectedDepartment.description}
              </p>
            </div>
          )}
        </div>

        <div className={`${theme.card} p-6`}>
          <h2 className="text-xl font-bold text-[var(--color-text)] mb-5 flex items-center gap-2">
            <Shield className="w-5 h-5 text-violet-500" />
            {currentLang === "ar" ? "إجراءات سريعة" : "Quick Actions"}
          </h2>

          <div className="space-y-3">
            {canManageDepartment && roleName !== "Category Head" && (
              <Link
                to={`/admin-panel/department/edit/${selectedDepartment?.id}`}
                className="block"
              >
                <button
                  type="button"
                  className={`${defaultButtonClass} w-full`}
                >
                  <Edit size={16} />
                  {currentLang === "ar" ? "تعديل القسم" : "Edit Department"}
                </button>
              </Link>
            )}

            <button
              type="button"
              onClick={() => setActiveTab("manager")}
              className={`${defaultButtonClass} w-full`}
            >
              <UserCog size={16} />
              {currentLang === "ar" ? "إدارة المدير" : "Manage Manager"}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("rosters")}
              className={`${defaultButtonClass} w-full`}
            >
              <CalendarDays size={16} />
              {currentLang === "ar" ? "روسترات القسم" : "Department Rosters"}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("geofence")}
              className={`${defaultButtonClass} w-full`}
            >
              <MapPin size={16} />
              GeoFence
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  const renderCategoriesTab = () => (
    <div className="space-y-5">
      <div className={`${theme.card} p-4`}>
        <h2 className="text-xl font-bold text-[var(--color-text)] flex items-center gap-2">
          <Link2 className="w-5 h-5 text-blue-500" />
          {currentLang === "ar" ? "التخصصات المرتبطة" : "Linked Categories"}
        </h2>

        <p className="text-sm text-[var(--color-text-muted)] mt-1">
          {currentLang === "ar"
            ? "التخصصات التي تستخدم هذا القسم داخل الروسترات والجداول."
            : "Categories currently linked to this department."}
        </p>
      </div>

      {loadingGetDepartmentCategories ? (
        <InlineLoader
          text={
            currentLang === "ar"
              ? "جاري تحميل التخصصات..."
              : "Loading categories..."
          }
        />
      ) : departmentCategoriesError ? (
        <div className={`${theme.card} p-6 text-red-500`}>
          {departmentCategoriesError?.message}
        </div>
      ) : linkedCategories.length === 0 ? (
        <EmptyState
          icon={Link2}
          title={
            currentLang === "ar"
              ? "لا توجد تخصصات مرتبطة"
              : "No linked categories"
          }
          description={
            currentLang === "ar"
              ? "هذا القسم غير مرتبط بأي تخصص حتى الآن."
              : "This department is not linked to any category yet."
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {linkedCategories.map((category, index) => {
            const categoryId = category.id || category.categoryId

            return (
              <div key={`${categoryId}-${index}`} className={`${theme.card} p-5`}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-extrabold text-[var(--color-text)]">
                      {getCategoryName(category)}
                    </h3>

                    <p className="text-xs text-[var(--color-text-muted)] mt-1 font-mono">
                      {category.code || category.categoryCode || "-"}
                    </p>
                  </div>

                  {categoryId && (
                    <Link to={`/admin-panel/category/${categoryId}`}>
                      <button
                        type="button"
                        className={iconButtonClass}
                      >
                        <Eye size={16} />
                      </button>
                    </Link>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )

  const renderManagerTab = () => {
    const manager =
      selectedDepartment?.manager || selectedDepartment?.departmentManager

    return (
      <div className="space-y-5">
        <div className={`${theme.card} p-4`}>
          <h2 className="text-xl font-bold text-[var(--color-text)] flex items-center gap-2">
            <UserCog className="w-5 h-5 text-violet-500" />
            {currentLang === "ar" ? "مدير القسم" : "Department Manager"}
          </h2>

          <p className="text-sm text-[var(--color-text-muted)] mt-1">
            {currentLang === "ar"
              ? "إدارة مدير القسم وصلاحياته."
              : "Manage the department manager and permissions."}
          </p>
        </div>

        {hasManager && manager ? (
          <div className={`${theme.card} p-6`}>
            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 mb-6">
              <div>
                <h3 className="text-2xl font-extrabold text-[var(--color-text)]">
                  {getManagerName()}
                </h3>

                <p className="text-sm text-[var(--color-text-muted)] mt-2">
                  {manager.email || manager.mobile || "-"}
                </p>

                {manager.startDate && (
                  <p className="text-sm text-[var(--color-text-muted)] mt-2">
                    {currentLang === "ar" ? "تاريخ البداية" : "Start Date"}:{" "}
                    <span className="font-bold text-[var(--color-text)]">
                      {formatDate(manager.startDate)}
                    </span>
                  </p>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                {canManageManager && (
                  <>
                    <button
                      type="button"
                      onClick={handleAssignManager}
                      className={defaultButtonClass}
                    >
                      <UserPlus size={16} />
                      {currentLang === "ar" ? "تغيير المدير" : "Change Manager"}
                    </button>

                    <button
                      type="button"
                      onClick={handleRemoveManager}
                      className={dangerButtonClass}
                    >
                      <UserX size={16} />
                      {currentLang === "ar" ? "إزالة المدير" : "Remove Manager"}
                    </button>
                  </>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <PermissionItem
                enabled={manager.canViewDepartment}
                icon={Eye}
                label={currentLang === "ar" ? "عرض القسم" : "View Department"}
              />

              <PermissionItem
                enabled={manager.canEditDepartment}
                icon={Edit}
                label={currentLang === "ar" ? "تعديل القسم" : "Edit Department"}
              />

              <PermissionItem
                enabled={manager.canViewDepartmentReports}
                icon={Shield}
                label={currentLang === "ar" ? "عرض التقارير" : "View Reports"}
              />

              <PermissionItem
                enabled={manager.canManageSchedules}
                icon={CalendarDays}
                label={currentLang === "ar" ? "إدارة الجداول" : "Manage Schedules"}
              />

              <PermissionItem
                enabled={manager.canManageStaff}
                icon={UserCog}
                label={currentLang === "ar" ? "إدارة العاملين" : "Manage Staff"}
              />
            </div>

            {manager.notes && (
              <div className={`${theme.cardSoft} p-4 mt-5`}>
                <p className="text-sm text-[var(--color-text-muted)] mb-1">
                  {currentLang === "ar" ? "ملاحظات" : "Notes"}
                </p>
                <p className="text-[var(--color-text)]">{manager.notes}</p>
              </div>
            )}
          </div>
        ) : (
          <EmptyState
            icon={UserPlus}
            title={
              currentLang === "ar"
                ? "لا يوجد مدير للقسم"
                : "No manager assigned"
            }
            description={
              currentLang === "ar"
                ? "يمكنك تعيين مدير لهذا القسم من هنا."
                : "You can assign a manager for this department from here."
            }
          />
        )}

        {!hasManager && canManageManager && (
          <div className={`${theme.card} p-5 text-center`}>
            <button
              type="button"
              onClick={handleAssignManager}
              className={defaultButtonClass}
            >
              <UserPlus size={16} />
              {currentLang === "ar" ? "تعيين مدير" : "Assign Manager"}
            </button>
          </div>
        )}
      </div>
    )
  }

  const renderRostersTab = () => (
    <div className="space-y-5">
      <div className={`${theme.card} p-4`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-[var(--color-text)] flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-amber-500" />
              {currentLang === "ar"
                ? "شهور وروسترات القسم"
                : "Department Months & Rosters"}
            </h2>

            <p className="text-sm text-[var(--color-text-muted)] mt-1">
              {currentLang === "ar"
                ? "هذه البيانات تأتي مباشرة من DepartmentManager months-list."
                : "This data comes directly from the DepartmentManager months-list endpoint."}
            </p>
          </div>

          <button
            type="button"
            onClick={() => dispatch(getDepartmentMonthList({ departmentId: id }))}
            className={defaultButtonClass}
          >
            <RefreshCw size={16} />
            {currentLang === "ar" ? "تحديث" : "Refresh"}
          </button>
        </div>
      </div>

      {loadingGetDepartmentMonthList ? (
        <InlineLoader
          text={
            currentLang === "ar"
              ? "جاري تحميل شهور القسم..."
              : "Loading department months..."
          }
        />
      ) : departmentMonthListError ? (
        <div className={`${theme.card} p-6 text-red-500`}>
          {departmentMonthListError?.message ||
            (currentLang === "ar"
              ? "تعذر تحميل شهور القسم"
              : "Failed to load department months")}
        </div>
      ) : safeMonthList.length === 0 ? (
        <EmptyState
          icon={CalendarDays}
          title={currentLang === "ar" ? "لا توجد شهور" : "No months found"}
          description={
            currentLang === "ar"
              ? "لا توجد روسترات أو شهور متاحة لهذا القسم."
              : "There are no available months or rosters for this department."
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {safeMonthList.map((item, index) => {
            const completion = Number(item.completionPercentage || 0)
            const tone = getCompletionTone(completion)
            const shortfall = Number(item.shortfallDoctors || 0)

            return (
              <button
                type="button"
                key={`${item.month}-${item.year}-${index}`}
                onClick={() => openDepartmentMonth(item)}
                className={`${theme.card} p-5 text-start border border-[var(--color-border)] hover:border-[var(--color-success)] hover:shadow-md transition-all`}
              >
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div>
                    <h3 className="text-lg font-extrabold text-[var(--color-text)]">
                      {getMonthName(item)}
                    </h3>

                    <p className="text-xs text-[var(--color-text-muted)] mt-1">
                      {currentLang === "ar" ? "آخر تحديث" : "Last Updated"}:{" "}
                      {item.lastUpdatedAt ? formatDate(item.lastUpdatedAt) : "-"}
                    </p>
                  </div>

                  <Eye className="w-5 h-5 text-blue-500" />
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <MiniMonthStat
                    label={currentLang === "ar" ? "تخصصات" : "Categories"}
                    value={item.categoriesCount || 0}
                  />

                  <MiniMonthStat
                    label={currentLang === "ar" ? "روسترات" : "Rosters"}
                    value={item.rostersCount || 0}
                  />

                  <MiniMonthStat
                    label={currentLang === "ar" ? "شفتات" : "Shifts"}
                    value={item.shiftsCount || 0}
                  />

                  <MiniMonthStat
                    label={currentLang === "ar" ? "مطلوب" : "Required"}
                    value={item.requiredDoctors || 0}
                  />

                  <MiniMonthStat
                    label={currentLang === "ar" ? "معين" : "Assigned"}
                    value={item.assignedDoctors || 0}
                  />

                  <MiniMonthStat
                    label={currentLang === "ar" ? "النقص" : "Shortfall"}
                    value={shortfall}
                    valueClass={
                      shortfall > 0
                        ? "text-red-500"
                        : "text-emerald-500"
                    }
                  />
                </div>

                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-[var(--color-text-muted)]">
                    {currentLang === "ar" ? "الإكتمال" : "Completion"}
                  </span>

                  <span className={`text-xs font-extrabold ${tone.text}`}>
                    {completion}%
                  </span>
                </div>

                <div className="w-full h-2 rounded-full bg-[var(--color-bg-soft)] overflow-hidden">
                  <div
                    className={`h-full rounded-full ${tone.bar}`}
                    style={{ width: `${Math.min(completion, 100)}%` }}
                  />
                </div>

                {shortfall > 0 && (
                  <div className="mt-4 flex items-start gap-2 text-xs text-amber-500">
                    <AlertTriangle size={15} className="mt-0.5" />
                    <span>
                      {currentLang === "ar"
                        ? `يوجد نقص ${shortfall} طبيب في هذا الشهر.`
                        : `There is a shortfall of ${shortfall} doctors this month.`}
                    </span>
                  </div>
                )}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )

  const renderGeoFenceTab = () => (
    <div className="space-y-5">
      {getDepartmentGeoFencesError && (
        <div className={`${theme.card} p-4 text-red-500`}>
          {getDepartmentGeoFencesError?.message}
        </div>
      )}

      <DepartmentGeoFences
        geofences={geofences}
        loadingGetDepartmentGeofences={loadingGetDepartmentGeofences}
        loadingDeleteGeoFence={loadingDeleteGeoFence}
        departmentId={selectedDepartment?.id}
        isRTL={isRTL}
        currentLang={currentLang}
        loginRoleResponseDto={loginRoleResponseDto}
        onNavigate={navigate}
        formatDate={formatDate}
      />
    </div>
  )

  if (isForbiddenForDepartmentManager || isForbiddenForCategoryHead) {
    return <Forbidden />
  }

  if (loadingGetSingleDepartment) {
    return (
      <div className={theme.page} dir={isRTL ? "rtl" : "ltr"}>
        <div className="max-w-7xl mx-auto">
          <InlineLoader
            text={
              currentLang === "ar"
                ? "جاري تحميل بيانات القسم..."
                : "Loading department data..."
            }
          />
        </div>
      </div>
    )
  }

  if (singleDepartmentError) {
    return (
      <div className={theme.page} dir={isRTL ? "rtl" : "ltr"}>
        <div className="max-w-5xl mx-auto">
          <div className={`${theme.card} p-8 text-center`}>
            <XCircle className="w-14 h-14 text-red-500 mx-auto mb-4" />

            <h2 className="text-2xl font-bold text-[var(--color-text)] mb-2">
              {currentLang === "ar"
                ? "تعذر تحميل القسم"
                : "Failed to load department"}
            </h2>

            <p className="text-[var(--color-text-muted)] mb-6">
              {singleDepartmentError?.message || "-"}
            </p>

            {roleName === "System Administrator" && (
              <button
                type="button"
                onClick={() => navigate("/admin-panel/departments")}
                className={defaultButtonClass}
              >
                {isRTL ? <ArrowRight size={16} /> : <ArrowLeft size={16} />}
                {currentLang === "ar" ? "رجوع للأقسام" : "Back to Departments"}
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  if (!selectedDepartment) {
    return (
      <div className={theme.page} dir={isRTL ? "rtl" : "ltr"}>
        <div className="max-w-5xl mx-auto">
          <EmptyState
            icon={Building2}
            title={
              currentLang === "ar" ? "القسم غير موجود" : "Department not found"
            }
            description={
              currentLang === "ar"
                ? "لم يتم العثور على بيانات لهذا القسم."
                : "No data was found for this department."
            }
          />
        </div>
      </div>
    )
  }

  return (
    <div className={theme.page} dir={isRTL ? "rtl" : "ltr"}>
      <div className="max-w-7xl mx-auto space-y-6">
        <RemoveManagerModal
          isOpen={showRemoveManagerModal}
          onClose={() => setShowRemoveManagerModal(false)}
          departmentInfo={{
            id: selectedDepartment?.id,
            name: getDepartmentName(),
            userId: selectedDepartment?.manager?.userId,
          }}
          managerName={getManagerName()}
        />

        <div className="flex items-center justify-between gap-4 flex-wrap">
          {roleName === "System Administrator" && (
            <button
              type="button"
              onClick={() => navigate("/admin-panel/departments")}
              className="inline-flex items-center gap-2 text-sm font-bold text-[var(--color-text-muted)] hover:text-emerald-500"
            >
              {isRTL ? <ArrowRight size={16} /> : <ArrowLeft size={16} />}
              {currentLang === "ar" ? "رجوع للأقسام" : "Back to Departments"}
            </button>
          )}

          <div className="flex items-center gap-2 ms-auto">
            <button
              type="button"
              onClick={refreshData}
              className={defaultButtonClass}
            >
              <RefreshCw size={16} />
              {currentLang === "ar" ? "تحديث" : "Refresh"}
            </button>

            {canManageDepartment && roleName !== "Category Head" && (
              <Link to={`/admin-panel/department/edit/${selectedDepartment.id}`}>
                <button type="button" className={defaultButtonClass}>
                  <Edit size={16} />
                  {currentLang === "ar" ? "تعديل" : "Edit"}
                </button>
              </Link>
            )}
          </div>
        </div>

        <div className={`${theme.card} p-6`}>
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-[var(--color-primary-soft)] text-blue-500 flex items-center justify-center">
                <Building2 className="w-7 h-7" />
              </div>

              <div>
                <p className="text-sm font-bold text-[var(--color-text-muted)] mb-1">
                  {(roleName === "Department Head" ||
                    roleName === "Department Manager") &&
                    t("common.now_manage_dep")}
                </p>

                <h1 className="text-3xl font-extrabold text-[var(--color-text)]">
                  {currentLang === "en" && ` ${t("common.public") || ""}`}
                  {getDepartmentName()}
                  {currentLang === "ar" && ` ${t("common.public") || ""}`}
                </h1>

                <p className="text-sm text-[var(--color-text-muted)] mt-2">
                  {getDepartmentSubName()}
                </p>

                <div className="flex flex-wrap items-center gap-3 mt-3">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-[var(--color-bg-soft)] text-[var(--color-text-muted)] border border-[var(--color-border)]">
                    {selectedDepartment.code || "-"}
                  </span>

                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold border ${
                      selectedDepartment.isActive
                        ? theme.successBadge
                        : theme.dangerBadge
                    }`}
                  >
                    {selectedDepartment.isActive
                      ? currentLang === "ar"
                        ? "نشط"
                        : "Active"
                      : currentLang === "ar"
                      ? "غير نشط"
                      : "Inactive"}
                  </span>

                  {hasManager && (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-[var(--color-purple-soft)] text-violet-500 border border-[var(--color-purple-border)]">
                      {getManagerName()}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 min-w-[280px]">
              <div className={`${theme.cardSoft} p-3 text-center`}>
                <p className="text-2xl font-extrabold text-[var(--color-text)]">
                  {overviewStats.categories}
                </p>
                <p className="text-xs text-[var(--color-text-muted)]">
                  {currentLang === "ar" ? "تخصصات" : "Categories"}
                </p>
              </div>

              <div className={`${theme.cardSoft} p-3 text-center`}>
                <p className="text-2xl font-extrabold text-[var(--color-text)]">
                  {overviewStats.geofences}
                </p>
                <p className="text-xs text-[var(--color-text-muted)]">
                  GeoFence
                </p>
              </div>

              <div className={`${theme.cardSoft} p-3 text-center`}>
                <p className="text-2xl font-extrabold text-[var(--color-text)]">
                  {overviewStats.months}
                </p>
                <p className="text-xs text-[var(--color-text-muted)]">
                  {currentLang === "ar" ? "شهور" : "Months"}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className={`${theme.card} p-4`}>
          <div className="flex flex-wrap gap-2">
            <TabButton
              id="overview"
              icon={BarChart3}
              label={currentLang === "ar" ? "نظرة عامة" : "Overview"}
            />

            <TabButton
              id="categories"
              icon={Link2}
              label={currentLang === "ar" ? "التخصصات" : "Categories"}
              count={overviewStats.categories}
            />

            <TabButton
              id="manager"
              icon={UserCog}
              label={currentLang === "ar" ? "المدير" : "Manager"}
              count={overviewStats.manager}
            />

            <TabButton
              id="rosters"
              icon={CalendarDays}
              label={currentLang === "ar" ? "الروسترات" : "Rosters"}
              count={overviewStats.months}
            />

            <TabButton
              id="geofence"
              icon={MapPin}
              label="GeoFence"
              count={overviewStats.geofences}
            />
          </div>
        </div>

        {activeTab === "overview" && renderOverviewTab()}
        {activeTab === "categories" && renderCategoriesTab()}
        {activeTab === "manager" && renderManagerTab()}
        {activeTab === "rosters" && renderRostersTab()}
        {activeTab === "geofence" && renderGeoFenceTab()}
      </div>
    </div>
  )
}

function MiniMonthStat({
  label,
  value,
  valueClass = "text-[var(--color-text)]",
}) {
  return (
    <div className="p-3 rounded-xl bg-[var(--color-bg-soft)] border border-[var(--color-border)]">
      <p className="text-[11px] font-bold text-[var(--color-text-muted)] mb-1">
        {label}
      </p>
      <p className={`text-sm font-extrabold ${valueClass}`}>{value ?? 0}</p>
    </div>
  )
}

export default SpecificDepartment