import React, { useEffect, useMemo, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import {
  AlertTriangle,
  BarChart3,
  CheckCircle,
  Clock,
  Eye,
  RefreshCw,
  Search,
  ShieldCheck,
  Trash2,
  UserCheck,
  UserCog,
  UserMinus,
  Users,
  XCircle,
} from "lucide-react"

import {
  approveUser,
  deleteUser,
  getDeletedUsers,
  getPendingApprovalUsers,
  getRejectedUsers,
  getUserStatistics,
  getUserSummaries,
  quickSearchUsers,
  rejectUser,
  searchUsers,
  clearApproveUserState,
  clearDeleteUserState,
  clearQuickSearchResults,
  clearRejectUserState,
  setUsersFilters,
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

function UsersIndex() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { i18n } = useTranslation()
  const theme = getPageTheme()

  const currentLang = i18n.language || "ar"
  const isRTL = currentLang === "ar"

  const [activeTab, setActiveTab] = useState("overview")
  const [localSearch, setLocalSearch] = useState("")
  const [quickSearchTerm, setQuickSearchTerm] = useState("")

  const [lookupsLoading, setLookupsLoading] = useState(false)
  const [lookupsError, setLookupsError] = useState(null)
  const [categories, setCategories] = useState([])
  const [scientificDegrees, setScientificDegrees] = useState([])
  const [contractingTypes, setContractingTypes] = useState([])

  const {
    userSummaries,
    summariesPagination,
    filters,

    loadingGetUserSummaries,
    userSummariesError,

    userStatistics,
    loadingGetUserStatistics,
    userStatisticsError,

    pendingUsers,
    pendingUsersPagination,
    loadingGetPendingApprovalUsers,
    pendingUsersError,

    deletedUsers,
    deletedUsersPagination,
    loadingGetDeletedUsers,
    deletedUsersError,

    rejectedUsers,
    rejectedUsersPagination,
    loadingGetRejectedUsers,
    rejectedUsersError,

    searchResults,
    searchPagination,
    loadingSearchUsers,
    searchUsersError,

    quickSearchResults,
    loadingQuickSearchUsers,
    quickSearchUsersError,

    loadingApproveUser,
    approveUserSuccess,

    loadingRejectUser,
    rejectUserSuccess,

    loadingDeleteUser,
    deleteUserSuccess,
  } = useSelector((state) => state.users)

  useEffect(() => {
    fetchLookups()

    dispatch(getUserStatistics())
    dispatch(
      getUserSummaries({
        page: 1,
        pageSize: 10,
      })
    )
  }, [dispatch])

  useEffect(() => {
    if (activeTab === "overview") {
      dispatch(getUserStatistics())
      dispatch(
        getUserSummaries({
          page: filters.page || 1,
          pageSize: filters.pageSize || 10,
          search: filters.search,
          categoryId: filters.categoryId,
          scientificDegreeId: filters.scientificDegreeId,
          contractingTypeId: filters.contractingTypeId,
          isApproved: filters.isApproved,
          isEmailVerified: filters.isEmailVerified,
          createdFrom: filters.createdFrom,
          createdTo: filters.createdTo,
          sortBy: filters.sortBy,
          sortDirection: filters.sortDirection,
        })
      )
    }

    if (activeTab === "search" && localSearch.trim()) {
      dispatch(
        searchUsers({
          page: 1,
          pageSize: 10,
          search: localSearch,
        })
      )
    }

    if (activeTab === "pending") {
      dispatch(getPendingApprovalUsers({ page: 1, pageSize: 10 }))
    }

    if (activeTab === "deleted") {
      dispatch(getDeletedUsers({ page: 1, pageSize: 10 }))
    }

    if (activeTab === "rejected") {
      dispatch(getRejectedUsers({ page: 1, pageSize: 10 }))
    }
  }, [activeTab, dispatch])

  useEffect(() => {
    if (approveUserSuccess) {
      dispatch(clearApproveUserState())
      refreshCurrentTab()
    }
  }, [approveUserSuccess, dispatch])

  useEffect(() => {
    if (rejectUserSuccess) {
      dispatch(clearRejectUserState())
      refreshCurrentTab()
    }
  }, [rejectUserSuccess, dispatch])

  useEffect(() => {
    if (deleteUserSuccess) {
      dispatch(clearDeleteUserState())
      refreshCurrentTab()
    }
  }, [deleteUserSuccess, dispatch])

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
          "Failed to load filter lists"
      )
    } finally {
      setLookupsLoading(false)
    }
  }

  const refreshCurrentTab = () => {
    dispatch(getUserStatistics())

    if (activeTab === "overview") {
      dispatch(
        getUserSummaries({
          ...filters,
          page: filters.page || 1,
          pageSize: filters.pageSize || 10,
        })
      )
    }

    if (activeTab === "search") {
      dispatch(
        searchUsers({
          page: 1,
          pageSize: 10,
          search: localSearch,
        })
      )
    }

    if (activeTab === "pending") {
      dispatch(getPendingApprovalUsers({ page: 1, pageSize: 10 }))
    }

    if (activeTab === "deleted") {
      dispatch(getDeletedUsers({ page: 1, pageSize: 10 }))
    }

    if (activeTab === "rejected") {
      dispatch(getRejectedUsers({ page: 1, pageSize: 10 }))
    }

    if (activeTab === "quick" && quickSearchTerm.trim()) {
      dispatch(
        quickSearchUsers({
          search: quickSearchTerm,
          limit: 10,
        })
      )
    }
  }

  const handleMainSearch = (event) => {
    event?.preventDefault?.()

    const nextFilters = {
      ...filters,
      search: localSearch,
      page: 1,
      pageSize: filters.pageSize || 10,
    }

    dispatch(setUsersFilters(nextFilters))

    if (activeTab === "overview") {
      dispatch(getUserSummaries(nextFilters))
    }

    if (activeTab === "search") {
      dispatch(
        searchUsers({
          search: localSearch,
          page: 1,
          pageSize: 10,
        })
      )
    }
  }

  const handleFilterChange = (field, value) => {
    dispatch(
      setUsersFilters({
        [field]: value,
        page: 1,
      })
    )
  }

  const handleClearFilters = () => {
    const cleared = {
      categoryId: "",
      scientificDegreeId: "",
      contractingTypeId: "",
      isApproved: "",
      isEmailVerified: "",
      createdFrom: "",
      createdTo: "",
      page: 1,
      pageSize: filters.pageSize || 10,
      search: "",
      sortBy: "",
      sortDirection: 0,
    }

    setLocalSearch("")
    dispatch(setUsersFilters(cleared))
    dispatch(getUserSummaries(cleared))
  }

  const handlePageChange = (newPage) => {
    if (!newPage || newPage < 1) return

    if (activeTab === "overview") {
      const nextFilters = {
        ...filters,
        page: newPage,
        pageSize: filters.pageSize || 10,
      }

      dispatch(setUsersFilters({ page: newPage }))
      dispatch(getUserSummaries(nextFilters))
    }

    if (activeTab === "search") {
      dispatch(
        searchUsers({
          search: localSearch,
          page: newPage,
          pageSize: 10,
        })
      )
    }

    if (activeTab === "pending") {
      dispatch(
        getPendingApprovalUsers({
          page: newPage,
          pageSize: 10,
        })
      )
    }

    if (activeTab === "deleted") {
      dispatch(
        getDeletedUsers({
          page: newPage,
          pageSize: 10,
        })
      )
    }

    if (activeTab === "rejected") {
      dispatch(
        getRejectedUsers({
          page: newPage,
          pageSize: 10,
        })
      )
    }
  }

  const handleQuickSearch = (event) => {
    event?.preventDefault?.()

    if (!quickSearchTerm.trim()) {
      dispatch(clearQuickSearchResults())
      return
    }

    dispatch(
      quickSearchUsers({
        search: quickSearchTerm,
        limit: 10,
      })
    )
  }

  const handleApprove = (userId) => {
    if (!userId) return
    dispatch(approveUser(userId))
  }

  const handleReject = (userId) => {
    if (!userId) return
    dispatch(rejectUser(userId))
  }

  const handleDelete = (userId) => {
    if (!userId) return

    const reason = window.prompt(
      currentLang === "ar"
        ? "اكتب سبب حذف المستخدم:"
        : "Write deletion reason:"
    )

    if (!reason) return

    dispatch(
      deleteUser({
        id: userId,
        deletedReason: reason,
      })
    )
  }

  const stats = userStatistics || {}

  const summaryCards = [
    {
      title: currentLang === "ar" ? "إجمالي المستخدمين" : "Total Users",
      value: stats.totalUsers ?? 0,
      icon: Users,
      tone: "blue",
    },
    {
      title: currentLang === "ar" ? "نشطين" : "Active",
      value: stats.activeUsers ?? 0,
      icon: CheckCircle,
      tone: "green",
    },
    {
      title: currentLang === "ar" ? "قيد الموافقة" : "Pending",
      value: stats.pendingApprovals ?? 0,
      icon: Clock,
      tone: "yellow",
    },
    {
      title: currentLang === "ar" ? "مقبولين" : "Approved",
      value: stats.approvedUsers ?? 0,
      icon: ShieldCheck,
      tone: "purple",
    },
    {
      title: currentLang === "ar" ? "محذوفين" : "Deleted",
      value: stats.deletedUsers ?? 0,
      icon: Trash2,
      tone: "red",
    },
    {
      title: currentLang === "ar" ? "مرفوضين" : "Rejected",
      value: stats.rejectedUsers ?? 0,
      icon: XCircle,
      tone: "orange",
    },
  ]

  const currentList = useMemo(() => {
    if (activeTab === "overview") return userSummaries
    if (activeTab === "search") return searchResults
    if (activeTab === "pending") return pendingUsers
    if (activeTab === "deleted") return deletedUsers
    if (activeTab === "rejected") return rejectedUsers
    return []
  }, [
    activeTab,
    userSummaries,
    searchResults,
    pendingUsers,
    deletedUsers,
    rejectedUsers,
  ])

  const currentPagination = useMemo(() => {
    if (activeTab === "overview") return summariesPagination
    if (activeTab === "search") return searchPagination
    if (activeTab === "pending") return pendingUsersPagination
    if (activeTab === "deleted") return deletedUsersPagination
    if (activeTab === "rejected") return rejectedUsersPagination
    return null
  }, [
    activeTab,
    summariesPagination,
    searchPagination,
    pendingUsersPagination,
    deletedUsersPagination,
    rejectedUsersPagination,
  ])

  const isCurrentLoading =
    loadingGetUserSummaries ||
    loadingSearchUsers ||
    loadingGetPendingApprovalUsers ||
    loadingGetDeletedUsers ||
    loadingGetRejectedUsers

  const currentError =
    activeTab === "overview"
      ? userSummariesError
      : activeTab === "search"
      ? searchUsersError
      : activeTab === "pending"
      ? pendingUsersError
      : activeTab === "deleted"
      ? deletedUsersError
      : activeTab === "rejected"
      ? rejectedUsersError
      : null

  const getUserName = (user) => {
    return currentLang === "ar"
      ? user.nameArabic ||
          user.nameAr ||
          user.fullNameAr ||
          user.nameEnglish ||
          user.nameEn ||
          "-"
      : user.nameEnglish ||
          user.nameEn ||
          user.fullNameEn ||
          user.nameArabic ||
          user.nameAr ||
          "-"
  }

  const getCategoryName = (user) => {
    return currentLang === "ar"
      ? user.primaryCategoryNameAr ||
          user.categoryNameAr ||
          user.primaryCategory?.nameArabic ||
          "-"
      : user.primaryCategoryNameEn ||
          user.categoryNameEn ||
          user.primaryCategory?.nameEnglish ||
          "-"
  }

  const getRoleName = (user) => {
    return currentLang === "ar"
      ? user.roleNameAr || user.roleNameEn || "-"
      : user.roleNameEn || user.roleNameAr || "-"
  }

  const getDegreeName = (user) => {
    return currentLang === "ar"
      ? user.scientificDegreeNameAr ||
          user.scientificDegree?.nameArabic ||
          "-"
      : user.scientificDegreeNameEn ||
          user.scientificDegree?.nameEnglish ||
          "-"
  }

  const getContractingName = (user) => {
    return currentLang === "ar"
      ? user.contractingTypeNameAr ||
          user.contractingType?.nameArabic ||
          "-"
      : user.contractingTypeNameEn ||
          user.contractingType?.nameEnglish ||
          "-"
  }

  return (
    <div className={theme.page} dir={isRTL ? "rtl" : "ltr"}>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-[var(--color-text)] flex items-center gap-3">
              <Users className="w-8 h-8 text-[var(--color-primary)]" />
              {currentLang === "ar" ? "إدارة المستخدمين" : "Users Management"}
            </h1>

            <p className="text-sm text-[var(--color-text-muted)] mt-2">
              {currentLang === "ar"
                ? "بحث، إدارة، موافقات، تحليلات، وتقارير المستخدمين والدكاترة."
                : "Search, manage, approve, analyze, and report users and doctors."}
            </p>
          </div>

          <button
            type="button"
            onClick={refreshCurrentTab}
            className={theme.secondaryButton}
          >
            <RefreshCw size={16} />
            {currentLang === "ar" ? "تحديث" : "Refresh"}
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
          {summaryCards.map((card) => (
            <StatCard key={card.title} {...card} />
          ))}
        </div>

        {loadingGetUserStatistics && (
          <InlineLoader
            text={
              currentLang === "ar"
                ? "جاري تحميل الإحصائيات..."
                : "Loading statistics..."
            }
          />
        )}

        {userStatisticsError && (
          <ErrorBox
            message={
              userStatisticsError?.message ||
              (currentLang === "ar"
                ? "تعذر تحميل الإحصائيات"
                : "Failed to load statistics")
            }
          />
        )}

        {lookupsError && <ErrorBox message={lookupsError} />}

        <div className={`${theme.card} p-4`}>
          <div className="flex flex-wrap gap-2">
            <TabButton
              id="overview"
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              icon={BarChart3}
              label={currentLang === "ar" ? "نظرة عامة" : "Overview"}
            />

            <TabButton
              id="search"
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              icon={Search}
              label={currentLang === "ar" ? "بحث" : "Search"}
            />

            <TabButton
              id="pending"
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              icon={Clock}
              label={currentLang === "ar" ? "قيد الموافقة" : "Pending"}
              count={stats.pendingApprovals || 0}
            />

            <TabButton
              id="deleted"
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              icon={Trash2}
              label={currentLang === "ar" ? "محذوفين" : "Deleted"}
              count={stats.deletedUsers || 0}
            />

            <TabButton
              id="rejected"
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              icon={XCircle}
              label={currentLang === "ar" ? "مرفوضين" : "Rejected"}
              count={stats.rejectedUsers || 0}
            />

            <TabButton
              id="quick"
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              icon={UserCog}
              label={currentLang === "ar" ? "بحث سريع" : "Quick Search"}
            />
          </div>
        </div>

        {activeTab !== "quick" && (
          <div className={`${theme.card} p-4`}>
            <form
              onSubmit={handleMainSearch}
              className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4"
            >
              <div>
                <label className="text-xs font-bold text-[var(--color-text-muted)] block mb-1">
                  {currentLang === "ar" ? "بحث" : "Search"}
                </label>

                <input
                  value={localSearch}
                  onChange={(event) => setLocalSearch(event.target.value)}
                  placeholder={
                    currentLang === "ar"
                      ? "اسم، بريد، رقم موبايل..."
                      : "Name, email, mobile..."
                  }
                  className={theme.input}
                />
              </div>

              {activeTab === "overview" && (
                <>
                  <SelectFilter
                    label={currentLang === "ar" ? "التخصص" : "Category"}
                    value={filters.categoryId}
                    onChange={(value) => handleFilterChange("categoryId", value)}
                    options={categories}
                    currentLang={currentLang}
                    theme={theme}
                    loading={lookupsLoading}
                  />

                  <SelectFilter
                    label={
                      currentLang === "ar" ? "الدرجة العلمية" : "Scientific Degree"
                    }
                    value={filters.scientificDegreeId}
                    onChange={(value) =>
                      handleFilterChange("scientificDegreeId", value)
                    }
                    options={scientificDegrees}
                    currentLang={currentLang}
                    theme={theme}
                    loading={lookupsLoading}
                  />

                  <SelectFilter
                    label={currentLang === "ar" ? "نوع التعاقد" : "Contract Type"}
                    value={filters.contractingTypeId}
                    onChange={(value) =>
                      handleFilterChange("contractingTypeId", value)
                    }
                    options={contractingTypes}
                    currentLang={currentLang}
                    theme={theme}
                    loading={lookupsLoading}
                  />

                  <SelectFilter
                    label={currentLang === "ar" ? "حالة الموافقة" : "Approval"}
                    value={filters.isApproved}
                    onChange={(value) => handleFilterChange("isApproved", value)}
                    options={[
                      {
                        id: "true",
                        nameArabic: "مقبول",
                        nameEnglish: "Approved",
                      },
                      {
                        id: "false",
                        nameArabic: "غير مقبول",
                        nameEnglish: "Not Approved",
                      },
                    ]}
                    currentLang={currentLang}
                    theme={theme}
                  />

                  <SelectFilter
                    label={
                      currentLang === "ar"
                        ? "تفعيل البريد"
                        : "Email Verification"
                    }
                    value={filters.isEmailVerified}
                    onChange={(value) =>
                      handleFilterChange("isEmailVerified", value)
                    }
                    options={[
                      {
                        id: "true",
                        nameArabic: "البريد مفعل",
                        nameEnglish: "Verified",
                      },
                      {
                        id: "false",
                        nameArabic: "البريد غير مفعل",
                        nameEnglish: "Not Verified",
                      },
                    ]}
                    currentLang={currentLang}
                    theme={theme}
                  />

                  <DateFilter
                    label={currentLang === "ar" ? "من تاريخ" : "Created From"}
                    value={filters.createdFrom}
                    onChange={(value) => handleFilterChange("createdFrom", value)}
                    theme={theme}
                  />

                  <DateFilter
                    label={currentLang === "ar" ? "إلى تاريخ" : "Created To"}
                    value={filters.createdTo}
                    onChange={(value) => handleFilterChange("createdTo", value)}
                    theme={theme}
                  />
                </>
              )}

              <div className="xl:col-span-4 flex justify-end gap-3 flex-wrap">
                {activeTab === "overview" && (
                  <button
                    type="button"
                    onClick={handleClearFilters}
                    className={theme.secondaryButton}
                  >
                    {currentLang === "ar" ? "مسح الفلاتر" : "Clear Filters"}
                  </button>
                )}

                <button type="submit" className={theme.primaryButton}>
                  <Search size={16} />
                  {currentLang === "ar" ? "بحث" : "Search"}
                </button>
              </div>
            </form>
          </div>
        )}

        {activeTab === "quick" ? (
          <QuickSearchTab
            currentLang={currentLang}
            theme={theme}
            quickSearchTerm={quickSearchTerm}
            setQuickSearchTerm={setQuickSearchTerm}
            handleQuickSearch={handleQuickSearch}
            loadingQuickSearchUsers={loadingQuickSearchUsers}
            quickSearchUsersError={quickSearchUsersError}
            quickSearchResults={quickSearchResults}
            getUserName={getUserName}
            getCategoryName={getCategoryName}
            getDegreeName={getDegreeName}
            getContractingName={getContractingName}
            navigate={navigate}
          />
        ) : (
          <div className={`${theme.card} overflow-hidden`}>
            <div className="p-4 border-b border-[var(--color-border)] flex items-center justify-between gap-3 flex-wrap">
              <div>
                <h2 className="text-xl font-extrabold text-[var(--color-text)]">
                  {getTabTitle(activeTab, currentLang)}
                </h2>

                <p className="text-sm text-[var(--color-text-muted)] mt-1">
                  {currentLang === "ar"
                    ? `إجمالي النتائج: ${
                        currentPagination?.totalCount ?? currentList.length
                      }`
                    : `Total results: ${
                        currentPagination?.totalCount ?? currentList.length
                      }`}
                </p>
              </div>
            </div>

            {isCurrentLoading ? (
              <InlineLoader
                text={
                  currentLang === "ar"
                    ? "جاري تحميل المستخدمين..."
                    : "Loading users..."
                }
              />
            ) : currentError ? (
              <ErrorBox
                message={
                  currentError?.message ||
                  (currentLang === "ar"
                    ? "حدث خطأ أثناء تحميل البيانات"
                    : "Failed to load data")
                }
              />
            ) : currentList.length === 0 ? (
              <EmptyState
                title={
                  currentLang === "ar"
                    ? "لا توجد نتائج"
                    : "No results found"
                }
                description={
                  currentLang === "ar"
                    ? "لا توجد بيانات مطابقة للعرض الحالي."
                    : "No matching data for the current view."
                }
              />
            ) : (
              <UsersTable
                users={currentList}
                activeTab={activeTab}
                currentLang={currentLang}
                getUserName={getUserName}
                getCategoryName={getCategoryName}
                getRoleName={getRoleName}
                handleApprove={handleApprove}
                handleReject={handleReject}
                handleDelete={handleDelete}
                loadingApproveUser={loadingApproveUser}
                loadingRejectUser={loadingRejectUser}
                loadingDeleteUser={loadingDeleteUser}
                navigate={navigate}
              />
            )}

            {currentPagination && (
              <PaginationFooter
                pagination={currentPagination}
                currentLang={currentLang}
                onPageChange={handlePageChange}
                loading={isCurrentLoading}
              />
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function getTabTitle(activeTab, currentLang) {
  const map = {
    overview: currentLang === "ar" ? "كل المستخدمين" : "All Users",
    search: currentLang === "ar" ? "نتائج البحث" : "Search Results",
    pending: currentLang === "ar" ? "مستخدمون قيد الموافقة" : "Pending Users",
    deleted: currentLang === "ar" ? "مستخدمون محذوفون" : "Deleted Users",
    rejected: currentLang === "ar" ? "مستخدمون مرفوضون" : "Rejected Users",
  }

  return map[activeTab] || "-"
}

function SelectFilter({
  label,
  value,
  onChange,
  options,
  currentLang,
  theme,
  loading,
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
            : currentLang === "ar"
            ? "الكل"
            : "All"}
        </option>

        {options.map((item) => (
          <option key={item.id} value={String(item.id)}>
            {currentLang === "ar"
              ? item.nameArabic || item.nameAr || item.nameEnglish || item.nameEn
              : item.nameEnglish || item.nameEn || item.nameArabic || item.nameAr}
          </option>
        ))}
      </select>
    </div>
  )
}

function DateFilter({ label, value, onChange, theme }) {
  return (
    <div>
      <label className="text-xs font-bold text-[var(--color-text-muted)] block mb-1">
        {label}
      </label>

      <input
        type="date"
        value={value || ""}
        onChange={(event) => onChange(event.target.value)}
        className={theme.input}
      />
    </div>
  )
}

function UsersTable({
  users,
  activeTab,
  currentLang,
  getUserName,
  getCategoryName,
  getRoleName,
  handleApprove,
  handleReject,
  handleDelete,
  loadingApproveUser,
  loadingRejectUser,
  loadingDeleteUser,
  navigate,
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[980px]">
        <thead className="bg-[var(--color-surface-muted)] border-b border-[var(--color-border)]">
          <tr>
            <TableHead label={currentLang === "ar" ? "المستخدم" : "User"} />
            <TableHead label={currentLang === "ar" ? "التواصل" : "Contact"} />
            <TableHead label={currentLang === "ar" ? "الدور" : "Role"} />
            <TableHead label={currentLang === "ar" ? "التخصص" : "Category"} />
            <TableHead label={currentLang === "ar" ? "الحالة" : "Status"} />
            <TableHead
              label={currentLang === "ar" ? "آخر دخول" : "Last Login"}
            />
            <TableHead label={currentLang === "ar" ? "إجراءات" : "Actions"} />
          </tr>
        </thead>

        <tbody>
          {users.map((user) => {
            const roleName = getRoleName(user)
            const isDoctor =
              user.roleNameEn === "Doctor" ||
              user.roleNameAr === "طبيب" ||
              roleName === "Doctor" ||
              roleName === "طبيب"

            return (
              <tr
                key={user.id}
                className="border-b border-[var(--color-border)] hover:bg-[var(--color-surface-muted)] transition-colors"
              >
                <td className="p-4">
                  <div>
                    <p className="font-extrabold text-[var(--color-text)]">
                      {getUserName(user)}
                    </p>

                    <p className="text-xs text-[var(--color-text-muted)] mt-1">
                      ID: {user.id}
                      {user.printNumber !== undefined &&
                      user.printNumber !== null
                        ? ` | Print: ${user.printNumber}`
                        : ""}
                    </p>
                  </div>
                </td>

                <td className="p-4">
                  <p className="text-sm font-semibold text-[var(--color-text)]">
                    {user.email || "-"}
                  </p>
                  <p className="text-xs text-[var(--color-text-muted)] mt-1">
                    {user.mobile || "-"}
                  </p>
                </td>

                <td className="p-4">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-[var(--color-neutral-soft)] text-[var(--color-neutral)] border border-[var(--color-neutral-border)]">
                    {roleName}
                  </span>
                </td>

                <td className="p-4">
                  <p className="text-sm text-[var(--color-text)]">
                    {getCategoryName(user)}
                  </p>
                </td>

                <td className="p-4">
                  <div className="space-y-1">
                    <StatusBadge
                      enabled={user.isActive}
                      trueText={currentLang === "ar" ? "نشط" : "Active"}
                      falseText={
                        currentLang === "ar" ? "غير نشط" : "Inactive"
                      }
                    />

                    {user.isApproved !== undefined && (
                      <StatusBadge
                        enabled={user.isApproved}
                        trueText={currentLang === "ar" ? "مقبول" : "Approved"}
                        falseText={
                          currentLang === "ar" ? "غير مقبول" : "Not Approved"
                        }
                      />
                    )}
                  </div>
                </td>

                <td className="p-4 text-sm text-[var(--color-text-muted)]">
                  {user.lastLoginAt ? formatDate(user.lastLoginAt) : "-"}
                </td>

                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => navigate(`/admin-panel/users/${user.id}`)}
                      className="p-2 rounded-lg bg-[var(--color-primary-soft)] text-[var(--color-primary)] hover:bg-[var(--color-primary-muted)] border border-[var(--color-primary)]/20 transition-colors"
                      title={currentLang === "ar" ? "عرض" : "View"}
                    >
                      <Eye size={16} />
                    </button>

                    {isDoctor && (
                      <button
                        type="button"
                        onClick={() =>
                          navigate(
                            `/admin-panel/users/doctor-analytics/${user.id}`
                          )
                        }
                        className="p-2 rounded-lg bg-[var(--color-purple-soft)] text-[var(--color-purple)] hover:bg-[var(--color-purple-soft)] border border-[var(--color-purple-border)] transition-colors"
                        title={
                          currentLang === "ar"
                            ? "تحليلات الدكتور"
                            : "Doctor Analytics"
                        }
                      >
                        <BarChart3 size={16} />
                      </button>
                    )}

                    {activeTab === "pending" && (
                      <>
                        <button
                          type="button"
                          disabled={loadingApproveUser}
                          onClick={() => handleApprove(user.id)}
                          className="p-2 rounded-lg bg-[var(--color-success-soft)] text-[var(--color-success)] hover:opacity-85 border border-[var(--color-success-border)] transition-colors disabled:opacity-50"
                        >
                          <UserCheck size={16} />
                        </button>

                        <button
                          type="button"
                          disabled={loadingRejectUser}
                          onClick={() => handleReject(user.id)}
                          className="p-2 rounded-lg bg-[var(--color-danger-soft)] text-[var(--color-danger)] hover:opacity-85 border border-[var(--color-danger-border)] transition-colors disabled:opacity-50"
                        >
                          <UserMinus size={16} />
                        </button>
                      </>
                    )}

                    {activeTab !== "deleted" && (
                      <button
                        type="button"
                        disabled={loadingDeleteUser}
                        onClick={() => handleDelete(user.id)}
                        className="p-2 rounded-lg bg-[var(--color-danger-soft)] text-[var(--color-danger)] hover:opacity-85 border border-[var(--color-danger-border)] transition-colors disabled:opacity-50"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

function QuickSearchTab({
  currentLang,
  theme,
  quickSearchTerm,
  setQuickSearchTerm,
  handleQuickSearch,
  loadingQuickSearchUsers,
  quickSearchUsersError,
  quickSearchResults,
  getUserName,
  getCategoryName,
  getDegreeName,
  getContractingName,
  navigate,
}) {
  return (
    <div className="space-y-5">
      <div className={`${theme.card} p-5`}>
        <form
          onSubmit={handleQuickSearch}
          className="grid grid-cols-1 md:grid-cols-5 gap-3"
        >
          <div className="md:col-span-4">
            <label className="text-xs font-bold text-[var(--color-text-muted)] block mb-1">
              {currentLang === "ar"
                ? "بحث سريع عن دكتور"
                : "Quick Doctor Search"}
            </label>

            <input
              value={quickSearchTerm}
              onChange={(event) => setQuickSearchTerm(event.target.value)}
              placeholder={
                currentLang === "ar" ? "مثال: محمد" : "Example: Mohamed"
              }
              className={theme.input}
            />
          </div>

          <div className="flex items-end">
            <button type="submit" className={`${theme.primaryButton} w-full`}>
              <Search size={16} />
              {currentLang === "ar" ? "بحث" : "Search"}
            </button>
          </div>
        </form>
      </div>

      <div className={`${theme.card} p-5`}>
        {loadingQuickSearchUsers ? (
          <InlineLoader
            text={
              currentLang === "ar"
                ? "جاري البحث السريع..."
                : "Quick searching..."
            }
          />
        ) : quickSearchUsersError ? (
          <ErrorBox message={quickSearchUsersError?.message} />
        ) : quickSearchResults.length === 0 ? (
          <EmptyState
            title={currentLang === "ar" ? "لا توجد نتائج" : "No results"}
            description={
              currentLang === "ar"
                ? "اكتب كلمة بحث لعرض نتائج البحث السريع."
                : "Type a search term to show quick results."
            }
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {quickSearchResults.map((user) => {
              const today = user.todayStatus || {}
              const tomorrow = user.tomorrowSchedule || {}

              return (
                <div
                  key={user.id}
                  className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5"
                >
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div>
                      <h3 className="text-lg font-extrabold text-[var(--color-text)]">
                        {getUserName(user)}
                      </h3>

                      <p className="text-sm text-[var(--color-text-muted)] mt-1">
                        {user.mobile || "-"}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => navigate(`/admin-panel/users/${user.id}`)}
                      className="p-2 rounded-lg bg-[var(--color-primary-soft)] text-[var(--color-primary)] hover:bg-[var(--color-primary-muted)] border border-[var(--color-primary)]/20 transition-colors"
                    >
                      <Eye size={16} />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                    <MiniInfo
                      label={currentLang === "ar" ? "التخصص" : "Category"}
                      value={getCategoryName(user)}
                    />

                    <MiniInfo
                      label={currentLang === "ar" ? "الدرجة" : "Degree"}
                      value={getDegreeName(user)}
                    />

                    <MiniInfo
                      label={currentLang === "ar" ? "التعاقد" : "Contract"}
                      value={getContractingName(user)}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="p-4 rounded-xl bg-[var(--color-surface-muted)] border border-[var(--color-border)]">
                      <p className="text-xs font-bold text-[var(--color-text-muted)] mb-2">
                        {currentLang === "ar" ? "حالة اليوم" : "Today Status"}
                      </p>

                      <p className="text-sm font-bold text-[var(--color-text)]">
                        {today.hasShift
                          ? currentLang === "ar"
                            ? "لديه شفت اليوم"
                            : "Has shift today"
                          : currentLang === "ar"
                          ? "لا يوجد شفت اليوم"
                          : "No shift today"}
                      </p>

                      <p className="text-xs text-[var(--color-text-muted)] mt-2">
                        {currentLang === "ar"
                          ? today.departmentNameAr || "-"
                          : today.departmentNameEn || "-"}
                      </p>

                      <p className="text-xs text-[var(--color-text-muted)] mt-1">
                        {today.shiftStartTime || "-"} -{" "}
                        {today.shiftEndTime || "-"}
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-[var(--color-surface-muted)] border border-[var(--color-border)]">
                      <p className="text-xs font-bold text-[var(--color-text-muted)] mb-2">
                        {currentLang === "ar"
                          ? "جدول بكرة"
                          : "Tomorrow Schedule"}
                      </p>

                      <p className="text-sm font-bold text-[var(--color-text)]">
                        {currentLang === "ar"
                          ? tomorrow.departmentNameAr || "-"
                          : tomorrow.departmentNameEn || "-"}
                      </p>

                      <p className="text-xs text-[var(--color-text-muted)] mt-2">
                        {currentLang === "ar"
                          ? tomorrow.dayNameAr || "-"
                          : tomorrow.dayNameEn || "-"}
                      </p>

                      <p className="text-xs text-[var(--color-text-muted)] mt-1">
                        {tomorrow.startTime || "-"} - {tomorrow.endTime || "-"}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

function PaginationFooter({ pagination, currentLang, onPageChange, loading }) {
  const currentPage = pagination?.page || 1
  const totalPages = pagination?.totalPages || 1
  const hasPrevious = pagination?.hasPrevious ?? currentPage > 1
  const hasNext = pagination?.hasNext ?? currentPage < totalPages

  return (
    <div className="p-4 border-t border-[var(--color-border)] flex items-center justify-between gap-3 flex-wrap">
      <div className="text-sm text-[var(--color-text-muted)]">
        <p>
          {currentLang === "ar"
            ? `صفحة ${currentPage} من ${totalPages}`
            : `Page ${currentPage} of ${totalPages}`}
        </p>

        <p className="mt-1">
          {currentLang === "ar"
            ? `من ${pagination.startIndex} إلى ${pagination.endIndex} من ${pagination.totalCount}`
            : `${pagination.startIndex} - ${pagination.endIndex} of ${pagination.totalCount}`}
        </p>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={!hasPrevious || loading}
          onClick={() => onPageChange(currentPage - 1)}
          className="px-4 py-2 rounded-xl text-sm font-bold border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] hover:bg-[var(--color-surface-muted)] disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {currentLang === "ar" ? "السابق" : "Previous"}
        </button>

        <span className="px-4 py-2 rounded-xl text-sm font-bold bg-[var(--color-primary)] text-white">
          {currentPage}
        </span>

        <button
          type="button"
          disabled={!hasNext || loading}
          onClick={() => onPageChange(currentPage + 1)}
          className="px-4 py-2 rounded-xl text-sm font-bold border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] hover:bg-[var(--color-surface-muted)] disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {currentLang === "ar" ? "التالي" : "Next"}
        </button>
      </div>
    </div>
  )
}

function StatCard({ title, value, icon: Icon, tone = "blue" }) {
  const toneMap = {
    blue: {
      bg: "bg-[var(--color-primary-soft)]",
      text: "text-[var(--color-primary)]",
      border: "border-[var(--color-primary)]/25",
    },
    green: {
      bg: "bg-[var(--color-success-soft)]",
      text: "text-[var(--color-success)]",
      border: "border-[var(--color-success-border)]",
    },
    yellow: {
      bg: "bg-[var(--color-warning-soft)]",
      text: "text-[var(--color-warning)]",
      border: "border-[var(--color-warning-border)]",
    },
    purple: {
      bg: "bg-[var(--color-purple-soft)]",
      text: "text-[var(--color-purple)]",
      border: "border-[var(--color-purple-border)]",
    },
    red: {
      bg: "bg-[var(--color-danger-soft)]",
      text: "text-[var(--color-danger)]",
      border: "border-[var(--color-danger-border)]",
    },
    orange: {
      bg: "bg-[var(--color-warning-soft)]",
      text: "text-[var(--color-warning)]",
      border: "border-[var(--color-warning-border)]",
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
          className={`w-12 h-12 rounded-xl flex items-center justify-center border ${toneStyle.bg} ${toneStyle.text} ${toneStyle.border}`}
        >
          <Icon size={22} />
        </div>
      </div>
    </div>
  )
}

function TabButton({ id, activeTab, setActiveTab, icon: Icon, label, count }) {
  const isActive = activeTab === id

  return (
    <button
      type="button"
      onClick={() => setActiveTab(id)}
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border transition-colors ${
        isActive
          ? "bg-[var(--color-primary)] text-white border-[var(--color-primary)] shadow-[var(--shadow-sm)]"
          : "bg-[var(--color-surface)] text-[var(--color-text-muted)] border-[var(--color-border)] hover:bg-[var(--color-surface-muted)] hover:text-[var(--color-text)]"
      }`}
    >
      <Icon size={16} />
      {label}
      {count !== undefined && (
        <span
          className={`px-2 py-0.5 rounded-full text-[11px] ${
            isActive
              ? "bg-white/20 text-white"
              : "bg-[var(--color-surface-muted)] text-[var(--color-text-muted)] border border-[var(--color-border)]"
          }`}
        >
          {count}
        </span>
      )}
    </button>
  )
}

function TableHead({ label }) {
  return (
    <th className="p-4 text-start text-xs font-extrabold text-[var(--color-text-muted)] uppercase">
      {label}
    </th>
  )
}

function StatusBadge({ enabled, trueText, falseText }) {
  return (
    <span
      className={`inline-flex px-2.5 py-1 rounded-full text-[11px] font-bold border ${
        enabled
          ? "bg-[var(--color-success-soft)] text-[var(--color-success)] border-[var(--color-success-border)]"
          : "bg-[var(--color-danger-soft)] text-[var(--color-danger)] border-[var(--color-danger-border)]"
      }`}
    >
      {enabled ? trueText : falseText}
    </span>
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

function InlineLoader({ text }) {
  return (
    <div className="p-8 text-center">
      <div className="w-9 h-9 mx-auto mb-4 rounded-full border-4 border-[var(--color-border)] border-t-[var(--color-primary)] animate-spin" />
      <p className="text-sm font-bold text-[var(--color-text-muted)]">{text}</p>
    </div>
  )
}

function EmptyState({ title, description }) {
  return (
    <div className="p-8 text-center rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)]">
      <Users className="w-12 h-12 mx-auto mb-3 text-[var(--color-text-muted)]" />
      <h3 className="text-lg font-extrabold text-[var(--color-text)]">
        {title}
      </h3>
      <p className="text-sm text-[var(--color-text-muted)] mt-2">
        {description}
      </p>
    </div>
  )
}

function ErrorBox({ message }) {
  return (
    <div className="p-5 rounded-2xl bg-[var(--color-danger-soft)] text-[var(--color-danger)] border border-[var(--color-danger-border)]">
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 mt-0.5" />
        <p className="text-sm font-bold">{message || "Error"}</p>
      </div>
    </div>
  )
}

export default UsersIndex
