import { useEffect, useMemo, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useParams, Link } from "react-router-dom"
import {
  autoAcceptRequests,
  getRosterById,
  getRosterAttendanceReport,
  getRosterAttendanceSummary,

  // Attendance Analytics Foundation
  getRosterAttendanceDashboard,
  getRosterAttendanceAnalytics,
  getRosterAbsencePatterns,
  getRosterLatePatterns,
  getRosterDepartmentsRealtime,
  getRosterCriticalCoverageGaps,
  getRosterWorkload,
} from "../../../state/act/actRosterManagement"

import { useTranslation } from "react-i18next"
import LoadingGetData from "../../../components/LoadingGetData"
import ModalUpdateRosterStatus from "../../../components/modals/ModalUpdateRosterStatus"
import RosterAttendanceTab from "./RosterAttendanceTab"

import {
  ArrowLeft,
  ArrowRight,
  Edit,
  Calendar,
  Clock,
  User,
  FileText,
  Settings,
  CheckCircle,
  XCircle,
  Layers,
  Timer,
  Target,
  AlertCircle,
  Building,
  Briefcase,
  TrendingUp,
  Info,
  Activity,
  PlusCircle,
  Archive,
  PenTool,
  Send,
  BarChart3,
  ShieldAlert,
  Users,
  RefreshCw,
  Stethoscope,
} from "lucide-react"

import { formatDate } from "../../../utils/formtDate"
import { getPageTheme } from "../../../utils/themeClasses"
import axiosInstance from "../../../utils/axiosInstance"

const todayISO = () => new Date().toISOString().slice(0, 10)

const safeArray = (value) => {
  if (Array.isArray(value)) return value
  if (Array.isArray(value?.items)) return value.items
  if (Array.isArray(value?.data)) return value.data
  if (Array.isArray(value?.data?.items)) return value.data.items
  if (Array.isArray(value?.rows)) return value.rows
  return []
}

const getValue = (...values) => {
  for (const value of values) {
    if (value !== undefined && value !== null && value !== "") return value
  }
  return "-"
}

const getNumber = (...values) => {
  for (const value of values) {
    if (value !== undefined && value !== null && value !== "") {
      const n = Number(value)
      return Number.isNaN(n) ? 0 : n
    }
  }
  return 0
}

const percentText = (value) => {
  const n = Number(value || 0)
  return `${Number.isNaN(n) ? 0 : n.toFixed(1)}%`
}

const authHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("token")}`,
  "Content-Type": "application/json",
})

const unwrapApiResponse = (response) => response?.data?.data || response?.data

const toApiDate = (value) => {
  if (!value) return todayISO()

  const raw = String(value).trim()

  // Already correct for ASP.NET date route binding: 2026-05-23
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw

  // Handle dd-MM-yyyy or dd/MM/yyyy coming from UI/local formatting.
  const dmy = raw.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/)
  if (dmy) {
    const [, day, month, year] = dmy
    return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`
  }

  const date = new Date(raw)
  if (!Number.isNaN(date.getTime())) return date.toISOString().slice(0, 10)

  return todayISO()
}

const getReportMonthYear = (roster, fallbackDate) => {
  const fallback = fallbackDate ? new Date(fallbackDate) : new Date()

  return {
    month: Number(roster?.month || fallback.getMonth() + 1),
    year: Number(roster?.year || fallback.getFullYear()),
  }
}

function RosterDetails() {
  const { rosterId } = useParams()
  const dispatch = useDispatch()
  const { t, i18n } = useTranslation()
  const theme = getPageTheme()

  const [statusModalOpen, setStatusModalOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("details")
  const [analyticsDate, setAnalyticsDate] = useState(todayISO())
  const [heatmapData, setHeatmapData] = useState(null)
  const [bulkMonthlyReport, setBulkMonthlyReport] = useState(null)
  const [analyticsExtraLoading, setAnalyticsExtraLoading] = useState(false)
  const [heatmapError, setHeatmapError] = useState(null)
  const [monthlyReportError, setMonthlyReportError] = useState(null)
  const [statusToUpdate, setStatusToUpdate] = useState({
    id: null,
    title: "",
    currentStatus: "",
  })

  const {
    selectedRoster,
    loading,
    errors,
    rosterAttendanceReport,
    rosterAttendanceSummary,

    // Attendance Analytics state
    attendanceDashboard,
    attendanceAnalytics,
    absencePatterns,
    latePatterns,
    departmentsRealtime,
    criticalCoverageGaps,
    rosterWorkload,
  } = useSelector((state) => state.rosterManagement)

  const { loginRoleResponseDto } = useSelector((state) => state.auth)

  const isRTL = i18n.language === "ar"
  const currentLang = i18n.language || "ar"

  const defaultButtonClass =
    "inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border bg-[var(--color-surface)] text-[var(--color-text)] border-[var(--color-border-strong)] hover:bg-[var(--color-success)] hover:text-white hover:border-[var(--color-success)] active:bg-[var(--color-success-hover)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"

  const selectedButtonClass =
    "inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border bg-[var(--color-success)] text-white border-[var(--color-success)] transition-colors"

  const rosterHeaderActionButtonClass =
    "group inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border bg-[var(--color-surface)] text-[var(--color-text)] border-[var(--color-border-strong)] hover:bg-[var(--color-success)] hover:text-white hover:border-[var(--color-success)] active:bg-[var(--color-success-hover)] transition-colors shadow-sm w-full h-full min-h-[42px] disabled:opacity-50 disabled:cursor-not-allowed"

  const rosterQuickActionButtonClass =
    "group w-full inline-flex items-center justify-center gap-2 p-3 rounded-xl text-sm font-semibold border bg-[var(--color-surface)] text-[var(--color-text)] border-[var(--color-border-strong)] hover:bg-[var(--color-success)] hover:text-white hover:border-[var(--color-success)] active:bg-[var(--color-success-hover)] transition-colors shadow-sm"

  const rosterStatusActionButtonClass =
    "group inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border bg-[var(--color-success)] text-white border-[var(--color-success)] hover:bg-[var(--color-success-hover)] hover:border-[var(--color-success-hover)] transition-colors shadow-sm w-full h-full min-h-[42px]"

  const iconColors = {
    calendar: "text-blue-500 dark:text-blue-500",
    info: "text-blue-500 dark:text-blue-500",
    activity: "text-blue-500 dark:text-blue-500",
    building: "text-emerald-500 dark:text-emerald-500",
    plus: "text-emerald-500 dark:text-emerald-500",
    briefcase: "text-emerald-500 dark:text-emerald-500",
    settings: "text-violet-500 dark:text-violet-500",
    timer: "text-violet-500 dark:text-violet-500",
    target: "text-amber-500 dark:text-amber-500",
    deadline: "text-amber-500 dark:text-amber-500",
    success: "text-emerald-500 dark:text-emerald-500",
    danger: "text-red-500 dark:text-red-500",
    file: "text-slate-500 dark:text-slate-500",
    muted: "text-slate-500 dark:text-slate-500",
  }

  const iconBg = {
    calendar:
      "bg-transparent dark:bg-transparent border-2 border-blue-500 dark:border-blue-500",
    info:
      "bg-transparent dark:bg-transparent border-2 border-blue-500 dark:border-blue-500",
    activity:
      "bg-transparent dark:bg-transparent border-2 border-blue-500 dark:border-blue-500",
    building:
      "bg-transparent dark:bg-transparent border-2 border-emerald-500 dark:border-emerald-500",
    briefcase:
      "bg-transparent dark:bg-transparent border-2 border-emerald-500 dark:border-emerald-500",
    settings:
      "bg-transparent dark:bg-transparent border-2 border-violet-500 dark:border-violet-500",
    timer:
      "bg-transparent dark:bg-transparent border-2 border-violet-500 dark:border-violet-500",
    target:
      "bg-transparent dark:bg-transparent border-2 border-amber-500 dark:border-amber-500",
    success:
      "bg-transparent dark:bg-transparent border-2 border-emerald-500 dark:border-emerald-500",
    danger:
      "bg-transparent dark:bg-transparent border-2 border-red-500 dark:border-red-500",
    deadline:
      "bg-transparent dark:bg-transparent border-2 border-amber-500 dark:border-amber-500",
    file:
      "bg-transparent dark:bg-transparent border-2 border-slate-500 dark:border-slate-500",
  }

  const actionIconColors = {
    edit: "text-blue-500 dark:text-blue-500",
    doctors: "text-emerald-500 dark:text-emerald-500",
    manageDoctors: "text-violet-500 dark:text-violet-500",
    workingHours: "text-amber-500 dark:text-amber-500",
    departments: "text-orange-500 dark:text-orange-500",
    status: "text-white",
    settings: "text-violet-500 dark:text-violet-500",
    detailsTab: "text-blue-500 dark:text-blue-500",
    attendanceTab: "text-violet-500 dark:text-violet-500",
    analyticsTab: "text-emerald-500 dark:text-emerald-500",
  }

  useEffect(() => {
    if (!rosterId) return

    dispatch(getRosterById({ rosterId }))
    dispatch(getRosterAttendanceReport({ rosterId }))
    dispatch(getRosterAttendanceSummary({ rosterId }))
  }, [dispatch, rosterId, statusModalOpen])

  useEffect(() => {
    if (!rosterId || activeTab !== "analytics") return

    loadAnalytics()
  }, [dispatch, rosterId, activeTab, analyticsDate])

  const getRosterStartDate = () => {
    return (
      selectedRoster?.startDate ||
      selectedRoster?.fromDate ||
      `${selectedRoster?.year || new Date().getFullYear()}-${String(
        selectedRoster?.month || new Date().getMonth() + 1
      ).padStart(2, "0")}-01`
    )
  }

  const getRosterEndDate = () => {
    return selectedRoster?.endDate || selectedRoster?.toDate || analyticsDate
  }

  const fetchAnalyticsExtras = async () => {
    if (!rosterId) return

    const startDate = toApiDate(getRosterStartDate())
    const endDate = toApiDate(getRosterEndDate())
    const { month, year } = getReportMonthYear(selectedRoster, analyticsDate)

    setAnalyticsExtraLoading(true)
    setHeatmapError(null)
    setMonthlyReportError(null)

    const heatmapUrl = `/api/v1/AttendanceAnalytics/rosters/${rosterId}/heatmap/${startDate}/${endDate}`

    try {
      const [heatmapRes, bulkReportRes] = await Promise.allSettled([
        axiosInstance.get(heatmapUrl, { headers: authHeaders() }),
        axiosInstance.post(
          "/api/v1/AttendanceAnalytics/bulk-monthly-report",
          {
            rosterId: Number(rosterId),
            month,
            year,
            departmentIds: [],
            categoryIds: [],
            doctorIds: [],
            includeInactiveDoctors: true,
          },
          { headers: authHeaders() }
        ),
      ])

      if (heatmapRes.status === "fulfilled") {
        setHeatmapData(unwrapApiResponse(heatmapRes.value))
      } else {
        setHeatmapData(null)
        const status = heatmapRes.reason?.response?.status
        const apiMessage =
          heatmapRes.reason?.response?.data?.messageAr ||
          heatmapRes.reason?.response?.data?.messageEn ||
          heatmapRes.reason?.response?.data?.message

        setHeatmapError(
          apiMessage ||
            (currentLang === "ar"
              ? `تعذر تحميل Heatmap. تأكد أن التاريخ يخرج بصيغة YYYY-MM-DD. Status: ${status || "Network"}`
              : `Failed to load heatmap. Make sure route dates are YYYY-MM-DD. Status: ${status || "Network"}`)
        )
      }

      if (bulkReportRes.status === "fulfilled") {
        setBulkMonthlyReport(unwrapApiResponse(bulkReportRes.value))
      } else {
        setBulkMonthlyReport(null)
        const status = bulkReportRes.reason?.response?.status
        const apiMessage =
          bulkReportRes.reason?.response?.data?.messageAr ||
          bulkReportRes.reason?.response?.data?.messageEn ||
          bulkReportRes.reason?.response?.data?.message

        setMonthlyReportError(
          apiMessage ||
            (currentLang === "ar"
              ? `تعذر تحميل التقرير الشهري. Status: ${status || "Network"}`
              : `Failed to load monthly report. Status: ${status || "Network"}`)
        )
      }
    } catch (error) {
      const message =
        error?.response?.data?.messageAr ||
        error?.response?.data?.messageEn ||
        error?.response?.data?.message ||
        (currentLang === "ar"
          ? "تعذر تحميل بيانات الـ Heatmap أو التقرير الشهري"
          : "Failed to load heatmap or monthly report")

      setHeatmapError(message)
      setMonthlyReportError(message)
    } finally {
      setAnalyticsExtraLoading(false)
    }
  }

  const loadAnalytics = () => {
    if (!rosterId) return

    const startDate = toApiDate(getRosterStartDate())
    const endDate = toApiDate(getRosterEndDate())

    dispatch(getRosterAttendanceDashboard({ rosterId, date: analyticsDate }))
    dispatch(getRosterAttendanceAnalytics({ rosterId, startDate, endDate }))
    dispatch(getRosterAbsencePatterns({ rosterId, minAbsences: 3 }))
    dispatch(getRosterLatePatterns({ rosterId }))
    dispatch(getRosterDepartmentsRealtime({ rosterId }))
    dispatch(getRosterCriticalCoverageGaps({ rosterId }))
    dispatch(getRosterWorkload({ rosterId, startDate, endDate }))

    fetchAnalyticsExtras()
  }

  const getStatusInfo = (status) => {
    const statusMap = {
      DRAFT_BASIC: {
        name: t("roster.status.draftBasic"),
        color:
          "bg-transparent text-slate-500 border-2 border-slate-500 dark:bg-transparent dark:text-slate-500 dark:border-slate-500",
        icon: FileText,
      },
      DRAFT_PARTIAL: {
        name: t("roster.status.draftPartial"),
        color:
          "bg-transparent text-amber-500 border-2 border-amber-500 dark:bg-transparent dark:text-amber-500 dark:border-amber-500",
        icon: Clock,
      },
      DRAFT: {
        name: t("roster.status.draft"),
        color:
          "bg-transparent text-blue-500 border-2 border-blue-500 dark:bg-transparent dark:text-blue-500 dark:border-blue-500",
        icon: PenTool,
      },
      DRAFT_READY: {
        name: t("roster.status.draftReady"),
        color:
          "bg-transparent text-blue-500 border-2 border-blue-500 dark:bg-transparent dark:text-blue-500 dark:border-blue-500",
        icon: Send,
      },
      PUBLISHED: {
        name: t("roster.status.published"),
        color:
          "bg-transparent text-emerald-500 border-2 border-emerald-500 dark:bg-transparent dark:text-emerald-500 dark:border-emerald-500",
        icon: CheckCircle,
      },
      CLOSED: {
        name: t("roster.status.closed"),
        color:
          "bg-transparent text-red-500 border-2 border-red-500 dark:bg-transparent dark:text-red-500 dark:border-red-500",
        icon: XCircle,
      },
      ARCHIVED: {
        name: t("roster.status.archived"),
        color:
          "bg-transparent text-red-500 border-2 border-red-500 dark:bg-transparent dark:text-red-500 dark:border-red-500",
        icon: Archive,
      },
    }

    return statusMap[status] || statusMap.DRAFT_BASIC
  }

  const getProgressColor = (percentage) => {
    if (percentage >= 80) return "bg-[var(--color-success)]"
    if (percentage >= 50) return "bg-[var(--color-warning)]"
    if (percentage >= 25) return "bg-[var(--color-warning)]"
    return "bg-[var(--color-danger)]"
  }

  const getProgressTextColor = (percentage) => {
    if (percentage >= 80) return "text-[var(--color-success)]"
    if (percentage >= 50) return "text-[var(--color-warning)]"
    if (percentage >= 25) return "text-[var(--color-warning)]"
    return "text-[var(--color-danger)]"
  }

  const changeAutoAcceptedStatus = () => {
    dispatch(
      autoAcceptRequests({
        rosterId: selectedRoster.id,
        autoAcceptRequests: !selectedRoster.autoAcceptRequests,
      })
    )
      .unwrap()
      .then(() => {
        dispatch(getRosterById({ rosterId }))
      })
  }

  const openStatusModal = () => {
    setStatusToUpdate({
      id: selectedRoster.id,
      title: selectedRoster.title,
      currentStatus: selectedRoster.status,
    })
    setStatusModalOpen(true)
  }

  const BooleanBadge = ({ value }) => (
    <span
      className={`inline-flex items-center px-3 py-1 text-sm font-semibold rounded-full ${
        value
          ? "bg-transparent text-emerald-500 border-2 border-emerald-500 dark:bg-transparent dark:text-emerald-500 dark:border-emerald-500"
          : "bg-transparent text-red-500 border-2 border-red-500 dark:bg-transparent dark:text-red-500 dark:border-red-500"
      }`}
    >
      {value ? (
        <CheckCircle size={14} className={isRTL ? "ml-1" : "mr-1"} />
      ) : (
        <XCircle size={14} className={isRTL ? "ml-1" : "mr-1"} />
      )}

      {value ? t("roster.allowed") : t("roster.notAllowed")}
    </span>
  )

  const InfoField = ({ label, children }) => (
    <div>
      <label className="block text-sm font-semibold text-[var(--color-text-muted)] mb-2">
        {label}
      </label>

      <div className="text-base text-[var(--color-text)] font-semibold">
        {children}
      </div>
    </div>
  )

  const StatBox = ({ icon: Icon, iconClass, bgClass, value, label }) => (
    <div className={`text-center p-4 rounded-xl border-2 shadow-sm ${bgClass}`}>
      <Icon className={`h-6 w-6 mx-auto mb-2 ${iconClass}`} />
      <p className={`text-2xl font-bold ${iconClass}`}>{value}</p>
      <p className="text-xs text-[var(--color-text-muted)]">{label}</p>
    </div>
  )

  const DateRow = ({ icon: Icon, iconClass, bgClass, label, value }) => (
    <div
      className={`flex items-center justify-between p-3 rounded-xl border-2 shadow-sm ${bgClass}`}
    >
      <div className="flex items-center">
        <Icon className={`h-5 w-5 ${iconClass} ${isRTL ? "ml-2" : "mr-2"}`} />
        <span className="text-sm font-semibold text-[var(--color-text)]">
          {label}
        </span>
      </div>

      <span className={`text-sm font-bold ${iconClass}`}>{value}</span>
    </div>
  )

  const TabButton = ({ id, icon: Icon, label }) => {
    const isActive = activeTab === id

    const tabIconColors = {
      details: actionIconColors.detailsTab,
      attendance: actionIconColors.attendanceTab,
      analytics: actionIconColors.analyticsTab,
    }

    return (
      <button
        type="button"
        onClick={() => setActiveTab(id)}
        className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-colors ${
          isActive ? selectedButtonClass : defaultButtonClass
        }`}
      >
        <Icon
          size={16}
          className={isActive ? "text-white" : tabIconColors[id] || "text-blue-500"}
        />
        {label}
      </button>
    )
  }

  if (loading?.fetch) {
    return <LoadingGetData text={t("gettingData.roster")} />
  }

  if (errors?.general) {
    return (
      <div className={theme.page} dir={isRTL ? "rtl" : "ltr"}>
        <div className="max-w-4xl mx-auto">
          <div className={`${theme.card} p-6`}>
            <div className="text-center py-12">
              <div className="text-[var(--color-danger)] text-lg mb-4">
                {errors.general}
              </div>

              {loginRoleResponseDto?.roleNameEn === "System Administrator" && (
                <Link to="/admin-panel/rosters" className={defaultButtonClass}>
                  {isRTL ? <ArrowRight size={16} /> : <ArrowLeft size={16} />}
                  <span className={isRTL ? "mr-2" : "ml-2"}>
                    {t("roster.actions.backToList")}
                  </span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!selectedRoster) {
    return (
      <div className={theme.page} dir={isRTL ? "rtl" : "ltr"}>
        <div className="max-w-4xl mx-auto">
          <div className={`${theme.card} p-6`}>
            <div className="text-center py-12">
              <div className="text-lg mb-4 text-[var(--color-text-muted)]">
                {t("roster.notFound")}
              </div>

              {loginRoleResponseDto?.roleNameEn === "System Administrator" && (
                <Link to="/admin-panel/rosters" className={defaultButtonClass}>
                  {isRTL ? <ArrowRight size={16} /> : <ArrowLeft size={16} />}
                  <span className={isRTL ? "mr-2" : "ml-2"}>
                    {t("roster.actions.backToList")}
                  </span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  const statusInfo = getStatusInfo(selectedRoster.status)
  const StatusIcon = statusInfo.icon

  localStorage.setItem("rosterTitle", selectedRoster.title)

  return (
    <div className={theme.page} dir={isRTL ? "rtl" : "ltr"}>
      <div className="max-w-6xl mx-auto">
        {statusModalOpen && (
          <ModalUpdateRosterStatus
            setStatusModalOpen={setStatusModalOpen}
            statusToUpdate={statusToUpdate}
            setStatusToUpdate={setStatusToUpdate}
          />
        )}

        <div className="mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
            {loginRoleResponseDto?.roleNameEn === "System Administrator" && (
              <Link
                to="/admin-panel/rosters"
                className="inline-flex items-center px-3 py-2 text-sm font-semibold text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
              >
                {isRTL ? <ArrowRight size={16} /> : <ArrowLeft size={16} />}
                <span className={isRTL ? "mr-2" : "ml-2"}>
                  {t("roster.actions.backToList")}
                </span>
              </Link>
            )}

            <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 w-full">
              <Link
                to={`/admin-panel/rosters/${selectedRoster.id}/edit`}
                className="w-full sm:w-auto sm:flex-1 sm:min-w-[140px] lg:flex-initial"
              >
                <button type="button" className={rosterHeaderActionButtonClass}>
                  <Edit size={16} className={actionIconColors.edit} />
                  {t("roster.actions.edit")}
                </button>
              </Link>

              <Link
                to={`/admin-panel/rosters/${selectedRoster.id}/doctors`}
                className="w-full sm:w-auto sm:flex-1 sm:min-w-[140px] lg:flex-initial"
              >
                <button type="button" className={rosterHeaderActionButtonClass}>
                  <User size={16} className={actionIconColors.doctors} />
                  {t("roster.actions.doctors")}
                </button>
              </Link>

              <Link
                to={`/admin-panel/rosters/${selectedRoster.id}/manage-doctors`}
                className="w-full sm:w-auto sm:flex-1 sm:min-w-[140px] lg:flex-initial"
              >
                <button type="button" className={rosterHeaderActionButtonClass}>
                  <User size={16} className={actionIconColors.manageDoctors} />
                  {t("roster.actions.manageDoctors")}
                </button>
              </Link>

              <Link
                to={`/admin-panel/rosters/${selectedRoster.id}/working-hours`}
                className="w-full sm:w-auto sm:flex-1 sm:min-w-[140px] lg:flex-initial"
              >
                <button type="button" className={rosterHeaderActionButtonClass}>
                  <Clock size={16} className={actionIconColors.workingHours} />
                  {t("roster.workingHours.title")}
                </button>
              </Link>

              <Link
                to="/admin-panel/rosters/departments"
                className="w-full sm:w-auto sm:flex-1 sm:min-w-[140px] lg:flex-initial"
              >
                <button type="button" className={rosterHeaderActionButtonClass}>
                  <Building size={16} className={actionIconColors.departments} />
                  {t("roster.actions.manageRoster")}
                </button>
              </Link>

              <button
                type="button"
                onClick={openStatusModal}
                className={`${rosterStatusActionButtonClass} sm:w-auto sm:flex-1 sm:min-w-[140px] lg:flex-initial cursor-pointer`}
                title={t("roster.actions.updateStatus")}
              >
                <StatusIcon size={16} className={actionIconColors.status} />
                {statusInfo.name}
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start gap-4">
            <div className={`p-3 rounded-xl ${iconBg.calendar} shadow-sm`}>
              <Calendar className={`h-8 w-8 ${iconColors.calendar}`} />
            </div>

            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-[var(--color-text)] mb-2">
                {selectedRoster.title}
              </h1>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="flex items-center gap-2">
                  <Layers className={`h-4 w-4 ${iconColors.muted}`} />
                  <span className="text-sm text-[var(--color-text-muted)]">
                    {selectedRoster.categoryName}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Calendar className={`h-4 w-4 ${iconColors.muted}`} />
                  <span className="text-sm text-[var(--color-text-muted)]">
                    {formatDate(selectedRoster.startDate)} -{" "}
                    {formatDate(selectedRoster.endDate)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className={`${theme.card} p-4 mb-6`}>
          <div className="flex flex-wrap gap-2">
            <TabButton
              id="details"
              icon={Info}
              label={currentLang === "ar" ? "تفاصيل الروستر" : "Roster Details"}
            />

            <TabButton
              id="attendance"
              icon={Activity}
              label={currentLang === "ar" ? "الحضور" : "Attendance"}
            />

            <TabButton
              id="analytics"
              icon={BarChart3}
              label={currentLang === "ar" ? "التحليلات" : "Analytics"}
            />
          </div>
        </div>

        {activeTab === "details" && (
          <RosterDetailsTab
            selectedRoster={selectedRoster}
            theme={theme}
            t={t}
            isRTL={isRTL}
            iconColors={iconColors}
            iconBg={iconBg}
            actionIconColors={actionIconColors}
            statusInfo={statusInfo}
            StatusIcon={StatusIcon}
            getProgressColor={getProgressColor}
            getProgressTextColor={getProgressTextColor}
            BooleanBadge={BooleanBadge}
            InfoField={InfoField}
            StatBox={StatBox}
            DateRow={DateRow}
            changeAutoAcceptedStatus={changeAutoAcceptedStatus}
            openStatusModal={openStatusModal}
            loading={loading}
            rosterQuickActionButtonClass={rosterQuickActionButtonClass}
            rosterStatusActionButtonClass={rosterStatusActionButtonClass}
          />
        )}

        {activeTab === "attendance" && (
          <RosterAttendanceTab
            report={rosterAttendanceReport}
            summary={rosterAttendanceSummary}
            loading={
              loading?.rosterAttendanceReport ||
              loading?.rosterAttendanceSummary
            }
            error={
              errors?.rosterAttendanceReport ||
              errors?.rosterAttendanceSummary
            }
            currentLang={currentLang}
            isRTL={isRTL}
          />
        )}

        {activeTab === "analytics" && (
          <RosterAnalyticsTab
            theme={theme}
            currentLang={currentLang}
            analyticsDate={analyticsDate}
            setAnalyticsDate={setAnalyticsDate}
            loadAnalytics={loadAnalytics}
            loading={loading}
            errors={errors}
            attendanceDashboard={attendanceDashboard}
            attendanceAnalytics={attendanceAnalytics}
            absencePatterns={absencePatterns}
            latePatterns={latePatterns}
            departmentsRealtime={departmentsRealtime}
            criticalCoverageGaps={criticalCoverageGaps}
            rosterWorkload={rosterWorkload}
            heatmapData={heatmapData}
            bulkMonthlyReport={bulkMonthlyReport}
            analyticsExtraLoading={analyticsExtraLoading}
            heatmapError={heatmapError}
            monthlyReportError={monthlyReportError}
          />
        )}
      </div>
    </div>
  )
}

function RosterDetailsTab({
  selectedRoster,
  theme,
  t,
  isRTL,
  iconColors,
  actionIconColors,
  statusInfo,
  StatusIcon,
  getProgressColor,
  getProgressTextColor,
  BooleanBadge,
  InfoField,
  StatBox,
  DateRow,
  changeAutoAcceptedStatus,
  openStatusModal,
  loading,
  rosterQuickActionButtonClass,
  rosterStatusActionButtonClass,
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <div className={`${theme.card} p-6`}>
          <h2 className="text-xl font-semibold text-[var(--color-text)] mb-6 flex items-center">
            <Info className={`h-5 w-5 ${isRTL ? "ml-2" : "mr-2"} ${iconColors.info}`} />
            {t("roster.details.basicInfo")}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InfoField label={t("roster.form.title")}>
              {selectedRoster.title}
            </InfoField>

            <InfoField label={t("roster.form.category")}>
              {selectedRoster.categoryName}
            </InfoField>

            <InfoField label={t("roster.form.month")}>
              {selectedRoster.month}/{selectedRoster.year}
            </InfoField>

            <InfoField label={t("roster.dayss")}>
              <div className="flex items-center">
                <Calendar
                  className={`${iconColors.muted} ${isRTL ? "ml-2" : "mr-2"}`}
                  size={18}
                />
                <span>
                  {selectedRoster.totalDays} {t("roster.dayss")}
                </span>
              </div>
            </InfoField>

            <InfoField label={t("roster.form.submissionDeadline")}>
              <div className="flex items-center">
                <AlertCircle
                  className={`${iconColors.deadline} ${isRTL ? "ml-2" : "mr-2"}`}
                  size={18}
                />
                <span>{formatDate(selectedRoster.submissionDeadline)}</span>
              </div>
            </InfoField>

            <InfoField label={t("roster.table.status")}>
              <span
                className={`inline-flex items-center px-3 py-1 text-sm font-semibold rounded-full ${statusInfo.color}`}
              >
                <StatusIcon size={14} className={isRTL ? "ml-1" : "mr-1"} />
                {statusInfo.name}
              </span>
            </InfoField>

            {selectedRoster.description && (
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-[var(--color-text-muted)] mb-2">
                  {t("roster.form.description")}
                </label>

                <div className={`${theme.cardSoft} p-3`}>
                  <div className="flex items-start">
                    <FileText
                      className={`h-5 w-5 ${iconColors.file} ${
                        isRTL ? "ml-2" : "mr-2"
                      } mt-0.5 flex-shrink-0`}
                    />

                    <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">
                      {selectedRoster.description}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className={`${theme.card} p-6`}>
          <h2 className="text-xl font-semibold text-[var(--color-text)] mb-6 flex items-center">
            <TrendingUp
              className={`h-5 w-5 ${isRTL ? "ml-2" : "mr-2"} ${iconColors.info}`}
            />
            {t("roster.details.progress")}
          </h2>

          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-semibold text-[var(--color-text-muted)]">
                {t("roster.completionPercentage")}
              </span>

              <span
                className={`text-sm font-bold ${getProgressTextColor(
                  selectedRoster.completionPercentage
                )}`}
              >
                {Math.round(selectedRoster.completionPercentage)}%
              </span>
            </div>

            <div className="w-full bg-[var(--color-bg-soft)] rounded-full h-3 overflow-hidden">
              <div
                className={`h-3 rounded-full transition-all duration-300 ${getProgressColor(
                  selectedRoster.completionPercentage
                )}`}
                style={{
                  width: `${Math.min(selectedRoster.completionPercentage, 100)}%`,
                }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatBox
              icon={Building}
              iconClass={iconColors.calendar}
              bgClass="bg-transparent text-blue-500 border-blue-500 dark:bg-transparent dark:text-blue-500 dark:border-blue-500"
              value={selectedRoster.departmentsCount}
              label={t("roster.departments")}
            />

            <StatBox
              icon={Briefcase}
              iconClass={iconColors.briefcase}
              bgClass="bg-transparent text-emerald-500 border-emerald-500 dark:bg-transparent dark:text-emerald-500 dark:border-emerald-500"
              value={selectedRoster.shiftsCount}
              label={t("roster.shifts")}
            />

            <StatBox
              icon={Timer}
              iconClass={iconColors.timer}
              bgClass="bg-transparent text-violet-500 border-violet-500 dark:bg-transparent dark:text-violet-500 dark:border-violet-500"
              value={selectedRoster.workingHoursCount}
              label={t("roster.workingHours.title")}
            />

            <StatBox
              icon={Target}
              iconClass={iconColors.target}
              bgClass="bg-transparent text-amber-500 border-amber-500 dark:bg-transparent dark:text-amber-500 dark:border-amber-500"
              value={`${Math.round(selectedRoster.completionPercentage)}%`}
              label={t("roster.completed")}
            />
          </div>
        </div>

        <div className={`${theme.card} p-6`}>
          <h2 className="text-xl font-semibold text-[var(--color-text)] mb-6 flex items-center">
            <Settings
              className={`h-5 w-5 ${isRTL ? "ml-2" : "mr-2"} ${iconColors.settings}`}
            />
            {t("roster.details.settings")}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-[var(--color-text-muted)] mb-2">
                {t("roster.form.allowLeaveRequests")}
              </label>
              <BooleanBadge value={selectedRoster.allowLeaveRequests} />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[var(--color-text-muted)] mb-2">
                {t("roster.form.allowSwapRequests")}
              </label>
              <BooleanBadge value={selectedRoster.allowSwapRequests} />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[var(--color-text-muted)] mb-2">
                {t("roster.form.autoAcceptRequests")}
              </label>

              <div className="flex items-center gap-3">
                <BooleanBadge value={selectedRoster.autoAcceptRequests} />

                <button
                  type="button"
                  onClick={changeAutoAcceptedStatus}
                  disabled={loading?.update}
                  className="inline-flex items-center px-3 py-1.5 text-sm font-semibold rounded-lg transition-all duration-200 bg-[var(--color-primary)] hover:bg-[var(--color-success)] text-white disabled:bg-[var(--color-surface-muted)] disabled:cursor-not-allowed"
                >
                  {loading?.update ? (
                    <>
                      <div
                        className={`animate-spin h-4 w-4 rounded-full border-b-2 border-white ${
                          isRTL ? "ml-2" : "mr-2"
                        }`}
                      />
                      {t("roster.actions.updating")}
                    </>
                  ) : (
                    <>
                      <Edit
                        size={14}
                        className={`${isRTL ? "ml-1.5" : "mr-1.5"} ${actionIconColors.edit}`}
                      />
                      {t("roster.actions.change")}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className={`${theme.card} p-6`}>
          <h3 className="text-lg font-semibold text-[var(--color-text)] mb-4 flex items-center">
            <Activity
              className={`h-5 w-5 ${isRTL ? "ml-2" : "mr-2"} ${iconColors.activity}`}
            />
            {t("roster.details.quickActions")}
          </h3>

          <div className="space-y-3">
            <Link to="/admin-panel/rosters/departments" className="block">
              <button type="button" className={rosterQuickActionButtonClass}>
                <Building size={18} className={actionIconColors.departments} />
                {t("roster.actions.manageRoster")}
              </button>
            </Link>

            <button
              type="button"
              onClick={openStatusModal}
              className={rosterStatusActionButtonClass}
            >
              <Settings size={18} className="text-white" />
              {t("roster.actions.updateStatus")}
            </button>

            <Link to={`/admin-panel/rosters/${selectedRoster.id}/edit`} className="block">
              <button type="button" className={rosterQuickActionButtonClass}>
                <Edit size={18} className={actionIconColors.edit} />
                {t("roster.actions.editRoster")}
              </button>
            </Link>

            <Link to={`/admin-panel/rosters/${selectedRoster.id}/doctors`} className="block">
              <button type="button" className={rosterQuickActionButtonClass}>
                <User size={18} className={actionIconColors.doctors} />
                {t("roster.actions.doctors")}
              </button>
            </Link>

            <Link
              to={`/admin-panel/rosters/${selectedRoster.id}/manage-doctors`}
              className="block"
            >
              <button type="button" className={rosterQuickActionButtonClass}>
                <User size={18} className={actionIconColors.manageDoctors} />
                {t("roster.actions.manageDoctors")}
              </button>
            </Link>

            <Link
              to={`/admin-panel/rosters/${selectedRoster.id}/working-hours`}
              className="block"
            >
              <button type="button" className={rosterQuickActionButtonClass}>
                <Clock size={16} className={actionIconColors.workingHours} />
                {t("roster.workingHours.title")}
              </button>
            </Link>
          </div>
        </div>

        <div className={`${theme.card} p-6`}>
          <h3 className="text-lg font-semibold text-[var(--color-text)] mb-4 flex items-center">
            <Calendar
              className={`h-5 w-5 ${isRTL ? "ml-2" : "mr-2"} ${iconColors.calendar}`}
            />
            {t("roster.details.dateInfo")}
          </h3>

          <div className="space-y-4">
            <DateRow
              icon={PlusCircle}
              iconClass={iconColors.plus}
              bgClass="bg-transparent text-emerald-500 border-emerald-500 dark:bg-transparent dark:text-emerald-500 dark:border-emerald-500"
              label={t("roster.details.startDate")}
              value={formatDate(selectedRoster.startDate)}
            />

            <DateRow
              icon={XCircle}
              iconClass={iconColors.danger}
              bgClass="bg-transparent text-red-500 border-red-500 dark:bg-transparent dark:text-red-500 dark:border-red-500"
              label={t("roster.details.endDate")}
              value={formatDate(selectedRoster.endDate)}
            />

            <DateRow
              icon={AlertCircle}
              iconClass={iconColors.deadline}
              bgClass="bg-transparent text-amber-500 border-amber-500 dark:bg-transparent dark:text-amber-500 dark:border-amber-500"
              label={t("roster.details.deadline")}
              value={formatDate(selectedRoster.submissionDeadline)}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

function RosterAnalyticsTab({
  theme,
  currentLang,
  analyticsDate,
  setAnalyticsDate,
  loadAnalytics,
  loading,
  errors,
  attendanceDashboard,
  attendanceAnalytics,
  absencePatterns,
  latePatterns,
  departmentsRealtime,
  criticalCoverageGaps,
  rosterWorkload,
  heatmapData,
  bulkMonthlyReport,
  analyticsExtraLoading,
  heatmapError,
  monthlyReportError,
}) {
  const [analyticsSubTab, setAnalyticsSubTab] = useState("overview")

  const dashboard = attendanceDashboard || {}
  const today = dashboard.todaySnapshot || dashboard.snapshot || dashboard.today || dashboard

  const absenceList = safeArray(absencePatterns)
  const lateList = safeArray(latePatterns)
  const realtimeDepartments = safeArray(departmentsRealtime)
  const criticalGaps = safeArray(criticalCoverageGaps)
  const workloadList = safeArray(rosterWorkload)
  const heatmapList = normalizeHeatmapData(heatmapData)
  const monthlyDoctors = normalizeMonthlyDoctors(bulkMonthlyReport)

  const mainLoading =
    loading?.attendanceDashboard ||
    loading?.attendanceAnalytics ||
    loading?.absencePatterns ||
    loading?.latePatterns ||
    loading?.departmentsRealtime ||
    loading?.criticalCoverageGaps ||
    loading?.rosterWorkload

  const mainError =
    errors?.attendanceDashboard ||
    errors?.attendanceAnalytics ||
    errors?.absencePatterns ||
    errors?.latePatterns ||
    errors?.departmentsRealtime ||
    errors?.criticalCoverageGaps ||
    errors?.rosterWorkload

  const attendanceRate = getNumber(
    today.attendanceRate,
    today.presentRate,
    today.rate,
    attendanceAnalytics?.attendanceRate
  )

  const present = getNumber(today.present, today.presentCount, today.totalPresent)
  const absent = getNumber(today.absent, today.absentCount, today.totalAbsent)
  const late = getNumber(today.late, today.lateCount, today.totalLate)
  const scheduled = getNumber(
    today.scheduled,
    today.scheduledCount,
    today.totalScheduled,
    today.totalDoctors
  )

  return (
    <div className="space-y-6">
      <div className={`${theme.card} p-5`}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-extrabold text-[var(--color-text)] flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-500" />
              {currentLang === "ar"
                ? "تحليلات حضور الروستر"
                : "Roster Attendance Analytics"}
            </h2>

            <p className="text-sm text-[var(--color-text-muted)] mt-1">
              {currentLang === "ar"
                ? "تم تقسيم التحليلات إلى نظرة عامة، Heatmap، تقرير شهري، ومشاكل تشغيلية."
                : "Analytics are split into overview, heatmap, monthly report, and operational problems."}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="date"
              value={analyticsDate}
              onChange={(e) => setAnalyticsDate(e.target.value)}
              className="px-4 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)]"
            />

            <button
              type="button"
              onClick={loadAnalytics}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-bold border bg-[var(--color-surface)] text-[var(--color-text)] border-[var(--color-border-strong)] hover:bg-[var(--color-success)] hover:text-white hover:border-[var(--color-success)] transition-colors"
            >
              <RefreshCw size={16} className="text-blue-500" />
              {currentLang === "ar" ? "تحديث التحليلات" : "Refresh Analytics"}
            </button>
          </div>
        </div>
      </div>

      <div className={`${theme.card} p-3`}>
        <div className="flex flex-wrap gap-2">
          <AnalyticsSubTabButton
            active={analyticsSubTab === "overview"}
            onClick={() => setAnalyticsSubTab("overview")}
            icon={BarChart3}
            label={currentLang === "ar" ? "نظرة عامة" : "Overview"}
            tone="blue"
          />
          <AnalyticsSubTabButton
            active={analyticsSubTab === "heatmap"}
            onClick={() => setAnalyticsSubTab("heatmap")}
            icon={Activity}
            label={currentLang === "ar" ? "الخريطة الحرارية" : "Heatmap"}
            tone="purple"
          />
          <AnalyticsSubTabButton
            active={analyticsSubTab === "monthly"}
            onClick={() => setAnalyticsSubTab("monthly")}
            icon={FileText}
            label={currentLang === "ar" ? "التقرير الشهري" : "Monthly Report"}
            tone="emerald"
          />
          <AnalyticsSubTabButton
            active={analyticsSubTab === "problems"}
            onClick={() => setAnalyticsSubTab("problems")}
            icon={ShieldAlert}
            label={currentLang === "ar" ? "المشاكل" : "Problems"}
            tone="red"
          />
        </div>
      </div>

      {mainError && analyticsSubTab === "overview" && (
        <InlineAnalyticsError
          title={currentLang === "ar" ? "تعذر تحميل التحليلات الأساسية" : "Main analytics could not be loaded"}
          message={typeof mainError === "string" ? mainError : mainError?.message || "Error"}
        />
      )}

      {mainLoading && (
        <div className={`${theme.card} p-8 text-center`}>
          <div className="w-9 h-9 mx-auto mb-4 rounded-full border-4 border-[var(--color-border)] border-t-[var(--color-primary)] animate-spin" />
          <p className="text-sm font-bold text-[var(--color-text-muted)]">
            {currentLang === "ar" ? "جاري تحميل التحليلات..." : "Loading analytics..."}
          </p>
        </div>
      )}

      {analyticsSubTab === "overview" && (
        <AnalyticsOverviewSection
          theme={theme}
          currentLang={currentLang}
          attendanceRate={attendanceRate}
          scheduled={scheduled}
          present={present}
          absent={absent}
          late={late}
          criticalGaps={criticalGaps}
          realtimeDepartments={realtimeDepartments}
          workloadList={workloadList}
        />
      )}

      {analyticsSubTab === "heatmap" && (
        <HeatmapSection
          theme={theme}
          currentLang={currentLang}
          heatmapList={heatmapList}
          heatmapData={heatmapData}
          heatmapError={heatmapError}
          analyticsExtraLoading={analyticsExtraLoading}
        />
      )}

      {analyticsSubTab === "monthly" && (
        <BulkMonthlyReportSection
          theme={theme}
          currentLang={currentLang}
          bulkMonthlyReport={bulkMonthlyReport}
          monthlyDoctors={monthlyDoctors}
          monthlyReportError={monthlyReportError}
          analyticsExtraLoading={analyticsExtraLoading}
        />
      )}

      {analyticsSubTab === "problems" && (
        <AnalyticsProblemsSection
          theme={theme}
          currentLang={currentLang}
          criticalGaps={criticalGaps}
          absenceList={absenceList}
          lateList={lateList}
        />
      )}
    </div>
  )
}

function AnalyticsOverviewSection({
  theme,
  currentLang,
  attendanceRate,
  scheduled,
  present,
  absent,
  late,
  criticalGaps,
  realtimeDepartments,
  workloadList,
}) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        <AnalyticsCard icon={BarChart3} title={currentLang === "ar" ? "معدل الحضور" : "Attendance Rate"} value={percentText(attendanceRate)} tone={attendanceRate >= 80 ? "green" : attendanceRate >= 50 ? "yellow" : "red"} />
        <AnalyticsCard icon={Calendar} title={currentLang === "ar" ? "مجدولين" : "Scheduled"} value={scheduled} tone="blue" />
        <AnalyticsCard icon={CheckCircle} title={currentLang === "ar" ? "حاضرين" : "Present"} value={present} tone="green" />
        <AnalyticsCard icon={XCircle} title={currentLang === "ar" ? "غياب" : "Absent"} value={absent} tone={absent > 0 ? "red" : "green"} />
        <AnalyticsCard icon={Clock} title={currentLang === "ar" ? "متأخرين" : "Late"} value={late} tone={late > 0 ? "yellow" : "green"} />
        <AnalyticsCard icon={ShieldAlert} title={currentLang === "ar" ? "فجوات حرجة" : "Critical Gaps"} value={criticalGaps.length} tone={criticalGaps.length > 0 ? "red" : "green"} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <AnalyticsPanel theme={theme} title={currentLang === "ar" ? "تحليل الأقسام الفوري" : "Departments Realtime"} icon={Building} tone="blue">
          <div className="space-y-3">
            {realtimeDepartments.length === 0 ? (
              <EmptyAnalytics text={currentLang === "ar" ? "لا توجد بيانات أقسام" : "No department data"} />
            ) : (
              realtimeDepartments.slice(0, 8).map((dept, index) => (
                <AnalyticsListItem
                  key={dept.departmentId || dept.id || index}
                  title={getValue(currentLang === "ar" ? dept.departmentNameAr || dept.departmentName : dept.departmentNameEn || dept.departmentName, dept.name)}
                  subtitle={`${currentLang === "ar" ? "معدل الحضور" : "Attendance"}: ${percentText(getNumber(dept.attendanceRate, dept.rate, dept.coverageRate))}`}
                  badge={getValue(dept.status, dept.severity, "Live")}
                  tone={getNumber(dept.attendanceRate, dept.rate, dept.coverageRate) >= 80 ? "green" : "yellow"}
                  icon={Building}
                />
              ))
            )}
          </div>
        </AnalyticsPanel>

        <AnalyticsPanel theme={theme} title={currentLang === "ar" ? "عبء العمل للأطباء" : "Doctor Workload"} icon={Users} tone="purple">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {workloadList.length === 0 ? (
              <EmptyAnalytics text={currentLang === "ar" ? "لا توجد بيانات عبء عمل" : "No workload data"} />
            ) : (
              workloadList.slice(0, 10).map((item, index) => (
                <div key={item.doctorId || index} className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-muted)] p-4">
                  <p className="font-extrabold text-[var(--color-text)] truncate">
                    {currentLang === "ar" ? getValue(item.doctorNameAr, item.doctorName) : getValue(item.doctorName, item.doctorNameAr)}
                  </p>
                  <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                    <MiniMetric label={currentLang === "ar" ? "إجمالي" : "Total"} value={getNumber(item.totalHours)} tone="blue" />
                    <MiniMetric label={currentLang === "ar" ? "عادي" : "Regular"} value={getNumber(item.regularHours)} tone="green" />
                    <MiniMetric label={currentLang === "ar" ? "إضافي" : "Overtime"} value={getNumber(item.overtimeHours)} tone={getNumber(item.overtimeHours) > 0 ? "yellow" : "green"} />
                  </div>
                </div>
              ))
            )}
          </div>
        </AnalyticsPanel>
      </div>
    </div>
  )
}

function AnalyticsProblemsSection({ theme, currentLang, criticalGaps, absenceList, lateList }) {
  return (
    <div className="space-y-6">
      <AnalyticsPanel theme={theme} title={currentLang === "ar" ? "فجوات التغطية الحرجة" : "Critical Coverage Gaps"} icon={ShieldAlert} tone="red">
        <div className="space-y-3">
          {criticalGaps.length === 0 ? (
            <EmptyAnalytics text={currentLang === "ar" ? "لا توجد فجوات حرجة" : "No critical coverage gaps"} />
          ) : (
            criticalGaps.slice(0, 12).map((gap, index) => (
              <AnalyticsListItem
                key={gap.id || index}
                title={getValue(currentLang === "ar" ? gap.departmentNameAr || gap.departmentName : gap.departmentNameEn || gap.departmentName, gap.shiftName, gap.title)}
                subtitle={`${currentLang === "ar" ? "المطلوب" : "Required"}: ${getNumber(gap.requiredDoctors, gap.required)} • ${currentLang === "ar" ? "المسند" : "Assigned"}: ${getNumber(gap.assignedDoctors, gap.assigned)}`}
                badge={getValue(gap.severity, gap.riskLevel, "Critical")}
                tone="red"
                icon={AlertCircle}
              />
            ))
          )}
        </div>
      </AnalyticsPanel>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <AnalyticsPanel theme={theme} title={currentLang === "ar" ? "أنماط الغياب المتكرر" : "Frequent Absence Patterns"} icon={XCircle} tone="red">
          <div className="space-y-3">
            {absenceList.length === 0 ? (
              <EmptyAnalytics text={currentLang === "ar" ? "لا توجد أنماط غياب" : "No absence patterns"} />
            ) : (
              absenceList.slice(0, 8).map((item, index) => (
                <AnalyticsListItem
                  key={item.doctorId || index}
                  title={getValue(item.doctorName, item.doctorNameAr, item.fullName)}
                  subtitle={`${currentLang === "ar" ? "عدد الغياب" : "Absences"}: ${getNumber(item.absenceCount, item.totalAbsences)} • ${currentLang === "ar" ? "النسبة" : "Rate"}: ${percentText(getNumber(item.absenceRate))}`}
                  badge={getValue(item.severity, item.riskLevel, "Risk")}
                  tone={String(item.severity || item.riskLevel).toLowerCase().includes("critical") ? "red" : "yellow"}
                  icon={Stethoscope}
                />
              ))
            )}
          </div>
        </AnalyticsPanel>

        <AnalyticsPanel theme={theme} title={currentLang === "ar" ? "أنماط التأخير المتكرر" : "Frequent Late Patterns"} icon={Clock} tone="yellow">
          <div className="space-y-3">
            {lateList.length === 0 ? (
              <EmptyAnalytics text={currentLang === "ar" ? "لا توجد أنماط تأخير" : "No late patterns"} />
            ) : (
              lateList.slice(0, 8).map((item, index) => (
                <AnalyticsListItem
                  key={item.doctorId || index}
                  title={getValue(item.doctorName, item.doctorNameAr, item.fullName)}
                  subtitle={`${currentLang === "ar" ? "مرات التأخير" : "Late count"}: ${getNumber(item.lateCount, item.totalLate)} • ${currentLang === "ar" ? "متوسط الدقائق" : "Avg minutes"}: ${getNumber(item.averageLateMinutes, item.avgLateMinutes)}`}
                  badge={getValue(item.severity, item.riskLevel, "Late")}
                  tone="yellow"
                  icon={Clock}
                />
              ))
            )}
          </div>
        </AnalyticsPanel>
      </div>
    </div>
  )
}

function HeatmapSection({ theme, currentLang, heatmapList, heatmapData, heatmapError, analyticsExtraLoading }) {
  const normalizedDays = heatmapList.map((item, index) => {
    const attendanceRate = getNumber(item.attendanceRate, item.presentRate, item.coverageRate, item.rate, item.value)
    const absent = getNumber(item.absent, item.absentCount, item.totalAbsent)
    const late = getNumber(item.late, item.lateCount, item.totalLate)
    const scheduled = getNumber(item.scheduled, item.scheduledCount, item.totalScheduled, item.requiredDoctors, item.value)
    const date = getValue(item.date, item.dayDate, item.shiftDate, item.attendanceDate, index + 1)

    let tone = "green"
    if (absent > 0 || attendanceRate < 50) tone = "red"
    else if (late > 0 || attendanceRate < 80) tone = "yellow"
    else if (!scheduled && !attendanceRate) tone = "slate"

    return { ...item, date, attendanceRate, absent, late, scheduled, tone }
  })

  const totalDays = normalizedDays.length
  const riskyDays = normalizedDays.filter((day) => day.tone === "red").length
  const warningDays = normalizedDays.filter((day) => day.tone === "yellow").length
  const goodDays = normalizedDays.filter((day) => day.tone === "green").length

  const bestAttendance = heatmapData?.bestAttendance || {}
  const worstAttendance = heatmapData?.worstAttendance || {}

  return (
    <AnalyticsPanel theme={theme} title={currentLang === "ar" ? "خريطة حرارة الحضور" : "Attendance Heatmap"} icon={Activity} tone="purple">
      {heatmapError && (
        <InlineAnalyticsError
          title={currentLang === "ar" ? "مشكلة في تحميل Heatmap" : "Heatmap loading issue"}
          message={heatmapError}
        />
      )}

      {analyticsExtraLoading && (
        <div className="mb-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-muted)] p-4 text-sm font-bold text-[var(--color-text-muted)]">
          {currentLang === "ar" ? "جاري تحميل Heatmap..." : "Loading heatmap..."}
        </div>
      )}

      <div className="mb-4 grid grid-cols-2 md:grid-cols-4 gap-3">
        <MiniMetric label={currentLang === "ar" ? "الأيام" : "Days"} value={totalDays} tone="blue" />
        <MiniMetric label={currentLang === "ar" ? "جيدة" : "Good"} value={goodDays} tone="green" />
        <MiniMetric label={currentLang === "ar" ? "تحذير" : "Warning"} value={warningDays} tone="yellow" />
        <MiniMetric label={currentLang === "ar" ? "خطر" : "Risk"} value={riskyDays} tone="red" />
      </div>

      {normalizedDays.length === 0 ? (
        <EmptyAnalytics text={currentLang === "ar" ? "لا توجد بيانات Heatmap لهذه الفترة" : "No heatmap data for this range"} />
      ) : (
        <>
          <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-7 lg:grid-cols-10 xl:grid-cols-10 gap-2">
            {normalizedDays.map((day, index) => (
              <HeatmapCell key={`${day.date}-${index}`} day={day} index={index} currentLang={currentLang} />
            ))}
          </div>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
            <HeatmapBestWorstCard title={currentLang === "ar" ? "أفضل حضور" : "Best Attendance"} data={bestAttendance} tone="green" />
            <HeatmapBestWorstCard title={currentLang === "ar" ? "أضعف حضور" : "Worst Attendance"} data={worstAttendance} tone="red" />
          </div>

          <div className="mt-4 flex flex-wrap gap-3 text-xs font-bold text-[var(--color-text-muted)]">
            <LegendDot tone="green" label={currentLang === "ar" ? "حضور جيد" : "Good attendance"} />
            <LegendDot tone="yellow" label={currentLang === "ar" ? "تأخير/نقص بسيط" : "Late / minor gap"} />
            <LegendDot tone="red" label={currentLang === "ar" ? "غياب/خطر" : "Absence / risk"} />
            <LegendDot tone="slate" label={currentLang === "ar" ? "لا توجد بيانات" : "No data"} />
          </div>
        </>
      )}
    </AnalyticsPanel>
  )
}

function BulkMonthlyReportSection({
  theme,
  currentLang,
  bulkMonthlyReport,
  monthlyDoctors,
  monthlyReportError,
  analyticsExtraLoading,
}) {
  const summary = bulkMonthlyReport?.summary || bulkMonthlyReport?.totals || bulkMonthlyReport?.reportSummary || bulkMonthlyReport || {}
  const totalDoctors = getNumber(summary.totalDoctors, summary.doctorsCount, monthlyDoctors.length)
  const totalAbsences = getNumber(summary.totalAbsences, summary.absentDays, summary.absenceDays)
  const totalLateDays = getNumber(summary.totalLateDays, summary.lateDays, summary.totalLate)
  const totalDeductions = getNumber(summary.totalDeductions, summary.salaryDeductions, summary.deductions)

  return (
    <AnalyticsPanel theme={theme} title={currentLang === "ar" ? "التقرير الشهري المجمع" : "Bulk Monthly Report"} icon={FileText} tone="green">
      {monthlyReportError && (
        <InlineAnalyticsError
          title={currentLang === "ar" ? "مشكلة في تحميل التقرير الشهري" : "Monthly report loading issue"}
          message={monthlyReportError}
        />
      )}

      {analyticsExtraLoading && (
        <div className="mb-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-muted)] p-4 text-sm font-bold text-[var(--color-text-muted)]">
          {currentLang === "ar" ? "جاري تحميل التقرير الشهري..." : "Loading monthly report..."}
        </div>
      )}

      {!bulkMonthlyReport ? (
        <EmptyAnalytics text={currentLang === "ar" ? "لا توجد بيانات تقرير شهري حتى الآن" : "No monthly report data yet"} />
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <MiniMetric label={currentLang === "ar" ? "الأطباء" : "Doctors"} value={totalDoctors} tone="blue" />
            <MiniMetric label={currentLang === "ar" ? "أيام الغياب" : "Absence Days"} value={totalAbsences} tone={totalAbsences > 0 ? "red" : "green"} />
            <MiniMetric label={currentLang === "ar" ? "أيام التأخير" : "Late Days"} value={totalLateDays} tone={totalLateDays > 0 ? "yellow" : "green"} />
            <MiniMetric label={currentLang === "ar" ? "الخصومات" : "Deductions"} value={totalDeductions} tone={totalDeductions > 0 ? "red" : "green"} />
          </div>

          {monthlyDoctors.length === 0 ? (
            <EmptyAnalytics text={currentLang === "ar" ? "لا توجد ملخصات أطباء داخل التقرير" : "No doctor summaries in this report"} />
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-[var(--color-border)]">
              <table className="w-full min-w-[850px]">
                <thead className="bg-[var(--color-surface-muted)]">
                  <tr>
                    <TableHead>{currentLang === "ar" ? "الطبيب" : "Doctor"}</TableHead>
                    <TableHead>{currentLang === "ar" ? "أيام عمل" : "Work Days"}</TableHead>
                    <TableHead>{currentLang === "ar" ? "حضور" : "Present"}</TableHead>
                    <TableHead>{currentLang === "ar" ? "غياب" : "Absent"}</TableHead>
                    <TableHead>{currentLang === "ar" ? "تأخير" : "Late"}</TableHead>
                    <TableHead>{currentLang === "ar" ? "خصومات" : "Deductions"}</TableHead>
                  </tr>
                </thead>
                <tbody>
                  {monthlyDoctors.slice(0, 15).map((doctor, index) => (
                    <tr key={doctor.doctorId || doctor.id || index} className="border-t border-[var(--color-border)]">
                      <TableCell>{currentLang === "ar" ? getValue(doctor.doctorNameAr, doctor.doctorName, doctor.name) : getValue(doctor.doctorName, doctor.doctorNameEn, doctor.name)}</TableCell>
                      <TableCell center>{getNumber(doctor.workingDays, doctor.totalWorkingDays)}</TableCell>
                      <TableCell center>{getNumber(doctor.presentDays, doctor.attendedDays)}</TableCell>
                      <TableCell center><span className={getNumber(doctor.absentDays, doctor.absences) > 0 ? "text-red-500 font-black" : "text-emerald-500 font-black"}>{getNumber(doctor.absentDays, doctor.absences)}</span></TableCell>
                      <TableCell center><span className={getNumber(doctor.lateDays, doctor.lateCount) > 0 ? "text-amber-500 font-black" : "text-emerald-500 font-black"}>{getNumber(doctor.lateDays, doctor.lateCount)}</span></TableCell>
                      <TableCell center><span className={getNumber(doctor.deductions, doctor.salaryDeductions) > 0 ? "text-red-500 font-black" : "text-emerald-500 font-black"}>{getNumber(doctor.deductions, doctor.salaryDeductions)}</span></TableCell>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </AnalyticsPanel>
  )
}

function normalizeHeatmapData(payload) {
  const root = payload?.data || payload || {}
  const heatmapData = root.heatmapData || root.items || root.rows || root.heatmap || {}

  if (Array.isArray(heatmapData)) return heatmapData

  const rows = []

  Object.entries(heatmapData).forEach(([dayName, dayValues]) => {
    if (!dayValues || typeof dayValues !== "object") return

    Object.entries(dayValues).forEach(([date, value]) => {
      const numericValue = Number(value || 0)
      rows.push({
        dayName,
        date,
        value: numericValue,
        attendanceRate: numericValue,
        scheduled: numericValue > 0 ? 1 : 0,
      })
    })
  })

  return rows.sort((a, b) => String(a.date).localeCompare(String(b.date)))
}

function normalizeMonthlyDoctors(payload) {
  const root = payload?.data || payload || {}
  return safeArray(
    root.doctors ||
      root.doctorSummaries ||
      root.monthlySummaries ||
      root.doctorMonthlySummaries ||
      root.items ||
      root.rows
  )
}

function AnalyticsSubTabButton({ active, onClick, icon: Icon, label, tone = "blue" }) {
  const toneMap = {
    blue: "text-blue-500",
    purple: "text-violet-500",
    emerald: "text-emerald-500",
    red: "text-red-500",
    yellow: "text-amber-500",
    orange: "text-orange-500",
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold border transition-colors ${
        active
          ? "bg-[var(--color-success)] text-white border-[var(--color-success)]"
          : "bg-[var(--color-surface)] text-[var(--color-text)] border-[var(--color-border-strong)] hover:bg-[var(--color-success)] hover:text-white hover:border-[var(--color-success)]"
      }`}
    >
      <Icon size={16} className={active ? "text-white" : toneMap[tone] || toneMap.blue} />
      {label}
    </button>
  )
}

function InlineAnalyticsError({ title, message }) {
  return (
    <div className="mb-4 rounded-2xl bg-transparent text-red-500 border-2 border-red-500 p-4">
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 mt-0.5 text-red-500" />
        <div>
          <h3 className="font-extrabold mb-1">{title}</h3>
          <p className="text-sm font-bold">{message}</p>
        </div>
      </div>
    </div>
  )
}

function HeatmapBestWorstCard({ title, data, tone = "green" }) {
  const toneMap = {
    green: "text-emerald-500 border-emerald-500",
    red: "text-red-500 border-red-500",
  }
  const toneClass = toneMap[tone] || toneMap.green

  return (
    <div className={`rounded-xl border-2 bg-transparent p-4 ${toneClass}`}>
      <p className="text-sm font-black">{title}</p>
      <p className="mt-2 text-xs text-[var(--color-text-muted)]">
        {Object.keys(data || {}).length === 0
          ? "-"
          : Object.entries(data).map(([key, value]) => `${key}: ${value}`).join(" • ")}
      </p>
    </div>
  )
}

function HeatmapCell({ day, index, currentLang }) {
  const toneMap = {
    green: "border-emerald-500 text-emerald-500",
    yellow: "border-amber-500 text-amber-500",
    red: "border-red-500 text-red-500",
    slate: "border-slate-500 text-slate-500",
  }

  const dateValue = String(day.date || "")
  const dayNumber =
    dateValue.includes("-") && !Number.isNaN(new Date(dateValue).getTime())
      ? new Date(dateValue).getDate()
      : index + 1

  return (
    <div
      className={`rounded-xl border-2 bg-transparent p-2 text-center min-h-[76px] flex flex-col justify-between ${toneMap[day.tone] || toneMap.slate}`}
      title={`${dateValue} | ${percentText(day.attendanceRate)} | absent ${day.absent} | late ${day.late}`}
    >
      <p className="text-sm font-black">{dayNumber}</p>
      <p className="text-[11px] font-bold">{percentText(day.attendanceRate)}</p>
      <p className="text-[10px] text-[var(--color-text-muted)]">
        {currentLang === "ar" ? "غ" : "A"} {day.absent} • {currentLang === "ar" ? "ت" : "L"} {day.late}
      </p>
    </div>
  )
}

function LegendDot({ tone, label }) {
  const toneMap = {
    green: "bg-emerald-500",
    yellow: "bg-amber-500",
    red: "bg-red-500",
    slate: "bg-slate-500",
  }

  return (
    <span className="inline-flex items-center gap-2">
      <span className={`w-3 h-3 rounded-full ${toneMap[tone] || toneMap.slate}`} />
      {label}
    </span>
  )
}

function TableHead({ children }) {
  return <th className="p-3 text-sm font-black text-[var(--color-text)] text-center">{children}</th>
}

function TableCell({ children, center = false }) {
  return <td className={`p-3 text-sm text-[var(--color-text)] ${center ? "text-center" : ""}`}>{children}</td>
}

function AnalyticsCard({ icon: Icon, title, value, tone = "blue" }) {
  const toneMap = {
    blue: "text-blue-500 border-blue-500",
    green: "text-emerald-500 border-emerald-500",
    yellow: "text-amber-500 border-amber-500",
    red: "text-red-500 border-red-500",
    purple: "text-violet-500 border-violet-500",
    slate: "text-slate-500 border-slate-500",
  }

  const toneClass = toneMap[tone] || toneMap.blue

  return (
    <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-[var(--color-text-muted)]">{title}</p>
          <p className={`mt-2 text-2xl font-extrabold ${toneClass.split(" ")[0]}`}>{value ?? 0}</p>
        </div>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center border-2 bg-transparent ${toneClass}`}>
          <Icon size={22} />
        </div>
      </div>
    </div>
  )
}

function AnalyticsPanel({ theme, title, icon: Icon, children, tone = "blue" }) {
  const toneMap = {
    blue: "text-blue-500 border-blue-500",
    green: "text-emerald-500 border-emerald-500",
    yellow: "text-amber-500 border-amber-500",
    red: "text-red-500 border-red-500",
    purple: "text-violet-500 border-violet-500",
    slate: "text-slate-500 border-slate-500",
  }
  const toneClass = toneMap[tone] || toneMap.blue

  return (
    <div className={`${theme.card} p-5`}>
      <h3 className="text-lg font-extrabold text-[var(--color-text)] mb-4 flex items-center gap-2">
        <span className={`w-10 h-10 rounded-xl border-2 flex items-center justify-center ${toneClass}`}>
          <Icon size={20} />
        </span>
        {title}
      </h3>
      {children}
    </div>
  )
}

function AnalyticsListItem({ icon: Icon, title, subtitle, badge, tone = "blue" }) {
  const toneMap = {
    blue: "text-blue-500 border-blue-500",
    green: "text-emerald-500 border-emerald-500",
    yellow: "text-amber-500 border-amber-500",
    red: "text-red-500 border-red-500",
    purple: "text-violet-500 border-violet-500",
    slate: "text-slate-500 border-slate-500",
  }
  const toneClass = toneMap[tone] || toneMap.blue

  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-muted)] p-3">
      <div className="flex items-center gap-3 min-w-0">
        <span className={`w-9 h-9 rounded-xl border-2 flex items-center justify-center ${toneClass}`}>
          <Icon size={17} />
        </span>
        <div className="min-w-0">
          <p className="font-bold text-[var(--color-text)] truncate">{title}</p>
          <p className="text-xs text-[var(--color-text-muted)] truncate">{subtitle}</p>
        </div>
      </div>
      <span className={`shrink-0 px-2.5 py-1 rounded-full border text-xs font-bold ${toneClass}`}>{badge}</span>
    </div>
  )
}

function MiniMetric({ label, value, tone = "blue" }) {
  const toneMap = {
    blue: "text-blue-500",
    green: "text-emerald-500",
    yellow: "text-amber-500",
    red: "text-red-500",
    purple: "text-violet-500",
  }

  return (
    <div className="rounded-lg bg-[var(--color-surface)] p-2">
      <p className={`font-extrabold ${toneMap[tone] || toneMap.blue}`}>{value ?? 0}</p>
      <p className="text-[10px] text-[var(--color-text-muted)]">{label}</p>
    </div>
  )
}

function EmptyAnalytics({ text }) {
  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-muted)] p-6 text-center text-sm font-bold text-[var(--color-text-muted)]">
      {text}
    </div>
  )
}

export default RosterDetails