import React, { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate, useSearchParams, Link, useParams } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { Formik, Form, Field, ErrorMessage } from "formik"
import { toast } from "react-toastify"
import {
  ArrowLeft,
  Info,
  Settings,
  AlertCircle,
  CheckCircle,
  Save,
  X,
  ArrowRight,
} from "lucide-react"

import {
  updateRosterBasicInfo,
  getRosterById,
} from "../../../state/act/actRosterManagement"
import { selectSelectedRoster } from "../../../state/slices/roster"
import LoadingGetData from "../../../components/LoadingGetData"
import Swal from "sweetalert2"
import UseFormValidation from "../../../hooks/use-form-validation"
import { getPageTheme, swalTheme } from "../../../utils/themeClasses"

const UpdateRoster = () => {
  const { t, i18n } = useTranslation()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { rosterId } = useParams()
  const [searchParams] = useSearchParams()
  const theme = getPageTheme()

  const currentLang = i18n.language
  const isRTL = currentLang === "ar"
  const rosterType = searchParams.get("type") || "basic"

  const [currentStep, setCurrentStep] = useState(1)
  const totalSteps = rosterType === "complete" ? 4 : 2
  const [isDataLoaded, setIsDataLoaded] = useState(false)

  const { loading } = useSelector((state) => state.rosterManagement)
  const selectedRoster = useSelector(selectSelectedRoster)

  const { categoryTypes, loadingGetCategoryTypes } = useSelector(
    (state) => state.category
  )

  const { VALIDATION_SCHEMA_UPDATE_BASIC_ROASTER } = UseFormValidation()

  const iconColors = {
    info: "text-blue-600 dark:text-blue-400",
    settings: "text-orange-600 dark:text-orange-400",
    success: "text-green-600 dark:text-green-400",
    danger: "text-red-600 dark:text-red-400",
  }

  const iconBg = {
    info: "bg-blue-100 dark:bg-blue-900/30",
    settings: "bg-orange-100 dark:bg-orange-900/30",
  }

  useEffect(() => {
    if (rosterId) {
      dispatch(getRosterById({ rosterId }))
    }
  }, [dispatch, rosterId])

  useEffect(() => {
    if (selectedRoster && categoryTypes.length > 0 && !isDataLoaded) {
      setIsDataLoaded(true)
    }
  }, [selectedRoster, categoryTypes, isDataLoaded])

  if (loadingGetCategoryTypes || loading.fetch) {
    return <LoadingGetData text={t("gettingData.roster")} />
  }

  if (!selectedRoster && !loading.fetch) {
    return (
      <div className={theme.page} dir={isRTL ? "rtl" : "ltr"}>
        <div className="max-w-4xl mx-auto">
          <div className="text-center">
            <AlertCircle
              className="mx-auto mb-4 text-red-500"
              size={64}
            />

            <h1 className="text-2xl font-bold text-[var(--color-text)] mb-4">
              {t("roster.error.notFound")}
            </h1>

            <Link to="/admin-panel/rosters" className={theme.primaryButton}>
              {currentLang === "en" ? (
                <ArrowLeft size={20} />
              ) : (
                <ArrowRight size={20} />
              )}
              <span className={isRTL ? "mr-2" : "ml-2"}>
                {t("common.goBack")}
              </span>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 7 }, (_, i) => currentYear + i)

  const getInitialValues = () => {
    if (!selectedRoster) return {}

    const submissionDeadline = selectedRoster.submissionDeadline
      ? new Date(selectedRoster.submissionDeadline)?.toISOString()?.slice(0, 16)
      : ""

    return {
      categoryId: selectedRoster.categoryId?.toString() || "",
      title: selectedRoster.title || "",
      description: selectedRoster.description || "",
      month: selectedRoster.month || new Date().getMonth() + 1,
      year: selectedRoster.year || new Date().getFullYear(),
      submissionDeadline,
      startDay: selectedRoster.startDate?.split("-")[2] || 1,
      endDay: selectedRoster.endDate?.split("-")[2] || 1,
      allowSwapRequests: selectedRoster.allowSwapRequests ?? true,
      allowLeaveRequests: selectedRoster.allowLeaveRequests ?? true,
    }
  }

  const handleSubmit = async (values, { setSubmitting }) => {
    const formattedDeadline = values.submissionDeadline

    const startDate = `${values.year}-${values.month
      .toString()
      .padStart(2, "0")}-${values.startDay.toString().padStart(2, "0")}`

    const endDate = `${values.year}-${values.month
      .toString()
      .padStart(2, "0")}-${values.endDay.toString().padStart(2, "0")}`

    const cleanedValues = {
      title: values.title,
      description: values.description || null,
      startDate,
      endDate,
      month: values.month,
      year: values.year,
      submissionDeadline: formattedDeadline,
      allowSwapRequests: values.allowSwapRequests,
      allowLeaveRequests: values.allowLeaveRequests,
    }

    setSubmitting(true)

    dispatch(
      updateRosterBasicInfo({
        rosterId: parseInt(rosterId),
        updateData: cleanedValues,
      })
    )
      .unwrap()
      .then(() => {
        setSubmitting(false)

        toast.success(t("roster.success.updated"), {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        })

        navigate(`/admin-panel/rosters/${rosterId}`)
      })
      .catch((error) => {
        setSubmitting(false)

        Swal.fire({
          title: t("roster.error.updateFailed"),
          text:
            error?.errors?.[0] ||
            error?.message ||
            t("roster.error.updateFailed"),
          icon: "error",
          confirmButtonText: t("common.ok"),
          ...swalTheme,
          confirmButtonColor: "var(--color-danger)",
        })
      })
  }

  const monthNames = isRTL
    ? [
        "يناير",
        "فبراير",
        "مارس",
        "أبريل",
        "مايو",
        "يونيو",
        "يوليو",
        "أغسطس",
        "سبتمبر",
        "أكتوبر",
        "نوفمبر",
        "ديسمبر",
      ]
    : [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ]

  const getStepTitle = (step) => {
    switch (step) {
      case 1:
        return t("roster.form.basicInfo")
      case 2:
        return t("roster.form.settings")
      default:
        return ""
    }
  }

  const getStepIcon = (step) => {
    switch (step) {
      case 1:
        return <Info size={20} />
      case 2:
        return <Settings size={20} />
      default:
        return <Info size={20} />
    }
  }

  const getStepIconColor = (step) => {
    switch (step) {
      case 1:
        return iconColors.info
      case 2:
        return iconColors.settings
      default:
        return iconColors.info
    }
  }

  const getStepIconBg = (step) => {
    switch (step) {
      case 1:
        return iconBg.info
      case 2:
        return iconBg.settings
      default:
        return iconBg.info
    }
  }

  const nextStep = async (e, validateForm, setTouched) => {
    e.preventDefault()
    e.stopPropagation()

    if (currentStep === 1) {
      try {
        const errors = await validateForm()

        const firstStepFields = [
          "categoryId",
          "title",
          "description",
          "startDay",
          "endDay",
          "month",
          "year",
          "submissionDeadline",
        ]

        const hasFirstStepErrors = firstStepFields.some(
          (field) => errors[field]
        )

        if (hasFirstStepErrors) {
          const touchedFields = {}

          firstStepFields.forEach((field) => {
            touchedFields[field] = true
          })

          setTouched(touchedFields)
          return
        }
      } catch {
        return
      }
    }

    setCurrentStep((prev) => Math.min(prev + 1, totalSteps))
  }

  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1))

  const fieldClass = (hasError = false) =>
    `w-full px-3 py-2 ${theme.input} ${
      hasError ? "border-[var(--color-danger)]" : ""
    }`

  const labelClass = "block text-sm font-semibold text-[var(--color-text)] mb-2"
  const errorClass = "text-[var(--color-danger)] text-xs mt-1"

  const StepHeading = ({ icon: Icon, iconClass, title }) => (
    <div className="flex items-center mb-6">
      <div
        className={`h-10 w-10 rounded-xl flex items-center justify-center ${
          iconClass.bg
        } ${isRTL ? "ml-3" : "mr-3"}`}
      >
        <Icon className={`h-5 w-5 ${iconClass.text}`} />
      </div>

      <h2 className="text-xl font-semibold text-[var(--color-text)]">
        {title}
      </h2>
    </div>
  )

  const SettingCard = ({ name, title, description }) => (
    <div className={`${theme.cardSoft} p-4`}>
      <div className="flex items-center justify-between gap-4">
        <div>
          <label className="text-sm font-semibold text-[var(--color-text)]">
            {title}
          </label>

          <p className="text-xs text-[var(--color-text-muted)] mt-1">
            {description}
          </p>
        </div>

        <Field
          type="checkbox"
          name={name}
          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
        />
      </div>
    </div>
  )

  return (
    <div className={theme.page} dir={isRTL ? "rtl" : "ltr"}>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center mb-6">
            <Link
              to="/admin-panel/rosters"
              className={`p-2 rounded-lg border border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg-soft)] transition-colors ${
                isRTL ? "ml-4" : "mr-4"
              }`}
            >
              {currentLang === "en" ? (
                <ArrowLeft size={20} />
              ) : (
                <ArrowRight size={20} />
              )}
            </Link>

            <div>
              <h1 className="text-3xl font-bold text-[var(--color-text)]">
                {t("roster.form.updateRoster")}
              </h1>

              <p className="text-sm text-[var(--color-text-muted)] mt-1">
                {selectedRoster?.title || t("roster.form.updateRosterInfo")}
              </p>
            </div>
          </div>

          <div className="mb-8">
            <div className="flex items-center justify-between">
              {Array.from({ length: totalSteps }, (_, i) => i + 1).map(
                (step) => {
                  const isDone = step < currentStep
                  const isReached = step <= currentStep

                  return (
                    <div key={step} className="flex items-center flex-1">
                      <div
                        className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors ${
                          isReached
                            ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-white"
                            : `border-[var(--color-border)] ${getStepIconBg(
                                step
                              )} ${getStepIconColor(step)}`
                        }`}
                      >
                        {isDone ? <CheckCircle size={20} /> : getStepIcon(step)}
                      </div>

                      <div
                        className={`${isRTL ? "mr-3" : "ml-3"} ${
                          step < totalSteps
                            ? isRTL
                              ? "border-r-2"
                              : "border-l-2"
                            : ""
                        } ${
                          isReached
                            ? "border-[var(--color-primary)]"
                            : "border-[var(--color-border)]"
                        } ${isRTL ? "pr-3" : "pl-3"}`}
                      >
                        <div
                          className={`text-sm font-semibold ${
                            isReached
                              ? "text-[var(--color-text)]"
                              : "text-[var(--color-text-muted)]"
                          }`}
                        >
                          {getStepTitle(step)}
                        </div>
                      </div>

                      {step < totalSteps && (
                        <div
                          className={`flex-1 h-0.5 mx-4 ${
                            isDone
                              ? "bg-[var(--color-primary)]"
                              : "bg-[var(--color-border)]"
                          }`}
                        />
                      )}
                    </div>
                  )
                }
              )}
            </div>
          </div>
        </div>

        <div className={`${theme.card} overflow-hidden`}>
          <div className="p-6">
            <Formik
              initialValues={getInitialValues()}
              validationSchema={VALIDATION_SCHEMA_UPDATE_BASIC_ROASTER}
              onSubmit={handleSubmit}
              enableReinitialize={true}
            >
              {({
                values,
                errors,
                touched,
                isSubmitting,
                validateForm,
                setTouched,
              }) => (
                <Form className="space-y-6">
                  {currentStep === 1 && (
                    <div className="space-y-6">
                      <StepHeading
                        icon={Info}
                        iconClass={{ bg: iconBg.info, text: iconColors.info }}
                        title={t("roster.form.basicInfo")}
                      />

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className={labelClass}>
                            {t("roster.form.category")} *
                          </label>

                          <div className="w-full px-3 py-2 border rounded-lg bg-[var(--color-surface-muted)] border-[var(--color-border)] text-[var(--color-text-muted)] cursor-not-allowed">
                            {selectedRoster?.categoryName ||
                              t("common.loading")}
                          </div>

                          <p className="text-xs text-[var(--color-text-muted)] mt-1">
                            {t("roster.form.categoryReadOnly")}
                          </p>
                        </div>

                        <div>
                          <label className={labelClass}>
                            {t("roster.form.title")} *
                          </label>

                          <Field
                            type="text"
                            name="title"
                            className={fieldClass(
                              errors.title && touched.title
                            )}
                            placeholder={t("roster.form.titlePlaceholder")}
                          />

                          <ErrorMessage
                            name="title"
                            component="div"
                            className={errorClass}
                          />
                        </div>

                        <div>
                          <label className={labelClass}>
                            {t("roster.form.month")} *
                          </label>

                          <Field
                            as="select"
                            name="month"
                            className={fieldClass()}
                          >
                            {monthNames.map((month, index) => (
                              <option key={index + 1} value={index + 1}>
                                {month}
                              </option>
                            ))}
                          </Field>

                          <ErrorMessage
                            name="month"
                            component="div"
                            className={errorClass}
                          />
                        </div>

                        <div>
                          <label className={labelClass}>
                            {t("roster.form.year")} *
                          </label>

                          <Field
                            as="select"
                            name="year"
                            className={fieldClass()}
                          >
                            {years.map((year) => (
                              <option key={year} value={year}>
                                {year}
                              </option>
                            ))}
                          </Field>

                          <ErrorMessage
                            name="year"
                            component="div"
                            className={errorClass}
                          />
                        </div>

                        <div>
                          <label className={labelClass}>
                            {t("roster.form.startDate")} *
                          </label>

                          <Field
                            as="select"
                            name="startDay"
                            className={fieldClass(
                              errors.startDay && touched.startDay
                            )}
                          >
                            {Array.from({ length: 30 }, (_, i) => i + 1).map(
                              (day) => (
                                <option key={day} value={day}>
                                  {day}
                                </option>
                              )
                            )}
                          </Field>

                          <ErrorMessage
                            name="startDay"
                            component="div"
                            className={errorClass}
                          />
                        </div>

                        <div>
                          <label className={labelClass}>
                            {t("roster.form.endDate")} *
                          </label>

                          <Field
                            as="select"
                            name="endDay"
                            className={fieldClass(
                              errors.endDay && touched.endDay
                            )}
                          >
                            {Array.from({ length: 30 }, (_, i) => i + 1).map(
                              (day) => (
                                <option key={day} value={day}>
                                  {day}
                                </option>
                              )
                            )}
                          </Field>

                          <ErrorMessage
                            name="endDay"
                            component="div"
                            className={errorClass}
                          />
                        </div>

                        <div className="md:col-span-2">
                          <label className={labelClass}>
                            {t("roster.form.submissionDeadline")} *
                          </label>

                          <Field
                            type="datetime-local"
                            name="submissionDeadline"
                            className={fieldClass(
                              errors.submissionDeadline &&
                                touched.submissionDeadline
                            )}
                          />

                          <p className="text-xs text-[var(--color-text-muted)] mt-1">
                            {t("roster.form.submissionDeadlineHelp")}
                          </p>

                          <ErrorMessage
                            name="submissionDeadline"
                            component="div"
                            className={errorClass}
                          />
                        </div>

                        <div className="md:col-span-2">
                          <label className={labelClass}>
                            {t("roster.form.description")}
                          </label>

                          <Field
                            as="textarea"
                            name="description"
                            rows="3"
                            className={fieldClass()}
                            placeholder={t(
                              "roster.form.descriptionPlaceholder"
                            )}
                          />

                          <ErrorMessage
                            name="description"
                            component="div"
                            className={errorClass}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {currentStep === 2 && (
                    <div className="space-y-6">
                      <StepHeading
                        icon={Settings}
                        iconClass={{
                          bg: iconBg.settings,
                          text: iconColors.settings,
                        }}
                        title={t("roster.form.settings")}
                      />

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <SettingCard
                          name="allowSwapRequests"
                          title={t("roster.form.allowSwapRequests")}
                          description={t(
                            "roster.form.allowSwapRequestsHelp"
                          )}
                        />

                        <SettingCard
                          name="allowLeaveRequests"
                          title={t("roster.form.allowLeaveRequests")}
                          description={t(
                            "roster.form.allowLeaveRequestsHelp"
                          )}
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between pt-6 border-t border-[var(--color-border)]">
                    <div>
                      {currentStep > 1 && (
                        <button
                          type="button"
                          onClick={prevStep}
                          className={theme.secondaryButton}
                        >
                          <ArrowLeft
                            size={16}
                            className={isRTL ? "ml-2" : "mr-2"}
                          />
                          {t("common.previous")}
                        </button>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className={theme.secondaryButton}
                      >
                        <X size={16} className={isRTL ? "ml-2" : "mr-2"} />
                        {t("common.cancel")}
                      </button>

                      {currentStep < totalSteps ? (
                        <button
                          type="button"
                          onClick={(e) => nextStep(e, validateForm, setTouched)}
                          className={theme.primaryButton}
                        >
                          {t("common.next")}

                          {currentLang === "ar" ? (
                            <ArrowLeft
                              size={16}
                              className="mr-2 rotate-180"
                            />
                          ) : (
                            <ArrowRight size={16} className="ml-2" />
                          )}
                        </button>
                      ) : (
                        <button
                          type="submit"
                          disabled={isSubmitting || loading.update}
                          className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isSubmitting || loading.update ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                              {t("roster.actions.updating")}
                            </>
                          ) : (
                            <>
                              <Save
                                size={16}
                                className={isRTL ? "ml-2" : "mr-2"}
                              />
                              {t("roster.actions.update")}
                            </>
                          )}
                        </button>
                      )}
                    </div>
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

export default UpdateRoster