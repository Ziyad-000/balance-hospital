// pages/ManagementRoles/UserAssignmentHistory.jsx
import React, { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useTranslation } from "react-i18next"
import { useParams, useNavigate, Link } from "react-router-dom"
import { toast } from "react-toastify"
import "../../../styles/general.css"

import {
  ArrowLeft,
  History,
  User,
  ChevronLeft,
  ChevronRight,
  Clock,
  Shield,
  FileText,
} from "lucide-react"

// Import the action

// Import slice selectors
import {
  selectLoading,
  selectError,
  selectSuccess,
} from "../../../state/slices/managementRole.js"

import LoadingGetData from "../../../components/LoadingGetData.jsx"
import { getUserAssignmentHistory } from "../../../state/act/actManagementRole.js"
import i18next from "i18next"
import { formatDate } from "../../../utils/formtDate.js"

function UserAssignmentHistory() {
  const { t, i18n } = useTranslation()
  const dispatch = useDispatch()
  const { id } = useParams() // userId
  const navigate = useNavigate()

  // Selectors
  const loading = useSelector(selectLoading)
  const error = useSelector(selectError)
  const success = useSelector(selectSuccess)
  const { userAssignmentHistory, userAssignmentHistoryPagination } =
    useSelector((state) => state.managementRoles)

  const { mymode } = useSelector((state) => state.mode)

  // Local state for pagination
  const [historyFilters, setHistoryFilters] = useState({
    page: 1,
    pageSize: 10,
  })

  // Theme and language
  const isDark = mymode === "dark"
  const language = i18n.language
  const isRTL = language === "ar"

  // name for doctor

  const name = JSON.parse(localStorage.getItem("doctorName"))
  const docorName = language == "en" ? name.doctorNameEn : name.doctorNameAr

  // Load user assignment history on component mount and when filters change
  useEffect(() => {
    if (id) {
      dispatch(
        getUserAssignmentHistory({
          userId: id,
          params: {
            page: historyFilters.page,
            pageSize: historyFilters.pageSize,
          },
        })
      )
    }
  }, [id, historyFilters, dispatch])

  // Handle success/error messages
  useEffect(() => {
    if (success) {
      toast.success(success)
    }
  }, [success])

  useEffect(() => {
    if (error) {
      toast.error(error)
    }
  }, [error])

  // Pagination handlers
  const handlePageChange = (newPage) => {
    setHistoryFilters((prev) => ({ ...prev, page: newPage }))
  }

  // Get change type styling
  const getChangeTypeStyle = (changeType) => {
    switch (changeType?.toLowerCase()) {
      case "إلغاء":
        return "bg-transparent text-red-500 border-2 border-red-500 dark:bg-transparent dark:text-red-500 dark:border-red-500"
      case "تعيين":
        return "bg-transparent text-blue-500 border-2 border-blue-500 dark:bg-transparent dark:text-blue-500 dark:border-blue-500"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
    }
  }

  // Get border color for history entries
  const getBorderColor = (changeType) => {
    switch (changeType?.toLowerCase()) {
      case "إلغاء":
        return "border-red-500"
      case "تعيين":
        return "border-blue-500"
      default:
        return "border-gray-500"
    }
  }

  // Loading state
  if (loading.userHistory) {
    return (
      <LoadingGetData
        text={t("gettingData.userHistory") || "Loading user history..."}
      />
    )
  }

  return (
    <div
      className={`min-h-screen ${isDark ? "bg-gray-900" : "bg-gray-50"}`}
      dir={isRTL ? "rtl" : "ltr"}
    >
      <div className="p-4 sm:p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => navigate(-1)}
                  className={`p-2 rounded-lg border transition-colors ${
                    isDark
                      ? "border-gray-600 hover:bg-gray-700 text-gray-300"
                      : "border-gray-300 hover:bg-gray-50 text-gray-700"
                  }`}
                >
                  <ArrowLeft size={20} />
                </button>
                <div>
                  <h1
                    className={`text-2xl sm:text-3xl font-bold ${
                      isDark ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {t("managementRoles.userHistory.title") ||
                      "User Assignment History"}{" "}
                    {isRTL ? " ←" : "→ "} {docorName}
                  </h1>
                  <p
                    className={`text-sm mt-1 ${
                      isDark ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    {t("managementRoles.userHistory.subtitle") ||
                      "Role assignment and change history for user"}{" "}
                  </p>
                </div>
              </div>
            </div>

            {/* Stats */}
            {userAssignmentHistoryPagination?.totalCount > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-transparent text-blue-500 border-2 border-blue-500 dark:bg-transparent dark:text-blue-500 dark:border-blue-500">
                  <History size={14} className="inline mr-1" />
                  {userAssignmentHistoryPagination.totalCount}{" "}
                  {t("managementRoles.userHistory.entries") ||
                    "History Entries"}
                </span>
              </div>
            )}
          </div>

          {/* History Content */}
          <div
            className={`rounded-lg shadow border ${
              isDark
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-200"
            }`}
          >
            <div className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <Clock
                  className={`h-5 w-5 ${
                    isDark ? "text-gray-400" : "text-gray-500"
                  }`}
                />
                <h3
                  className={`text-lg font-semibold ${
                    isDark ? "text-white" : "text-gray-900"
                  }`}
                >
                  {t("managementRoles.userHistory.timeline") ||
                    "Role Assignment Timeline"}
                </h3>
              </div>

              {userAssignmentHistory && userAssignmentHistory.length > 0 ? (
                <>
                  {/* Timeline */}
                  <div className="space-y-6">
                    {userAssignmentHistory.map((entry, index) => (
                      <div key={entry.Id || index} className="relative">
                        {/* Timeline line */}
                        {index < userAssignmentHistory.length - 1 && (
                          <div
                            className={`absolute left-6 top-16 w-0.5 h-full ${
                              isDark ? "bg-gray-600" : "bg-gray-200"
                            }`}
                          />
                        )}

                        {/* Timeline entry */}
                        <div className="flex gap-4">
                          {/* Timeline dot */}
                          <div className="flex-shrink-0">
                            <div
                              className={`w-3 h-3 rounded-full mt-3 ${
                                entry.changeType?.toLowerCase() === "إلغاء"
                                  ? "bg-red-500"
                                  : "bg-blue-500"
                              }`}
                            />
                          </div>

                          {/* Entry content */}
                          <div className="flex-1 min-w-0">
                            <div
                              className={`border-l-4 pl-4 py-3 rounded-r-lg ${getBorderColor(
                                entry.changeType
                              )} ${isDark ? "bg-gray-700/50" : "bg-gray-50"}`}
                            >
                              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span
                                    className={`px-2 py-1 text-xs font-semibold rounded-full ${getChangeTypeStyle(
                                      entry.changeType
                                    )}`}
                                  >
                                    {entry.changeType}
                                  </span>
                                  <span
                                    className={`text-sm ${
                                      isDark ? "text-gray-300" : "text-gray-600"
                                    }`}
                                  >
                                    {formatDate(entry.changedAt)}
                                  </span>
                                </div>
                                {entry.changedByName && (
                                  <span
                                    className={`text-sm ${
                                      isDark ? "text-gray-400" : "text-gray-500"
                                    }`}
                                  >
                                    {t("managementRoles.history.by") || "by"}{" "}
                                    <span className="font-medium text-blue-500 dark:text-blue-500">
                                      {entry.changedByName}
                                    </span>
                                  </span>
                                )}
                              </div>

                              {/* Role change details */}
                              <div className="mb-2">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <Shield className="h-4 w-4 text-gray-500" />
                                  {entry.oldRoleName && entry.newRoleName ? (
                                    <span
                                      className={`text-sm ${
                                        isDark ? "text-white" : "text-gray-900"
                                      }`}
                                    >
                                      <span className="font-medium">
                                        {entry.oldRoleName}
                                      </span>
                                      <span className="mx-2 text-gray-500">
                                        →
                                      </span>
                                      <span className="font-medium">
                                        {entry.newRoleName}
                                      </span>
                                    </span>
                                  ) : (
                                    <span
                                      className={`text-sm font-medium ${
                                        isDark ? "text-white" : "text-gray-900"
                                      }`}
                                    >
                                      {entry.newRoleName ||
                                        entry.oldRoleName ||
                                        entry.changeType}
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Change reason */}
                              {entry.changeReason && (
                                <div className="mb-2">
                                  <p
                                    className={`text-sm ${
                                      isDark ? "text-gray-300" : "text-gray-600"
                                    }`}
                                  >
                                    <span className="font-medium">
                                      {t("managementRoles.history.reason") ||
                                        "Reason"}
                                      :
                                    </span>{" "}
                                    {entry.changeReason}
                                  </p>
                                </div>
                              )}

                              {/* Notes */}
                              {entry.notes && (
                                <div
                                  className={`text-sm p-3 rounded ${
                                    isDark
                                      ? "bg-gray-600/50 text-gray-300"
                                      : "bg-white text-gray-600 border border-gray-200"
                                  }`}
                                >
                                  <div className="flex items-start gap-2">
                                    <FileText className="h-4 w-4 mt-0.5 text-gray-500 flex-shrink-0" />
                                    <div>
                                      <span className="font-medium">
                                        {t("managementRoles.history.notes") ||
                                          "Notes"}
                                        :
                                      </span>{" "}
                                      {entry.notes}
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Pagination */}
                  {userAssignmentHistoryPagination?.totalPages > 1 && (
                    <div className="mt-8 flex items-center justify-between px-6 py-3 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 rounded-b-lg">
                      <div className="flex-1 flex justify-between sm:hidden">
                        <button
                          onClick={() =>
                            handlePageChange(historyFilters.page - 1)
                          }
                          disabled={historyFilters.page === 1}
                          className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                            historyFilters.page === 1
                              ? "text-gray-400 cursor-not-allowed"
                              : "text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
                          }`}
                        >
                          {t("managementRoles.pagination.previous") ||
                            "Previous"}
                        </button>
                        <button
                          onClick={() =>
                            handlePageChange(historyFilters.page + 1)
                          }
                          disabled={
                            historyFilters.page >=
                            userAssignmentHistoryPagination.totalPages
                          }
                          className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                            historyFilters.page >=
                            userAssignmentHistoryPagination.totalPages
                              ? "text-gray-400 cursor-not-allowed"
                              : "text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
                          }`}
                        >
                          {t("managementRoles.pagination.next") || "Next"}
                        </button>
                      </div>
                      <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                        <div>
                          <p
                            className={`text-sm ${
                              isDark ? "text-gray-400" : "text-gray-700"
                            }`}
                          >
                            {t("managementRoles.pagination.showing") ||
                              "Showing"}{" "}
                            <span className="font-medium">
                              {(historyFilters.page - 1) *
                                historyFilters.pageSize +
                                1}
                            </span>{" "}
                            {t("managementRoles.pagination.to") || "to"}{" "}
                            <span className="font-medium">
                              {Math.min(
                                historyFilters.page * historyFilters.pageSize,
                                userAssignmentHistoryPagination.totalCount
                              )}
                            </span>{" "}
                            {t("managementRoles.pagination.of") || "of"}{" "}
                            <span className="font-medium">
                              {userAssignmentHistoryPagination.totalCount}
                            </span>{" "}
                            {t("managementRoles.pagination.results") ||
                              "results"}
                          </p>
                        </div>
                        <div>
                          <nav
                            className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                            aria-label="Pagination"
                          >
                            <button
                              onClick={() =>
                                handlePageChange(historyFilters.page - 1)
                              }
                              disabled={historyFilters.page === 1}
                              className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 text-sm font-medium ${
                                historyFilters.page === 1
                                  ? "text-gray-400 cursor-not-allowed"
                                  : "text-gray-500 bg-white hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                              }`}
                            >
                              <ChevronLeft className="h-5 w-5" />
                            </button>

                            {Array.from(
                              {
                                length: Math.min(
                                  5,
                                  userAssignmentHistoryPagination.totalPages
                                ),
                              },
                              (_, i) => {
                                const pageNum =
                                  Math.max(1, historyFilters.page - 2) + i
                                if (
                                  pageNum >
                                  userAssignmentHistoryPagination.totalPages
                                )
                                  return null

                                return (
                                  <button
                                    key={pageNum}
                                    onClick={() => handlePageChange(pageNum)}
                                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                      pageNum === historyFilters.page
                                        ? "z-10 bg-blue-50 border-blue-500 text-blue-500 dark:bg-blue-900 dark:text-blue-300"
                                        : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                                    }`}
                                  >
                                    {pageNum}
                                  </button>
                                )
                              }
                            )}

                            <button
                              onClick={() =>
                                handlePageChange(historyFilters.page + 1)
                              }
                              disabled={
                                historyFilters.page >=
                                userAssignmentHistoryPagination.totalPages
                              }
                              className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 text-sm font-medium ${
                                historyFilters.page >=
                                userAssignmentHistoryPagination.totalPages
                                  ? "text-gray-400 cursor-not-allowed"
                                  : "text-gray-500 bg-white hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                              }`}
                            >
                              <ChevronRight className="h-5 w-5" />
                            </button>
                          </nav>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-12">
                  <History
                    className={`mx-auto h-12 w-12 mb-4 ${
                      isDark ? "text-gray-400" : "text-gray-500"
                    }`}
                  />
                  <p
                    className={`text-lg font-medium mb-2 ${
                      isDark ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {t("managementRoles.userHistory.noHistory") ||
                      "No Assignment History"}
                  </p>
                  <p
                    className={`${isDark ? "text-gray-400" : "text-gray-500"}`}
                  >
                    {t("managementRoles.userHistory.noHistoryDescription") ||
                      "This user has no role assignment history yet."}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UserAssignmentHistory