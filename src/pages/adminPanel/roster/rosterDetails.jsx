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

  const defaultButtonClass =
    "inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border bg-[var(--color-surface)] text-[var(--color-text)] border-[var(--color-border-strong)] hover:bg-[var(--color-success)] hover:text-white hover:border-[var(--color-success)] active:bg-[var(--color-success-hover)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"

  const selectedButtonClass =
    "inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border bg-[var(--color-success)] text-white border-[var(--color-success)] transition-colors"

  const iconButtonClass =
    "p-2 rounded-lg border border-[var(--color-border-strong)] bg-[var(--color-surface)] text-[var(--color-text)] hover:bg-[var(--color-success)] hover:text-white hover:border-[var(--color-success)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"

  const dangerIconButtonClass =
    "p-2 rounded-lg border border-[var(--color-border-strong)] bg-[var(--color-surface)] text-[var(--color-danger)] hover:bg-[var(--color-danger)] hover:text-white hover:border-[var(--color-danger)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"

  const rosterHeaderActionButtonClass =
    "group inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border bg-[var(--color-surface)] text-[var(--color-text)] border-[var(--color-border-strong)] hover:bg-[var(--color-success)] hover:text-white hover:border-[var(--color-success)] active:bg-[var(--color-success-hover)] transition-colors shadow-sm w-full h-full min-h-[42px] disabled:opacity-50 disabled:cursor-not-allowed"

  const rosterQuickActionButtonClass =
    "group w-full inline-flex items-center justify-center gap-2 p-3 rounded-xl text-sm font-semibold border bg-[var(--color-surface)] text-[var(--color-text)] border-[var(--color-border-strong)] hover:bg-[var(--color-success)] hover:text-white hover:border-[var(--color-success)] active:bg-[var(--color-success-hover)] transition-colors shadow-sm"

  const rosterStatusActionButtonClass =
    "group inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border bg-[var(--color-success)] text-white border-[var(--color-success)] hover:bg-[var(--color-success-hover)] hover:border-[var(--color-success-hover)] transition-colors shadow-sm w-full h-full min-h-[42px]"

  const iconColors = {
    calendar: "text-blue-500 dark:text-blue-500",
    info: "text-blue-500 dark:text-blue-500",
    activity: "text-blue-500 dark:text-blue-500",
    building: "text-emerald-500 dark:text-emerald-500",
    plus: "text-emerald-500 dark:text-emerald-500",
    briefcase: "text-emerald-500 dark:text-emerald-500",
    settings: "text-violet-500 dark:text-violet-500",
    timer: "text-violet-500 dark:text-violet-500",
    target: "text-amber-500 dark:text-amber-500",
    deadline: "text-amber-500 dark:text-amber-500",
    success: "text-emerald-500 dark:text-emerald-500",
    danger: "text-red-500 dark:text-red-500",
    file: "text-slate-500 dark:text-slate-500",
    muted: "text-slate-500 dark:text-slate-500",
  }

  const iconBg = {
    calendar: "bg-transparent dark:bg-transparent border-2 border-blue-500 dark:border-blue-500",
    info: "bg-transparent dark:bg-transparent border-2 border-blue-500 dark:border-blue-500",
    activity: "bg-transparent dark:bg-transparent border-2 border-blue-500 dark:border-blue-500",
    building: "bg-transparent dark:bg-transparent border-2 border-emerald-500 dark:border-emerald-500",
    briefcase: "bg-transparent dark:bg-transparent border-2 border-emerald-500 dark:border-emerald-500",
    settings: "bg-transparent dark:bg-transparent border-2 border-violet-500 dark:border-violet-500",
    timer: "bg-transparent dark:bg-transparent border-2 border-violet-500 dark:border-violet-500",
    target: "bg-transparent dark:bg-transparent border-2 border-amber-500 dark:border-amber-500",
    success: "bg-transparent dark:bg-transparent border-2 border-emerald-500 dark:border-emerald-500",
    danger: "bg-transparent dark:bg-transparent border-2 border-red-500 dark:border-red-500",
    deadline: "bg-transparent dark:bg-transparent border-2 border-amber-500 dark:border-amber-500",
    file: "bg-transparent dark:bg-transparent border-2 border-slate-500 dark:border-slate-500",
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
          "bg-transparent text-slate-500 border-2 border-slate-500 dark:bg-transparent dark:text-slate-500 dark:border-slate-500",
        icon: FileText,
      },
      DRAFT_PARTIAL: {
        name: t("roster.status.draftPartial"),
        color:
          "bg-transparent text-amber-500 border-2 border-amber-500 dark:bg-transparent dark:text-amber-500 dark:border-amber-500",
        icon: Clock,
      },
      DRAFT: {
        name: t("roster.status.draft"),
        color:
          "bg-transparent text-blue-500 border-2 border-blue-500 dark:bg-transparent dark:text-blue-500 dark:border-blue-500",
        icon: PenTool,
      },
      DRAFT_READY: {
        name: t("roster.status.draftReady"),
        color:
          "bg-transparent text-blue-500 border-2 border-blue-500 dark:bg-transparent dark:text-blue-500 dark:border-blue-500",
        icon: Send,
      },
      PUBLISHED: {
        name: t("roster.status.published"),
        color:
          "bg-transparent text-emerald-500 border-2 border-emerald-500 dark:bg-transparent dark:text-emerald-500 dark:border-emerald-500",
        icon: CheckCircle,
      },
      CLOSED: {
        name: t("roster.status.closed"),
        color:
          "bg-transparent text-red-500 border-2 border-red-500 dark:bg-transparent dark:text-red-500 dark:border-red-500",
        icon: XCircle,
      },
      ARCHIVED: {
        name: t("roster.status.archived"),
        color:
          "bg-transparent text-red-500 border-2 border-red-500 dark:bg-transparent dark:text-red-500 dark:border-red-500",
        icon: Archive,
      },
    }

    return statusMap[status] || statusMap.DRAFT_BASIC
  }

  const getProgressColor = (percentage) => {
    if (percentage >= 80) return "bg-[var(--color-success)]"
    if (percentage >= 50) return "bg-[var(--color-warning)]"
    if (percentage >= 25) return "bg-[var(--color-warning)]"
    return "bg-[var(--color-danger)]"
  }

  const getProgressTextColor = (percentage) => {
    if (percentage >= 80) return "text-[var(--color-success)]"
    if (percentage >= 50) return "text-[var(--color-warning)]"
    if (percentage >= 25) return "text-[var(--color-warning)]"
    return "text-[var(--color-danger)]"
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
          ? "bg-transparent text-emerald-500 border-2 border-emerald-500 dark:bg-transparent dark:text-emerald-500 dark:border-emerald-500"
          : "bg-transparent text-red-500 border-2 border-red-500 dark:bg-transparent dark:text-red-500 dark:border-red-500"
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
    <div className={`text-center p-4 rounded-xl border-2 shadow-sm ${bgClass}`}>
      <Icon className={`h-6 w-6 mx-auto mb-2 ${iconClass}`} />

      <p className={`text-2xl font-bold ${iconClass}`}>{value}</p>

      <p className="text-xs text-[var(--color-text-muted)]">{label}</p>
    </div>
  )

  const DateRow = ({ icon: Icon, iconClass, bgClass, label, value }) => (
    <div
      className={`flex items-center justify-between p-3 rounded-xl border-2 shadow-sm ${bgClass}`}
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
          ? selectedButtonClass
          : defaultButtonClass
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
              <div className="text-[var(--color-danger)] text-lg mb-4">
                {errors.general}
              </div>

              {loginRoleResponseDto?.roleNameEn === "System Administrator" && (
                <Link to="/admin-panel/rosters" className={defaultButtonClass}>
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
                <Link to="/admin-panel/rosters" className={defaultButtonClass}>
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
                  className={rosterHeaderActionButtonClass}
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
                  className={rosterHeaderActionButtonClass}
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
                  className={rosterHeaderActionButtonClass}
                >
                  <span className="flex items-center gap-2 justify-center w-full h-full">
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
                  className={rosterHeaderActionButtonClass}
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
                  className={rosterHeaderActionButtonClass}
                >
                  <Building size={16} />
                  {t("roster.actions.manageRoster")}
                </button>
              </Link>

              <button
                type="button"
                onClick={openStatusModal}
                className={`${rosterStatusActionButtonClass} sm:w-auto sm:flex-1 sm:min-w-[140px] lg:flex-initial cursor-pointer`}
                title={t("roster.actions.updateStatus")}
              >
                <StatusIcon size={16} />
                {statusInfo.name}
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start gap-4">
            <div className={`p-3 rounded-xl ${iconBg.calendar} shadow-sm`}>
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
                    bgClass="bg-transparent text-blue-500 border-blue-500 dark:bg-transparent dark:text-blue-500 dark:border-blue-500"
                    value={selectedRoster.departmentsCount}
                    label={t("roster.departments")}
                  />

                  <StatBox
                    icon={Briefcase}
                    iconClass={iconColors.briefcase}
                    bgClass="bg-transparent text-emerald-500 border-emerald-500 dark:bg-transparent dark:text-emerald-500 dark:border-emerald-500"
                    value={selectedRoster.shiftsCount}
                    label={t("roster.shifts")}
                  />

                  <StatBox
                    icon={Timer}
                    iconClass={iconColors.timer}
                    bgClass="bg-transparent text-violet-500 border-violet-500 dark:bg-transparent dark:text-violet-500 dark:border-violet-500"
                    value={selectedRoster.workingHoursCount}
                    label={t("roster.workingHours.title")}
                  />

                  <StatBox
                    icon={Target}
                    iconClass={iconColors.target}
                    bgClass="bg-transparent text-amber-500 border-amber-500 dark:bg-transparent dark:text-amber-500 dark:border-amber-500"
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
                        className="inline-flex items-center px-3 py-1.5 text-sm font-semibold rounded-lg transition-all duration-200 bg-[var(--color-primary)] hover:bg-[var(--color-success)] text-white disabled:bg-[var(--color-surface-muted)] disabled:cursor-not-allowed"
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
                      className={rosterQuickActionButtonClass}
                    >
                      <Building size={18} />
                      {t("roster.actions.manageRoster")}
                    </button>
                  </Link>

                  <button
                    type="button"
                    onClick={openStatusModal}
                    className={rosterStatusActionButtonClass}
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
                      className={rosterQuickActionButtonClass}
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
                      className={rosterQuickActionButtonClass}
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
                      className={rosterQuickActionButtonClass}
                    >
                      <span className="flex items-center justify-center gap-2 w-full h-full">
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
                      className={rosterQuickActionButtonClass}
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
                    bgClass="bg-transparent text-emerald-500 border-emerald-500 dark:bg-transparent dark:text-emerald-500 dark:border-emerald-500"
                    label={t("roster.details.startDate")}
                    value={formatDate(selectedRoster.startDate)}
                  />

                  <DateRow
                    icon={XCircle}
                    iconClass={iconColors.danger}
                    bgClass="bg-transparent text-red-500 border-red-500 dark:bg-transparent dark:text-red-500 dark:border-red-500"
                    label={t("roster.details.endDate")}
                    value={formatDate(selectedRoster.endDate)}
                  />

                  <DateRow
                    icon={AlertCircle}
                    iconClass={iconColors.deadline}
                    bgClass="bg-transparent text-amber-500 border-amber-500 dark:bg-transparent dark:text-amber-500 dark:border-amber-500"
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