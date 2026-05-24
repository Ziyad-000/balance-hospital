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

  const iconColors = {
    calendar: "text-blue-700 dark:text-blue-300",
    filter: "text-blue-700 dark:text-blue-300",
    view: "text-blue-700 dark:text-blue-300",
    users: "text-blue-700 dark:text-blue-300",
    building: "text-green-700 dark:text-green-300",
    briefcase: "text-purple-700 dark:text-purple-300",
    degree: "text-orange-700 dark:text-orange-300",
    user: "text-blue-700 dark:text-blue-300",
    phone: "text-green-700 dark:text-green-300",
    hash: "text-slate-700 dark:text-slate-300",
    id: "text-cyan-700 dark:text-cyan-300",
    file: "text-slate-700 dark:text-slate-300",
    refresh: "text-slate-700 dark:text-slate-300",
    danger: "text-red-700 dark:text-red-300",
    success: "text-green-700 dark:text-green-300",
    warning: "text-yellow-700 dark:text-yellow-300",
    muted: "text-slate-600 dark:text-slate-300",
    chart: "text-blue-700 dark:text-blue-300",
    activity: "text-purple-700 dark:text-purple-300",
  }

  const iconBg = {
    calendar: "bg-blue-100 dark:bg-blue-900/50",
    filter: "bg-blue-100 dark:bg-blue-900/50",
    view: "bg-blue-100 dark:bg-blue-900/50",
    users: "bg-blue-100 dark:bg-blue-900/50",
    building: "bg-green-100 dark:bg-green-900/50",
    briefcase: "bg-purple-100 dark:bg-purple-900/50",
    degree: "bg-orange-100 dark:bg-orange-900/50",
    user: "bg-blue-100 dark:bg-blue-900/50",
    phone: "bg-green-100 dark:bg-green-900/50",
    hash: "bg-slate-100 dark:bg-slate-800/80",
    id: "bg-cyan-100 dark:bg-cyan-900/50",
    file: "bg-slate-100 dark:bg-slate-800/80",
    refresh: "bg-slate-100 dark:bg-slate-800/80",
    danger: "bg-red-100 dark:bg-red-900/50",
    success: "bg-green-100 dark:bg-green-900/50",
    warning: "bg-yellow-100 dark:bg-yellow-900/50",
    chart: "bg-blue-100 dark:bg-blue-900/50",
    activity: "bg-purple-100 dark:bg-purple-900/50",
  }

  const shiftPalette = [
    {
      bg: "bg-blue-100 dark:bg-blue-900/50",
      border: "border-blue-300 dark:border-blue-700",
      text: "text-blue-800 dark:text-blue-200",
      badge: "bg-blue-700 dark:bg-blue-500",
      ring: "ring-blue-300 dark:ring-blue-700",
    },
    {
      bg: "bg-green-100 dark:bg-green-900/50",
      border: "border-green-300 dark:border-green-700",
      text: "text-green-800 dark:text-green-200",
      badge: "bg-green-700 dark:bg-green-500",
      ring: "ring-green-300 dark:ring-green-700",
    },
    {
      bg: "bg-purple-100 dark:bg-purple-900/50",
      border: "border-purple-300 dark:border-purple-700",
      text: "text-purple-800 dark:text-purple-200",
      badge: "bg-purple-700 dark:bg-purple-500",
      ring: "ring-purple-300 dark:ring-purple-700",
    },
    {
      bg: "bg-orange-100 dark:bg-orange-900/50",
      border: "border-orange-300 dark:border-orange-700",
      text: "text-orange-800 dark:text-orange-200",
      badge: "bg-orange-700 dark:bg-orange-500",
      ring: "ring-orange-300 dark:ring-orange-700",
    },
    {
      bg: "bg-cyan-100 dark:bg-cyan-900/50",
      border: "border-cyan-300 dark:border-cyan-700",
      text: "text-cyan-800 dark:text-cyan-200",
      badge: "bg-cyan-700 dark:bg-cyan-500",
      ring: "ring-cyan-300 dark:ring-cyan-700",
    },
    {
      bg: "bg-pink-100 dark:bg-pink-900/50",
      border: "border-pink-300 dark:border-pink-700",
      text: "text-pink-800 dark:text-pink-200",
      badge: "bg-pink-700 dark:bg-pink-500",
      ring: "ring-pink-300 dark:ring-pink-700",
    },
    {
      bg: "bg-indigo-100 dark:bg-indigo-900/50",
      border: "border-indigo-300 dark:border-indigo-700",
      text: "text-indigo-800 dark:text-indigo-200",
      badge: "bg-indigo-700 dark:bg-indigo-500",
      ring: "ring-indigo-300 dark:ring-indigo-700",
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

  const inputClass =
    "w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-soft)] focus:border-[var(--color-primary)] transition-colors"

  const labelClass =
    "block text-xs font-bold text-[var(--color-text)] mb-1.5"

  const HeaderIcon = ({ icon: Icon, bgClass, iconClass }) => (
    <div
      className={`w-9 h-9 rounded-xl flex items-center justify-center ${bgClass}`}
    >
      <Icon className={`w-5 h-5 ${iconClass}`} />
    </div>
  )

  const SummaryCard = ({ title, value, tone, icon: Icon }) => {
    const toneMap = {
      doctors: {
        bg: iconBg.users,
        icon: iconColors.users,
        text: "text-blue-700 dark:text-blue-300",
      },
      records: {
        bg: iconBg.briefcase,
        icon: iconColors.briefcase,
        text: "text-purple-700 dark:text-purple-300",
      },
      start: {
        bg: iconBg.success,
        icon: iconColors.success,
        text: "text-green-700 dark:text-green-300",
      },
      end: {
        bg: iconBg.degree,
        icon: iconColors.degree,
        text: "text-orange-700 dark:text-orange-300",
      },
      danger: {
        bg: iconBg.danger,
        icon: iconColors.danger,
        text: "text-red-700 dark:text-red-300",
      },
      warning: {
        bg: iconBg.warning,
        icon: iconColors.warning,
        text: "text-yellow-700 dark:text-yellow-300",
      },
      chart: {
        bg: iconBg.chart,
        icon: iconColors.chart,
        text: "text-blue-700 dark:text-blue-300",
      },
      activity: {
        bg: iconBg.activity,
        icon: iconColors.activity,
        text: "text-purple-700 dark:text-purple-300",
      },
    }

    const selectedTone = toneMap[tone] || toneMap.doctors

    return (
      <div className={`${theme.cardSoft} p-4`}>
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm text-[var(--color-text-muted)]">{title}</p>
            <p className={`text-2xl font-bold ${selectedTone.text}`}>
              {value ?? 0}
            </p>
          </div>

          <div className={`p-3 rounded-xl ${selectedTone.bg}`}>
            <Icon className={`w-5 h-5 ${selectedTone.icon}`} />
          </div>
        </div>
      </div>
    )
  }

  const DoctorMeta = ({ icon: Icon, iconClass, children }) => (
    <span className="inline-flex items-center gap-1">
      <Icon size={14} className={iconClass} />
      {children}
    </span>
  )

  const ScheduleShiftCell = ({ row, shift, day, compact = false }) => {
    if (!shift) {
      return (
        <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-[var(--color-bg-soft)] text-slate-500 dark:text-slate-300 border border-[var(--color-border)]">
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
      `${currentLang === "ar" ? "رقم القسم" : "Department ID"}: ${
        shift.departmentId
      }`,
    ].join("\n")

    if (compact) {
      return (
        <div
          title={title}
          className={`mx-auto inline-flex items-center justify-center rounded-xl border shadow-sm hover:shadow-md hover:scale-105 transition-all cursor-help ring-1 ${shiftTone.bg} ${shiftTone.border} ${shiftTone.ring}`}
        >
          <span
            className={`inline-flex items-center justify-center min-w-[46px] px-3 py-2 rounded-xl text-xs font-extrabold text-white ${shiftTone.badge}`}
          >
            {shift.code}
          </span>
        </div>
      )
    }

    return (
      <div
        title={title}
        className={`w-full rounded-2xl border shadow-sm hover:shadow-md transition-all cursor-help ring-1 ${shiftTone.bg} ${shiftTone.border} ${shiftTone.ring} p-3 min-h-[118px]`}
      >
        <div className="flex items-start justify-between gap-2 mb-3">
          <span
            className={`inline-flex items-center justify-center min-w-12 px-3 py-1.5 rounded-xl text-xs font-extrabold text-white ${shiftTone.badge}`}
          >
            {shift.code}
          </span>

          <span
            className={`shrink-0 px-2 py-1 rounded-full text-[10px] font-extrabold border ${shiftTone.bg} ${shiftTone.border} ${shiftTone.text}`}
          >
            #{shift.departmentId}
          </span>
        </div>

        <p className={`text-sm font-extrabold leading-5 ${shiftTone.text}`}>
          {getDepartmentName(shift)}
        </p>

        <p className="text-[11px] mt-2 text-[var(--color-text-muted)]">
          {currentLang === "ar" ? "جدول شفتات فقط" : "Schedule only"}
        </p>
      </div>
    )
  }

  const ViewModeButton = ({ mode, icon: Icon, label }) => (
    <button
      type="button"
      onClick={() => setViewMode(mode)}
      className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
        viewMode === mode
          ? "bg-[var(--color-primary)] text-white"
          : "text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg-soft)]"
      }`}
    >
      <Icon size={16} />
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
          <FileText className="w-12 h-12 mx-auto mb-4 text-red-700 dark:text-red-300" />

          <h3 className="text-xl font-bold text-[var(--color-text)]">
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
          <FileText className="w-12 h-12 mx-auto mb-4 text-slate-600 dark:text-slate-300" />

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
            <BarChart3 className="w-6 h-6 text-blue-700 dark:text-blue-300" />

            <h2 className="text-2xl font-bold text-[var(--color-text)]">
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
            <h3 className="text-xl font-bold text-[var(--color-text)] mb-4 flex items-center gap-2">
              <Building className="w-5 h-5 text-green-700 dark:text-green-300" />
              {currentLang === "ar" ? "إحصائيات الأقسام" : "Department Stats"}
            </h3>

            {departmentStats.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[var(--color-surface-muted)]">
                    <tr className="border-b border-[var(--color-border)]">
                      <th
                        className={`p-3 text-sm font-bold text-[var(--color-text)] text-${
                          isRTL ? "right" : "left"
                        }`}
                      >
                        {currentLang === "ar" ? "القسم" : "Department"}
                      </th>

                      <th className="p-3 text-sm font-bold text-[var(--color-text)] text-center">
                        {currentLang === "ar" ? "الأطباء" : "Doctors"}
                      </th>

                      <th className="p-3 text-sm font-bold text-[var(--color-text)] text-center">
                        {currentLang === "ar" ? "الحضور" : "Attendance"}
                      </th>

                      <th className="p-3 text-sm font-bold text-[var(--color-text)] text-center">
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
                        <td className="p-3 text-sm font-bold text-[var(--color-text)]">
                          {currentLang === "ar"
                            ? item.departmentNameAr
                            : item.departmentNameEn}
                        </td>

                        <td className="p-3 text-center text-[var(--color-text-muted)]">
                          {item.doctorCount ?? 0}
                        </td>

                        <td className="p-3 text-center">
                          <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800 border border-green-300 dark:bg-green-900/50 dark:text-green-200 dark:border-green-700">
                            {item.attendanceRate ?? 0}%
                          </span>
                        </td>

                        <td className="p-3 text-center text-[var(--color-text-muted)]">
                          {item.totalLateDays ?? 0}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-[var(--color-text-muted)]">
                {currentLang === "ar"
                  ? "لا توجد إحصائيات أقسام"
                  : "No department stats"}
              </p>
            )}
          </div>

          <div className={`${theme.card} p-6`}>
            <h3 className="text-xl font-bold text-[var(--color-text)] mb-4 flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-orange-700 dark:text-orange-300" />
              {currentLang === "ar"
                ? "إحصائيات الدرجات العلمية"
                : "Degree Stats"}
            </h3>

            {degreeStats.length > 0 ? (
              <div className="space-y-3">
                {degreeStats.map((item, index) => (
                  <div
                    key={item.scientificDegreeId || index}
                    className={`${theme.cardSoft} p-4 flex items-center justify-between gap-4`}
                  >
                    <div>
                      <p className="font-bold text-[var(--color-text)]">
                        {currentLang === "ar"
                          ? item.degreeNameAr
                          : item.degreeNameEn}
                      </p>

                      <p className="text-sm text-[var(--color-text-muted)]">
                        {item.doctorCount ?? 0}{" "}
                        {currentLang === "ar" ? "طبيب" : "doctors"}
                      </p>
                    </div>

                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-300 dark:bg-blue-900/50 dark:text-blue-200 dark:border-blue-700">
                      {item.attendanceRate ?? 0}%
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-[var(--color-text-muted)]">
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
          <Activity className="w-14 h-14 mx-auto mb-4 text-red-700 dark:text-red-300" />

          <h3 className="text-xl font-bold text-[var(--color-text)] mb-2">
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
          <Activity className="w-14 h-14 mx-auto mb-4 text-blue-700 dark:text-blue-300" />

          <h3 className="text-xl font-bold text-[var(--color-text)] mb-2">
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
          <Activity className="w-6 h-6 text-purple-700 dark:text-purple-300" />

          <div>
            <h2 className="text-2xl font-bold text-[var(--color-text)]">
              {currentLang === "ar"
                ? "تقرير الحضور الشهري"
                : "Monthly Attendance Matrix"}
            </h2>

            <p className="text-sm text-[var(--color-text-muted)]">
              {currentLang === "ar"
                ? "عرض عام للبيانات الراجعة من endpoint الحضور الشهري"
                : "General view of rows returned from the monthly attendance endpoint"}
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[var(--color-surface-muted)]">
              <tr className="border-b border-[var(--color-border)]">
                <th
                  className={`p-3 text-sm font-bold text-[var(--color-text)] text-${
                    isRTL ? "right" : "left"
                  }`}
                >
                  {currentLang === "ar" ? "الطبيب" : "Doctor"}
                </th>

                <th
                  className={`p-3 text-sm font-bold text-[var(--color-text)] text-${
                    isRTL ? "right" : "left"
                  }`}
                >
                  {currentLang === "ar" ? "القسم" : "Department"}
                </th>

                <th className="p-3 text-sm font-bold text-[var(--color-text)] text-center">
                  {currentLang === "ar" ? "أيام مجدولة" : "Scheduled"}
                </th>

                <th className="p-3 text-sm font-bold text-[var(--color-text)] text-center">
                  {currentLang === "ar" ? "حضور" : "Worked"}
                </th>

                <th className="p-3 text-sm font-bold text-[var(--color-text)] text-center">
                  {currentLang === "ar" ? "غياب" : "Absent"}
                </th>

                <th className="p-3 text-sm font-bold text-[var(--color-text)] text-center">
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
                  <td className="p-3 text-sm font-bold text-[var(--color-text)]">
                    {currentLang === "ar"
                      ? row.doctorNameAr || row.doctorName
                      : row.doctorNameEn || row.doctorName}
                  </td>

                  <td className="p-3 text-sm text-[var(--color-text-muted)]">
                    {currentLang === "ar"
                      ? row.departmentNameAr || row.departmentAr
                      : row.departmentNameEn || row.departmentEn}
                  </td>

                  <td className="p-3 text-center text-[var(--color-text-muted)]">
                    {row.totalScheduledDays ?? row.scheduledDays ?? "-"}
                  </td>

                  <td className="p-3 text-center text-green-700 dark:text-green-300 font-bold">
                    {row.totalWorkedDays ?? row.workedDays ?? "-"}
                  </td>

                  <td className="p-3 text-center text-red-700 dark:text-red-300 font-bold">
                    {row.totalAbsentDays ?? row.absentDays ?? "-"}
                  </td>

                  <td className="p-3 text-center">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-300 dark:bg-blue-900/50 dark:text-blue-200 dark:border-blue-700">
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
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-700 to-purple-700 dark:from-blue-300 dark:to-purple-300 bg-clip-text text-transparent pb-1">
                  {t("reports.title") || "Monthly Reports"}
                </h1>

                <p className="mt-1 text-sm text-[var(--color-text-muted)]">
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

            <h2 className="text-xl font-bold text-[var(--color-text)]">
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
                  className={`inline ${isRTL ? "ml-1" : "mr-1"} ${
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
                  className={`inline ${isRTL ? "ml-1" : "mr-1"} ${
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
                  className={`inline ${isRTL ? "ml-1" : "mr-1"} ${
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
                  className={`inline ${isRTL ? "ml-1" : "mr-1"} ${
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
                    className="px-2 py-1 text-xs rounded-lg bg-[var(--color-bg-soft)] text-[var(--color-text)] border border-[var(--color-border)] hover:bg-[var(--color-surface-muted)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {t("categories.pagination.previous") || "Previous"}
                  </button>

                  <span className="text-xs text-[var(--color-text-muted)]">
                    {doctorPage}/{usersPagination.totalPages}
                  </span>

                  <button
                    type="button"
                    onClick={() => handleDoctorPageChange(doctorPage + 1)}
                    disabled={
                      usersPagination.totalPages === doctorPage || loading?.list
                    }
                    className="px-2 py-1 text-xs rounded-lg bg-[var(--color-bg-soft)] text-[var(--color-text)] border border-[var(--color-border)] hover:bg-[var(--color-surface-muted)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
                  className={`inline ${isRTL ? "ml-1" : "mr-1"} ${
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
                  className={`inline ${isRTL ? "ml-1" : "mr-1"} ${
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

          <div className={`${theme.cardSoft} mt-4 p-4`}>
            <div className="flex items-center gap-2 mb-3">
              <HeaderIcon
                icon={Calendar}
                bgClass={iconBg.calendar}
                iconClass={iconColors.calendar}
              />

              <h3 className="text-base font-bold text-[var(--color-text)]">
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
                  className="w-full sm:w-auto px-5 py-2 rounded-lg text-sm font-semibold transition-all transform hover:scale-105 active:scale-95 shadow-md bg-blue-600 hover:bg-blue-700 text-white focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
                >
                  <span className="flex items-center justify-center gap-2">
                    <Filter className="w-4 h-4" />
                    {t("reports.applyDateRange") || "Apply"}
                  </span>
                </button>
              </div>
            </div>

            {dateRangeError && (
              <div className="mt-3 p-3 bg-[var(--color-danger-soft)] border border-[var(--color-danger)]/20 rounded-lg">
                <p className="text-[var(--color-danger)] text-sm">
                  {dateRangeError}
                </p>
              </div>
            )}

            {hasDateRangeFilter && (
              <div className="mt-3 flex flex-col sm:flex-row sm:items-center gap-3 p-3 bg-[var(--color-info-soft)] border border-[var(--color-info)]/20 rounded-lg">
                <p className="text-[var(--color-info)] text-sm flex-1">
                  {t("reports.showingDays") || "Showing days"}:{" "}
                  {appliedDateRange.startDay} - {appliedDateRange.endDay}
                </p>

                <button
                  type="button"
                  onClick={resetDateRange}
                  className={theme.secondaryButton}
                >
                  <RefreshCw className="w-4 h-4" />
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
              className={`w-20 h-20 ${iconBg.danger} rounded-full flex items-center justify-center mx-auto mb-6`}
            >
              <FileText className={`w-10 h-10 ${iconColors.danger}`} />
            </div>

            <h3 className="text-2xl font-bold text-[var(--color-text)] mb-4">
              {t("reports.error") || "Error Loading Reports"}
            </h3>

            <p className="text-[var(--color-text-muted)] mb-8 text-lg">
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

            <h3 className="text-2xl font-bold text-[var(--color-text)] mb-4">
              {t("reports.noData") || "No Reports Found"}
            </h3>

            <p className="text-[var(--color-text-muted)] text-lg">
              {t("reports.noDataDescription") ||
                "No reports available for the selected filters."}
            </p>
          </div>
        ) : (
          <>
            <div className={`${theme.card} p-5 mb-5`}>
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-5">
                <div>
                  <h2 className="text-2xl font-bold text-[var(--color-text)]">
                    {reports.monthName} {reports.year}
                  </h2>

                  <p className="text-sm text-[var(--color-text-muted)] mt-1">
                    {t("reports.summary") || "Report Summary"}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <span className="px-3 py-1 rounded-full text-sm font-semibold bg-[var(--color-primary-soft)] text-[var(--color-primary)] border border-[var(--color-primary)]/20">
                    {filters.page} / {totalPages || 1}
                  </span>

                  <div className="flex items-center gap-2 bg-[var(--color-surface-muted)] border border-[var(--color-border)] rounded-xl p-1 flex-wrap">
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
                    style={{ width: "620px" }}
                  >
                    <table className="w-full table-fixed">
                      <thead className="bg-[var(--color-surface-muted)]">
                        <tr className="border-b border-[var(--color-border)] h-[58px]">
                          <th
                            className={`px-4 py-3 text-${
                              currentLang === "ar" ? "right" : "left"
                            } text-xs font-bold text-[var(--color-text)] uppercase tracking-wider`}
                            style={{ width: "260px" }}
                          >
                            {t("reports.table.doctor") || "Doctor"}
                          </th>

                          <th
                            className={`px-4 py-3 text-${
                              currentLang === "ar" ? "right" : "left"
                            } text-xs font-bold text-[var(--color-text)] uppercase tracking-wider`}
                            style={{ width: "145px" }}
                          >
                            {t("reports.table.category") || "Category"}
                          </th>

                          <th
                            className={`px-4 py-3 text-${
                              currentLang === "ar" ? "right" : "left"
                            } text-xs font-bold text-[var(--color-text)] uppercase tracking-wider`}
                            style={{ width: "145px" }}
                          >
                            {t("reports.table.department") || "Department"}
                          </th>

                          <th
                            className="px-3 py-3 text-center text-xs font-bold text-[var(--color-text)] uppercase tracking-wider"
                            style={{ width: "70px" }}
                          >
                            {t("categories.table.actions") || "View"}
                          </th>
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-[var(--color-border)]">
                        {reports.rows.map((row, index) => (
                          <tr
                            key={`fixed-${row.doctorId}-${index}`}
                            className={`${theme.hoverRow} h-[92px]`}
                          >
                            <td className="px-4 py-3 align-middle">
                              <div className="space-y-1">
                                <div className="text-sm font-extrabold text-[var(--color-text)] leading-5 line-clamp-2">
                                  {getDoctorName(row)}
                                </div>

                                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-[var(--color-text-muted)]">
                                  <span className="inline-flex items-center gap-1">
                                    <Hash
                                      size={12}
                                      className={iconColors.hash}
                                    />
                                    {row.printNumber}
                                  </span>

                                  <span className="inline-flex items-center gap-1">
                                    <Phone
                                      size={12}
                                      className={iconColors.phone}
                                    />
                                    {row.mobile || "-"}
                                  </span>
                                </div>

                                <div className="text-[11px] text-[var(--color-text-muted)] leading-4 line-clamp-1">
                                  {row.nationalId || "-"}
                                </div>
                              </div>
                            </td>

                            <td className="px-4 py-3 align-middle">
                              <div className="text-sm font-bold text-[var(--color-text)] line-clamp-2">
                                {getCategoryName(row)}
                              </div>

                              <div className="text-xs text-[var(--color-text-muted)] mt-1 line-clamp-1">
                                {getScientificDegreeName(row)}
                              </div>
                            </td>

                            <td className="px-4 py-3 align-middle">
                              <div className="text-sm font-bold text-[var(--color-text)] line-clamp-2">
                                {getDepartmentsJoined(row)}
                              </div>

                              <div className="text-xs text-[var(--color-text-muted)] mt-1 line-clamp-1">
                                {getContractingTypeName(row)}
                              </div>
                            </td>

                            <td className="px-3 py-3 align-middle text-center">
                              <Link
                                to={`/admin-panel/reports/doctor/${row.doctorId}`}
                              >
                                <button
                                  type="button"
                                  className="p-2 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-lg transition-colors cursor-pointer"
                                  title={t("categories.actions.view") || "View"}
                                >
                                  <Eye size={17} />
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
                        <tr className="border-b border-[var(--color-border)] h-[58px]">
                          {daysArray.map((day) => (
                            <th
                              key={`day-head-${day}`}
                              className="px-1 py-3 text-center text-xs font-bold text-[var(--color-text)] uppercase tracking-wider whitespace-nowrap"
                              style={{ minWidth: "74px", width: "74px" }}
                            >
                              <div className="flex flex-col items-center">
                                <span className="text-[10px] text-[var(--color-text-muted)]">
                                  {t("reports.table.day") || "Day"}
                                </span>

                                <span className="text-blue-700 dark:text-blue-300 text-sm">
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
                            className={`${theme.hoverRow} h-[92px]`}
                          >
                            {daysArray.map((day) => {
                              const shift = getShiftByDay(row, day)

                              return (
                                <td
                                  key={`day-${row.doctorId}-${index}-${day}`}
                                  className="px-1 py-3 text-center text-xs whitespace-nowrap text-[var(--color-text)] align-middle"
                                  style={{ minWidth: "74px", width: "74px" }}
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
                  <div key={row.doctorId} className={`${theme.card} p-6`}>
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
                      <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-xl ${iconBg.user}`}>
                          <User className={`w-6 h-6 ${iconColors.user}`} />
                        </div>

                        <div>
                          <h3 className="text-xl font-bold text-[var(--color-text)]">
                            {getDoctorName(row)}
                          </h3>

                          <div className="flex flex-wrap gap-3 mt-2 text-sm text-[var(--color-text-muted)]">
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

                          <div className="mt-2 flex flex-wrap gap-2 text-xs text-[var(--color-text-muted)]">
                            <span className="inline-flex items-center gap-1">
                              <BadgeCheck
                                size={14}
                                className={iconColors.users}
                              />
                              {getCategoryName(row)}
                            </span>

                            <span className="inline-flex items-center gap-1">
                              <Building
                                size={14}
                                className={iconColors.building}
                              />
                              {getDepartmentsJoined(row)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <Link to={`/admin-panel/reports/doctor/${row.doctorId}`}>
                        <button
                          type="button"
                          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors"
                        >
                          <Eye size={16} />
                          {t("categories.actions.view") || "View"}
                        </button>
                      </Link>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
                      {daysArray.map((day) => {
                        const shift = getShiftByDay(row, day)

                        return (
                          <div
                            key={`${row.doctorId}-${day}`}
                            className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-muted)] overflow-hidden"
                          >
                            <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-[var(--color-border)] bg-[var(--color-surface)]">
                              <div>
                                <p className="text-xs font-bold text-[var(--color-text-muted)]">
                                  {currentLang === "ar" ? "اليوم" : "Day"}
                                </p>

                                <p className="text-2xl font-extrabold text-blue-700 dark:text-blue-300">
                                  {day}
                                </p>
                              </div>

                              <span className="px-3 py-1 rounded-full text-xs font-bold bg-[var(--color-bg-soft)] text-[var(--color-text-muted)] border border-[var(--color-border)]">
                                {currentLang === "ar"
                                  ? "جدول شفتات"
                                  : "Schedule"}
                              </span>
                            </div>

                            <div className="p-3">
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
                    className="px-4 py-2 rounded-lg border border-[var(--color-border)] text-[var(--color-text)] hover:bg-[var(--color-bg-soft)] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {t("categories.pagination.previous") || "Previous"}
                  </button>

                  <span className="text-sm text-[var(--color-text-muted)]">
                    {filters.page} / {totalPages}
                  </span>

                  <button
                    type="button"
                    onClick={() => handlePageChange(filters.page + 1)}
                    disabled={filters.page >= totalPages}
                    className="px-4 py-2 rounded-lg border border-[var(--color-border)] text-[var(--color-text)] hover:bg-[var(--color-bg-soft)] disabled:opacity-50 disabled:cursor-not-allowed"
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