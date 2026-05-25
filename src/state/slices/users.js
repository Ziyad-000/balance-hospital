import { createSlice } from "@reduxjs/toolkit"
import {
  getUserSummaries,
  getUserById,
  updateUser,
  deleteUser,
  approveUser,
  rejectUser,

  getPendingApprovalUsers,
  getDeletedUsers,
  getRejectedUsers,
  getUserStatistics,

  searchUsers,
  quickSearchUsers,
  getUsersByCategory,

  getDoctorReport,
  getDoctorRosters,
  getDoctorAttendance,
  getDoctorLeaves,
  getDoctorSwaps,

  getUserActivityLog,
  getUserLoginHistory,
} from "../act/actUsersData"

const initialState = {
  // =========================
  // Main Users List
  // =========================
  users: [],
  userSummaries: [],
  usersPagination: null,
  summariesPagination: null,

  filters: {
    categoryId: "",
    scientificDegreeId: "",
    contractingTypeId: "",
    isApproved: "",
    isEmailVerified: "",
    createdFrom: "",
    createdTo: "",
    page: 1,
    pageSize: 10,
    search: "",
    sortBy: "",
    sortDirection: 0,
  },

  loadingGetUserSummaries: false,
  userSummariesError: null,

  // =========================
  // User Details
  // =========================
  selectedUser: null,
  loadingGetUserById: false,
  getUserByIdError: null,

  // =========================
  // Update / Delete
  // =========================
  loadingUpdateUser: false,
  updateUserError: null,
  updateUserSuccess: false,
  updateUserMessage: "",

  loadingDeleteUser: false,
  deleteUserError: null,
  deleteUserSuccess: false,
  deleteUserMessage: "",
  deletedUserId: null,

  // =========================
  // Approval / Rejection
  // =========================
  loadingApproveUser: false,
  approveUserError: null,
  approveUserSuccess: false,
  approveUserMessage: "",
  approvedUserId: null,

  loadingRejectUser: false,
  rejectUserError: null,
  rejectUserSuccess: false,
  rejectUserMessage: "",
  rejectedUserId: null,

  // =========================
  // Status Lists
  // =========================
  pendingUsers: [],
  pendingUsersPagination: null,
  loadingGetPendingApprovalUsers: false,
  pendingUsersError: null,

  deletedUsers: [],
  deletedUsersPagination: null,
  loadingGetDeletedUsers: false,
  deletedUsersError: null,

  rejectedUsers: [],
  rejectedUsersPagination: null,
  loadingGetRejectedUsers: false,
  rejectedUsersError: null,

  // =========================
  // Statistics
  // =========================
  userStatistics: null,
  loadingGetUserStatistics: false,
  userStatisticsError: null,

  // =========================
  // Search
  // =========================
  searchResults: [],
  searchPagination: null,
  loadingSearchUsers: false,
  searchUsersError: null,

  quickSearchResults: [],
  quickSearchPagination: null,
  loadingQuickSearchUsers: false,
  quickSearchUsersError: null,

  usersByCategory: [],
  selectedCategoryUsers: [],
  selectedCategoryUsersCategoryId: null,
  loadingGetUsersByCategory: false,
  usersByCategoryError: null,

  // =========================
  // Doctor Analytics
  // =========================
  doctorReport: null,
  loadingGetDoctorReport: false,
  doctorReportError: null,

  doctorRosters: [],
  doctorRostersPagination: null,
  loadingGetDoctorRosters: false,
  doctorRostersError: null,

  doctorAttendance: [],
  doctorAttendancePagination: null,
  loadingGetDoctorAttendance: false,
  doctorAttendanceError: null,

  doctorLeaves: [],
  doctorLeavesPagination: null,
  loadingGetDoctorLeaves: false,
  doctorLeavesError: null,

  doctorSwaps: [],
  doctorSwapsPagination: null,
  loadingGetDoctorSwaps: false,
  doctorSwapsError: null,

  // =========================
  // Activity / Login Logs
  // =========================
  activityLog: [],
  activityLogPagination: null,
  loadingGetUserActivityLog: false,
  userActivityLogError: null,

  loginHistory: [],
  loginHistoryPagination: null,
  loadingGetUserLoginHistory: false,
  userLoginHistoryError: null,

  // =========================
  // Global
  // =========================
  error: null,
  message: "",
  timestamp: null,
}

const extractData = (payload) => payload?.data ?? payload ?? null

const extractList = (payload) => {
  const data = extractData(payload)

  if (Array.isArray(data)) return data
  if (Array.isArray(data?.items)) return data.items
  if (Array.isArray(data?.rows)) return data.rows
  if (Array.isArray(data?.data)) return data.data

  return []
}

const extractPagination = (payload) => {
  const data = extractData(payload)

  if (!data || Array.isArray(data)) return null

  return {
    page: data.page ?? data.currentPage ?? 1,
    pageSize: data.pageSize ?? 10,
    totalCount: data.totalCount ?? data.totalRecords ?? data.count ?? 0,
    totalPages: data.totalPages ?? 1,
    hasPrevious: data.hasPrevious ?? data.hasPreviousPage ?? false,
    hasNext: data.hasNext ?? data.hasNextPage ?? false,
    startIndex: data.startIndex ?? 0,
    endIndex: data.endIndex ?? 0,
  }
}

const extractMessage = (payload, fallback = "") => {
  return (
    payload?.messageAr ||
    payload?.messageEn ||
    payload?.message ||
    fallback
  )
}

const normalizeError = (payload, fallback = "حدث خطأ") => {
  if (!payload) {
    return {
      message: fallback,
      errors: [],
      status: null,
      timestamp: new Date().toISOString(),
    }
  }

  if (typeof payload === "string") {
    return {
      message: payload,
      errors: [],
      status: null,
      timestamp: new Date().toISOString(),
    }
  }

  return {
    message:
      payload.message ||
      payload.messageAr ||
      payload.messageEn ||
      fallback,
    messageAr: payload.messageAr,
    messageEn: payload.messageEn,
    errors: payload.errors || [],
    status: payload.status,
    data: payload.data,
    timestamp: payload.timestamp || new Date().toISOString(),
  }
}

const updateUserInList = (list, updatedUser) => {
  if (!updatedUser?.id || !Array.isArray(list)) return list

  return list.map((user) =>
    Number(user.id) === Number(updatedUser.id)
      ? {
          ...user,
          ...updatedUser,
        }
      : user
  )
}

const removeUserFromList = (list, userId) => {
  if (!Array.isArray(list)) return []

  return list.filter((user) => Number(user.id) !== Number(userId))
}

export const usersSlice = createSlice({
  name: "usersSlice",
  initialState,
  reducers: {
    // =========================
    // Filters
    // =========================
    setUsersFilters: (state, action) => {
      state.filters = {
        ...state.filters,
        ...action.payload,
      }
    },

    clearUsersFilters: (state) => {
      state.filters = {
        categoryId: "",
        scientificDegreeId: "",
        contractingTypeId: "",
        isApproved: "",
        isEmailVerified: "",
        createdFrom: "",
        createdTo: "",
        page: 1,
        pageSize: 10,
        search: "",
        sortBy: "",
        sortDirection: 0,
      }
    },

    setUsersCurrentPage: (state, action) => {
      state.filters.page = action.payload
    },

    setUsersPageSize: (state, action) => {
      state.filters.pageSize = action.payload
      state.filters.page = 1
    },

    // =========================
    // Clear Main
    // =========================
    clearUsers: (state) => {
      state.users = []
      state.userSummaries = []
      state.usersPagination = null
      state.summariesPagination = null
      state.userSummariesError = null
    },

    clearUsersError: (state) => {
      state.error = null
      state.userSummariesError = null
      state.getUserByIdError = null
      state.searchUsersError = null
      state.quickSearchUsersError = null
    },

    // =========================
    // Selected User
    // =========================
    clearSelectedUser: (state) => {
      state.selectedUser = null
      state.getUserByIdError = null
    },

    // =========================
    // Update / Delete
    // =========================
    clearUpdateUserState: (state) => {
      state.loadingUpdateUser = false
      state.updateUserError = null
      state.updateUserSuccess = false
      state.updateUserMessage = ""
    },

    clearDeleteUserState: (state) => {
      state.loadingDeleteUser = false
      state.deleteUserError = null
      state.deleteUserSuccess = false
      state.deleteUserMessage = ""
      state.deletedUserId = null
    },

    // =========================
    // Approval / Rejection
    // =========================
    clearApproveUserState: (state) => {
      state.loadingApproveUser = false
      state.approveUserError = null
      state.approveUserSuccess = false
      state.approveUserMessage = ""
      state.approvedUserId = null
    },

    clearRejectUserState: (state) => {
      state.loadingRejectUser = false
      state.rejectUserError = null
      state.rejectUserSuccess = false
      state.rejectUserMessage = ""
      state.rejectedUserId = null
    },

    // =========================
    // Status Lists
    // =========================
    clearPendingUsers: (state) => {
      state.pendingUsers = []
      state.pendingUsersPagination = null
      state.pendingUsersError = null
    },

    clearDeletedUsers: (state) => {
      state.deletedUsers = []
      state.deletedUsersPagination = null
      state.deletedUsersError = null
    },

    clearRejectedUsers: (state) => {
      state.rejectedUsers = []
      state.rejectedUsersPagination = null
      state.rejectedUsersError = null
    },

    // =========================
    // Statistics
    // =========================
    clearUserStatistics: (state) => {
      state.userStatistics = null
      state.userStatisticsError = null
    },

    // =========================
    // Search
    // =========================
    clearSearchResults: (state) => {
      state.searchResults = []
      state.searchPagination = null
      state.searchUsersError = null
    },

    clearQuickSearchResults: (state) => {
      state.quickSearchResults = []
      state.quickSearchPagination = null
      state.quickSearchUsersError = null
    },

    clearUsersByCategory: (state) => {
      state.usersByCategory = []
      state.selectedCategoryUsers = []
      state.selectedCategoryUsersCategoryId = null
      state.usersByCategoryError = null
    },

    // =========================
    // Doctor Analytics
    // =========================
    clearDoctorReport: (state) => {
      state.doctorReport = null
      state.doctorReportError = null
    },

    clearDoctorRosters: (state) => {
      state.doctorRosters = []
      state.doctorRostersPagination = null
      state.doctorRostersError = null
    },

    clearDoctorAttendance: (state) => {
      state.doctorAttendance = []
      state.doctorAttendancePagination = null
      state.doctorAttendanceError = null
    },

    clearDoctorLeaves: (state) => {
      state.doctorLeaves = []
      state.doctorLeavesPagination = null
      state.doctorLeavesError = null
    },

    clearDoctorSwaps: (state) => {
      state.doctorSwaps = []
      state.doctorSwapsPagination = null
      state.doctorSwapsError = null
    },

    clearDoctorAnalytics: (state) => {
      state.doctorReport = null
      state.doctorRosters = []
      state.doctorAttendance = []
      state.doctorLeaves = []
      state.doctorSwaps = []

      state.doctorRostersPagination = null
      state.doctorAttendancePagination = null
      state.doctorLeavesPagination = null
      state.doctorSwapsPagination = null

      state.doctorReportError = null
      state.doctorRostersError = null
      state.doctorAttendanceError = null
      state.doctorLeavesError = null
      state.doctorSwapsError = null
    },

    // =========================
    // Logs
    // =========================
    clearUserActivityLog: (state) => {
      state.activityLog = []
      state.activityLogPagination = null
      state.userActivityLogError = null
    },

    clearUserLoginHistory: (state) => {
      state.loginHistory = []
      state.loginHistoryPagination = null
      state.userLoginHistoryError = null
    },

    clearUserLogs: (state) => {
      state.activityLog = []
      state.loginHistory = []
      state.activityLogPagination = null
      state.loginHistoryPagination = null
      state.userActivityLogError = null
      state.userLoginHistoryError = null
    },
  },

  extraReducers: (builder) => {
    builder
      // =========================
      // Get User Summaries
      // =========================
      .addCase(getUserSummaries.pending, (state) => {
        state.loadingGetUserSummaries = true
        state.userSummariesError = null
        state.error = null
      })

      .addCase(getUserSummaries.fulfilled, (state, action) => {
        state.loadingGetUserSummaries = false

        const list = extractList(action.payload)
        const pagination = extractPagination(action.payload)

        state.userSummaries = list
        state.users = list
        state.summariesPagination = pagination
        state.usersPagination = pagination

        state.message = extractMessage(action.payload)
        state.timestamp = action.payload?.timestamp || null
        state.userSummariesError = null
        state.error = null
      })

      .addCase(getUserSummaries.rejected, (state, action) => {
        state.loadingGetUserSummaries = false
        state.userSummaries = []
        state.users = []
        state.summariesPagination = null
        state.usersPagination = null
        state.userSummariesError = normalizeError(
          action.payload,
          "حدث خطأ في جلب ملخصات المستخدمين"
        )
        state.error = state.userSummariesError
      })

      // =========================
      // Get User By Id
      // =========================
      .addCase(getUserById.pending, (state) => {
        state.loadingGetUserById = true
        state.getUserByIdError = null
      })

      .addCase(getUserById.fulfilled, (state, action) => {
        state.loadingGetUserById = false
        state.selectedUser = extractData(action.payload)
        state.getUserByIdError = null
      })

      .addCase(getUserById.rejected, (state, action) => {
        state.loadingGetUserById = false
        state.selectedUser = null
        state.getUserByIdError = normalizeError(
          action.payload,
          "حدث خطأ في جلب بيانات المستخدم"
        )
      })

      // =========================
      // Update User
      // =========================
      .addCase(updateUser.pending, (state) => {
        state.loadingUpdateUser = true
        state.updateUserError = null
        state.updateUserSuccess = false
        state.updateUserMessage = ""
      })

      .addCase(updateUser.fulfilled, (state, action) => {
        state.loadingUpdateUser = false
        state.updateUserSuccess = true
        state.updateUserMessage = extractMessage(
          action.payload,
          "تم تحديث المستخدم بنجاح"
        )
        state.updateUserError = null

        const updatedUser = extractData(action.payload)

        if (updatedUser?.id) {
          state.selectedUser = updatedUser
          state.users = updateUserInList(state.users, updatedUser)
          state.userSummaries = updateUserInList(state.userSummaries, updatedUser)
          state.searchResults = updateUserInList(state.searchResults, updatedUser)
          state.pendingUsers = updateUserInList(state.pendingUsers, updatedUser)
          state.deletedUsers = updateUserInList(state.deletedUsers, updatedUser)
          state.rejectedUsers = updateUserInList(state.rejectedUsers, updatedUser)
          state.usersByCategory = updateUserInList(state.usersByCategory, updatedUser)
          state.selectedCategoryUsers = updateUserInList(
            state.selectedCategoryUsers,
            updatedUser
          )
        }
      })

      .addCase(updateUser.rejected, (state, action) => {
        state.loadingUpdateUser = false
        state.updateUserSuccess = false
        state.updateUserError = normalizeError(
          action.payload,
          "حدث خطأ في تحديث بيانات المستخدم"
        )
      })

      // =========================
      // Delete User
      // =========================
      .addCase(deleteUser.pending, (state) => {
        state.loadingDeleteUser = true
        state.deleteUserError = null
        state.deleteUserSuccess = false
        state.deleteUserMessage = ""
        state.deletedUserId = null
      })

      .addCase(deleteUser.fulfilled, (state, action) => {
        state.loadingDeleteUser = false
        state.deleteUserSuccess = true
        state.deleteUserMessage = extractMessage(
          action.payload,
          "تم حذف المستخدم بنجاح"
        )
        state.deleteUserError = null

        const deletedUserId =
          action.payload?.deletedUserId || action.meta?.arg?.id

        state.deletedUserId = deletedUserId

        state.users = removeUserFromList(state.users, deletedUserId)
        state.userSummaries = removeUserFromList(
          state.userSummaries,
          deletedUserId
        )
        state.searchResults = removeUserFromList(
          state.searchResults,
          deletedUserId
        )
        state.pendingUsers = removeUserFromList(
          state.pendingUsers,
          deletedUserId
        )
        state.rejectedUsers = removeUserFromList(
          state.rejectedUsers,
          deletedUserId
        )
        state.usersByCategory = removeUserFromList(
          state.usersByCategory,
          deletedUserId
        )
        state.selectedCategoryUsers = removeUserFromList(
          state.selectedCategoryUsers,
          deletedUserId
        )

        if (Number(state.selectedUser?.id) === Number(deletedUserId)) {
          state.selectedUser = null
        }
      })

      .addCase(deleteUser.rejected, (state, action) => {
        state.loadingDeleteUser = false
        state.deleteUserSuccess = false
        state.deleteUserError = normalizeError(
          action.payload,
          "حدث خطأ في حذف المستخدم"
        )
      })

      // =========================
      // Approve User
      // =========================
      .addCase(approveUser.pending, (state) => {
        state.loadingApproveUser = true
        state.approveUserError = null
        state.approveUserSuccess = false
        state.approveUserMessage = ""
        state.approvedUserId = null
      })

      .addCase(approveUser.fulfilled, (state, action) => {
        state.loadingApproveUser = false
        state.approveUserSuccess = true
        state.approveUserMessage = extractMessage(
          action.payload,
          "تم قبول المستخدم بنجاح"
        )
        state.approveUserError = null

        const approvedUserId =
          action.payload?.approvedUserId || action.meta?.arg

        state.approvedUserId = approvedUserId

        state.pendingUsers = removeUserFromList(state.pendingUsers, approvedUserId)

        const markApproved = (list) =>
          Array.isArray(list)
            ? list.map((user) =>
                Number(user.id) === Number(approvedUserId)
                  ? {
                      ...user,
                      isApproved: true,
                      isActive: true,
                    }
                  : user
              )
            : []

        state.users = markApproved(state.users)
        state.userSummaries = markApproved(state.userSummaries)
        state.searchResults = markApproved(state.searchResults)

        if (Number(state.selectedUser?.id) === Number(approvedUserId)) {
          state.selectedUser = {
            ...state.selectedUser,
            isApproved: true,
            isActive: true,
          }
        }
      })

      .addCase(approveUser.rejected, (state, action) => {
        state.loadingApproveUser = false
        state.approveUserSuccess = false
        state.approveUserError = normalizeError(
          action.payload,
          "حدث خطأ في قبول المستخدم"
        )
      })

      // =========================
      // Reject User
      // =========================
      .addCase(rejectUser.pending, (state) => {
        state.loadingRejectUser = true
        state.rejectUserError = null
        state.rejectUserSuccess = false
        state.rejectUserMessage = ""
        state.rejectedUserId = null
      })

      .addCase(rejectUser.fulfilled, (state, action) => {
        state.loadingRejectUser = false
        state.rejectUserSuccess = true
        state.rejectUserMessage = extractMessage(
          action.payload,
          "تم رفض المستخدم بنجاح"
        )
        state.rejectUserError = null

        const rejectedUserId =
          action.payload?.rejectedUserId || action.meta?.arg

        state.rejectedUserId = rejectedUserId

        state.pendingUsers = removeUserFromList(state.pendingUsers, rejectedUserId)
        state.users = removeUserFromList(state.users, rejectedUserId)
        state.userSummaries = removeUserFromList(
          state.userSummaries,
          rejectedUserId
        )
        state.searchResults = removeUserFromList(
          state.searchResults,
          rejectedUserId
        )

        if (Number(state.selectedUser?.id) === Number(rejectedUserId)) {
          state.selectedUser = {
            ...state.selectedUser,
            isApproved: false,
            isActive: false,
          }
        }
      })

      .addCase(rejectUser.rejected, (state, action) => {
        state.loadingRejectUser = false
        state.rejectUserSuccess = false
        state.rejectUserError = normalizeError(
          action.payload,
          "حدث خطأ في رفض المستخدم"
        )
      })

      // =========================
      // Pending Users
      // =========================
      .addCase(getPendingApprovalUsers.pending, (state) => {
        state.loadingGetPendingApprovalUsers = true
        state.pendingUsersError = null
      })

      .addCase(getPendingApprovalUsers.fulfilled, (state, action) => {
        state.loadingGetPendingApprovalUsers = false
        state.pendingUsers = extractList(action.payload)
        state.pendingUsersPagination = extractPagination(action.payload)
        state.pendingUsersError = null
      })

      .addCase(getPendingApprovalUsers.rejected, (state, action) => {
        state.loadingGetPendingApprovalUsers = false
        state.pendingUsers = []
        state.pendingUsersPagination = null
        state.pendingUsersError = normalizeError(
          action.payload,
          "حدث خطأ في جلب المستخدمين قيد الموافقة"
        )
      })

      // =========================
      // Deleted Users
      // =========================
      .addCase(getDeletedUsers.pending, (state) => {
        state.loadingGetDeletedUsers = true
        state.deletedUsersError = null
      })

      .addCase(getDeletedUsers.fulfilled, (state, action) => {
        state.loadingGetDeletedUsers = false
        state.deletedUsers = extractList(action.payload)
        state.deletedUsersPagination = extractPagination(action.payload)
        state.deletedUsersError = null
      })

      .addCase(getDeletedUsers.rejected, (state, action) => {
        state.loadingGetDeletedUsers = false
        state.deletedUsers = []
        state.deletedUsersPagination = null
        state.deletedUsersError = normalizeError(
          action.payload,
          "حدث خطأ في جلب المستخدمين المحذوفين"
        )
      })

      // =========================
      // Rejected Users
      // =========================
      .addCase(getRejectedUsers.pending, (state) => {
        state.loadingGetRejectedUsers = true
        state.rejectedUsersError = null
      })

      .addCase(getRejectedUsers.fulfilled, (state, action) => {
        state.loadingGetRejectedUsers = false
        state.rejectedUsers = extractList(action.payload)
        state.rejectedUsersPagination = extractPagination(action.payload)
        state.rejectedUsersError = null
      })

      .addCase(getRejectedUsers.rejected, (state, action) => {
        state.loadingGetRejectedUsers = false
        state.rejectedUsers = []
        state.rejectedUsersPagination = null
        state.rejectedUsersError = normalizeError(
          action.payload,
          "حدث خطأ في جلب المستخدمين المرفوضين"
        )
      })

      // =========================
      // Statistics
      // =========================
      .addCase(getUserStatistics.pending, (state) => {
        state.loadingGetUserStatistics = true
        state.userStatisticsError = null
      })

      .addCase(getUserStatistics.fulfilled, (state, action) => {
        state.loadingGetUserStatistics = false
        state.userStatistics = extractData(action.payload)
        state.userStatisticsError = null
      })

      .addCase(getUserStatistics.rejected, (state, action) => {
        state.loadingGetUserStatistics = false
        state.userStatistics = null
        state.userStatisticsError = normalizeError(
          action.payload,
          "حدث خطأ في جلب إحصائيات المستخدمين"
        )
      })

      // =========================
      // Search Users
      // =========================
      .addCase(searchUsers.pending, (state) => {
        state.loadingSearchUsers = true
        state.searchUsersError = null
      })

      .addCase(searchUsers.fulfilled, (state, action) => {
        state.loadingSearchUsers = false
        state.searchResults = extractList(action.payload)
        state.searchPagination = extractPagination(action.payload)
        state.searchUsersError = null
      })

      .addCase(searchUsers.rejected, (state, action) => {
        state.loadingSearchUsers = false
        state.searchResults = []
        state.searchPagination = null
        state.searchUsersError = normalizeError(
          action.payload,
          "حدث خطأ في البحث عن المستخدمين"
        )
      })

      // =========================
      // Quick Search Users
      // =========================
      .addCase(quickSearchUsers.pending, (state) => {
        state.loadingQuickSearchUsers = true
        state.quickSearchUsersError = null
      })

      .addCase(quickSearchUsers.fulfilled, (state, action) => {
        state.loadingQuickSearchUsers = false
        state.quickSearchResults = extractList(action.payload)
        state.quickSearchPagination = extractPagination(action.payload)
        state.quickSearchUsersError = null
      })

      .addCase(quickSearchUsers.rejected, (state, action) => {
        state.loadingQuickSearchUsers = false
        state.quickSearchResults = []
        state.quickSearchPagination = null
        state.quickSearchUsersError = normalizeError(
          action.payload,
          "حدث خطأ في البحث السريع"
        )
      })

      // =========================
      // Users By Category
      // =========================
      .addCase(getUsersByCategory.pending, (state) => {
        state.loadingGetUsersByCategory = true
        state.usersByCategoryError = null
      })

      .addCase(getUsersByCategory.fulfilled, (state, action) => {
        state.loadingGetUsersByCategory = false
        const list = extractList(action.payload)

        state.usersByCategory = list
        state.selectedCategoryUsers = list
        state.selectedCategoryUsersCategoryId =
          action.payload?.categoryId || action.meta?.arg
        state.usersByCategoryError = null
      })

      .addCase(getUsersByCategory.rejected, (state, action) => {
        state.loadingGetUsersByCategory = false
        state.usersByCategory = []
        state.selectedCategoryUsers = []
        state.selectedCategoryUsersCategoryId = null
        state.usersByCategoryError = normalizeError(
          action.payload,
          "حدث خطأ في جلب مستخدمي التخصص"
        )
      })

      // =========================
      // Doctor Report
      // =========================
      .addCase(getDoctorReport.pending, (state) => {
        state.loadingGetDoctorReport = true
        state.doctorReportError = null
      })

      .addCase(getDoctorReport.fulfilled, (state, action) => {
        state.loadingGetDoctorReport = false
        state.doctorReport = extractData(action.payload)
        state.doctorReportError = null
      })

      .addCase(getDoctorReport.rejected, (state, action) => {
        state.loadingGetDoctorReport = false
        state.doctorReport = null
        state.doctorReportError = normalizeError(
          action.payload,
          "حدث خطأ في جلب تقرير الدكتور"
        )
      })

      // =========================
      // Doctor Rosters
      // =========================
      .addCase(getDoctorRosters.pending, (state) => {
        state.loadingGetDoctorRosters = true
        state.doctorRostersError = null
      })

      .addCase(getDoctorRosters.fulfilled, (state, action) => {
        state.loadingGetDoctorRosters = false
        state.doctorRosters = extractList(action.payload)
        state.doctorRostersPagination = extractPagination(action.payload)
        state.doctorRostersError = null
      })

      .addCase(getDoctorRosters.rejected, (state, action) => {
        state.loadingGetDoctorRosters = false
        state.doctorRosters = []
        state.doctorRostersPagination = null
        state.doctorRostersError = normalizeError(
          action.payload,
          "حدث خطأ في جلب روسترات الدكتور"
        )
      })

      // =========================
      // Doctor Attendance
      // =========================
      .addCase(getDoctorAttendance.pending, (state) => {
        state.loadingGetDoctorAttendance = true
        state.doctorAttendanceError = null
      })

      .addCase(getDoctorAttendance.fulfilled, (state, action) => {
        state.loadingGetDoctorAttendance = false
        state.doctorAttendance = extractList(action.payload)
        state.doctorAttendancePagination = extractPagination(action.payload)
        state.doctorAttendanceError = null
      })

      .addCase(getDoctorAttendance.rejected, (state, action) => {
        state.loadingGetDoctorAttendance = false
        state.doctorAttendance = []
        state.doctorAttendancePagination = null
        state.doctorAttendanceError = normalizeError(
          action.payload,
          "حدث خطأ في جلب حضور الدكتور"
        )
      })

      // =========================
      // Doctor Leaves
      // =========================
      .addCase(getDoctorLeaves.pending, (state) => {
        state.loadingGetDoctorLeaves = true
        state.doctorLeavesError = null
      })

      .addCase(getDoctorLeaves.fulfilled, (state, action) => {
        state.loadingGetDoctorLeaves = false
        state.doctorLeaves = extractList(action.payload)
        state.doctorLeavesPagination = extractPagination(action.payload)
        state.doctorLeavesError = null
      })

      .addCase(getDoctorLeaves.rejected, (state, action) => {
        state.loadingGetDoctorLeaves = false
        state.doctorLeaves = []
        state.doctorLeavesPagination = null
        state.doctorLeavesError = normalizeError(
          action.payload,
          "حدث خطأ في جلب إجازات الدكتور"
        )
      })

      // =========================
      // Doctor Swaps
      // =========================
      .addCase(getDoctorSwaps.pending, (state) => {
        state.loadingGetDoctorSwaps = true
        state.doctorSwapsError = null
      })

      .addCase(getDoctorSwaps.fulfilled, (state, action) => {
        state.loadingGetDoctorSwaps = false
        state.doctorSwaps = extractList(action.payload)
        state.doctorSwapsPagination = extractPagination(action.payload)
        state.doctorSwapsError = null
      })

      .addCase(getDoctorSwaps.rejected, (state, action) => {
        state.loadingGetDoctorSwaps = false
        state.doctorSwaps = []
        state.doctorSwapsPagination = null
        state.doctorSwapsError = normalizeError(
          action.payload,
          "حدث خطأ في جلب تبديلات الدكتور"
        )
      })

      // =========================
      // Activity Log
      // =========================
      .addCase(getUserActivityLog.pending, (state) => {
        state.loadingGetUserActivityLog = true
        state.userActivityLogError = null
      })

      .addCase(getUserActivityLog.fulfilled, (state, action) => {
        state.loadingGetUserActivityLog = false
        state.activityLog = extractList(action.payload)
        state.activityLogPagination = extractPagination(action.payload)
        state.userActivityLogError = null
      })

      .addCase(getUserActivityLog.rejected, (state, action) => {
        state.loadingGetUserActivityLog = false
        state.activityLog = []
        state.activityLogPagination = null
        state.userActivityLogError = normalizeError(
          action.payload,
          "حدث خطأ في جلب سجل نشاط المستخدم"
        )
      })

      // =========================
      // Login History
      // =========================
      .addCase(getUserLoginHistory.pending, (state) => {
        state.loadingGetUserLoginHistory = true
        state.userLoginHistoryError = null
      })

      .addCase(getUserLoginHistory.fulfilled, (state, action) => {
        state.loadingGetUserLoginHistory = false
        state.loginHistory = extractList(action.payload)
        state.loginHistoryPagination = extractPagination(action.payload)
        state.userLoginHistoryError = null
      })

      .addCase(getUserLoginHistory.rejected, (state, action) => {
        state.loadingGetUserLoginHistory = false
        state.loginHistory = []
        state.loginHistoryPagination = null
        state.userLoginHistoryError = normalizeError(
          action.payload,
          "حدث خطأ في جلب سجل تسجيل الدخول"
        )
      })
  },
})

export const {
  // Filters
  setUsersFilters,
  clearUsersFilters,
  setUsersCurrentPage,
  setUsersPageSize,

  // Main
  clearUsers,
  clearUsersError,
  clearSelectedUser,

  // Update / Delete
  clearUpdateUserState,
  clearDeleteUserState,

  // Approval
  clearApproveUserState,
  clearRejectUserState,

  // Status Lists
  clearPendingUsers,
  clearDeletedUsers,
  clearRejectedUsers,

  // Statistics
  clearUserStatistics,

  // Search
  clearSearchResults,
  clearQuickSearchResults,
  clearUsersByCategory,

  // Doctor Analytics
  clearDoctorReport,
  clearDoctorRosters,
  clearDoctorAttendance,
  clearDoctorLeaves,
  clearDoctorSwaps,
  clearDoctorAnalytics,

  // Logs
  clearUserActivityLog,
  clearUserLoginHistory,
  clearUserLogs,
} = usersSlice.actions

export default usersSlice.reducer

export {
  getUserSummaries,
  getUserById,
  updateUser,
  deleteUser,
  approveUser,
  rejectUser,

  getPendingApprovalUsers,
  getDeletedUsers,
  getRejectedUsers,
  getUserStatistics,

  searchUsers,
  quickSearchUsers,
  getUsersByCategory,

  getDoctorReport,
  getDoctorRosters,
  getDoctorAttendance,
  getDoctorLeaves,
  getDoctorSwaps,

  getUserActivityLog,
  getUserLoginHistory,
}