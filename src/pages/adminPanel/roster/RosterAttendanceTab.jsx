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

    if (value.includes("ontime") || value.includes("present") || value.includes("worked")) {
      return {
        label: currentLang === "ar" ? "حاضر" : "Present",
        bg: "bg-green-100 dark:bg-green-900/50",
        text: "text-green-800 dark:text-green-200",
        border: "border-green-300 dark:border-green-700",
      }
    }

    if (value.includes("late")) {
      return {
        label: currentLang === "ar" ? "متأخر" : "Late",
        bg: "bg-yellow-100 dark:bg-yellow-900/50",
        text: "text-yellow-800 dark:text-yellow-200",
        border: "border-yellow-300 dark:border-yellow-700",
      }
    }

    if (value.includes("absent")) {
      return {
        label: currentLang === "ar" ? "غائب" : "Absent",
        bg: "bg-red-100 dark:bg-red-900/50",
        text: "text-red-800 dark:text-red-200",
        border: "border-red-300 dark:border-red-700",
      }
    }

    if (value.includes("early")) {
      return {
        label: currentLang === "ar" ? "خروج مبكر" : "Early",
        bg: "bg-orange-100 dark:bg-orange-900/50",
        text: "text-orange-800 dark:text-orange-200",
        border: "border-orange-300 dark:border-orange-700",
      }
    }

    if (value.includes("exception") || value.includes("excused")) {
      return {
        label: currentLang === "ar" ? "استثناء" : "Exception",
        bg: "bg-purple-100 dark:bg-purple-900/50",
        text: "text-purple-800 dark:text-purple-200",
        border: "border-purple-300 dark:border-purple-700",
      }
    }

    return {
      label: currentLang === "ar" ? "لا يوجد" : "No Record",
      bg: "bg-[var(--color-bg-soft)]",
      text: "text-[var(--color-text-muted)]",
      border: "border-[var(--color-border)]",
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
      blue: "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300",
      green:
        "bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300",
      red: "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300",
      yellow:
        "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300",
      orange:
        "bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300",
      purple:
        "bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300",
    }

    return (
      <div className={`${theme.cardSoft} p-4`}>
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm text-[var(--color-text-muted)]">{title}</p>
            <p className="text-2xl font-extrabold text-[var(--color-text)]">
              {value ?? 0}
            </p>
          </div>

          <div
            className={`w-11 h-11 rounded-xl flex items-center justify-center ${
              toneMap[tone] || toneMap.blue
            }`}
          >
            <Icon className="w-5 h-5" />
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
        className={`mx-auto min-w-9 h-9 px-2 rounded-xl border flex items-center justify-center text-xs font-extrabold cursor-help ${tone.bg} ${tone.text} ${tone.border}`}
      >
        {code}
      </div>
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
        <AlertCircle className="w-14 h-14 mx-auto mb-4 text-red-700 dark:text-red-300" />
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
        <Activity className="w-14 h-14 mx-auto mb-4 text-blue-700 dark:text-blue-300" />
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
            <h2 className="text-2xl font-bold text-[var(--color-text)] flex items-center gap-2">
              <Activity className="w-6 h-6 text-purple-700 dark:text-purple-300" />
              {currentLang === "ar" ? "حضور الروستر" : "Roster Attendance"}
            </h2>
            <p className="text-sm text-[var(--color-text-muted)] mt-1">
              {report?.monthNameAr || report?.monthNameEn} {report?.year}
            </p>
          </div>

          <div className="flex items-center gap-2 bg-[var(--color-surface-muted)] border border-[var(--color-border)] rounded-xl p-1">
            <button
              type="button"
              onClick={() => setViewMode("rows")}
              className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                viewMode === "rows"
                  ? "bg-[var(--color-primary)] text-white"
                  : "text-[var(--color-text-muted)] hover:bg-[var(--color-bg-soft)]"
              }`}
            >
              <Rows3 size={16} />
              {currentLang === "ar" ? "صفوف" : "Rows"}
            </button>

            <button
              type="button"
              onClick={() => setViewMode("matrix")}
              className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                viewMode === "matrix"
                  ? "bg-[var(--color-primary)] text-white"
                  : "text-[var(--color-text-muted)] hover:bg-[var(--color-bg-soft)]"
              }`}
            >
              <Grid3X3 size={16} />
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
                <tr className="border-b border-[var(--color-border)]">
                  <th
                    className={`p-4 text-sm font-bold text-[var(--color-text)] text-${
                      isRTL ? "right" : "left"
                    }`}
                  >
                    {currentLang === "ar" ? "الطبيب" : "Doctor"}
                  </th>

                  <th
                    className={`p-4 text-sm font-bold text-[var(--color-text)] text-${
                      isRTL ? "right" : "left"
                    }`}
                  >
                    {currentLang === "ar" ? "القسم" : "Department"}
                  </th>

                  <th className="p-4 text-sm font-bold text-[var(--color-text)] text-center">
                    {currentLang === "ar" ? "مجدول" : "Scheduled"}
                  </th>

                  <th className="p-4 text-sm font-bold text-[var(--color-text)] text-center">
                    {currentLang === "ar" ? "حضور" : "Worked"}
                  </th>

                  <th className="p-4 text-sm font-bold text-[var(--color-text)] text-center">
                    {currentLang === "ar" ? "غياب" : "Absent"}
                  </th>

                  <th className="p-4 text-sm font-bold text-[var(--color-text)] text-center">
                    {currentLang === "ar" ? "تأخير" : "Late"}
                  </th>

                  <th className="p-4 text-sm font-bold text-[var(--color-text)] text-center">
                    {currentLang === "ar" ? "خروج مبكر" : "Early"}
                  </th>

                  <th className="p-4 text-sm font-bold text-[var(--color-text)] text-center">
                    {currentLang === "ar" ? "نسبة الحضور" : "Rate"}
                  </th>

                  <th className="p-4 text-sm font-bold text-[var(--color-text)] text-center">
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
                      <div className="font-bold text-[var(--color-text)]">
                        {getDoctorName(row)}
                      </div>
                      <div className="text-xs text-[var(--color-text-muted)]">
                        #{row.printNumber || "-"} · {row.mobile || "-"}
                      </div>
                    </td>

                    <td className="p-4">
                      <div className="font-semibold text-[var(--color-text)] flex items-center gap-2">
                        <Building className="w-4 h-4 text-green-700 dark:text-green-300" />
                        {getDepartmentName(row)}
                      </div>
                      <div className="text-xs text-[var(--color-text-muted)]">
                        {currentLang === "ar"
                          ? row.scientificDegreeName
                          : row.scientificDegreeNameEn}
                      </div>
                    </td>

                    <td className="p-4 text-center text-[var(--color-text)] font-bold">
                      {row.totalScheduledDays ?? 0}
                    </td>

                    <td className="p-4 text-center text-green-700 dark:text-green-300 font-bold">
                      {row.daysWorked ?? 0}
                    </td>

                    <td className="p-4 text-center text-red-700 dark:text-red-300 font-bold">
                      {row.daysAbsent ?? 0}
                    </td>

                    <td className="p-4 text-center text-yellow-700 dark:text-yellow-300 font-bold">
                      {row.daysLate ?? 0}
                    </td>

                    <td className="p-4 text-center text-orange-700 dark:text-orange-300 font-bold">
                      {row.daysEarlyCheckout ?? 0}
                    </td>

                    <td className="p-4 text-center">
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-300 dark:bg-blue-900/50 dark:text-blue-200 dark:border-blue-700">
                        {row.attendanceRate ?? 0}%
                      </span>
                    </td>

                    <td className="p-4 text-center">
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-[var(--color-bg-soft)] text-[var(--color-text)] border border-[var(--color-border)]">
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
                  ? "border-l-2 border-[var(--color-border)]"
                  : "border-r-2 border-[var(--color-border)]"
              }`}
              style={{ width: "360px" }}
            >
              <table className="w-full table-fixed">
                <thead className="bg-[var(--color-surface-muted)]">
                  <tr className="border-b border-[var(--color-border)] h-[56px]">
                    <th
                      className={`p-3 text-sm font-bold text-[var(--color-text)] text-${
                        isRTL ? "right" : "left"
                      }`}
                    >
                      {currentLang === "ar" ? "الطبيب / القسم" : "Doctor / Department"}
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
                        <div className="font-bold text-sm text-[var(--color-text)] line-clamp-1">
                          {getDoctorName(row)}
                        </div>
                        <div className="text-xs text-[var(--color-text-muted)] line-clamp-1">
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
                  <tr className="border-b border-[var(--color-border)] h-[56px]">
                    {daysArray.map((day) => (
                      <th
                        key={`day-head-${day}`}
                        className="p-2 text-center text-xs font-bold text-[var(--color-text)]"
                        style={{ minWidth: "54px", width: "54px" }}
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
                          style={{ minWidth: "54px", width: "54px" }}
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

          <div className="p-4 border-t border-[var(--color-border)] bg-[var(--color-surface-muted)]">
            <div className="flex flex-wrap gap-2 text-xs">
              {[
                ["✓", currentLang === "ar" ? "حاضر" : "Present", "green"],
                ["L", currentLang === "ar" ? "متأخر" : "Late", "yellow"],
                ["A", currentLang === "ar" ? "غائب" : "Absent", "red"],
                ["E", currentLang === "ar" ? "خروج مبكر" : "Early", "orange"],
                ["X", currentLang === "ar" ? "استثناء" : "Exception", "purple"],
                ["-", currentLang === "ar" ? "لا يوجد" : "No Record", "slate"],
              ].map(([code, label, color]) => (
                <span
                  key={code}
                  className={`px-3 py-1 rounded-full border font-bold bg-${color}-100 text-${color}-800 border-${color}-300 dark:bg-${color}-900/50 dark:text-${color}-200 dark:border-${color}-700`}
                >
                  {code} {label}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default RosterAttendanceTab