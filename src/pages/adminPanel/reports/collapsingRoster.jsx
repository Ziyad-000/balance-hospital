// collapsingRoster.jsx

import { useState } from "react"
import {
  ChevronDown,
  ChevronRight,
  Calendar,
  Clock,
  Building,
  CheckCircle,
  XCircle,
  AlertCircle,
  Activity,
  Rows3,
  Grid3X3,
} from "lucide-react"
import { getPageTheme } from "../../../utils/themeClasses"

export const CollapsibleRosterCard = ({
  roster,
  isRTL,
  currentLang,
  t,
  formatDate,
  getAttendanceStatusColor,
}) => {
  const theme = getPageTheme()

  const [isCollapsed, setIsCollapsed] = useState(true)
  const [viewMode, setViewMode] = useState("rows")

  const toggleCollapse = () => {
    setIsCollapsed((prev) => !prev)
  }

  const textAlign = isRTL ? "text-right" : "text-left"

  const iconColors = {
    calendar: "text-blue-700 dark:text-blue-300",
    building: "text-green-700 dark:text-green-300",
    clock: "text-purple-700 dark:text-purple-300",
    success: "text-green-700 dark:text-green-300",
    danger: "text-red-700 dark:text-red-300",
    warning: "text-orange-700 dark:text-orange-300",
    muted: "text-slate-600 dark:text-slate-300",
    activity: "text-blue-700 dark:text-blue-300",
  }

  const iconBg = {
    calendar: "bg-blue-100 dark:bg-blue-900/50",
    building: "bg-green-100 dark:bg-green-900/50",
    clock: "bg-purple-100 dark:bg-purple-900/50",
    success: "bg-green-100 dark:bg-green-900/50",
    warning: "bg-orange-100 dark:bg-orange-900/50",
    activity: "bg-blue-100 dark:bg-blue-900/50",
  }

  const getLocalized = (arValue, enValue) => {
    return currentLang === "en" ? enValue || arValue : arValue || enValue
  }

  const normalizeStatus = (status = "") => {
    return String(status).toLowerCase().replace(/\s|_/g, "")
  }

  const getAttendanceTone = (status) => {
    const normalized = normalizeStatus(status)

    if (
      normalized.includes("ontime") ||
      normalized.includes("present") ||
      normalized.includes("completed")
    ) {
      return {
        icon: CheckCircle,
        iconClass: "text-green-700 dark:text-green-300",
        bgClass: "bg-green-100 dark:bg-green-900/50",
        borderClass: "border-green-300 dark:border-green-700",
      }
    }

    if (normalized.includes("late")) {
      return {
        icon: Clock,
        iconClass: "text-yellow-700 dark:text-yellow-300",
        bgClass: "bg-yellow-100 dark:bg-yellow-900/50",
        borderClass: "border-yellow-300 dark:border-yellow-700",
      }
    }

    if (normalized.includes("absent")) {
      return {
        icon: XCircle,
        iconClass: "text-red-700 dark:text-red-300",
        bgClass: "bg-red-100 dark:bg-red-900/50",
        borderClass: "border-red-300 dark:border-red-700",
      }
    }

    if (normalized.includes("early")) {
      return {
        icon: AlertCircle,
        iconClass: "text-orange-700 dark:text-orange-300",
        bgClass: "bg-orange-100 dark:bg-orange-900/50",
        borderClass: "border-orange-300 dark:border-orange-700",
      }
    }

    return {
      icon: Activity,
      iconClass: "text-slate-600 dark:text-slate-300",
      bgClass: "bg-[var(--color-bg-soft)]",
      borderClass: "border-[var(--color-border)]",
    }
  }

  const ShiftCalendarCard = ({ shift }) => {
    const tone = getAttendanceTone(shift.attendanceStatus)
    const StatusIcon = tone.icon

    return (
      <div
        className={`rounded-2xl border p-4 ${tone.bgClass} ${tone.borderClass}`}
      >
        <div className="flex items-center justify-between gap-3 mb-3">
          <div>
            <p className="text-xs font-bold text-[var(--color-text-muted)]">
              {getLocalized(shift.dayNameAr, shift.dayNameEn)}
            </p>

            <p className="text-lg font-extrabold text-[var(--color-text)]">
              {formatDate(shift.shiftDate)}
            </p>
          </div>

          <StatusIcon className={`w-6 h-6 ${tone.iconClass}`} />
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <Building className={`w-4 h-4 ${iconColors.building}`} />
            <span className="font-semibold text-[var(--color-text)]">
              {getLocalized(shift.departmentNameAr, shift.departmentNameEn)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Clock className={`w-4 h-4 ${iconColors.clock}`} />
            <span className="text-[var(--color-text-muted)]">
              {getLocalized(shift.shiftTypeNameAr, shift.shiftTypeNameEn)}
            </span>
          </div>

          <div className="rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] px-3 py-2">
            <div className="flex items-center justify-between gap-3 text-xs">
              <span className="text-[var(--color-text-muted)]">
                {t("doctorReport.rosterAssignments.time")}
              </span>
              <span className="font-bold text-[var(--color-text)]">
                {shift.startTime} - {shift.endTime}
              </span>
            </div>

            {shift.shiftHours > 0 && (
              <div className="flex items-center justify-between gap-3 text-xs mt-1">
                <span className="text-[var(--color-text-muted)]">
                  {t("doctorReport.stats.hours")}
                </span>
                <span className="font-bold text-[var(--color-text)]">
                  {shift.shiftHours}
                </span>
              </div>
            )}
          </div>

          <div>
            {shift.attendanceStatus === "لا توجد سجلات" ? (
              <span className="text-xs text-[var(--color-text-muted)]">
                {shift.attendanceStatus}
              </span>
            ) : (
              <div>
                <span
                  className={`inline-flex px-3 py-1 rounded-full text-xs font-bold ${getAttendanceStatusColor(
                    shift.attendanceStatus
                  )}`}
                >
                  {shift.attendanceStatus}
                </span>

                {shift.lateMinutes > 0 && (
                  <p className="text-xs mt-1 text-[var(--color-text-muted)]">
                    {shift.lateMinutes}{" "}
                    {t("doctorReport.attendanceRecords.minutesLate")}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`${theme.card} overflow-hidden`}>
      <button
        type="button"
        className={`w-full p-5 cursor-pointer ${theme.hoverRow}`}
        onClick={toggleCollapse}
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start gap-4 flex-1">
            <div className={`p-3 rounded-xl ${iconBg.calendar}`}>
              <Calendar className={`w-6 h-6 ${iconColors.calendar}`} />
            </div>

            <div className={textAlign}>
              <h3 className="text-xl font-extrabold text-[var(--color-text)] mb-1">
                {roster.rosterTitle}
              </h3>

              <p className="text-sm text-[var(--color-text-muted)]">
                {formatDate(roster.rosterStartDate)} -{" "}
                {formatDate(roster.rosterEndDate)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex flex-wrap gap-3">
              <div className={`${theme.cardSoft} px-4 py-2`}>
                <p className="text-xs font-semibold text-blue-700 dark:text-blue-300 mb-1">
                  {t("doctorReport.rosterAssignments.totalShifts")}
                </p>
                <p className="text-lg font-extrabold text-[var(--color-text)]">
                  {roster.totalShiftsInRoster}
                </p>
              </div>

              <div className={`${theme.cardSoft} px-4 py-2`}>
                <p className="text-xs font-semibold text-green-700 dark:text-green-300 mb-1">
                  {t("doctorReport.rosterAssignments.completed")}
                </p>
                <p className="text-lg font-extrabold text-[var(--color-text)]">
                  {roster.completedShiftsInRoster}
                </p>
              </div>
            </div>

            {isCollapsed ? (
              <ChevronRight className={`h-5 w-5 ${iconColors.muted}`} />
            ) : (
              <ChevronDown className={`h-5 w-5 ${iconColors.muted}`} />
            )}
          </div>
        </div>
      </button>

      {!isCollapsed && roster.shifts && roster.shifts.length > 0 && (
        <div className="border-t border-[var(--color-border)] p-5">
          <div className="flex justify-end mb-4">
            <div className="flex items-center gap-2 bg-[var(--color-surface-muted)] border border-[var(--color-border)] rounded-xl p-1">
              <button
                type="button"
                onClick={() => setViewMode("rows")}
                className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-bold transition-colors ${
                  viewMode === "rows"
                    ? "bg-[var(--color-primary)] text-white"
                    : "text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg-soft)]"
                }`}
              >
                <Rows3 size={16} />
                {currentLang === "ar" ? "صفوف" : "Rows"}
              </button>

              <button
                type="button"
                onClick={() => setViewMode("calendar")}
                className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-bold transition-colors ${
                  viewMode === "calendar"
                    ? "bg-[var(--color-primary)] text-white"
                    : "text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg-soft)]"
                }`}
              >
                <Grid3X3 size={16} />
                {currentLang === "ar" ? "تقويم" : "Calendar"}
              </button>
            </div>
          </div>

          {viewMode === "rows" && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[var(--color-surface-muted)]">
                  <tr className="border-b border-[var(--color-border)]">
                    <th className={`${textAlign} p-4 font-bold text-sm text-[var(--color-text)]`}>
                      {t("doctorReport.rosterAssignments.date")}
                    </th>
                    <th className={`${textAlign} p-4 font-bold text-sm text-[var(--color-text)]`}>
                      {t("doctorReport.rosterAssignments.department")}
                    </th>
                    <th className={`${textAlign} p-4 font-bold text-sm text-[var(--color-text)]`}>
                      {t("doctorReport.rosterAssignments.shiftType")}
                    </th>
                    <th className={`${textAlign} p-4 font-bold text-sm text-[var(--color-text)]`}>
                      {t("doctorReport.rosterAssignments.time")}
                    </th>
                    <th className={`${textAlign} p-4 font-bold text-sm text-[var(--color-text)]`}>
                      {t("doctorReport.rosterAssignments.attendanceStatus")}
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {roster.shifts.map((shift) => (
                    <tr
                      key={shift.scheduleId}
                      className={`border-b border-[var(--color-border)] ${theme.hoverRow}`}
                    >
                      <td className="p-4 text-[var(--color-text)]">
                        <div className="font-bold">
                          {formatDate(shift.shiftDate)}
                        </div>
                        <div className="text-xs text-[var(--color-text-muted)]">
                          {getLocalized(shift.dayNameAr, shift.dayNameEn)}
                        </div>
                      </td>

                      <td className="p-4 text-sm text-[var(--color-text-muted)]">
                        {getLocalized(
                          shift.departmentNameAr,
                          shift.departmentNameEn
                        )}
                      </td>

                      <td className="p-4 text-sm text-[var(--color-text-muted)]">
                        <div>
                          {getLocalized(
                            shift.shiftTypeNameAr,
                            shift.shiftTypeNameEn
                          )}
                        </div>

                        {shift.shiftHours > 0 && (
                          <div className="text-xs text-[var(--color-text-muted)]">
                            {shift.shiftHours} {t("doctorReport.stats.hours")}
                          </div>
                        )}
                      </td>

                      <td className="p-4 text-sm text-[var(--color-text-muted)]">
                        {shift.startTime} - {shift.endTime}
                      </td>

                      <td className="p-4">
                        {shift.attendanceStatus === "لا توجد سجلات" ? (
                          <span className="text-xs text-[var(--color-text-muted)]">
                            {shift.attendanceStatus}
                          </span>
                        ) : (
                          <div>
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-bold ${getAttendanceStatusColor(
                                shift.attendanceStatus
                              )}`}
                            >
                              {shift.attendanceStatus}
                            </span>

                            {shift.lateMinutes > 0 && (
                              <div className="text-xs mt-1 text-[var(--color-text-muted)]">
                                {shift.lateMinutes}{" "}
                                {t(
                                  "doctorReport.attendanceRecords.minutesLate"
                                )}
                              </div>
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

          {viewMode === "calendar" && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {roster.shifts.map((shift) => (
                <ShiftCalendarCard key={shift.scheduleId} shift={shift} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}