import { createSlice } from "@reduxjs/toolkit"
import {
  createCategory,
  getCategories,
  getCategoryById,
  getCategoryDetails,
  getCategoryStatisticsForDeptHead,
  getCategoryDoctors,
  updateCategory,
  deleteCategory,
  getCategoryTypes,
  getCategoryPendingRequests,
  approveDoctorRequest,
  rejectDoctorRequest,
  getCategoryHeads,
  assignCategoryHead,
  removeCategoryHead,
} from "../act/actCategory"

const initialState = {
  // =========================
  // Category List
  // =========================
  categories: [],
  pagination: null,
  filters: {
    search: "",
    isActive: "",
    orderBy: "createdAt",
    orderDesc: true,
    page: 1,
    pageSize: 10,
    includeDepartments: true,
    includeStatistics: true,
    includeChief: true,
  },
  loadingGetCategories: false,
  error: null,

  // =========================
  // Single Category
  // =========================
  selectedCategory: null,
  categoryDetails: null,
  categoryStatistics: null,
  loadingGetSingleCategory: false,
  loadingGetCategoryDetails: false,
  loadingGetCategoryStatistics: false,
  singleCategoryError: null,
  categoryDetailsError: null,
  categoryStatisticsError: null,

  // =========================
  // Create / Update / Delete
  // =========================
  loadingCreateCategory: false,
  createError: null,
  createSuccess: false,
  createMessage: "",

  loadingUpdateCategory: false,
  updateError: null,
  updateSuccess: false,
  updateMessage: "",

  loadingDeleteCategory: false,
  deleteError: null,
  deleteSuccess: false,
  deleteMessage: "",
  deletedCategoryId: null,

  // =========================
  // Category Types
  // =========================
  categoryTypes: [],
  loadingGetCategoryTypes: false,
  categoryTypesError: null,

  // =========================
  // Approved Category Doctors
  // =========================
  categoryDoctors: [],
  categoryDoctorsPagination: null,
  categoryDoctorsFilters: {
    isActive: "",
    page: 1,
    pageSize: 10,
  },
  loadingGetCategoryDoctors: false,
  categoryDoctorsError: null,

  // =========================
  // Global Pending Doctor Requests
  // =========================
  pendingDoctorRequests: [],
  pendingDoctorRequestsPagination: null,
  pendingDoctorRequestsError: null,
  pendingRequestsFilters: {
    status: "",
    page: 1,
    pageSize: 10,
  },
  loadingGetPendingDoctorRequests: false,
  selectedRequest: null,

  // =========================
  // Category Pending Doctor Requests
  // =========================
  selectedCategoryId: null,
  categoryPendingRequests: [],
  categoryPendingRequestsPagination: null,
  categoryPendingRequestsError: null,
  categoryPendingRequestsFilters: {
    status: "",
    page: 1,
    pageSize: 10,
  },
  loadingGetCategoryPendingRequests: false,

  // =========================
  // Approve / Reject Doctor Request
  // =========================
  loadingApproveRequest: false,
  loadingRejectRequest: false,
  approvalError: null,
  approvalSuccess: false,
  approvalMessage: "",

  // =========================
  // Category Heads
  // =========================
  categoryHeads: [],
  categoryHeadsPagination: null,
  loadingGetCategoryHeads: false,
  loadingAssignCategoryHead: false,
  loadingRemoveCategoryHead: false,
  categoryHeadsError: null,
  assignCategoryHeadError: null,
  removeCategoryHeadError: null,
}

const extractData = (payload) => {
  return payload?.data ?? payload ?? null
}

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
    totalCount: data.totalCount ?? data.totalRecords ?? 0,
    page: data.page ?? data.currentPage ?? 1,
    pageSize: data.pageSize ?? 10,
    totalPages: data.totalPages ?? 1,
    hasNext: data.hasNext ?? data.hasNextPage ?? false,
    hasPrevious: data.hasPrevious ?? data.hasPreviousPage ?? false,
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
    timestamp: payload.timestamp || new Date().toISOString(),
  }
}

export const categorySlice = createSlice({
  name: "categorySlice",
  initialState,
  reducers: {
    // =========================
    // Category Filters
    // =========================
    setFilters: (state, action) => {
      state.filters = {
        ...state.filters,
        ...action.payload,
      }
    },

    clearFilters: (state) => {
      state.filters = {
        search: "",
        isActive: "",
        orderBy: "createdAt",
        orderDesc: true,
        page: 1,
        pageSize: 10,
        includeDepartments: true,
        includeStatistics: true,
        includeChief: true,
      }
    },

    setCurrentPage: (state, action) => {
      state.filters.page = action.payload
    },

    setPageSize: (state, action) => {
      state.filters.pageSize = action.payload
      state.filters.page = 1
    },

    clearCategories: (state) => {
      state.categories = []
      state.pagination = null
      state.error = null
    },

    clearError: (state) => {
      state.error = null
    },

    // =========================
    // Category Types
    // =========================
    clearCategoryTypes: (state) => {
      state.categoryTypes = []
      state.categoryTypesError = null
    },

    clearCategoryTypesError: (state) => {
      state.categoryTypesError = null
    },

    // =========================
    // Create / Update / Delete
    // =========================
    clearCreateSuccess: (state) => {
      state.createSuccess = false
      state.createMessage = ""
    },

    clearUpdateSuccess: (state) => {
      state.updateSuccess = false
      state.updateMessage = ""
    },

    clearDeleteSuccess: (state) => {
      state.deleteSuccess = false
      state.deleteMessage = ""
      state.deletedCategoryId = null
    },

    resetCreateForm: (state) => {
      state.loadingCreateCategory = false
      state.createError = null
      state.createSuccess = false
      state.createMessage = ""
    },

    resetUpdateForm: (state) => {
      state.loadingUpdateCategory = false
      state.updateError = null
      state.updateSuccess = false
      state.updateMessage = ""
    },

    resetDeleteForm: (state) => {
      state.loadingDeleteCategory = false
      state.deleteError = null
      state.deleteSuccess = false
      state.deleteMessage = ""
      state.deletedCategoryId = null
    },

    // =========================
    // Single Category
    // =========================
    clearSingleCategory: (state) => {
      state.selectedCategory = null
      state.categoryDetails = null
      state.categoryStatistics = null
      state.singleCategoryError = null
      state.categoryDetailsError = null
      state.categoryStatisticsError = null
    },

    clearSingleCategoryError: (state) => {
      state.singleCategoryError = null
      state.categoryDetailsError = null
      state.categoryStatisticsError = null
    },

    clearCategoryDetails: (state) => {
      state.categoryDetails = null
      state.categoryDetailsError = null
    },

    clearCategoryStatistics: (state) => {
      state.categoryStatistics = null
      state.categoryStatisticsError = null
    },

    // =========================
    // Approved Category Doctors
    // =========================
    setCategoryDoctorsFilters: (state, action) => {
      state.categoryDoctorsFilters = {
        ...state.categoryDoctorsFilters,
        ...action.payload,
      }
    },

    clearCategoryDoctorsFilters: (state) => {
      state.categoryDoctorsFilters = {
        isActive: "",
        page: 1,
        pageSize: 10,
      }
    },

    setCategoryDoctorsCurrentPage: (state, action) => {
      state.categoryDoctorsFilters.page = action.payload
    },

    setCategoryDoctorsPageSize: (state, action) => {
      state.categoryDoctorsFilters.pageSize = action.payload
      state.categoryDoctorsFilters.page = 1
    },

    setCategoryDoctorsActiveFilter: (state, action) => {
      state.categoryDoctorsFilters.isActive = action.payload
      state.categoryDoctorsFilters.page = 1
    },

    clearCategoryDoctors: (state) => {
      state.categoryDoctors = []
      state.categoryDoctorsPagination = null
      state.categoryDoctorsError = null
    },

    clearCategoryDoctorsError: (state) => {
      state.categoryDoctorsError = null
    },

    // =========================
    // Global Pending Doctor Requests
    // =========================
    setPendingRequestsFilters: (state, action) => {
      state.pendingRequestsFilters = {
        ...state.pendingRequestsFilters,
        ...action.payload,
      }
    },

    clearPendingRequestsFilters: (state) => {
      state.pendingRequestsFilters = {
        status: "",
        page: 1,
        pageSize: 10,
      }
    },

    setPendingRequestsCurrentPage: (state, action) => {
      state.pendingRequestsFilters.page = action.payload
    },

    setPendingRequestsPageSize: (state, action) => {
      state.pendingRequestsFilters.pageSize = action.payload
      state.pendingRequestsFilters.page = 1
    },

    setPendingRequestsStatusFilter: (state, action) => {
      state.pendingRequestsFilters.status = action.payload
      state.pendingRequestsFilters.page = 1
    },

    clearPendingDoctorRequests: (state) => {
      state.pendingDoctorRequests = []
      state.pendingDoctorRequestsPagination = null
      state.pendingDoctorRequestsError = null
    },

    clearPendingDoctorRequestsError: (state) => {
      state.pendingDoctorRequestsError = null
    },

    clearSelectedRequest: (state) => {
      state.selectedRequest = null
    },

    // =========================
    // Category Pending Requests
    // =========================
    setCategoryPendingRequestsFilters: (state, action) => {
      state.categoryPendingRequestsFilters = {
        ...state.categoryPendingRequestsFilters,
        ...action.payload,
      }
    },

    clearCategoryPendingRequestsFilters: (state) => {
      state.categoryPendingRequestsFilters = {
        status: "",
        page: 1,
        pageSize: 10,
      }
    },

    setCategoryPendingRequestsCurrentPage: (state, action) => {
      state.categoryPendingRequestsFilters.page = action.payload
    },

    setCategoryPendingRequestsPageSize: (state, action) => {
      state.categoryPendingRequestsFilters.pageSize = action.payload
      state.categoryPendingRequestsFilters.page = 1
    },

    setCategoryPendingRequestsStatusFilter: (state, action) => {
      const status =
        typeof action.payload === "object"
          ? action.payload.status
          : action.payload

      state.categoryPendingRequestsFilters.status = status || ""
      state.categoryPendingRequestsFilters.page = 1
    },

    clearCategoryPendingRequests: (state) => {
      state.categoryPendingRequests = []
      state.categoryPendingRequestsPagination = null
      state.categoryPendingRequestsError = null
      state.selectedCategoryId = null
    },

    clearCategoryPendingRequestsError: (state) => {
      state.categoryPendingRequestsError = null
    },

    setSelectedCategoryId: (state, action) => {
      state.selectedCategoryId = action.payload
    },

    // =========================
    // Approval State
    // =========================
    clearApprovalSuccess: (state) => {
      state.approvalSuccess = false
      state.approvalMessage = ""
    },

    clearApprovalError: (state) => {
      state.approvalError = null
    },

    resetApprovalForm: (state) => {
      state.loadingApproveRequest = false
      state.loadingRejectRequest = false
      state.approvalError = null
      state.approvalSuccess = false
      state.approvalMessage = ""
    },

    // =========================
    // Category Heads
    // =========================
    clearCategoryHeads: (state) => {
      state.categoryHeads = []
      state.categoryHeadsPagination = null
      state.categoryHeadsError = null
    },

    clearCategoryHeadsError: (state) => {
      state.categoryHeadsError = null
      state.assignCategoryHeadError = null
      state.removeCategoryHeadError = null
    },
  },

  extraReducers: (builder) => {
    builder
      // =========================
      // Get Categories
      // =========================
      .addCase(getCategories.pending, (state) => {
        state.loadingGetCategories = true
        state.error = null
      })

      .addCase(getCategories.fulfilled, (state, action) => {
        state.loadingGetCategories = false
        state.error = null

        const response = action.payload
        const data = response?.data

        if (Array.isArray(data)) {
          state.categories = data
          state.pagination = null
          return
        }

        state.categories = data?.items || []
        state.pagination = {
          totalCount: data?.totalCount || 0,
          page: data?.page || 1,
          pageSize: data?.pageSize || state.filters.pageSize,
          totalPages: data?.totalPages || 1,
          hasNext: data?.hasNext || false,
          hasPrevious: data?.hasPrevious || false,
          startIndex: data?.startIndex || 0,
          endIndex: data?.endIndex || 0,
        }
      })

      .addCase(getCategories.rejected, (state, action) => {
        state.loadingGetCategories = false
        state.error = normalizeError(
          action.payload,
          "حدث خطأ في جلب التخصصات"
        )
      })

      // =========================
      // Get Category By Id
      // =========================
      .addCase(getCategoryById.pending, (state) => {
        state.loadingGetSingleCategory = true
        state.singleCategoryError = null
      })

      .addCase(getCategoryById.fulfilled, (state, action) => {
        state.loadingGetSingleCategory = false
        state.selectedCategory = extractData(action.payload)
        state.singleCategoryError = null
      })

      .addCase(getCategoryById.rejected, (state, action) => {
        state.loadingGetSingleCategory = false
        state.selectedCategory = null
        state.singleCategoryError = normalizeError(
          action.payload,
          "حدث خطأ في جلب بيانات التخصص"
        )
      })

      // =========================
      // Get Category Details
      // =========================
      .addCase(getCategoryDetails.pending, (state) => {
        state.loadingGetCategoryDetails = true
        state.categoryDetailsError = null
      })

      .addCase(getCategoryDetails.fulfilled, (state, action) => {
        state.loadingGetCategoryDetails = false
        state.categoryDetails = extractData(action.payload)
        state.categoryDetailsError = null
      })

      .addCase(getCategoryDetails.rejected, (state, action) => {
        state.loadingGetCategoryDetails = false
        state.categoryDetails = null
        state.categoryDetailsError = normalizeError(
          action.payload,
          "حدث خطأ في جلب تفاصيل التخصص"
        )
      })

      // =========================
      // Get Category Statistics
      // =========================
      .addCase(getCategoryStatisticsForDeptHead.pending, (state) => {
        state.loadingGetCategoryStatistics = true
        state.categoryStatisticsError = null
      })

      .addCase(getCategoryStatisticsForDeptHead.fulfilled, (state, action) => {
        state.loadingGetCategoryStatistics = false
        state.categoryStatistics = extractData(action.payload)
        state.categoryStatisticsError = null
      })

      .addCase(getCategoryStatisticsForDeptHead.rejected, (state, action) => {
        state.loadingGetCategoryStatistics = false
        state.categoryStatistics = null
        state.categoryStatisticsError = normalizeError(
          action.payload,
          "حدث خطأ في جلب إحصائيات التخصص"
        )
      })

      // =========================
      // Create Category
      // =========================
      .addCase(createCategory.pending, (state) => {
        state.loadingCreateCategory = true
        state.createError = null
        state.createSuccess = false
        state.createMessage = ""
      })

      .addCase(createCategory.fulfilled, (state, action) => {
        state.loadingCreateCategory = false
        state.createSuccess = true
        state.createMessage = extractMessage(
          action.payload,
          "تم إنشاء التخصص بنجاح"
        )
        state.createError = null

        const createdCategory = extractData(action.payload)
        if (createdCategory && createdCategory.id) {
          state.categories.unshift(createdCategory)
        }
      })

      .addCase(createCategory.rejected, (state, action) => {
        state.loadingCreateCategory = false
        state.createSuccess = false
        state.createError = normalizeError(
          action.payload,
          "حدث خطأ في إنشاء التخصص"
        )
      })

      // =========================
      // Update Category
      // =========================
      .addCase(updateCategory.pending, (state) => {
        state.loadingUpdateCategory = true
        state.updateError = null
        state.updateSuccess = false
        state.updateMessage = ""
      })

      .addCase(updateCategory.fulfilled, (state, action) => {
        state.loadingUpdateCategory = false
        state.updateSuccess = true
        state.updateMessage = extractMessage(
          action.payload,
          "تم تحديث التخصص بنجاح"
        )
        state.updateError = null

        const updatedCategory = extractData(action.payload)

        if (updatedCategory?.id) {
          state.selectedCategory = updatedCategory
          state.categories = state.categories.map((category) =>
            category.id === updatedCategory.id ? updatedCategory : category
          )
        }
      })

      .addCase(updateCategory.rejected, (state, action) => {
        state.loadingUpdateCategory = false
        state.updateSuccess = false
        state.updateError = normalizeError(
          action.payload,
          "حدث خطأ في تحديث التخصص"
        )
      })

      // =========================
      // Delete Category
      // =========================
      .addCase(deleteCategory.pending, (state) => {
        state.loadingDeleteCategory = true
        state.deleteError = null
        state.deleteSuccess = false
        state.deleteMessage = ""
        state.deletedCategoryId = null
      })

      .addCase(deleteCategory.fulfilled, (state, action) => {
        state.loadingDeleteCategory = false
        state.deleteSuccess = true
        state.deleteMessage = extractMessage(
          action.payload,
          "تم حذف التخصص بنجاح"
        )
        state.deleteError = null

        const deletedId =
          action.payload?.deletedCategoryId ||
          action.meta?.arg?.categoryId

        state.deletedCategoryId = deletedId
        state.categories = state.categories.filter(
          (category) => Number(category.id) !== Number(deletedId)
        )
      })

      .addCase(deleteCategory.rejected, (state, action) => {
        state.loadingDeleteCategory = false
        state.deleteSuccess = false
        state.deleteError = normalizeError(
          action.payload,
          "حدث خطأ في حذف التخصص"
        )
      })

      // =========================
      // Category Types
      // =========================
      .addCase(getCategoryTypes.pending, (state) => {
        state.loadingGetCategoryTypes = true
        state.categoryTypesError = null
      })

      .addCase(getCategoryTypes.fulfilled, (state, action) => {
        state.loadingGetCategoryTypes = false
        state.categoryTypes = extractList(action.payload)
        state.categoryTypesError = null
      })

      .addCase(getCategoryTypes.rejected, (state, action) => {
        state.loadingGetCategoryTypes = false
        state.categoryTypesError = normalizeError(
          action.payload,
          "حدث خطأ في جلب أنواع التخصصات"
        )
      })

      // =========================
      // Approved Category Doctors
      // =========================
      .addCase(getCategoryDoctors.pending, (state) => {
        state.loadingGetCategoryDoctors = true
        state.categoryDoctorsError = null
      })

      .addCase(getCategoryDoctors.fulfilled, (state, action) => {
        state.loadingGetCategoryDoctors = false
        state.categoryDoctors = extractList(action.payload)
        state.categoryDoctorsPagination = extractPagination(action.payload)
        state.categoryDoctorsError = null
      })

      .addCase(getCategoryDoctors.rejected, (state, action) => {
        state.loadingGetCategoryDoctors = false
        state.categoryDoctors = []
        state.categoryDoctorsPagination = null
        state.categoryDoctorsError = normalizeError(
          action.payload,
          "حدث خطأ في جلب دكاترة التخصص"
        )
      })

      // =========================
      // Category Pending Doctor Requests
      // =========================
      .addCase(getCategoryPendingRequests.pending, (state) => {
        state.loadingGetCategoryPendingRequests = true
        state.categoryPendingRequestsError = null
      })

      .addCase(getCategoryPendingRequests.fulfilled, (state, action) => {
        state.loadingGetCategoryPendingRequests = false
        state.selectedCategoryId =
          action.payload?.categoryId || action.meta?.arg?.categoryId || null
        state.categoryPendingRequests = extractList(action.payload)
        state.categoryPendingRequestsPagination = extractPagination(
          action.payload
        )
        state.categoryPendingRequestsError = null
      })

      .addCase(getCategoryPendingRequests.rejected, (state, action) => {
        state.loadingGetCategoryPendingRequests = false
        state.categoryPendingRequests = []
        state.categoryPendingRequestsPagination = null
        state.categoryPendingRequestsError = normalizeError(
          action.payload,
          "حدث خطأ في جلب طلبات الدكاترة"
        )
      })

      // =========================
      // Approve Doctor Request
      // =========================
      .addCase(approveDoctorRequest.pending, (state) => {
        state.loadingApproveRequest = true
        state.approvalError = null
        state.approvalSuccess = false
        state.approvalMessage = ""
      })

      .addCase(approveDoctorRequest.fulfilled, (state, action) => {
        state.loadingApproveRequest = false
        state.approvalError = null
        state.approvalSuccess = true
        state.approvalMessage = extractMessage(
          action.payload,
          "تم قبول طلب الدكتور بنجاح"
        )

        const userId = action.payload?.userId || action.meta?.arg?.userId

        state.categoryPendingRequests = state.categoryPendingRequests.map(
          (request) =>
            Number(request.userId) === Number(userId)
              ? {
                  ...request,
                  status: "Approved",
                  processedAt: new Date().toISOString(),
                }
              : request
        )

        state.pendingDoctorRequests = state.pendingDoctorRequests.map(
          (request) =>
            Number(request.userId) === Number(userId)
              ? {
                  ...request,
                  status: "Approved",
                  processedAt: new Date().toISOString(),
                }
              : request
        )
      })

      .addCase(approveDoctorRequest.rejected, (state, action) => {
        state.loadingApproveRequest = false
        state.approvalSuccess = false
        state.approvalError = normalizeError(
          action.payload,
          "حدث خطأ أثناء قبول طلب الدكتور"
        )
      })

      // =========================
      // Reject Doctor Request
      // =========================
      .addCase(rejectDoctorRequest.pending, (state) => {
        state.loadingRejectRequest = true
        state.approvalError = null
        state.approvalSuccess = false
        state.approvalMessage = ""
      })

      .addCase(rejectDoctorRequest.fulfilled, (state, action) => {
        state.loadingRejectRequest = false
        state.approvalError = null
        state.approvalSuccess = true
        state.approvalMessage = extractMessage(
          action.payload,
          "تم رفض طلب الدكتور بنجاح"
        )

        const userId = action.payload?.userId || action.meta?.arg?.userId

        state.categoryPendingRequests = state.categoryPendingRequests.map(
          (request) =>
            Number(request.userId) === Number(userId)
              ? {
                  ...request,
                  status: "Rejected",
                  processedAt: new Date().toISOString(),
                }
              : request
        )

        state.pendingDoctorRequests = state.pendingDoctorRequests.map(
          (request) =>
            Number(request.userId) === Number(userId)
              ? {
                  ...request,
                  status: "Rejected",
                  processedAt: new Date().toISOString(),
                }
              : request
        )
      })

      .addCase(rejectDoctorRequest.rejected, (state, action) => {
        state.loadingRejectRequest = false
        state.approvalSuccess = false
        state.approvalError = normalizeError(
          action.payload,
          "حدث خطأ أثناء رفض طلب الدكتور"
        )
      })

      // =========================
      // Category Heads
      // =========================
      .addCase(getCategoryHeads.pending, (state) => {
        state.loadingGetCategoryHeads = true
        state.categoryHeadsError = null
      })

      .addCase(getCategoryHeads.fulfilled, (state, action) => {
        state.loadingGetCategoryHeads = false
        state.categoryHeads = extractList(action.payload)
        state.categoryHeadsPagination = extractPagination(action.payload)
        state.categoryHeadsError = null
      })

      .addCase(getCategoryHeads.rejected, (state, action) => {
        state.loadingGetCategoryHeads = false
        state.categoryHeads = []
        state.categoryHeadsPagination = null
        state.categoryHeadsError = normalizeError(
          action.payload,
          "حدث خطأ في جلب رؤساء التخصص"
        )
      })

      .addCase(assignCategoryHead.pending, (state) => {
        state.loadingAssignCategoryHead = true
        state.assignCategoryHeadError = null
      })

      .addCase(assignCategoryHead.fulfilled, (state) => {
        state.loadingAssignCategoryHead = false
        state.assignCategoryHeadError = null
      })

      .addCase(assignCategoryHead.rejected, (state, action) => {
        state.loadingAssignCategoryHead = false
        state.assignCategoryHeadError = normalizeError(
          action.payload,
          "حدث خطأ في تعيين رئيس التخصص"
        )
      })

      .addCase(removeCategoryHead.pending, (state) => {
        state.loadingRemoveCategoryHead = true
        state.removeCategoryHeadError = null
      })

      .addCase(removeCategoryHead.fulfilled, (state, action) => {
        state.loadingRemoveCategoryHead = false
        state.removeCategoryHeadError = null

        const categoryId =
          action.payload?.catHeadId ||
          action.meta?.arg?.data?.CategoryId ||
          action.meta?.arg?.data?.categoryId

        if (categoryId) {
          state.categoryHeads = state.categoryHeads.filter(
            (head) => Number(head.categoryId) !== Number(categoryId)
          )
        }
      })

      .addCase(removeCategoryHead.rejected, (state, action) => {
        state.loadingRemoveCategoryHead = false
        state.removeCategoryHeadError = normalizeError(
          action.payload,
          "حدث خطأ في إزالة رئيس التخصص"
        )
      })
  },
})

export const {
  // Category filters
  setFilters,
  clearFilters,
  setCurrentPage,
  setPageSize,

  // Category data
  clearCategories,
  clearError,

  // Category Types
  clearCategoryTypes,
  clearCategoryTypesError,

  // Create / update / delete
  clearCreateSuccess,
  clearUpdateSuccess,
  clearDeleteSuccess,
  resetCreateForm,
  resetUpdateForm,
  resetDeleteForm,

  // Single category
  clearSingleCategory,
  clearSingleCategoryError,
  clearCategoryDetails,
  clearCategoryStatistics,

  // Approved doctors
  setCategoryDoctorsFilters,
  clearCategoryDoctorsFilters,
  setCategoryDoctorsCurrentPage,
  setCategoryDoctorsPageSize,
  setCategoryDoctorsActiveFilter,
  clearCategoryDoctors,
  clearCategoryDoctorsError,

  // Global Pending Doctor Requests
  setPendingRequestsFilters,
  clearPendingRequestsFilters,
  setPendingRequestsCurrentPage,
  setPendingRequestsPageSize,
  setPendingRequestsStatusFilter,
  clearPendingDoctorRequests,
  clearPendingDoctorRequestsError,
  clearSelectedRequest,

  // Category-specific Pending Requests
  setCategoryPendingRequestsFilters,
  clearCategoryPendingRequestsFilters,
  setCategoryPendingRequestsCurrentPage,
  setCategoryPendingRequestsPageSize,
  setCategoryPendingRequestsStatusFilter,
  clearCategoryPendingRequests,
  clearCategoryPendingRequestsError,
  setSelectedCategoryId,

  // Doctor Request Approval
  clearApprovalSuccess,
  clearApprovalError,
  resetApprovalForm,

  // Category Heads
  clearCategoryHeads,
  clearCategoryHeadsError,
} = categorySlice.actions

export default categorySlice.reducer

// Re-export async thunks عشان الملفات القديمة اللي بتستورد من slice ما تتكسرش
export {
  getCategories,
  createCategory,
  getCategoryById,
  getCategoryDetails,
  getCategoryStatisticsForDeptHead,
  getCategoryDoctors,
  updateCategory,
  deleteCategory,
  getCategoryTypes,
  getCategoryPendingRequests,
  approveDoctorRequest,
  rejectDoctorRequest,
  getCategoryHeads,
  assignCategoryHead,
  removeCategoryHead,
}