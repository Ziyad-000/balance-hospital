import React, { useCallback, useEffect, useMemo, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useTranslation } from "react-i18next"
import { Link } from "react-router-dom"
import {
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Eye,
  Edit,
  Trash2,
  Plus,
  X,
  RefreshCw,
  Building2,
  Building,
  Link2,
  UserCheck,
  Users,
  CheckCircle,
  XCircle,
  MapPin,
  Shield,
  Hash,
  Calendar,
  SlidersHorizontal,
} from "lucide-react"

import { getDepartments } from "../../../state/act/actDepartment"
import { getCategories } from "../../../state/act/actCategory"
import {
  clearError,
  clearFilters,
  setCurrentPage,
  setFilters,
  setPageSize,
} from "../../../state/slices/department"

import DeleteDepartmentModal from "../../../components/modals/DeleteDepartmentModal"
import { formatDate } from "../../../utils/formtDate"
import { getPageTheme } from "../../../utils/themeClasses"

function Department() {
  const { t, i18n } = useTranslation()
  const dispatch = useDispatch()
  const theme = getPageTheme()

  const [modalOpen, setModalOpen] = useState(false)
  const [toDelete, setToDelete] = useState({ id: null, name: "" })
  const [searchInput, setSearchInput] = useState("")
  const [showFilters, setShowFilters] = useState(false)
  const [searchTimeout, setSearchTimeout] = useState(null)

  const {
    departments,
    pagination,
    filters,
    loadingGetDepartments,
    error,
  } = useSelector((state) => state.department)

  const { categories } = useSelector((state) => state.category)

  const currentLang = i18n.language || "ar"
  const isRTL = currentLang === "ar"

  const safeDepartments = Array.isArray(departments) ? departments : []
  const safeCategories = Array.isArray(categories) ? categories : []

  useEffect(() => {
    setSearchInput(filters?.search || "")
  }, [filters?.search])

  useEffect(() => {
    dispatch(
      getDepartments({
        ...filters,
        includeManager: true,
        includeCategories: true,
        includeStatistics: true,
      })
    )
  }, [dispatch, filters])

  useEffect(() => {
    dispatch(
      getCategories({
        page: 1,
        pageSize: 200,
        isActive: true,
        includeStatistics: true,
        includeDepartments: true,
      })
    )
  }, [dispatch])

  const summary = useMemo(() => {
    const total = pagination?.totalCount || safeDepartments.length || 0

    const active = safeDepartments.filter((department) => department.isActive).length
    const inactive = safeDepartments.filter((department) => !department.isActive).length

    const withManagers = safeDepartments.filter((department) =>
      Boolean(
        department.manager ||
          department.managerName ||
          department.managerNameAr ||
          department.managerNameEn ||
          department.departmentManager
      )
    ).length

    const withoutManagers = safeDepartments.filter(
      (department) =>
        !department.manager &&
        !department.managerName &&
        !department.managerNameAr &&
        !department.managerNameEn &&
        !department.departmentManager
    ).length

    const linkedCategories = safeDepartments.reduce((sum, department) => {
      return sum + Number(getLinkedCategoriesCount(department))
    }, 0)

    const unlinked = safeDepartments.filter(
      (department) => Number(getLinkedCategoriesCount(department)) === 0
    ).length

    return {
      total,
      active,
      inactive,
      withManagers,
      withoutManagers,
      linkedCategories,
      unlinked,
    }
  }, [safeDepartments, pagination])

  const handleSearchChange = useCallback(
    (value) => {
      setSearchInput(value)

      if (searchTimeout) {
        clearTimeout(searchTimeout)
      }

      const timeout = setTimeout(() => {
        dispatch(setFilters({ search: value, page: 1 }))
      }, 450)

      setSearchTimeout(timeout)
    },
    [dispatch, searchTimeout]
  )

  const handleFilterChange = (key, value) => {
    dispatch(setFilters({ [key]: value, page: 1 }))
  }

  const handleClearFilters = () => {
    dispatch(clearFilters())
    setSearchInput("")
  }

  const handlePageChange = (page) => {
    dispatch(setCurrentPage(page))
  }

  const handlePageSizeChange = (pageSize) => {
    dispatch(setPageSize(Number(pageSize)))
  }

  const refreshData = () => {
    dispatch(
      getDepartments({
        ...filters,
        includeManager: true,
        includeCategories: true,
        includeStatistics: true,
      })
    )
  }

  const getDepartmentName = (department) => {
    return currentLang === "ar"
      ? department.nameArabic ||
          department.nameAr ||
          department.departmentNameAr ||
          department.nameEnglish ||
          department.nameEn ||
          department.departmentNameEn ||
          "-"
      : department.nameEnglish ||
          department.nameEn ||
          department.departmentNameEn ||
          department.nameArabic ||
          department.nameAr ||
          department.departmentNameAr ||
          "-"
  }

  const getDepartmentSubName = (department) => {
    return currentLang === "ar"
      ? department.nameEnglish ||
          department.nameEn ||
          department.departmentNameEn ||
          "-"
      : department.nameArabic ||
          department.nameAr ||
          department.departmentNameAr ||
          "-"
  }

  const getManagerName = (department) => {
    const manager = department.manager || department.departmentManager

    if (manager) {
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

    return currentLang === "ar"
      ? department.managerNameAr ||
          department.managerNameArabic ||
          department.managerName ||
          department.managerNameEn ||
          "-"
      : department.managerNameEn ||
          department.managerNameEnglish ||
          department.managerName ||
          department.managerNameAr ||
          "-"
  }

  function getLinkedCategoriesCount(department) {
    if (Array.isArray(department.linkedCategories)) {
      return department.linkedCategories.length
    }

    if (Array.isArray(department.categories)) {
      return department.categories.length
    }

    return (
      department.linkedCategoriesCount ??
      department.categoriesCount ??
      department.categoryCount ??
      0
    )
  }

  const getGeoFenceCount = (department) => {
    if (Array.isArray(department.geofences)) return department.geofences.length

    return (
      department.geofencesCount ??
      department.geoFencesCount ??
      department.geoFenceCount ??
      department.geofenceCount ??
      0
    )
  }

  const getCategoryNames = (department) => {
    const list = department.linkedCategories || department.categories || []

    if (!Array.isArray(list) || list.length === 0) return "-"

    return list
      .slice(0, 2)
      .map((category) =>
        currentLang === "ar"
          ? category.nameArabic ||
            category.categoryNameArabic ||
            category.nameAr ||
            category.nameEnglish ||
            category.categoryNameEnglish ||
            "-"
          : category.nameEnglish ||
            category.categoryNameEnglish ||
            category.nameEn ||
            category.nameArabic ||
            category.categoryNameArabic ||
            "-"
      )
      .join("، ")
  }

  const getPageNumbers = () => {
    const totalPages = pagination?.totalPages || 1
    const currentPage = pagination?.page || 1
    const pages = []

    const maxPages = 5
    let startPage = Math.max(1, currentPage - Math.floor(maxPages / 2))
    let endPage = Math.min(totalPages, startPage + maxPages - 1)

    if (endPage - startPage < maxPages - 1) {
      startPage = Math.max(1, endPage - maxPages + 1)
    }

    for (let page = startPage; page <= endPage; page++) {
      pages.push(page)
    }

    return pages
  }

  const hasPrevious =
    pagination?.hasPreviousPage ?? pagination?.hasPrevious ?? pagination?.page > 1

  const hasNext =
    pagination?.hasNextPage ??
    pagination?.hasNext ??
    pagination?.page < pagination?.totalPages

  const defaultButtonClass =
    "inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border bg-[var(--color-surface)] text-[var(--color-text)] border-[var(--color-border-strong)] hover:bg-[var(--color-success)] hover:text-white hover:border-[var(--color-success)] active:bg-[var(--color-success-hover)] active:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"

  const selectedButtonClass =
    "inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border bg-[var(--color-success)] text-white border-[var(--color-success)] transition-colors"

  const iconButtonClass =
    "p-2 rounded-lg border border-[var(--color-border-strong)] bg-[var(--color-surface)] text-[var(--color-text)] hover:bg-[var(--color-success)] hover:text-white hover:border-[var(--color-success)] active:bg-[var(--color-success-hover)] active:text-white transition-colors"

  const dangerIconButtonClass =
    "p-2 rounded-lg border border-[var(--color-border-strong)] bg-[var(--color-surface)] text-[var(--color-danger)] hover:bg-[var(--color-danger)] hover:text-white hover:border-[var(--color-danger)] transition-colors"

  const inputClass =
    "w-full px-3 py-2 rounded-lg bg-[var(--color-surface)] text-[var(--color-text)] border border-[var(--color-border-strong)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-soft)] focus:border-[var(--color-primary)] transition-colors"

  const searchInputClass =
    "w-full px-4 py-3 rounded-xl bg-[var(--color-surface)] text-[var(--color-text)] border border-[var(--color-border-strong)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-soft)] focus:border-[var(--color-primary)] transition-colors"

  const SummaryCard = ({ icon: Icon, title, value, tone = "blue" }) => {
    const toneMap = {
      blue: {
        bg: "bg-[var(--color-primary-soft)]",
        text: "text-[var(--color-primary)]",
        border: "border-[var(--color-primary)]/25",
      },
      green: {
        bg: "bg-[var(--color-success-soft)]",
        text: "text-[var(--color-success)]",
        border: "border-[var(--color-success-border)]",
      },
      red: {
        bg: "bg-[var(--color-danger-soft)]",
        text: "text-[var(--color-danger)]",
        border: "border-[var(--color-danger-border)]",
      },
      yellow: {
        bg: "bg-[var(--color-warning-soft)]",
        text: "text-[var(--color-warning)]",
        border: "border-[var(--color-warning-border)]",
      },
      purple: {
        bg: "bg-[var(--color-purple-soft)]",
        text: "text-[var(--color-purple)]",
        border: "border-[var(--color-purple-border)]",
      },
      orange: {
        bg: "bg-[var(--color-warning-soft)]",
        text: "text-[var(--color-warning)]",
        border: "border-[var(--color-warning-border)]",
      },
    }

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

  const StatusBadge = ({ active }) => (
    <span
      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border ${
        active ? "bg-[var(--color-success-soft)] text-[var(--color-success)] border-[var(--color-success-border)]" : "bg-[var(--color-danger-soft)] text-[var(--color-danger)] border-[var(--color-danger-border)]"
      }`}
    >
      {active ? <CheckCircle size={13} /> : <XCircle size={13} />}
      {active
        ? t("department.status.active") || "Active"
        : t("department.status.inactive") || "Inactive"}
    </span>
  )

  const ManagerBadge = ({ department }) => {
    const managerName = getManagerName(department)
    const hasManager = managerName && managerName !== "-"

    return (
      <span
        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border ${
          hasManager
            ? "bg-[var(--color-purple-soft)] text-[var(--color-purple)] border-[var(--color-purple-border)]"
            : "bg-[var(--color-neutral-soft)] text-[var(--color-neutral)] border-[var(--color-neutral-border)]"
        }`}
      >
        <UserCheck size={13} />
        {hasManager
          ? managerName
          : currentLang === "ar"
          ? "بدون مدير"
          : "No Manager"}
      </span>
    )
  }

  const DepartmentMobileCard = ({ department }) => (
    <div className={`${theme.card} p-4`}>
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 rounded-xl bg-[var(--color-primary-soft)] text-[var(--color-primary)] flex items-center justify-center">
            <Building2 size={22} />
          </div>

          <div>
            <h3 className="font-extrabold text-[var(--color-text)]">
              {getDepartmentName(department)}
            </h3>
            <p className="text-sm text-[var(--color-text-muted)] mt-1">
              {getDepartmentSubName(department)}
            </p>

            <p className="text-xs text-[var(--color-text-muted)] mt-1 font-mono">
              {department.code || "-"}
            </p>
          </div>
        </div>

        <StatusBadge active={department.isActive} />
      </div>

      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className={`${theme.cardSoft} p-3 text-center`}>
          <Link2 className="w-4 h-4 mx-auto mb-1 text-[var(--color-primary)]" />
          <p className="font-bold text-[var(--color-text)]">
            {getLinkedCategoriesCount(department)}
          </p>
          <p className="text-[10px] text-[var(--color-text-muted)]">
            {currentLang === "ar" ? "تخصصات" : "Categories"}
          </p>
        </div>

        <div className={`${theme.cardSoft} p-3 text-center`}>
          <Shield className="w-4 h-4 mx-auto mb-1 text-[var(--color-purple)]" />
          <p className="font-bold text-[var(--color-text)]">
            {getManagerName(department) !== "-" ? 1 : 0}
          </p>
          <p className="text-[10px] text-[var(--color-text-muted)]">
            {currentLang === "ar" ? "مدير" : "Manager"}
          </p>
        </div>

        <div className={`${theme.cardSoft} p-3 text-center`}>
          <MapPin className="w-4 h-4 mx-auto mb-1 text-[var(--color-success)]" />
          <p className="font-bold text-[var(--color-text)]">
            {getGeoFenceCount(department)}
          </p>
          <p className="text-[10px] text-[var(--color-text-muted)]">
            GeoFence
          </p>
        </div>
      </div>

      <div className={`${theme.cardSoft} p-3 mb-4`}>
        <p className="text-xs text-[var(--color-text-muted)] mb-1">
          {currentLang === "ar" ? "المدير" : "Manager"}
        </p>
        <p className="text-sm font-bold text-[var(--color-text)]">
          {getManagerName(department)}
        </p>
      </div>

      <div className="flex items-center justify-between gap-3 pt-3 border-t border-[var(--color-border)]">
        <p className="text-xs text-[var(--color-text-muted)]">
          {formatDate(department.createdAt)}
        </p>

        <div className="flex gap-2">
          <Link to={`/admin-panel/department/${department.id}`}>
            <button
              type="button"
              className={iconButtonClass}
            >
              <Eye size={16} />
            </button>
          </Link>

          <Link to={`/admin-panel/department/edit/${department.id}`}>
            <button
              type="button"
              className={iconButtonClass}
            >
              <Edit size={16} />
            </button>
          </Link>

          <button
            type="button"
            className={dangerIconButtonClass}
            onClick={() => {
              setToDelete({
                id: department.id,
                name: getDepartmentName(department),
              })
              setModalOpen(true)
            }}
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  )

  const tableHeadClass =
    "px-4 py-3 text-sm font-bold text-[var(--color-text)] border-b border-[var(--color-border)] whitespace-nowrap"

  const tableCellClass =
    "px-4 py-4 text-sm text-[var(--color-text)] border-b border-[var(--color-border)] align-middle"

  return (
    <div className={theme.page} dir={isRTL ? "rtl" : "ltr"}>
      <DeleteDepartmentModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        departmentId={toDelete.id}
        info={toDelete}
        departmentName={toDelete.name}
      />

      <div className="p-4 sm:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-extrabold text-[var(--color-text)] flex items-center gap-3">
                <span className="w-12 h-12 rounded-2xl bg-[var(--color-primary-soft)] text-[var(--color-primary)] flex items-center justify-center">
                  <Building2 className="w-7 h-7" />
                </span>
                {t("department.title") || "Departments"}
              </h1>

              <p className="text-sm text-[var(--color-text-muted)] mt-2">
                {currentLang === "ar"
                  ? "إدارة الأقسام، المديرين، التخصصات المرتبطة، ونطاقات الحضور."
                  : "Manage departments, managers, linked categories, and attendance geofences."}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={refreshData}
                className={defaultButtonClass}
              >
                <RefreshCw size={16} />
                {currentLang === "ar" ? "تحديث" : "Refresh"}
              </button>

              <Link to="/admin-panel/department/create">
                <button type="button" className={`${defaultButtonClass} gap-2`}>
                  <Plus size={18} />
                  {"Add Department"}
                </button>
              </Link>
            </div>
          </div>

          {error && (
            <div className={`${theme.card} p-4 mb-5 border-[var(--color-danger-border)]`}>
              <div className="flex items-center justify-between gap-3">
                <p className="text-[var(--color-danger)] text-sm font-semibold">
                  {error.message || String(error)}
                </p>

                <button
                  type="button"
                  onClick={() => dispatch(clearError())}
                  className="text-[var(--color-danger)]"
                >
                  <X size={18} />
                </button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-7 gap-4 mb-6">
            <SummaryCard
              icon={Building2}
              title={currentLang === "ar" ? "إجمالي الأقسام" : "Departments"}
              value={summary.total}
              tone="blue"
            />

            <SummaryCard
              icon={CheckCircle}
              title={currentLang === "ar" ? "نشطة" : "Active"}
              value={summary.active}
              tone="green"
            />

            <SummaryCard
              icon={XCircle}
              title={currentLang === "ar" ? "غير نشطة" : "Inactive"}
              value={summary.inactive}
              tone="red"
            />

            <SummaryCard
              icon={UserCheck}
              title={currentLang === "ar" ? "لها مدير" : "With Manager"}
              value={summary.withManagers}
              tone="purple"
            />

            <SummaryCard
              icon={Shield}
              title={currentLang === "ar" ? "بدون مدير" : "No Manager"}
              value={summary.withoutManagers}
              tone="yellow"
            />

            <SummaryCard
              icon={Link2}
              title={currentLang === "ar" ? "روابط تخصصات" : "Category Links"}
              value={summary.linkedCategories}
              tone="orange"
            />

            <SummaryCard
              icon={Building}
              title={currentLang === "ar" ? "غير مرتبطة" : "Unlinked"}
              value={summary.unlinked}
              tone="red"
            />
          </div>

          <div className={`${theme.card} p-4 mb-6`}>
            <div className="flex flex-col xl:flex-row gap-4">
              <div className="flex-1 flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border-strong)] flex items-center justify-center text-[var(--color-text-muted)]">
                  <Search size={20} />
                </div>

                <input
                  type="text"
                  placeholder={
                    t("department.search.placeholder") ||
                    "Search by name, code, manager..."
                  }
                  value={searchInput}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className={searchInputClass}
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowFilters((prev) => !prev)}
                  className={`${defaultButtonClass} gap-2`}
                >
                  <SlidersHorizontal size={17} />
                  {t("department.filters.title") || "Filters"}
                </button>
              </div>
            </div>

            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-4 pt-4 mt-4 border-t border-[var(--color-border)]">
                <div>
                  <label className="block text-sm font-bold text-[var(--color-text)] mb-2">
                    {currentLang === "ar" ? "الكود" : "Code"}
                  </label>

                  <input
                    type="text"
                    value={filters?.code || ""}
                    onChange={(e) => handleFilterChange("code", e.target.value)}
                    className={inputClass}
                    placeholder="DEP-001"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-[var(--color-text)] mb-2">
                    {t("department.filters.status") || "Status"}
                  </label>

                  <select
                    value={filters?.isActive === "" ? "" : String(filters?.isActive)}
                    onChange={(e) => {
                      const value =
                        e.target.value === "" ? "" : e.target.value === "true"
                      handleFilterChange("isActive", value)
                    }}
                    className={inputClass}
                  >
                    <option value="">
                      {currentLang === "ar" ? "كل الحالات" : "All Status"}
                    </option>
                    <option value="true">
                      {t("department.status.active") || "Active"}
                    </option>
                    <option value="false">
                      {t("department.status.inactive") || "Inactive"}
                    </option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-[var(--color-text)] mb-2">
                    {currentLang === "ar" ? "المدير" : "Manager"}
                  </label>

                  <select
                    value={filters?.hasManager === "" ? "" : String(filters?.hasManager)}
                    onChange={(e) => {
                      const value =
                        e.target.value === "" ? "" : e.target.value === "true"
                      handleFilterChange("hasManager", value)
                    }}
                    className={inputClass}
                  >
                    <option value="">
                      {currentLang === "ar" ? "الكل" : "All"}
                    </option>
                    <option value="true">
                      {currentLang === "ar" ? "لها مدير" : "Has Manager"}
                    </option>
                    <option value="false">
                      {currentLang === "ar" ? "بدون مدير" : "No Manager"}
                    </option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-[var(--color-text)] mb-2">
                    {currentLang === "ar" ? "التخصص المرتبط" : "Linked Category"}
                  </label>

                  <select
                    value={filters?.linkedToCategoryId || ""}
                    onChange={(e) =>
                      handleFilterChange("linkedToCategoryId", e.target.value)
                    }
                    className={inputClass}
                  >
                    <option value="">
                      {currentLang === "ar" ? "كل التخصصات" : "All Categories"}
                    </option>

                    {safeCategories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {currentLang === "ar"
                          ? category.nameArabic || category.nameEnglish
                          : category.nameEnglish || category.nameArabic}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-[var(--color-text)] mb-2">
                    {currentLang === "ar" ? "الارتباط" : "Linking"}
                  </label>

                  <select
                    value={filters?.isUnlinked === "" ? "" : String(filters?.isUnlinked)}
                    onChange={(e) => {
                      const value =
                        e.target.value === "" ? "" : e.target.value === "true"
                      handleFilterChange("isUnlinked", value)
                    }}
                    className={inputClass}
                  >
                    <option value="">
                      {currentLang === "ar" ? "الكل" : "All"}
                    </option>
                    <option value="false">
                      {currentLang === "ar" ? "مرتبطة" : "Linked"}
                    </option>
                    <option value="true">
                      {currentLang === "ar" ? "غير مرتبطة" : "Unlinked"}
                    </option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-[var(--color-text)] mb-2">
                    {currentLang === "ar" ? "من تاريخ" : "Created From"}
                  </label>

                  <input
                    type="date"
                    value={filters?.createdFrom || ""}
                    onChange={(e) =>
                      handleFilterChange("createdFrom", e.target.value)
                    }
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-[var(--color-text)] mb-2">
                    {currentLang === "ar" ? "إلى تاريخ" : "Created To"}
                  </label>

                  <input
                    type="date"
                    value={filters?.createdTo || ""}
                    onChange={(e) =>
                      handleFilterChange("createdTo", e.target.value)
                    }
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-[var(--color-text)] mb-2">
                    {currentLang === "ar" ? "ترتيب حسب" : "Order By"}
                  </label>

                  <select
                    value={filters?.orderBy || "nameArabic"}
                    onChange={(e) => handleFilterChange("orderBy", e.target.value)}
                    className={inputClass}
                  >
                    <option value="nameArabic">
                      {currentLang === "ar" ? "الاسم العربي" : "Arabic Name"}
                    </option>
                    <option value="nameEnglish">
                      {currentLang === "ar" ? "الاسم الإنجليزي" : "English Name"}
                    </option>
                    <option value="code">
                      {currentLang === "ar" ? "الكود" : "Code"}
                    </option>
                    <option value="createdAt">
                      {currentLang === "ar" ? "تاريخ الإنشاء" : "Created At"}
                    </option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-[var(--color-text)] mb-2">
                    {currentLang === "ar" ? "الاتجاه" : "Direction"}
                  </label>

                  <select
                    value={String(filters?.orderDesc ?? true)}
                    onChange={(e) =>
                      handleFilterChange("orderDesc", e.target.value === "true")
                    }
                    className={inputClass}
                  >
                    <option value="true">
                      {currentLang === "ar" ? "تنازلي" : "Descending"}
                    </option>
                    <option value="false">
                      {currentLang === "ar" ? "تصاعدي" : "Ascending"}
                    </option>
                  </select>
                </div>

                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={handleClearFilters}
                    className={`${defaultButtonClass} w-full gap-2`}
                  >
                    <Filter size={16} />
                    {currentLang === "ar" ? "مسح الفلاتر" : "Clear Filters"}
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="md:hidden space-y-4">
            {loadingGetDepartments ? (
              <LoadingBlock
                text={t("gettingData.departments") || "Loading departments..."}
              />
            ) : safeDepartments.length === 0 ? (
              <EmptyBlock
                text={t("department.noData") || "No departments found"}
              />
            ) : (
              safeDepartments.map((department) => (
                <DepartmentMobileCard
                  key={department.id}
                  department={department}
                />
              ))
            )}
          </div>

          <div className={`${theme.card} hidden md:block overflow-hidden`}>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1200px]">
                <thead className="bg-[var(--color-surface-muted)]">
                  <tr>
                    <th className={`${tableHeadClass} text-center`}>
                      {currentLang === "ar" ? "الكود" : "Code"}
                    </th>

                    <th
                      className={`${tableHeadClass} ${
                        isRTL ? "text-right" : "text-left"
                      }`}
                    >
                      {currentLang === "ar" ? "القسم" : "Department"}
                    </th>

                    <th className={`${tableHeadClass} text-center`}>
                      {currentLang === "ar" ? "الحالة" : "Status"}
                    </th>

                    <th
                      className={`${tableHeadClass} ${
                        isRTL ? "text-right" : "text-left"
                      }`}
                    >
                      {currentLang === "ar" ? "المدير" : "Manager"}
                    </th>

                    <th className={`${tableHeadClass} text-center`}>
                      {currentLang === "ar" ? "التخصصات" : "Categories"}
                    </th>

                    <th
                      className={`${tableHeadClass} ${
                        isRTL ? "text-right" : "text-left"
                      }`}
                    >
                      {currentLang === "ar" ? "أسماء التخصصات" : "Category Names"}
                    </th>

                    <th className={`${tableHeadClass} text-center`}>
                      GeoFence
                    </th>

                    <th className={`${tableHeadClass} text-center`}>
                      {currentLang === "ar" ? "تاريخ الإنشاء" : "Created At"}
                    </th>

                    <th className={`${tableHeadClass} text-center`}>
                      {currentLang === "ar" ? "إجراءات" : "Actions"}
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {loadingGetDepartments ? (
                    <tr>
                      <td colSpan="9" className="p-8">
                        <LoadingBlock
                          text={
                            t("gettingData.departments") ||
                            "Loading departments..."
                          }
                        />
                      </td>
                    </tr>
                  ) : safeDepartments.length === 0 ? (
                    <tr>
                      <td colSpan="9" className="p-8">
                        <EmptyBlock
                          text={t("department.noData") || "No departments found"}
                        />
                      </td>
                    </tr>
                  ) : (
                    safeDepartments.map((department) => (
                      <tr key={department.id} className={theme.hoverRow}>
                        <td className={`${tableCellClass} text-center`}>
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-[var(--color-bg-soft)] border border-[var(--color-border)] font-mono font-bold">
                            <Hash size={13} />
                            {department.code || "-"}
                          </span>
                        </td>

                        <td className={tableCellClass}>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-[var(--color-primary-soft)] text-[var(--color-primary)] flex items-center justify-center">
                              <Building2 size={20} />
                            </div>

                            <div>
                              <p className="font-extrabold text-[var(--color-text)]">
                                {getDepartmentName(department)}
                              </p>
                              <p className="text-xs text-[var(--color-text-muted)] mt-1">
                                {getDepartmentSubName(department)}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className={`${tableCellClass} text-center`}>
                          <StatusBadge active={department.isActive} />
                        </td>

                        <td className={tableCellClass}>
                          <ManagerBadge department={department} />
                        </td>

                        <td className={`${tableCellClass} text-center`}>
                          <Link to={`/admin-panel/department/${department.id}`}>
                            <span className="inline-flex items-center justify-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-[var(--color-primary-soft)] text-[var(--color-primary)] border border-[var(--color-primary)]/25">
                              <Link2 size={13} />
                              {getLinkedCategoriesCount(department)}
                            </span>
                          </Link>
                        </td>

                        <td className={tableCellClass}>
                          <span className="text-[var(--color-text-muted)]">
                            {getCategoryNames(department)}
                          </span>
                        </td>

                        <td className={`${tableCellClass} text-center`}>
                          <span
                            className={`inline-flex items-center justify-center gap-1 px-3 py-1 rounded-full text-xs font-bold border ${
                              getGeoFenceCount(department) > 0
                                ? "bg-[var(--color-success-soft)] text-[var(--color-success)] border-[var(--color-success-border)]"
                                : "bg-[var(--color-neutral-soft)] text-[var(--color-neutral)] border-[var(--color-neutral-border)]"
                            }`}
                          >
                            <MapPin size={13} />
                            {getGeoFenceCount(department)}
                          </span>
                        </td>

                        <td
                          className={`${tableCellClass} text-center text-[var(--color-text-muted)]`}
                        >
                          <div className="inline-flex items-center gap-1">
                            <Calendar size={14} />
                            {formatDate(department.createdAt)}
                          </div>
                        </td>

                        <td className={`${tableCellClass} text-center`}>
                          <div className="flex justify-center gap-2">
                            <Link to={`/admin-panel/department/${department.id}`}>
                              <button
                                type="button"
                                className={iconButtonClass}
                                title={currentLang === "ar" ? "عرض" : "View"}
                              >
                                <Eye size={16} />
                              </button>
                            </Link>

                            <Link
                              to={`/admin-panel/department/edit/${department.id}`}
                            >
                              <button
                                type="button"
                                className={iconButtonClass}
                                title={currentLang === "ar" ? "تعديل" : "Edit"}
                              >
                                <Edit size={16} />
                              </button>
                            </Link>

                            <button
                              type="button"
                              onClick={() => {
                                setToDelete({
                                  id: department.id,
                                  name: getDepartmentName(department),
                                })
                                setModalOpen(true)
                              }}
                              className={dangerIconButtonClass}
                              title={currentLang === "ar" ? "حذف" : "Delete"}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {pagination && pagination.totalPages > 1 && (
            <div className={`${theme.card} p-4 mt-6`}>
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-sm text-[var(--color-text-muted)]">
                  {currentLang === "ar" ? "عرض" : "Showing"}{" "}
                  <span className="font-bold text-[var(--color-text)]">
                    {(pagination.page - 1) * pagination.pageSize + 1}
                  </span>{" "}
                  -{" "}
                  <span className="font-bold text-[var(--color-text)]">
                    {Math.min(
                      pagination.page * pagination.pageSize,
                      pagination.totalCount
                    )}
                  </span>{" "}
                  {currentLang === "ar" ? "من" : "of"}{" "}
                  <span className="font-bold text-[var(--color-text)]">
                    {pagination.totalCount}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={pagination.pageSize}
                    onChange={(e) => handlePageSizeChange(e.target.value)}
                    className="px-3 py-2 rounded-lg bg-[var(--color-surface)] text-[var(--color-text)] border border-[var(--color-border)]"
                  >
                    {[5, 10, 20, 50].map((size) => (
                      <option key={size} value={size}>
                        {size}
                      </option>
                    ))}
                  </select>

                  <button
                    type="button"
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={!hasPrevious}
                    className={defaultButtonClass}
                  >
                    {isRTL ? (
                      <ChevronRight size={16} />
                    ) : (
                      <ChevronLeft size={16} />
                    )}
                  </button>

                  {getPageNumbers().map((page) => (
                    <button
                      key={page}
                      type="button"
                      onClick={() => handlePageChange(page)}
                      className={`px-3 py-2 rounded-lg border transition-colors ${
                        page === pagination.page
                          ? "bg-[var(--color-success)] text-white border-[var(--color-success)]"
                          : "bg-[var(--color-surface)] text-[var(--color-text)] border-[var(--color-border-strong)] hover:bg-[var(--color-success)] hover:text-white hover:border-[var(--color-success)] active:bg-[var(--color-success-hover)]"
                      }`}
                    >
                      {page}
                    </button>
                  ))}

                  <button
                    type="button"
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={!hasNext}
                    className={defaultButtonClass}
                  >
                    {isRTL ? (
                      <ChevronLeft size={16} />
                    ) : (
                      <ChevronRight size={16} />
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function LoadingBlock({ text }) {
  return (
    <div className="flex items-center justify-center gap-3 py-8 text-[var(--color-text-muted)]">
      <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-[var(--color-primary)]" />
      <span className="text-sm font-semibold">{text}</span>
    </div>
  )
}

function EmptyBlock({ text }) {
  return (
    <div className="text-center py-10 text-[var(--color-text-muted)]">
      <Building2 className="w-12 h-12 mx-auto mb-3 opacity-60" />
      <p className="text-sm font-semibold">{text}</p>
    </div>
  )
}

export default Department