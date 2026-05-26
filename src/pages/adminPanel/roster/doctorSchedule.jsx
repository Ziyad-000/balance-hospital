import React, { useEffect, useState } from "react"
import i18next from "i18next"
import { useTranslation } from "react-i18next"
import { useDispatch, useSelector } from "react-redux"
import { useParams, useNavigate } from "react-router-dom"
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  Clock,
  Building,
  AlertCircle,
  CheckCircle,
  User,
  Briefcase,
  Timer,
  Hash,
  UserX,
} from "lucide-react"
import { getDoctorSchedule } from "../../../state/act/actRosterManagement"
import LoadingGetData from "../../../components/LoadingGetData"
import UnAssignDoctorModal from "../../../components/modals/UnAsssignDoctorModal"
import { formatDate } from "../../../utils/formtDate"
import { getPageTheme } from "../../../utils/themeClasses"

function DoctorSchedule() {
  const { doctorId } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const theme = getPageTheme()

  const [modalOpen, setModalOpen] = useState(false)
  const [doctorData, setDoctorData] = useState({})

  const { doctorSchedule, loading, errors } = useSelector(
    (state) => state.rosterManagement
  )

  const { t } = useTranslation()
  const currentLang = i18next.language
  const isRTL = currentLang === "ar"

  const iconColors = {
    user: "text-blue-500 dark:text-blue-500",
    hash: "text-blue-500 dark:text-blue-500",
    calendar: "text-blue-500 dark:text-blue-500",
    timer: "text-emerald-500 dark:text-emerald-500",
    success: "text-emerald-500 dark:text-emerald-500",
    building: "text-emerald-500 dark:text-emerald-500",
    clock: "text-amber-500 dark:text-amber-500",
    briefcase: "text-violet-500 dark:text-violet-500",
    danger: "text-red-500 dark:text-red-500",
    muted: "text-slate-500 dark:text-slate-500",
  }

  const iconBg = {
    user: "bg-transparent dark:bg-transparent border-2 border-blue-500 dark:border-blue-500",
    calendar: "bg-transparent dark:bg-transparent border-2 border-blue-500 dark:border-blue-500",
    hash: "bg-transparent dark:bg-transparent border-2 border-blue-500 dark:border-blue-500",
    timer: "bg-transparent dark:bg-transparent border-2 border-emerald-500 dark:border-emerald-500",
    success: "bg-transparent dark:bg-transparent border-2 border-emerald-500 dark:border-emerald-500",
    clock: "bg-transparent dark:bg-transparent border-2 border-amber-500 dark:border-amber-500",
    building: "bg-transparent dark:bg-transparent border-2 border-emerald-500 dark:border-emerald-500",
    briefcase: "bg-transparent dark:bg-transparent border-2 border-violet-500 dark:border-violet-500",
  }

  useEffect(() => {
    if (doctorId) {
      dispatch(
        getDoctorSchedule({
          doctorId,
          rosterId: localStorage.getItem("rosterId"),
        })
      )
    }
  }, [dispatch, doctorId])

  const getStatusBgColor = (status) => {
    switch (status) {
      case "CONFIRMED":
      case "Confirmed":
        return "bg-transparent text-emerald-500 border-2 border-emerald-500 shadow-sm"
      case "PENDING":
      case "Pending":
        return "bg-transparent text-amber-500 border-2 border-amber-500 shadow-sm"
      case "CANCELLED":
      case "Cancelled":
        return "bg-transparent text-red-500 border-2 border-red-500 shadow-sm"
      default:
        return "bg-transparent text-slate-500 border-2 border-slate-500 shadow-sm"
    }
  }

  const StatCard = ({ icon: Icon, iconClass, bgClass, value, label }) => (
    <div className={`${theme.card} p-4`}>
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-2xl font-bold text-[var(--color-text)]">
            {value}
          </p>
          <p className="text-sm text-[var(--color-text-muted)]">{label}</p>
        </div>

        <div className={`p-3 rounded-xl ${bgClass} shadow-sm`}>
          <Icon className={`h-6 w-6 ${iconClass}`} />
        </div>
      </div>
    </div>
  )

  const ProgressRow = ({ label, count, colorClass = "bg-blue-500", max }) => {
    const safeMax = max || doctorSchedule.totalAssignments || 1
    const width = Math.min((count / safeMax) * 100, 100)

    return (
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm text-[var(--color-text-muted)]">{label}</span>

        <div className="flex items-center gap-2">
          <div className="w-16 h-2 bg-[var(--color-bg-soft)] rounded-full overflow-hidden">
            <div
              className={`h-2 rounded-full ${colorClass}`}
              style={{ width: `${width}%` }}
            />
          </div>

          <span className="text-sm font-semibold text-[var(--color-text)]">
            {count}
          </span>
        </div>
      </div>
    )
  }

  if (loading?.doctorSchedule) {
    return <LoadingGetData text={t("gettingData.doctorSchedule")} />
  }

  if (errors.doctorSchedule) {
    return (
      <div className={theme.page} dir={isRTL ? "rtl" : "ltr"}>
        <div className="max-w-6xl mx-auto">
          <div className={`${theme.card} p-6`}>
            <div className="text-center py-12">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />

              <div className="text-red-500 text-lg mb-4">
                {errors.doctorSchedule}
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

  if (!doctorSchedule) {
    return (
      <div
        className="flex items-center justify-center min-h-screen bg-[var(--color-bg)]"
        dir={isRTL ? "rtl" : "ltr"}
      >
        <div className="text-center text-[var(--color-text-muted)]">
          <p>{t("roster.doctorSchedule.error.notFound")}</p>
        </div>
      </div>
    )
  }

  const maxWeekdayCount =
    Math.max(...Object.values(doctorSchedule.weekdaysCount || { default: 1 })) ||
    1

  return (
    <div className={theme.page} dir={isRTL ? "rtl" : "ltr"}>
      <div className="max-w-7xl mx-auto">
        <UnAssignDoctorModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          doctorData={doctorData}
        />

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
          </div>

          <div className="flex items-center gap-4 mb-4">
            <div className="relative">
              {doctorSchedule.profileImageUrl ? (
                <img
                  src={doctorSchedule.profileImageUrl}
                  alt={doctorSchedule.doctorName}
                  className="w-16 h-16 rounded-full object-cover border-4 border-[var(--color-surface)] shadow-lg"
                />
              ) : (
                <div
                  className={`w-16 h-16 rounded-full flex items-center justify-center border-4 border-[var(--color-surface)] shadow-lg ${iconBg.user}`}
                >
                  <User className={`h-8 w-8 ${iconColors.user}`} />
                </div>
              )}
            </div>

            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-[var(--color-text)] mb-1">
                {currentLang === "ar" && doctorSchedule.doctorNameArabic
                  ? doctorSchedule.doctorNameArabic
                  : doctorSchedule.doctorName}
              </h1>

              <p className="text-sm text-[var(--color-text-muted)]">
                {doctorSchedule.rosterTitle}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <StatCard
            icon={Hash}
            iconClass={iconColors.hash}
            bgClass={iconBg.hash}
            value={doctorSchedule.totalAssignments}
            label={t("roster.doctorSchedule.totalAssignments")}
          />

          <StatCard
            icon={Timer}
            iconClass={iconColors.timer}
            bgClass={iconBg.timer}
            value={doctorSchedule.totalHours}
            label={t("roster.doctorSchedule.totalHours")}
          />

          <StatCard
            icon={CheckCircle}
            iconClass={iconColors.success}
            bgClass={iconBg.success}
            value={doctorSchedule.completedShifts}
            label={t("roster.doctorSchedule.completedShifts")}
          />

          <StatCard
            icon={Clock}
            iconClass={iconColors.clock}
            bgClass={iconBg.clock}
            value={doctorSchedule.pendingShifts}
            label={t("roster.doctorSchedule.pendingShifts")}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className={`${theme.card} p-6 mb-6`}>
              <div className="flex items-center justify-between mb-6 gap-4">
                <h2 className="text-xl font-semibold text-[var(--color-text)]">
                  {t("roster.doctorSchedule.assignments")}
                </h2>

                <span className="text-sm text-[var(--color-text-muted)]">
                  {doctorSchedule.assignments?.length || 0} {t("roster.shifts")}
                </span>
              </div>

              {doctorSchedule.assignments &&
              doctorSchedule.assignments.length > 0 ? (
                <div className="space-y-4">
                  {doctorSchedule.assignments.map((assignment, index) => (
                    <div
                      key={assignment.scheduleId || index}
                      className={`${theme.cardSoft} p-4 hover:shadow-[var(--shadow-md)] transition-shadow`}
                    >
                      <div className="flex items-start justify-between mb-3 gap-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`p-2 rounded-full ${iconBg.calendar} shadow-sm`}
                          >
                            <Calendar
                              size={16}
                              className={iconColors.calendar}
                            />
                          </div>

                          <div>
                            <p className="font-semibold text-[var(--color-text)]">
                              {formatDate(assignment.shiftDate)}
                            </p>

                            <p className="text-sm text-[var(--color-text-muted)]">
                              {assignment.dayOfWeekName ||
                                assignment.dayOfWeek}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span
                            className={`text-xs px-2 py-1 rounded-full font-semibold ${getStatusBgColor(
                              assignment.status
                            )}`}
                          >
                            {assignment.status}
                          </span>

                          {assignment.status !== "Cancelled" && (
                            <button
                              onClick={() => {
                                setDoctorData({
                                  name:
                                    currentLang === "en"
                                      ? doctorSchedule.doctorName
                                      : doctorSchedule.doctorNameArabic,
                                  doctorScheule: assignment.scheduleId,
                                })
                                setModalOpen(true)
                              }}
                              className="p-1.5 rounded-md transition-colors bg-red-600 hover:bg-red-700 text-white"
                              title={t("roster.actions.unAssignDoctor")}
                              type="button"
                            >
                              <UserX size={14} />
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                        <div className="flex items-center gap-2">
                          <Clock size={14} className={iconColors.clock} />

                          <span className="text-sm text-[var(--color-text)]">
                            {assignment.startTime} - {assignment.endTime}
                          </span>

                          <span className="text-xs px-2 py-1 rounded bg-[var(--color-bg-soft)] text-[var(--color-text-muted)] border border-[var(--color-border)]">
                            {assignment.shiftHours}h
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <Building size={14} className={iconColors.building} />

                          <span className="text-sm text-[var(--color-text)]">
                            {assignment.departmentName}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-4 text-[var(--color-text-muted)]">
                          <span className="inline-flex items-center gap-1">
                            <Briefcase
                              size={13}
                              className={iconColors.briefcase}
                            />
                            {assignment.shiftTypeName}
                          </span>

                          <span>{assignment.contractingTypeName}</span>
                        </div>

                        <span className="text-[var(--color-text-muted)]">
                          {t("roster.workingHours.assignedBy")}:{" "}
                          {assignment.assignedByName}
                        </span>
                      </div>

                      {assignment.notes && (
                        <div className="mt-3 pt-3 border-t border-[var(--color-border)]">
                          <p className="text-xs text-[var(--color-text-muted)]">
                            {assignment.notes}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 mx-auto mb-3 text-slate-500" />

                  <p className="text-sm text-[var(--color-text-muted)]">
                    {t("roster.doctorSchedule.noAssignments")}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div>
            <div className={`${theme.card} p-6 mb-6`}>
              <h3 className="text-lg font-semibold text-[var(--color-text)] mb-4">
                {t("roster.form.shiftType")}
              </h3>

              <div className="space-y-3">
                {Object.entries(doctorSchedule.shiftTypesCount || {}).map(
                  ([shiftType, count]) => (
                    <ProgressRow
                      key={shiftType}
                      label={shiftType}
                      count={count}
                      colorClass="bg-blue-500"
                      max={doctorSchedule.totalAssignments}
                    />
                  )
                )}
              </div>
            </div>

            <div className={`${theme.card} p-6 mb-6`}>
              <h3 className="text-lg font-semibold text-[var(--color-text)] mb-4">
                {t("adminPanel.departments")}
              </h3>

              <div className="space-y-3">
                {Object.entries(doctorSchedule.departmentsCount || {}).map(
                  ([department, count]) => (
                    <div
                      key={department}
                      className="flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-2">
                        <Building
                          size={16}
                          className={iconColors.building}
                        />

                        <span className="text-sm text-[var(--color-text-muted)]">
                          {department}
                        </span>
                      </div>

                      <span className="text-sm font-semibold text-[var(--color-text)]">
                        {count}
                      </span>
                    </div>
                  )
                )}
              </div>
            </div>

            <div className={`${theme.card} p-6`}>
              <h3 className="text-lg font-semibold text-[var(--color-text)] mb-4">
                {t("roster.doctorSchedule.weeklyDistribution")}
              </h3>

              <div className="space-y-2">
                {Object.entries(doctorSchedule.weekdaysCount || {}).map(
                  ([weekday, count]) => (
                    <ProgressRow
                      key={weekday}
                      label={weekday}
                      count={count}
                      colorClass="bg-green-500"
                      max={maxWeekdayCount}
                    />
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DoctorSchedule