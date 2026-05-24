// src/state/act/actReports.js

import { createAsyncThunk } from "@reduxjs/toolkit"
import axiosInstance from "../../utils/axiosInstance"

const authHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("token")}`,
  "Content-Type": "application/json",
})

const unwrapApiResponse = (response) => {
  return response?.data?.data || response?.data
}

const appendIfExists = (params, key, value) => {
  if (value !== undefined && value !== null && value !== "") {
    params.append(key, value)
  }
}

export const getReports = createAsyncThunk(
  "reports/getReports",
  async (
    {
      month,
      year,
      categoryId,
      departmentId,
      doctorId,
      scientificDegreeId,
      contractingTypeId,
      pageSize,
    },
    { rejectWithValue }
  ) => {
    try {
      const params = new URLSearchParams()

      appendIfExists(params, "categoryId", categoryId)
      appendIfExists(params, "departmentId", departmentId)
      appendIfExists(params, "doctorId", doctorId)
      appendIfExists(params, "scientificDegreeId", scientificDegreeId)
      appendIfExists(params, "contractingTypeId", contractingTypeId)

      const queryString = params.toString()

      const url = `/api/v1/ScheduleReporting/monthly/${month}/${year}${
        queryString ? `?${queryString}` : ""
      }`

      const response = await axiosInstance.get(url, {
        headers: authHeaders(),
      })

      return {
        reports: unwrapApiResponse(response),
        pageSize,
      }
    } catch (error) {
      return rejectWithValue({
        message:
          error.response?.data?.messageAr ||
          error.response?.data?.messageEn ||
          "حدث خطأ في جلب تقرير الجدول الشهري",
        errors: error.response?.data?.errors || [],
        status: error.response?.status,
        timestamp: new Date().toISOString(),
      })
    }
  }
)

export const getReportsAttend = createAsyncThunk(
  "reports/getReportsAttend",
  async (
    {
      month,
      year,
      categoryId,
      departmentId,
      doctorId,
      scientificDegreeId,
      contractingTypeId,
      minAttendanceRate,
      maxAbsenceRate,
      pageSize,
    },
    { rejectWithValue }
  ) => {
    try {
      const params = new URLSearchParams()

      appendIfExists(params, "categoryId", categoryId)
      appendIfExists(params, "departmentId", departmentId)
      appendIfExists(params, "doctorId", doctorId)
      appendIfExists(params, "scientificDegreeId", scientificDegreeId)
      appendIfExists(params, "contractingTypeId", contractingTypeId)
      appendIfExists(params, "minAttendanceRate", minAttendanceRate)
      appendIfExists(params, "maxAbsenceRate", maxAbsenceRate)

      const queryString = params.toString()

      const url = `/api/v1/ScheduleReporting/attendance/monthly/${month}/${year}${
        queryString ? `?${queryString}` : ""
      }`

      const response = await axiosInstance.get(url, {
        headers: authHeaders(),
      })

      return {
        reports: unwrapApiResponse(response),
        pageSize,
      }
    } catch (error) {
      return rejectWithValue({
        message:
          error.response?.data?.messageAr ||
          error.response?.data?.messageEn ||
          "حدث خطأ في جلب تقرير الحضور الشهري",
        errors: error.response?.data?.errors || [],
        status: error.response?.status,
        timestamp: new Date().toISOString(),
      })
    }
  }
)

export const getReportsAttendSummary = createAsyncThunk(
  "reports/getReportsAttendSummary",
  async ({ month, year }, { rejectWithValue }) => {
    try {
      const url = `/api/v1/ScheduleReporting/attendance/summary/${month}/${year}`

      const response = await axiosInstance.get(url, {
        headers: authHeaders(),
      })

      return unwrapApiResponse(response)
    } catch (error) {
      return rejectWithValue({
        message:
          error.response?.data?.messageAr ||
          error.response?.data?.messageEn ||
          "حدث خطأ في جلب ملخص الحضور",
        errors: error.response?.data?.errors || [],
        status: error.response?.status,
        timestamp: new Date().toISOString(),
      })
    }
  }
)

export const exportExcel = createAsyncThunk(
  "reports/exportExcel",
  async (
    {
      month,
      year,
      categoryId,
      departmentId,
      doctorId,
      scientificDegreeId,
      contractingTypeId,
      language,
      format,
    },
    { rejectWithValue }
  ) => {
    try {
      const requestBody = {
        month,
        year,
        IncludeStatistics: true,
        IncludeCategories: true,
      }

      if (categoryId !== undefined && categoryId !== null) {
        requestBody.categoryId = categoryId
      }

      if (departmentId !== undefined && departmentId !== null) {
        requestBody.departmentId = departmentId
      }

      if (doctorId !== undefined && doctorId !== null) {
        requestBody.doctorId = doctorId
      }

      if (scientificDegreeId !== undefined && scientificDegreeId !== null) {
        requestBody.scientificDegreeId = scientificDegreeId
      }

      if (contractingTypeId !== undefined && contractingTypeId !== null) {
        requestBody.contractingTypeId = contractingTypeId
      }

      if (format !== undefined && format !== null) {
        requestBody.format = format
      }

      if (language !== undefined && language !== null) {
        requestBody.language = language
      }

      const response = await axiosInstance.post(
        `/api/v1/ScheduleReporting/export/excel`,
        requestBody,
        {
          headers: authHeaders(),
          responseType: "blob",
        }
      )

      return {
        blob: response.data,
        format,
        contentType: response.headers["content-type"],
      }
    } catch (error) {
      return rejectWithValue({
        message:
          error.response?.data?.messageAr ||
          error.response?.data?.messageEn ||
          "حدث خطأ في تصدير التقرير",
        errors: error.response?.data?.errors || [],
        status: error.response?.status,
        timestamp: new Date().toISOString(),
      })
    }
  }
)

export const getDashboardData = createAsyncThunk(
  "reports/getDashboardData",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/api/v1/Dashboard/overview`, {
        headers: authHeaders(),
      })

      return response.data
    } catch (error) {
      return rejectWithValue({
        message:
          error.response?.data?.messageAr ||
          error.response?.data?.messageEn ||
          "حدث خطأ في جلب بيانات لوحة التحكم",
        errors: error.response?.data?.errors || [],
        status: error.response?.status,
        timestamp: new Date().toISOString(),
      })
    }
  }
)

export const getDoctorReports = createAsyncThunk(
  "reports/getDoctorReports",
  async ({ doctorId, dateFrom, dateTo }, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams()

      appendIfExists(params, "DateFrom", dateFrom)
      appendIfExists(params, "DateTo", dateTo)

      const queryString = params.toString()

      const url = `/api/v1/Users/doctor/${doctorId}/report${
        queryString ? `?${queryString}` : ""
      }`

      const response = await axiosInstance.get(url, {
        headers: authHeaders(),
      })

      return response.data
    } catch (error) {
      return rejectWithValue({
        message:
          error.response?.data?.messageAr ||
          error.response?.data?.messageEn ||
          "حدث خطأ في جلب بيانات الدكتور",
        errors: error.response?.data?.errors || [],
        status: error.response?.status,
        timestamp: new Date().toISOString(),
      })
    }
  }
)