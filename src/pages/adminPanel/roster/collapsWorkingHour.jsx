import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import {
  Calendar,
  Users,
  Building,
  AlertCircle,
  CheckCircle,
  User,
  Target,
  FileText,
  Eye,
  Briefcase,
  Edit,
  UserPlus,
  ChevronDown,
  ChevronRight,
} from "lucide-react"
import { getPageTheme } from "../../../utils/themeClasses"

const CollapsibleDateCard = ({
  dayData,
  formatDate,
  formatTime,
  getFillColor,
  getFillBgColor,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(true)
  const navigate = useNavigate()
  const { t, i18n } = useTranslation()
  const theme = getPageTheme()

  const isRTL = i18n.language === "ar"
  const currentLang = i18n.language || "ar"

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed)
  }

  const iconColors = {
    calendar: "text-blue-500 dark:text-blue-500",
    building: "text-emerald-500 dark:text-emerald-500",
    briefcase: "text-violet-500 dark:text-violet-500",
    user: "text-orange-500 dark:text-orange-500",
    users: "text-blue-500 dark:text-blue-500",
    file: "text-slate-500 dark:text-slate-500",
    view: "text-blue-500 dark:text-blue-500",
    edit: "text-emerald-500 dark:text-emerald-500",
    assign: "text-violet-500 dark:text-violet-500",
    success: "text-emerald-500 dark:text-emerald-500",
    danger: "text-red-500 dark:text-red-500",
  }

  const iconBg = {
    calendar: "bg-transparent dark:bg-transparent border-2 border-blue-500 dark:border-blue-500",
    building: "bg-transparent dark:bg-transparent border-2 border-emerald-500 dark:border-emerald-500",
    briefcase: "bg-transparent dark:bg-transparent border-2 border-violet-500 dark:border-violet-500",
    user: "bg-transparent dark:bg-transparent border-2 border-orange-500 dark:border-orange-500",
    users: "bg-transparent dark:bg-transparent border-2 border-blue-500 dark:border-blue-500",
    file: "bg-transparent dark:bg-transparent border-2 border-slate-500 dark:border-slate-500",
  }

  const actionButtonClass = {
    view:
      "bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500",
    edit:
      "bg-green-600 hover:bg-green-700 text-white focus:ring-green-500",
    assign:
      "bg-purple-600 hover:bg-purple-700 text-white focus:ring-purple-500",
  }

  return (
    <div className={`${theme.card} overflow-hidden`}>
      <div
        className={`p-6 border-b ${theme.divider} cursor-pointer ${theme.hoverRow}`}
        onClick={toggleCollapse}
      >
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <div
              className={`p-3 rounded-xl shrink-0 ${iconBg.calendar} ${iconColors.calendar}`}
            >
              <Calendar className="h-6 w-6" />
            </div>

            <div className="min-w-0">
              <h2 className="text-xl font-bold text-[var(--color-text)] truncate">
                {formatDate(dayData.date)}
              </h2>

              <p className="text-sm text-[var(--color-text-muted)]">
                {dayData.dayOfWeekName}
              </p>
            </div>
          </div>

          <div className="flex items-center text-[var(--color-text-muted)]">
            {isCollapsed ? (
              <ChevronRight className="h-5 w-5 transition-transform duration-200" />
            ) : (
              <ChevronDown className="h-5 w-5 transition-transform duration-200" />
            )}
          </div>
        </div>
      </div>

      {!isCollapsed && (
        <div className="p-6 space-y-6">
          {dayData.departments.map((department) => (
            <div key={department.departmentId} className="space-y-4">
              <div className="flex items-center gap-3">
                <div
                  className={`h-9 w-9 rounded-lg flex items-center justify-center ${iconBg.building}`}
                >
                  <Building className={`h-5 w-5 ${iconColors.building}`} />
                </div>

                <h3 className="text-lg font-semibold text-[var(--color-text)]">
                  {department.departmentName}
                </h3>
              </div>

              <div className={`${isRTL ? "mr-0 md:mr-8" : "ml-0 md:ml-8"} space-y-4`}>
                {department.shifts.map((shift) => (
                  <div key={shift.shiftId} className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`h-8 w-8 rounded-lg flex items-center justify-center ${iconBg.briefcase}`}
                      >
                        <Briefcase
                          className={`h-4 w-4 ${iconColors.briefcase}`}
                        />
                      </div>

                      <div>
                        <h4 className="font-semibold text-[var(--color-text)]">
                          {shift.shiftName}
                        </h4>

                        <p className="text-sm text-[var(--color-text-muted)]">
                          {shift.shiftPeriod} ({shift.hours}h) •{" "}
                          {formatTime(shift.startTime)} -{" "}
                          {formatTime(shift.endTime)}
                        </p>
                      </div>
                    </div>

                    <div className={`${isRTL ? "mr-0 md:mr-6" : "ml-0 md:ml-6"} space-y-3`}>
                      {shift.contractingTypes.map((contractingType) => {
                        const detail = contractingType.workingHourDetail

                        return (
                          <div
                            key={`${contractingType.contractingTypeId}-${detail.id}`}
                            className={`${theme.cardSoft} p-4`}
                          >
                            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-3">
                                  <div
                                    className={`h-8 w-8 rounded-lg flex items-center justify-center ${iconBg.user}`}
                                  >
                                    <User
                                      className={`h-4 w-4 ${iconColors.user}`}
                                    />
                                  </div>

                                  <span className="font-semibold text-[var(--color-text)]">
                                    {contractingType.contractingTypeName}
                                  </span>
                                </div>

                                <div className="flex flex-wrap items-center gap-4 mb-3">
                                  <div className="flex items-center gap-2">
                                    <Users
                                      className={`h-4 w-4 ${iconColors.users}`}
                                    />

                                    <span className="text-sm text-[var(--color-text)]">
                                      {detail.currentAssignedDoctors}/
                                      {detail.requiredDoctors}{" "}
                                      {t("roster.required")}
                                    </span>
                                  </div>

                                  <div className="flex items-center gap-2">
                                    <Target
                                      className={`h-4 w-4 ${getFillColor(
                                        detail.fillPercentage
                                      )}`}
                                    />

                                    <span
                                      className={`text-sm font-semibold ${getFillColor(
                                        detail.fillPercentage
                                      )}`}
                                    >
                                      {Math.round(detail.fillPercentage)}%{" "}
                                      {t("roster.filled")}
                                    </span>
                                  </div>

                                  <span className="text-sm text-[var(--color-text-muted)]">
                                    {t("roster.workingHours.fields.maxDoctors")}
                                    : {detail.maxDoctors}
                                  </span>

                                  <span className="text-sm text-[var(--color-text-muted)]">
                                    {t("roster.remainingSlots")}:{" "}
                                    {detail.remainingSlots}
                                  </span>
                                </div>

                                <div className="flex flex-wrap items-center gap-2">
                                  {detail.isFullyBooked && (
                                    <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-transparent text-emerald-500 border-2 border-emerald-500 shadow-sm">
                                      <CheckCircle
                                        size={12}
                                        className={isRTL ? "ml-1" : "mr-1"}
                                      />
                                      {t("roster.fullyBooked")}
                                    </span>
                                  )}

                                  {detail.isOverBooked && (
                                    <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-transparent text-red-500 border-2 border-red-500 shadow-sm">
                                      <AlertCircle
                                        size={12}
                                        className={isRTL ? "ml-1" : "mr-1"}
                                      />
                                      {t("roster.overBooked")}
                                    </span>
                                  )}
                                </div>
                              </div>

                              <div className="flex flex-col items-start lg:items-end gap-4">
                                <div className="w-full lg:w-36">
                                  <div className="flex justify-between items-center mb-1">
                                    <span className="text-xs text-[var(--color-text-muted)]">
                                      {t("roster.progress")}
                                    </span>

                                    <span
                                      className={`text-xs font-semibold ${getFillColor(
                                        detail.fillPercentage
                                      )}`}
                                    >
                                      {Math.round(detail.fillPercentage)}%
                                    </span>
                                  </div>

                                  <div className="w-full bg-[var(--color-bg-soft)] rounded-full h-2">
                                    <div
                                      className={`h-2 rounded-full transition-all duration-300 ${getFillBgColor(
                                        detail.fillPercentage
                                      )}`}
                                      style={{
                                        width: `${Math.min(
                                          detail.fillPercentage,
                                          100
                                        )}%`,
                                      }}
                                    />
                                  </div>
                                </div>

                                <div className="flex flex-wrap gap-2">
                                  <button
                                    onClick={() => {
                                      navigate(
                                        `/admin-panel/rosters/working-hours/${detail.id}`
                                      )
                                    }}
                                    className={`px-3 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors focus:outline-none focus:ring-2 ${actionButtonClass.view}`}
                                    type="button"
                                  >
                                    <Eye size={14} />
                                    {t("common.view")}
                                  </button>

                                  <button
                                    onClick={() =>
                                      navigate(
                                        `/admin-panel/rosters/working-hours/${detail.id}/edit`
                                      )
                                    }
                                    className={`px-3 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors focus:outline-none focus:ring-2 ${actionButtonClass.edit}`}
                                    type="button"
                                  >
                                    <Edit size={14} />
                                    {t("common.edit")}
                                  </button>

                                  <button
                                    onClick={() => {
                                      localStorage.setItem(
                                        "scientficDoctorRequired",
                                        contractingType.contractingTypeNameEn
                                      )

                                      navigate(
                                        `/admin-panel/rosters/working-hours/${detail.id}/assign-doctors`
                                      )
                                    }}
                                    className={`px-3 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors focus:outline-none focus:ring-2 ${actionButtonClass.assign}`}
                                    aria-label={t(
                                      "roster.actions.assignDoctor"
                                    )}
                                    title={t("roster.actions.assignDoctor")}
                                    type="button"
                                  >
                                    <UserPlus size={14} />
                                    {t("roster.actions.assignDoctor")}
                                  </button>
                                </div>
                              </div>
                            </div>

                            {detail.assignedDoctors &&
                              detail.assignedDoctors.length > 0 && (
                                <div className="mt-4 pt-4 border-t border-[var(--color-border)]">
                                  <div className="flex items-center justify-between mb-2">
                                    <h5 className="text-sm font-semibold text-[var(--color-text)]">
                                      {t("roster.assignedDoctors")} (
                                      {detail.assignedDoctors.length})
                                    </h5>
                                  </div>

                                  <div className="flex flex-wrap gap-2">
                                    {detail.assignedDoctors
                                      .slice(0, 4)
                                      .map((doctor, index) => (
                                        <span
                                          key={index}
                                          className="inline-flex items-center px-2 py-1 text-xs rounded-full bg-transparent text-slate-500 border-2 border-slate-500 shadow-sm"
                                        >
                                          <User
                                            size={10}
                                            className={isRTL ? "ml-1" : "mr-1"}
                                          />
                                          {currentLang === "en"
                                            ? doctor.doctorNameEn
                                            : doctor.doctorNameAr}
                                        </span>
                                      ))}

                                    {detail.assignedDoctors.length > 4 && (
                                      <span className="inline-flex items-center px-2 py-1 text-xs rounded-full bg-transparent text-blue-500 border-2 border-blue-500 shadow-sm">
                                        +{detail.assignedDoctors.length - 4}{" "}
                                        {t("common.more")}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              )}

                            {detail.notes && (
                              <div className="mt-4 pt-4 border-t border-[var(--color-border)]">
                                <div className="flex items-start gap-2">
                                  <FileText
                                    className={`h-4 w-4 mt-0.5 ${iconColors.file}`}
                                  />

                                  <div>
                                    <p className="text-sm font-semibold text-[var(--color-text)] mb-1">
                                      {t("common.notes")}
                                    </p>

                                    <p className="text-sm text-[var(--color-text-muted)]">
                                      {detail.notes}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default CollapsibleDateCard