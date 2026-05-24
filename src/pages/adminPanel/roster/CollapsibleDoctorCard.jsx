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
      return "text-[var(--color-success)]"
    }

    if (type === "noShow" && count > 0) {
      return "text-[var(--color-danger)]"
    }

    if (type === "late" && count > 0) {
      return "text-[var(--color-warning)]"
    }

    return "text-[var(--color-text-muted)]"
  }

  const getStatusSoftBg = (type) => {
    switch (type) {
      case "present":
        return "bg-[var(--color-success-soft)]"
      case "noShow":
        return "bg-[var(--color-danger-soft)]"
      case "late":
        return "bg-[var(--color-warning-soft)]"
      case "pending":
        return "bg-[var(--color-info-soft)]"
      default:
        return "bg-[var(--color-bg-soft)]"
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
        box: "bg-[var(--color-primary-soft)]",
        icon: "text-[var(--color-primary)]",
      },
      secondary: {
        box: "bg-[var(--color-secondary-soft)]",
        icon: "text-[var(--color-secondary)]",
      },
      success: {
        box: "bg-[var(--color-success-soft)]",
        icon: "text-[var(--color-success)]",
      },
      warning: {
        box: "bg-[var(--color-warning-soft)]",
        icon: "text-[var(--color-warning)]",
      },
      info: {
        box: "bg-[var(--color-info-soft)]",
        icon: "text-[var(--color-info)]",
      },
    }

    const selectedTone = toneClasses[tone] || toneClasses.primary

    return (
      <div className={`${theme.cardSoft} p-4`}>
        <div className="flex items-center gap-2 mb-2">
          <div
            className={`h-8 w-8 rounded-lg flex items-center justify-center ${selectedTone.box}`}
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
      primary: "text-[var(--color-primary)] bg-[var(--color-primary-soft)]",
      secondary:
        "text-[var(--color-secondary)] bg-[var(--color-secondary-soft)]",
      success: "text-[var(--color-success)] bg-[var(--color-success-soft)]",
      warning: "text-[var(--color-warning)] bg-[var(--color-warning-soft)]",
      info: "text-[var(--color-info)] bg-[var(--color-info-soft)]",
    }

    return (
      <div className={`${theme.cardSoft} p-3`}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className={`h-8 w-8 rounded-lg flex items-center justify-center ${
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
            <div className="p-3 bg-[var(--color-primary-soft)] text-[var(--color-primary)] rounded-xl shrink-0">
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
              className="p-2 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-primary)] hover:bg-[var(--color-primary-soft)] transition-colors"
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
                <div className="h-8 w-8 rounded-lg flex items-center justify-center bg-[var(--color-info-soft)] text-[var(--color-info)]">
                  <FileText className="h-4 w-4" />
                </div>

                <div>
                  <div className="font-bold text-[var(--color-info)]">
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
                <div className="text-2xl font-bold text-[var(--color-success)]">
                  {doctorData.requestsApproved}
                </div>
                <div className="text-sm text-[var(--color-text-muted)]">
                  {t("roster.approved")}
                </div>
              </div>

              <div className="text-center">
                <div className="text-2xl font-bold text-[var(--color-danger)]">
                  {doctorData.requestsRejected}
                </div>
                <div className="text-sm text-[var(--color-text-muted)]">
                  {t("roster.rejected")}
                </div>
              </div>

              <div className="text-center">
                <div className="text-2xl font-bold text-[var(--color-warning)]">
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