import React, { useMemo, useState } from "react"
import { useTranslation } from "react-i18next"
import {
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  Stethoscope,
  Timer,
  UserCheck,
  Users,
  XCircle,
} from "lucide-react"

import { getPageTheme } from "../../../utils/themeClasses"

const getTone = (tone = "blue") => {
  const tones = {
    blue: "bg-transparent text-blue-500 border-blue-500 dark:bg-transparent dark:text-blue-500 dark:border-blue-500",
    emerald:
      "bg-transparent text-emerald-500 border-emerald-500 dark:bg-transparent dark:text-emerald-500 dark:border-emerald-500",
    amber:
      "bg-transparent text-amber-500 border-amber-500 dark:bg-transparent dark:text-amber-500 dark:border-amber-500",
    red: "bg-transparent text-red-500 border-red-500 dark:bg-transparent dark:text-red-500 dark:border-red-500",
    violet:
      "bg-transparent text-violet-500 border-violet-500 dark:bg-transparent dark:text-violet-500 dark:border-violet-500",
    slate:
      "bg-transparent text-slate-500 border-slate-500 dark:bg-transparent dark:text-slate-500 dark:border-slate-500",
  }

  return tones[tone] || tones.blue
}

const getProgressTone = (percentage = 0) => {
  const value = Number(percentage || 0)
  if (value >= 90) return "emerald"
  if (value >= 70) return "amber"
  if (value > 0) return "amber"
  return "red"
}

const getStatusTone = (status) => {
  switch (String(status || "").toLowerCase()) {
    case "present":
    case "approved":
      return "emerald"
    case "absent":
    case "rejected":
      return "red"
    case "late":
    case "pending":
      return "amber"
    default:
      return "slate"
  }
}

const getAttendanceIcon = (status) => {
  switch (status) {
    case "Present":
      return CheckCircle2
    case "Absent":
      return XCircle
    case "Late":
      return Clock
    default:
      return AlertCircle
  }
}

const Badge = ({ children, tone = "blue", className = "" }) => (
  <span
    className={`inline-flex items-center justify-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border-2 shadow-sm ${getTone(
      tone
    )} ${className}`}
  >
    {children}
  </span>
)

const IconBox = ({ icon: Icon, tone = "blue", size = "md" }) => {
  const sizeClass = size === "sm" ? "w-8 h-8 rounded-xl" : "w-11 h-11 rounded-2xl"
  const iconClass = size === "sm" ? "w-4 h-4" : "w-5 h-5"

  return (
    <span
      className={`${sizeClass} border-2 flex items-center justify-center shrink-0 shadow-sm ${getTone(
        tone
      )}`}
    >
      <Icon className={iconClass} />
    </span>
  )
}

const getName = (item, lang) => {
  if (!item) return "-"
  return lang === "ar"
    ? item.doctorNameAr || item.nameArabic || item.fullNameAr || item.doctorNameEn || item.nameEnglish || "-"
    : item.doctorNameEn || item.nameEnglish || item.fullNameEn || item.doctorNameAr || item.nameArabic || "-"
}

const CollapsibleDateCardForDepartment = ({
  dayData,
  formatDate,
  formatTime,
  getFillColor,
  getFillBgColor,
}) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const { t, i18n } = useTranslation()
  const theme = getPageTheme()

  const currentLang = i18n.language || "ar"
  const isRTL = currentLang === "ar"

  const shifts = Array.isArray(dayData?.shifts) ? dayData.shifts : []
  const totalRequired = Number(dayData?.totalRequired || 0)
  const totalAssigned = Number(dayData?.totalAssigned || 0)
  const totalShortfall = Number(dayData?.totalShortfall || 0)

  const completionPercentage =
    totalRequired > 0 ? Math.round((totalAssigned / totalRequired) * 100) : 0

  const completionTone = getProgressTone(completionPercentage)

  const dayName =
    currentLang === "ar"
      ? dayData?.dayOfWeekNameAr || dayData?.dayOfWeekNameEn || "-"
      : dayData?.dayOfWeekNameEn || dayData?.dayOfWeekNameAr || "-"

  const completionLabel = dayData?.isComplete
    ? t("roster.completed") || "Completed"
    : t("roster.incomplete") || "Incomplete"

  const stats = useMemo(
    () => [
      {
        icon: Users,
        label: t("department.required") || "Required",
        value: totalRequired,
        tone: "blue",
      },
      {
        icon: UserCheck,
        label: t("department.assigned") || "Assigned",
        value: totalAssigned,
        tone: "emerald",
      },
      {
        icon: AlertCircle,
        label: t("department.shortfall") || "Shortfall",
        value: totalShortfall,
        tone: totalShortfall > 0 ? "red" : "slate",
      },
    ],
    [t, totalRequired, totalAssigned, totalShortfall]
  )

  return (
    <div className={`${theme.card} overflow-hidden`} dir={isRTL ? "rtl" : "ltr"}>
      <button
        type="button"
        onClick={() => setIsExpanded((prev) => !prev)}
        className="w-full p-4 text-start hover:bg-[var(--color-success)] hover:text-white transition-colors group"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 min-w-0">
            <IconBox icon={Clock} tone={completionTone} />

            <div className="min-w-0">
              <h3 className="text-lg font-black text-[var(--color-text)] group-hover:text-white">
                {formatDate(dayData?.date)}
              </h3>

              <p className="text-sm font-bold text-[var(--color-text-muted)] group-hover:text-white/80 mt-1">
                {dayName}
              </p>

              <div className="flex flex-wrap items-center gap-2 mt-3">
                <Badge tone={completionTone}>{completionPercentage}%</Badge>
                <Badge tone={dayData?.isComplete ? "emerald" : "amber"}>
                  {completionLabel}
                </Badge>

                <span className="text-xs font-bold text-[var(--color-text-muted)] group-hover:text-white/80">
                  {totalAssigned}/{totalRequired} {t("roster.doctors") || "Doctors"}
                </span>
              </div>
            </div>
          </div>

          <span className="w-10 h-10 rounded-xl border-2 border-slate-500 text-slate-500 bg-transparent flex items-center justify-center shrink-0 group-hover:border-white group-hover:text-white">
            {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </span>
        </div>
      </button>

      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isExpanded ? "max-h-[1400px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="p-4 border-t border-[var(--color-border)] space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {stats.map((item) => (
              <div key={item.label} className={`${theme.cardSoft} p-3`}>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xl font-black text-[var(--color-text)]">
                      {item.value}
                    </p>
                    <p className="text-xs font-bold text-[var(--color-text-muted)] mt-1">
                      {item.label}
                    </p>
                  </div>
                  <IconBox icon={item.icon} tone={item.tone} size="sm" />
                </div>
              </div>
            ))}
          </div>

          {shifts.length > 0 ? (
            <div className="space-y-3 max-h-[520px] overflow-y-auto pe-2">
              <div className="flex items-center gap-2">
                <IconBox icon={Timer} tone="blue" size="sm" />
                <h4 className="text-sm font-black text-[var(--color-text)]">
                  {t("roster.shifts") || "Shifts"} ({shifts.length})
                </h4>
              </div>

              {shifts.map((shift, index) => {
                const shiftName =
                  currentLang === "ar"
                    ? shift.shiftNameAr || shift.shiftNameEn || "-"
                    : shift.shiftNameEn || shift.shiftNameAr || "-"

                const contractingType =
                  currentLang === "ar"
                    ? shift.contractingTypeNameAr || shift.contractingTypeNameEn || "-"
                    : shift.contractingTypeNameEn || shift.contractingTypeNameAr || "-"

                const shortfall = Number(shift.shortfallDoctors || 0)
                const assigned = Number(shift.assignedDoctors || 0)
                const required = Number(shift.requiredDoctors || 0)
                const doctors = Array.isArray(shift.doctors) ? shift.doctors : []

                return (
                  <div key={`${shift.workingHoursId || shift.id || index}`} className={`${theme.cardSoft} p-4`}>
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div className="flex items-start gap-3 min-w-0">
                        <IconBox icon={Stethoscope} tone={shortfall > 0 ? "red" : "emerald"} size="sm" />

                        <div className="min-w-0">
                          <h5 className="font-black text-[var(--color-text)]">
                            {shiftName}
                          </h5>
                          <p className="text-xs font-bold text-[var(--color-text-muted)] mt-1">
                            {contractingType}
                          </p>
                          <p className="text-xs font-bold text-[var(--color-text-muted)] mt-1">
                            {formatTime(shift.startTime)} - {formatTime(shift.endTime)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge tone={shortfall > 0 ? "red" : "emerald"}>
                          {assigned}/{required}
                        </Badge>
                        {shortfall > 0 && (
                          <Badge tone="red">
                            -{shortfall} {t("department.shortfall") || "Shortfall"}
                          </Badge>
                        )}
                      </div>
                    </div>

                    {doctors.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-[var(--color-border)] space-y-2">
                        <p className="text-xs font-black text-[var(--color-text-muted)]">
                          {t("roster.assignedDoctors") || "Assigned Doctors"}:
                        </p>

                        {doctors.map((doctor, docIndex) => {
                          const AttendanceIcon = getAttendanceIcon(doctor.attendance?.status)
                          const attendanceTone = getStatusTone(doctor.attendance?.status)
                          const assignmentTone = getStatusTone(doctor.assignmentStatus)

                          return (
                            <div
                              key={`${doctor.doctorId || doctor.id || docIndex}`}
                              className="flex items-center justify-between gap-3 p-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]"
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <IconBox icon={UserCheck} tone="blue" size="sm" />
                                <div className="min-w-0">
                                  <p className="text-sm font-black text-[var(--color-text)] truncate">
                                    {getName(doctor, currentLang)}
                                  </p>
                                  <div className="flex flex-wrap gap-1.5 mt-1">
                                    {doctor.assignmentStatus && (
                                      <Badge tone={assignmentTone}>{doctor.assignmentStatus}</Badge>
                                    )}
                                    {doctor.attendance?.status && (
                                      <Badge tone={attendanceTone}>
                                        <AttendanceIcon className="w-3 h-3" />
                                        {doctor.attendance.status}
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          ) : (
            <div className={`${theme.cardSoft} p-6 text-center`}>
              <IconBox icon={AlertCircle} tone="slate" />
              <p className="text-sm font-bold text-[var(--color-text-muted)] mt-3">
                {t("roster.noShifts") || "No shifts for this day"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default CollapsibleDateCardForDepartment