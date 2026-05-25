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
      error.message ||
      fallbackMessageAr,
    messageAr:
      error.response?.data?.messageAr || fallbackMessageAr || "حدث خطأ",
    messageEn:
      error.response?.data?.messageEn || fallbackMessageEn || "Something went wrong",
    errors: error.response?.data?.errors || [],
    status: error.response?.status,
    timestamp: new Date().toISOString(),
  }
}

// ===================================================================
// CATEGORY LIST
// ===================================================================

export const getCategories = createAsyncThunk(
  "categorySlice/getCategories",
  async (params = {}, thunkAPI) => {
    const { rejectWithValue } = thunkAPI

    try {
      const queryString = buildQueryParams({
        search: params.search,
        categoryId: params.categoryId,
        isActive: params.isActive,
        createdFrom: params.createdFrom,
        createdTo: params.createdTo,
        includeDepartments: params.includeDepartments,
        includeStatistics: params.includeStatistics,
        includeChief: params.includeChief,
        page: params.page,
        pageSize: params.pageSize,
        orderBy: params.orderBy,
        orderDesc: params.orderDesc,
      })

      const url = `/api/v1/Category${queryString ? `?${queryString}` : ""}`

      const res = await axiosInstance.get(url, {
        headers: getAuthHeaders(),
      })

      return res.data
    } catch (error) {
      return rejectWithValue(
        getErrorPayload(
          error,
          "حدث خطأ في جلب التخصصات",
          "Failed to fetch categories"
        )
      )
    }
  }
)

// ===================================================================
// SINGLE CATEGORY
// ===================================================================

export const getCategoryById = createAsyncThunk(
  "categorySlice/getCategoryById",
  async ({ categoryId }, thunkAPI) => {
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

      const res = await axiosInstance.get(`/api/v1/Category/${categoryId}`, {
        headers: getAuthHeaders(),
      })

      return res.data
    } catch (error) {
      return rejectWithValue(
        getErrorPayload(
          error,
          "حدث خطأ في جلب بيانات التخصص",
          "Failed to fetch category"
        )
      )
    }
  }
)

export const getCategoryDetails = createAsyncThunk(
  "categorySlice/getCategoryDetails",
  async ({ categoryId }, thunkAPI) => {
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
        `/api/v1/Category/${categoryId}/details`,
        {
          headers: getAuthHeaders(),
        }
      )

      return res.data
    } catch (error) {
      return rejectWithValue(
        getErrorPayload(
          error,
          "حدث خطأ في جلب تفاصيل التخصص",
          "Failed to fetch category details"
        )
      )
    }
  }
)

export const getCategoryStatisticsForDeptHead = createAsyncThunk(
  "categorySlice/getCategoryStatisticsForDeptHead",
  async ({ categoryId }, thunkAPI) => {
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
        `/api/v1/Category/${categoryId}/statistics-for-depthead`,
        {
          headers: getAuthHeaders(),
        }
      )

      return res.data
    } catch (error) {
      return rejectWithValue(
        getErrorPayload(
          error,
          "حدث خطأ في جلب إحصائيات التخصص",
          "Failed to fetch category statistics"
        )
      )
    }
  }
)

// ===================================================================
// CATEGORY DOCTORS
// ===================================================================

export const getCategoryDoctors = createAsyncThunk(
  "categorySlice/getCategoryDoctors",
  async ({ categoryId }, thunkAPI) => {
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
          "حدث خطأ في جلب دكاترة التخصص",
          "Failed to fetch category doctors"
        )
      )
    }
  }
)

// ===================================================================
// CREATE / UPDATE / DELETE CATEGORY
// ===================================================================

export const createCategory = createAsyncThunk(
  "categorySlice/createCategory",
  async (categoryData, thunkAPI) => {
    const { rejectWithValue } = thunkAPI

    try {
      const res = await axiosInstance.post("/api/v1/Category", categoryData, {
        headers: getAuthHeaders(),
      })

      return res.data
    } catch (error) {
      return rejectWithValue(
        getErrorPayload(
          error,
          "حدث خطأ في إنشاء التخصص",
          "Failed to create category"
        )
      )
    }
  }
)

export const updateCategory = createAsyncThunk(
  "categorySlice/updateCategory",
  async ({ categoryId, categoryData }, thunkAPI) => {
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

      const res = await axiosInstance.put(
        `/api/v1/Category/${categoryId}`,
        categoryData,
        {
          headers: getAuthHeaders(),
        }
      )

      return res.data
    } catch (error) {
      return rejectWithValue(
        getErrorPayload(
          error,
          "حدث خطأ في تحديث التخصص",
          "Failed to update category"
        )
      )
    }
  }
)

export const deleteCategory = createAsyncThunk(
  "categorySlice/deleteCategory",
  async ({ categoryId, reason }, thunkAPI) => {
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

      const res = await axiosInstance.delete(`/api/v1/Category/${categoryId}`, {
        headers: getAuthHeaders(),
        data: { reason },
      })

      return {
        ...res.data,
        deletedCategoryId: categoryId,
      }
    } catch (error) {
      return rejectWithValue(
        getErrorPayload(
          error,
          "حدث خطأ في حذف التخصص",
          "Failed to delete category"
        )
      )
    }
  }
)

// ===================================================================
// CATEGORY TYPES
// ===================================================================

export const getCategoryTypes = createAsyncThunk(
  "categorySlice/getCategoryTypes",
  async (_, thunkAPI) => {
    const { rejectWithValue } = thunkAPI

    try {
      const res = await axiosInstance.get("/api/v1/Category/categories-types", {
        headers: getAuthHeaders(),
      })

      return res.data
    } catch (error) {
      return rejectWithValue(
        getErrorPayload(
          error,
          "حدث خطأ في جلب أنواع التخصصات",
          "Failed to fetch category types"
        )
      )
    }
  }
)

// ===================================================================
// DOCTOR JOIN REQUESTS
// ===================================================================

export const getCategoryPendingRequests = createAsyncThunk(
  "categorySlice/getCategoryPendingRequests",
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
        status: filters.status,
        page: filters.page,
        pageSize: filters.pageSize,
      })

      const url = `/api/v1/Category/${categoryId}/pending-doctor-requests${
        queryString ? `?${queryString}` : ""
      }`

      const res = await axiosInstance.get(url, {
        headers: getAuthHeaders(),
      })

      return {
        ...res.data,
        categoryId,
      }
    } catch (error) {
      return rejectWithValue(
        getErrorPayload(
          error,
          "حدث خطأ في جلب طلبات الدكاترة",
          "Failed to fetch doctor join requests"
        )
      )
    }
  }
)

export const approveDoctorRequest = createAsyncThunk(
  "categorySlice/approveDoctorRequest",
  async ({ userId }, thunkAPI) => {
    const { rejectWithValue } = thunkAPI

    try {
      if (!userId) {
        return rejectWithValue({
          message: "معرف المستخدم مطلوب",
          messageAr: "معرف المستخدم مطلوب",
          messageEn: "User ID is required",
          status: 400,
        })
      }

      const res = await axiosInstance.post(
        "/api/v1/Category/approve-doctor-request",
        null,
        {
          params: { userId },
          headers: getAuthHeaders(),
        }
      )

      return {
        ...res.data,
        userId,
      }
    } catch (error) {
      return rejectWithValue(
        getErrorPayload(
          error,
          "حدث خطأ أثناء قبول طلب الدكتور",
          "Failed to approve doctor request"
        )
      )
    }
  }
)

export const rejectDoctorRequest = createAsyncThunk(
  "categorySlice/rejectDoctorRequest",
  async ({ userId }, thunkAPI) => {
    const { rejectWithValue } = thunkAPI

    try {
      if (!userId) {
        return rejectWithValue({
          message: "معرف المستخدم مطلوب",
          messageAr: "معرف المستخدم مطلوب",
          messageEn: "User ID is required",
          status: 400,
        })
      }

      const res = await axiosInstance.post(
        "/api/v1/Category/reject-doctor-request",
        null,
        {
          params: { userId },
          headers: getAuthHeaders(),
        }
      )

      return {
        ...res.data,
        userId,
      }
    } catch (error) {
      return rejectWithValue(
        getErrorPayload(
          error,
          "حدث خطأ أثناء رفض طلب الدكتور",
          "Failed to reject doctor request"
        )
      )
    }
  }
)

// ===================================================================
// CATEGORY HEADS
// ===================================================================

export const getCategoryHeads = createAsyncThunk(
  "categorySlice/getCategoryHeads",
  async ({ categoryId, page = 1, pageSize = 10 }, thunkAPI) => {
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
        CategoryId: categoryId,
        page,
        pageSize,
      })

      const res = await axiosInstance.get(
        `/api/v1/Role/category-heads?${queryString}`,
        {
          headers: getAuthHeaders(),
        }
      )

      return res.data
    } catch (error) {
      return rejectWithValue(
        getErrorPayload(
          error,
          "حدث خطأ في جلب رؤساء التخصص",
          "Failed to fetch category heads"
        )
      )
    }
  }
)

export const assignCategoryHead = createAsyncThunk(
  "categorySlice/assignCategoryHead",
  async ({ data }, thunkAPI) => {
    const { rejectWithValue } = thunkAPI

    try {
      const res = await axiosInstance.post(
        "/api/v1/Role/category-head/assign",
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
          "حدث خطأ في تعيين رئيس التخصص",
          "Failed to assign category head"
        )
      )
    }
  }
)

export const removeCategoryHead = createAsyncThunk(
  "categorySlice/removeCategoryHead",
  async ({ data }, thunkAPI) => {
    const { rejectWithValue } = thunkAPI

    try {
      const res = await axiosInstance.post(
        "/api/v1/Role/category-head/remove",
        data,
        {
          headers: getAuthHeaders(),
        }
      )

      return {
        ...res.data,
        catHeadId: data.CategoryId || data.categoryId,
      }
    } catch (error) {
      return rejectWithValue(
        getErrorPayload(
          error,
          "حدث خطأ في إزالة رئيس التخصص",
          "Failed to remove category head"
        )
      )
    }
  }
)