import { useDispatch, useSelector } from "react-redux"
import { getDoctorReports } from "../../../state/act/actReports"
import { useParams, useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import {
  User,
  Mail,
  Phone,
  Award,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  BarChart3,
  FileText,
  Activity,
  ArrowLeft,
  ArrowRight,
  Briefcase,
  Download,
  Filter,
  IdCard,
  ShieldCheck,
  Grid3X3,
  Rows3,
} from "lucide-react"
import LoadingGetData from "../../../components/LoadingGetData"
import {
  clearDoctorReport,
  clearDoctorReportError,
} from "../../../state/slices/reports"
import { CollapsibleRosterCard } from "./collapsingRoster"
import SwapRecordsSection from "./swapRequests"
import LeaveRecordsSection from "./leavesRequests"
import { exportDoctorReportToExcel } from "./exportToExcel"
import { formatDate } from "../../../utils/formtDate"
import { getPageTheme } from "../../../utils/themeClasses"

function DoctorReports() {
  const { docId } = useParams()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { t, i18n } = useTranslation()
  const theme = getPageTheme()

  const currentLang = i18n.language || "ar"
  const isRTL = currentLang === "ar"

  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [showFilters, setShowFilters] = useState(false)
  const [attendanceViewMode, setAttendanceViewMode] = useState("rows")

  const { doctorReport, loadingDoctorReport, doctorReportError } = useSelector(
    (state) => state.reports
  )

  const { mymode } = useSelector((state) => state.mode)
  const isDark = mymode === "dark"

  const iconColors = {
    user: "text-blue-700 dark:text-blue-300",
    mail: "text-cyan-700 dark:text-cyan-300",
    phone: "text-green-700 dark:text-green-300",
    id: "text-slate-700 dark:text-slate-300",
    award: "text-purple-700 dark:text-purple-300",
    calendar: "text-blue-700 dark:text-blue-300",
    check: "text-green-700 dark:text-green-300",
    clock: "text-yellow-700 dark:text-yellow-300",
    activity: "text-purple-700 dark:text-purple-300",
    chart: "text-blue-700 dark:text-blue-300",
    file: "text-indigo-700 dark:text-indigo-300",
    filter: "text-blue-700 dark:text-blue-300",
    danger: "text-red-700 dark:text-red-300",
    warning: "text-orange-700 dark:text-orange-300",
    muted: "text-slate-600 dark:text-slate-300",
  }

  const iconBg = {
    user: "bg-blue-100 dark:bg-blue-900/50",
    mail: "bg-cyan-100 dark:bg-cyan-900/50",
    phone: "bg-green-100 dark:bg-green-900/50",
    id: "bg-slate-100 dark:bg-slate-800/80",
    award: "bg-purple-100 dark:bg-purple-900/50",
    calendar: "bg-blue-100 dark:bg-blue-900/50",
    check: "bg-green-100 dark:bg-green-900/50",
    clock: "bg-yellow-100 dark:bg-yellow-900/50",
    activity: "bg-purple-100 dark:bg-purple-900/50",
    chart: "bg-blue-100 dark:bg-blue-900/50",
    file: "bg-indigo-100 dark:bg-indigo-900/50",
    danger: "bg-red-100 dark:bg-red-900/50",
    warning: "bg-orange-100 dark:bg-orange-900/50",
  }

  useEffect(() => {
    if (docId) {
      dispatch(
        getDoctorReports({
          doctorId: docId,
          dateFrom: dateFrom || undefined,
          dateTo: dateTo || undefined,
        })
      )
    }

    return () => {
      dispatch(clearDoctorReport())
      dispatch(clearDoctorReportError())
    }
  }, [dispatch, docId])

  const handleApplyFilters = () => {
    if (docId) {
      dispatch(
        getDoctorReports({
          doctorId: docId,
          dateFrom: dateFrom || undefined,
          dateTo: dateTo || undefined,
        })
      )
    }
  }

  const handleClearFilters = () => {
    setDateFrom("")
    setDateTo("")

    if (docId) {
      dispatch(
        getDoctorReports({
          doctorId: docId,
        })
      )
    }
  }

  const getComplianceStatusColor = (status) => {
    const statusColors = {
      OVER_ASSIGNED:
        "bg-orange-100 text-orange-800 border border-orange-300 dark:bg-orange-900/50 dark:text-orange-200 dark:border-orange-700",
      COMPLIANT:
        "bg-green-100 text-green-800 border border-green-300 dark:bg-green-900/50 dark:text-green-200 dark:border-green-700",
      UNDER_ASSIGNED:
        "bg-red-100 text-red-800 border border-red-300 dark:bg-red-900/50 dark:text-red-200 dark:border-red-700",
    }

    return (
      statusColors[status] ||
      "bg-[var(--color-bg-soft)] text-[var(--color-text-muted)] border border-[var(--color-border)]"
    )
  }

  const getAttendanceStatusColor = (status) => {
    const statusColors = {
      OnTime:
        "bg-green-100 text-green-800 border border-green-300 dark:bg-green-900/50 dark:text-green-200 dark:border-green-700",
      Late:
        "bg-yellow-100 text-yellow-800 border border-yellow-300 dark:bg-yellow-900/50 dark:text-yellow-200 dark:border-yellow-700",
      Absent:
        "bg-red-100 text-red-800 border border-red-300 dark:bg-red-900/50 dark:text-red-200 dark:border-red-700",
      EarlyCheckout:
        "bg-orange-100 text-orange-800 border border-orange-300 dark:bg-orange-900/50 dark:text-orange-200 dark:border-orange-700",
    }

    return (
      statusColors[status] ||
      "bg-[var(--color-bg-soft)] text-[var(--color-text-muted)] border border-[var(--color-border)]"
    )
  }

  const getAttendanceTone = (status) => {
    const tones = {
      OnTime: {
        icon: CheckCircle,
        iconClass: "text-green-700 dark:text-green-300",
        bgClass: "bg-green-100 dark:bg-green-900/50",
        borderClass: "border-green-300 dark:border-green-700",
        labelClass: "text-green-800 dark:text-green-200",
      },
      Late: {
        icon: Clock,
        iconClass: "text-yellow-700 dark:text-yellow-300",
        bgClass: "bg-yellow-100 dark:bg-yellow-900/50",
        borderClass: "border-yellow-300 dark:border-yellow-700",
        labelClass: "text-yellow-800 dark:text-yellow-200",
      },
      Absent: {
        icon: XCircle,
        iconClass: "text-red-700 dark:text-red-300",
        bgClass: "bg-red-100 dark:bg-red-900/50",
        borderClass: "border-red-300 dark:border-red-700",
        labelClass: "text-red-800 dark:text-red-200",
      },
      EarlyCheckout: {
        icon: AlertCircle,
        iconClass: "text-orange-700 dark:text-orange-300",
        bgClass: "bg-orange-100 dark:bg-orange-900/50",
        borderClass: "border-orange-300 dark:border-orange-700",
        labelClass: "text-orange-800 dark:text-orange-200",
      },
    }

    return (
      tones[status] || {
        icon: Activity,
        iconClass: "text-slate-700 dark:text-slate-300",
        bgClass: "bg-slate-100 dark:bg-slate-800/80",
        borderClass: "border-slate-300 dark:border-slate-700",
        labelClass: "text-slate-700 dark:text-slate-300",
      }
    )
  }

  const getLocalized = (arValue, enValue) => {
    return currentLang === "en" ? enValue || arValue : arValue || enValue
  }

  const formatTime = (value) => {
    if (!value) return "-"

    return new Date(value).toLocaleTimeString(currentLang, {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getAttendanceDateKey = (record) => {
    if (!record?.workDate) return ""
    return new Date(record.workDate).toISOString().slice(0, 10)
  }

  const groupAttendanceByDate = (records = []) => {
    return records.reduce((acc, record) => {
      const key = getAttendanceDateKey(record)

      if (!acc[key]) {
        acc[key] = []
      }

      acc[key].push(record)

      return acc
    }, {})
  }

  const getAttendanceCalendarDays = (records = []) => {
    if (!records.length) return []

    const sortedDates = records
      .map((record) => new Date(record.workDate))
      .filter((date) => !Number.isNaN(date.getTime()))
      .sort((a, b) => a - b)

    if (!sortedDates.length) return []

    const firstDate = sortedDates[0]
    const lastDate = sortedDates[sortedDates.length - 1]

    const start = new Date(firstDate.getFullYear(), firstDate.getMonth(), 1)
    const end = new Date(lastDate.getFullYear(), lastDate.getMonth() + 1, 0)

    const days = []
    const current = new Date(start)

    while (current <= end) {
      const dateKey = current.toISOString().slice(0, 10)

      days.push({
        date: new Date(current),
        dateKey,
        day: current.getDate(),
        records: groupAttendanceByDate(records)[dateKey] || [],
      })

      current.setDate(current.getDate() + 1)
    }

    return days
  }

  const StatCard = ({ icon: Icon, value, label, hint, tone = "calendar" }) => (
    <div className={`${theme.card} p-5`}>
      <div className="flex items-center justify-between gap-4 mb-3">
        <div
          className={`w-12 h-12 ${iconBg[tone]} rounded-xl flex items-center justify-center`}
        >
          <Icon className={`w-6 h-6 ${iconColors[tone]}`} />
        </div>

        <span className="text-3xl font-extrabold text-[var(--color-text)]">
          {value ?? 0}
        </span>
      </div>

      <h3 className="text-sm font-semibold text-[var(--color-text-muted)]">
        {label}
      </h3>

      {hint && (
        <p className="text-xs mt-2 text-[var(--color-text-muted)]">{hint}</p>
      )}
    </div>
  )

  const InfoItem = ({ icon: Icon, iconClass, label, value }) => (
    <div className="flex items-center gap-3 min-w-0">
      <Icon className={`w-5 h-5 flex-shrink-0 ${iconClass}`} />

      <div className="min-w-0">
        <p className="text-xs font-semibold text-[var(--color-text-muted)]">
          {label}
        </p>

        <p className="text-sm text-[var(--color-text)] truncate">{value}</p>
      </div>
    </div>
  )

  const AttendanceStatusBadge = ({ status }) => (
    <span
      className={`px-3 py-1 rounded-full text-xs font-bold ${getAttendanceStatusColor(
        status
      )}`}
    >
      {status || "-"}
    </span>
  )

  const AttendanceCalendarCard = ({ record }) => {
    const tone = getAttendanceTone(record.status)
    const StatusIcon = tone.icon

    return (
      <div
        className={`rounded-xl border p-3 ${tone.bgClass} ${tone.borderClass}`}
      >
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <StatusIcon className={`w-4 h-4 ${tone.iconClass}`} />
            <span className={`text-xs font-extrabold ${tone.labelClass}`}>
              {record.status}
            </span>
          </div>

          {record.lateMinutes > 0 && (
            <span className="text-[10px] font-bold text-yellow-800 dark:text-yellow-200 bg-yellow-200 dark:bg-yellow-900/60 px-2 py-0.5 rounded-full">
              +{record.lateMinutes}m
            </span>
          )}
        </div>

        <div className="space-y-1 text-[11px]">
          <p className="font-bold text-[var(--color-text)] truncate">
            {getLocalized(record.departmentNameAr, record.departmentNameEn)}
          </p>

          <p className="text-[var(--color-text-muted)] truncate">
            {getLocalized(record.shiftTypeNameAr, record.shiftTypeNameEn)}
          </p>

          <div className="flex items-center justify-between gap-2 text-[var(--color-text-muted)]">
            <span>{formatTime(record.timeIn)}</span>
            <span>→</span>
            <span>{formatTime(record.timeOut)}</span>
          </div>

          <div className="flex items-center justify-between gap-2 pt-1 border-t border-black/10 dark:border-white/10">
            <span>{t("doctorReport.attendanceRecords.workedHours")}</span>
            <span className="font-bold text-[var(--color-text)]">
              {record.workedHours}h
            </span>
          </div>
        </div>
      </div>
    )
  }

  if (loadingDoctorReport) {
    return <LoadingGetData text={t("gettingData.doctorReport")} />
  }

  if (doctorReportError) {
    return (
      <div className={theme.page} dir={isRTL ? "rtl" : "ltr"}>
        <div className="max-w-2xl mx-auto">
          <div className={`${theme.card} p-8 text-center`}>
            <div
              className={`w-20 h-20 ${iconBg.danger} rounded-full flex items-center justify-center mx-auto mb-6`}
            >
              <AlertCircle className={`w-10 h-10 ${iconColors.danger}`} />
            </div>

            <h3 className="text-2xl font-bold text-[var(--color-text)] mb-4">
              {t("doctorReport.error.title")}
            </h3>

            <p className="text-[var(--color-text-muted)] mb-8 text-lg">
              {doctorReportError.message}
            </p>

            <button
              type="button"
              onClick={() => navigate(-1)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              {t("common.goBack")}
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!doctorReport) {
    return (
      <div className={theme.page} dir={isRTL ? "rtl" : "ltr"}>
        <div className="max-w-2xl mx-auto">
          <div className={`${theme.card} p-8 text-center`}>
            <div
              className={`w-20 h-20 ${iconBg.file} rounded-full flex items-center justify-center mx-auto mb-6`}
            >
              <FileText className={`w-10 h-10 ${iconColors.file}`} />
            </div>

            <h3 className="text-2xl font-bold text-[var(--color-text)] mb-4">
              {t("doctorReport.notFound.title")}
            </h3>

            <button
              type="button"
              onClick={() => navigate(-1)}
              className={theme.secondaryButton}
            >
              {t("common.goBack")}
            </button>
          </div>
        </div>
      </div>
    )
  }

  const report = doctorReport
  const attendanceCalendarDays = getAttendanceCalendarDays(
    report.attendanceRecords || []
  )

  return (
    <div className={theme.page} dir={isRTL ? "rtl" : "ltr"}>
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4 gap-3 flex-wrap">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 text-blue-700 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-200 transition-colors duration-200 font-semibold"
            >
              {currentLang === "en" ? (
                <ArrowLeft className="w-5 h-5" />
              ) : (
                <ArrowRight className="w-5 h-5" />
              )}
              {t("common.goBack")}
            </button>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                className={`${theme.secondaryButton} shadow-sm`}
              >
                <Filter size={18} className={iconColors.filter} />
                <span>{t("reports.filters") || "Filters"}</span>
              </button>

              <button
                type="button"
                onClick={() =>
                  exportDoctorReportToExcel(report, currentLang, t)
                }
                className="bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl font-semibold"
              >
                <Download size={18} />
                <span>{t("reports.export.title") || "Export"}</span>
              </button>
            </div>
          </div>

          {showFilters && (
            <div className={`${theme.card} p-5 mb-5`}>
              <h3 className="text-lg font-bold text-[var(--color-text)] mb-4 flex items-center gap-2">
                <Filter className={`w-5 h-5 ${iconColors.filter}`} />
                {t("department.filters.title") || "Date Filters"}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2 text-[var(--color-text)]">
                    {t("contractingTypes.filters.fromDate") || "Date From"}
                  </label>

                  <input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className={theme.input}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2 text-[var(--color-text)]">
                    {t("contractingTypes.filters.toDate") || "Date To"}
                  </label>

                  <input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className={theme.input}
                  />
                </div>

                <div className="flex items-end gap-2">
                  <button
                    type="button"
                    onClick={handleApplyFilters}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg transition-all duration-200 font-semibold"
                  >
                    {t("department.filters.apply") || "Apply"}
                  </button>

                  <button
                    type="button"
                    onClick={handleClearFilters}
                    className="flex-1 bg-[var(--color-bg-soft)] hover:bg-[var(--color-surface-muted)] text-[var(--color-text)] border border-[var(--color-border)] px-5 py-2 rounded-lg transition-all duration-200 font-semibold"
                  >
                    {t("department.filters.clear") || "Clear"}
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className={`${theme.card} p-6`}>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="flex items-center gap-5">
                <div
                  className={`w-20 h-20 ${iconBg.user} rounded-2xl flex items-center justify-center`}
                >
                  <User className={`w-10 h-10 ${iconColors.user}`} />
                </div>

                <div>
                  <h1 className="text-3xl font-extrabold text-[var(--color-text)] mb-2">
                    {getLocalized(report.nameAr, report.nameEn)}
                  </h1>

                  <p className="text-lg text-[var(--color-text-muted)]">
                    {getLocalized(report.categoryNameAr, report.categoryNameEn)}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <span className="px-4 py-2 rounded-full text-sm font-bold bg-purple-100 text-purple-800 border border-purple-300 dark:bg-purple-900/50 dark:text-purple-200 dark:border-purple-700">
                  {getLocalized(
                    report.scientificDegreeNameAr,
                    report.scientificDegreeNameEn
                  )}
                </span>

                <span className="px-4 py-2 rounded-full text-sm font-bold bg-green-100 text-green-800 border border-green-300 dark:bg-green-900/50 dark:text-green-200 dark:border-green-700">
                  {getLocalized(
                    report.contractingTypeNameAr,
                    report.contractingTypeNameEn
                  )}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-6 border-t border-[var(--color-border)]">
              <InfoItem
                icon={Mail}
                iconClass={iconColors.mail}
                label={t("common.email") || "Email"}
                value={report.email || "-"}
              />

              <InfoItem
                icon={Phone}
                iconClass={iconColors.phone}
                label={t("common.phone") || "Phone"}
                value={report.mobile || "-"}
              />

              <InfoItem
                icon={IdCard}
                iconClass={iconColors.id}
                label={t("doctorReport.nationalId") || "National ID"}
                value={report.nationalId || "-"}
              />
            </div>
          </div>
        </div>

        {report.rolesSummary && (
          <div className={`${theme.card} p-6 mb-6`}>
            <h2 className="text-2xl font-bold text-[var(--color-text)] mb-6 flex items-center gap-3">
              <Award className={`w-6 h-6 ${iconColors.award}`} />
              {t("doctorReport.roles.title") || "Roles & Permissions"}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className={`${theme.cardSoft} p-5`}>
                <h3 className="text-sm font-semibold mb-2 text-[var(--color-text-muted)]">
                  {t("doctorReport.roles.currentRole") || "Current Role"}
                </h3>

                <p className="text-2xl font-extrabold text-[var(--color-text)]">
                  {currentLang === "en"
                    ? report.rolesSummary.currentRole
                    : report.rolesSummary.currentRoleNameAr}
                </p>

                <p className="text-sm mt-2 text-[var(--color-text-muted)]">
                  {t("contractingTypes.filters.fromDate") || "Since"}:{" "}
                  {formatDate(report.rolesSummary.currentSince)}
                </p>
              </div>

              <div className={`${theme.cardSoft} p-5`}>
                <h3 className="text-sm font-semibold mb-2 text-[var(--color-text-muted)]">
                  {t("doctorReport.roles.context") || "Context"}
                </h3>

                <p className="text-lg font-bold text-[var(--color-text)]">
                  {report.rolesSummary.currentContextText}
                </p>
              </div>
            </div>
          </div>
        )}

        {report.rolesHistory && report.rolesHistory.length > 0 && (
          <div className={`${theme.card} p-6 mb-6`}>
            <h2 className="text-2xl font-bold text-[var(--color-text)] mb-6 flex items-center gap-3">
              <ShieldCheck className={`w-6 h-6 ${iconColors.award}`} />
              {t("managementRoles.tabs.history") || "Role History"}
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[var(--color-surface-muted)]">
                  <tr className="border-b border-[var(--color-border)]">
                    <th
                      className={`text-${
                        isRTL ? "right" : "left"
                      } p-4 font-bold text-[var(--color-text)]`}
                    >
                      {t("managementRoles.table.role") || "Role"}
                    </th>
                    <th
                      className={`text-${
                        isRTL ? "right" : "left"
                      } p-4 font-bold text-[var(--color-text)]`}
                    >
                      {t("doctorReport.roles.assignedAt") || "Assigned At"}
                    </th>
                    <th
                      className={`text-${
                        isRTL ? "right" : "left"
                      } p-4 font-bold text-[var(--color-text)]`}
                    >
                      {t("roster.workingHours.assignedBy") || "Assigned By"}
                    </th>
                    <th
                      className={`text-${
                        isRTL ? "right" : "left"
                      } p-4 font-bold text-[var(--color-text)]`}
                    >
                      {t("categories.filters.status") || "Status"}
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {report.rolesHistory.map((role) => (
                    <tr
                      key={role.id}
                      className={`border-b border-[var(--color-border)] ${theme.hoverRow}`}
                    >
                      <td className="p-4 text-[var(--color-text)]">
                        {currentLang === "en" ? role.role : role.roleNameAr}
                      </td>

                      <td className="p-4 text-[var(--color-text-muted)]">
                        {formatDate(role.assignedAt)}
                      </td>

                      <td className="p-4 text-[var(--color-text-muted)]">
                        {role.assignedByName}
                      </td>

                      <td className="p-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold ${
                            role.isActive
                              ? "bg-[var(--color-success-soft)] text-[var(--color-success)] border border-[var(--color-success)]/20"
                              : "bg-[var(--color-bg-soft)] text-[var(--color-text-muted)] border border-[var(--color-border)]"
                          }`}
                        >
                          {role.isActive
                            ? t("common.active") || "Active"
                            : t("common.inactive") || "Inactive"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
          <StatCard
            icon={Calendar}
            value={report.stats.totalScheduledShifts}
            label={t("doctorReport.stats.totalScheduledShifts")}
            tone="calendar"
          />

          <StatCard
            icon={CheckCircle}
            value={report.stats.totalPresentDays}
            label={t("doctorReport.stats.totalPresentDays")}
            hint={`${report.stats.attendanceRate}%`}
            tone="check"
          />

          <StatCard
            icon={Clock}
            value={report.stats.totalLateDays}
            label={t("doctorReport.stats.totalLateDays")}
            tone="clock"
          />

          <StatCard
            icon={Activity}
            value={report.stats.totalWorkedHours}
            label={t("doctorReport.stats.totalWorkedHours")}
            hint={`${t("doctorReport.stats.of")} ${
              report.stats.totalAssignedHours
            } ${t("doctorReport.stats.hours")}`}
            tone="activity"
          />
        </div>

        <div className={`${theme.card} p-6 mb-6`}>
          <h2 className="text-2xl font-bold text-[var(--color-text)] mb-6 flex items-center gap-3">
            <BarChart3 className={`w-6 h-6 ${iconColors.chart}`} />
            {t("doctorReport.hoursAnalysis.title")}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-6">
            <div className={`${theme.cardSoft} p-5`}>
              <h3 className="text-sm font-semibold mb-2 text-[var(--color-text-muted)]">
                {t("doctorReport.hoursAnalysis.totalAssignedHours")}
              </h3>

              <p className="text-3xl font-extrabold text-[var(--color-text)]">
                {report.hoursAnalysis.totalAssignedHours}
              </p>
            </div>

            <div className={`${theme.cardSoft} p-5`}>
              <h3 className="text-sm font-semibold mb-2 text-[var(--color-text-muted)]">
                {t("doctorReport.hoursAnalysis.totalWorkedHours")}
              </h3>

              <p className="text-3xl font-extrabold text-[var(--color-text)]">
                {report.hoursAnalysis.totalWorkedHours}
              </p>
            </div>

            <div className={`${theme.cardSoft} p-5`}>
              <h3 className="text-sm font-semibold mb-2 text-[var(--color-text-muted)]">
                {t("doctorReport.hoursAnalysis.compliancePercentage")}
              </h3>

              <div className="flex items-center gap-3 flex-wrap">
                <p className="text-3xl font-extrabold text-[var(--color-text)]">
                  {report.hoursAnalysis.compliancePercentage.toFixed(1)}%
                </p>

                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold ${getComplianceStatusColor(
                    report.hoursAnalysis.complianceStatus
                  )}`}
                >
                  {currentLang === "en"
                    ? report.hoursAnalysis.complianceStatus
                    : report.hoursAnalysis.complianceStatusAr}
                </span>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[var(--color-surface-muted)]">
                <tr className="border-b border-[var(--color-border)]">
                  <th
                    className={`text-${
                      isRTL ? "right" : "left"
                    } p-4 font-bold text-[var(--color-text)]`}
                  >
                    {t("doctorReport.hoursAnalysis.rosterTitle")}
                  </th>
                  <th
                    className={`text-${
                      isRTL ? "right" : "left"
                    } p-4 font-bold text-[var(--color-text)]`}
                  >
                    {t("doctorReport.hoursAnalysis.assignedHours")}
                  </th>
                  <th
                    className={`text-${
                      isRTL ? "right" : "left"
                    } p-4 font-bold text-[var(--color-text)]`}
                  >
                    {t("doctorReport.hoursAnalysis.workedHours")}
                  </th>
                  <th
                    className={`text-${
                      isRTL ? "right" : "left"
                    } p-4 font-bold text-[var(--color-text)]`}
                  >
                    {t("doctorReport.hoursAnalysis.compliance")}
                  </th>
                </tr>
              </thead>

              <tbody>
                {report.hoursAnalysis.rosterDetails.map((roster) => (
                  <tr
                    key={roster.rosterId}
                    className={`border-b border-[var(--color-border)] ${theme.hoverRow}`}
                  >
                    <td className="p-4 text-[var(--color-text)]">
                      {roster.rosterTitle}
                    </td>

                    <td className="p-4 text-[var(--color-text-muted)]">
                      {roster.assignedHours}
                    </td>

                    <td className="p-4 text-[var(--color-text-muted)]">
                      {roster.workedHours}
                    </td>

                    <td className="p-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold ${
                          roster.compliancePercentage >= 90
                            ? "bg-green-100 text-green-800 border border-green-300 dark:bg-green-900/50 dark:text-green-200 dark:border-green-700"
                            : roster.compliancePercentage >= 70
                            ? "bg-yellow-100 text-yellow-800 border border-yellow-300 dark:bg-yellow-900/50 dark:text-yellow-200 dark:border-yellow-700"
                            : "bg-red-100 text-red-800 border border-red-300 dark:bg-red-900/50 dark:text-red-200 dark:border-red-700"
                        }`}
                      >
                        {roster.compliancePercentage.toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className={`${theme.card} p-6 mb-6`}>
          <h2 className="text-2xl font-bold text-[var(--color-text)] mb-6 flex items-center gap-3">
            <CheckCircle className={`w-6 h-6 ${iconColors.check}`} />
            {t("doctorReport.attendanceChart.title")}
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-5 rounded-xl bg-green-100 dark:bg-green-900/50 border border-green-300 dark:border-green-700">
              <div className="flex items-center justify-between mb-2">
                <CheckCircle className="w-5 h-5 text-green-700 dark:text-green-300" />
                <span className="text-2xl font-extrabold text-green-700 dark:text-green-300">
                  {report.attendanceChart.onTime}
                </span>
              </div>

              <p className="text-sm font-semibold text-green-800 dark:text-green-200">
                {t("doctorReport.attendanceChart.onTime")}
              </p>
            </div>

            <div className="p-5 rounded-xl bg-yellow-100 dark:bg-yellow-900/50 border border-yellow-300 dark:border-yellow-700">
              <div className="flex items-center justify-between mb-2">
                <Clock className="w-5 h-5 text-yellow-700 dark:text-yellow-300" />
                <span className="text-2xl font-extrabold text-yellow-700 dark:text-yellow-300">
                  {report.attendanceChart.late}
                </span>
              </div>

              <p className="text-sm font-semibold text-yellow-800 dark:text-yellow-200">
                {t("doctorReport.attendanceChart.late")}
              </p>
            </div>

            <div className="p-5 rounded-xl bg-red-100 dark:bg-red-900/50 border border-red-300 dark:border-red-700">
              <div className="flex items-center justify-between mb-2">
                <XCircle className="w-5 h-5 text-red-700 dark:text-red-300" />
                <span className="text-2xl font-extrabold text-red-700 dark:text-red-300">
                  {report.attendanceChart.absent}
                </span>
              </div>

              <p className="text-sm font-semibold text-red-800 dark:text-red-200">
                {t("doctorReport.attendanceChart.absent")}
              </p>
            </div>

            <div className="p-5 rounded-xl bg-orange-100 dark:bg-orange-900/50 border border-orange-300 dark:border-orange-700">
              <div className="flex items-center justify-between mb-2">
                <AlertCircle className="w-5 h-5 text-orange-700 dark:text-orange-300" />
                <span className="text-2xl font-extrabold text-orange-700 dark:text-orange-300">
                  {report.attendanceChart.earlyCheckout}
                </span>
              </div>

              <p className="text-sm font-semibold text-orange-800 dark:text-orange-200">
                {t("doctorReport.attendanceChart.earlyCheckout")}
              </p>
            </div>
          </div>
        </div>

        <div className={`${theme.card} p-6 mb-6`}>
          <h2 className="text-2xl font-bold text-[var(--color-text)] mb-6 flex items-center gap-3">
            <Calendar className={`w-6 h-6 ${iconColors.award}`} />
            {t("doctorReport.monthlyDistribution.title")}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {report.monthlyRosterDistribution.months.map((month) => (
              <div
                key={`${month.year}-${month.month}`}
                className={`${theme.cardSoft} p-5`}
              >
                <h3 className="text-lg font-bold mb-4 text-[var(--color-text)]">
                  {month.monthName}
                </h3>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[var(--color-text-muted)]">
                      {t("doctorReport.monthlyDistribution.totalShifts")}
                    </span>
                    <span className="font-bold text-[var(--color-text)]">
                      {month.totalShifts}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[var(--color-text-muted)]">
                      {t("doctorReport.monthlyDistribution.completedShifts")}
                    </span>
                    <span className="font-bold text-[var(--color-text)]">
                      {month.completedShifts}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[var(--color-text-muted)]">
                      {t("doctorReport.monthlyDistribution.workingHours")}
                    </span>
                    <span className="font-bold text-[var(--color-text)]">
                      {month.workingHours}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {report.attendanceRecords && report.attendanceRecords.length > 0 && (
          <div className={`${theme.card} p-6 mb-6`}>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
              <h2 className="text-2xl font-bold text-[var(--color-text)] flex items-center gap-3">
                <Activity className={`w-6 h-6 ${iconColors.chart}`} />
                {t("doctorReport.attendanceRecords.title")}
              </h2>

              <div className="flex items-center gap-2 bg-[var(--color-surface-muted)] border border-[var(--color-border)] rounded-xl p-1">
                <button
                  type="button"
                  onClick={() => setAttendanceViewMode("rows")}
                  className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-bold transition-colors ${
                    attendanceViewMode === "rows"
                      ? "bg-[var(--color-primary)] text-white"
                      : "text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg-soft)]"
                  }`}
                >
                  <Rows3 size={16} />
                  {currentLang === "ar" ? "صفوف" : "Rows"}
                </button>

                <button
                  type="button"
                  onClick={() => setAttendanceViewMode("calendar")}
                  className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-bold transition-colors ${
                    attendanceViewMode === "calendar"
                      ? "bg-[var(--color-primary)] text-white"
                      : "text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg-soft)]"
                  }`}
                >
                  <Grid3X3 size={16} />
                  {currentLang === "ar" ? "تقويم" : "Calendar"}
                </button>
              </div>
            </div>

            {attendanceViewMode === "rows" && (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[var(--color-surface-muted)]">
                    <tr className="border-b border-[var(--color-border)]">
                      <th
                        className={`text-${
                          isRTL ? "right" : "left"
                        } p-4 font-bold text-[var(--color-text)]`}
                      >
                        {t("doctorReport.attendanceRecords.date")}
                      </th>
                      <th
                        className={`text-${
                          isRTL ? "right" : "left"
                        } p-4 font-bold text-[var(--color-text)]`}
                      >
                        {t("doctorReport.attendanceRecords.department")}
                      </th>
                      <th
                        className={`text-${
                          isRTL ? "right" : "left"
                        } p-4 font-bold text-[var(--color-text)]`}
                      >
                        {t("doctorReport.attendanceRecords.shiftType")}
                      </th>
                      <th
                        className={`text-${
                          isRTL ? "right" : "left"
                        } p-4 font-bold text-[var(--color-text)]`}
                      >
                        {t("doctorReport.attendanceRecords.timeIn")}
                      </th>
                      <th
                        className={`text-${
                          isRTL ? "right" : "left"
                        } p-4 font-bold text-[var(--color-text)]`}
                      >
                        {t("doctorReport.attendanceRecords.timeOut")}
                      </th>
                      <th
                        className={`text-${
                          isRTL ? "right" : "left"
                        } p-4 font-bold text-[var(--color-text)]`}
                      >
                        {t("doctorReport.attendanceRecords.workedHours")}
                      </th>
                      <th
                        className={`text-${
                          isRTL ? "right" : "left"
                        } p-4 font-bold text-[var(--color-text)]`}
                      >
                        {t("doctorReport.attendanceRecords.status")}
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {report.attendanceRecords.map((record) => (
                      <tr
                        key={record.recordId}
                        className={`border-b border-[var(--color-border)] ${theme.hoverRow}`}
                      >
                        <td className="p-4 text-[var(--color-text)]">
                          <div className="font-bold">
                            {formatDate(record.workDate)}
                          </div>
                          <div className="text-xs text-[var(--color-text-muted)]">
                            {getLocalized(record.dayNameAr, record.dayNameEn)}
                          </div>
                        </td>

                        <td className="p-4 text-[var(--color-text-muted)]">
                          {getLocalized(
                            record.departmentNameAr,
                            record.departmentNameEn
                          )}
                        </td>

                        <td className="p-4 text-[var(--color-text-muted)]">
                          {getLocalized(
                            record.shiftTypeNameAr,
                            record.shiftTypeNameEn
                          )}
                        </td>

                        <td className="p-4 text-[var(--color-text-muted)]">
                          {formatTime(record.timeIn)}
                        </td>

                        <td className="p-4 text-[var(--color-text-muted)]">
                          {formatTime(record.timeOut)}
                        </td>

                        <td className="p-4 text-[var(--color-text-muted)]">
                          {record.workedHours} {t("doctorReport.stats.hours")}
                        </td>

                        <td className="p-4">
                          <AttendanceStatusBadge status={record.status} />

                          {record.lateMinutes > 0 && (
                            <div className="text-xs mt-1 text-[var(--color-text-muted)]">
                              {record.lateMinutes}{" "}
                              {t(
                                "doctorReport.attendanceRecords.minutesLate"
                              )}
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {attendanceViewMode === "calendar" && (
              <div className="space-y-5">
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
                  {attendanceCalendarDays.map((dayItem) => (
                    <div
                      key={dayItem.dateKey}
                      className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-muted)] p-3 min-h-[150px]"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="text-xs font-bold text-[var(--color-text-muted)]">
                            {dayItem.date.toLocaleDateString(currentLang, {
                              weekday: "short",
                            })}
                          </p>

                          <p className="text-xl font-extrabold text-blue-700 dark:text-blue-300">
                            {dayItem.day}
                          </p>
                        </div>

                        <Calendar
                          size={18}
                          className={iconColors.calendar}
                        />
                      </div>

                      {dayItem.records.length > 0 ? (
                        <div className="space-y-2">
                          {dayItem.records.map((record) => (
                            <AttendanceCalendarCard
                              key={record.recordId}
                              record={record}
                            />
                          ))}
                        </div>
                      ) : (
                        <div className="h-[80px] rounded-xl border border-dashed border-[var(--color-border)] flex items-center justify-center text-xs text-[var(--color-text-muted)]">
                          {currentLang === "ar" ? "لا يوجد حضور" : "No record"}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {report.rosterAssignments && report.rosterAssignments.length > 0 && (
          <div className={`${theme.card} p-6 mb-6`}>
            <h2 className="text-2xl font-bold text-[var(--color-text)] mb-6 flex items-center gap-3">
              <FileText className={`w-6 h-6 ${iconColors.file}`} />
              {t("doctorReport.rosterAssignments.title")}
            </h2>

            <div className="space-y-6">
              {report.rosterAssignments.map((roster) => (
                <CollapsibleRosterCard
                  key={roster.rosterId}
                  roster={roster}
                  isDark={isDark}
                  isRTL={isRTL}
                  currentLang={currentLang}
                  t={t}
                  formatDate={formatDate}
                  getAttendanceStatusColor={getAttendanceStatusColor}
                />
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <LeaveRecordsSection
            report={report}
            isDark={isDark}
            isRTL={isRTL}
            currentLang={currentLang}
            t={t}
            formatDate={formatDate}
          />

          <SwapRecordsSection
            report={report}
            isDark={isDark}
            isRTL={isRTL}
            currentLang={currentLang}
            t={t}
            formatDate={formatDate}
          />
        </div>
      </div>
    </div>
  )
}

export default DoctorReports