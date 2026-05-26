// pages/ManagementRoles/SpecifiedManagementRole.jsx
import React, { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useTranslation } from "react-i18next"
import { useParams, useNavigate, Link, Navigate } from "react-router-dom"
import { toast } from "react-toastify"
import "../../../styles/general.css"

import {
  ArrowLeft,
  Shield,
  Users,
  User,
  Settings,
  CheckCircle,
  History,
  Search,
  Phone,
  UserCheck,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
} from "lucide-react"

// Import only the allowed actions
import {
  getRolePermissions,
  getManagementRoleHistory,
  getManagementRoleUsers,
} from "../../../state/act/actManagementRole"

// Import slice selectors
import {
  selectLoading,
  selectError,
  selectSuccess,
} from "../../../state/slices/managementRole.js"

import LoadingGetData from "../../../components/LoadingGetData.jsx"
import i18next from "i18next"
import { formatDate } from "../../../utils/formtDate.js"

function SpecifiedManagementRole() {
  const { t, i18n } = useTranslation()
  const dispatch = useDispatch()
  const { id } = useParams()
  // Selectors
  const loading = useSelector(selectLoading)
  const error = useSelector(selectError)
  const success = useSelector(selectSuccess)
  const {
    permissions,
    assignmentHistory,
    roleUsers,
    roleUsersPagination,
    assignmentHistoryPagination,
  } = useSelector((state) => state.managementRoles)

  const { mymode } = useSelector((state) => state.mode)
  const navigate = useNavigate()
  // Local state
  const [activeTab, setActiveTab] = useState("overview")

  // Users tab state - matching API parameters
  const [usersSearchTerm, setUsersSearchTerm] = useState("")
  const [usersFilters, setUsersFilters] = useState({
    page: 1,
    pageSize: 10,
    sortBy: "NameEnglish", // API default
    sortDirection: "Asc", // API default
    isActive: undefined, // Optional boolean
  })

  // History tab state - matching API parameters
  const [historyFilters, setHistoryFilters] = useState({
    page: 1,
    pageSize: 10,
  })

  // Theme and language
  const isDark = mymode === "dark"
  const language = i18n.language
  const isRTL = language === "ar"

  useEffect(() => {
    dispatch(getRolePermissions(id))
    dispatch(
      getManagementRoleUsers({
        id: id, // Using id as type parameter
        params: {
          page: usersFilters.page,
          pageSize: usersFilters.pageSize,
          search: usersSearchTerm || undefined,
          sortBy: usersFilters.sortBy,
          sortDirection: usersFilters.sortDirection,
          isActive: usersFilters.isActive,
        },
      })
    )
    dispatch(
      getManagementRoleHistory({
        id: id,
        params: {
          page: historyFilters.page,
          pageSize: historyFilters.pageSize,
        },
      })
    )
  }, [id])

  useEffect(() => {
    if (id && activeTab) {
      switch (activeTab) {
        case "overview":
          // Overview data would need to be loaded separately if available
          break
        case "permissions":
          if (!permissions?.length) {
            dispatch(getRolePermissions(id))
          }
          break
        case "users":
          if (!roleUsers?.length) {
            dispatch(
              getManagementRoleUsers({
                id: id, // Using id as type parameter
                params: {
                  page: usersFilters.page,
                  pageSize: usersFilters.pageSize,
                  search: usersSearchTerm || undefined,
                  sortBy: usersFilters.sortBy,
                  sortDirection: usersFilters.sortDirection,
                  isActive: usersFilters.isActive,
                },
              })
            )
          }

          break
        case "history":
          if (!assignmentHistory?.length) {
            dispatch(
              getManagementRoleHistory({
                id: id,
                params: {
                  page: historyFilters.page,
                  pageSize: historyFilters.pageSize,
                },
              })
            )
          }
          break
        default:
          break
      }
    }
  }, [activeTab])

  useEffect(() => {
    dispatch(
      getManagementRoleUsers({
        id: id, // Using id as type parameter
        params: {
          page: usersFilters.page,
          pageSize: usersFilters.pageSize,
          search: usersSearchTerm || undefined,
          sortBy: usersFilters.sortBy,
          sortDirection: usersFilters.sortDirection,
          isActive: usersFilters.isActive,
        },
      })
    )
  }, [usersFilters])

  useEffect(() => {
    dispatch(
      getManagementRoleHistory({
        id: id,
        params: {
          page: historyFilters.page,
          pageSize: historyFilters.pageSize,
        },
      })
    )
  }, [historyFilters])

  // Handle success/error messages

  useEffect(() => {
    if (success) {
      toast.success(success)
    }
  }, [success])

  useEffect(() => {
    if (error) {
      toast.error(error)
    }
  }, [error])

  // Format date

  // Users search and pagination handlers
  const handleUsersSearch = (e) => {
    setUsersSearchTerm(e.target.value)
  }

  const searchButton = () => {
    setUsersFilters((prev) => ({ ...prev, page: 1 }))
  }
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault() // Prevent form submission if inside a form
      searchButton()
    }
  }
  const handleUsersPageChange = (newPage) => {
    setUsersFilters((prev) => ({ ...prev, page: newPage }))
  }

  const handleUsersSortChange = (sortBy, sortDirection) => {
    setUsersFilters((prev) => ({
      ...prev,
      sortBy,
      sortDirection,
    }))
  }

  const handleUsersActiveFilter = (isActive) => {
    setUsersFilters((prev) => ({
      ...prev,
      isActive,
    }))
  }

  // History pagination handlers
  const handleHistoryPageChange = (newPage) => {
    setHistoryFilters((prev) => ({ ...prev, page: newPage }))
  }
  const currentLang = i18next.language
  // Loading states
  if (loading.roleUsers || loading.permissions || loading.history) {
    return <LoadingGetData text={t("gettingData.roleData")} />
  }

  // if (!currentRole) {
  //   return (
  //     <div
  //       className={`min-h-screen flex items-center justify-center ${
  //         isDark ? "bg-gray-900" : "bg-gray-50"
  //       }`}
  //     >
  //       <div className="text-center">
  //         <AlertTriangle
  //           className={`mx-auto h-12 w-12 mb-4 ${
  //             isDark ? "text-gray-400" : "text-gray-500"
  //           }`}
  //         />
  //         <h3
  //           className={`text-lg font-medium mb-2 ${
  //             isDark ? "text-white" : "text-gray-900"
  //           }`}
  //         >
  //           {t("managementRoles.notFound") || "Role Not Found"}
  //         </h3>
  //         <p className={`mb-4 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
  //           {t("managementRoles.notFoundDescription") ||
  //             "The requested role could not be found."}
  //         </p>
  //         <Link
  //           to="/admin-panel/management-roles"
  //           className="inline-flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
  //         >
  //           <ArrowLeft size={16} className={isRTL ? "ml-2" : "mr-2"} />
  //           {t("managementRoles.backToList") || "Back to Roles"}
  //         </Link>
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <div
      className={`min-h-screen ${isDark ? "bg-gray-900" : "bg-gray-50"}`}
      dir={isRTL ? "rtl" : "ltr"}
    >
      <div className="p-4 sm:p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div className="flex items-center gap-4">
                <Link
                  to="/admin-panel/management-roles"
                  className={`p-2 rounded-lg border transition-colors ${
                    isDark
                      ? "border-gray-600 hover:bg-gray-700 text-gray-300"
                      : "border-gray-300 hover:bg-gray-50 text-gray-700"
                  }`}
                >
                  {currentLang == "en" ? (
                    <ArrowLeft size={20} />
                  ) : (
                    <ArrowRight size={20} />
                  )}{" "}
                </Link>
                <div>
                  <h1
                    className={`text-2xl sm:text-3xl font-bold ${
                      isDark ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {language == "ar"
                      ? roleUsers[0]?.roleNameAr || id
                      : roleUsers[0]?.roleNameEn || id}{" "}
                  </h1>
                </div>
              </div>
            </div>

            {/* Status Badges */}
            <div className="flex flex-wrap gap-2 mb-6">
              {roleUsersPagination?.totalCount > 0 && (
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-transparent text-blue-500 border-2 border-blue-500 dark:bg-transparent dark:text-blue-500 dark:border-blue-500">
                  <Users size={14} className="inline mr-1" />
                  {roleUsersPagination.totalCount}{" "}
                  {t("managementRoles.users.users") || "Users"}
                </span>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div
            className={`border-b mb-6 ${
              isDark ? "border-gray-700" : "border-gray-200"
            }`}
          >
            <nav className="flex space-x-8">
              {[
                {
                  key: "overview",
                  label: t("managementRoles.tabs.overview") || "Overview",
                  icon: <Settings size={16} />,
                },
                {
                  key: "permissions",
                  label: t("managementRoles.tabs.permissions") || "Permissions",
                  icon: <Shield size={16} />,
                },
                {
                  key: "users",
                  label: t("managementRoles.tabs.users") || "Assigned Users",
                  icon: <Users size={16} />,
                },
                {
                  key: "history",
                  label:
                    t("managementRoles.tabs.history") || "Assignment History",
                  icon: <History size={16} />,
                },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors flex items-center gap-2 ${
                    activeTab === tab.key
                      ? "border-blue-500 text-blue-500 dark:text-blue-500"
                      : `border-transparent hover:border-gray-300 ${
                          isDark
                            ? "text-gray-400 hover:text-gray-300"
                            : "text-gray-500 hover:text-gray-700"
                        }`
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {activeTab === "overview" && (
              <>
                {/* Basic Information */}
                <div className="lg:col-span-2">
                  <div
                    className={`rounded-lg shadow border ${
                      isDark
                        ? "bg-gray-800 border-gray-700"
                        : "bg-white border-gray-200"
                    }`}
                  >
                    <div className="p-6">
                      <h3
                        className={`text-lg font-semibold mb-4 ${
                          isDark ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {t("managementRoles.overview.basicInfo") ||
                          "Basic Information"}
                      </h3>
                      <div className="space-y-4">
                        {roleUsers && (
                          <div>
                            <label
                              className={`block text-sm font-medium ${
                                isDark ? "text-gray-300" : "text-gray-700"
                              }`}
                            >
                              {language == "ar"
                                ? t("managementRoles.form.roleNameAr")
                                : t("managementRoles.form.roleNameEn")}
                            </label>
                            <p
                              className={`mt-1 text-sm ${
                                isDark ? "text-white" : "text-gray-900"
                              }`}
                            >
                              {language == "ar"
                                ? roleUsers[0]?.roleNameAr || id
                                : roleUsers[0]?.roleNameEn || id}{" "}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Role Details */}
                <div>
                  <div
                    className={`rounded-lg shadow border ${
                      isDark
                        ? "bg-gray-800 border-gray-700"
                        : "bg-white border-gray-200"
                    }`}
                  >
                    <div className="p-6">
                      <h3
                        className={`text-lg font-semibold mb-4 ${
                          isDark ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {t("managementRoles.overview.details") ||
                          "Role Details"}
                      </h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span
                            className={`text-sm ${
                              isDark ? "text-gray-400" : "text-gray-500"
                            }`}
                          >
                            {t("managementRoles.table.users") ||
                              "Assigned Users"}
                          </span>
                          <span
                            className={`text-sm ${
                              isDark ? "text-white" : "text-gray-900"
                            }`}
                          >
                            {roleUsersPagination?.totalCount || 0}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span
                            className={`text-sm ${
                              isDark ? "text-gray-400" : "text-gray-500"
                            }`}
                          >
                            {t("managementRoles.tabs.permissions") ||
                              "Permissions"}
                          </span>
                          <span
                            className={`text-sm ${
                              isDark ? "text-white" : "text-gray-900"
                            }`}
                          >
                            {permissions?.length}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {activeTab === "permissions" && (
              <div className="lg:col-span-3">
                <div
                  className={`rounded-lg shadow border ${
                    isDark
                      ? "bg-gray-800 border-gray-700"
                      : "bg-white border-gray-200"
                  }`}
                >
                  <div className="p-6">
                    <h3
                      className={`text-lg font-semibold mb-6 ${
                        isDark ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {t("managementRoles.tabs.permissions") ||
                        "Role Permissions"}
                      {permissions?.length > 0 && (
                        <span
                          className={`ml-2 text-sm font-normal ${
                            isDark ? "text-gray-400" : "text-gray-500"
                          }`}
                        >
                          ({permissions?.length} permissions)
                        </span>
                      )}
                    </h3>

                    {loading.permissions ? (
                      <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                        <p
                          className={`mt-2 ${
                            isDark ? "text-gray-400" : "text-gray-600"
                          }`}
                        >
                          {t("managementRoles.loadingPermissions") ||
                            "Loading permissions..."}
                        </p>
                      </div>
                    ) : permissions?.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {permissions?.map((permission, index) => (
                          <div
                            key={index}
                            className={`p-3 rounded-lg border flex items-center gap-3 ${
                              isDark
                                ? "border-gray-600 bg-gray-700"
                                : "border-gray-200 bg-gray-50"
                            }`}
                          >
                            <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                            <span
                              className={`text-sm font-medium ${
                                isDark ? "text-gray-200" : "text-gray-800"
                              }`}
                            >
                              {permission}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Shield
                          className={`mx-auto h-12 w-12 mb-4 ${
                            isDark ? "text-gray-400" : "text-gray-500"
                          }`}
                        />
                        <p
                          className={`text-lg font-medium mb-2 ${
                            isDark ? "text-white" : "text-gray-900"
                          }`}
                        >
                          {t("managementRoles.permissions.noPermissions") ||
                            "No Permissions"}
                        </p>
                        <p
                          className={`${
                            isDark ? "text-gray-400" : "text-gray-500"
                          }`}
                        >
                          {t("managementRoles.permissions.noPermissionsDesc") ||
                            "This role has no permissions assigned."}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "users" && (
              <div className="lg:col-span-3">
                <div
                  className={`rounded-lg shadow border ${
                    isDark
                      ? "bg-gray-800 border-gray-700"
                      : "bg-white border-gray-200"
                  }`}
                >
                  <div className="p-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                      <h3
                        className={`text-lg font-semibold ${
                          isDark ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {t("managementRoles.tabs.users") || "Assigned Users"}
                        {roleUsersPagination?.totalCount > 0 && (
                          <span
                            className={`ml-2 text-sm font-normal ${
                              isDark ? "text-gray-400" : "text-gray-500"
                            }`}
                          >
                            ({roleUsersPagination.totalCount}{" "}
                            {t("managementRoles.users.users") || "users"})
                          </span>
                        )}
                      </h3>
                      <div className="flex flex-col gap-4 w-full">
                        {/* Search Bar - Full width on all screens */}
                        <div className="relative w-full">
                          <input
                            type="text"
                            placeholder={
                              t("managementRoles.search.users") ||
                              "Search users..."
                            }
                            value={usersSearchTerm}
                            onChange={(e) => handleUsersSearch(e)}
                            onKeyDown={handleKeyDown}
                            className={`pl-10 pr-10 py-2 w-full rounded-lg border transition-colors ${
                              isDark
                                ? "border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:border-blue-500"
                                : "border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:border-blue-500"
                            } focus:outline-none focus:ring-1 focus:ring-blue-500`}
                          />
                          <button
                            onClick={searchButton}
                            className={`absolute ${
                              !isRTL ? "right-2" : "left-2"
                            }  top-1/2 transform -translate-y-1/2 p-1.5 rounded-md transition-colors ${
                              isDark
                                ? "hover:bg-gray-600 text-gray-400 hover:text-blue-500"
                                : "hover:bg-gray-100 text-gray-500 hover:text-blue-500"
                            } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1`}
                          >
                            <Search className="h-4 w-4" />
                          </button>
                        </div>
                        {/* Filters Grid - Responsive layout */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 w-full">
                          {/* Sort By */}
                          <div className="flex flex-col">
                            <label
                              className={`text-xs font-medium mb-1 ${
                                isDark ? "text-gray-300" : "text-gray-700"
                              }`}
                            >
                              {t("roster.filters.orderBy") || "Sort By"}
                            </label>
                            <select
                              value={usersFilters.sortBy}
                              onChange={(e) =>
                                handleUsersSortChange(
                                  e.target.value,
                                  usersFilters.sortDirection
                                )
                              }
                              className={`px-3 py-2 rounded-lg border transition-colors ${
                                isDark
                                  ? "border-gray-600 bg-gray-700 text-white focus:border-blue-500"
                                  : "border-gray-300 bg-white text-gray-900 focus:border-blue-500"
                              } focus:outline-none focus:ring-1 focus:ring-blue-500`}
                            >
                              <option value="1">
                                {t("roster.filters.sortBy.nameEnglish") ||
                                  "Name (English)"}
                              </option>
                              <option value="0">
                                {t("roster.filters.sortBy.nameArabic") ||
                                  "Name (Arabic)"}
                              </option>
                              <option value="2">
                                {t("roster.filters.sortBy.mobile") || "Mobile"}
                              </option>
                            </select>
                          </div>

                          {/* Sort Direction */}
                          <div className="flex flex-col">
                            <label
                              className={`text-xs font-medium mb-1 ${
                                isDark ? "text-gray-300" : "text-gray-700"
                              }`}
                            >
                              {t("roster.filters.orderDirection") ||
                                "Direction"}
                            </label>
                            <select
                              value={usersFilters.sortDirection}
                              onChange={(e) =>
                                handleUsersSortChange(
                                  usersFilters.sortBy,
                                  e.target.value
                                )
                              }
                              className={`px-3 py-2 rounded-lg border transition-colors ${
                                isDark
                                  ? "border-gray-600 bg-gray-700 text-white focus:border-blue-500"
                                  : "border-gray-300 bg-white text-gray-900 focus:border-blue-500"
                              } focus:outline-none focus:ring-1 focus:ring-blue-500`}
                            >
                              <option value="Asc">
                                {t("roster.filters.ascending") || "Ascending"}
                              </option>
                              <option value="Desc">
                                {t("roster.filters.descending") || "Descending"}
                              </option>
                            </select>
                          </div>

                          {/* Status Filter */}
                          <div className="flex flex-col sm:col-span-2 md:col-span-1">
                            <label
                              className={`text-xs font-medium mb-1 ${
                                isDark ? "text-gray-300" : "text-gray-700"
                              }`}
                            >
                              {t("roster.filters.status") || "Status"}
                            </label>
                            <select
                              value={usersFilters.isActive ?? ""}
                              onChange={(e) => {
                                const value = e.target.value
                                handleUsersActiveFilter(
                                  value === "" ? undefined : value === "true"
                                )
                              }}
                              className={`px-3 py-2 rounded-lg border transition-colors ${
                                isDark
                                  ? "border-gray-600 bg-gray-700 text-white focus:border-blue-500"
                                  : "border-gray-300 bg-white text-gray-900 focus:border-blue-500"
                              } focus:outline-none focus:ring-1 focus:ring-blue-500`}
                            >
                              <option value="">
                                {t("roster.filters.all") || "All Users"}
                              </option>
                              <option value="true">
                                {t("roster.filters.activeOnly") ||
                                  "Active Only"}
                              </option>
                              <option value="false">
                                {t("roster.filters.inactiveOnly") ||
                                  "Inactive Only"}
                              </option>
                            </select>
                          </div>
                        </div>

                        {/* Optional: Add a Clear Filters Button */}
                        <div className="flex justify-end">
                          <button
                            onClick={() => {
                              setUsersSearchTerm("")
                              setUsersFilters({
                                isActive: "",
                                sortBy: "NameEnglish",
                                sortDirection: "Asc",
                                page: 1,
                                pageSize: 10,
                              })
                            }}
                            className={`px-3 py-1 text-sm rounded-lg border transition-colors ${
                              isDark
                                ? "border-gray-600 bg-gray-700 text-gray-300 hover:bg-gray-600"
                                : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                            }`}
                          >
                            {t("roster.filters.clear") || "Clear All"}
                          </button>
                        </div>
                      </div>
                    </div>

                    {loading.roleUsers ? (
                      <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                        <p
                          className={`mt-2 ${
                            isDark ? "text-gray-400" : "text-gray-600"
                          }`}
                        >
                          {t("managementRoles.loadingUsers") ||
                            "Loading users..."}
                        </p>
                      </div>
                    ) : roleUsers && roleUsers.length > 0 ? (
                      <>
                        {/* Users Table */}
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead
                              className={isDark ? "bg-gray-700" : "bg-gray-50"}
                            >
                              <tr>
                                <th
                                  className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                                    isDark ? "text-gray-300" : "text-gray-500"
                                  }`}
                                >
                                  {t("managementRoles.table.users") || "User"}
                                </th>
                                <th
                                  className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                                    isDark ? "text-gray-300" : "text-gray-500"
                                  }`}
                                >
                                  {t("managementRoles.table.mobile") ||
                                    "Mobile"}
                                </th>
                                <th
                                  className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                                    isDark ? "text-gray-300" : "text-gray-500"
                                  }`}
                                >
                                  {t("managementRoles.table.email") || "Email"}
                                </th>
                                <th
                                  className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                                    isDark ? "text-gray-300" : "text-gray-500"
                                  }`}
                                >
                                  {t("managementRoles.table.category")}
                                </th>
                                <th
                                  className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                                    isDark ? "text-gray-300" : "text-gray-500"
                                  }`}
                                >
                                  {t("managementRoles.table.role") || "Role"}
                                </th>
                                <th
                                  className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                                    isDark ? "text-gray-300" : "text-gray-500"
                                  }`}
                                >
                                  {t("managementRoles.table.lastLogin") ||
                                    "Last Login"}
                                </th>
                                <th
                                  className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                                    isDark ? "text-gray-300" : "text-gray-500"
                                  }`}
                                >
                                  {t("managementRoles.table.status") ||
                                    "Status"}
                                </th>
                                <th
                                  className={`px-6 py-3 text-center text-xs font-medium uppercase tracking-wider ${
                                    isDark ? "text-gray-300" : "text-gray-500"
                                  }`}
                                >
                                  {t("managementRoles.table.actions") ||
                                    "Actions"}
                                </th>
                              </tr>
                            </thead>
                            <tbody
                              className={`divide-y ${
                                isDark
                                  ? "bg-gray-800 divide-gray-700"
                                  : "bg-white divide-gray-200"
                              }`}
                            >
                              {roleUsers.map((user) => (
                                <tr
                                  key={user.id}
                                  className="hover:bg-gray-50 dark:hover:bg-gray-700"
                                >
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                      <div
                                        className={`flex-shrink-0 h-10 w-10 ${
                                          isDark ? "bg-gray-600" : "bg-gray-200"
                                        } rounded-full flex items-center justify-center`}
                                      >
                                        <User className="h-5 w-5 text-gray-500" />
                                      </div>
                                      <div
                                        className={`${isRTL ? "mr-4" : "ml-4"}`}
                                      >
                                        <div
                                          className={`text-sm font-medium ${
                                            isDark
                                              ? "text-white"
                                              : "text-gray-900"
                                          }`}
                                        >
                                          {language === "ar"
                                            ? user.nameArabic
                                            : user.nameEnglish}
                                        </div>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                      <Phone className="h-4 w-4 text-gray-400 mr-2" />
                                      <span
                                        className={`text-sm ${
                                          isDark
                                            ? "text-gray-300"
                                            : "text-gray-900"
                                        }`}
                                      >
                                        {user.mobile}
                                      </span>
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                      <span
                                        className={`text-sm ${
                                          isDark
                                            ? "text-gray-300"
                                            : "text-gray-900"
                                        }`}
                                      >
                                        {user.email || "N/A"}
                                      </span>
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <span
                                      className={`text-sm ${
                                        isDark
                                          ? "text-gray-300"
                                          : "text-gray-900"
                                      }`}
                                    >
                                      {language === "ar"
                                        ? user.primaryCategoryNameAr
                                        : user.primaryCategoryNameEn}
                                    </span>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-transparent text-blue-500 border-2 border-blue-500 dark:bg-transparent dark:text-blue-500 dark:border-blue-500">
                                      {language === "ar"
                                        ? user?.roleNameAr
                                        : user?.roleNameEn}
                                    </span>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <span
                                      className={`text-sm ${
                                        isDark
                                          ? "text-gray-300"
                                          : "text-gray-900"
                                      }`}
                                    >
                                      {user.lastLoginAt
                                        ? formatDate(user.lastLoginAt)
                                        : "Never"}
                                    </span>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <span
                                      className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                        user.isActive
                                          ? "bg-transparent text-emerald-500 border-2 border-emerald-500 dark:bg-transparent dark:text-emerald-500 dark:border-emerald-500"
                                          : "bg-transparent text-red-500 border-2 border-red-500 dark:bg-transparent dark:text-red-500 dark:border-red-500"
                                      }`}
                                    >
                                      {user.isActive
                                        ? t("common.active") || "Active"
                                        : t("common.inactive") || "Inactive"}
                                    </span>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-center">
                                    <div className="flex gap-2 justify-center">
                                      <button
                                        onClick={() => {
                                          localStorage.setItem(
                                            "doctorName",
                                            JSON.stringify({
                                              doctorNameAr: user.nameArabic,
                                              doctorNameEn: user.nameEnglish,
                                            })
                                          )
                                          navigate(
                                            `/admin-panel/management-roles/role/user-history/${user.id}`
                                          )
                                        }}
                                        className="p-2 rounded-lg border bg-transparent text-blue-500 border-blue-500 hover:bg-emerald-600 hover:text-white hover:border-emerald-600 transition-colors cursor-pointer"
                                        title={
                                          t(
                                            "managementRoles.users.viewHistory"
                                          ) || "View Assignment History"
                                        }
                                      >
                                        <History size={16} />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        {/* Pagination */}
                        {roleUsersPagination.totalPages > 1 && (
                          <div className="flex items-center justify-between px-6 py-3 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
                            <div className="flex-1 flex justify-between sm:hidden">
                              <button
                                onClick={() =>
                                  handleUsersPageChange(usersFilters.page - 1)
                                }
                                disabled={usersFilters.page === 1}
                                className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                                  usersFilters.page === 1
                                    ? "text-gray-400 cursor-not-allowed"
                                    : "text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
                                }`}
                              >
                                {t("managementRoles.pagination.previous") ||
                                  "Previous"}
                              </button>
                              <button
                                onClick={() =>
                                  handleUsersPageChange(usersFilters.page + 1)
                                }
                                disabled={
                                  usersFilters.page >=
                                  roleUsersPagination.totalPages
                                }
                                className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                                  usersFilters.page >=
                                  roleUsersPagination.totalPages
                                    ? "text-gray-400 cursor-not-allowed"
                                    : "text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
                                }`}
                              >
                                {t("managementRoles.pagination.next") || "Next"}
                              </button>
                            </div>
                            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                              <div>
                                <p
                                  className={`text-sm ${
                                    isDark ? "text-gray-400" : "text-gray-700"
                                  }`}
                                >
                                  {t("managementRoles.pagination.showing") ||
                                    "Showing"}{" "}
                                  <span className="font-medium">
                                    {(usersFilters.page - 1) *
                                      usersFilters.pageSize +
                                      1}
                                  </span>{" "}
                                  {t("managementRoles.pagination.to") || "to"}{" "}
                                  <span className="font-medium">
                                    {Math.min(
                                      usersFilters.page * usersFilters.pageSize,
                                      roleUsersPagination.totalCount
                                    )}
                                  </span>{" "}
                                  {t("managementRoles.pagination.of") || "of"}{" "}
                                  <span className="font-medium">
                                    {roleUsersPagination.totalCount}
                                  </span>{" "}
                                  {t("managementRoles.pagination.results") ||
                                    "results"}
                                </p>
                              </div>
                              <div>
                                <nav
                                  className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                                  aria-label="Pagination"
                                >
                                  <button
                                    onClick={() =>
                                      handleUsersPageChange(
                                        usersFilters.page - 1
                                      )
                                    }
                                    disabled={usersFilters.page === 1}
                                    className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 text-sm font-medium ${
                                      usersFilters.page === 1
                                        ? "text-gray-400 cursor-not-allowed"
                                        : "text-gray-500 bg-white hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                                    }`}
                                  >
                                    <ChevronLeft className="h-5 w-5" />
                                  </button>

                                  {Array.from(
                                    {
                                      length: Math.min(
                                        5,
                                        roleUsersPagination.totalPages
                                      ),
                                    },
                                    (_, i) => {
                                      const pageNum =
                                        Math.max(1, usersFilters.page - 2) + i
                                      if (
                                        pageNum > roleUsersPagination.totalPages
                                      )
                                        return null

                                      return (
                                        <button
                                          key={pageNum}
                                          onClick={() =>
                                            handleUsersPageChange(pageNum)
                                          }
                                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                            pageNum === usersFilters.page
                                              ? "z-10 bg-blue-50 border-blue-500 text-blue-500 dark:bg-blue-900 dark:text-blue-300"
                                              : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                                          }`}
                                        >
                                          {pageNum}
                                        </button>
                                      )
                                    }
                                  )}

                                  <button
                                    onClick={() =>
                                      handleUsersPageChange(
                                        usersFilters.page + 1
                                      )
                                    }
                                    disabled={
                                      usersFilters.page >=
                                      roleUsersPagination.totalPages
                                    }
                                    className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 text-sm font-medium ${
                                      usersFilters.page >=
                                      roleUsersPagination.totalPages
                                        ? "text-gray-400 cursor-not-allowed"
                                        : "text-gray-500 bg-white hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                                    }`}
                                  >
                                    <ChevronRight className="h-5 w-5" />
                                  </button>
                                </nav>
                              </div>
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="text-center py-8">
                        <UserCheck
                          className={`mx-auto h-12 w-12 mb-4 ${
                            isDark ? "text-gray-400" : "text-gray-500"
                          }`}
                        />
                        <p
                          className={`text-lg font-medium mb-2 ${
                            isDark ? "text-white" : "text-gray-900"
                          }`}
                        >
                          {t("managementRoles.users.noUsers") ||
                            "No Users Assigned"}
                        </p>
                        <p
                          className={`${
                            isDark ? "text-gray-400" : "text-gray-500"
                          }`}
                        >
                          {t("managementRoles.users.noUsersDescription") ||
                            "This role has not been assigned to any users yet."}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "history" && (
              <div className="lg:col-span-3">
                <div
                  className={`rounded-lg shadow border ${
                    isDark
                      ? "bg-gray-800 border-gray-700"
                      : "bg-white border-gray-200"
                  }`}
                >
                  <div className="p-6">
                    <h3
                      className={`text-lg font-semibold mb-6 ${
                        isDark ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {t("managementRoles.tabs.history") ||
                        "Assignment History"}
                    </h3>
                    {loading.history ? (
                      <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                        <p
                          className={`mt-2 ${
                            isDark ? "text-gray-400" : "text-gray-600"
                          }`}
                        >
                          {t("managementRoles.loadingHistory") ||
                            "Loading history..."}
                        </p>
                      </div>
                    ) : assignmentHistory && assignmentHistory?.length > 0 ? (
                      <div className="space-y-4">
                        {assignmentHistory?.map((entry, index) => (
                          <div
                            key={index}
                            className={`border-l-4 ${
                              entry.changeType === "تعيين"
                                ? "border-green-500"
                                : entry.changeType === "إلغاء"
                                ? "border-red-500"
                                : "border-blue-500"
                            } pl-4 py-3 ${
                              isDark ? "bg-gray-700/50" : "bg-blue-50"
                            } rounded`}
                          >
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <p
                                  className={`font-medium ${
                                    isDark ? "text-white" : "text-gray-900"
                                  }`}
                                >
                                  {entry.oldRoleName && entry.newRoleName
                                    ? `${entry.oldRoleName} → ${entry.newRoleName}`
                                    : entry.newRoleName ||
                                      entry.oldRoleName ||
                                      entry.changeType}
                                </p>
                                {entry.changeReason && (
                                  <p
                                    className={`text-sm mt-1 ${
                                      isDark ? "text-gray-300" : "text-gray-600"
                                    }`}
                                  >
                                    <span className="font-medium">
                                      {t("managementRoles.history.reason") ||
                                        "Reason"}
                                      :
                                    </span>{" "}
                                    {entry.changeReason}
                                  </p>
                                )}
                                <div
                                  className={`text-xs mt-1 ${
                                    isDark ? "text-gray-400" : "text-gray-500"
                                  }`}
                                >
                                  <span
                                    className={`inline-block px-2 py-1 rounded text-xs font-medium mr-2 ${
                                      entry.changeType === "Promoted"
                                        ? "bg-transparent text-emerald-500 border-2 border-emerald-500 dark:bg-transparent dark:text-emerald-500 dark:border-emerald-500"
                                        : entry.changeType === "Demoted"
                                        ? "bg-transparent text-red-500 border-2 border-red-500 dark:bg-transparent dark:text-red-500 dark:border-red-500"
                                        : "bg-transparent text-blue-500 border-2 border-blue-500 dark:bg-transparent dark:text-blue-500 dark:border-blue-500"
                                    }`}
                                  >
                                    {entry.changeType}
                                  </span>
                                  {formatDate(entry.changedAt)}
                                  {entry.changedByName && (
                                    <span className="ml-2">
                                      {t("managementRoles.history.by") || "by"}{" "}
                                      <span className="font-medium">
                                        {entry.changedByName}
                                      </span>
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            {entry.notes && (
                              <div
                                className={`text-sm mt-3 p-2 rounded ${
                                  isDark
                                    ? "bg-gray-600/50 text-gray-300"
                                    : "bg-gray-100 text-gray-600"
                                }`}
                              >
                                <span className="font-medium">
                                  {t("managementRoles.history.notes") ||
                                    "notes"}
                                  :
                                </span>{" "}
                                {entry.notes}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <History
                          className={`mx-auto h-12 w-12 mb-4 ${
                            isDark ? "text-gray-400" : "text-gray-500"
                          }`}
                        />
                        <p
                          className={`text-lg font-medium mb-2 ${
                            isDark ? "text-white" : "text-gray-900"
                          }`}
                        >
                          {t("managementRoles.history.noHistory") ||
                            "No Assignment History"}
                        </p>
                        <p
                          className={`${
                            isDark ? "text-gray-400" : "text-gray-500"
                          }`}
                        >
                          {t("managementRoles.history.noHistoryDescription") ||
                            "This role has no assignment history yet."}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {assignmentHistoryPagination.totalPages > 1 && (
                  <div className="flex items-center justify-between px-6 py-3 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex-1 flex justify-between sm:hidden">
                      <button
                        onClick={() =>
                          handleHistoryPageChange(historyFilters.page - 1)
                        }
                        disabled={historyFilters.page === 1}
                        className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                          historyFilters.page === 1
                            ? "text-gray-400 cursor-not-allowed"
                            : "text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
                        }`}
                      >
                        {t("managementRoles.pagination.previous") || "Previous"}
                      </button>
                      <button
                        onClick={() =>
                          handleHistoryPageChange(historyFilters.page + 1)
                        }
                        disabled={
                          historyFilters.page >=
                          assignmentHistoryPagination.totalPages
                        }
                        className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                          historyFilters.page >=
                          assignmentHistoryPagination.totalPages
                            ? "text-gray-400 cursor-not-allowed"
                            : "text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
                        }`}
                      >
                        {t("managementRoles.pagination.next") || "Next"}
                      </button>
                    </div>
                    <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                      <div>
                        <p
                          className={`text-sm ${
                            isDark ? "text-gray-400" : "text-gray-700"
                          }`}
                        >
                          {t("managementRoles.pagination.showing") || "Showing"}{" "}
                          <span className="font-medium">
                            {(historyFilters.page - 1) *
                              historyFilters.pageSize +
                              1}
                          </span>{" "}
                          {t("managementRoles.pagination.to") || "to"}{" "}
                          <span className="font-medium">
                            {Math.min(
                              historyFilters.page * historyFilters.pageSize,
                              assignmentHistoryPagination.totalCount
                            )}
                          </span>{" "}
                          {t("managementRoles.pagination.of") || "of"}{" "}
                          <span className="font-medium">
                            {assignmentHistoryPagination.totalCount}
                          </span>{" "}
                          {t("managementRoles.pagination.results") || "results"}
                        </p>
                      </div>
                      <div>
                        <nav
                          className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                          aria-label="Pagination"
                        >
                          <button
                            onClick={() =>
                              handleHistoryPageChange(historyFilters.page - 1)
                            }
                            disabled={usersFilters.page === 1}
                            className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 text-sm font-medium ${
                              usersFilters.page === 1
                                ? "text-gray-400 cursor-not-allowed"
                                : "text-gray-500 bg-white hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                            }`}
                          >
                            <ChevronLeft className="h-5 w-5" />
                          </button>

                          {Array.from(
                            {
                              length: Math.min(
                                5,
                                assignmentHistoryPagination.totalPages
                              ),
                            },
                            (_, i) => {
                              const pageNum =
                                Math.max(1, historyFilters.page - 2) + i
                              if (
                                pageNum > assignmentHistoryPagination.totalPages
                              )
                                return null

                              return (
                                <button
                                  key={pageNum}
                                  onClick={() =>
                                    handleHistoryPageChange(pageNum)
                                  }
                                  className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                    pageNum === assignmentHistoryPagination.page
                                      ? "z-10 bg-blue-50 border-blue-500 text-blue-500 dark:bg-blue-900 dark:text-blue-300"
                                      : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                                  }`}
                                >
                                  {pageNum}
                                </button>
                              )
                            }
                          )}

                          <button
                            onClick={() =>
                              handleHistoryPageChange(historyFilters.page + 1)
                            }
                            disabled={
                              historyFilters.page >=
                              assignmentHistoryPagination.totalPages
                            }
                            className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 text-sm font-medium ${
                              historyFilters.page >=
                              assignmentHistoryPagination.totalPages
                                ? "text-gray-400 cursor-not-allowed"
                                : "text-gray-500 bg-white hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                            }`}
                          >
                            <ChevronRight className="h-5 w-5" />
                          </button>
                        </nav>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default SpecifiedManagementRole