import React, { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useParams, useNavigate, Link } from "react-router-dom"
import { getShiftHoursTypeById } from "../../../state/act/actShiftHours"
import {
  clearSingleShiftHoursType,
  clearSingleShiftHoursTypeError,
} from "../../../state/slices/shiftHours"
import LoadingGetData from "../../../components/LoadingGetData"
import { useTranslation } from "react-i18next"
import {
  ArrowLeft,
  ArrowRight,
  Edit,
  User,
  Clock,
  CheckCircle,
  XCircle,
  Calendar,
  FileText,
  Hash,
  Info,
  Sun,
  Moon,
  Sunrise,
  Sunset,
  Timer,
  AlertTriangle,
} from "lucide-react"
import { formatDate } from "../../../utils/formtDate"

function SpecificShiftHoursType() {
  const { id } = useParams()
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const {
    selectedShiftHoursType,
    loadingGetSingleShiftHoursType,
    singleShiftHoursTypeError,
  } = useSelector((state) => state.shiftHour)

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

  const iconBoxAmber =
    "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm border bg-transparent text-amber-500 border-amber-500 dark:bg-transparent dark:text-amber-500 dark:border-amber-500"

  const smallIconClass = "w-5 h-5 shrink-0"
  const sectionTitleClass = `text-xl font-black ${textMain} flex items-center gap-3`

  useEffect(() => {
    if (id) {
      dispatch(clearSingleShiftHoursType())
      dispatch(getShiftHoursTypeById(id))
    }

    return () => {
      dispatch(clearSingleShiftHoursType())
      dispatch(clearSingleShiftHoursTypeError())
    }
  }, [dispatch, id])

  useEffect(() => {
    if (singleShiftHoursTypeError) {
      if (singleShiftHoursTypeError.status === 404) {
        console.error("ShiftHoursType not found")
      } else if (singleShiftHoursTypeError.status === 403) {
        console.error("Access denied")
      }
    }
  }, [singleShiftHoursTypeError, navigate])

  const getShiftHoursTypeName = () => {
    if (!selectedShiftHoursType) return ""

    return currentLang === "en"
      ? selectedShiftHoursType.nameEnglish
      : selectedShiftHoursType.nameArabic
  }

  const getShiftHoursTypeSecondaryName = () => {
    if (!selectedShiftHoursType) return ""

    return currentLang === "en"
      ? selectedShiftHoursType.nameArabic
      : selectedShiftHoursType.nameEnglish
  }

  const getUserName = (user) => {
    if (!user) return ""
    return currentLang === "en" ? user.nameEnglish : user.nameArabic
  }

  const formatTime = (timeString) => {
    if (!timeString) return "-"

    const [hours, minutes] = timeString.split(":")
    const hour24 = parseInt(hours)
    const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24
    const ampm = hour24 >= 12 ? "PM" : "AM"

    return `${hour12}:${minutes} ${ampm}`
  }

  const normalizePeriod = (period) => {
    if (!period) return ""

    const value = String(period).toLowerCase().trim()

    if (value.includes("morning")) return "morning"
    if (value.includes("afternoon")) return "afternoon"
    if (value.includes("evening")) return "evening"
    if (value.includes("night")) return "night"

    return value
  }

  const getPeriodLabel = (period) => {
    const normalized = normalizePeriod(period)

    const translationKey = `shiftHoursTypes.periods.${normalized}`
    const translated = t(translationKey)

    if (translated && translated !== translationKey) {
      return translated
    }

    const fallbackMap = {
      morning: currentLang === "ar" ? "صباحي" : "Morning",
      afternoon: currentLang === "ar" ? "بعد الظهر" : "Afternoon",
      evening: currentLang === "ar" ? "مسائي" : "Evening",
      night: currentLang === "ar" ? "ليلي" : "Night",
    }

    return fallbackMap[normalized] || period || "-"
  }

  const getPeriodIcon = (period) => {
    const normalized = normalizePeriod(period)

    switch (normalized) {
      case "morning":
        return Sunrise
      case "afternoon":
        return Sun
      case "evening":
        return Sunset
      case "night":
        return Moon
      default:
        return Clock
    }
  }

  const getPeriodTone = (period) => {
    const normalized = normalizePeriod(period)

    switch (normalized) {
      case "morning":
        return {
          box: "bg-transparent text-amber-500 border-amber-500 dark:bg-transparent dark:text-amber-500 dark:border-amber-500",
          badge:
            "bg-transparent text-amber-500 border-amber-500 dark:bg-transparent dark:text-amber-500 dark:border-amber-500",
          stat:
            "bg-transparent text-amber-500 border-amber-500 dark:bg-transparent dark:text-amber-500 dark:border-amber-500",
          gradient: "from-amber-500 to-orange-500",
        }

      case "afternoon":
        return {
          box: "bg-transparent text-orange-500 border-orange-500 dark:bg-transparent dark:text-orange-500 dark:border-orange-500",
          badge:
            "bg-transparent text-orange-500 border-orange-500 dark:bg-transparent dark:text-orange-500 dark:border-orange-500",
          stat:
            "bg-transparent text-orange-500 border-orange-500 dark:bg-transparent dark:text-orange-500 dark:border-orange-500",
          gradient: "from-orange-500 to-red-500",
        }

      case "evening":
        return {
          box: "bg-transparent text-violet-500 border-violet-500 dark:bg-transparent dark:text-violet-500 dark:border-violet-500",
          badge:
            "bg-transparent text-violet-500 border-violet-500 dark:bg-transparent dark:text-violet-500 dark:border-violet-500",
          stat:
            "bg-transparent text-violet-500 border-violet-500 dark:bg-transparent dark:text-violet-500 dark:border-violet-500",
          gradient: "from-violet-500 to-blue-500",
        }

      case "night":
        return {
          box: "bg-transparent text-blue-500 border-blue-500 dark:bg-transparent dark:text-blue-500 dark:border-blue-500",
          badge:
            "bg-transparent text-blue-500 border-blue-500 dark:bg-transparent dark:text-blue-500 dark:border-blue-500",
          stat:
            "bg-transparent text-blue-500 border-blue-500 dark:bg-transparent dark:text-blue-500 dark:border-blue-500",
          gradient: "from-blue-500 to-indigo-500",
        }

      default:
        return {
          box: "bg-transparent text-slate-500 border-slate-500 dark:bg-transparent dark:text-slate-500 dark:border-slate-500",
          badge:
            "bg-transparent text-slate-500 border-slate-500 dark:bg-transparent dark:text-slate-500 dark:border-slate-500",
          stat:
            "bg-transparent text-slate-500 border-slate-500 dark:bg-transparent dark:text-slate-500 dark:border-slate-500",
          gradient: "from-slate-500 to-slate-700",
        }
    }
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
    <span className="inline-flex items-center gap-1.5 text-sm font-black px-3 py-1.5 rounded-full border-2 bg-slate-200 text-slate-950 border-slate-500 dark:bg-slate-800 dark:text-white dark:border-slate-400 shadow-sm">
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
        ? t("shiftHoursTypes.status.active")
        : t("shiftHoursTypes.status.inactive")}
    </span>
  )

  const OvertimeBadge = ({ isOvertime }) => (
    <span
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-black border-2 shadow-sm ${
        isOvertime
          ? "bg-transparent text-orange-500 border-orange-500 dark:bg-transparent dark:text-orange-500 dark:border-orange-500"
          : "bg-transparent text-emerald-500 border-emerald-500 dark:bg-transparent dark:text-emerald-500 dark:border-emerald-500"
      }`}
    >
      {isOvertime ? (
        <AlertTriangle className="w-4 h-4 shrink-0" />
      ) : (
        <CheckCircle className="w-4 h-4 shrink-0" />
      )}

      {isOvertime ? t("shiftHoursTypes.overtime") : t("shiftHoursTypes.regular")}
    </span>
  )

  const StatBox = ({ icon: Icon, label, value, tone = "blue" }) => {
    const toneClass =
      tone === "emerald"
        ? "bg-emerald-200 text-emerald-950 border-emerald-500 dark:bg-emerald-800/80 dark:text-white dark:border-emerald-400"
        : tone === "amber"
        ? "bg-amber-200 text-amber-950 border-amber-500 dark:bg-amber-800/80 dark:text-white dark:border-amber-400"
        : tone === "orange"
        ? "bg-orange-200 text-orange-950 border-orange-500 dark:bg-orange-800/80 dark:text-white dark:border-orange-400"
        : tone === "violet"
        ? "bg-violet-200 text-violet-950 border-violet-500 dark:bg-violet-800/80 dark:text-white dark:border-violet-400"
        : "bg-blue-200 text-blue-950 border-blue-500 dark:bg-blue-800/80 dark:text-white dark:border-blue-400"

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

  if (loadingGetSingleShiftHoursType) {
    return <LoadingGetData text={t("gettingData.shiftHourData")} />
  }

  if (singleShiftHoursTypeError) {
    return (
      <div className={pageClass} dir={isRTL ? "rtl" : "ltr"}>
        <div className="max-w-3xl mx-auto">
          <div className={`${cardClass} rounded-2xl border p-8 text-center`}>
            <div className="w-20 h-20 rounded-full bg-red-200 text-red-950 border-2 border-red-500 dark:bg-red-800/80 dark:text-white dark:border-red-400 flex items-center justify-center mx-auto mb-6 shadow-sm">
              <XCircle className="w-10 h-10" />
            </div>

            <div className="text-lg font-black mb-6 text-red-800 dark:text-red-100">
              {singleShiftHoursTypeError?.message ||
                t("shiftHoursTypes.fetchError")}
            </div>

            <Link
              to="/admin-panel/shift-hours-types"
              className={defaultButtonClass}
            >
              {isRTL ? <ArrowRight size={16} /> : <ArrowLeft size={16} />}
              {t("shiftHoursTypes.backToList")}
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (!selectedShiftHoursType) {
    return (
      <div className={pageClass} dir={isRTL ? "rtl" : "ltr"}>
        <div className="max-w-3xl mx-auto">
          <div className={`${cardClass} rounded-2xl border p-8 text-center`}>
            <div className="w-20 h-20 rounded-full bg-slate-200 text-slate-950 border-2 border-slate-500 dark:bg-slate-800 dark:text-white dark:border-slate-400 flex items-center justify-center mx-auto mb-6 shadow-sm">
              <FileText className="w-10 h-10" />
            </div>

            <div className={`text-lg font-black mb-6 ${textMuted}`}>
              {t("shiftHoursTypes.notFound")}
            </div>

            <Link
              to="/admin-panel/shift-hours-types"
              className={defaultButtonClass}
            >
              {isRTL ? <ArrowRight size={16} /> : <ArrowLeft size={16} />}
              {t("shiftHoursTypes.backToList")}
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const PeriodIcon = getPeriodIcon(selectedShiftHoursType.period)
  const periodTone = getPeriodTone(selectedShiftHoursType.period)
  const periodLabel = getPeriodLabel(selectedShiftHoursType.period)

  return (
    <div className={pageClass} dir={isRTL ? "rtl" : "ltr"}>
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <div className="flex items-center justify-between gap-3 flex-wrap mb-5">
            <Link
              to="/admin-panel/shift-hours-types"
              className={defaultButtonClass}
            >
              {isRTL ? <ArrowRight size={16} /> : <ArrowLeft size={16} />}
              {t("shiftHoursTypes.backToList")}
            </Link>

            <Link
              to={`/admin-panel/shift-hours-types/edit/${selectedShiftHoursType.id}`}
            >
              <button type="button" className={editButtonClass}>
                <Edit size={16} className="shrink-0" />
                {t("shiftHoursTypes.actions.edit")}
              </button>
            </Link>
          </div>

          <div className={`${cardClass} rounded-3xl border p-6`}>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-start gap-4 min-w-0">
                <div
                  className={`w-20 h-20 rounded-3xl flex items-center justify-center shrink-0 shadow-sm border-2 ${periodTone.box}`}
                >
                  <PeriodIcon className="w-10 h-10 shrink-0" />
                </div>

                <div className="min-w-0">
                  <h1
                    className={`text-3xl font-black tracking-tight ${textMain}`}
                  >
                    {getShiftHoursTypeName()}
                  </h1>

                  {getShiftHoursTypeSecondaryName() && (
                    <p className={`mt-1 text-base font-bold ${textMuted}`}>
                      {getShiftHoursTypeSecondaryName()}
                    </p>
                  )}

                  <div className="flex flex-wrap items-center gap-2 mt-3">
                    <CodeBadge code={selectedShiftHoursType.code} />

                    <span
                      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-black border-2 shadow-sm ${periodTone.badge}`}
                    >
                      <PeriodIcon className="w-4 h-4 shrink-0" />
                      {periodLabel}
                    </span>

                    <StatusBadge isActive={selectedShiftHoursType.isActive} />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 w-full md:w-auto">
                <div className="rounded-2xl border-2 bg-blue-200 text-blue-950 border-blue-500 dark:bg-blue-800/80 dark:text-white dark:border-blue-400 px-4 py-3 shadow-sm">
                  <p className="text-xs font-black opacity-90">
                    {t("shiftHoursTypes.form.hoursCount")}
                  </p>
                  <p className="text-2xl font-black">
                    {selectedShiftHoursType.hours ?? 0}h
                  </p>
                </div>

                <div
                  className={`rounded-2xl border-2 px-4 py-3 shadow-sm ${periodTone.stat}`}
                >
                  <p className="text-xs font-black opacity-90">
                    {t("shiftHoursTypes.form.period")}
                  </p>
                  <p className="text-lg font-black truncate">{periodLabel}</p>
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
                {t("shiftHoursTypes.details.basicInfo")}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoField
                  icon={FileText}
                  label={t("shiftHoursTypes.form.nameArabic")}
                  value={selectedShiftHoursType.nameArabic}
                  dir="rtl"
                  tone="blue"
                />

                <InfoField
                  icon={FileText}
                  label={t("shiftHoursTypes.form.nameEnglish")}
                  value={selectedShiftHoursType.nameEnglish}
                  dir="ltr"
                  tone="blue"
                />

                <InfoField
                  icon={PeriodIcon}
                  label={t("shiftHoursTypes.form.period")}
                  value={periodLabel}
                  tone="amber"
                />

                <InfoField
                  icon={Timer}
                  label={t("shiftHoursTypes.form.hoursCount")}
                  value={`${selectedShiftHoursType.hours ?? 0} ${t(
                    "shiftHoursTypes.hours"
                  )}`}
                  tone="blue"
                />

                <div className={`rounded-2xl border p-4 ${softCardClass}`}>
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 shadow-sm ${
                        selectedShiftHoursType.isActive
                          ? "bg-emerald-200 text-emerald-950 border-emerald-500 dark:bg-emerald-900/70 dark:text-emerald-100 dark:border-emerald-400"
                          : "bg-red-200 text-red-950 border-red-500 dark:bg-red-900/70 dark:text-red-100 dark:border-red-400"
                      }`}
                    >
                      {selectedShiftHoursType.isActive ? (
                        <CheckCircle className="w-5 h-5 shrink-0" />
                      ) : (
                        <XCircle className="w-5 h-5 shrink-0" />
                      )}
                    </div>

                    <div>
                      <p className={`text-xs font-black mb-2 ${textSoft}`}>
                        {t("shiftHoursTypes.table.status")}
                      </p>
                      <StatusBadge isActive={selectedShiftHoursType.isActive} />
                    </div>
                  </div>
                </div>

                <div className={`rounded-2xl border p-4 ${softCardClass}`}>
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 shadow-sm ${
                        selectedShiftHoursType.isOvertime
                          ? "bg-orange-200 text-orange-950 border-orange-500 dark:bg-orange-900/70 dark:text-orange-100 dark:border-orange-400"
                          : "bg-emerald-200 text-emerald-950 border-emerald-500 dark:bg-emerald-900/70 dark:text-emerald-100 dark:border-emerald-400"
                      }`}
                    >
                      {selectedShiftHoursType.isOvertime ? (
                        <AlertTriangle className="w-5 h-5 shrink-0" />
                      ) : (
                        <CheckCircle className="w-5 h-5 shrink-0" />
                      )}
                    </div>

                    <div>
                      <p className={`text-xs font-black mb-2 ${textSoft}`}>
                        {t("shiftHoursTypes.form.isOvertime")}
                      </p>
                      <OvertimeBadge
                        isOvertime={selectedShiftHoursType.isOvertime}
                      />
                    </div>
                  </div>
                </div>

                {selectedShiftHoursType.description && (
                  <div className="md:col-span-2">
                    <InfoField
                      icon={FileText}
                      label={t("shiftHoursTypes.form.description")}
                      value={selectedShiftHoursType.description}
                      tone="violet"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className={`${cardClass} rounded-3xl border p-6`}>
              <h2 className={`${sectionTitleClass} mb-6`}>
                <span className={iconBoxAmber}>
                  <Clock className={smallIconClass} />
                </span>
                {t("shiftHoursTypes.details.timeInfo")}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoField
                  icon={Sunrise}
                  label={t("shiftHoursTypes.form.startTime")}
                  value={formatTime(selectedShiftHoursType.startTime)}
                  tone="emerald"
                />

                <InfoField
                  icon={Sunset}
                  label={t("shiftHoursTypes.form.endTime")}
                  value={formatTime(selectedShiftHoursType.endTime)}
                  tone="red"
                />
              </div>

              <div className="mt-6">
                <label className={`block text-sm font-black mb-4 ${textSoft}`}>
                  {t("shiftHoursTypes.details.timeline")}
                </label>

                <div className="relative h-20 rounded-2xl overflow-hidden border-2 border-slate-300 bg-slate-200 dark:bg-gray-800 dark:border-gray-600 shadow-sm">
                  <div className="absolute inset-0 flex">
                    {Array.from({ length: 24 }, (_, i) => (
                      <div
                        key={i}
                        className="flex-1 border-r border-slate-400/50 dark:border-gray-600 last:border-r-0 relative"
                      >
                        <span className="absolute top-1 left-1 text-[10px] font-black text-slate-700 dark:text-slate-300">
                          {i.toString().padStart(2, "0")}
                        </span>
                      </div>
                    ))}
                  </div>

                  {selectedShiftHoursType.startTime &&
                    selectedShiftHoursType.endTime && (
                      <div
                        className={`absolute top-9 h-7 bg-gradient-to-r ${periodTone.gradient} rounded-xl shadow-md border border-white/40`}
                        style={{
                          left: `${
                            (parseInt(
                              selectedShiftHoursType.startTime.split(":")[0]
                            ) /
                              24) *
                            100
                          }%`,
                          width: `${(selectedShiftHoursType.hours / 24) * 100}%`,
                        }}
                      >
                        <div className="flex items-center justify-center h-full text-white text-xs font-black">
                          {selectedShiftHoursType.hours}h
                        </div>
                      </div>
                    )}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className={`${cardClass} rounded-3xl border p-6`}>
              <h3 className={`${sectionTitleClass} mb-5`}>
                <span className={iconBoxBlue}>
                  <Timer className={smallIconClass} />
                </span>
                {t("shiftHoursTypes.details.quickStats")}
              </h3>

              <div className="space-y-4">
                <StatBox
                  icon={Timer}
                  label={t("shiftHoursTypes.form.hoursCount")}
                  value={`${selectedShiftHoursType.hours ?? 0}h`}
                  tone="blue"
                />

                <StatBox
                  icon={PeriodIcon}
                  label={t("shiftHoursTypes.form.period")}
                  value={periodLabel}
                  tone="amber"
                />

                <StatBox
                  icon={
                    selectedShiftHoursType.isOvertime
                      ? AlertTriangle
                      : CheckCircle
                  }
                  label={t("shiftHoursTypes.form.isOvertime")}
                  value={
                    selectedShiftHoursType.isOvertime
                      ? t("shiftHoursTypes.yes")
                      : t("shiftHoursTypes.no")
                  }
                  tone={selectedShiftHoursType.isOvertime ? "orange" : "emerald"}
                />
              </div>
            </div>

            <div className={`${cardClass} rounded-3xl border p-6`}>
              <h3 className={`${sectionTitleClass} mb-5`}>
                <span className={iconBoxAmber}>
                  <Calendar className={smallIconClass} />
                </span>
                {t("shiftHoursTypes.details.auditInfo")}
              </h3>

              <div className="space-y-4">
                <InfoField
                  icon={Calendar}
                  label={t("shiftHoursTypes.details.createdAt")}
                  value={formatDate(selectedShiftHoursType.createdAt)}
                  tone="amber"
                />

                {selectedShiftHoursType.createdByUser && (
                  <>
                    <InfoField
                      icon={User}
                      label={t("shiftHoursTypes.details.createdBy")}
                      value={getUserName(selectedShiftHoursType.createdByUser)}
                      tone="blue"
                    />

                    <InfoField
                      icon={FileText}
                      label={
                        currentLang === "ar" ? "بيانات المنشئ" : "Creator Info"
                      }
                      value={`${selectedShiftHoursType.createdByUser.role || "-"} • ${
                        selectedShiftHoursType.createdByUser.email || "-"
                      }`}
                      tone="violet"
                    />
                  </>
                )}

                {selectedShiftHoursType.updatedAt && (
                  <InfoField
                    icon={Clock}
                    label={t("shiftHoursTypes.details.updatedAt")}
                    value={formatDate(selectedShiftHoursType.updatedAt)}
                    tone="amber"
                  />
                )}

                {selectedShiftHoursType.updatedByUser && (
                  <>
                    <InfoField
                      icon={User}
                      label={t("shiftHoursTypes.details.updatedBy")}
                      value={getUserName(selectedShiftHoursType.updatedByUser)}
                      tone="blue"
                    />

                    <InfoField
                      icon={FileText}
                      label={
                        currentLang === "ar" ? "بيانات المعدل" : "Updater Info"
                      }
                      value={`${selectedShiftHoursType.updatedByUser.role || "-"} • ${
                        selectedShiftHoursType.updatedByUser.email || "-"
                      }`}
                      tone="violet"
                    />
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SpecificShiftHoursType