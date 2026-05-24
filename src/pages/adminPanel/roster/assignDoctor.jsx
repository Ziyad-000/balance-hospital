import { useEffect, useState, useMemo, useCallback } from "react"
import { useParams, useNavigate } from "react-router-dom"
import i18next from "i18next"
import { useTranslation } from "react-i18next"
import { useDispatch, useSelector } from "react-redux"
import { Formik, Form, Field, ErrorMessage } from "formik"
import { toast } from "react-toastify"
import Swal from "sweetalert2"
import {
  ArrowLeft,
  UserPlus,
  X,
  Search,
  AlertCircle,
  CheckCircle,
  Users,
  Briefcase,
  Award,
  Calendar,
  Building,
  Clock,
} from "lucide-react"
import * as Yup from "yup"
import {
  assignDoctorToShift,
  getAvailableDoctorsForShift,
  getWorkingHour,
} from "../../../state/act/actRosterManagement"
import LoadingGetData from "../../../components/LoadingGetData"
import { formatDate } from "../../../utils/formtDate"
import { getPageTheme, swalTheme } from "../../../utils/themeClasses"

const MAX_NOTES_LENGTH = 500

const WORKLOAD_THRESHOLDS = {
  HIGH: 90,
  MEDIUM: 70,
}

const iconColors = {
  assign: "text-purple-600 dark:text-purple-400",
  clock: "text-blue-600 dark:text-blue-400",
  search: "text-blue-600 dark:text-blue-400",
  calendar: "text-blue-600 dark:text-blue-400",
  users: "text-blue-600 dark:text-blue-400",
  building: "text-green-600 dark:text-green-400",
  briefcase: "text-purple-600 dark:text-purple-400",
  award: "text-orange-600 dark:text-orange-400",
  success: "text-green-600 dark:text-green-400",
  warning: "text-yellow-600 dark:text-yellow-400",
  danger: "text-red-600 dark:text-red-400",
  muted: "text-[var(--color-text-muted)]",
}

const iconBg = {
  assign: "bg-purple-100 dark:bg-purple-900/30",
  clock: "bg-blue-100 dark:bg-blue-900/30",
  search: "bg-blue-100 dark:bg-blue-900/30",
  users: "bg-blue-100 dark:bg-blue-900/30",
}

const getDoctorStatusColor = (doctor) => {
  if (!doctor.isAvailable) {
    return "bg-[var(--color-danger-soft)] text-[var(--color-danger)] border border-[var(--color-danger)]/20"
  }

  if (doctor.hasConflict) {
    return "bg-[var(--color-warning-soft)] text-[var(--color-warning)] border border-[var(--color-warning)]/20"
  }

  return "bg-[var(--color-success-soft)] text-[var(--color-success)] border border-[var(--color-success)]/20"
}

const getDoctorStatusIcon = (doctor) => {
  if (!doctor.isAvailable) return <X size={14} />
  if (doctor.hasConflict) return <AlertCircle size={14} />
  return <CheckCircle size={14} />
}

const getWorkloadColor = (percentage) => {
  if (percentage > WORKLOAD_THRESHOLDS.HIGH) {
    return {
      text: "text-red-600 dark:text-red-400",
      bg: "bg-red-500",
    }
  }

  if (percentage > WORKLOAD_THRESHOLDS.MEDIUM) {
    return {
      text: "text-yellow-600 dark:text-yellow-400",
      bg: "bg-yellow-500",
    }
  }

  return {
    text: "text-green-600 dark:text-green-400",
    bg: "bg-green-500",
  }
}

const DoctorAvatar = ({ doctor }) => {
  if (doctor.profileImageUrl) {
    return (
      <img
        src={doctor.profileImageUrl}
        alt=""
        className="w-10 h-10 rounded-full object-cover"
      />
    )
  }

  return (
    <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[var(--color-bg-soft)] border border-[var(--color-border)]">
      <Users size={20} className={iconColors.users} />
    </div>
  )
}

const WorkloadIndicator = ({ doctor, t }) => {
  const workloadPercentage = doctor.workloadPercentage || 0
  const colorClasses = getWorkloadColor(workloadPercentage)

  return (
    <div className="mt-2">
      <div className="flex items-center justify-between text-xs">
        <span className="text-[var(--color-text-muted)]">
          {t("roster.assign.workload")}
        </span>

        <span className={`font-semibold ${colorClasses.text}`}>
          {workloadPercentage.toFixed(1)}%
        </span>
      </div>

      <div className="w-full rounded-full h-1.5 mt-1 bg-[var(--color-bg-soft)]">
        <div
          className={`h-1.5 rounded-full ${colorClasses.bg}`}
          style={{ width: `${Math.min(workloadPercentage, 100)}%` }}
        />
      </div>

      <div className="text-xs mt-1 text-[var(--color-text-muted)]">
        {doctor.currentMonthAssignments} {t("roster.assign.assignments")} •{" "}
        {doctor.currentMonthHours} {t("roster.assign.hours")}
      </div>
    </div>
  )
}

const ConflictDetails = ({ doctor, showConflictDetails, onToggle, t }) => {
  if (!doctor.hasConflict || !doctor.conflictDetails?.length) return null

  const conflicts =
    i18next.language === "en"
      ? doctor.conflictDetails
      : doctor.conflictDetailsAr

  return (
    <div className="mt-2">
      <button
        type="button"
        onClick={onToggle}
        className="text-xs underline text-yellow-600 dark:text-yellow-400 hover:opacity-80"
      >
        {showConflictDetails
          ? t("roster.assign.hideConflicts")
          : t("roster.assign.showConflicts")}
      </button>

      {showConflictDetails && (
        <div className="mt-1 p-2 rounded-lg text-xs bg-[var(--color-warning-soft)] text-[var(--color-warning)] border border-[var(--color-warning)]/20">
          {conflicts.map((conflict, index) => (
            <div
              key={index}
              className="flex items-center space-x-1 rtl:space-x-reverse"
            >
              <AlertCircle size={12} />
              <span>{conflict}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

const DoctorCard = ({
  doctor,
  isSelected,
  onSelect,
  showConflictDetails,
  onToggleConflicts,
  currentLang,
  isRTL,
  t,
}) => {
  const handleClick = useCallback(() => {
    onSelect(doctor)
  }, [doctor, onSelect])

  const handleToggleConflicts = useCallback(
    (e) => {
      e.stopPropagation()
      onToggleConflicts(doctor.doctorId)
    },
    [doctor.doctorId, onToggleConflicts]
  )

  return (
    <div
      className={`border rounded-xl p-4 cursor-pointer transition-colors ${
        isSelected
          ? "border-[var(--color-primary)] bg-[var(--color-primary-soft)]"
          : "border-[var(--color-border)] bg-[var(--color-surface)] hover:bg-[var(--color-bg-soft)]"
      }`}
      onClick={handleClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3 rtl:space-x-reverse flex-1">
          <div className="flex-shrink-0">
            <DoctorAvatar doctor={doctor} />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h3 className="font-semibold truncate text-[var(--color-text)]">
                {currentLang === "ar"
                  ? doctor.doctorNameArabic
                  : doctor.doctorName}
              </h3>

              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${getDoctorStatusColor(
                  doctor
                )}`}
              >
                {getDoctorStatusIcon(doctor)}
                <span className={isRTL ? "mr-1" : "ml-1"}>
                  {doctor.isAvailable
                    ? doctor.hasConflict
                      ? t("roster.assign.status.conflict")
                      : t("roster.assign.status.available")
                    : t("roster.assign.status.unavailable")}
                </span>
              </span>
            </div>

            <div className="text-sm space-y-1 text-[var(--color-text-muted)]">
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <Briefcase size={14} className={iconColors.briefcase} />
                <span>{doctor.specialty}</span>
              </div>

              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <Award size={14} className={iconColors.award} />
                <span>{doctor.scientificDegreeName}</span>
              </div>

              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <Calendar size={14} className={iconColors.calendar} />
                <span>{doctor.contractingTypeName}</span>
              </div>
            </div>

            <WorkloadIndicator doctor={doctor} t={t} />

            <ConflictDetails
              doctor={doctor}
              showConflictDetails={showConflictDetails[doctor.doctorId]}
              onToggle={handleToggleConflicts}
              t={t}
            />

            {doctor.priorityScore && (
              <div className="mt-2">
                <div className="text-xs text-[var(--color-text-muted)]">
                  {t("roster.assign.priorityScore")}: {doctor.priorityScore}/100
                </div>

                {doctor.priorityReason && (
                  <div className="text-xs mt-1 text-[var(--color-text-muted)]">
                    {doctor.priorityReason}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex-shrink-0 ml-3 rtl:ml-0 rtl:mr-3">
          <Field
            type="radio"
            name="doctorId"
            value={doctor.doctorId}
            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 focus:ring-2"
          />
        </div>
      </div>
    </div>
  )
}

const EmptyState = ({ searchTerm, t }) => (
  <div className="text-center py-8 border-2 border-dashed rounded-xl border-[var(--color-border)] bg-[var(--color-surface-muted)]">
    <Users size={48} className="mx-auto mb-3 text-[var(--color-text-soft)]" />

    <p className="text-sm text-[var(--color-text-muted)]">
      {searchTerm
        ? t("roster.assign.noDoctorsFound")
        : t("roster.assign.noAvailableDoctors")}
    </p>
  </div>
)

const ShiftInfo = ({ workingHour, isRTL, t }) => {
  if (!workingHour) return null

  const currentLang = i18next.language

  const formatTime = (timeString) => {
    if (!timeString) return "-"
    const time = new Date(timeString)

    return time.toLocaleTimeString(isRTL ? "ar-SA" : "en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })
  }

  const shift = workingHour.shift || {}
  const department = workingHour.department || {}
  const contractingType = workingHour.contractingType || {}

  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 mb-6 shadow-[var(--shadow-sm)]">
      <div className="flex items-start space-x-4 rtl:space-x-reverse">
        <div className={`p-3 rounded-xl ${iconBg.clock}`}>
          <Clock className={`w-6 h-6 ${iconColors.clock}`} />
        </div>

        <div className="flex-1">
          <h3 className="text-lg font-semibold text-[var(--color-text)] mb-2">
            {t("roster.assign.shiftDetails")}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <div className="text-sm text-[var(--color-text-muted)]">
                {t("common.date")}
              </div>
              <div className="font-semibold text-[var(--color-text)]">
                {formatDate(workingHour.shiftDate)}
              </div>
              {workingHour.dayOfWeekName && (
                <div className="text-sm text-[var(--color-text-muted)]">
                  {workingHour.dayOfWeekName}
                </div>
              )}
            </div>

            <div>
              <div className="text-sm text-[var(--color-text-muted)]">
                {t("adminPanel.shiftHours")}
              </div>
              <div className="font-semibold text-[var(--color-text)]">
                {formatTime(shift.startTime)} - {formatTime(shift.endTime)}
              </div>
              {shift.name && (
                <div className="text-sm text-[var(--color-text-muted)]">
                  {shift.name}
                </div>
              )}
            </div>

            <div>
              <div className="text-sm text-[var(--color-text-muted)]">
                {t("common.department")}
              </div>
              <div className="font-semibold text-[var(--color-text)]">
                {currentLang === "en"
                  ? department.nameEnglish
                  : department.nameArabic}
              </div>
            </div>

            <div>
              <div className="text-sm text-[var(--color-text-muted)]">
                {t("roster.capacity")}
              </div>
              <div className="font-semibold text-[var(--color-text)]">
                {workingHour.currentAssignedDoctors || 0}/
                {workingHour.requiredDoctors || 0} {t("roster.assign.doctors")}
              </div>
              <div className="text-sm text-[var(--color-text-muted)]">
                {workingHour.fillPercentage || 0}% {t("roster.filled")}
              </div>
            </div>

            <div>
              <div className="text-sm text-[var(--color-text-muted)]">
                {t("roster.table.period")}
              </div>
              <div className="font-semibold text-[var(--color-text)]">
                {shift.hours || 0} h
              </div>
              {shift.period && (
                <div className="text-sm text-[var(--color-text-muted)]">
                  {shift.period}
                </div>
              )}
            </div>

            <div>
              <div className="text-sm text-[var(--color-text-muted)]">
                {t("roster.contractingTypes.fields.contractingTypes")}
              </div>
              <div className="font-semibold text-[var(--color-text)]">
                {currentLang === "ar"
                  ? contractingType.nameArabic
                  : contractingType.nameEnglish}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mt-4">
            {workingHour.isFullyBooked && (
              <span className="px-2 py-1 text-xs rounded-full bg-[var(--color-danger-soft)] text-[var(--color-danger)] border border-[var(--color-danger)]/20">
                {t("roster.fullyBooked")}
              </span>
            )}

            {workingHour.isOverBooked && (
              <span className="px-2 py-1 text-xs rounded-full bg-[var(--color-warning-soft)] text-[var(--color-warning)] border border-[var(--color-warning)]/20">
                {t("roster.overBooked")}
              </span>
            )}

            {workingHour.remainingSlots > 0 && (
              <span className="px-2 py-1 text-xs rounded-full bg-[var(--color-success-soft)] text-[var(--color-success)] border border-[var(--color-success)]/20">
                {workingHour.remainingSlots} {t("roster.remainingSlots")}
              </span>
            )}
          </div>

          {workingHour.notes && (
            <div className="mt-4 p-3 rounded-lg bg-[var(--color-info-soft)] border border-[var(--color-info)]/20">
              <div className="text-sm font-semibold text-[var(--color-info)] mb-1">
                {t("roster.assign.notes")}
              </div>

              <div className="text-sm text-[var(--color-info)]">
                {workingHour.notes}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function AssignDoctor() {
  const { workingHourId } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const theme = getPageTheme()

  const { loading, availableDoctorsForShift, errors, workingHour } =
    useSelector((state) => state.rosterManagement)

  const { t } = useTranslation()
  const currentLang = i18next.language
  const isRTL = currentLang === "ar"

  const [searchTerm, setSearchTerm] = useState("")
  const [selectedDoctor, setSelectedDoctor] = useState(null)
  const [showConflictDetails, setShowConflictDetails] = useState({})

  const validationSchema = useMemo(
    () =>
      Yup.object({
        doctorId: Yup.number()
          .required(t("roster.assign.validation.doctorRequired"))
          .positive(t("roster.assign.validation.doctorInvalid")),
        notes: Yup.string()
          .max(MAX_NOTES_LENGTH, t("roster.assign.validation.notesMaxLength"))
          .nullable(),
        overrideConflicts: Yup.boolean(),
      }),
    [t]
  )

  const initialValues = useMemo(
    () => ({
      doctorId: "",
      notes: "",
      overrideConflicts: false,
    }),
    []
  )

  useEffect(() => {
    if (workingHourId) {
      dispatch(getWorkingHour({ workingHourId }))
      dispatch(
        getAvailableDoctorsForShift({
          workingHourId,
        })
      )
    }
  }, [dispatch, workingHourId])

  const filteredDoctors = useMemo(() => {
    if (!searchTerm) return availableDoctorsForShift

    const searchLower = searchTerm.toLowerCase()

    return availableDoctorsForShift.filter((doctor) => {
      const doctorName = (doctor.doctorName || "").toLowerCase()
      const doctorNameArabic = (doctor.doctorNameArabic || "").toLowerCase()
      const specialty = (doctor.specialty || "").toLowerCase()

      return (
        doctorName.includes(searchLower) ||
        doctorNameArabic.includes(searchLower) ||
        specialty.includes(searchLower)
      )
    })
  }, [availableDoctorsForShift, searchTerm])

  const showSweetAlert = useCallback((options) => {
    return Swal.fire({
      ...swalTheme,
      ...options,
    })
  }, [])

  const handleSubmit = useCallback(
    async (values, { setSubmitting }) => {
      try {
        const assignmentData = {
          doctorId: parseInt(values.doctorId),
          workingHoursId: parseInt(workingHourId),
          notes: values.notes || "",
          overrideConflicts: values.overrideConflicts,
        }

        await dispatch(assignDoctorToShift(assignmentData)).unwrap()

        toast.success(t("roster.assign.success.assigned"), {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        })

        navigate(-1)
      } catch (error) {
        if (error?.status === 409) {
          const result = await showSweetAlert({
            title: t("roster.assign.conflict.title"),
            text:
              error?.errors?.[0] || t("roster.assign.conflict.message"),
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: t("roster.assign.conflict.override"),
            cancelButtonText: t("common.cancel"),
            confirmButtonColor: "var(--color-warning)",
            cancelButtonColor: "var(--color-text-muted)",
          })

          if (result.isConfirmed) {
            values.overrideConflicts = true
            return handleSubmit(values, { setSubmitting })
          }
        } else {
          await showSweetAlert({
            title: t("roster.assign.error.title"),
            text:
              error?.errors?.[0] ||
              error?.message ||
              t("roster.assign.error.message"),
            icon: "error",
            confirmButtonText: t("common.ok"),
            confirmButtonColor: "var(--color-danger)",
          })
        }
      } finally {
        setSubmitting(false)
      }
    },
    [dispatch, workingHourId, navigate, t, showSweetAlert]
  )

  const handleDoctorSelect = useCallback((doctor, setFieldValue) => {
    setSelectedDoctor(doctor)
    setFieldValue("doctorId", doctor.doctorId)
  }, [])

  const toggleConflictDetails = useCallback((doctorId) => {
    setShowConflictDetails((prev) => ({
      ...prev,
      [doctorId]: !prev[doctorId],
    }))
  }, [])

  const handleSearchChange = useCallback((e) => {
    setSearchTerm(e.target.value)
  }, [])

  if (loading?.fetch || loading?.availableDoctors) {
    return (
      <LoadingGetData
        text={
          loading?.fetch
            ? t("gettingData.workingHour")
            : t("gettingData.availableDoctors")
        }
      />
    )
  }

  if (errors.workingHours || errors.availableDoctors) {
    return (
      <div className={theme.page} dir={isRTL ? "rtl" : "ltr"}>
        <div className="max-w-6xl mx-auto">
          <div className={`${theme.card} p-6`}>
            <div className="text-center py-12">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />

              <div className="text-red-500 text-lg mb-4">
                {errors.workingHours || errors.availableDoctors}
              </div>

              <button
                onClick={() => navigate(-1)}
                className={theme.primaryButton}
                type="button"
              >
                <ArrowLeft size={16} className={isRTL ? "ml-2" : "mr-2"} />
                {t("common.goBack")}
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={theme.page} dir={isRTL ? "rtl" : "ltr"}>
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center mb-6">
            <button
              onClick={() => navigate(-1)}
              className={`p-2 rounded-lg border border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg-soft)] transition-colors ${
                isRTL ? "ml-4" : "mr-4"
              }`}
              type="button"
            >
              <ArrowLeft size={20} />
            </button>

            <div>
              <h1 className="text-3xl font-bold text-[var(--color-text)]">
                {t("roster.assign.title")}
              </h1>

              <p className="text-sm text-[var(--color-text-muted)] mt-1">
                {t("roster.assign.subtitle")}
              </p>
            </div>
          </div>

          <ShiftInfo workingHour={workingHour} isRTL={isRTL} t={t} />
        </div>

        <div className={`${theme.card} overflow-hidden`}>
          <div className="p-6">
            <Formik
              initialValues={initialValues}
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
              enableReinitialize
            >
              {({ isSubmitting, values, setFieldValue }) => (
                <Form className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-[var(--color-text)] mb-2">
                      {t("roster.assign.searchDoctors")}
                    </label>

                    <div className="flex items-center gap-2">
                      <div className={`flex items-center justify-center w-10 h-10 rounded-lg border border-[var(--color-border)] ${iconBg.search}`}>
                        <Search size={18} className={iconColors.search} />
                      </div>

                      <div className="relative flex-1">
                        <input
                          type="text"
                          placeholder={t("roster.assign.searchPlaceholder")}
                          value={searchTerm}
                          onChange={handleSearchChange}
                          className={`w-full px-4 py-2 text-sm ${theme.input}`}
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-[var(--color-text)] mb-3">
                      {t("roster.assign.selectDoctor")} *
                    </label>

                    <div className="max-h-96 overflow-y-auto pr-1">
                      {filteredDoctors.length === 0 ? (
                        <EmptyState searchTerm={searchTerm} t={t} />
                      ) : (
                        <div className="space-y-3">
                          {filteredDoctors.map((doctor) => (
                            <DoctorCard
                              key={doctor.doctorId}
                              doctor={doctor}
                              isSelected={
                                selectedDoctor?.doctorId === doctor.doctorId
                              }
                              onSelect={(doctor) =>
                                handleDoctorSelect(doctor, setFieldValue)
                              }
                              showConflictDetails={showConflictDetails}
                              onToggleConflicts={toggleConflictDetails}
                              currentLang={currentLang}
                              isRTL={isRTL}
                              t={t}
                            />
                          ))}
                        </div>
                      )}
                    </div>

                    <ErrorMessage
                      name="doctorId"
                      component="div"
                      className="text-sm text-[var(--color-danger)] mt-2"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="notes"
                      className="block text-sm font-semibold mb-2 text-[var(--color-text)]"
                    >
                      {t("roster.assign.fields.notes")}
                    </label>

                    <Field
                      as="textarea"
                      id="notes"
                      name="notes"
                      rows={3}
                      dir={isRTL ? "rtl" : "ltr"}
                      className={`w-full px-3 py-2 text-sm resize-vertical ${theme.input}`}
                      placeholder={t("roster.assign.placeholders.notes")}
                    />

                    <ErrorMessage
                      name="notes"
                      component="div"
                      className="mt-1 text-sm text-[var(--color-danger)]"
                    />

                    <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                      {values.notes?.length || 0}/{MAX_NOTES_LENGTH}{" "}
                      {t("roster.assign.charactersCount")}
                    </p>
                  </div>

                  <div className={`${theme.cardSoft} p-3`}>
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <label
                          htmlFor="overrideConflicts"
                          className="text-sm font-semibold text-[var(--color-text)]"
                        >
                          {t("roster.assign.fields.overrideConflicts")}
                        </label>

                        <p className="text-xs mt-1 text-[var(--color-text-muted)]">
                          {t("roster.assign.fields.overrideConflictsHelp")}
                        </p>
                      </div>

                      <Field
                        type="checkbox"
                        id="overrideConflicts"
                        name="overrideConflicts"
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 mt-0.5"
                      />
                    </div>
                  </div>

                  <div className="flex justify-between pt-6 border-t border-[var(--color-border)]">
                    <button
                      type="button"
                      onClick={() => navigate(-1)}
                      className={theme.secondaryButton}
                    >
                      <X size={16} className={isRTL ? "ml-2" : "mr-2"} />
                      {t("common.cancel")}
                    </button>

                    <button
                      type="submit"
                      disabled={
                        isSubmitting ||
                        loading?.assignDoctor ||
                        !values.doctorId
                      }
                      className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting || loading?.assignDoctor ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2 rtl:mr-0 rtl:ml-2" />
                          {t("roster.assign.buttons.assigning")}
                        </>
                      ) : (
                        <>
                          <UserPlus
                            size={16}
                            className={isRTL ? "ml-2" : "mr-2"}
                          />
                          {t("roster.assign.buttons.assignDoctor")}
                        </>
                      )}
                    </button>
                  </div>
                </Form>
              )}
            </Formik>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AssignDoctor