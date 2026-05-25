// src/state/slices/rosterManagement.js
import { createSlice } from "@reduxjs/toolkit"

// ===================================================================
// IMPORT ALL ACTIONS FROM ACTIONS FILE
// ===================================================================
import {
  // Phase 1: Basic Structure
  createBasicRoster,

  // Phase 2: Department Shifts
  addDepartmentShifts,
  getDepartmentShifts,
  deleteDepartmentShift,

  // Phase 3: Contracting Requirements

  // Phase 4: Working Hours
  addWorkingHours,
  getWorkingHours,

  // Query Operations
  getRosterList,
  getRostersPaged,
  getRosterById,

  // Update & Management
  updateRosterBasicInfo,

  // Export & Additional
  updateRosterStatus,
  getRosterDepartments,
  getShiftContractingTypes,
  addShiftContractingTypes,
  deleteShiftContractingType,
  updateShiftContractingType,
  getWorkingHour,
  updateWorkingHour,

  // assignment
  assignDoctorToShift,
  unassignDoctorFromShift,
  getAvailableDoctorsForShift,
  getAvailableDoctorsForDate,
  getDoctorSchedule,
  getAssignedDoctorsSummary,
  getDoctorsForDate,
  getDaySummary,

  // NEW: Doctor Requests Workflow
  submitDoctorRequest,
  approveDoctorRequest,
  rejectDoctorRequest,
  addRosterDepartment,
  getRosterByCategory,
  deleteRoster,
  getDoctorsPerRoster,
  rejectRequest,
  approveRequest,
  getDoctorsRequests,
  autoAcceptRequests,
  getRosterTree,

  getRosterAttendanceReport,
  getRosterAttendanceSummary,
} from "../act/actRosterManagement"
import i18next from "i18next"

// ===================================================================
// INITIAL STATE (الحالة الأولية)
// ===================================================================

const initialState = {

  // Additional
  rosterAttendanceReport: null,
  rosterAttendanceSummary: null,
  
  // ===== ROSTER DATA (بيانات الروستر) =====
  rosters: [],
  selectedRoster: null,
  rosterList: [], // للقائمة المبسطة
  rosterTree: {
    departments: [],
  },

  doctorRequests: {
    data: null,
    filteredRequests: [],
    currentStatus: 1, // Default to Pending
  },

  // ===== DEPARTMENT SHIFTS (شفتات الأقسام) =====

  rosterDepartments: [], // Add this line

  departmentShifts: [],
  selectedDepartmentShifts: null,

  // ===== CONTRACTING DATA (بيانات التعاقدات) =====
  contractingRequirements: [],
  availableContractingTypes: [],
  doctorsPerRoster: [],
  contractingAnalytics: null,
  contractingValidation: null,

  // ===== NEW: ROSTER ASSIGNMENT DATA (بيانات تعيين الروستر) =====
  availableDoctorsForShift: [],
  availableDoctorsForDate: {},
  doctorSchedule: null,
  assignedDoctorsSummary: null,
  doctorsForDate: null,
  daySummary: null,

  // ===== NEW: DOCTOR REQUESTS DATA (بيانات طلبات الدكاترة) =====
  doctorRequestsForRoster: [],
  pendingRequests: [],

  // ===== WORKING HOURS DATA (بيانات ساعات العمل) =====
  workingHours: [],
  workingHour: null,
  workingHoursOverview: null,
  doctorRequirements: [],

  // ===== ANALYTICS & REPORTS (التحليلات والتقارير) =====
  rosterAnalytics: null,
  doctorWorkloads: [],
  departmentCoverage: [],
  departmentSchedule: null,

  // ===== SEARCH & ASSISTANCE (البحث والمساعدة) =====
  colleagueSearchResults: [],

  // ===== PAGINATION (ترقيم الصفحات) =====
  pagination: {
    currentPage: 1,
    pageSize: 10,
    totalPages: 0,
    totalItems: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  },
  shiftContractingTypes: {},
  // ===== LOADING STATES (حالات التحميل) =====
  loading: {

    rosterAttendanceReport: false,
    rosterAttendanceSummary: false,
    // Phase Operations
    createBasic: false,
    addShifts: false,
    getDoctorsRequests: false,
    approveRequest: false,
    rejectRequest: false,
    addContracting: false,
    addWorkingHours: false,
    getRosterTree: false,
    getShiftContractingTypes: false,
    addShiftContractingTypes: false,
    updateShiftContractingType: false,
    deleteShiftContractingType: false,
    applyTemplate: false,
    markReady: false,
    publish: false,
    close: false,
    assign: false,
    addRosterDepartment: false,

    assignDoctor: false,
    unassignDoctor: false,
    availableDoctors: false,
    doctorSchedule: false,
    assignedDoctors: false,
    doctorsForDate: false,
    daySummary: false,

    // NEW: Doctor Requests Loading States
    submitRequest: false,
    processRequest: false,
    doctorRequests: false,

    // CRUD Operations
    fetch: false,
    update: false,
    delete: false,
    export: false,

    // Analytics & Reports
    analytics: false,
    workloads: false,
    coverage: false,
    validation: false,

    // Search Operations
    search: false,
    schedule: false,

    
  },

  // ===== SUCCESS STATES (حالات النجاح) =====
  success: {
    createBasic: false,
    addShifts: false,
    addWorkingHours: false,
    addContracting: false,
    applyTemplate: false,
    markReady: false,
    publish: false,
    close: false,
    assign: false,
    update: false,
    assignDoctor: false,
    unassignDoctor: false,
    submitRequest: false,
    processRequest: false,
    delete: false,
    export: false,
    archive: false,
    duplicate: false,
  },

  // ===== ERROR STATES (حالات الأخطاء) =====
  errors: {
    rosterAttendanceReport: null,
    rosterAttendanceSummary: null,
    general: null,
    rosterTree: null,
    workingHours: null,
    create: null,
    update: null,
    assign: null,
    export: null,
    analytics: null,
    search: null,
    validation: null,
    shifts: null,
    assignDoctor: null,
    unassignDoctor: null,
    availableDoctors: null,
    doctorSchedule: null,
    doctorRequests: null,
    processRequest: null,
    contracting: null,
  },

  // ===== UI STATE (حالة واجهة المستخدم) =====
  ui: {
    currentPhase: 1, // 1-7 representing phases
    activeTab: "overview",
    viewMode: "grid", // grid, list, calendar
    selectedDepartmentId: null,
    selectedDoctorId: null,
    selectedDate: null,
    selectedShiftId: null,
    filters: {
      categoryId: null,
      status: null,
      page: 1,
      month: null,
      year: null,
      departmentId: null,
      search: null,
    },
  },
}

// ===================================================================
// SLICE DEFINITION (تعريف الـ Slice)
// ===================================================================

const rosterManagementSlice = createSlice({
  name: "rosterManagement",
  initialState,
  reducers: {


    clearRosterAttendanceReport: (state) => {
      state.rosterAttendanceReport = null
      state.rosterAttendanceSummary = null
      state.loading.rosterAttendanceReport = false
      state.loading.rosterAttendanceSummary = false
      state.errors.rosterAttendanceReport = null
      state.errors.rosterAttendanceSummary = null
    },

    // ===== ERROR MANAGEMENT (إدارة الأخطاء) =====
    clearAllErrors: (state) => {
      Object.keys(state.errors).forEach((key) => {
        state.errors[key] = null
      })
    },
    clearRosterDepartments: (state) => {
      state.rosterDepartments = []
    },
    clearSpecificError: (state, action) => {
      const errorType = action.payload
      if (state.errors[errorType] !== undefined) {
        state.errors[errorType] = null
      }
    },

    setCurrentPage: (state, action) => {
      state.ui.filters.page = action.payload
    },
    setPageSize: (state, action) => {
      state.ui.filters.pageSize = action.payload
      state.ui.filters.page = 1
    },

    // ===== SUCCESS STATE MANAGEMENT (إدارة حالات النجاح) =====
    clearAllSuccess: (state) => {
      Object.keys(state.success).forEach((key) => {
        state.success[key] = false
      })
    },

    clearSpecificSuccess: (state, action) => {
      const successType = action.payload
      if (state.success[successType] !== undefined) {
        state.success[successType] = false
      }
    },

    // ===== DATA MANAGEMENT (إدارة البيانات) =====
    clearSelectedRoster: (state) => {
      state.selectedRoster = null
      state.rosterAnalytics = null
      state.workingHoursOverview = null
      state.contractingValidation = null
    },

    clearAnalyticsData: (state) => {
      state.rosterAnalytics = null
      state.doctorWorkloads = []
      state.departmentCoverage = []
      state.contractingAnalytics = null
    },

    clearDepartmentShifts: (state) => {
      state.departmentShifts = []
      state.selectedDepartmentShifts = null
    },

    clearContractingData: (state) => {
      state.contractingRequirements = []
      state.contractingValidation = null
      state.contractingAnalytics = null
    },

    clearWorkingHoursData: (state) => {
      state.workingHours = []
      state.workingHoursOverview = null
      state.doctorRequirements = []
    },

    clearSearchResults: (state) => {
      state.colleagueSearchResults = []
    },

    // ===== PAGINATION MANAGEMENT (إدارة ترقيم الصفحات) =====
    setPagination: (state, action) => {
      state.pagination = { ...state.pagination, ...action.payload }
    },

    resetPagination: (state) => {
      state.pagination = {
        currentPage: 1,
        pageSize: 10,
        totalPages: 0,
        totalItems: 0,
        hasNextPage: false,
        hasPreviousPage: false,
      }
    },

    // ===== UI STATE MANAGEMENT (إدارة حالة واجهة المستخدم) =====
    setCurrentPhase: (state, action) => {
      state.ui.currentPhase = action.payload
    },

    setActiveTab: (state, action) => {
      state.ui.activeTab = action.payload
    },

    setViewMode: (state, action) => {
      state.ui.viewMode = action.payload
    },

    setSelectedDepartmentId: (state, action) => {
      state.ui.selectedDepartmentId = action.payload
    },

    setSelectedShiftId: (state, action) => {
      state.ui.selectedShiftId = action.payload
    },

    setFilters: (state, action) => {
      state.ui.filters = { ...state.ui.filters, ...action.payload }
    },

    clearFilters: (state) => {
      state.ui.filters = {
        categoryId: null,
        status: null,
        month: null,
        year: null,
        departmentId: null,
      }
    },

    // ===== ROSTER OPERATIONS (عمليات الروستر) =====
    updateRosterInList: (state, action) => {
      const { rosterId, updates } = action.payload

      // Update in main rosters array
      const rosterIndex = state.rosters.findIndex((r) => r.id === rosterId)
      if (rosterIndex !== -1) {
        state.rosters[rosterIndex] = {
          ...state.rosters[rosterIndex],
          ...updates,
        }
      }

      // Update selected roster if it matches
      if (state.selectedRoster && state.selectedRoster.id === rosterId) {
        state.selectedRoster = { ...state.selectedRoster, ...updates }
      }
    },

    removeRosterFromList: (state, action) => {
      const rosterId = action.payload
      state.rosters = state.rosters.filter((r) => r.id !== rosterId)

      if (state.selectedRoster && state.selectedRoster.id === rosterId) {
        state.selectedRoster = null
      }
    },

    // ===== DEPARTMENT SHIFTS OPERATIONS (عمليات شفتات الأقسام) =====
    addShiftToList: (state, action) => {
      state.departmentShifts.push(action.payload)
    },

    removeShiftFromList: (state, action) => {
      const shiftId = action.payload
      state.departmentShifts = state.departmentShifts.filter(
        (shift) => shift.id !== shiftId
      )
    },

    updateShiftInList: (state, action) => {
      const { shiftId, updates } = action.payload
      const shiftIndex = state.departmentShifts.findIndex(
        (shift) => shift.id === shiftId
      )
      if (shiftIndex !== -1) {
        state.departmentShifts[shiftIndex] = {
          ...state.departmentShifts[shiftIndex],
          ...updates,
        }
      }
    },

    // NEW: Selected Doctor and Date Management
    setSelectedDoctorId: (state, action) => {
      state.ui.selectedDoctorId = action.payload
    },

    setSelectedDate: (state, action) => {
      state.ui.selectedDate = action.payload
    },

    // NEW: Roster Assignment Data Management
    clearRosterAssignmentData: (state) => {
      state.availableDoctorsForShift = []
      state.availableDoctorsForDate = {}
      state.doctorSchedule = null
      state.assignedDoctorsSummary = null
      state.doctorsForDate = null
      state.daySummary = null
    },

    clearDoctorRequestsData: (state) => {
      state.doctorRequestsForRoster = []
      state.doctorRequests = []
      state.pendingRequests = []
    },

    // NEW: Updated clearSelectedRoster to include new data
    clearSelectedRoster: (state) => {
      state.selectedRoster = null
      state.rosterAnalytics = null
      state.workingHoursOverview = null
      state.contractingValidation = null
      // NEW: Clear assignment data
      state.doctorSchedule = null
      state.daySummary = null
      state.assignedDoctorsSummary = null
    },

    // NEW: Roster Assignment Operations
    updateDoctorAssignment: (state, action) => {
      const { scheduleId, doctorInfo, workingHoursId } = action.payload

      // Update in doctorsForDate if available
      if (state.doctorsForDate?.shifts) {
        state.doctorsForDate.shifts.forEach((shift) => {
          if (shift.workingHoursId === workingHoursId) {
            const existingDoctor = shift.doctors.find(
              (d) => d.scheduleId === scheduleId
            )
            if (existingDoctor) {
              Object.assign(existingDoctor, doctorInfo)
            } else {
              shift.doctors.push({ scheduleId, ...doctorInfo })
            }
            shift.assignedDoctors = shift.doctors.length
            shift.remainingSlots = shift.requiredDoctors - shift.assignedDoctors
            shift.fillPercentage =
              (shift.assignedDoctors / shift.requiredDoctors) * 100
          }
        })
      }
    },

    removeDoctorAssignment: (state, action) => {
      const { scheduleId, workingHoursId } = action.payload

      // Remove from doctorsForDate if available
      if (state.doctorsForDate?.shifts) {
        state.doctorsForDate.shifts.forEach((shift) => {
          if (shift.workingHoursId === workingHoursId) {
            shift.doctors = shift.doctors.filter(
              (d) => d.scheduleId !== scheduleId
            )
            shift.assignedDoctors = shift.doctors.length
            shift.remainingSlots = shift.requiredDoctors - shift.assignedDoctors
            shift.fillPercentage =
              (shift.assignedDoctors / shift.requiredDoctors) * 100
          }
        })
      }
    },
  },

  extraReducers: (builder) => {

    // ===================================================================
// ROSTER ATTENDANCE REPORT
// ===================================================================
builder
  .addCase(getRosterAttendanceReport.pending, (state) => {
    state.loading.rosterAttendanceReport = true
    state.errors.rosterAttendanceReport = null
  })
  .addCase(getRosterAttendanceReport.fulfilled, (state, action) => {
    state.loading.rosterAttendanceReport = false
    state.rosterAttendanceReport = action.payload || null
    state.errors.rosterAttendanceReport = null
  })
  .addCase(getRosterAttendanceReport.rejected, (state, action) => {
    state.loading.rosterAttendanceReport = false
    state.errors.rosterAttendanceReport =
      action.payload || "Failed to load roster attendance report"
  })

// ===================================================================
// ROSTER ATTENDANCE SUMMARY
// ===================================================================
builder
  .addCase(getRosterAttendanceSummary.pending, (state) => {
    state.loading.rosterAttendanceSummary = true
    state.errors.rosterAttendanceSummary = null
  })
  .addCase(getRosterAttendanceSummary.fulfilled, (state, action) => {
    state.loading.rosterAttendanceSummary = false
    state.rosterAttendanceSummary = action.payload || null
    state.errors.rosterAttendanceSummary = null
  })
  .addCase(getRosterAttendanceSummary.rejected, (state, action) => {
    state.loading.rosterAttendanceSummary = false
    state.errors.rosterAttendanceSummary =
      action.payload || "Failed to load roster attendance summary"
  })

    // ===================================================================
    // PHASE 1: BASIC STRUCTURE (المرحلة 1: الهيكل الأساسي)
    // ===================================================================

    // Create Basic Roster
    builder
      .addCase(createBasicRoster.pending, (state) => {
        state.loading.createBasic = true
        state.errors.create = null
        state.success.createBasic = false
      })
      .addCase(createBasicRoster.fulfilled, (state, action) => {
        state.loading.createBasic = false
        state.success.createBasic = true
        state.ui.currentPhase = 2 // Move to next phase
        console.log("action.payload", action.payload)
        localStorage.setItem("rosterId", action.payload.data.rosterId)

        if (action.payload?.data) {
          state.rosters.unshift(action.payload.data)
          state.selectedRoster = action.payload.data
        }
      })
      .addCase(createBasicRoster.rejected, (state, action) => {
        state.loading.createBasic = false
        state.errors.create = action.payload
      })

    builder
      .addCase(getRosterDepartments.pending, (state) => {
        state.loading.fetch = true
        state.errors.general = null
      })
      .addCase(getRosterDepartments.fulfilled, (state, action) => {
        state.loading.fetch = false
        state.rosterDepartments = action.payload?.data || []
      })
      .addCase(getRosterDepartments.rejected, (state, action) => {
        state.loading.fetch = false
        state.errors.general =
          action.payload || i18next.t("roster.error.fetchFailed")
      })

    // ===================================================================
    // PHASE 2: DEPARTMENT SHIFTS (المرحلة 2: شفتات الأقسام)
    // ===================================================================

    // Add Department Shifts
    builder
      .addCase(addDepartmentShifts.pending, (state) => {
        state.loading.addShifts = true
        state.errors.shifts = null
        state.success.addShifts = false
      })
      .addCase(addDepartmentShifts.fulfilled, (state, action) => {
        state.loading.addShifts = false
        state.success.addShifts = true

        if (action.payload?.data) {
          // Add new shifts to the list
          if (Array.isArray(action.payload.data)) {
            state.departmentShifts.push(...action.payload.data)
          } else {
            state.departmentShifts.push(action.payload.data)
          }
        }
      })
      .addCase(addDepartmentShifts.rejected, (state, action) => {
        state.loading.addShifts = false
        state.errors.shifts = action.payload
      })
    builder
      .addCase(updateRosterStatus.pending, (state) => {
        state.loading.update = true
      })
      .addCase(updateRosterStatus.fulfilled, (state, action) => {
        state.loading.update = false
      })
      .addCase(updateRosterStatus.rejected, (state, action) => {
        state.loading.update = false
      })

    // Get Department Shifts
    builder
      .addCase(getDepartmentShifts.pending, (state) => {
        state.loading.fetch = true
        state.errors.shifts = null
      })
      .addCase(getDepartmentShifts.fulfilled, (state, action) => {
        state.loading.fetch = false
        state.selectedDepartmentShifts = action.payload?.data || null
      })
      .addCase(getDepartmentShifts.rejected, (state, action) => {
        state.loading.fetch = false
        state.errors.shifts = action.payload
      })

    // Delete Department Shift
    builder
      .addCase(deleteDepartmentShift.pending, (state) => {
        state.loading.delete = true
        state.errors.shifts = null
      })
      .addCase(deleteDepartmentShift.fulfilled, (state, action) => {
        state.loading.delete = false
        console.log("action.payload", action.payload)
        console.log("action.meta.args", action.meta.arg)
        state.selectedDepartmentShifts = state.selectedDepartmentShifts.filter(
          (dep) => dep.id !== action.meta.arg
        )
      })
      .addCase(deleteDepartmentShift.rejected, (state, action) => {
        state.loading.delete = false
        state.errors.shifts = action.payload
      })
    builder
      .addCase(deleteRoster.pending, (state) => {
        state.loading.delete = true
        state.errors.shifts = null
      })
      .addCase(deleteRoster.fulfilled, (state, action) => {
        state.loading.delete = false
        const rosterId = action.payload.rosterId
        state.rosterList = state.rosterList.filter(
          (roster) => roster.id !== rosterId
        )
      })
      .addCase(deleteRoster.rejected, (state, action) => {
        state.loading.delete = false
        state.errors.shifts = action.payload
      })

    builder
      .addCase(getDoctorsPerRoster.pending, (state) => {
        state.loading.fetch = true
        state.errors.general = null
      })
      .addCase(getDoctorsPerRoster.fulfilled, (state, action) => {
        state.loading.fetch = false
        state.doctorsPerRoster = action.payload?.data || []
      })
      .addCase(getDoctorsPerRoster.rejected, (state, action) => {
        state.loading.fetch = false
        state.errors.general =
          action.payload || i18next.t("roster.error.fetchFailed")
      })

    // ===================================================================
    // PHASE 3: CONTRACTING REQUIREMENTS (المرحلة 3: متطلبات التعاقد)
    // ===================================================================

    builder
      .addCase(getShiftContractingTypes.pending, (state) => {
        state.loading.getShiftContractingTypes = true
      })
      .addCase(getShiftContractingTypes.fulfilled, (state, action) => {
        state.loading.getShiftContractingTypes = false
        const response = action.payload
        if (response.success) {
          const shiftId = action.meta.arg.departmentShiftId
          state.shiftContractingTypes[shiftId] = response.data
        }
      })
      .addCase(getShiftContractingTypes.rejected, (state, action) => {
        state.loading.getShiftContractingTypes = false
        // Handle error
      })

      .addCase(addShiftContractingTypes.pending, (state) => {
        state.loading.addShiftContractingTypes = true
      })
      .addCase(addShiftContractingTypes.fulfilled, (state, action) => {
        state.loading.addShiftContractingTypes = false
        // Success handled in component
      })
      .addCase(addShiftContractingTypes.rejected, (state, action) => {
        state.loading.addShiftContractingTypes = false
        // Handle error
      })
      .addCase(updateShiftContractingType.pending, (state) => {
        state.loading.updateShiftContractingType = true
      })
      .addCase(updateShiftContractingType.fulfilled, (state, action) => {
        state.loading.updateShiftContractingType = false
        // Success handled in component
      })
      .addCase(updateShiftContractingType.rejected, (state, action) => {
        state.loading.updateShiftContractingType = false
        // Handle error
      })

      .addCase(deleteShiftContractingType.pending, (state) => {
        state.loading.deleteShiftContractingType = true
      })
      .addCase(deleteShiftContractingType.fulfilled, (state, action) => {
        state.loading.deleteShiftContractingType = false
        const response = action.payload
        if (response.success) {
          // Remove from all shifts that might contain this contracting type
          Object.keys(state.shiftContractingTypes).forEach((shiftId) => {
            state.shiftContractingTypes[shiftId] = state.shiftContractingTypes[
              shiftId
            ].filter((ct) => ct.id !== response.deletedId)
          })
        }
      })
      .addCase(deleteShiftContractingType.rejected, (state, action) => {
        state.loading.deleteShiftContractingType = false
        // Handle error
      })

      // ===================================================================
      // PHASE 4: WORKING HOURS (المرحلة 4: ساعات العمل)
      // ===================================================================

      // Add Working Hours
      .addCase(getRosterTree.pending, (state) => {
        state.loading.getRosterTree = true
        state.errors.rosterTree = null
      })
      .addCase(getRosterTree.fulfilled, (state, action) => {
        state.loading.getRosterTree = false
        state.rosterTree = action.payload || { departments: [] }
      })
      .addCase(getRosterTree.rejected, (state, action) => {
        state.loading.getRosterTree = false
        state.errors.rosterTree = action.payload
        state.rosterTree = { departments: [] }
      })

      // Add Working Hours (updated)
      .addCase(addWorkingHours.pending, (state) => {
        state.loading.addWorkingHours = true
        state.errors.workingHours = null
        state.success.addWorkingHours = false
      })
      .addCase(addWorkingHours.fulfilled, (state, action) => {
        state.loading.addWorkingHours = false
        state.success.addWorkingHours = true

        // Store the generation summary
        if (action.payload?.data) {
          state.generationSummary = action.payload.data
        }
      })
      .addCase(addWorkingHours.rejected, (state, action) => {
        state.loading.addWorkingHours = false
        state.errors.workingHours = action.payload
        state.success.addWorkingHours = false
      })

    // Get Working Hours
    builder
      .addCase(getWorkingHours.pending, (state) => {
        state.loading.fetch = true
        state.errors.workingHours = null
      })
      .addCase(getWorkingHours.fulfilled, (state, action) => {
        state.loading.fetch = false
        state.workingHours = action.payload || []
      })
      .addCase(getWorkingHours.rejected, (state, action) => {
        state.loading.fetch = false
        state.errors.workingHours = action.payload
      })
    builder
      .addCase(getWorkingHour.pending, (state) => {
        state.loading.fetch = true
        state.errors.workingHours = null
      })
      .addCase(getWorkingHour.fulfilled, (state, action) => {
        state.loading.fetch = false
        state.workingHour = action.payload?.data || []
      })
      .addCase(getWorkingHour.rejected, (state, action) => {
        state.loading.fetch = false
        state.errors.workingHours = action.payload
      })
    builder
      .addCase(updateWorkingHour.pending, (state) => {
        state.loading.update = true
      })
      .addCase(updateWorkingHour.fulfilled, (state, action) => {
        state.loading.update = false
      })
      .addCase(updateWorkingHour.rejected, (state, action) => {
        state.loading.update = false
      })
    builder
      .addCase(autoAcceptRequests.pending, (state) => {
        state.loading.update = true
      })
      .addCase(autoAcceptRequests.fulfilled, (state, action) => {
        state.loading.update = false
      })
      .addCase(autoAcceptRequests.rejected, (state, action) => {
        state.loading.update = false
      })

    // ===================================================================
    // PHASE 5: TEMPLATES & ANALYTICS (المرحلة 5: القوالب والتحليل)
    // ===================================================================

    // ===================================================================
    // PHASE 7: DOCTOR MANAGEMENT (المرحلة 7: إدارة الأطباء)
    // ===================================================================

    // ===================================================================
    // QUERY OPERATIONS (عمليات الاستعلام)
    // ===================================================================

    // Get Roster List
    builder
      .addCase(getRosterList.pending, (state) => {
        state.loading.fetch = true
        state.errors.general = null
      })
      .addCase(getRosterList.fulfilled, (state, action) => {
        state.loading.fetch = false
        state.rosterList = action.payload?.data || []
        console.log("roster list", state.rosterList)
      })
      .addCase(getRosterList.rejected, (state, action) => {
        state.loading.fetch = false
        state.errors.general =
          // action.payload?.message ||
          i18next.t("roster.error.fetchFailed")
      })

    // Get Rosters Paged
    builder
      .addCase(getRostersPaged.pending, (state) => {
        state.loading.fetch = true
        state.errors.general = null
      })
      .addCase(getRostersPaged.fulfilled, (state, action) => {
        state.loading.fetch = false
        state.rosterList = action.payload?.data.data || []
        console.log("action.payload roser", action.payload.data)
        state.pagination = {
          totalCount: action.payload.data.totalCount,
          page: action.payload.data.page,
          currentPage: action.payload.data.page,
          pageSize: action.payload.data.pageSize,
          totalPages: action.payload.data.totalPages,
          hasNextPage: action.payload.data.hasNextPage,
          hasPreviousPage: action.payload.data.hasPreviousPage,
          totalItems: action.payload.data.totalCount,
        }

        console.log("roster list", state.rosterList)
        console.log("totalItems", state.pagination.totalItems)
      })
      .addCase(getRostersPaged.rejected, (state, action) => {
        state.loading.fetch = false
        state.errors.general =
          // action.payload?.message ||
          i18next.t("roster.error.fetchFailed")
      })
    // Get Rosters By Category
    builder
      .addCase(getRosterByCategory.pending, (state) => {
        state.loading.fetch = true
        state.errors.general = null
      })
      .addCase(getRosterByCategory.fulfilled, (state, action) => {
        state.loading.fetch = false
        state.rosterList = action.payload?.data || []

        state.pagination = {
          totalCount: action.payload.data.totalCount,
          page: action.payload.data.page,
          pageSize: action.payload.data.pageSize,
          totalPages: action.payload.data.totalPages,
          hasNextPage: action.payload.data.hasNextPage,
          hasPreviousPage: action.payload.data.hasPreviousPage,
          totalItems: action.payload.data.totalCount,
        }

        console.log("roster list", state.rosterList)
        console.log("totalItems", state.pagination.totalItems)
      })
      .addCase(getRosterByCategory.rejected, (state, action) => {
        state.loading.fetch = false
        state.errors.general =
          // action.payload?.message ||
          i18next.t("roster.error.fetchFailed")
      })

    // Get Roster by ID
    builder
      .addCase(getRosterById.pending, (state) => {
        state.loading.fetch = true
        state.errors.general = null
      })
      .addCase(getRosterById.fulfilled, (state, action) => {
        state.loading.fetch = false
        state.selectedRoster = action.payload?.data || null
        localStorage.setItem("rosterId", action.payload?.data?.id)
        localStorage.setItem("categoryId", action.payload?.data?.categoryId)
      })
      .addCase(getRosterById.rejected, (state, action) => {
        state.loading.fetch = false
        state.errors.general =
          action.payload || i18next.t("roster.error.fetchFailed")
      })

    // ===================================================================
    // UPDATE & MANAGEMENT OPERATIONS (عمليات التحديث والإدارة)
    // ===================================================================

    // Update Roster Basic Info
    builder
      .addCase(updateRosterBasicInfo.pending, (state) => {
        state.loading.update = true
        state.errors.update = null
        state.success.update = false
      })
      .addCase(updateRosterBasicInfo.fulfilled, (state, action) => {
        state.loading.update = false
        state.success.update = true

        if (action.payload?.data) {
          rosterManagementSlice.caseReducers.updateRosterInList(state, {
            payload: {
              rosterId: action.payload.data.id,
              updates: action.payload.data,
            },
          })
        }
      })
      .addCase(updateRosterBasicInfo.rejected, (state, action) => {
        state.loading.update = false
        state.errors.update = action.payload
      })

    // Assign Doctor to Shift
    builder
      .addCase(assignDoctorToShift.pending, (state) => {
        state.loading.assignDoctor = true
        state.errors.assignDoctor = null
        state.success.assignDoctor = false
      })
      .addCase(assignDoctorToShift.fulfilled, (state, action) => {
        state.loading.assignDoctor = false
        state.success.assignDoctor = true
      })
      .addCase(assignDoctorToShift.rejected, (state, action) => {
        state.loading.assignDoctor = false
        state.errors.assignDoctor = action.payload
      })

    // Unassign Doctor from Shift
    builder
      .addCase(unassignDoctorFromShift.pending, (state) => {
        state.loading.unassignDoctor = true
        state.errors.unassignDoctor = null
        state.success.unassignDoctor = false
      })
      .addCase(unassignDoctorFromShift.fulfilled, (state, action) => {
        state.loading.unassignDoctor = false
        state.success.unassignDoctor = true

        const scheduleId = action.payload.scheduleId
        console.log("scheduleId", scheduleId)
        const unAssigned = state.doctorSchedule?.assignments.find(
          (ass) => ass.scheduleId == scheduleId
        )
        state.doctorSchedule.assignments = state.doctorSchedule.assignments.map(
          (ass) => ({
            ...ass,
            status: scheduleId == ass.scheduleId ? "Cancelled" : ass.status,
          })
        )
        unAssigned.status = "Cancelled"
        // Local state update logic can be added here
      })
      .addCase(unassignDoctorFromShift.rejected, (state, action) => {
        state.loading.unassignDoctor = false
        state.errors.unassignDoctor = action.payload
      })

    // Get Available Doctors for Shift
    builder
      .addCase(getAvailableDoctorsForShift.pending, (state) => {
        state.loading.availableDoctors = true
        state.errors.availableDoctors = null
      })
      .addCase(getAvailableDoctorsForShift.fulfilled, (state, action) => {
        state.loading.availableDoctors = false

        const requiredType = localStorage.getItem("scientficDoctorRequired")

        state.availableDoctorsForShift = action.payload.data.filter(
          (doctor) => doctor.specialty == requiredType
        )
        console.log(
          "state.availableDoctorsForShift",
          state.availableDoctorsForShift
        )
        console.log("action.payload.data", action.payload.data)
      })
      .addCase(getAvailableDoctorsForShift.rejected, (state, action) => {
        state.loading.availableDoctors = false
        state.errors.availableDoctors = action.payload
      })

    // Get Available Doctors for Date
    builder
      .addCase(getAvailableDoctorsForDate.pending, (state) => {
        state.loading.availableDoctors = true
        state.errors.availableDoctors = null
      })
      .addCase(getAvailableDoctorsForDate.fulfilled, (state, action) => {
        state.loading.availableDoctors = false

        const date = action.payload.date
        state.availableDoctorsForDate[date] = action.payload.data || []
      })
      .addCase(getAvailableDoctorsForDate.rejected, (state, action) => {
        state.loading.availableDoctors = false
        state.errors.availableDoctors = action.payload
      })

    // Get Doctor Schedule
    builder
      .addCase(getDoctorSchedule.pending, (state) => {
        state.loading.doctorSchedule = true
        state.errors.doctorSchedule = null
      })
      .addCase(getDoctorSchedule.fulfilled, (state, action) => {
        state.loading.doctorSchedule = false
        state.doctorSchedule = action.payload?.data || null
      })
      .addCase(getDoctorSchedule.rejected, (state, action) => {
        state.loading.doctorSchedule = false
        state.errors.doctorSchedule = action.payload
      })

    // Get Assigned Doctors Summary
    builder
      .addCase(getAssignedDoctorsSummary.pending, (state) => {
        state.loading.assignedDoctors = true
        state.errors.general = null
      })
      .addCase(getAssignedDoctorsSummary.fulfilled, (state, action) => {
        state.loading.assignedDoctors = false
        state.assignedDoctorsSummary = action.payload?.data || null
      })
      .addCase(getAssignedDoctorsSummary.rejected, (state, action) => {
        state.loading.assignedDoctors = false
        state.errors.general = action.payload
      })

    // Get Doctors for Date
    builder
      .addCase(getDoctorsForDate.pending, (state) => {
        state.loading.doctorsForDate = true
        state.errors.general = null
      })
      .addCase(getDoctorsForDate.fulfilled, (state, action) => {
        state.loading.doctorsForDate = false
        state.doctorsForDate = action.payload?.data || null
      })
      .addCase(getDoctorsForDate.rejected, (state, action) => {
        state.loading.doctorsForDate = false
        state.errors.general = action.payload
      })

    // Get Day Summary
    builder
      .addCase(getDaySummary.pending, (state) => {
        state.loading.daySummary = true
        state.errors.general = null
      })
      .addCase(getDaySummary.fulfilled, (state, action) => {
        state.loading.daySummary = false
        state.daySummary = action.payload?.data || null
      })
      .addCase(getDaySummary.rejected, (state, action) => {
        state.loading.daySummary = false
        state.errors.general = action.payload
      })

    // ===================================================================
    // NEW: DOCTOR REQUESTS WORKFLOW REDUCERS (مُخفِّضات سير عمل طلبات الدكاترة)
    // ===================================================================

    // Submit Doctor Request
    builder
      .addCase(submitDoctorRequest.pending, (state) => {
        state.loading.submitRequest = true
        state.errors.doctorRequests = null
        state.success.submitRequest = false
      })
      .addCase(submitDoctorRequest.fulfilled, (state, action) => {
        state.loading.submitRequest = false
        state.success.submitRequest = true
      })
      .addCase(submitDoctorRequest.rejected, (state, action) => {
        state.loading.submitRequest = false
        state.errors.doctorRequests = action.payload
      })

    // Approve Doctor Request
    builder
      .addCase(approveDoctorRequest.pending, (state) => {
        state.loading.processRequest = true
        state.errors.processRequest = null
        state.success.processRequest = false
      })
      .addCase(approveDoctorRequest.fulfilled, (state, action) => {
        state.loading.processRequest = false
        state.success.processRequest = true

        // Update the request in local state
        const requestId = action.payload.requestId
        const requestIndex = state.doctorRequestsForRoster.findIndex(
          (req) => req.id === requestId
        )
        if (requestIndex !== -1) {
          state.doctorRequestsForRoster[requestIndex].status = "APPROVED"
          state.doctorRequestsForRoster[requestIndex].processedAt =
            new Date().toISOString()
        }

        // Remove from pending requests
        state.pendingRequests = state.pendingRequests.filter(
          (req) => req.id !== requestId
        )
      })
      .addCase(approveDoctorRequest.rejected, (state, action) => {
        state.loading.processRequest = false
        state.errors.processRequest = action.payload
      })

    // Reject Doctor Request
    builder
      .addCase(rejectDoctorRequest.pending, (state) => {
        state.loading.processRequest = true
        state.errors.processRequest = null
        state.success.processRequest = false
      })
      .addCase(rejectDoctorRequest.fulfilled, (state, action) => {
        state.loading.processRequest = false
        state.success.processRequest = true

        // Update the request in local state
        const requestId = action.payload.requestId
        const requestIndex = state.doctorRequestsForRoster.findIndex(
          (req) => req.id === requestId
        )
        if (requestIndex !== -1) {
          state.doctorRequestsForRoster[requestIndex].status = "REJECTED"
          state.doctorRequestsForRoster[requestIndex].processedAt =
            new Date().toISOString()
        }

        // Remove from pending requests
        state.pendingRequests = state.pendingRequests.filter(
          (req) => req.id !== requestId
        )
      })
      .addCase(rejectDoctorRequest.rejected, (state, action) => {
        state.loading.processRequest = false
        state.errors.processRequest = action.payload
      })

    // Get Doctor's Requests
    // builder
    //   .addCase(getDoctorRequests.pending, (state) => {
    //     state.loading.doctorRequests = true;
    //     state.errors.doctorRequests = null;
    //   })
    //   .addCase(getDoctorRequests.fulfilled, (state, action) => {
    //     state.loading.doctorRequests = false;
    //     state.doctorRequests = action.payload?.data || [];
    //   })
    //   .addCase(getDoctorRequests.rejected, (state, action) => {
    //     state.loading.doctorRequests = false;
    //     state.errors.doctorRequests = action.payload;
    //   });
    builder
      .addCase(addRosterDepartment.pending, (state) => {
        state.loading.addRosterDepartment = true
      })
      .addCase(addRosterDepartment.fulfilled, (state, action) => {
        state.loading.addRosterDepartment = false
      })
      .addCase(addRosterDepartment.rejected, (state, action) => {
        state.loading.addRosterDepartment = false
      })
    builder
      // Get doctor requests cases
      .addCase(getDoctorsRequests.pending, (state) => {
        state.loading.getDoctorsRequests = true
      })
      .addCase(getDoctorsRequests.fulfilled, (state, action) => {
        state.loading.getDoctorsRequests = false
        console.log("action.payload", action.payload)
        state.doctorRequests.data = action.payload.data
        state.doctorRequests.filteredRequests =
          action.payload?.data.requestsByDate || []
      })
      .addCase(getDoctorsRequests.rejected, (state, action) => {
        state.loading.getDoctorsRequests = false
        state.doctorRequests.data = null
        state.doctorRequests.filteredRequests = []
      })

      // Approve request cases
      .addCase(approveRequest.pending, (state) => {
        state.loading.approveRequest = true
      })
      .addCase(approveRequest.fulfilled, (state, action) => {
        state.loading.approveRequest = false
        // Update the request status in the local state
      })
      .addCase(approveRequest.rejected, (state, action) => {
        state.loading.approveRequest = false
      })

      // Reject request cases
      .addCase(rejectRequest.pending, (state) => {
        state.loading.rejectRequest = true
      })
      .addCase(rejectRequest.fulfilled, (state, action) => {
        state.loading.rejectRequest = false
        // Update the request status in the local state
        const { requestId } = action.payload
        if (state.doctorRequests.data?.requestsByDate) {
          state.doctorRequests.data.requestsByDate.forEach((dateGroup) => {
            const request = dateGroup.requests.find(
              (req) => req.id === requestId
            )
            if (request) {
              request.status = "Rejected"
              dateGroup.rejectedRequests += 1
              dateGroup.pendingRequests -= 1
            }
          })
          // Update totals
          state.doctorRequests.data.rejectedRequests += 1
          state.doctorRequests.data.pendingRequests -= 1
        }
      })
      .addCase(rejectRequest.rejected, (state, action) => {
        state.loading.rejectRequest = false
      })
  },
})

// ===================================================================
// EXPORT ACTIONS (تصدير الأكشنز)
// ===================================================================

export const {

  clearRosterAttendanceReport,
  
  // Error Management
  clearAllErrors,
  clearSpecificError,

  // Success Management
  clearAllSuccess,
  clearSpecificSuccess,

  // Data Management
  clearSelectedRoster,
  clearAnalyticsData,
  clearDepartmentShifts,
  clearContractingData,
  clearWorkingHoursData,
  clearSearchResults,

  // Pagination
  setPagination,
  resetPagination,

  // UI State
  setCurrentPhase,
  setActiveTab,
  setViewMode,
  setSelectedDepartmentId,
  setSelectedShiftId,
  setFilters,
  clearFilters,
  setCurrentPage,
  setPageSize,
  // Roster Operations
  updateRosterInList,
  removeRosterFromList,

  // Department Shifts Operations
  addShiftToList,
  removeShiftFromList,
  setSelectedDoctorId,
  setSelectedDate,

  // NEW: Data Management
  clearRosterAssignmentData,
  clearDoctorRequestsData,

  // NEW: Roster Assignment Operations
  updateDoctorAssignment,
  removeDoctorAssignment,
  updateShiftInList,
} = rosterManagementSlice.actions

// ===================================================================
// SELECTORS (المحددات)
// ===================================================================

// Basic Selectors (المحددات الأساسية)
export const selectRosters = (state) => state.rosterManagement.rosters
export const selectSelectedRoster = (state) =>
  state.rosterManagement.selectedRoster
export const selectRosterList = (state) => state.rosterManagement.rosterList
export const selectPagination = (state) => state.rosterManagement.pagination

// Department Shifts Selectors (محددات شفتات الأقسام)
export const selectDepartmentShifts = (state) =>
  state.rosterManagement.departmentShifts
export const selectSelectedDepartmentShifts = (state) =>
  state.rosterManagement.selectedDepartmentShifts

// Contracting Selectors (محددات التعاقدات)
export const selectContractingRequirements = (state) =>
  state.rosterManagement.contractingRequirements
export const selectAvailableContractingTypes = (state) =>
  state.rosterManagement.availableContractingTypes
export const selectContractingAnalytics = (state) =>
  state.rosterManagement.contractingAnalytics
export const selectContractingValidation = (state) =>
  state.rosterManagement.contractingValidation

// Working Hours Selectors (محددات ساعات العمل)
export const selectWorkingHours = (state) => state.rosterManagement.workingHours
export const selectWorkingHoursOverview = (state) =>
  state.rosterManagement.workingHoursOverview
export const selectDoctorRequirements = (state) =>
  state.rosterManagement.doctorRequirements

// Loading Selectors (محددات التحميل)
export const selectLoadingStates = (state) => state.rosterManagement.loading
export const selectIsCreatingBasic = (state) =>
  state.rosterManagement.loading.createBasic
export const selectIsFetching = (state) => state.rosterManagement.loading.fetch
export const selectIsUpdating = (state) => state.rosterManagement.loading.update
export const selectIsAddingShifts = (state) =>
  state.rosterManagement.loading.addShifts
export const selectIsAddingContracting = (state) =>
  state.rosterManagement.loading.addContracting
export const selectIsAddingWorkingHours = (state) =>
  state.rosterManagement.loading.addWorkingHours
export const selectIsPublishing = (state) =>
  state.rosterManagement.loading.publish
export const selectIsAssigning = (state) =>
  state.rosterManagement.loading.assign

export const selectDoctorRequests = (state) =>
  state.rosterManagement.doctorRequests.data
export const selectFilteredRequests = (state) =>
  state.rosterManagement.doctorRequests.filteredRequests
export const selectCurrentStatus = (state) =>
  state.rosterManagement.doctorRequests.currentStatus
export const selectDoctorRequestsLoading = (state) =>
  state.rosterManagement.loading.getDoctorsRequests
export const selectApproveRequestLoading = (state) =>
  state.rosterManagement.loading.approveRequest
export const selectRejectRequestLoading = (state) =>
  state.rosterManagement.loading.rejectRequest

// Error Selectors (محددات الأخطاء)
export const selectErrors = (state) => state.rosterManagement.errors
export const selectCreateError = (state) => state.rosterManagement.errors.create
export const selectUpdateError = (state) => state.rosterManagement.errors.update
export const selectShiftsError = (state) => state.rosterManagement.errors.shifts
export const selectContractingError = (state) =>
  state.rosterManagement.errors.contracting
export const selectWorkingHoursError = (state) =>
  state.rosterManagement.errors.workingHours
export const selectAnalyticsError = (state) =>
  state.rosterManagement.errors.analytics

// Success Selectors (محددات النجاح)
export const selectSuccessStates = (state) => state.rosterManagement.success
export const selectCreateBasicSuccess = (state) =>
  state.rosterManagement.success.createBasic
export const selectAddShiftsSuccess = (state) =>
  state.rosterManagement.success.addShifts
export const selectPublishSuccess = (state) =>
  state.rosterManagement.success.publish

// Analytics Selectors (محددات التحليلات)
export const selectRosterAnalytics = (state) =>
  state.rosterManagement.rosterAnalytics
export const selectDoctorWorkloads = (state) =>
  state.rosterManagement.doctorWorkloads
export const selectDepartmentCoverage = (state) =>
  state.rosterManagement.departmentCoverage
export const selectDepartmentSchedule = (state) =>
  state.rosterManagement.departmentSchedule

// Search Selectors (محددات البحث)
export const selectColleagueSearchResults = (state) =>
  state.rosterManagement.colleagueSearchResults

// UI Selectors (محددات واجهة المستخدم)
export const selectUIState = (state) => state.rosterManagement.ui
export const selectCurrentPhase = (state) =>
  state.rosterManagement.ui.currentPhase
export const selectActiveTab = (state) => state.rosterManagement.ui.activeTab
export const selectViewMode = (state) => state.rosterManagement.ui.viewMode
export const selectSelectedDepartmentId = (state) =>
  state.rosterManagement.ui.selectedDepartmentId
export const selectSelectedShiftId = (state) =>
  state.rosterManagement.ui.selectedShiftId
export const selectFilters = (state) => state.rosterManagement.ui.filters

// Complex Selectors (المحددات المعقدة)
export const selectRosterById = (rosterId) => (state) =>
  state.rosterManagement.rosters.find((roster) => roster.id === rosterId)

export const selectShiftById = (shiftId) => (state) =>
  state.rosterManagement.departmentShifts.find((shift) => shift.id === shiftId)

export const selectIsRosterReadyForPublication = (state) => {
  const roster = state.rosterManagement.selectedRoster
  const validation = state.rosterManagement.contractingValidation
  return roster?.status === "DRAFT_READY" && validation?.isValid === true
}

export const selectCanProgressToNextPhase = (state) => {
  const currentPhase = state.rosterManagement.ui.currentPhase
  const roster = state.rosterManagement.selectedRoster

  switch (currentPhase) {
    case 1:
      return roster !== null
    case 2:
      return state.rosterManagement.departmentShifts.length > 0
    case 3:
      return state.rosterManagement.contractingRequirements.length > 0
    case 4:
      return state.rosterManagement.workingHours.length > 0
    case 5:
      return state.rosterManagement.contractingValidation?.isValid === true
    case 6:
      return roster?.status === "DRAFT_READY"
    default:
      return false
  }
}

export const selectPhaseCompletionStatus = (state) => {
  const roster = state.rosterManagement.selectedRoster
  const departmentShifts = state.rosterManagement.departmentShifts
  const contractingRequirements = state.rosterManagement.contractingRequirements
  const workingHours = state.rosterManagement.workingHours
  const validation = state.rosterManagement.contractingValidation

  return {
    phase1: roster !== null,
    phase2: departmentShifts.length > 0,
    phase3: contractingRequirements.length > 0,
    phase4: workingHours.length > 0,
    phase5: validation?.isValid === true,
    phase6: roster?.status === "DRAFT_READY" || roster?.status === "PUBLISHED",
    phase7: roster?.status === "PUBLISHED",
  }
}

export const selectRostersByStatus = (status) => (state) =>
  state.rosterManagement.rosters.filter((roster) => roster.status === status)

export const selectFilteredRosters = (state) => {
  const rosters = state.rosterManagement.rosters
  const filters = state.rosterManagement.ui.filters

  return rosters.filter((roster) => {
    if (filters.categoryId && roster.categoryId !== filters.categoryId) {
      return false
    }
    if (filters.status && roster.status !== filters.status) {
      return false
    }
    if (filters.departmentId && roster.departmentId !== filters.departmentId) {
      return false
    }
    if (filters.month && roster.month !== filters.month) {
      return false
    }
    if (filters.year && roster.year !== filters.year) {
      return false
    }
    return true
  })
}

export const selectDoctorsPerRoster = (state) =>
  state.rosterManagement.doctorsPerRoster

// Statistics Selectors (محددات الإحصائيات)
export const selectRosterStatistics = (state) => {
  const rosters = state.rosterManagement.rosters

  return {
    total: rosters.length,
    draft: rosters.filter((r) => r.status === "DRAFT").length,
    draftReady: rosters.filter((r) => r.status === "DRAFT_READY").length,
    published: rosters.filter((r) => r.status === "PUBLISHED").length,
    closed: rosters.filter((r) => r.status === "CLOSED").length,
    archived: rosters.filter((r) => r.status === "ARCHIVED").length,
  }
}

export const selectDepartmentShiftsStatistics = (state) => {
  const shifts = state.rosterManagement.departmentShifts

  return {
    total: shifts.length,
    withContracting: shifts.filter((s) => s.hasContractingRequirements).length,
    withWorkingHours: shifts.filter((s) => s.hasWorkingHours).length,
    completed: shifts.filter((s) => s.isCompleted).length,
  }
}

// Validation Selectors (محددات التحقق)
export const selectHasValidationErrors = (state) => {
  const validation = state.rosterManagement.contractingValidation
  return validation?.errors && validation.errors.length > 0
}

export const selectValidationErrors = (state) => {
  const validation = state.rosterManagement.contractingValidation
  return validation?.errors || []
}

// Phase Navigation Selectors (محددات التنقل بين المراحل)
export const selectCanGoToPreviousPhase = (state) => {
  return state.rosterManagement.ui.currentPhase > 1
}

export const selectCanGoToNextPhase = (state) => {
  const currentPhase = state.rosterManagement.ui.currentPhase
  return currentPhase < 7 && selectCanProgressToNextPhase(state)
}

export const selectPhaseProgress = (state) => {
  const currentPhase = state.rosterManagement.ui.currentPhase
  const completionStatus = selectPhaseCompletionStatus(state)

  let completedPhases = 0
  Object.values(completionStatus).forEach((isComplete) => {
    if (isComplete) completedPhases++
  })

  return {
    currentPhase,
    completedPhases,
    totalPhases: 7,
    progressPercentage: (completedPhases / 7) * 100,
  }
}

// Export the reducer as default
export default rosterManagementSlice.reducer
