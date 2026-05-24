import React, { useEffect, useState, useCallback } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useTranslation } from "react-i18next"
import "../../../styles/general.css"

import {
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Eye,
  Edit,
  Plus,
  Menu,
  X,
  FileText,
  Calendar,
  Users,
  BarChart3,
} from "lucide-react"

import {
  clearAllErrors,
  clearFilters,
  setCurrentPage,
  setFilters,
  setPageSize,
} from "../../../state/slices/roster"

import { Link, useNavigate } from "react-router-dom"
import { getRostersPaged } from "../../../state/act/actRosterManagement"
import ModalUpdateRosterStatus from "../../../components/modals/ModalUpdateRosterStatus"
import ModalDeleteRoster from "../../../components/modals/ModalDeleteRoster"
import { formatDate } from "../../../utils/formtDate"
import { getPageTheme } from "../../../utils/themeClasses"

function Roster() {
  const { t, i18n } = useTranslation()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const theme = getPageTheme()

  const [statusModalOpen, setStatusModalOpen] = useState(false)
  const [openDeleteModal, setOpenDeleteModal] = useState(false)
  const [toDelete, setToDelete] = useState({ id: null, name: "" })
  const [statusToUpdate, setStatusToUpdate] = useState({
    id: null,
    title: "",
    currentStatus: "",
  })
  const [searchInput, setSearchInput] = useState("")
  const [showFilters, setShowFilters] = useState(false)
  const [showMobileTable, setShowMobileTable] = useState(false)
  const [searchTimeout, setSearchTimeout] = useState(null)

  const { rosterList, pagination, loading, errors, ui } = useSelector(
    (state) => state.rosterManagement
  )

  const language = i18n.language
  const isRTL = language === "ar"

  useEffect(() => {
    setSearchInput(ui.filters.search || "")
  }, [ui.filters.search])

  useEffect(() => {
    const params = {
      page: pagination.currentPage || 1,
      pageSize: pagination.pageSize || 10,
      ...ui.filters,
    }

    Object.keys(params).forEach((key) => {
      if (
        params[key] === null ||
        params[key] === undefined ||
        params[key] === ""
      ) {
        delete params[key]
      }
    })

    dispatch(getRostersPaged(params))
  }, [dispatch, ui.filters, pagination.currentPage, pagination.pageSize])

  const handleSearchChange = useCallback(
    (value) => {
      setSearchInput(value)

      if (searchTimeout) {
        clearTimeout(searchTimeout)
      }

      const timeout = setTimeout(() => {
        dispatch(setFilters({ searchTerm: value }))
        dispatch(setCurrentPage(1))
      }, 500)

      setSearchTimeout(timeout)
    },
    [dispatch, searchTimeout]
  )

  const handleFilterChange = (key, value) => {
    dispatch(setFilters({ [key]: value }))
    dispatch(setCurrentPage(1))
  }

  const handlePageChange = (newPage) => {
    dispatch(setCurrentPage(newPage))
  }

  const handlePageSizeChange = (newPageSize) => {
    dispatch(setPageSize(parseInt(newPageSize)))
  }

  const formatMonthYear = (month, year) => {
    const monthNames = {
      ar: [
        "يناير",
        "فبراير",
        "مارس",
        "أبريل",
        "مايو",
        "يونيو",
        "يوليو",
        "أغسطس",
        "سبتمبر",
        "أكتوبر",
        "نوفمبر",
        "ديسمبر",
      ],
      en: [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ],
    }

    const months = monthNames[language] || monthNames.en
    return `${months[month - 1]} ${year}`
  }

  const getStatusInfo = (status) => {
    const statusMap = {
      DRAFT_BASIC: {
        color:
          "bg-[var(--color-bg-soft)] text-[var(--color-text-muted)] border border-[var(--color-border)]",
        name: t("roster.status.draftBasic"),
      },
      DRAFT_PARTIAL: {
        color:
          "bg-[var(--color-warning-soft)] text-[var(--color-warning)] border border-[var(--color-warning)]/20",
        name: t("roster.status.draftPartial"),
      },
      DRAFT: {
        color:
          "bg-[var(--color-info-soft)] text-[var(--color-info)] border border-[var(--color-info)]/20",
        name: t("roster.status.draft"),
      },
      DRAFT_READY: {
        color:
          "bg-[var(--color-primary-soft)] text-[var(--color-primary)] border border-[var(--color-primary)]/20",
        name: t("roster.status.draftReady"),
      },
      PUBLISHED: {
        color:
          "bg-[var(--color-success-soft)] text-[var(--color-success)] border border-[var(--color-success)]/20",
        name: t("roster.status.published"),
      },
      CLOSED: {
        color:
          "bg-[var(--color-warning-soft)] text-[var(--color-warning)] border border-[var(--color-warning)]/20",
        name: t("roster.status.closed"),
      },
      ARCHIVED: {
        color:
          "bg-[var(--color-danger-soft)] text-[var(--color-danger)] border border-[var(--color-danger)]/20",
        name: t("roster.status.archived"),
      },
    }

    return (
      statusMap[status] || {
        color:
          "bg-[var(--color-bg-soft)] text-[var(--color-text-muted)] border border-[var(--color-border)]",
        name: status,
      }
    )
  }

  const getPageNumbers = () => {
    const pages = []
    const totalPages = pagination?.totalPages || 1
    const currentPage = pagination?.currentPage || 1

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

  const ActionButton = ({ children, title, tone = "primary", onClick }) => {
    const toneClasses = {
      primary:
        "text-[var(--color-primary)] hover:bg-[var(--color-primary-soft)]",
      warning:
        "text-[var(--color-warning)] hover:bg-[var(--color-warning-soft)]",
      success:
        "text-[var(--color-success)] hover:bg-[var(--color-success-soft)]",
      danger: "text-[var(--color-danger)] hover:bg-[var(--color-danger-soft)]",
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

  const EmptyState = ({ compact = false }) => (
    <div className={`text-center ${compact ? "p-8" : "p-12"}`}>
      <div className="w-14 h-14 bg-[var(--color-bg-soft)] rounded-full flex items-center justify-center mx-auto mb-4">
        <FileText
          size={compact ? 24 : 32}
          className="text-[var(--color-text-soft)]"
        />
      </div>

      <h3
        className={`font-semibold text-[var(--color-text)] mb-2 ${
          compact ? "text-base" : "text-lg"
        }`}
      >
        {t("roster.noRosters")}
      </h3>

      <p className="text-sm text-[var(--color-text-muted)] mb-4">
        {t("roster.createFirstRoster")}
      </p>

      {compact && (
        <button
          onClick={() => navigate("/admin-panel/rosters/create")}
          className={`${theme.primaryButton} text-sm`}
          type="button"
        >
          <Plus size={14} className={isRTL ? "ml-1" : "mr-1"} />
          {t("roster.actions.create")}
        </button>
      )}
    </div>
  )

  const LoadingState = ({ small = false }) => (
    <div className="text-center p-8">
      <div className="flex items-center justify-center">
        <div
          className={`animate-spin rounded-full border-b-2 border-[var(--color-primary)] ${
            small ? "h-6 w-6" : "h-8 w-8"
          }`}
        />
        <span
          className={`${isRTL ? "mr-3" : "ml-3"} text-[var(--color-text-muted)]`}
        >
          {t("gettingData.rosters")}
        </span>
      </div>
    </div>
  )

  const RosterCard = ({ roster }) => {
    const statusInfo = getStatusInfo(roster.status)

    return (
      <div className={`${theme.card} p-4 mb-3`}>
        <div className="flex justify-between items-start mb-3 gap-3">
          <div className="flex-1">
            <h3 className="font-semibold text-lg mb-1 text-[var(--color-text)]">
              {roster.title}
            </h3>

            <p className="text-sm mb-2 text-[var(--color-text-muted)]">
              {formatMonthYear(roster.month, roster.year)}
            </p>

            <div className="flex items-center gap-2 text-xs text-[var(--color-text-muted)] mb-1">
              <Users size={12} />
              <span>
                {roster.departmentsCount} {t("roster.departments")}
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs text-[var(--color-text-muted)]">
              <Calendar size={12} />
              <span>
                {roster.totalDays} {t("roster.dayss")}
              </span>
            </div>
          </div>

          <button
            onClick={() => {
              setStatusToUpdate({
                id: roster.id,
                title: roster.title,
                currentStatus: roster.status,
              })
              setStatusModalOpen(true)
            }}
            className={`px-2 py-1 rounded-full text-xs font-medium transition-colors hover:opacity-80 ${statusInfo.color}`}
            title={t("roster.actions.updateStatus")}
            type="button"
          >
            {statusInfo.name}
          </button>
        </div>

        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-[var(--color-text)]">
            {roster.categoryName}
          </span>
        </div>

        <div className="text-sm mb-3">
          <span className="font-medium text-[var(--color-text)]">
            {t("roster.table.createdAt")}:
          </span>
          <span className={`${isRTL ? "mr-2" : "ml-2"} text-[var(--color-text-muted)]`}>
            {formatDate(roster.createdAt)}
          </span>
        </div>

        <div className="flex gap-2 justify-end">
          <Link to={`/admin-panel/rosters/${roster.id}`}>
            <ActionButton title={t("roster.actions.view")}>
              <Eye size={16} />
            </ActionButton>
          </Link>

          <ActionButton
            title={t("roster.actions.updateStatus")}
            tone="warning"
            onClick={() => {
              setStatusToUpdate({
                id: roster.id,
                title: roster.title,
                currentStatus: roster.status,
              })
              setStatusModalOpen(true)
            }}
          >
            <BarChart3 size={16} />
          </ActionButton>

          <Link to={`/admin-panel/rosters/${roster.id}/edit`}>
            <ActionButton title={t("roster.actions.edit")} tone="success">
              <Edit size={16} />
            </ActionButton>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className={theme.page} dir={isRTL ? "rtl" : "ltr"}>
      <div className={theme.container}>
        {statusModalOpen && (
          <ModalUpdateRosterStatus
            setStatusModalOpen={setStatusModalOpen}
            statusToUpdate={statusToUpdate}
            setStatusToUpdate={setStatusToUpdate}
          />
        )}

        <div className="mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
            <h1 className="text-2xl sm:text-3xl font-bold text-[var(--color-text)]">
              {t("roster.title")}
            </h1>

            <div className="flex gap-2 w-full sm:w-auto">
              <button
                onClick={() => setShowMobileTable(!showMobileTable)}
                className={`md:hidden px-3 py-2 rounded-lg border transition-colors ${
                  showMobileTable
                    ? "bg-[var(--color-primary-soft)] border-[var(--color-primary)] text-[var(--color-primary)]"
                    : "border-[var(--color-border)] text-[var(--color-text)] hover:bg-[var(--color-bg-soft)]"
                }`}
                type="button"
              >
                {showMobileTable ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>

          {errors?.general && (
            <div className="bg-[var(--color-danger-soft)] border border-[var(--color-danger)]/30 text-[var(--color-danger)] px-4 py-3 rounded-xl mb-4">
              <div className="flex justify-between items-center gap-4">
                <span>{errors.general}</span>
                <button
                  onClick={() => dispatch(clearAllErrors())}
                  className="text-[var(--color-danger)] hover:opacity-80 text-xl leading-none"
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
                <div className="flex items-center justify-center w-10 h-10 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-muted)] text-[var(--color-text-muted)]">
                  <Search size={20} />
                </div>

                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder={t("roster.filters.searchPlaceholder")}
                    value={searchInput}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className={`w-full px-4 py-2 ${theme.input}`}
                  />
                </div>
              </div>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`px-4 py-2 rounded-lg border transition-colors flex items-center gap-2 justify-center sm:justify-start ${
                  showFilters
                    ? "bg-[var(--color-primary-soft)] border-[var(--color-primary)] text-[var(--color-primary)]"
                    : "border-[var(--color-border)] text-[var(--color-text)] hover:bg-[var(--color-bg-soft)]"
                }`}
                type="button"
              >
                <Filter size={20} />
                {t("roster.filters.title")}
              </button>
            </div>

            {showFilters && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-[var(--color-border)]">
                <div>
                  <label className="block text-sm font-medium mb-2 text-[var(--color-text)]">
                    {t("roster.filters.status")}
                  </label>
                  <select
                    value={ui.filters.status || "all"}
                    onChange={(e) => {
                      const value =
                        e.target.value === "all" ? null : e.target.value
                      handleFilterChange("status", value)
                    }}
                    className={`w-full p-2 ${theme.input}`}
                  >
                    <option value="all">{t("roster.filters.all")}</option>
                    <option value="DRAFT_BASIC">
                      {t("roster.status.draftBasic")}
                    </option>
                    <option value="DRAFT_PARTIAL">
                      {t("roster.status.draftPartial")}
                    </option>
                    <option value="DRAFT">{t("roster.status.draft")}</option>
                    <option value="DRAFT_READY">
                      {t("roster.status.draftReady")}
                    </option>
                    <option value="PUBLISHED">
                      {t("roster.status.published")}
                    </option>
                    <option value="CLOSED">
                      {t("roster.status.closed")}
                    </option>
                    <option value="ARCHIVED">
                      {t("roster.status.archived")}
                    </option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-[var(--color-text)]">
                    {t("roster.filters.year")}
                  </label>
                  <select
                    value={ui.filters.year || "all"}
                    onChange={(e) => {
                      const value =
                        e.target.value === "all"
                          ? null
                          : parseInt(e.target.value)
                      handleFilterChange("year", value)
                    }}
                    className={`w-full p-2 ${theme.input}`}
                  >
                    <option value="all">{t("roster.filters.allYears")}</option>
                    {[2024, 2025, 2026].map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-[var(--color-text)]">
                    {t("roster.filters.month")}
                  </label>
                  <select
                    value={ui.filters.month || "all"}
                    onChange={(e) => {
                      const value =
                        e.target.value === "all"
                          ? null
                          : parseInt(e.target.value)
                      handleFilterChange("month", value)
                    }}
                    className={`w-full p-2 ${theme.input}`}
                  >
                    <option value="all">{t("roster.filters.allMonths")}</option>
                    {Array.from({ length: 12 }, (_, i) => i + 1).map(
                      (month) => (
                        <option key={month} value={month}>
                          {formatMonthYear(month, 2025).split(" ")[0]}
                        </option>
                      )
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-[var(--color-text)]">
                    {t("roster.filters.orderBy")}
                  </label>
                  <select
                    value={ui.filters.orderBy || "createdAt"}
                    onChange={(e) =>
                      handleFilterChange("orderBy", e.target.value)
                    }
                    className={`w-full p-2 ${theme.input}`}
                  >
                    <option value="title">
                      {t("roster.filters.sortBy.title")}
                    </option>
                    <option value="createdAt">
                      {t("roster.filters.sortBy.createdAt")}
                    </option>
                    <option value="year">
                      {t("roster.filters.sortBy.year")}
                    </option>
                    <option value="month">
                      {t("roster.filters.sortBy.month")}
                    </option>
                    <option value="completionPercentage">
                      {t("roster.filters.sortBy.completion")}
                    </option>
                  </select>
                </div>

                <div className="sm:col-span-2 lg:col-span-4">
                  <button
                    onClick={() => dispatch(clearFilters())}
                    className={theme.secondaryButton}
                    type="button"
                  >
                    {t("roster.filters.clear")}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className={`md:hidden ${showMobileTable ? "hidden" : "block"}`}>
          {loading?.fetch ? (
            <LoadingState />
          ) : rosterList.length === 0 ? (
            <EmptyState />
          ) : (
            rosterList.map((roster) => (
              <RosterCard key={roster.id} roster={roster} />
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
                  <th
                    className={`${
                      isRTL ? "text-right" : "text-left"
                    } p-4 font-semibold text-[var(--color-text)]`}
                  >
                    {t("roster.table.title")}
                  </th>
                  <th
                    className={`${
                      isRTL ? "text-right" : "text-left"
                    } p-4 font-semibold text-[var(--color-text)]`}
                  >
                    {t("roster.table.period")}
                  </th>
                  <th
                    className={`${
                      isRTL ? "text-right" : "text-left"
                    } p-4 font-semibold text-[var(--color-text)]`}
                  >
                    {t("roster.table.category")}
                  </th>
                  <th
                    className={`${
                      isRTL ? "text-right" : "text-left"
                    } p-4 font-semibold text-[var(--color-text)]`}
                  >
                    {t("roster.table.status")}
                  </th>
                  <th
                    className={`${
                      isRTL ? "text-right" : "text-left"
                    } p-4 font-semibold text-[var(--color-text)]`}
                  >
                    {t("roster.table.created")}
                  </th>
                  <th
                    className={`${
                      isRTL ? "text-right" : "text-left"
                    } p-4 font-semibold text-[var(--color-text)]`}
                  >
                    {t("roster.table.actions")}
                  </th>
                </tr>
              </thead>

              <tbody>
                {loading?.fetch ? (
                  <tr>
                    <td colSpan="7">
                      <LoadingState />
                    </td>
                  </tr>
                ) : rosterList.length === 0 ? (
                  <tr>
                    <td colSpan="7">
                      <EmptyState />
                    </td>
                  </tr>
                ) : (
                  rosterList.map((roster) => {
                    const statusInfo = getStatusInfo(roster.status)

                    return (
                      <tr
                        key={roster.id}
                        className="border-b border-[var(--color-border)] hover:bg-[var(--color-bg-soft)] transition-colors"
                      >
                        <td className="p-4">
                          <div className="font-semibold text-[var(--color-text)]">
                            {roster.title}
                          </div>
                        </td>

                        <td className="p-4">
                          <div className="text-[var(--color-text)]">
                            {formatMonthYear(roster.month, roster.year)}
                          </div>
                          <div className="text-sm text-[var(--color-text-muted)]">
                            {roster.totalDays} {t("roster.dayss")}
                          </div>
                        </td>

                        <td className="p-4">
                          <div className="text-[var(--color-text)]">
                            {roster.categoryName}
                          </div>
                          <div className="text-sm text-[var(--color-text-muted)]">
                            {roster.departmentsCount}{" "}
                            {t("roster.departments")}
                          </div>
                        </td>

                        <td className="p-4">
                          <button
                            onClick={() => {
                              setStatusToUpdate({
                                id: roster.id,
                                title: roster.title,
                                currentStatus: roster.status,
                              })
                              setStatusModalOpen(true)
                            }}
                            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors hover:opacity-80 ${statusInfo.color}`}
                            title={t("roster.actions.updateStatus")}
                            type="button"
                          >
                            {statusInfo.name}
                          </button>
                        </td>

                        <td className="p-4">
                          <div className="text-[var(--color-text)]">
                            {formatDate(roster.createdAt)}
                          </div>
                          <div className="text-sm text-[var(--color-text-muted)]">
                            {roster.createdByName}
                          </div>
                        </td>

                        <td className="p-4">
                          <div className="flex gap-1">
                            <Link to={`/admin-panel/rosters/${roster.id}`}>
                              <ActionButton title={t("roster.actions.view")}>
                                <Eye size={16} />
                              </ActionButton>
                            </Link>

                            <ActionButton
                              title={t("roster.actions.updateStatus")}
                              tone="warning"
                              onClick={() => {
                                setStatusToUpdate({
                                  id: roster.id,
                                  title: roster.title,
                                  currentStatus: roster.status,
                                })
                                setStatusModalOpen(true)
                              }}
                            >
                              <BarChart3 size={16} />
                            </ActionButton>

                            <Link to={`/admin-panel/rosters/${roster.id}/edit`}>
                              <ActionButton
                                title={t("roster.actions.edit")}
                                tone="success"
                              >
                                <Edit size={16} />
                              </ActionButton>
                            </Link>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div
          className={`md:hidden ${
            showMobileTable ? "block" : "hidden"
          } ${theme.card} overflow-hidden`}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--color-border)] bg-[var(--color-surface-muted)]">
                  <th className="text-center p-2 font-semibold text-[var(--color-text)]">
                    {t("roster.table.title")}
                  </th>
                  <th className="text-center p-2 font-semibold text-[var(--color-text)]">
                    {t("roster.table.status")}
                  </th>
                  <th className="text-center p-2 font-semibold text-[var(--color-text)]">
                    {t("roster.table.actions")}
                  </th>
                </tr>
              </thead>

              <tbody>
                {loading.fetch ? (
                  <tr>
                    <td colSpan="4">
                      <LoadingState small />
                    </td>
                  </tr>
                ) : rosterList.length === 0 ? (
                  <tr>
                    <td colSpan="4">
                      <EmptyState compact />
                    </td>
                  </tr>
                ) : (
                  rosterList.map((roster) => {
                    const statusInfo = getStatusInfo(roster.status)

                    return (
                      <tr
                        key={roster.id}
                        className="border-b border-[var(--color-border)] hover:bg-[var(--color-bg-soft)] transition-colors"
                      >
                        <td className="p-2">
                          <div className="font-semibold text-xs text-[var(--color-text)]">
                            {roster.title}
                          </div>
                          <div className="text-xs mt-1 text-[var(--color-text-muted)]">
                            {formatMonthYear(roster.month, roster.year)}
                          </div>
                          <div className="text-xs text-[var(--color-text-muted)]">
                            {roster.categoryName}
                          </div>
                        </td>

                        <td className="p-2 text-center">
                          <button
                            onClick={() => {
                              setStatusToUpdate({
                                id: roster.id,
                                title: roster.title,
                                currentStatus: roster.status,
                              })
                              setStatusModalOpen(true)
                            }}
                            className={`px-2 py-1 rounded-full text-xs font-medium transition-colors hover:opacity-80 ${statusInfo.color}`}
                            title={t("roster.actions.updateStatus")}
                            type="button"
                          >
                            {statusInfo.name}
                          </button>
                        </td>

                        <td className="p-2">
                          <div className="flex gap-1 justify-center">
                            <Link to={`/admin-panel/rosters/${roster.id}`}>
                              <ActionButton title={t("roster.actions.view")}>
                                <Eye size={14} />
                              </ActionButton>
                            </Link>

                            <ActionButton
                              title={t("roster.actions.updateStatus")}
                              tone="warning"
                              onClick={() => {
                                setStatusToUpdate({
                                  id: roster.id,
                                  title: roster.title,
                                  currentStatus: roster.status,
                                })
                                setStatusModalOpen(true)
                              }}
                            >
                              <BarChart3 size={14} />
                            </ActionButton>

                            <Link to={`/admin-panel/rosters/${roster.id}/edit`}>
                              <ActionButton
                                title={t("roster.actions.edit")}
                                tone="success"
                              >
                                <Edit size={14} />
                              </ActionButton>
                            </Link>
                          </div>
                        </td>
                      </tr>
                    )
                  })
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
                  {t("displayRange", {
                    start:
                      (pagination.currentPage - 1) * pagination.pageSize + 1,
                    end: Math.min(
                      pagination.currentPage * pagination.pageSize,
                      pagination.totalItems
                    ),
                    total: pagination.totalCount,
                  })}
                </span>

                <div className="flex items-center gap-2">
                  <select
                    value={pagination.pageSize}
                    onChange={(e) => handlePageSizeChange(e.target.value)}
                    className={`p-1 text-sm ${theme.input}`}
                  >
                    <option value="5">5</option>
                    <option value="10">10</option>
                    <option value="20">20</option>
                    <option value="50">50</option>
                  </select>

                  <span className="text-[var(--color-text-muted)]">
                    {t("roster.pagination.itemsPerPage")}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1 sm:gap-2">
                <button
                  onClick={() => handlePageChange(ui.filters.page - 1)}
                  disabled={!pagination.hasPreviousPage}
                  className="p-2 rounded-lg border border-[var(--color-border)] hover:bg-[var(--color-bg-soft)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  type="button"
                >
                  <ChevronRight size={16} />
                </button>

                {getPageNumbers().map((pageNum) => (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`px-2 sm:px-3 py-2 rounded-lg transition-colors text-sm border ${
                      pageNum == ui.filters.page
                        ? "bg-[var(--color-primary)] text-white border-[var(--color-primary)]"
                        : "border-[var(--color-border)] hover:bg-[var(--color-bg-soft)] text-[var(--color-text)]"
                    }`}
                    type="button"
                  >
                    {pageNum}
                  </button>
                ))}

                <button
                  onClick={() => handlePageChange(ui.filters.page + 1)}
                  disabled={!pagination.hasNextPage}
                  className="p-2 rounded-lg border border-[var(--color-border)] hover:bg-[var(--color-bg-soft)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  type="button"
                >
                  <ChevronLeft size={16} />
                </button>
              </div>
            </div>
          </div>
        )}

        {openDeleteModal && (
          <ModalDeleteRoster
            onClose={() => setOpenDeleteModal(false)}
            toDelete={toDelete}
          />
        )}
      </div>
    </div>
  )
}

export default Roster