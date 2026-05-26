// Updated component sections - key changes from the original component

// 1. Import the new action and selectors
import { useDispatch, useSelector } from "react-redux";
import {
  getManagementRoles,
  getRoleStatistics,
  // ... other imports
} from "../../../state/act/actManagementRole";
import "../../../styles/general.css";

import {
  selectManagementRoles, // Simple list
  selectLoading,
  selectError,
  selectSuccess,
  selectFilters,
  selectPagination,
  selectRoleStatistics,
  // ... other selectors
} from "../../../state/slices/managementRole.js";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { BookCheck, Eye, Menu, Search, ShieldX, X } from "lucide-react";
import i18next from "i18next";
import LoadingGetData from "../../../components/LoadingGetData.jsx";

export default function ManagementRoles() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { mymode } = useSelector((state) => state.mode);
  const [showMobileTable, setShowMobileTable] = useState(false);

  const isDark = mymode === "dark";
  const language = i18next.language;
  const isRTL = language === "ar";
  // Updated selectors

  const roles = useSelector(selectManagementRoles); // Simple list
  const loading = useSelector(selectLoading);
  const error = useSelector(selectError);

  const statistics = useSelector(selectRoleStatistics);
  console.log(statistics);

  // Load initial data
  useEffect(() => {
    dispatch(getManagementRoles()); // Load simple list for dropdowns
    dispatch(getRoleStatistics());
  }, [dispatch]);

  const RoleCard = ({ role }) => (
    <div
      className={`p-4 rounded-lg border mb-3 ${
        isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
      }`}
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h3
            className={`font-semibold text-lg ${
              isDark ? "text-white" : "text-gray-900"
            }`}
          >
            {language === "ar"
              ? role.labelAr || role.roleNameAr
              : role.labelEn || role.roleNameEn}
          </h3>
          <p
            className={`text-sm ${isDark ? "text-gray-300" : "text-gray-600"}`}
          >
            {language === "ar"
              ? role.labelEn || role.roleNameEn
              : role.labelAr || role.roleNameAr}
          </p>
        </div>

        {/* Status Icon */}
        <div className="flex justify-center items-center ml-3">
          {t("managementRoles.table.isContextual")}
          {role.isContextual ? (
            <BookCheck className="text-green-500" size={16} />
          ) : (
            <ShieldX className="text-red-500" size={16} />
          )}
        </div>
      </div>

      {/* Simplified actions - only view button */}
      <div className="flex gap-2 justify-end">
        <Link to={`/admin-panel/management-roles/role/${role.value}`}>
          <button
            className="p-2 rounded-lg border bg-transparent text-blue-500 border-blue-500 hover:bg-emerald-600 hover:text-white hover:border-emerald-600 transition-colors cursor-pointer"
            title={t("managementRoles.actions.view") || "View"}
          >
            <Eye size={16} />
          </button>
        </Link>
      </div>
    </div>
  );

  if (loading.list || loading.statistics) {
    return <LoadingGetData text={t("gettingData.roles")} />;
  }
  return (
    <div
      className={`min-h-screen ${isDark ? "bg-gray-900" : "bg-gray-50"}`}
      dir={isRTL ? "rtl" : "ltr"}
    >
      <div className="p-4 sm:p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
              <h1
                className={`text-2xl sm:text-3xl font-bold ${
                  isDark ? "text-white" : "text-gray-900"
                }`}
              >
                {t("managementRoles.title") || "Management Roles"}
              </h1>
              <div className="flex gap-2 w-full sm:w-auto">
                <button
                  onClick={() => setShowMobileTable(!showMobileTable)}
                  className={`md:hidden px-3 py-2 rounded-lg border transition-colors cursor-pointer ${
                    showMobileTable
                      ? "bg-transparent border-2 border-blue-500 text-blue-500 dark:bg-transparent dark:border-blue-500 dark:text-blue-500"
                      : `border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 ${
                          isDark ? "text-gray-300" : "text-gray-700"
                        }`
                  }`}
                >
                  {showMobileTable ? <X size={20} /> : <Menu size={20} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                <div className="flex justify-between items-center">
                  <span>{error}</span>
                  <button
                    onClick={() => dispatch(clearError())}
                    className="text-red-500 hover:text-red-700 cursor-pointer"
                  >
                    ×
                  </button>
                </div>
              </div>
            )}
          </div>

          {!loading.statistics && statistics && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {/* Role Statistics Cards */}
              {statistics.roleStatistics?.map((roleStat, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg shadow ${
                    isDark ? "bg-gray-800" : "bg-white"
                  }`}
                >
                  <h3
                    className={`text-sm font-semibold mb-1 ${
                      isDark ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {language === "ar"
                      ? roleStat.roleNameAr
                      : roleStat.roleNameEn}
                  </h3>
                  <p className="text-xl text-blue-500">
                    {roleStat.activeUsersCount}
                  </p>
                  <span className="text-xs text-gray-500">
                    {t("managementRoles.analytics.activeUsers")}
                  </span>
                </div>
              ))}

              {/* General Statistics Cards */}
              {statistics.generalStatistics && (
                <>
                  <div
                    className={`p-4 rounded-lg shadow ${
                      isDark ? "bg-gray-800" : "bg-white"
                    }`}
                  >
                    <h3
                      className={`text-sm font-semibold mb-1 ${
                        isDark ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {language === "ar"
                        ? statistics.generalStatistics.totalActiveUsers.nameAr
                        : statistics.generalStatistics.totalActiveUsers.nameEn}
                    </h3>
                    <p className="text-xl text-emerald-500">
                      {statistics.generalStatistics.totalActiveUsers.count}
                    </p>
                  </div>

                  <div
                    className={`p-4 rounded-lg shadow ${
                      isDark ? "bg-gray-800" : "bg-white"
                    }`}
                  >
                    <h3
                      className={`text-sm font-semibold mb-1 ${
                        isDark ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {language === "ar"
                        ? statistics.generalStatistics.usersWithoutRoles.nameAr
                        : statistics.generalStatistics.usersWithoutRoles.nameEn}
                    </h3>
                    <p className="text-xl text-orange-500">
                      {statistics.generalStatistics.usersWithoutRoles.count}
                    </p>
                  </div>

                  <div
                    className={`p-4 rounded-lg shadow ${
                      isDark ? "bg-gray-800" : "bg-white"
                    }`}
                  >
                    <h3
                      className={`text-sm font-semibold mb-1 ${
                        isDark ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {language === "ar"
                        ? statistics.generalStatistics.temporaryRoles.nameAr
                        : statistics.generalStatistics.temporaryRoles.nameEn}
                    </h3>
                    <p className="text-xl text-violet-500">
                      {statistics.generalStatistics.temporaryRoles.count}
                    </p>
                  </div>

                  <div
                    className={`p-4 rounded-lg shadow ${
                      isDark ? "bg-gray-800" : "bg-white"
                    }`}
                  >
                    <h3
                      className={`text-sm font-semibold mb-1 ${
                        isDark ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {language === "ar"
                        ? statistics.generalStatistics.permanentRoles.nameAr
                        : statistics.generalStatistics.permanentRoles.nameEn}
                    </h3>
                    <p className="text-xl text-blue-500">
                      {statistics.generalStatistics.permanentRoles.count}
                    </p>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Mobile Cards View */}
          <div className={`md:hidden ${showMobileTable ? "hidden" : "block"}`}>
            {loading.detailedList ? (
              <div className="text-center p-8">
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span
                    className={`${isRTL ? "mr-3" : "ml-3"} ${
                      isDark ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    {t("gettingData.roles") || "Loading..."}
                  </span>
                </div>
              </div>
            ) : roles.length === 0 ? (
              <div
                className={`text-center p-8 ${
                  isDark ? "text-gray-400" : "text-gray-500"
                }`}
              >
                {t("managementRoles.noData") || "No roles found"}
              </div>
            ) : (
              roles.map((role) => (
                <RoleCard key={role.id || role.value} role={role} />
              ))
            )}
          </div>

          {/* Desktop Table View */}
          <div
            className={`hidden md:block ${showMobileTable ? "md:hidden" : ""} ${
              isDark
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-200"
            } rounded-lg shadow-sm border`}
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr
                    className={`border-b ${
                      isDark
                        ? "border-gray-700 bg-gray-750"
                        : "border-gray-200 bg-gray-50"
                    }`}
                  >
                    <th
                      className={`${
                        isRTL ? "text-right" : "text-left"
                      } p-4 font-semibold ${
                        isDark ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {t("managementRoles.table.nameArabic") || "Arabic Name"}
                    </th>
                    <th
                      className={`${
                        isRTL ? "text-right" : "text-left"
                      } p-4 font-semibold ${
                        isDark ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {t("managementRoles.table.nameEnglish") || "English Name"}
                    </th>
                    <th
                      className={`${
                        isRTL ? "text-right" : "text-left"
                      } p-4 font-semibold ${
                        isDark ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {t("managementRoles.table.isContextual") ||
                        "isContextual"}
                    </th>

                    <th
                      className={`${
                        isRTL ? "text-right" : "text-left"
                      } p-4 font-semibold ${
                        isDark ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {t("managementRoles.table.actions") || "Actions"}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {loading.detailedList ? (
                    <tr>
                      <td colSpan="7" className="text-center p-8">
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                          <span
                            className={`${isRTL ? "mr-3" : "ml-3"} ${
                              isDark ? "text-gray-400" : "text-gray-600"
                            }`}
                          >
                            {t("gettingData.roles") || "Loading..."}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ) : roles.length === 0 ? (
                    <tr>
                      <td
                        colSpan="7"
                        className={`text-center p-8 ${
                          isDark ? "text-gray-400" : "text-gray-500"
                        }`}
                      >
                        {t("managementRoles.noData") || "No roles found"}
                      </td>
                    </tr>
                  ) : (
                    roles.map((role) => (
                      <tr
                        key={role.id || role.value}
                        className={`border-b transition-colors ${
                          isDark
                            ? "border-gray-700 hover:bg-gray-750"
                            : "border-gray-200 hover:bg-gray-50"
                        }`}
                      >
                        <td
                          className={`p-4 text-center font-semibold ${
                            isDark ? "text-white" : "text-gray-900"
                          }`}
                        >
                          {role.roleNameAr || role.labelAr}
                        </td>
                        <td
                          className={`p-4 text-center ${
                            isDark ? "text-gray-300" : "text-gray-600"
                          }`}
                        >
                          {role.roleNameEn || role.labelEn}
                        </td>
                        <td className="p-4">
                          <div className="flex justify-center items-center">
                            {role.isContextual ? (
                              <BookCheck className="w-6 h-6 text-green-500" />
                            ) : (
                              <ShieldX className="w-6 h-6 text-red-500" />
                            )}
                          </div>
                        </td>

                        <td className="p-4 text-center">
                          <div className="flex gap-2 justify-center">
                            <Link
                              to={`/admin-panel/management-roles/role/${
                                role.id || role.value
                              }`}
                            >
                              <button
                                className="p-2 rounded-lg border bg-transparent text-blue-500 border-blue-500 hover:bg-emerald-600 hover:text-white hover:border-emerald-600 transition-colors cursor-pointer"
                                title={
                                  t("managementRoles.actions.view") || "View"
                                }
                              >
                                <Eye className="w-6 h-6" />
                              </button>
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Table View */}
          <div
            className={`md:hidden ${showMobileTable ? "block" : "hidden"} ${
              isDark
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-200"
            } rounded-lg shadow-sm border overflow-hidden`}
          >
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr
                    className={`border-b ${
                      isDark
                        ? "border-gray-700 bg-gray-750"
                        : "border-gray-200 bg-gray-50"
                    }`}
                  >
                    <th
                      className={`text-center ${
                        isRTL ? "text-right" : "text-left"
                      } p-2 font-semibold ${
                        isDark ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {t("managementRoles.table.name") || "Name"}
                    </th>
                    <th
                      className={`text-center ${
                        isRTL ? "text-right" : "text-left"
                      } p-2 font-semibold ${
                        isDark ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {t("managementRoles.table.isContextual") ||
                        "isContextual"}
                    </th>

                    <th
                      className={`text-center ${
                        isRTL ? "text-right" : "text-left"
                      } p-2 font-semibold ${
                        isDark ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {t("managementRoles.table.actions") || "Actions"}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {loading.detailedList ? (
                    <tr>
                      <td colSpan="3" className="text-center p-8">
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                          <span
                            className={`${isRTL ? "mr-2" : "ml-2"} text-sm ${
                              isDark ? "text-gray-400" : "text-gray-600"
                            }`}
                          >
                            {t("gettingData.roles") || "Loading..."}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ) : roles.length === 0 ? (
                    <tr>
                      <td
                        colSpan="3"
                        className={`text-center p-8 ${
                          isDark ? "text-gray-400" : "text-gray-500"
                        }`}
                      >
                        {t("managementRoles.noData") || "No roles found"}
                      </td>
                    </tr>
                  ) : (
                    roles.map((role) => (
                      <tr
                        key={role.id || role.value}
                        className={`border-b transition-colors ${
                          isDark
                            ? "border-gray-700 hover:bg-gray-750"
                            : "border-gray-200 hover:bg-gray-50"
                        }`}
                      >
                        <td className="p-2 text-center">
                          <div>
                            <div
                              className={`font-semibold ${
                                isDark ? "text-white" : "text-gray-900"
                              }`}
                            >
                              {role.roleNameAr || role.labelAr}
                            </div>
                            <div
                              className={`text-xs ${
                                isDark ? "text-gray-400" : "text-gray-500"
                              }`}
                            >
                              {role.roleNameEn || role.labelEn}
                            </div>
                          </div>
                        </td>
                        <td>
                          <div
                            className={`font-semibold ${
                              isDark ? "text-white" : "text-gray-900"
                            }`}
                          >
                            <div className="flex justify-center items-center">
                              {role.isContextual ? (
                                <BookCheck
                                  className="text-green-500"
                                  size={14}
                                />
                              ) : (
                                <ShieldX className="text-red-500" size={14} />
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="p-2 text-center">
                          <div className="flex gap-1 justify-center">
                            <Link
                              to={`/admin-panel/management-roles/role/${role.value}`}
                            >
                              <button
                                tton
                                className="p-1 text-blue-500 hover:bg-emerald-600 hover:text-white hover:border-emerald-600 dark:hover:bg-blue-900 rounded transition-colors cursor-pointer"
                              >
                                <Eye size={14} />
                              </button>
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
