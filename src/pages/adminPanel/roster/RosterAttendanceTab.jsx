import React, { useEffect, useMemo, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useParams } from "react-router-dom"
import {
  Activity,
  Calendar,
  CheckCircle,
  Clock,
  XCircle,
  Timer,
  AlertCircle,
  User,
  Building,
  BarChart3,
  Grid3X3,
  Rows3,
  TrendingUp,
  ShieldAlert,
  Stethoscope,
  Layers,
  RefreshCw,
  ChevronDown,
  ChevronUp,
} from "lucide-react"

import LoadingGetData from "../../../components/LoadingGetData"
import { getPageTheme } from "../../../utils/themeClasses"

import {
  getRosterAttendanceAnalytics,
  getRosterAbsencePatterns,
  getRosterLatePatterns,
} from "../../../state/act/actRosterManagement"

const safeArray = (value) => {
  if (Array.isArray(value)) return value
  if (Array.isArray(value?.items)) return value.items
  if (Array.isArray(value?.data)) return value.data
  if (Array.isArray(value?.data?.items)) return value.data.items
  if (Array.isArray(value?.rows)) return value.rows
  return []
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

const valueOrDash = (...values) => {
  for (const value of values) {
    if (value !== undefined && value !== null && value !== "") return value
  }

  return "-"
}

const toPercent = (value) => {
  const n = Number(value || 0)
  if (Number.isNaN(n)) return "0%"
  return `${n.toFixed(1)}%`
}

const getToneClasses = (tone = "blue") => {
  const map = {
    blue: {
      text: "text-blue-500",
      border: "border-blue-500",
      soft: "bg-blue-500/10",
    },
    green: {
      text: "text-emerald-500",
      border: "border-emerald-500",
      soft: "bg-emerald-500/10",
    },
    yellow: {
      text: "text-amber-500",
      border: "border-amber-500",
      soft: "bg-amber-500/10",
    },
    orange: {
      text: "text-orange-500",
      border: "border-orange-500",
      soft: "bg-orange-500/10",
    },
    red: {
      text: "text-red-500",
      border: "border-red-500",
      soft: "bg-red-500/10",
    },
    purple: {
      text: "text-violet-500",
      border: "border-violet-500",
      soft: "bg-violet-500/10",
    },
    slate: {
      text: "text-slate-500",
      border: "border-slate-500",
      soft: "bg-slate-500/10",
    },
  }

  return map[tone] || map.blue
}

const getRiskTone = (value) => {
  const normalized = String(value || "").toLowerCase()

  if (
    normalized.includes("critical") ||
    normalized.includes("high") ||
    normalized.includes("حرج") ||
    normalized.includes("عالي")
  ) {
    return "red"
  }

  if (
    normalized.includes("medium") ||
    normalized.includes("warning") ||
    normalized.includes("متوسط") ||
    normalized.includes("تحذير")
  ) {
    return "yellow"
  }

  if (
    normalized.includes("low") ||
    normalized.includes("good") ||
    normalized.includes("منخفض")
  ) {
    return "green"
  }

  return "blue"
}

function RosterAttendanceTab({
  report,
  summary,
  loading,
  error,
  currentLang = "ar",
  isRTL = true,
}) {
  const theme = getPageTheme()
  const dispatch = useDispatch()
  const { rosterId } = useParams()

  const [viewMode, setViewMode] = useState("rows")
  const [showInsights, setShowInsights] = useState(true)

  const {
    attendanceAnalytics,
    absencePatterns,
    latePatterns,
    loading: rosterLoading,
    errors: rosterErrors,
  } = useSelector((state) => state.rosterManagement)

  const rows = report?.rows || []
  const daysInMonth = report?.daysInMonth || 31
  const daysArray = Array.from({ length: daysInMonth }, (_, index) => index + 1)

  const analyticsStartDate =
    report?.startDate ||
    report?.fromDate ||
    report?.periodStart ||
    report?.monthStartDate ||
    null

  const analyticsEndDate =
    report?.endDate ||
    report?.toDate ||
    report?.periodEnd ||
    report?.monthEndDate ||
    null

  const viewButtonBase =
    "inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-extrabold border transition-colors"

  const viewButtonActive =
    "bg-[var(--color-success)] text-white border-emerald-500 shadow-sm"

  const viewButtonInactive =
    "bg-[var(--color-surface)] text-[var(--color-text)] border-[var(--color-border-strong)] hover:bg-[var(--color-success)] hover:text-white hover:border-emerald-500"

  const totals = useMemo(() => {
    const base = {
      doctors: rows.length,
      scheduledDays: 0,
      workedDays: 0,
      absentDays: 0,
      lateDays: 0,
      earlyDays: 0,
      actualHours: 0,
      scheduledHours: 0,
    }

    rows.forEach((row) => {
      base.scheduledDays += Number(row.totalScheduledDays || 0)
      base.workedDays += Number(row.daysWorked || row.totalWorkedDays || 0)
      base.absentDays += Number(row.daysAbsent || row.totalAbsentDays || 0)
      base.lateDays += Number(row.daysLate || row.totalLateDays || 0)
      base.earlyDays += Number(row.daysEarlyCheckout || 0)
      base.actualHours += Number(row.totalActualHours || 0)
      base.scheduledHours += Number(row.totalScheduledHours || 0)
    })

    const attendanceRate =
      base.scheduledDays > 0
        ? ((base.workedDays / base.scheduledDays) * 100).toFixed(2)
        : 0

    const absenceRate =
      base.scheduledDays > 0
        ? ((base.absentDays / base.scheduledDays) * 100).toFixed(2)
        : 0

    const lateRate =
      base.scheduledDays > 0
        ? ((base.lateDays / base.scheduledDays) * 100).toFixed(2)
        : 0

    return {
      ...base,
      attendanceRate,
      absenceRate,
      lateRate,
    }
  }, [rows])

  const absenceList = useMemo(() => safeArray(absencePatterns), [absencePatterns])

  const lateDoctorsList = useMemo(() => {
    const list = safeArray(latePatterns)
    if (list.length) return list

    const possibleLists = [
      latePatterns?.topLateDoctors,
      latePatterns?.lateDoctors,
      latePatterns?.doctors,
      latePatterns?.patterns,
    ]

    for (const item of possibleLists) {
      const arr = safeArray(item)
      if (arr.length) return arr
    }

    return []
  }, [latePatterns])

  const lateDaysEntries = useMemo(() => {
    const source =
      latePatterns?.mostLateDays ||
      latePatterns?.lateDays ||
      latePatterns?.daysDistribution ||
      {}

    return Object.entries(source || {})
  }, [latePatterns])

  const lateShiftsEntries = useMemo(() => {
    const source =
      latePatterns?.mostLateShifts ||
      latePatterns?.lateShifts ||
      latePatterns?.shiftsDistribution ||
      {}

    return Object.entries(source || {})
  }, [latePatterns])

  const lateDepartmentsEntries = useMemo(() => {
    const source =
      latePatterns?.mostLateDepartments ||
      latePatterns?.lateDepartments ||
      latePatterns?.departmentsDistribution ||
      {}

    return Object.entries(source || {})
  }, [latePatterns])

  const analyticsSummary = attendanceAnalytics || {}

  const insightLoading =
    rosterLoading?.attendanceAnalytics ||
    rosterLoading?.absencePatterns ||
    rosterLoading?.latePatterns

  const insightError =
    rosterErrors?.attendanceAnalytics ||
    rosterErrors?.absencePatterns ||
    rosterErrors?.latePatterns

  const getAnalyticsRange = () => {
    const fallbackStart = report?.year && report?.month
      ? `${report.year}-${String(report.month).padStart(2, "0")}-01`
      : null

    const fallbackEnd = report?.year && report?.month
      ? `${report.year}-${String(report.month).padStart(2, "0")}-${String(daysInMonth).padStart(2, "0")}`
      : null

    return {
      startDate: analyticsStartDate || fallbackStart,
      endDate: analyticsEndDate || fallbackEnd,
    }
  }

  const loadInsights = () => {
    if (!rosterId) return

    const { startDate, endDate } = getAnalyticsRange()

    if (startDate && endDate) {
      dispatch(
        getRosterAttendanceAnalytics({
          rosterId,
          startDate,
          endDate,
        })
      )
    }

    dispatch(
      getRosterAbsencePatterns({
        rosterId,
        minAbsences: 3,
      })
    )

    dispatch(
      getRosterLatePatterns({
        rosterId,
        minLateCount: 3,
      })
    )
  }

  useEffect(() => {
    if (!rosterId || !rows.length) return
    loadInsights()
  }, [rosterId, rows.length])

  const getDoctorName = (row) =>
    currentLang === "ar"
      ? row.doctorNameAr || row.doctorNameEn
      : row.doctorNameEn || row.doctorNameAr

  const getDepartmentName = (row) =>
    currentLang === "ar"
      ? row.departmentNameAr || row.departmentNameEn
      : row.departmentNameEn || row.departmentNameAr

  const getDailyAttendance = (row) => {
    return row?.dailyAttendance || row?.days || row?.dailyAttendanceList || {}
  }

  const getDayAttendance = (row, day) => {
    const daily = getDailyAttendance(row)
    return daily?.[day] || daily?.[String(day)] || null
  }

  const formatTime = (value) => {
    if (!value) return "-"
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return "-"
    return date.toLocaleTimeString(currentLang, {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getStatusTone = (status) => {
    const value = String(status || "").toLowerCase()

    if (
      value.includes("ontime") ||
      value.includes("present") ||
      value.includes("worked")
    ) {
      return {
        label: currentLang === "ar" ? "حاضر" : "Present",
        bg: "bg-transparent dark:bg-transparent",
        text: "text-emerald-500 dark:text-emerald-500",
        border: "border-emerald-500 dark:border-emerald-500",
        ring: "shadow-[0_0_0_1px_rgba(16,185,129,0.25)]",
      }
    }

    if (value.includes("late")) {
      return {
        label: currentLang === "ar" ? "متأخر" : "Late",
        bg: "bg-transparent dark:bg-transparent",
        text: "text-amber-500 dark:text-amber-500",
        border: "border-amber-500 dark:border-amber-500",
        ring: "shadow-[0_0_0_1px_rgba(245,158,11,0.25)]",
      }
    }

    if (value.includes("absent")) {
      return {
        label: currentLang === "ar" ? "غائب" : "Absent",
        bg: "bg-transparent dark:bg-transparent",
        text: "text-red-500 dark:text-red-500",
        border: "border-red-500 dark:border-red-500",
        ring: "shadow-[0_0_0_1px_rgba(239,68,68,0.25)]",
      }
    }

    if (value.includes("early")) {
      return {
        label: currentLang === "ar" ? "خروج مبكر" : "Early",
        bg: "bg-transparent dark:bg-transparent",
        text: "text-orange-500 dark:text-orange-500",
        border: "border-orange-500 dark:border-orange-500",
        ring: "shadow-[0_0_0_1px_rgba(249,115,22,0.25)]",
      }
    }

    if (value.includes("exception") || value.includes("excused")) {
      return {
        label: currentLang === "ar" ? "استثناء" : "Exception",
        bg: "bg-transparent dark:bg-transparent",
        text: "text-violet-500 dark:text-violet-500",
        border: "border-violet-500 dark:border-violet-500",
        ring: "shadow-[0_0_0_1px_rgba(139,92,246,0.25)]",
      }
    }

    return {
      label: currentLang === "ar" ? "لا يوجد" : "No Record",
      bg: "bg-transparent dark:bg-transparent",
      text: "text-slate-500 dark:text-slate-500",
      border: "border-slate-500 dark:border-slate-500",
      ring: "shadow-[0_0_0_1px_rgba(100,116,139,0.18)]",
    }
  }

  const buildDayTitle = (row, day, attendance) => {
    if (!attendance) {
      return [
        `${currentLang === "ar" ? "اليوم" : "Day"}: ${day}`,
        `${currentLang === "ar" ? "الطبيب" : "Doctor"}: ${getDoctorName(row)}`,
        `${currentLang === "ar" ? "لا توجد بيانات حضور" : "No attendance data"}`,
      ].join("\n")
    }

    return [
      `${currentLang === "ar" ? "اليوم" : "Day"}: ${day}`,
      `${currentLang === "ar" ? "الطبيب" : "Doctor"}: ${getDoctorName(row)}`,
      `${currentLang === "ar" ? "القسم" : "Department"}: ${getDepartmentName(row)}`,
      `${currentLang === "ar" ? "الحالة" : "Status"}: ${attendance.status || "-"}`,
      `${currentLang === "ar" ? "دخول" : "In"}: ${formatTime(attendance.timeIn)}`,
      `${currentLang === "ar" ? "خروج" : "Out"}: ${formatTime(attendance.timeOut)}`,
      `${currentLang === "ar" ? "ساعات مجدولة" : "Scheduled Hours"}: ${
        attendance.scheduledHours ?? "-"
      }`,
      `${currentLang === "ar" ? "ساعات فعلية" : "Actual Hours"}: ${
        attendance.actualHours ?? "-"
      }`,
      `${currentLang === "ar" ? "تأخير" : "Late Minutes"}: ${
        attendance.lateMinutes ?? 0
      }`,
      `${currentLang === "ar" ? "خروج مبكر" : "Early Checkout"}: ${
        attendance.earlyCheckoutMinutes ?? 0
      }`,
      `${currentLang === "ar" ? "التحقق" : "Verification"}: ${
        attendance.verificationStatus || "-"
      }`,
    ].join("\n")
  }

  const SummaryCard = ({ icon: Icon, title, value, tone }) => {
  const toneClass = getToneClasses(tone)

  return (
    <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-sm min-h-[104px]">
      <div className="flex items-center justify-between gap-4 h-full">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-black text-[var(--color-text)] leading-5 break-words">
            {title}
          </p>

          <p className={`mt-2 text-2xl font-black tracking-tight ${toneClass.text}`}>
            {value ?? 0}
          </p>
        </div>

        <div
          className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border-2 bg-transparent ${toneClass.text} ${toneClass.border}`}
        >
          <Icon className="w-5 h-5 shrink-0" />
        </div>
      </div>
    </div>
  )
}

  const AttendanceStatusCell = ({ row, day }) => {
    const attendance = getDayAttendance(row, day)
    const tone = getStatusTone(attendance?.status)
    const code = attendance?.displayCode || attendance?.code || "-"

    return (
      <div
        title={buildDayTitle(row, day, attendance)}
        className={`mx-auto min-w-10 h-10 px-2 rounded-2xl border-2 flex items-center justify-center text-sm font-black cursor-help transition-all hover:scale-110 hover:shadow-md ${tone.bg} ${tone.text} ${tone.border} ${tone.ring}`}
      >
        {code}
      </div>
    )
  }

  const LegendBadge = ({ code, label, tone }) => {
    const toneClass = getToneClasses(tone)

    return (
      <span
        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border-2 text-xs font-black shadow-sm bg-transparent ${toneClass.text} ${toneClass.border}`}
      >
        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-white/60 dark:bg-black/20">
          {code}
        </span>
        {label}
      </span>
    )
  }

  if (loading) {
    return (
      <LoadingGetData
        text={
          currentLang === "ar"
            ? "جاري تحميل تقرير حضور الروستر..."
            : "Loading roster attendance..."
        }
      />
    )
  }

  if (error) {
    return (
      <div className={`${theme.card} p-8 text-center`}>
        <AlertCircle className="w-14 h-14 mx-auto mb-4 text-red-500 dark:text-red-500" />
        <h3 className="text-xl font-bold text-[var(--color-text)]">
          {currentLang === "ar"
            ? "تعذر تحميل تقرير الحضور"
            : "Failed to load attendance report"}
        </h3>
        <p className="mt-2 text-[var(--color-text-muted)]">
          {error?.message || String(error)}
        </p>
      </div>
    )
  }

  if (!rows.length) {
    return (
      <div className={`${theme.card} p-8 text-center`}>
        <Activity className="w-14 h-14 mx-auto mb-4 text-blue-500 dark:text-blue-500" />
        <h3 className="text-xl font-bold text-[var(--color-text)]">
          {currentLang === "ar"
            ? "لا توجد بيانات حضور لهذا الروستر"
            : "No attendance data for this roster"}
        </h3>
        <p className="mt-2 text-[var(--color-text-muted)]">
          {currentLang === "ar"
            ? "سيظهر التقرير هنا بعد وجود سجلات حضور مرتبطة بهذا الروستر."
            : "The report will appear here after attendance records exist for this roster."}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className={`${theme.card} p-5`}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-5">
          <div>
            <h2 className="text-2xl font-black text-[var(--color-text)] flex items-center gap-2">
              <Activity className="w-7 h-7 shrink-0 text-violet-500 dark:text-violet-500" />
              {currentLang === "ar" ? "حضور الروستر" : "Roster Attendance"}
            </h2>

            <p className="text-sm font-bold text-[var(--color-text-muted)] mt-1">
              {report?.monthNameAr || report?.monthNameEn} {report?.year}
            </p>
          </div>

          <div className="flex items-center gap-2 bg-[var(--color-surface-muted)] border border-[var(--color-border-strong)] rounded-2xl p-1.5 shadow-sm">
            <button
              type="button"
              onClick={() => setViewMode("rows")}
              className={`${viewButtonBase} ${
                viewMode === "rows" ? viewButtonActive : viewButtonInactive
              }`}
            >
              <Rows3 size={17} className="shrink-0" />
              {currentLang === "ar" ? "صفوف" : "Rows"}
            </button>

            <button
              type="button"
              onClick={() => setViewMode("matrix")}
              className={`${viewButtonBase} ${
                viewMode === "matrix" ? viewButtonActive : viewButtonInactive
              }`}
            >
              <Grid3X3 size={17} className="shrink-0" />
              {currentLang === "ar" ? "مصفوفة" : "Matrix"}
            </button>
          </div>
        </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">          <SummaryCard
            icon={User}
            title={currentLang === "ar" ? "الأطباء" : "Doctors"}
            value={totals.doctors}
            tone="blue"
          />

          <SummaryCard
            icon={Calendar}
            title={currentLang === "ar" ? "أيام مجدولة" : "Scheduled"}
            value={totals.scheduledDays}
            tone="purple"
          />

          <SummaryCard
            icon={CheckCircle}
            title={currentLang === "ar" ? "أيام حضور" : "Worked"}
            value={totals.workedDays}
            tone="green"
          />

          <SummaryCard
            icon={XCircle}
            title={currentLang === "ar" ? "غياب" : "Absent"}
            value={totals.absentDays}
            tone="red"
          />

          <SummaryCard
            icon={Clock}
            title={currentLang === "ar" ? "تأخير" : "Late"}
            value={totals.lateDays}
            tone="yellow"
          />

          <SummaryCard
            icon={Timer}
            title={currentLang === "ar" ? "خروج مبكر" : "Early"}
            value={totals.earlyDays}
            tone="orange"
          />

          <SummaryCard
            icon={BarChart3}
            title={currentLang === "ar" ? "نسبة الحضور" : "Rate"}
            value={`${totals.attendanceRate}%`}
            tone="blue"
          />

          <SummaryCard
            icon={Activity}
            title={currentLang === "ar" ? "ساعات فعلية" : "Actual Hrs"}
            value={totals.actualHours.toFixed(1)}
            tone="green"
          />
        </div>
      </div>

      <div className={`${theme.card} p-5`}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-black text-[var(--color-text)] flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-blue-500" />
              {currentLang === "ar" ? "تحليلات الحضور" : "Attendance Insights"}
            </h3>

            <p className="text-sm text-[var(--color-text-muted)] mt-1">
              {currentLang === "ar"
                ? "تحليل سريع لأنماط الحضور، الغياب، والتأخير داخل الروستر."
                : "Quick analysis of attendance, absence, and late arrival patterns."}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setShowInsights((prev) => !prev)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold border bg-[var(--color-surface)] text-[var(--color-text)] border-[var(--color-border-strong)] hover:bg-[var(--color-success)] hover:text-white hover:border-emerald-500 transition-colors"
            >
              {showInsights ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              {showInsights
                ? currentLang === "ar"
                  ? "إخفاء"
                  : "Hide"
                : currentLang === "ar"
                ? "عرض"
                : "Show"}
            </button>

            <button
              type="button"
              onClick={loadInsights}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold border bg-[var(--color-surface)] text-[var(--color-text)] border-[var(--color-border-strong)] hover:bg-[var(--color-success)] hover:text-white hover:border-emerald-500 transition-colors"
            >
              <RefreshCw size={16} />
              {currentLang === "ar" ? "تحديث التحليلات" : "Refresh Insights"}
            </button>
          </div>
        </div>

        {showInsights && (
          <div className="mt-5 space-y-5">
            {insightError && (
              <MiniError
                message={
                  typeof insightError === "string"
                    ? insightError
                    : insightError?.message
                }
              />
            )}

            {insightLoading && (
              <MiniLoader
                text={
                  currentLang === "ar"
                    ? "جاري تحميل تحليلات الحضور..."
                    : "Loading attendance insights..."
                }
              />
            )}

            <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-4">
              <InsightCard
                icon={BarChart3}
                title={currentLang === "ar" ? "معدل الحضور" : "Attendance Rate"}
                value={toPercent(
                  getNumber(
                    analyticsSummary.attendanceRate,
                    analyticsSummary.presentRate,
                    totals.attendanceRate
                  )
                )}
                tone={Number(totals.attendanceRate) >= 80 ? "green" : "yellow"}
              />

              <InsightCard
                icon={XCircle}
                title={currentLang === "ar" ? "معدل الغياب" : "Absence Rate"}
                value={toPercent(
                  getNumber(
                    analyticsSummary.absenceRate,
                    analyticsSummary.absentRate,
                    totals.absenceRate
                  )
                )}
                tone={Number(totals.absenceRate) > 10 ? "red" : "green"}
              />

              <InsightCard
                icon={Clock}
                title={currentLang === "ar" ? "معدل التأخير" : "Late Rate"}
                value={toPercent(
                  getNumber(latePatterns?.lateRate, totals.lateRate)
                )}
                tone={Number(totals.lateRate) > 10 ? "yellow" : "green"}
              />

              <InsightCard
                icon={Timer}
                title={
                  currentLang === "ar" ? "متوسط دقائق التأخير" : "Avg Late Min"
                }
                value={getNumber(latePatterns?.averageLateMinutes)}
                tone="yellow"
              />

              <InsightCard
                icon={ShieldAlert}
                title={currentLang === "ar" ? "أطباء خطر" : "Risk Doctors"}
                value={absenceList.filter((x) => x.requiresAction).length}
                tone={
                  absenceList.filter((x) => x.requiresAction).length > 0
                    ? "red"
                    : "green"
                }
              />

              <InsightCard
                icon={Layers}
                title={currentLang === "ar" ? "إجمالي التأخير" : "Total Late"}
                value={getNumber(latePatterns?.totalLateCount, totals.lateDays)}
                tone="orange"
              />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
              <InsightsPanel
                theme={theme}
                icon={XCircle}
                title={
                  currentLang === "ar"
                    ? "أكثر الأطباء غيابًا"
                    : "Frequent Absence Patterns"
                }
              >
                {absenceList.length === 0 ? (
                  <EmptyInsight
                    text={
                      currentLang === "ar"
                        ? "لا توجد أنماط غياب متكررة"
                        : "No repeated absence patterns"
                    }
                  />
                ) : (
                  <div className="space-y-3">
                    {absenceList.slice(0, 8).map((item, index) => (
                      <InsightListItem
                        key={item.doctorId || index}
                        icon={Stethoscope}
                        title={valueOrDash(item.doctorName, item.doctorNameAr)}
                        subtitle={`${currentLang === "ar" ? "عدد الغياب" : "Absences"}: ${getNumber(
                          item.absenceCount
                        )} • ${currentLang === "ar" ? "النسبة" : "Rate"}: ${toPercent(
                          getNumber(item.absenceRate)
                        )}`}
                        badge={valueOrDash(item.severity, item.riskLevel)}
                        tone={getRiskTone(item.severity || item.riskLevel)}
                      />
                    ))}
                  </div>
                )}
              </InsightsPanel>

              <InsightsPanel
                theme={theme}
                icon={Clock}
                title={
                  currentLang === "ar"
                    ? "أنماط التأخير"
                    : "Late Arrival Patterns"
                }
              >
                {lateDoctorsList.length === 0 &&
                lateDaysEntries.length === 0 &&
                lateShiftsEntries.length === 0 ? (
                  <EmptyInsight
                    text={
                      currentLang === "ar"
                        ? "لا توجد أنماط تأخير واضحة"
                        : "No clear late arrival patterns"
                    }
                  />
                ) : (
                  <div className="space-y-3">
                    {lateDoctorsList.slice(0, 5).map((item, index) => (
                      <InsightListItem
                        key={item.doctorId || index}
                        icon={Clock}
                        title={valueOrDash(item.doctorName, item.doctorNameAr)}
                        subtitle={`${currentLang === "ar" ? "مرات التأخير" : "Late count"}: ${getNumber(
                          item.lateCount,
                          item.totalLate
                        )} • ${currentLang === "ar" ? "متوسط الدقائق" : "Avg min"}: ${getNumber(
                          item.averageLateMinutes,
                          item.avgLateMinutes
                        )}`}
                        badge={valueOrDash(item.severity, item.riskLevel, "Late")}
                        tone="yellow"
                      />
                    ))}

                    {lateDaysEntries.slice(0, 4).map(([day, count]) => (
                      <InsightListItem
                        key={`day-${day}`}
                        icon={Calendar}
                        title={day}
                        subtitle={
                          currentLang === "ar"
                            ? "أكثر الأيام تأخيرًا"
                            : "Most late day"
                        }
                        badge={count}
                        tone="orange"
                      />
                    ))}
                  </div>
                )}
              </InsightsPanel>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
              <InsightsPanel
                theme={theme}
                icon={Building}
                title={
                  currentLang === "ar"
                    ? "الأقسام الأكثر تأخيرًا"
                    : "Most Late Departments"
                }
              >
                {lateDepartmentsEntries.length === 0 ? (
                  <EmptyInsight
                    text={
                      currentLang === "ar"
                        ? "لا توجد بيانات أقسام للتأخير"
                        : "No department late data"
                    }
                  />
                ) : (
                  <div className="space-y-3">
                    {lateDepartmentsEntries.slice(0, 6).map(([department, value]) => (
                      <InsightListItem
                        key={department}
                        icon={Building}
                        title={department}
                        subtitle={
                          currentLang === "ar"
                            ? "نسبة أو عدد التأخير داخل القسم"
                            : "Late count/rate in department"
                        }
                        badge={value}
                        tone="yellow"
                      />
                    ))}
                  </div>
                )}
              </InsightsPanel>

              <InsightsPanel
                theme={theme}
                icon={Activity}
                title={
                  currentLang === "ar"
                    ? "الشيفتات الأكثر تأخيرًا"
                    : "Most Late Shifts"
                }
              >
                {lateShiftsEntries.length === 0 ? (
                  <EmptyInsight
                    text={
                      currentLang === "ar"
                        ? "لا توجد بيانات شيفتات للتأخير"
                        : "No shift late data"
                    }
                  />
                ) : (
                  <div className="space-y-3">
                    {lateShiftsEntries.slice(0, 6).map(([shift, count]) => (
                      <InsightListItem
                        key={shift}
                        icon={Activity}
                        title={shift}
                        subtitle={
                          currentLang === "ar"
                            ? "عدد حالات التأخير في الشيفت"
                            : "Late cases in shift"
                        }
                        badge={count}
                        tone="orange"
                      />
                    ))}
                  </div>
                )}
              </InsightsPanel>
            </div>
          </div>
        )}
      </div>

      {viewMode === "rows" && (
        <div className={`${theme.card} overflow-hidden`}>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px]">
              <thead className="bg-[var(--color-surface-muted)]">
                <tr className="border-b border-[var(--color-border-strong)]">
                  <th
                    className={`p-4 text-sm font-black text-[var(--color-text)] text-${
                      isRTL ? "right" : "left"
                    }`}
                  >
                    {currentLang === "ar" ? "الطبيب" : "Doctor"}
                  </th>

                  <th
                    className={`p-4 text-sm font-black text-[var(--color-text)] text-${
                      isRTL ? "right" : "left"
                    }`}
                  >
                    {currentLang === "ar" ? "القسم" : "Department"}
                  </th>

                  <th className="p-4 text-sm font-black text-[var(--color-text)] text-center">
                    {currentLang === "ar" ? "مجدول" : "Scheduled"}
                  </th>

                  <th className="p-4 text-sm font-black text-[var(--color-text)] text-center">
                    {currentLang === "ar" ? "حضور" : "Worked"}
                  </th>

                  <th className="p-4 text-sm font-black text-[var(--color-text)] text-center">
                    {currentLang === "ar" ? "غياب" : "Absent"}
                  </th>

                  <th className="p-4 text-sm font-black text-[var(--color-text)] text-center">
                    {currentLang === "ar" ? "تأخير" : "Late"}
                  </th>

                  <th className="p-4 text-sm font-black text-[var(--color-text)] text-center">
                    {currentLang === "ar" ? "خروج مبكر" : "Early"}
                  </th>

                  <th className="p-4 text-sm font-black text-[var(--color-text)] text-center">
                    {currentLang === "ar" ? "نسبة الحضور" : "Rate"}
                  </th>

                  <th className="p-4 text-sm font-black text-[var(--color-text)] text-center">
                    {currentLang === "ar" ? "الأداء" : "Performance"}
                  </th>
                </tr>
              </thead>

              <tbody>
                {rows.map((row, index) => (
                  <tr
                    key={`${row.doctorId}-${row.departmentId}-${index}`}
                    className={`border-b border-[var(--color-border)] ${theme.hoverRow}`}
                  >
                    <td className="p-4">
                      <div className="font-black text-[var(--color-text)]">
                        {getDoctorName(row)}
                      </div>

                      <div className="text-xs font-bold text-[var(--color-text-muted)]">
                        #{row.printNumber || "-"} · {row.mobile || "-"}
                      </div>
                    </td>

                    <td className="p-4">
                      <div className="font-black text-[var(--color-text)] flex items-center gap-2">
                        <Building className="w-4 h-4 shrink-0 text-emerald-500 dark:text-emerald-500" />
                        {getDepartmentName(row)}
                      </div>

                      <div className="text-xs font-bold text-[var(--color-text-muted)]">
                        {currentLang === "ar"
                          ? row.scientificDegreeName
                          : row.scientificDegreeNameEn}
                      </div>
                    </td>

                    <td className="p-4 text-center text-[var(--color-text)] font-black">
                      {row.totalScheduledDays ?? 0}
                    </td>

                    <td className="p-4 text-center text-emerald-500 dark:text-emerald-500 font-black">
                      {row.daysWorked ?? 0}
                    </td>

                    <td className="p-4 text-center text-red-500 dark:text-red-500 font-black">
                      {row.daysAbsent ?? 0}
                    </td>

                    <td className="p-4 text-center text-amber-500 dark:text-amber-500 font-black">
                      {row.daysLate ?? 0}
                    </td>

                    <td className="p-4 text-center text-orange-500 dark:text-orange-500 font-black">
                      {row.daysEarlyCheckout ?? 0}
                    </td>

                    <td className="p-4 text-center">
                      <span className="px-3 py-1 rounded-full text-xs font-black bg-transparent text-blue-500 border-2 border-blue-500">
                        {row.attendanceRate ?? 0}%
                      </span>
                    </td>

                    <td className="p-4 text-center">
                      <span className="px-3 py-1 rounded-full text-xs font-black bg-[var(--color-surface-muted)] text-[var(--color-text)] border-2 border-[var(--color-border-strong)]">
                        {row.performanceLevel || "-"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {viewMode === "matrix" && (
        <div className={`${theme.card} overflow-hidden`}>
          <div className="flex w-full">
            <div
              className={`shrink-0 bg-[var(--color-surface)] z-20 ${
                isRTL
                  ? "border-l-2 border-[var(--color-border-strong)]"
                  : "border-r-2 border-[var(--color-border-strong)]"
              }`}
              style={{ width: "360px" }}
            >
              <table className="w-full table-fixed">
                <thead className="bg-[var(--color-surface-muted)]">
                  <tr className="border-b border-[var(--color-border-strong)] h-[56px]">
                    <th
                      className={`p-3 text-sm font-black text-[var(--color-text)] text-${
                        isRTL ? "right" : "left"
                      }`}
                    >
                      {currentLang === "ar"
                        ? "الطبيب / القسم"
                        : "Doctor / Department"}
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-[var(--color-border)]">
                  {rows.map((row, index) => (
                    <tr
                      key={`fixed-${row.doctorId}-${row.departmentId}-${index}`}
                      className="h-[72px]"
                    >
                      <td className="p-3">
                        <div className="font-black text-sm text-[var(--color-text)] line-clamp-1">
                          {getDoctorName(row)}
                        </div>

                        <div className="text-xs font-bold text-[var(--color-text-muted)] line-clamp-1">
                          {getDepartmentName(row)}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex-1 overflow-x-auto">
              <table className="w-max min-w-full">
                <thead className="bg-[var(--color-surface-muted)]">
                  <tr className="border-b border-[var(--color-border-strong)] h-[56px]">
                    {daysArray.map((day) => (
                      <th
                        key={`day-head-${day}`}
                        className="p-2 text-center text-xs font-black text-[var(--color-text)]"
                        style={{ minWidth: "56px", width: "56px" }}
                      >
                        {day}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody className="divide-y divide-[var(--color-border)]">
                  {rows.map((row, index) => (
                    <tr
                      key={`days-${row.doctorId}-${row.departmentId}-${index}`}
                      className="h-[72px]"
                    >
                      {daysArray.map((day) => (
                        <td
                          key={`${row.doctorId}-${row.departmentId}-${day}`}
                          className="p-2 text-center"
                          style={{ minWidth: "56px", width: "56px" }}
                        >
                          <AttendanceStatusCell row={row} day={day} />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="p-4 border-t border-[var(--color-border-strong)] bg-[var(--color-surface-muted)]">
            <div className="flex flex-wrap gap-2 text-xs">
              <LegendBadge
                code="✓"
                label={currentLang === "ar" ? "حاضر" : "Present"}
                tone="green"
              />

              <LegendBadge
                code="L"
                label={currentLang === "ar" ? "متأخر" : "Late"}
                tone="yellow"
              />

              <LegendBadge
                code="A"
                label={currentLang === "ar" ? "غائب" : "Absent"}
                tone="red"
              />

              <LegendBadge
                code="E"
                label={currentLang === "ar" ? "خروج مبكر" : "Early"}
                tone="orange"
              />

              <LegendBadge
                code="X"
                label={currentLang === "ar" ? "استثناء" : "Exception"}
                tone="purple"
              />

              <LegendBadge
                code="-"
                label={currentLang === "ar" ? "لا يوجد" : "No Record"}
                tone="slate"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function InsightCard({ icon: Icon, title, value, tone = "blue" }) {
  const toneClass = getToneClasses(tone)

  return (
    <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-[var(--color-text-muted)]">
            {title}
          </p>
          <p className={`mt-1 text-2xl font-black ${toneClass.text}`}>
            {value ?? 0}
          </p>
        </div>

        <div
          className={`w-11 h-11 rounded-xl flex items-center justify-center border-2 bg-transparent ${toneClass.text} ${toneClass.border}`}
        >
          <Icon size={21} />
        </div>
      </div>
    </div>
  )
}

function InsightsPanel({ theme, icon: Icon, title, children }) {
  return (
    <div className={`${theme.cardSoft} p-4 border border-[var(--color-border)]`}>
      <h4 className="text-lg font-black text-[var(--color-text)] mb-4 flex items-center gap-2">
        <span className="w-9 h-9 rounded-xl border-2 border-blue-500 text-blue-500 flex items-center justify-center">
          <Icon size={18} />
        </span>
        {title}
      </h4>

      {children}
    </div>
  )
}

function InsightListItem({ icon: Icon, title, subtitle, badge, tone = "blue" }) {
  const toneClass = getToneClasses(tone)

  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-3">
      <div className="flex items-center gap-3 min-w-0">
        <span
          className={`w-9 h-9 rounded-xl border-2 flex items-center justify-center bg-transparent ${toneClass.text} ${toneClass.border}`}
        >
          <Icon size={17} />
        </span>

        <div className="min-w-0">
          <p className="font-black text-[var(--color-text)] truncate">{title}</p>
          <p className="text-xs text-[var(--color-text-muted)] truncate mt-0.5">
            {subtitle}
          </p>
        </div>
      </div>

      <span
        className={`shrink-0 px-2.5 py-1 rounded-full text-xs font-black border-2 ${toneClass.text} ${toneClass.border}`}
      >
        {badge}
      </span>
    </div>
  )
}

function EmptyInsight({ text }) {
  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 text-center">
      <Activity className="w-10 h-10 mx-auto mb-3 text-slate-500" />
      <p className="text-sm font-bold text-[var(--color-text-muted)]">{text}</p>
    </div>
  )
}

function MiniLoader({ text }) {
  return (
    <div className="p-5 text-center">
      <div className="w-8 h-8 mx-auto mb-3 rounded-full border-4 border-[var(--color-border)] border-t-[var(--color-primary)] animate-spin" />
      <p className="text-sm font-bold text-[var(--color-text-muted)]">{text}</p>
    </div>
  )
}

function MiniError({ message }) {
  return (
    <div className="rounded-xl border-2 border-red-500 bg-transparent p-4 text-red-500">
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 mt-0.5" />
        <p className="text-sm font-bold">{message || "Error"}</p>
      </div>
    </div>
  )
}

export default RosterAttendanceTab