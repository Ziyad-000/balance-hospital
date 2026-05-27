import React, { useEffect, useMemo, useRef, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { Formik, Form, Field, ErrorMessage } from "formik"
import { toast } from "react-toastify"
import Swal from "sweetalert2"
import { useTranslation } from "react-i18next"
import { useNavigate, useParams, useSearchParams } from "react-router-dom"
import {
  ArrowLeft,
  ArrowRight,
  Building,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Mail,
  Phone,
  Search,
  ShieldCheck,
  User,
  UserCheck,
  XCircle,
} from "lucide-react"

import { assignDepManager, getDepartmentById } from "../../../state/act/actDepartment"
import { assignCategoryHead, getCategoryById } from "../../../state/act/actCategory"
import { doctorForAssignment } from "../../../state/act/actUsers"
import { getUserSummaries } from "../../../state/slices/user"
import LoadingGetData from "../../../components/LoadingGetData"
import UseFormValidation from "../../../hooks/use-form-validation"
import UseInitialValues from "../../../hooks/use-initial-values"
import { getPageTheme } from "../../../utils/themeClasses"

const defaultButtonClass =
  "inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border bg-[var(--color-surface)] text-[var(--color-text)] border-[var(--color-border-strong)] hover:bg-[var(--color-success)] hover:text-white hover:border-[var(--color-success)] active:bg-[var(--color-success-hover)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"

const createButtonClass =
  "inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border bg-[var(--color-success)] text-white border-[var(--color-success)] hover:bg-[var(--color-success-hover)] hover:border-[var(--color-success-hover)] active:scale-[0.98] transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"

const getTone = (tone = "blue") => {
  const tones = {
    blue: "bg-transparent text-blue-500 border-blue-500 dark:bg-transparent dark:text-blue-500 dark:border-blue-500",
    emerald:
      "bg-transparent text-emerald-500 border-emerald-500 dark:bg-transparent dark:text-emerald-500 dark:border-emerald-500",
    amber:
      "bg-transparent text-amber-500 border-amber-500 dark:bg-transparent dark:text-amber-500 dark:border-amber-500",
    red: "bg-transparent text-red-500 border-red-500 dark:bg-transparent dark:text-red-500 dark:border-red-500",
    violet:
      "bg-transparent text-violet-500 border-violet-500 dark:bg-transparent dark:text-violet-500 dark:border-violet-500",
    slate:
      "bg-transparent text-slate-500 border-slate-500 dark:bg-transparent dark:text-slate-500 dark:border-slate-500",
  }

  return tones[tone] || tones.blue
}

const IconBox = ({ icon: Icon, tone = "blue", size = "md" }) => {
  const sizeClass = size === "sm" ? "w-9 h-9 rounded-xl" : "w-12 h-12 rounded-2xl"
  const iconClass = size === "sm" ? "w-4 h-4" : "w-6 h-6"

  return (
    <span
      className={`${sizeClass} border-2 flex items-center justify-center shrink-0 shadow-sm ${getTone(
        tone
      )}`}
    >
      <Icon className={iconClass} />
    </span>
  )
}

const Badge = ({ children, tone = "blue" }) => (
  <span
    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold border ${getTone(
      tone
    )}`}
  >
    {children}
  </span>
)

const getUserDisplayName = (user, lang) => {
  if (!user) return "-"
  return lang === "ar"
    ? user.nameArabic || user.nameAr || user.doctorNameAr || user.nameEnglish || user.doctorNameEn || "-"
    : user.nameEnglish || user.nameEn || user.doctorNameEn || user.nameArabic || user.doctorNameAr || "-"
}

function AssignDepartmentManager() {
  const { t, i18n } = useTranslation()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { depId: id } = useParams()
  const [searchParams] = useSearchParams()
  const dropdownRef = useRef(null)
  const theme = getPageTheme()

  const type = searchParams.get("type")
  const currentLang = i18n.language || "ar"
  const isRTL = currentLang === "ar"
  const isDepartmentMode = type === "department"

  const [userSearchTerm, setUserSearchTerm] = useState("")
  const [showUserDropdown, setShowUserDropdown] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)

  const pageSize = 100

  const {
    loadingAssignManager,
    loadingGetDepartmentById,
    selectedDepartment,
  } = useSelector((state) => state.department)

  const {
    loadingAssignCategoryHead,
    selectedCategory,
    loadingGetSingleCategory,
  } = useSelector((state) => state.category)

  const {
    users,
    pagination,
    loading: usersLoading,
    error: usersError,
  } = useSelector((state) => state.users)

  const { VALIDATION_SCHEMA_ASSIGN_DEPARTMENT_HEAD } = UseFormValidation()
  const { INITIAL_VALUES_ASSIGN_DEPARTMENT_HEAD } = UseInitialValues()

  useEffect(() => {
    if (!id) return

    if (isDepartmentMode) {
      dispatch(getDepartmentById(id))
      dispatch(getUserSummaries({ page: currentPage, pageSize }))
    } else {
      dispatch(getCategoryById({ categoryId: id }))
      dispatch(doctorForAssignment({ categoryId: id }))
    }
  }, [dispatch, id, currentPage, isDepartmentMode])

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (isDepartmentMode) {
        dispatch(
          getUserSummaries({
            search: userSearchTerm,
            page: currentPage,
            pageSize,
          })
        )
      } else {
        dispatch(
          doctorForAssignment({
            search: userSearchTerm,
            categoryId: id,
          })
        )
      }
    }, 300)

    return () => clearTimeout(delayDebounceFn)
  }, [userSearchTerm, dispatch, currentPage, isDepartmentMode, id])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowUserDropdown(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const entityName = useMemo(() => {
    if (isDepartmentMode) {
      return currentLang === "ar"
        ? selectedDepartment?.nameArabic || selectedDepartment?.nameEnglish || "-"
        : selectedDepartment?.nameEnglish || selectedDepartment?.nameArabic || "-"
    }

    return currentLang === "ar"
      ? selectedCategory?.nameArabic || selectedCategory?.nameEnglish || "-"
      : selectedCategory?.nameEnglish || selectedCategory?.nameArabic || "-"
  }, [currentLang, isDepartmentMode, selectedDepartment, selectedCategory])

  const entityMeta = isDepartmentMode
    ? `${selectedDepartment?.code || "-"} • ${selectedDepartment?.location || "-"}`
    : selectedCategory?.code || "-"

  const filteredUsers = useMemo(() => {
    const list = Array.isArray(users) ? users : []
    if (!userSearchTerm) return list

    const searchLower = userSearchTerm.toLowerCase()

    return list.filter((user) => {
      return (
        user.nameEnglish?.toLowerCase().includes(searchLower) ||
        user.nameArabic?.includes(userSearchTerm) ||
        user.doctorNameEn?.toLowerCase().includes(searchLower) ||
        user.doctorNameAr?.includes(userSearchTerm) ||
        user.mobile?.includes(userSearchTerm) ||
        user.email?.toLowerCase().includes(searchLower) ||
        user.role?.toLowerCase().includes(searchLower)
      )
    })
  }, [users, userSearchTerm])

  const handleUserSearchChange = (e, setFieldValue) => {
    const value = e.target.value
    setUserSearchTerm(value)
    setShowUserDropdown(true)
    setCurrentPage(1)

    if (!value) {
      setSelectedUser(null)
      setFieldValue("UserId", "")
    }
  }

  const handleUserSelect = (user, setFieldValue) => {
    setSelectedUser(user)
    setUserSearchTerm(`${getUserDisplayName(user, currentLang)} (${user.mobile || user.email || "-"})`)
    setFieldValue("UserId", isDepartmentMode ? user.id : user.userId || user.id)
    setShowUserDropdown(false)
  }

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= (pagination?.totalPages || 1)) {
      setCurrentPage(newPage)
    }
  }

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      if (isDepartmentMode) {
        await dispatch(assignDepManager({ data: { ...values, DepartmentId: id } })).unwrap()

        toast.success(
          t("departmentForm.success.managerAssigned") || "Manager assigned successfully",
          { position: "top-right", autoClose: 3000 }
        )

        navigate(`/admin-panel/department/${id}`)
      } else {
        await dispatch(assignCategoryHead({ data: { ...values, CategoryId: id } })).unwrap()

        toast.success(
          t("categoryForm.success.managerAssigned") || "Manager assigned successfully",
          { position: "top-right", autoClose: 3000 }
        )

        navigate(`/admin-panel/category/${id}`)
      }

      resetForm()
      setSelectedUser(null)
      setUserSearchTerm("")
    } catch (error) {
      Swal.fire({
        title: isDepartmentMode
          ? t("departmentForm.error.title") || "Error"
          : t("categoryForm.error.assignManager") || "Error",
        text:
          currentLang === "en"
            ? error?.errors?.[0] || error?.messageEn || error?.message || "Failed to assign manager"
            : error?.errors?.[0] || error?.messageAr || error?.message || "فشل في تعيين المدير",
        icon: "error",
        confirmButtonText: t("common.ok") || "OK",
        confirmButtonColor: "var(--color-danger)",
        background: "var(--color-surface)",
        color: "var(--color-text)",
      })
    } finally {
      setSubmitting(false)
    }
  }

  if (loadingGetDepartmentById) {
    return <LoadingGetData text={t("gettingData.departmentData")} />
  }

  if (loadingGetSingleCategory) {
    return <LoadingGetData text={t("gettingData.categoryData")} />
  }

  return (
    <div className={theme.page} dir={isRTL ? "rtl" : "ltr"}>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() =>
                navigate(isDepartmentMode ? "/admin-panel/departments" : "/admin-panel/categories")
              }
              className={defaultButtonClass}
            >
              {isRTL ? <ArrowRight size={16} /> : <ArrowLeft size={16} />}
              {t("departmentForm.buttons.back") || "Back"}
            </button>

            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-[var(--color-text)]">
                {t("departmentForm.assignManager") || "Assign Manager"}
              </h1>
              <p className="text-sm font-semibold text-[var(--color-text-muted)] mt-1">
                {isDepartmentMode
                  ? t("departmentForm.sections.manager") || "Assign Department Manager"
                  : t("specificCategory.sections.chief.title") || "Assign Category Head"}
              </p>
            </div>
          </div>
        </div>

        <div className={`${theme.card} p-5`}>
          <div className="flex items-center gap-3">
            <IconBox icon={Building} tone={isDepartmentMode ? "blue" : "violet"} />
            <div className="min-w-0">
              <h2 className="text-lg font-black text-[var(--color-text)] truncate">
                {entityName}
              </h2>
              <p className="text-sm font-bold text-[var(--color-text-muted)] mt-1">
                {entityMeta}
              </p>
            </div>
          </div>
        </div>

        <div className={`${theme.card} p-6`}>
          <Formik
            initialValues={INITIAL_VALUES_ASSIGN_DEPARTMENT_HEAD}
            validationSchema={VALIDATION_SCHEMA_ASSIGN_DEPARTMENT_HEAD}
            onSubmit={handleSubmit}
            enableReinitialize
          >
            {({ isSubmitting, errors, touched, values, setFieldValue }) => (
              <Form className="space-y-6">
                <div>
                  <div className="flex items-center gap-3 mb-5">
                    <IconBox icon={ShieldCheck} tone="emerald" size="sm" />
                    <h3 className="text-lg font-black text-[var(--color-text)]">
                      {t("departmentForm.sections.managerSelection") || "Manager Selection"}
                    </h3>
                  </div>

                  <label className="block text-sm font-black mb-2 text-[var(--color-text)]">
                    {isDepartmentMode
                      ? t("departmentForm.fields.departmentHead")
                      : t("departmentForm.fields.categoryHead")}
                    <span className="text-red-500 mx-1">*</span>
                  </label>

                  <div className="relative" ref={dropdownRef}>
                    <div className="relative">
                      <input
                        type="text"
                        value={userSearchTerm}
                        onChange={(e) => handleUserSearchChange(e, setFieldValue)}
                        onFocus={() => setShowUserDropdown(true)}
                        placeholder={
                          t("departmentForm.placeholders.searchUsers") ||
                          "Search users by name, mobile, or role..."
                        }
                        className={`w-full px-4 py-3 ${theme.input} ${
                          isRTL ? "pr-12" : "pl-12"
                        } ${errors.UserId && touched.UserId ? "border-red-500" : ""}`}
                        autoComplete="off"
                      />

                      <span
                        className={`absolute top-1/2 -translate-y-1/2 ${
                          isRTL ? "right-3" : "left-3"
                        }`}
                      >
                        <IconBox icon={Search} tone="blue" size="sm" />
                      </span>

                      {usersLoading?.list && (
                        <Loader2
                          className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 animate-spin text-emerald-500 ${
                            isRTL ? "left-4" : "right-4"
                          }`}
                        />
                      )}
                    </div>

                    <ErrorMessage name="UserId" component="div" className="mt-2 text-sm font-bold text-red-500" />

                    {showUserDropdown && (
                      <div className="absolute z-30 w-full mt-2 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-md)] overflow-hidden">
                        <div className="max-h-72 overflow-auto">
                          {usersLoading?.list ? (
                            <div className="p-6 text-center text-[var(--color-text-muted)]">
                              <Loader2 className="mx-auto h-7 w-7 animate-spin text-emerald-500" />
                              <p className="mt-3 text-sm font-bold">
                                {t("departmentForm.loading.users") || "Loading users..."}
                              </p>
                            </div>
                          ) : filteredUsers.length > 0 ? (
                            filteredUsers.map((user) => {
                              const isInactive = user.isActive === false
                              return (
                                <button
                                  key={user.id || user.userId}
                                  type="button"
                                  onClick={() => handleUserSelect(user, setFieldValue)}
                                  className="w-full p-4 text-start border-b border-[var(--color-border)] last:border-b-0 hover:bg-[var(--color-success)] hover:text-white transition-colors group"
                                >
                                  <div className="flex items-start gap-3">
                                    <IconBox icon={User} tone={isInactive ? "red" : "blue"} size="sm" />

                                    <div className="min-w-0 flex-1">
                                      <p className="text-sm font-black text-[var(--color-text)] group-hover:text-white truncate">
                                        {getUserDisplayName(user, currentLang)}
                                      </p>

                                      <div className="flex flex-wrap items-center gap-2 mt-2 text-xs font-bold text-[var(--color-text-muted)] group-hover:text-white/80">
                                        {user.mobile && (
                                          <span className="inline-flex items-center gap-1">
                                            <Phone size={12} />
                                            {user.mobile}
                                          </span>
                                        )}
                                        {user.email && (
                                          <span className="inline-flex items-center gap-1">
                                            <Mail size={12} />
                                            {user.email}
                                          </span>
                                        )}
                                      </div>

                                      <div className="flex flex-wrap gap-1.5 mt-2">
                                        {user.scientificDegree && <Badge tone="violet">{user.scientificDegree}</Badge>}
                                        {user.contractingType && <Badge tone="blue">{user.contractingType}</Badge>}
                                        {user.isCurrentHead && (
                                          <Badge tone="emerald">
                                            {t("user.currentHead") || "Current Head"}
                                          </Badge>
                                        )}
                                        {user.isManagerInOtherCategory && (
                                          <Badge tone="amber">
                                            {t("user.managerElsewhere") || "Manager in Other Category"}
                                          </Badge>
                                        )}
                                        {isInactive && <Badge tone="red">{t("user.inactive") || "Inactive"}</Badge>}
                                      </div>
                                    </div>
                                  </div>
                                </button>
                              )
                            })
                          ) : (
                            <div className="p-6 text-center">
                              <IconBox icon={XCircle} tone="slate" />
                              <p className="mt-3 text-sm font-bold text-[var(--color-text-muted)]">
                                {userSearchTerm
                                  ? t("assignUserRole.noResults") || "No users found matching your search"
                                  : t("assignUserRole.noUsers") || "No users available"}
                              </p>
                            </div>
                          )}
                        </div>

                        {isDepartmentMode && pagination?.totalPages > 1 && (
                          <div className="flex items-center justify-between gap-3 px-4 py-3 border-t border-[var(--color-border)] bg-[var(--color-surface-muted)]">
                            <p className="text-xs font-bold text-[var(--color-text-muted)]">
                              {(currentPage - 1) * pageSize + 1} -{" "}
                              {Math.min(currentPage * pageSize, pagination.totalCount)} / {pagination.totalCount}
                            </p>

                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                                className={defaultButtonClass}
                              >
                                <ChevronLeft size={16} />
                              </button>
                              <span className="text-sm font-black text-[var(--color-text)]">
                                {currentPage} / {pagination.totalPages}
                              </span>
                              <button
                                type="button"
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === pagination.totalPages}
                                className={defaultButtonClass}
                              >
                                <ChevronRight size={16} />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {selectedUser && (
                    <div className="mt-4 p-4 rounded-2xl border-2 border-emerald-500 bg-transparent text-emerald-500">
                      <div className="flex items-center gap-3">
                        <UserCheck className="w-5 h-5" />
                        <p className="text-sm font-black">
                          {getUserDisplayName(selectedUser, currentLang)}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label htmlFor="notes" className="block text-sm font-black mb-2 text-[var(--color-text)]">
                    {t("departmentForm.fields.notes") || "Notes"}
                  </label>

                  <Field
                    as="textarea"
                    id="notes"
                    name="notes"
                    rows={4}
                    dir={isRTL ? "rtl" : "ltr"}
                    className={`w-full px-4 py-3 resize-y ${theme.textarea} ${
                      errors.notes && touched.notes ? "border-red-500" : ""
                    }`}
                    placeholder={
                      t("departmentForm.placeholders.notes") ||
                      "Enter any notes about the manager assignment"
                    }
                  />

                  <ErrorMessage name="notes" component="div" className="mt-2 text-sm font-bold text-red-500" />

                  <p className="mt-2 text-xs font-bold text-[var(--color-text-muted)]">
                    {values.notes?.length || 0}/500 {t("managementRoleForm.charactersCount")}
                  </p>
                </div>

                {usersError && (
                  <div className="p-4 rounded-2xl border-2 border-red-500 bg-transparent text-red-500 text-sm font-bold">
                    {String(usersError)}
                  </div>
                )}

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isSubmitting || loadingAssignManager || loadingAssignCategoryHead}
                    className={createButtonClass}
                  >
                    {isSubmitting || loadingAssignManager || loadingAssignCategoryHead ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        {t("department.actions.assigning") || "Assigning..."}
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4" />
                        {t("department.actions.assign") || "Assign Manager"}
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

export default AssignDepartmentManager