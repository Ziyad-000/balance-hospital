import React, { useEffect, useMemo, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate, useParams } from "react-router-dom"
import { useTranslation } from "react-i18next"
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  BarChart3,
  CalendarDays,
  CheckCircle,
  Clock,
  Edit3,
  FileText,
  History,
  Mail,
  Phone,
  RefreshCw,
  Search,
  ShieldCheck,
  Stethoscope,
  Trash2,
  User,
  UserCheck,
  XCircle,
} from "lucide-react"

import {
  deleteUser,
  getDoctorRosters,
  getUserActivityLog,
  getUserById,
  getUserLoginHistory,
  updateUser,
  clearDeleteUserState,
  clearDoctorAnalytics,
  clearSelectedUser,
  clearUpdateUserState,
  clearUserLogs,
} from "../../../state/slices/users"

import axiosInstance from "../../../utils/axiosInstance"
import { formatDate } from "../../../utils/formtDate"
import { getPageTheme } from "../../../utils/themeClasses"

const getAuthHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("token")}`,
  "Content-Type": "application/json",
})

const getApiList = (payload) => {
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.data)) return payload.data
  if (Array.isArray(payload?.data?.items)) return payload.data.items
  return []
}

function SpecificUser() {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { i18n } = useTranslation()
  const theme = getPageTheme()

  const currentLang = i18n.language || "ar"
  const isRTL = currentLang === "ar"

  const [activeTab, setActiveTab] = useState("profile")
  const [isEditing, setIsEditing] = useState(false)

  const [lookupsLoading, setLookupsLoading] = useState(false)
  const [lookupsError, setLookupsError] = useState(null)
  const [categories, setCategories] = useState([])
  const [scientificDegrees, setScientificDegrees] = useState([])
  const [contractingTypes, setContractingTypes] = useState([])

  const [departments, setDepartments] = useState([])
  const [rosterOptions, setRosterOptions] = useState([])
  const [scheduleViewMode, setScheduleViewMode] = useState("calendar")

  const [scheduleFilters, setScheduleFilters] = useState({
    categoryId: "",
    departmentId: "",
    rosterId: "",
    dateFrom: "",
    dateTo: "",
    attendanceStatusFilter: "",
  })

  const [formData, setFormData] = useState({
    fullNameAr: "",
    fullNameEn: "",
    email: "",
    mobile: "",
    primaryCategoryId: "",
    scientificDegreeId: "",
    contractingTypeId: "",
    updateReason: "",
  })

  const {
    selectedUser,
    loadingGetUserById,
    getUserByIdError,

    loadingUpdateUser,
    updateUserError,
    updateUserSuccess,
    updateUserMessage,

    loadingDeleteUser,
    deleteUserError,
    deleteUserSuccess,

    activityLog,
    activityLogPagination,
    loadingGetUserActivityLog,
    userActivityLogError,

    loginHistory,
    loginHistoryPagination,
    loadingGetUserLoginHistory,
    userLoginHistoryError,

    doctorRosters,
    doctorRostersPagination,
    loadingGetDoctorRosters,
    doctorRostersError,
  } = useSelector((state) => state.users)

  useEffect(() => {
    fetchLookups()
  }, [])

  useEffect(() => {
    if (!id) return

    dispatch(getUserById(id))
    dispatch(
      getUserActivityLog({
        id,
        filter: {
          page: 1,
          pageSize: 10,
        },
      })
    )
    dispatch(
      getUserLoginHistory({
        id,
        filter: {
          page: 1,
          pageSize: 10,
        },
      })
    )

    return () => {
      dispatch(clearSelectedUser())
      dispatch(clearUserLogs())
      dispatch(clearDoctorAnalytics())
      dispatch(clearUpdateUserState())
      dispatch(clearDeleteUserState())
    }
  }, [dispatch, id])

  useEffect(() => {
    if (!selectedUser) return

    const categoryId =
      selectedUser.primaryCategory?.id ||
      selectedUser.primaryCategoryId ||
      selectedUser.categoryId ||
      ""

    setFormData({
      fullNameAr: selectedUser.nameArabic || selectedUser.nameAr || "",
      fullNameEn: selectedUser.nameEnglish || selectedUser.nameEn || "",
      email: selectedUser.email || "",
      mobile: selectedUser.mobile || "",
      primaryCategoryId: categoryId ? String(categoryId) : "",
      scientificDegreeId: selectedUser.scientificDegree?.id
        ? String(selectedUser.scientificDegree.id)
        : "",
      contractingTypeId: selectedUser.contractingType?.id
        ? String(selectedUser.contractingType.id)
        : "",
      updateReason: "",
    })

    const initialScheduleFilters = {
      categoryId: categoryId ? String(categoryId) : "",
      departmentId: "",
      rosterId: "",
      dateFrom: "",
      dateTo: "",
      attendanceStatusFilter: "",
    }

    setScheduleFilters(initialScheduleFilters)

    if (categoryId) {
      fetchDepartmentsByCategory(categoryId)
      fetchRostersByCategory(categoryId)
    }

    dispatch(
      getDoctorRosters({
        doctorId: id,
        filter: initialScheduleFilters,
        page: 1,
        pageSize: 20,
      })
    )
  }, [selectedUser, dispatch, id])

  useEffect(() => {
    if (updateUserSuccess) {
      setIsEditing(false)
      dispatch(clearUpdateUserState())
      dispatch(getUserById(id))
    }
  }, [updateUserSuccess, dispatch, id])

  useEffect(() => {
    if (deleteUserSuccess) {
      dispatch(clearDeleteUserState())
      navigate("/admin-panel/users")
    }
  }, [deleteUserSuccess, dispatch, navigate])

  const fetchLookups = async () => {
    try {
      setLookupsLoading(true)
      setLookupsError(null)

      const [categoriesRes, degreesRes, contractingRes] = await Promise.all([
        axiosInstance.get("/api/v1/Category/categories-types", {
          headers: getAuthHeaders(),
        }),
        axiosInstance.get("/api/v1/ScientificDegree/scientific-degrees", {
          headers: getAuthHeaders(),
        }),
        axiosInstance.get("/api/v1/ContractingType/contracting-types", {
          headers: getAuthHeaders(),
        }),
      ])

      setCategories(getApiList(categoriesRes.data))
      setScientificDegrees(getApiList(degreesRes.data))
      setContractingTypes(getApiList(contractingRes.data))
    } catch (error) {
      setLookupsError(
        error.response?.data?.messageAr ||
          error.response?.data?.messageEn ||
          error.message ||
          "Failed to load lookup lists"
      )
    } finally {
      setLookupsLoading(false)
    }
  }

  const fetchDepartmentsByCategory = async (categoryId) => {
    if (!categoryId) {
      setDepartments([])
      return
    }

    try {
      const res = await axiosInstance.get(
        `/api/v1/Department/by-category/${categoryId}`,
        {
          headers: getAuthHeaders(),
        }
      )

      setDepartments(getApiList(res.data))
    } catch {
      setDepartments([])
    }
  }

  const fetchRostersByCategory = async (categoryId) => {
    if (!categoryId) {
      setRosterOptions([])
      return
    }

    try {
      const res = await axiosInstance.get(
        `/api/v1/RosterManagement/categories/${categoryId}/rosters?descending=false`,
        {
          headers: getAuthHeaders(),
        }
      )

      setRosterOptions(getApiList(res.data))
    } catch {
      setRosterOptions([])
    }
  }

  const refreshData = () => {
    if (!id) return

    dispatch(getUserById(id))
    dispatch(
      getUserActivityLog({
        id,
        filter: {
          page: 1,
          pageSize: 10,
        },
      })
    )
    dispatch(
      getUserLoginHistory({
        id,
        filter: {
          page: 1,
          pageSize: 10,
        },
      })
    )
    loadDoctorSchedule(scheduleFilters)
  }

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleScheduleFilterChange = (field, value) => {
    const nextFilters = {
      ...scheduleFilters,
      [field]: value,
    }

    if (field === "categoryId") {
      nextFilters.departmentId = ""
      nextFilters.rosterId = ""

      fetchDepartmentsByCategory(value)
      fetchRostersByCategory(value)
    }

    setScheduleFilters(nextFilters)
  }

  const loadDoctorSchedule = (filterOverride = scheduleFilters) => {
    if (!id) return

    dispatch(
      getDoctorRosters({
        doctorId: id,
        filter: filterOverride,
        page: 1,
        pageSize: 20,
      })
    )
  }

  const handleApplyScheduleFilters = (event) => {
    event?.preventDefault?.()
    loadDoctorSchedule(scheduleFilters)
  }

  const handleClearScheduleFilters = () => {
    const categoryId =
      selectedUser?.primaryCategory?.id ||
      selectedUser?.primaryCategoryId ||
      selectedUser?.categoryId ||
      ""

    const cleared = {
      categoryId: categoryId ? String(categoryId) : "",
      departmentId: "",
      rosterId: "",
      dateFrom: "",
      dateTo: "",
      attendanceStatusFilter: "",
    }

    setScheduleFilters(cleared)

    if (categoryId) {
      fetchDepartmentsByCategory(categoryId)
      fetchRostersByCategory(categoryId)
    }

    loadDoctorSchedule(cleared)
  }

  const handleSubmit = (event) => {
    event.preventDefault()

    dispatch(
      updateUser({
        id,
        data: {
          fullNameAr: formData.fullNameAr,
          fullNameEn: formData.fullNameEn,
          email: formData.email,
          mobile: formData.mobile,
          primaryCategoryId: Number(formData.primaryCategoryId || 0),
          scientificDegreeId: Number(formData.scientificDegreeId || 0),
          contractingTypeId: Number(formData.contractingTypeId || 0),
          updateReason:
            formData.updateReason ||
            (currentLang === "ar"
              ? "تحديث بيانات المستخدم من لوحة التحكم"
              : "User data updated from admin panel"),
        },
      })
    )
  }

  const handleDelete = () => {
    const reason = window.prompt(
      currentLang === "ar"
        ? "اكتب سبب حذف المستخدم:"
        : "Write deletion reason:"
    )

    if (!reason) return

    dispatch(
      deleteUser({
        id,
        deletedReason: reason,
      })
    )
  }

  const getUserName = (user) => {
    return currentLang === "ar"
      ? user?.nameArabic ||
          user?.nameAr ||
          user?.fullNameAr ||
          user?.nameEnglish ||
          user?.nameEn ||
          "-"
      : user?.nameEnglish ||
          user?.nameEn ||
          user?.fullNameEn ||
          user?.nameArabic ||
          user?.nameAr ||
          "-"
  }

  const getRoleName = (user) => {
    return currentLang === "ar"
      ? user?.roleNameAr || user?.roleNameEn || "-"
      : user?.roleNameEn || user?.roleNameAr || "-"
  }

  const getCategoryName = (user) => {
    return currentLang === "ar"
      ? user?.primaryCategory?.nameArabic ||
          user?.primaryCategoryNameAr ||
          user?.categoryNameAr ||
          "-"
      : user?.primaryCategory?.nameEnglish ||
          user?.primaryCategoryNameEn ||
          user?.categoryNameEn ||
          "-"
  }

  const getScientificDegreeName = (user) => {
    return currentLang === "ar"
      ? user?.scientificDegree?.nameArabic ||
          user?.scientificDegreeNameAr ||
          "-"
      : user?.scientificDegree?.nameEnglish ||
          user?.scientificDegreeNameEn ||
          "-"
  }

  const getContractingTypeName = (user) => {
    return currentLang === "ar"
      ? user?.contractingType?.nameArabic ||
          user?.contractingTypeNameAr ||
          "-"
      : user?.contractingType?.nameEnglish ||
          user?.contractingTypeNameEn ||
          "-"
  }

  const workStats = selectedUser?.workStatistics || {}
  const attendanceSummary = workStats?.attendanceSummary || {}
  const requestsStats = selectedUser?.requestsStatistics || {}
  const swapStats = requestsStats?.swapRequests || {}
  const leaveStats = requestsStats?.leaveRequests || {}
  const activityInfo = selectedUser?.activityInfo || {}
  const auditInfo = selectedUser?.auditInfo || {}

  const isDoctor =
    selectedUser?.roleNameEn === "Doctor" || selectedUser?.roleNameAr === "طبيب"

  const statCards = useMemo(
    () => [
      {
        title:
          currentLang === "ar" ? "الشفتات المجدولة" : "Scheduled Shifts",
        value: workStats.totalScheduledShifts ?? 0,
        icon: CalendarDays,
        tone: "blue",
      },
      {
        title:
          currentLang === "ar" ? "الشفتات المكتملة" : "Completed Shifts",
        value: workStats.totalCompletedShifts ?? 0,
        icon: CheckCircle,
        tone: "green",
      },
      {
        title: currentLang === "ar" ? "ساعات العمل" : "Work Hours",
        value: workStats.totalWorkHours ?? 0,
        icon: Clock,
        tone: "purple",
      },
      {
        title: currentLang === "ar" ? "نسبة الحضور" : "Attendance Rate",
        value: `${attendanceSummary.attendanceRate ?? 0}%`,
        icon: BarChart3,
        tone: "orange",
      },
      {
        title: currentLang === "ar" ? "أيام الحضور" : "Present Days",
        value: attendanceSummary.totalDaysPresent ?? 0,
        icon: UserCheck,
        tone: "green",
      },
      {
        title: currentLang === "ar" ? "أيام الغياب" : "Absent Days",
        value: attendanceSummary.totalDaysAbsent ?? 0,
        icon: XCircle,
        tone: "red",
      },
    ],
    [currentLang, workStats, attendanceSummary]
  )

  if (loadingGetUserById) {
    return (
      <div className={theme.page} dir={isRTL ? "rtl" : "ltr"}>
        <div className="max-w-7xl mx-auto">
          <InlineLoader
            text={
              currentLang === "ar"
                ? "جاري تحميل بيانات المستخدم..."
                : "Loading user details..."
            }
          />
        </div>
      </div>
    )
  }

  if (getUserByIdError) {
    return (
      <div className={theme.page} dir={isRTL ? "rtl" : "ltr"}>
        <div className="max-w-5xl mx-auto">
          <ErrorBox
            title={
              currentLang === "ar"
                ? "تعذر تحميل المستخدم"
                : "Failed to load user"
            }
            message={getUserByIdError?.message}
          />

          <button
            type="button"
            onClick={() => navigate("/admin-panel/users")}
            className={`${theme.primaryButton} mt-4`}
          >
            {isRTL ? <ArrowRight size={16} /> : <ArrowLeft size={16} />}
            {currentLang === "ar" ? "رجوع للمستخدمين" : "Back to Users"}
          </button>
        </div>
      </div>
    )
  }

  if (!selectedUser) {
    return (
      <div className={theme.page} dir={isRTL ? "rtl" : "ltr"}>
        <div className="max-w-5xl mx-auto">
          <EmptyState
            title={currentLang === "ar" ? "لا توجد بيانات" : "No data found"}
            description={
              currentLang === "ar"
                ? "لم يتم العثور على بيانات المستخدم."
                : "User data was not found."
            }
          />
        </div>
      </div>
    )
  }

  return (
    <div className={theme.page} dir={isRTL ? "rtl" : "ltr"}>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <button
            type="button"
            onClick={() => navigate("/admin-panel/users")}
            className="inline-flex items-center gap-2 text-sm font-bold text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
          >
            {isRTL ? <ArrowRight size={16} /> : <ArrowLeft size={16} />}
            {currentLang === "ar" ? "رجوع للمستخدمين" : "Back to Users"}
          </button>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={refreshData}
              className={theme.secondaryButton}
            >
              <RefreshCw size={16} />
              {currentLang === "ar" ? "تحديث" : "Refresh"}
            </button>

            {isDoctor && (
              <button
                type="button"
                onClick={() =>
                  navigate(`/admin-panel/users/doctor-analytics/${id}`)
                }
                className={theme.secondaryButton}
              >
                <BarChart3 size={16} />
                {currentLang === "ar"
                  ? "تحليلات الدكتور"
                  : "Doctor Analytics"}
              </button>
            )}

            <button
              type="button"
              onClick={() => setIsEditing((prev) => !prev)}
              className={theme.primaryButton}
            >
              <Edit3 size={16} />
              {isEditing
                ? currentLang === "ar"
                  ? "إلغاء التعديل"
                  : "Cancel Edit"
                : currentLang === "ar"
                ? "تعديل"
                : "Edit"}
            </button>

            {!selectedUser.isProtected && (
              <button
                type="button"
                disabled={loadingDeleteUser}
                onClick={handleDelete}
                className={theme.dangerButton}
              >
                <Trash2 size={16} />
                {currentLang === "ar" ? "حذف" : "Delete"}
              </button>
            )}
          </div>
        </div>

        <div className={`${theme.card} p-6`}>
          <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-2xl bg-transparent text-blue-500 border-2 border-blue-500 flex items-center justify-center shadow-sm">
                <User className="w-8 h-8" />
              </div>

              <div>
                <h1 className="text-3xl font-extrabold text-[var(--color-text)]">
                  {getUserName(selectedUser)}
                </h1>

                <div className="flex flex-wrap gap-2 mt-3">
                  <Badge text={getRoleName(selectedUser)} tone="neutral" />
                  <Badge
                    text={
                      selectedUser.isActive
                        ? currentLang === "ar"
                          ? "نشط"
                          : "Active"
                        : currentLang === "ar"
                        ? "غير نشط"
                        : "Inactive"
                    }
                    tone={selectedUser.isActive ? "green" : "red"}
                  />

                  <Badge
                    text={
                      selectedUser.isApproved
                        ? currentLang === "ar"
                          ? "مقبول"
                          : "Approved"
                        : currentLang === "ar"
                        ? "غير مقبول"
                        : "Not Approved"
                    }
                    tone={selectedUser.isApproved ? "green" : "orange"}
                  />

                  {selectedUser.isProtected && (
                    <Badge
                      text={
                        currentLang === "ar" ? "محمي" : "Protected Account"
                      }
                      tone="purple"
                    />
                  )}
                </div>

                <div className="flex flex-wrap gap-4 mt-4 text-sm text-[var(--color-text-muted)]">
                  <span className="inline-flex items-center gap-2">
                    <Mail size={15} className="text-cyan-500" />
                    {selectedUser.email || "-"}
                  </span>

                  <span className="inline-flex items-center gap-2">
                    <Phone size={15} className="text-emerald-500" />
                    {selectedUser.mobile || "-"}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 min-w-full xl:min-w-[520px]">
              <MiniInfo
                label={currentLang === "ar" ? "التخصص" : "Category"}
                value={getCategoryName(selectedUser)}
              />

              <MiniInfo
                label={currentLang === "ar" ? "الدرجة العلمية" : "Degree"}
                value={getScientificDegreeName(selectedUser)}
              />

              <MiniInfo
                label={currentLang === "ar" ? "نوع التعاقد" : "Contract"}
                value={getContractingTypeName(selectedUser)}
              />

              <MiniInfo
                label={currentLang === "ar" ? "رقم الطباعة" : "Print Number"}
                value={selectedUser.printNumber || "-"}
              />

              <MiniInfo
                label={currentLang === "ar" ? "آخر دخول" : "Last Login"}
                value={
                  selectedUser.lastLoginAt
                    ? formatDate(selectedUser.lastLoginAt)
                    : "-"
                }
              />

              <MiniInfo
                label={currentLang === "ar" ? "تاريخ الإنشاء" : "Created At"}
                value={
                  selectedUser.createdAt
                    ? formatDate(selectedUser.createdAt)
                    : "-"
                }
              />
            </div>
          </div>
        </div>

        {(updateUserError || deleteUserError || lookupsError) && (
          <ErrorBox
            message={
              updateUserError?.message ||
              deleteUserError?.message ||
              lookupsError ||
              (currentLang === "ar" ? "حدث خطأ" : "Something went wrong")
            }
          />
        )}

        {updateUserMessage && <SuccessBox message={updateUserMessage} />}

        {isEditing && (
          <div className={`${theme.card} p-6`}>
            <h2 className="text-xl font-extrabold text-[var(--color-text)] mb-5">
              {currentLang === "ar"
                ? "تعديل بيانات المستخدم"
                : "Edit User Details"}
            </h2>

            <form
              onSubmit={handleSubmit}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              <FormInput
                label={currentLang === "ar" ? "الاسم العربي" : "Arabic Name"}
                value={formData.fullNameAr}
                onChange={(value) => handleChange("fullNameAr", value)}
                theme={theme}
              />

              <FormInput
                label={
                  currentLang === "ar" ? "الاسم الإنجليزي" : "English Name"
                }
                value={formData.fullNameEn}
                onChange={(value) => handleChange("fullNameEn", value)}
                theme={theme}
              />

              <FormInput
                label={currentLang === "ar" ? "البريد الإلكتروني" : "Email"}
                value={formData.email}
                onChange={(value) => handleChange("email", value)}
                theme={theme}
              />

              <FormInput
                label={currentLang === "ar" ? "رقم الموبايل" : "Mobile"}
                value={formData.mobile}
                onChange={(value) => handleChange("mobile", value)}
                theme={theme}
              />

              <SelectInput
                label={currentLang === "ar" ? "التخصص" : "Category"}
                value={formData.primaryCategoryId}
                onChange={(value) => handleChange("primaryCategoryId", value)}
                options={categories}
                currentLang={currentLang}
                theme={theme}
                loading={lookupsLoading}
                placeholder={currentLang === "ar" ? "اختر" : "Select"}
              />

              <SelectInput
                label={
                  currentLang === "ar"
                    ? "الدرجة العلمية"
                    : "Scientific Degree"
                }
                value={formData.scientificDegreeId}
                onChange={(value) =>
                  handleChange("scientificDegreeId", value)
                }
                options={scientificDegrees}
                currentLang={currentLang}
                theme={theme}
                loading={lookupsLoading}
                placeholder={currentLang === "ar" ? "اختر" : "Select"}
              />

              <SelectInput
                label={
                  currentLang === "ar" ? "نوع التعاقد" : "Contracting Type"
                }
                value={formData.contractingTypeId}
                onChange={(value) => handleChange("contractingTypeId", value)}
                options={contractingTypes}
                currentLang={currentLang}
                theme={theme}
                loading={lookupsLoading}
                placeholder={currentLang === "ar" ? "اختر" : "Select"}
              />

              <FormInput
                label={currentLang === "ar" ? "سبب التعديل" : "Update Reason"}
                value={formData.updateReason}
                onChange={(value) => handleChange("updateReason", value)}
                theme={theme}
              />

              <div className="md:col-span-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className={theme.secondaryButton}
                >
                  {currentLang === "ar" ? "إلغاء" : "Cancel"}
                </button>

                <button
                  type="submit"
                  disabled={loadingUpdateUser}
                  className={`${theme.primaryButton} disabled:opacity-60`}
                >
                  <CheckCircle size={16} />
                  {loadingUpdateUser
                    ? currentLang === "ar"
                      ? "جاري الحفظ..."
                      : "Saving..."
                    : currentLang === "ar"
                    ? "حفظ التعديل"
                    : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
          {statCards.map((card) => (
            <StatCard key={card.title} {...card} />
          ))}
        </div>

        <div className={`${theme.card} p-4`}>
          <div className="flex flex-wrap gap-2">
            <TabButton
              id="profile"
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              icon={User}
              label={currentLang === "ar" ? "الملف الشخصي" : "Profile"}
            />

            <TabButton
              id="work"
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              icon={Stethoscope}
              label={
                currentLang === "ar" ? "العمل والحضور" : "Work & Attendance"
              }
            />

            <TabButton
              id="requests"
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              icon={FileText}
              label={currentLang === "ar" ? "الطلبات" : "Requests"}
            />

            <TabButton
              id="rosters"
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              icon={CalendarDays}
              label={
                currentLang === "ar" ? "جدول الدكتور" : "Doctor Schedule"
              }
            />

            <TabButton
              id="activity"
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              icon={Activity}
              label={currentLang === "ar" ? "النشاط" : "Activity"}
            />

            <TabButton
              id="login"
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              icon={History}
              label={currentLang === "ar" ? "تسجيل الدخول" : "Login History"}
            />
          </div>
        </div>

        {activeTab === "profile" && (
          <ProfileTab
            currentLang={currentLang}
            selectedUser={selectedUser}
            auditInfo={auditInfo}
            activityInfo={activityInfo}
            getCategoryName={getCategoryName}
            getScientificDegreeName={getScientificDegreeName}
            getContractingTypeName={getContractingTypeName}
          />
        )}

        {activeTab === "work" && (
          <WorkTab
            currentLang={currentLang}
            workStats={workStats}
            attendanceSummary={attendanceSummary}
          />
        )}

        {activeTab === "requests" && (
          <RequestsTab
            currentLang={currentLang}
            swapStats={swapStats}
            leaveStats={leaveStats}
          />
        )}

        {activeTab === "rosters" && (
          <DoctorScheduleTab
            currentLang={currentLang}
            theme={theme}
            scheduleFilters={scheduleFilters}
            onFilterChange={handleScheduleFilterChange}
            onApplyFilters={handleApplyScheduleFilters}
            onClearFilters={handleClearScheduleFilters}
            categories={categories}
            departments={departments}
            rosterOptions={rosterOptions}
            lookupsLoading={lookupsLoading}
            doctorRosters={doctorRosters}
            doctorRostersPagination={doctorRostersPagination}
            loading={loadingGetDoctorRosters}
            error={doctorRostersError}
            viewMode={scheduleViewMode}
            setViewMode={setScheduleViewMode}
          />
        )}

        {activeTab === "activity" && (
          <LogsTab
            title={currentLang === "ar" ? "سجل النشاط" : "Activity Log"}
            currentLang={currentLang}
            data={activityLog}
            pagination={activityLogPagination}
            loading={loadingGetUserActivityLog}
            error={userActivityLogError}
          />
        )}

        {activeTab === "login" && (
          <LogsTab
            title={currentLang === "ar" ? "سجل تسجيل الدخول" : "Login History"}
            currentLang={currentLang}
            data={loginHistory}
            pagination={loginHistoryPagination}
            loading={loadingGetUserLoginHistory}
            error={userLoginHistoryError}
          />
        )}
      </div>
    </div>
  )
}

function ProfileTab({
  currentLang,
  selectedUser,
  auditInfo,
  activityInfo,
  getCategoryName,
  getScientificDegreeName,
  getContractingTypeName,
}) {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
      <SectionCard
        title={currentLang === "ar" ? "البيانات الأساسية" : "Basic Information"}
        icon={User}
      >
        <InfoGrid>
          <MiniInfo label="ID" value={selectedUser.id} />
          <MiniInfo
            label={currentLang === "ar" ? "الرقم القومي" : "National ID"}
            value={selectedUser.nationalId || "-"}
          />
          <MiniInfo
            label={currentLang === "ar" ? "البريد مفعل" : "Email Verified"}
            value={selectedUser.isEmailVerified ? "✅" : "❌"}
          />
          <MiniInfo
            label={currentLang === "ar" ? "الموبايل مفعل" : "Mobile Verified"}
            value={selectedUser.isMobileVerified ? "✅" : "❌"}
          />
          <MiniInfo
            label={currentLang === "ar" ? "التخصص" : "Category"}
            value={getCategoryName(selectedUser)}
          />
          <MiniInfo
            label={currentLang === "ar" ? "الدرجة العلمية" : "Degree"}
            value={getScientificDegreeName(selectedUser)}
          />
          <MiniInfo
            label={currentLang === "ar" ? "نوع التعاقد" : "Contracting Type"}
            value={getContractingTypeName(selectedUser)}
          />
          <MiniInfo
            label={currentLang === "ar" ? "اعتمد بواسطة" : "Approved By"}
            value={selectedUser.approvedByName || "-"}
          />
        </InfoGrid>
      </SectionCard>

      <SectionCard
        title={currentLang === "ar" ? "بيانات المراجعة" : "Audit Information"}
        icon={ShieldCheck}
      >
        <InfoGrid>
          <MiniInfo
            label={currentLang === "ar" ? "أنشئ في" : "Created At"}
            value={auditInfo.createdAt ? formatDate(auditInfo.createdAt) : "-"}
          />
          <MiniInfo
            label={currentLang === "ar" ? "أنشئ بواسطة" : "Created By"}
            value={auditInfo.createdByName || "-"}
          />
          <MiniInfo
            label={currentLang === "ar" ? "آخر تحديث" : "Updated At"}
            value={auditInfo.updatedAt ? formatDate(auditInfo.updatedAt) : "-"}
          />
          <MiniInfo
            label={currentLang === "ar" ? "حدث بواسطة" : "Updated By"}
            value={auditInfo.updatedByName || "-"}
          />
          <MiniInfo
            label={currentLang === "ar" ? "تاريخ القبول" : "Accepted At"}
            value={auditInfo.acceptedAt ? formatDate(auditInfo.acceptedAt) : "-"}
          />
          <MiniInfo
            label={currentLang === "ar" ? "قبل بواسطة" : "Accepted By"}
            value={auditInfo.acceptedByName || "-"}
          />
          <MiniInfo
            label={currentLang === "ar" ? "تاريخ الرفض" : "Rejected At"}
            value={auditInfo.rejectedAt ? formatDate(auditInfo.rejectedAt) : "-"}
          />
          <MiniInfo
            label={currentLang === "ar" ? "سبب الرفض" : "Rejection Reason"}
            value={auditInfo.rejectionReason || "-"}
          />
        </InfoGrid>
      </SectionCard>

      <SectionCard
        title={currentLang === "ar" ? "معلومات النشاط" : "Activity Info"}
        icon={Activity}
      >
        <InfoGrid>
          <MiniInfo
            label={currentLang === "ar" ? "عدد مرات الدخول" : "Login Count"}
            value={activityInfo.totalLoginCount ?? 0}
          />
          <MiniInfo
            label={currentLang === "ar" ? "وقت النشاط" : "Active Time"}
            value={activityInfo.totalActiveTime || "-"}
          />
          <MiniInfo
            label={currentLang === "ar" ? "آخر دخول" : "Last Login"}
            value={
              activityInfo.lastLoginAt
                ? formatDate(activityInfo.lastLoginAt)
                : "-"
            }
          />
          <MiniInfo
            label={currentLang === "ar" ? "آخر نشاط" : "Last Activity"}
            value={
              activityInfo.lastActivityAt
                ? formatDate(activityInfo.lastActivityAt)
                : "-"
            }
          />
          <MiniInfo
            label={currentLang === "ar" ? "رموز التحقق" : "Verification Codes"}
            value={activityInfo.totalVerificationCodes ?? 0}
          />
          <MiniInfo
            label={
              currentLang === "ar"
                ? "Refresh Tokens فعالة"
                : "Active Refresh Tokens"
            }
            value={activityInfo.activeRefreshTokens ?? 0}
          />
        </InfoGrid>
      </SectionCard>
    </div>
  )
}

function WorkTab({ currentLang, workStats, attendanceSummary }) {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
      <SectionCard
        title={currentLang === "ar" ? "إحصائيات العمل" : "Work Statistics"}
        icon={Stethoscope}
      >
        <InfoGrid>
          <MiniInfo
            label={
              currentLang === "ar" ? "الشفتات المجدولة" : "Scheduled Shifts"
            }
            value={workStats.totalScheduledShifts ?? 0}
          />
          <MiniInfo
            label={
              currentLang === "ar" ? "الشفتات المكتملة" : "Completed Shifts"
            }
            value={workStats.totalCompletedShifts ?? 0}
          />
          <MiniInfo
            label={
              currentLang === "ar" ? "إجمالي ساعات العمل" : "Total Work Hours"
            }
            value={workStats.totalWorkHours ?? 0}
          />
          <MiniInfo
            label={
              currentLang === "ar" ? "شفتات الشهر الحالي" : "Current Month Shifts"
            }
            value={workStats.currentMonthShifts ?? 0}
          />
          <MiniInfo
            label={
              currentLang === "ar" ? "ساعات الشهر الحالي" : "Current Month Hours"
            }
            value={workStats.currentMonthHours ?? 0}
          />
          <MiniInfo
            label={currentLang === "ar" ? "الشفتات القادمة" : "Upcoming Shifts"}
            value={workStats.currentMonthUpcoming ?? 0}
          />
        </InfoGrid>
      </SectionCard>

      <SectionCard
        title={currentLang === "ar" ? "ملخص الحضور" : "Attendance Summary"}
        icon={UserCheck}
      >
        <InfoGrid>
          <MiniInfo
            label={currentLang === "ar" ? "أيام الحضور" : "Present Days"}
            value={attendanceSummary.totalDaysPresent ?? 0}
          />
          <MiniInfo
            label={currentLang === "ar" ? "أيام الغياب" : "Absent Days"}
            value={attendanceSummary.totalDaysAbsent ?? 0}
          />
          <MiniInfo
            label={currentLang === "ar" ? "مرات التأخير" : "Late Arrivals"}
            value={attendanceSummary.totalLateArrivals ?? 0}
          />
          <MiniInfo
            label={currentLang === "ar" ? "انصراف مبكر" : "Early Departures"}
            value={attendanceSummary.totalEarlyDepartures ?? 0}
          />
          <MiniInfo
            label={currentLang === "ar" ? "نسبة الحضور" : "Attendance Rate"}
            value={`${attendanceSummary.attendanceRate ?? 0}%`}
          />
        </InfoGrid>
      </SectionCard>
    </div>
  )
}

function RequestsTab({ currentLang, swapStats, leaveStats }) {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
      <SectionCard
        title={currentLang === "ar" ? "طلبات التبديل" : "Swap Requests"}
        icon={RefreshCw}
      >
        <InfoGrid>
          <MiniInfo
            label={currentLang === "ar" ? "مرسلة" : "Sent"}
            value={swapStats.totalSent ?? 0}
          />
          <MiniInfo
            label={currentLang === "ar" ? "مستلمة" : "Received"}
            value={swapStats.totalReceived ?? 0}
          />
          <MiniInfo
            label={currentLang === "ar" ? "مرسلة مقبولة" : "Sent Approved"}
            value={swapStats.sentApproved ?? 0}
          />
          <MiniInfo
            label={currentLang === "ar" ? "مرسلة مرفوضة" : "Sent Rejected"}
            value={swapStats.sentRejected ?? 0}
          />
          <MiniInfo
            label={currentLang === "ar" ? "معلقة" : "Pending"}
            value={swapStats.sentPending ?? 0}
          />
          <MiniInfo
            label={
              currentLang === "ar" ? "نسبة القبول كمرسل" : "Approval Rate Sender"
            }
            value={`${swapStats.approvalRateAsSender ?? 0}%`}
          />
        </InfoGrid>
      </SectionCard>

      <SectionCard
        title={currentLang === "ar" ? "طلبات الإجازة" : "Leave Requests"}
        icon={FileText}
      >
        <InfoGrid>
          <MiniInfo
            label={currentLang === "ar" ? "إجمالي الإجازات" : "Total Leaves"}
            value={leaveStats.totalLeaves ?? 0}
          />
          <MiniInfo
            label={currentLang === "ar" ? "مقبولة" : "Approved"}
            value={leaveStats.approvedLeaves ?? 0}
          />
          <MiniInfo
            label={currentLang === "ar" ? "معلقة" : "Pending"}
            value={leaveStats.pendingLeaves ?? 0}
          />
          <MiniInfo
            label={currentLang === "ar" ? "مرفوضة" : "Rejected"}
            value={leaveStats.rejectedLeaves ?? 0}
          />
          <MiniInfo
            label={currentLang === "ar" ? "ملغاة" : "Cancelled"}
            value={leaveStats.cancelledLeaves ?? 0}
          />
          <MiniInfo
            label={currentLang === "ar" ? "أيام الإجازة" : "Leave Days"}
            value={leaveStats.totalLeaveDays ?? 0}
          />
        </InfoGrid>
      </SectionCard>
    </div>
  )
}

function DoctorScheduleTab({
  currentLang,
  theme,
  scheduleFilters,
  onFilterChange,
  onApplyFilters,
  onClearFilters,
  categories,
  departments,
  rosterOptions,
  lookupsLoading,
  doctorRosters,
  doctorRostersPagination,
  loading,
  error,
  viewMode,
  setViewMode,
}) {
  const selectedRoster = useMemo(() => {
    if (!Array.isArray(doctorRosters) || doctorRosters.length === 0) return null

    if (scheduleFilters.rosterId) {
      return (
        doctorRosters.find(
          (item) => String(item.rosterId) === String(scheduleFilters.rosterId)
        ) || doctorRosters[0]
      )
    }

    return doctorRosters[0]
  }, [doctorRosters, scheduleFilters.rosterId])

  const allShifts = selectedRoster?.shifts || []

  const summaryCards = selectedRoster
    ? [
        {
          title: currentLang === "ar" ? "إجمالي الشفتات" : "Total Shifts",
          value: selectedRoster.totalShiftsInRoster ?? 0,
          icon: CalendarDays,
          tone: "blue",
        },
        {
          title: currentLang === "ar" ? "شفتات قادمة" : "Future Shifts",
          value: selectedRoster.futureShiftsCount ?? 0,
          icon: Clock,
          tone: "purple",
        },
        {
          title: currentLang === "ar" ? "حضور" : "Attended",
          value: selectedRoster.attendedShiftsCount ?? 0,
          icon: UserCheck,
          tone: "green",
        },
        {
          title: currentLang === "ar" ? "غياب" : "Absent",
          value: selectedRoster.absentShiftsCount ?? 0,
          icon: XCircle,
          tone: "red",
        },
        {
          title: currentLang === "ar" ? "نسبة الحضور" : "Attendance Rate",
          value: `${selectedRoster.attendanceRate ?? 0}%`,
          icon: BarChart3,
          tone: "orange",
        },
        {
          title: currentLang === "ar" ? "الساعات المجدولة" : "Scheduled Hours",
          value: selectedRoster.totalScheduledHours ?? 0,
          icon: Clock,
          tone: "yellow",
        },
      ]
    : []

  return (
    <div className="space-y-5">
      <SectionCard
        title={
          currentLang === "ar"
            ? "جدول الدكتور داخل الروستر"
            : "Doctor Schedule Inside Roster"
        }
        icon={CalendarDays}
      >
        <form
          onSubmit={onApplyFilters}
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4"
        >
          <SelectInput
            label={currentLang === "ar" ? "التخصص" : "Category"}
            value={scheduleFilters.categoryId}
            onChange={(value) => onFilterChange("categoryId", value)}
            options={categories}
            currentLang={currentLang}
            theme={theme}
            loading={lookupsLoading}
            placeholder={currentLang === "ar" ? "الكل" : "All"}
          />

          <SelectInput
            label={currentLang === "ar" ? "الروستر" : "Roster"}
            value={scheduleFilters.rosterId}
            onChange={(value) => onFilterChange("rosterId", value)}
            options={rosterOptions.map((roster) => ({
              id: roster.id,
              nameArabic: roster.title,
              nameEnglish: roster.title,
            }))}
            currentLang={currentLang}
            theme={theme}
            loading={lookupsLoading}
            placeholder={currentLang === "ar" ? "الكل" : "All"}
          />

          <SelectInput
            label={currentLang === "ar" ? "القسم" : "Department"}
            value={scheduleFilters.departmentId}
            onChange={(value) => onFilterChange("departmentId", value)}
            options={departments}
            currentLang={currentLang}
            theme={theme}
            loading={lookupsLoading}
            placeholder={currentLang === "ar" ? "الكل" : "All"}
          />

          <SelectInput
            label={currentLang === "ar" ? "حالة الحضور" : "Attendance Status"}
            value={scheduleFilters.attendanceStatusFilter}
            onChange={(value) => onFilterChange("attendanceStatusFilter", value)}
            options={[
              {
                id: "قادم",
                nameArabic: "قادم",
                nameEnglish: "Upcoming",
              },
              {
                id: "حاضر",
                nameArabic: "حاضر",
                nameEnglish: "Present",
              },
              {
                id: "غائب",
                nameArabic: "غائب",
                nameEnglish: "Absent",
              },
              {
                id: "متأخر",
                nameArabic: "متأخر",
                nameEnglish: "Late",
              },
            ]}
            currentLang={currentLang}
            theme={theme}
            loading={false}
            placeholder={currentLang === "ar" ? "الكل" : "All"}
          />

          <FormInput
            type="date"
            label={currentLang === "ar" ? "من تاريخ" : "Date From"}
            value={scheduleFilters.dateFrom}
            onChange={(value) => onFilterChange("dateFrom", value)}
            theme={theme}
          />

          <FormInput
            type="date"
            label={currentLang === "ar" ? "إلى تاريخ" : "Date To"}
            value={scheduleFilters.dateTo}
            onChange={(value) => onFilterChange("dateTo", value)}
            theme={theme}
          />

          <div className="xl:col-span-4 flex justify-between items-center gap-3 flex-wrap">
            <div className="inline-flex rounded-xl border border-[var(--color-border)] overflow-hidden bg-[var(--color-surface)] shadow-[var(--shadow-xs)]">
              <button
                type="button"
                onClick={() => setViewMode("calendar")}
                className={`px-4 py-2 text-sm font-bold transition-colors ${
                  viewMode === "calendar"
                    ? "bg-emerald-600 text-white"
                    : "bg-[var(--color-surface)] text-[var(--color-text-muted)] hover:bg-emerald-600 hover:text-white"
                }`}
              >
                Calendar View
              </button>

              <button
                type="button"
                onClick={() => setViewMode("rows")}
                className={`px-4 py-2 text-sm font-bold transition-colors ${
                  viewMode === "rows"
                    ? "bg-emerald-600 text-white"
                    : "bg-[var(--color-surface)] text-[var(--color-text-muted)] hover:bg-emerald-600 hover:text-white"
                }`}
              >
                Rows View
              </button>
            </div>

            <div className="flex gap-3 flex-wrap">
              <button
                type="button"
                onClick={onClearFilters}
                className={theme.secondaryButton}
              >
                {currentLang === "ar" ? "مسح الفلاتر" : "Clear Filters"}
              </button>

              <button type="submit" className={theme.primaryButton}>
                <Search size={16} />
                {currentLang === "ar" ? "تطبيق" : "Apply"}
              </button>
            </div>
          </div>
        </form>
      </SectionCard>

      {loading ? (
        <InlineLoader
          text={
            currentLang === "ar"
              ? "جاري تحميل جدول الدكتور داخل الروستر..."
              : "Loading doctor roster schedule..."
          }
        />
      ) : error ? (
        <ErrorBox
          title={currentLang === "ar" ? "حدث خطأ" : "Error"}
          message={error?.message}
        />
      ) : !selectedRoster ? (
        <EmptyState
          title={currentLang === "ar" ? "لا يوجد جدول" : "No Schedule"}
          description={
            currentLang === "ar"
              ? "اختر روستر لعرض جدول الدكتور داخله."
              : "Select a roster to view the doctor's schedule inside it."
          }
        />
      ) : (
        <>
          <SectionCard
            title={
              currentLang === "ar"
                ? selectedRoster.rosterTitle || "تفاصيل الروستر"
                : selectedRoster.rosterTitle || "Roster Details"
            }
            icon={CalendarDays}
          >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 mb-5">
              <MiniInfo
                label={currentLang === "ar" ? "التخصص" : "Category"}
                value={
                  currentLang === "ar"
                    ? selectedRoster.categoryNameAr
                    : selectedRoster.categoryNameEn
                }
              />

              <MiniInfo
                label={currentLang === "ar" ? "الأقسام" : "Departments"}
                value={
                  currentLang === "ar"
                    ? selectedRoster.departmentNameAr
                    : selectedRoster.departmentNameEn
                }
              />

              <MiniInfo
                label={currentLang === "ar" ? "الفترة" : "Period"}
                value={`${selectedRoster.rosterStartDate || "-"} → ${
                  selectedRoster.rosterEndDate || "-"
                }`}
              />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
              {summaryCards.map((card) => (
                <StatCard key={card.title} {...card} />
              ))}
            </div>
          </SectionCard>

          {viewMode === "calendar" ? (
            <DoctorCalendarView
              roster={selectedRoster}
              shifts={allShifts}
              currentLang={currentLang}
            />
          ) : (
            <DoctorRowsView shifts={allShifts} currentLang={currentLang} />
          )}

          {doctorRostersPagination && (
            <p className="text-sm text-[var(--color-text-muted)] text-center">
              {currentLang === "ar"
                ? `صفحة ${doctorRostersPagination.page} من ${doctorRostersPagination.totalPages}`
                : `Page ${doctorRostersPagination.page} of ${doctorRostersPagination.totalPages}`}
            </p>
          )}
        </>
      )}
    </div>
  )
}

function DoctorCalendarView({ roster, shifts, currentLang }) {
  const cells = buildCalendarCells(roster, shifts)

  return (
    <SectionCard
      title={currentLang === "ar" ? "عرض التقويم" : "Calendar View"}
      icon={CalendarDays}
    >
      <div className="grid grid-cols-7 gap-2 mb-3">
        {getWeekDays(currentLang).map((day) => (
          <div
            key={day}
            className="text-center text-xs font-extrabold text-[var(--color-text-muted)] p-2"
          >
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {cells.map((cell, index) => (
          <div
            key={cell.date || index}
            className={`min-h-[145px] rounded-2xl border p-2 ${
              cell.isEmpty
                ? "border-transparent bg-transparent"
                : "border-[var(--color-border)] bg-[var(--color-bg-soft)]"
            }`}
          >
            {!cell.isEmpty && (
              <>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-xs font-extrabold text-[var(--color-text-muted)]">
                    {cell.dayNumber}
                  </span>

                  <span className="text-[10px] font-bold text-[var(--color-text-muted)]">
                    {currentLang === "ar" ? cell.dayNameAr : cell.dayNameEn}
                  </span>
                </div>

                {cell.shifts.length === 0 ? (
                  <p className="text-xs text-[var(--color-text-muted)]">
                    {currentLang === "ar" ? "لا يوجد شفت" : "No shift"}
                  </p>
                ) : (
                  <div className="space-y-2">
                    {cell.shifts.map((shift) => (
                      <ShiftMiniCard
                        key={shift.scheduleId}
                        shift={shift}
                        currentLang={currentLang}
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        ))}
      </div>
    </SectionCard>
  )
}

function DoctorRowsView({ shifts, currentLang }) {
  return (
    <SectionCard
      title={currentLang === "ar" ? "عرض الصفوف" : "Rows View"}
      icon={FileText}
    >
      {shifts.length === 0 ? (
        <EmptyState
          title={currentLang === "ar" ? "لا توجد شفتات" : "No Shifts"}
          description={
            currentLang === "ar"
              ? "لا توجد شفتات مطابقة للفلاتر الحالية."
              : "No shifts match the current filters."
          }
        />
      ) : (
        <div className="space-y-3">
          {shifts.map((shift) => (
            <ShiftRowCard
              key={shift.scheduleId}
              shift={shift}
              currentLang={currentLang}
            />
          ))}
        </div>
      )}
    </SectionCard>
  )
}

function ShiftRowCard({ shift, currentLang }) {
  return (
    <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-soft)] p-4">
      <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
        <div>
          <h3 className="font-extrabold text-[var(--color-text)]">
            {currentLang === "ar" ? shift.dayNameAr : shift.dayNameEn} —{" "}
            {shift.shiftDate}
          </h3>

          <p className="text-sm text-[var(--color-text-muted)] mt-1">
            {currentLang === "ar"
              ? shift.shiftTypeNameAr
              : shift.shiftTypeNameEn}
          </p>
        </div>

        <AttendanceBadge status={shift.attendanceStatus} />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-7 gap-3">
        <MiniInfo
          label={currentLang === "ar" ? "القسم" : "Department"}
          value={
            currentLang === "ar"
              ? shift.departmentNameAr
              : shift.departmentNameEn
          }
        />

        <MiniInfo
          label={currentLang === "ar" ? "من" : "Start"}
          value={shift.startTime || "-"}
        />

        <MiniInfo
          label={currentLang === "ar" ? "إلى" : "End"}
          value={shift.endTime || "-"}
        />

        <MiniInfo
          label={currentLang === "ar" ? "الساعات" : "Hours"}
          value={shift.shiftHours ?? 0}
        />

        <MiniInfo
          label={currentLang === "ar" ? "دخول" : "Time In"}
          value={shift.timeIn || "-"}
        />

        <MiniInfo
          label={currentLang === "ar" ? "خروج" : "Time Out"}
          value={shift.timeOut || "-"}
        />

        <MiniInfo
          label={currentLang === "ar" ? "تأخير" : "Late"}
          value={shift.lateMinutes ?? 0}
        />
      </div>
    </div>
  )
}

function ShiftMiniCard({ shift, currentLang }) {
  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-2">
      <div className="flex items-center justify-between gap-2 mb-1">
        <p className="text-[11px] font-extrabold text-[var(--color-text)] line-clamp-1">
          {currentLang === "ar" ? shift.shiftTypeNameAr : shift.shiftTypeNameEn}
        </p>

        <AttendanceDot status={shift.attendanceStatus} />
      </div>

      <p className="text-[10px] font-bold text-[var(--color-text-muted)]">
        {shift.startTime} - {shift.endTime}
      </p>

      <p className="text-[10px] text-[var(--color-text-muted)] mt-1 line-clamp-1">
        {currentLang === "ar" ? shift.departmentNameAr : shift.departmentNameEn}
      </p>
    </div>
  )
}

function LogsTab({ title, currentLang, data, pagination, loading, error }) {
  return (
    <SectionCard title={title} icon={History}>
      {loading ? (
        <InlineLoader
          text={
            currentLang === "ar" ? "جاري تحميل السجل..." : "Loading logs..."
          }
        />
      ) : error ? (
        <ErrorBox message={error?.message} />
      ) : data.length === 0 ? (
        <EmptyState
          title={currentLang === "ar" ? "لا يوجد سجل" : "No logs"}
          description={
            currentLang === "ar"
              ? "لا توجد بيانات سجل للعرض."
              : "No log data available."
          }
        />
      ) : (
        <div className="space-y-3">
          {data.map((item, index) => (
            <div
              key={item.id || index}
              className="p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-soft)]"
            >
              <p className="font-bold text-[var(--color-text)]">
                {item.action ||
                  item.activityType ||
                  item.eventType ||
                  item.description ||
                  item.ipAddress ||
                  "-"}
              </p>

              <p className="text-sm text-[var(--color-text-muted)] mt-1">
                {item.createdAt || item.timestamp || item.loginAt || item.date
                  ? formatDate(
                      item.createdAt ||
                        item.timestamp ||
                        item.loginAt ||
                        item.date
                    )
                  : "-"}
              </p>

              {item.description && (
                <p className="text-sm text-[var(--color-text-muted)] mt-2">
                  {item.description}
                </p>
              )}
            </div>
          ))}

          {pagination && (
            <div className="pt-3 border-t border-[var(--color-border)] text-sm text-[var(--color-text-muted)]">
              {currentLang === "ar"
                ? `صفحة ${pagination.page} من ${pagination.totalPages}`
                : `Page ${pagination.page} of ${pagination.totalPages}`}
            </div>
          )}
        </div>
      )}
    </SectionCard>
  )
}

function SelectInput({
  label,
  value,
  onChange,
  options,
  currentLang,
  theme,
  loading,
  placeholder,
}) {
  return (
    <div>
      <label className="text-xs font-bold text-[var(--color-text-muted)] block mb-1">
        {label}
      </label>

      <select
        value={value || ""}
        disabled={loading}
        onChange={(event) => onChange(event.target.value)}
        className={theme.input}
      >
        <option value="">
          {loading
            ? currentLang === "ar"
              ? "جاري التحميل..."
              : "Loading..."
            : placeholder || (currentLang === "ar" ? "اختر" : "Select")}
        </option>

        {options.map((item) => (
          <option key={item.id} value={String(item.id)}>
            {currentLang === "ar"
              ? item.nameArabic ||
                item.nameAr ||
                item.nameEnglish ||
                item.nameEn ||
                item.title
              : item.nameEnglish ||
                item.nameEn ||
                item.nameArabic ||
                item.nameAr ||
                item.title}
          </option>
        ))}
      </select>
    </div>
  )
}

function SectionCard({ title, icon: Icon, children, tone = "blue" }) {
  const toneClass =
    tone === "green"
      ? "bg-transparent text-emerald-500 border-emerald-500 dark:bg-transparent dark:text-emerald-500 dark:border-emerald-500"
      : tone === "red"
      ? "bg-transparent text-red-500 border-red-500 dark:bg-transparent dark:text-red-500 dark:border-red-500"
      : tone === "orange"
      ? "bg-transparent text-orange-500 border-orange-500 dark:bg-transparent dark:text-orange-500 dark:border-orange-500"
      : tone === "yellow"
      ? "bg-transparent text-amber-500 border-amber-500 dark:bg-transparent dark:text-amber-500 dark:border-amber-500"
      : tone === "purple"
      ? "bg-transparent text-violet-500 border-violet-500 dark:bg-transparent dark:text-violet-500 dark:border-violet-500"
      : tone === "neutral"
      ? "bg-transparent text-slate-500 border-slate-500 dark:bg-transparent dark:text-slate-500 dark:border-slate-500"
      : "bg-transparent text-blue-500 border-blue-500 dark:bg-transparent dark:text-blue-500 dark:border-blue-500"

  return (
    <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-sm)] p-5">
      <h2 className="text-xl font-extrabold text-[var(--color-text)] mb-5 flex items-center gap-2">
        <span
          className={`w-9 h-9 rounded-xl border flex items-center justify-center shadow-sm ${toneClass}`}
        >
          <Icon className="w-5 h-5" />
        </span>
        {title}
      </h2>

      {children}
    </div>
  )
}

function InfoGrid({ children }) {
  return <div className="grid grid-cols-1 md:grid-cols-2 gap-3">{children}</div>
}

function FormInput({ label, value, onChange, theme, type = "text" }) {
  return (
    <div>
      <label className="text-xs font-bold text-[var(--color-text-muted)] block mb-1">
        {label}
      </label>
      <input
        type={type}
        value={value || ""}
        onChange={(event) => onChange(event.target.value)}
        className={theme.input}
      />
    </div>
  )
}

function StatCard({ title, value, icon: Icon, tone = "blue" }) {
  const toneMap = {
    blue: {
      bg: "bg-transparent",
      text: "text-blue-500",
      border: "border-blue-500",
    },
    green: {
      bg: "bg-transparent",
      text: "text-emerald-500",
      border: "border-emerald-500",
    },
    red: {
      bg: "bg-transparent",
      text: "text-red-500",
      border: "border-red-500",
    },
    orange: {
      bg: "bg-transparent",
      text: "text-orange-500",
      border: "border-orange-500",
    },
    purple: {
      bg: "bg-transparent",
      text: "text-violet-500",
      border: "border-violet-500",
    },
    yellow: {
      bg: "bg-transparent",
      text: "text-amber-500",
      border: "border-amber-500",
    },
    neutral: {
      bg: "bg-transparent",
      text: "text-slate-500",
      border: "border-slate-500",
    },
  }

  const toneStyle = toneMap[tone] || toneMap.blue

  return (
    <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-[var(--shadow-sm)]">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-[var(--color-text-muted)]">
            {title}
          </p>

          <p className="mt-2 text-2xl font-extrabold text-[var(--color-text)]">
            {value ?? 0}
          </p>
        </div>

        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center border-2 shadow-sm ${toneStyle.bg} ${toneStyle.text} ${toneStyle.border}`}
        >
          <Icon size={22} />
        </div>
      </div>
    </div>
  )
}

function MiniInfo({ label, value }) {
  return (
    <div className="p-4 rounded-xl bg-[var(--color-surface-muted)] border border-[var(--color-border)]">
      <p className="text-xs font-bold text-[var(--color-text-muted)] mb-2">
        {label}
      </p>

      <p className="text-sm md:text-base font-extrabold text-[var(--color-text)] break-words">
        {value ?? "-"}
      </p>
    </div>
  )
}

function Badge({ text, tone = "blue" }) {
  const toneMap = {
    blue: "bg-transparent text-blue-500 border-blue-500",
    green: "bg-transparent text-emerald-500 border-emerald-500",
    red: "bg-transparent text-red-500 border-red-500",
    orange: "bg-transparent text-orange-500 border-orange-500",
    purple: "bg-transparent text-violet-500 border-violet-500",
    neutral: "bg-transparent text-slate-500 border-slate-500",
  }

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border-2 shadow-sm ${
        toneMap[tone] || toneMap.neutral
      }`}
    >
      {text || "-"}
    </span>
  )
}

function TabButton({ id, activeTab, setActiveTab, icon: Icon, label, count }) {
  const isActive = activeTab === id

  return (
    <button
      type="button"
      onClick={() => setActiveTab(id)}
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold border transition-colors ${
        isActive
          ? "bg-[var(--color-success)] text-white border-[var(--color-success)]"
          : "bg-[var(--color-surface)] text-[var(--color-text)] border-[var(--color-border-strong)] hover:bg-[var(--color-success)] hover:text-white hover:border-[var(--color-success)] active:bg-[var(--color-success-hover)]"
      }`}
    >
      <Icon size={16} />
      {label}
      {count !== undefined && (
        <span
          className={`px-2 py-0.5 rounded-full text-[11px] border ${
            isActive
              ? "bg-white/20 text-white border-white/20"
              : "bg-[var(--color-surface-muted)] text-[var(--color-text-muted)] border-[var(--color-border)]"
          }`}
        >
          {count}
        </span>
      )}
    </button>
  )
}

function InlineLoader({ text }) {
  return (
    <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-8 text-center">
      <div className="w-9 h-9 mx-auto mb-4 rounded-full border-4 border-[var(--color-border)] border-t-[var(--color-primary)] animate-spin" />
      <p className="text-sm font-bold text-[var(--color-text-muted)]">{text}</p>
    </div>
  )
}

function EmptyState({ title, description }) {
  return (
    <div className="p-8 text-center rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)]">
      <User className="w-12 h-12 mx-auto mb-3 text-slate-500" />
      <h3 className="text-lg font-extrabold text-[var(--color-text)]">
        {title}
      </h3>
      <p className="text-sm text-[var(--color-text-muted)] mt-2">
        {description}
      </p>
    </div>
  )
}

function ErrorBox({ title, message }) {
  return (
    <div className="p-5 rounded-2xl bg-transparent text-red-500 border-2 border-red-500 shadow-sm">
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 mt-0.5 text-red-500" />

        <div>
          {title && <h3 className="font-extrabold mb-1">{title}</h3>}
          <p className="text-sm font-bold">{message || "Error"}</p>
        </div>
      </div>
    </div>
  )
}

function SuccessBox({ message }) {
  return (
    <div className="p-5 rounded-2xl bg-transparent text-emerald-500 border-2 border-emerald-500 shadow-sm">
      <div className="flex items-start gap-3">
        <CheckCircle className="w-5 h-5 mt-0.5 text-emerald-500" />
        <p className="text-sm font-bold">{message}</p>
      </div>
    </div>
  )
}

function AttendanceBadge({ status }) {
  const normalized = String(status || "").toLowerCase()

  let cls = "bg-transparent text-blue-500 border-blue-500"

  if (normalized.includes("حاضر") || normalized.includes("present")) {
    cls = "bg-transparent text-emerald-500 border-emerald-500"
  }

  if (normalized.includes("غائب") || normalized.includes("absent")) {
    cls = "bg-transparent text-red-500 border-red-500"
  }

  if (normalized.includes("متأخر") || normalized.includes("late")) {
    cls = "bg-transparent text-amber-500 border-amber-500"
  }

  return (
    <span className={`px-3 py-1 rounded-full border-2 text-xs font-bold shadow-sm ${cls}`}>
      {status || "-"}
    </span>
  )
}

function AttendanceDot({ status }) {
  const normalized = String(status || "").toLowerCase()

  let cls = "bg-blue-500"

  if (normalized.includes("حاضر") || normalized.includes("present")) {
    cls = "bg-emerald-500"
  }

  if (normalized.includes("غائب") || normalized.includes("absent")) {
    cls = "bg-red-500"
  }

  if (normalized.includes("متأخر") || normalized.includes("late")) {
    cls = "bg-amber-500"
  }

  return <span className={`w-2.5 h-2.5 rounded-full ${cls}`} />
}

function buildCalendarCells(roster, shifts) {
  const startDate = roster?.rosterStartDate
  const endDate = roster?.rosterEndDate

  if (!startDate || !endDate) return []

  const shiftMap = shifts.reduce((acc, shift) => {
    const key = shift.shiftDate

    if (!acc[key]) acc[key] = []
    acc[key].push(shift)

    return acc
  }, {})

  const start = new Date(`${startDate}T00:00:00`)
  const end = new Date(`${endDate}T00:00:00`)

  const cells = []
  const firstDayIndex = start.getDay()

  for (let i = 0; i < firstDayIndex; i += 1) {
    cells.push({
      isEmpty: true,
    })
  }

  const cursor = new Date(start)

  while (cursor <= end) {
    const dateKey = cursor.toISOString().split("T")[0]
    const dayNumber = cursor.getDate()

    cells.push({
      isEmpty: false,
      date: dateKey,
      dayNumber,
      dayNameAr: getArabicDayName(cursor.getDay()),
      dayNameEn: getEnglishDayName(cursor.getDay()),
      shifts: shiftMap[dateKey] || [],
    })

    cursor.setDate(cursor.getDate() + 1)
  }

  while (cells.length % 7 !== 0) {
    cells.push({
      isEmpty: true,
    })
  }

  return cells
}

function getWeekDays(currentLang) {
  if (currentLang === "ar") {
    return [
      "الأحد",
      "الإثنين",
      "الثلاثاء",
      "الأربعاء",
      "الخميس",
      "الجمعة",
      "السبت",
    ]
  }

  return ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
}

function getArabicDayName(index) {
  return [
    "الأحد",
    "الإثنين",
    "الثلاثاء",
    "الأربعاء",
    "الخميس",
    "الجمعة",
    "السبت",
  ][index]
}

function getEnglishDayName(index) {
  return [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ][index]
}

export default SpecificUser