import { createSlice } from "@reduxjs/toolkit"
import {
  getReports,
  getReportsAttend,
  getReportsAttendSummary,
  getDoctorReports,
  getDashboardData,
  exportExcel,
} from "../act/actReports"

const initialState = {
  reports: null,
  reportsAttend: null,

  loadingGetReports: false,
  loadingGetReportsAttend: false,

  getReportsError: null,
  getReportsAttendError: null,

  totalPages: 1,

  attendanceSummary: null,
  loadingAttendanceSummary: false,
  attendanceSummaryError: null,

  loadingExportReport: false,
  exportReportError: null,

  dashboardData: null,
  loadingGetDashboardData: false,
  dashboardError: null,
  lastUpdated: null,

  doctorReport: null,
  loadingDoctorReport: false,
  doctorReportError: null,
}

const getSafePageSize = (payload) => {
  return payload?.pageSize || payload?.reports?.pageSize || 20
}

const getSafeTotalPages = (payload) => {
  const reports = payload?.reports

  if (!reports) return 1

  const totalRecords = reports.totalRecords || reports.rows?.length || 0
  const pageSize = getSafePageSize(payload)

  if (!pageSize || pageSize <= 0) return 1

  return Math.max(1, Math.ceil(totalRecords / pageSize))
}

export const reportSlice = createSlice({
  name: "reports",
  initialState,
  reducers: {
    clearReports: (state) => {
      state.reports = null
      state.getReportsError = null
      state.totalPages = 1
    },

    clearReportsAttend: (state) => {
      state.reportsAttend = null
      state.getReportsAttendError = null
    },

    clearReportsError: (state) => {
      state.getReportsError = null
      state.getReportsAttendError = null
      state.attendanceSummaryError = null
      state.exportReportError = null
    },

    clearDashboardData: (state) => {
      state.dashboardData = null
      state.dashboardError = null
      state.lastUpdated = null
    },

    clearDashboardError: (state) => {
      state.dashboardError = null
    },

    clearDoctorReport: (state) => {
      state.doctorReport = null
      state.loadingDoctorReport = false
      state.doctorReportError = null
    },

    clearDoctorReportError: (state) => {
      state.doctorReportError = null
    },

    clearAttendanceSummary: (state) => {
      state.attendanceSummary = null
      state.attendanceSummaryError = null
      state.loadingAttendanceSummary = false
    },
  },

  extraReducers: (builder) => {
    builder
      // =========================
      // Monthly Schedule Reports
      // =========================
      .addCase(getReports.pending, (state) => {
        state.loadingGetReports = true
        state.getReportsError = null
      })

      .addCase(getReports.fulfilled, (state, action) => {
        state.loadingGetReports = false

        // actReports.js already returns unwrapped API data:
        // { reports: response.data.data || response.data, pageSize }
        state.reports = action.payload?.reports || null
        state.totalPages = getSafeTotalPages(action.payload)
        state.getReportsError = null
      })

      .addCase(getReports.rejected, (state, action) => {
        state.loadingGetReports = false
        state.getReportsError = action.payload || {
          message: "حدث خطأ في جلب تقرير الجدول الشهري",
        }
      })

      // =========================
      // Monthly Attendance Reports
      // =========================
      .addCase(getReportsAttend.pending, (state) => {
        state.loadingGetReportsAttend = true
        state.getReportsAttendError = null
      })

      .addCase(getReportsAttend.fulfilled, (state, action) => {
        state.loadingGetReportsAttend = false

        // actReports.js already returns unwrapped API data:
        // { reports: response.data.data || response.data, pageSize }
        state.reportsAttend = action.payload?.reports || null
        state.getReportsAttendError = null
      })

      .addCase(getReportsAttend.rejected, (state, action) => {
        state.loadingGetReportsAttend = false
        state.getReportsAttendError = action.payload || {
          message: "حدث خطأ في جلب تقرير الحضور الشهري",
        }
      })

      // =========================
      // Attendance Summary
      // =========================
      .addCase(getReportsAttendSummary.pending, (state) => {
        state.loadingAttendanceSummary = true
        state.attendanceSummaryError = null
      })

      .addCase(getReportsAttendSummary.fulfilled, (state, action) => {
        state.loadingAttendanceSummary = false
        state.attendanceSummary = action.payload || null
        state.attendanceSummaryError = null
      })

      .addCase(getReportsAttendSummary.rejected, (state, action) => {
        state.loadingAttendanceSummary = false
        state.attendanceSummaryError = action.payload || {
          message: "حدث خطأ في جلب ملخص الحضور",
        }
      })

      // =========================
      // Dashboard
      // =========================
      .addCase(getDashboardData.pending, (state) => {
        state.loadingGetDashboardData = true
        state.dashboardError = null
      })

      .addCase(getDashboardData.fulfilled, (state, action) => {
        state.loadingGetDashboardData = false
        state.dashboardData = action.payload?.data || action.payload || null
        state.lastUpdated = new Date().toISOString()
        state.dashboardError = null
      })

      .addCase(getDashboardData.rejected, (state, action) => {
        state.loadingGetDashboardData = false
        state.dashboardError = action.payload || {
          message: "حدث خطأ في جلب بيانات لوحة التحكم",
        }
        state.dashboardData = null
      })

      // =========================
      // Doctor Report
      // =========================
      .addCase(getDoctorReports.pending, (state) => {
        state.loadingDoctorReport = true
        state.doctorReportError = null
      })

      .addCase(getDoctorReports.fulfilled, (state, action) => {
        state.loadingDoctorReport = false
        state.doctorReport = action.payload?.data || action.payload || null
        state.doctorReportError = null
      })

      .addCase(getDoctorReports.rejected, (state, action) => {
        state.loadingDoctorReport = false
        state.doctorReportError = action.payload || {
          message: "حدث خطأ في جلب بيانات الدكتور",
        }
      })

      // =========================
      // Export Excel
      // =========================
      .addCase(exportExcel.pending, (state) => {
        state.loadingExportReport = true
        state.exportReportError = null
      })

      .addCase(exportExcel.fulfilled, (state) => {
        state.loadingExportReport = false
        state.exportReportError = null
      })

      .addCase(exportExcel.rejected, (state, action) => {
        state.loadingExportReport = false
        state.exportReportError = action.payload || {
          message: "حدث خطأ في تصدير التقرير",
        }
      })
  },
})

export const {
  clearReports,
  clearReportsAttend,
  clearReportsError,
  clearDashboardData,
  clearDashboardError,
  clearDoctorReport,
  clearDoctorReportError,
  clearAttendanceSummary,
} = reportSlice.actions

export default reportSlice.reducer