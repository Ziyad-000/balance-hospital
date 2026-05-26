// pages/ManagementRoles/AssignUserToRole.jsx
import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import {
  selectAvailableRoles,
  selectLoading as selectRoleLoading,
  selectError as selectRoleError,
  selectSuccess as selectRoleSuccess,
  clearError as clearRoleError,
  clearSuccess as clearRoleSuccess,
} from "../../../state/slices/managementRole";
import {
  getUserSummaries,
  selectUsers,
  selectUsersLoading,
  selectUsersError,
  clearError as clearUsersError,
} from "../../../state/slices/user";
import {
  assignRoleToUser,
  getAvailableRoles,
} from "../../../state/act/actManagementRole";
import { ArrowLeft, Search, User, Shield, ChevronDown } from "lucide-react";
import i18next from "i18next";
import UseInitialValues from "../../../hooks/use-initial-values";
import UseFormValidation from "../../../hooks/use-form-validation";

function AssignUserToRole() {
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  const currentLang = i18n.language;
  const isRTL = currentLang === "ar";

  const { mymode } = useSelector((state) => state.mode);
  const isDark = mymode === "dark";

  // State for user search and selection
  const [userSearchTerm, setUserSearchTerm] = useState("");
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Redux selectors
  const availableRoles = useSelector(selectAvailableRoles);
  const roleLoading = useSelector(selectRoleLoading);
  const roleError = useSelector(selectRoleError);
  const roleSuccess = useSelector(selectRoleSuccess);

  const users = useSelector(selectUsers);
  const usersLoading = useSelector(selectUsersLoading);
  const usersError = useSelector(selectUsersError);

  // Initial values
  const { INITIAL_VALUES_ASSIGN_USER_TO_ROLE } = UseInitialValues();

  // Validation schema using Yup
  const { VALIDATION_SCHEMA_ASSIGN_USER_TO_ROLE } = UseFormValidation();
  // Load data on component mount
  useEffect(() => {
    dispatch(getAvailableRoles());
    dispatch(getUserSummaries({ page: 1, pageSize: 50 }));
  }, [dispatch]);

  // Handle user search with debouncing
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (userSearchTerm.length >= 2) {
        dispatch(
          getUserSummaries({
            page: 1,
            pageSize: 50,
            searchTerm: userSearchTerm,
          })
        );
      } else if (userSearchTerm.length === 0) {
        dispatch(getUserSummaries({ page: 1, pageSize: 50 }));
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [userSearchTerm, dispatch]);

  // Handle success
  useEffect(() => {
    if (roleSuccess) {
      toast.success(
        t("assignUserRole.success.assigned") ||
          "User has been successfully assigned to the role",
        {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        }
      );
      navigate("/admin-panel/management-roles");
    }
  }, [roleSuccess, navigate, t]);

  // Handle click outside dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowUserDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      dispatch(clearRoleError());
      dispatch(clearRoleSuccess());
      dispatch(clearUsersError());
    };
  }, [dispatch]);

  // Handle user search input
  const handleUserSearchChange = (e, setFieldValue) => {
    const value = e.target.value;
    setUserSearchTerm(value);
    setShowUserDropdown(true);

    if (!value) {
      setSelectedUser(null);
      setFieldValue("userId", "");
    }
  };

  // Handle user selection
  const handleUserSelect = (user, setFieldValue) => {
    setSelectedUser(user);
    setUserSearchTerm(`${user.nameEnglish} (${user.mobile})`);
    setFieldValue("userId", user.id);
    setShowUserDropdown(false);
  };

  // Handle form submission
  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      await dispatch(
        assignRoleToUser({
          userId: values.userId,
          roleId: values.roleId,
          changeReason: values.changeReason,
          notes: values.notes,
        })
      )
        .unwrap()
        .then(() => {
          toast.success(t("assignUserRole.success.assigned"));
          navigate("/admin-panel/management-roles");
        });

      // Success is handled in useEffect
      resetForm();
    } catch (error) {
      console.error("Role assignment error:", error);

      Swal.fire({
        title: t("assignUserRole.error.title") || "Error",
        text:
          currentLang === "en"
            ? error?.messageEn ||
              error?.message ||
              "Failed to assign role to user"
            : error?.messageAr ||
              error?.message ||
              "فشل في تعيين الدور للمستخدم",
        icon: "error",
        confirmButtonText: t("common.ok") || "OK",
        confirmButtonColor: "#ef4444",
        background: isDark ? "#2d2d2d" : "#ffffff",
        color: isDark ? "#f0f0f0" : "#111827",
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Filter users based on search
  const filteredUsers = users.filter((user) => {
    if (!userSearchTerm) return true;
    const searchLower = userSearchTerm.toLowerCase();
    return (
      user.nameEnglish.toLowerCase().includes(searchLower) ||
      user.nameArabic?.includes(userSearchTerm) ||
      user.mobile.includes(userSearchTerm) ||
      user.role.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div
      className={`min-h-screen ${isDark ? "bg-gray-900" : "bg-gray-50"}`}
      dir={isRTL ? "rtl" : "ltr"}
    >
      <div className="p-4 sm:p-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center gap-4 mb-4">
              <button
                onClick={() => navigate("/admin-panel/management-roles")}
                className={`p-2 rounded-lg border transition-colors ${
                  isDark
                    ? "border-gray-600 hover:bg-gray-700 text-gray-300"
                    : "border-gray-300 hover:bg-gray-50 text-gray-700"
                }`}
              >
                <ArrowLeft size={20} />
              </button>
              <h1
                className={`text-2xl sm:text-3xl font-bold ${
                  isDark ? "text-white" : "text-gray-900"
                } ${isRTL ? "font-arabic" : ""}`}
              >
                {t("assignUserRole.title") || "Assign User to Role"}
              </h1>
            </div>
          </div>

          {/* Form */}
          <div
            className={`rounded-lg shadow border ${
              isDark
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-200"
            }`}
          >
            <div className="p-6">
              <Formik
                initialValues={INITIAL_VALUES_ASSIGN_USER_TO_ROLE}
                validationSchema={VALIDATION_SCHEMA_ASSIGN_USER_TO_ROLE}
                onSubmit={handleSubmit}
                enableReinitialize
              >
                {({ isSubmitting, errors, touched, values, setFieldValue }) => (
                  <Form className="space-y-6">
                    {/* Error Messages */}
                    {(roleError || usersError) && (
                      <div
                        className={`p-4 border rounded-md ${
                          isDark
                            ? "bg-red-900/20 border-red-800"
                            : "bg-red-50 border-red-200"
                        }`}
                      >
                        <div className="flex">
                          <div className="flex-shrink-0">
                            <svg
                              className="h-5 w-5 text-red-500"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </div>
                          <div className={isRTL ? "mr-3" : "ml-3"}>
                            <p
                              className={`text-sm ${
                                isDark ? "text-red-300" : "text-red-800"
                              }`}
                            >
                              {roleError || usersError}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Assignment Information Section */}
                    <div className="space-y-6">
                      <h3
                        className={`text-lg font-semibold border-b pb-2 ${
                          isDark
                            ? "text-white border-gray-600"
                            : "text-gray-900 border-gray-200"
                        }`}
                      >
                        {t("assignUserRole.sections.assignmentInfo") ||
                          "Assignment Information"}
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* User Selection */}
                        <div className="space-y-2">
                          <label
                            className={`block text-sm font-medium ${
                              isDark ? "text-gray-300" : "text-gray-700"
                            }`}
                          >
                            {t("assignUserRole.fields.selectUser") ||
                              "Select User"}{" "}
                            <span className="text-red-500">*</span>
                          </label>
                          <div className="relative" ref={dropdownRef}>
                            <div className="relative">
                              <input
                                type="text"
                                value={userSearchTerm}
                                onChange={(e) =>
                                  handleUserSearchChange(e, setFieldValue)
                                }
                                onFocus={() => setShowUserDropdown(true)}
                                placeholder={
                                  t(
                                    "assignUserRole.placeholders.searchUsers"
                                  ) ||
                                  "Search users by name, mobile, or role..."
                                }
                                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                                  isRTL ? "pr-10" : "pl-10"
                                } ${
                                  isDark
                                    ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                                    : "bg-white border-gray-300 text-gray-900 placeholder-gray-400"
                                } ${
                                  errors.userId && touched.userId
                                    ? "border-red-500 bg-red-50 dark:bg-red-900/20"
                                    : ""
                                }`}
                                autoComplete="off"
                              />
                              <div
                                className={`absolute top-2.5 ${
                                  isRTL ? "right-3" : "left-3"
                                }`}
                              >
                                <Search
                                  size={16}
                                  className={
                                    isDark ? "text-gray-400" : "text-gray-500"
                                  }
                                />
                              </div>

                              {/* Loading indicator for user search */}
                              {usersLoading.list && (
                                <div
                                  className={`absolute top-2.5 ${
                                    isRTL ? "left-3" : "right-3"
                                  }`}
                                >
                                  <svg
                                    className="animate-spin h-5 w-5 text-gray-400"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                  >
                                    <circle
                                      className="opacity-25"
                                      cx="12"
                                      cy="12"
                                      r="10"
                                      stroke="currentColor"
                                      strokeWidth="4"
                                    ></circle>
                                    <path
                                      className="opacity-75"
                                      fill="currentColor"
                                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                    ></path>
                                  </svg>
                                </div>
                              )}
                            </div>

                            <ErrorMessage
                              name="userId"
                              component="div"
                              className="mt-1 text-sm text-red-500"
                            />

                            {/* User Dropdown */}
                            {showUserDropdown && (
                              <div
                                className={`absolute z-20 w-full mt-1 border rounded-md shadow-lg max-h-60 overflow-auto ${
                                  isDark
                                    ? "bg-gray-700 border-gray-600"
                                    : "bg-white border-gray-300"
                                }`}
                              >
                                {usersLoading.list ? (
                                  <div
                                    className={`p-4 text-center ${
                                      isDark ? "text-gray-400" : "text-gray-500"
                                    }`}
                                  >
                                    <svg
                                      className="animate-spin mx-auto h-6 w-6 text-gray-400"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                    >
                                      <circle
                                        className="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                      ></circle>
                                      <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                      ></path>
                                    </svg>
                                    <p className="mt-2">
                                      {t("assignUserRole.loading.users") ||
                                        "Loading users..."}
                                    </p>
                                  </div>
                                ) : filteredUsers.length > 0 ? (
                                  filteredUsers.map((user) => (
                                    <div
                                      key={user.id}
                                      onClick={() =>
                                        handleUserSelect(user, setFieldValue)
                                      }
                                      className={`p-3 cursor-pointer border-b last:border-b-0 transition-colors ${
                                        isDark
                                          ? "hover:bg-gray-600 border-gray-600"
                                          : "hover:bg-gray-50 border-gray-100"
                                      }`}
                                    >
                                      <div className="flex items-center gap-3">
                                        <div
                                          className={`p-1.5 rounded-full ${
                                            isDark
                                              ? "bg-gray-600"
                                              : "bg-gray-100"
                                          }`}
                                        >
                                          <User
                                            size={14}
                                            className={
                                              isDark
                                                ? "text-gray-400"
                                                : "text-gray-500"
                                            }
                                          />
                                        </div>
                                        <div>
                                          <div
                                            className={`text-sm font-medium ${
                                              isDark
                                                ? "text-white"
                                                : "text-gray-900"
                                            }`}
                                          >
                                            {user.nameEnglish}
                                          </div>
                                          <div
                                            className={`text-xs mt-1 ${
                                              isDark
                                                ? "text-gray-400"
                                                : "text-gray-500"
                                            }`}
                                          >
                                            {user.nameArabic &&
                                              `${user.nameArabic} • `}
                                            {user.mobile} • {user.role}
                                          </div>
                                          {user.primaryCategoryNameEn && (
                                            <div className="text-xs text-blue-500 dark:text-blue-500 mt-1">
                                              {user.primaryCategoryNameEn}
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  ))
                                ) : (
                                  <div
                                    className={`p-4 text-center ${
                                      isDark ? "text-gray-400" : "text-gray-500"
                                    }`}
                                  >
                                    {userSearchTerm
                                      ? t("assignUserRole.noResults") ||
                                        "No users found matching your search"
                                      : t("assignUserRole.noUsers") ||
                                        "No users available"}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Role Selection */}
                        <div className="space-y-2">
                          <label
                            htmlFor="roleId"
                            className={`block text-sm font-medium ${
                              isDark ? "text-gray-300" : "text-gray-700"
                            }`}
                          >
                            {t("assignUserRole.fields.selectRole") ||
                              "Select Role"}{" "}
                            <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <Field
                              as="select"
                              id="roleId"
                              name="roleId"
                              disabled={roleLoading.list}
                              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors appearance-none ${
                                isRTL ? "pr-10" : "pl-3 pr-10"
                              } ${
                                isDark
                                  ? "bg-gray-700 border-gray-600 text-white"
                                  : "bg-white border-gray-300 text-gray-900"
                              } ${
                                errors.roleId && touched.roleId
                                  ? "border-red-500 bg-red-50 dark:bg-red-900/20"
                                  : ""
                              }`}
                            >
                              <option value="">
                                {roleLoading.list
                                  ? t("assignUserRole.loading.roles") ||
                                    "Loading roles..."
                                  : t(
                                      "assignUserRole.placeholders.selectRole"
                                    ) || "Select a role..."}
                              </option>
                              {availableRoles.map((role) => (
                                <option key={role.id} value={role.id}>
                                  {i18next.language === "en"
                                    ? role.roleNameEn
                                    : role.roleNameAr}
                                </option>
                              ))}
                            </Field>
                            <div
                              className={`absolute top-2.5 pointer-events-none ${
                                isRTL ? "left-3" : "right-3"
                              }`}
                            >
                              <ChevronDown
                                size={16}
                                className={
                                  isDark ? "text-gray-400" : "text-gray-500"
                                }
                              />
                            </div>
                          </div>
                          <ErrorMessage
                            name="roleId"
                            component="div"
                            className="mt-1 text-sm text-red-500"
                          />
                        </div>
                      </div>

                      {/* Change Reason */}
                      <div className="space-y-2">
                        <label
                          htmlFor="changeReason"
                          className={`block text-sm font-medium ${
                            isDark ? "text-gray-300" : "text-gray-700"
                          }`}
                        >
                          {t("assignUserRole.fields.changeReason") ||
                            "Change Reason"}{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <Field
                          type="text"
                          id="changeReason"
                          name="changeReason"
                          dir={isRTL ? "rtl" : "ltr"}
                          placeholder={
                            t("assignUserRole.placeholders.changeReason") ||
                            "Enter reason for role assignment..."
                          }
                          className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                            isDark
                              ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                              : "bg-white border-gray-300 text-gray-900 placeholder-gray-400"
                          } ${
                            errors.changeReason && touched.changeReason
                              ? "border-red-500 bg-red-50 dark:bg-red-900/20"
                              : ""
                          }`}
                        />
                        <ErrorMessage
                          name="changeReason"
                          component="div"
                          className="mt-1 text-sm text-red-500"
                        />
                        <p
                          className={`text-xs ${
                            isDark ? "text-gray-400" : "text-gray-500"
                          }`}
                        >
                          {values.changeReason.length}/200{" "}
                          {t("assignUserRole.charactersCount") || "characters"}
                        </p>
                      </div>

                      {/* Notes */}
                      <div className="space-y-2">
                        <label
                          htmlFor="notes"
                          className={`block text-sm font-medium ${
                            isDark ? "text-gray-300" : "text-gray-700"
                          }`}
                        >
                          {t("assignUserRole.fields.notes") || "Notes"}
                        </label>
                        <Field
                          as="textarea"
                          id="notes"
                          name="notes"
                          rows={4}
                          dir={isRTL ? "rtl" : "ltr"}
                          placeholder={
                            t("assignUserRole.placeholders.notes") ||
                            "Additional notes (optional)..."
                          }
                          className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-vertical ${
                            isDark
                              ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                              : "bg-white border-gray-300 text-gray-900 placeholder-gray-400"
                          } ${
                            errors.notes && touched.notes
                              ? "border-red-500 bg-red-50 dark:bg-red-900/20"
                              : ""
                          }`}
                        />
                        <ErrorMessage
                          name="notes"
                          component="div"
                          className="mt-1 text-sm text-red-500"
                        />
                        <p
                          className={`text-xs ${
                            isDark ? "text-gray-400" : "text-gray-500"
                          }`}
                        >
                          {values.notes.length}/500{" "}
                          {t("assignUserRole.charactersCount") || "characters"}
                        </p>
                      </div>
                    </div>

                    {/* Submit Buttons */}
                    <div
                      className={`flex justify-end space-x-3 pt-6 border-t ${
                        isDark ? "border-gray-600" : "border-gray-200"
                      } ${isRTL ? "flex-row-reverse space-x-reverse" : ""}`}
                    >
                      <button
                        type="button"
                        onClick={() =>
                          navigate("/admin-panel/management-roles")
                        }
                        className={`px-6 py-2 border rounded-md shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer transition-colors ${
                          isDark
                            ? "border-gray-600 text-gray-300 bg-gray-700 hover:bg-gray-600"
                            : "border-gray-300 text-gray-700 bg-white hover:bg-gray-50"
                        }`}
                      >
                        {t("assignUserRole.buttons.cancel") || "Cancel"}
                      </button>

                      <button
                        type="submit"
                        disabled={isSubmitting || roleLoading.assign}
                        className={`px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer transition-colors ${
                          isSubmitting || roleLoading.assign
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-emerald-600 hover:bg-emerald-700"
                        }`}
                      >
                        {isSubmitting || roleLoading.assign ? (
                          <div className="flex items-center">
                            <svg
                              className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              ></circle>
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              ></path>
                            </svg>
                            {t("assignUserRole.buttons.assigning") ||
                              "Assigning..."}
                          </div>
                        ) : (
                          t("assignUserRole.buttons.assign") || "Assign Role"
                        )}
                      </button>
                    </div>
                  </Form>
                )}
              </Formik>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AssignUserToRole;


import React from 'react'

function AssignUserToRole() {
  return (
    <div>
      
    </div>
  )
}

export default AssignUserToRole