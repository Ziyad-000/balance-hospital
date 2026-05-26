import React, { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useParams, Link } from "react-router-dom"
import {
  getDoctorsRequests,
  rejectRequest,
  DoctorWorkingHoursRequestState,
  getStatusName,
} from "../../../state/act/actRosterManagement"
import {
  selectDoctorRequests,
  selectDoctorRequestsLoading,
  selectApproveRequestLoading,
  selectRejectRequestLoading,
} from "../../../state/slices/roster"
import LoadingGetData from "../../../components/LoadingGetData"
import { useTranslation } from "react-i18next"
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  Clock,
  Building,
  AlertCircle,
  CheckCircle,
  User,
  FileText,
  Briefcase,
  Timer,
  UserCheck,
  ChevronDown,
  ChevronRight,
  Badge,
  Activity,
  Ban,
} from "lucide-react"
import ApproveRequestModal from "../../../components/modals/ApprovalRequest"
import RejectRequestModal from "../../../components/modals/RejectRequest"
import { formatDate } from "../../../utils/formtDate"
import { getPageTheme } from "../../../utils/themeClasses"

function ManageDoctors() {
  const { id } = useParams()
  const dispatch = useDispatch()
  const [currentStatus, setCurrentStatus] = useState(
    DoctorWorkingHoursRequestState.Pending
  )
  const [loadingStates, setLoadingStates] = useState({})
  const [collapsedDates, setCollapsedDates] = useState({})

  const [selectedRequest, setSelectedRequest] = useState(null)

  const [isOpenApprove, setIsOpnApprove] = useState(false)
  const [isOpenReject, setRejectModalOpen] = useState(false)

  const handleApproveClick = (request) => {
    setSelectedRequest(request)
    setIsOpnApprove(true)
  }

  const handleRejectClick = (request) => {
    setSelectedRequest(request)
    setRejectModalOpen(true)
  }

  const { t, i18n } = useTranslation()
  const theme = getPageTheme()

  const doctorRequests = useSelector(selectDoctorRequests)
  const isLoading = useSelector(selectDoctorRequestsLoading)
  const isApproving = useSelector(selectApproveRequestLoading)
  const isRejecting = useSelector(selectRejectRequestLoading)

  const { mymode } = useSelector((state) => state.mode)

  // Get current language direction
  const isRTL = i18n.language === "ar"
  const currentLang = i18n.language || "ar"

  const defaultButtonClass =
    "inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border bg-[var(--color-surface)] text-[var(--color-text)] border-[var(--color-border-strong)] hover:bg-[var(--color-success)] hover:text-white hover:border-emerald-500 active:bg-[var(--color-success-hover)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"

  const selectedButtonClass =
    "inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border bg-[var(--color-success)] text-white border-emerald-500 transition-colors"

  const iconButtonClass =
    "p-2 rounded-lg border border-[var(--color-border-strong)] bg-[var(--color-surface)] text-[var(--color-text)] hover:bg-[var(--color-success)] hover:text-white hover:border-emerald-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"

  const dangerIconButtonClass =
    "p-2 rounded-lg border border-[var(--color-border-strong)] bg-[var(--color-surface)] text-red-500 hover:bg-[var(--color-danger)] hover:text-white hover:border-red-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
  const isDark = mymode === "dark"

  useEffect(() => {
    if (id) {
      dispatch(getDoctorsRequests({ status: currentStatus, rosterId: id }))
    }
  }, [dispatch, id, currentStatus])

  const handleStatusChange = (newStatus) => {
    setCurrentStatus(newStatus)
  }

  const handleReject = async (requestId) => {
    setLoadingStates((prev) => ({ ...prev, [`reject_${requestId}`]: true }))
    try {
      await dispatch(rejectRequest({ requestId })).unwrap()
      dispatch(getDoctorsRequests({ status: currentStatus, rosterId: id }))
    } catch (error) {
      console.error("Error rejecting request:", error)
    } finally {
      setLoadingStates((prev) => ({ ...prev, [`reject_${requestId}`]: false }))
    }
  }

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case "Pending":
        return isDark
          ? "bg-transparent text-amber-500 border-amber-500"
          : "bg-transparent text-amber-500 border-amber-500"
      case "Approved":
        return isDark
          ? "bg-transparent text-emerald-500 border-emerald-500"
          : "bg-transparent text-emerald-500 border-emerald-500"
      case "Rejected":
        return isDark
          ? "bg-transparent text-red-500 border-red-500"
          : "bg-transparent text-red-500 border-red-500"
      default:
        return isDark
          ? "bg-[var(--color-surface-muted)] text-[var(--color-text-muted)] border-[var(--color-border)]"
          : "bg-[var(--color-surface-muted)] text-[var(--color-text)] border-[var(--color-border)]"
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case "Pending":
        return <Clock size={12} />
      case "Approved":
        return <CheckCircle size={12} />
      case "Rejected":
        return <Ban size={12} />
      default:
        return <Activity size={12} />
    }
  }

  const toggleDateCollapse = (date) => {
    setCollapsedDates((prev) => ({
      ...prev,
      [date]: !prev[date],
    }))
  }

  const formatTime = (timeString) => {
    if (!timeString) return "-"
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString(
      i18n.language,
      {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }
    )
  }

  if (isLoading) {
    return <LoadingGetData text={t("gettingData.doctorRequests")} />
  }

  return (
    <div
      className={`min-h-screen p-6 ${isDark ? "bg-[var(--color-bg)]" : "bg-[var(--color-bg)]"}`}
      dir={isRTL ? "rtl" : "ltr"}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
            <Link
              to={`/admin-panel/rosters/${id}`}
              className={`inline-flex items-center px-3 py-2 text-sm font-medium ${
                isDark
                  ? "text-[var(--color-text-muted)] hover:text-white"
                  : "text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
              } transition-colors`}
            >
              {isRTL ? <ArrowRight size={16} /> : <ArrowLeft size={16} />}
              <span className={`${isRTL ? "mr-2" : "ml-2"}`}>
                {t("roster.actions.backToRoster")}
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-4 mb-4">
            <div
              className={`p-3 ${
                isDark ? "bg-[var(--color-surface-muted)]" : "bg-transparent"
              } rounded-lg`}
            >
              <UserCheck
                className={`h-8 w-8 ${
                  isDark ? "text-blue-500" : "text-blue-500"
                }`}
              />
            </div>
            <div>
              <h1
                className={`text-2xl sm:text-3xl font-bold ${
                  isDark ? "text-white" : "text-[var(--color-text)]"
                } mb-2`}
              >
                {t("doctorRequests.title")}
              </h1>
              <h3
                className={`text-xl sm:text-xl font-bold ${
                  isDark ? "text-white" : "text-[var(--color-text)]"
                } mb-2`}
              >
                {doctorRequests?.rosterTitle}
              </h3>
              <p
                className={`text-sm ${
                  isDark ? "text-[var(--color-text-muted)]" : "text-[var(--color-text-muted)]"
                }`}
              >
                {t("doctorRequests.description")}
              </p>
            </div>
          </div>
        </div>

        {/* Status Filter Buttons */}
        <div className="flex flex-wrap gap-2 mb-6">
          {Object.entries(DoctorWorkingHoursRequestState).map(
            ([key, value]) => (
              <button
                key={key}
                onClick={() => handleStatusChange(value)}
                className={`px-4 py-2 rounded-lg border transition-colors flex items-center gap-2 ${
                  currentStatus === value
                    ? selectedButtonClass
                    : isDark
                    ? "bg-[var(--color-surface-muted)] text-[var(--color-text-muted)] border-[var(--color-border)] hover:bg-[var(--color-success)] hover:text-white hover:border-emerald-500"
                    : "bg-[var(--color-surface)] text-[var(--color-text)] border-[var(--color-border)] hover:bg-[var(--color-success)] hover:text-white hover:border-emerald-500"
                }`}
              >
                {getStatusIcon(key)}
                <span>{t(`doctorRequests.status.${key.toLowerCase()}`)}</span>
              </button>
            )
          )}
        </div>

        {/* Summary Statistics */}
        {doctorRequests && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div
              className={`${
                isDark ? "bg-[var(--color-surface)]" : "bg-[var(--color-surface)]"
              } rounded-lg shadow-sm border ${
                isDark ? "border-[var(--color-border)]" : "border-[var(--color-border)]"
              } p-6`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p
                    className={`text-2xl font-bold ${
                      isDark ? "text-white" : "text-[var(--color-text)]"
                    }`}
                  >
                    {doctorRequests.totalRequests}
                  </p>
                  <p
                    className={`text-sm ${
                      isDark ? "text-[var(--color-text-muted)]" : "text-[var(--color-text-muted)]"
                    }`}
                  >
                    {t("doctorRequests.stats.totalRequests")}
                  </p>
                </div>
                <Badge
                  className={`h-8 w-8 ${
                    isDark ? "text-blue-500" : "text-blue-500"
                  }`}
                />
              </div>
            </div>

            <div
              className={`${
                isDark ? "bg-[var(--color-surface)]" : "bg-[var(--color-surface)]"
              } rounded-lg shadow-sm border ${
                isDark ? "border-[var(--color-border)]" : "border-[var(--color-border)]"
              } p-6`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p
                    className={`text-2xl font-bold ${
                      isDark ? "text-amber-500" : "text-amber-500"
                    }`}
                  >
                    {doctorRequests.pendingRequests}
                  </p>
                  <p
                    className={`text-sm ${
                      isDark ? "text-[var(--color-text-muted)]" : "text-[var(--color-text-muted)]"
                    }`}
                  >
                    {t("doctorRequests.status.pending")}
                  </p>
                </div>
                <Clock
                  className={`h-8 w-8 ${
                    isDark ? "text-amber-500" : "text-amber-500"
                  }`}
                />
              </div>
            </div>

            <div
              className={`${
                isDark ? "bg-[var(--color-surface)]" : "bg-[var(--color-surface)]"
              } rounded-lg shadow-sm border ${
                isDark ? "border-[var(--color-border)]" : "border-[var(--color-border)]"
              } p-6`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p
                    className={`text-2xl font-bold ${
                      isDark ? "text-emerald-500" : "text-emerald-500"
                    }`}
                  >
                    {doctorRequests.approvedRequests}
                  </p>
                  <p
                    className={`text-sm ${
                      isDark ? "text-[var(--color-text-muted)]" : "text-[var(--color-text-muted)]"
                    }`}
                  >
                    {t("doctorRequests.status.approved")}
                  </p>
                </div>
                <CheckCircle
                  className={`h-8 w-8 ${
                    isDark ? "text-emerald-500" : "text-emerald-500"
                  }`}
                />
              </div>
            </div>

            <div
              className={`${
                isDark ? "bg-[var(--color-surface)]" : "bg-[var(--color-surface)]"
              } rounded-lg shadow-sm border ${
                isDark ? "border-[var(--color-border)]" : "border-[var(--color-border)]"
              } p-6`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p
                    className={`text-2xl font-bold ${
                      isDark ? "text-red-500" : "text-red-500"
                    }`}
                  >
                    {doctorRequests.rejectedRequests}
                  </p>
                  <p
                    className={`text-sm ${
                      isDark ? "text-[var(--color-text-muted)]" : "text-[var(--color-text-muted)]"
                    }`}
                  >
                    {t("doctorRequests.status.rejected")}
                  </p>
                </div>
                <Ban
                  className={`h-8 w-8 ${
                    isDark ? "text-red-500" : "text-red-500"
                  }`}
                />
              </div>
            </div>
          </div>
        )}

        {/* Requests by Date */}
        {doctorRequests?.requestsByDate?.length > 0 ? (
          <div className="space-y-6">
            {doctorRequests.requestsByDate.map((dateGroup) => (
              <div
                key={dateGroup.date}
                className={`${
                  isDark ? "bg-[var(--color-surface)]" : "bg-[var(--color-surface)]"
                } rounded-lg shadow-sm border ${
                  isDark ? "border-[var(--color-border)]" : "border-[var(--color-border)]"
                }`}
              >
                {/* Collapsible Date Header */}
                <div
                  className={`p-6 border-b ${
                    isDark ? "border-[var(--color-border)]" : "border-[var(--color-border)]"
                  } cursor-pointer hover:${
                    isDark ? "bg-[var(--color-surface-muted)]/50" : "bg-[var(--color-bg)]"
                  } transition-colors`}
                  onClick={() => toggleDateCollapse(dateGroup.date)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div
                        className={`p-3 ${
                          isDark ? "bg-transparent" : "bg-transparent"
                        } rounded-lg`}
                      >
                        <Calendar
                          className={`h-6 w-6 ${
                            isDark ? "text-blue-500" : "text-blue-500"
                          }`}
                        />
                      </div>
                      <div>
                        <h2
                          className={`text-xl font-bold ${
                            isDark ? "text-white" : "text-[var(--color-text)]"
                          }`}
                        >
                          {formatDate(dateGroup.date)}
                        </h2>
                        <p
                          className={`text-sm ${
                            isDark ? "text-[var(--color-text-muted)]" : "text-[var(--color-text-muted)]"
                          }`}
                        >
                          {dateGroup.dayOfWeekName}
                        </p>
                        <div className="flex items-center gap-4 mt-1">
                          <span
                            className={`text-xs ${
                              isDark ? "text-[var(--color-text-muted)]" : "text-[var(--color-text-muted)]"
                            }`}
                          >
                            {t("doctorRequests.stats.total")}:{" "}
                            {dateGroup.totalRequests} |{" "}
                            {t("doctorRequests.status.pending")}:{" "}
                            {dateGroup.pendingRequests} |{" "}
                            {t("doctorRequests.status.approved")}:{" "}
                            {dateGroup.approvedRequests} |{" "}
                            {t("doctorRequests.status.rejected")}:{" "}
                            {dateGroup.rejectedRequests}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Chevron Icon */}
                    <div className="flex items-center">
                      {collapsedDates[dateGroup.date] ? (
                        <ChevronDown
                          className={`h-5 w-5 ${
                            isDark ? "text-[var(--color-text-muted)]" : "text-[var(--color-text-muted)]"
                          } transition-transform duration-200`}
                        />
                      ) : (
                        <ChevronRight
                          className={`h-5 w-5 ${
                            isDark ? "text-[var(--color-text-muted)]" : "text-[var(--color-text-muted)]"
                          } transition-transform duration-200`}
                        />
                      )}
                    </div>
                  </div>
                </div>

                {/* Collapsible Content */}
                {collapsedDates[dateGroup.date] && (
                  <div className="p-6 space-y-6">
                    {dateGroup.requests.map((request) => (
                      <div
                        key={request.id}
                        className={`p-4 rounded-lg border ${
                          isDark
                            ? "bg-[var(--color-surface-muted)]/50 border-[var(--color-border)]"
                            : "bg-[var(--color-bg)] border-[var(--color-border)]"
                        }`}
                      >
                        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                          {/* Request Info */}
                          <div className="flex-1">
                            <div className="flex items-center gap-4 mb-3">
                              <div className="flex items-center gap-2">
                                <User
                                  className={`h-5 w-5 ${
                                    isDark ? "text-blue-500" : "text-blue-500"
                                  }`}
                                />
                                <h3
                                  className={`text-lg font-medium ${
                                    isDark ? "text-white" : "text-[var(--color-text)]"
                                  }`}
                                >
                                  {currentLang === "en"
                                    ? request.doctorName
                                    : request.doctorNameArabic}
                                </h3>
                              </div>
                              <span
                                className={`inline-flex items-center px-2 py-1 text-xs font-medium border rounded-full ${getStatusBadgeColor(
                                  request.status
                                )}`}
                              >
                                {getStatusIcon(request.status)}
                                <span className={`${isRTL ? "mr-1" : "ml-1"}`}>
                                  {t(
                                    `doctorRequests.status.${request.status.toLowerCase()}`
                                  )}
                                </span>
                              </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-3">
                              <div className="flex items-center gap-2">
                                <Building
                                  className={`h-4 w-4 ${
                                    isDark ? "text-emerald-500" : "text-emerald-500"
                                  }`}
                                />
                                <div>
                                  <span
                                    className={`text-xs font-medium ${
                                      isDark ? "text-[var(--color-text-muted)]" : "text-[var(--color-text-muted)]"
                                    }`}
                                  >
                                    {t("doctorRequests.fields.department")}:
                                  </span>
                                  <p
                                    className={`text-sm ${
                                      isDark ? "text-[var(--color-text-muted)]" : "text-[var(--color-text)]"
                                    }`}
                                  >
                                    {i18n.language == "en"
                                      ? request.departmentName
                                      : request.departmentNameArabic}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                <Briefcase
                                  className={`h-4 w-4 ${
                                    isDark
                                      ? "text-violet-500"
                                      : "text-violet-500"
                                  }`}
                                />
                                <div>
                                  <span
                                    className={`text-xs font-medium ${
                                      isDark ? "text-[var(--color-text-muted)]" : "text-[var(--color-text-muted)]"
                                    }`}
                                  >
                                    {t("doctorRequests.fields.shift")}:
                                  </span>
                                  <p
                                    className={`text-sm ${
                                      isDark ? "text-[var(--color-text-muted)]" : "text-[var(--color-text)]"
                                    }`}
                                  >
                                    {request.shiftTypeName}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                <Clock
                                  className={`h-4 w-4 ${
                                    isDark
                                      ? "text-amber-500"
                                      : "text-amber-500"
                                  }`}
                                />
                                <div>
                                  <span
                                    className={`text-xs font-medium ${
                                      isDark ? "text-[var(--color-text-muted)]" : "text-[var(--color-text-muted)]"
                                    }`}
                                  >
                                    {t("doctorRequests.fields.time")}:
                                  </span>
                                  <p
                                    className={`text-sm ${
                                      isDark ? "text-[var(--color-text-muted)]" : "text-[var(--color-text)]"
                                    }`}
                                  >
                                    {formatTime(request.startTime)} -{" "}
                                    {formatTime(request.endTime)}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                <Timer
                                  className={`h-4 w-4 ${
                                    isDark
                                      ? "text-indigo-400"
                                      : "text-indigo-600"
                                  }`}
                                />
                                <div>
                                  <span
                                    className={`text-xs font-medium ${
                                      isDark ? "text-[var(--color-text-muted)]" : "text-[var(--color-text-muted)]"
                                    }`}
                                  >
                                    {t("doctorRequests.fields.hours")}:
                                  </span>
                                  <p
                                    className={`text-sm ${
                                      isDark ? "text-[var(--color-text-muted)]" : "text-[var(--color-text)]"
                                    }`}
                                  >
                                    {request.shiftHours}h
                                  </p>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 mb-3">
                              <Badge
                                className={`h-4 w-4 ${
                                  isDark ? "text-cyan-400" : "text-cyan-600"
                                }`}
                              />
                              <span
                                className={`text-xs font-medium ${
                                  isDark ? "text-[var(--color-text-muted)]" : "text-[var(--color-text-muted)]"
                                }`}
                              >
                                {t("doctorRequests.fields.type")}:
                              </span>
                              <span
                                className={`text-sm ${
                                  isDark ? "text-[var(--color-text-muted)]" : "text-[var(--color-text)]"
                                }`}
                              >
                                {request.contractingTypeName}
                              </span>
                            </div>

                            {request.notes && request.notes !== "string" && (
                              <div className="mb-3">
                                <div className="flex items-start gap-2">
                                  <FileText
                                    className={`h-4 w-4 mt-0.5 ${
                                      isDark ? "text-[var(--color-text-muted)]" : "text-[var(--color-text-muted)]"
                                    }`}
                                  />
                                  <div>
                                    <span
                                      className={`text-xs font-medium ${
                                        isDark
                                          ? "text-[var(--color-text-muted)]"
                                          : "text-[var(--color-text-muted)]"
                                      }`}
                                    >
                                      {t("doctorRequests.fields.notes")}:
                                    </span>
                                    <p
                                      className={`text-sm ${
                                        isDark
                                          ? "text-[var(--color-text-muted)]"
                                          : "text-[var(--color-text)]"
                                      } mt-1`}
                                    >
                                      {request.notes}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            )}

                            {(
                              (i18n.language === "ar"
                                ? request.issues
                                : request.issuesEn) || []
                            ).length > 0 && (
                              <div className="mb-3">
                                <div className="flex items-start gap-2">
                                  <AlertCircle
                                    className={`h-4 w-4 mt-0.5 ${
                                      isDark ? "text-red-500" : "text-red-500"
                                    }`}
                                  />
                                  <div>
                                    <span
                                      className={`text-xs font-medium ${
                                        isDark ? "text-red-500" : "text-red-500"
                                      }`}
                                    >
                                      {t("doctorRequests.fields.issues")}:
                                    </span>
                                    <ul className="mt-1 space-y-1">
                                      {(i18n.language === "ar"
                                        ? request.issues
                                        : request.issuesEn
                                      )?.map((issue, index) => (
                                        <li
                                          key={index}
                                          className={`text-sm ${
                                            isDark
                                              ? "text-red-500"
                                              : "text-red-500"
                                          } flex items-center`}
                                        >
                                          <span
                                            className={`w-2 h-2 ${
                                              isDark
                                                ? "bg-[var(--color-danger)]"
                                                : "bg-[var(--color-danger)]"
                                            } rounded-full ${
                                              isRTL ? "ml-2" : "mr-2"
                                            } flex-shrink-0`}
                                          ></span>
                                          {issue}
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                </div>
                              </div>
                            )}

                            <div
                              className={`text-xs ${
                                isDark ? "text-[var(--color-text-muted)]" : "text-[var(--color-text-muted)]"
                              }`}
                            >
                              {t("doctorRequests.fields.requestedAt")}:{" "}
                              {new Date(request.requestedAt).toLocaleString(
                                i18n.language
                              )}
                            </div>
                          </div>

                          {/* Action buttons for pending requests */}
                          {request.status === "Pending" && (
                            <div className="flex gap-2 mt-4 lg:mt-0">
                              <button
                                onClick={() => handleApproveClick(request)}
                                disabled={
                                  loadingStates[`approve_${request.id}`] ||
                                  isApproving
                                }
                                className="bg-[var(--color-success)] hover:bg-[var(--color-success-hover)] disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors"
                              >
                                {loadingStates[`approve_${request.id}`] ? (
                                  <>
                                    <svg
                                      className="animate-spin h-4 w-4"
                                      xmlns="http://www.w3.org/2000/svg"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                    >
                                      <circle
                                        className="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                      ></circle>
                                      <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                      ></path>
                                    </svg>
                                    {t("doctorRequests.actions.approving")}
                                  </>
                                ) : (
                                  <>
                                    <CheckCircle size={14} />
                                    {t("doctorRequests.actions.approve")}
                                  </>
                                )}
                              </button>
                              <button
                                onClick={() => handleRejectClick(request)}
                                disabled={
                                  loadingStates[`reject_${request.id}`] ||
                                  isRejecting
                                }
                                className="bg-[var(--color-danger)] hover:bg-[var(--color-danger)] disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors"
                              >
                                {loadingStates[`reject_${request.id}`] ? (
                                  <>
                                    <svg
                                      className="animate-spin h-4 w-4"
                                      xmlns="http://www.w3.org/2000/svg"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                    >
                                      <circle
                                        className="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                      ></circle>
                                      <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                      ></path>
                                    </svg>
                                    {t("doctorRequests.actions.rejecting")}
                                  </>
                                ) : (
                                  <>
                                    <Ban size={14} />
                                    {t("doctorRequests.actions.reject")}
                                  </>
                                )}
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div
            className={`${
              isDark ? "bg-[var(--color-surface)]" : "bg-[var(--color-surface)]"
            } rounded-lg shadow-sm border ${
              isDark ? "border-[var(--color-border)]" : "border-[var(--color-border)]"
            } p-12 text-center`}
          >
            <UserCheck
              className={`h-12 w-12 mx-auto mb-4 ${
                isDark ? "text-[var(--color-text-muted)]" : "text-[var(--color-text-muted)]"
              }`}
            />
            <p
              className={`text-lg ${
                isDark ? "text-[var(--color-text-muted)]" : "text-[var(--color-text-muted)]"
              }`}
            >
              {t("doctorRequests.noRequests", {
                status: t(
                  `doctorRequests.status.${getStatusName(
                    currentStatus
                  ).toLowerCase()}`
                ),
              })}
            </p>
          </div>
        )}
      </div>
      <ApproveRequestModal
        isOpen={isOpenApprove}
        onClose={() => setIsOpnApprove(false)}
        request={selectedRequest}
        status={currentStatus}
      />
      <RejectRequestModal
        isOpen={isOpenReject}
        onClose={() => setRejectModalOpen(false)}
        request={selectedRequest}
        status={currentStatus}
      />
    </div>
  )
}

export default ManageDoctors