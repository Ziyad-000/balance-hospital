import React from "react"
import { Navigate } from "react-router-dom"
import { useSelector } from "react-redux"

const AdminPanelIndex = () => {
  const {
    categoryManagerId,
    departmentManagerId,
    loginRoleResponseDto,
    hyprid,
    userId,
  } = useSelector((state) => state.auth)

  const roleNameEn = loginRoleResponseDto?.roleNameEn || ""
  const roleNameAr = loginRoleResponseDto?.roleNameAr || ""

  const isCategoryHead =
    roleNameEn === "Category Head" ||
    roleNameEn === "Category Manager" ||
    roleNameEn.includes("Category") ||
    roleNameAr.includes("رئيس تخصص") ||
    roleNameAr.includes("مدير تخصص") ||
    hyprid === "category"

  const isDepartmentManager =
    roleNameEn === "Department Manager" ||
    roleNameEn === "Department Head" ||
    roleNameEn.includes("Department") ||
    roleNameAr.includes("رئيس قسم") ||
    roleNameAr.includes("مدير قسم") ||
    hyprid === "department"

  const isSystemAdministrator =
    roleNameEn === "System Administrator" ||
    roleNameEn.includes("System Administrator") ||
    roleNameAr === "مدير النظام"

  if (isCategoryHead && categoryManagerId && categoryManagerId !== "0") {
    return <Navigate to={`/admin-panel/category/${categoryManagerId}`} replace />
  }

  if (
    isDepartmentManager &&
    departmentManagerId &&
    departmentManagerId !== "0"
  ) {
    return (
      <Navigate to={`/admin-panel/department/${departmentManagerId}`} replace />
    )
  }

  if (isSystemAdministrator) {
    return <Navigate to="/admin-panel/dashboard" replace />
  }

  if (userId) {
    return <Navigate to={`/admin-panel/doctors/${userId}`} replace />
  }

  return <Navigate to="/admin-panel/profile" replace />
}

export default AdminPanelIndex