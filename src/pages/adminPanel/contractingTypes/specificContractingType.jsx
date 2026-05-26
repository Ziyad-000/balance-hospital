import React, { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useParams, useNavigate, Link } from "react-router-dom"
import { getContractingTypeById } from "../../../state/act/actContractingType"
import {
  clearSingleContractingType,
  clearSingleContractingTypeError,
} from "../../../state/slices/contractingType"
import LoadingGetData from "../../../components/LoadingGetData"
import { useTranslation } from "react-i18next"
import {
  ArrowLeft,
  ArrowRight,
  Edit,
  User,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  Calendar,
  FileText,
  Mail,
  Phone,
  Shield,
  Hash,
  Info,
} from "lucide-react"
import { formatDate } from "../../../utils/formtDate"

function SpecificContractingType() {
  const { id } = useParams()
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const {
    selectedContractingType,
    loadingGetSingleContractingType,
    singleContractingTypeError,
  } = useSelector((state) => state.contractingType)

  const { mymode } = useSelector((state) => state.mode)
  const { t, i18n } = useTranslation()

  const isRTL = i18n.language === "ar"
  const currentLang = i18n.language || "ar"
  const isDark = mymode === "dark"

  const pageClass = isDark
    ? "min-h-screen p-4 sm:p-6 bg-gray-950 text-white"
    : "min-h-screen p-4 sm:p-6 bg-slate-50 text-slate-950"

  const cardClass = isDark
    ? "bg-gray-900 border-gray-700 shadow-sm"
    : "bg-white border-slate-200 shadow-sm"

  const softCardClass = isDark
    ? "bg-gray-800/90 border-gray-600"
    : "bg-slate-100 border-slate-300"

  const textMain = isDark ? "text-white" : "text-slate-950"
  const textMuted = isDark ? "text-slate-300" : "text-slate-700"
  const textSoft = isDark ? "text-slate-300" : "text-slate-600"

  const defaultButtonClass =
    "inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-extrabold border bg-white text-slate-950 border-slate-400 hover:bg-emerald-600 hover:text-white hover:border-emerald-600 active:bg-emerald-700 dark:bg-gray-900 dark:text-white dark:border-gray-600 dark:hover:bg-emerald-600 dark:hover:border-emerald-600 transition-colors shadow-sm"

  const editButtonClass =
    "inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-extrabold border bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-700 hover:border-emerald-700 active:bg-emerald-800 transition-colors shadow-sm"

  const iconBoxBlue =
    "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm border bg-transparent text-blue-500 border-blue-500 dark:bg-transparent dark:text-blue-500 dark:border-blue-500"

  const iconBoxEmerald =
    "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm border bg-transparent text-emerald-500 border-emerald-500 dark:bg-transparent dark:text-emerald-500 dark:border-emerald-500"

  const iconBoxAmber =
    "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm border bg-transparent text-amber-500 border-amber-500 dark:bg-transparent dark:text-amber-500 dark:border-amber-500"

  const iconBoxOrange =
    "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm border bg-transparent text-orange-500 border-orange-500 dark:bg-transparent dark:text-orange-500 dark:border-orange-500"

  const iconBoxViolet =
    "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm border bg-transparent text-violet-500 border-violet-500 dark:bg-transparent dark:text-violet-500 dark:border-violet-500"

  const iconBoxRed =
    "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm border bg-transparent text-red-500 border-red-500 dark:bg-transparent dark:text-red-500 dark:border-red-500"

  const smallIconClass = "w-5 h-5 shrink-0"
  const sectionTitleClass = `text-xl font-black ${textMain} flex items-center gap-3`

  useEffect(() => {
    if (id) {
      dispatch(clearSingleContractingType())
      dispatch(getContractingTypeById(id))
    }

    return () => {
      dispatch(clearSingleContractingType())
      dispatch(clearSingleContractingTypeError())
    }
  }, [dispatch, id])

  useEffect(() => {
    if (singleContractingTypeError) {
      if (singleContractingTypeError.status === 404) {
        console.error("ContractingType not found")
      } else if (singleContractingTypeError.status === 403) {
        console.error("Access denied")
      }
    }
  }, [singleContractingTypeError, navigate])

  const getContractingTypeName = () => {
    if (!selectedContractingType) return ""

    return currentLang === "en"
      ? selectedContractingType.nameEnglish
      : selectedContractingType.nameArabic
  }

  const getContractingTypeSecondaryName = () => {
    if (!selectedContractingType) return ""

    return currentLang === "en"
      ? selectedContractingType.nameArabic
      : selectedContractingType.nameEnglish
  }

  const getUserName = (user) => {
    if (!user) return ""
    return currentLang === "en" ? user.nameEnglish : user.nameArabic
  }

  const InfoField = ({ icon: Icon, label, value, dir, tone = "blue" }) => {
    const toneClass =
      tone === "emerald"
        ? "bg-transparent text-emerald-500 border-emerald-500 dark:bg-transparent dark:text-emerald-500 dark:border-emerald-500"
        : tone === "amber"
        ? "bg-transparent text-amber-500 border-amber-500 dark:bg-transparent dark:text-amber-500 dark:border-amber-500"
        : tone === "orange"
        ? "bg-transparent text-orange-500 border-orange-500 dark:bg-transparent dark:text-orange-500 dark:border-orange-500"
        : tone === "red"
        ? "bg-transparent text-red-500 border-red-500 dark:bg-transparent dark:text-red-500 dark:border-red-500"
        : tone === "violet"
        ? "bg-transparent text-violet-500 border-violet-500 dark:bg-transparent dark:text-violet-500 dark:border-violet-500"
        : "bg-transparent text-blue-500 border-blue-500 dark:bg-transparent dark:text-blue-500 dark:border-blue-500"

    return (
      <div className={`rounded-2xl border p-4 ${softCardClass}`}>
        <div className="flex items-start gap-3">
          <div
            className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 shadow-sm ${toneClass}`}
          >
            <Icon className="w-5 h-5 shrink-0" />
          </div>

          <div className="min-w-0">
            <p className={`text-xs font-black mb-1 ${textSoft}`}>{label}</p>

            <p
              className={`text-sm sm:text-base font-extrabold ${textMain} break-words`}
              dir={dir}
            >
              {value || "-"}
            </p>
          </div>
        </div>
      </div>
    )
  }

  const CodeBadge = ({ code }) => (
    <span className="inline-flex items-center gap-1.5 text-sm font-black px-3 py-1.5 rounded-full border-2 bg-transparent text-slate-500 border-slate-500 dark:bg-transparent dark:text-slate-500 dark:border-slate-500 shadow-sm">
      <Hash className="w-4 h-4 shrink-0" />
      {code || "-"}
    </span>
  )

  const StatusBadge = ({ isActive }) => (
    <span
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-black border-2 shadow-sm ${
        isActive
          ? "bg-transparent text-emerald-500 border-emerald-500 dark:bg-transparent dark:text-emerald-500 dark:border-emerald-500"
          : "bg-transparent text-red-500 border-red-500 dark:bg-transparent dark:text-red-500 dark:border-red-500"
      }`}
    >
      {isActive ? (
        <CheckCircle className="w-4 h-4 shrink-0" />
      ) : (
        <XCircle className="w-4 h-4 shrink-0" />
      )}

      {isActive
        ? t("contractingTypes.status.active")
        : t("contractingTypes.status.inactive")}
    </span>
  )

  const OvertimeBadge = ({ allowOvertime }) => (
    <span
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-black border-2 shadow-sm ${
        allowOvertime
          ? "bg-transparent text-emerald-500 border-emerald-500 dark:bg-transparent dark:text-emerald-500 dark:border-emerald-500"
          : "bg-transparent text-red-500 border-red-500 dark:bg-transparent dark:text-red-500 dark:border-red-500"
      }`}
    >
      {allowOvertime ? (
        <CheckCircle className="w-4 h-4 shrink-0" />
      ) : (
        <XCircle className="w-4 h-4 shrink-0" />
      )}

      {allowOvertime
        ? t("contractingTypes.overtime.allowed")
        : t("contractingTypes.overtime.notAllowed")}
    </span>
  )

  const StatBox = ({ icon: Icon, label, value, tone = "blue" }) => {
    const toneClass =
      tone === "emerald"
        ? "bg-transparent text-emerald-500 border-emerald-500 dark:bg-transparent dark:text-emerald-500 dark:border-emerald-500"
        : tone === "amber"
        ? "bg-transparent text-amber-500 border-amber-500 dark:bg-transparent dark:text-amber-500 dark:border-amber-500"
        : tone === "orange"
        ? "bg-transparent text-orange-500 border-orange-500 dark:bg-transparent dark:text-orange-500 dark:border-orange-500"
        : tone === "red"
        ? "bg-transparent text-red-500 border-red-500 dark:bg-transparent dark:text-red-500 dark:border-red-500"
        : tone === "violet"
        ? "bg-transparent text-violet-500 border-violet-500 dark:bg-transparent dark:text-violet-500 dark:border-violet-500"
        : "bg-transparent text-blue-500 border-blue-500 dark:bg-transparent dark:text-blue-500 dark:border-blue-500"

    return (
      <div className={`rounded-2xl border-2 p-5 shadow-sm ${toneClass}`}>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <Icon className="w-6 h-6 shrink-0" />
            <span className="text-sm font-black truncate">{label}</span>
          </div>

          <span className="text-2xl font-black shrink-0">{value}</span>
        </div>
      </div>
    )
  }

  const UserCard = ({ user }) => (
    <div className={`p-4 border rounded-2xl ${softCardClass}`}>
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
        <div className="flex items-start gap-3 min-w-0">
          <div className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border bg-transparent text-blue-500 border-blue-500 dark:bg-transparent dark:text-blue-500 dark:border-blue-500 shadow-sm">
            <User className="w-5 h-5 shrink-0" />
          </div>

          <div className="min-w-0">
            <h4 className={`font-black ${textMain} truncate`}>
              {getUserName(user)}
            </h4>

            <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2 mt-2">
              {user.email && (
                <div
                  className={`inline-flex items-center gap-1.5 text-sm font-bold ${textMuted}`}
                >
                  <Mail className="w-4 h-4 shrink-0 text-cyan-500 dark:text-cyan-500" />
                  <span className="truncate">{user.email}</span>
                </div>
              )}

              {user.mobile && (
                <div
                  className={`inline-flex items-center gap-1.5 text-sm font-bold ${textMuted}`}
                >
                  <Phone className="w-4 h-4 shrink-0 text-emerald-500 dark:text-emerald-500" />
                  <span>{user.mobile}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {user.role && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black border-2 bg-transparent text-violet-500 border-violet-500 dark:bg-transparent dark:text-violet-500 dark:border-violet-500 shrink-0 shadow-sm">
            <Shield className="w-4 h-4 shrink-0" />
            {user.role}
          </div>
        )}
      </div>
    </div>
  )

  if (loadingGetSingleContractingType) {
    return <LoadingGetData text={t("gettingData.contractingTypeData")} />
  }

  if (singleContractingTypeError) {
    return (
      <div className={pageClass} dir={isRTL ? "rtl" : "ltr"}>
        <div className="max-w-3xl mx-auto">
          <div className={`${cardClass} rounded-2xl border p-8 text-center`}>
            <div className="w-20 h-20 rounded-full bg-transparent text-red-500 border-2 border-red-500 dark:bg-transparent dark:text-red-500 dark:border-red-500 flex items-center justify-center mx-auto mb-6 shadow-sm">
              <XCircle className="w-10 h-10" />
            </div>

            <div className="text-lg font-black mb-6 text-red-500 dark:text-red-500">
              {singleContractingTypeError?.message ||
                t("contractingTypes.fetchError")}
            </div>

            <Link
              to="/admin-panel/contracting-types"
              className={defaultButtonClass}
            >
              {isRTL ? <ArrowRight size={16} /> : <ArrowLeft size={16} />}
              {t("contractingTypes.backToList")}
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (!selectedContractingType) {
    return (
      <div className={pageClass} dir={isRTL ? "rtl" : "ltr"}>
        <div className="max-w-3xl mx-auto">
          <div className={`${cardClass} rounded-2xl border p-8 text-center`}>
            <div className="w-20 h-20 rounded-full bg-transparent text-slate-500 border-2 border-slate-500 dark:bg-transparent dark:text-slate-500 dark:border-slate-500 flex items-center justify-center mx-auto mb-6 shadow-sm">
              <FileText className="w-10 h-10" />
            </div>

            <div className={`text-lg font-black mb-6 ${textMuted}`}>
              {t("contractingTypes.notFound")}
            </div>

            <Link
              to="/admin-panel/contracting-types"
              className={defaultButtonClass}
            >
              {isRTL ? <ArrowRight size={16} /> : <ArrowLeft size={16} />}
              {t("contractingTypes.backToList")}
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={pageClass} dir={isRTL ? "rtl" : "ltr"}>
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <div className="flex items-center justify-between gap-3 flex-wrap mb-5">
            <Link
              to="/admin-panel/contracting-types"
              className={defaultButtonClass}
            >
              {isRTL ? <ArrowRight size={16} /> : <ArrowLeft size={16} />}
              {t("contractingTypes.backToList")}
            </Link>

            <Link
              to={`/admin-panel/contracting-types/edit/${selectedContractingType.id}`}
            >
              <button type="button" className={editButtonClass}>
                <Edit size={16} className="shrink-0" />
                {t("contractingTypes.actions.edit")}
              </button>
            </Link>
          </div>

          <div className={`${cardClass} rounded-3xl border p-6`}>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-start gap-4 min-w-0">
                <div className="w-20 h-20 rounded-3xl flex items-center justify-center shrink-0 shadow-sm border-2 bg-transparent text-blue-500 border-blue-500 dark:bg-transparent dark:text-blue-500 dark:border-blue-500">
                  <FileText className="w-10 h-10 shrink-0" />
                </div>

                <div className="min-w-0">
                  <h1
                    className={`text-3xl font-black tracking-tight ${textMain}`}
                  >
                    {getContractingTypeName()}
                  </h1>

                  {getContractingTypeSecondaryName() && (
                    <p className={`mt-1 text-base font-bold ${textMuted}`}>
                      {getContractingTypeSecondaryName()}
                    </p>
                  )}

                  <div className="flex flex-wrap items-center gap-2 mt-3">
                    <CodeBadge code={selectedContractingType.code} />
                    <StatusBadge isActive={selectedContractingType.isActive} />
                    <OvertimeBadge
                      allowOvertime={
                        selectedContractingType.allowOvertimeHours
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 w-full md:w-auto">
                <div className="rounded-2xl border-2 bg-transparent text-blue-500 border-blue-500 dark:bg-transparent dark:text-blue-500 dark:border-blue-500 px-4 py-3 shadow-sm">
                  <p className="text-xs font-black opacity-90">
                    {t("contractingTypes.form.maxHoursPerWeek")}
                  </p>
                  <p className="text-2xl font-black">
                    {selectedContractingType.maxHoursPerWeek ?? 0}
                  </p>
                </div>

                <div className="rounded-2xl border-2 bg-transparent text-emerald-500 border-emerald-500 dark:bg-transparent dark:text-emerald-500 dark:border-emerald-500 px-4 py-3 shadow-sm">
                  <p className="text-xs font-black opacity-90">
                    {t("contractingTypes.table.users")}
                  </p>
                  <p className="text-2xl font-black">
                    {selectedContractingType.usersCount ?? 0}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className={`${cardClass} rounded-3xl border p-6`}>
              <h2 className={`${sectionTitleClass} mb-6`}>
                <span className={iconBoxBlue}>
                  <Info className={smallIconClass} />
                </span>
                {t("contractingTypes.details.basicInfo")}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoField
                  icon={FileText}
                  label={t("contractingTypes.form.nameArabic")}
                  value={selectedContractingType.nameArabic}
                  dir="rtl"
                  tone="blue"
                />

                <InfoField
                  icon={FileText}
                  label={t("contractingTypes.form.nameEnglish")}
                  value={selectedContractingType.nameEnglish}
                  dir="ltr"
                  tone="blue"
                />

                <InfoField
                  icon={Clock}
                  label={t("contractingTypes.form.maxHoursPerWeek")}
                  value={`${selectedContractingType.maxHoursPerWeek ?? 0} ${t(
                    "contractingTypes.hoursPerWeek"
                  )}`}
                  tone="amber"
                />

                <div className={`rounded-2xl border p-4 ${softCardClass}`}>
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 shadow-sm ${
                        selectedContractingType.allowOvertimeHours
                          ? "bg-transparent text-emerald-500 border-emerald-500 dark:bg-transparent dark:text-emerald-500 dark:border-emerald-500"
                          : "bg-transparent text-red-500 border-red-500 dark:bg-transparent dark:text-red-500 dark:border-red-500"
                      }`}
                    >
                      {selectedContractingType.allowOvertimeHours ? (
                        <CheckCircle className="w-5 h-5 shrink-0" />
                      ) : (
                        <XCircle className="w-5 h-5 shrink-0" />
                      )}
                    </div>

                    <div>
                      <p className={`text-xs font-black mb-2 ${textSoft}`}>
                        {t("contractingTypes.form.allowOvertimeHours")}
                      </p>

                      <OvertimeBadge
                        allowOvertime={
                          selectedContractingType.allowOvertimeHours
                        }
                      />
                    </div>
                  </div>
                </div>

                <div className={`rounded-2xl border p-4 ${softCardClass}`}>
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 shadow-sm ${
                        selectedContractingType.isActive
                          ? "bg-transparent text-emerald-500 border-emerald-500 dark:bg-transparent dark:text-emerald-500 dark:border-emerald-500"
                          : "bg-transparent text-red-500 border-red-500 dark:bg-transparent dark:text-red-500 dark:border-red-500"
                      }`}
                    >
                      {selectedContractingType.isActive ? (
                        <CheckCircle className="w-5 h-5 shrink-0" />
                      ) : (
                        <XCircle className="w-5 h-5 shrink-0" />
                      )}
                    </div>

                    <div>
                      <p className={`text-xs font-black mb-2 ${textSoft}`}>
                        {t("contractingTypes.table.status")}
                      </p>

                      <StatusBadge isActive={selectedContractingType.isActive} />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {selectedContractingType.users &&
              selectedContractingType.users.length > 0 && (
                <div className={`${cardClass} rounded-3xl border p-6`}>
                  <div className="flex items-center justify-between gap-4 flex-wrap mb-6">
                    <h2 className={sectionTitleClass}>
                      <span className={iconBoxEmerald}>
                        <Users className={smallIconClass} />
                      </span>
                      {t("contractingTypes.details.associatedUsers")}
                    </h2>

                    <span className="px-3 py-1.5 rounded-full text-xs font-black bg-transparent text-emerald-500 border-2 border-emerald-500 dark:bg-transparent dark:text-emerald-500 dark:border-emerald-500 shadow-sm">
                      {selectedContractingType.usersCount ?? 0}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedContractingType.users.map((user) => (
                      <UserCard key={user.id} user={user} />
                    ))}
                  </div>
                </div>
              )}
          </div>

          <div className="space-y-6">
            <div className={`${cardClass} rounded-3xl border p-6`}>
              <h3 className={`${sectionTitleClass} mb-5`}>
                <span className={iconBoxBlue}>
                  <Users className={smallIconClass} />
                </span>
                {t("contractingTypes.details.statistics")}
              </h3>

              <div className="space-y-4">
                <StatBox
                  icon={Users}
                  label={t("contractingTypes.table.users")}
                  value={selectedContractingType.usersCount ?? 0}
                  tone="blue"
                />

                <StatBox
                  icon={Clock}
                  label={t("contractingTypes.form.maxHoursPerWeek")}
                  value={selectedContractingType.maxHoursPerWeek ?? 0}
                  tone="amber"
                />

                <StatBox
                  icon={
                    selectedContractingType.allowOvertimeHours
                      ? CheckCircle
                      : XCircle
                  }
                  label={t("contractingTypes.form.allowOvertimeHours")}
                  value={
                    selectedContractingType.allowOvertimeHours
                      ? t("contractingTypes.overtime.allowed")
                      : t("contractingTypes.overtime.notAllowed")
                  }
                  tone={
                    selectedContractingType.allowOvertimeHours
                      ? "emerald"
                      : "red"
                  }
                />
              </div>
            </div>

            <div className={`${cardClass} rounded-3xl border p-6`}>
              <h3 className={`${sectionTitleClass} mb-5`}>
                <span className={iconBoxAmber}>
                  <Calendar className={smallIconClass} />
                </span>
                {t("contractingTypes.details.auditInfo")}
              </h3>

              <div className="space-y-4">
                <InfoField
                  icon={Calendar}
                  label={t("contractingTypes.details.createdAt")}
                  value={formatDate(selectedContractingType.createdAt)}
                  tone="amber"
                />

                {selectedContractingType.createdByUser && (
                  <>
                    <InfoField
                      icon={User}
                      label={t("contractingTypes.details.createdBy")}
                      value={getUserName(selectedContractingType.createdByUser)}
                      tone="blue"
                    />

                    <InfoField
                      icon={FileText}
                      label={currentLang === "ar" ? "بيانات المنشئ" : "Creator Info"}
                      value={`${selectedContractingType.createdByUser.role || "-"} • ${
                        selectedContractingType.createdByUser.email || "-"
                      }`}
                      tone="violet"
                    />
                  </>
                )}

                {selectedContractingType.updatedAt && (
                  <InfoField
                    icon={Clock}
                    label={t("contractingTypes.details.updatedAt")}
                    value={formatDate(selectedContractingType.updatedAt)}
                    tone="amber"
                  />
                )}

                {selectedContractingType.updatedByUser && (
                  <>
                    <InfoField
                      icon={User}
                      label={t("contractingTypes.details.updatedBy")}
                      value={getUserName(selectedContractingType.updatedByUser)}
                      tone="blue"
                    />

                    <InfoField
                      icon={FileText}
                      label={currentLang === "ar" ? "بيانات المعدل" : "Updater Info"}
                      value={`${selectedContractingType.updatedByUser.role || "-"} • ${
                        selectedContractingType.updatedByUser.email || "-"
                      }`}
                      tone="violet"
                    />
                  </>
                )}
              </div>
            </div>

            <div className={`${cardClass} rounded-3xl border p-6`}>
              <h3 className={`${sectionTitleClass} mb-5`}>
                <span className={iconBoxViolet}>
                  <Shield className={smallIconClass} />
                </span>
                {t("contractingTypes.table.status")}
              </h3>

              <StatusBadge isActive={selectedContractingType.isActive} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SpecificContractingType