import React, { useEffect, useMemo, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { Link } from "react-router-dom"
import { useTranslation } from "react-i18next"
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  BarChart3,
  BadgeCheck,
  Briefcase,
  Building,
  Calendar,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Clock,
  Eye,
  FileText,
  Filter,
  GraduationCap,
  Grid3X3,
  Hash,
  IdCard,
  Phone,
  RefreshCw,
  Rows3,
  ShieldAlert,
  TrendingUp,
  User,
  Users,
  XCircle,
} from "lucide-react"

import { getCategories } from "../../../state/act/actCategory"
import { getDepartments } from "../../../state/act/actDepartment"
import { getContractingTypesForSignup } from "../../../state/act/actContractingType"
import { clearReports, clearReportsError } from "../../../state/slices/reports"
import {
  getReports,
  getReportsAttend,
  getReportsAttendSummary,
} from "../../../state/act/actReports"
import { getAvailbleScientficDegrees } from "../../../state/act/actRosterManagement"
import { getUserSummaries } from "../../../state/act/actUsers"

import LoadingGetData from "../../../components/LoadingGetData"
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

  const currentDate = new Date()
  const currentLang = i18n.language || "ar"
  const isRTL = currentLang === "ar"
  const isSystemAdmin =
    loginRoleResponseDto?.roleNameEn === "System Administrator"

  const reportsPageSize = 10000
  const doctorPageSize = 10000

  const [doctorPage, setDoctorPage] = useState(1)
  const [viewMode, setViewMode] = useState("scheduleRows")
  const [showFilters, setShowFilters] = useState(false)
  const [selectedCalendarDoctorId, setSelectedCalendarDoctorId] =
    useState(null)

  const [filters, setFilters] = useState({
    month: currentDate.getMonth() + 1,
    year: currentDate.getFullYear(),
    categoryId: isSystemAdmin ? null : id,
    departmentId: null,
    doctorId: null,
    scientificDegreeId: null,
    contractingTypeId: null,
    page: 1,
    pageSize: reportsPageSize,
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

  const { contractingTypes, loadingGetContractingTypes } = useSelector(
    (state) => state.contractingType
  )

  const {
    contractingTypesForSignup: contracting,
    loadingGetContractingTypesForSignup: loadingContract,
  } = useSelector((state) => state.contractingType)

  const { users, loading } = useSelector((state) => state.users)

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
    reportsAttend,
    loadingGetReportsAttend,
    getReportsAttendError,
    attendanceSummary,
    loadingAttendanceSummary,
    attendanceSummaryError,
  } = useSelector((state) => state.reports)

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
    analytics: "text-blue-500 dark:text-blue-500",
    problems: "text-red-500 dark:text-red-500",
    late: "text-amber-500 dark:text-amber-500",
    timer: "text-orange-500 dark:text-orange-500",
  }

  const iconBg = {
    calendar:
      "bg-transparent dark:bg-transparent border-2 border-blue-500 dark:border-blue-500",
    filter:
      "bg-transparent dark:bg-transparent border-2 border-blue-500 dark:border-blue-500",
    view: "bg-transparent dark:bg-transparent border-2 border-blue-500 dark:border-blue-500",
    users:
      "bg-transparent dark:bg-transparent border-2 border-blue-500 dark:border-blue-500",
    building:
      "bg-transparent dark:bg-transparent border-2 border-emerald-500 dark:border-emerald-500",
    briefcase:
      "bg-transparent dark:bg-transparent border-2 border-violet-500 dark:border-violet-500",
    degree:
      "bg-transparent dark:bg-transparent border-2 border-orange-500 dark:border-orange-500",
    user: "bg-transparent dark:bg-transparent border-2 border-blue-500 dark:border-blue-500",
    phone:
      "bg-transparent dark:bg-transparent border-2 border-cyan-500 dark:border-cyan-500",
    hash: "bg-transparent dark:bg-transparent border-2 border-slate-500 dark:border-slate-500",
    id: "bg-transparent dark:bg-transparent border-2 border-cyan-500 dark:border-cyan-500",
    file: "bg-transparent dark:bg-transparent border-2 border-slate-500 dark:border-slate-500",
    refresh:
      "bg-transparent dark:bg-transparent border-2 border-slate-500 dark:border-slate-500",
    danger:
      "bg-transparent dark:bg-transparent border-2 border-red-500 dark:border-red-500",
    success:
      "bg-transparent dark:bg-transparent border-2 border-emerald-500 dark:border-emerald-500",
    warning:
      "bg-transparent dark:bg-transparent border-2 border-amber-500 dark:border-amber-500",
    chart:
      "bg-transparent dark:bg-transparent border-2 border-violet-500 dark:border-violet-500",
    activity:
      "bg-transparent dark:bg-transparent border-2 border-violet-500 dark:border-violet-500",
    analytics:
      "bg-transparent dark:bg-transparent border-2 border-blue-500 dark:border-blue-500",
    problems:
      "bg-transparent dark:bg-transparent border-2 border-red-500 dark:border-red-500",
    late: "bg-transparent dark:bg-transparent border-2 border-amber-500 dark:border-amber-500",
    timer:
      "bg-transparent dark:bg-transparent border-2 border-orange-500 dark:border-orange-500",
  }

  const shiftPalette = [
    {
      bg: "bg-transparent dark:bg-transparent",
      border: "border-2 border-blue-500 dark:border-blue-500",
      text: "text-blue-500 dark:text-blue-500",
      badge: "bg-blue-500 dark:bg-blue-500",
    },
    {
      bg: "bg-transparent dark:bg-transparent",
      border: "border-2 border-emerald-500 dark:border-emerald-500",
      text: "text-emerald-500 dark:text-emerald-500",
      badge: "bg-emerald-500 dark:bg-emerald-500",
    },
    {
      bg: "bg-transparent dark:bg-transparent",
      border: "border-2 border-violet-500 dark:border-violet-500",
      text: "text-violet-500 dark:text-violet-500",
      badge: "bg-violet-500 dark:bg-violet-500",
    },
    {
      bg: "bg-transparent dark:bg-transparent",
      border: "border-2 border-amber-500 dark:border-amber-500",
      text: "text-amber-500 dark:text-amber-500",
      badge: "bg-amber-500 dark:bg-amber-500",
    },
    {
      bg: "bg-transparent dark:bg-transparent",
      border: "border-2 border-cyan-500 dark:border-cyan-500",
      text: "text-cyan-500 dark:text-cyan-500",
      badge: "bg-cyan-500 dark:bg-cyan-500",
    },
    {
      bg: "bg-transparent dark:bg-transparent",
      border: "border-2 border-rose-500 dark:border-rose-500",
      text: "text-rose-500 dark:text-rose-500",
      badge: "bg-rose-500 dark:bg-rose-500",
    },
    {
      bg: "bg-transparent dark:bg-transparent",
      border: "border-2 border-indigo-500 dark:border-indigo-500",
      text: "text-indigo-500 dark:text-indigo-500",
      badge: "bg-indigo-500 dark:bg-indigo-500",
    },
  ]

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

  const hasDateRangeFilter =
    appliedDateRange.startDay !== 1 ||
    appliedDateRange.endDay !== daysInCurrentMonth

  const reportRows = reports?.rows || []
  const scheduleError = getReportsError

  const daysArray = useMemo(() => {
    const start = appliedDateRange.startDay
    const end = appliedDateRange.endDay

    return Array.from({ length: end - start + 1 }, (_, index) => start + index)
  }, [appliedDateRange.startDay, appliedDateRange.endDay])

  const selectedCalendarDoctor = reportRows.find(
    (row) => String(row.doctorId) === String(selectedCalendarDoctorId)
  )

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
    setSelectedCalendarDoctorId(null)
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
      const params = {
        ...filters,
        page: 1,
        pageSize: reportsPageSize,
      }

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

    setSelectedCalendarDoctorId(null)
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
    setSelectedCalendarDoctorId(null)
  }

  const handleFilterChange = (name, value) => {
    setSelectedCalendarDoctorId(null)

    setFilters((prev) => ({
      ...prev,
      [name]: value,
      page: 1,
      pageSize: reportsPageSize,
      ...(name === "categoryId" && { departmentId: null, doctorId: null }),
    }))

    if (name === "categoryId") {
      setDoctorPage(1)
    }
  }

  const getShiftTone = (shift) => {
    const key = Number(shift?.departmentId || 0)
    return shiftPalette[key % shiftPalette.length]
  }

  const getShiftByDay = (row, day) => {
    return row?.dailyShifts?.find((shift) => Number(shift.day) === Number(day))
  }

  const getDepartmentName = (shift) => {
    if (!shift) return ""
    return currentLang === "ar" ? shift.departmentAr : shift.departmentEn
  }

  const getDoctorName = (row) => {
    return currentLang === "ar"
      ? row?.doctorNameAr || row?.doctorNameEn || row?.doctorName || "-"
      : row?.doctorNameEn || row?.doctorNameAr || row?.doctorName || "-"
  }

  const getCategoryName = (row) => {
    return currentLang === "ar"
      ? row?.categoryNameAr || row?.categoryNameEn || "-"
      : row?.categoryNameEn || row?.categoryNameAr || "-"
  }

  const getScientificDegreeName = (row) => {
    return currentLang === "ar"
      ? row?.scientificDegreeName || row?.scientificDegreeNameEn || "-"
      : row?.scientificDegreeNameEn || row?.scientificDegreeName || "-"
  }

  const getContractingTypeName = (row) => {
    return currentLang === "ar"
      ? row?.contractingTypeName || row?.contractingTypeNameEn || "-"
      : row?.contractingTypeNameEn || row?.contractingTypeName || "-"
  }

  const getDepartmentsJoined = (row) => {
    return currentLang === "ar"
      ? row?.departmentsJoinedAr || row?.departmentsJoinedEn || "-"
      : row?.departmentsJoinedEn || row?.departmentsJoinedAr || "-"
  }

  const getAttendanceMonthlyPayload = () => {
    return reportsAttend?.data || reportsAttend?.reports?.data || reportsAttend
  }

  const getAttendanceMonthlyRows = () => {
    const payload = getAttendanceMonthlyPayload()
    return payload?.rows || []
  }

  const clearSelectedCalendarDoctor = () => {
    setSelectedCalendarDoctorId(null)
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
        box: "bg-transparent text-blue-500 border-2 border-blue-500 dark:bg-transparent dark:text-blue-500 dark:border-blue-500",
        icon: "bg-blue-500 text-white dark:bg-blue-500",
        value: "text-blue-500 dark:text-blue-500",
      },
      records: {
        box: "bg-transparent text-violet-500 border-2 border-violet-500 dark:bg-transparent dark:text-violet-500 dark:border-violet-500",
        icon: "bg-violet-500 text-white dark:bg-violet-500",
        value: "text-violet-500 dark:text-violet-500",
      },
      start: {
        box: "bg-transparent text-emerald-500 border-2 border-emerald-500 dark:bg-transparent dark:text-emerald-500 dark:border-emerald-500",
        icon: "bg-emerald-500 text-white dark:bg-emerald-500",
        value: "text-emerald-500 dark:text-emerald-500",
      },
      end: {
        box: "bg-transparent text-orange-500 border-2 border-orange-500 dark:bg-transparent dark:text-orange-500 dark:border-orange-500",
        icon: "bg-orange-500 text-white dark:bg-orange-500",
        value: "text-orange-500 dark:text-orange-500",
      },
      warning: {
        box: "bg-transparent text-amber-500 border-2 border-amber-500 dark:bg-transparent dark:text-amber-500 dark:border-amber-500",
        icon: "bg-amber-500 text-white dark:bg-amber-500",
        value: "text-amber-500 dark:text-amber-500",
      },
      danger: {
        box: "bg-transparent text-red-500 border-2 border-red-500 dark:bg-transparent dark:text-red-500 dark:border-red-500",
        icon: "bg-red-500 text-white dark:bg-red-500",
        value: "text-red-500 dark:text-red-500",
      },
      activity: {
        box: "bg-transparent text-violet-500 border-2 border-violet-500 dark:bg-transparent dark:text-violet-500 dark:border-violet-500",
        icon: "bg-violet-500 text-white dark:bg-violet-500",
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
            <p className="text-xs sm:text-sm font-black text-[var(--color-text)] truncate">
              {title}
            </p>

            <p
              className={`mt-1 text-lg sm:text-2xl xl:text-3xl font-black tracking-tight truncate ${selectedTone.value}`}
              title={String(value ?? 0)}
            >
              {value ?? 0}
            </p>
          </div>

          <div
            className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${selectedTone.box}`}
          >
            <div
              className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0 ${selectedTone.icon}`}
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
        className={`w-full rounded-xl border shadow-sm hover:shadow-md transition-all cursor-help ${shiftTone.bg} ${shiftTone.border} p-2 min-h-[42px]`}
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
      onClick={() => {
        setViewMode(mode)

        if (mode !== "scheduleCalendar") {
          setSelectedCalendarDoctorId(null)
        }
      }}
      className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-black border transition-colors ${
        viewMode === mode ? selectedActionButton : primaryActionButton
      }`}
    >
      <Icon
        size={16}
        className={`shrink-0 ${
          viewMode === mode ? "text-white" : iconColors.view
        }`}
      />
      {label}
    </button>
  )

  const MiniMetric = ({ label, value, tone = "blue" }) => {
    const toneClass = {
      blue: "text-blue-500",
      emerald: "text-emerald-500",
      violet: "text-violet-500",
      amber: "text-amber-500",
      orange: "text-orange-500",
      red: "text-red-500",
      slate: "text-slate-500",
    }

    return (
      <div className="rounded-xl bg-[var(--color-bg-soft)] border border-[var(--color-border)] p-2 text-center">
        <p className="text-[11px] font-black text-[var(--color-text-muted)]">
          {label}
        </p>
        <p className={`text-sm font-black ${toneClass[tone] || toneClass.blue}`}>
          {value ?? 0}
        </p>
      </div>
    )
  }

  const EmptyBox = ({ icon: Icon = FileText, title, description }) => (
    <div className={`${theme.card} p-8 text-center`}>
      <Icon className="w-14 h-14 mx-auto mb-4 text-blue-500" />
      <h3 className="text-xl font-black text-[var(--color-text)] mb-2">
        {title}
      </h3>
      {description && (
        <p className="text-sm font-semibold text-[var(--color-text-muted)] max-w-2xl mx-auto">
          {description}
        </p>
      )}
    </div>
  )

  const ErrorBox = ({ icon: Icon = AlertTriangle, title, message }) => (
    <div className={`${theme.card} p-8 text-center`}>
      <Icon className="w-14 h-14 mx-auto mb-4 text-red-500" />
      <h3 className="text-xl font-black text-[var(--color-text)] mb-2">
        {title}
      </h3>
      <p className="text-sm font-semibold text-[var(--color-text-muted)]">
        {message || "-"}
      </p>
    </div>
  )

  const FilterPanel = () => (
    <div className={`${theme.card} p-4 mb-5`}>
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <HeaderIcon
            icon={Filter}
            bgClass={iconBg.filter}
            iconClass={iconColors.filter}
          />

          <div>
            <h2 className="text-xl font-black text-[var(--color-text)]">
              {t("reports.filters") || "Filters"}
            </h2>

            <p className="text-sm font-bold text-[var(--color-text-muted)] mt-1">
              {currentLang === "ar"
                ? "الفلاتر مخفية لتوفير مساحة، افتحها عند الحاجة فقط."
                : "Filters are collapsible to save space. Open them only when needed."}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-black border-2 border-blue-500 text-blue-500 bg-transparent">
            {currentLang === "ar" ? "الشهر" : "Month"}: {filters.month}/
            {filters.year}
          </span>

          <span className="px-3 py-1 rounded-full text-xs font-black border-2 border-violet-500 text-violet-500 bg-transparent">
            {reportRows.length} {currentLang === "ar" ? "سجل" : "Records"}
          </span>

          {hasDateRangeFilter && (
            <span className="px-3 py-1 rounded-full text-xs font-black border-2 border-amber-500 text-amber-500 bg-transparent">
              {currentLang === "ar" ? "الأيام" : "Days"}:{" "}
              {appliedDateRange.startDay} - {appliedDateRange.endDay}
            </span>
          )}

          <button
            type="button"
            onClick={() => setShowFilters((prev) => !prev)}
            className={showFilters ? selectedActionButton : primaryActionButton}
          >
            {showFilters ? (
              <ChevronUp
                className={`w-4 h-4 shrink-0 ${
                  showFilters ? "text-white" : iconColors.filter
                }`}
              />
            ) : (
              <ChevronDown
                className={`w-4 h-4 shrink-0 ${
                  showFilters ? "text-white" : iconColors.filter
                }`}
              />
            )}

            {showFilters
              ? currentLang === "ar"
                ? "إخفاء الفلاتر"
                : "Hide Filters"
              : currentLang === "ar"
              ? "إظهار الفلاتر"
              : "Show Filters"}
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="mt-5 pt-5 border-t border-[var(--color-border)]">
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

          <div
            className={`${theme.cardSoft} mt-4 p-4 border border-[var(--color-border)]`}
          >
            <div className="flex items-center gap-2 mb-3">
              <HeaderIcon
                icon={Calendar}
                bgClass={iconBg.calendar}
                iconClass={iconColors.calendar}
              />

              <h3 className="text-base font-black text-[var(--color-text)]">
                {currentLang === "ar" ? "نطاق الأيام" : "Date Range"}
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
                {isRTL ? (
                  <ArrowLeft className={`w-5 h-5 ${iconColors.muted}`} />
                ) : (
                  <ArrowRight className={`w-5 h-5 ${iconColors.muted}`} />
                )}
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
              <div className="mt-3 p-3 bg-transparent border-2 border-red-500 rounded-lg">
                <p className="text-red-500 text-sm font-semibold">
                  {dateRangeError}
                </p>
              </div>
            )}

            {hasDateRangeFilter && (
              <div className="mt-3 flex flex-col sm:flex-row sm:items-center gap-3 p-3 bg-transparent border-2 border-blue-500 rounded-lg">
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
      )}
    </div>
  )

  const ReportSummaryHeader = () => (
    <div className={`${theme.card} p-5 mb-5`}>
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-5">
        <div className="flex items-start gap-4">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${iconBg.file}`}>
            <FileText className={`w-7 h-7 ${iconColors.file}`} />
          </div>

          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="text-2xl font-black text-[var(--color-text)]">
                {monthOptions.find((item) => item.value === filters.month)?.[
                  currentLang === "ar" ? "labelAr" : "labelEn"
                ] || filters.month}{" "}
                {filters.year}
              </h2>

              <span className="px-3 py-1 rounded-full text-sm font-black bg-transparent text-blue-500 border-2 border-blue-500">
                {reportRows.length} {currentLang === "ar" ? "سجل" : "Records"}
              </span>
            </div>

            <p className="text-sm font-semibold text-[var(--color-text-muted)] mt-2">
              {currentLang === "ar"
                ? "ملخص سريع للتقرير الحالي بدون Pagination، مع عرض كل البيانات المسترجعة."
                : "Quick summary of the current report without pagination, showing all returned rows."}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <ViewModeButton
            mode="scheduleRows"
            icon={Rows3}
            label={currentLang === "ar" ? "صفوف الجدول" : "Schedule Rows"}
          />

          <ViewModeButton
            mode="scheduleCalendar"
            icon={Grid3X3}
            label={currentLang === "ar" ? "تقويم الجدول" : "Schedule Calendar"}
          />

          <ViewModeButton
            mode="attendanceSummary"
            icon={BarChart3}
            label={
              currentLang === "ar" ? "ملخص الحضور" : "Attendance Summary"
            }
          />

          <ViewModeButton
            mode="attendanceMatrix"
            icon={Activity}
            label={
              currentLang === "ar" ? "مصفوفة الحضور" : "Attendance Matrix"
            }
          />

          <ViewModeButton
            mode="problemsAnalytics"
            icon={ShieldAlert}
            label={
              currentLang === "ar" ? "تحليل المشاكل" : "Problems Analytics"
            }
          />
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-5">
        <SummaryCard
          icon={Users}
          title={currentLang === "ar" ? "إجمالي الأطباء" : "Total Doctors"}
          value={reports?.totalDoctors || reportRows.length || 0}
          tone="doctors"
        />

        <SummaryCard
          icon={FileText}
          title={currentLang === "ar" ? "إجمالي السجلات" : "Total Records"}
          value={reportRows.length}
          tone="records"
        />

        <SummaryCard
          icon={Calendar}
          title={currentLang === "ar" ? "تاريخ البداية" : "Start Date"}
          value={startDateFormatted}
          tone="start"
        />

        <SummaryCard
          icon={Calendar}
          title={currentLang === "ar" ? "تاريخ النهاية" : "End Date"}
          value={endDateFormatted}
          tone="end"
        />
      </div>
    </div>
  )

  const ScheduleRowsView = () => {
    if (!reportRows.length) {
      return (
        <EmptyBox
          icon={Rows3}
          title={currentLang === "ar" ? "لا توجد بيانات جدول" : "No schedule rows"}
          description={
            currentLang === "ar"
              ? "غيّر الفلاتر أو اختر شهرًا آخر لعرض بيانات الجدول."
              : "Change filters or choose another month to show schedule data."
          }
        />
      )
    }

    return (
      <div className={`${theme.card} overflow-hidden`}>
        <div className="p-5 border-b border-[var(--color-border)]">
          <h3 className="text-xl font-black text-[var(--color-text)] flex items-center gap-2">
            <Rows3 className={`w-5 h-5 ${iconColors.view}`} />
            {currentLang === "ar" ? "صفوف الجدول" : "Schedule Rows"}
          </h3>

          <p className="text-sm font-bold text-[var(--color-text-muted)] mt-1">
            {currentLang === "ar"
              ? "تم إلغاء Pagination، ويتم عرض كل السجلات المسترجعة."
              : "Pagination is disabled, all returned rows are displayed."}
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1300px]">
            <thead className="bg-[var(--color-surface-muted)]">
              <tr className="border-b border-[var(--color-border-strong)]">
                <th
                  className={`sticky ${
                    isRTL ? "right-0" : "left-0"
                  } z-20 bg-[var(--color-surface-muted)] p-3 text-sm font-black text-[var(--color-text)] text-${
                    isRTL ? "right" : "left"
                  } min-w-[260px]`}
                >
                  {currentLang === "ar" ? "الدكتور" : "Doctor"}
                </th>

                {daysArray.map((day) => (
                  <th
                    key={`day-header-${day}`}
                    className="p-3 text-center text-xs font-black text-[var(--color-text)] min-w-[92px]"
                  >
                    <div className="flex flex-col items-center">
                      <span className="text-[11px] text-[var(--color-text-muted)]">
                        {currentLang === "ar" ? "يوم" : "Day"}
                      </span>
                      <span className="text-lg text-blue-500">{day}</span>
                    </div>
                  </th>
                ))}

                <th className="p-3 text-center text-sm font-black text-[var(--color-text)] min-w-[90px]">
                  {currentLang === "ar" ? "عرض" : "View"}
                </th>
              </tr>
            </thead>

            <tbody>
              {reportRows.map((row, index) => (
                <tr
                  key={`${row.doctorId || index}-${index}`}
                  className={`border-b border-[var(--color-border)] ${theme.hoverRow}`}
                >
                  <td
                    className={`sticky ${
                      isRTL ? "right-0" : "left-0"
                    } z-10 bg-[var(--color-surface)] p-3 min-w-[260px]`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${iconBg.user}`}
                      >
                        <User className={`w-5 h-5 ${iconColors.user}`} />
                      </div>

                      <div className="min-w-0">
                        <p className="text-sm font-black text-[var(--color-text)] truncate">
                          {getDoctorName(row)}
                        </p>

                        <div className="flex flex-wrap gap-2 mt-1 text-[11px] font-bold text-[var(--color-text-muted)]">
                          <DoctorMeta icon={Hash} iconClass={iconColors.hash}>
                            {row.printNumber || "-"}
                          </DoctorMeta>

                          <DoctorMeta
                            icon={GraduationCap}
                            iconClass={iconColors.degree}
                          >
                            {getScientificDegreeName(row)}
                          </DoctorMeta>
                        </div>

                        <p className="text-[11px] font-bold text-[var(--color-text-muted)] mt-1 truncate">
                          {getDepartmentsJoined(row)}
                        </p>
                      </div>
                    </div>
                  </td>

                  {daysArray.map((day) => {
                    const shift = getShiftByDay(row, day)

                    return (
                      <td
                        key={`${row.doctorId || index}-${day}`}
                        className="p-2 text-center align-middle"
                      >
                        <ScheduleShiftCell row={row} shift={shift} day={day} compact />
                      </td>
                    )
                  })}

                  <td className="p-3 text-center">
                    <Link to={`/admin-panel/reports/doctor/${row.doctorId}`}>
                      <button type="button" className={iconButton}>
                        <Eye size={16} className={iconColors.view} />
                      </button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  const ScheduleCalendarView = () => {
    if (!reportRows.length) {
      return (
        <EmptyBox
          icon={Grid3X3}
          title={
            currentLang === "ar"
              ? "لا توجد بيانات تقويم"
              : "No calendar data"
          }
          description={
            currentLang === "ar"
              ? "لا توجد سجلات أطباء لعرض التقويم."
              : "No doctor rows are available to show the calendar."
          }
        />
      )
    }

    if (!selectedCalendarDoctorId) {
      return (
        <div className={`${theme.card} p-5`}>
          <div className="flex items-center justify-between gap-3 flex-wrap mb-5">
            <div>
              <h2 className="text-2xl font-black text-[var(--color-text)] flex items-center gap-2">
                <Grid3X3 className={`w-6 h-6 ${iconColors.view}`} />
                {currentLang === "ar" ? "اختار دكتور" : "Select Doctor"}
              </h2>

              <p className="text-sm font-bold text-[var(--color-text-muted)] mt-1">
                {currentLang === "ar"
                  ? "اضغط على كارت الدكتور لعرض تقويمه فقط، بدل تحميل تقاويم كل الدكاترة مرة واحدة."
                  : "Click a doctor card to view only this doctor's calendar instead of rendering all calendars at once."}
              </p>
            </div>

            <span className="px-3 py-1 rounded-full text-xs font-black border-2 border-blue-500 text-blue-500 bg-transparent">
              {reportRows.length} {currentLang === "ar" ? "دكتور" : "Doctors"}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {reportRows.map((row, index) => (
              <button
                key={`doctor-calendar-card-${row.doctorId || index}`}
                type="button"
                onClick={() => setSelectedCalendarDoctorId(row.doctorId)}
                className="text-start rounded-2xl border border-[var(--color-border-strong)] bg-[var(--color-surface)] p-4 hover:border-emerald-500 hover:shadow-lg transition-all"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${iconBg.user}`}
                    >
                      <User className={`w-6 h-6 ${iconColors.user}`} />
                    </div>

                    <div className="min-w-0">
                      <h3 className="font-black text-[var(--color-text)] truncate">
                        {getDoctorName(row)}
                      </h3>

                      <p className="text-xs font-bold text-[var(--color-text-muted)] mt-1 truncate">
                        {getCategoryName(row)}
                      </p>

                      <p className="text-xs font-bold text-[var(--color-text-muted)] mt-1 truncate">
                        {getDepartmentsJoined(row)}
                      </p>
                    </div>
                  </div>

                  <Eye className={`w-5 h-5 shrink-0 ${iconColors.view}`} />
                </div>

                <div className="grid grid-cols-3 gap-2 mt-4">
                  <MiniMetric
                    label={currentLang === "ar" ? "شفتات" : "Shifts"}
                    value={row.dailyShifts?.length || 0}
                    tone="blue"
                  />

                  <MiniMetric
                    label={currentLang === "ar" ? "كود" : "Code"}
                    value={row.printNumber || "-"}
                    tone="violet"
                  />

                  <MiniMetric
                    label={currentLang === "ar" ? "عرض" : "View"}
                    value={currentLang === "ar" ? "فتح" : "Open"}
                    tone="emerald"
                  />
                </div>
              </button>
            ))}
          </div>
        </div>
      )
    }

    if (!selectedCalendarDoctor) {
      return (
        <div className={`${theme.card} p-8 text-center`}>
          <User className="w-12 h-12 mx-auto mb-3 text-[var(--color-text-muted)]" />

          <p className="font-black text-[var(--color-text)]">
            {currentLang === "ar"
              ? "لم يتم العثور على الدكتور المحدد"
              : "Selected doctor was not found"}
          </p>

          <button
            type="button"
            onClick={clearSelectedCalendarDoctor}
            className={`${primaryActionButton} mt-4`}
          >
            {currentLang === "ar" ? "رجوع لكل الدكاترة" : "Back to Doctors"}
          </button>
        </div>
      )
    }

    return (
      <div className={`${theme.card} p-5`}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-5">
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-xl ${iconBg.user}`}>
              <User className={`w-6 h-6 shrink-0 ${iconColors.user}`} />
            </div>

            <div>
              <h3 className="text-xl font-black text-[var(--color-text)]">
                {getDoctorName(selectedCalendarDoctor)}
              </h3>

              <div className="flex flex-wrap gap-3 mt-2 text-sm font-bold text-[var(--color-text-muted)]">
                <DoctorMeta icon={Hash} iconClass={iconColors.hash}>
                  {selectedCalendarDoctor.printNumber || "-"}
                </DoctorMeta>

                <DoctorMeta icon={IdCard} iconClass={iconColors.id}>
                  {selectedCalendarDoctor.nationalId || "-"}
                </DoctorMeta>

                <DoctorMeta icon={Phone} iconClass={iconColors.phone}>
                  {selectedCalendarDoctor.mobile || "-"}
                </DoctorMeta>

                <DoctorMeta icon={GraduationCap} iconClass={iconColors.degree}>
                  {getScientificDegreeName(selectedCalendarDoctor)}
                </DoctorMeta>

                <DoctorMeta icon={Briefcase} iconClass={iconColors.briefcase}>
                  {getContractingTypeName(selectedCalendarDoctor)}
                </DoctorMeta>
              </div>

              <div className="mt-2 flex flex-wrap gap-2 text-xs font-bold text-[var(--color-text-muted)]">
                <span className="inline-flex items-center gap-1">
                  <BadgeCheck
                    size={14}
                    className={`shrink-0 ${iconColors.users}`}
                  />
                  {getCategoryName(selectedCalendarDoctor)}
                </span>

                <span className="inline-flex items-center gap-1">
                  <Building
                    size={14}
                    className={`shrink-0 ${iconColors.building}`}
                  />
                  {getDepartmentsJoined(selectedCalendarDoctor)}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={clearSelectedCalendarDoctor}
              className={primaryActionButton}
            >
              {isRTL ? (
                <ArrowRight size={16} className={iconColors.refresh} />
              ) : (
                <ArrowLeft size={16} className={iconColors.refresh} />
              )}
              {currentLang === "ar" ? "رجوع لكل الدكاترة" : "Back to Doctors"}
            </button>

            <Link
              to={`/admin-panel/reports/doctor/${selectedCalendarDoctor.doctorId}`}
            >
              <button type="button" className={primaryActionButton}>
                <Eye size={16} className={iconColors.view} />
                {t("categories.actions.view") || "View"}
              </button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 2xl:grid-cols-7 gap-3">
          {daysArray.map((day) => {
            const shift = getShiftByDay(selectedCalendarDoctor, day)

            return (
              <div
                key={`${selectedCalendarDoctor.doctorId}-${day}`}
                className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden shadow-sm"
              >
                <div className="flex items-center justify-between gap-2 px-3 py-2 border-b border-[var(--color-border)] bg-[var(--color-surface-muted)]">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-black text-[var(--color-text-muted)]">
                      {currentLang === "ar" ? "اليوم" : "Day"}
                    </span>

                    <span className="text-lg font-black text-blue-500">
                      {day}
                    </span>
                  </div>
                </div>

                <div className="p-2">
                  <ScheduleShiftCell
                    row={selectedCalendarDoctor}
                    shift={shift}
                    day={day}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

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
        <ErrorBox
          icon={FileText}
          title={
            currentLang === "ar"
              ? "تعذر تحميل ملخص الحضور"
              : "Failed to load attendance summary"
          }
          message={attendanceSummaryError?.message}
        />
      )
    }

    if (!attendanceSummary) {
      return (
        <EmptyBox
          icon={FileText}
          title={
            currentLang === "ar"
              ? "لا يوجد ملخص حضور لهذا الشهر"
              : "No attendance summary for this month"
          }
        />
      )
    }

    const departmentStats = attendanceSummary.departmentStats || []
    const degreeStats = attendanceSummary.degreeStats || []

    return (
      <div className="space-y-6">
        <div className={`${theme.card} p-6`}>
          <div className="flex items-center gap-3 mb-5">
            <BarChart3 className="w-6 h-6 shrink-0 text-blue-500 dark:text-blue-500" />

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
              <Building className="w-5 h-5 shrink-0 text-emerald-500 dark:text-emerald-500" />
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
                          <span className="px-3 py-1 rounded-full text-xs font-black bg-transparent text-emerald-500 border-2 border-emerald-500 dark:bg-transparent dark:text-emerald-500 dark:border-emerald-500">
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
              <GraduationCap className="w-5 h-5 shrink-0 text-orange-500 dark:text-orange-500" />
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

                    <span className="px-3 py-1 rounded-full text-xs font-black bg-transparent text-blue-500 border-2 border-blue-500 dark:bg-transparent dark:text-blue-500 dark:border-blue-500">
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
        <ErrorBox
          icon={Activity}
          title={
            currentLang === "ar"
              ? "تعذر تحميل تقرير الحضور الشهري"
              : "Failed to load monthly attendance"
          }
          message={getReportsAttendError?.message}
        />
      )
    }

    if (!rows.length) {
      return (
        <EmptyBox
          icon={Activity}
          title={
            currentLang === "ar"
              ? "تقرير الحضور الشهري التفصيلي"
              : "Monthly Attendance Matrix"
          }
          description={
            currentLang === "ar"
              ? "لا توجد بيانات حضور تفصيلية يومية من endpoint الحضور الشهري حاليًا. استخدم ملخص الحضور، أو افتح تفاصيل دكتور محدد من زر View."
              : "No daily attendance matrix rows were returned from the monthly attendance endpoint. Use Attendance Summary, or open a doctor's details from View."
          }
        />
      )
    }

    return (
      <div className={`${theme.card} p-6`}>
        <div className="flex items-center gap-3 mb-5">
          <Activity className="w-6 h-6 shrink-0 text-violet-500 dark:text-violet-500" />

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

                  <td className="p-3 text-center text-emerald-500 dark:text-emerald-500 font-black">
                    {row.totalWorkedDays ?? row.workedDays ?? "-"}
                  </td>

                  <td className="p-3 text-center text-red-500 dark:text-red-500 font-black">
                    {row.totalAbsentDays ?? row.absentDays ?? "-"}
                  </td>

                  <td className="p-3 text-center">
                    <span className="px-3 py-1 rounded-full text-xs font-black bg-transparent text-blue-500 border-2 border-blue-500 dark:bg-transparent dark:text-blue-500 dark:border-blue-500">
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

  const AttendanceAnalyticsView = () => {
    const rows = getAttendanceMonthlyRows()
    const departmentStats = attendanceSummary?.departmentStats || []
    const degreeStats = attendanceSummary?.degreeStats || []

    const getRowNumber = (row, keys) => {
      for (const key of keys) {
        if (row?.[key] !== undefined && row?.[key] !== null && row?.[key] !== "") {
          const value = Number(row[key])
          return Number.isNaN(value) ? 0 : value
        }
      }

      return 0
    }

    const getRateTone = (rate) => {
      const value = Number(rate || 0)

      if (value >= 85) return "success"
      if (value >= 65) return "warning"
      return "danger"
    }

    const getRiskScore = (row) => {
      const absent = getRowNumber(row, [
        "totalAbsentDays",
        "absentDays",
        "absenceDays",
        "absences",
      ])

      const late = getRowNumber(row, ["totalLateDays", "lateDays", "lateCount"])

      const scheduled = getRowNumber(row, [
        "totalScheduledDays",
        "scheduledDays",
        "scheduled",
      ])

      const rate = getRowNumber(row, [
        "attendanceRate",
        "averageAttendanceRate",
        "rate",
      ])

      const missingRatePenalty = scheduled > 0 && rate < 70 ? 10 : 0

      return absent * 5 + late * 2 + missingRatePenalty
    }

    const riskyRows = [...rows]
      .map((row) => ({
        ...row,
        __riskScore: getRiskScore(row),
        __absent: getRowNumber(row, [
          "totalAbsentDays",
          "absentDays",
          "absenceDays",
          "absences",
        ]),
        __late: getRowNumber(row, ["totalLateDays", "lateDays", "lateCount"]),
        __scheduled: getRowNumber(row, [
          "totalScheduledDays",
          "scheduledDays",
          "scheduled",
        ]),
        __worked: getRowNumber(row, [
          "totalWorkedDays",
          "workedDays",
          "presentDays",
          "worked",
        ]),
        __rate: getRowNumber(row, [
          "attendanceRate",
          "averageAttendanceRate",
          "rate",
        ]),
      }))
      .filter((row) => row.__riskScore > 0 || row.__absent > 0 || row.__late > 0)
      .sort((a, b) => b.__riskScore - a.__riskScore)

    const totalDoctors =
      attendanceSummary?.totalDoctors || rows.length || reports?.totalDoctors || 0

    const totalScheduled =
      attendanceSummary?.totalScheduledDays ||
      rows.reduce(
        (sum, row) =>
          sum +
          getRowNumber(row, [
            "totalScheduledDays",
            "scheduledDays",
            "scheduled",
          ]),
        0
      )

    const totalWorked =
      attendanceSummary?.totalWorkedDays ||
      rows.reduce(
        (sum, row) =>
          sum +
          getRowNumber(row, [
            "totalWorkedDays",
            "workedDays",
            "presentDays",
            "worked",
          ]),
        0
      )

    const totalAbsent =
      attendanceSummary?.totalAbsentDays ||
      rows.reduce(
        (sum, row) =>
          sum +
          getRowNumber(row, [
            "totalAbsentDays",
            "absentDays",
            "absenceDays",
            "absences",
          ]),
        0
      )

    const totalLate =
      attendanceSummary?.totalLateDays ||
      rows.reduce(
        (sum, row) =>
          sum + getRowNumber(row, ["totalLateDays", "lateDays", "lateCount"]),
        0
      )

    const attendanceRate =
      attendanceSummary?.averageAttendanceRate ||
      (totalScheduled > 0 ? ((totalWorked / totalScheduled) * 100).toFixed(1) : 0)

    const ProblemRow = ({ row, index }) => {
      const tone =
        row.__absent > 0 ? "danger" : row.__late > 0 ? "warning" : "success"

      return (
        <tr className={`border-b border-[var(--color-border)] ${theme.hoverRow}`}>
          <td className="p-3 text-sm font-black text-[var(--color-text)]">
            <div className="flex items-center gap-3">
              <span
                className={`w-8 h-8 rounded-xl flex items-center justify-center border-2 font-black ${
                  tone === "danger"
                    ? "text-red-500 border-red-500"
                    : tone === "warning"
                    ? "text-amber-500 border-amber-500"
                    : "text-emerald-500 border-emerald-500"
                }`}
              >
                {index + 1}
              </span>

              <div>
                <p className="font-black text-[var(--color-text)]">
                  {currentLang === "ar"
                    ? row.doctorNameAr || row.doctorName
                    : row.doctorNameEn || row.doctorName}
                </p>
                <p className="text-xs font-semibold text-[var(--color-text-muted)]">
                  {currentLang === "ar"
                    ? row.departmentNameAr ||
                      row.departmentAr ||
                      row.departmentsJoinedAr
                    : row.departmentNameEn ||
                      row.departmentEn ||
                      row.departmentsJoinedEn}
                </p>
              </div>
            </div>
          </td>

          <td className="p-3 text-center font-black text-[var(--color-text-muted)]">
            {row.__scheduled}
          </td>

          <td className="p-3 text-center font-black text-emerald-500">
            {row.__worked}
          </td>

          <td className="p-3 text-center font-black text-red-500">
            {row.__absent}
          </td>

          <td className="p-3 text-center font-black text-amber-500">
            {row.__late}
          </td>

          <td className="p-3 text-center">
            <span
              className={`px-3 py-1 rounded-full text-xs font-black border ${
                getRateTone(row.__rate) === "success"
                  ? "bg-transparent text-emerald-500 border-emerald-500"
                  : getRateTone(row.__rate) === "warning"
                  ? "bg-transparent text-amber-500 border-amber-500"
                  : "bg-transparent text-red-500 border-red-500"
              }`}
            >
              {row.__rate || 0}%
            </span>
          </td>

          <td className="p-3 text-center">
            <Link to={`/admin-panel/reports/doctor/${row.doctorId}`}>
              <button type="button" className={iconButton}>
                <Eye size={16} className={iconColors.view} />
              </button>
            </Link>
          </td>
        </tr>
      )
    }

    if (loadingAttendanceSummary || loadingGetReportsAttend) {
      return (
        <LoadingGetData
          text={
            currentLang === "ar"
              ? "جاري تحميل تحليلات الحضور..."
              : "Loading attendance analytics..."
          }
        />
      )
    }

    if (attendanceSummaryError || getReportsAttendError) {
      return (
        <ErrorBox
          icon={ShieldAlert}
          title={
            currentLang === "ar"
              ? "تعذر تحميل تحليلات الحضور"
              : "Failed to load attendance analytics"
          }
          message={
            attendanceSummaryError?.message || getReportsAttendError?.message || "-"
          }
        />
      )
    }

    return (
      <div className="space-y-6">
        <div className={`${theme.card} p-6`}>
          <div className="flex items-center gap-3 mb-5">
            <HeaderIcon
              icon={ShieldAlert}
              bgClass={iconBg.problems}
              iconClass={iconColors.problems}
            />

            <div>
              <h2 className="text-2xl font-black text-[var(--color-text)]">
                {currentLang === "ar"
                  ? "تحليل مشاكل الحضور"
                  : "Attendance Problems Analytics"}
              </h2>

              <p className="text-sm font-semibold text-[var(--color-text-muted)]">
                {currentLang === "ar"
                  ? "ملخص سريع لأكثر الأطباء والأقسام احتياجًا للمتابعة."
                  : "Quick view of doctors and departments that need attention."}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
            <SummaryCard
              icon={Users}
              title={currentLang === "ar" ? "الأطباء" : "Doctors"}
              value={totalDoctors}
              tone="doctors"
            />

            <SummaryCard
              icon={Calendar}
              title={currentLang === "ar" ? "أيام مجدولة" : "Scheduled Days"}
              value={totalScheduled}
              tone="records"
            />

            <SummaryCard
              icon={CheckCircle}
              title={currentLang === "ar" ? "أيام حضور" : "Worked Days"}
              value={totalWorked}
              tone="start"
            />

            <SummaryCard
              icon={XCircle}
              title={currentLang === "ar" ? "غياب" : "Absent"}
              value={totalAbsent}
              tone="danger"
            />

            <SummaryCard
              icon={Clock}
              title={currentLang === "ar" ? "تأخير" : "Late"}
              value={totalLate}
              tone="warning"
            />

            <SummaryCard
              icon={TrendingUp}
              title={currentLang === "ar" ? "نسبة الحضور" : "Attendance Rate"}
              value={`${attendanceRate ?? 0}%`}
              tone={
                Number(attendanceRate || 0) >= 85
                  ? "start"
                  : Number(attendanceRate || 0) >= 65
                  ? "warning"
                  : "danger"
              }
            />
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div className={`${theme.card} p-6`}>
            <h3 className="text-xl font-black text-[var(--color-text)] mb-4 flex items-center gap-2">
              <Building className="w-5 h-5 shrink-0 text-emerald-500" />
              {currentLang === "ar"
                ? "أداء الأقسام"
                : "Department Performance"}
            </h3>

            {departmentStats.length === 0 ? (
              <p className="text-sm font-bold text-[var(--color-text-muted)]">
                {currentLang === "ar"
                  ? "لا توجد بيانات أقسام"
                  : "No department data"}
              </p>
            ) : (
              <div className="space-y-3">
                {departmentStats.slice(0, 8).map((item, index) => {
                  const rate = Number(item.attendanceRate || 0)
                  const tone = getRateTone(rate)

                  return (
                    <div
                      key={item.departmentId || index}
                      className={`${theme.cardSoft} p-4 border border-[var(--color-border)]`}
                    >
                      <div className="flex items-center justify-between gap-3 mb-2">
                        <p className="font-black text-[var(--color-text)]">
                          {currentLang === "ar"
                            ? item.departmentNameAr
                            : item.departmentNameEn}
                        </p>

                        <span
                          className={`px-3 py-1 rounded-full text-xs font-black border ${
                            tone === "success"
                              ? "bg-transparent text-emerald-500 border-emerald-500"
                              : tone === "warning"
                              ? "bg-transparent text-amber-500 border-amber-500"
                              : "bg-transparent text-red-500 border-red-500"
                          }`}
                        >
                          {rate}%
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-2 text-center text-xs">
                        <MiniMetric
                          label={currentLang === "ar" ? "أطباء" : "Doctors"}
                          value={item.doctorCount ?? 0}
                          tone="blue"
                        />
                        <MiniMetric
                          label={currentLang === "ar" ? "غياب" : "Absent"}
                          value={item.totalAbsentDays ?? 0}
                          tone="red"
                        />
                        <MiniMetric
                          label={currentLang === "ar" ? "تأخير" : "Late"}
                          value={item.totalLateDays ?? 0}
                          tone="amber"
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          <div className={`${theme.card} p-6`}>
            <h3 className="text-xl font-black text-[var(--color-text)] mb-4 flex items-center gap-2">
              <GraduationCap className="w-5 h-5 shrink-0 text-orange-500" />
              {currentLang === "ar"
                ? "الأداء حسب الدرجة العلمية"
                : "Performance by Scientific Degree"}
            </h3>

            {degreeStats.length === 0 ? (
              <p className="text-sm font-bold text-[var(--color-text-muted)]">
                {currentLang === "ar"
                  ? "لا توجد بيانات درجات علمية"
                  : "No degree data"}
              </p>
            ) : (
              <div className="space-y-3">
                {degreeStats.slice(0, 8).map((item, index) => {
                  const rate = Number(item.attendanceRate || 0)
                  const tone = getRateTone(rate)

                  return (
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

                      <span
                        className={`px-3 py-1 rounded-full text-xs font-black border ${
                          tone === "success"
                            ? "bg-transparent text-emerald-500 border-emerald-500"
                            : tone === "warning"
                            ? "bg-transparent text-amber-500 border-amber-500"
                            : "bg-transparent text-red-500 border-red-500"
                        }`}
                      >
                        {rate}%
                      </span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        <div className={`${theme.card} overflow-hidden`}>
          <div className="p-5 border-b border-[var(--color-border)]">
            <h3 className="text-xl font-black text-[var(--color-text)] flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              {currentLang === "ar"
                ? "الأطباء الأكثر احتياجًا للمتابعة"
                : "Doctors Requiring Follow-up"}
            </h3>
          </div>

          {riskyRows.length === 0 ? (
            <div className="p-8 text-center">
              <CheckCircle className="w-12 h-12 mx-auto mb-3 text-emerald-500" />
              <p className="font-black text-[var(--color-text)]">
                {currentLang === "ar"
                  ? "لا توجد مشاكل واضحة في الفترة المحددة"
                  : "No obvious attendance problems in the selected period"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px]">
                <thead className="bg-[var(--color-surface-muted)]">
                  <tr className="border-b border-[var(--color-border-strong)]">
                    <th
                      className={`p-3 text-sm font-black text-[var(--color-text)] text-${
                        isRTL ? "right" : "left"
                      }`}
                    >
                      {currentLang === "ar" ? "الدكتور" : "Doctor"}
                    </th>

                    <th className="p-3 text-center text-sm font-black text-[var(--color-text)]">
                      {currentLang === "ar" ? "مجدول" : "Scheduled"}
                    </th>

                    <th className="p-3 text-center text-sm font-black text-[var(--color-text)]">
                      {currentLang === "ar" ? "حضور" : "Worked"}
                    </th>

                    <th className="p-3 text-center text-sm font-black text-[var(--color-text)]">
                      {currentLang === "ar" ? "غياب" : "Absent"}
                    </th>

                    <th className="p-3 text-center text-sm font-black text-[var(--color-text)]">
                      {currentLang === "ar" ? "تأخير" : "Late"}
                    </th>

                    <th className="p-3 text-center text-sm font-black text-[var(--color-text)]">
                      {currentLang === "ar" ? "النسبة" : "Rate"}
                    </th>

                    <th className="p-3 text-center text-sm font-black text-[var(--color-text)]">
                      {currentLang === "ar" ? "عرض" : "View"}
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {riskyRows.slice(0, 30).map((row, index) => (
                    <ProblemRow
                      key={`${row.doctorId || index}-${index}`}
                      row={row}
                      index={index}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
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
                {reportRows.length > 0 && (
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

        <FilterPanel />

        {loadingGetReports ? (
          <LoadingGetData text={t("reports.loading") || "Loading reports..."} />
        ) : scheduleError ? (
          <ErrorBox
            icon={FileText}
            title={
              currentLang === "ar"
                ? "تعذر تحميل التقارير"
                : "Failed to load reports"
            }
            message={scheduleError?.message}
          />
        ) : (
          <>
            <ReportSummaryHeader />

            {viewMode === "scheduleRows" && <ScheduleRowsView />}

            {viewMode === "scheduleCalendar" && <ScheduleCalendarView />}

            {viewMode === "attendanceSummary" && <AttendanceSummaryView />}

            {viewMode === "attendanceMatrix" && <AttendanceMatrixView />}

            {viewMode === "problemsAnalytics" && <AttendanceAnalyticsView />}
          </>
        )}
      </div>
    </div>
  )
}

export default Reports