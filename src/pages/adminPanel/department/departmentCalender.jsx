import React, { useEffect, useMemo, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useSelector, useDispatch } from "react-redux"
import { useTranslation } from "react-i18next"
import * as ExcelJS from "exceljs"
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  BarChart3,
  CalendarDays,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Clock,
  Download,
  FileSpreadsheet,
  Grid3X3,
  List,
  RefreshCw,
  ShieldAlert,
  Target,
  Stethoscope,
  UserCheck,
  Users,
  XCircle,
} from "lucide-react"

import { getDepartmentRosterStructure } from "../../../state/act/actDepartment"
import {
  getRosterCoverageByDate,
  getRosterCriticalCoverageGaps,
  getRosterWeeklyCoverage,
} from "../../../state/act/actRosterManagement"
import { clearDepartmentRosterStructure } from "../../../state/slices/department"
import { formatDate } from "../../../utils/formtDate"
import { getPageTheme } from "../../../utils/themeClasses"

const safeArray = (value) => {
  if (Array.isArray(value)) return value
  if (Array.isArray(value?.items)) return value.items
  if (Array.isArray(value?.data)) return value.data
  if (Array.isArray(value?.data?.items)) return value.data.items
  if (Array.isArray(value?.rows)) return value.rows
  return []
}

const getNumber = (...values) => {
  for (const value of values) {
    if (value !== undefined && value !== null && value !== "") {
      const n = Number(value)
      return Number.isNaN(n) ? 0 : n
    }
  }

  return 0
}

const valueOrDash = (...values) => {
  for (const value of values) {
    if (value !== undefined && value !== null && value !== "") return value
  }

  return "-"
}

const getWeekStartDate = (dateString) => {
  const date = dateString ? parseDateKey(dateString) : new Date()
  const day = date.getDay()
  const weekStart = new Date(date)
  weekStart.setDate(date.getDate() - day)
  return formatDateKey(weekStart)
}

const getCoverageSeverityTone = (value) => {
  const normalized = String(value || "").toLowerCase()

  if (
    normalized.includes("critical") ||
    normalized.includes("high") ||
    normalized.includes("حرج") ||
    normalized.includes("عالي")
  ) {
    return "red"
  }

  if (
    normalized.includes("warning") ||
    normalized.includes("medium") ||
    normalized.includes("متوسط") ||
    normalized.includes("تحذير")
  ) {
    return "yellow"
  }

  if (
    normalized.includes("good") ||
    normalized.includes("healthy") ||
    normalized.includes("ok") ||
    normalized.includes("مكتمل")
  ) {
    return "green"
  }

  return "blue"
}

const getToneClasses = (tone = "blue") => {
  const map = {
    blue: {
      text: "text-blue-500",
      border: "border-blue-500",
      soft: "bg-transparent",
      bar: "bg-blue-500",
    },
    green: {
      text: "text-emerald-500",
      border: "border-emerald-500",
      soft: "bg-transparent",
      bar: "bg-emerald-500",
    },
    yellow: {
      text: "text-amber-500",
      border: "border-amber-500",
      soft: "bg-transparent",
      bar: "bg-amber-500",
    },
    red: {
      text: "text-red-500",
      border: "border-red-500",
      soft: "bg-transparent",
      bar: "bg-red-500",
    },
    purple: {
      text: "text-violet-500",
      border: "border-violet-500",
      soft: "bg-transparent",
      bar: "bg-violet-500",
    },
    orange: {
      text: "text-orange-500",
      border: "border-orange-500",
      soft: "bg-transparent",
      bar: "bg-orange-500",
    },
    slate: {
      text: "text-slate-500",
      border: "border-slate-500",
      soft: "bg-transparent",
      bar: "bg-slate-500",
    },
  }

  return map[tone] || map.blue
}

function DepartmentCalender() {
  const { rosterId, depId: id } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { i18n } = useTranslation()
  const theme = getPageTheme()

  const [activeTab, setActiveTab] = useState("calendar")
  const [expandedDays, setExpandedDays] = useState({})
  const [selectedDayDate, setSelectedDayDate] = useState(null)

  const currentLang = i18n.language || "ar"
  const isRTL = currentLang === "ar"

  const {
    departmentRosterStructure,
    departmentRosterData,
    rosterLookup,
    loadingGetDepartmentRosterStructure,
    departmentRosterStructureError,
    error,
  } = useSelector((state) => state.department)

  const {
    criticalCoverageGaps,
    coverageByDate,
    weeklyCoverage,
    loading: rosterLoading,
    errors: rosterErrors,
  } = useSelector((state) => state.rosterManagement)

  useEffect(() => {
    if (!id || !rosterId) return

    dispatch(clearDepartmentRosterStructure())

    dispatch(
      getDepartmentRosterStructure({
        departmentId: id,
        rosterId,
      })
    )

    return () => {
      dispatch(clearDepartmentRosterStructure())
    }
  }, [dispatch, id, rosterId])

  useEffect(() => {
    if (!rosterId) return

    const weekStart = getWeekStartDate(selectedDayDate)

    dispatch(getRosterCriticalCoverageGaps({ rosterId }))
    dispatch(getRosterWeeklyCoverage({ rosterId, weekStart }))
  }, [dispatch, rosterId, selectedDayDate])

  useEffect(() => {
    if (!rosterId || !selectedDayDate) return

    dispatch(
      getRosterCoverageByDate({
        rosterId,
        date: selectedDayDate,
      })
    )
  }, [dispatch, rosterId, selectedDayDate])

  const roster = useMemo(() => {
    if (departmentRosterStructure) return departmentRosterStructure

    if (Array.isArray(departmentRosterData) && departmentRosterData.length > 0) {
      return departmentRosterData[0]
    }

    return null
  }, [departmentRosterStructure, departmentRosterData])

  const daysList = useMemo(() => {
    if (Array.isArray(roster?.days)) return roster.days
    return []
  }, [roster])

  const daysByDate = useMemo(() => {
    const map = {}

    daysList.forEach((day) => {
      if (day?.date) {
        map[day.date] = day
      }
    })

    return map
  }, [daysList])

  const rosterTitle =
    roster?.rosterTitle ||
    roster?.title ||
    rosterLookup?.[rosterId]?.title ||
    (currentLang === "ar" ? "روستر القسم" : "Department Roster")

  const departmentName =
    getDepartmentNameFromRoster(roster, currentLang) ||
    (isRTL
      ? localStorage.getItem("departmentArabicName")
      : localStorage.getItem("departmentEnglishName")) ||
    (currentLang === "ar" ? "القسم" : "Department")

  const selectedDay = selectedDayDate ? daysByDate[selectedDayDate] : null

  const summary = useMemo(() => {
    const totalDays = daysList.length
    const completeDays = daysList.filter((day) => day.isComplete).length

    const emptyDays = daysList.filter(
      (day) => Number(day.totalAssigned || 0) === 0
    ).length

    const partialDays = daysList.filter(
      (day) =>
        !day.isComplete &&
        Number(day.totalAssigned || 0) > 0 &&
        Number(day.totalShortfall || 0) > 0
    ).length

    const totalRequired = daysList.reduce(
      (sum, day) => sum + Number(day.totalRequired || 0),
      0
    )

    const totalAssigned = daysList.reduce(
      (sum, day) => sum + Number(day.totalAssigned || 0),
      0
    )

    const totalShortfall = daysList.reduce(
      (sum, day) => sum + Number(day.totalShortfall || 0),
      0
    )

    const totalPresent = daysList.reduce(
      (sum, day) => sum + Number(day.attendanceStats?.totalPresent || 0),
      0
    )

    const totalAbsent = daysList.reduce(
      (sum, day) => sum + Number(day.attendanceStats?.totalAbsent || 0),
      0
    )

    const totalLate = daysList.reduce(
      (sum, day) => sum + Number(day.attendanceStats?.totalLate || 0),
      0
    )

    const totalNotRecorded = daysList.reduce(
      (sum, day) => sum + Number(day.attendanceStats?.totalNotRecorded || 0),
      0
    )

    const completionPercentage =
      totalRequired > 0 ? Math.round((totalAssigned / totalRequired) * 100) : 0

    const attendanceRate =
      totalAssigned > 0
        ? Math.round((totalPresent / Math.max(totalAssigned, 1)) * 100)
        : 0

    return {
      totalDays,
      completeDays,
      partialDays,
      emptyDays,
      totalRequired,
      totalAssigned,
      totalShortfall,
      completionPercentage,
      totalPresent,
      totalAbsent,
      totalLate,
      totalNotRecorded,
      attendanceRate,
    }
  }, [daysList])

  const formatTime = (timeString) => {
    if (!timeString) return "-"

    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString(
      currentLang === "ar" ? "ar-EG" : "en-US",
      {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }
    )
  }

  const getCompletionTone = (percentage = 0) => {
    const value = Number(percentage || 0)

    if (value >= 90) {
      return {
        text: "text-emerald-500 dark:text-emerald-500",
        bg: "bg-transparent",
        border: "border-emerald-500 dark:border-emerald-500",
        bar: "bg-emerald-500",
      }
    }

    if (value >= 70) {
      return {
        text: "text-amber-500 dark:text-amber-500",
        bg: "bg-transparent",
        border: "border-amber-500 dark:border-amber-500",
        bar: "bg-amber-500",
      }
    }

    return {
      text: "text-red-500 dark:text-red-500",
      bg: "bg-transparent",
      border: "border-red-500 dark:border-red-500",
      bar: "bg-red-500",
    }
  }

  const getStatusTone = (status) => {
    const normalized = String(status || "").toLowerCase()

    if (normalized === "complete" || normalized === "completed") {
      return "bg-transparent text-emerald-500 border-2 border-emerald-500 dark:bg-transparent dark:text-emerald-500 dark:border-emerald-500"
    }

    if (normalized === "partial" || normalized === "inprogress") {
      return "bg-transparent text-amber-500 border-2 border-amber-500 dark:bg-transparent dark:text-amber-500 dark:border-amber-500"
    }

    if (normalized === "empty") {
      return "bg-transparent text-red-500 border-2 border-red-500 dark:bg-transparent dark:text-red-500 dark:border-red-500"
    }

    return "bg-transparent text-slate-500 border-2 border-slate-500 dark:bg-transparent dark:text-slate-500 dark:border-slate-500"
  }

  const getDayName = (day) => {
    return currentLang === "ar"
      ? day.dayOfWeekNameAr || day.dayOfWeekNameEn || "-"
      : day.dayOfWeekNameEn || day.dayOfWeekNameAr || "-"
  }

  const getShiftName = (shift) => {
    return currentLang === "ar"
      ? shift.shiftNameAr || shift.shiftNameEn || "-"
      : shift.shiftNameEn || shift.shiftNameAr || "-"
  }

  const getContractingTypeName = (shift) => {
    return currentLang === "ar"
      ? shift.contractingTypeNameAr || shift.contractingTypeNameEn || "-"
      : shift.contractingTypeNameEn || shift.contractingTypeNameAr || "-"
  }

  const getDoctorName = (doctor) => {
    return currentLang === "ar"
      ? doctor.doctorNameAr ||
          doctor.nameArabic ||
          doctor.fullNameAr ||
          doctor.doctorNameEn ||
          doctor.nameEnglish ||
          "-"
      : doctor.doctorNameEn ||
          doctor.nameEnglish ||
          doctor.fullNameEn ||
          doctor.doctorNameAr ||
          doctor.nameArabic ||
          "-"
  }

  const toggleDay = (date) => {
    setExpandedDays((prev) => ({
      ...prev,
      [date]: !prev[date],
    }))
  }

  const expandAll = () => {
    const next = {}
    daysList.forEach((day) => {
      next[day.date] = true
    })
    setExpandedDays(next)
  }

  const collapseAll = () => {
    setExpandedDays({})
  }

  const refreshData = () => {
    if (!id || !rosterId) return

    dispatch(
      getDepartmentRosterStructure({
        departmentId: id,
        rosterId,
      })
    )

    dispatch(getRosterCriticalCoverageGaps({ rosterId }))

    dispatch(
      getRosterWeeklyCoverage({
        rosterId,
        weekStart: getWeekStartDate(selectedDayDate),
      })
    )

    if (selectedDayDate) {
      dispatch(
        getRosterCoverageByDate({
          rosterId,
          date: selectedDayDate,
        })
      )
    }
  }

  const exportToExcel = async () => {
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet(
      currentLang === "ar" ? "هيكل الروستر" : "Roster Structure"
    )

    const shiftsMap = new Map()
    const allDates = new Set()

    daysList.forEach((dayData) => {
      allDates.add(dayData.date)

      const shifts = Array.isArray(dayData.shifts) ? dayData.shifts : []

      shifts.forEach((shift) => {
        const shiftKey = `${shift.shiftNameEn || shift.shiftNameAr || "Shift"}-${
          shift.contractingTypeNameEn || shift.contractingTypeNameAr || "Type"
        }`

        if (!shiftsMap.has(shiftKey)) {
          shiftsMap.set(shiftKey, {
            shiftNameEn: shift.shiftNameEn || shift.shiftNameAr || "Shift",
            shiftNameAr: shift.shiftNameAr || shift.shiftNameEn || "شفت",
            contractingTypeNameEn:
              shift.contractingTypeNameEn || shift.contractingTypeNameAr || "-",
            contractingTypeNameAr:
              shift.contractingTypeNameAr || shift.contractingTypeNameEn || "-",
          })
        }
      })
    })

    const sortedDates = Array.from(allDates).sort()
    const columns = Array.from(shiftsMap.values())
    const totalCols = Math.max(4 + columns.length, 5)

    worksheet.mergeCells(1, 1, 1, totalCols)
    const titleCell = worksheet.getCell(1, 1)
    titleCell.value = `${departmentName} - ${rosterTitle}`
    titleCell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF1E40AF" },
    }
    titleCell.font = {
      bold: true,
      size: 16,
      color: { argb: "FFFFFFFF" },
      name: "Arial",
    }
    titleCell.alignment = { horizontal: "center", vertical: "middle" }
    worksheet.getRow(1).height = 35

    worksheet.mergeCells(2, 1, 2, totalCols)
    const dateRangeCell = worksheet.getCell(2, 1)
    dateRangeCell.value = `${roster?.startDate || "-"} → ${roster?.endDate || "-"}`
    dateRangeCell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF2563EB" },
    }
    dateRangeCell.font = {
      bold: true,
      size: 12,
      color: { argb: "FFFFFFFF" },
      name: "Arial",
    }
    dateRangeCell.alignment = { horizontal: "center", vertical: "middle" }
    worksheet.getRow(2).height = 28

    const baseHeaders = [
      currentLang === "ar" ? "التاريخ" : "Date",
      currentLang === "ar" ? "اليوم" : "Day",
      currentLang === "ar" ? "المطلوب" : "Required",
      currentLang === "ar" ? "المعين" : "Assigned",
    ]

    baseHeaders.forEach((header, index) => {
      const cell = worksheet.getCell(3, index + 1)
      cell.value = header
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF60A5FA" },
      }
      cell.font = {
        bold: true,
        color: { argb: "FFFFFFFF" },
        name: "Arial",
      }
      cell.alignment = { horizontal: "center", vertical: "middle" }
    })

    columns.forEach((column, index) => {
      const cell = worksheet.getCell(3, index + 5)
      cell.value =
        currentLang === "ar"
          ? `${column.shiftNameAr} - ${column.contractingTypeNameAr}`
          : `${column.shiftNameEn} - ${column.contractingTypeNameEn}`

      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF60A5FA" },
      }
      cell.font = {
        bold: true,
        color: { argb: "FFFFFFFF" },
        name: "Arial",
      }
      cell.alignment = {
        horizontal: "center",
        vertical: "middle",
        wrapText: true,
      }
    })

    let currentRow = 4

    sortedDates.forEach((date) => {
      const dayData = daysList.find((day) => day.date === date)
      if (!dayData) return

      worksheet.getCell(currentRow, 1).value = new Date(date).toLocaleDateString(
        currentLang === "ar" ? "ar-EG" : "en-US"
      )
      worksheet.getCell(currentRow, 2).value = getDayName(dayData)
      worksheet.getCell(currentRow, 3).value = dayData.totalRequired || 0
      worksheet.getCell(currentRow, 4).value = dayData.totalAssigned || 0

      columns.forEach((column, index) => {
        const shift = dayData.shifts?.find((item) => {
          const sameShift =
            (item.shiftNameEn || item.shiftNameAr) === column.shiftNameEn ||
            (item.shiftNameAr || item.shiftNameEn) === column.shiftNameAr

          const sameType =
            (item.contractingTypeNameEn || item.contractingTypeNameAr) ===
              column.contractingTypeNameEn ||
            (item.contractingTypeNameAr || item.contractingTypeNameEn) ===
              column.contractingTypeNameAr

          return sameShift && sameType
        })

        const cell = worksheet.getCell(currentRow, index + 5)

        if (!shift) {
          cell.value = "-"
        } else {
          const doctorNames = Array.isArray(shift.doctors)
            ? shift.doctors.map((doctor) => getDoctorName(doctor)).join(" - ")
            : ""

          cell.value = `${shift.assignedDoctors || 0}/${
            shift.requiredDoctors || 0
          }${doctorNames ? `\n${doctorNames}` : ""}`

          cell.alignment = {
            horizontal: "center",
            vertical: "middle",
            wrapText: true,
          }
        }
      })

      currentRow += 1
    })

    worksheet.eachRow((row) => {
      row.eachCell((cell) => {
        cell.border = {
          top: { style: "thin", color: { argb: "FFD1D5DB" } },
          bottom: { style: "thin", color: { argb: "FFD1D5DB" } },
          left: { style: "thin", color: { argb: "FFD1D5DB" } },
          right: { style: "thin", color: { argb: "FFD1D5DB" } },
        }
      })
    })

    worksheet.getColumn(1).width = 14
    worksheet.getColumn(2).width = 14
    worksheet.getColumn(3).width = 12
    worksheet.getColumn(4).width = 12

    for (let col = 5; col <= totalCols; col++) {
      worksheet.getColumn(col).width = 34
    }

    const buffer = await workbook.xlsx.writeBuffer()
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    })

    const url = window.URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `${departmentName}_${rosterTitle}.xlsx`
    link.click()
    window.URL.revokeObjectURL(url)
  }

  const errorToShow = departmentRosterStructureError || error
  const completionTone = getCompletionTone(summary.completionPercentage)
  const attendanceTone = getCompletionTone(summary.attendanceRate)

  const safeCriticalCoverageGaps = safeArray(criticalCoverageGaps)

  const selectedDayCoverageGaps =
    coverageByDate?.date === selectedDayDate
      ? safeArray(coverageByDate?.data)
      : safeArray(coverageByDate)

  const weeklyCoverageItems = (() => {
    const fromDays = safeArray(weeklyCoverage?.days)
    if (fromDays.length) return fromDays

    const fromDaily = safeArray(weeklyCoverage?.dailyCoverage)
    if (fromDaily.length) return fromDaily

    const fromItems = safeArray(weeklyCoverage?.items)
    if (fromItems.length) return fromItems

    return safeArray(weeklyCoverage)
  })()

  if (loadingGetDepartmentRosterStructure) {
    return (
      <div className={theme.page} dir={isRTL ? "rtl" : "ltr"}>
        <div className="max-w-7xl mx-auto">
          <InlineLoader
            text={
              currentLang === "ar"
                ? "جاري تحميل هيكل الروستر..."
                : "Loading roster structure..."
            }
          />
        </div>
      </div>
    )
  }

  if (errorToShow) {
    return (
      <div className={theme.page} dir={isRTL ? "rtl" : "ltr"}>
        <div className="max-w-5xl mx-auto">
          <div className={`${theme.card} p-8 text-center`}>
            <XCircle className="w-14 h-14 text-red-500 dark:text-red-500 mx-auto mb-4" />

            <h2 className="text-2xl font-bold text-[var(--color-text)] mb-2">
              {currentLang === "ar"
                ? "تعذر تحميل هيكل الروستر"
                : "Failed to load roster structure"}
            </h2>

            <p className="text-[var(--color-text-muted)] mb-6">
              {errorToShow?.message || String(errorToShow)}
            </p>

            <button
              type="button"
              onClick={() => navigate(`/admin-panel/department/${id}`)}
              className={theme.primaryButton}
            >
              {isRTL ? <ArrowRight size={16} /> : <ArrowLeft size={16} />}
              {currentLang === "ar" ? "رجوع للقسم" : "Back to Department"}
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!roster) {
    return (
      <div className={theme.page} dir={isRTL ? "rtl" : "ltr"}>
        <div className="max-w-5xl mx-auto">
          <div className={`${theme.card} p-8 text-center`}>
            <CalendarDays className="w-14 h-14 mx-auto mb-4 text-[var(--color-text-muted)]" />

            <h2 className="text-2xl font-bold text-[var(--color-text)] mb-2">
              {currentLang === "ar" ? "لا توجد بيانات" : "No data found"}
            </h2>

            <p className="text-[var(--color-text-muted)] mb-6">
              {currentLang === "ar"
                ? "لم يتم العثور على بيانات لهذا الروستر."
                : "No roster structure data was found."}
            </p>

            <button
              type="button"
              onClick={() => navigate(`/admin-panel/department/${id}`)}
              className={theme.primaryButton}
            >
              {isRTL ? <ArrowRight size={16} /> : <ArrowLeft size={16} />}
              {currentLang === "ar" ? "رجوع للقسم" : "Back to Department"}
            </button>
          </div>
        </div>
      </div>
    )
  }

  const tabItems = [
    {
      id: "calendar",
      icon: Grid3X3,
      tone: "blue",
      label: currentLang === "ar" ? "التقويم" : "Calendar",
      description:
        currentLang === "ar"
          ? "عرض الأيام على شكل تقويم مختصر."
          : "Compact calendar view for roster days.",
    },
    {
      id: "rows",
      icon: List,
      tone: "purple",
      label: currentLang === "ar" ? "الصفوف" : "Rows",
      description:
        currentLang === "ar"
          ? "عرض تفصيلي قابل للفتح والإغلاق."
          : "Expandable detailed rows view.",
    },
    {
      id: "coverage",
      icon: ShieldAlert,
      tone: "red",
      label: currentLang === "ar" ? "التغطية" : "Coverage",
      description:
        currentLang === "ar"
          ? "الفجوات الحرجة والتغطية الأسبوعية."
          : "Critical gaps and weekly coverage.",
    },
  ]

  return (
    <div className={theme.page} dir={isRTL ? "rtl" : "ltr"}>
      <div className="max-w-7xl mx-auto space-y-5">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <button
            type="button"
            onClick={() => navigate(`/admin-panel/department/${id}`)}
            className="inline-flex items-center gap-2 text-sm font-bold text-[var(--color-text-muted)] hover:text-emerald-500 transition-colors"
          >
            {isRTL ? <ArrowRight size={16} /> : <ArrowLeft size={16} />}
            {currentLang === "ar" ? "رجوع للقسم" : "Back to Department"}
          </button>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={refreshData}
              className={theme.secondaryButton}
            >
              <RefreshCw size={16} />
              {currentLang === "ar" ? "تحديث" : "Refresh"}
            </button>

            {activeTab === "rows" && (
              <>
                <button
                  type="button"
                  onClick={daysList.length > 0 ? expandAll : undefined}
                  disabled={daysList.length === 0}
                  className={`${theme.secondaryButton} disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  <ChevronDown size={16} />
                  {currentLang === "ar" ? "فتح الكل" : "Expand All"}
                </button>

                <button
                  type="button"
                  onClick={collapseAll}
                  className={theme.secondaryButton}
                >
                  <ChevronUp size={16} />
                  {currentLang === "ar" ? "غلق الكل" : "Collapse All"}
                </button>
              </>
            )}

            <button
              type="button"
              onClick={exportToExcel}
              disabled={daysList.length === 0}
              className={`${theme.primaryButton} gap-2 disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <Download size={16} />
              {currentLang === "ar" ? "تحميل Excel" : "Download Excel"}
            </button>
          </div>
        </div>

        <div className={`${theme.card} p-5 lg:p-6`}>
          <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
            <div className="flex items-start gap-4 min-w-0">
              <div className="w-14 h-14 rounded-2xl bg-transparent text-blue-500 border-2 border-blue-500 flex items-center justify-center shadow-sm shrink-0">
                <CalendarDays className="w-7 h-7" />
              </div>

              <div className="min-w-0">
                <p className="text-sm font-bold text-[var(--color-text-muted)] mb-1">
                  {departmentName}
                </p>

                <h1 className="text-2xl lg:text-3xl font-extrabold text-[var(--color-text)] break-words">
                  {rosterTitle}
                </h1>

                <div className="flex flex-wrap gap-2 mt-3">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-transparent text-slate-500 border-2 border-slate-500">
                    {roster.startDate || "-"} → {roster.endDate || "-"}
                  </span>

                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold border-2 ${completionTone.bg} ${completionTone.text} ${completionTone.border}`}
                  >
                    {currentLang === "ar" ? "تغطية الجدول" : "Roster Coverage"}: {summary.completionPercentage}%
                  </span>

                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold border-2 ${attendanceTone.bg} ${attendanceTone.text} ${attendanceTone.border}`}
                  >
                    {currentLang === "ar" ? "الحضور" : "Attendance"}: {summary.attendanceRate}%
                  </span>

                  {summary.totalShortfall > 0 && (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-transparent text-red-500 border-2 border-red-500 dark:bg-transparent dark:text-red-500 dark:border-red-500">
                      {currentLang === "ar" ? "النقص" : "Shortfall"}: {summary.totalShortfall}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="w-full xl:w-[360px]">
              <ProgressBar
                label={currentLang === "ar" ? "تغطية الروستر" : "Roster Coverage"}
                percentage={summary.completionPercentage}
                tone={completionTone}
              />

              <div className="mt-4">
                <ProgressBar
                  label={currentLang === "ar" ? "نسبة الحضور" : "Attendance Rate"}
                  percentage={summary.attendanceRate}
                  tone={attendanceTone}
                />
              </div>
            </div>
          </div>
        </div>

        <div className={`${theme.card} p-4 lg:p-5 sticky top-20 z-20 backdrop-blur supports-[backdrop-filter]:bg-[var(--color-surface)]/95`}>
          <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
            <div className="min-w-0">
              <h2 className="text-lg font-extrabold text-[var(--color-text)] flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-emerald-500" />
                {currentLang === "ar" ? "ملخص الروستر" : "Roster Summary"}
              </h2>
              <p className="text-xs font-semibold text-[var(--color-text-muted)] mt-1">
                {currentLang === "ar"
                  ? "الأرقام الأساسية ثابتة هنا، وتنقل بين التقويم والصفوف والتغطية من التابات بالأسفل."
                  : "Key metrics stay visible here; switch between Calendar, Rows, and Coverage below."}
              </p>
            </div>

            {summary.totalShortfall > 0 && (
              <div className="flex items-start gap-2 rounded-2xl border-2 border-amber-500 bg-transparent px-3 py-2 text-amber-500">
                <AlertTriangle className="w-5 h-5 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-black">
                    {currentLang === "ar" ? "تنبيه نقص" : "Shortfall Alert"}
                  </p>
                  <p className="text-xs font-bold text-[var(--color-text-muted)]">
                    {currentLang === "ar"
                      ? `${summary.totalShortfall} طبيب ناقص`
                      : `${summary.totalShortfall} doctors short`}
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-3 mt-4">
            <StatCard icon={CalendarDays} title={currentLang === "ar" ? "الأيام" : "Days"} value={summary.totalDays} tone="blue" compact />
            <StatCard icon={CheckCircle} title={currentLang === "ar" ? "مكتملة" : "Complete"} value={summary.completeDays} tone="green" compact />
            <StatCard icon={BarChart3} title={currentLang === "ar" ? "جزئية" : "Partial"} value={summary.partialDays} tone="yellow" compact />
            <StatCard icon={XCircle} title={currentLang === "ar" ? "فارغة" : "Empty"} value={summary.emptyDays} tone="red" compact />
            <StatCard icon={Users} title={currentLang === "ar" ? "مطلوب" : "Required"} value={summary.totalRequired} tone="orange" compact />
            <StatCard icon={Stethoscope} title={currentLang === "ar" ? "معين" : "Assigned"} value={summary.totalAssigned} tone="purple" compact />
            <StatCard icon={UserCheck} title={currentLang === "ar" ? "حاضر" : "Present"} value={summary.totalPresent} tone="green" compact />
            <StatCard icon={AlertTriangle} title={currentLang === "ar" ? "غير مسجل" : "Not Recorded"} value={summary.totalNotRecorded} tone="yellow" compact />
          </div>
        </div>

        <div className={`${theme.card} p-3 sticky top-[265px] z-10 backdrop-blur supports-[backdrop-filter]:bg-[var(--color-surface)]/95`}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {tabItems.map((item) => (
              <DepartmentRosterTab
                key={item.id}
                item={item}
                active={activeTab === item.id}
                onClick={() => setActiveTab(item.id)}
              />
            ))}
          </div>
        </div>

        {activeTab === "coverage" && (
          <div className="space-y-5">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
              <CriticalCoveragePanel
                theme={theme}
                currentLang={currentLang}
                criticalGaps={safeCriticalCoverageGaps}
                loading={rosterLoading?.criticalCoverageGaps}
                error={rosterErrors?.criticalCoverageGaps}
              />

              <WeeklyCoveragePanel
                theme={theme}
                currentLang={currentLang}
                weeklyItems={weeklyCoverageItems}
                loading={rosterLoading?.weeklyCoverage}
                error={rosterErrors?.weeklyCoverage}
              />
            </div>

            {selectedDayDate && (
              <SelectedDayCoveragePanel
                theme={theme}
                currentLang={currentLang}
                selectedDayDate={selectedDayDate}
                selectedDay={selectedDay}
                coverageGaps={selectedDayCoverageGaps}
                loading={rosterLoading?.coverageByDate}
                error={rosterErrors?.coverageByDate}
              />
            )}
          </div>
        )}

        {activeTab === "calendar" && (
          <CalendarView
            roster={roster}
            daysByDate={daysByDate}
            selectedDayDate={selectedDayDate}
            setSelectedDayDate={setSelectedDayDate}
            selectedDay={selectedDay}
            currentLang={currentLang}
            formatDate={formatDate}
            formatTime={formatTime}
            getDayName={getDayName}
            getShiftName={getShiftName}
            getContractingTypeName={getContractingTypeName}
            getDoctorName={getDoctorName}
            getStatusTone={getStatusTone}
            getCompletionTone={getCompletionTone}
          />
        )}

        {activeTab === "rows" && (
          <RowsView
            daysList={daysList}
            expandedDays={expandedDays}
            toggleDay={toggleDay}
            currentLang={currentLang}
            isRTL={isRTL}
            formatDate={formatDate}
            formatTime={formatTime}
            getDayName={getDayName}
            getShiftName={getShiftName}
            getContractingTypeName={getContractingTypeName}
            getDoctorName={getDoctorName}
            getStatusTone={getStatusTone}
            getCompletionTone={getCompletionTone}
          />
        )}
      </div>
    </div>
  )
}

function DepartmentRosterTab({ item, active, onClick }) {
  const Icon = item.icon
  const tone = getToneClasses(item.tone)

  return (
    <button
      type="button"
      onClick={onClick}
      className={`group min-h-[92px] rounded-2xl border-2 p-3 text-start transition-all ${
        active
          ? "bg-[var(--color-success)] text-white border-[var(--color-success)] shadow-md"
          : `bg-transparent ${tone.border} hover:bg-[var(--color-success)] hover:border-[var(--color-success)] hover:text-white`
      }`}
    >
      <div className="flex items-start gap-3">
        <span
          className={`w-11 h-11 rounded-xl flex items-center justify-center border-2 shrink-0 transition-colors ${
            active
              ? "bg-transparent text-white border-white/80"
              : `bg-transparent ${tone.text} ${tone.border} group-hover:text-white group-hover:border-white/80`
          }`}
        >
          <Icon size={20} />
        </span>

        <span className="min-w-0">
          <span
            className={`block text-sm font-black ${
              active ? "text-white" : "text-[var(--color-text)] group-hover:text-white"
            }`}
          >
            {item.label}
          </span>

          <span
            className={`block text-xs mt-1 leading-relaxed ${
              active
                ? "text-white/85"
                : "text-[var(--color-text-muted)] group-hover:text-white/85"
            }`}
          >
            {item.description}
          </span>
        </span>
      </div>
    </button>
  )
}

function getDepartmentNameFromRoster(roster, currentLang) {
  if (!roster?.days?.length) return ""

  const firstShift = roster.days
    .flatMap((day) => (Array.isArray(day.shifts) ? day.shifts : []))
    .find(Boolean)

  if (!firstShift) return ""

  return currentLang === "ar"
    ? firstShift.departmentNameAr || firstShift.departmentNameEn || ""
    : firstShift.departmentNameEn || firstShift.departmentNameAr || ""
}

function formatDateKey(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")

  return `${year}-${month}-${day}`
}

function parseDateKey(dateKey) {
  const [year, month, day] = String(dateKey).split("-").map(Number)
  return new Date(year, month - 1, day)
}

function buildCalendarCells(roster, daysByDate) {
  const dayKeys = Object.keys(daysByDate).sort()

  const startKey = roster?.startDate || dayKeys[0]
  const endKey = roster?.endDate || dayKeys[dayKeys.length - 1]

  if (!startKey || !endKey) return []

  const startDate = parseDateKey(startKey)
  const endDate = parseDateKey(endKey)

  const cells = []
  const leadingEmpty = startDate.getDay()

  for (let i = 0; i < leadingEmpty; i += 1) {
    cells.push({ type: "empty", key: `empty-start-${i}` })
  }

  const cursor = new Date(startDate)

  while (cursor <= endDate) {
    const key = formatDateKey(cursor)

    cells.push({
      type: "day",
      key,
      dateKey: key,
      day: daysByDate[key] || null,
    })

    cursor.setDate(cursor.getDate() + 1)
  }

  return cells
}

function CalendarView({
  roster,
  daysByDate,
  selectedDayDate,
  setSelectedDayDate,
  selectedDay,
  currentLang,
  formatDate,
  formatTime,
  getDayName,
  getShiftName,
  getContractingTypeName,
  getDoctorName,
  getStatusTone,
  getCompletionTone,
}) {
  const cells = buildCalendarCells(roster, daysByDate)

  const weekDays =
    currentLang === "ar"
      ? ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"]
      : ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  if (!cells.length) {
    return (
      <EmptyState
        title={currentLang === "ar" ? "لا يوجد تقويم" : "No calendar"}
        description={
          currentLang === "ar"
            ? "لا توجد أيام كافية لبناء عرض التقويم."
            : "There are not enough days to build the calendar view."
        }
      />
    )
  }

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm overflow-hidden">
        <div className="grid grid-cols-7 border-b border-[var(--color-border)]">
          {weekDays.map((day) => (
            <div
              key={day}
              className="p-3 text-center text-xs md:text-sm font-extrabold text-[var(--color-text-muted)] bg-[var(--color-bg-soft)] border-e border-[var(--color-border)] last:border-e-0"
            >
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7">
          {cells.map((cell) => {
            if (cell.type === "empty") {
              return (
                <div
                  key={cell.key}
                  className="min-h-[125px] border-e border-b border-[var(--color-border)] bg-[var(--color-bg-soft)]/40"
                />
              )
            }

            const day = cell.day
            const dateObj = parseDateKey(cell.dateKey)
            const dayNumber = dateObj.getDate()

            if (!day) {
              return (
                <div
                  key={cell.key}
                  className="min-h-[125px] p-2 border-e border-b border-[var(--color-border)] bg-[var(--color-bg-soft)]/40"
                >
                  <span className="text-sm font-bold text-[var(--color-text-muted)]">
                    {dayNumber}
                  </span>
                </div>
              )
            }

            const required = Number(day.totalRequired || 0)
            const assigned = Number(day.totalAssigned || 0)
            const shortfall = Number(day.totalShortfall || 0)
            const completion = required > 0 ? Math.round((assigned / required) * 100) : 0
            const tone = getCompletionTone(completion)
            const isSelected = selectedDayDate === day.date

            return (
              <button
                type="button"
                key={cell.key}
                onClick={() => setSelectedDayDate(day.date)}
                className={`min-h-[125px] p-2 text-start border-e border-b border-[var(--color-border)] transition-all ${
                  isSelected
                    ? "bg-[var(--color-primary-soft)] ring-2 ring-[var(--color-primary)] ring-inset"
                    : "bg-[var(--color-surface)] hover:bg-[var(--color-bg-soft)]"
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-sm font-extrabold text-[var(--color-text)]">
                    {dayNumber}
                  </span>

                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${tone.bg} ${tone.text} ${tone.border}`}
                  >
                    {completion}%
                  </span>
                </div>

                <p className="text-[11px] font-bold text-[var(--color-text-muted)] mb-2">
                  {getDayName(day)}
                </p>

                <div className="space-y-1">
                  <CalendarMiniLine
                    label={currentLang === "ar" ? "مطلوب" : "Req"}
                    value={required}
                  />
                  <CalendarMiniLine
                    label={currentLang === "ar" ? "معين" : "Asg"}
                    value={assigned}
                  />
                  <CalendarMiniLine
                    label={currentLang === "ar" ? "نقص" : "Short"}
                    value={shortfall}
                    danger={shortfall > 0}
                  />
                </div>

                <div className="w-full h-1.5 rounded-full bg-[var(--color-bg-soft)] overflow-hidden mt-2">
                  <div
                    className={`h-full rounded-full ${tone.bar}`}
                    style={{ width: `${Math.min(completion, 100)}%` }}
                  />
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {selectedDay ? (
        <DayDetails
          day={selectedDay}
          currentLang={currentLang}
          formatTime={formatTime}
          formatDate={formatDate}
          getDayName={getDayName}
          getShiftName={getShiftName}
          getContractingTypeName={getContractingTypeName}
          getDoctorName={getDoctorName}
          getStatusTone={getStatusTone}
          getCompletionTone={getCompletionTone}
        />
      ) : (
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm p-6 text-center">
          <CalendarDays className="w-10 h-10 mx-auto mb-3 text-[var(--color-text-muted)]" />
          <p className="font-bold text-[var(--color-text)]">
            {currentLang === "ar"
              ? "اختار يوم من التقويم لعرض التفاصيل"
              : "Select a day from the calendar to view details"}
          </p>
        </div>
      )}
    </div>
  )
}

function RowsView({
  daysList,
  expandedDays,
  toggleDay,
  currentLang,
  formatDate,
  formatTime,
  getDayName,
  getShiftName,
  getContractingTypeName,
  getDoctorName,
  getStatusTone,
  getCompletionTone,
}) {
  return (
    <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm p-5">
      <div className="flex items-center justify-between gap-3 flex-wrap mb-5">
        <div>
          <h2 className="text-xl font-extrabold text-[var(--color-text)] flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-blue-500 dark:text-blue-500" />
            {currentLang === "ar" ? "عرض الصفوف" : "Rows View"}
          </h2>

          <p className="text-sm text-[var(--color-text-muted)] mt-1">
            {currentLang === "ar"
              ? "افتح اليوم لمراجعة الشفتات والتعيينات والحضور."
              : "Expand a day to review shifts, assignments, and attendance."}
          </p>
        </div>

        <span className="text-sm font-bold text-[var(--color-text-muted)]">
          {currentLang === "ar" ? "عدد الأيام" : "Days Count"}: {daysList.length}
        </span>
      </div>

      {daysList.length === 0 ? (
        <EmptyState
          title={
            currentLang === "ar"
              ? "لا توجد أيام في هذا الروستر"
              : "No days found"
          }
          description={
            currentLang === "ar"
              ? "لا توجد أيام مسجلة في هيكل هذا الروستر."
              : "No days are registered in this roster structure."
          }
        />
      ) : (
        <div className="space-y-4">
          {daysList.map((day, index) => (
            <DayCard
              key={`${day.date}-${index}`}
              day={day}
              isOpen={Boolean(expandedDays[day.date])}
              onToggle={() => toggleDay(day.date)}
              currentLang={currentLang}
              formatTime={formatTime}
              formatDate={formatDate}
              getDayName={getDayName}
              getShiftName={getShiftName}
              getContractingTypeName={getContractingTypeName}
              getDoctorName={getDoctorName}
              getStatusTone={getStatusTone}
              getCompletionTone={getCompletionTone}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function CalendarMiniLine({ label, value, danger = false }) {
  return (
    <div className="flex items-center justify-between gap-2 text-[11px]">
      <span className="text-[var(--color-text-muted)]">{label}</span>
      <span
        className={`font-extrabold ${
          danger
            ? "text-red-500 dark:text-red-500"
            : "text-[var(--color-text)]"
        }`}
      >
        {value ?? 0}
      </span>
    </div>
  )
}

function DayCard(props) {
  const {
    day,
    isOpen,
    onToggle,
    currentLang,
    formatDate,
    getDayName,
    getCompletionTone,
  } = props

  const required = Number(day.totalRequired || 0)
  const assigned = Number(day.totalAssigned || 0)
  const shortfall = Number(day.totalShortfall || 0)
  const completion = required > 0 ? Math.round((assigned / required) * 100) : 0
  const tone = getCompletionTone(completion)
  const attendance = day.attendanceStats || {}

  return (
    <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        className="w-full p-5 text-start hover:bg-[var(--color-bg-soft)] transition-colors"
      >
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-extrabold text-[var(--color-text)] flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-blue-500 dark:text-blue-500" />
              {getDayName(day)}
            </h3>

            <p className="text-sm text-[var(--color-text-muted)] mt-1">
              {day.date ? formatDate(day.date) : "-"}
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 min-w-full xl:min-w-[620px]">
            <MiniStat label={currentLang === "ar" ? "مطلوب" : "Required"} value={required} />
            <MiniStat label={currentLang === "ar" ? "معين" : "Assigned"} value={assigned} />
            <MiniStat
              label={currentLang === "ar" ? "النقص" : "Shortfall"}
              value={shortfall}
              valueClass={
                shortfall > 0
                  ? "text-red-500 dark:text-red-500"
                  : "text-emerald-500 dark:text-emerald-500"
              }
            />
            <MiniStat
              label={currentLang === "ar" ? "الحضور" : "Present"}
              value={attendance.totalPresent || 0}
              valueClass="text-emerald-500 dark:text-emerald-500"
            />

            <div className="flex items-center justify-center">
              {isOpen ? (
                <ChevronUp className="w-6 h-6 text-[var(--color-text-muted)]" />
              ) : (
                <ChevronDown className="w-6 h-6 text-[var(--color-text-muted)]" />
              )}
            </div>
          </div>
        </div>

        <div className="mt-4">
          <ProgressBar
            label={currentLang === "ar" ? "تغطية اليوم" : "Day Coverage"}
            percentage={completion}
            tone={tone}
          />
        </div>
      </button>

      {isOpen && <DayDetails {...props} />}
    </div>
  )
}

function DayDetails({
  day,
  currentLang,
  formatTime,
  formatDate,
  getDayName,
  getShiftName,
  getContractingTypeName,
  getDoctorName,
  getStatusTone,
  getCompletionTone,
}) {
  const shifts = Array.isArray(day.shifts) ? day.shifts : []
  const attendance = day.attendanceStats || {}

  return (
    <div className="p-5 border-t border-[var(--color-border)] bg-[var(--color-bg-soft)]">
      <div className="mb-5">
        <h3 className="text-lg font-extrabold text-[var(--color-text)]">
          {getDayName(day)} - {day.date ? formatDate(day.date) : "-"}
        </h3>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-5">
        <MiniStat
          label={currentLang === "ar" ? "حاضر" : "Present"}
          value={attendance.totalPresent || 0}
          valueClass="text-emerald-500 dark:text-emerald-500"
        />

        <MiniStat
          label={currentLang === "ar" ? "غائب" : "Absent"}
          value={attendance.totalAbsent || 0}
          valueClass="text-red-500 dark:text-red-500"
        />

        <MiniStat
          label={currentLang === "ar" ? "متأخر" : "Late"}
          value={attendance.totalLate || 0}
          valueClass="text-amber-500 dark:text-amber-500"
        />

        <MiniStat
          label={currentLang === "ar" ? "قيد التنفيذ" : "In Progress"}
          value={attendance.totalInProgress || 0}
          valueClass="text-blue-500 dark:text-blue-500"
        />

        <MiniStat
          label={currentLang === "ar" ? "غير مسجل" : "Not Recorded"}
          value={attendance.totalNotRecorded || 0}
          valueClass="text-slate-700 dark:text-slate-300"
        />
      </div>

      {shifts.length === 0 ? (
        <EmptyState
          title={
            currentLang === "ar"
              ? "لا توجد شفتات في هذا اليوم"
              : "No shifts in this day"
          }
          description={
            currentLang === "ar"
              ? "لم يتم تسجيل أي شفتات لهذا اليوم."
              : "No shifts were registered for this day."
          }
        />
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {shifts.map((shift) => {
            const shiftRequired = Number(shift.requiredDoctors || 0)
            const shiftAssigned = Number(shift.assignedDoctors || 0)
            const shiftShortfall = Number(shift.shortfallDoctors || 0)
            const shiftDoctors = Array.isArray(shift.doctors) ? shift.doctors : []

            const shiftCompletion =
              shiftRequired > 0
                ? Math.round((shiftAssigned / shiftRequired) * 100)
                : 0

            const shiftTone = getCompletionTone(shiftCompletion)

            return (
              <div
                key={shift.workingHoursId}
                className="p-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)]"
              >
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div>
                    <h4 className="font-extrabold text-[var(--color-text)]">
                      {getShiftName(shift)}
                    </h4>

                    <p className="text-sm text-[var(--color-text-muted)] mt-1">
                      {getContractingTypeName(shift)}
                    </p>

                    <p className="text-xs text-[var(--color-text-muted)] mt-2 inline-flex items-center gap-1">
                      <Clock size={13} />
                      {formatTime(shift.startTime)} - {formatTime(shift.endTime)}
                    </p>
                  </div>

                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusTone(
                      shift.status
                    )}`}
                  >
                    {shift.status || "-"}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 mb-4">
                  <MiniStat
                    label={currentLang === "ar" ? "مطلوب" : "Required"}
                    value={shiftRequired}
                  />

                  <MiniStat
                    label={currentLang === "ar" ? "معين" : "Assigned"}
                    value={shiftAssigned}
                    valueClass="text-blue-500 dark:text-blue-500"
                  />

                  <MiniStat
                    label={currentLang === "ar" ? "النقص" : "Shortfall"}
                    value={shiftShortfall}
                    valueClass={
                      shiftShortfall > 0
                        ? "text-red-500 dark:text-red-500"
                        : "text-emerald-500 dark:text-emerald-500"
                    }
                  />
                </div>

                <ProgressBar
                  label={currentLang === "ar" ? "تغطية الشفت" : "Shift Coverage"}
                  percentage={shiftCompletion}
                  tone={shiftTone}
                />

                <div className="mt-4">
                  <p className="text-xs font-bold text-[var(--color-text-muted)] mb-2">
                    {currentLang === "ar"
                      ? "الدكاترة المعينين"
                      : "Assigned Doctors"}
                  </p>

                  {shiftDoctors.length === 0 ? (
                    <div className="p-3 rounded-xl bg-transparent text-red-500 border-2 border-red-500 dark:bg-transparent dark:text-red-500 dark:border-red-500 text-sm">
                      {currentLang === "ar"
                        ? "لا يوجد دكاترة معينين لهذا الشفت."
                        : "No doctors assigned to this shift."}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {shiftDoctors.map((doctor, index) => (
                        <div
                          key={doctor.doctorId || doctor.userId || index}
                          className="p-3 rounded-xl bg-[var(--color-bg-soft)] border border-[var(--color-border)] flex items-center justify-between gap-3"
                        >
                          <div>
                            <p className="text-sm font-bold text-[var(--color-text)]">
                              {getDoctorName(doctor)}
                            </p>

                            <p className="text-xs text-[var(--color-text-muted)] mt-1">
                              {doctor.attendanceStatus || doctor.status || "-"}
                            </p>
                          </div>

                          <UserCheck className="w-4 h-4 text-emerald-500 dark:text-emerald-500" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function InlineLoader({ text }) {
  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl shadow-sm p-8 text-center">
      <div className="w-9 h-9 mx-auto mb-4 rounded-full border-4 border-[var(--color-border)] border-t-[var(--color-primary)] animate-spin" />
      <p className="text-sm font-bold text-[var(--color-text-muted)]">{text}</p>
    </div>
  )
}

function ProgressBar({ label, percentage, tone }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-bold text-[var(--color-text)]">
          {label}
        </span>
        <span className={`text-sm font-extrabold ${tone.text}`}>
          {percentage || 0}%
        </span>
      </div>

      <div className="w-full h-3 rounded-full bg-[var(--color-bg-soft)] overflow-hidden">
        <div
          className={`h-full rounded-full ${tone.bar}`}
          style={{ width: `${Math.min(Number(percentage || 0), 100)}%` }}
        />
      </div>
    </div>
  )
}

function StatCard({ icon: Icon, title, value, tone = "blue", compact = false }) {
  const toneClass = getToneClasses(tone)

  return (
    <div
      className={`bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl shadow-sm hover:border-[var(--color-success)] transition-colors ${
        compact ? "p-3" : "p-4"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p
            className={`font-bold text-[var(--color-text-muted)] truncate ${
              compact ? "text-[11px]" : "text-sm"
            }`}
          >
            {title}
          </p>
          <p
            className={`font-black tracking-tight ${toneClass.text} ${
              compact ? "text-xl" : "text-2xl"
            }`}
          >
            {value ?? 0}
          </p>
        </div>

        <div
          className={`rounded-xl flex items-center justify-center border-2 bg-transparent ${toneClass.text} ${toneClass.border} shrink-0 ${
            compact ? "w-9 h-9" : "w-11 h-11"
          }`}
        >
          <Icon className={compact ? "w-4 h-4" : "w-5 h-5"} />
        </div>
      </div>
    </div>
  )
}

function MiniStat({ label, value, valueClass = "text-[var(--color-text)]" }) {
  return (
    <div className="p-3 rounded-xl bg-[var(--color-bg-soft)] border border-[var(--color-border)]">
      <p className="text-[11px] font-bold text-[var(--color-text-muted)] mb-1">
        {label}
      </p>
      <p className={`text-sm font-extrabold ${valueClass}`}>{value ?? 0}</p>
    </div>
  )
}

function EmptyState({ title, description }) {
  return (
    <div className="p-8 text-center rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)]">
      <FileSpreadsheet className="w-12 h-12 mx-auto mb-3 text-[var(--color-text-muted)]" />
      <h3 className="text-lg font-extrabold text-[var(--color-text)]">
        {title}
      </h3>
      <p className="text-sm text-[var(--color-text-muted)] mt-2">
        {description}
      </p>
    </div>
  )
}


function CriticalCoveragePanel({ theme, currentLang, criticalGaps, loading, error }) {
  return (
    <div className={`${theme.card} p-5`}>
      <PanelTitle
        icon={ShieldAlert}
        title={
          currentLang === "ar"
            ? "فجوات التغطية الحرجة"
            : "Critical Coverage Gaps"
        }
        subtitle={
          currentLang === "ar"
            ? "الفجوات التي تحتاج تدخل سريع اليوم."
            : "Coverage gaps that need urgent attention today."
        }
      />

      {loading ? (
        <MiniCoverageLoader
          text={currentLang === "ar" ? "جاري تحميل الفجوات..." : "Loading gaps..."}
        />
      ) : error ? (
        <MiniCoverageError message={typeof error === "string" ? error : error?.message} />
      ) : criticalGaps.length === 0 ? (
        <EmptyCoverage
          icon={CheckCircle}
          text={
            currentLang === "ar"
              ? "لا توجد فجوات حرجة حاليًا"
              : "No critical coverage gaps"
          }
          tone="green"
        />
      ) : (
        <div className="space-y-3">
          {criticalGaps.slice(0, 6).map((gap, index) => (
            <CoverageGapCard
              key={gap.id || `${gap.departmentId}-${gap.shiftName}-${index}`}
              gap={gap}
              currentLang={currentLang}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function WeeklyCoveragePanel({ theme, currentLang, weeklyItems, loading, error }) {
  return (
    <div className={`${theme.card} p-5`}>
      <PanelTitle
        icon={Target}
        title={currentLang === "ar" ? "التغطية الأسبوعية" : "Weekly Coverage"}
        subtitle={
          currentLang === "ar"
            ? "نظرة سريعة على مستوى التغطية خلال الأسبوع."
            : "Quick overview of coverage health across the week."
        }
      />

      {loading ? (
        <MiniCoverageLoader
          text={
            currentLang === "ar"
              ? "جاري تحميل التغطية الأسبوعية..."
              : "Loading weekly coverage..."
          }
        />
      ) : error ? (
        <MiniCoverageError message={typeof error === "string" ? error : error?.message} />
      ) : weeklyItems.length === 0 ? (
        <EmptyCoverage
          icon={CalendarDays}
          text={
            currentLang === "ar"
              ? "لا توجد بيانات تغطية أسبوعية"
              : "No weekly coverage data"
          }
          tone="slate"
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {weeklyItems.slice(0, 7).map((item, index) => {
            const coverage = getNumber(
              item.coverageRate,
              item.coveragePercent,
              item.completionPercentage,
              item.percentage
            )

            const tone = coverage >= 90 ? "green" : coverage >= 70 ? "yellow" : "red"
            const toneClass = getToneClasses(tone)

            return (
              <div
                key={item.date || item.dayDate || index}
                className={`p-4 rounded-xl border-2 bg-transparent ${toneClass.border}`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-extrabold text-[var(--color-text)]">
                      {valueOrDash(
                        currentLang === "ar"
                          ? item.dayNameAr || item.dayName
                          : item.dayNameEn || item.dayName,
                        item.date,
                        item.dayDate
                      )}
                    </p>

                    <p className="text-xs text-[var(--color-text-muted)] mt-1">
                      {item.date || item.dayDate || "-"}
                    </p>
                  </div>

                  <span className={`text-xl font-black ${toneClass.text}`}>
                    {coverage}%
                  </span>
                </div>

                <div className="mt-3 h-2 rounded-full bg-[var(--color-bg-soft)] overflow-hidden">
                  <div
                    className={`h-full rounded-full ${toneClass.bar}`}
                    style={{ width: `${Math.max(0, Math.min(100, coverage))}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function SelectedDayCoveragePanel({
  theme,
  currentLang,
  selectedDayDate,
  selectedDay,
  coverageGaps,
  loading,
  error,
}) {
  const required = getNumber(selectedDay?.totalRequired)
  const assigned = getNumber(selectedDay?.totalAssigned)
  const shortfall = getNumber(selectedDay?.totalShortfall)
  const coverageRate = required > 0 ? Math.round((assigned / required) * 100) : 0

  return (
    <div className={`${theme.card} p-5`}>
      <PanelTitle
        icon={CalendarDays}
        title={
          currentLang === "ar"
            ? `تغطية يوم ${selectedDayDate}`
            : `Coverage for ${selectedDayDate}`
        }
        subtitle={
          currentLang === "ar"
            ? "تفاصيل فجوات التغطية لليوم المختار من التقويم."
            : "Coverage gaps for the selected day from the calendar."
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
        <MiniCoverageStat
          icon={Users}
          label={currentLang === "ar" ? "المطلوب" : "Required"}
          value={required}
          tone="blue"
        />

        <MiniCoverageStat
          icon={Stethoscope}
          label={currentLang === "ar" ? "المعين" : "Assigned"}
          value={assigned}
          tone="green"
        />

        <MiniCoverageStat
          icon={AlertTriangle}
          label={currentLang === "ar" ? "النقص" : "Shortfall"}
          value={shortfall}
          tone={shortfall > 0 ? "red" : "green"}
        />

        <MiniCoverageStat
          icon={BarChart3}
          label={currentLang === "ar" ? "التغطية" : "Coverage"}
          value={`${coverageRate}%`}
          tone={coverageRate >= 90 ? "green" : coverageRate >= 70 ? "yellow" : "red"}
        />
      </div>

      {loading ? (
        <MiniCoverageLoader
          text={
            currentLang === "ar"
              ? "جاري تحميل تغطية اليوم..."
              : "Loading day coverage..."
          }
        />
      ) : error ? (
        <MiniCoverageError message={typeof error === "string" ? error : error?.message} />
      ) : coverageGaps.length === 0 ? (
        <EmptyCoverage
          icon={CheckCircle}
          text={
            currentLang === "ar"
              ? "لا توجد فجوات تغطية لهذا اليوم"
              : "No coverage gaps for this day"
          }
          tone="green"
        />
      ) : (
        <div className="space-y-3">
          {coverageGaps.map((gap, index) => (
            <CoverageGapCard
              key={gap.id || `${gap.departmentId}-${gap.shiftName}-${index}`}
              gap={gap}
              currentLang={currentLang}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function CoverageGapCard({ gap, currentLang }) {
  const required = getNumber(gap.requiredDoctors, gap.required, gap.requiredCount)
  const assigned = getNumber(gap.assignedDoctors, gap.assigned, gap.assignedCount)
  const shortfall = getNumber(gap.shortfallDoctors, gap.shortfall, required - assigned)
  const severity = valueOrDash(gap.severity, gap.riskLevel, gap.level, "Warning")
  const tone = shortfall > 0 ? getCoverageSeverityTone(severity) : "green"
  const toneClass = getToneClasses(tone)

  const departmentName =
    currentLang === "ar"
      ? valueOrDash(
          gap.departmentNameAr,
          gap.departmentNameArabic,
          gap.departmentName,
          gap.departmentNameEn
        )
      : valueOrDash(
          gap.departmentNameEn,
          gap.departmentNameEnglish,
          gap.departmentName,
          gap.departmentNameAr
        )

  const shiftName =
    currentLang === "ar"
      ? valueOrDash(gap.shiftNameAr, gap.shiftNameArabic, gap.shiftName, gap.shiftNameEn)
      : valueOrDash(gap.shiftNameEn, gap.shiftNameEnglish, gap.shiftName, gap.shiftNameAr)

  return (
    <div className={`rounded-xl border-2 bg-transparent p-4 ${toneClass.border}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h4 className="font-extrabold text-[var(--color-text)] truncate">
            {departmentName}
          </h4>

          <p className="text-sm text-[var(--color-text-muted)] mt-1">
            {shiftName}
            {gap.date ? ` • ${gap.date}` : ""}
          </p>
        </div>

        <span
          className={`shrink-0 px-3 py-1 rounded-full text-xs font-extrabold border-2 ${toneClass.text} ${toneClass.border}`}
        >
          {severity}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2 mt-4">
        <MiniNumber
          label={currentLang === "ar" ? "مطلوب" : "Required"}
          value={required}
          tone="blue"
        />
        <MiniNumber
          label={currentLang === "ar" ? "معين" : "Assigned"}
          value={assigned}
          tone="green"
        />
        <MiniNumber
          label={currentLang === "ar" ? "نقص" : "Shortfall"}
          value={Math.max(0, shortfall)}
          tone={shortfall > 0 ? "red" : "green"}
        />
      </div>

      {(gap.recommendedAction || gap.message || gap.messageAr || gap.messageEn) && (
        <p className="mt-3 text-xs font-bold text-[var(--color-text-muted)]">
          {currentLang === "ar"
            ? valueOrDash(gap.recommendedActionAr, gap.messageAr, gap.recommendedAction, gap.message)
            : valueOrDash(gap.recommendedActionEn, gap.messageEn, gap.recommendedAction, gap.message)}
        </p>
      )}
    </div>
  )
}

function PanelTitle({ icon: Icon, title, subtitle }) {
  return (
    <div className="mb-4 flex items-start gap-3">
      <div className="w-10 h-10 rounded-xl border-2 border-blue-500 text-blue-500 flex items-center justify-center">
        <Icon size={20} />
      </div>

      <div>
        <h3 className="text-lg font-extrabold text-[var(--color-text)]">
          {title}
        </h3>

        {subtitle && (
          <p className="text-sm text-[var(--color-text-muted)] mt-1">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  )
}

function MiniCoverageStat({ icon: Icon, label, value, tone = "blue" }) {
  const toneClass = getToneClasses(tone)

  return (
    <div className={`rounded-xl border-2 p-4 bg-transparent ${toneClass.border}`}>
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold text-[var(--color-text-muted)]">
            {label}
          </p>
          <p className={`mt-1 text-xl font-black ${toneClass.text}`}>
            {value ?? 0}
          </p>
        </div>

        <Icon className={`w-6 h-6 ${toneClass.text}`} />
      </div>
    </div>
  )
}

function MiniNumber({ label, value, tone = "blue" }) {
  const toneClass = getToneClasses(tone)

  return (
    <div className="rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] p-2 text-center">
      <p className={`font-black ${toneClass.text}`}>{value ?? 0}</p>
      <p className="text-[10px] text-[var(--color-text-muted)]">{label}</p>
    </div>
  )
}

function MiniCoverageLoader({ text }) {
  return (
    <div className="p-6 text-center">
      <div className="w-8 h-8 mx-auto mb-3 rounded-full border-4 border-[var(--color-border)] border-t-[var(--color-primary)] animate-spin" />
      <p className="text-sm font-bold text-[var(--color-text-muted)]">{text}</p>
    </div>
  )
}

function MiniCoverageError({ message }) {
  return (
    <div className="rounded-xl border-2 border-red-500 bg-transparent p-4 text-red-500">
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 mt-0.5" />
        <p className="text-sm font-bold">{message || "Error"}</p>
      </div>
    </div>
  )
}

function EmptyCoverage({ icon: Icon, text, tone = "slate" }) {
  const toneClass = getToneClasses(tone)

  return (
    <div className={`rounded-xl border-2 bg-transparent p-6 text-center ${toneClass.border}`}>
      <Icon className={`w-10 h-10 mx-auto mb-3 ${toneClass.text}`} />
      <p className="text-sm font-bold text-[var(--color-text-muted)]">
        {text}
      </p>
    </div>
  )
}

export default DepartmentCalender