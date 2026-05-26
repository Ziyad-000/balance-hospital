import React, { useEffect, useState, useCallback } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useTranslation } from "react-i18next"
import {
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Eye,
  Edit,
  Trash2,
  Plus,
  Menu,
  X,
  Clock,
  Hash,
  Calendar,
  FileText,
} from "lucide-react"

import {
  clearError,
  setStatusFilter as setShiftHoursStatusFilter,
  setCurrentPage,
  setFilters,
  setPageSize,
  clearFilters,
} from "../../../state/slices/shiftHours"
import { Link } from "react-router-dom"
import { getShiftHoursTypes } from "../../../state/act/actShiftHours"
import DeleteShiftHoursTypeModal from "../../../components/modals/DeleteShiftHoursTypeModal"
import { getPageTheme } from "../../../utils/themeClasses"
import "../../../styles/general.css"
import { formatDate } from "../../../utils/formtDate"

function ShiftHours() {
  const { t, i18n } = useTranslation()
  const dispatch = useDispatch()
  const theme = getPageTheme()

  const [modalOpen, setModalOpen] = useState(false)
  const [toDelete, setToDelete] = useState({ id: null, name: "" })
  const [searchInput, setSearchInput] = useState("")
  const [showFilters, setShowFilters] = useState(false)
  const [showMobileTable, setShowMobileTable] = useState(false)
  const [searchTimeout, setSearchTimeout] = useState(null)

  const { shiftHoursTypes, loadingGetShiftHoursTypes, pagination, filters, error } =
    useSelector((state) => state.shiftHour)

  const language = i18n.language
  const isRTL = language === "ar"

  // ── Button classes (Roster system) ──────────────────────────────────────
  const defaultButtonClass =
    "inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border bg-[var(--color-surface)] text-[var(--color-text)] border-[var(--color-border-strong)] hover:bg-[var(--color-success)] hover:text-white hover:border-[var(--color-success)] active:bg-[var(--color-success-hover)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"

  const createButtonClass =
    "inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border bg-[var(--color-success)] text-white border-[var(--color-success)] hover:bg-[var(--color-success-hover)] hover:border-[var(--color-success-hover)] active:scale-[0.98] transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"

  const selectedButtonClass =
    "inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border bg-[var(--color-success)] text-white border-[var(--color-success)] transition-colors"

  // ── Fetch ────────────────────────────────────────────────────────────────
  useEffect(() => {
    dispatch(getShiftHoursTypes(filters))
  }, [dispatch, filters])

  useEffect(() => {
    dispatch(clearError())
  }, [dispatch])

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleSearchChange = useCallback(
    (value) => {
      setSearchInput(value)
      if (searchTimeout) clearTimeout(searchTimeout)
      const timeout = setTimeout(() => {
        dispatch(setFilters({ search: value, page: 1 }))
      }, 500)
      setSearchTimeout(timeout)
    },
    [dispatch, searchTimeout]
  )

  const handleFilterChange = (key, value) => {
    dispatch(setFilters({ [key]: value, page: 1 }))
  }

  const handleStatusChange = (newStatus) => {
    dispatch(setShiftHoursStatusFilter(newStatus))
  }

  const handlePageChange = (newPage) => {
    dispatch(setCurrentPage(newPage))
  }

  const handlePageSizeChange = (newPageSize) => {
    dispatch(setPageSize(parseInt(newPageSize)))
  }

  const handleDeleteClick = (shiftHoursType) => {
    const name = language === "ar" ? shiftHoursType.nameArabic : shiftHoursType.nameEnglish
    setToDelete({ id: shiftHoursType.id, name })
    setModalOpen(true)
  }

  const handleClearFilters = () => {
    dispatch(clearFilters())
    setSearchInput("")
  }

  const formatHours = (hours) => (hours ? parseFloat(hours).toString() : "0")

  const normalizePeriod = (period) => {
    if (!period) return ""

    const value = String(period).toLowerCase().trim()

    if (value.includes("morning")) return "morning"
    if (value.includes("afternoon")) return "afternoon"
    if (value.includes("evening")) return "evening"
    if (value.includes("night")) return "night"
    if (value.includes("daily")) return "daily"
    if (value.includes("weekly")) return "weekly"
    if (value.includes("monthly")) return "monthly"

    return value
  }

  const getPeriodDisplay = (period) => {
    const normalized = normalizePeriod(period)

    const translationMap = {
      daily: "shiftHoursTypes.periods.daily",
      weekly: "shiftHoursTypes.periods.weekly",
      monthly: "shiftHoursTypes.periods.monthly",
      morning: "shiftHoursTypes.periods.morning",
      afternoon: "shiftHoursTypes.periods.afternoon",
      evening: "shiftHoursTypes.periods.evening",
      night: "shiftHoursTypes.periods.night",
    }

    const translationKey = translationMap[normalized]

    if (translationKey) {
      const translated = t(translationKey)
      if (translated && translated !== translationKey) return translated
    }

    const fallbackMap = {
      daily: language === "ar" ? "يومي" : "Daily",
      weekly: language === "ar" ? "أسبوعي" : "Weekly",
      monthly: language === "ar" ? "شهري" : "Monthly",
      morning: language === "ar" ? "صباحي" : "Morning",
      afternoon: language === "ar" ? "بعد الظهر" : "Afternoon",
      evening: language === "ar" ? "مسائي" : "Evening",
      night: language === "ar" ? "ليلي" : "Night",
    }

    return fallbackMap[normalized] || period || "-"
  }

  const getPeriodBadgeClass = (period) => {
    const normalized = normalizePeriod(period)

    if (normalized === "morning" || normalized === "daily") {
      return "bg-transparent text-blue-500 border-2 border-blue-500"
    }

    if (normalized === "evening" || normalized === "weekly") {
      return "bg-transparent text-amber-500 border-2 border-amber-500"
    }

    if (normalized === "afternoon") {
      return "bg-transparent text-orange-500 border-2 border-orange-500"
    }

    if (normalized === "night" || normalized === "monthly") {
      return "bg-transparent text-violet-500 border-2 border-violet-500"
    }

    return "bg-transparent text-slate-500 border-2 border-slate-500"
  }

  const getPageNumbers = () => {
    const pages = []
    const totalPages = pagination?.totalPages || 1
    const currentPage = pagination?.page || 1
    const maxPages = window.innerWidth < 768 ? 3 : 5
    let startPage = Math.max(1, currentPage - Math.floor(maxPages / 2))
    let endPage = Math.min(totalPages, startPage + maxPages - 1)
    if (endPage - startPage < maxPages - 1) startPage = Math.max(1, endPage - maxPages + 1)
    for (let i = startPage; i <= endPage; i++) pages.push(i)
    return pages
  }

  // ── ActionButton (Roster pattern) ────────────────────────────────────────
  const ActionButton = ({ children, title, tone = "primary", onClick }) => {
    const toneClasses = {
      primary:
        "bg-transparent text-blue-500 border border-blue-500 hover:bg-emerald-600 hover:text-white hover:border-emerald-600",
      warning:
        "bg-transparent text-amber-500 border border-amber-500 hover:bg-amber-600 hover:text-white hover:border-amber-600",
      success:
        "bg-transparent text-emerald-500 border border-emerald-500 hover:bg-emerald-600 hover:text-white hover:border-emerald-600",
      danger:
        "bg-transparent text-red-500 border border-red-500 hover:bg-red-600 hover:text-white hover:border-red-600",
    }
    return (
      <button
        onClick={onClick}
        className={`p-2 rounded-lg transition-colors ${toneClasses[tone]}`}
        title={title}
        type="button"
      >
        {children}
      </button>
    )
  }

  // ── Sub-components ────────────────────────────────────────────────────────
  const LoadingState = ({ small = false }) => (
    <div className="text-center p-8">
      <div className="flex items-center justify-center">
        <div
          className={`animate-spin rounded-full border-b-2 border-[var(--color-success)] ${
            small ? "h-6 w-6" : "h-8 w-8"
          }`}
        />
        <span className={`${isRTL ? "mr-3" : "ml-3"} text-[var(--color-text-muted)]`}>
          {t("gettingData.shiftHourData")}
        </span>
      </div>
    </div>
  )

  const EmptyState = ({ compact = false }) => (
    <div className={`text-center ${compact ? "p-8" : "p-12"}`}>
      <div className="w-14 h-14 bg-transparent rounded-full border-2 border-slate-500 text-slate-500 flex items-center justify-center mx-auto mb-4 shadow-sm">
        <FileText size={compact ? 24 : 32} />
      </div>
      <h3 className={`font-semibold text-[var(--color-text)] mb-2 ${compact ? "text-base" : "text-lg"}`}>
        {t("shiftHoursTypes.noData")}
      </h3>
    </div>
  )

  const ShiftHoursTypeCard = ({ shiftHoursType }) => (
    <div className={`${theme.card} p-4 mb-3`}>
      <div className="flex justify-between items-start mb-3 gap-3">
        <div className="flex-1">
          <h3 className="font-semibold text-lg text-[var(--color-text)]">
            {shiftHoursType.nameArabic}
          </h3>
          <p className="text-sm text-[var(--color-text-muted)]">
            {shiftHoursType.nameEnglish}
          </p>
          {shiftHoursType.code && (
            <div className="flex items-center mt-1 gap-1">
              <Hash className="h-3 w-3 text-[var(--color-text-muted)]" />
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-[var(--color-surface-muted)] border border-[var(--color-border)] text-[var(--color-text)]">
                {shiftHoursType.code}
              </span>
            </div>
          )}
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPeriodBadgeClass(shiftHoursType.period)}`}>
          {getPeriodDisplay(shiftHoursType.period)}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 text-sm mb-3">
        <div className="flex items-center gap-2">
          <Clock size={14} className="text-[var(--color-text-muted)]" />
          <span className="text-[var(--color-text-muted)]">{t("shiftHoursTypes.table.hours")}:</span>
          <span className="font-semibold text-[var(--color-text)]">{formatHours(shiftHoursType.hoursCountCount)}h</span>
        </div>
        {shiftHoursType.createdAt && (
          <div className="flex items-center gap-2 col-span-2">
            <Calendar size={14} className="text-[var(--color-text-muted)]" />
            <span className="text-[var(--color-text-muted)]">{t("shiftHoursTypes.table.createdAt")}:</span>
            <span className="text-xs text-[var(--color-text)]">{formatDate(shiftHoursType.createdAt)}</span>
          </div>
        )}
      </div>

      <div className="flex gap-2 justify-end">
        <Link to={`/admin-panel/shift-hours-types/${shiftHoursType.id}`}>
          <ActionButton title={t("shiftHoursTypes.actions.view")}>
            <Eye size={16} />
          </ActionButton>
        </Link>
        <Link to={`/admin-panel/shift-hours-types/edit/${shiftHoursType.id}`}>
          <ActionButton title={t("shiftHoursTypes.actions.edit")} tone="success">
            <Edit size={16} />
          </ActionButton>
        </Link>
        <ActionButton
          title={t("shiftHoursTypes.actions.delete")}
          tone="danger"
          onClick={() => handleDeleteClick(shiftHoursType)}
        >
          <Trash2 size={16} />
        </ActionButton>
      </div>
    </div>
  )

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className={theme.page} dir={isRTL ? "rtl" : "ltr"}>
      <DeleteShiftHoursTypeModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        shiftHoursTypeId={toDelete.id}
        info={toDelete}
        shiftHoursTypeName={toDelete.name}
      />

      <div className="p-4 sm:p-6">
        <div className="max-w-7xl mx-auto">

          {/* ── Header ── */}
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
              <h1 className="text-2xl sm:text-3xl font-bold text-[var(--color-text)]">
                {t("shiftHoursTypes.title")}
              </h1>

              <div className="flex gap-2 w-full sm:w-auto">
                <Link to="/admin-panel/shift-hours-types/create">
                  <button className={`${createButtonClass} flex-1 sm:flex-none`}>
                    <Plus size={20} />
                    <span className="hidden sm:inline">{t("shiftHoursTypes.addNew")}</span>
                    <span className="sm:hidden">{t("shiftHoursTypes.add")}</span>
                  </button>
                </Link>

                <button
                  onClick={() => setShowMobileTable(!showMobileTable)}
                  className={`md:hidden px-3 py-2 rounded-lg border transition-colors ${
                    showMobileTable
                      ? "bg-transparent border-2 border-emerald-500 text-emerald-500"
                      : defaultButtonClass
                  }`}
                  type="button"
                >
                  {showMobileTable ? <X size={20} /> : <Menu size={20} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-transparent border-2 border-red-500 text-red-500 px-4 py-3 rounded-xl mb-4 shadow-sm">
                <div className="flex justify-between items-center gap-4">
                  <span>{error.message}</span>
                  <button
                    onClick={() => dispatch(clearError())}
                    className="text-red-500 hover:opacity-80 text-xl leading-none"
                    type="button"
                  >
                    ×
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ── Search & Filters ── */}
          <div className={`${theme.card} mb-6`}>
            <div className="p-4">
              <div className="flex flex-col sm:flex-row gap-4 mb-4">
                <div className="flex-1 flex items-center gap-2">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg border-2 border-blue-500 bg-transparent text-blue-500 shadow-sm shrink-0">
                    <Search size={20} />
                  </div>
                  <input
                    type="text"
                    placeholder={t("shiftHoursTypes.search.placeholder")}
                    value={searchInput}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className={`w-full px-4 py-2 ${theme.input}`}
                  />
                </div>

                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`px-4 py-2 rounded-lg border transition-colors flex items-center gap-2 justify-center sm:justify-start ${
                    showFilters
                      ? "bg-transparent border-2 border-emerald-500 text-emerald-500"
                      : defaultButtonClass
                  }`}
                  type="button"
                >
                  <Filter size={20} />
                  {t("shiftHoursTypes.filters.title")}
                </button>
              </div>

              {showFilters && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-[var(--color-border)]">
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-[var(--color-text)]">
                      {t("shiftHoursTypes.filters.status")}
                    </label>
                    <select
                      value={filters.statusFilter || "all"}
                      onChange={(e) => handleStatusChange(e.target.value)}
                      className={`w-full p-2 ${theme.input}`}
                    >
                      <option value="all">{t("shiftHoursTypes.filters.allStatuses")}</option>
                      <option value="active">{t("shiftHoursTypes.status.active")}</option>
                      <option value="inactive">{t("shiftHoursTypes.status.inactive")}</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2 text-[var(--color-text)]">
                      {t("shiftHoursTypes.filters.period")}
                    </label>
                    <select
                      value={filters.period || ""}
                      onChange={(e) => handleFilterChange("period", e.target.value || null)}
                      className={`w-full p-2 ${theme.input}`}
                    >
                      <option value="">{t("shiftHoursTypes.filters.allPeriods")}</option>
                      <option value="Morning">{t("shiftHoursTypes.periods.morning")}</option>
                      <option value="Evening">{t("shiftHoursTypes.periods.evening")}</option>
                      <option value="Night">{t("shiftHoursTypes.periods.night")}</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2 text-[var(--color-text)]">
                      {t("shiftHoursTypes.filters.orderBy")}
                    </label>
                    <select
                      value={filters.orderBy || "nameArabic"}
                      onChange={(e) => handleFilterChange("orderBy", e.target.value)}
                      className={`w-full p-2 ${theme.input}`}
                    >
                      <option value="NameArabic">{t("shiftHoursTypes.filters.sortBy.nameArabic")}</option>
                      <option value="NameEnglish">{t("shiftHoursTypes.filters.sortBy.nameEnglish")}</option>
                      <option value="Period">{t("shiftHoursTypes.filters.sortBy.period")}</option>
                      <option value="HoursCount">{t("shiftHoursTypes.filters.sortBy.hours")}</option>
                      <option value="CreatedAt">{t("shiftHoursTypes.filters.sortBy.createdAt")}</option>
                      <option value="UpdatedAt">{t("shiftHoursTypes.filters.sortBy.updatedAt")}</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2 text-[var(--color-text)]">
                      {t("shiftHoursTypes.filters.orderDirection")}
                    </label>
                    <select
                      value={filters.orderDesc?.toString() || "true"}
                      onChange={(e) => handleFilterChange("orderDesc", e.target.value === "true")}
                      className={`w-full p-2 ${theme.input}`}
                    >
                      <option value="true">{t("shiftHoursTypes.filters.descending")}</option>
                      <option value="false">{t("shiftHoursTypes.filters.ascending")}</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2 lg:col-span-4">
                    <button onClick={handleClearFilters} className={defaultButtonClass} type="button">
                      {t("contractingTypes.filters.clear")}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── Mobile Cards View ── */}
          <div className={`md:hidden ${showMobileTable ? "hidden" : "block"}`}>
            {loadingGetShiftHoursTypes ? (
              <LoadingState />
            ) : !shiftHoursTypes || shiftHoursTypes.length === 0 ? (
              <EmptyState />
            ) : (
              shiftHoursTypes.map((item) => (
                <ShiftHoursTypeCard key={item.id} shiftHoursType={item} />
              ))
            )}
          </div>

          {/* ── Desktop Table ── */}
          <div
            className={`hidden md:block ${showMobileTable ? "md:hidden" : ""} ${theme.card} overflow-hidden`}
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[var(--color-border)] bg-[var(--color-surface-muted)]">
                    {[
                      t("shiftHoursTypes.table.nameArabic"),
                      t("shiftHoursTypes.table.nameEnglish"),
                      t("shiftHoursTypes.table.code"),
                      t("shiftHoursTypes.table.hours"),
                      t("shiftHoursTypes.table.period"),
                      t("shiftHoursTypes.table.actions"),
                    ].map((header) => (
                      <th
                        key={header}
                        className={`${isRTL ? "text-right" : "text-left"} p-4 font-semibold text-[var(--color-text)]`}
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {loadingGetShiftHoursTypes ? (
                    <tr>
                      <td colSpan="6">
                        <LoadingState />
                      </td>
                    </tr>
                  ) : !shiftHoursTypes || shiftHoursTypes.length === 0 ? (
                    <tr>
                      <td colSpan="6">
                        <EmptyState />
                      </td>
                    </tr>
                  ) : (
                    shiftHoursTypes.map((item) => (
                      <tr
                        key={item.id}
                        className="border-b border-[var(--color-border)] hover:bg-[var(--color-success)] hover:text-white hover:border-[var(--color-success)] transition-colors"
                      >
                        <td className="p-4 font-semibold text-[var(--color-text)]">
                          {item.nameArabic}
                        </td>
                        <td className="p-4 text-[var(--color-text-muted)]">
                          {item.nameEnglish}
                        </td>
                        <td className="p-4">
                          <span className="text-xs font-mono px-2 py-1 rounded bg-[var(--color-surface-muted)] border border-[var(--color-border)] text-[var(--color-text)]">
                            {item.code || "N/A"}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-1">
                            <Clock size={14} className="text-[var(--color-text-muted)]" />
                            <span className="font-medium text-[var(--color-text)]">
                              {formatHours(item.hoursCount)}h
                            </span>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getPeriodBadgeClass(item.period)}`}>
                            {getPeriodDisplay(item.period)}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex gap-1">
                            <Link to={`/admin-panel/shift-hours-types/${item.id}`}>
                              <ActionButton title={t("shiftHoursTypes.actions.view")}>
                                <Eye size={16} />
                              </ActionButton>
                            </Link>
                            <Link to={`/admin-panel/shift-hours-types/edit/${item.id}`}>
                              <ActionButton title={t("shiftHoursTypes.actions.edit")} tone="success">
                                <Edit size={16} />
                              </ActionButton>
                            </Link>
                            <ActionButton
                              title={t("shiftHoursTypes.actions.delete")}
                              tone="danger"
                              onClick={() => handleDeleteClick(item)}
                            >
                              <Trash2 size={16} />
                            </ActionButton>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* ── Mobile Table (toggled) ── */}
          <div
            className={`md:hidden ${showMobileTable ? "block" : "hidden"} ${theme.card} overflow-hidden`}
          >
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--color-border)] bg-[var(--color-surface-muted)]">
                    <th className="text-center p-2 font-semibold text-[var(--color-text)]">
                      {t("shiftHoursTypes.table.name")}
                    </th>
                    <th className="text-center p-2 font-semibold text-[var(--color-text)]">
                      {t("shiftHoursTypes.table.hours")}
                    </th>
                    <th className="text-center p-2 font-semibold text-[var(--color-text)]">
                      {t("shiftHoursTypes.table.actions")}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {loadingGetShiftHoursTypes ? (
                    <tr>
                      <td colSpan="3">
                        <LoadingState small />
                      </td>
                    </tr>
                  ) : !shiftHoursTypes || shiftHoursTypes.length === 0 ? (
                    <tr>
                      <td colSpan="3">
                        <EmptyState compact />
                      </td>
                    </tr>
                  ) : (
                    shiftHoursTypes.map((item) => (
                      <tr
                        key={item.id}
                        className="border-b border-[var(--color-border)] hover:bg-[var(--color-success)] hover:text-white hover:border-[var(--color-success)] transition-colors"
                      >
                        <td className="p-2">
                          <div className="font-semibold text-xs text-[var(--color-text)]">
                            {language === "ar" ? item.nameArabic : item.nameEnglish}
                          </div>
                          <div className="text-xs text-[var(--color-text-muted)]">
                            {item.code || "N/A"}
                          </div>
                        </td>
                        <td className="p-2">
                          <div className="flex items-center gap-1">
                            <Clock size={12} className="text-[var(--color-text-muted)]" />
                            <span className="text-sm font-medium text-[var(--color-text)]">
                              {formatHours(item.hoursCountCount)}h
                            </span>
                          </div>
                          <div className="text-xs text-[var(--color-text-muted)]">
                            {getPeriodDisplay(item.period)}
                          </div>
                        </td>
                        <td className="p-2">
                          <div className="flex gap-1 justify-center">
                            <Link to={`/admin-panel/shift-hours-types/${item.id}`}>
                              <ActionButton title={t("shiftHoursTypes.actions.view")}>
                                <Eye size={14} />
                              </ActionButton>
                            </Link>
                            <Link to={`/admin-panel/shift-hours-types/edit/${item.id}`}>
                              <ActionButton title={t("shiftHoursTypes.actions.edit")} tone="success">
                                <Edit size={14} />
                              </ActionButton>
                            </Link>
                            <ActionButton
                              title={t("shiftHoursTypes.actions.delete")}
                              tone="danger"
                              onClick={() => handleDeleteClick(item)}
                            >
                              <Trash2 size={14} />
                            </ActionButton>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* ── Pagination ── */}
          {pagination && pagination.totalPages > 1 && (
            <div className={`${theme.card} p-4 mt-6`}>
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex flex-col sm:flex-row items-center gap-4 text-sm">
                  <span className="text-[var(--color-text-muted)]">
                    {t("shiftHoursTypes.pagination.showing")}{" "}
                    {(pagination.page - 1) * pagination.pageSize + 1} -{" "}
                    {Math.min(pagination.page * pagination.pageSize, pagination.totalCount)}{" "}
                    {t("shiftHoursTypes.pagination.of")} {pagination.totalCount}{" "}
                    {t("shiftHoursTypes.pagination.items")}
                  </span>

                  <div className="flex items-center gap-2">
                    <select
                      value={pagination.pageSize}
                      onChange={(e) => handlePageSizeChange(e.target.value)}
                      className={`p-1 text-sm ${theme.input}`}
                    >
                      {[5, 10, 20, 50].map((n) => (
                        <option key={n} value={n}>{n}</option>
                      ))}
                    </select>
                    <span className="text-[var(--color-text-muted)]">
                      {t("shiftHoursTypes.pagination.itemsPerPage")}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1 sm:gap-2">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={!pagination.hasPreviousPage}
                    className="p-2 rounded-lg border border-[var(--color-border)] hover:bg-[var(--color-success)] hover:text-white hover:border-[var(--color-success)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    type="button"
                  >
                    <ChevronRight size={16} />
                  </button>

                  {getPageNumbers().map((pageNum) => (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`px-2 sm:px-3 py-2 rounded-lg transition-colors text-sm border ${
                        pageNum === pagination.page
                          ? selectedButtonClass
                          : "border-[var(--color-border)] hover:bg-[var(--color-success)] hover:text-white hover:border-[var(--color-success)] text-[var(--color-text)]"
                      }`}
                      type="button"
                    >
                      {pageNum}
                    </button>
                  ))}

                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={!pagination.hasNextPage}
                    className="p-2 rounded-lg border border-[var(--color-border)] hover:bg-[var(--color-success)] hover:text-white hover:border-[var(--color-success)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    type="button"
                  >
                    <ChevronLeft size={16} />
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

export default ShiftHours
