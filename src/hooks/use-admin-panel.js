import { useTranslation } from "react-i18next"
import { useSelector } from "react-redux"

function UseAdminPanel() {
  const { t } = useTranslation()

  const {
    loginRoleResponseDto,
    categoryManagerId,
    departmentManagerId,
    userId,
  } = useSelector((state) => state.auth)

  const roleName = loginRoleResponseDto?.roleNameEn

  const hasPermission = (permission) => {
    if (!permission) return true
    if (!loginRoleResponseDto) return false

    if (roleName === "System Administrator") return true

    if (Array.isArray(permission)) {
      return permission.some((item) => loginRoleResponseDto?.[item] === true)
    }

    return loginRoleResponseDto?.[permission] === true
  }

  const dashboard = {
    id: 1,
    name: t("adminPanel.dashboard", "Dashboard"),
    icon: "📊",
    path: "/admin-panel/dashboard",
    permission: [
      "userCanManageCategory",
      "userCanManageDepartments",
      "userCanManageRostors",
    ],
  }

  const categories = {
    id: 2,
    name:
      roleName === "System Administrator"
        ? t("adminPanel.categories", "Categories")
        : t("adminPanel.yourCategory", "Your Category"),
    icon: "📂",
    path:
      roleName === "System Administrator"
        ? "/admin-panel/categories"
        : `/admin-panel/category/${categoryManagerId}`,
    permission: "userCanManageCategory",
  }

  const departments = {
    id: 3,
    name:
      roleName === "System Administrator"
        ? t("adminPanel.departments", "Departments")
        : t("adminPanel.yourDepartment", "Your Department"),
    icon: "🏢",
    path:
      roleName === "System Administrator"
        ? "/admin-panel/departments"
        : `/admin-panel/department/${departmentManagerId}`,
    permission: "userCanManageDepartments",
  }

  const users = {
    id: 4,
    name: t("adminPanel.users", "Users"),
    icon: "👤",
    path: "/admin-panel/users",
    permission: [
      "userCanManageUsers",
      "userCanViewUsers",
      "userCanSearchUsers",
      "userCanManageRole",
    ],
  }

  const reports = {
    id: 5,
    name: t("adminPanel.reports", "Reports"),
    icon: "📄",
    path: "/admin-panel/reports",
    permission: "userCanManageCategory",
  }

  const managementRoles = {
    id: 6,
    name: t("adminPanel.managementRoles", "Management Roles"),
    icon: "👥",
    path: "/admin-panel/management-roles",
    permission: "userCanManageRole",
  }

  const scientificDegrees = {
    id: 7,
    name: t("adminPanel.scientificDegrees", "Scientific Degrees"),
    icon: "🎓",
    path: "/admin-panel/scientific-degrees",
    permission: "userCanScientificDegree",
  }

  const contractTypes = {
    id: 8,
    name: t("adminPanel.contractTypes", "Contract Types"),
    icon: "📋",
    path: "/admin-panel/contracting-types",
    permission: "userCanContractingType",
  }

  const shiftHours = {
    id: 9,
    name: t("adminPanel.shiftHours", "Shift Hours"),
    icon: "⏰",
    path: "/admin-panel/shift-hours-types",
    permission: "userCanShiftHoursType",
  }

  const roster = {
    id: 10,
    name: t("adminPanel.roster", "Roster"),
    icon: "🗓️",
    path: "/admin-panel/rosters",
    permission: "userCanManageRostors",
  }

  const specifyRole = {
    id: 11,
    name: t("selectRole.title2", "Specify Role"),
    icon: "🎭",
    path: "/specify-role",
    permission: null,
  }

  const doctor = [
    {
      id: 12,
      name: t("adminPanel.doctor", "Doctor"),
      icon: "🩺",
      path: `/admin-panel/doctors/${userId}`,
      permission: null,
    },
  ]

  const allRoutes = [
    categories,
    departments,
    users,
    reports,
    managementRoles,
    scientificDegrees,
    contractTypes,
    shiftHours,
  ]

  let adminPanelRoutes = allRoutes.filter((route) =>
    hasPermission(route.permission)
  )

  if (roleName === "System Administrator") {
    adminPanelRoutes.unshift(dashboard)

    if (!adminPanelRoutes.some((route) => route.path === roster.path)) {
      adminPanelRoutes.push(roster)
    }

    if (!adminPanelRoutes.some((route) => route.path === users.path)) {
      adminPanelRoutes.splice(3, 0, users)
    }
  }

  if (
    departmentManagerId &&
    categoryManagerId &&
    String(departmentManagerId) !== "0" &&
    String(categoryManagerId) !== "0"
  ) {
    adminPanelRoutes.push(specifyRole)
  }

  if (roleName === "Doctor") {
    adminPanelRoutes = doctor
  }

  return { adminPanelRoutes }
}

export default UseAdminPanel