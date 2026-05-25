import { createAsyncThunk } from "@reduxjs/toolkit"
import axiosInstance from "../../utils/axiosInstance"

const getAuthHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("token")}`,
  "Content-Type": "application/json",
})

const buildQueryParams = (params = {}) => {
  const queryParams = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      queryParams.append(key, value)
    }
  })

  return queryParams.toString()
}

const getErrorPayload = (error, fallbackMessageAr, fallbackMessageEn) => {
  return {
    message:
      error.response?.data?.messageAr ||
      error.response?.data?.messageEn ||
      error.response?.data?.message ||
      error.message ||
      fallbackMessageAr,
    messageAr:
      error.response?.data?.messageAr || fallbackMessageAr || "حدث خطأ",
    messageEn:
      error.response?.data?.messageEn ||
      fallbackMessageEn ||
      "Something went wrong",
    errors: error.response?.data?.errors || [],
    status: error.response?.status,
    data: error.response?.data,
    timestamp: new Date().toISOString(),
  }
}

// ===================================================================
// USERS SUMMARIES / MAIN LIST
// ===================================================================

export const getUserSummaries = createAsyncThunk(
  "usersSlice/getUserSummaries",
  async (params = {}, thunkAPI) => {
    const { rejectWithValue } = thunkAPI

    try {
      const queryString = buildQueryParams({
        CategoryId: params.categoryId || params.CategoryId,
        ScientificDegreeId:
          params.scientificDegreeId || params.ScientificDegreeId,
        ContractingTypeId:
          params.contractingTypeId || params.ContractingTypeId,
        IsApproved: params.isApproved ?? params.IsApproved,
        IsEmailVerified: params.isEmailVerified ?? params.IsEmailVerified,
        CreatedFrom: params.createdFrom || params.CreatedFrom,
        CreatedTo: params.createdTo || params.CreatedTo,
        Page: params.page || params.Page,
        PageSize: params.pageSize || params.PageSize,
        Search: params.search || params.Search,
        SortBy: params.sortBy ?? params.SortBy,
        SortDirection: params.sortDirection ?? params.SortDirection,
      })

      const res = await axiosInstance.get(
        `/api/v1/Users/summaries${queryString ? `?${queryString}` : ""}`,
        {
          headers: getAuthHeaders(),
        }
      )

      return res.data
    } catch (error) {
      return rejectWithValue(
        getErrorPayload(
          error,
          "حدث خطأ في جلب ملخصات المستخدمين",
          "Failed to fetch user summaries"
        )
      )
    }
  }
)

// ===================================================================
// USER DETAILS / UPDATE / DELETE
// ===================================================================

export const getUserById = createAsyncThunk(
  "usersSlice/getUserById",
  async (id, thunkAPI) => {
    const { rejectWithValue } = thunkAPI

    try {
      if (!id) {
        return rejectWithValue({
          message: "معرف المستخدم مطلوب",
          messageAr: "معرف المستخدم مطلوب",
          messageEn: "User ID is required",
          status: 400,
        })
      }

      const res = await axiosInstance.get(`/api/v1/Users/${id}`, {
        headers: getAuthHeaders(),
      })

      return res.data
    } catch (error) {
      return rejectWithValue(
        getErrorPayload(
          error,
          "حدث خطأ في جلب بيانات المستخدم",
          "Failed to fetch user details"
        )
      )
    }
  }
)

export const updateUser = createAsyncThunk(
  "usersSlice/updateUser",
  async ({ id, data, userData }, thunkAPI) => {
    const { rejectWithValue } = thunkAPI

    try {
      if (!id) {
        return rejectWithValue({
          message: "معرف المستخدم مطلوب",
          messageAr: "معرف المستخدم مطلوب",
          messageEn: "User ID is required",
          status: 400,
        })
      }

      const payload = data || userData

      const res = await axiosInstance.put(`/api/v1/Users/${id}`, payload, {
        headers: getAuthHeaders(),
      })

      return res.data
    } catch (error) {
      return rejectWithValue(
        getErrorPayload(
          error,
          "حدث خطأ في تحديث بيانات المستخدم",
          "Failed to update user"
        )
      )
    }
  }
)

export const deleteUser = createAsyncThunk(
  "usersSlice/deleteUser",
  async ({ id, deletedReason, reason }, thunkAPI) => {
    const { rejectWithValue } = thunkAPI

    try {
      if (!id) {
        return rejectWithValue({
          message: "معرف المستخدم مطلوب",
          messageAr: "معرف المستخدم مطلوب",
          messageEn: "User ID is required",
          status: 400,
        })
      }

      const res = await axiosInstance.delete(`/api/v1/Users/${id}`, {
        headers: getAuthHeaders(),
        data: {
          deletedReason: deletedReason || reason || "Deleted by admin",
        },
      })

      return {
        ...res.data,
        deletedUserId: id,
      }
    } catch (error) {
      return rejectWithValue(
        getErrorPayload(
          error,
          "حدث خطأ في حذف المستخدم",
          "Failed to delete user"
        )
      )
    }
  }
)

// ===================================================================
// USER APPROVAL / REJECTION
// ===================================================================

export const approveUser = createAsyncThunk(
  "usersSlice/approveUser",
  async (id, thunkAPI) => {
    const { rejectWithValue } = thunkAPI

    try {
      if (!id) {
        return rejectWithValue({
          message: "معرف المستخدم مطلوب",
          messageAr: "معرف المستخدم مطلوب",
          messageEn: "User ID is required",
          status: 400,
        })
      }

      const res = await axiosInstance.post(`/api/v1/Users/${id}/approve`, null, {
        headers: getAuthHeaders(),
      })

      return {
        ...res.data,
        approvedUserId: id,
      }
    } catch (error) {
      return rejectWithValue(
        getErrorPayload(
          error,
          "حدث خطأ في قبول المستخدم",
          "Failed to approve user"
        )
      )
    }
  }
)

export const rejectUser = createAsyncThunk(
  "usersSlice/rejectUser",
  async (id, thunkAPI) => {
    const { rejectWithValue } = thunkAPI

    try {
      if (!id) {
        return rejectWithValue({
          message: "معرف المستخدم مطلوب",
          messageAr: "معرف المستخدم مطلوب",
          messageEn: "User ID is required",
          status: 400,
        })
      }

      const res = await axiosInstance.post(`/api/v1/Users/${id}/reject`, null, {
        headers: getAuthHeaders(),
      })

      return {
        ...res.data,
        rejectedUserId: id,
      }
    } catch (error) {
      return rejectWithValue(
        getErrorPayload(
          error,
          "حدث خطأ في رفض المستخدم",
          "Failed to reject user"
        )
      )
    }
  }
)

// ===================================================================
// USERS STATUS LISTS
// ===================================================================

export const getPendingApprovalUsers = createAsyncThunk(
  "usersSlice/getPendingApprovalUsers",
  async (params = {}, thunkAPI) => {
    const { rejectWithValue } = thunkAPI

    try {
      const queryString = buildQueryParams({
        Page: params.page || params.Page,
        PageSize: params.pageSize || params.PageSize,
        Search: params.search || params.Search,
        SortBy: params.sortBy ?? params.SortBy,
        SortDirection: params.sortDirection ?? params.SortDirection,
      })

      const res = await axiosInstance.get(
        `/api/v1/Users/pending-approval${queryString ? `?${queryString}` : ""}`,
        {
          headers: getAuthHeaders(),
        }
      )

      return res.data
    } catch (error) {
      return rejectWithValue(
        getErrorPayload(
          error,
          "حدث خطأ في جلب المستخدمين قيد الموافقة",
          "Failed to fetch pending approval users"
        )
      )
    }
  }
)

export const getDeletedUsers = createAsyncThunk(
  "usersSlice/getDeletedUsers",
  async (params = {}, thunkAPI) => {
    const { rejectWithValue } = thunkAPI

    try {
      const queryString = buildQueryParams({
        Page: params.page || params.Page,
        PageSize: params.pageSize || params.PageSize,
        Search: params.search || params.Search,
        SortBy: params.sortBy ?? params.SortBy,
        SortDirection: params.sortDirection ?? params.SortDirection,
      })

      const res = await axiosInstance.get(
        `/api/v1/Users/deleted${queryString ? `?${queryString}` : ""}`,
        {
          headers: getAuthHeaders(),
        }
      )

      return res.data
    } catch (error) {
      return rejectWithValue(
        getErrorPayload(
          error,
          "حدث خطأ في جلب المستخدمين المحذوفين",
          "Failed to fetch deleted users"
        )
      )
    }
  }
)

export const getRejectedUsers = createAsyncThunk(
  "usersSlice/getRejectedUsers",
  async (params = {}, thunkAPI) => {
    const { rejectWithValue } = thunkAPI

    try {
      const queryString = buildQueryParams({
        Page: params.page || params.Page,
        PageSize: params.pageSize || params.PageSize,
        Search: params.search || params.Search,
        SortBy: params.sortBy ?? params.SortBy,
        SortDirection: params.sortDirection ?? params.SortDirection,
      })

      const res = await axiosInstance.get(
        `/api/v1/Users/rejected${queryString ? `?${queryString}` : ""}`,
        {
          headers: getAuthHeaders(),
        }
      )

      return res.data
    } catch (error) {
      return rejectWithValue(
        getErrorPayload(
          error,
          "حدث خطأ في جلب المستخدمين المرفوضين",
          "Failed to fetch rejected users"
        )
      )
    }
  }
)

// ===================================================================
// USER STATISTICS
// ===================================================================

export const getUserStatistics = createAsyncThunk(
  "usersSlice/getUserStatistics",
  async (_, thunkAPI) => {
    const { rejectWithValue } = thunkAPI

    try {
      const res = await axiosInstance.get("/api/v1/Users/statistics", {
        headers: getAuthHeaders(),
      })

      return res.data
    } catch (error) {
      return rejectWithValue(
        getErrorPayload(
          error,
          "حدث خطأ في جلب إحصائيات المستخدمين",
          "Failed to fetch user statistics"
        )
      )
    }
  }
)

// ===================================================================
// USERS SEARCH
// ===================================================================

export const searchUsers = createAsyncThunk(
  "usersSlice/searchUsers",
  async (params = {}, thunkAPI) => {
    const { rejectWithValue } = thunkAPI

    try {
      const queryString = buildQueryParams({
        Page: params.page || params.Page,
        PageSize: params.pageSize || params.PageSize,
        Search: params.search || params.Search,
        SortBy: params.sortBy ?? params.SortBy,
        SortDirection: params.sortDirection ?? params.SortDirection,
      })

      const res = await axiosInstance.get(
        `/api/v1/Users/search${queryString ? `?${queryString}` : ""}`,
        {
          headers: getAuthHeaders(),
        }
      )

      return res.data
    } catch (error) {
      return rejectWithValue(
        getErrorPayload(
          error,
          "حدث خطأ في البحث عن المستخدمين",
          "Failed to search users"
        )
      )
    }
  }
)

export const quickSearchUsers = createAsyncThunk(
  "usersSlice/quickSearchUsers",
  async ({ search, limit = 10 }, thunkAPI) => {
    const { rejectWithValue } = thunkAPI

    try {
      if (!search || !String(search).trim()) {
        return rejectWithValue({
          message: "كلمة البحث مطلوبة",
          messageAr: "كلمة البحث مطلوبة",
          messageEn: "Search term is required",
          status: 400,
        })
      }

      const queryString = buildQueryParams({
        search,
        limit,
      })

      const res = await axiosInstance.get(
        `/api/v1/Users/quick-search?${queryString}`,
        {
          headers: getAuthHeaders(),
        }
      )

      return res.data
    } catch (error) {
      return rejectWithValue(
        getErrorPayload(
          error,
          "حدث خطأ في البحث السريع",
          "Failed to quick search users"
        )
      )
    }
  }
)

export const getUsersByCategory = createAsyncThunk(
  "usersSlice/getUsersByCategory",
  async (categoryId, thunkAPI) => {
    const { rejectWithValue } = thunkAPI

    try {
      if (!categoryId) {
        return rejectWithValue({
          message: "معرف التخصص مطلوب",
          messageAr: "معرف التخصص مطلوب",
          messageEn: "Category ID is required",
          status: 400,
        })
      }

      const res = await axiosInstance.get(
        `/api/v1/Users/Categories/${categoryId}`,
        {
          headers: getAuthHeaders(),
        }
      )

      return {
        ...res.data,
        categoryId,
      }
    } catch (error) {
      return rejectWithValue(
        getErrorPayload(
          error,
          "حدث خطأ في جلب مستخدمي التخصص",
          "Failed to fetch category users"
        )
      )
    }
  }
)

// ===================================================================
// DOCTOR ANALYTICS / REPORTS
// ===================================================================

export const getDoctorReport = createAsyncThunk(
  "usersSlice/getDoctorReport",
  async ({ doctorId, filter = {}, useCache = true }, thunkAPI) => {
    const { rejectWithValue } = thunkAPI

    try {
      if (!doctorId) {
        return rejectWithValue({
          message: "معرف الدكتور مطلوب",
          messageAr: "معرف الدكتور مطلوب",
          messageEn: "Doctor ID is required",
          status: 400,
        })
      }

      const queryString = buildQueryParams({
        DateFrom: filter.dateFrom || filter.DateFrom,
        DateTo: filter.dateTo || filter.DateTo,
        CategoryId: filter.categoryId || filter.CategoryId,
        ScientificDegreeId:
          filter.scientificDegreeId || filter.ScientificDegreeId,
        ContractingTypeId:
          filter.contractingTypeId || filter.ContractingTypeId,
        useCache,
      })

      const res = await axiosInstance.get(
        `/api/v1/Users/doctor/${doctorId}/report${
          queryString ? `?${queryString}` : ""
        }`,
        {
          headers: getAuthHeaders(),
        }
      )

      return res.data
    } catch (error) {
      return rejectWithValue(
        getErrorPayload(
          error,
          "حدث خطأ في جلب تقرير الدكتور",
          "Failed to fetch doctor report"
        )
      )
    }
  }
)

export const getDoctorRosters = createAsyncThunk(
  "usersSlice/getDoctorRosters",
  async ({ doctorId, filter = {}, page = 1, pageSize = 20 }, thunkAPI) => {
    const { rejectWithValue } = thunkAPI

    try {
      if (!doctorId) {
        return rejectWithValue({
          message: "معرف الدكتور مطلوب",
          messageAr: "معرف الدكتور مطلوب",
          messageEn: "Doctor ID is required",
          status: 400,
        })
      }

      const queryString = buildQueryParams({
        RosterId: filter.rosterId || filter.RosterId,
        CategoryId: filter.categoryId || filter.CategoryId,
        DepartmentId: filter.departmentId || filter.DepartmentId,
        DateFrom: filter.dateFrom || filter.DateFrom,
        DateTo: filter.dateTo || filter.DateTo,
        LeaveTypeFilter: filter.leaveTypeFilter || filter.LeaveTypeFilter,
        AttendanceStatusFilter:
          filter.attendanceStatusFilter || filter.AttendanceStatusFilter,
        page,
        pageSize,
      })

      const res = await axiosInstance.get(
        `/api/v1/Users/doctor/${doctorId}/rosters${
          queryString ? `?${queryString}` : ""
        }`,
        {
          headers: getAuthHeaders(),
        }
      )

      return res.data
    } catch (error) {
      return rejectWithValue(
        getErrorPayload(
          error,
          "حدث خطأ في جلب جدول الدكتور داخل الروستر",
          "Failed to fetch doctor schedule inside roster"
        )
      )
    }
  }
)

export const getDoctorAttendance = createAsyncThunk(
  "usersSlice/getDoctorAttendance",
  async ({ doctorId, filter = {}, page = 1, pageSize = 10 }, thunkAPI) => {
    const { rejectWithValue } = thunkAPI

    try {
      if (!doctorId) {
        return rejectWithValue({
          message: "معرف الدكتور مطلوب",
          messageAr: "معرف الدكتور مطلوب",
          messageEn: "Doctor ID is required",
          status: 400,
        })
      }

      const queryString = buildQueryParams({
        DateFrom: filter.dateFrom || filter.DateFrom,
        DateTo: filter.dateTo || filter.DateTo,
        CategoryId: filter.categoryId || filter.CategoryId,
        ScientificDegreeId:
          filter.scientificDegreeId || filter.ScientificDegreeId,
        ContractingTypeId:
          filter.contractingTypeId || filter.ContractingTypeId,
        page,
        pageSize,
      })

      const res = await axiosInstance.get(
        `/api/v1/Users/doctor/${doctorId}/attendance${
          queryString ? `?${queryString}` : ""
        }`,
        {
          headers: getAuthHeaders(),
        }
      )

      return res.data
    } catch (error) {
      return rejectWithValue(
        getErrorPayload(
          error,
          "حدث خطأ في جلب حضور الدكتور",
          "Failed to fetch doctor attendance"
        )
      )
    }
  }
)

export const getDoctorLeaves = createAsyncThunk(
  "usersSlice/getDoctorLeaves",
  async ({ doctorId, filter = {}, page = 1, pageSize = 10 }, thunkAPI) => {
    const { rejectWithValue } = thunkAPI

    try {
      if (!doctorId) {
        return rejectWithValue({
          message: "معرف الدكتور مطلوب",
          messageAr: "معرف الدكتور مطلوب",
          messageEn: "Doctor ID is required",
          status: 400,
        })
      }

      const queryString = buildQueryParams({
        DateFrom: filter.dateFrom || filter.DateFrom,
        DateTo: filter.dateTo || filter.DateTo,
        CategoryId: filter.categoryId || filter.CategoryId,
        ScientificDegreeId:
          filter.scientificDegreeId || filter.ScientificDegreeId,
        ContractingTypeId:
          filter.contractingTypeId || filter.ContractingTypeId,
        page,
        pageSize,
      })

      const res = await axiosInstance.get(
        `/api/v1/Users/doctor/${doctorId}/leaves${
          queryString ? `?${queryString}` : ""
        }`,
        {
          headers: getAuthHeaders(),
        }
      )

      return res.data
    } catch (error) {
      return rejectWithValue(
        getErrorPayload(
          error,
          "حدث خطأ في جلب إجازات الدكتور",
          "Failed to fetch doctor leaves"
        )
      )
    }
  }
)

export const getDoctorSwaps = createAsyncThunk(
  "usersSlice/getDoctorSwaps",
  async ({ doctorId, filter = {}, page = 1, pageSize = 10 }, thunkAPI) => {
    const { rejectWithValue } = thunkAPI

    try {
      if (!doctorId) {
        return rejectWithValue({
          message: "معرف الدكتور مطلوب",
          messageAr: "معرف الدكتور مطلوب",
          messageEn: "Doctor ID is required",
          status: 400,
        })
      }

      const queryString = buildQueryParams({
        DateFrom: filter.dateFrom || filter.DateFrom,
        DateTo: filter.dateTo || filter.DateTo,
        CategoryId: filter.categoryId || filter.CategoryId,
        ScientificDegreeId:
          filter.scientificDegreeId || filter.ScientificDegreeId,
        ContractingTypeId:
          filter.contractingTypeId || filter.ContractingTypeId,
        page,
        pageSize,
      })

      const res = await axiosInstance.get(
        `/api/v1/Users/doctor/${doctorId}/swaps${
          queryString ? `?${queryString}` : ""
        }`,
        {
          headers: getAuthHeaders(),
        }
      )

      return res.data
    } catch (error) {
      return rejectWithValue(
        getErrorPayload(
          error,
          "حدث خطأ في جلب تبديلات الدكتور",
          "Failed to fetch doctor swaps"
        )
      )
    }
  }
)

// ===================================================================
// ACTIVITY LOGS / LOGIN HISTORY
// ===================================================================

export const getUserActivityLog = createAsyncThunk(
  "usersSlice/getUserActivityLog",
  async ({ id, filter = {} }, thunkAPI) => {
    const { rejectWithValue } = thunkAPI

    try {
      if (!id) {
        return rejectWithValue({
          message: "معرف المستخدم مطلوب",
          messageAr: "معرف المستخدم مطلوب",
          messageEn: "User ID is required",
          status: 400,
        })
      }

      const queryString = buildQueryParams({
        Page: filter.page || filter.Page,
        PageSize: filter.pageSize || filter.PageSize,
        Search: filter.search || filter.Search,
        SortBy: filter.sortBy ?? filter.SortBy,
        SortDirection: filter.sortDirection ?? filter.SortDirection,
        CreatedFrom: filter.createdFrom || filter.CreatedFrom,
        CreatedTo: filter.createdTo || filter.CreatedTo,
      })

      const res = await axiosInstance.get(
        `/api/v1/Users/${id}/activity-log${queryString ? `?${queryString}` : ""}`,
        {
          headers: getAuthHeaders(),
        }
      )

      return res.data
    } catch (error) {
      return rejectWithValue(
        getErrorPayload(
          error,
          "حدث خطأ في جلب سجل نشاط المستخدم",
          "Failed to fetch user activity log"
        )
      )
    }
  }
)

export const getUserLoginHistory = createAsyncThunk(
  "usersSlice/getUserLoginHistory",
  async ({ id, filter = {} }, thunkAPI) => {
    const { rejectWithValue } = thunkAPI

    try {
      if (!id) {
        return rejectWithValue({
          message: "معرف المستخدم مطلوب",
          messageAr: "معرف المستخدم مطلوب",
          messageEn: "User ID is required",
          status: 400,
        })
      }

      const queryString = buildQueryParams({
        Page: filter.page || filter.Page,
        PageSize: filter.pageSize || filter.PageSize,
        Search: filter.search || filter.Search,
        SortBy: filter.sortBy ?? filter.SortBy,
        SortDirection: filter.sortDirection ?? filter.SortDirection,
      })

      const res = await axiosInstance.get(
        `/api/v1/Users/${id}/login-history${
          queryString ? `?${queryString}` : ""
        }`,
        {
          headers: getAuthHeaders(),
        }
      )

      return res.data
    } catch (error) {
      return rejectWithValue(
        getErrorPayload(
          error,
          "حدث خطأ في جلب سجل تسجيل الدخول",
          "Failed to fetch user login history"
        )
      )
    }
  }
)