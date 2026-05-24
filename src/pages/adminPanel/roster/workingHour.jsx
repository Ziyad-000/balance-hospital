// workingHour.jsx
import React, { useEffect } from "react"
import i18next from "i18next"
import { useTranslation } from "react-i18next"
import { useDispatch, useSelector } from "react-redux"
import { useParams, useNavigate } from "react-router-dom"
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  Clock,
  Users,
  Building,
  AlertCircle,
  CheckCircle,
  User,
  Target,
  FileText,
  Briefcase,
  Timer,
  UserCheck,
  Edit,
  UserPlus,
} from "lucide-react"
import { getWorkingHour } from "../../../state/act/actRosterManagement"
import LoadingGetData from "../../../components/LoadingGetData"
import { formatDate } from "../../../utils/formtDate"
import { getPageTheme } from "../../../utils/themeClasses"

function WorkingHour() {
  const { workingHourId } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const theme = getPageTheme()

  const { workingHour, loading, errors } = useSelector(
    (state) => state.rosterManagement
  )

  const { t } = useTranslation()
  const currentLang = i18next.language
  const isRTL = currentLang === "ar"

  const handleNavigateToSchedule = (doctor) => {
    navigate(`/admin-panel/rosters/doctors/${doctor.doctorId}`)
  }

  useEffect(() => {
    if (workingHourId) {
      dispatch(getWorkingHour({ workingHourId }))
    }
  }, [dispatch, workingHourId])

  const formatTime = (timeString) => {
    if (!timeString) return "-"

    const time = new Date(timeString)

    return time.toLocaleTimeString(currentLang === "ar" ? "ar-SA" : "en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })
  }

  const getFillColor = (percentage) => {
    if (percentage >= 80) return "text-green-600 dark:text-green-400"
    if (percentage >= 50) return "text-yellow-600 dark:text-yellow-400"
    if (percentage >= 25) return "text-orange-600 dark:text-orange-400"
    return "text-red-600 dark:text-red-400"
  }

  const getFillBgColor = (percentage) => {
    if (percentage >= 80) return "bg-green-500"
    if (percentage >= 50) return "bg-yellow-500"
    if (percentage >= 25) return "bg-orange-500"
    return "bg-red-500"
  }

  const iconColors = {
    clock: "text-blue-600 dark:text-blue-400",
    calendar: "text-blue-600 dark:text-blue-400",
    target: "text-blue-600 dark:text-blue-400",
    userCheck: "text-green-600 dark:text-green-400",
    building: "text-green-600 dark:text-green-400",
    users: "text-orange-600 dark:text-orange-400",
    briefcase: "text-purple-600 dark:text-purple-400",
    user: "text-orange-600 dark:text-orange-400",
    file: "text-slate-500 dark:text-slate-400",
    danger: "text-red-600 dark:text-red-400",
    success: "text-green-600 dark:text-green-400",
  }

  const iconBg = {
    clock: "bg-blue-100 dark:bg-blue-900/30",
    target: "bg-blue-100 dark:bg-blue-900/30",
    userCheck: "bg-green-100 dark:bg-green-900/30",
    building: "bg-green-100 dark:bg-green-900/30",
    users: "bg-orange-100 dark:bg-orange-900/30",
    briefcase: "bg-purple-100 dark:bg-purple-900/30",
    user: "bg-orange-100 dark:bg-orange-900/30",
    file: "bg-slate-100 dark:bg-slate-800",
  }

  const InfoRow = ({ icon: Icon, iconClass, label, value, subValue }) => (
    <div className="flex items-start gap-3">
      <Icon className={`h-5 w-5 mt-0.5 shrink-0 ${iconClass}`} />

      <div>
        <p className="font-semibold text-[var(--color-text)]">{label}</p>

        <p className="text-sm text-[var(--color-text-muted)]">{value}</p>

        {subValue && (
          <p className="text-xs text-[var(--color-text-soft)]">{subValue}</p>
        )}
      </div>
    </div>
  )

  const StatCard = ({ icon: Icon, iconClass, bgClass, label, value, valueClass }) => (
    <div className={`${theme.card} p-6`}>
      <div className="flex items-center justify-between gap-4">
        <div>
          <p
            className={`text-2xl font-bold ${
              valueClass || "text-[var(--color-text)]"
            }`}
          >
            {value}
          </p>

          <p className="text-sm text-[var(--color-text-muted)]">{label}</p>
        </div>

        <div className={`p-3 rounded-xl ${bgClass}`}>
          <Icon className={`h-8 w-8 ${iconClass}`} />
        </div>
      </div>
    </div>
  )

  if (loading?.fetch) {
    return <LoadingGetData text={t("gettingData.workingHour")} />
  }

  if (errors.workingHours) {
    return (
      <div className={theme.page} dir={isRTL ? "rtl" : "ltr"}>
        <div className="max-w-6xl mx-auto">
          <div className={`${theme.card} p-6`}>
            <div className="text-center py-12">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />

              <div className="text-red-500 text-lg mb-4">
                {errors.workingHours}
              </div>

              <button
                onClick={() => navigate(-1)}
                className={theme.primaryButton}
                type="button"
              >
                {isRTL ? <ArrowRight size={16} /> : <ArrowLeft size={16} />}

                <span className={isRTL ? "mr-2" : "ml-2"}>
                  {t("common.goBack")}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!workingHour) {
    return (
      <div
        className="flex items-center justify-center min-h-screen bg-[var(--color-bg)]"
        dir={isRTL ? "rtl" : "ltr"}
      >
        <div className="text-center text-[var(--color-text-muted)]">
          <p>{t("roster.workingHours.error.notFound")}</p>
        </div>
      </div>
    )
  }

  return (
    <div className={theme.page} dir={isRTL ? "rtl" : "ltr"}>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center px-3 py-2 text-sm font-medium text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
              type="button"
            >
              {isRTL ? <ArrowRight size={16} /> : <ArrowLeft size={16} />}

              <span className={isRTL ? "mr-2" : "ml-2"}>
                {t("common.goBack")}
              </span>
            </button>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() =>
                  navigate(
                    `/admin-panel/rosters/working-hours/${workingHourId}/edit`
                  )
                }
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                type="button"
              >
                <Edit size={16} />
                {t("common.edit")}
              </button>

              <button
                onClick={() =>
                  navigate(
                    `/admin-panel/rosters/working-hours/${workingHourId}/assign-doctors`
                  )
                }
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                type="button"
              >
                <UserPlus size={16} />
                {t("roster.actions.assignDoctor")}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-4 mb-4">
            <div className={`p-3 rounded-xl ${iconBg.clock}`}>
              <Clock className={`h-8 w-8 ${iconColors.clock}`} />
            </div>

            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-[var(--color-text)] mb-2">
                {t("roster.workingHours.titlee")}
              </h1>

              <p className="text-sm text-[var(--color-text-muted)]">
                {formatDate(workingHour.shiftDate)} -{" "}
                {workingHour.dayOfWeekName}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <StatCard
            icon={Target}
            iconClass={iconColors.target}
            bgClass={iconBg.target}
            value={workingHour.requiredDoctors}
            label={t("roster.workingHours.fields.requiredDoctors")}
          />

          <StatCard
            icon={UserCheck}
            iconClass={iconColors.userCheck}
            bgClass={iconBg.userCheck}
            value={workingHour.currentAssignedDoctors}
            label={t("roster.assignedDoctors")}
          />

          <StatCard
            icon={Users}
            iconClass={iconColors.users}
            bgClass={iconBg.users}
            value={workingHour.remainingSlots}
            label={t("roster.remainingSlots")}
          />

          <StatCard
            icon={Timer}
            iconClass={getFillColor(workingHour.fillPercentage)}
            bgClass="bg-[var(--color-bg-soft)]"
            value={`${Math.round(workingHour.fillPercentage)}%`}
            valueClass={getFillColor(workingHour.fillPercentage)}
            label={t("roster.fillPercentage")}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className={`${theme.card} p-6 mb-6`}>
              <h2 className="text-xl font-semibold text-[var(--color-text)] mb-6">
                {t("roster.workingHours.titlee")}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <InfoRow
                    icon={Calendar}
                    iconClass={iconColors.calendar}
                    label={t("common.date")}
                    value={formatDate(workingHour.shiftDate)}
                    subValue={workingHour.dayOfWeekName}
                  />

                  <InfoRow
                    icon={Building}
                    iconClass={iconColors.building}
                    label={t("common.department")}
                    value={
                      currentLang === "en"
                        ? workingHour.department.nameEnglish
                        : workingHour.department.nameArabic
                    }
                  />
                </div>

                <div className="space-y-4">
                  <InfoRow
                    icon={Briefcase}
                    iconClass={iconColors.briefcase}
                    label={t("adminPanel.shiftHours")}
                    value={
                      currentLang === "en"
                        ? workingHour.shift.nameEnglish
                        : workingHour.shift.nameArabic
                    }
                    subValue={`${workingHour.shift.period} (${workingHour.shift.hours}h)`}
                  />

                  <InfoRow
                    icon={User}
                    iconClass={iconColors.user}
                    label={t("roster.contractingTypes.fields.contractingTypes")}
                    value={
                      currentLang === "en"
                        ? workingHour.contractingType.nameEnglish
                        : workingHour.contractingType.nameArabic
                    }
                  />
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-[var(--color-border)]">
                <div className="flex flex-wrap items-center gap-4">
                  {workingHour.isFullyBooked && (
                    <span className="inline-flex items-center px-3 py-1 text-sm font-semibold rounded-full bg-[var(--color-success-soft)] text-[var(--color-success)] border border-[var(--color-success)]/20">
                      <CheckCircle
                        size={16}
                        className={isRTL ? "ml-2" : "mr-2"}
                      />
                      {t("roster.fullyBooked")}
                    </span>
                  )}

                  {workingHour.isOverBooked && (
                    <span className="inline-flex items-center px-3 py-1 text-sm font-semibold rounded-full bg-[var(--color-danger-soft)] text-[var(--color-danger)] border border-[var(--color-danger)]/20">
                      <AlertCircle
                        size={16}
                        className={isRTL ? "ml-2" : "mr-2"}
                      />
                      {t("roster.overBooked")}
                    </span>
                  )}

                  <div className="flex items-center gap-2">
                    <span
                      className={`text-sm font-semibold ${getFillColor(
                        workingHour.fillPercentage
                      )}`}
                    >
                      {Math.round(workingHour.fillPercentage)}%{" "}
                      {t("roster.filled")}
                    </span>

                    <div className="w-24 bg-[var(--color-bg-soft)] rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${getFillBgColor(
                          workingHour.fillPercentage
                        )}`}
                        style={{
                          width: `${Math.min(
                            workingHour.fillPercentage,
                            100
                          )}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {workingHour.notes && (
                <div className="mt-6 pt-6 border-t border-[var(--color-border)]">
                  <div className="flex items-start gap-3">
                    <FileText
                      className={`h-5 w-5 mt-0.5 ${iconColors.file}`}
                    />

                    <div>
                      <p className="font-semibold text-[var(--color-text)] mb-2">
                        {t("common.notes")}
                      </p>

                      <p className="text-sm text-[var(--color-text-muted)]">
                        {workingHour.notes}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div>
            <div className={`${theme.card} p-6`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-[var(--color-text)]">
                  {t("roster.assignedDoctors")}
                </h3>

                <span className="text-sm text-[var(--color-text-muted)]">
                  {workingHour.assignedDoctors?.length || 0}/
                  {workingHour.maxDoctors}
                </span>
              </div>

              {workingHour.assignedDoctors &&
              workingHour.assignedDoctors.length > 0 ? (
                <div className="space-y-3">
                  {workingHour.assignedDoctors.map((doctor, index) => (
                    <div key={index} className={`${theme.cardSoft} p-3`}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div
                            className={`p-2 rounded-full ${iconBg.user}`}
                          >
                            <User
                              size={16}
                              className={iconColors.user}
                            />
                          </div>

                          <div>
                            <p className="font-semibold text-[var(--color-text)]">
                              {currentLang === "en"
                                ? doctor.doctorNameEn
                                : doctor.doctorNameAr}
                            </p>

                            <p className="text-xs text-[var(--color-text-muted)]">
                              {doctor.contractingTypeName}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2">
                          <span
                            className={`text-xs px-2 py-1 rounded-full border ${
                              doctor.assignmentMethod === "MANUAL"
                                ? "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800"
                                : "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800"
                            }`}
                          >
                            {doctor.assignmentMethod}
                          </span>

                          <button
                            onClick={() => handleNavigateToSchedule(doctor)}
                            className="px-3 py-1 text-xs rounded-md bg-blue-600 hover:bg-blue-700 text-white transition-colors"
                            type="button"
                          >
                            {t("roster.doctorSchedule.title")}
                          </button>
                        </div>
                      </div>

                      <div className="mt-2 pt-2 border-t border-[var(--color-border)]">
                        <div className="flex items-center justify-between gap-3 text-xs text-[var(--color-text-muted)]">
                          <span>
                            {t("roster.workingHours.assignedBy")}:{" "}
                            {doctor.assignedByName}
                          </span>

                          <span>{formatTime(doctor.assignedAt)}</span>
                        </div>

                        {doctor.notes && (
                          <p className="text-xs mt-1 text-[var(--color-text-soft)]">
                            {doctor.notes}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 mx-auto mb-3 text-[var(--color-text-soft)]" />

                  <p className="text-sm text-[var(--color-text-muted)]">
                    {t("roster.noAssignedDoctors")}
                  </p>
                </div>
              )}
            </div>

            <div className={`${theme.card} mt-6 p-6`}>
              <h3 className="text-lg font-semibold text-[var(--color-text)] mb-4">
                {t("specificCategory.sections.metadata.title")}
              </h3>

              <div className="space-y-3">
                <div>
                  <p className="text-sm font-semibold text-[var(--color-text)]">
                    {t("roster.details.createdAt")}
                  </p>

                  <p className="text-sm text-[var(--color-text-muted)]">
                    {formatTime(workingHour.createdAt)}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-semibold text-[var(--color-text)]">
                    {t("roster.details.createdBy")}
                  </p>

                  <p className="text-sm text-[var(--color-text-muted)]">
                    {workingHour.createdByName}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default WorkingHour