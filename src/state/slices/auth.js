import { createSlice } from "@reduxjs/toolkit"

import UseInitialStates from "../../hooks/use-initial-state"
import {
  forgetPassword,
  logIn,
  resendForgetPasswordCode,
  resetPassword,
} from "../act/actAuth"

const { initialStateAuth } = UseInitialStates()

export const authSlice = createSlice({
  name: "authSlice",
  initialState: initialStateAuth,
  reducers: {
    logOut: (state) => {
      localStorage.removeItem("token")
      localStorage.removeItem("role")
      localStorage.removeItem("expiresAt")
      localStorage.setItem("departmentManagerId", "0")
      localStorage.setItem("categoryManagerId", "0")
      localStorage.removeItem("hyprid")
      state.token = ""
      state.role = ""
      state.departmentManagerId = "0"
      state.categoryManagerId = "0"
      state.expiresAt = ""
      state.hyprid = ""
    },

    setCategoryManagerRole: (state) => {
      const updatedRole = {
        ...state.loginRoleResponseDto,
        roleNameAr: "رئيس تخصص",
        roleNameEn: "Category Manager",
        userCanManageCategory: true,
        userCanManageRole: false,
        userCanManageRostors: true,
        userCanManageUsers: false,
        userCanContractingType: false,
        userCanShiftHoursType: false,
        userCanScientificDegree: false,
        userCanManageDepartments: false,
        userCanManageSubDepartments: false,
        userCanViewReports: false,
        userCanManageSchedules: false,
        userCanManageRequests: false,
      }

      localStorage.setItem("loginRoleResponseDto", JSON.stringify(updatedRole))
      state.loginRoleResponseDto = updatedRole
      localStorage.setItem("hyprid", "category")
      state.hyprid = "category"
    },

    // New action for department manager role specification
    setDepartmentManagerRole: (state) => {
      const updatedRole = {
        ...state.loginRoleResponseDto,
        roleNameAr: "رئيس قسم",
        roleNameEn: "Department Manager",
        userCanManageCategory: false,
        userCanManageRole: false,
        userCanManageRostors: false,
        userCanManageUsers: false,
        userCanContractingType: false,
        userCanShiftHoursType: false,
        userCanScientificDegree: false,
        userCanManageDepartments: true,
        userCanManageSubDepartments: false,
        userCanViewReports: false,
        userCanManageSchedules: false,
        userCanManageRequests: false,
      }

      localStorage.setItem("loginRoleResponseDto", JSON.stringify(updatedRole))
      state.loginRoleResponseDto = updatedRole

      localStorage.setItem("hyprid", "department")
      state.hyprid = "department"
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(logIn.pending, (state, action) => {
        state.loadingAuth = true
      })
      .addCase(logIn.fulfilled, (state, action) => {
        state.loadingAuth = false
        localStorage.setItem("token", action.payload.data.accessToken)
        state.token = action.payload.data.accessToken

        localStorage.setItem("userId", action.payload.data.user.userId)
        state.userId = action.payload.data.user.userId

        localStorage.setItem("expiresAt", action.payload.data.expiresAt)
        state.expiresAt = action.payload.data.expiresAt

        localStorage.setItem(
          "loginRoleResponseDto",
          JSON.stringify(action.payload.data.user.loginRoleResponseDto)
        )
        state.loginRoleResponseDto =
          action.payload.data.user.loginRoleResponseDto

        console.log(
          "data from slice",
          action.payload.data.user.departmentManager?.departmentId
        )

        localStorage.setItem(
          "departmentManagerId",
          action.payload.data.user.departmentManager?.departmentId
        )
        state.departmentManagerId =
          action.payload.data.user.departmentManager?.departmentId || "0"

        localStorage.setItem(
          "categoryManagerId",
          action.payload.data.user.categoryManager?.categoryId
        )
        state.categoryManagerId =
          action.payload.data.user.categoryManager?.categoryId || "0"
      })

      .addCase(logIn.rejected, (state, action) => {
        state.loadingAuth = false
      })
      .addCase(forgetPassword.pending, (state, action) => {
        state.loadingAuth = true
      })
      .addCase(forgetPassword.fulfilled, (state, action) => {
        state.loadingAuth = false
        console.log("action.payload", action.payload)
      })
      .addCase(forgetPassword.rejected, (state, action) => {
        state.loadingAuth = false
      })
      .addCase(resetPassword.pending, (state, action) => {
        state.loadingAuth = true
      })
      .addCase(resetPassword.fulfilled, (state, action) => {
        state.loadingAuth = false
        console.log("action.payload", action.payload)
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.loadingAuth = false
      })
      .addCase(resendForgetPasswordCode.pending, (state, action) => {
        state.loadingAuth = true
      })
      .addCase(resendForgetPasswordCode.fulfilled, (state, action) => {
        state.loadingAuth = false
        console.log("action.payload", action.payload)
      })
      .addCase(resendForgetPasswordCode.rejected, (state, action) => {
        state.loadingAuth = false
      })
  },
})

export default authSlice.reducer
export const { logOut, setDepartmentManagerRole, setCategoryManagerRole } =
  authSlice.actions
export { logIn }
