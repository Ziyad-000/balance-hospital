import { createAsyncThunk } from "@reduxjs/toolkit"
import axiosInstance from "../../utils/axiosInstance"

// ===================================================================
// UTILITY FUNCTIONS
// ===================================================================

/**
 * Helper function to get authorization headers
 */
const getAuthHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("token")}`,
})

/**
 * Helper function to build query parameters
 */
const buildQueryParams = (params) => {
  const queryParams = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== "") {
      queryParams.append(key, value)
    }
  })
  return queryParams.toString()
}

/**
 * Generic error handler for thunks
 */
const handleError = (error, rejectWithValue) => {
  return rejectWithValue(error.response?.data || error.message)
}

// ===================================================================
// PHASE 1: BASIC ROSTER STRUCTURE (المرحلة 1: إنشاء الهيكل الأساسي)
// ===================================================================

/**
 * Create basic roster structure - Phase 1 (Required)
 * إنشاء الهيكل الأساسي للروستر - المرحلة الأولى الإجبارية
 */
export const createBasicRoster = createAsyncThunk(
  "rosterManagement/createBasicRoster",
  async (rosterData, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.post(
        "/api/v1/RosterManagement/basic",
        rosterData,
        { headers: getAuthHeaders() }
      )
      return res.data
    } catch (error) {
      return handleError(error, rejectWithValue)
    }
  }
)

// ===================================================================
// PHASE 2: DEPARTMENT SHIFTS MANAGEMENT (المرحلة 2: إدارة شفتات الأقسام)
// ===================================================================

/**
 * Add department shifts to roster
 * إضافة شفتات للأقسام في الروستر
 */
export const addDepartmentShifts = createAsyncThunk(
  "rosterManagement/addDepartmentShifts",
  async ({ rosterDepartmentId, shiftsData }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.post(
        `/api/v1/RosterManagement/roster-departments/${rosterDepartmentId}/shifts`,
        shiftsData,
        { headers: getAuthHeaders() }
      )
      return res.data
    } catch (error) {
      return handleError(error, rejectWithValue)
    }
  }
)

/**
 * Get department shifts for roster
 * الحصول على شفتات قسم محدد في الروستر
 */
export const getDepartmentShifts = createAsyncThunk(
  "rosterManagement/getDepartmentShifts",
  async ({ rosterDepartmentId }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get(
        `/api/v1/RosterManagement/roster-departments/${rosterDepartmentId}/shifts`,
        { headers: getAuthHeaders() }
      )
      return res.data
    } catch (error) {
      return handleError(error, rejectWithValue)
    }
  }
)

/**
 * Delete specific department shift
 * حذف شفت محدد من قسم
 */
export const deleteDepartmentShift = createAsyncThunk(
  "rosterManagement/deleteDepartmentShift",
  async (departmentShiftId, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.delete(
        `/api/v1/RosterManagement/department-shifts/${departmentShiftId}`,
        { headers: getAuthHeaders() }
      )
      return res.data
    } catch (error) {
      return handleError(error, rejectWithValue)
    }
  }
)

// ===================================================================
// PHASE 3: CONTRACTING REQUIREMENTS (المرحلة 3: متطلبات التعاقد)
// ===================================================================

/**
 * Add contracting requirements to department shift
 * إضافة متطلبات التعاقد لشفت قسم
 */

export const getShiftContractingTypes = createAsyncThunk(
  "rosterManagement/getShiftContractingTypes",
  async ({ departmentShiftId }, thunkAPI) => {
    const { rejectWithValue } = thunkAPI

    try {
      const res = await axiosInstance.get(
        `/api/v1/RosterManagement/department-shifts/${departmentShiftId}/contracting-types`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      )
      console.log("Shift contracting types fetched successfully:", res)
      return res.data
    } catch (error) {
      console.log("Error fetching shift contracting types:", error)
      return rejectWithValue(error.response?.data || error.message)
    }
  }
)

// Add contracting types to a department shift
export const addShiftContractingTypes = createAsyncThunk(
  "rosterManagement/addShiftContractingTypes",
  async ({ departmentShiftId, contractingTypesData }, thunkAPI) => {
    console.log("contractingTypesData", contractingTypesData)
    const { rejectWithValue } = thunkAPI

    try {
      const res = await axiosInstance.post(
        `/api/v1/RosterManagement/department-shifts/${departmentShiftId}/contracting-types`,
        contractingTypesData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        }
      )
      console.log("Shift contracting types added successfully:", res)
      return res.data
    } catch (error) {
      console.log("Error adding shift contracting types:", error)
      return rejectWithValue(error.response?.data || error.message)
    }
  }
)

// Update shift contracting type
export const updateShiftContractingType = createAsyncThunk(
  "rosterManagement/updateShiftContractingType",
  async ({ shiftContractingTypeId, updateData }, thunkAPI) => {
    const { rejectWithValue } = thunkAPI

    try {
      const res = await axiosInstance.put(
        `/api/v1/RosterManagement/shift-contracting-types/${shiftContractingTypeId}?applyToWorkingHours=true&increaseOnly=true`,
        updateData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        }
      )
      console.log("Shift contracting type updated successfully:", res)
      return res.data
    } catch (error) {
      console.log("Error updating shift contracting type:", error)
      return rejectWithValue(error.response?.data || error.message)
    }
  }
)

// Delete shift contracting type
export const deleteShiftContractingType = createAsyncThunk(
  "rosterManagement/deleteShiftContractingType",
  async ({ contractingId }, thunkAPI) => {
    const { rejectWithValue } = thunkAPI

    try {
      const res = await axiosInstance.delete(
        `/api/v1/RosterManagement/shift-contracting-types/${contractingId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      )
      console.log("Shift contracting type deleted successfully:", res)
      return { ...res.data, deletedId: contractingId }
    } catch (error) {
      console.log("Error deleting shift contracting type:", error)
      return rejectWithValue(error.response?.data || error.message)
    }
  }
)

// ===================================================================
// PHASE 4: WORKING HOURS MANAGEMENT (المرحلة 4: إدارة ساعات العمل)
// ===================================================================

/**
 * Add working hours to department shift
 * إضافة ساعات عمل لشفت قسم
 */
export const addWorkingHours = createAsyncThunk(
  "rosterManagement/addWorkingHours",
  async (workingHours, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.post(
        `/api/v1/rostermanagement/working-hours/generate`,
        workingHours,
        { headers: getAuthHeaders() }
      )
      return res.data
    } catch (error) {
      return handleError(error, rejectWithValue)
    }
  }
)
// Add this to your actRosterManagement.js file

export const getRosterTree = createAsyncThunk(
  "rosterManagement/getRosterTree",
  async (
    { rosterId, startDate = null, endDate = null },
    { rejectWithValue }
  ) => {
    try {
      const params = new URLSearchParams()
      if (startDate) params.append("startDate", startDate)
      if (endDate) params.append("endDate", endDate)

      const queryString = params.toString()
      const url = `/api/v1/RosterManagement/${rosterId}/filters/tree-with-progress${
        queryString ? `?${queryString}` : ""
      }`

      const res = await axiosInstance.get(url, {
        headers: getAuthHeaders(),
      })

      return res.data
    } catch (error) {
      return handleError(error, rejectWithValue)
    }
  }
)
/**
 * Get working hours for department shift
 * الحصول على ساعات العمل لشفت قسم
 */
export const getWorkingHours = createAsyncThunk(
  "rosterManagement/getWorkingHours",
  async ({ rosterId, params = {} }, { rejectWithValue }) => {
    try {
      const queryString = buildQueryParams(params)

      const res = await axiosInstance.get(
        `/api/v1/RosterManagement/${rosterId}/working-hours-structured${
          queryString ? `?${queryString}` : ""
        }`,
        { headers: getAuthHeaders() }
      )
      return res.data
    } catch (error) {
      return handleError(error, rejectWithValue)
    }
  }
)
export const getWorkingHour = createAsyncThunk(
  "rosterManagement/getWorkingHour",
  async ({ workingHourId }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get(
        `/api/v1/RosterManagement/working-hours/${workingHourId}`,
        { headers: getAuthHeaders() }
      )
      return res.data
    } catch (error) {
      return handleError(error, rejectWithValue)
    }
  }
)
export const updateWorkingHour = createAsyncThunk(
  "rosterManagement/updateWorkingHour",
  async ({ workingHourId, data }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.put(
        `/api/v1/RosterManagement/working-hours/${workingHourId}`,
        data,
        { headers: getAuthHeaders() }
      )
      return res.data
    } catch (error) {
      return handleError(error, rejectWithValue)
    }
  }
)

// ===================================================================
// PHASE 7: DOCTOR MANAGEMENT & SCHEDULING (المرحلة 7: إدارة الأطباء والجدولة)
// ===================================================================

/**
 * Get simple roster list
 * قائمة الروسترز المبسطة
 */
export const getRosterList = createAsyncThunk(
  "rosterManagement/getRosterList",
  async (filters = {}, { rejectWithValue }) => {
    try {
      const queryString = buildQueryParams(filters)
      const url = `/api/v1/RosterManagement/list${
        queryString ? `?${queryString}` : ""
      }`

      const res = await axiosInstance.get(url, { headers: getAuthHeaders() })
      return res.data
    } catch (error) {
      return handleError(error, rejectWithValue)
    }
  }
)

/**
 * Get paginated roster list
 * قائمة الروسترز مع ترقيم الصفحات
 */
export const getRostersPaged = createAsyncThunk(
  "rosterManagement/getRostersPaged",
  async (params = {}, { rejectWithValue }) => {
    try {
      const queryString = buildQueryParams(params)
      const url = `/api/v1/RosterManagement/paged${
        queryString ? `?${queryString}` : ""
      }`

      const res = await axiosInstance.get(url, { headers: getAuthHeaders() })
      return res.data
    } catch (error) {
      return handleError(error, rejectWithValue)
    }
  }
)
export const getRosterByCategory = createAsyncThunk(
  "rosterManagement/getRosterByCategory",
  async ({ categoryId }, { rejectWithValue }) => {
    try {
      const url = `/api/v1/RosterManagement/categories/${categoryId}/rosters`
      const res = await axiosInstance.get(url, { headers: getAuthHeaders() })
      return res.data
    } catch (error) {
      return handleError(error, rejectWithValue)
    }
  }
)

/**
 * Get roster by ID
 * الحصول على روستر بالمعرف
 */
export const getRosterById = createAsyncThunk(
  "rosterManagement/getRosterById",
  async ({ rosterId }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get(
        `/api/v1/RosterManagement/${rosterId}`,
        { headers: getAuthHeaders() }
      )
      return res.data
    } catch (error) {
      return handleError(error, rejectWithValue)
    }
  }
)

// ===================================================================
// UPDATE & MANAGEMENT OPERATIONS (عمليات التحديث والإدارة)
// ===================================================================

/**
 * Update basic roster information
 * تحديث معلومات الروستر الأساسية
 */
export const updateRosterBasicInfo = createAsyncThunk(
  "rosterManagement/updateRosterBasicInfo",
  async ({ rosterId, updateData }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.put(
        `/api/v1/RosterManagement/${rosterId}`,
        updateData,
        { headers: getAuthHeaders() }
      )
      return res.data
    } catch (error) {
      return handleError(error, rejectWithValue)
    }
  }
)
export const deleteRoster = createAsyncThunk(
  "rosterManagement/deleteRoster",
  async ({ rosterId, reason }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.delete(
        `/api/v1/RosterManagement/${rosterId}/remove`,
        {
          headers: getAuthHeaders(),
          data: { reason },
        }
      )
      return { rosterId, ...res.data }
    } catch (error) {
      return handleError(error, rejectWithValue)
    }
  }
)
export const updateRosterStatus = createAsyncThunk(
  "rosterManagement/updateRosterStatus",
  async ({ rosterId, updateData }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.put(
        `/api/v1/RosterManagement/${rosterId}/status`,
        updateData,
        { headers: getAuthHeaders() }
      )
      return res.data
    } catch (error) {
      return handleError(error, rejectWithValue)
    }
  }
)

export const getRosterDepartments = createAsyncThunk(
  "rosterManagement/getRosterDepartments",
  async ({ rosterId }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get(
        `/api/v1/RosterManagement/${rosterId}/departments`,
        { headers: getAuthHeaders() }
      )
      return res.data
    } catch (error) {
      return handleError(error, rejectWithValue)
    }
  }
)
export const addRosterDepartment = createAsyncThunk(
  "rosterManagement/addRosterDepartment",
  async ({ rosterId, department }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.post(
        `/api/v1/RosterManagement/${rosterId}/departments`,
        department,
        { headers: getAuthHeaders() }
      )
      return res.data
    } catch (error) {
      return handleError(error, rejectWithValue)
    }
  }
)

// ===================================================================
// ROSTER ASSIGNMENT ACTIONS (أكشنز تعيين الروستر)
// ===================================================================

/**
 * Assign doctor to working hours
 * تعيين دكتور لساعات عمل
 */
export const assignDoctorToShift = createAsyncThunk(
  "rosterManagement/assignDoctorToShift",
  async (
    { doctorId, workingHoursId, notes, overrideConflicts = false },
    { rejectWithValue }
  ) => {
    try {
      const res = await axiosInstance.post(
        "/api/v1/rosterassignment/assign",
        {
          doctorId,
          workingHoursId,
          notes,
          overrideConflicts,
        },
        { headers: getAuthHeaders() }
      )
      return res.data
    } catch (error) {
      return handleError(error, rejectWithValue)
    }
  }
)

/**
 * Unassign doctor from shift
 * إلغاء تعيين دكتور من شفت
 */
export const unassignDoctorFromShift = createAsyncThunk(
  "rosterManagement/unassignDoctorFromShift",
  async ({ scheduleId, reason }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.delete(
        `/api/v1/rosterassignment/unassign/${scheduleId}`,
        {
          headers: getAuthHeaders(),
          data: { reason },
        }
      )
      return { ...res.data, scheduleId }
    } catch (error) {
      return handleError(error, rejectWithValue)
    }
  }
)

/**
 * Get available doctors for working hours
 * الحصول على الدكاترة المتاحين لساعات عمل محددة
 */
export const getAvailableDoctorsForShift = createAsyncThunk(
  "rosterManagement/getAvailableDoctorsForShift",
  async ({ workingHourId }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get(
        `/api/v1/rosterassignment/working-hours/${workingHourId}/available-doctors`,
        { headers: getAuthHeaders() }
      )
      return res.data
    } catch (error) {
      return handleError(error, rejectWithValue)
    }
  }
)

/**
 * Get available doctors for specific date
 * الحصول على الدكاترة المتاحين لتاريخ محدد
 */
export const getAvailableDoctorsForDate = createAsyncThunk(
  "rosterManagement/getAvailableDoctorsForDate",
  async (
    { rosterId, date, departmentId, shiftTypeId },
    { rejectWithValue }
  ) => {
    try {
      const queryParams = buildQueryParams({ departmentId, shiftTypeId })
      const url = `/api/v1/rosterassignment/roster/${rosterId}/available-doctors/${date}${
        queryParams ? `?${queryParams}` : ""
      }`

      const res = await axiosInstance.get(url, { headers: getAuthHeaders() })
      return { ...res.data, date }
    } catch (error) {
      return handleError(error, rejectWithValue)
    }
  }
)

/**
 * Get doctor schedule in roster
 * الحصول على جدول دكتور في روستر
 */
export const getDoctorSchedule = createAsyncThunk(
  "rosterManagement/getDoctorSchedule",
  async ({ rosterId, doctorId }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get(
        `/api/v1/rosterassignment/roster/${rosterId}/doctor/${doctorId}/schedule`,
        { headers: getAuthHeaders() }
      )
      return res.data
    } catch (error) {
      return handleError(error, rejectWithValue)
    }
  }
)

/**
 * Get assigned doctors summary
 * الحصول على ملخص الدكاترة المعينين
 */
export const getAssignedDoctorsSummary = createAsyncThunk(
  "rosterManagement/getAssignedDoctorsSummary",
  async ({ rosterId, params = {} }, { rejectWithValue }) => {
    try {
      const queryString = buildQueryParams(params)
      const url = `/api/v1/rosterassignment/roster/${rosterId}/assigned-doctors${
        queryString ? `?${queryString}` : ""
      }`

      const res = await axiosInstance.get(url, { headers: getAuthHeaders() })
      return res.data
    } catch (error) {
      return handleError(error, rejectWithValue)
    }
  }
)

/**
 * Get doctors for specific date
 * الحصول على دكاترة تاريخ محدد
 */
export const getDoctorsForDate = createAsyncThunk(
  "rosterManagement/getDoctorsForDate",
  async ({ rosterId, date }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get(
        `/api/v1/rosterassignment/roster/${rosterId}/doctors/${date}`,
        { headers: getAuthHeaders() }
      )
      return res.data
    } catch (error) {
      return handleError(error, rejectWithValue)
    }
  }
)

/**
 * Get day summary
 * الحصول على ملخص اليوم
 */
export const getDaySummary = createAsyncThunk(
  "rosterManagement/getDaySummary",
  async ({ rosterId, date }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get(
        `/api/v1/rosterassignment/roster/${rosterId}/day-summary/${date}`,
        { headers: getAuthHeaders() }
      )
      return res.data
    } catch (error) {
      return handleError(error, rejectWithValue)
    }
  }
)

// ===================================================================
// DOCTOR REQUESTS WORKFLOW (سير عمل طلبات الدكاترة)
// ===================================================================

/**
 * Submit doctor request
 * إرسال طلب دكتور
 */
export const submitDoctorRequest = createAsyncThunk(
  "rosterManagement/submitDoctorRequest",
  async (requestData, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.post(
        "/api/v1/rosterassignment/doctor-requests",
        requestData,
        { headers: getAuthHeaders() }
      )
      return res.data
    } catch (error) {
      return handleError(error, rejectWithValue)
    }
  }
)

/**
 * Get doctor requests for roster
 * الحصول على طلبات الدكاترة للروستر
 */

/**
 * Approve doctor request
 * الموافقة على طلب دكتور
 */
export const approveDoctorRequest = createAsyncThunk(
  "rosterManagement/approveDoctorRequest",
  async ({ requestId, processingData }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.put(
        `/api/v1/rosterassignment/doctor-requests/${requestId}/approve`,
        processingData,
        { headers: getAuthHeaders() }
      )
      return { ...res.data, requestId }
    } catch (error) {
      return handleError(error, rejectWithValue)
    }
  }
)

/**
 * Reject doctor request
 * رفض طلب دكتور
 */
export const rejectDoctorRequest = createAsyncThunk(
  "rosterManagement/rejectDoctorRequest",
  async ({ requestId, processingData }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.put(
        `/api/v1/rosterassignment/doctor-requests/${requestId}/reject`,
        processingData,
        { headers: getAuthHeaders() }
      )
      return { ...res.data, requestId }
    } catch (error) {
      return handleError(error, rejectWithValue)
    }
  }
)

/**
 * Get doctor's requests
 * الحصول على طلبات الدكتور
 */
// export const getDoctorRequests = createAsyncThunk(
//   "rosterManagement/getDoctorRequests",
//   async ({ doctorId }, { rejectWithValue }) => {
//     try {
//       const res = await axiosInstance.get(
//         `/api/v1/rosterassignment/doctors/${doctorId}/requests`,
//         { headers: getAuthHeaders() }
//       );
//       return res.data;
//     } catch (error) {
//       return handleError(error, rejectWithValue);
//     }
//   }
// );
export const getAvailbleScientficDegrees = createAsyncThunk(
  "rosterManagement/getAvailbleScientficDegrees",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get(
        `/api/v1/RosterManagement/available-contracting-types`,
        {
          headers: getAuthHeaders(),
        }
      )
      return res.data
    } catch (error) {
      return handleError(error, rejectWithValue)
    }
  }
)
export const getDoctorsPerRoster = createAsyncThunk(
  "rosterManagement/getDoctorsPerRoster",
  async ({ rosterId }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get(
        `/api/v1/rosterDisplay/${rosterId}/doctor-stats`,
        {
          headers: getAuthHeaders(),
        }
      )
      return res.data
    } catch (error) {
      return handleError(error, rejectWithValue)
    }
  }
)
// Redux Actions for Doctor Requests Management

// Update the existing getDoctorsRequests action to store data in state
export const getDoctorsRequests = createAsyncThunk(
  "rosterManagement/getDoctorsRequests",
  async ({ rosterId, status }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get(
        `/api/v1/rosterassignment/rosters/${rosterId}/working-hours-requests?status=${status}`,
        {
          headers: getAuthHeaders(),
        }
      )
      return res.data
    } catch (error) {
      return handleError(error, rejectWithValue)
    }
  }
)

// Action to approve a doctor request
export const approveRequest = createAsyncThunk(
  "rosterManagement/approveRequest",
  async ({ requestId, processedNotes }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.put(
        `/api/v1/RosterAssignment/working-hours-requests/${requestId}/approve`,
        { processedNotes },
        {
          headers: getAuthHeaders(),
        }
      )
      return { requestId, data: res.data }
    } catch (error) {
      return handleError(error, rejectWithValue)
    }
  }
)

// Action to reject a doctor request
export const rejectRequest = createAsyncThunk(
  "rosterManagement/rejectRequest",
  async ({ requestId, processedNotes }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.put(
        `/api/v1/RosterAssignment/working-hours-requests/${requestId}/reject`,
        { processedNotes },
        {
          headers: getAuthHeaders(),
        }
      )
      return { requestId, data: res.data }
    } catch (error) {
      return handleError(error, rejectWithValue)
    }
  }
)
export const autoAcceptRequests = createAsyncThunk(
  "rosterManagement/autoAcceptRequests",
  async ({ rosterId, autoAcceptRequests }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.put(
        `/api/v1/RosterManagement/${rosterId}/auto-accept`,
        { autoAcceptRequests },
        {
          headers: getAuthHeaders(),
        }
      )
      return res.data
    } catch (error) {
      return handleError(error, rejectWithValue)
    }
  }
)

// Enum for request states (for reference)
export const DoctorWorkingHoursRequestState = {
  // None: 0,
  Pending: 1,
  Rejected: 2,
  Approved: 3,
}

export const getStatusName = (status) => {
  switch (status) {
    case 0:
      return "None"
    case 1:
      return "Pending"
    case 2:
      return "Rejected"
    case 3:
      return "Approved"
    default:
      return "Unknown"
  }
}

// ===================================================================
// ROSTER ATTENDANCE REPORTS
// ===================================================================

const unwrapApiResponse = (response) => {
  return response?.data?.data || response?.data
}

export const getRosterAttendanceReport = createAsyncThunk(
  "rosterManagement/getRosterAttendanceReport",
  async (
    { rosterId, departmentId, doctorId, scientificDegreeId },
    { rejectWithValue }
  ) => {
    try {
      const params = buildQueryParams({
        departmentId,
        doctorId,
        scientificDegreeId,
      })

      const url = `/api/v1/ScheduleReporting/attendance/roster/${rosterId}${
        params ? `?${params}` : ""
      }`

      const res = await axiosInstance.get(url, {
        headers: getAuthHeaders(),
      })

      return unwrapApiResponse(res)
    } catch (error) {
      return handleError(error, rejectWithValue)
    }
  }
)

export const getRosterAttendanceSummary = createAsyncThunk(
  "rosterManagement/getRosterAttendanceSummary",
  async ({ rosterId }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get(
        `/api/v1/Attendance/roster/${rosterId}/summary`,
        {
          headers: getAuthHeaders(),
        }
      )

      return unwrapApiResponse(res)
    } catch (error) {
      return handleError(error, rejectWithValue)
    }
  }
)

// ===================================================================
// ATTENDANCE ANALYTICS FOUNDATION
// ===================================================================

const normalizeAnalyticsError = (error, fallbackMessage = "Failed to load attendance analytics") => {
  return (
    error.response?.data ||
    error.response?.data?.messageAr ||
    error.response?.data?.messageEn ||
    error.message ||
    fallbackMessage
  )
}

const unwrapAnalyticsResponse = (response) => {
  return response?.data?.data || response?.data
}

/**
 * Global today attendance snapshot
 * GET /api/v1/AttendanceAnalytics/attendance/today
 */
export const getTodayAttendanceSnapshot = createAsyncThunk(
  "rosterManagement/getTodayAttendanceSnapshot",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get(
        "/api/v1/AttendanceAnalytics/attendance/today",
        { headers: getAuthHeaders() }
      )

      return unwrapAnalyticsResponse(res)
    } catch (error) {
      return rejectWithValue(
        normalizeAnalyticsError(error, "Failed to load today attendance snapshot")
      )
    }
  }
)

/**
 * Roster scoped today attendance snapshot
 * GET /api/v1/AttendanceAnalytics/rosters/{rosterId}/attendance/today
 */
export const getRosterTodayAttendanceSnapshot = createAsyncThunk(
  "rosterManagement/getRosterTodayAttendanceSnapshot",
  async ({ rosterId }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get(
        `/api/v1/AttendanceAnalytics/rosters/${rosterId}/attendance/today`,
        { headers: getAuthHeaders() }
      )

      return unwrapAnalyticsResponse(res)
    } catch (error) {
      return rejectWithValue(
        normalizeAnalyticsError(error, "Failed to load roster today attendance snapshot")
      )
    }
  }
)

/**
 * Unified roster attendance dashboard
 * GET /api/v1/AttendanceAnalytics/rosters/{rosterId}/attendance/dashboard?date=YYYY-MM-DD
 */
export const getRosterAttendanceDashboard = createAsyncThunk(
  "rosterManagement/getRosterAttendanceDashboard",
  async ({ rosterId, date = null }, { rejectWithValue }) => {
    try {
      const params = buildQueryParams({ date })

      const res = await axiosInstance.get(
        `/api/v1/AttendanceAnalytics/rosters/${rosterId}/attendance/dashboard${
          params ? `?${params}` : ""
        }`,
        { headers: getAuthHeaders() }
      )

      return unwrapAnalyticsResponse(res)
    } catch (error) {
      return rejectWithValue(
        normalizeAnalyticsError(error, "Failed to load roster attendance dashboard")
      )
    }
  }
)

/**
 * Comprehensive attendance analytics
 * GET /api/v1/AttendanceAnalytics/rosters/{rosterId}/attendance/analytics?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
 */
export const getRosterAttendanceAnalytics = createAsyncThunk(
  "rosterManagement/getRosterAttendanceAnalytics",
  async ({ rosterId, startDate = null, endDate = null }, { rejectWithValue }) => {
    try {
      const params = buildQueryParams({ startDate, endDate })

      const res = await axiosInstance.get(
        `/api/v1/AttendanceAnalytics/rosters/${rosterId}/attendance/analytics${
          params ? `?${params}` : ""
        }`,
        { headers: getAuthHeaders() }
      )

      return unwrapAnalyticsResponse(res)
    } catch (error) {
      return rejectWithValue(
        normalizeAnalyticsError(error, "Failed to load roster attendance analytics")
      )
    }
  }
)

/**
 * Repeated absence patterns
 * GET /api/v1/AttendanceAnalytics/rosters/{rosterId}/attendance/absence-patterns?minAbsences=3
 */
export const getRosterAbsencePatterns = createAsyncThunk(
  "rosterManagement/getRosterAbsencePatterns",
  async ({ rosterId, minAbsences = 3 }, { rejectWithValue }) => {
    try {
      const params = buildQueryParams({ minAbsences })

      const res = await axiosInstance.get(
        `/api/v1/AttendanceAnalytics/rosters/${rosterId}/attendance/absence-patterns${
          params ? `?${params}` : ""
        }`,
        { headers: getAuthHeaders() }
      )

      return unwrapAnalyticsResponse(res)
    } catch (error) {
      return rejectWithValue(
        normalizeAnalyticsError(error, "Failed to load absence patterns")
      )
    }
  }
)

/**
 * Late arrival patterns
 * GET /api/v1/AttendanceAnalytics/rosters/{rosterId}/attendance/late-patterns
 */
export const getRosterLatePatterns = createAsyncThunk(
  "rosterManagement/getRosterLatePatterns",
  async ({ rosterId }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get(
        `/api/v1/AttendanceAnalytics/rosters/${rosterId}/attendance/late-patterns`,
        { headers: getAuthHeaders() }
      )

      return unwrapAnalyticsResponse(res)
    } catch (error) {
      return rejectWithValue(
        normalizeAnalyticsError(error, "Failed to load late patterns")
      )
    }
  }
)

/**
 * Department realtime analytics - all departments
 * GET /api/v1/AttendanceAnalytics/rosters/{rosterId}/attendance/departments/realtime
 */
export const getRosterDepartmentsRealtime = createAsyncThunk(
  "rosterManagement/getRosterDepartmentsRealtime",
  async ({ rosterId }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get(
        `/api/v1/AttendanceAnalytics/rosters/${rosterId}/attendance/departments/realtime`,
        { headers: getAuthHeaders() }
      )

      return unwrapAnalyticsResponse(res)
    } catch (error) {
      return rejectWithValue(
        normalizeAnalyticsError(error, "Failed to load departments realtime analytics")
      )
    }
  }
)

/**
 * Department realtime analytics - one department
 * GET /api/v1/AttendanceAnalytics/rosters/{rosterId}/attendance/departments/{departmentId}/realtime
 */
export const getRosterDepartmentRealtime = createAsyncThunk(
  "rosterManagement/getRosterDepartmentRealtime",
  async ({ rosterId, departmentId }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get(
        `/api/v1/AttendanceAnalytics/rosters/${rosterId}/attendance/departments/${departmentId}/realtime`,
        { headers: getAuthHeaders() }
      )

      return {
        departmentId,
        data: unwrapAnalyticsResponse(res),
      }
    } catch (error) {
      return rejectWithValue(
        normalizeAnalyticsError(error, "Failed to load department realtime analytics")
      )
    }
  }
)

/**
 * Specialty / category realtime analytics
 * GET /api/v1/AttendanceAnalytics/rosters/{rosterId}/attendance/specialties/realtime
 */
export const getRosterSpecialtiesRealtime = createAsyncThunk(
  "rosterManagement/getRosterSpecialtiesRealtime",
  async ({ rosterId }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get(
        `/api/v1/AttendanceAnalytics/rosters/${rosterId}/attendance/specialties/realtime`,
        { headers: getAuthHeaders() }
      )

      return unwrapAnalyticsResponse(res)
    } catch (error) {
      return rejectWithValue(
        normalizeAnalyticsError(error, "Failed to load specialties realtime analytics")
      )
    }
  }
)

/**
 * Daily coverage gaps
 * GET /api/v1/AttendanceAnalytics/rosters/{rosterId}/coverage/{date}
 */
export const getRosterCoverageByDate = createAsyncThunk(
  "rosterManagement/getRosterCoverageByDate",
  async ({ rosterId, date }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get(
        `/api/v1/AttendanceAnalytics/rosters/${rosterId}/coverage/${date}`,
        { headers: getAuthHeaders() }
      )

      return {
        date,
        data: unwrapAnalyticsResponse(res),
      }
    } catch (error) {
      return rejectWithValue(
        normalizeAnalyticsError(error, "Failed to load roster coverage by date")
      )
    }
  }
)

/**
 * Critical coverage gaps
 * GET /api/v1/AttendanceAnalytics/rosters/{rosterId}/coverage/gaps/critical
 */
export const getRosterCriticalCoverageGaps = createAsyncThunk(
  "rosterManagement/getRosterCriticalCoverageGaps",
  async ({ rosterId }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get(
        `/api/v1/AttendanceAnalytics/rosters/${rosterId}/coverage/gaps/critical`,
        { headers: getAuthHeaders() }
      )

      return unwrapAnalyticsResponse(res)
    } catch (error) {
      return rejectWithValue(
        normalizeAnalyticsError(error, "Failed to load critical coverage gaps")
      )
    }
  }
)

/**
 * Weekly coverage
 * GET /api/v1/AttendanceAnalytics/rosters/{rosterId}/coverage/weekly/{weekStart}
 */
export const getRosterWeeklyCoverage = createAsyncThunk(
  "rosterManagement/getRosterWeeklyCoverage",
  async ({ rosterId, weekStart }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get(
        `/api/v1/AttendanceAnalytics/rosters/${rosterId}/coverage/weekly/${weekStart}`,
        { headers: getAuthHeaders() }
      )

      return unwrapAnalyticsResponse(res)
    } catch (error) {
      return rejectWithValue(
        normalizeAnalyticsError(error, "Failed to load weekly coverage")
      )
    }
  }
)

/**
 * Roster workload analysis
 * GET /api/v1/AttendanceAnalytics/rosters/{rosterId}/workload/{startDate}/{endDate}
 */
export const getRosterWorkload = createAsyncThunk(
  "rosterManagement/getRosterWorkload",
  async ({ rosterId, startDate, endDate }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get(
        `/api/v1/AttendanceAnalytics/rosters/${rosterId}/workload/${startDate}/${endDate}`,
        { headers: getAuthHeaders() }
      )

      return unwrapAnalyticsResponse(res)
    } catch (error) {
      return rejectWithValue(
        normalizeAnalyticsError(error, "Failed to load roster workload")
      )
    }
  }
)

/**
 * Roster workload distribution
 * GET /api/v1/AttendanceAnalytics/rosters/{rosterId}/workload/distribution/{startDate}/{endDate}
 */
export const getRosterWorkloadDistribution = createAsyncThunk(
  "rosterManagement/getRosterWorkloadDistribution",
  async ({ rosterId, startDate, endDate }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get(
        `/api/v1/AttendanceAnalytics/rosters/${rosterId}/workload/distribution/${startDate}/${endDate}`,
        { headers: getAuthHeaders() }
      )

      return unwrapAnalyticsResponse(res)
    } catch (error) {
      return rejectWithValue(
        normalizeAnalyticsError(error, "Failed to load workload distribution")
      )
    }
  }
)

/**
 * Doctor workload detail
 * GET /api/v1/AttendanceAnalytics/doctors/{doctorId}/workload/{startDate}/{endDate}
 */
export const getDoctorWorkloadAnalytics = createAsyncThunk(
  "rosterManagement/getDoctorWorkloadAnalytics",
  async ({ doctorId, startDate, endDate }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get(
        `/api/v1/AttendanceAnalytics/doctors/${doctorId}/workload/${startDate}/${endDate}`,
        { headers: getAuthHeaders() }
      )

      return unwrapAnalyticsResponse(res)
    } catch (error) {
      return rejectWithValue(
        normalizeAnalyticsError(error, "Failed to load doctor workload analytics")
      )
    }
  }
)

/**
 * Attendance heatmap
 * GET /api/v1/AttendanceAnalytics/rosters/{rosterId}/heatmap/{startDate}/{endDate}
 */
export const getRosterAttendanceHeatmap = createAsyncThunk(
  "rosterManagement/getRosterAttendanceHeatmap",
  async ({ rosterId, startDate, endDate }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get(
        `/api/v1/AttendanceAnalytics/rosters/${rosterId}/heatmap/${startDate}/${endDate}`,
        { headers: getAuthHeaders() }
      )

      return unwrapAnalyticsResponse(res)
    } catch (error) {
      return rejectWithValue(
        normalizeAnalyticsError(error, "Failed to load attendance heatmap")
      )
    }
  }
)
