import React, { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate, useSearchParams, Link } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { Formik, Form, Field, FieldArray, ErrorMessage } from "formik"
import { toast } from "react-toastify"
import {
  ArrowLeft,
  Plus,
  Trash2,
  Info,
  Clock,
  Settings,
  Building,
  CheckCircle,
  Save,
  X,
  ArrowRight,
} from "lucide-react"

import { createBasicRoster } from "../../../state/act/actRosterManagement"
import { getDepartmentByCategory } from "../../../state/act/actDepartment"
import { getSubDepartments } from "../../../state/act/actSubDepartment"
import LoadingGetData from "../../../components/LoadingGetData"
import Swal from "sweetalert2"
import UseInitialValues from "../../../hooks/use-initial-values"
import UseFormValidation from "../../../hooks/use-form-validation"
import { getPageTheme, swalTheme } from "../../../utils/themeClasses"

const CreateRoster = () => {
  const { t, i18n } = useTranslation()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const theme = getPageTheme()

  const currentLang = i18n.language
  const isRTL = currentLang === "ar"
  const rosterType = searchParams.get("type") || "basic"

  const [currentStep, setCurrentStep] = useState(1)
  const totalSteps = rosterType === "complete" ? 4 : 2

  const [subDepartmentsByDepartment, setSubDepartmentsByDepartment] = useState(
    {}
  )
  const [loadingSubDepartment, setLoadingSubDepartment] = useState(0)

  const { VALIDATION_SCHEMA_CREATE_BASIC_ROASTER } = UseFormValidation()
  const { INITIAL_VALUES_CREATE_BASIC_ROASTER } = UseInitialValues()

  const { loading, success, createError } = useSelector(
    (state) => state.rosterManagement
  )

  const { departmentsByCategory, loadingGetDepartmentsByCategory } =
    useSelector((state) => state.department)

  const { subDepartments } = useSelector((state) => state.subDepartment)

  const iconColors = {
    info: "text-blue-600 dark:text-blue-400",
    building: "text-green-600 dark:text-green-400",
    clock: "text-purple-600 dark:text-purple-400",
    settings: "text-orange-600 dark:text-orange-400",
    save: "text-green-600 dark:text-green-400",
    trash: "text-red-600 dark:text-red-400",
  }

  const iconBg = {
    info: "bg-blue-100 dark:bg-blue-900/30",
    building: "bg-green-100 dark:bg-green-900/30",
    clock: "bg-purple-100 dark:bg-purple-900/30",
    settings: "bg-orange-100 dark:bg-orange-900/30",
  }

  useEffect(() => {
    dispatch(
      getDepartmentByCategory({
        categoryId: parseInt(localStorage.getItem("categoryId")),
      })
    )
  }, [dispatch])

  useEffect(() => {
    if (subDepartments.length > 0) {
      const subDeptsByDept = {}

      subDepartments.forEach((subDept) => {
        if (!subDeptsByDept[subDept.departmentId]) {
          subDeptsByDept[subDept.departmentId] = []
        }

        subDeptsByDept[subDept.departmentId].push(subDept)
      })

      setSubDepartmentsByDepartment(subDeptsByDept)
    }
  }, [subDepartments])

  useEffect(() => {
    if (success.create) {
      toast.success(t("roster.success.created"))
    }
  }, [success.create, dispatch, navigate, t])

  useEffect(() => {
    if (createError) {
      toast.error(
        createError.messageAr ||
          createError.message ||
          t("roster.error.createFailed")
      )
    }
  }, [createError, dispatch, t])

  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 7 }, (_, i) => currentYear + i)

  const cleanDepartmentData = (department) => {
    const cleanedDepartment = {
      departmentId: parseInt(department.departmentId),
    }

    if (
      department.subDepartmentId &&
      department.subDepartmentId.toString().trim() !== ""
    ) {
      cleanedDepartment.subDepartmentId = parseInt(department.subDepartmentId)
    }

    if (department.notes && department.notes.trim() !== "") {
      cleanedDepartment.notes = department.notes.trim()
    }

    return cleanedDepartment
  }

  const handleSubmit = async (values, { setSubmitting }) => {
    const year = parseInt(values.year)
    const month = parseInt(values.month)
    const startDay = parseInt(values.startDay)
    const endDay = parseInt(values.endDay)

    const startDate = `${year}-${month.toString().padStart(2, "0")}-${startDay
      .toString()
      .padStart(2, "0")}`

    const endDate = `${year}-${month.toString().padStart(2, "0")}-${endDay
      .toString()
      .padStart(2, "0")}`

    const cleanedValues = {
      categoryId: parseInt(localStorage.getItem("categoryId")),
      month,
      year,
      startDate,
      endDate,
      title: values.title,
      autoAcceptRequests: values.autoAcceptRequests || false,
      description: values.description || "",
      submissionDeadline: values.submissionDeadline,
      departments: values.departments.map((department) =>
        cleanDepartmentData(department)
      ),
      allowSwapRequests: values.allowSwapRequests || false,
      allowLeaveRequests: values.allowLeaveRequests || false,
    }

    setSubmitting(true)

    dispatch(createBasicRoster(cleanedValues))
      .unwrap()
      .then(() => {
        setSubmitting(false)

        toast.success(t("roster.success.created"), {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        })

        navigate(`/admin-panel/rosters/departments`)
      })
      .catch((error) => {
        setSubmitting(false)

        Swal.fire({
          title: t("roster.error.createFailed"),
          text:
            error?.errors?.[0] ||
            error?.message ||
            t("roster.error.createFailed"),
          icon: "error",
          confirmButtonText: t("common.ok"),
          ...swalTheme,
          confirmButtonColor: "var(--color-danger)",
        })
      })
  }

  const handleDepartmentChange = (departmentId, index, setFieldValue) => {
    setFieldValue(`departments.${index}.departmentId`, departmentId)
    setFieldValue(`departments.${index}.subDepartmentId`, "")
    setLoadingSubDepartment(index)

    dispatch(getSubDepartments({ departmentId }))
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
        return t("roster.form.departments")
      case 3:
        return t("roster.form.workingHours")
      case 4:
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
        return <Building size={20} />
      case 3:
        return <Clock size={20} />
      case 4:
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
        return iconColors.building
      case 3:
        return iconColors.clock
      case 4:
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
        return iconBg.building
      case 3:
        return iconBg.clock
      case 4:
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

  const DropdownLoader = ({ text }) => (
    <div
      className={`w-full px-3 py-2 border rounded-lg bg-[var(--color-surface)] border-[var(--color-border)] flex items-center justify-center`}
    >
      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[var(--color-primary)]" />

      <span
        className={`${isRTL ? "mr-2" : "ml-2"} text-sm text-[var(--color-text-muted)]`}
      >
        {text}
      </span>
    </div>
  )

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

  if (loading?.fetch) {
    return <LoadingGetData text={t("gettingData.roster")} />
  }

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
                {rosterType === "basic"
                  ? t("roster.form.createBasicRoster")
                  : t("roster.form.createCompleteRoster")}
              </h1>

              <p className="text-sm text-[var(--color-text-muted)] mt-1">
                {rosterType === "basic"
                  ? t("roster.form.basicRosterInfo")
                  : t("roster.form.completeRosterInfo")}
              </p>
            </div>
          </div>

          <div className="mb-8">
            <div className="flex items-center justify-between">
              {Array.from({ length: totalSteps }, (_, i) => i + 1).map(
                (step) => {
                  const isDone = step < currentStep
                  const isActive = step === currentStep
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
                            isActive || isDone
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
              initialValues={INITIAL_VALUES_CREATE_BASIC_ROASTER}
              validationSchema={VALIDATION_SCHEMA_CREATE_BASIC_ROASTER}
              onSubmit={handleSubmit}
              enableReinitialize={true}
            >
              {({
                values,
                errors,
                touched,
                isSubmitting,
                setFieldValue,
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

                          <Field
                            as="input"
                            type="text"
                            name="categoryId"
                            value={
                              currentLang === "ar"
                                ? localStorage.getItem("categoryArabicName") ||
                                  ""
                                : localStorage.getItem("categoryEnglishName") ||
                                  ""
                            }
                            disabled
                            className={`${fieldClass(
                              errors.categoryId && touched.categoryId
                            )} opacity-60 cursor-not-allowed`}
                          />

                          <ErrorMessage
                            name="categoryId"
                            component="div"
                            className={errorClass}
                          />
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
                        icon={Building}
                        iconClass={{
                          bg: iconBg.building,
                          text: iconColors.building,
                        }}
                        title={t("roster.form.departments")}
                      />

                      {loadingGetDepartmentsByCategory && (
                        <div className="p-4 rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 mb-4">
                          <div className="flex items-center">
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600" />

                            <span
                              className={`${isRTL ? "mr-3" : "ml-3"} text-sm text-blue-800 dark:text-blue-300`}
                            >
                              {t("department.loading")}
                            </span>
                          </div>
                        </div>
                      )}

                      <FieldArray name="departments">
                        {({ remove, push }) => (
                          <div className="space-y-4">
                            {values.departments.map((department, index) => (
                              <div key={index} className={`${theme.cardSoft} p-4`}>
                                <div className="flex justify-between items-center mb-4">
                                  <h4 className="font-semibold text-[var(--color-text)]">
                                    {t("roster.form.departmentConfig")}{" "}
                                    {index + 1}
                                  </h4>

                                  {values.departments.length > 1 && (
                                    <button
                                      type="button"
                                      onClick={() => remove(index)}
                                      className="text-red-600 dark:text-red-400 hover:opacity-80 p-1 rounded"
                                      title={t("roster.form.removeDepartment")}
                                    >
                                      <Trash2 size={16} />
                                    </button>
                                  )}
                                </div>

                                <div className="grid grid-cols-1 gap-4">
                                  <div>
                                    <label className={labelClass}>
                                      {t("roster.form.selectDepartment")} *
                                    </label>

                                    {loadingGetDepartmentsByCategory ? (
                                      <DropdownLoader
                                        text={t("common.loading")}
                                      />
                                    ) : (
                                      <Field
                                        as="select"
                                        name={`departments.${index}.departmentId`}
                                        value={department.departmentId}
                                        onChange={(e) =>
                                          handleDepartmentChange(
                                            e.target.value,
                                            index,
                                            setFieldValue
                                          )
                                        }
                                        disabled={
                                          loadingGetDepartmentsByCategory
                                        }
                                        className={fieldClass(
                                          errors.departments?.[index]
                                            ?.departmentId &&
                                            touched.departments?.[index]
                                              ?.departmentId
                                        )}
                                      >
                                        <option value="">
                                          {t("roster.form.selectDepartment")}
                                        </option>

                                        {departmentsByCategory.map((dept) => (
                                          <option key={dept.id} value={dept.id}>
                                            {isRTL
                                              ? dept.nameArabic
                                              : dept.nameEnglish}
                                          </option>
                                        ))}
                                      </Field>
                                    )}

                                    <ErrorMessage
                                      name={`departments.${index}.departmentId`}
                                      component="div"
                                      className={errorClass}
                                    />
                                  </div>

                                  <div className="md:col-span-2">
                                    <label className={labelClass}>
                                      {t("roster.form.notes")}
                                    </label>

                                    <Field
                                      type="text"
                                      name={`departments.${index}.notes`}
                                      className={fieldClass()}
                                      placeholder={t(
                                        "roster.form.notesPlaceholder"
                                      )}
                                    />

                                    <ErrorMessage
                                      name={`departments.${index}.notes`}
                                      component="div"
                                      className={errorClass}
                                    />
                                  </div>
                                </div>
                              </div>
                            ))}

                            <button
                              type="button"
                              onClick={() =>
                                push({
                                  departmentId: "",
                                  subDepartmentId: "",
                                  notes: "",
                                })
                              }
                              disabled={
                                values.departments.length ===
                                departmentsByCategory.length
                              }
                              className={`inline-flex items-center px-4 py-2 border border-dashed rounded-lg text-sm font-semibold transition-colors ${
                                values.departments.length ===
                                departmentsByCategory.length
                                  ? "border-[var(--color-border)] text-[var(--color-text-soft)] cursor-not-allowed bg-[var(--color-surface-muted)] opacity-60"
                                  : "border-[var(--color-border)] text-[var(--color-text)] hover:bg-[var(--color-bg-soft)]"
                              }`}
                            >
                              <Plus
                                size={16}
                                className={isRTL ? "ml-2" : "mr-2"}
                              />
                              {t("roster.form.addDepartment")}
                            </button>
                          </div>
                        )}
                      </FieldArray>
                    </div>
                  )}

                  {currentStep === totalSteps && (
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

                      <SettingCard
                        name="autoAcceptRequests"
                        title={t("roster.form.autoAcceptRequests")}
                        description={t(
                          "roster.form.autoAcceptRequestsHelp"
                        )}
                      />
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
                      <Link
                        to="/admin-panel/rosters"
                        className={theme.secondaryButton}
                      >
                        <X size={16} className={isRTL ? "ml-2" : "mr-2"} />
                        {t("common.cancel")}
                      </Link>

                      {currentStep < totalSteps ? (
                        <button
                          type="button"
                          onClick={(e) => nextStep(e, validateForm, setTouched)}
                          className={theme.primaryButton}
                        >
                          {t("common.next")}

                          <ArrowRight
                            size={16}
                            className={isRTL ? "mr-2 rotate-180" : "ml-2"}
                          />
                        </button>
                      ) : (
                        <button
                          type="submit"
                          disabled={isSubmitting || loading.createBasic}
                          className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isSubmitting || loading.createBasic ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                              {t("roster.actions.creating")}
                            </>
                          ) : (
                            <>
                              <Save
                                size={16}
                                className={isRTL ? "ml-2" : "mr-2"}
                              />
                              {t("roster.actions.createBasic")}
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

export default CreateRoster