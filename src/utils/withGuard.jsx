import { useEffect } from "react"
import { useSelector } from "react-redux"
import { useLocation, useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import Forbidden from "../components/forbidden"

// Routes that require specific permissions
const ROUTE_PERMISSIONS = {
  // Categories
  "/admin-panel/categories": "userCanManageCategory",
  "/admin-panel/category": "userCanManageCategory",

  // Departments
  "/admin-panel/departments": "userCanManageDepartments",
  "/admin-panel/department": [
    "userCanManageCategory",
    "userCanManageDepartments",
  ],

  // Sub-departments
  "/admin-panel/sub-departments": "userCanManageSubDepartments",
  "/admin-panel/sub-department": "userCanManageSubDepartments",

  // Management Roles
  "/admin-panel/management-roles": "userCanManageRole",

  // Scientific Degrees
  "/admin-panel/scientific-degrees": "userCanScientificDegree",

  // Contracting Types
  "/admin-panel/contracting-types": "userCanContractingType",

  // Shift Hours
  "/admin-panel/shift-hours-types": "userCanShiftHoursType",

  // Rosters
  "/admin-panel/rosters": "userCanManageRostors",

  // Users
  "/admin-panel/users": "userCanManageUsers",

  // Schedules
  "/admin-panel/schedules": "userCanManageSchedules",

  // Reports
  "/admin-panel/reports": "userCanManageCategory",

  // Dashboard — requires roster management permission
  "/admin-panel/dashboard": "userCanManageRostors",
}

const hasAnyPermission = (userPermissions, requiredPermissions) => {
  if (!userPermissions) return false

  if (typeof requiredPermissions === "string") {
    return userPermissions[requiredPermissions] === true
  }

  if (Array.isArray(requiredPermissions)) {
    return requiredPermissions.some(
      (permission) => userPermissions[permission] === true
    )
  }

  return false
}

// Function to get required permission for a route
const getRequiredPermission = (pathname) => {
  // Check for exact matches first
  if (ROUTE_PERMISSIONS[pathname]) {
    return ROUTE_PERMISSIONS[pathname]
  }

  // Check for partial matches (for nested routes) — longest match wins
  let bestMatch = null
  let bestMatchLength = 0
  for (const [route, permission] of Object.entries(ROUTE_PERMISSIONS)) {
    if (pathname.startsWith(route) && route.length > bestMatchLength) {
      bestMatch = permission
      bestMatchLength = route.length
    }
  }

  return bestMatch // null = No specific permission required
}

export const withGuard = (Component, specificPermission = null) => {
  const Wrapper = (props) => {
    const { t } = useTranslation()
    const navigate = useNavigate()
    const { token, loginRoleResponseDto } = useSelector((state) => state.auth)
    const location = useLocation()

    const isProtectedRoute = location.pathname.startsWith("/admin-panel")
    const isPublicAuthRoute =
      location.pathname === "/login" ||
      location.pathname === "/signup" ||
      location.pathname === "/forget-password" ||
      location.pathname === "/reset-password"

    useEffect(() => {
      // If no token and trying to access protected route → redirect to login
      if (!token && isProtectedRoute) {
        navigate("/login", {
          state: { from: location.pathname },
          replace: true,
        })
        return
      }

      // If has token and trying to access public auth pages → redirect to admin panel
      if (token && isPublicAuthRoute) {
        navigate("/admin-panel", { replace: true })
      }
    }, [navigate, token, location.pathname, isProtectedRoute, isPublicAuthRoute])

    // Block render while redirecting (unauthenticated on protected route)
    if (!token && isProtectedRoute) {
      return null
    }

    // Block render while redirecting (authenticated on public auth page)
    if (token && isPublicAuthRoute) {
      return null
    }

    // Authorization check (permission-based) — only for protected routes
    if (token && isProtectedRoute) {
      const requiredPermission =
        specificPermission || getRequiredPermission(location.pathname)

      if (requiredPermission && loginRoleResponseDto) {
        const hasPermission = hasAnyPermission(
          loginRoleResponseDto,
          requiredPermission
        )

        if (!hasPermission) {
          return <Forbidden />
        }
      }
    }

    return <Component {...props} />
  }

  Wrapper.displayName = `withGuard(${Component.displayName || Component.name})`
  return Wrapper
}

export default withGuard
