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
  Users,
  Clock,
  Hash,
  Calendar,
  FileText,
  CheckCircle,
  XCircle,
} from "lucide-react"

import { getContractingTypes } from "../../../state/act/actContractingType"
import {
  clearError,
  setCurrentPage,
  setPageSize,
  setSearchFilter,
  setStatusFilter,
  setOvertimeFilter,
  setHoursRangeFilter,
  setDateRangeFilter,
  setSortFilter,
  clearFilters,
} from "../../../state/slices/contractingType"

import { Link } from "react-router-dom"
import DeleteContractingTypeModal from "../../../components/modals/DeleteContractingType"
import { getPageTheme } from "../../../utils/themeClasses"
import "../../../styles/general.css"

function ContractingTypes() {
  const { t, i18n } = useTranslation()
  const dispatch = useDispatch()
  const theme = getPageTheme()

  const [modalOpen, setModalOpen] = useState(false)
  const [toDelete, setToDelete] = useState({ id: null, name: "" })
  const [showFilters, setShowFilters] = useState(false)
  const [showMobileTable, setShowMobileTable] = useState(false)

  const [searchInput, setSearchInput] = useState("")
  const [minHoursInput, setMinHoursInput] = useState("")
  const [maxHoursInput, setMaxHoursInput] = useState("")
  const [fromDateInput, setFromDateInput] = useState("")
  const [toDateInput, setToDateInput] = useState("")
  const [searchTimeout, setSearchTimeout] = useState(null)

  const {
    contractingTypes,
    pagination,
    filters,
    loadingGetContractingTypes,
    error,
  } = useSelector((state) => state.contractingType)

  const language = i18n.language
  const isRTL = language === "ar"

  const defaultButtonClass =
    "inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border bg-[var(--color-surface)] text-[var(--color-text)] border-[var(--color-border-strong)] hover:bg-[var(--color-success)] hover:text-white hover:border-[var(--color-success)] active:bg-[var(--color-success-hover)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"

  const createButtonClass =
    "inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border bg-[var(--color-success)] text-white border-[var(--color-success)] hover:bg-[var(--color-success-hover)] hover:border-[var(--color-success-hover)] active:scale-[0.98] transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"

  const selectedButtonClass =
    "inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border bg-[var(--color-success)] text-white border-[var(--color-success)] transition-colors"

  useEffect(() => {
    setSearchInput(filters.search || "")
    setMinHoursInput(filters.minHoursPerWeek || "")
    setMaxHoursInput(filters.maxHoursPerWeek || "")
    setFromDateInput(filters.createdFromDate || "")
    setToDateInput(filters.createdToDate || "")
  }, [filters])

  useEffect(() => {
    const params = {
      search: filters.search,
      allowOvertimeHours: filters.allowOvertimeHours,
      minHoursPerWeek: filters.minHoursPerWeek,
      maxHoursPerWeek: filters.maxHoursPerWeek,
      statusFilter: filters.statusFilter,
      createdFromDate: filters.createdFromDate,
      createdToDate: filters.createdToDate,
      sortBy: filters.sortBy,
      sortDirection: filters.sortDirection,
      page: filters.page,
      pageSize: filters.pageSize,
    }

    dispatch(getContractingTypes(params))
  }, [dispatch, filters])

  useEffect(() => {
    dispatch(clearError())
  }, [dispatch])

  const handleSearchChange = useCallback(
    (value) => {
      setSearchInput(value)

      if (searchTimeout) {
        clearTimeout(searchTimeout)
      }

      const timeout = setTimeout(() => {
        dispatch(setSearchFilter(value))
      }, 500)

      setSearchTimeout(timeout)
    },
    [dispatch, searchTimeout]
  )

  const handlePageChange = (newPage) => {
    dispatch(setCurrentPage(newPage))
  }

  const handlePageSizeChange = (newPageSize) => {
    dispatch(setPageSize(parseInt(newPageSize)))
  }

  const handleStatusChange = (value) => {
    dispatch(setStatusFilter(value))
  }

  const handleOvertimeChange = (value) => {
    const overtimeValue = value === "" ? undefined : value === "true"
    dispatch(setOvertimeFilter(overtimeValue))
  }

  const handleHoursRangeChange = () => {
    const minHours = minHoursInput === "" ? undefined : parseInt(minHoursInput)
    const maxHours = maxHoursInput === "" ? undefined : parseInt(maxHoursInput)
    dispatch(setHoursRangeFilter({ minHours, maxHours }))
  }

  const handleDateRangeChange = () => {
    dispatch(
      setDateRangeFilter({
        fromDate: fromDateInput,
        toDate: toDateInput,
      })
    )
  }

  const handleSortChange = (sortBy, sortDirection) => {
    dispatch(setSortFilter({ sortBy, sortDirection }))
  }

  const handleClearFilters = () => {
    dispatch(clearFilters())
    setSearchInput("")
    setMinHoursInput("")
    setMaxHoursInput("")
    setFromDateInput("")
    setToDateInput("")
  }

  const handleDeleteClick = (contractingType) => {
    const name =
      language === "ar"
        ? contractingType.nameArabic
        : contractingType.nameEnglish

    setToDelete({ id: contractingType.id, name })
    setModalOpen(true)
  }

  const getPageNumbers = () => {
    const pages = []
    const totalPages = pagination?.totalPages || 1
    const currentPage = pagination?.page || 1
    const maxPages = window.innerWidth < 768 ? 3 : 5

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

  const formatHours = (hours) => {
    if (hours === null || hours === undefined || hours === "") return "0"
    return parseFloat(hours).toString()
  }

  const getOvertimeBadgeClass = (allowed) => {
    if (allowed === true) {
      return "bg-transparent text-emerald-500 border-2 border-emerald-500"
    }

    if (allowed === false) {
      return "bg-transparent text-red-500 border-2 border-red-500"
    }

    return "bg-transparent text-slate-500 border-2 border-slate-500"
  }

  const getStatusBadgeClass = (active) => {
    if (active === true) {
      return "bg-transparent text-emerald-500 border-2 border-emerald-500"
    }

    if (active === false) {
      return "bg-transparent text-red-500 border-2 border-red-500"
    }

    return "bg-transparent text-slate-500 border-2 border-slate-500"
  }

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

  const LoadingState = ({ small = false }) => (
    <div className="text-center p-8">
      <div className="flex items-center justify-center">
        <div
          className={`animate-spin rounded-full border-b-2 border-[var(--color-success)] ${
            small ? "h-6 w-6" : "h-8 w-8"
          }`}
        />

        <span
          className={`${
            isRTL ? "mr-3" : "ml-3"
          } text-[var(--color-text-muted)]`}
        >
          {t("gettingData.contractingTypes")}
        </span>
      </div>
    </div>
  )

  const EmptyState = ({ compact = false }) => (
    <div className={`text-center ${compact ? "p-8" : "p-12"}`}>
      <div className="w-14 h-14 bg-transparent rounded-full border-2 border-slate-500 text-slate-500 flex items-center justify-center mx-auto mb-4 shadow-sm">
        <FileText size={compact ? 24 : 32} />
      </div>

      <h3
        className={`font-semibold text-[var(--color-text)] mb-2 ${
          compact ? "text-base" : "text-lg"
        }`}
      >
        {t("contractingTypes.noData")}
      </h3>
    </div>
  )

  const ContractingTypeCard = ({ contractingType }) => (
    <div className={`${theme.card} p-4 mb-3`}>
      <div className="flex justify-between items-start mb-3 gap-3">
        <div className="flex-1">
          <h3 className="font-semibold text-lg text-[var(--color-text)]">
            {language === "en"
              ? contractingType.nameEnglish
              : contractingType.nameArabic}
          </h3>

          <p className="text-sm text-[var(--color-text-muted)]">
            {language === "en"
              ? contractingType.nameArabic
              : contractingType.nameEnglish}
          </p>

          {contractingType.code && (
            <div className="flex items-center mt-1 gap-1">
              <Hash className="h-3 w-3 text-[var(--color-text-muted)]" />

              <span className="text-xs font-mono px-2 py-0.5 rounded bg-[var(--color-surface-muted)] border border-[var(--color-border)] text-[var(--color-text)]">
                {contractingType.code}
              </span>
            </div>
          )}
        </div>

        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${getOvertimeBadgeClass(
            contractingType.allowOvertimeHours
          )}`}
        >
          {contractingType.allowOvertimeHours
            ? t("contractingTypes.overtime.allowed")
            : t("contractingTypes.overtime.notAllowed")}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 text-sm mb-3">
        <div className="flex items-center gap-2">
          <Users size={14} className="text-[var(--color-text-muted)]" />
          <span className="text-[var(--color-text-muted)]">
            {t("contractingTypes.table.users")}:
          </span>
          <span className="font-semibold text-[var(--color-text)]">
            {contractingType.usersCount || 0}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Clock size={14} className="text-[var(--color-text-muted)]" />
          <span className="text-[var(--color-text-muted)]">
            {t("contractingTypes.table.maxHours") ||
              t("contractingTypes.filters.maxHours")}
            :
          </span>
          <span className="font-semibold text-[var(--color-text)]">
            {formatHours(contractingType.maxHoursPerWeek)}h
          </span>
        </div>

        {contractingType.createdAt && (
          <div className="flex items-center gap-2 col-span-2">
            <Calendar size={14} className="text-[var(--color-text-muted)]" />
            <span className="text-[var(--color-text-muted)]">
              {t("contractingTypes.table.createdAt")}:
            </span>
            <span className="text-xs text-[var(--color-text)]">
              {contractingType.createdAt}
            </span>
          </div>
        )}
      </div>

      <div className="flex gap-2 justify-end">
        <Link to={`/admin-panel/contracting-types/${contractingType.id}`}>
          <ActionButton title={t("contractingTypes.actions.view")}>
            <Eye size={16} />
          </ActionButton>
        </Link>

        <Link to={`/admin-panel/contracting-types/edit/${contractingType.id}`}>
          <ActionButton
            title={t("contractingTypes.actions.edit")}
            tone="success"
          >
            <Edit size={16} />
          </ActionButton>
        </Link>

        <ActionButton
          title={t("contractingTypes.actions.delete")}
          tone="danger"
          onClick={() => handleDeleteClick(contractingType)}
        >
          <Trash2 size={16} />
        </ActionButton>
      </div>
    </div>
  )

  return (
    <div className={theme.page} dir={isRTL ? "rtl" : "ltr"}>
      <DeleteContractingTypeModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        contractingTypeId={toDelete.id}
        info={toDelete}
        contractingTypeName={toDelete.name}
      />

      <div className="p-4 sm:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
              <h1 className="text-2xl sm:text-3xl font-bold text-[var(--color-text)]">
                {t("contractingTypes.title")}
              </h1>

              <div className="flex gap-2 w-full sm:w-auto">
                <Link to="/admin-panel/contracting-types/create">
                  <button
                    className={`${createButtonClass} flex-1 sm:flex-none`}
                  >
                    <Plus size={20} />

                    <span className="hidden sm:inline">
                      {t("contractingTypes.addNew")}
                    </span>

                    <span className="sm:hidden">
                      {t("contractingTypes.add")}
                    </span>
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

          <div className={`${theme.card} mb-6`}>
            <div className="p-4">
              <div className="flex flex-col sm:flex-row gap-4 mb-4">
                <div className="flex-1 flex items-center gap-2">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg border-2 border-blue-500 bg-transparent text-blue-500 shadow-sm shrink-0">
                    <Search size={20} />
                  </div>

                  <input
                    type="text"
                    placeholder={t("contractingTypes.search.placeholder")}
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
                  {t("contractingTypes.filters.title")}
                </button>
              </div>

              {showFilters && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 border-t border-[var(--color-border)]">
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-[var(--color-text)]">
                      {t("contractingTypes.filters.status")}
                    </label>

                    <select
                      value={filters.statusFilter}
                      onChange={(e) => handleStatusChange(e.target.value)}
                      className={`w-full p-2 ${theme.input}`}
                    >
                      <option value={true}>
                        {t("contractingTypes.status.active")}
                      </option>

                      <option value={false}>
                        {t("contractingTypes.status.inactive")}
                      </option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2 text-[var(--color-text)]">
                      {t("contractingTypes.filters.overtime")}
                    </label>

                    <select
                      value={
                        filters.allowOvertimeHours === undefined
                          ? ""
                          : filters.allowOvertimeHours.toString()
                      }
                      onChange={(e) => handleOvertimeChange(e.target.value)}
                      className={`w-full p-2 ${theme.input}`}
                    >
                      <option value="">
                        {t("contractingTypes.filters.allOvertimes")}
                      </option>

                      <option value="true">
                        {t("contractingTypes.overtime.allowed")}
                      </option>

                      <option value="false">
                        {t("contractingTypes.overtime.notAllowed")}
                      </option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2 text-[var(--color-text)]">
                      {t("contractingTypes.filters.sortBy")}
                    </label>

                    <select
                      value={filters.sortBy}
                      onChange={(e) =>
                        handleSortChange(
                          parseInt(e.target.value),
                          filters.sortDirection
                        )
                      }
                      className={`w-full p-2 ${theme.input}`}
                    >
                      <option value={1}>
                        {t("contractingTypes.filters.sortByOptions.nameArabic")}
                      </option>

                      <option value={2}>
                        {t(
                          "contractingTypes.filters.sortByOptions.nameEnglish"
                        )}
                      </option>

                      <option value={3}>
                        {t(
                          "contractingTypes.filters.sortByOptions.allowOvertime"
                        )}
                      </option>

                      <option value={4}>
                        {t("contractingTypes.filters.sortByOptions.maxHours")}
                      </option>

                      <option value={6}>
                        {t("contractingTypes.filters.sortByOptions.createdAt")}
                      </option>

                      <option value={7}>
                        {t("contractingTypes.filters.sortByOptions.updatedAt")}
                      </option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2 text-[var(--color-text)]">
                      {t("contractingTypes.filters.sortDirection")}
                    </label>

                    <select
                      value={filters.sortDirection}
                      onChange={(e) =>
                        handleSortChange(
                          filters.sortBy,
                          parseInt(e.target.value)
                        )
                      }
                      className={`w-full p-2 ${theme.input}`}
                    >
                      <option value={0}>
                        {t("contractingTypes.filters.ascending")}
                      </option>

                      <option value={1}>
                        {t("contractingTypes.filters.descending")}
                      </option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2 text-[var(--color-text)]">
                      {t("contractingTypes.filters.minHours")}
                    </label>

                    <input
                      type="number"
                      placeholder={t("contractingTypes.filters.minHours")}
                      value={minHoursInput}
                      onChange={(e) => setMinHoursInput(e.target.value)}
                      onBlur={handleHoursRangeChange}
                      className={`w-full px-4 py-2 ${theme.input}`}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2 text-[var(--color-text)]">
                      {t("contractingTypes.filters.maxHours")}
                    </label>

                    <input
                      type="number"
                      placeholder={t("contractingTypes.filters.maxHours")}
                      value={maxHoursInput}
                      onChange={(e) => setMaxHoursInput(e.target.value)}
                      onBlur={handleHoursRangeChange}
                      className={`w-full px-4 py-2 ${theme.input}`}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2 text-[var(--color-text)]">
                      {t("contractingTypes.filters.fromDate")}
                    </label>

                    <input
                      type="date"
                      value={fromDateInput}
                      onChange={(e) => setFromDateInput(e.target.value)}
                      onBlur={handleDateRangeChange}
                      className={`w-full px-4 py-2 ${theme.input}`}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2 text-[var(--color-text)]">
                      {t("contractingTypes.filters.toDate")}
                    </label>

                    <input
                      type="date"
                      value={toDateInput}
                      onChange={(e) => setToDateInput(e.target.value)}
                      onBlur={handleDateRangeChange}
                      className={`w-full px-4 py-2 ${theme.input}`}
                    />
                  </div>

                  <div className="sm:col-span-2 lg:col-span-3">
                    <button
                      onClick={handleClearFilters}
                      className={defaultButtonClass}
                      type="button"
                    >
                      {t("contractingTypes.filters.clear")}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className={`md:hidden ${showMobileTable ? "hidden" : "block"}`}>
            {loadingGetContractingTypes ? (
              <LoadingState />
            ) : !contractingTypes || contractingTypes.length === 0 ? (
              <EmptyState />
            ) : (
              contractingTypes.map((contractingType) => (
                <ContractingTypeCard
                  key={contractingType.id}
                  contractingType={contractingType}
                />
              ))
            )}
          </div>

          <div
            className={`hidden md:block ${showMobileTable ? "md:hidden" : ""} ${
              theme.card
            } overflow-hidden`}
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[var(--color-border)] bg-[var(--color-surface-muted)]">
                    {[
                      t("contractingTypes.table.nameArabic"),
                      t("contractingTypes.table.nameEnglish"),
                      t("contractingTypes.table.users"),
                      t("contractingTypes.table.maxHours") ||
                        t("contractingTypes.filters.maxHours"),
                      t("contractingTypes.filters.overtime"),
                      t("contractingTypes.table.actions"),
                    ].map((header) => (
                      <th
                        key={header}
                        className={`${
                          isRTL ? "text-right" : "text-left"
                        } p-4 font-semibold text-[var(--color-text)]`}
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {loadingGetContractingTypes ? (
                    <tr>
                      <td colSpan="6">
                        <LoadingState />
                      </td>
                    </tr>
                  ) : !contractingTypes || contractingTypes.length === 0 ? (
                    <tr>
                      <td colSpan="6">
                        <EmptyState />
                      </td>
                    </tr>
                  ) : (
                    contractingTypes.map((contractingType) => (
                      <tr
                        key={contractingType.id}
                        className="border-b border-[var(--color-border)] hover:bg-[var(--color-success)] hover:text-white hover:border-[var(--color-success)] transition-colors"
                      >
                        <td className="p-4 font-semibold text-[var(--color-text)]">
                          {contractingType.nameArabic}
                        </td>

                        <td className="p-4 text-[var(--color-text)]">
                          {contractingType.nameEnglish}
                        </td>

                        <td className="p-4 text-[var(--color-text-muted)]">
                          <div className="flex items-center gap-1">
                            <Users size={16} />
                            {contractingType.usersCount || 0}
                          </div>
                        </td>

                        <td className="p-4">
                          <div className="flex items-center gap-1">
                            <Clock
                              size={14}
                              className="text-[var(--color-text-muted)]"
                            />

                            <span className="font-medium text-[var(--color-text)]">
                              {formatHours(contractingType.maxHoursPerWeek)}h
                            </span>
                          </div>
                        </td>

                        <td className="p-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${getOvertimeBadgeClass(
                              contractingType.allowOvertimeHours
                            )}`}
                          >
                            {contractingType.allowOvertimeHours ? (
                              <CheckCircle size={13} />
                            ) : (
                              <XCircle size={13} />
                            )}

                            {contractingType.allowOvertimeHours
                              ? t("contractingTypes.overtime.allowed")
                              : t("contractingTypes.overtime.notAllowed")}
                          </span>
                        </td>

                        <td className="p-4">
                          <div className="flex gap-1">
                            <Link
                              to={`/admin-panel/contracting-types/${contractingType.id}`}
                            >
                              <ActionButton
                                title={t("contractingTypes.actions.view")}
                              >
                                <Eye size={16} />
                              </ActionButton>
                            </Link>

                            <Link
                              to={`/admin-panel/contracting-types/edit/${contractingType.id}`}
                            >
                              <ActionButton
                                title={t("contractingTypes.actions.edit")}
                                tone="success"
                              >
                                <Edit size={16} />
                              </ActionButton>
                            </Link>

                            <ActionButton
                              title={t("contractingTypes.actions.delete")}
                              tone="danger"
                              onClick={() => handleDeleteClick(contractingType)}
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

          <div
            className={`md:hidden ${showMobileTable ? "block" : "hidden"} ${
              theme.card
            } overflow-hidden`}
          >
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--color-border)] bg-[var(--color-surface-muted)]">
                    <th className="text-center p-2 font-semibold text-[var(--color-text)]">
                      {t("contractingTypes.table.name")}
                    </th>

                    <th className="text-center p-2 font-semibold text-[var(--color-text)]">
                      {t("contractingTypes.table.users")}
                    </th>

                    <th className="text-center p-2 font-semibold text-[var(--color-text)]">
                      {t("contractingTypes.table.actions")}
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {loadingGetContractingTypes ? (
                    <tr>
                      <td colSpan="3">
                        <LoadingState small />
                      </td>
                    </tr>
                  ) : !contractingTypes || contractingTypes.length === 0 ? (
                    <tr>
                      <td colSpan="3">
                        <EmptyState compact />
                      </td>
                    </tr>
                  ) : (
                    contractingTypes.map((contractingType) => (
                      <tr
                        key={contractingType.id}
                        className="border-b border-[var(--color-border)] hover:bg-[var(--color-success)] hover:text-white hover:border-[var(--color-success)] transition-colors"
                      >
                        <td className="p-2">
                          <div className="font-semibold text-xs text-[var(--color-text)]">
                            {language === "ar"
                              ? contractingType.nameArabic
                              : contractingType.nameEnglish}
                          </div>

                          <div className="text-xs text-[var(--color-text-muted)]">
                            {language === "ar"
                              ? contractingType.nameEnglish
                              : contractingType.nameArabic}
                          </div>
                        </td>

                        <td className="p-2">
                          <div className="flex items-center justify-center gap-1">
                            <Users
                              size={12}
                              className="text-[var(--color-text-muted)]"
                            />

                            <span className="text-sm font-medium text-[var(--color-text)]">
                              {contractingType.usersCount || 0}
                            </span>
                          </div>

                          <div className="text-xs text-[var(--color-text-muted)] text-center">
                            {formatHours(contractingType.maxHoursPerWeek)}h
                          </div>
                        </td>

                        <td className="p-2">
                          <div className="flex gap-1 justify-center">
                            <Link
                              to={`/admin-panel/contracting-types/${contractingType.id}`}
                            >
                              <ActionButton
                                title={t("contractingTypes.actions.view")}
                              >
                                <Eye size={14} />
                              </ActionButton>
                            </Link>

                            <Link
                              to={`/admin-panel/contracting-types/edit/${contractingType.id}`}
                            >
                              <ActionButton
                                title={t("contractingTypes.actions.edit")}
                                tone="success"
                              >
                                <Edit size={14} />
                              </ActionButton>
                            </Link>

                            <ActionButton
                              title={t("contractingTypes.actions.delete")}
                              tone="danger"
                              onClick={() => handleDeleteClick(contractingType)}
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

          {pagination && pagination.totalPages > 1 && (
            <div className={`${theme.card} p-4 mt-6`}>
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex flex-col sm:flex-row items-center gap-4 text-sm">
                  <span className="text-[var(--color-text-muted)]">
                    {t("contractingTypes.pagination.showing")}{" "}
                    <span className="font-medium">
                      {(pagination.page - 1) * pagination.pageSize + 1}
                    </span>{" "}
                    {t("contractingTypes.pagination.to")}{" "}
                    <span className="font-medium">
                      {Math.min(
                        pagination.page * pagination.pageSize,
                        pagination.totalCount
                      )}
                    </span>{" "}
                    {t("contractingTypes.pagination.of")}{" "}
                    <span className="font-medium">
                      {pagination.totalCount}
                    </span>{" "}
                    {t("contractingTypes.pagination.results")}
                  </span>

                  <div className="flex items-center gap-2">
                    <select
                      value={pagination.pageSize}
                      onChange={(e) => handlePageSizeChange(e.target.value)}
                      className={`p-1 text-sm ${theme.input}`}
                    >
                      {[5, 10, 20, 50].map((n) => (
                        <option key={n} value={n}>
                          {n}
                        </option>
                      ))}
                    </select>

                    <span className="text-[var(--color-text-muted)]">
                      {t("contractingTypes.pagination.perPage")}
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
                    <ChevronLeft size={16} />
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
                    <ChevronRight size={16} />
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

export default ContractingTypes