import React, { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { Formik, Form, Field } from "formik"
import * as Yup from "yup"
import { toast } from "react-toastify"
import Swal from "sweetalert2"
import { useTranslation } from "react-i18next"
import { useNavigate, useParams } from "react-router-dom"
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Calendar,
  CheckCircle2,
  Eye,
  FileBarChart,
  Loader2,
  Save,
  Shield,
  User,
  UserCog,
  Users,
  X,
} from "lucide-react"

import {
  updateManagerPermission,
  getDepartmentById,
} from "../../../state/act/actDepartment"
import LoadingGetData from "../../../components/LoadingGetData"
import { getPageTheme } from "../../../utils/themeClasses"

function EditManagerPermission() {
  const { t, i18n } = useTranslation()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { depId: id } = useParams()
  const theme = getPageTheme()

  const currentLang = i18n.language
  const isRTL = currentLang === "ar"

  const { mymode } = useSelector((state) => state.mode)
  const isDark = mymode === "dark"

  const {
    selectedDepartment,
    loadingGetSingleDepartment,
    singleDepartmentError,
    loadingUpdateManagerPermission,
  } = useSelector((state) => state.department)

  useEffect(() => {
    if (id) {
      dispatch(getDepartmentById(id))
    }
  }, [dispatch, id])

  const validationSchema = Yup.object({
    canViewDepartment: Yup.boolean(),
    canEditDepartment: Yup.boolean(),
    canViewDepartmentReports: Yup.boolean(),
    canManageSchedules: Yup.boolean(),
    canManageStaff: Yup.boolean(),
  })

  const getInitialValues = () => {
    if (!selectedDepartment?.manager) {
      return {
        canViewDepartment: false,
        canEditDepartment: false,
        canViewDepartmentReports: false,
        canManageSchedules: false,
        canManageStaff: false,
      }
    }

    return {
      canViewDepartment: selectedDepartment.manager.canViewDepartment || false,
      canEditDepartment: selectedDepartment.manager.canEditDepartment || false,
      canViewDepartmentReports:
        selectedDepartment.manager.canViewDepartmentReports || false,
      canManageSchedules:
        selectedDepartment.manager.canManageSchedules || false,
      canManageStaff: selectedDepartment.manager.canManageStaff || false,
    }
  }

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      await dispatch(
        updateManagerPermission({
          id,
          data: values,
        })
      ).unwrap()

      toast.success(
        t("managerPermissions.success.updated") ||
          "Manager permissions updated successfully",
        {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        }
      )

      navigate(`/admin-panel/department/${id}`)
    } catch (error) {
      console.error("Manager permissions update error:", error)

      Swal.fire({
        title: t("managerPermissions.error.title") || "Error",
        text:
          currentLang === "en"
            ? error?.messageEn ||
              error?.message ||
              "Failed to update manager permissions"
            : error?.messageAr ||
              error?.message ||
              "فشل في تحديث صلاحيات المدير",
        icon: "error",
        confirmButtonText: t("common.ok") || "OK",
        confirmButtonColor: "#ef4444",
        background: isDark ? "#2d2d2d" : "#ffffff",
        color: isDark ? "#f0f0f0" : "#111827",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const EmptyState = ({ icon: Icon, tone = "slate", title, description, actions }) => {
    const toneClass = {
      red: "text-red-500 border-red-500",
      amber: "text-amber-500 border-amber-500",
      slate: "text-slate-500 border-slate-500",
      blue: "text-blue-500 border-blue-500",
    }[tone]

    return (
      <div className={theme.page} dir={isRTL ? "rtl" : "ltr"}>
        <div className="max-w-2xl mx-auto">
          <div className={`${theme.card} p-8 text-center`}>
            <div
              className={`w-20 h-20 rounded-full border-2 bg-transparent ${toneClass} flex items-center justify-center mx-auto mb-6 shadow-sm`}
            >
              <Icon className="w-10 h-10" />
            </div>

            <h3 className="text-2xl font-black text-[var(--color-text)] mb-3">
              {title}
            </h3>

            <p className="text-[var(--color-text-muted)] mb-8 text-base font-semibold">
              {description}
            </p>

            <div className="flex justify-center gap-3 flex-wrap">{actions}</div>
          </div>
        </div>
      </div>
    )
  }

  const InfoTile = ({ icon: Icon, label, value, tone = "blue" }) => {
    const toneClass = {
      blue: "text-blue-500 border-blue-500",
      emerald: "text-emerald-500 border-emerald-500",
      violet: "text-violet-500 border-violet-500",
      orange: "text-orange-500 border-orange-500",
    }[tone]

    return (
      <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-soft)] p-4">
        <div className="flex items-center gap-3">
          <div
            className={`w-11 h-11 rounded-xl border-2 bg-transparent ${toneClass} flex items-center justify-center shrink-0 shadow-sm`}
          >
            <Icon className="w-5 h-5" />
          </div>

          <div className="min-w-0">
            <p className="text-xs font-black text-[var(--color-text-muted)] mb-1">
              {label}
            </p>
            <p className="font-black text-[var(--color-text)] truncate">
              {value || "-"}
            </p>
          </div>
        </div>
      </div>
    )
  }

  const PermissionCard = ({ name, icon: Icon, label, checked, tone = "blue" }) => {
    const toneClass = {
      blue: "text-blue-500 border-blue-500",
      emerald: "text-emerald-500 border-emerald-500",
      violet: "text-violet-500 border-violet-500",
      orange: "text-orange-500 border-orange-500",
      red: "text-red-500 border-red-500",
      slate: "text-slate-500 border-slate-500",
    }[tone]

    return (
      <label
        htmlFor={name}
        className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-colors cursor-pointer ${
          checked
            ? `${toneClass} bg-transparent`
            : "border-[var(--color-border)] bg-[var(--color-bg-soft)] text-[var(--color-text-muted)] hover:border-emerald-500 hover:text-emerald-500"
        }`}
      >
        <Field
          type="checkbox"
          id={name}
          name={name}
          className="h-5 w-5 rounded border-[var(--color-border-strong)] text-emerald-500 focus:ring-emerald-500"
        />

        <div
          className={`w-10 h-10 rounded-xl border-2 bg-transparent flex items-center justify-center shrink-0 ${
            checked ? toneClass : "text-slate-500 border-slate-500"
          }`}
        >
          <Icon className="w-5 h-5" />
        </div>

        <span className="text-sm font-black text-[var(--color-text)]">
          {label}
        </span>

        {checked && (
          <CheckCircle2 className={`w-5 h-5 ${toneClass.split(" ")[0]} ms-auto`} />
        )}
      </label>
    )
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
      <EmptyState
        icon={X}
        tone="red"
        title={t("department.error.title") || "Error"}
        description={
          singleDepartmentError.message ||
          t("department.error.fetchError") ||
          "Failed to load department data."
        }
        actions={
          <button
            type="button"
            onClick={() => navigate("/admin-panel/departments")}
            className={theme.primaryButton}
          >
            {t("department.details.backToDepartments") || "Back to Departments"}
          </button>
        }
      />
    )
  }

  if (!selectedDepartment) {
    return (
      <EmptyState
        icon={Building2}
        tone="slate"
        title={t("department.empty.title") || "Department Not Found"}
        description={
          t("department.error.notFound") ||
          "The requested department was not found."
        }
        actions={
          <button
            type="button"
            onClick={() => navigate("/admin-panel/departments")}
            className={theme.primaryButton}
          >
            {t("department.details.backToDepartments") || "Back to Departments"}
          </button>
        }
      />
    )
  }

  if (!selectedDepartment.manager) {
    return (
      <EmptyState
        icon={User}
        tone="amber"
        title={t("managerPermissions.noManager.title") || "No Manager Assigned"}
        description={
          t("managerPermissions.noManager.description") ||
          "This department doesn't have a manager assigned. Please assign a manager first."
        }
        actions={
          <>
            <button
              type="button"
              onClick={() => navigate(`/admin-panel/department/${id}`)}
              className={theme.secondaryButton}
            >
              {t("department.details.backToDepartments") || "Back"}
            </button>

            <button
              type="button"
              onClick={() =>
                navigate(`/admin-panel/assign-department-manager/${id}?type=department`)
              }
              className={theme.primaryButton}
            >
              {t("managerPermissions.assignManager") || "Assign Manager"}
            </button>
          </>
        }
      />
    )
  }

  const departmentName =
    currentLang === "ar"
      ? selectedDepartment.nameArabic
      : selectedDepartment.nameEnglish

  const managerName =
    currentLang === "ar"
      ? selectedDepartment.manager.userNameArabic
      : selectedDepartment.manager.userNameEnglish

  const startDate = selectedDepartment.manager.startDate
    ? new Date(selectedDepartment.manager.startDate).toLocaleDateString(
        currentLang === "ar" ? "ar-EG" : "en-US"
      )
    : "N/A"

  return (
    <div className={theme.page} dir={isRTL ? "rtl" : "ltr"}>
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <button
            type="button"
            onClick={() => navigate(`/admin-panel/department/${id}`)}
            className={theme.secondaryButton}
          >
            {isRTL ? <ArrowRight size={18} /> : <ArrowLeft size={18} />}
            {t("department.details.backToDepartments") || "Back"}
          </button>
        </div>

        <div className={`${theme.card} overflow-hidden`}>
          <div className="p-6 border-b border-[var(--color-border)]">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl border-2 bg-transparent text-orange-500 border-orange-500 flex items-center justify-center shrink-0 shadow-sm">
                <Shield className="w-7 h-7" />
              </div>

              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-[var(--color-text)]">
                  {t("managerPermissions.title") ||
                    "Update Manager Permissions"}
                </h1>
                <p className="mt-1 text-sm font-semibold text-[var(--color-text-muted)]">
                  {currentLang === "ar"
                    ? "راجع وعدّل صلاحيات مدير المكان"
                    : "Review and update the department manager permissions"}
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4 border-b border-[var(--color-border)]">
            <InfoTile
              icon={Building2}
              label={t("managerPermissions.department") || "Department"}
              value={departmentName}
              tone="blue"
            />

            <InfoTile
              icon={UserCog}
              label={t("managerPermissions.manager") || "Manager"}
              value={managerName}
              tone="emerald"
            />

            <InfoTile
              icon={Calendar}
              label={t("managerPermissions.startDate") || "Start Date"}
              value={startDate}
              tone="violet"
            />
          </div>

          <Formik
            initialValues={getInitialValues()}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
            enableReinitialize
          >
            {({ isSubmitting, values }) => (
              <Form className="p-6 space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl border-2 bg-transparent text-orange-500 border-orange-500 flex items-center justify-center shrink-0">
                    <Shield className="w-5 h-5" />
                  </div>

                  <h2 className="text-lg font-black text-[var(--color-text)]">
                    {t("managerPermissions.permissions") ||
                      "Manager Permissions"}
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <PermissionCard
                    name="canViewDepartment"
                    icon={Eye}
                    label={
                      t("managerPermissions.canViewDepartment") ||
                      "Can View Department"
                    }
                    checked={values.canViewDepartment}
                    tone="blue"
                  />

                  <PermissionCard
                    name="canEditDepartment"
                    icon={Building2}
                    label={
                      t("managerPermissions.canEditDepartment") ||
                      "Can Edit Department"
                    }
                    checked={values.canEditDepartment}
                    tone="emerald"
                  />

                  <PermissionCard
                    name="canViewDepartmentReports"
                    icon={FileBarChart}
                    label={
                      t("managerPermissions.canViewDepartmentReports") ||
                      "Can View Department Reports"
                    }
                    checked={values.canViewDepartmentReports}
                    tone="violet"
                  />

                  <PermissionCard
                    name="canManageSchedules"
                    icon={Calendar}
                    label={
                      t("managerPermissions.canManageSchedules") ||
                      "Can Manage Schedules"
                    }
                    checked={values.canManageSchedules}
                    tone="orange"
                  />

                  <div className="md:col-span-2">
                    <PermissionCard
                      name="canManageStaff"
                      icon={Users}
                      label={
                        t("managerPermissions.canManageStaff") ||
                        "Can Manage Staff"
                      }
                      checked={values.canManageStaff}
                      tone="red"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-5 border-t border-[var(--color-border)] flex-wrap">
                  <button
                    type="button"
                    className={theme.secondaryButton}
                    onClick={() => navigate(`/admin-panel/department/${id}`)}
                  >
                    <X size={18} />
                    {t("managerPermissions.buttons.cancel") || "Cancel"}
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting || loadingUpdateManagerPermission}
                    className={`${theme.primaryButton} disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {isSubmitting || loadingUpdateManagerPermission ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        {t("managerPermissions.buttons.updating") ||
                          "Updating..."}
                      </>
                    ) : (
                      <>
                        <Save size={18} />
                        {t("managerPermissions.buttons.update") ||
                          "Update Permissions"}
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

export default EditManagerPermission