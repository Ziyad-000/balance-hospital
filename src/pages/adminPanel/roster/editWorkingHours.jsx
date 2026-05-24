import { useEffect } from "react"
import i18next from "i18next"
import { useTranslation } from "react-i18next"
import { useDispatch, useSelector } from "react-redux"
import { useParams, useNavigate } from "react-router-dom"
import { Formik, Form, Field, ErrorMessage } from "formik"
import { toast } from "react-toastify"
import Swal from "sweetalert2"
import { Save, ArrowLeft } from "lucide-react"
import {
  getWorkingHour,
  updateWorkingHour,
} from "../../../state/act/actRosterManagement"
import UseFormValidation from "../../../hooks/use-form-validation"
import LoadingGetData from "../../../components/LoadingGetData"
import { getPageTheme, swalTheme } from "../../../utils/themeClasses"

function EditWorkingHour() {
  const { workingHourId } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const theme = getPageTheme()

  const { workingHour, loading } = useSelector(
    (state) => state.rosterManagement
  )

  const { t } = useTranslation()
  const currentLang = i18next.language
  const isRTL = currentLang === "ar"

  const { VALIDATION_SCHEMA_EDIT_WORKING_HOUR } = UseFormValidation()

  useEffect(() => {
    if (workingHourId) {
      dispatch(getWorkingHour({ workingHourId }))
    }
  }, [dispatch, workingHourId])

  const initialValues = {
    rosterWorkingHoursId: workingHour?.id || "",
    requiredDoctors: workingHour?.requiredDoctors || 1,
    maxDoctors: workingHour?.maxDoctors || 1,
    notes: workingHour?.notes || "",
    modificationReason: "",
  }

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      const updateData = {
        rosterWorkingHoursId: parseInt(values.rosterWorkingHoursId),
        requiredDoctors: parseInt(values.requiredDoctors),
        maxDoctors: parseInt(values.maxDoctors),
        notes: values.notes || "",
        modificationReason: values.modificationReason,
      }

      await dispatch(
        updateWorkingHour({
          workingHourId,
          data: updateData,
        })
      ).unwrap()

      toast.success(t("roster.workingHours.success.updated"), {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      })

      navigate(-1)
    } catch (error) {
      Swal.fire({
        title: t("roster.workingHours.error.updateTitle"),
        text:
          currentLang === "en"
            ? error?.response?.data?.messageEn ||
              error?.message ||
              t("roster.workingHours.error.updateMessage")
            : error?.response?.data?.messageAr ||
              error?.message ||
              t("roster.workingHours.error.updateMessage"),
        icon: "error",
        confirmButtonText: t("common.ok"),
        ...swalTheme,
        confirmButtonColor: "var(--color-danger)",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const fieldClass = (hasError = false) =>
    `w-full px-3 py-2 text-sm ${theme.input} ${
      hasError
        ? "border-[var(--color-danger)] bg-[var(--color-danger-soft)]"
        : ""
    }`

  const labelClass = "block text-sm font-semibold text-[var(--color-text)] mb-2"
  const errorClass = "mt-1 text-sm text-[var(--color-danger)]"

  const CharacterCounter = ({ value }) => (
    <p className="mt-1 text-xs text-[var(--color-text-muted)]">
      {value?.length || 0}/500 {t("roster.workingHours.charactersCount")}
    </p>
  )

  if (loading?.fetch) {
    return <LoadingGetData text={t("gettingData.workingHour")} />
  }

  if (!workingHour) {
    return (
      <div
        className="flex items-center justify-center min-h-screen bg-[var(--color-bg)]"
        dir={isRTL ? "rtl" : "ltr"}
      >
        <div className="text-center text-[var(--color-text-muted)]">
          <p>{t("roster.workingHours.error.notFound")}</p>
        </div>
      </div>
    )
  }

  return (
    <div className={theme.page} dir={isRTL ? "rtl" : "ltr"}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <div className="flex items-center mb-4">
            <button
              onClick={() => navigate(-1)}
              className={`p-2 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg-soft)] transition-colors ${
                isRTL ? "ml-3" : "mr-3"
              }`}
              type="button"
            >
              <ArrowLeft size={20} />
            </button>

            <div>
              <h1 className="text-2xl font-bold text-[var(--color-text)]">
                {t("roster.workingHours.editTitle")}
              </h1>

              <p className="text-sm text-[var(--color-text-muted)] mt-1">
                {t("roster.workingHours.editSubtitle")}
              </p>
            </div>
          </div>
        </div>

        <div className={`${theme.card} p-6`}>
          <Formik
            initialValues={initialValues}
            validationSchema={VALIDATION_SCHEMA_EDIT_WORKING_HOUR}
            onSubmit={handleSubmit}
            enableReinitialize
          >
            {({ isSubmitting, errors, touched, values }) => (
              <Form className="space-y-6">
                <Field type="hidden" name="rosterWorkingHoursId" />

                <div>
                  <label htmlFor="requiredDoctors" className={labelClass}>
                    {t("roster.workingHours.fields.requiredDoctors")}{" "}
                    <span className="text-[var(--color-danger)]">*</span>
                  </label>

                  <Field
                    type="number"
                    id="requiredDoctors"
                    name="requiredDoctors"
                    min="1"
                    className={fieldClass(
                      errors.requiredDoctors && touched.requiredDoctors
                    )}
                  />

                  <ErrorMessage
                    name="requiredDoctors"
                    component="div"
                    className={errorClass}
                  />
                </div>

                <div>
                  <label htmlFor="maxDoctors" className={labelClass}>
                    {t("roster.workingHours.fields.maxDoctors")}{" "}
                    <span className="text-[var(--color-danger)]">*</span>
                  </label>

                  <Field
                    type="number"
                    id="maxDoctors"
                    name="maxDoctors"
                    min="1"
                    className={fieldClass(
                      errors.maxDoctors && touched.maxDoctors
                    )}
                  />

                  <ErrorMessage
                    name="maxDoctors"
                    component="div"
                    className={errorClass}
                  />
                </div>

                <div>
                  <label htmlFor="notes" className={labelClass}>
                    {t("roster.workingHours.fields.notes")}
                  </label>

                  <Field
                    as="textarea"
                    id="notes"
                    name="notes"
                    rows={4}
                    dir={isRTL ? "rtl" : "ltr"}
                    className={`${fieldClass(
                      errors.notes && touched.notes
                    )} resize-vertical`}
                    placeholder={t("roster.workingHours.placeholders.notes")}
                  />

                  <ErrorMessage
                    name="notes"
                    component="div"
                    className={errorClass}
                  />

                  <CharacterCounter value={values.notes} />
                </div>

                <div>
                  <label htmlFor="modificationReason" className={labelClass}>
                    {t("roster.workingHours.fields.modificationReason")}{" "}
                    <span className="text-[var(--color-danger)]">*</span>
                  </label>

                  <Field
                    as="textarea"
                    id="modificationReason"
                    name="modificationReason"
                    rows={3}
                    dir={isRTL ? "rtl" : "ltr"}
                    className={`${fieldClass(
                      errors.modificationReason && touched.modificationReason
                    )} resize-vertical`}
                    placeholder={t(
                      "roster.workingHours.placeholders.modificationReason"
                    )}
                  />

                  <ErrorMessage
                    name="modificationReason"
                    component="div"
                    className={errorClass}
                  />

                  <CharacterCounter value={values.modificationReason} />
                </div>

                <div className="flex justify-between pt-6 border-t border-[var(--color-border)]">
                  <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className={theme.secondaryButton}
                  >
                    <ArrowLeft size={16} className={isRTL ? "ml-2" : "mr-2"} />
                    {t("common.cancel")}
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting || loading?.update}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting || loading?.update ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2 rtl:mr-0 rtl:ml-2" />
                        {t("roster.actions.updating")}
                      </>
                    ) : (
                      <>
                        <Save size={16} className={isRTL ? "ml-2" : "mr-2"} />
                        {t("roster.actions.update")}
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

export default EditWorkingHour