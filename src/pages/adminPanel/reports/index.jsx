import React, { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { Link } from "react-router-dom"
import { getCategories } from "../../../state/act/actCategory"
import { getDepartments } from "../../../state/act/actDepartment"
import { getContractingTypesForSignup } from "../../../state/act/actContractingType"
import LoadingGetData from "../../../components/LoadingGetData"
import { useTranslation } from "react-i18next"
import {
  Calendar,
  Filter,
  FileText,
  Eye,
  Users,
  Building,
  Briefcase,
  GraduationCap,
  User,
  RefreshCw,
  Grid3X3,
  Rows3,
  Phone,
  Hash,
  BadgeCheck,
  IdCard,
  BarChart3,
  CheckCircle,
  XCircle,
  Clock,
  Activity,
} from "lucide-react"
import { clearReports, clearReportsError } from "../../../state/slices/reports"
import {
  getReports,
  getReportsAttend,
  getReportsAttendSummary,
} from "../../../state/act/actReports"
import { getAvailbleScientficDegrees } from "../../../state/act/actRosterManagement"
import { getUserSummaries } from "../../../state/act/actUsers"
import ExportReportsDropdown from "./exportFullReport"
import ExportDoctorAttendanceReport from "./exportDoctorsAttend"
import { getPageTheme } from "../../../utils/themeClasses"

function Reports() {
  const { categoryManagerId: id, loginRoleResponseDto } = useSelector(
    (state) => state.auth
  )

  const dispatch = useDispatch()
  const { t, i18n } = useTranslation()
  const theme = getPageTheme()

  const [doctorPage, setDoctorPage] = useState(1)
  const [viewMode, setViewMode] = useState("scheduleRows")
  const doctorPageSize = 100

  const { contractingTypes, loadingGetContractingTypes } = useSelector(
    (state) => state.contractingType
  )

  const {
    contractingTypesForSignup: contracting,
    loadingGetContractingTypesForSignup: loadingContract,
  } = useSelector((state) => state.contractingType)

  const {
    users,
    loading,
    pagination: usersPagination,
  } = useSelector((state) => state.users)

  const { departments, loadingGetDepartments } = useSelector(
    (state) => state.department
  )

  const { categories, loadingGetCategories } = useSelector(
    (state) => state.category
  )

  const {
    reports,
    loadingGetReports,
    getReportsError,
    totalPages,
    reportsAttend,
    loadingGetReportsAttend,
    getReportsAttendError,
    attendanceSummary,
    loadingAttendanceSummary,
    attendanceSummaryError,
  } = useSelector((state) => state.reports)

  const currentDate = new Date()
  const currentLang = i18n.language || "ar"
  const isRTL = currentLang === "ar"
  const isSystemAdmin =
    loginRoleResponseDto?.roleNameEn === "System Administrator"

  const [filters, setFilters] = useState({
    month: currentDate.getMonth() + 1,
    year: currentDate.getFullYear(),
    categoryId: isSystemAdmin ? null : id,
    departmentId: null,
    doctorId: null,
    scientificDegreeId: null,
    contractingTypeId: null,
    page: 1,
    pageSize: 20,
  })

  const [dateRange, setDateRange] = useState({
    startDay: 1,
    endDay: 31,
  })

  const [appliedDateRange, setAppliedDateRange] = useState({
    startDay: 1,
    endDay: 31,
  })

  const [dateRangeError, setDateRangeError] = useState("")

  const primaryActionButton =
    "inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-extrabold border bg-[var(--color-surface)] text-[var(--color-text)] border-[var(--color-border-strong)] hover:bg-[var(--color-success)] hover:text-white hover:border-emerald-500 active:bg-[var(--color-success-hover)] transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"

  const selectedActionButton =
    "inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-extrabold border bg-[var(--color-success)] text-white border-emerald-500 shadow-sm transition-colors"

  const smallActionButton =
    "inline-flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg text-xs font-extrabold border bg-[var(--color-surface)] text-[var(--color-text)] border-[var(--color-border-strong)] hover:bg-[var(--color-success)] hover:text-white hover:border-emerald-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"

  const iconButton =
    "p-2 rounded-lg border border-[var(--color-border-strong)] bg-[var(--color-surface)] text-[var(--color-text)] hover:bg-[var(--color-success)] hover:text-white hover:border-emerald-500 transition-colors cursor-pointer"

  const inputClass =
    "w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[var(--color-success)]/20 focus:border-emerald-500 transition-colors"

  const labelClass =
    "block text-xs font-black text-[var(--color-text)] mb-1.5"

  const iconColors = {
    calendar: "text-blue-500 dark:text-blue-500",
    filter: "text-blue-500 dark:text-blue-500",
    view: "text-blue-500 dark:text-blue-500",
    users: "text-blue-500 dark:text-blue-500",
    building: "text-emerald-500 dark:text-emerald-500",
    briefcase: "text-violet-500 dark:text-violet-500",
    degree: "text-orange-500 dark:text-orange-500",
    user: "text-blue-500 dark:text-blue-500",
    phone: "text-cyan-500 dark:text-cyan-500",
    hash: "text-slate-500 dark:text-slate-500",
    id: "text-cyan-500 dark:text-cyan-500",
    file: "text-slate-500 dark:text-slate-500",
    refresh: "text-slate-500 dark:text-slate-500",
    danger: "text-red-500 dark:text-red-500",
    success: "text-emerald-500 dark:text-emerald-500",
    warning: "text-amber-500 dark:text-amber-500",
    muted: "text-slate-500 dark:text-slate-500",
    chart: "text-violet-500 dark:text-violet-500",
    activity: "text-violet-500 dark:text-violet-500",
  }

  const iconBg = {
    calendar: "bg-transparent dark:bg-transparent border-2 border-blue-500 dark:border-blue-500",
    filter: "bg-transparent dark:bg-transparent border-2 border-blue-500 dark:border-blue-500",
    view: "bg-transparent dark:bg-transparent border-2 border-blue-500 dark:border-blue-500",
    users: "bg-transparent dark:bg-transparent border-2 border-blue-500 dark:border-blue-500",
    building: "bg-transparent dark:bg-transparent border-2 border-emerald-500 dark:border-emerald-500",
    briefcase: "bg-transparent dark:bg-transparent border-2 border-violet-500 dark:border-violet-500",
    degree: "bg-transparent dark:bg-transparent border-2 border-orange-500 dark:border-orange-500",
    user: "bg-transparent dark:bg-transparent border-2 border-blue-500 dark:border-blue-500",
    phone: "bg-transparent dark:bg-transparent border-2 border-cyan-500 dark:border-cyan-500",
    hash: "bg-transparent dark:bg-transparent border-2 border-slate-500 dark:border-slate-500",
    id: "bg-transparent dark:bg-transparent border-2 border-cyan-500 dark:border-cyan-500",
    file: "bg-transparent dark:bg-transparent border-2 border-slate-500 dark:border-slate-500",
    refresh: "bg-transparent dark:bg-transparent border-2 border-slate-500 dark:border-slate-500",
    danger: "bg-transparent dark:bg-transparent border-2 border-red-500 dark:border-red-500",
    success: "bg-transparent dark:bg-transparent border-2 border-emerald-500 dark:border-emerald-500",
    warning: "bg-transparent dark:bg-transparent border-2 border-amber-500 dark:border-amber-500",
    chart: "bg-transparent dark:bg-transparent border-2 border-violet-500 dark:border-violet-500",
    activity: "bg-transparent dark:bg-transparent border-2 border-violet-500 dark:border-violet-500",
  }

  const shiftPalette = [
  {
    bg: "bg-blue-50 dark:bg-blue-950/40",
    border: "border-blue-400 dark:border-blue-600",
    text: "text-blue-500 dark:text-blue-500",
    badge: "bg-blue-700 dark:bg-blue-500",
    ring: "ring-blue-200 dark:ring-blue-800",
  },
  {
    bg: "bg-emerald-50 dark:bg-emerald-950/40",
    border: "border-emerald-400 dark:border-emerald-600",
    text: "text-emerald-500 dark:text-emerald-100",
    badge: "bg-emerald-700 dark:bg-emerald-500",
    ring: "ring-emerald-200 dark:ring-emerald-800",
  },
  {
    bg: "bg-violet-50 dark:bg-violet-950/40",
    border: "border-violet-400 dark:border-violet-600",
    text: "text-violet-500 dark:text-violet-100",
    badge: "bg-violet-700 dark:bg-violet-500",
    ring: "ring-violet-200 dark:ring-violet-800",
  },
  {
    bg: "bg-amber-50 dark:bg-amber-950/40",
    border: "border-amber-400 dark:border-amber-600",
    text: "text-amber-500 dark:text-amber-100",
    badge: "bg-amber-700 dark:bg-amber-500",
    ring: "ring-amber-200 dark:ring-amber-800",
  },
  {
    bg: "bg-cyan-50 dark:bg-cyan-950/40",
    border: "border-cyan-400 dark:border-cyan-600",
    text: "text-cyan-950 dark:text-cyan-100",
    badge: "bg-cyan-700 dark:bg-cyan-500",
    ring: "ring-cyan-200 dark:ring-cyan-800",
  },
  {
    bg: "bg-rose-50 dark:bg-rose-950/40",
    border: "border-rose-400 dark:border-rose-600",
    text: "text-rose-950 dark:text-rose-100",
    badge: "bg-rose-700 dark:bg-rose-500",
    ring: "ring-rose-200 dark:ring-rose-800",
  },
  {
    bg: "bg-indigo-50 dark:bg-indigo-950/40",
    border: "border-indigo-400 dark:border-indigo-600",
    text: "text-indigo-950 dark:text-indigo-100",
    badge: "bg-indigo-700 dark:bg-indigo-500",
    ring: "ring-indigo-200 dark:ring-indigo-800",
  },
]

  const getDaysInMonth = (month, year) => {
    return new Date(year, month, 0).getDate()
  }

  const padNumber = (value) => String(value).padStart(2, "0")

  const daysInCurrentMonth = getDaysInMonth(filters.month, filters.year)

  const startDateFormatted = `${filters.year}-${padNumber(
    filters.month
  )}-${padNumber(appliedDateRange.startDay)}`

  const endDateFormatted = `${filters.year}-${padNumber(
    filters.month
  )}-${padNumber(appliedDateRange.endDay)}`

  useEffect(() => {
    const maxDay = daysInCurrentMonth

    setDateRange({
      startDay: 1,
      endDay: maxDay,
    })

    setAppliedDateRange({
      startDay: 1,
      endDay: maxDay,
    })

    setDateRangeError("")
  }, [filters.month, filters.year, daysInCurrentMonth])

  useEffect(() => {
    dispatch(getContractingTypesForSignup())
    dispatch(getAvailbleScientficDegrees())
    dispatch(getDepartments({ pageSize: 1000, page: 1 }))
    dispatch(
      getUserSummaries({
        page: 1,
        pageSize: doctorPageSize,
        categoryId: filters.categoryId,
      })
    )

    if (isSystemAdmin) {
      dispatch(getCategories())
    }

    return () => {
      dispatch(clearReports())
      dispatch(clearReportsError())
    }
  }, [dispatch, id, isSystemAdmin])

  useEffect(() => {
    if (filters.categoryId) {
      dispatch(
        getUserSummaries({
          page: 1,
          pageSize: doctorPageSize,
          categoryId: filters.categoryId,
        })
      )
    }
  }, [dispatch, filters.categoryId])

  useEffect(() => {
    dispatch(
      getUserSummaries({
        page: doctorPage,
        pageSize: doctorPageSize,
        categoryId: filters.categoryId,
      })
    )
  }, [dispatch, doctorPage, filters.categoryId])

  useEffect(() => {
    if (filters.month && filters.year) {
      const params = { ...filters }

      Object.keys(params).forEach((key) => {
        if (params[key] === null || params[key] === "") {
          delete params[key]
        }
      })

      dispatch(getReports(params))
      dispatch(getReportsAttend(params))
      dispatch(
        getReportsAttendSummary({
          month: filters.month,
          year: filters.year,
        })
      )
    }
  }, [dispatch, filters])

  const handleDateRangeChange = (name, value) => {
    setDateRange((prev) => ({
      ...prev,
      [name]: parseInt(value),
    }))

    setDateRangeError("")
  }

  const applyDateRange = () => {
    if (dateRange.endDay < dateRange.startDay) {
      setDateRangeError(
        t("reports.dateRangeError") ||
          "End day must be greater than or equal to start day"
      )
      return
    }

    if (dateRange.startDay < 1 || dateRange.endDay > daysInCurrentMonth) {
      setDateRangeError(
        t("reports.dateRangeInvalid", { day: daysInCurrentMonth }) ||
          `Days must be between 1 and ${daysInCurrentMonth}`
      )
      return
    }

    setDateRangeError("")
    setAppliedDateRange(dateRange)
  }

  const resetDateRange = () => {
    const maxDay = daysInCurrentMonth

    setDateRange({
      startDay: 1,
      endDay: maxDay,
    })

    setAppliedDateRange({
      startDay: 1,
      endDay: maxDay,
    })

    setDateRangeError("")
  }

  const handleDoctorPageChange = (newPage) => {
    setDoctorPage(newPage)
  }

  const handleFilterChange = (name, value) => {
    setFilters((prev) => ({
      ...prev,
      [name]: value,
      page: 1,
      ...(name === "categoryId" && { departmentId: null, doctorId: null }),
    }))

    if (name === "categoryId") {
      setDoctorPage(1)
    }
  }

  const handlePageChange = (newPage) => {
    setFilters((prev) => ({
      ...prev,
      page: newPage,
    }))
  }

  const monthOptions = [
    { value: 1, labelEn: "January", labelAr: "يناير" },
    { value: 2, labelEn: "February", labelAr: "فبراير" },
    { value: 3, labelEn: "March", labelAr: "مارس" },
    { value: 4, labelEn: "April", labelAr: "أبريل" },
    { value: 5, labelEn: "May", labelAr: "مايو" },
    { value: 6, labelEn: "June", labelAr: "يونيو" },
    { value: 7, labelEn: "July", labelAr: "يوليو" },
    { value: 8, labelEn: "August", labelAr: "أغسطس" },
    { value: 9, labelEn: "September", labelAr: "سبتمبر" },
    { value: 10, labelEn: "October", labelAr: "أكتوبر" },
    { value: 11, labelEn: "November", labelAr: "نوفمبر" },
    { value: 12, labelEn: "December", labelAr: "ديسمبر" },
  ]

  const yearOptions = Array.from(
    { length: 11 },
    (_, index) => currentDate.getFullYear() - 5 + index
  )

  const getShiftTone = (shift) => {
    const key = Number(shift?.departmentId || 0)
    return shiftPalette[key % shiftPalette.length]
  }

  const getDaysArray = () => {
    const start = appliedDateRange.startDay
    const end = appliedDateRange.endDay

    return Array.from({ length: end - start + 1 }, (_, index) => start + index)
  }

  const getShiftByDay = (row, day) => {
    return row.dailyShifts?.find((shift) => Number(shift.day) === Number(day))
  }

  const getDepartmentName = (shift) => {
    if (!shift) return ""
    return currentLang === "ar" ? shift.departmentAr : shift.departmentEn
  }

  const getDoctorName = (row) => {
    return currentLang === "ar" ? row.doctorNameAr : row.doctorNameEn
  }

  const getCategoryName = (row) => {
    return currentLang === "ar" ? row.categoryNameAr : row.categoryNameEn
  }

  const getScientificDegreeName = (row) => {
    return currentLang === "ar"
      ? row.scientificDegreeName
      : row.scientificDegreeNameEn
  }

  const getContractingTypeName = (row) => {
    return currentLang === "ar"
      ? row.contractingTypeName
      : row.contractingTypeNameEn
  }

  const getDepartmentsJoined = (row) => {
    return currentLang === "ar"
      ? row.departmentsJoinedAr
      : row.departmentsJoinedEn
  }

  const getAttendanceMonthlyPayload = () => {
    return reportsAttend?.data || reportsAttend?.reports?.data || reportsAttend
  }

  const getAttendanceMonthlyRows = () => {
    const payload = getAttendanceMonthlyPayload()
    return payload?.rows || []
  }

  const HeaderIcon = ({ icon: Icon, bgClass, iconClass }) => (
    <div
      className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${bgClass}`}
    >
      <Icon className={`w-5 h-5 shrink-0 ${iconClass}`} />
    </div>
  )

  const SummaryCard = ({ title, value, tone, icon: Icon }) => {
    const toneMap = {
      doctors: {
        box: "bg-transparent text-blue-500 border-blue-300 dark:bg-transparent dark:text-blue-500 dark:border-blue-700",
        icon: "bg-blue-600 text-white dark:bg-blue-500",
        value: "text-blue-500 dark:text-blue-500",
      },
      records: {
        box: "bg-transparent text-violet-500 border-violet-300 dark:bg-transparent dark:text-violet-100 dark:border-violet-700",
        icon: "bg-violet-600 text-white dark:bg-violet-500",
        value: "text-violet-500 dark:text-violet-500",
      },
      start: {
        box: "bg-transparent text-emerald-500 border-emerald-300 dark:bg-transparent dark:text-emerald-100 dark:border-emerald-700",
        icon: "bg-emerald-600 text-white dark:bg-emerald-500",
        value: "text-emerald-500 dark:text-emerald-500",
      },
      end: {
        box: "bg-transparent text-orange-500 border-orange-300 dark:bg-transparent dark:text-orange-100 dark:border-orange-700",
        icon: "bg-orange-600 text-white dark:bg-orange-500",
        value: "text-orange-500 dark:text-orange-500",
      },
      warning: {
        box: "bg-transparent text-amber-500 border-amber-300 dark:bg-amber-900/50 dark:text-amber-100 dark:border-amber-700",
        icon: "bg-amber-600 text-white dark:bg-amber-500",
        value: "text-amber-500 dark:text-amber-500",
      },
      chart: {
        box: "bg-transparent text-blue-500 border-blue-300 dark:bg-transparent dark:text-blue-500 dark:border-blue-700",
        icon: "bg-blue-600 text-white dark:bg-blue-500",
        value: "text-blue-500 dark:text-blue-500",
      },
      activity: {
        box: "bg-transparent text-violet-500 border-violet-300 dark:bg-transparent dark:text-violet-100 dark:border-violet-700",
        icon: "bg-violet-600 text-white dark:bg-violet-500",
        value: "text-violet-500 dark:text-violet-500",
      },
    }

    const selectedTone = toneMap[tone] || toneMap.doctors

    return (
      <div
        className={`${theme.cardSoft} p-4 border border-[var(--color-border-strong)] overflow-hidden`}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-xs sm:text-sm font-black text-[var(--color-text-muted)] truncate">
              {title}
            </p>

            <p
              className={`mt-1 text-base sm:text-xl xl:text-2xl font-black tracking-tight truncate ${selectedTone.value}`}
              title={String(value ?? 0)}
            >
              {value ?? 0}
            </p>
          </div>

          <div
            className={`w-11 h-11 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center shrink-0 border shadow-sm ${selectedTone.box}`}
          >
            <div
              className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center shrink-0 ${selectedTone.icon}`}
            >
              <Icon className="w-5 h-5 shrink-0" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  const DoctorMeta = ({ icon: Icon, iconClass, children }) => (
    <span className="inline-flex items-center gap-1 font-bold">
      <Icon size={14} className={`shrink-0 ${iconClass}`} />
      {children}
    </span>
  )

  const ScheduleShiftCell = ({ row, shift, day, compact = false }) => {
  if (!shift) {
    return (
      <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-[var(--color-bg-soft)] text-[var(--color-text-muted)] border border-[var(--color-border)] font-black">
        -
      </span>
    )
  }

  const shiftTone = getShiftTone(shift)

  const title = [
    `${currentLang === "ar" ? "اليوم" : "Day"}: ${day}`,
    `${currentLang === "ar" ? "الطبيب" : "Doctor"}: ${getDoctorName(row)}`,
    `${currentLang === "ar" ? "كود الشفت" : "Shift Code"}: ${shift.code}`,
    `${currentLang === "ar" ? "القسم" : "Department"}: ${getDepartmentName(
      shift
    )}`,
  ].join("\n")

  if (compact) {
    return (
      <div
        title={title}
        className={`mx-auto inline-flex items-center justify-center rounded-xl border shadow-sm hover:shadow-md hover:scale-105 transition-all cursor-help ${shiftTone.bg} ${shiftTone.border}`}
      >
        <span
          className={`inline-flex items-center justify-center min-w-[42px] px-2.5 py-1.5 rounded-lg text-xs font-black text-white ${shiftTone.badge}`}
        >
          {shift.code}
        </span>
      </div>
    )
  }

  return (
    <div
      title={title}
      className={`w-full rounded-xl border shadow-sm hover:shadow-md transition-all cursor-help ${shiftTone.bg} ${shiftTone.border} p-2 min-h-[30px]`}
    >
      <div className="flex items-start justify-between gap-2">
        <p
          className={`text-xs font-black leading-4 line-clamp-2 flex-1 pt-0.5 ${shiftTone.text}`}
        >
          {getDepartmentName(shift)}
        </p>

        <span
          className={`inline-flex items-center justify-center shrink-0 min-w-10 px-2 py-1 rounded-full text-[11px] font-black text-white ${shiftTone.badge}`}
        >
          {shift.code}
        </span>
      </div>
    </div>
  )
}

  const ViewModeButton = ({ mode, icon: Icon, label }) => (
    <button
      type="button"
      onClick={() => setViewMode(mode)}
      className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-black border transition-colors ${
        viewMode === mode ? selectedActionButton : primaryActionButton
      }`}
    >
      <Icon size={16} className="shrink-0" />
      {label}
    </button>
  )

  const AttendanceSummaryView = () => {
    if (loadingAttendanceSummary) {
      return (
        <LoadingGetData
          text={
            currentLang === "ar"
              ? "جاري تحميل ملخص الحضور..."
              : "Loading attendance summary..."
          }
        />
      )
    }

    if (attendanceSummaryError) {
      return (
        <div className={`${theme.card} p-8 text-center`}>
          <FileText className="w-12 h-12 mx-auto mb-4 text-red-500" />

          <h3 className="text-xl font-black text-[var(--color-text)]">
            {currentLang === "ar"
              ? "تعذر تحميل ملخص الحضور"
              : "Failed to load attendance summary"}
          </h3>

          <p className="text-[var(--color-text-muted)] mt-2">
            {attendanceSummaryError?.message || "-"}
          </p>
        </div>
      )
    }

    if (!attendanceSummary) {
      return (
        <div className={`${theme.card} p-8 text-center`}>
          <FileText className="w-12 h-12 mx-auto mb-4 text-[var(--color-text-muted)]" />

          <p className="text-[var(--color-text-muted)]">
            {currentLang === "ar"
              ? "لا يوجد ملخص حضور لهذا الشهر"
              : "No attendance summary for this month"}
          </p>
        </div>
      )
    }

    const departmentStats = attendanceSummary.departmentStats || []
    const degreeStats = attendanceSummary.degreeStats || []

    return (
      <div className="space-y-6">
        <div className={`${theme.card} p-6`}>
          <div className="flex items-center gap-3 mb-5">
            <BarChart3 className="w-6 h-6 shrink-0 text-blue-500 dark:text-blue-200" />

            <h2 className="text-2xl font-black text-[var(--color-text)]">
              {currentLang === "ar" ? "ملخص الحضور" : "Attendance Summary"}
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-4">
            <SummaryCard
              icon={Users}
              title={currentLang === "ar" ? "الأطباء" : "Doctors"}
              value={attendanceSummary.totalDoctors}
              tone="doctors"
            />

            <SummaryCard
              icon={Calendar}
              title={currentLang === "ar" ? "أيام مجدولة" : "Scheduled Days"}
              value={attendanceSummary.totalScheduledDays}
              tone="records"
            />

            <SummaryCard
              icon={CheckCircle}
              title={currentLang === "ar" ? "أيام حضور" : "Worked Days"}
              value={attendanceSummary.totalWorkedDays}
              tone="start"
            />

            <SummaryCard
              icon={XCircle}
              title={currentLang === "ar" ? "غياب" : "Absent"}
              value={attendanceSummary.totalAbsentDays}
              tone="danger"
            />

            <SummaryCard
              icon={Clock}
              title={currentLang === "ar" ? "تأخير" : "Late"}
              value={attendanceSummary.totalLateDays}
              tone="warning"
            />

            <SummaryCard
              icon={Activity}
              title={currentLang === "ar" ? "نسبة الحضور" : "Attendance Rate"}
              value={`${attendanceSummary.averageAttendanceRate ?? 0}%`}
              tone="activity"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div className={`${theme.card} p-6`}>
            <h3 className="text-xl font-black text-[var(--color-text)] mb-4 flex items-center gap-2">
              <Building className="w-5 h-5 shrink-0 text-emerald-500 dark:text-emerald-200" />
              {currentLang === "ar" ? "إحصائيات الأقسام" : "Department Stats"}
            </h3>

            {departmentStats.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[var(--color-surface-muted)]">
                    <tr className="border-b border-[var(--color-border-strong)]">
                      <th
                        className={`p-3 text-sm font-black text-[var(--color-text)] text-${
                          isRTL ? "right" : "left"
                        }`}
                      >
                        {currentLang === "ar" ? "القسم" : "Department"}
                      </th>

                      <th className="p-3 text-sm font-black text-[var(--color-text)] text-center">
                        {currentLang === "ar" ? "الأطباء" : "Doctors"}
                      </th>

                      <th className="p-3 text-sm font-black text-[var(--color-text)] text-center">
                        {currentLang === "ar" ? "الحضور" : "Attendance"}
                      </th>

                      <th className="p-3 text-sm font-black text-[var(--color-text)] text-center">
                        {currentLang === "ar" ? "التأخير" : "Late"}
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {departmentStats.map((item, index) => (
                      <tr
                        key={item.departmentId || index}
                        className={`border-b border-[var(--color-border)] ${theme.hoverRow}`}
                      >
                        <td className="p-3 text-sm font-black text-[var(--color-text)]">
                          {currentLang === "ar"
                            ? item.departmentNameAr
                            : item.departmentNameEn}
                        </td>

                        <td className="p-3 text-center font-bold text-[var(--color-text-muted)]">
                          {item.doctorCount ?? 0}
                        </td>

                        <td className="p-3 text-center">
                          <span className="px-3 py-1 rounded-full text-xs font-black bg-transparent text-emerald-500 border border-emerald-300 dark:bg-transparent dark:text-emerald-100 dark:border-emerald-700">
                            {item.attendanceRate ?? 0}%
                          </span>
                        </td>

                        <td className="p-3 text-center font-bold text-[var(--color-text-muted)]">
                          {item.totalLateDays ?? 0}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm font-semibold text-[var(--color-text-muted)]">
                {currentLang === "ar"
                  ? "لا توجد إحصائيات أقسام"
                  : "No department stats"}
              </p>
            )}
          </div>

          <div className={`${theme.card} p-6`}>
            <h3 className="text-xl font-black text-[var(--color-text)] mb-4 flex items-center gap-2">
              <GraduationCap className="w-5 h-5 shrink-0 text-orange-500 dark:text-orange-200" />
              {currentLang === "ar"
                ? "إحصائيات الدرجات العلمية"
                : "Degree Stats"}
            </h3>

            {degreeStats.length > 0 ? (
              <div className="space-y-3">
                {degreeStats.map((item, index) => (
                  <div
                    key={item.scientificDegreeId || index}
                    className={`${theme.cardSoft} p-4 flex items-center justify-between gap-4 border border-[var(--color-border)]`}
                  >
                    <div>
                      <p className="font-black text-[var(--color-text)]">
                        {currentLang === "ar"
                          ? item.degreeNameAr
                          : item.degreeNameEn}
                      </p>

                      <p className="text-sm font-semibold text-[var(--color-text-muted)]">
                        {item.doctorCount ?? 0}{" "}
                        {currentLang === "ar" ? "طبيب" : "doctors"}
                      </p>
                    </div>

                    <span className="px-3 py-1 rounded-full text-xs font-black bg-transparent text-blue-500 border border-blue-300 dark:bg-transparent dark:text-blue-500 dark:border-blue-700">
                      {item.attendanceRate ?? 0}%
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm font-semibold text-[var(--color-text-muted)]">
                {currentLang === "ar"
                  ? "لا توجد إحصائيات درجات علمية"
                  : "No degree stats"}
              </p>
            )}
          </div>
        </div>
      </div>
    )
  }

  const AttendanceMatrixView = () => {
    const rows = getAttendanceMonthlyRows()

    if (loadingGetReportsAttend) {
      return (
        <LoadingGetData
          text={
            currentLang === "ar"
              ? "جاري تحميل تقرير الحضور الشهري..."
              : "Loading monthly attendance report..."
          }
        />
      )
    }

    if (getReportsAttendError) {
      return (
        <div className={`${theme.card} p-8 text-center`}>
          <Activity className="w-14 h-14 mx-auto mb-4 text-red-500" />

          <h3 className="text-xl font-black text-[var(--color-text)] mb-2">
            {currentLang === "ar"
              ? "تعذر تحميل تقرير الحضور الشهري"
              : "Failed to load monthly attendance"}
          </h3>

          <p className="text-[var(--color-text-muted)]">
            {getReportsAttendError?.message || "-"}
          </p>
        </div>
      )
    }

    if (!rows.length) {
      return (
        <div className={`${theme.card} p-8 text-center`}>
          <Activity className="w-14 h-14 mx-auto mb-4 text-blue-500 dark:text-blue-200" />

          <h3 className="text-xl font-black text-[var(--color-text)] mb-2">
            {currentLang === "ar"
              ? "تقرير الحضور الشهري التفصيلي"
              : "Monthly Attendance Matrix"}
          </h3>

          <p className="text-[var(--color-text-muted)] max-w-2xl mx-auto">
            {currentLang === "ar"
              ? "لا توجد بيانات حضور تفصيلية يومية من endpoint الحضور الشهري حاليًا. استخدم ملخص الحضور، أو افتح تفاصيل دكتور محدد من زر View."
              : "No daily attendance matrix rows were returned from the monthly attendance endpoint. Use Attendance Summary, or open a doctor's details from View."}
          </p>
        </div>
      )
    }

    return (
      <div className={`${theme.card} p-6`}>
        <div className="flex items-center gap-3 mb-5">
          <Activity className="w-6 h-6 shrink-0 text-violet-500 dark:text-violet-200" />

          <div>
            <h2 className="text-2xl font-black text-[var(--color-text)]">
              {currentLang === "ar"
                ? "تقرير الحضور الشهري"
                : "Monthly Attendance Matrix"}
            </h2>

            <p className="text-sm font-semibold text-[var(--color-text-muted)]">
              {currentLang === "ar"
                ? "عرض عام للبيانات الراجعة من endpoint الحضور الشهري"
                : "General view of rows returned from the monthly attendance endpoint"}
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[var(--color-surface-muted)]">
              <tr className="border-b border-[var(--color-border-strong)]">
                <th
                  className={`p-3 text-sm font-black text-[var(--color-text)] text-${
                    isRTL ? "right" : "left"
                  }`}
                >
                  {currentLang === "ar" ? "الطبيب" : "Doctor"}
                </th>

                <th
                  className={`p-3 text-sm font-black text-[var(--color-text)] text-${
                    isRTL ? "right" : "left"
                  }`}
                >
                  {currentLang === "ar" ? "القسم" : "Department"}
                </th>

                <th className="p-3 text-sm font-black text-[var(--color-text)] text-center">
                  {currentLang === "ar" ? "أيام مجدولة" : "Scheduled"}
                </th>

                <th className="p-3 text-sm font-black text-[var(--color-text)] text-center">
                  {currentLang === "ar" ? "حضور" : "Worked"}
                </th>

                <th className="p-3 text-sm font-black text-[var(--color-text)] text-center">
                  {currentLang === "ar" ? "غياب" : "Absent"}
                </th>

                <th className="p-3 text-sm font-black text-[var(--color-text)] text-center">
                  {currentLang === "ar" ? "نسبة الحضور" : "Rate"}
                </th>
              </tr>
            </thead>

            <tbody>
              {rows.map((row, index) => (
                <tr
                  key={`${row.doctorId || index}-${row.departmentId || index}`}
                  className={`border-b border-[var(--color-border)] ${theme.hoverRow}`}
                >
                  <td className="p-3 text-sm font-black text-[var(--color-text)]">
                    {currentLang === "ar"
                      ? row.doctorNameAr || row.doctorName
                      : row.doctorNameEn || row.doctorName}
                  </td>

                  <td className="p-3 text-sm font-semibold text-[var(--color-text-muted)]">
                    {currentLang === "ar"
                      ? row.departmentNameAr || row.departmentAr
                      : row.departmentNameEn || row.departmentEn}
                  </td>

                  <td className="p-3 text-center font-semibold text-[var(--color-text-muted)]">
                    {row.totalScheduledDays ?? row.scheduledDays ?? "-"}
                  </td>

                  <td className="p-3 text-center text-emerald-500 dark:text-emerald-200 font-black">
                    {row.totalWorkedDays ?? row.workedDays ?? "-"}
                  </td>

                  <td className="p-3 text-center text-red-500 dark:text-red-200 font-black">
                    {row.totalAbsentDays ?? row.absentDays ?? "-"}
                  </td>

                  <td className="p-3 text-center">
                    <span className="px-3 py-1 rounded-full text-xs font-black bg-transparent text-blue-500 border border-blue-300 dark:bg-transparent dark:text-blue-500 dark:border-blue-700">
                      {row.attendanceRate ?? row.averageAttendanceRate ?? 0}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  if (
    loadingGetContractingTypes ||
    loadingContract ||
    loadingGetDepartments ||
    loadingGetCategories
  ) {
    return <LoadingGetData text={t("gettingData.wait-data")} />
  }

  const hasDateRangeFilter =
    appliedDateRange.startDay !== 1 ||
    appliedDateRange.endDay !== daysInCurrentMonth

  const scheduleError = getReportsError
  const daysArray = getDaysArray()

  return (
    <div className={theme.page} dir={isRTL ? "rtl" : "ltr"}>
      <div className="max-w-7xl mx-auto">
        <div className="mb-5">
          <div className={`${theme.card} p-6`}>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h1 className="text-3xl font-black text-[var(--color-text)] pb-1">
                  {t("reports.title") || "Monthly Reports"}
                </h1>

                <p className="mt-1 text-sm font-semibold text-[var(--color-text-muted)]">
                  {t("reports.subtitle") ||
                    "Schedule reporting, calendar views, and attendance summaries"}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 justify-center items-stretch">
                {reports?.rows && reports.rows.length > 0 && (
                  <ExportReportsDropdown filters={filters} />
                )}

                {getAttendanceMonthlyRows().length > 0 && (
                  <ExportDoctorAttendanceReport
                    reportsAttend={reportsAttend}
                    filters={filters}
                    loadingGetReportsAttend={loadingGetReportsAttend}
                  />
                )}
              </div>
            </div>
          </div>
        </div>

        <div className={`${theme.card} p-4 mb-5`}>
          <div className="flex items-center gap-2 mb-4">
            <HeaderIcon
              icon={Filter}
              bgClass={iconBg.filter}
              iconClass={iconColors.filter}
            />

            <h2 className="text-xl font-black text-[var(--color-text)]">
              {t("reports.filters") || "Filters"}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {isSystemAdmin && (
              <div>
                <label className={labelClass}>
                  {t("adminPanel.categories") || "Category"}
                </label>

                <select
                  value={filters.categoryId || ""}
                  onChange={(e) =>
                    handleFilterChange(
                      "categoryId",
                      e.target.value ? parseInt(e.target.value) : null
                    )
                  }
                  className={inputClass}
                >
                  <option value="">
                    {t("categories.filters.all") || "Select Category"}
                  </option>

                  {categories?.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {currentLang === "ar" ? cat.nameArabic : cat.nameEnglish}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className={labelClass}>
                <Calendar
                  size={14}
                  className={`inline shrink-0 ${isRTL ? "ml-1" : "mr-1"} ${
                    iconColors.calendar
                  }`}
                />
                {t("reports.month") || "Month"}
              </label>

              <select
                value={filters.month}
                onChange={(e) =>
                  handleFilterChange("month", parseInt(e.target.value))
                }
                className={inputClass}
              >
                {monthOptions.map((month) => (
                  <option key={month.value} value={month.value}>
                    {currentLang === "ar" ? month.labelAr : month.labelEn}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelClass}>
                <Calendar
                  size={14}
                  className={`inline shrink-0 ${isRTL ? "ml-1" : "mr-1"} ${
                    iconColors.calendar
                  }`}
                />
                {t("reports.year") || "Year"}
              </label>

              <select
                value={filters.year}
                onChange={(e) =>
                  handleFilterChange("year", parseInt(e.target.value))
                }
                className={inputClass}
              >
                {yearOptions.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelClass}>
                <Building
                  size={14}
                  className={`inline shrink-0 ${isRTL ? "ml-1" : "mr-1"} ${
                    iconColors.building
                  }`}
                />
                {t("reports.department") || "Department"}
              </label>

              <select
                value={filters.departmentId || ""}
                onChange={(e) =>
                  handleFilterChange(
                    "departmentId",
                    e.target.value ? parseInt(e.target.value) : null
                  )
                }
                className={inputClass}
              >
                <option value="">
                  {t("reports.allDepartments") || "All Departments"}
                </option>

                {departments?.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {currentLang === "ar" ? dept.nameArabic : dept.nameEnglish}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelClass}>
                <User
                  size={14}
                  className={`inline shrink-0 ${isRTL ? "ml-1" : "mr-1"} ${
                    iconColors.user
                  }`}
                />
                {t("reports.doctor") || "Doctor"}
              </label>

              <select
                value={filters.doctorId || ""}
                onChange={(e) =>
                  handleFilterChange(
                    "doctorId",
                    e.target.value ? parseInt(e.target.value) : null
                  )
                }
                disabled={loading?.list}
                className={`${inputClass} ${
                  loading?.list ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                <option value="">
                  {loading?.list
                    ? t("gettingData.loadingDoctors") || "Loading..."
                    : t("reports.allDoctors") || "All Doctors"}
                </option>

                {users?.map((doctor) => (
                  <option key={doctor.id} value={doctor.id}>
                    {currentLang === "ar"
                      ? doctor.nameArabic
                      : doctor.nameEnglish}
                  </option>
                ))}
              </select>

              {usersPagination?.totalPages > 1 && (
                <div className="flex items-center justify-between mt-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleDoctorPageChange(doctorPage - 1)}
                    disabled={doctorPage === 1 || loading?.list}
                    className={smallActionButton}
                  >
                    {t("categories.pagination.previous") || "Previous"}
                  </button>

                  <span className="text-xs font-black text-[var(--color-text-muted)]">
                    {doctorPage}/{usersPagination.totalPages}
                  </span>

                  <button
                    type="button"
                    onClick={() => handleDoctorPageChange(doctorPage + 1)}
                    disabled={
                      usersPagination.totalPages === doctorPage || loading?.list
                    }
                    className={smallActionButton}
                  >
                    {t("categories.pagination.next") || "Next"}
                  </button>
                </div>
              )}
            </div>

            <div>
              <label className={labelClass}>
                <GraduationCap
                  size={14}
                  className={`inline shrink-0 ${isRTL ? "ml-1" : "mr-1"} ${
                    iconColors.degree
                  }`}
                />
                {t("reports.scientificDegree") || "Scientific Degree"}
              </label>

              <select
                value={filters.scientificDegreeId || ""}
                onChange={(e) =>
                  handleFilterChange(
                    "scientificDegreeId",
                    e.target.value ? parseInt(e.target.value) : null
                  )
                }
                className={inputClass}
              >
                <option value="">
                  {t("reports.allDegrees") || "All Degrees"}
                </option>

                {contractingTypes?.map((type) => (
                  <option key={type.id} value={type.id}>
                    {currentLang === "ar" ? type.nameArabic : type.nameEnglish}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelClass}>
                <Briefcase
                  size={14}
                  className={`inline shrink-0 ${isRTL ? "ml-1" : "mr-1"} ${
                    iconColors.briefcase
                  }`}
                />
                {t("reports.contractingType") || "Contracting Type"}
              </label>

              <select
                value={filters.contractingTypeId || ""}
                onChange={(e) =>
                  handleFilterChange(
                    "contractingTypeId",
                    e.target.value ? parseInt(e.target.value) : null
                  )
                }
                className={inputClass}
              >
                <option value="">{t("reports.allTypes") || "All Types"}</option>

                {contracting?.map((type) => (
                  <option key={type.id} value={type.id}>
                    {currentLang === "ar" ? type.nameArabic : type.nameEnglish}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className={`${theme.cardSoft} mt-4 p-4 border border-[var(--color-border)]`}>
            <div className="flex items-center gap-2 mb-3">
              <HeaderIcon
                icon={Calendar}
                bgClass={iconBg.calendar}
                iconClass={iconColors.calendar}
              />

              <h3 className="text-base font-black text-[var(--color-text)]">
                {t("reports.dateRange") || "Date Range"}
              </h3>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3">
              <div className="flex-1">
                <label className={labelClass}>
                  {t("common.startDate") || "Start Day"}
                </label>

                <input
                  type="number"
                  min="1"
                  max={daysInCurrentMonth}
                  value={dateRange.startDay}
                  onChange={(e) =>
                    handleDateRangeChange("startDay", e.target.value)
                  }
                  className={inputClass}
                />
              </div>

              <div className="hidden sm:flex items-center justify-center pb-2">
                <ArrowSeparator className={iconColors.muted} />
              </div>

              <div className="flex-1">
                <label className={labelClass}>
                  {t("common.endDate") || "End Day"}
                </label>

                <input
                  type="number"
                  min="1"
                  max={daysInCurrentMonth}
                  value={dateRange.endDay}
                  onChange={(e) =>
                    handleDateRangeChange("endDay", e.target.value)
                  }
                  className={inputClass}
                />
              </div>

              <div className="flex-1 sm:flex-initial">
                <button
                  type="button"
                  onClick={applyDateRange}
                  className={`${primaryActionButton} w-full sm:w-auto`}
                >
                  <Filter className="w-4 h-4 shrink-0" />
                  {t("reports.applyDateRange") || "Apply"}
                </button>
              </div>
            </div>

            {dateRangeError && (
              <div className="mt-3 p-3 bg-transparent border border-red-500 rounded-lg">
                <p className="text-red-500 text-sm font-semibold">
                  {dateRangeError}
                </p>
              </div>
            )}

            {hasDateRangeFilter && (
              <div className="mt-3 flex flex-col sm:flex-row sm:items-center gap-3 p-3 bg-transparent border border-blue-500 rounded-lg">
                <p className="text-blue-500 text-sm font-bold flex-1">
                  {t("reports.showingDays") || "Showing days"}:{" "}
                  {appliedDateRange.startDay} - {appliedDateRange.endDay}
                </p>

                <button
                  type="button"
                  onClick={resetDateRange}
                  className={primaryActionButton}
                >
                  <RefreshCw className="w-4 h-4 shrink-0" />
                  {t("common.reset") || "Reset"}
                </button>
              </div>
            )}
          </div>
        </div>

        {loadingGetReports ? (
          <LoadingGetData text={t("reports.loading") || "Loading reports..."} />
        ) : scheduleError ? (
          <div className={`${theme.card} p-8 text-center`}>
            <div
              className={`w-20 h-20 ${iconBg.file} rounded-full flex items-center justify-center mx-auto mb-6`}
            >
              <FileText className={`w-10 h-10 ${iconColors.danger}`} />
            </div>

            <h3 className="text-2xl font-black text-[var(--color-text)] mb-4">
              {t("reports.error") || "Error Loading Reports"}
            </h3>

            <p className="text-[var(--color-text-muted)] mb-8 text-lg font-semibold">
              {scheduleError?.message || t("reports.error")}
            </p>
          </div>
        ) : !reports?.rows || reports.rows.length === 0 ? (
          <div className={`${theme.card} p-8 text-center`}>
            <div
              className={`w-20 h-20 ${iconBg.file} rounded-full flex items-center justify-center mx-auto mb-6`}
            >
              <FileText className={`w-10 h-10 ${iconColors.file}`} />
            </div>

            <h3 className="text-2xl font-black text-[var(--color-text)] mb-4">
              {t("reports.noData") || "No Reports Found"}
            </h3>

            <p className="text-[var(--color-text-muted)] text-lg font-semibold">
              {t("reports.noDataDescription") ||
                "No reports available for the selected filters."}
            </p>
          </div>
        ) : (
          <>
            <div className={`${theme.card} p-5 mb-5`}>
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-5">
                <div>
                  <h2 className="text-2xl font-black text-[var(--color-text)]">
                    {reports.monthName} {reports.year}
                  </h2>

                  <p className="text-sm font-bold text-[var(--color-text-muted)] mt-1">
                    {t("reports.summary") || "Report Summary"}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <span className="px-3 py-1 rounded-full text-sm font-black bg-transparent text-blue-500 border border-blue-500">
                    {filters.page} / {totalPages || 1}
                  </span>

                  <div className="flex items-center gap-2 bg-[var(--color-surface-muted)] border border-[var(--color-border-strong)] rounded-2xl p-1.5 flex-wrap shadow-sm">
                    <ViewModeButton
                      mode="scheduleRows"
                      icon={Rows3}
                      label={
                        currentLang === "ar"
                          ? "صفوف الجدول"
                          : "Schedule Rows"
                      }
                    />

                    <ViewModeButton
                      mode="scheduleCalendar"
                      icon={Grid3X3}
                      label={
                        currentLang === "ar"
                          ? "تقويم الجدول"
                          : "Schedule Calendar"
                      }
                    />

                    <ViewModeButton
                      mode="attendanceSummary"
                      icon={BarChart3}
                      label={
                        currentLang === "ar"
                          ? "ملخص الحضور"
                          : "Attendance Summary"
                      }
                    />

                    <ViewModeButton
                      mode="attendanceMatrix"
                      icon={Activity}
                      label={
                        currentLang === "ar"
                          ? "حضور شهري"
                          : "Attendance Matrix"
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <SummaryCard
                  icon={Users}
                  title={t("reports.totalDoctors") || "Total Doctors"}
                  value={reports.totalDoctors}
                  tone="doctors"
                />

                <SummaryCard
                  icon={Briefcase}
                  title={t("reports.totalRecords") || "Total Records"}
                  value={reports.totalRecords}
                  tone="records"
                />

                <SummaryCard
                  icon={Calendar}
                  title={t("reports.startDate") || "Start Date"}
                  value={startDateFormatted}
                  tone="start"
                />

                <SummaryCard
                  icon={Calendar}
                  title={t("reports.endDate") || "End Date"}
                  value={endDateFormatted}
                  tone="end"
                />
              </div>
            </div>

            {viewMode === "scheduleRows" && (
              <div className={`${theme.card} overflow-hidden`}>
                <div className="flex w-full">
                  <div
                    className={`shrink-0 bg-[var(--color-surface)] z-30 ${
                      isRTL
                        ? "border-l-2 border-[var(--color-border)] shadow-[-8px_0_14px_-12px_rgba(0,0,0,0.55)]"
                        : "border-r-2 border-[var(--color-border)] shadow-[8px_0_14px_-12px_rgba(0,0,0,0.55)]"
                    }`}
                    style={{ width: "420px" }}
                  >
                    <table className="w-full table-fixed">
                      <thead className="bg-[var(--color-surface-muted)]">
                        <tr className="border-b border-[var(--color-border-strong)] h-[58px]">
                          <th
                            className={`px-3 py-3 text-${
                              currentLang === "ar" ? "right" : "left"
                            } text-xs font-black text-[var(--color-text)] uppercase tracking-wider`}
                            style={{ width: "210px" }}
                          >
                            {t("reports.table.doctor") || "Doctor"}
                          </th>

                          <th
                            className={`px-2 py-3 text-${
                              currentLang === "ar" ? "right" : "left"
                            } text-xs font-black text-[var(--color-text)] uppercase tracking-wider`}
                            style={{ width: "80px" }}
                          >
                            {t("reports.table.category") || "Category"}
                          </th>

                          <th
                            className={`px-2 py-3 text-${
                              currentLang === "ar" ? "right" : "left"
                            } text-xs font-black text-[var(--color-text)] uppercase tracking-wider`}
                            style={{ width: "80px" }}
                          >
                            {t("reports.table.department") || "Department"}
                          </th>

                          <th
                            className="px-2 py-3 text-center text-xs font-black text-[var(--color-text)] uppercase tracking-wider"
                            style={{ width: "50px" }}
                          >
                            {t("categories.table.actions") || "View"}
                          </th>
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-[var(--color-border)]">
                        {reports.rows.map((row, index) => (
                          <tr
                            key={`fixed-${row.doctorId}-${index}`}
                            className={`${theme.hoverRow} h-[78px]`}
                          >
                            <td className="px-3 py-3 align-middle">
                              <div className="space-y-1">
                                <div
                                  className="text-sm font-black text-[var(--color-text)] leading-5 line-clamp-2"
                                  title={getDoctorName(row)}
                                >
                                  {getDoctorName(row)}
                                </div>

                                <div className="inline-flex items-center gap-1 text-xs font-bold text-[var(--color-text-muted)]">
                                  <Phone
                                    size={13}
                                    className={`shrink-0 ${iconColors.phone}`}
                                  />
                                  {row.mobile || "-"}
                                </div>
                              </div>
                            </td>

                            <td className="px-2 py-3 align-middle">
                              <div
                                className="text-xs font-black text-[var(--color-text)] line-clamp-2"
                                title={getCategoryName(row)}
                              >
                                {getCategoryName(row)}
                              </div>
                            </td>

                            <td className="px-2 py-3 align-middle">
                              <div
                                className="text-xs font-black text-[var(--color-text)] line-clamp-2"
                                title={getDepartmentsJoined(row)}
                              >
                                {getDepartmentsJoined(row)}
                              </div>
                            </td>

                            <td className="px-2 py-3 align-middle text-center">
                              <Link
                                to={`/admin-panel/reports/doctor/${row.doctorId}`}
                              >
                                <button
                                  type="button"
                                  className={iconButton}
                                  title={t("categories.actions.view") || "View"}
                                >
                                  <Eye size={16} />
                                </button>
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="flex-1 overflow-x-auto">
                    <table className="w-max min-w-full">
                      <thead className="bg-[var(--color-surface-muted)]">
                        <tr className="border-b border-[var(--color-border-strong)] h-[58px]">
                          {daysArray.map((day) => (
                            <th
                              key={`day-head-${day}`}
                              className="px-1 py-3 text-center text-xs font-black text-[var(--color-text)] uppercase tracking-wider whitespace-nowrap"
                              style={{ minWidth: "68px", width: "68px" }}
                            >
                              <div className="flex flex-col items-center">
                                <span className="text-[10px] font-bold text-[var(--color-text-muted)]">
                                  {t("reports.table.day") || "Day"}
                                </span>

                                <span className="text-blue-500 dark:text-blue-200 text-sm font-black">
                                  {day}
                                </span>
                              </div>
                            </th>
                          ))}
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-[var(--color-border)]">
                        {reports.rows.map((row, index) => (
                          <tr
                            key={`days-${row.doctorId}-${index}`}
                            className={`${theme.hoverRow} h-[78px]`}
                          >
                            {daysArray.map((day) => {
                              const shift = getShiftByDay(row, day)

                              return (
                                <td
                                  key={`day-${row.doctorId}-${index}-${day}`}
                                  className="px-1 py-3 text-center text-xs whitespace-nowrap text-[var(--color-text)] align-middle"
                                  style={{ minWidth: "68px", width: "68px" }}
                                >
                                  <ScheduleShiftCell
                                    row={row}
                                    shift={shift}
                                    day={day}
                                    compact
                                  />
                                </td>
                              )
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {viewMode === "scheduleCalendar" && (
              <div className="space-y-6">
                {reports.rows.map((row) => (
                  <div key={row.doctorId} className={`${theme.card} p-5`}>
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
                      <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-xl ${iconBg.user}`}>
                          <User className={`w-6 h-6 shrink-0 ${iconColors.user}`} />
                        </div>

                        <div>
                          <h3 className="text-lg font-black text-[var(--color-text)]">
                            {getDoctorName(row)}
                          </h3>

                          <div className="flex flex-wrap gap-3 mt-2 text-sm font-semibold text-[var(--color-text-muted)]">
                            <DoctorMeta
                              icon={Hash}
                              iconClass={iconColors.hash}
                            >
                              {row.printNumber}
                            </DoctorMeta>

                            <DoctorMeta
                              icon={IdCard}
                              iconClass={iconColors.id}
                            >
                              {row.nationalId || "-"}
                            </DoctorMeta>

                            <DoctorMeta
                              icon={Phone}
                              iconClass={iconColors.phone}
                            >
                              {row.mobile || "-"}
                            </DoctorMeta>

                            <DoctorMeta
                              icon={GraduationCap}
                              iconClass={iconColors.degree}
                            >
                              {getScientificDegreeName(row)}
                            </DoctorMeta>

                            <DoctorMeta
                              icon={Briefcase}
                              iconClass={iconColors.briefcase}
                            >
                              {getContractingTypeName(row)}
                            </DoctorMeta>
                          </div>

                          <div className="mt-2 flex flex-wrap gap-2 text-xs font-semibold text-[var(--color-text-muted)]">
                            <span className="inline-flex items-center gap-1">
                              <BadgeCheck
                                size={14}
                                className={`shrink-0 ${iconColors.users}`}
                              />
                              {getCategoryName(row)}
                            </span>

                            <span className="inline-flex items-center gap-1">
                              <Building
                                size={14}
                                className={`shrink-0 ${iconColors.building}`}
                              />
                              {getDepartmentsJoined(row)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <Link to={`/admin-panel/reports/doctor/${row.doctorId}`}>
                        <button type="button" className={primaryActionButton}>
                          <Eye size={16} className="shrink-0" />
                          {t("categories.actions.view") || "View"}
                        </button>
                      </Link>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 2xl:grid-cols-7 gap-3">
                      {daysArray.map((day) => {
                        const shift = getShiftByDay(row, day)

                        return (
                          <div
                            key={`${row.doctorId}-${day}`}
                            className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden shadow-sm"
                          >
                            <div className="flex items-center justify-between gap-2 px-3 py-2 border-b border-[var(--color-border)] bg-[var(--color-surface-muted)]">
                              <div className="flex items-center gap-2">
                                <span className="text-[11px] font-black text-[var(--color-text-muted)]">
                                  {currentLang === "ar" ? "اليوم" : "Day"}
                                </span>

                                <span className="text-lg font-black text-[var(--color-text)]">
                                  {day}
                                </span>
                              </div>
                            </div>

                            <div className="p-2">
                              <ScheduleShiftCell
                                row={row}
                                shift={shift}
                                day={day}
                              />
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {viewMode === "attendanceSummary" && <AttendanceSummaryView />}

            {viewMode === "attendanceMatrix" && <AttendanceMatrixView />}

            {totalPages > 1 && (
              <div className={`${theme.card} mt-6 p-4`}>
                <div className="flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => handlePageChange(filters.page - 1)}
                    disabled={filters.page <= 1}
                    className={primaryActionButton}
                  >
                    {t("categories.pagination.previous") || "Previous"}
                  </button>

                  <span className="text-sm font-black text-[var(--color-text-muted)]">
                    {filters.page} / {totalPages}
                  </span>

                  <button
                    type="button"
                    onClick={() => handlePageChange(filters.page + 1)}
                    disabled={filters.page >= totalPages}
                    className={primaryActionButton}
                  >
                    {t("categories.pagination.next") || "Next"}
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

function ArrowSeparator({ className = "" }) {
  return (
    <svg
      className={`w-6 h-6 ${className}`}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M13 5l7 7-7 7M5 5l7 7-7 7"
      />
    </svg>
  )
}

export default Reports