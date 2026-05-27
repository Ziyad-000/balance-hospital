import React, { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { Formik, Form, Field, ErrorMessage } from "formik"
import { toast } from "react-toastify"
import Swal from "sweetalert2"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Code2,
  FileText,
  Loader2,
  MapPin,
  Save,
  X,
} from "lucide-react"

import { createDepartment } from "../../../state/act/actDepartment"
import { getCategoryTypes } from "../../../state/act/actCategory"
import { getUserSummaries } from "../../../state/slices/user"
import LoadingGetData from "../../../components/LoadingGetData"
import UseInitialValues from "../../../hooks/use-initial-values"
import UseFormValidation from "../../../hooks/use-form-validation"
import { getPageTheme } from "../../../utils/themeClasses"

function CreateDepartment() {
  const { t, i18n } = useTranslation()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const theme = getPageTheme()

  const currentLang = i18n.language
  const isRTL = currentLang === "ar"

  const { loadingCreateDepartment } = useSelector((state) => state.department)
  const { loadingGetCategoryTypes } = useSelector((state) => state.category)

  const { VALIDATION_SCHEMA_ADD_DEPARTMENT } = UseFormValidation()
  const { INITIAL_VALUES_ADD_DEPARTMENT } = UseInitialValues()

  useEffect(() => {
    dispatch(getCategoryTypes())
    dispatch(getUserSummaries({ page: 1, pageSize: 50 }))
  }, [dispatch])

  const labelClass = "block text-sm font-bold mb-2 text-[var(--color-text)]"
  const errorClass = "mt-1 text-sm font-semibold text-red-500"

  const inputClass = (hasError = false) =>
    `w-full px-4 py-2.5 rounded-xl border bg-[var(--color-surface)] text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] shadow-sm outline-none transition-colors focus:border-[var(--color-success)] focus:ring-2 focus:ring-[var(--color-success)]/20 ${
      hasError
        ? "border-red-500 bg-transparent"
        : "border-[var(--color-border-strong)]"
    }`

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    const { manager, ...otherData } = values

    const submissionData = {
      ...otherData,
      ...(values.manager?.userId && { manager: values.manager }),
    }

    try {
      await dispatch(createDepartment(submissionData)).unwrap()

      resetForm()

      toast.success(t("departmentForm.success.created"), {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      })

      navigate("/admin-panel/departments")
    } catch (error) {
      console.error("Department creation error:", error)

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
      })
    } finally {
      setSubmitting(false)
    }
  }

  if (loadingGetCategoryTypes) {
    return <LoadingGetData text={t("gettingData.categoryData")} />
  }

  return (
    <div className={theme.page} dir={isRTL ? "rtl" : "ltr"}>
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <button
            type="button"
            onClick={() => navigate("/admin-panel/departments")}
            className={theme.secondaryButton}
          >
            {isRTL ? <ArrowRight size={18} /> : <ArrowLeft size={18} />}
            {t("department.details.backToDepartments") ||
              t("departmentForm.buttons.back")}
          </button>
        </div>

        <div className={`${theme.card} overflow-hidden`}>
          <div className="p-6 border-b border-[var(--color-border)]">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl border-2 bg-transparent text-blue-500 border-blue-500 flex items-center justify-center shrink-0 shadow-sm">
                <Building2 className="w-7 h-7" />
              </div>

              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-[var(--color-text)]">
                  {t("departmentForm.title") || "Create Department"}
                </h1>
                <p className="mt-1 text-sm font-semibold text-[var(--color-text-muted)]">
                  {currentLang === "ar"
                    ? "أدخل بيانات المكان الأساسية ثم اضغط إنشاء"
                    : "Enter the department details and create it"}
                </p>
              </div>
            </div>
          </div>

          <Formik
            initialValues={INITIAL_VALUES_ADD_DEPARTMENT}
            validationSchema={VALIDATION_SCHEMA_ADD_DEPARTMENT}
            onSubmit={handleSubmit}
            enableReinitialize
          >
            {({ isSubmitting, errors, touched, setFieldValue }) => (
              <Form className="p-6 space-y-6">
                <section className="space-y-5">
                  <div className="flex items-center gap-3 pb-3 border-b border-[var(--color-border)]">
                    <div className="w-10 h-10 rounded-xl border-2 bg-transparent text-blue-500 border-blue-500 flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <h2 className="text-lg font-black text-[var(--color-text)]">
                      {t("departmentForm.sections.basicInfo") ||
                        "Basic Information"}
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label htmlFor="nameArabic" className={labelClass}>
                        {t("departmentForm.fields.nameArabic") ||
                          "Arabic Name"}{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <Field
                        type="text"
                        id="nameArabic"
                        name="nameArabic"
                        dir="rtl"
                        className={inputClass(
                          errors.nameArabic && touched.nameArabic
                        )}
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
                        {t("departmentForm.fields.nameEnglish") ||
                          "English Name"}{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <Field
                        type="text"
                        id="nameEnglish"
                        name="nameEnglish"
                        dir="ltr"
                        className={inputClass(
                          errors.nameEnglish && touched.nameEnglish
                        )}
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
                        className={`${inputClass(
                          errors.code && touched.code
                        )} uppercase ${isRTL ? "pr-11" : "pl-11"}`}
                        placeholder={
                          t("categoryForm.placeholders.code") || "Enter code"
                        }
                        onChange={(e) => {
                          setFieldValue("code", e.target.value.toUpperCase())
                        }}
                      />
                      <Code2
                        size={18}
                        className={`absolute top-3 text-blue-500 ${
                          isRTL ? "right-4" : "left-4"
                        }`}
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
                        className={`${inputClass(
                          errors.location && touched.location
                        )} ${isRTL ? "pr-11" : "pl-11"}`}
                        placeholder={
                          t("departmentForm.placeholders.location") ||
                          "Enter location"
                        }
                      />
                      <MapPin
                        size={18}
                        className={`absolute top-3 text-blue-500 ${
                          isRTL ? "right-4" : "left-4"
                        }`}
                      />
                    </div>
                    <ErrorMessage
                      name="location"
                      component="div"
                      className={errorClass}
                    />
                  </div>

                  <div>
                    <label htmlFor="description" className={labelClass}>
                      {t("departmentForm.fields.description") || "Description"}
                    </label>
                    <Field
                      as="textarea"
                      id="description"
                      name="description"
                      rows={4}
                      dir={isRTL ? "rtl" : "ltr"}
                      className={`${inputClass(
                        errors.description && touched.description
                      )} resize-y`}
                      placeholder={
                        t("departmentForm.placeholders.description") ||
                        "Enter description"
                      }
                    />
                    <ErrorMessage
                      name="description"
                      component="div"
                      className={errorClass}
                    />
                  </div>

                  <label className="flex items-center gap-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-soft)] p-4 cursor-pointer">
                    <Field
                      type="checkbox"
                      id="isActive"
                      name="isActive"
                      className="h-5 w-5 rounded border-[var(--color-border-strong)] text-emerald-500 focus:ring-emerald-500"
                    />
                    <span className="text-sm font-bold text-[var(--color-text)]">
                      {t("departmentForm.fields.isActive") || "Active"}
                    </span>
                  </label>
                </section>

                <div className="flex justify-end gap-3 pt-5 border-t border-[var(--color-border)] flex-wrap">
                  <button
                    type="button"
                    className={theme.secondaryButton}
                    onClick={() => navigate("/admin-panel/departments")}
                  >
                    <X size={18} />
                    {t("departmentForm.buttons.cancel") || "Cancel"}
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting || loadingCreateDepartment}
                    className={`${theme.primaryButton} disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {isSubmitting || loadingCreateDepartment ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        {t("departmentForm.buttons.creating") || "Creating..."}
                      </>
                    ) : (
                      <>
                        <Save size={18} />
                        {t("departmentForm.buttons.create") ||
                          "Create Department"}
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
  )
}

export default CreateDepartment