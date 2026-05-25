import React, { useEffect, useMemo, useState, useCallback } from "react"
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
  Stethoscope,
  Building,
  Users,
  UserCheck,
  Clock,
  BarChart3,
  CheckCircle,
  XCircle,
  SlidersHorizontal,
} from "lucide-react"

import { getCategories } from "../../../state/act/actCategory"
import {
  clearError,
  clearFilters,
  setCurrentPage,
  setFilters,
  setPageSize,
} from "../../../state/slices/category"

import DeleteCategoryModal from "../../../components/modals/DeleteCategoryModal"
import { formatDate } from "../../../utils/formtDate"
import { getPageTheme } from "../../../utils/themeClasses"

function Category() {
  const { t, i18n } = useTranslation()
  const dispatch = useDispatch()
  const theme = getPageTheme()

  const [modalOpen, setModalOpen] = useState(false)
  const [toDelete, setToDelete] = useState({ id: null, name: "" })
  const [searchInput, setSearchInput] = useState("")
  const [showFilters, setShowFilters] = useState(false)
  const [searchTimeout, setSearchTimeout] = useState(null)

  const {
    categories,
    pagination,
    filters,
    loadingGetCategories,
    error,
  } = useSelector((state) => state.category)

  const currentLang = i18n.language || "ar"
  const isRTL = currentLang === "ar"

  useEffect(() => {
    setSearchInput(filters?.search || "")
  }, [filters?.search])

  useEffect(() => {
    dispatch(
      getCategories({
        ...filters,
        includeDepartments: true,
        includeStatistics: true,
        includeChief: true,
      })
    )
  }, [dispatch, filters])

  const safeCategories = Array.isArray(categories) ? categories : []

  const summary = useMemo(() => {
    return {
      totalCategories: pagination?.totalCount || safeCategories.length || 0,
      activeCategories: safeCategories.filter((cat) => cat.isActive).length,
      inactiveCategories: safeCategories.filter((cat) => !cat.isActive).length,
      totalDepartments: safeCategories.reduce(
        (sum, cat) => sum + Number(cat.departmentsCount || 0),
        0
      ),
      totalUsers: safeCategories.reduce(
        (sum, cat) => sum + Number(cat.usersCount || cat.doctorsCount || 0),
        0
      ),
      pendingRequests: safeCategories.reduce(
        (sum, cat) =>
          sum +
          Number(
            cat.pendingRequestsCount ||
              cat.pendingDoctorRequestsCount ||
              cat.pendingDoctorsCount ||
              0
          ),
        0
      ),
    }
  }, [safeCategories, pagination])

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

  const handlePageChange = (newPage) => {
    dispatch(setCurrentPage(newPage))
  }

  const handlePageSizeChange = (newPageSize) => {
    dispatch(setPageSize(Number(newPageSize)))
  }

  const refreshData = () => {
    dispatch(
      getCategories({
        ...filters,
        includeDepartments: true,
        includeStatistics: true,
        includeChief: true,
      })
    )
  }

  const getCategoryName = (category) => {
    return currentLang === "ar"
      ? category.nameArabic || category.nameEnglish || "-"
      : category.nameEnglish || category.nameArabic || "-"
  }

  const getCategorySubName = (category) => {
    return currentLang === "ar"
      ? category.nameEnglish || "-"
      : category.nameArabic || "-"
  }

  const getChiefName = (category) => {
    return (
      category.categoryHeadName ||
      category.categoryHeadNameAr ||
      category.categoryHeadNameEn ||
      category.chiefName ||
      category.headName ||
      category.managerName ||
      "-"
    )
  }

  const getUsersCount = (category) => {
    return category.usersCount ?? category.doctorsCount ?? category.totalDoctors ?? 0
  }

  const getPendingCount = (category) => {
    return (
      category.pendingRequestsCount ??
      category.pendingDoctorRequestsCount ??
      category.pendingDoctorsCount ??
      0
    )
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

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i)
    }

    return pages
  }

  const hasPrevious =
    pagination?.hasPreviousPage ?? pagination?.hasPrevious ?? pagination?.page > 1

  const hasNext =
    pagination?.hasNextPage ??
    pagination?.hasNext ??
    pagination?.page < pagination?.totalPages

  const tableHeadClass =
    "px-4 py-3 text-sm font-bold text-[var(--color-text)] border-b border-[var(--color-border)] whitespace-nowrap"

  const tableCellClass =
    "px-4 py-4 text-sm text-[var(--color-text)] border-b border-[var(--color-border)] align-middle"

  const SummaryCard = ({ icon: Icon, title, value, tone = "blue" }) => {
    const toneMap = {
      blue:
        "bg-[var(--color-primary-soft)] text-[var(--color-primary)] border border-[var(--color-primary)]/20",
      green:
        "bg-[var(--color-success-soft)] text-[var(--color-success)] border border-[var(--color-success-border)]",
      red:
        "bg-[var(--color-danger-soft)] text-[var(--color-danger)] border border-[var(--color-danger-border)]",
      yellow:
        "bg-[var(--color-warning-soft)] text-[var(--color-warning)] border border-[var(--color-warning-border)]",
      purple:
        "bg-[var(--color-purple-soft)] text-[var(--color-purple)] border border-[var(--color-purple-border)]",
      orange:
        "bg-[var(--color-warning-soft)] text-[var(--color-warning)] border border-[var(--color-warning-border)]",
    }

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
            className={`w-11 h-11 rounded-xl flex items-center justify-center ${
              toneMap[tone] || toneMap.blue
            }`}
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
        active ? theme.successBadge : theme.dangerBadge
      }`}
    >
      {active ? <CheckCircle size={13} /> : <XCircle size={13} />}
      {active
        ? t("categories.status.active") || "Active"
        : t("categories.status.inactive") || "Inactive"}
    </span>
  )

  const CategoryMobileCard = ({ category }) => (
    <div className={`${theme.card} p-4`}>
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 rounded-xl bg-[var(--color-primary-soft)] text-[var(--color-primary)] flex items-center justify-center">
            <Stethoscope size={22} />
          </div>

          <div>
            <h3 className="font-extrabold text-[var(--color-text)]">
              {getCategoryName(category)}
            </h3>
            <p className="text-sm text-[var(--color-text-muted)] mt-1">
              {getCategorySubName(category)}
            </p>
            <p className="text-xs text-[var(--color-text-muted)] mt-1 font-mono">
              {category.code || "-"}
            </p>
          </div>
        </div>

        <StatusBadge active={category.isActive} />
      </div>

      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className={`${theme.cardSoft} p-3 text-center`}>
          <Building className="w-4 h-4 mx-auto mb-1 text-[var(--color-primary)]" />
          <p className="font-bold text-[var(--color-text)]">
            {category.departmentsCount ?? 0}
          </p>
          <p className="text-[10px] text-[var(--color-text-muted)]">
            {currentLang === "ar" ? "أقسام" : "Departments"}
          </p>
        </div>

        <div className={`${theme.cardSoft} p-3 text-center`}>
          <Users className="w-4 h-4 mx-auto mb-1 text-[var(--color-success)]" />
          <p className="font-bold text-[var(--color-text)]">
            {getUsersCount(category)}
          </p>
          <p className="text-[10px] text-[var(--color-text-muted)]">
            {currentLang === "ar" ? "دكاترة" : "Doctors"}
          </p>
        </div>

        <div className={`${theme.cardSoft} p-3 text-center`}>
          <Clock className="w-4 h-4 mx-auto mb-1 text-[var(--color-warning)]" />
          <p className="font-bold text-[var(--color-text)]">
            {getPendingCount(category)}
          </p>
          <p className="text-[10px] text-[var(--color-text-muted)]">
            {currentLang === "ar" ? "طلبات" : "Requests"}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 pt-3 border-t border-[var(--color-border)]">
        <p className="text-xs text-[var(--color-text-muted)]">
          {formatDate(category.createdAt)}
        </p>

        <div className="flex gap-2">
          <Link to={`/admin-panel/category/${category.id}`}>
            <button
              type="button"
              className="p-2 text-[var(--color-primary)] hover:bg-[var(--color-primary-soft)] rounded-lg"
              title={t("categories.actions.view")}
            >
              <Eye size={16} />
            </button>
          </Link>

          <Link to={`/admin-panel/category/edit/${category.id}`}>
            <button
              type="button"
              className="p-2 text-[var(--color-success)] hover:bg-[var(--color-success-soft)] rounded-lg"
              title={t("categories.actions.edit")}
            >
              <Edit size={16} />
            </button>
          </Link>

          <button
            type="button"
            className="p-2 text-[var(--color-danger)] hover:bg-[var(--color-danger-soft)] rounded-lg"
            title={t("categories.actions.delete")}
            onClick={() => {
              setToDelete({
                id: category.id,
                name: getCategoryName(category),
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

  return (
    <div className={theme.page} dir={isRTL ? "rtl" : "ltr"}>
      <DeleteCategoryModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        categoryId={toDelete.id}
        info={toDelete}
        categoryName={toDelete.name}
      />

      <div className={theme.container}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-[var(--color-text)] flex items-center gap-3">
              <span className="w-12 h-12 rounded-2xl bg-[var(--color-primary-soft)] text-[var(--color-primary)] flex items-center justify-center">
                <Stethoscope className="w-7 h-7" />
              </span>
              {t("categories.title") || "Categories"}
            </h1>

            <p className="text-sm text-[var(--color-text-muted)] mt-2">
              {currentLang === "ar"
                ? "إدارة التخصصات، الأقسام، الدكاترة، وطلبات الانضمام."
                : "Manage categories, departments, doctors, and join requests."}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={refreshData}
              className={theme.secondaryButton}
            >
              <RefreshCw size={16} />
              {currentLang === "ar" ? "تحديث" : "Refresh"}
            </button>

            <Link to="/admin-panel/category/create">
              <button type="button" className={`${theme.primaryButton} gap-2`}>
                <Plus size={18} />
                {t("categories.actions.addNew") || "Add New Category"}
              </button>
            </Link>
          </div>
        </div>

        {error && (
          <div className="p-4 mb-5 rounded-2xl bg-[var(--color-danger-soft)] text-[var(--color-danger)] border border-[var(--color-danger-border)]">
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

        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
          <SummaryCard
            icon={BarChart3}
            title={currentLang === "ar" ? "إجمالي التخصصات" : "Total Categories"}
            value={summary.totalCategories}
            tone="blue"
          />

          <SummaryCard
            icon={CheckCircle}
            title={currentLang === "ar" ? "نشطة" : "Active"}
            value={summary.activeCategories}
            tone="green"
          />

          <SummaryCard
            icon={XCircle}
            title={currentLang === "ar" ? "غير نشطة" : "Inactive"}
            value={summary.inactiveCategories}
            tone="red"
          />

          <SummaryCard
            icon={Building}
            title={currentLang === "ar" ? "الأقسام" : "Departments"}
            value={summary.totalDepartments}
            tone="purple"
          />

          <SummaryCard
            icon={Users}
            title={currentLang === "ar" ? "الدكاترة" : "Doctors"}
            value={summary.totalUsers}
            tone="green"
          />

          <SummaryCard
            icon={Clock}
            title={currentLang === "ar" ? "طلبات معلقة" : "Pending"}
            value={summary.pendingRequests}
            tone="yellow"
          />
        </div>

        <div className={`${theme.card} p-4 mb-6`}>
          <div className="flex flex-col xl:flex-row gap-4">
            <div className="flex-1 flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-[var(--color-bg-soft)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-text-muted)]">
                <Search size={20} />
              </div>

              <input
                type="text"
                placeholder={t("categories.search.placeholder") || "Search categories..."}
                value={searchInput}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-[var(--color-surface)] text-[var(--color-text)] border border-[var(--color-border)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-soft)] focus:border-[var(--color-primary)]"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowFilters((prev) => !prev)}
                className={`${theme.secondaryButton} gap-2`}
              >
                <SlidersHorizontal size={17} />
                {t("categories.filters.title") || "Filters"}
              </button>
            </div>
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 mt-4 border-t border-[var(--color-border)]">
              <div>
                <label className="block text-sm font-bold text-[var(--color-text)] mb-2">
                  {t("categories.filters.status") || "Status"}
                </label>

                <select
                  value={filters?.isActive === "" ? "" : String(filters?.isActive)}
                  onChange={(e) => {
                    const value =
                      e.target.value === "" ? "" : e.target.value === "true"
                    handleFilterChange("isActive", value)
                  }}
                  className="w-full px-3 py-2 rounded-lg bg-[var(--color-surface)] text-[var(--color-text)] border border-[var(--color-border)]"
                >
                  <option value="">
                    {currentLang === "ar" ? "كل الحالات" : "All Status"}
                  </option>
                  <option value="true">
                    {t("categories.status.active") || "Active"}
                  </option>
                  <option value="false">
                    {t("categories.status.inactive") || "Inactive"}
                  </option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-[var(--color-text)] mb-2">
                  {t("categories.filters.orderBy") || "Order By"}
                </label>

                <select
                  value={filters?.orderBy || "createdAt"}
                  onChange={(e) => handleFilterChange("orderBy", e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[var(--color-surface)] text-[var(--color-text)] border border-[var(--color-border)]"
                >
                  <option value="createdAt">
                    {t("categories.filters.sortBy.createdAt") || "Created At"}
                  </option>
                  <option value="nameArabic">
                    {t("categories.filters.sortBy.nameArabic") || "Arabic Name"}
                  </option>
                  <option value="nameEnglish">
                    {t("categories.filters.sortBy.nameEnglish") || "English Name"}
                  </option>
                  <option value="code">
                    {t("categories.filters.sortBy.code") || "Code"}
                  </option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-[var(--color-text)] mb-2">
                  {t("categories.filters.orderDirection") || "Direction"}
                </label>

                <select
                  value={String(filters?.orderDesc ?? true)}
                  onChange={(e) =>
                    handleFilterChange("orderDesc", e.target.value === "true")
                  }
                  className="w-full px-3 py-2 rounded-lg bg-[var(--color-surface)] text-[var(--color-text)] border border-[var(--color-border)]"
                >
                  <option value="true">
                    {t("categories.filters.descending") || "Descending"}
                  </option>
                  <option value="false">
                    {t("categories.filters.ascending") || "Ascending"}
                  </option>
                </select>
              </div>

              <div className="flex items-end">
                <button
                  type="button"
                  onClick={() => {
                    dispatch(clearFilters())
                    setSearchInput("")
                  }}
                  className={`${theme.secondaryButton} w-full gap-2`}
                >
                  <Filter size={16} />
                  {t("contractingTypes.filters.clear") || "Clear"}
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="md:hidden space-y-4">
          {loadingGetCategories ? (
            <LoadingBlock text={t("gettingData.categories") || "Loading categories..."} />
          ) : safeCategories.length === 0 ? (
            <EmptyBlock text={t("categories.noData") || "No categories found"} />
          ) : (
            safeCategories.map((category) => (
              <CategoryMobileCard key={category.id} category={category} />
            ))
          )}
        </div>

        <div className={`${theme.card} hidden md:block overflow-hidden`}>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px]">
              <thead className="bg-[var(--color-surface-muted)]">
                <tr>
                  <th className={`${tableHeadClass} text-center`}>
                    {t("categories.table.code") || "Code"}
                  </th>
                  <th className={`${tableHeadClass} ${isRTL ? "text-right" : "text-left"}`}>
                    {currentLang === "ar" ? "التخصص" : "Category"}
                  </th>
                  <th className={`${tableHeadClass} text-center`}>
                    {t("categories.table.status") || "Status"}
                  </th>
                  <th className={`${tableHeadClass} text-center`}>
                    {t("categories.table.departments") || "Departments"}
                  </th>
                  <th className={`${tableHeadClass} text-center`}>
                    {currentLang === "ar" ? "الدكاترة" : "Doctors"}
                  </th>
                  <th className={`${tableHeadClass} text-center`}>
                    {currentLang === "ar" ? "طلبات" : "Requests"}
                  </th>
                  <th className={`${tableHeadClass} ${isRTL ? "text-right" : "text-left"}`}>
                    {currentLang === "ar" ? "رئيس التخصص" : "Category Head"}
                  </th>
                  <th className={`${tableHeadClass} text-center`}>
                    {t("categories.table.createdAt") || "Created At"}
                  </th>
                  <th className={`${tableHeadClass} text-center`}>
                    {t("categories.table.actions") || "Actions"}
                  </th>
                </tr>
              </thead>

              <tbody>
                {loadingGetCategories ? (
                  <tr>
                    <td colSpan="9" className="p-8">
                      <LoadingBlock text={t("gettingData.categories") || "Loading categories..."} />
                    </td>
                  </tr>
                ) : safeCategories.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="p-8">
                      <EmptyBlock text={t("categories.noData") || "No categories found"} />
                    </td>
                  </tr>
                ) : (
                  safeCategories.map((category) => (
                    <tr key={category.id} className={theme.hoverRow}>
                      <td className={`${tableCellClass} text-center`}>
                        <span className="inline-flex items-center px-3 py-1 rounded-lg bg-[var(--color-bg-soft)] border border-[var(--color-border)] font-mono font-bold">
                          {category.code || "-"}
                        </span>
                      </td>

                      <td className={`${tableCellClass}`}>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-[var(--color-primary-soft)] text-[var(--color-primary)] flex items-center justify-center">
                            <Stethoscope size={20} />
                          </div>

                          <div>
                            <p className="font-extrabold text-[var(--color-text)]">
                              {getCategoryName(category)}
                            </p>
                            <p className="text-xs text-[var(--color-text-muted)] mt-1">
                              {getCategorySubName(category)}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className={`${tableCellClass} text-center`}>
                        <StatusBadge active={category.isActive} />
                      </td>

                      <td className={`${tableCellClass} text-center`}>
                        <Link to={`/admin-panel/category/${category.id}`}>
                          <span className="inline-flex items-center justify-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-[var(--color-primary-soft)] text-[var(--color-primary)] border border-[var(--color-primary)]/25">
                            <Building size={13} />
                            {category.departmentsCount ?? 0}
                          </span>
                        </Link>
                      </td>

                      <td className={`${tableCellClass} text-center`}>
                        <Link to={`/admin-panel/category/${category.id}`}>
                          <span className="inline-flex items-center justify-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-[var(--color-success-soft)] text-[var(--color-success)] border border-[var(--color-success-border)]">
                            <Users size={13} />
                            {getUsersCount(category)}
                          </span>
                        </Link>
                      </td>

                      <td className={`${tableCellClass} text-center`}>
                        <Link to={`/admin-panel/category/${category.id}`}>
                          <span className="inline-flex items-center justify-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-[var(--color-warning-soft)] text-[var(--color-warning)] border border-[var(--color-warning-border)]">
                            <Clock size={13} />
                            {getPendingCount(category)}
                          </span>
                        </Link>
                      </td>

                      <td className={`${tableCellClass}`}>
                        <div className="flex items-center gap-2">
                          <UserCheck
                            size={16}
                            className="text-[var(--color-purple)]"
                          />
                          <span className="text-[var(--color-text-muted)]">
                            {getChiefName(category)}
                          </span>
                        </div>
                      </td>

                      <td className={`${tableCellClass} text-center text-[var(--color-text-muted)]`}>
                        {formatDate(category.createdAt)}
                      </td>

                      <td className={`${tableCellClass} text-center`}>
                        <div className="flex justify-center gap-2">
                          <Link to={`/admin-panel/category/${category.id}`}>
                            <button
                              type="button"
                              className="p-2 text-[var(--color-primary)] hover:bg-[var(--color-primary-soft)] rounded-lg transition-colors"
                              title={t("categories.actions.view") || "View"}
                            >
                              <Eye size={16} />
                            </button>
                          </Link>

                          <Link to={`/admin-panel/category/edit/${category.id}`}>
                            <button
                              type="button"
                              className="p-2 text-[var(--color-success)] hover:bg-[var(--color-success-soft)] rounded-lg transition-colors"
                              title={t("categories.actions.edit") || "Edit"}
                            >
                              <Edit size={16} />
                            </button>
                          </Link>

                          <button
                            type="button"
                            onClick={() => {
                              setToDelete({
                                id: category.id,
                                name: getCategoryName(category),
                              })
                              setModalOpen(true)
                            }}
                            className="p-2 text-[var(--color-danger)] hover:bg-[var(--color-danger-soft)] rounded-lg transition-colors"
                            title={t("categories.actions.delete") || "Delete"}
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
                  className={theme.secondaryButton}
                >
                  {isRTL ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
                </button>

                {getPageNumbers().map((pageNum) => (
                  <button
                    key={pageNum}
                    type="button"
                    onClick={() => handlePageChange(pageNum)}
                    className={`px-3 py-2 rounded-lg border transition-colors ${
                      pageNum === pagination.page
                        ? "bg-[var(--color-primary)] text-white border-[var(--color-primary)]"
                        : "bg-[var(--color-surface)] text-[var(--color-text)] border-[var(--color-border)] hover:bg-[var(--color-surface-muted)]"
                    }`}
                  >
                    {pageNum}
                  </button>
                ))}

                <button
                  type="button"
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={!hasNext}
                  className={theme.secondaryButton}
                >
                  {isRTL ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
                </button>
              </div>
            </div>
          </div>
        )}
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
      <Stethoscope className="w-12 h-12 mx-auto mb-3 opacity-60" />
      <p className="text-sm font-semibold">{text}</p>
    </div>
  )
}

export default Category
