// pages/ManagementRoles/CreateManagementRole.jsx
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import { useTranslation } from "react-i18next";
import {
  createManagementRole,
  checkRoleNameUnique,
} from "../../../state/act/actManagementRole";
import { useNavigate } from "react-router-dom";
import {
  Shield,
  Settings,
  Users,
  Activity,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
} from "lucide-react";
import UseFormValidation from "../../../hooks/use-form-validation";
import UseInitialValues from "../../../hooks/use-initial-values";

function CreateManagementRole() {
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const currentLang = i18n.language;
  const isRTL = currentLang === "ar";

  const { loading, error } = useSelector((state) => state.managementRoles);
  const { mymode } = useSelector((state) => state.mode);
  const isDark = mymode === "dark";

  // State for collapsible sections
  const [expandedSections, setExpandedSections] = useState({
    core: true,
    configuration: false,
    departments: false,
    operations: false,
  });

  // Initial form values
  const { INITIAL_VALUES_ADD_ROLE } = UseInitialValues();

  // Validation schema
  const { VALIDATION_SCHEMA_ADD_ROLE } = UseFormValidation();

  // Permission groups
  const permissionGroups = [
    {
      key: "core",
      title: t("managementRoleForm.permissions.core") || "Core Management",
      icon: <Shield size={20} />,
      permissions: [
        {
          key: "userCanManageCategory",
          label:
            t("managementRoleForm.permissions.manageCategory") ||
            "Manage Categories",
        },
        {
          key: "userCanManageRole",
          label:
            t("managementRoleForm.permissions.manageRole") || "Manage Roles",
        },
        {
          key: "userCanManageUsers",
          label:
            t("managementRoleForm.permissions.manageUsers") || "Manage Users",
        },
        {
          key: "userCanManageRostors",
          label:
            t("managementRoleForm.permissions.manageRostors") ||
            "Manage Rosters",
        },
      ],
    },
    {
      key: "configuration",
      title:
        t("managementRoleForm.permissions.configuration") || "Configuration",
      icon: <Settings size={20} />,
      permissions: [
        {
          key: "userCanContractingType",
          label:
            t("managementRoleForm.permissions.contractingType") ||
            "Contracting Types",
        },
        {
          key: "userCanShiftHoursType",
          label:
            t("managementRoleForm.permissions.shiftHoursType") ||
            "Shift Hours Types",
        },
        {
          key: "userCanScientificDegree",
          label:
            t("managementRoleForm.permissions.scientificDegree") ||
            "Scientific Degrees",
        },
      ],
    },
    {
      key: "departments",
      title:
        t("managementRoleForm.permissions.departments") ||
        "Department Management",
      icon: <Users size={20} />,
      permissions: [
        {
          key: "userCanManageDepartments",
          label:
            t("managementRoleForm.permissions.manageDepartments") ||
            "Manage Departments",
        },
        {
          key: "userCanManageSubDepartments",
          label:
            t("managementRoleForm.permissions.manageSubDepartments") ||
            "Manage Sub-Departments",
        },
      ],
    },
    {
      key: "operations",
      title: t("managementRoleForm.permissions.operations") || "Operations",
      icon: <Activity size={20} />,
      permissions: [
        {
          key: "userCanViewReports",
          label:
            t("managementRoleForm.permissions.viewReports") || "View Reports",
        },
        {
          key: "userCanManageSchedules",
          label:
            t("managementRoleForm.permissions.manageSchedules") ||
            "Manage Schedules",
        },
        {
          key: "userCanManageRequests",
          label:
            t("managementRoleForm.permissions.manageRequests") ||
            "Manage Requests",
        },
      ],
    },
  ];

  // Toggle section expansion
  const toggleSection = (sectionKey) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionKey]: !prev[sectionKey],
    }));
  };

  // Handle form submission
  const handleSubmit = async (
    values,
    { setSubmitting, resetForm, setFieldError }
  ) => {
    try {
      // Check name uniqueness
      const uniqueResult = await dispatch(
        checkRoleNameUnique({
          nameAr: values.roleNameAr,
          nameEn: values.roleNameEn,
        })
      );

      if (!uniqueResult.payload?.data?.isUnique) {
        setFieldError(
          "roleNameAr",
          t("managementRoleForm.validation.nameExists") ||
            "Role name already exists"
        );
        setFieldError(
          "roleNameEn",
          t("managementRoleForm.validation.nameExists") ||
            "Role name already exists"
        );
        setSubmitting(false);
        return;
      }

      // Create the role
      await dispatch(createManagementRole(values)).unwrap();

      // Success handling
      resetForm();
      toast.success(
        t("managementRoleForm.success.created") ||
          "Management role created successfully",
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
    } catch (error) {
      console.error("Management role creation error:", error);

      Swal.fire({
        title: t("managementRoleForm.error.title") || "Error",
        text:
          currentLang === "en"
            ? error?.messageEn ||
              error?.message ||
              "Failed to create management role"
            : error?.messageAr || error?.message || "فشل في إنشاء دور الإدارة",
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
                {t("managementRoleForm.title") || "Create Management Role"}
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
                initialValues={INITIAL_VALUES_ADD_ROLE}
                validationSchema={VALIDATION_SCHEMA_ADD_ROLE}
                onSubmit={handleSubmit}
                enableReinitialize
              >
                {({ isSubmitting, errors, touched, values, setFieldValue }) => (
                  <Form className="space-y-6">
                    {/* Basic Information Section */}
                    <div className="space-y-6">
                      <h3
                        className={`text-lg font-semibold border-b pb-2 ${
                          isDark
                            ? "text-white border-gray-600"
                            : "text-gray-900 border-gray-200"
                        }`}
                      >
                        {t("managementRoleForm.sections.basicInfo") ||
                          "Basic Information"}
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Arabic Name */}
                        <div>
                          <label
                            htmlFor="roleNameAr"
                            className={`block text-sm font-medium mb-2 ${
                              isDark ? "text-gray-300" : "text-gray-700"
                            }`}
                          >
                            {t("managementRoleForm.fields.roleNameAr") ||
                              "Arabic Name"}{" "}
                            <span className="text-red-500">*</span>
                          </label>
                          <Field
                            type="text"
                            id="roleNameAr"
                            name="roleNameAr"
                            dir="rtl"
                            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                              isDark
                                ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                                : "bg-white border-gray-300 text-gray-900"
                            } ${
                              errors.roleNameAr && touched.roleNameAr
                                ? "border-red-500 bg-red-50 dark:bg-red-900/20"
                                : ""
                            }`}
                            placeholder={
                              t("managementRoleForm.placeholders.roleNameAr") ||
                              "Enter Arabic name"
                            }
                          />
                          <ErrorMessage
                            name="roleNameAr"
                            component="div"
                            className="mt-1 text-sm text-red-500"
                          />
                        </div>

                        {/* English Name */}
                        <div>
                          <label
                            htmlFor="roleNameEn"
                            className={`block text-sm font-medium mb-2 ${
                              isDark ? "text-gray-300" : "text-gray-700"
                            }`}
                          >
                            {t("managementRoleForm.fields.roleNameEn") ||
                              "English Name"}{" "}
                            <span className="text-red-500">*</span>
                          </label>
                          <Field
                            type="text"
                            id="roleNameEn"
                            name="roleNameEn"
                            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                              isDark
                                ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                                : "bg-white border-gray-300 text-gray-900"
                            } ${
                              errors.roleNameEn && touched.roleNameEn
                                ? "border-red-500 bg-red-50 dark:bg-red-900/20"
                                : ""
                            }`}
                            placeholder={
                              t("managementRoleForm.placeholders.roleNameEn") ||
                              "Enter English name"
                            }
                          />
                          <ErrorMessage
                            name="roleNameEn"
                            component="div"
                            className="mt-1 text-sm text-red-500"
                          />
                        </div>
                      </div>

                      {/* Description */}
                      <div>
                        <label
                          htmlFor="description"
                          className={`block text-sm font-medium mb-2 ${
                            isDark ? "text-gray-300" : "text-gray-700"
                          }`}
                        >
                          {t("managementRoleForm.fields.description") ||
                            "Description"}
                        </label>
                        <Field
                          as="textarea"
                          id="description"
                          name="description"
                          rows={4}
                          dir={isRTL ? "rtl" : "ltr"}
                          className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-vertical ${
                            isDark
                              ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                              : "bg-white border-gray-300 text-gray-900"
                          } ${
                            errors.description && touched.description
                              ? "border-red-500 bg-red-50 dark:bg-red-900/20"
                              : ""
                          }`}
                          placeholder={
                            t("managementRoleForm.placeholders.description") ||
                            "Enter role description"
                          }
                        />
                        <ErrorMessage
                          name="description"
                          component="div"
                          className="mt-1 text-sm text-red-500"
                        />
                        <p
                          className={`mt-1 text-xs ${
                            isDark ? "text-gray-400" : "text-gray-500"
                          }`}
                        >
                          {values.description.length}/500{" "}
                          {t("managementRoleForm.charactersCount") ||
                            "characters"}
                        </p>
                      </div>
                    </div>

                    {/* Permissions Section */}
                    <div className="space-y-4">
                      <h3
                        className={`text-lg font-semibold border-b pb-2 ${
                          isDark
                            ? "text-white border-gray-600"
                            : "text-gray-900 border-gray-200"
                        }`}
                      >
                        {t("managementRoleForm.sections.permissions") ||
                          "Permissions"}
                      </h3>
                      {errors.userCanManageCategory &&
                        touched.userCanManageCategory && (
                          <div className="mb-4 p-3 border border-red-300 bg-red-50 dark:bg-red-900/20 dark:border-red-600 rounded-md">
                            <p className="text-sm text-red-500 dark:text-red-500">
                              {errors.userCanManageCategory}
                            </p>
                          </div>
                        )}
                      {permissionGroups.map((group) => (
                        <div
                          key={group.key}
                          className={`border rounded-lg ${
                            isDark ? "border-gray-600" : "border-gray-200"
                          }`}
                        >
                          {/* Group Header */}
                          <button
                            type="button"
                            onClick={() => toggleSection(group.key)}
                            className={`w-full flex items-center justify-between p-4 text-left focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-t-lg ${
                              isDark
                                ? "bg-gray-700 hover:bg-gray-600 text-white"
                                : "bg-gray-50 hover:bg-gray-100 text-gray-900"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              {group.icon}
                              <span className="font-medium">{group.title}</span>
                            </div>
                            {expandedSections[group.key] ? (
                              <ChevronUp size={20} />
                            ) : (
                              <ChevronDown size={20} />
                            )}
                          </button>

                          {/* Group Permissions */}
                          {expandedSections[group.key] && (
                            <div
                              className={`p-4 border-t ${
                                isDark
                                  ? "border-gray-600 bg-gray-800"
                                  : "border-gray-200 bg-white"
                              }`}
                            >
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {group.permissions.map((permission) => (
                                  <label
                                    key={permission.key}
                                    className={`flex items-center space-x-3 cursor-pointer p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                                      isRTL
                                        ? "flex-row-reverse space-x-reverse"
                                        : ""
                                    }`}
                                  >
                                    <Field
                                      type="checkbox"
                                      name={permission.key}
                                      className="w-4 h-4 text-blue-500 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                                    />
                                    <span
                                      className={`text-sm ${
                                        isDark
                                          ? "text-gray-300"
                                          : "text-gray-700"
                                      }`}
                                    >
                                      {permission.label}
                                    </span>
                                  </label>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Submit Buttons */}
                    <div
                      className={`flex justify-end space-x-3 pt-6 border-t ${
                        isDark ? "border-gray-600" : "border-gray-200"
                      } ${isRTL ? "flex-row-reverse space-x-reverse" : ""}`}
                    >
                      <button
                        type="button"
                        className={`px-6 py-2 border rounded-md shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer transition-colors ${
                          isDark
                            ? "border-gray-600 text-gray-300 bg-gray-700 hover:bg-gray-600"
                            : "border-gray-300 text-gray-700 bg-white hover:bg-gray-50"
                        }`}
                        onClick={() =>
                          navigate("/admin-panel/management-roles")
                        }
                      >
                        {t("managementRoleForm.buttons.cancel") || "Cancel"}
                      </button>

                      <button
                        type="submit"
                        disabled={isSubmitting || loading.create}
                        className={`px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer transition-colors ${
                          isSubmitting || loading.create
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-emerald-600 hover:bg-emerald-700"
                        }`}
                      >
                        {isSubmitting || loading.create ? (
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
                            {t("managementRoleForm.buttons.creating") ||
                              "Creating..."}
                          </div>
                        ) : (
                          t("managementRoleForm.buttons.create") ||
                          "Create Role"
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

export default CreateManagementRole;

import React from "react";

function CreateManagementRole() {
  return <div>CreateManagementRole</div>;
}

export default CreateManagementRole;