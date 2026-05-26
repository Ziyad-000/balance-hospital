import React, { useMemo, useState } from "react"
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
} from "lucide-react"
import LoadingGetData from "../../../components/LoadingGetData"
import { getPageTheme } from "../../../utils/themeClasses"

function RosterAttendanceTab({
  report,
  summary,
  loading,
  error,
  currentLang = "ar",
  isRTL = true,
}) {
  const theme = getPageTheme()
  const [viewMode, setViewMode] = useState("rows")

  const rows = report?.rows || []
  const daysInMonth = report?.daysInMonth || 31
  const daysArray = Array.from({ length: daysInMonth }, (_, index) => index + 1)

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

    return {
      ...base,
      attendanceRate,
    }
  }, [rows])

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
    const toneMap = {
      blue: {
        box: "bg-transparent text-blue-500 border-blue-500 dark:bg-transparent dark:text-blue-500 dark:border-blue-500",
      },
      green: {
        box: "bg-transparent text-emerald-500 border-emerald-500 dark:bg-transparent dark:text-emerald-500 dark:border-emerald-500",
      },
      red: {
        box: "bg-transparent text-red-500 border-red-500 dark:bg-transparent dark:text-red-500 dark:border-red-500",
      },
      yellow: {
        box: "bg-transparent text-amber-500 border-amber-500 dark:bg-transparent dark:text-amber-500 dark:border-amber-500",
      },
      orange: {
        box: "bg-transparent text-orange-500 border-orange-500 dark:bg-transparent dark:text-orange-500 dark:border-orange-500",
      },
      purple: {
        box: "bg-transparent text-violet-500 border-violet-500 dark:bg-transparent dark:text-violet-500 dark:border-violet-500",
      },
    }

    const selectedTone = toneMap[tone] || toneMap.blue

    return (
      <div
        className={`${theme.cardSoft} p-4 border border-[var(--color-border-strong)]`}
      >
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-[var(--color-text-muted)]">
              {title}
            </p>

            <p className="mt-1 text-2xl font-black tracking-tight text-[var(--color-text)] whitespace-nowrap">
              {value ?? 0}
            </p>
          </div>

          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border-2 shadow-sm ${selectedTone.box}`}
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
    const toneMap = {
      green:
        "bg-transparent text-emerald-500 border-emerald-500 dark:bg-transparent dark:text-emerald-500 dark:border-emerald-500",
      yellow:
        "bg-transparent text-amber-500 border-amber-500 dark:bg-transparent dark:text-amber-500 dark:border-amber-500",
      red:
        "bg-transparent text-red-500 border-red-500 dark:bg-transparent dark:text-red-500 dark:border-red-500",
      orange:
        "bg-transparent text-orange-500 border-orange-500 dark:bg-transparent dark:text-orange-500 dark:border-orange-500",
      purple:
        "bg-transparent text-violet-500 border-violet-500 dark:bg-transparent dark:text-violet-500 dark:border-violet-500",
      slate:
        "bg-transparent text-slate-500 border-slate-500 dark:bg-transparent dark:text-slate-500 dark:border-slate-500",
    }

    return (
      <span
        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border-2 text-xs font-black shadow-sm ${
          toneMap[tone] || toneMap.slate
        }`}
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

        <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-4">
          <SummaryCard
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
                        <Building className="w-4 h-4 shrink-0 text-emerald-700 dark:text-emerald-300" />
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

                    <td className="p-4 text-center text-emerald-800 dark:text-emerald-300 font-black">
                      {row.daysWorked ?? 0}
                    </td>

                    <td className="p-4 text-center text-red-800 dark:text-red-300 font-black">
                      {row.daysAbsent ?? 0}
                    </td>

                    <td className="p-4 text-center text-amber-800 dark:text-amber-300 font-black">
                      {row.daysLate ?? 0}
                    </td>

                    <td className="p-4 text-center text-orange-800 dark:text-orange-300 font-black">
                      {row.daysEarlyCheckout ?? 0}
                    </td>

                    <td className="p-4 text-center">
                      <span className="px-3 py-1 rounded-full text-xs font-black bg-blue-200 text-blue-950 border-2 border-blue-500 dark:bg-blue-700/70 dark:text-white dark:border-blue-400">
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

export default RosterAttendanceTab