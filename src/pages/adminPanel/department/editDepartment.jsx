import React, { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { Formik, Form, Field, ErrorMessage } from "formik"
import { toast } from "react-toastify"
import Swal from "sweetalert2"
import { useTranslation } from "react-i18next"
import { useNavigate, useParams } from "react-router-dom"
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  FileText,
  Hash,
  Info,
  MapPin,
  Save,
  ToggleLeft,
  XCircle,
} from "lucide-react"

import {
  updateDepartment,
  getDepartmentById,
} from "../../../state/act/actDepartment"

import UseFormValidation from "../../../hooks/use-form-validation"
import LoadingGetData from "../../../components/LoadingGetData"
import Forbidden from "../../../components/forbidden"
import { getPageTheme } from "../../../utils/themeClasses"

function EditDepartment() {
  const { t, i18n } = useTranslation()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { depId: id } = useParams()

  const currentLang = i18n.language || "ar"
  const isRTL = currentLang === "ar"
  const theme = getPageTheme()

  const { VALIDATION_SCHEMA_ADD_DEPARTMENT } = UseFormValidation()

  const {
    loadingUpdateDepartment,
    selectedDepartment,
    loadingGetSingleDepartment,
    singleDepartmentError,
    departmentLinkedIds,
  } = useSelector((state) => state.department)

  const { departmentManagerId, loginRoleResponseDto } = useSelector(
    (state) => state.auth
  )

  const roleName = loginRoleResponseDto?.roleNameEn

  const depIdsArray = Array.isArray(departmentLinkedIds)
    ? departmentLinkedIds
    : departmentLinkedIds
    ? [departmentLinkedIds]
    : []

  const canCategoryHeadManage = depIdsArray.some(
    (depId) => String(depId) === String(id)
  )

  const isForbiddenForDepartmentManager =
    roleName === "Department Manager" &&
    String(departmentManagerId) !== String(id)

  const isForbiddenForCategoryHead =
    roleName === "Category Head" &&
    depIdsArray.length > 0 &&
    !canCategoryHeadManage

  useEffect(() => {
    if (id) {
      dispatch(getDepartmentById(id))
    }
  }, [dispatch, id])

  const defaultButtonClass =
    "inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border bg-[var(--color-surface)] text-[var(--color-text)] border-[var(--color-border-strong)] hover:bg-[var(--color-success)] hover:text-white hover:border-[var(--color-success)] active:bg-[var(--color-success-hover)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"

  const primaryButtonClass =
    "inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-extrabold border bg-[var(--color-success)] text-white border-[var(--color-success)] hover:bg-[var(--color-success-hover)] hover:border-[var(--color-success-hover)] active:scale-[0.98] transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"

  const inputClass = (hasError = false) =>
    `w-full px-4 py-3 rounded-xl border bg-[var(--color-surface)] text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-success)] focus:border-[var(--color-success)] transition-colors ${
      hasError
        ? "border-red-500 bg-transparent"
        : "border-[var(--color-border-strong)]"
    }`

  const labelClass =
    "block text-sm font-extrabold text-[var(--color-text)] mb-2"

  const errorClass = "mt-1 text-sm font-bold text-red-500"

  const SectionTitle = ({ icon: Icon, title, subtitle }) => (
    <div className="flex items-start gap-3 mb-6">
      <span className="w-11 h-11 rounded-2xl flex items-center justify-center border-2 bg-transparent text-blue-500 border-blue-500">
        <Icon className="w-5 h-5" />
      </span>

      <div>
        <h2 className="text-xl font-black text-[var(--color-text)]">
          {title}
        </h2>
        {subtitle && (
          <p className="text-sm font-semibold text-[var(--color-text-muted)] mt-1">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  )

  const ErrorState = ({ title, description }) => (
    <div className={theme.page} dir={isRTL ? "rtl" : "ltr"}>
      <div className="max-w-3xl mx-auto">
        <div className={`${theme.card} p-8 text-center`}>
          <span className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center border-2 bg-transparent text-red-500 border-red-500">
            <XCircle className="w-8 h-8" />
          </span>

          <h2 className="text-2xl font-black text-[var(--color-text)] mb-2">
            {title}
          </h2>

          <p className="text-sm font-semibold text-[var(--color-text-muted)] mb-6">
            {description}
          </p>

          <button
            type="button"
            onClick={() => navigate(`/admin-panel/department/${id}`)}
            className={defaultButtonClass}
          >
            {isRTL ? <ArrowRight size={16} /> : <ArrowLeft size={16} />}
            {t("department.details.backToDepartments") || "Back to Department"}
          </button>
        </div>
      </div>
    </div>
  )

  if (isForbiddenForDepartmentManager || isForbiddenForCategoryHead) {
    return <Forbidden />
  }

  if (loadingGetSingleDepartment) {
    return (
      <LoadingGetData
        text={t("gettingData.departmentData") || "Loading department data..."}
      />
    )
  }

  if (singleDepartmentError) {
    return (
      <ErrorState
        title={t("department.error.title") || "Error"}
        description={
          currentLang === "ar"
            ? singleDepartmentError?.message || "تعذر تحميل بيانات المكان"
            : singleDepartmentError?.message || "Failed to load department"
        }
      />
    )
  }

  if (!selectedDepartment) {
    return (
      <ErrorState
        title={t("department.empty.title") || "No Department Found"}
        description={
          t("department.error.notFound") ||
          "The requested department was not found."
        }
      />
    )
  }

  const getInitialValues = () => {
    const manager = selectedDepartment.manager || {}

    return {
      id: selectedDepartment.id,
      nameArabic: selectedDepartment.nameArabic || "",
      nameEnglish: selectedDepartment.nameEnglish || "",
      code: selectedDepartment.code || "",
      location: selectedDepartment.location || "",
      description: selectedDepartment.description || "",
      isActive:
        selectedDepartment.isActive !== undefined
          ? selectedDepartment.isActive
          : true,
      manager: {
        userId: manager.userId || "",
        startDate: manager.startDate
          ? new Date(manager.startDate).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0],
        canViewDepartment:
          manager.canViewDepartment !== undefined
            ? manager.canViewDepartment
            : true,
        canEditDepartment:
          manager.canEditDepartment !== undefined
            ? manager.canEditDepartment
            : false,
        canViewDepartmentReports:
          manager.canViewDepartmentReports !== undefined
            ? manager.canViewDepartmentReports
            : false,
        canManageSchedules:
          manager.canManageSchedules !== undefined
            ? manager.canManageSchedules
            : false,
        canManageStaff:
          manager.canManageStaff !== undefined
            ? manager.canManageStaff
            : false,
        notes: manager.notes || "",
      },
    }
  }

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      await dispatch(updateDepartment({ id, departmentData: values })).unwrap()

      toast.success(t("departmentForm.success.updated"), {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      })

      navigate(`/admin-panel/department/${id}`)
    } catch (error) {
      Swal.fire({
        title: t("departmentForm.error.title"),
        text:
          currentLang === "en"
            ? error?.messageEn || error?.message
            : error?.messageAr ||
              error?.message ||
              t("department.error.message"),
        icon: "error",
        confirmButtonText: t("common.ok"),
        confirmButtonColor: "#ef4444",
        background: "var(--color-surface)",
        color: "var(--color-text)",
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className={theme.page} dir={isRTL ? "rtl" : "ltr"}>
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <button
            type="button"
            onClick={() => navigate(`/admin-panel/department/${id}`)}
            className={defaultButtonClass}
          >
            {isRTL ? <ArrowRight size={16} /> : <ArrowLeft size={16} />}
            {t("department.details.backToDepartments") || "Back to Department"}
          </button>
        </div>

        <div className={`${theme.card} p-6`}>
          <div className="flex items-start gap-4">
            <span className="w-14 h-14 rounded-2xl flex items-center justify-center border-2 bg-transparent text-blue-500 border-blue-500 shrink-0">
              <Building2 className="w-7 h-7" />
            </span>

            <div>
              <p className="text-sm font-bold text-[var(--color-text-muted)] mb-1">
                {t("department.details.title") || "Department Details"}
              </p>

              <h1 className="text-3xl font-black text-[var(--color-text)]">
                {t("departmentForm.editTitle") || "Edit Department"}
              </h1>

              <p className="text-sm font-semibold text-[var(--color-text-muted)] mt-2">
                {currentLang === "ar"
                  ? selectedDepartment.nameArabic || selectedDepartment.nameEnglish
                  : selectedDepartment.nameEnglish || selectedDepartment.nameArabic}
              </p>
            </div>
          </div>
        </div>

        <Formik
          initialValues={getInitialValues()}
          validationSchema={VALIDATION_SCHEMA_ADD_DEPARTMENT}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {({ isSubmitting, errors, touched, setFieldValue, values }) => (
            <Form className="space-y-6">
              <div className={`${theme.card} p-6`}>
                <SectionTitle
                  icon={Info}
                  title={t("departmentForm.sections.basicInfo") || "Basic Information"}
                  subtitle={
                    currentLang === "ar"
                      ? "تعديل البيانات الأساسية للمكان."
                      : "Update the main department information."
                  }
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label htmlFor="nameArabic" className={labelClass}>
                      {t("departmentForm.fields.nameArabic") || "Arabic Name"}{" "}
                      <span className="text-red-500">*</span>
                    </label>

                    <Field
                      type="text"
                      id="nameArabic"
                      name="nameArabic"
                      dir="rtl"
                      className={inputClass(errors.nameArabic && touched.nameArabic)}
                      placeholder={
                        t("departmentForm.placeholders.nameArabic") ||
                        "Enter Arabic name"
                      }
                    />

                    <ErrorMessage
                      name="nameArabic"
                      component="div"
                      className={errorClass}
                    />
                  </div>

                  <div>
                    <label htmlFor="nameEnglish" className={labelClass}>
                      {t("departmentForm.fields.nameEnglish") || "English Name"}{" "}
                      <span className="text-red-500">*</span>
                    </label>

                    <Field
                      type="text"
                      id="nameEnglish"
                      name="nameEnglish"
                      dir="ltr"
                      className={inputClass(errors.nameEnglish && touched.nameEnglish)}
                      placeholder={
                        t("departmentForm.placeholders.nameEnglish") ||
                        "Enter English name"
                      }
                    />

                    <ErrorMessage
                      name="nameEnglish"
                      component="div"
                      className={errorClass}
                    />
                  </div>

                  <div>
                    <label htmlFor="code" className={labelClass}>
                      {t("categoryForm.fields.code") || "Code"}{" "}
                      <span className="text-red-500">*</span>
                    </label>

                    <div className="relative">
                      <Field
                        type="text"
                        id="code"
                        name="code"
                        className={`${inputClass(errors.code && touched.code)} uppercase ${
                          isRTL ? "pr-11" : "pl-11"
                        }`}
                        placeholder={
                          t("categoryForm.placeholders.code") || "Enter code"
                        }
                        onChange={(e) => {
                          setFieldValue("code", e.target.value.toUpperCase())
                        }}
                      />

                      <Hash
                        size={18}
                        className={`absolute top-3.5 ${
                          isRTL ? "right-4" : "left-4"
                        } text-blue-500`}
                      />
                    </div>

                    <ErrorMessage
                      name="code"
                      component="div"
                      className={errorClass}
                    />

                    <p className="mt-1 text-xs font-semibold text-[var(--color-text-muted)]">
                      {t("categoryForm.hints.code") ||
                        "Code will be automatically converted to uppercase"}
                    </p>
                  </div>

                  <div>
                    <label htmlFor="location" className={labelClass}>
                      {t("departmentForm.fields.location") || "Location"}{" "}
                      <span className="text-red-500">*</span>
                    </label>

                    <div className="relative">
                      <Field
                        type="text"
                        id="location"
                        name="location"
                        dir={isRTL ? "rtl" : "ltr"}
                        className={`${inputClass(errors.location && touched.location)} ${
                          isRTL ? "pr-11" : "pl-11"
                        }`}
                        placeholder={
                          t("departmentForm.placeholders.location") ||
                          "Enter location"
                        }
                      />

                      <MapPin
                        size={18}
                        className={`absolute top-3.5 ${
                          isRTL ? "right-4" : "left-4"
                        } text-emerald-500`}
                      />
                    </div>

                    <ErrorMessage
                      name="location"
                      component="div"
                      className={errorClass}
                    />
                  </div>
                </div>

                <div className="mt-5">
                  <label htmlFor="description" className={labelClass}>
                    {t("departmentForm.fields.description") || "Description"}
                  </label>

                  <div className="relative">
                    <Field
                      as="textarea"
                      id="description"
                      name="description"
                      rows={4}
                      dir={isRTL ? "rtl" : "ltr"}
                      className={`${inputClass(errors.description && touched.description)} resize-y ${
                        isRTL ? "pr-11" : "pl-11"
                      }`}
                      placeholder={
                        t("departmentForm.placeholders.description") ||
                        "Enter description"
                      }
                    />

                    <FileText
                      size={18}
                      className={`absolute top-3.5 ${
                        isRTL ? "right-4" : "left-4"
                      } text-violet-500`}
                    />
                  </div>

                  <ErrorMessage
                    name="description"
                    component="div"
                    className={errorClass}
                  />
                </div>

                <div className={`${theme.cardSoft} p-4 mt-5`}>
                  <label
                    htmlFor="isActive"
                    className={`flex items-center justify-between gap-4 cursor-pointer ${
                      isRTL ? "flex-row-reverse" : ""
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`w-10 h-10 rounded-xl flex items-center justify-center border-2 bg-transparent ${
                          values.isActive
                            ? "text-emerald-500 border-emerald-500"
                            : "text-slate-500 border-slate-500"
                        }`}
                      >
                        <ToggleLeft className="w-5 h-5" />
                      </span>

                      <span className="text-sm font-extrabold text-[var(--color-text)]">
                        {t("departmentForm.fields.isActive") || "Active"}
                      </span>
                    </div>

                    <Field
                      type="checkbox"
                      id="isActive"
                      name="isActive"
                      className="h-5 w-5 rounded border-[var(--color-border-strong)] text-emerald-500 focus:ring-emerald-500"
                    />
                  </label>
                </div>
              </div>

              <div className={`${theme.card} p-5`}>
                <div
                  className={`flex justify-end gap-3 ${
                    isRTL ? "flex-row-reverse" : ""
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => navigate(`/admin-panel/department/${id}`)}
                    className={defaultButtonClass}
                  >
                    {t("departmentForm.buttons.cancel") || "Cancel"}
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting || loadingUpdateDepartment}
                    className={primaryButtonClass}
                  >
                    {isSubmitting || loadingUpdateDepartment ? (
                      <>
                        <RefreshSpinner />
                        {t("departmentForm.buttons.editing") || "Updating..."}
                      </>
                    ) : (
                      <>
                        <Save size={16} />
                        {t("departmentForm.buttons.edit") ||
                          "Update Department"}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  )
}

function RefreshSpinner() {
  return (
    <span className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
  )
}

export default EditDepartment