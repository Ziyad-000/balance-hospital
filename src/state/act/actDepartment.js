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
// DEPARTMENT LIST / CRUD
// ===================================================================

export const getDepartments = createAsyncThunk(
  "departmentSlice/getDepartments",
  async (params = {}, thunkAPI) => {
    const { rejectWithValue } = thunkAPI

    try {
      const queryString = buildQueryParams({
        search: params.search,
        code: params.code,
        includeManager: params.includeManager,
        includeCategories: params.includeCategories,
        categoryId: params.categoryId,
        linkedToCategoryId: params.linkedToCategoryId,
        isUnlinked: params.isUnlinked,
        hasManager: params.hasManager,
        isActive: params.isActive,
        createdFrom: params.createdFrom,
        createdTo: params.createdTo,
        includeSubDepartments: params.includeSubDepartments,
        includeStatistics: params.includeStatistics,
        includeCategory: params.includeCategory,
        page: params.page,
        pageSize: params.pageSize,
        orderBy: params.orderBy,
        orderDesc: params.orderDesc,
      })

      const url = `/api/v1/Department${queryString ? `?${queryString}` : ""}`

      const res = await axiosInstance.get(url, {
        headers: getAuthHeaders(),
      })

      return res.data
    } catch (error) {
      return rejectWithValue(
        getErrorPayload(
          error,
          "حدث خطأ في جلب الأقسام",
          "Failed to fetch departments"
        )
      )
    }
  }
)

export const getDepartmentById = createAsyncThunk(
  "departmentSlice/getDepartmentById",
  async (id, thunkAPI) => {
    const { rejectWithValue } = thunkAPI

    try {
      if (!id) {
        return rejectWithValue({
          message: "معرف القسم مطلوب",
          messageAr: "معرف القسم مطلوب",
          messageEn: "Department ID is required",
          status: 400,
        })
      }

      const res = await axiosInstance.get(`/api/v1/Department/${id}`, {
        headers: getAuthHeaders(),
      })

      return res.data
    } catch (error) {
      return rejectWithValue(
        getErrorPayload(
          error,
          "حدث خطأ في جلب بيانات القسم",
          "Failed to fetch department"
        )
      )
    }
  }
)

export const createDepartment = createAsyncThunk(
  "departmentSlice/createDepartment",
  async (departmentData, thunkAPI) => {
    const { rejectWithValue } = thunkAPI

    try {
      const res = await axiosInstance.post(
        "/api/v1/Department",
        departmentData,
        {
          headers: getAuthHeaders(),
        }
      )

      return res.data
    } catch (error) {
      return rejectWithValue(
        getErrorPayload(
          error,
          "حدث خطأ في إنشاء القسم",
          "Failed to create department"
        )
      )
    }
  }
)

export const updateDepartment = createAsyncThunk(
  "departmentSlice/updateDepartment",
  async ({ id, departmentData, data }, thunkAPI) => {
    const { rejectWithValue } = thunkAPI

    try {
      if (!id) {
        return rejectWithValue({
          message: "معرف القسم مطلوب",
          messageAr: "معرف القسم مطلوب",
          messageEn: "Department ID is required",
          status: 400,
        })
      }

      const payload = departmentData || data

      const res = await axiosInstance.put(`/api/v1/Department/${id}`, payload, {
        headers: getAuthHeaders(),
      })

      return res.data
    } catch (error) {
      return rejectWithValue(
        getErrorPayload(
          error,
          "حدث خطأ في تحديث القسم",
          "Failed to update department"
        )
      )
    }
  }
)

export const deleteDepartment = createAsyncThunk(
  "departmentSlice/deleteDepartment",
  async ({ id, reason }, thunkAPI) => {
    const { rejectWithValue } = thunkAPI

    try {
      if (!id) {
        return rejectWithValue({
          message: "معرف القسم مطلوب",
          messageAr: "معرف القسم مطلوب",
          messageEn: "Department ID is required",
          status: 400,
        })
      }

      const queryString = buildQueryParams({ reason })

      const res = await axiosInstance.delete(
        `/api/v1/Department/${id}${queryString ? `?${queryString}` : ""}`,
        {
          headers: getAuthHeaders(),
        }
      )

      return {
        ...res.data,
        deletedDepartmentId: id,
      }
    } catch (error) {
      return rejectWithValue(
        getErrorPayload(
          error,
          "حدث خطأ في حذف القسم",
          "Failed to delete department"
        )
      )
    }
  }
)

// ===================================================================
// DEPARTMENT CATEGORIES LINKING
// ===================================================================

export const getDepartmentCategories = createAsyncThunk(
  "departmentSlice/getDepartmentCategories",
  async ({ departmentId }, thunkAPI) => {
    const { rejectWithValue } = thunkAPI

    try {
      if (!departmentId) {
        return rejectWithValue({
          message: "معرف القسم مطلوب",
          messageAr: "معرف القسم مطلوب",
          messageEn: "Department ID is required",
          status: 400,
        })
      }

      const res = await axiosInstance.get(
        `/api/v1/Department/${departmentId}/categories`,
        {
          headers: getAuthHeaders(),
        }
      )

      return res.data
    } catch (error) {
      return rejectWithValue(
        getErrorPayload(
          error,
          "حدث خطأ في جلب تخصصات القسم",
          "Failed to fetch department categories"
        )
      )
    }
  }
)

export const getAvailableDepartmentsForCategory = createAsyncThunk(
  "departmentSlice/getAvailableDepartmentsForCategory",
  async ({ categoryId, filters = {} }, thunkAPI) => {
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

      const queryString = buildQueryParams({
        search: filters.search,
        isActive: filters.isActive,
        page: filters.page,
        pageSize: filters.pageSize,
      })

      const res = await axiosInstance.get(
        `/api/v1/Department/available-for-category/${categoryId}${
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
          "حدث خطأ في جلب الأقسام المتاحة للتخصص",
          "Failed to fetch available departments for category"
        )
      )
    }
  }
)

export const getDepartmentsByCategory = createAsyncThunk(
  "departmentSlice/getDepartmentsByCategory",
  async ({ categoryId, filters = {} }, thunkAPI) => {
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

      const queryString = buildQueryParams({
        search: filters.search,
        isActive: filters.isActive,
        page: filters.page,
        pageSize: filters.pageSize,
      })

      const res = await axiosInstance.get(
        `/api/v1/Department/by-category/${categoryId}${
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
          "حدث خطأ في جلب أقسام التخصص",
          "Failed to fetch departments by category"
        )
      )
    }
  }
)

export const linkDepartmentToCategory = createAsyncThunk(
  "departmentSlice/linkDepartmentToCategory",
  async ({ id, departmentId, categoryId }, thunkAPI) => {
    const { rejectWithValue } = thunkAPI
    const depId = id || departmentId

    try {
      if (!depId || !categoryId) {
        return rejectWithValue({
          message: "معرف القسم والتخصص مطلوبان",
          messageAr: "معرف القسم والتخصص مطلوبان",
          messageEn: "Department ID and Category ID are required",
          status: 400,
        })
      }

      const res = await axiosInstance.post(
        `/api/v1/Department/${depId}/categories/${categoryId}`,
        null,
        {
          headers: getAuthHeaders(),
        }
      )

      return {
        ...res.data,
        departmentId: depId,
        categoryId,
      }
    } catch (error) {
      return rejectWithValue(
        getErrorPayload(
          error,
          "حدث خطأ في ربط القسم بالتخصص",
          "Failed to link department to category"
        )
      )
    }
  }
)

export const unlinkDepartmentFromCategory = createAsyncThunk(
  "departmentSlice/unlinkDepartmentFromCategory",
  async ({ id, departmentId, categoryId, revocationReason }, thunkAPI) => {
    const { rejectWithValue } = thunkAPI
    const depId = id || departmentId

    try {
      if (!depId || !categoryId) {
        return rejectWithValue({
          message: "معرف القسم والتخصص مطلوبان",
          messageAr: "معرف القسم والتخصص مطلوبان",
          messageEn: "Department ID and Category ID are required",
          status: 400,
        })
      }

      const queryString = buildQueryParams({ revocationReason })

      const res = await axiosInstance.delete(
        `/api/v1/Department/${depId}/categories/${categoryId}${
          queryString ? `?${queryString}` : ""
        }`,
        {
          headers: getAuthHeaders(),
        }
      )

      return {
        ...res.data,
        departmentId: depId,
        categoryId,
      }
    } catch (error) {
      return rejectWithValue(
        getErrorPayload(
          error,
          "حدث خطأ في إلغاء ربط القسم بالتخصص",
          "Failed to unlink department from category"
        )
      )
    }
  }
)

// ===================================================================
// DEPARTMENT MANAGERS
// ===================================================================

export const getDepartmentManagers = createAsyncThunk(
  "departmentSlice/getDepartmentManagers",
  async (params = {}, thunkAPI) => {
    const { rejectWithValue } = thunkAPI

    try {
      const queryString = buildQueryParams({
        DepartmentId: params.departmentId || params.DepartmentId,
        SearchTerm: params.searchTerm || params.SearchTerm,
        IsActive: params.isActive ?? params.IsActive,
        SortBy: params.sortBy || params.SortBy,
        SortOrder: params.sortOrder || params.SortOrder,
        Page: params.page || params.Page,
        PageSize: params.pageSize || params.PageSize,
        Limit: params.limit || params.Limit,
      })

      const res = await axiosInstance.get(
        `/api/v1/Role/department-managers${
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
          "حدث خطأ في جلب مديري الأقسام",
          "Failed to fetch department managers"
        )
      )
    }
  }
)

export const getDepartmentsWithManagers = createAsyncThunk(
  "departmentSlice/getDepartmentsWithManagers",
  async (params = {}, thunkAPI) => {
    const { rejectWithValue } = thunkAPI

    try {
      const queryString = buildQueryParams({
        searchTerm: params.searchTerm,
        isActive: params.isActive,
        page: params.page,
        pageSize: params.pageSize,
      })

      const res = await axiosInstance.get(
        `/api/v1/Role/departments-with-managers${
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
          "حدث خطأ في جلب الأقسام التي لها مديرين",
          "Failed to fetch departments with managers"
        )
      )
    }
  }
)

export const assignDepManager = createAsyncThunk(
  "departmentSlice/assignDepManager",
  async ({ data }, thunkAPI) => {
    const { rejectWithValue } = thunkAPI

    try {
      const res = await axiosInstance.post(
        "/api/v1/Role/department-manager/assign",
        data,
        {
          headers: getAuthHeaders(),
        }
      )

      return res.data
    } catch (error) {
      return rejectWithValue(
        getErrorPayload(
          error,
          "حدث خطأ في تعيين مدير القسم",
          "Failed to assign department manager"
        )
      )
    }
  }
)

export const removeDepManager = createAsyncThunk(
  "departmentSlice/removeDepManager",
  async ({ data }, thunkAPI) => {
    const { rejectWithValue } = thunkAPI

    try {
      const res = await axiosInstance.post(
        "/api/v1/Role/department-manager/remove",
        data,
        {
          headers: getAuthHeaders(),
        }
      )

      return res.data
    } catch (error) {
      return rejectWithValue(
        getErrorPayload(
          error,
          "حدث خطأ في إزالة مدير القسم",
          "Failed to remove department manager"
        )
      )
    }
  }
)

export const updateManagerPermission = createAsyncThunk(
  "departmentSlice/updateManagerPermission",
  async ({ id, departmentId, data }, thunkAPI) => {
    const { rejectWithValue } = thunkAPI
    const depId = id || departmentId

    try {
      if (!depId) {
        return rejectWithValue({
          message: "معرف القسم مطلوب",
          messageAr: "معرف القسم مطلوب",
          messageEn: "Department ID is required",
          status: 400,
        })
      }

      const res = await axiosInstance.put(
        `/api/v1/Department/${depId}/manager`,
        data,
        {
          headers: getAuthHeaders(),
        }
      )

      return {
        ...res.data,
        departmentId: depId,
      }
    } catch (error) {
      return rejectWithValue(
        getErrorPayload(
          error,
          "حدث خطأ في تحديث صلاحيات مدير القسم",
          "Failed to update manager permissions"
        )
      )
    }
  }
)

// ===================================================================
// DEPARTMENT MANAGER MONTHS / MONTH VIEW / CALENDAR / STRUCTURE
// ===================================================================

export const getDepartmentMonthList = createAsyncThunk(
  "departmentSlice/getDepartmentMonthList",
  async ({ departmentId, fromMonth, fromYear, toMonth, toYear }, thunkAPI) => {
    const { rejectWithValue } = thunkAPI

    try {
      if (!departmentId) {
        return rejectWithValue({
          message: "معرف القسم مطلوب",
          messageAr: "معرف القسم مطلوب",
          messageEn: "Department ID is required",
          status: 400,
        })
      }

      const queryString = buildQueryParams({
        fromMonth,
        fromYear,
        toMonth,
        toYear,
      })

      const res = await axiosInstance.get(
        `/api/v1/DepartmentManager/department/${departmentId}/months-list${
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
          "حدث خطأ في جلب شهور القسم",
          "Failed to fetch department months list"
        )
      )
    }
  }
)

export const getDepartmentMonthView = createAsyncThunk(
  "departmentSlice/getDepartmentMonthView",
  async ({ departmentId, month, year }, thunkAPI) => {
    const { rejectWithValue } = thunkAPI

    try {
      if (!departmentId || !month || !year) {
        return rejectWithValue({
          message: "معرف القسم والشهر والسنة مطلوبة",
          messageAr: "معرف القسم والشهر والسنة مطلوبة",
          messageEn: "Department ID, month and year are required",
          status: 400,
        })
      }

      const queryString = buildQueryParams({ month, year })

      const res = await axiosInstance.get(
        `/api/v1/DepartmentManager/department/${departmentId}/month-view?${queryString}`,
        {
          headers: getAuthHeaders(),
        }
      )

      return res.data
    } catch (error) {
      return rejectWithValue(
        getErrorPayload(
          error,
          "حدث خطأ في جلب عرض الشهر للقسم",
          "Failed to fetch department month view"
        )
      )
    }
  }
)

export const getDepartmentRosterCalendar = createAsyncThunk(
  "departmentSlice/getDepartmentRosterCalendar",
  async ({ departmentId, ids = [] }, thunkAPI) => {
    const { rejectWithValue } = thunkAPI

    try {
      if (!departmentId) {
        return rejectWithValue({
          message: "معرف القسم مطلوب",
          messageAr: "معرف القسم مطلوب",
          messageEn: "Department ID is required",
          status: 400,
        })
      }

      const queryParams = new URLSearchParams()

      ids.forEach((id) => {
        if (id !== undefined && id !== null && id !== "") {
          queryParams.append("ids", id)
        }
      })

      const res = await axiosInstance.get(
        `/api/v1/DepartmentManager/${departmentId}/calendar${
          queryParams.toString() ? `?${queryParams.toString()}` : ""
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
          "حدث خطأ في جلب تقويم القسم",
          "Failed to fetch department roster calendar"
        )
      )
    }
  }
)

export const getDepartmentRosterStructure = createAsyncThunk(
  "departmentSlice/getDepartmentRosterStructure",
  async ({ departmentId, rosterId }, thunkAPI) => {
    const { rejectWithValue } = thunkAPI

    try {
      if (!departmentId || !rosterId) {
        return rejectWithValue({
          message: "معرف القسم والروستر مطلوبان",
          messageAr: "معرف القسم والروستر مطلوبان",
          messageEn: "Department ID and roster ID are required",
          status: 400,
        })
      }

      const res = await axiosInstance.get(
        `/api/v1/DepartmentManager/departments/${departmentId}/rosters/${rosterId}/structure`,
        {
          headers: getAuthHeaders(),
        }
      )

      return res.data
    } catch (error) {
      return rejectWithValue(
        getErrorPayload(
          error,
          "حدث خطأ في جلب هيكل روستر القسم",
          "Failed to fetch department roster structure"
        )
      )
    }
  }
)

// ===================================================================
// GEOFENCE
// ===================================================================

export const createGeoFence = createAsyncThunk(
  "departmentSlice/createGeoFence",
  async ({ departmentId, data }, thunkAPI) => {
    const { rejectWithValue } = thunkAPI

    try {
      if (!departmentId) {
        return rejectWithValue({
          message: "معرف القسم مطلوب",
          messageAr: "معرف القسم مطلوب",
          messageEn: "Department ID is required",
          status: 400,
        })
      }

      const res = await axiosInstance.post(
        `/api/v1/GeoFence/department/${departmentId}`,
        data,
        {
          headers: getAuthHeaders(),
        }
      )

      return res.data
    } catch (error) {
      return rejectWithValue(
        getErrorPayload(
          error,
          "حدث خطأ في إنشاء نطاق الحضور للقسم",
          "Failed to create department geofence"
        )
      )
    }
  }
)

export const getDepartmentGeoFences = createAsyncThunk(
  "departmentSlice/getDepartmentGeoFences",
  async ({ departmentId }, thunkAPI) => {
    const { rejectWithValue } = thunkAPI

    try {
      if (!departmentId) {
        return rejectWithValue({
          message: "معرف القسم مطلوب",
          messageAr: "معرف القسم مطلوب",
          messageEn: "Department ID is required",
          status: 400,
        })
      }

      const res = await axiosInstance.get(
        `/api/v1/GeoFence/department/${departmentId}`,
        {
          headers: getAuthHeaders(),
        }
      )

      return res.data
    } catch (error) {
      return rejectWithValue(
        getErrorPayload(
          error,
          "حدث خطأ في جلب نطاقات الحضور للقسم",
          "Failed to fetch department geofences"
        )
      )
    }
  }
)

export const getGeoFence = createAsyncThunk(
  "departmentSlice/getGeoFence",
  async ({ fenceId }, thunkAPI) => {
    const { rejectWithValue } = thunkAPI

    try {
      if (!fenceId) {
        return rejectWithValue({
          message: "معرف النطاق مطلوب",
          messageAr: "معرف النطاق مطلوب",
          messageEn: "Fence ID is required",
          status: 400,
        })
      }

      const res = await axiosInstance.get(`/api/v1/GeoFence/${fenceId}`, {
        headers: getAuthHeaders(),
      })

      return res.data
    } catch (error) {
      return rejectWithValue(
        getErrorPayload(
          error,
          "حدث خطأ في جلب نطاق الحضور",
          "Failed to fetch geofence"
        )
      )
    }
  }
)

export const editGeoFence = createAsyncThunk(
  "departmentSlice/editGeoFence",
  async ({ fenceId, data }, thunkAPI) => {
    const { rejectWithValue } = thunkAPI

    try {
      if (!fenceId) {
        return rejectWithValue({
          message: "معرف النطاق مطلوب",
          messageAr: "معرف النطاق مطلوب",
          messageEn: "Fence ID is required",
          status: 400,
        })
      }

      const res = await axiosInstance.put(`/api/v1/GeoFence/${fenceId}`, data, {
        headers: getAuthHeaders(),
      })

      return res.data
    } catch (error) {
      return rejectWithValue(
        getErrorPayload(
          error,
          "حدث خطأ في تعديل نطاق الحضور",
          "Failed to update geofence"
        )
      )
    }
  }
)

export const deleteGeoFence = createAsyncThunk(
  "departmentSlice/deleteGeoFence",
  async ({ fenceId }, thunkAPI) => {
    const { rejectWithValue } = thunkAPI

    try {
      if (!fenceId) {
        return rejectWithValue({
          message: "معرف النطاق مطلوب",
          messageAr: "معرف النطاق مطلوب",
          messageEn: "Fence ID is required",
          status: 400,
        })
      }

      const res = await axiosInstance.delete(`/api/v1/GeoFence/${fenceId}`, {
        headers: getAuthHeaders(),
      })

      return {
        ...res.data,
        fenceId,
      }
    } catch (error) {
      return rejectWithValue(
        getErrorPayload(
          error,
          "حدث خطأ في حذف نطاق الحضور",
          "Failed to delete geofence"
        )
      )
    }
  }
)

// ===================================================================
// BACKWARD-COMPATIBLE ALIASES
// ===================================================================

export const availabelDepartmentsForCategory = getAvailableDepartmentsForCategory
export const getDepartmentByCategory = getDepartmentsByCategory

export const getDepartmentRosterCalender = getDepartmentRosterCalendar

export const createGoFence = createGeoFence
export const getDepartmentGoefences = getDepartmentGeoFences
export const getGeofFence = getGeoFence
export const editGeofence = editGeoFence
export const deleteFence = deleteGeoFence