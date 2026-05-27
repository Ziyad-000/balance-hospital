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
  CheckCircle,
  Loader2,
  MapPin,
  Save,
  X,
} from "lucide-react"
import i18next from "i18next"

import { createDepartment } from "../../../state/act/actDepartment"
import UseInitialValues from "../../../hooks/use-initial-values"
import UseFormValidation from "../../../hooks/use-form-validation"
import { getPageTheme } from "../../../utils/themeClasses"

function CreateDepartmentSpecificCategory() {
  const { t, i18n } = useTranslation()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const theme = getPageTheme()

  const currentLang = i18n.language
  const isRTL = currentLang === "ar"

  const { loadingCreateDepartment } = useSelector((state) => state.department)

  const { VALIDATION_SCHEMA_ADD_DEPARTMENT } = UseFormValidation()
  const { INITIAL_VALUES_ADD_DEPARTMENT } = UseInitialValues()

  const categoryId = localStorage.getItem("categoryId")
  const currentLanguage = i18next.language

  const categoryName =
    currentLanguage === "en"
      ? localStorage.getItem("categoryEnglishName")
      : localStorage.getItem("categoryArabicName")

  const enhancedInitialValues = {
    ...INITIAL_VALUES_ADD_DEPARTMENT,
    categoryId: categoryId || "",
  }

  const labelClass = "block text-sm font-bold mb-2 text-[var(--color-text)]"
  const errorClass = "mt-1 text-sm font-semibold text-red-500"

  const inputClass = (hasError = false) =>
    `w-full px-4 py-2.5 rounded-xl border bg-[var(--color-surface)] text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] shadow-sm outline-none transition-colors focus:border-[var(--color-success)] focus:ring-2 focus:ring-[var(--color-success)]/20 ${
      hasError
        ? "border-red-500 bg-transparent"
        : "border-[var(--color-border-strong)]"
    }`

  const handleSubmit = async (values, { resetForm, setSubmitting }) => {
    const submissionValues = {
      ...values,
      categoryId: categoryId || values.categoryId,
    }

    try {
      await dispatch(createDepartment(submissionValues)).unwrap()

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
            ? error?.response?.data?.messageEn ||
              error?.messageEn ||
              error?.message
            : error?.response?.data?.messageAr ||
              error?.messageAr ||
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

  useEffect(() => {
    if (!categoryId) {
      toast.warning(
        t("departmentForm.warning.noCategorySelected") ||
          "No category selected.",
        {
          position: "top-right",
          autoClose: 5000,
        }
      )
    }
  }, [categoryId, t])

  return (
    <div className={theme.page} dir={isRTL ? "rtl" : "ltr"}>
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex items-center justify-between gap-4 flex-wrap">
          <button
            type="button"
            onClick={() => window.history.back()}
            className={theme.secondaryButton}
          >
            {isRTL ? <ArrowRight size={18} /> : <ArrowLeft size={18} />}
            {t("departmentForm.buttons.back") || t("departmentForm.buttons.cancel")}
          </button>
        </div>

        <div className={`${theme.card} overflow-hidden`}>
          <div className="p-6 border-b border-[var(--color-border)]">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl border-2 bg-transparent text-blue-500 border-blue-500 flex items-center justify-center shrink-0 shadow-sm">
                <Building2 className="w-7 h-7" />
              </div>

              <div className="min-w-0">
                <h1 className="text-2xl sm:text-3xl font-black text-[var(--color-text)]">
                  {t("departmentForm.title")}
                </h1>
                <p className="mt-1 text-sm font-semibold text-[var(--color-text-muted)]">
                  {currentLang === "ar"
                    ? "إنشاء مكان جديد داخل التخصص المحدد"
                    : "Create a new department inside the selected category"}
                </p>
              </div>
            </div>
          </div>

          <Formik
            initialValues={enhancedInitialValues}
            validationSchema={VALIDATION_SCHEMA_ADD_DEPARTMENT}
            onSubmit={handleSubmit}
            enableReinitialize
          >
            {({ isSubmitting, errors, touched }) => (
              <Form className="p-6 space-y-6">
                <Field type="hidden" name="categoryId" value={categoryId || ""} />

                {categoryName && (
                  <div className="rounded-2xl border-2 border-blue-500 bg-transparent p-4 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl border-2 border-blue-500 bg-transparent text-blue-500 flex items-center justify-center shrink-0">
                        <Building2 className="w-5 h-5" />
                      </div>

                      <div>
                        <p className="text-xs font-black text-blue-500 mb-1">
                          {t("departmentForm.fields.category")}
                        </p>
                        <p
                          className="text-lg font-black text-[var(--color-text)]"
                          dir={isRTL ? "rtl" : "ltr"}
                        >
                          {categoryName}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label htmlFor="nameArabic" className={labelClass}>
                      {t("departmentForm.fields.nameArabic")}{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <Field
                      type="text"
                      id="nameArabic"
                      name="nameArabic"
                      dir="rtl"
                      className={inputClass(errors.nameArabic && touched.nameArabic)}
                      placeholder={t("departmentForm.placeholders.nameArabic")}
                    />
                    <ErrorMessage
                      name="nameArabic"
                      component="div"
                      className={errorClass}
                    />
                  </div>

                  <div>
                    <label htmlFor="nameEnglish" className={labelClass}>
                      {t("departmentForm.fields.nameEnglish")}{" "}
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
                      placeholder={t("departmentForm.placeholders.nameEnglish")}
                    />
                    <ErrorMessage
                      name="nameEnglish"
                      component="div"
                      className={errorClass}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="location" className={labelClass}>
                    {t("departmentForm.fields.location")}
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
                      placeholder={t("departmentForm.placeholders.location")}
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

                <label className="flex items-center gap-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-soft)] p-4 cursor-pointer">
                  <Field
                    type="checkbox"
                    id="isActive"
                    name="isActive"
                    className="h-5 w-5 rounded border-[var(--color-border-strong)] text-emerald-500 focus:ring-emerald-500"
                  />
                  <span className="text-sm font-bold text-[var(--color-text)]">
                    {t("departmentForm.fields.isActive")}
                  </span>
                </label>

                <div className="flex justify-end gap-3 pt-5 border-t border-[var(--color-border)] flex-wrap">
                  <button
                    type="button"
                    className={theme.secondaryButton}
                    onClick={() => window.history.back()}
                  >
                    <X size={18} />
                    {t("departmentForm.buttons.cancel")}
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting || loadingCreateDepartment || !categoryId}
                    className={`${theme.primaryButton} disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {isSubmitting || loadingCreateDepartment ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        {t("departmentForm.buttons.creating")}
                      </>
                    ) : (
                      <>
                        <Save size={18} />
                        {t("departmentForm.buttons.create")}
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

export default CreateDepartmentSpecificCategory