import React, { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useParams, useNavigate, Link } from "react-router-dom"
import { getScientificDegreeById } from "../../../state/act/actScientificDegree"
import {
  clearSingleScientificDegree,
  clearSingleScientificDegreeError,
} from "../../../state/slices/scientificDegree"
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

function SpecificScientificDegree() {
  const { id } = useParams()
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const {
    selectedScientificDegree,
    loadingGetSingleScientificDegree,
    singleScientificDegreeError,
  } = useSelector((state) => state.scientificDegree)

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

  const iconBoxViolet =
    "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm border bg-transparent text-violet-500 border-violet-500 dark:bg-transparent dark:text-violet-500 dark:border-violet-500"

  const iconBoxRed =
    "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm border bg-transparent text-red-500 border-red-500 dark:bg-transparent dark:text-red-500 dark:border-red-500"

  const smallIconClass = "w-5 h-5 shrink-0"
  const sectionTitleClass = `text-xl font-black ${textMain} flex items-center gap-3`

  useEffect(() => {
    if (id) {
      dispatch(clearSingleScientificDegree())
      dispatch(getScientificDegreeById(id))
    }

    return () => {
      dispatch(clearSingleScientificDegree())
      dispatch(clearSingleScientificDegreeError())
    }
  }, [dispatch, id])

  useEffect(() => {
    if (singleScientificDegreeError) {
      if (singleScientificDegreeError.status === 404) {
        console.error("Scientific Degree not found")
      } else if (singleScientificDegreeError.status === 403) {
        console.error("Access denied")
      }
    }
  }, [singleScientificDegreeError, navigate])

  const getScientificDegreeName = () => {
    if (!selectedScientificDegree) return ""

    return currentLang === "en"
      ? selectedScientificDegree.nameEnglish
      : selectedScientificDegree.nameArabic
  }

  const getScientificDegreeSecondaryName = () => {
    if (!selectedScientificDegree) return ""

    return currentLang === "en"
      ? selectedScientificDegree.nameArabic
      : selectedScientificDegree.nameEnglish
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
        ? t("scientificDegrees.status.active")
        : t("scientificDegrees.status.inactive")}
    </span>
  )

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

  const StatBox = ({ icon: Icon, label, value, tone = "blue" }) => {
    const toneClass =
      tone === "emerald"
        ? "bg-transparent text-emerald-500 border-emerald-500 dark:bg-transparent dark:text-emerald-500 dark:border-emerald-500"
        : tone === "amber"
        ? "bg-transparent text-amber-500 border-amber-500 dark:bg-transparent dark:text-amber-500 dark:border-amber-500"
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

  if (loadingGetSingleScientificDegree) {
    return <LoadingGetData text={t("gettingData.scientificDegreeData")} />
  }

  if (singleScientificDegreeError) {
    return (
      <div className={pageClass} dir={isRTL ? "rtl" : "ltr"}>
        <div className="max-w-3xl mx-auto">
          <div className={`${cardClass} rounded-2xl border p-8 text-center`}>
            <div className="w-20 h-20 rounded-full bg-transparent text-red-500 border-2 border-red-500 dark:bg-transparent dark:text-red-500 dark:border-red-500 flex items-center justify-center mx-auto mb-6 shadow-sm">
              <XCircle className="w-10 h-10" />
            </div>

            <div className="text-lg font-black mb-6 text-red-500 dark:text-red-500">
              {currentLang === "en"
                ? singleScientificDegreeError?.messageEn ||
                  "Error loading scientific degree data"
                : singleScientificDegreeError?.messageAr ||
                  "حدث خطأ أثناء تحميل بيانات الدرجة العلمية"}
            </div>

            <Link
              to="/admin-panel/scientific-degrees"
              className={defaultButtonClass}
            >
              {isRTL ? <ArrowRight size={16} /> : <ArrowLeft size={16} />}
              {t("scientificDegrees.backToList")}
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (!selectedScientificDegree) {
    return (
      <div className={pageClass} dir={isRTL ? "rtl" : "ltr"}>
        <div className="max-w-3xl mx-auto">
          <div className={`${cardClass} rounded-2xl border p-8 text-center`}>
            <div className="w-20 h-20 rounded-full bg-transparent text-slate-500 border-2 border-slate-500 dark:bg-transparent dark:text-slate-500 dark:border-slate-500 flex items-center justify-center mx-auto mb-6 shadow-sm">
              <FileText className="w-10 h-10" />
            </div>

            <div className={`text-lg font-black mb-6 ${textMuted}`}>
              {t("scientificDegrees.notFound")}
            </div>

            <Link
              to="/admin-panel/scientific-degrees"
              className={defaultButtonClass}
            >
              {isRTL ? <ArrowRight size={16} /> : <ArrowLeft size={16} />}
              {t("scientificDegrees.backToList")}
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
              to="/admin-panel/scientific-degrees"
              className={defaultButtonClass}
            >
              {isRTL ? <ArrowRight size={16} /> : <ArrowLeft size={16} />}
              {t("scientificDegrees.backToList")}
            </Link>

            <Link
              to={`/admin-panel/scientific-degrees/edit/${selectedScientificDegree.id}`}
            >
              <button type="button" className={editButtonClass}>
                <Edit size={16} className="shrink-0" />
                {t("scientificDegrees.actions.edit")}
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
                    {getScientificDegreeName()}
                  </h1>

                  {getScientificDegreeSecondaryName() && (
                    <p className={`mt-1 text-base font-bold ${textMuted}`}>
                      {getScientificDegreeSecondaryName()}
                    </p>
                  )}

                  <div className="flex flex-wrap items-center gap-2 mt-3">
                    <CodeBadge code={selectedScientificDegree.code} />
                    <StatusBadge
                      isActive={selectedScientificDegree.isActive}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 w-full md:w-auto">
                <div className="rounded-2xl border-2 bg-transparent text-emerald-500 border-emerald-500 dark:bg-transparent dark:text-emerald-500 dark:border-emerald-500 px-4 py-3 shadow-sm">
                  <p className="text-xs font-black opacity-90">
                    {t("scientificDegrees.table.users")}
                  </p>
                  <p className="text-2xl font-black">
                    {selectedScientificDegree.usersCount ?? 0}
                  </p>
                </div>

                <div className="rounded-2xl border-2 bg-transparent text-blue-500 border-blue-500 dark:bg-transparent dark:text-blue-500 dark:border-blue-500 px-4 py-3 shadow-sm">
                  <p className="text-xs font-black opacity-90">
                    {t("scientificDegrees.details.code")}
                  </p>
                  <p className="text-lg font-black truncate">
                    {selectedScientificDegree.code || "-"}
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
                {t("scientificDegrees.details.basicInfo")}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoField
                  icon={FileText}
                  label={t("scientificDegrees.form.nameArabic")}
                  value={selectedScientificDegree.nameArabic}
                  dir="rtl"
                  tone="blue"
                />

                <InfoField
                  icon={FileText}
                  label={t("scientificDegrees.form.nameEnglish")}
                  value={selectedScientificDegree.nameEnglish}
                  dir="ltr"
                  tone="blue"
                />

                <InfoField
                  icon={Hash}
                  label={t("scientificDegrees.details.code")}
                  value={selectedScientificDegree.code}
                  tone="amber"
                />

                <div className={`rounded-2xl border p-4 ${softCardClass}`}>
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 shadow-sm ${
                        selectedScientificDegree.isActive
                          ? "bg-transparent text-emerald-500 border-emerald-500 dark:bg-transparent dark:text-emerald-500 dark:border-emerald-500"
                          : "bg-transparent text-red-500 border-red-500 dark:bg-transparent dark:text-red-500 dark:border-red-500"
                      }`}
                    >
                      {selectedScientificDegree.isActive ? (
                        <CheckCircle className="w-5 h-5 shrink-0" />
                      ) : (
                        <XCircle className="w-5 h-5 shrink-0" />
                      )}
                    </div>

                    <div>
                      <p className={`text-xs font-black mb-2 ${textSoft}`}>
                        {t("scientificDegrees.table.status")}
                      </p>
                      <StatusBadge
                        isActive={selectedScientificDegree.isActive}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {selectedScientificDegree.users &&
              selectedScientificDegree.users.length > 0 && (
                <div className={`${cardClass} rounded-3xl border p-6`}>
                  <div className="flex items-center justify-between gap-4 flex-wrap mb-6">
                    <h2 className={sectionTitleClass}>
                      <span className={iconBoxEmerald}>
                        <Users className={smallIconClass} />
                      </span>
                      {t("scientificDegrees.details.associatedUsers")}
                    </h2>

                    <span className="px-3 py-1.5 rounded-full text-xs font-black bg-transparent text-emerald-500 border-2 border-emerald-500 dark:bg-transparent dark:text-emerald-500 dark:border-emerald-500 shadow-sm">
                      {selectedScientificDegree.usersCount ?? 0}
                    </span>
                  </div>

                  <div className="space-y-4">
                    {selectedScientificDegree.users.slice(0, 5).map((user) => (
                      <UserCard key={user.id} user={user} />
                    ))}

                    {selectedScientificDegree.usersCount > 5 && (
                      <div
                        className={`text-center py-3 font-black ${textMuted}`}
                      >
                        {t("scientificDegrees.details.andMoreUsers", {
                          count: selectedScientificDegree.usersCount - 5,
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}
          </div>

          <div className="space-y-6">
            <div className={`${cardClass} rounded-3xl border p-6`}>
              <h3 className={`${sectionTitleClass} mb-5`}>
                <span className={iconBoxEmerald}>
                  <Users className={smallIconClass} />
                </span>
                {t("scientificDegrees.details.statistics")}
              </h3>

              <div className="space-y-4">
                <StatBox
                  icon={Users}
                  label={t("scientificDegrees.table.users")}
                  value={selectedScientificDegree.usersCount ?? 0}
                  tone="emerald"
                />

                <StatBox
                  icon={Hash}
                  label={t("scientificDegrees.details.code")}
                  value={selectedScientificDegree.code || "-"}
                  tone="blue"
                />
              </div>
            </div>

            <div className={`${cardClass} rounded-3xl border p-6`}>
              <h3 className={`${sectionTitleClass} mb-5`}>
                <span className={iconBoxAmber}>
                  <Clock className={smallIconClass} />
                </span>
                {t("scientificDegrees.details.auditInfo")}
              </h3>

              <div className="space-y-4">
                <InfoField
                  icon={Calendar}
                  label={t("scientificDegrees.details.createdAt")}
                  value={formatDate(selectedScientificDegree.createdAt)}
                  tone="amber"
                />

                {selectedScientificDegree.createdByUser && (
                  <InfoField
                    icon={User}
                    label={t("scientificDegrees.details.createdBy")}
                    value={getUserName(selectedScientificDegree.createdByUser)}
                    tone="blue"
                  />
                )}

                {selectedScientificDegree.updatedAt && (
                  <InfoField
                    icon={Clock}
                    label={t("scientificDegrees.details.updatedAt")}
                    value={formatDate(selectedScientificDegree.updatedAt)}
                    tone="amber"
                  />
                )}

                {selectedScientificDegree.updatedByUser && (
                  <InfoField
                    icon={User}
                    label={t("scientificDegrees.details.updatedBy")}
                    value={getUserName(selectedScientificDegree.updatedByUser)}
                    tone="blue"
                  />
                )}
              </div>
            </div>

            <div className={`${cardClass} rounded-3xl border p-6`}>
              <h3 className={`${sectionTitleClass} mb-5`}>
                <span className={iconBoxViolet}>
                  <Shield className={smallIconClass} />
                </span>
                {t("scientificDegrees.table.status")}
              </h3>

              <StatusBadge isActive={selectedScientificDegree.isActive} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SpecificScientificDegree