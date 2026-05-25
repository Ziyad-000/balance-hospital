import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useParams, Link } from "react-router-dom"
import {
  autoAcceptRequests,
  getRosterById,
  getRosterAttendanceReport,
  getRosterAttendanceSummary,
} from "../../../state/act/actRosterManagement"
import { useTranslation } from "react-i18next"
import LoadingGetData from "../../../components/LoadingGetData"
import ModalUpdateRosterStatus from "../../../components/modals/ModalUpdateRosterStatus"
import RosterAttendanceTab from "./RosterAttendanceTab"
import {
  ArrowLeft,
  ArrowRight,
  Edit,
  Calendar,
  Clock,
  User,
  FileText,
  Settings,
  CheckCircle,
  XCircle,
  Layers,
  Timer,
  Target,
  AlertCircle,
  Building,
  Briefcase,
  TrendingUp,
  Info,
  Activity,
  PlusCircle,
  Archive,
  PenTool,
  Send,
} from "lucide-react"
import { formatDate } from "../../../utils/formtDate"
import { getPageTheme } from "../../../utils/themeClasses"

function RosterDetails() {
  const { rosterId } = useParams()
  const dispatch = useDispatch()
  const { t, i18n } = useTranslation()
  const theme = getPageTheme()

  const [statusModalOpen, setStatusModalOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("details")
  const [statusToUpdate, setStatusToUpdate] = useState({
    id: null,
    title: "",
    currentStatus: "",
  })

  const {
    selectedRoster,
    loading,
    errors,
    rosterAttendanceReport,
    rosterAttendanceSummary,
  } = useSelector((state) => state.rosterManagement)

  const { loginRoleResponseDto } = useSelector((state) => state.auth)

  const isRTL = i18n.language === "ar"
  const currentLang = i18n.language || "ar"

  const iconColors = {
    calendar: "text-blue-600 dark:text-blue-400",
    info: "text-blue-600 dark:text-blue-400",
    activity: "text-blue-600 dark:text-blue-400",
    building: "text-green-600 dark:text-green-400",
    plus: "text-green-600 dark:text-green-400",
    briefcase: "text-green-600 dark:text-green-400",
    settings: "text-purple-600 dark:text-purple-400",
    timer: "text-purple-600 dark:text-purple-400",
    target: "text-orange-600 dark:text-orange-400",
    deadline: "text-orange-600 dark:text-orange-400",
    success: "text-green-600 dark:text-green-400",
    danger: "text-red-600 dark:text-red-400",
    file: "text-slate-500 dark:text-slate-400",
    muted: "text-[var(--color-text-muted)]",
  }

  const iconBg = {
    calendar: "bg-blue-100 dark:bg-blue-900/30",
    info: "bg-blue-100 dark:bg-blue-900/30",
    activity: "bg-blue-100 dark:bg-blue-900/30",
    building: "bg-green-100 dark:bg-green-900/30",
    briefcase: "bg-green-100 dark:bg-green-900/30",
    settings: "bg-purple-100 dark:bg-purple-900/30",
    timer: "bg-purple-100 dark:bg-purple-900/30",
    target: "bg-orange-100 dark:bg-orange-900/30",
    success: "bg-green-100 dark:bg-green-900/30",
    danger: "bg-red-100 dark:bg-red-900/30",
    deadline: "bg-orange-100 dark:bg-orange-900/30",
  }

  useEffect(() => {
    if (rosterId) {
      dispatch(getRosterById({ rosterId }))
      dispatch(getRosterAttendanceReport({ rosterId }))
      dispatch(getRosterAttendanceSummary({ rosterId }))
    }
  }, [dispatch, rosterId, statusModalOpen])

  const getStatusInfo = (status) => {
    const statusMap = {
      DRAFT_BASIC: {
        name: t("roster.status.draftBasic"),
        color:
          "bg-[var(--color-bg-soft)] text-[var(--color-text-muted)] border border-[var(--color-border)]",
        icon: FileText,
      },
      DRAFT_PARTIAL: {
        name: t("roster.status.draftPartial"),
        color:
          "bg-[var(--color-warning-soft)] text-[var(--color-warning)] border border-[var(--color-warning)]/20",
        icon: Clock,
      },
      DRAFT: {
        name: t("roster.status.draft"),
        color:
          "bg-[var(--color-info-soft)] text-[var(--color-info)] border border-[var(--color-info)]/20",
        icon: PenTool,
      },
      DRAFT_READY: {
        name: t("roster.status.draftReady"),
        color:
          "bg-[var(--color-primary-soft)] text-[var(--color-primary)] border border-[var(--color-primary)]/20",
        icon: Send,
      },
      PUBLISHED: {
        name: t("roster.status.published"),
        color:
          "bg-[var(--color-success-soft)] text-[var(--color-success)] border border-[var(--color-success)]/20",
        icon: CheckCircle,
      },
      CLOSED: {
        name: t("roster.status.closed"),
        color:
          "bg-[var(--color-danger-soft)] text-[var(--color-danger)] border border-[var(--color-danger)]/20",
        icon: XCircle,
      },
      ARCHIVED: {
        name: t("roster.status.archived"),
        color:
          "bg-[var(--color-danger-soft)] text-[var(--color-danger)] border border-[var(--color-danger)]/20",
        icon: Archive,
      },
    }

    return statusMap[status] || statusMap.DRAFT_BASIC
  }

  const getProgressColor = (percentage) => {
    if (percentage >= 80) return "bg-green-500"
    if (percentage >= 50) return "bg-yellow-500"
    if (percentage >= 25) return "bg-orange-500"
    return "bg-red-500"
  }

  const getProgressTextColor = (percentage) => {
    if (percentage >= 80) return "text-green-600 dark:text-green-400"
    if (percentage >= 50) return "text-yellow-600 dark:text-yellow-400"
    if (percentage >= 25) return "text-orange-600 dark:text-orange-400"
    return "text-red-600 dark:text-red-400"
  }

  const changeAutoAcceptedStatus = () => {
    dispatch(
      autoAcceptRequests({
        rosterId: selectedRoster.id,
        autoAcceptRequests: !selectedRoster.autoAcceptRequests,
      })
    )
      .unwrap()
      .then(() => {
        dispatch(getRosterById({ rosterId }))
      })
  }

  const openStatusModal = () => {
    setStatusToUpdate({
      id: selectedRoster.id,
      title: selectedRoster.title,
      currentStatus: selectedRoster.status,
    })
    setStatusModalOpen(true)
  }

  const BooleanBadge = ({ value }) => (
    <span
      className={`inline-flex items-center px-3 py-1 text-sm font-semibold rounded-full ${
        value
          ? "bg-[var(--color-success-soft)] text-[var(--color-success)] border border-[var(--color-success)]/20"
          : "bg-[var(--color-danger-soft)] text-[var(--color-danger)] border border-[var(--color-danger)]/20"
      }`}
    >
      {value ? (
        <CheckCircle size={14} className={isRTL ? "ml-1" : "mr-1"} />
      ) : (
        <XCircle size={14} className={isRTL ? "ml-1" : "mr-1"} />
      )}

      {value ? t("roster.allowed") : t("roster.notAllowed")}
    </span>
  )

  const InfoField = ({ label, children }) => (
    <div>
      <label className="block text-sm font-semibold text-[var(--color-text-muted)] mb-2">
        {label}
      </label>

      <div className="text-base text-[var(--color-text)] font-semibold">
        {children}
      </div>
    </div>
  )

  const StatBox = ({ icon: Icon, iconClass, bgClass, value, label }) => (
    <div className={`text-center p-4 rounded-xl ${bgClass}`}>
      <Icon className={`h-6 w-6 mx-auto mb-2 ${iconClass}`} />

      <p className={`text-2xl font-bold ${iconClass}`}>{value}</p>

      <p className="text-xs text-[var(--color-text-muted)]">{label}</p>
    </div>
  )

  const DateRow = ({ icon: Icon, iconClass, bgClass, label, value }) => (
    <div
      className={`flex items-center justify-between p-3 rounded-xl ${bgClass}`}
    >
      <div className="flex items-center">
        <Icon className={`h-5 w-5 ${iconClass} ${isRTL ? "ml-2" : "mr-2"}`} />

        <span className="text-sm font-semibold text-[var(--color-text)]">
          {label}
        </span>
      </div>

      <span className={`text-sm font-bold ${iconClass}`}>{value}</span>
    </div>
  )

  const TabButton = ({ id, icon: Icon, label }) => (
    <button
      type="button"
      onClick={() => setActiveTab(id)}
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-colors ${
        activeTab === id
          ? "bg-[var(--color-primary)] text-white"
          : "bg-[var(--color-surface-muted)] text-[var(--color-text-muted)] border border-[var(--color-border)] hover:bg-[var(--color-bg-soft)] hover:text-[var(--color-text)]"
      }`}
    >
      <Icon size={16} />
      {label}
    </button>
  )

  if (loading?.fetch) {
    return <LoadingGetData text={t("gettingData.roster")} />
  }

  if (errors?.general) {
    return (
      <div className={theme.page} dir={isRTL ? "rtl" : "ltr"}>
        <div className="max-w-4xl mx-auto">
          <div className={`${theme.card} p-6`}>
            <div className="text-center py-12">
              <div className="text-red-500 text-lg mb-4">
                {errors.general}
              </div>

              {loginRoleResponseDto?.roleNameEn === "System Administrator" && (
                <Link to="/admin-panel/rosters" className={theme.primaryButton}>
                  {isRTL ? <ArrowRight size={16} /> : <ArrowLeft size={16} />}

                  <span className={isRTL ? "mr-2" : "ml-2"}>
                    {t("roster.actions.backToList")}
                  </span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!selectedRoster) {
    return (
      <div className={theme.page} dir={isRTL ? "rtl" : "ltr"}>
        <div className="max-w-4xl mx-auto">
          <div className={`${theme.card} p-6`}>
            <div className="text-center py-12">
              <div className="text-lg mb-4 text-[var(--color-text-muted)]">
                {t("roster.notFound")}
              </div>

              {loginRoleResponseDto?.roleNameEn === "System Administrator" && (
                <Link to="/admin-panel/rosters" className={theme.primaryButton}>
                  {isRTL ? <ArrowRight size={16} /> : <ArrowLeft size={16} />}

                  <span className={isRTL ? "mr-2" : "ml-2"}>
                    {t("roster.actions.backToList")}
                  </span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  const statusInfo = getStatusInfo(selectedRoster.status)
  const StatusIcon = statusInfo.icon

  localStorage.setItem("rosterTitle", selectedRoster.title)

  return (
    <div className={theme.page} dir={isRTL ? "rtl" : "ltr"}>
      <div className="max-w-6xl mx-auto">
        {statusModalOpen && (
          <ModalUpdateRosterStatus
            setStatusModalOpen={setStatusModalOpen}
            statusToUpdate={statusToUpdate}
            setStatusToUpdate={setStatusToUpdate}
          />
        )}

        <div className="mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
            {loginRoleResponseDto?.roleNameEn === "System Administrator" && (
              <Link
                to="/admin-panel/rosters"
                className="inline-flex items-center px-3 py-2 text-sm font-semibold text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
              >
                {isRTL ? <ArrowRight size={16} /> : <ArrowLeft size={16} />}

                <span className={isRTL ? "mr-2" : "ml-2"}>
                  {t("roster.actions.backToList")}
                </span>
              </Link>
            )}

            <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 w-full">
              <Link
                to={`/admin-panel/rosters/${selectedRoster.id}/edit`}
                className="w-full sm:w-auto sm:flex-1 sm:min-w-[140px] lg:flex-initial"
              >
                <button
                  type="button"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg flex items-center gap-2 transition-colors w-full h-full justify-center min-h-[42px]"
                >
                  <Edit size={16} />
                  {t("roster.actions.edit")}
                </button>
              </Link>

              <Link
                to={`/admin-panel/rosters/${selectedRoster.id}/doctors`}
                className="w-full sm:w-auto sm:flex-1 sm:min-w-[140px] lg:flex-initial"
              >
                <button
                  type="button"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-lg flex items-center gap-2 transition-colors w-full h-full justify-center min-h-[42px]"
                >
                  <User size={16} />
                  {t("roster.actions.doctors")}
                </button>
              </Link>

              <Link
                to={`/admin-panel/rosters/${selectedRoster.id}/manage-doctors`}
                className="w-full sm:w-auto sm:flex-1 sm:min-w-[140px] lg:flex-initial"
              >
                <button
                  type="button"
                  className="relative rounded-lg p-[2px] bg-gradient-to-r from-pink-500 via-yellow-400 to-blue-400 transition-transform duration-200 w-full h-full min-h-[42px]"
                >
                  <span className="flex items-center gap-2 justify-center bg-gray-900 text-white px-4 py-2 rounded-md w-full h-full">
                    <User size={16} />
                    {t("roster.actions.manageDoctors")}
                  </span>
                </button>
              </Link>

              <Link
                to={`/admin-panel/rosters/${selectedRoster.id}/working-hours`}
                className="w-full sm:w-auto sm:flex-1 sm:min-w-[140px] lg:flex-initial"
              >
                <button
                  type="button"
                  className="bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 hover:from-purple-600 hover:via-pink-600 hover:to-red-600 text-white px-4 py-2.5 rounded-lg flex items-center gap-2 transition-all shadow-md hover:shadow-lg w-full h-full justify-center min-h-[42px]"
                >
                  <Clock size={16} />
                  {t("roster.workingHours.title")}
                </button>
              </Link>

              <Link
                to={`/admin-panel/rosters/departments`}
                className="w-full sm:w-auto sm:flex-1 sm:min-w-[140px] lg:flex-initial"
              >
                <button
                  type="button"
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-lg flex items-center gap-2 transition-colors w-full h-full justify-center min-h-[42px]"
                >
                  <Building size={16} />
                  {t("roster.actions.manageRoster")}
                </button>
              </Link>

              <button
                type="button"
                onClick={openStatusModal}
                className={`px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors hover:opacity-80 cursor-pointer ${statusInfo.color} flex items-center gap-2 w-full sm:w-auto sm:flex-1 sm:min-w-[140px] lg:flex-initial justify-center min-h-[42px]`}
                title={t("roster.actions.updateStatus")}
              >
                <StatusIcon size={16} />
                {statusInfo.name}
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start gap-4">
            <div className={`p-3 rounded-xl ${iconBg.calendar}`}>
              <Calendar className={`h-8 w-8 ${iconColors.calendar}`} />
            </div>

            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-[var(--color-text)] mb-2">
                {selectedRoster.title}
              </h1>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="flex items-center gap-2">
                  <Layers className={`h-4 w-4 ${iconColors.muted}`} />

                  <span className="text-sm text-[var(--color-text-muted)]">
                    {selectedRoster.categoryName}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Calendar className={`h-4 w-4 ${iconColors.muted}`} />

                  <span className="text-sm text-[var(--color-text-muted)]">
                    {formatDate(selectedRoster.startDate)} -{" "}
                    {formatDate(selectedRoster.endDate)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className={`${theme.card} p-4 mb-6`}>
          <div className="flex flex-wrap gap-2">
            <TabButton
              id="details"
              icon={Info}
              label={
                currentLang === "ar" ? "تفاصيل الروستر" : "Roster Details"
              }
            />

            <TabButton
              id="attendance"
              icon={Activity}
              label={currentLang === "ar" ? "الحضور" : "Attendance"}
            />
          </div>
        </div>

        {activeTab === "details" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className={`${theme.card} p-6`}>
                <h2 className="text-xl font-semibold text-[var(--color-text)] mb-6 flex items-center">
                  <Info
                    className={`h-5 w-5 ${isRTL ? "ml-2" : "mr-2"} ${
                      iconColors.info
                    }`}
                  />
                  {t("roster.details.basicInfo")}
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InfoField label={t("roster.form.title")}>
                    {selectedRoster.title}
                  </InfoField>

                  <InfoField label={t("roster.form.category")}>
                    {selectedRoster.categoryName}
                  </InfoField>

                  <InfoField label={t("roster.form.month")}>
                    {selectedRoster.month}/{selectedRoster.year}
                  </InfoField>

                  <InfoField label={t("roster.dayss")}>
                    <div className="flex items-center">
                      <Calendar
                        className={`${iconColors.muted} ${
                          isRTL ? "ml-2" : "mr-2"
                        }`}
                        size={18}
                      />
                      <span>
                        {selectedRoster.totalDays} {t("roster.dayss")}
                      </span>
                    </div>
                  </InfoField>

                  <InfoField label={t("roster.form.submissionDeadline")}>
                    <div className="flex items-center">
                      <AlertCircle
                        className={`${iconColors.deadline} ${
                          isRTL ? "ml-2" : "mr-2"
                        }`}
                        size={18}
                      />
                      <span>
                        {formatDate(selectedRoster.submissionDeadline)}
                      </span>
                    </div>
                  </InfoField>

                  <InfoField label={t("roster.table.status")}>
                    <span
                      className={`inline-flex items-center px-3 py-1 text-sm font-semibold rounded-full ${statusInfo.color}`}
                    >
                      <StatusIcon
                        size={14}
                        className={isRTL ? "ml-1" : "mr-1"}
                      />
                      {statusInfo.name}
                    </span>
                  </InfoField>

                  {selectedRoster.description && (
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-[var(--color-text-muted)] mb-2">
                        {t("roster.form.description")}
                      </label>

                      <div className={`${theme.cardSoft} p-3`}>
                        <div className="flex items-start">
                          <FileText
                            className={`h-5 w-5 ${iconColors.file} ${
                              isRTL ? "ml-2" : "mr-2"
                            } mt-0.5 flex-shrink-0`}
                          />

                          <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">
                            {selectedRoster.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className={`${theme.card} p-6`}>
                <h2 className="text-xl font-semibold text-[var(--color-text)] mb-6 flex items-center">
                  <TrendingUp
                    className={`h-5 w-5 ${isRTL ? "ml-2" : "mr-2"} ${
                      iconColors.info
                    }`}
                  />
                  {t("roster.details.progress")}
                </h2>

                <div className="mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-semibold text-[var(--color-text-muted)]">
                      {t("roster.completionPercentage")}
                    </span>

                    <span
                      className={`text-sm font-bold ${getProgressTextColor(
                        selectedRoster.completionPercentage
                      )}`}
                    >
                      {Math.round(selectedRoster.completionPercentage)}%
                    </span>
                  </div>

                  <div className="w-full bg-[var(--color-bg-soft)] rounded-full h-3 overflow-hidden">
                    <div
                      className={`h-3 rounded-full transition-all duration-300 ${getProgressColor(
                        selectedRoster.completionPercentage
                      )}`}
                      style={{
                        width: `${Math.min(
                          selectedRoster.completionPercentage,
                          100
                        )}%`,
                      }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <StatBox
                    icon={Building}
                    iconClass={iconColors.calendar}
                    bgClass="bg-blue-50 dark:bg-blue-900/20"
                    value={selectedRoster.departmentsCount}
                    label={t("roster.departments")}
                  />

                  <StatBox
                    icon={Briefcase}
                    iconClass={iconColors.briefcase}
                    bgClass="bg-green-50 dark:bg-green-900/20"
                    value={selectedRoster.shiftsCount}
                    label={t("roster.shifts")}
                  />

                  <StatBox
                    icon={Timer}
                    iconClass={iconColors.timer}
                    bgClass="bg-purple-50 dark:bg-purple-900/20"
                    value={selectedRoster.workingHoursCount}
                    label={t("roster.workingHours.title")}
                  />

                  <StatBox
                    icon={Target}
                    iconClass={iconColors.target}
                    bgClass="bg-orange-50 dark:bg-orange-900/20"
                    value={`${Math.round(
                      selectedRoster.completionPercentage
                    )}%`}
                    label={t("roster.completed")}
                  />
                </div>
              </div>

              <div className={`${theme.card} p-6`}>
                <h2 className="text-xl font-semibold text-[var(--color-text)] mb-6 flex items-center">
                  <Settings
                    className={`h-5 w-5 ${isRTL ? "ml-2" : "mr-2"} ${
                      iconColors.settings
                    }`}
                  />
                  {t("roster.details.settings")}
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-[var(--color-text-muted)] mb-2">
                      {t("roster.form.allowLeaveRequests")}
                    </label>

                    <BooleanBadge value={selectedRoster.allowLeaveRequests} />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-[var(--color-text-muted)] mb-2">
                      {t("roster.form.allowSwapRequests")}
                    </label>

                    <BooleanBadge value={selectedRoster.allowSwapRequests} />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-[var(--color-text-muted)] mb-2">
                      {t("roster.form.autoAcceptRequests")}
                    </label>

                    <div className="flex items-center gap-3">
                      <BooleanBadge value={selectedRoster.autoAcceptRequests} />

                      <button
                        type="button"
                        onClick={changeAutoAcceptedStatus}
                        disabled={loading?.update}
                        className="inline-flex items-center px-3 py-1.5 text-sm font-semibold rounded-lg transition-all duration-200 bg-blue-600 hover:bg-blue-700 text-white disabled:bg-gray-400 disabled:cursor-not-allowed"
                      >
                        {loading?.update ? (
                          <>
                            <div
                              className={`animate-spin h-4 w-4 rounded-full border-b-2 border-white ${
                                isRTL ? "ml-2" : "mr-2"
                              }`}
                            />
                            {t("roster.actions.updating")}
                          </>
                        ) : (
                          <>
                            <Edit
                              size={14}
                              className={isRTL ? "ml-1.5" : "mr-1.5"}
                            />
                            {t("roster.actions.change")}
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className={`${theme.card} p-6`}>
                <h3 className="text-lg font-semibold text-[var(--color-text)] mb-4 flex items-center">
                  <Activity
                    className={`h-5 w-5 ${isRTL ? "ml-2" : "mr-2"} ${
                      iconColors.activity
                    }`}
                  />
                  {t("roster.details.quickActions")}
                </h3>

                <div className="space-y-3">
                  <Link
                    to={`/admin-panel/rosters/departments`}
                    className="block"
                  >
                    <button
                      type="button"
                      className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white p-3 rounded-lg flex items-center justify-center gap-2 transition-all duration-200 transform hover:scale-105"
                    >
                      <Building size={18} />
                      {t("roster.actions.manageRoster")}
                    </button>
                  </Link>

                  <button
                    type="button"
                    onClick={openStatusModal}
                    className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white p-3 rounded-lg flex items-center justify-center gap-2 transition-all duration-200 transform hover:scale-105"
                  >
                    <Settings size={18} />
                    {t("roster.actions.updateStatus")}
                  </button>

                  <Link
                    to={`/admin-panel/rosters/${selectedRoster.id}/edit`}
                    className="block"
                  >
                    <button
                      type="button"
                      className="w-full bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white p-3 rounded-lg flex items-center justify-center gap-2 transition-all duration-200 transform hover:scale-105"
                    >
                      <Edit size={18} />
                      {t("roster.actions.editRoster")}
                    </button>
                  </Link>

                  <Link
                    to={`/admin-panel/rosters/${selectedRoster.id}/doctors`}
                    className="block"
                  >
                    <button
                      type="button"
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white p-3 rounded-lg flex items-center justify-center gap-2 transition-all duration-200 transform hover:scale-105"
                    >
                      <User size={18} />
                      {t("roster.actions.doctors")}
                    </button>
                  </Link>

                  <Link
                    to={`/admin-panel/rosters/${selectedRoster.id}/manage-doctors`}
                    className="block"
                  >
                    <button
                      type="button"
                      className="w-full relative rounded-lg p-[2px] bg-gradient-to-r from-pink-500 via-yellow-400 to-blue-400 transition-all duration-200 transform hover:scale-105"
                    >
                      <span className="flex items-center justify-center gap-2 w-full h-full bg-gray-900 rounded-md p-3 text-white">
                        <User size={18} />
                        {t("roster.actions.manageDoctors")}
                      </span>
                    </button>
                  </Link>

                  <Link
                    to={`/admin-panel/rosters/${selectedRoster.id}/working-hours`}
                    className="block"
                  >
                    <button
                      type="button"
                      className="w-full bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 hover:from-purple-600 hover:via-pink-600 hover:to-red-600 text-white p-3 rounded-lg flex items-center justify-center gap-2 transition-all duration-200 transform hover:scale-105"
                    >
                      <Clock size={16} />
                      {t("roster.workingHours.title")}
                    </button>
                  </Link>
                </div>
              </div>

              <div className={`${theme.card} p-6`}>
                <h3 className="text-lg font-semibold text-[var(--color-text)] mb-4 flex items-center">
                  <Calendar
                    className={`h-5 w-5 ${isRTL ? "ml-2" : "mr-2"} ${
                      iconColors.calendar
                    }`}
                  />
                  {t("roster.details.dateInfo")}
                </h3>

                <div className="space-y-4">
                  <DateRow
                    icon={PlusCircle}
                    iconClass={iconColors.plus}
                    bgClass="bg-green-50 dark:bg-green-900/20"
                    label={t("roster.details.startDate")}
                    value={formatDate(selectedRoster.startDate)}
                  />

                  <DateRow
                    icon={XCircle}
                    iconClass={iconColors.danger}
                    bgClass="bg-red-50 dark:bg-red-900/20"
                    label={t("roster.details.endDate")}
                    value={formatDate(selectedRoster.endDate)}
                  />

                  <DateRow
                    icon={AlertCircle}
                    iconClass={iconColors.deadline}
                    bgClass="bg-orange-50 dark:bg-orange-900/20"
                    label={t("roster.details.deadline")}
                    value={formatDate(selectedRoster.submissionDeadline)}
                  />
                </div>
              </div>

              <div className={`${theme.card} p-6`}>
                <h3 className="text-lg font-semibold text-[var(--color-text)] mb-4 flex items-center">
                  <Clock
                    className={`h-5 w-5 ${isRTL ? "ml-2" : "mr-2"} ${
                      iconColors.calendar
                    }`}
                  />
                  {t("roster.details.auditInfo")}
                </h3>

                <div className="space-y-4">
                  <InfoField label={t("roster.details.createdAt")}>
                    <p className="text-sm">
                      {formatDate(selectedRoster.createdAt)}
                    </p>
                  </InfoField>

                  {selectedRoster.createdByName && (
                    <InfoField label={t("roster.details.createdBy")}>
                      <div className="flex items-center">
                        <User
                          className={`h-4 w-4 ${iconColors.muted} ${
                            isRTL ? "ml-2" : "mr-2"
                          }`}
                        />
                        <span className="text-sm">
                          {selectedRoster.createdByName}
                        </span>
                      </div>
                    </InfoField>
                  )}

                  {selectedRoster.updatedAt && (
                    <InfoField label={t("roster.details.updatedAt")}>
                      <p className="text-sm">
                        {formatDate(selectedRoster.updatedAt)}
                      </p>
                    </InfoField>
                  )}

                  {selectedRoster.updatedByName && (
                    <InfoField label={t("roster.details.updatedBy")}>
                      <div className="flex items-center">
                        <User
                          className={`h-4 w-4 ${iconColors.muted} ${
                            isRTL ? "ml-2" : "mr-2"
                          }`}
                        />
                        <span className="text-sm">
                          {selectedRoster.updatedByName}
                        </span>
                      </div>
                    </InfoField>
                  )}

                  {selectedRoster.publishedAt && (
                    <InfoField label={t("roster.details.publishedAt")}>
                      <div className="flex items-center">
                        <CheckCircle
                          className={`h-4 w-4 ${iconColors.success} ${
                            isRTL ? "ml-2" : "mr-2"
                          }`}
                        />
                        <span className="text-sm">
                          {formatDate(selectedRoster.publishedAt)}
                        </span>
                      </div>
                    </InfoField>
                  )}

                  {selectedRoster.closedAt && (
                    <InfoField label={t("roster.details.closedAt")}>
                      <div className="flex items-center">
                        <XCircle
                          className={`h-4 w-4 ${iconColors.danger} ${
                            isRTL ? "ml-2" : "mr-2"
                          }`}
                        />
                        <span className="text-sm">
                          {formatDate(selectedRoster.closedAt)}
                        </span>
                      </div>
                    </InfoField>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "attendance" && (
          <RosterAttendanceTab
            report={rosterAttendanceReport}
            summary={rosterAttendanceSummary}
            loading={
              loading?.rosterAttendanceReport ||
              loading?.rosterAttendanceSummary
            }
            error={
              errors?.rosterAttendanceReport ||
              errors?.rosterAttendanceSummary
            }
            currentLang={currentLang}
            isRTL={isRTL}
          />
        )}
      </div>
    </div>
  )
}

export default RosterDetails