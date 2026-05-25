import React, { useEffect, useMemo, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useParams, useNavigate, Link } from "react-router-dom"
import { useTranslation } from "react-i18next"
import Swal from "sweetalert2"
import { toast } from "react-toastify"
import {
  ArrowLeft,
  ArrowRight,
  Award,
  BarChart3,
  Building,
  Calendar,
  Check,
  CheckCircle,
  Clock,
  Edit,
  ExternalLink,
  Eye,
  FileText,
  Filter,
  LinkIcon,
  Mail,
  MapPin,
  Phone,
  RefreshCw,
  Stethoscope,
  Trash2,
  UserCheck,
  Users,
  X,
  XCircle,
} from "lucide-react"

import {
  getCategoryById,
  getCategoryDetails,
  getCategoryStatisticsForDeptHead,
  getCategoryDoctors,
  getCategoryPendingRequests,
  approveDoctorRequest,
  rejectDoctorRequest,
  getCategoryHeads,
} from "../../../state/act/actCategory"

import {
  clearSingleCategory,
  clearSingleCategoryError,
  clearCategoryPendingRequests,
  clearCategoryPendingRequestsError,
  clearApprovalSuccess,
  clearApprovalError,
  setCategoryPendingRequestsStatusFilter,
  setCategoryPendingRequestsCurrentPage,
  setCategoryPendingRequestsPageSize,
  setCategoryDoctorsActiveFilter,
  setCategoryDoctorsCurrentPage,
  setCategoryDoctorsPageSize,
  clearCategoryDoctors,
} from "../../../state/slices/category"

import {
  availabelDepartmentsForCategory,
  getDepartmentByCategory,
  linkDepartmentToCategory,
  unlinkDepartmentFromCategory,
} from "../../../state/act/actDepartment"

import { getRosterByCategory } from "../../../state/act/actRosterManagement"
import LoadingGetData from "../../../components/LoadingGetData"
import CategoryHeadsManagement from "../../../components/categoryHeads"
import { formatDate } from "../../../utils/formtDate"
import { getPageTheme } from "../../../utils/themeClasses"

const SpecificCategory = () => {
  const { catId: id } = useParams()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { t, i18n } = useTranslation()
  const theme = getPageTheme()

  const [activeTab, setActiveTab] = useState("overview")
  const [depClickId, setDepClickId] = useState(null)
  const [unlinkDepId, setUnlinkDepId] = useState(null)

  const currentLang = i18n.language || "ar"
  const isRTL = currentLang === "ar"

  const { mymode } = useSelector((state) => state.mode)
  const isDark = mymode === "dark"

  const { loginRoleResponseDto } = useSelector((state) => state.auth)

  const {
    selectedCategory,
    categoryDetails,
    categoryStatistics,
    loadingGetSingleCategory,
    loadingGetCategoryDetails,
    loadingGetCategoryStatistics,
    singleCategoryError,
    categoryDetailsError,
    categoryStatisticsError,

    categoryDoctors,
    categoryDoctorsPagination,
    categoryDoctorsFilters,
    loadingGetCategoryDoctors,
    categoryDoctorsError,

    categoryPendingRequests,
    categoryPendingRequestsPagination,
    categoryPendingRequestsError,
    categoryPendingRequestsFilters,
    loadingGetCategoryPendingRequests,

    loadingApproveRequest,
    loadingRejectRequest,
    approvalError,
    approvalSuccess,
    approvalMessage,
  } = useSelector((state) => state.category)

  const {
    departments,
    departmentsByCategory,
    loadingGetDepartmentsByCategory,
    loadingLinkDepartmentToCategory,
    loadingUnlinkDepartment,
  } = useSelector((state) => state.department)

  const { rosterList, loading } = useSelector((state) => state.rosterManagement)

  const canManageCategory =
    loginRoleResponseDto?.roleNameEn === "System Administrator" ||
    loginRoleResponseDto?.roleNameEn === "Category Head"

  const category = categoryDetails || selectedCategory

  const approvedDoctors = Array.isArray(categoryDoctors) ? categoryDoctors : []

  const pendingRequests = Array.isArray(categoryPendingRequests)
    ? categoryPendingRequests
    : []

  const linkedDepartments = Array.isArray(departmentsByCategory)
    ? departmentsByCategory
    : departmentsByCategory?.items || []

  const availableDepartments = Array.isArray(departments)
    ? departments
    : departments?.items || []

  const rosters = Array.isArray(rosterList)
    ? rosterList
    : rosterList?.items || rosterList?.data?.items || []

  useEffect(() => {
    if (!id) return

    dispatch(clearSingleCategory())
    dispatch(clearCategoryDoctors())
    dispatch(clearCategoryPendingRequests())

    dispatch(getCategoryById({ categoryId: id }))
      .unwrap()
      .then((response) => {
        const data = response?.data || response

        if (data?.id) {
          localStorage.setItem("categoryId", data.id)
          localStorage.setItem("categoryEnglishName", data.nameEnglish || "")
          localStorage.setItem("categoryArabicName", data.nameArabic || "")
        }
      })
      .catch(() => {})

    dispatch(getCategoryDetails({ categoryId: id }))
    dispatch(getCategoryStatisticsForDeptHead({ categoryId: id }))
    dispatch(getCategoryHeads({ categoryId: id }))
    dispatch(availabelDepartmentsForCategory({ categoryId: id }))
    dispatch(getDepartmentByCategory({ categoryId: id }))
    dispatch(getRosterByCategory({ categoryId: id }))

    return () => {
      dispatch(clearSingleCategory())
      dispatch(clearSingleCategoryError())
      dispatch(clearCategoryPendingRequests())
      dispatch(clearCategoryPendingRequestsError())
      dispatch(clearCategoryDoctors())
      dispatch(clearApprovalSuccess())
      dispatch(clearApprovalError())
    }
  }, [dispatch, id])

  useEffect(() => {
    if (!id) return

    dispatch(
      getCategoryDoctors({
        categoryId: id,
        isActive: categoryDoctorsFilters?.isActive,
        page: categoryDoctorsFilters?.page,
        pageSize: categoryDoctorsFilters?.pageSize,
      })
    )
  }, [
    dispatch,
    id,
    categoryDoctorsFilters?.isActive,
    categoryDoctorsFilters?.page,
    categoryDoctorsFilters?.pageSize,
  ])

  useEffect(() => {
    if (!id) return

    dispatch(
      getCategoryPendingRequests({
        categoryId: id,
        filters: categoryPendingRequestsFilters,
      })
    )
  }, [
    dispatch,
    id,
    categoryPendingRequestsFilters?.status,
    categoryPendingRequestsFilters?.page,
    categoryPendingRequestsFilters?.pageSize,
  ])

  useEffect(() => {
    if (approvalSuccess) {
      toast.success(approvalMessage || "Request processed successfully")

      const timer = setTimeout(() => {
        dispatch(clearApprovalSuccess())
      }, 2500)

      return () => clearTimeout(timer)
    }
  }, [approvalSuccess, approvalMessage, dispatch])

  useEffect(() => {
    if (approvalError) {
      toast.error(approvalError?.message || "Failed to process request")
    }
  }, [approvalError])

  const refreshCategoryData = () => {
    if (!id) return

    dispatch(getCategoryById({ categoryId: id }))
    dispatch(getCategoryDetails({ categoryId: id }))
    dispatch(getCategoryStatisticsForDeptHead({ categoryId: id }))
    dispatch(
      getCategoryDoctors({
        categoryId: id,
        isActive: categoryDoctorsFilters?.isActive,
        page: categoryDoctorsFilters?.page,
        pageSize: categoryDoctorsFilters?.pageSize,
      })
    )
    dispatch(
      getCategoryPendingRequests({
        categoryId: id,
        filters: categoryPendingRequestsFilters,
      })
    )
    dispatch(getDepartmentByCategory({ categoryId: id }))
    dispatch(availabelDepartmentsForCategory({ categoryId: id }))
    dispatch(getRosterByCategory({ categoryId: id }))
    dispatch(getCategoryHeads({ categoryId: id }))
  }

  const getCategoryName = () => {
    if (!category) return "-"
    return currentLang === "ar"
      ? category.nameArabic || category.nameEnglish || "-"
      : category.nameEnglish || category.nameArabic || "-"
  }

  const getDoctorName = (doctor) => {
    return currentLang === "ar"
      ? doctor.nameArabic ||
          doctor.doctorNameAr ||
          doctor.fullNameAr ||
          doctor.nameEnglish ||
          doctor.doctorNameEn ||
          "-"
      : doctor.nameEnglish ||
          doctor.doctorNameEn ||
          doctor.fullNameEn ||
          doctor.nameArabic ||
          doctor.doctorNameAr ||
          "-"
  }

  const getRequestDoctorName = (request) => {
    return currentLang === "ar"
      ? request.doctorNameAr ||
          request.nameArabic ||
          request.fullNameAr ||
          request.doctorNameEn ||
          request.nameEnglish ||
          "-"
      : request.doctorNameEn ||
          request.nameEnglish ||
          request.fullNameEn ||
          request.doctorNameAr ||
          request.nameArabic ||
          "-"
  }

  const getDepartmentName = (department) => {
    return currentLang === "ar"
      ? department.nameArabic ||
          department.departmentNameAr ||
          department.nameEnglish ||
          department.departmentNameEn ||
          "-"
      : department.nameEnglish ||
          department.departmentNameEn ||
          department.nameArabic ||
          department.departmentNameAr ||
          "-"
  }

  const getRosterTitle = (roster) => {
    return roster.title || roster.rosterTitle || roster.name || "-"
  }

  const getRosterStatusInfo = (status) => {
    const map = {
      DRAFT_BASIC: {
        text: t("roster.status.draftBasic") || "Draft Basic",
        className: theme.neutralBadge,
      },
      DRAFT_PARTIAL: {
        text: t("roster.status.draftPartial") || "Draft Partial",
        className: theme.warningBadge,
      },
      DRAFT: {
        text: t("roster.status.draft") || "Draft",
        className: theme.infoBadge,
      },
      DRAFT_READY: {
        text: t("roster.status.draftReady") || "Draft Ready",
        className: theme.infoBadge,
      },
      PUBLISHED: {
        text: t("roster.status.published") || "Published",
        className: theme.successBadge,
      },
      CLOSED: {
        text: t("roster.status.closed") || "Closed",
        className: theme.dangerBadge,
      },
      ARCHIVED: {
        text: t("roster.status.archived") || "Archived",
        className: theme.dangerBadge,
      },
    }

    return (
      map[status] || {
        text: status || "-",
        className: theme.neutralBadge,
      }
    )
  }

  const getRequestStatusInfo = (status) => {
    const normalized = String(status || "").toLowerCase()

    if (normalized === "pending" || normalized === "0") {
      return {
        label: currentLang === "ar" ? "قيد المراجعة" : "Pending",
        icon: Clock,
        className: theme.warningBadge,
      }
    }

    if (normalized === "approved" || normalized === "1") {
      return {
        label: currentLang === "ar" ? "مقبول" : "Approved",
        icon: CheckCircle,
        className: theme.successBadge,
      }
    }

    if (normalized === "rejected" || normalized === "2") {
      return {
        label: currentLang === "ar" ? "مرفوض" : "Rejected",
        icon: XCircle,
        className: theme.dangerBadge,
      }
    }

    return {
      label: status || "-",
      icon: Clock,
      className: theme.neutralBadge,
    }
  }

  const renderRequestStatusBadge = (status) => {
    const statusInfo = getRequestStatusInfo(status)
    const Icon = statusInfo.icon

    return (
      <span
        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border ${statusInfo.className}`}
      >
        <Icon className="w-3 h-3" />
        {statusInfo.label}
      </span>
    )
  }

  const handleApproveRequest = async (request) => {
    const userId = request.userId || request.doctorId || request.id

    if (!userId) {
      toast.error(currentLang === "ar" ? "معرف الدكتور غير موجود" : "Missing doctor id")
      return
    }

    const result = await Swal.fire({
      title: currentLang === "ar" ? "قبول طلب الدكتور؟" : "Approve doctor request?",
      text:
        currentLang === "ar"
          ? `سيتم اعتماد ${getRequestDoctorName(request)} داخل هذا التخصص.`
          : `${getRequestDoctorName(request)} will be approved in this category.`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: currentLang === "ar" ? "قبول" : "Approve",
      cancelButtonText: currentLang === "ar" ? "إلغاء" : "Cancel",
      confirmButtonColor: "#16a34a",
      cancelButtonColor: "#64748b",
      background: "var(--color-surface)",
      color: "var(--color-text)",
    })

    if (!result.isConfirmed) return

    dispatch(approveDoctorRequest({ userId }))
      .unwrap()
      .then(() => {
        refreshCategoryData()
      })
      .catch((error) => {
        toast.error(error?.message || "Failed to approve request")
      })
  }

  const handleRejectRequest = async (request) => {
    const userId = request.userId || request.doctorId || request.id

    if (!userId) {
      toast.error(currentLang === "ar" ? "معرف الدكتور غير موجود" : "Missing doctor id")
      return
    }

    const result = await Swal.fire({
      title: currentLang === "ar" ? "رفض طلب الدكتور؟" : "Reject doctor request?",
      text:
        currentLang === "ar"
          ? `سيتم رفض طلب ${getRequestDoctorName(request)}.`
          : `${getRequestDoctorName(request)} request will be rejected.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: currentLang === "ar" ? "رفض" : "Reject",
      cancelButtonText: currentLang === "ar" ? "إلغاء" : "Cancel",
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#64748b",
      background: "var(--color-surface)",
      color: "var(--color-text)",
    })

    if (!result.isConfirmed) return

    dispatch(rejectDoctorRequest({ userId }))
      .unwrap()
      .then(() => {
        refreshCategoryData()
      })
      .catch((error) => {
        toast.error(error?.message || "Failed to reject request")
      })
  }

  const handlePendingStatusChange = (status) => {
    dispatch(setCategoryPendingRequestsStatusFilter(status))
  }

  const handlePendingPageChange = (page) => {
    dispatch(setCategoryPendingRequestsCurrentPage(page))
  }

  const handlePendingPageSizeChange = (pageSize) => {
    dispatch(setCategoryPendingRequestsPageSize(Number(pageSize)))
  }

  const handleDoctorsActiveFilterChange = (value) => {
    dispatch(setCategoryDoctorsActiveFilter(value))
  }

  const handleDoctorsPageChange = (page) => {
    dispatch(setCategoryDoctorsCurrentPage(page))
  }

  const handleDoctorsPageSizeChange = (pageSize) => {
    dispatch(setCategoryDoctorsPageSize(Number(pageSize)))
  }

  const handleLinkDepartment = async (departmentId) => {
    const result = await Swal.fire({
      title:
        currentLang === "ar"
          ? "ربط القسم بالتخصص؟"
          : "Link department to category?",
      text:
        currentLang === "ar"
          ? "سيتم إتاحة هذا القسم داخل التخصص."
          : "This department will be available in this category.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: currentLang === "ar" ? "ربط" : "Link",
      cancelButtonText: currentLang === "ar" ? "إلغاء" : "Cancel",
      confirmButtonColor: "#2563eb",
      cancelButtonColor: "#64748b",
      background: "var(--color-surface)",
      color: "var(--color-text)",
    })

    if (!result.isConfirmed) return

    try {
      setDepClickId(departmentId)

      await dispatch(
        linkDepartmentToCategory({
          id: departmentId,
          categoryId: id,
        })
      ).unwrap()

      toast.success(
        currentLang === "ar" ? "تم ربط القسم بنجاح" : "Department linked successfully"
      )

      dispatch(getDepartmentByCategory({ categoryId: id }))
      dispatch(availabelDepartmentsForCategory({ categoryId: id }))
      dispatch(getCategoryById({ categoryId: id }))
    } catch (error) {
      toast.error(error?.message || error?.errors?.[0] || "Failed to link department")
    } finally {
      setDepClickId(null)
    }
  }

  const handleUnlinkDepartment = async (departmentId) => {
    const result = await Swal.fire({
      title:
        currentLang === "ar"
          ? "إلغاء ربط القسم؟"
          : "Unlink department?",
      text:
        currentLang === "ar"
          ? "سيتم إزالة القسم من هذا التخصص."
          : "This department will be removed from this category.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: currentLang === "ar" ? "إلغاء الربط" : "Unlink",
      cancelButtonText: currentLang === "ar" ? "تراجع" : "Cancel",
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#64748b",
      background: "var(--color-surface)",
      color: "var(--color-text)",
    })

    if (!result.isConfirmed) return

    try {
      setUnlinkDepId(departmentId)

      await dispatch(
        unlinkDepartmentFromCategory({
          id: departmentId,
          categoryId: id,
          revocationReason: "Updated from category management page",
        })
      ).unwrap()

      toast.success(
        currentLang === "ar"
          ? "تم إلغاء ربط القسم بنجاح"
          : "Department unlinked successfully"
      )

      dispatch(getDepartmentByCategory({ categoryId: id }))
      dispatch(availabelDepartmentsForCategory({ categoryId: id }))
      dispatch(getCategoryById({ categoryId: id }))
    } catch (error) {
      toast.error(error?.message || error?.errors?.[0] || "Failed to unlink department")
    } finally {
      setUnlinkDepId(null)
    }
  }

  const overviewStats = useMemo(() => {
    const stats = categoryStatistics || {}

    return {
      departments:
        stats.departmentsCount ??
        category?.departmentsCount ??
        linkedDepartments.length ??
        0,
      users:
        stats.usersCount ??
        stats.doctorsCount ??
        category?.usersCount ??
        approvedDoctors.length ??
        0,
      pending:
        stats.pendingRequestsCount ??
        pendingRequests.filter((request) =>
          String(request.status || "").toLowerCase().includes("pending")
        ).length,
      rosters:
        stats.rostersCount ?? rosters.length ?? 0,
      heads: stats.categoryHeadsCount ?? 0,
      activeDoctors:
        stats.activeDoctorsCount ??
        approvedDoctors.filter((doctor) => doctor.isActive !== false).length,
    }
  }, [
    categoryStatistics,
    category,
    linkedDepartments.length,
    approvedDoctors,
    pendingRequests,
    rosters.length,
  ])

  const defaultButton =
    "inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-bold border bg-[var(--color-surface)] text-[var(--color-text)] border-[var(--color-border-strong)] hover:bg-[var(--color-success)] hover:text-white hover:border-[var(--color-success)] active:bg-[var(--color-success-hover)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"

  const iconButton =
    "p-2 rounded-lg border border-[var(--color-border-strong)] bg-[var(--color-surface)] text-[var(--color-text)] hover:bg-[var(--color-success)] hover:text-white hover:border-[var(--color-success)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"

  const dangerButton =
    "inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-bold border bg-[var(--color-surface)] text-[var(--color-danger)] border-[var(--color-danger-border)] hover:bg-[var(--color-danger)] hover:text-white hover:border-[var(--color-danger)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"

  const dangerIconButton =
    "p-2 rounded-lg border border-[var(--color-danger-border)] bg-[var(--color-surface)] text-[var(--color-danger)] hover:bg-[var(--color-danger)] hover:text-white hover:border-[var(--color-danger)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"

  const TabButton = ({ id: tabId, icon: Icon, label, count }) => {
    const isActive = activeTab === tabId

    return (
      <button
        type="button"
        onClick={() => setActiveTab(tabId)}
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

  const StatCard = ({ icon: Icon, title, value, tone = "blue" }) => {
    const toneClass = {
      blue:
        "bg-[var(--color-primary-soft)] text-[var(--color-primary)] border border-[var(--color-primary)]/20",
      green:
        "bg-[var(--color-success-soft)] text-[var(--color-success)] border border-[var(--color-success-border)]",
      yellow:
        "bg-[var(--color-warning-soft)] text-[var(--color-warning)] border border-[var(--color-warning-border)]",
      purple:
        "bg-[var(--color-purple-soft)] text-[var(--color-purple)] border border-[var(--color-purple-border)]",
      orange:
        "bg-[var(--color-warning-soft)] text-[var(--color-warning)] border border-[var(--color-warning-border)]",
      red:
        "bg-[var(--color-danger-soft)] text-[var(--color-danger)] border border-[var(--color-danger-border)]",
    }

    return (
      <div className={`${theme.cardSoft} p-4`}>
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm text-[var(--color-text-muted)]">{title}</p>
            <p className="text-2xl font-extrabold text-[var(--color-text)]">
              {value ?? 0}
            </p>
          </div>

          <div
            className={`w-11 h-11 rounded-xl flex items-center justify-center ${
              toneClass[tone] || toneClass.blue
            }`}
          >
            <Icon className="w-5 h-5" />
          </div>
        </div>
      </div>
    )
  }

  const EmptyState = ({ icon: Icon, title, description }) => (
    <div className={`${theme.card} p-8 text-center`}>
      <Icon className="w-14 h-14 mx-auto mb-4 text-[var(--color-text-muted)]" />
      <h3 className="text-xl font-bold text-[var(--color-text)]">{title}</h3>
      <p className="mt-2 text-[var(--color-text-muted)]">{description}</p>
    </div>
  )

  const Pagination = ({ pagination, onPageChange, onPageSizeChange }) => {
    if (!pagination) return null

    const page = pagination.page || pagination.pageNumber || 1
    const totalPages = pagination.totalPages || 1
    const pageSize = pagination.pageSize || 10

    if (totalPages <= 1 && !onPageSizeChange) return null

    return (
      <div className={`${theme.card} p-4 mt-4 flex flex-col sm:flex-row items-center justify-between gap-3`}>
        <div className="text-sm text-[var(--color-text-muted)]">
          {currentLang === "ar" ? "صفحة" : "Page"} {page} / {totalPages}
        </div>

        <div className="flex items-center gap-2">
          {onPageSizeChange && (
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(e.target.value)}
              className="px-3 py-2 rounded-lg bg-[var(--color-surface)] text-[var(--color-text)] border border-[var(--color-border)]"
            >
              {[10, 20, 50].map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          )}

          <button
            type="button"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
            className={defaultButton}
          >
            {isRTL ? <ArrowRight size={16} /> : <ArrowLeft size={16} />}
          </button>

          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
            className={defaultButton}
          >
            {isRTL ? <ArrowLeft size={16} /> : <ArrowRight size={16} />}
          </button>
        </div>
      </div>
    )
  }

  const renderOverviewTab = () => (
    <div className="space-y-6">
      {(loadingGetCategoryStatistics || loadingGetCategoryDetails) && (
        <LoadingGetData text={currentLang === "ar" ? "جاري تحميل الإحصائيات..." : "Loading statistics..."} />
      )}

      {(categoryDetailsError || categoryStatisticsError) && (
        <div className={`${theme.card} p-4 border-[var(--color-danger-border)]`}>
          <p className="text-[var(--color-danger)]">
            {categoryDetailsError?.message || categoryStatisticsError?.message}
          </p>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard
          icon={Building}
          title={currentLang === "ar" ? "الأقسام" : "Departments"}
          value={overviewStats.departments}
          tone="blue"
        />

        <StatCard
          icon={Users}
          title={currentLang === "ar" ? "الدكاترة" : "Doctors"}
          value={overviewStats.users}
          tone="green"
        />

        <StatCard
          icon={UserCheck}
          title={currentLang === "ar" ? "نشطين" : "Active"}
          value={overviewStats.activeDoctors}
          tone="purple"
        />

        <StatCard
          icon={Clock}
          title={currentLang === "ar" ? "طلبات معلقة" : "Pending"}
          value={overviewStats.pending}
          tone="yellow"
        />

        <StatCard
          icon={Calendar}
          title={currentLang === "ar" ? "روسترات" : "Rosters"}
          value={overviewStats.rosters}
          tone="orange"
        />

        <StatCard
          icon={Award}
          title={currentLang === "ar" ? "رؤساء" : "Heads"}
          value={overviewStats.heads}
          tone="blue"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className={`${theme.card} p-6 xl:col-span-2`}>
          <h2 className="text-xl font-bold text-[var(--color-text)] mb-5 flex items-center gap-2">
            <FileText className="w-5 h-5 text-[var(--color-primary)]" />
            {currentLang === "ar" ? "بيانات التخصص" : "Category Information"}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InfoItem label={currentLang === "ar" ? "الاسم العربي" : "Arabic Name"} value={category?.nameArabic} />
            <InfoItem label={currentLang === "ar" ? "الاسم الإنجليزي" : "English Name"} value={category?.nameEnglish} />
            <InfoItem label={currentLang === "ar" ? "الكود" : "Code"} value={category?.code} />
            <InfoItem
              label={currentLang === "ar" ? "الحالة" : "Status"}
              value={
                category?.isActive
                  ? currentLang === "ar"
                    ? "نشط"
                    : "Active"
                  : currentLang === "ar"
                  ? "غير نشط"
                  : "Inactive"
              }
            />
            <InfoItem label={currentLang === "ar" ? "تاريخ الإنشاء" : "Created At"} value={formatDate(category?.createdAt)} />
            <InfoItem label={currentLang === "ar" ? "أنشئ بواسطة" : "Created By"} value={category?.createdByName || "-"} />
          </div>

          {category?.description && (
            <div className={`${theme.cardSoft} p-4 mt-5`}>
              <p className="text-sm text-[var(--color-text-muted)] mb-1">
                {currentLang === "ar" ? "الوصف" : "Description"}
              </p>
              <p className="text-[var(--color-text)]">{category.description}</p>
            </div>
          )}
        </div>

        <div className={`${theme.card} p-6`}>
          <h2 className="text-xl font-bold text-[var(--color-text)] mb-5 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-[var(--color-purple)]" />
            {currentLang === "ar" ? "إجراءات سريعة" : "Quick Actions"}
          </h2>

          <div className="space-y-3">
            <Link to={`/admin-panel/category/edit/${id}`} className="block">
              <button type="button" className={`${defaultButton} w-full`}>
                <Edit size={16} />
                {currentLang === "ar" ? "تعديل التخصص" : "Edit Category"}
              </button>
            </Link>

            <button
              type="button"
              onClick={() => setActiveTab("doctors")}
              className={`${defaultButton} w-full`}
            >
              <Users size={16} />
              {currentLang === "ar" ? "عرض الدكاترة" : "View Doctors"}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("requests")}
              className={`${defaultButton} w-full`}
            >
              <Clock size={16} />
              {currentLang === "ar" ? "طلبات الانضمام" : "Join Requests"}
            </button>

            <button
              type="button"
              onClick={() => navigate(`/admin-panel/leaves/${id}`)}
              className={`${defaultButton} w-full`}
            >
              <ExternalLink size={16} />
              {currentLang === "ar" ? "إجازات التخصص" : "Category Leaves"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  const InfoItem = ({ label, value }) => (
    <div className={`${theme.cardSoft} p-4`}>
      <p className="text-xs font-bold text-[var(--color-text-muted)] mb-1">
        {label}
      </p>
      <p className="text-sm font-bold text-[var(--color-text)]">{value || "-"}</p>
    </div>
  )

  const renderDoctorsTab = () => (
    <div className="space-y-5">
      <div className={`${theme.card} p-4`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-[var(--color-text)] flex items-center gap-2">
              <Users className="w-5 h-5 text-[var(--color-success)]" />
              {currentLang === "ar" ? "الدكاترة المعتمدين" : "Approved Doctors"}
            </h2>
            <p className="text-sm text-[var(--color-text-muted)] mt-1">
              {currentLang === "ar"
                ? "الدكاترة الموجودين فعليًا داخل هذا التخصص."
                : "Doctors currently approved in this category."}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={categoryDoctorsFilters?.isActive || ""}
              onChange={(e) => handleDoctorsActiveFilterChange(e.target.value)}
              className="px-3 py-2 rounded-lg bg-[var(--color-surface)] text-[var(--color-text)] border border-[var(--color-border)]"
            >
              <option value="">{currentLang === "ar" ? "كل الحالات" : "All Status"}</option>
              <option value="true">{currentLang === "ar" ? "نشط" : "Active"}</option>
              <option value="false">{currentLang === "ar" ? "غير نشط" : "Inactive"}</option>
            </select>

            <button
              type="button"
              onClick={() =>
                dispatch(
                  getCategoryDoctors({
                    categoryId: id,
                    isActive: categoryDoctorsFilters?.isActive,
                    page: categoryDoctorsFilters?.page,
                    pageSize: categoryDoctorsFilters?.pageSize,
                  })
                )
              }
              className={defaultButton}
            >
              <RefreshCw size={16} />
            </button>
          </div>
        </div>
      </div>

      {loadingGetCategoryDoctors ? (
        <LoadingGetData text={currentLang === "ar" ? "جاري تحميل الدكاترة..." : "Loading doctors..."} />
      ) : categoryDoctorsError ? (
        <div className={`${theme.card} p-6 text-[var(--color-danger)]`}>
          {categoryDoctorsError?.message}
        </div>
      ) : approvedDoctors.length === 0 ? (
        <EmptyState
          icon={Users}
          title={currentLang === "ar" ? "لا يوجد دكاترة معتمدين" : "No approved doctors"}
          description={
            currentLang === "ar"
              ? "سيظهر هنا الدكاترة بعد قبول طلباتهم أو ربطهم بالتخصص."
              : "Doctors will appear here after they are approved or assigned to this category."
          }
        />
      ) : (
        <>
          <div className={`${theme.card} overflow-hidden`}>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[950px]">
                <thead className="bg-[var(--color-surface-muted)]">
                  <tr className="border-b border-[var(--color-border)]">
                    <TableHead align={isRTL ? "right" : "left"}>
                      {currentLang === "ar" ? "الدكتور" : "Doctor"}
                    </TableHead>
                    <TableHead>{currentLang === "ar" ? "رقم الطباعة" : "Print No"}</TableHead>
                    <TableHead>{currentLang === "ar" ? "الدرجة" : "Degree"}</TableHead>
                    <TableHead>{currentLang === "ar" ? "التعاقد" : "Contracting"}</TableHead>
                    <TableHead>{currentLang === "ar" ? "الموبايل" : "Mobile"}</TableHead>
                    <TableHead>{currentLang === "ar" ? "الحالة" : "Status"}</TableHead>
                    <TableHead>{currentLang === "ar" ? "إجراءات" : "Actions"}</TableHead>
                  </tr>
                </thead>

                <tbody>
                  {approvedDoctors.map((doctor, index) => {
                    const doctorId = doctor.id || doctor.userId || doctor.doctorId

                    return (
                      <tr
                        key={`${doctorId}-${index}`}
                        className={`border-b border-[var(--color-border)] ${theme.hoverRow}`}
                      >
                        <TableCell>
                          <div className="font-bold text-[var(--color-text)]">
                            {getDoctorName(doctor)}
                          </div>
                          <div className="text-xs text-[var(--color-text-muted)]">
                            {doctor.email || "-"}
                          </div>
                        </TableCell>

                        <TableCell center>{doctor.printNumber || "-"}</TableCell>

                        <TableCell center>
                          {currentLang === "ar"
                            ? doctor.scientificDegreeName ||
                              doctor.scientificDegreeNameAr ||
                              doctor.scientificDegree?.nameArabic ||
                              "-"
                            : doctor.scientificDegreeNameEn ||
                              doctor.scientificDegree?.nameEnglish ||
                              doctor.scientificDegreeName ||
                              "-"}
                        </TableCell>

                        <TableCell center>
                          {currentLang === "ar"
                            ? doctor.contractingTypeName ||
                              doctor.contractingTypeNameAr ||
                              doctor.contractingType?.nameArabic ||
                              "-"
                            : doctor.contractingTypeNameEn ||
                              doctor.contractingType?.nameEnglish ||
                              doctor.contractingTypeName ||
                              "-"}
                        </TableCell>

                        <TableCell center>{doctor.mobile || "-"}</TableCell>

                        <TableCell center>
                          <span
                            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border ${
                              doctor.isActive === false
                                ? theme.dangerBadge
                                : theme.successBadge
                            }`}
                          >
                            {doctor.isActive === false ? (
                              <XCircle className="w-3 h-3" />
                            ) : (
                              <CheckCircle className="w-3 h-3" />
                            )}
                            {doctor.isActive === false
                              ? currentLang === "ar"
                                ? "غير نشط"
                                : "Inactive"
                              : currentLang === "ar"
                              ? "نشط"
                              : "Active"}
                          </span>
                        </TableCell>

                        <TableCell center>
                          <div className="flex justify-center gap-2">
                            <Link to={`/admin-panel/category/doctor/${doctorId}`}>
                              <button
                                type="button"
                                className={iconButton}
                              >
                                <Eye size={16} />
                              </button>
                            </Link>

                            {canManageCategory && (
                              <Link to={`/admin-panel/category/doctor/${doctorId}/edit`}>
                                <button
                                  type="button"
                                  className={iconButton}
                                >
                                  <Edit size={16} />
                                </button>
                              </Link>
                            )}
                          </div>
                        </TableCell>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <Pagination
            pagination={categoryDoctorsPagination}
            onPageChange={handleDoctorsPageChange}
            onPageSizeChange={handleDoctorsPageSizeChange}
          />
        </>
      )}
    </div>
  )

  const renderRequestsTab = () => (
    <div className="space-y-5">
      <div className={`${theme.card} p-4`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-[var(--color-text)] flex items-center gap-2">
              <Clock className="w-5 h-5 text-[var(--color-warning)]" />
              {currentLang === "ar" ? "طلبات انضمام الدكاترة" : "Doctor Join Requests"}
            </h2>
            <p className="text-sm text-[var(--color-text-muted)] mt-1">
              {currentLang === "ar"
                ? "هنا يتم قبول أو رفض الدكاترة المتقدمين لهذا التخصص."
                : "Approve or reject doctors requesting to join this category."}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={categoryPendingRequestsFilters?.status || ""}
              onChange={(e) => handlePendingStatusChange(e.target.value)}
              className="px-3 py-2 rounded-lg bg-[var(--color-surface)] text-[var(--color-text)] border border-[var(--color-border)]"
            >
              <option value="">{currentLang === "ar" ? "كل الطلبات" : "All Requests"}</option>
              <option value="Pending">{currentLang === "ar" ? "قيد المراجعة" : "Pending"}</option>
              <option value="Approved">{currentLang === "ar" ? "مقبول" : "Approved"}</option>
              <option value="Rejected">{currentLang === "ar" ? "مرفوض" : "Rejected"}</option>
            </select>

            <button
              type="button"
              onClick={() =>
                dispatch(
                  getCategoryPendingRequests({
                    categoryId: id,
                    filters: categoryPendingRequestsFilters,
                  })
                )
              }
              className={defaultButton}
            >
              <RefreshCw size={16} />
            </button>
          </div>
        </div>
      </div>

      {loadingGetCategoryPendingRequests ? (
        <LoadingGetData text={currentLang === "ar" ? "جاري تحميل الطلبات..." : "Loading requests..."} />
      ) : categoryPendingRequestsError ? (
        <div className={`${theme.card} p-6 text-[var(--color-danger)]`}>
          {categoryPendingRequestsError?.message}
        </div>
      ) : pendingRequests.length === 0 ? (
        <EmptyState
          icon={Clock}
          title={currentLang === "ar" ? "لا توجد طلبات" : "No requests"}
          description={
            currentLang === "ar"
              ? "لا توجد طلبات انضمام مطابقة للفلاتر الحالية."
              : "No join requests match the current filters."
          }
        />
      ) : (
        <>
          <div className={`${theme.card} overflow-hidden`}>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1000px]">
                <thead className="bg-[var(--color-surface-muted)]">
                  <tr className="border-b border-[var(--color-border)]">
                    <TableHead align={isRTL ? "right" : "left"}>
                      {currentLang === "ar" ? "الدكتور" : "Doctor"}
                    </TableHead>
                    <TableHead>{currentLang === "ar" ? "الدرجة" : "Degree"}</TableHead>
                    <TableHead>{currentLang === "ar" ? "التعاقد" : "Contracting"}</TableHead>
                    <TableHead>{currentLang === "ar" ? "الموبايل" : "Mobile"}</TableHead>
                    <TableHead>{currentLang === "ar" ? "تاريخ الطلب" : "Requested At"}</TableHead>
                    <TableHead>{currentLang === "ar" ? "الحالة" : "Status"}</TableHead>
                    <TableHead>{currentLang === "ar" ? "إجراءات" : "Actions"}</TableHead>
                  </tr>
                </thead>

                <tbody>
                  {pendingRequests.map((request, index) => {
                    const userId = request.userId || request.doctorId || request.id
                    const status = String(request.status || "").toLowerCase()
                    const canProcess =
                      status === "pending" || status === "0" || !status

                    return (
                      <tr
                        key={`${userId}-${index}`}
                        className={`border-b border-[var(--color-border)] ${theme.hoverRow}`}
                      >
                        <TableCell>
                          <div className="font-bold text-[var(--color-text)]">
                            {getRequestDoctorName(request)}
                          </div>
                          <div className="text-xs text-[var(--color-text-muted)]">
                            {request.email || "-"}
                          </div>
                        </TableCell>

                        <TableCell center>
                          {currentLang === "ar"
                            ? request.scientificDegreeName ||
                              request.scientificDegreeNameAr ||
                              "-"
                            : request.scientificDegreeNameEn ||
                              request.scientificDegreeName ||
                              "-"}
                        </TableCell>

                        <TableCell center>
                          {currentLang === "ar"
                            ? request.contractingTypeName ||
                              request.contractingTypeNameAr ||
                              "-"
                            : request.contractingTypeNameEn ||
                              request.contractingTypeName ||
                              "-"}
                        </TableCell>

                        <TableCell center>{request.mobile || "-"}</TableCell>

                        <TableCell center>
                          {formatDate(
                            request.requestedAt ||
                              request.createdAt ||
                              request.createdOn
                          )}
                        </TableCell>

                        <TableCell center>
                          {renderRequestStatusBadge(request.status)}
                        </TableCell>

                        <TableCell center>
                          <div className="flex justify-center gap-2">
                            <Link to={`/admin-panel/category/doctor/${userId}`}>
                              <button
                                type="button"
                                className={iconButton}
                              >
                                <Eye size={16} />
                              </button>
                            </Link>

                            {canManageCategory && canProcess && (
                              <>
                                <button
                                  type="button"
                                  disabled={loadingApproveRequest || loadingRejectRequest}
                                  onClick={() => handleApproveRequest(request)}
                                  className={iconButton}
                                >
                                  <Check size={16} />
                                </button>

                                <button
                                  type="button"
                                  disabled={loadingApproveRequest || loadingRejectRequest}
                                  onClick={() => handleRejectRequest(request)}
                                  className={dangerIconButton}
                                >
                                  <X size={16} />
                                </button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <Pagination
            pagination={categoryPendingRequestsPagination}
            onPageChange={handlePendingPageChange}
            onPageSizeChange={handlePendingPageSizeChange}
          />
        </>
      )}
    </div>
  )

  const TableHead = ({ children, align = "center" }) => (
    <th
      className={`p-4 text-sm font-bold text-[var(--color-text)] text-${align}`}
    >
      {children}
    </th>
  )

  const TableCell = ({ children, center = false }) => (
    <td
      className={`p-4 text-sm text-[var(--color-text)] ${
        center ? "text-center" : ""
      }`}
    >
      {children}
    </td>
  )

  const renderDepartmentsTab = () => (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
      <div className={`${theme.card} p-6`}>
        <h2 className="text-xl font-bold text-[var(--color-text)] mb-5 flex items-center gap-2">
          <Building className="w-5 h-5 text-[var(--color-success)]" />
          {currentLang === "ar" ? "الأقسام المرتبطة" : "Linked Departments"}
        </h2>

        {loadingGetDepartmentsByCategory ? (
          <LoadingGetData text={currentLang === "ar" ? "جاري تحميل الأقسام..." : "Loading departments..."} />
        ) : linkedDepartments.length === 0 ? (
          <p className="text-[var(--color-text-muted)]">
            {currentLang === "ar" ? "لا توجد أقسام مرتبطة" : "No linked departments"}
          </p>
        ) : (
          <div className="space-y-3">
            {linkedDepartments.map((department) => {
              const departmentId =
                department.id || department.departmentId || department.categoryDepartmentId

              return (
                <div
                  key={departmentId}
                  className={`${theme.cardSoft} p-4 flex items-center justify-between gap-4`}
                >
                  <div>
                    <p className="font-bold text-[var(--color-text)]">
                      {getDepartmentName(department)}
                    </p>
                    <p className="text-xs text-[var(--color-text-muted)]">
                      {department.code || department.departmentCode || "-"}
                    </p>
                  </div>

                  {canManageCategory && (
                    <button
                      type="button"
                      disabled={
                        unlinkDepId === departmentId || loadingUnlinkDepartment
                      }
                      onClick={() => handleUnlinkDepartment(departmentId)}
                      className={dangerIconButton}
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      <div className={`${theme.card} p-6`}>
        <h2 className="text-xl font-bold text-[var(--color-text)] mb-5 flex items-center gap-2">
          <LinkIcon className="w-5 h-5 text-[var(--color-primary)]" />
          {currentLang === "ar" ? "أقسام متاحة للربط" : "Available Departments"}
        </h2>

        {availableDepartments.length === 0 ? (
          <p className="text-[var(--color-text-muted)]">
            {currentLang === "ar" ? "لا توجد أقسام متاحة" : "No available departments"}
          </p>
        ) : (
          <div className="space-y-3">
            {availableDepartments.map((department) => {
              const departmentId = department.id || department.departmentId

              return (
                <div
                  key={departmentId}
                  className={`${theme.cardSoft} p-4 flex items-center justify-between gap-4`}
                >
                  <div>
                    <p className="font-bold text-[var(--color-text)]">
                      {getDepartmentName(department)}
                    </p>
                    <p className="text-xs text-[var(--color-text-muted)]">
                      {department.code || department.departmentCode || "-"}
                    </p>
                  </div>

                  {canManageCategory && (
                    <button
                      type="button"
                      disabled={
                        depClickId === departmentId ||
                        loadingLinkDepartmentToCategory
                      }
                      onClick={() => handleLinkDepartment(departmentId)}
                      className={defaultButton}
                    >
                      <LinkIcon size={16} />
                      {currentLang === "ar" ? "ربط" : "Link"}
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )

  const renderRostersTab = () => (
    <div className="space-y-5">
      <div className={`${theme.card} p-4 flex items-center justify-between gap-3 flex-wrap`}>
        <div>
          <h2 className="text-xl font-bold text-[var(--color-text)] flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[var(--color-warning)]" />
            {currentLang === "ar" ? "روسترات التخصص" : "Category Rosters"}
          </h2>
          <p className="text-sm text-[var(--color-text-muted)] mt-1">
            {currentLang === "ar"
              ? "كل الروسترات التابعة لهذا التخصص."
              : "All rosters created for this category."}
          </p>
        </div>

        <Link to="/admin-panel/rosters/create">
          <button type="button" className={defaultButton}>
            {currentLang === "ar" ? "إنشاء روستر" : "Create Roster"}
          </button>
        </Link>
      </div>

      {loading?.getRosterByCategory ? (
        <LoadingGetData text={currentLang === "ar" ? "جاري تحميل الروسترات..." : "Loading rosters..."} />
      ) : rosters.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title={currentLang === "ar" ? "لا توجد روسترات" : "No rosters"}
          description={
            currentLang === "ar"
              ? "لا توجد روسترات مسجلة لهذا التخصص حتى الآن."
              : "There are no rosters for this category yet."
          }
        />
      ) : (
        <div className={`${theme.card} overflow-hidden`}>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead className="bg-[var(--color-surface-muted)]">
                <tr className="border-b border-[var(--color-border)]">
                  <TableHead align={isRTL ? "right" : "left"}>
                    {currentLang === "ar" ? "الروستر" : "Roster"}
                  </TableHead>
                  <TableHead>{currentLang === "ar" ? "الشهر" : "Month"}</TableHead>
                  <TableHead>{currentLang === "ar" ? "الفترة" : "Period"}</TableHead>
                  <TableHead>{currentLang === "ar" ? "الحالة" : "Status"}</TableHead>
                  <TableHead>{currentLang === "ar" ? "الإكمال" : "Completion"}</TableHead>
                  <TableHead>{currentLang === "ar" ? "إجراءات" : "Actions"}</TableHead>
                </tr>
              </thead>

              <tbody>
                {rosters.map((roster) => {
                  const statusInfo = getRosterStatusInfo(roster.status)

                  return (
                    <tr
                      key={roster.id}
                      className={`border-b border-[var(--color-border)] ${theme.hoverRow}`}
                    >
                      <TableCell>
                        <div className="font-bold text-[var(--color-text)]">
                          {getRosterTitle(roster)}
                        </div>
                        <div className="text-xs text-[var(--color-text-muted)]">
                          #{roster.id}
                        </div>
                      </TableCell>

                      <TableCell center>
                        {roster.month}/{roster.year}
                      </TableCell>

                      <TableCell center>
                        {formatDate(roster.startDate)} - {formatDate(roster.endDate)}
                      </TableCell>

                      <TableCell center>
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${statusInfo.className}`}
                        >
                          {statusInfo.text}
                        </span>
                      </TableCell>

                      <TableCell center>
                        {Math.round(roster.completionPercentage || roster.completionPercent || 0)}%
                      </TableCell>

                      <TableCell center>
                        <Link to={`/admin-panel/rosters/${roster.id}`}>
                          <button
                            type="button"
                            className={iconButton}
                          >
                            <Eye size={16} />
                          </button>
                        </Link>
                      </TableCell>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )

  const renderHeadsTab = () => (
    <div className="space-y-5">
      <div className={`${theme.card} p-4`}>
        <h2 className="text-xl font-bold text-[var(--color-text)] flex items-center gap-2">
          <Award className="w-5 h-5 text-[var(--color-purple)]" />
          {currentLang === "ar" ? "رؤساء التخصص" : "Category Heads"}
        </h2>
        <p className="text-sm text-[var(--color-text-muted)] mt-1">
          {currentLang === "ar"
            ? "إدارة مسؤولي ورؤساء هذا التخصص."
            : "Manage the heads and managers of this category."}
        </p>
      </div>

      <CategoryHeadsManagement
        selectedCategory={category}
        isDark={isDark}
        isRTL={isRTL}
      />
    </div>
  )

  if (loadingGetSingleCategory && !category) {
    return <LoadingGetData text={t("gettingData.categoryData") || "Loading category data..."} />
  }

  if (singleCategoryError) {
    return (
      <div className={theme.page} dir={isRTL ? "rtl" : "ltr"}>
        <div className="max-w-5xl mx-auto">
          <div className={`${theme.card} p-8 text-center`}>
            <XCircle className="w-14 h-14 text-[var(--color-danger)] mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-[var(--color-text)] mb-2">
              {currentLang === "ar" ? "تعذر تحميل التخصص" : "Failed to load category"}
            </h2>
            <p className="text-[var(--color-text-muted)] mb-6">
              {singleCategoryError?.message || "-"}
            </p>
            <button
              type="button"
              onClick={() => navigate("/admin-panel/categories")}
              className={defaultButton}
            >
              {isRTL ? <ArrowRight size={16} /> : <ArrowLeft size={16} />}
              {currentLang === "ar" ? "رجوع للتخصصات" : "Back to Categories"}
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!category) {
    return (
      <div className={theme.page} dir={isRTL ? "rtl" : "ltr"}>
        <div className="max-w-5xl mx-auto">
          <EmptyState
            icon={FileText}
            title={currentLang === "ar" ? "التخصص غير موجود" : "Category not found"}
            description={
              currentLang === "ar"
                ? "لم يتم العثور على بيانات لهذا التخصص."
                : "No data was found for this category."
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
            onClick={() => navigate("/admin-panel/categories")}
            className="inline-flex items-center gap-2 text-sm font-bold text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
          >
            {isRTL ? <ArrowRight size={16} /> : <ArrowLeft size={16} />}
            {currentLang === "ar" ? "رجوع للتخصصات" : "Back to Categories"}
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={refreshCategoryData}
              className={defaultButton}
            >
              <RefreshCw size={16} />
              {currentLang === "ar" ? "تحديث" : "Refresh"}
            </button>

            {canManageCategory && (
              <Link to={`/admin-panel/category/edit/${id}`}>
                <button type="button" className={defaultButton}>
                  <Edit size={16} />
                  {currentLang === "ar" ? "تعديل" : "Edit"}
                </button>
              </Link>
            )}
          </div>
        </div>

        <div className={`${theme.card} p-6`}>
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-[var(--color-primary-soft)] text-[var(--color-primary)] flex items-center justify-center">
                <Stethoscope className="w-7 h-7" />
              </div>

              <div>
                <h1 className="text-3xl font-extrabold text-[var(--color-text)]">
                  {getCategoryName()}
                </h1>

                <div className="flex flex-wrap items-center gap-3 mt-3">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-[var(--color-bg-soft)] text-[var(--color-text-muted)] border border-[var(--color-border)]">
                    {category.code || "-"}
                  </span>

                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold border ${
                      category.isActive ? theme.successBadge : theme.dangerBadge
                    }`}
                  >
                    {category.isActive
                      ? currentLang === "ar"
                        ? "نشط"
                        : "Active"
                      : currentLang === "ar"
                      ? "غير نشط"
                      : "Inactive"}
                  </span>

                  <span className="text-sm text-[var(--color-text-muted)]">
                    {currentLang === "ar" ? "تم الإنشاء" : "Created"}:{" "}
                    {formatDate(category.createdAt)}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 min-w-[280px]">
              <div className={`${theme.cardSoft} p-3 text-center`}>
                <p className="text-2xl font-extrabold text-[var(--color-text)]">
                  {overviewStats.departments}
                </p>
                <p className="text-xs text-[var(--color-text-muted)]">
                  {currentLang === "ar" ? "أقسام" : "Departments"}
                </p>
              </div>

              <div className={`${theme.cardSoft} p-3 text-center`}>
                <p className="text-2xl font-extrabold text-[var(--color-text)]">
                  {overviewStats.users}
                </p>
                <p className="text-xs text-[var(--color-text-muted)]">
                  {currentLang === "ar" ? "دكاترة" : "Doctors"}
                </p>
              </div>

              <div className={`${theme.cardSoft} p-3 text-center`}>
                <p className="text-2xl font-extrabold text-[var(--color-text)]">
                  {overviewStats.pending}
                </p>
                <p className="text-xs text-[var(--color-text-muted)]">
                  {currentLang === "ar" ? "طلبات" : "Requests"}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className={`${theme.card} p-4`}>
          <div className="flex flex-wrap gap-2">
            <TabButton
              id="overview"
              icon={BarChart3}
              label={currentLang === "ar" ? "نظرة عامة" : "Overview"}
            />

            <TabButton
              id="doctors"
              icon={Users}
              label={currentLang === "ar" ? "الدكاترة" : "Doctors"}
              count={approvedDoctors.length}
            />

            <TabButton
              id="requests"
              icon={Clock}
              label={currentLang === "ar" ? "طلبات الانضمام" : "Requests"}
              count={pendingRequests.length}
            />

            <TabButton
              id="departments"
              icon={Building}
              label={currentLang === "ar" ? "الأقسام" : "Departments"}
              count={linkedDepartments.length}
            />

            <TabButton
              id="rosters"
              icon={Calendar}
              label={currentLang === "ar" ? "الروسترات" : "Rosters"}
              count={rosters.length}
            />

            <TabButton
              id="heads"
              icon={Award}
              label={currentLang === "ar" ? "الرؤساء" : "Heads"}
            />
          </div>
        </div>

        {activeTab === "overview" && renderOverviewTab()}
        {activeTab === "doctors" && renderDoctorsTab()}
        {activeTab === "requests" && renderRequestsTab()}
        {activeTab === "departments" && renderDepartmentsTab()}
        {activeTab === "rosters" && renderRostersTab()}
        {activeTab === "heads" && renderHeadsTab()}
      </div>
    </div>
  )
}

export default SpecificCategory