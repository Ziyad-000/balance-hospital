import React, { useState } from "react"
import { useTranslation } from "react-i18next"
import {
  ChevronDown,
  ChevronRight,
  User,
  Stethoscope,
  Clock,
  Users,
  Building,
  FileText,
  CheckCircle,
  XCircle,
  Timer,
  AlertCircle,
  MapPin,
  Briefcase,
  Eye,
} from "lucide-react"
import { useNavigate } from "react-router-dom"
import { getPageTheme } from "../../../utils/themeClasses"

const CollapsibleDoctorCard = ({ doctorData }) => {
  const [isCollapsed, setIsCollapsed] = useState(true)
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const theme = getPageTheme()

  const currentLang = i18n.language || "ar"

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed)
  }

  const getStatusColor = (count, type) => {
    if (type === "present" && count > 0) {
      return "text-emerald-500"
    }

    if (type === "noShow" && count > 0) {
      return "text-red-500"
    }

    if (type === "late" && count > 0) {
      return "text-amber-500"
    }

    return "text-slate-500"
  }

  const getStatusSoftBg = (type) => {
    switch (type) {
      case "present":
        return "bg-transparent border border-emerald-500"
      case "noShow":
        return "bg-transparent border border-red-500"
      case "late":
        return "bg-transparent border border-amber-500"
      case "pending":
        return "bg-transparent border border-blue-500"
      default:
        return "bg-transparent border border-slate-500"
    }
  }

  const getStatusIcon = (type) => {
    switch (type) {
      case "present":
        return <CheckCircle className="h-4 w-4" />
      case "noShow":
        return <XCircle className="h-4 w-4" />
      case "late":
        return <Timer className="h-4 w-4" />
      default:
        return <AlertCircle className="h-4 w-4" />
    }
  }

  const StatCard = ({ icon: Icon, label, value, tone = "primary" }) => {
    const toneClasses = {
      primary: {
        box: "bg-transparent border border-blue-500",
        icon: "text-blue-500",
      },
      secondary: {
        box: "bg-transparent border border-slate-500",
        icon: "text-slate-500",
      },
      success: {
        box: "bg-transparent border border-emerald-500",
        icon: "text-emerald-500",
      },
      warning: {
        box: "bg-transparent border border-amber-500",
        icon: "text-amber-500",
      },
      info: {
        box: "bg-transparent border border-cyan-500",
        icon: "text-cyan-500",
      },
    }

    const selectedTone = toneClasses[tone] || toneClasses.primary

    return (
      <div className={`${theme.cardSoft} p-4`}>
        <div className="flex items-center gap-2 mb-2">
          <div
            className={`h-8 w-8 rounded-lg flex items-center justify-center shadow-sm ${selectedTone.box}`}
          >
            <Icon className={`h-4 w-4 ${selectedTone.icon}`} />
          </div>

          <span className="text-sm font-medium text-[var(--color-text-muted)]">
            {label}
          </span>
        </div>

        <div className="text-2xl font-bold text-[var(--color-text)]">
          {value}
        </div>
      </div>
    )
  }

  const BreakdownRow = ({ icon: Icon, title, assignments, hours, tone = "primary" }) => {
    const toneClasses = {
      primary: "text-blue-500 bg-transparent border border-blue-500",
      secondary: "text-slate-500 bg-transparent border border-slate-500",
      success: "text-emerald-500 bg-transparent border border-emerald-500",
      warning: "text-amber-500 bg-transparent border border-amber-500",
      info: "text-cyan-500 bg-transparent border border-cyan-500",
    }

    return (
      <div className={`${theme.cardSoft} p-3`}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className={`h-8 w-8 rounded-lg flex items-center justify-center shadow-sm ${
                toneClasses[tone] || toneClasses.primary
              }`}
            >
              <Icon className="h-4 w-4" />
            </div>

            <span className="font-medium text-[var(--color-text)]">
              {title}
            </span>
          </div>

          <div className="flex items-center gap-4 text-sm text-[var(--color-text-muted)]">
            <span>
              {assignments} {t("roster.assignments")}
            </span>
            <span>
              {hours} {t("roster.hours")}
            </span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`${theme.card} overflow-hidden`}>
      <div
        className={`p-6 border-b ${theme.divider} cursor-pointer ${theme.hoverRow}`}
        onClick={toggleCollapse}
      >
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <div className="p-3 bg-transparent text-blue-500 border border-blue-500 rounded-xl shrink-0 shadow-sm">
              <User className="h-6 w-6" />
            </div>

            <div className="min-w-0">
              <h3 className="text-xl font-bold text-[var(--color-text)] truncate">
                {currentLang === "en"
                  ? doctorData.doctorNameEn
                  : doctorData.doctorNameAr}
              </h3>

              <div className="flex items-center gap-2 mt-1 text-[var(--color-text-muted)]">
                <Stethoscope className="h-4 w-4 shrink-0" />
                <p className="text-sm truncate">
                  {currentLang === "en"
                    ? doctorData.specialtyEn
                    : doctorData.specialtyAr}
                </p>
              </div>

              <div className="flex items-center gap-2 mt-1 text-[var(--color-text-muted)]">
                <MapPin className="h-4 w-4 shrink-0" />
                <p className="text-sm truncate">
                  {currentLang === "en"
                    ? doctorData.categoryNameEn
                    : doctorData.categoryNameAr}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 shrink-0">
            <div className="hidden lg:flex items-center gap-4 text-sm">
              <div className="text-center">
                <div className="font-bold text-lg text-[var(--color-text)]">
                  {doctorData.totalAssignments}
                </div>
                <div className="text-xs text-[var(--color-text-muted)]">
                  {t("roster.assignments")}
                </div>
              </div>

              <div className="text-center">
                <div className="font-bold text-lg text-[var(--color-text)]">
                  {doctorData.totalHours}
                </div>
                <div className="text-xs text-[var(--color-text-muted)]">
                  {t("roster.hours")}
                </div>
              </div>

              <div className="text-center">
                <div className="font-bold text-lg text-[var(--color-text)]">
                  {doctorData.totalDepartments}
                </div>
                <div className="text-xs text-[var(--color-text-muted)]">
                  {t("roster.departments")}
                </div>
              </div>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation()
                navigate(`/admin-panel/rosters/doctors/${doctorData.doctorId}`)
              }}
              className="p-2 rounded-lg text-slate-500 border border-transparent hover:text-white hover:bg-emerald-600 hover:border-emerald-600 transition-colors"
              title={t("roster.viewDoctorDetails")}
              aria-label={t("roster.viewDoctorDetails")}
              type="button"
            >
              <Eye className="h-5 w-5" />
            </button>

            <div className="flex items-center text-[var(--color-text-muted)]">
              {isCollapsed ? (
                <ChevronRight className="h-5 w-5 transition-transform duration-200" />
              ) : (
                <ChevronDown className="h-5 w-5 transition-transform duration-200" />
              )}
            </div>
          </div>
        </div>
      </div>

      {!isCollapsed && (
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard
              icon={Users}
              label={t("roster.assignments")}
              value={doctorData.totalAssignments}
              tone="primary"
            />

            <StatCard
              icon={Clock}
              label={t("roster.hours")}
              value={doctorData.totalHours}
              tone="success"
            />

            <StatCard
              icon={Building}
              label={t("roster.departments")}
              value={doctorData.totalDepartments}
              tone="info"
            />

            <StatCard
              icon={FileText}
              label={t("roster.requests")}
              value={
                doctorData.requestsApproved +
                doctorData.requestsRejected +
                doctorData.requestsPending
              }
              tone="warning"
            />
          </div>

          <div className={`${theme.cardSoft} p-4`}>
            <h4 className="text-lg font-semibold mb-4 text-[var(--color-text)]">
              {t("roster.attendanceStats")}
            </h4>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center gap-3">
                <div
                  className={`h-8 w-8 rounded-lg flex items-center justify-center ${getStatusSoftBg(
                    "present"
                  )} ${getStatusColor(doctorData.presentCount, "present")}`}
                >
                  {getStatusIcon("present")}
                </div>

                <div>
                  <div
                    className={`font-bold ${getStatusColor(
                      doctorData.presentCount,
                      "present"
                    )}`}
                  >
                    {doctorData.presentCount}
                  </div>
                  <div className="text-xs text-[var(--color-text-muted)]">
                    {t("roster.present")}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div
                  className={`h-8 w-8 rounded-lg flex items-center justify-center ${getStatusSoftBg(
                    "noShow"
                  )} ${getStatusColor(doctorData.noShowCount, "noShow")}`}
                >
                  {getStatusIcon("noShow")}
                </div>

                <div>
                  <div
                    className={`font-bold ${getStatusColor(
                      doctorData.noShowCount,
                      "noShow"
                    )}`}
                  >
                    {doctorData.noShowCount}
                  </div>
                  <div className="text-xs text-[var(--color-text-muted)]">
                    {t("roster.noShow")}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div
                  className={`h-8 w-8 rounded-lg flex items-center justify-center ${getStatusSoftBg(
                    "late"
                  )} ${getStatusColor(doctorData.lateCount, "late")}`}
                >
                  {getStatusIcon("late")}
                </div>

                <div>
                  <div
                    className={`font-bold ${getStatusColor(
                      doctorData.lateCount,
                      "late"
                    )}`}
                  >
                    {doctorData.lateCount}
                  </div>
                  <div className="text-xs text-[var(--color-text-muted)]">
                    {t("roster.late")}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg flex items-center justify-center bg-transparent text-blue-500 border border-blue-500 shadow-sm">
                  <FileText className="h-4 w-4" />
                </div>

                <div>
                  <div className="font-bold text-blue-500">
                    {doctorData.requestsPending}
                  </div>
                  <div className="text-xs text-[var(--color-text-muted)]">
                    {t("roster.pending")}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4 text-[var(--color-text)]">
              {t("roster.byDepartment")}
            </h4>

            <div className="grid gap-3">
              {Object.entries(doctorData.byDepartment || {}).map(
                ([dept, data]) => (
                  <BreakdownRow
                    key={dept}
                    icon={Building}
                    title={dept}
                    assignments={data.assignments}
                    hours={data.hours}
                    tone="secondary"
                  />
                )
              )}
            </div>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4 text-[var(--color-text)]">
              {t("roster.byShiftType")}
            </h4>

            <div className="grid gap-3">
              {Object.entries(doctorData.byShiftType || {}).map(
                ([shiftType, data]) => (
                  <BreakdownRow
                    key={shiftType}
                    icon={Briefcase}
                    title={shiftType}
                    assignments={data.assignments}
                    hours={data.hours}
                    tone="info"
                  />
                )
              )}
            </div>
          </div>

          <div className={`${theme.cardSoft} p-4`}>
            <h4 className="text-lg font-semibold mb-4 text-[var(--color-text)]">
              {t("roster.requestSummary")}
            </h4>

            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-emerald-500">
                  {doctorData.requestsApproved}
                </div>
                <div className="text-sm text-[var(--color-text-muted)]">
                  {t("roster.approved")}
                </div>
              </div>

              <div className="text-center">
                <div className="text-2xl font-bold text-red-500">
                  {doctorData.requestsRejected}
                </div>
                <div className="text-sm text-[var(--color-text-muted)]">
                  {t("roster.rejected")}
                </div>
              </div>

              <div className="text-center">
                <div className="text-2xl font-bold text-amber-500">
                  {doctorData.requestsPending}
                </div>
                <div className="text-sm text-[var(--color-text-muted)]">
                  {t("roster.pending")}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CollapsibleDoctorCard