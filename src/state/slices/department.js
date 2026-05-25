import { createSlice } from "@reduxjs/toolkit"
import {
  createDepartment,
  getDepartments,
  getDepartmentById,
  updateDepartment,
  deleteDepartment,

  getDepartmentCategories,
  getAvailableDepartmentsForCategory,
  getDepartmentsByCategory,
  linkDepartmentToCategory,
  unlinkDepartmentFromCategory,

  getDepartmentManagers,
  getDepartmentsWithManagers,
  updateManagerPermission,
  removeDepManager,
  assignDepManager,

  getDepartmentMonthList,
  getDepartmentMonthView,
  getDepartmentRosterCalendar,
  getDepartmentRosterStructure,

  createGeoFence,
  getDepartmentGeoFences,
  getGeoFence,
  editGeoFence,
  deleteGeoFence,
} from "../act/actDepartment"

const initialState = {
  // =========================
  // Department List
  // =========================
  departments: [],
  pagination: null,
  filters: {
    search: "",
    code: "",
    categoryId: "",
    linkedToCategoryId: "",
    isUnlinked: "",
    hasManager: "",
    isActive: "",
    createdFrom: "",
    createdTo: "",
    includeManager: true,
    includeCategories: true,
    includeSubDepartments: true,
    includeStatistics: true,
    includeCategory: true,
    orderBy: "nameArabic",
    orderDesc: true,
    page: 1,
    pageSize: 10,
  },
  loadingGetDepartments: false,
  error: null,
  message: "",
  timestamp: null,

  // =========================
  // Single Department
  // =========================
  selectedDepartment: null,
  loadingGetSingleDepartment: false,
  loadingGetDepartmentById: false,
  singleDepartmentError: null,

  // Used in auth/permission checks in existing pages
  departmentLinkedIds: [],

  // =========================
  // Create / Update / Delete
  // =========================
  loadingCreateDepartment: false,
  createError: null,
  createSuccess: false,
  createMessage: "",

  loadingUpdateDepartment: false,
  updateError: null,
  updateSuccess: false,
  updateMessage: "",

  loadingDeleteDepartment: false,
  deleteError: null,
  deleteSuccess: false,
  deleteMessage: "",
  deletedDepartmentId: null,

  // =========================
  // Department Categories
  // =========================
  departmentCategories: [],
  departmentCategoriesPagination: null,
  loadingGetDepartmentCategories: false,
  departmentCategoriesError: null,

  availableDepartmentsForCategory: [],
  availableDepartmentsForCategoryPagination: null,
  loadingGetAvailableDepartmentsForCategory: false,
  availableDepartmentsForCategoryError: null,

  departmentsByCategory: [],
  departmentsByCategoryPagination: null,
  loadingGetDepartmentsByCategory: false,
  departmentsByCategoryError: null,

  loadingLinkDepartmentToCategory: false,
  linkDepartmentToCategoryError: null,
  linkDepartmentToCategorySuccess: false,
  linkDepartmentToCategoryMessage: "",

  loadingUnlinkDepartment: false,
  loadingUnlinkDepartmentFromCategory: false,
  unlinkDepartmentFromCategoryError: null,
  unlinkDepartmentFromCategorySuccess: false,
  unlinkDepartmentFromCategoryMessage: "",

  // =========================
  // Department Managers
  // =========================
  departmentManagers: [],
  departmentManagersPagination: null,
  loadingGetDepartmentManagers: false,
  departmentManagersError: null,

  departmentsWithManagers: [],
  departmentsWithManagersPagination: null,
  loadingGetDepartmentsWithManagers: false,
  departmentsWithManagersError: null,

  loadingAssignManager: false,
  assignManagerError: null,
  assignManagerSuccess: false,
  assignManagerMessage: "",

  loadingRemoveManager: false,
  removeManagerError: null,
  removeManagerSuccess: false,
  removeManagerMessage: "",

  loadingUpdateManagerPermission: false,
  updateManagerPermissionError: null,
  updateManagerPermissionSuccess: false,
  updateManagerPermissionMessage: "",

  // =========================
  // Department Month / Calendar
  // =========================
  departmentMonthList: [],
  loadingGetDepartmentMonthList: false,
  departmentMonthListError: null,

  departmentMonthView: null,
  loadingGetDepartmentMonthView: false,
  departmentMonthViewError: null,

  currentDepartment: null,
  departmentTotals: null,

  departmentRosterCalendar: [],
  departmentRosterData: [],
  rosterLookup: {},
  loadingGetDepartmentRosterCalendar: false,

  // Backward-compatible typo used by old DepartmentCalender.jsx
  loadinGetDepartmentCalender: false,

  departmentRosterCalendarError: null,

  // New recommended endpoint for one roster
  departmentRosterStructure: null,
  loadingGetDepartmentRosterStructure: false,
  departmentRosterStructureError: null,

  // =========================
  // GeoFence
  // =========================
  geofences: [],
  selectedGeoFence: null,

  loadingCreateGeoFence: false,
  createGeoFenceError: null,
  createGeoFenceSuccess: false,
  createGeoFenceMessage: "",

  loadingGetDepartmentGeofences: false,
  loadingGetDepartmentGeoFences: false,
  getDepartmentGeoFencesError: null,

  loadingGetGeoFence: false,
  getGeoFenceError: null,

  loadingEditGeoFence: false,
  editGeoFenceError: null,
  editGeoFenceSuccess: false,
  editGeoFenceMessage: "",

  loadingDeleteGeoFence: false,
  deleteGeoFenceError: null,
  deleteGeoFenceSuccess: false,
  deleteGeoFenceMessage: "",
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
    totalCount: data.totalCount ?? data.totalRecords ?? data.count ?? 0,
    page: data.page ?? data.currentPage ?? 1,
    pageSize: data.pageSize ?? 10,
    totalPages: data.totalPages ?? 1,
    hasNextPage: data.hasNext ?? data.hasNextPage ?? false,
    hasPreviousPage: data.hasPrevious ?? data.hasPreviousPage ?? false,
    hasNext: data.hasNext ?? data.hasNextPage ?? false,
    hasPrevious: data.hasPrevious ?? data.hasPreviousPage ?? false,
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

export const departmentSlice = createSlice({
  name: "departmentSlice",
  initialState,
  reducers: {
    // =========================
    // Filters
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
        code: "",
        categoryId: "",
        linkedToCategoryId: "",
        isUnlinked: "",
        hasManager: "",
        isActive: "",
        createdFrom: "",
        createdTo: "",
        includeManager: true,
        includeCategories: true,
        includeSubDepartments: true,
        includeStatistics: true,
        includeCategory: true,
        orderBy: "nameArabic",
        orderDesc: true,
        page: 1,
        pageSize: 10,
      }
    },

    setCurrentPage: (state, action) => {
      state.filters.page = action.payload
    },

    setPageSize: (state, action) => {
      state.filters.pageSize = action.payload
      state.filters.page = 1
    },

    setCategoryFilter: (state, action) => {
      state.filters.categoryId = action.payload
      state.filters.page = 1
    },

    setLinkedCategoryFilter: (state, action) => {
      state.filters.linkedToCategoryId = action.payload
      state.filters.page = 1
    },

    clearDepartments: (state) => {
      state.departments = []
      state.pagination = null
      state.error = null
    },

    clearError: (state) => {
      state.error = null
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
      state.deletedDepartmentId = null
    },

    resetCreateForm: (state) => {
      state.loadingCreateDepartment = false
      state.createError = null
      state.createSuccess = false
      state.createMessage = ""
    },

    resetUpdateForm: (state) => {
      state.loadingUpdateDepartment = false
      state.updateError = null
      state.updateSuccess = false
      state.updateMessage = ""
    },

    resetDeleteForm: (state) => {
      state.loadingDeleteDepartment = false
      state.deleteError = null
      state.deleteSuccess = false
      state.deleteMessage = ""
      state.deletedDepartmentId = null
    },

    // =========================
    // Single Department
    // =========================
    clearSingleDepartment: (state) => {
      state.selectedDepartment = null
      state.currentDepartment = null
      state.departmentTotals = null
      state.singleDepartmentError = null
    },

    clearSingleDepartmentError: (state) => {
      state.singleDepartmentError = null
    },

    // =========================
    // Department Categories
    // =========================
    clearDepartmentCategories: (state) => {
      state.departmentCategories = []
      state.departmentCategoriesPagination = null
      state.departmentCategoriesError = null
    },

    clearAvailableDepartmentsForCategory: (state) => {
      state.availableDepartmentsForCategory = []
      state.availableDepartmentsForCategoryPagination = null
      state.availableDepartmentsForCategoryError = null
    },

    clearDepartmentsByCategory: (state) => {
      state.departmentsByCategory = []
      state.departmentsByCategoryPagination = null
      state.departmentsByCategoryError = null
    },

    clearLinkDepartmentToCategoryState: (state) => {
      state.loadingLinkDepartmentToCategory = false
      state.linkDepartmentToCategoryError = null
      state.linkDepartmentToCategorySuccess = false
      state.linkDepartmentToCategoryMessage = ""
    },

    clearUnlinkDepartmentFromCategoryState: (state) => {
      state.loadingUnlinkDepartment = false
      state.loadingUnlinkDepartmentFromCategory = false
      state.unlinkDepartmentFromCategoryError = null
      state.unlinkDepartmentFromCategorySuccess = false
      state.unlinkDepartmentFromCategoryMessage = ""
    },

    // =========================
    // Managers
    // =========================
    clearDepartmentManagers: (state) => {
      state.departmentManagers = []
      state.departmentManagersPagination = null
      state.departmentManagersError = null
    },

    clearDepartmentsWithManagers: (state) => {
      state.departmentsWithManagers = []
      state.departmentsWithManagersPagination = null
      state.departmentsWithManagersError = null
    },

    clearAssignManagerState: (state) => {
      state.loadingAssignManager = false
      state.assignManagerError = null
      state.assignManagerSuccess = false
      state.assignManagerMessage = ""
    },

    clearRemoveManagerState: (state) => {
      state.loadingRemoveManager = false
      state.removeManagerError = null
      state.removeManagerSuccess = false
      state.removeManagerMessage = ""
    },

    clearUpdateManagerPermissionState: (state) => {
      state.loadingUpdateManagerPermission = false
      state.updateManagerPermissionError = null
      state.updateManagerPermissionSuccess = false
      state.updateManagerPermissionMessage = ""
    },

    // =========================
    // Month / Calendar / Structure
    // =========================
    clearDepartmentMonthList: (state) => {
      state.departmentMonthList = []
      state.departmentMonthListError = null
    },

    clearDepartmentMonthView: (state) => {
      state.departmentMonthView = null
      state.currentDepartment = null
      state.departmentCategories = []
      state.departmentTotals = null
      state.departmentMonthViewError = null
    },

    clearDepartmentRosterCalendar: (state) => {
      state.departmentRosterCalendar = []
      state.departmentRosterData = []
      state.rosterLookup = {}
      state.departmentRosterCalendarError = null
    },

    clearDepartmentRosterStructure: (state) => {
      state.departmentRosterStructure = null
      state.departmentRosterStructureError = null
      state.departmentRosterData = []
      state.departmentRosterCalendar = []
      state.rosterLookup = {}
    },

    // =========================
    // GeoFence
    // =========================
    clearGeoFences: (state) => {
      state.geofences = []
      state.getDepartmentGeoFencesError = null
    },

    clearSelectedGeoFence: (state) => {
      state.selectedGeoFence = null
      state.getGeoFenceError = null
    },

    clearCreateGeoFenceState: (state) => {
      state.loadingCreateGeoFence = false
      state.createGeoFenceError = null
      state.createGeoFenceSuccess = false
      state.createGeoFenceMessage = ""
    },

    clearEditGeoFenceState: (state) => {
      state.loadingEditGeoFence = false
      state.editGeoFenceError = null
      state.editGeoFenceSuccess = false
      state.editGeoFenceMessage = ""
    },

    clearDeleteGeoFenceState: (state) => {
      state.loadingDeleteGeoFence = false
      state.deleteGeoFenceError = null
      state.deleteGeoFenceSuccess = false
      state.deleteGeoFenceMessage = ""
    },
  },

  extraReducers: (builder) => {
    builder
      // =========================
      // Get Departments
      // =========================
      .addCase(getDepartments.pending, (state) => {
        state.loadingGetDepartments = true
        state.error = null
      })

      .addCase(getDepartments.fulfilled, (state, action) => {
        state.loadingGetDepartments = false
        state.error = null

        state.departments = extractList(action.payload)
        state.pagination = extractPagination(action.payload)
        state.message = extractMessage(action.payload)
        state.timestamp = action.payload?.timestamp || null
      })

      .addCase(getDepartments.rejected, (state, action) => {
        state.loadingGetDepartments = false
        state.departments = []
        state.pagination = null
        state.error = normalizeError(
          action.payload,
          "حدث خطأ في جلب الأقسام"
        )
      })

      // =========================
      // Get Department By Id
      // =========================
      .addCase(getDepartmentById.pending, (state) => {
        state.loadingGetSingleDepartment = true
        state.loadingGetDepartmentById = true
        state.singleDepartmentError = null
      })

      .addCase(getDepartmentById.fulfilled, (state, action) => {
        state.loadingGetSingleDepartment = false
        state.loadingGetDepartmentById = false
        state.selectedDepartment = extractData(action.payload)
        state.currentDepartment = extractData(action.payload)
        state.singleDepartmentError = null
      })

      .addCase(getDepartmentById.rejected, (state, action) => {
        state.loadingGetSingleDepartment = false
        state.loadingGetDepartmentById = false
        state.selectedDepartment = null
        state.currentDepartment = null
        state.singleDepartmentError = normalizeError(
          action.payload,
          "حدث خطأ في جلب بيانات القسم"
        )
      })

      // =========================
      // Create Department
      // =========================
      .addCase(createDepartment.pending, (state) => {
        state.loadingCreateDepartment = true
        state.createError = null
        state.createSuccess = false
        state.createMessage = ""
      })

      .addCase(createDepartment.fulfilled, (state, action) => {
        state.loadingCreateDepartment = false
        state.createSuccess = true
        state.createMessage = extractMessage(
          action.payload,
          "تم إنشاء القسم بنجاح"
        )
        state.createError = null

        const createdDepartment = extractData(action.payload)
        if (createdDepartment?.id) {
          state.departments.unshift(createdDepartment)
        }
      })

      .addCase(createDepartment.rejected, (state, action) => {
        state.loadingCreateDepartment = false
        state.createSuccess = false
        state.createError = normalizeError(
          action.payload,
          "حدث خطأ في إنشاء القسم"
        )
      })

      // =========================
      // Update Department
      // =========================
      .addCase(updateDepartment.pending, (state) => {
        state.loadingUpdateDepartment = true
        state.updateError = null
        state.updateSuccess = false
        state.updateMessage = ""
      })

      .addCase(updateDepartment.fulfilled, (state, action) => {
        state.loadingUpdateDepartment = false
        state.updateSuccess = true
        state.updateMessage = extractMessage(
          action.payload,
          "تم تحديث القسم بنجاح"
        )
        state.updateError = null

        const updatedDepartment = extractData(action.payload)

        if (updatedDepartment?.id) {
          state.selectedDepartment = updatedDepartment
          state.currentDepartment = updatedDepartment
          state.departments = state.departments.map((department) =>
            Number(department.id) === Number(updatedDepartment.id)
              ? updatedDepartment
              : department
          )
        }
      })

      .addCase(updateDepartment.rejected, (state, action) => {
        state.loadingUpdateDepartment = false
        state.updateSuccess = false
        state.updateError = normalizeError(
          action.payload,
          "حدث خطأ في تحديث القسم"
        )
      })

      // =========================
      // Delete Department
      // =========================
      .addCase(deleteDepartment.pending, (state) => {
        state.loadingDeleteDepartment = true
        state.deleteError = null
        state.deleteSuccess = false
        state.deleteMessage = ""
        state.deletedDepartmentId = null
      })

      .addCase(deleteDepartment.fulfilled, (state, action) => {
        state.loadingDeleteDepartment = false
        state.deleteSuccess = true
        state.deleteMessage = extractMessage(
          action.payload,
          "تم حذف القسم بنجاح"
        )
        state.deleteError = null

        const deletedId =
          action.payload?.deletedDepartmentId || action.meta?.arg?.id

        state.deletedDepartmentId = deletedId
        state.departments = state.departments.filter(
          (department) => Number(department.id) !== Number(deletedId)
        )
      })

      .addCase(deleteDepartment.rejected, (state, action) => {
        state.loadingDeleteDepartment = false
        state.deleteSuccess = false
        state.deleteError = normalizeError(
          action.payload,
          "حدث خطأ في حذف القسم"
        )
      })

      // =========================
      // Department Categories
      // =========================
      .addCase(getDepartmentCategories.pending, (state) => {
        state.loadingGetDepartmentCategories = true
        state.departmentCategoriesError = null
      })

      .addCase(getDepartmentCategories.fulfilled, (state, action) => {
        state.loadingGetDepartmentCategories = false
        state.departmentCategories = extractList(action.payload)
        state.departmentCategoriesPagination = extractPagination(action.payload)
        state.departmentCategoriesError = null
      })

      .addCase(getDepartmentCategories.rejected, (state, action) => {
        state.loadingGetDepartmentCategories = false
        state.departmentCategories = []
        state.departmentCategoriesPagination = null
        state.departmentCategoriesError = normalizeError(
          action.payload,
          "حدث خطأ في جلب تخصصات القسم"
        )
      })

      .addCase(getAvailableDepartmentsForCategory.pending, (state) => {
        state.loadingGetAvailableDepartmentsForCategory = true
        state.loadingGetDepartments = true
        state.availableDepartmentsForCategoryError = null
      })

      .addCase(getAvailableDepartmentsForCategory.fulfilled, (state, action) => {
        state.loadingGetAvailableDepartmentsForCategory = false
        state.loadingGetDepartments = false

        state.availableDepartmentsForCategory = extractList(action.payload)
        state.departments = extractList(action.payload)
        state.availableDepartmentsForCategoryPagination = extractPagination(
          action.payload
        )
        state.pagination = extractPagination(action.payload)
        state.availableDepartmentsForCategoryError = null
      })

      .addCase(getAvailableDepartmentsForCategory.rejected, (state, action) => {
        state.loadingGetAvailableDepartmentsForCategory = false
        state.loadingGetDepartments = false

        state.availableDepartmentsForCategory = []
        state.departments = []
        state.availableDepartmentsForCategoryPagination = null
        state.pagination = null
        state.availableDepartmentsForCategoryError = normalizeError(
          action.payload,
          "حدث خطأ في جلب الأقسام المتاحة للتخصص"
        )
        state.error = state.availableDepartmentsForCategoryError
      })

      .addCase(getDepartmentsByCategory.pending, (state) => {
        state.loadingGetDepartmentsByCategory = true
        state.departmentsByCategoryError = null
      })

      .addCase(getDepartmentsByCategory.fulfilled, (state, action) => {
        state.loadingGetDepartmentsByCategory = false
        state.departmentsByCategory = extractList(action.payload)
        state.departmentsByCategoryPagination = extractPagination(action.payload)
        state.departmentsByCategoryError = null
      })

      .addCase(getDepartmentsByCategory.rejected, (state, action) => {
        state.loadingGetDepartmentsByCategory = false
        state.departmentsByCategory = []
        state.departmentsByCategoryPagination = null
        state.departmentsByCategoryError = normalizeError(
          action.payload,
          "حدث خطأ في جلب أقسام التخصص"
        )
      })

      .addCase(linkDepartmentToCategory.pending, (state) => {
        state.loadingLinkDepartmentToCategory = true
        state.linkDepartmentToCategoryError = null
        state.linkDepartmentToCategorySuccess = false
        state.linkDepartmentToCategoryMessage = ""
      })

      .addCase(linkDepartmentToCategory.fulfilled, (state, action) => {
        state.loadingLinkDepartmentToCategory = false
        state.linkDepartmentToCategorySuccess = true
        state.linkDepartmentToCategoryMessage = extractMessage(
          action.payload,
          "تم ربط القسم بالتخصص بنجاح"
        )
        state.linkDepartmentToCategoryError = null

        const departmentId =
          action.payload?.departmentId ||
          action.meta?.arg?.id ||
          action.meta?.arg?.departmentId

        state.availableDepartmentsForCategory =
          state.availableDepartmentsForCategory.filter(
            (department) => Number(department.id) !== Number(departmentId)
          )

        state.departments = state.departments.filter(
          (department) => Number(department.id) !== Number(departmentId)
        )
      })

      .addCase(linkDepartmentToCategory.rejected, (state, action) => {
        state.loadingLinkDepartmentToCategory = false
        state.linkDepartmentToCategorySuccess = false
        state.linkDepartmentToCategoryError = normalizeError(
          action.payload,
          "حدث خطأ في ربط القسم بالتخصص"
        )
      })

      .addCase(unlinkDepartmentFromCategory.pending, (state) => {
        state.loadingUnlinkDepartment = true
        state.loadingUnlinkDepartmentFromCategory = true
        state.unlinkDepartmentFromCategoryError = null
        state.unlinkDepartmentFromCategorySuccess = false
        state.unlinkDepartmentFromCategoryMessage = ""
      })

      .addCase(unlinkDepartmentFromCategory.fulfilled, (state, action) => {
        state.loadingUnlinkDepartment = false
        state.loadingUnlinkDepartmentFromCategory = false
        state.unlinkDepartmentFromCategorySuccess = true
        state.unlinkDepartmentFromCategoryMessage = extractMessage(
          action.payload,
          "تم إلغاء ربط القسم بالتخصص بنجاح"
        )
        state.unlinkDepartmentFromCategoryError = null

        const departmentId =
          action.payload?.departmentId ||
          action.meta?.arg?.id ||
          action.meta?.arg?.departmentId

        state.departmentsByCategory = state.departmentsByCategory.filter(
          (department) => Number(department.id) !== Number(departmentId)
        )
      })

      .addCase(unlinkDepartmentFromCategory.rejected, (state, action) => {
        state.loadingUnlinkDepartment = false
        state.loadingUnlinkDepartmentFromCategory = false
        state.unlinkDepartmentFromCategorySuccess = false
        state.unlinkDepartmentFromCategoryError = normalizeError(
          action.payload,
          "حدث خطأ في إلغاء ربط القسم بالتخصص"
        )
      })

      // =========================
      // Department Managers
      // =========================
      .addCase(getDepartmentManagers.pending, (state) => {
        state.loadingGetDepartmentManagers = true
        state.departmentManagersError = null
      })

      .addCase(getDepartmentManagers.fulfilled, (state, action) => {
        state.loadingGetDepartmentManagers = false
        state.departmentManagers = extractList(action.payload)
        state.departmentManagersPagination = extractPagination(action.payload)
        state.departmentManagersError = null
      })

      .addCase(getDepartmentManagers.rejected, (state, action) => {
        state.loadingGetDepartmentManagers = false
        state.departmentManagers = []
        state.departmentManagersPagination = null
        state.departmentManagersError = normalizeError(
          action.payload,
          "حدث خطأ في جلب مديري الأقسام"
        )
      })

      .addCase(getDepartmentsWithManagers.pending, (state) => {
        state.loadingGetDepartmentsWithManagers = true
        state.departmentsWithManagersError = null
      })

      .addCase(getDepartmentsWithManagers.fulfilled, (state, action) => {
        state.loadingGetDepartmentsWithManagers = false
        state.departmentsWithManagers = extractList(action.payload)
        state.departmentsWithManagersPagination =
          extractPagination(action.payload)
        state.departmentsWithManagersError = null
      })

      .addCase(getDepartmentsWithManagers.rejected, (state, action) => {
        state.loadingGetDepartmentsWithManagers = false
        state.departmentsWithManagers = []
        state.departmentsWithManagersPagination = null
        state.departmentsWithManagersError = normalizeError(
          action.payload,
          "حدث خطأ في جلب الأقسام التي لها مديرين"
        )
      })

      .addCase(assignDepManager.pending, (state) => {
        state.loadingAssignManager = true
        state.assignManagerError = null
        state.assignManagerSuccess = false
        state.assignManagerMessage = ""
      })

      .addCase(assignDepManager.fulfilled, (state, action) => {
        state.loadingAssignManager = false
        state.assignManagerSuccess = true
        state.assignManagerMessage = extractMessage(
          action.payload,
          "تم تعيين مدير القسم بنجاح"
        )
        state.assignManagerError = null
      })

      .addCase(assignDepManager.rejected, (state, action) => {
        state.loadingAssignManager = false
        state.assignManagerSuccess = false
        state.assignManagerError = normalizeError(
          action.payload,
          "حدث خطأ في تعيين مدير القسم"
        )
      })

      .addCase(removeDepManager.pending, (state) => {
        state.loadingRemoveManager = true
        state.removeManagerError = null
        state.removeManagerSuccess = false
        state.removeManagerMessage = ""
      })

      .addCase(removeDepManager.fulfilled, (state, action) => {
        state.loadingRemoveManager = false
        state.removeManagerSuccess = true
        state.removeManagerMessage = extractMessage(
          action.payload,
          "تم إزالة مدير القسم بنجاح"
        )
        state.removeManagerError = null

        if (state.selectedDepartment?.manager) {
          state.selectedDepartment.manager = null
        }

        if (state.selectedDepartment?.departmentManager) {
          state.selectedDepartment.departmentManager = null
        }

        if (state.selectedDepartment) {
          state.selectedDepartment.hasManager = false
        }
      })

      .addCase(removeDepManager.rejected, (state, action) => {
        state.loadingRemoveManager = false
        state.removeManagerSuccess = false
        state.removeManagerError = normalizeError(
          action.payload,
          "حدث خطأ في إزالة مدير القسم"
        )
      })

      .addCase(updateManagerPermission.pending, (state) => {
        state.loadingUpdateManagerPermission = true
        state.updateManagerPermissionError = null
        state.updateManagerPermissionSuccess = false
        state.updateManagerPermissionMessage = ""
      })

      .addCase(updateManagerPermission.fulfilled, (state, action) => {
        state.loadingUpdateManagerPermission = false
        state.updateManagerPermissionSuccess = true
        state.updateManagerPermissionMessage = extractMessage(
          action.payload,
          "تم تحديث صلاحيات المدير بنجاح"
        )
        state.updateManagerPermissionError = null
      })

      .addCase(updateManagerPermission.rejected, (state, action) => {
        state.loadingUpdateManagerPermission = false
        state.updateManagerPermissionSuccess = false
        state.updateManagerPermissionError = normalizeError(
          action.payload,
          "حدث خطأ في تحديث صلاحيات مدير القسم"
        )
      })

      // =========================
      // Month List
      // =========================
      .addCase(getDepartmentMonthList.pending, (state) => {
        state.loadingGetDepartmentMonthList = true
        state.departmentMonthListError = null
      })

      .addCase(getDepartmentMonthList.fulfilled, (state, action) => {
        state.loadingGetDepartmentMonthList = false
        state.departmentMonthList = extractList(action.payload)
        state.departmentMonthListError = null
      })

      .addCase(getDepartmentMonthList.rejected, (state, action) => {
        state.loadingGetDepartmentMonthList = false
        state.departmentMonthList = []
        state.departmentMonthListError = normalizeError(
          action.payload,
          "حدث خطأ في جلب شهور القسم"
        )
      })

      // =========================
      // Month View
      // =========================
      .addCase(getDepartmentMonthView.pending, (state) => {
        state.loadingGetDepartmentMonthView = true
        state.departmentMonthViewError = null
      })

      .addCase(getDepartmentMonthView.fulfilled, (state, action) => {
        state.loadingGetDepartmentMonthView = false

        const data = extractData(action.payload)

        state.departmentMonthView = data
        state.currentDepartment = data
          ? {
              id: data.departmentId,
              nameArabic: data.departmentNameAr,
              nameAr: data.departmentNameAr,
              nameEnglish: data.departmentNameEn,
              nameEn: data.departmentNameEn,
            }
          : null

        state.departmentCategories = Array.isArray(data?.categories)
          ? data.categories
          : []
        state.departmentTotals = data?.totals || null
        state.departmentMonthViewError = null
      })

      .addCase(getDepartmentMonthView.rejected, (state, action) => {
        state.loadingGetDepartmentMonthView = false
        state.departmentMonthView = null
        state.currentDepartment = null
        state.departmentCategories = []
        state.departmentTotals = null
        state.departmentMonthViewError = normalizeError(
          action.payload,
          "حدث خطأ في جلب عرض الشهر للقسم"
        )
        state.error = state.departmentMonthViewError
      })

      // =========================
      // Roster Calendar - multi-roster endpoint
      // =========================
      .addCase(getDepartmentRosterCalendar.pending, (state) => {
        state.loadingGetDepartmentRosterCalendar = true
        state.loadinGetDepartmentCalender = true
        state.departmentRosterCalendarError = null
      })

      .addCase(getDepartmentRosterCalendar.fulfilled, (state, action) => {
        state.loadingGetDepartmentRosterCalendar = false
        state.loadinGetDepartmentCalender = false

        const data = extractData(action.payload)
        const list = Array.isArray(data) ? data : data?.items || data?.data || []

        state.departmentRosterCalendar = list
        state.departmentRosterData = list
        state.rosterLookup = data?.rosterLookup || {}
        state.departmentRosterCalendarError = null
      })

      .addCase(getDepartmentRosterCalendar.rejected, (state, action) => {
        state.loadingGetDepartmentRosterCalendar = false
        state.loadinGetDepartmentCalender = false
        state.departmentRosterCalendar = []
        state.departmentRosterData = []
        state.rosterLookup = {}
        state.departmentRosterCalendarError = normalizeError(
          action.payload,
          "حدث خطأ في جلب تقويم القسم"
        )
        state.error = state.departmentRosterCalendarError
      })

      // =========================
      // Roster Structure - recommended for one roster
      // =========================
      .addCase(getDepartmentRosterStructure.pending, (state) => {
        state.loadingGetDepartmentRosterStructure = true
        state.loadinGetDepartmentCalender = true
        state.departmentRosterStructureError = null
      })

      .addCase(getDepartmentRosterStructure.fulfilled, (state, action) => {
        state.loadingGetDepartmentRosterStructure = false
        state.loadinGetDepartmentCalender = false

        const data = extractData(action.payload)

        state.departmentRosterStructure = data || null
        state.departmentRosterStructureError = null

        if (data) {
          state.departmentRosterData = [data]
          state.departmentRosterCalendar = [data]
          state.rosterLookup = {
            [data.rosterId]: {
              title: data.rosterTitle,
              startDate: data.startDate,
              endDate: data.endDate,
            },
          }
        } else {
          state.departmentRosterData = []
          state.departmentRosterCalendar = []
          state.rosterLookup = {}
        }
      })

      .addCase(getDepartmentRosterStructure.rejected, (state, action) => {
        state.loadingGetDepartmentRosterStructure = false
        state.loadinGetDepartmentCalender = false
        state.departmentRosterStructure = null
        state.departmentRosterData = []
        state.departmentRosterCalendar = []
        state.rosterLookup = {}
        state.departmentRosterStructureError = normalizeError(
          action.payload,
          "حدث خطأ في جلب هيكل روستر القسم"
        )
        state.error = state.departmentRosterStructureError
      })

      // =========================
      // GeoFence Create
      // =========================
      .addCase(createGeoFence.pending, (state) => {
        state.loadingCreateGeoFence = true
        state.createGeoFenceError = null
        state.createGeoFenceSuccess = false
        state.createGeoFenceMessage = ""
      })

      .addCase(createGeoFence.fulfilled, (state, action) => {
        state.loadingCreateGeoFence = false
        state.createGeoFenceSuccess = true
        state.createGeoFenceMessage = extractMessage(
          action.payload,
          "تم إنشاء نطاق الحضور بنجاح"
        )
        state.createGeoFenceError = null

        const createdFence = extractData(action.payload)
        if (createdFence?.id) {
          state.geofences.unshift(createdFence)
        }
      })

      .addCase(createGeoFence.rejected, (state, action) => {
        state.loadingCreateGeoFence = false
        state.createGeoFenceSuccess = false
        state.createGeoFenceError = normalizeError(
          action.payload,
          "حدث خطأ في إنشاء نطاق الحضور"
        )
      })

      // =========================
      // GeoFence List
      // =========================
      .addCase(getDepartmentGeoFences.pending, (state) => {
        state.loadingGetDepartmentGeofences = true
        state.loadingGetDepartmentGeoFences = true
        state.getDepartmentGeoFencesError = null
      })

      .addCase(getDepartmentGeoFences.fulfilled, (state, action) => {
        state.loadingGetDepartmentGeofences = false
        state.loadingGetDepartmentGeoFences = false
        state.geofences = extractList(action.payload)
        state.getDepartmentGeoFencesError = null
      })

      .addCase(getDepartmentGeoFences.rejected, (state, action) => {
        state.loadingGetDepartmentGeofences = false
        state.loadingGetDepartmentGeoFences = false
        state.geofences = []
        state.getDepartmentGeoFencesError = normalizeError(
          action.payload,
          "حدث خطأ في جلب نطاقات الحضور"
        )
      })

      // =========================
      // GeoFence Single
      // =========================
      .addCase(getGeoFence.pending, (state) => {
        state.loadingGetGeoFence = true
        state.getGeoFenceError = null
      })

      .addCase(getGeoFence.fulfilled, (state, action) => {
        state.loadingGetGeoFence = false
        state.selectedGeoFence = extractData(action.payload)
        state.getGeoFenceError = null
      })

      .addCase(getGeoFence.rejected, (state, action) => {
        state.loadingGetGeoFence = false
        state.selectedGeoFence = null
        state.getGeoFenceError = normalizeError(
          action.payload,
          "حدث خطأ في جلب نطاق الحضور"
        )
      })

      // =========================
      // GeoFence Edit
      // =========================
      .addCase(editGeoFence.pending, (state) => {
        state.loadingEditGeoFence = true
        state.editGeoFenceError = null
        state.editGeoFenceSuccess = false
        state.editGeoFenceMessage = ""
      })

      .addCase(editGeoFence.fulfilled, (state, action) => {
        state.loadingEditGeoFence = false
        state.editGeoFenceSuccess = true
        state.editGeoFenceMessage = extractMessage(
          action.payload,
          "تم تعديل نطاق الحضور بنجاح"
        )
        state.editGeoFenceError = null

        const updatedFence = extractData(action.payload)

        if (updatedFence?.id) {
          state.selectedGeoFence = updatedFence
          state.geofences = state.geofences.map((fence) =>
            Number(fence.id) === Number(updatedFence.id)
              ? updatedFence
              : fence
          )
        }
      })

      .addCase(editGeoFence.rejected, (state, action) => {
        state.loadingEditGeoFence = false
        state.editGeoFenceSuccess = false
        state.editGeoFenceError = normalizeError(
          action.payload,
          "حدث خطأ في تعديل نطاق الحضور"
        )
      })

      // =========================
      // GeoFence Delete
      // =========================
      .addCase(deleteGeoFence.pending, (state) => {
        state.loadingDeleteGeoFence = true
        state.deleteGeoFenceError = null
        state.deleteGeoFenceSuccess = false
        state.deleteGeoFenceMessage = ""
      })

      .addCase(deleteGeoFence.fulfilled, (state, action) => {
        state.loadingDeleteGeoFence = false
        state.deleteGeoFenceSuccess = true
        state.deleteGeoFenceMessage = extractMessage(
          action.payload,
          "تم حذف نطاق الحضور بنجاح"
        )
        state.deleteGeoFenceError = null

        const fenceId = action.payload?.fenceId || action.meta?.arg?.fenceId

        state.geofences = state.geofences.filter(
          (fence) => Number(fence.id) !== Number(fenceId)
        )
      })

      .addCase(deleteGeoFence.rejected, (state, action) => {
        state.loadingDeleteGeoFence = false
        state.deleteGeoFenceSuccess = false
        state.deleteGeoFenceError = normalizeError(
          action.payload,
          "حدث خطأ في حذف نطاق الحضور"
        )
      })
  },
})

export const {
  // Filters
  setFilters,
  clearFilters,
  setCurrentPage,
  setPageSize,
  setCategoryFilter,
  setLinkedCategoryFilter,

  // Department data
  clearDepartments,
  clearError,

  // Create / update / delete
  clearCreateSuccess,
  clearUpdateSuccess,
  clearDeleteSuccess,
  resetCreateForm,
  resetUpdateForm,
  resetDeleteForm,

  // Single department
  clearSingleDepartment,
  clearSingleDepartmentError,

  // Department categories
  clearDepartmentCategories,
  clearAvailableDepartmentsForCategory,
  clearDepartmentsByCategory,
  clearLinkDepartmentToCategoryState,
  clearUnlinkDepartmentFromCategoryState,

  // Managers
  clearDepartmentManagers,
  clearDepartmentsWithManagers,
  clearAssignManagerState,
  clearRemoveManagerState,
  clearUpdateManagerPermissionState,

  // Month / calendar / structure
  clearDepartmentMonthList,
  clearDepartmentMonthView,
  clearDepartmentRosterCalendar,
  clearDepartmentRosterStructure,

  // GeoFence
  clearGeoFences,
  clearSelectedGeoFence,
  clearCreateGeoFenceState,
  clearEditGeoFenceState,
  clearDeleteGeoFenceState,
} = departmentSlice.actions

export default departmentSlice.reducer

export {
  createDepartment,
  getDepartments,
  getDepartmentById,
  updateDepartment,
  deleteDepartment,

  getDepartmentCategories,
  getAvailableDepartmentsForCategory,
  getDepartmentsByCategory,
  linkDepartmentToCategory,
  unlinkDepartmentFromCategory,

  getDepartmentManagers,
  getDepartmentsWithManagers,
  updateManagerPermission,
  removeDepManager,
  assignDepManager,

  getDepartmentMonthList,
  getDepartmentMonthView,
  getDepartmentRosterCalendar,
  getDepartmentRosterStructure,

  createGeoFence,
  getDepartmentGeoFences,
  getGeoFence,
  editGeoFence,
  deleteGeoFence,
}