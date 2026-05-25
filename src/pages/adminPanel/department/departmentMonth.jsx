import React, { useEffect, useMemo } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate, useParams } from "react-router-dom"
import { useTranslation } from "react-i18next"
import * as ExcelJS from "exceljs"
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  BarChart3,
  CalendarDays,
  CheckCircle,
  Download,
  Eye,
  FileSpreadsheet,
  Layers,
  RefreshCw,
  Stethoscope,
  Users,
  XCircle,
} from "lucide-react"

import { getDepartmentMonthView } from "../../../state/act/actDepartment"
import { formatDate } from "../../../utils/formtDate"
import LoadingGetData from "../../../components/LoadingGetData"
import { getPageTheme } from "../../../utils/themeClasses"

function DepartmentMonth() {
  const { depId: id, month, year } = useParams()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { t, i18n } = useTranslation()
  const theme = getPageTheme()

  const currentLang = i18n.language || "ar"
  const isRTL = currentLang === "ar"

  const {
    departmentMonthView,
    loadingGetDepartmentMonthView,
    currentDepartment,
    departmentCategories,
    departmentTotals,
    departmentMonthViewError,
    error,
  } = useSelector((state) => state.department)

  useEffect(() => {
    if (!id || !month || !year) return

    dispatch(
      getDepartmentMonthView({
        departmentId: id,
        month,
        year,
      })
    )
  }, [dispatch, id, month, year])

  const categories = useMemo(() => {
    if (Array.isArray(departmentCategories) && departmentCategories.length > 0) {
      return departmentCategories
    }

    if (Array.isArray(departmentMonthView?.categories)) {
      return departmentMonthView.categories
    }

    return []
  }, [departmentCategories, departmentMonthView])

  const totals = departmentMonthView?.totals || departmentTotals || {}

  const getDepartmentName = () => {
    if (departmentMonthView) {
      return currentLang === "ar"
        ? departmentMonthView.departmentNameAr ||
            departmentMonthView.departmentNameArabic ||
            departmentMonthView.departmentNameEn ||
            departmentMonthView.departmentNameEnglish ||
            "-"
        : departmentMonthView.departmentNameEn ||
            departmentMonthView.departmentNameEnglish ||
            departmentMonthView.departmentNameAr ||
            departmentMonthView.departmentNameArabic ||
            "-"
    }

    if (currentDepartment) {
      return currentLang === "ar"
        ? currentDepartment.nameArabic ||
            currentDepartment.nameAr ||
            currentDepartment.nameEnglish ||
            currentDepartment.nameEn ||
            "-"
        : currentDepartment.nameEnglish ||
            currentDepartment.nameEn ||
            currentDepartment.nameArabic ||
            currentDepartment.nameAr ||
            "-"
    }

    return t("department.title") || "Department"
  }

  const getCategoryName = (category) => {
    return currentLang === "ar"
      ? category.categoryNameAr ||
          category.categoryNameArabic ||
          category.nameArabic ||
          category.nameAr ||
          category.categoryNameEn ||
          category.categoryNameEnglish ||
          category.nameEnglish ||
          "-"
      : category.categoryNameEn ||
          category.categoryNameEnglish ||
          category.nameEnglish ||
          category.nameEn ||
          category.categoryNameAr ||
          category.categoryNameArabic ||
          category.nameArabic ||
          "-"
  }

  const getRosterTitle = (roster) => {
    const title = roster.rosterTitle || roster.title || roster.name || "-"

    if (title.includes("|")) {
      const [enTitle, arTitle] = title.split("|")
      return currentLang === "ar"
        ? arTitle?.trim() || enTitle?.trim() || title
        : enTitle?.trim() || arTitle?.trim() || title
    }

    return title
  }

  const getRosterStatusLabel = (status) => {
    if (!status) return "-"

    const key = String(status).toLowerCase()

    return t(`roster.status.${key}`) || status
  }

  const getCompletionTone = (percentage = 0) => {
    if (percentage >= 90) {
      return {
        text: "text-green-700 dark:text-green-300",
        bg: "bg-green-100 dark:bg-green-900/50",
        border: "border-green-300 dark:border-green-700",
        bar: "bg-green-600 dark:bg-green-400",
      }
    }

    if (percentage >= 70) {
      return {
        text: "text-yellow-700 dark:text-yellow-300",
        bg: "bg-yellow-100 dark:bg-yellow-900/50",
        border: "border-yellow-300 dark:border-yellow-700",
        bar: "bg-yellow-600 dark:bg-yellow-400",
      }
    }

    return {
      text: "text-red-700 dark:text-red-300",
      bg: "bg-red-100 dark:bg-red-900/50",
      border: "border-red-300 dark:border-red-700",
      bar: "bg-red-600 dark:bg-red-400",
    }
  }

  const getRosterIds = () => {
    const ids = []

    categories.forEach((category) => {
      if (Array.isArray(category.rosters)) {
        category.rosters.forEach((roster) => {
          const rosterId = roster.rosterId || roster.id

          if (rosterId) {
            ids.push(rosterId)
          }
        })
      }
    })

    return ids
  }

  const summary = useMemo(() => {
    return {
      totalRosters:
        departmentMonthView?.totalRosters ||
        categories.reduce(
          (sum, category) => sum + Number(category.rosters?.length || 0),
          0
        ),
      shiftsCount: totals.shiftsCount || 0,
      requiredDoctors: totals.requiredDoctors || 0,
      assignedDoctors: totals.assignedDoctors || 0,
      maxDoctors: totals.maxDoctors || totals.max || 0,
      shortfallDoctors: totals.shortfallDoctors || totals.shortfall || 0,
      completionPercentage: totals.completionPercentage || 0,
      lastUpdated: departmentMonthView?.lastUpdated,
    }
  }, [departmentMonthView, categories, totals])

  const handleRefresh = () => {
    dispatch(
      getDepartmentMonthView({
        departmentId: id,
        month,
        year,
      })
    )
  }

  const openRosterCalendar = (rosterId) => {
    if (!rosterId) return
    navigate(`/admin-panel/department/calender/${id}/${rosterId}`)
  }

  const exportToExcel = async () => {
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet(
      currentLang === "ar" ? "ملخص القسم" : "Department Summary"
    )

    const departmentName = getDepartmentName()

    worksheet.mergeCells(1, 1, 1, 10)
    const titleCell = worksheet.getCell(1, 1)
    titleCell.value = `${departmentName} - ${month}/${year}`
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

    worksheet.mergeCells(2, 1, 2, 10)
    const summaryHeader = worksheet.getCell(2, 1)
    summaryHeader.value =
      currentLang === "ar" ? "الملخص الإجمالي" : "Overall Summary"
    summaryHeader.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF2563EB" },
    }
    summaryHeader.font = {
      bold: true,
      size: 13,
      color: { argb: "FFFFFFFF" },
      name: "Arial",
    }
    summaryHeader.alignment = { horizontal: "center", vertical: "middle" }
    worksheet.getRow(2).height = 30

    const totalsHeaders = [
      currentLang === "ar" ? "إجمالي الروسترات" : "Total Rosters",
      currentLang === "ar" ? "إجمالي الشفتات" : "Total Shifts",
      currentLang === "ar" ? "الأطباء المطلوبون" : "Required Doctors",
      currentLang === "ar" ? "الأطباء المعينون" : "Assigned Doctors",
      currentLang === "ar" ? "الحد الأقصى" : "Max Doctors",
      currentLang === "ar" ? "النقص" : "Shortfall",
      currentLang === "ar" ? "نسبة الإكتمال" : "Completion %",
      currentLang === "ar" ? "آخر تحديث" : "Last Updated",
    ]

    totalsHeaders.forEach((header, index) => {
      const cell = worksheet.getCell(3, index + 1)
      cell.value = header
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF60A5FA" },
      }
      cell.font = {
        bold: true,
        size: 10,
        color: { argb: "FFFFFFFF" },
        name: "Arial",
      }
      cell.alignment = { horizontal: "center", vertical: "middle" }
    })

    const totalsValues = [
      summary.totalRosters,
      summary.shiftsCount,
      summary.requiredDoctors,
      summary.assignedDoctors,
      summary.maxDoctors,
      summary.shortfallDoctors,
      `${summary.completionPercentage}%`,
      summary.lastUpdated
        ? new Date(summary.lastUpdated).toLocaleDateString(
            currentLang === "ar" ? "ar-EG" : "en-US"
          )
        : "-",
    ]

    totalsValues.forEach((value, index) => {
      const cell = worksheet.getCell(4, index + 1)
      cell.value = value
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFF3F4F6" },
      }
      cell.font = {
        size: 10,
        color: { argb: "FF111827" },
        name: "Arial",
      }
      cell.alignment = { horizontal: "center", vertical: "middle" }
    })

    worksheet.mergeCells(6, 1, 6, 10)
    const categoriesHeader = worksheet.getCell(6, 1)
    categoriesHeader.value =
      currentLang === "ar" ? "تفاصيل التخصصات" : "Categories Details"
    categoriesHeader.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF2563EB" },
    }
    categoriesHeader.font = {
      bold: true,
      size: 13,
      color: { argb: "FFFFFFFF" },
      name: "Arial",
    }
    categoriesHeader.alignment = {
      horizontal: "center",
      vertical: "middle",
    }

    const categoryHeaders = [
      currentLang === "ar" ? "اسم التخصص" : "Category Name",
      currentLang === "ar" ? "عدد الشفتات" : "Shifts Count",
      currentLang === "ar" ? "المطلوب" : "Required",
      currentLang === "ar" ? "المعين" : "Assigned",
      currentLang === "ar" ? "الحد الأقصى" : "Max",
      currentLang === "ar" ? "الإكتمال %" : "Completion %",
      currentLang === "ar" ? "عنوان الروستر" : "Roster Title",
      currentLang === "ar" ? "الحالة" : "Status",
      currentLang === "ar" ? "النقص" : "Shortfall",
      currentLang === "ar" ? "إكتمال الروستر %" : "Roster Completion %",
    ]

    categoryHeaders.forEach((header, index) => {
      const cell = worksheet.getCell(7, index + 1)
      cell.value = header
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF60A5FA" },
      }
      cell.font = {
        bold: true,
        size: 10,
        color: { argb: "FFFFFFFF" },
        name: "Arial",
      }
      cell.alignment = {
        horizontal: "center",
        vertical: "middle",
        wrapText: true,
      }
    })

    let currentRow = 8

    categories.forEach((category) => {
      const rosters = Array.isArray(category.rosters) ? category.rosters : []
      const rowSpan = Math.max(rosters.length, 1)

      if (rowSpan > 1) {
        worksheet.mergeCells(currentRow, 1, currentRow + rowSpan - 1, 1)
        worksheet.mergeCells(currentRow, 2, currentRow + rowSpan - 1, 2)
        worksheet.mergeCells(currentRow, 3, currentRow + rowSpan - 1, 3)
        worksheet.mergeCells(currentRow, 4, currentRow + rowSpan - 1, 4)
        worksheet.mergeCells(currentRow, 5, currentRow + rowSpan - 1, 5)
        worksheet.mergeCells(currentRow, 6, currentRow + rowSpan - 1, 6)
      }

      worksheet.getCell(currentRow, 1).value = getCategoryName(category)
      worksheet.getCell(currentRow, 2).value = category.shiftsCount || 0
      worksheet.getCell(currentRow, 3).value = category.requiredDoctors || 0
      worksheet.getCell(currentRow, 4).value = category.assignedDoctors || 0
      worksheet.getCell(currentRow, 5).value = category.maxDoctors || 0
      worksheet.getCell(currentRow, 6).value = `${
        category.completionPercentage || 0
      }%`

      for (let col = 1; col <= 6; col++) {
        const cell = worksheet.getCell(currentRow, col)
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFE5E7EB" },
        }
        cell.font = {
          bold: true,
          size: 10,
          color: { argb: "FF111827" },
          name: "Arial",
        }
        cell.alignment = { horizontal: "center", vertical: "middle" }
      }

      if (rosters.length === 0) {
        worksheet.getCell(currentRow, 7).value = "-"
        worksheet.getCell(currentRow, 8).value = "-"
        worksheet.getCell(currentRow, 9).value = 0
        worksheet.getCell(currentRow, 10).value = "0%"
      } else {
        rosters.forEach((roster, rosterIndex) => {
          const row = currentRow + rosterIndex

          worksheet.getCell(row, 7).value = getRosterTitle(roster)
          worksheet.getCell(row, 8).value = roster.rosterStatus || "-"
          worksheet.getCell(row, 9).value = roster.shortfallDoctors || 0
          worksheet.getCell(row, 10).value = `${
            roster.completionPercentage || 0
          }%`

          for (let col = 7; col <= 10; col++) {
            const cell = worksheet.getCell(row, col)
            cell.fill = {
              type: "pattern",
              pattern: "solid",
              fgColor: { argb: "FFFFFFFF" },
            }
            cell.font = {
              size: 9,
              color: { argb: "FF374151" },
              name: "Arial",
            }
            cell.alignment = { horizontal: "center", vertical: "middle" }
          }
        })
      }

      currentRow += rowSpan
    })

    for (let col = 1; col <= 10; col++) {
      worksheet.getColumn(col).width =
        col === 1 || col === 7 ? 35 : col === 10 ? 20 : 15
    }

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

    const buffer = await workbook.xlsx.writeBuffer()
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    })

    const url = window.URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `${departmentName}_${month}_${year}_Summary.xlsx`
    link.click()
    window.URL.revokeObjectURL(url)
  }

  const errorToShow = departmentMonthViewError || error

  if (loadingGetDepartmentMonthView) {
    return (
      <div className={theme.page} dir={isRTL ? "rtl" : "ltr"}>
        <div className="max-w-7xl mx-auto">
          <LoadingGetData
            text={
              t("gettingData.departmentMonthView") ||
              "Loading department month view..."
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
            <XCircle className="w-14 h-14 text-red-700 dark:text-red-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-[var(--color-text)] mb-2">
              {currentLang === "ar"
                ? "تعذر تحميل بيانات الشهر"
                : "Failed to load month data"}
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

  if (!departmentMonthView) {
    return (
      <div className={theme.page} dir={isRTL ? "rtl" : "ltr"}>
        <div className="max-w-5xl mx-auto">
          <div className={`${theme.card} p-8 text-center`}>
            <CalendarDays className="w-14 h-14 mx-auto mb-4 text-[var(--color-text-muted)]" />
            <h2 className="text-2xl font-bold text-[var(--color-text)] mb-2">
              {currentLang === "ar" ? "لا توجد بيانات" : "No data"}
            </h2>
            <p className="text-[var(--color-text-muted)]">
              {t("department.noData") || "No department data was found."}
            </p>
          </div>
        </div>
      </div>
    )
  }

  const completionTone = getCompletionTone(summary.completionPercentage)

  return (
    <div className={theme.page} dir={isRTL ? "rtl" : "ltr"}>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <button
            type="button"
            onClick={() => navigate(`/admin-panel/department/${id}`)}
            className="inline-flex items-center gap-2 text-sm font-bold text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
          >
            {isRTL ? <ArrowRight size={16} /> : <ArrowLeft size={16} />}
            {currentLang === "ar" ? "رجوع للقسم" : "Back to Department"}
          </button>

          <div className="flex items-center gap-2">
            <button type="button" onClick={handleRefresh} className={theme.secondaryButton}>
              <RefreshCw size={16} />
              {currentLang === "ar" ? "تحديث" : "Refresh"}
            </button>

            <button
              type="button"
              onClick={exportToExcel}
              disabled={categories.length === 0}
              className={`${theme.primaryButton} gap-2 disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <Download size={16} />
              {currentLang === "ar" ? "تصدير Excel" : "Export Excel"}
            </button>
          </div>
        </div>

        <div className={`${theme.card} p-6`}>
          <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-[var(--color-primary-soft)] text-[var(--color-primary)] flex items-center justify-center">
                <BuildingIcon />
              </div>

              <div>
                <h1 className="text-3xl font-extrabold text-[var(--color-text)]">
                  {getDepartmentName()}
                </h1>

                <p className="text-sm text-[var(--color-text-muted)] mt-2">
                  {currentLang === "ar" ? "عرض شهر" : "Month View"}:{" "}
                  <span className="font-bold text-[var(--color-text)]">
                    {month}/{year}
                  </span>
                </p>

                <div className="flex flex-wrap gap-2 mt-3">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-[var(--color-bg-soft)] text-[var(--color-text-muted)] border border-[var(--color-border)]">
                    {currentLang === "ar" ? "روسترات" : "Rosters"}:{" "}
                    {summary.totalRosters}
                  </span>

                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold border ${completionTone.bg} ${completionTone.text} ${completionTone.border}`}
                  >
                    {currentLang === "ar" ? "الإكتمال" : "Completion"}:{" "}
                    {summary.completionPercentage}%
                  </span>

                  {summary.lastUpdated && (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-[var(--color-bg-soft)] text-[var(--color-text-muted)] border border-[var(--color-border)]">
                      {currentLang === "ar" ? "آخر تحديث" : "Last Updated"}:{" "}
                      {formatDate(summary.lastUpdated)}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="min-w-[260px]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-[var(--color-text)]">
                  {currentLang === "ar" ? "نسبة الإكتمال" : "Completion"}
                </span>
                <span className={`text-sm font-extrabold ${completionTone.text}`}>
                  {summary.completionPercentage}%
                </span>
              </div>

              <div className="w-full h-3 rounded-full bg-[var(--color-bg-soft)] overflow-hidden">
                <div
                  className={`h-full rounded-full ${completionTone.bar}`}
                  style={{
                    width: `${Math.min(summary.completionPercentage, 100)}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {departmentMonthView?.warnings?.length > 0 && (
          <div className={`${theme.card} p-4 border-yellow-500/40`}>
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-700 dark:text-yellow-300 mt-0.5" />
              <div>
                <h3 className="font-bold text-[var(--color-text)] mb-2">
                  {currentLang === "ar" ? "تحذيرات" : "Warnings"}
                </h3>

                <ul className="space-y-1 text-sm text-[var(--color-text-muted)]">
                  {departmentMonthView.warnings.map((warning, index) => (
                    <li key={index}>• {warning}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
          <StatCard
            icon={Layers}
            title={currentLang === "ar" ? "روسترات" : "Rosters"}
            value={summary.totalRosters}
            tone="blue"
          />

          <StatCard
            icon={CalendarDays}
            title={currentLang === "ar" ? "شفتات" : "Shifts"}
            value={summary.shiftsCount}
            tone="purple"
          />

          <StatCard
            icon={Users}
            title={currentLang === "ar" ? "مطلوب" : "Required"}
            value={summary.requiredDoctors}
            tone="yellow"
          />

          <StatCard
            icon={CheckCircle}
            title={currentLang === "ar" ? "معين" : "Assigned"}
            value={summary.assignedDoctors}
            tone="green"
          />

          <StatCard
            icon={BarChart3}
            title={currentLang === "ar" ? "الحد الأقصى" : "Max"}
            value={summary.maxDoctors}
            tone="orange"
          />

          <StatCard
            icon={XCircle}
            title={currentLang === "ar" ? "النقص" : "Shortfall"}
            value={summary.shortfallDoctors}
            tone={summary.shortfallDoctors > 0 ? "red" : "green"}
          />
        </div>

        <div className={`${theme.card} p-5`}>
          <div className="flex items-center justify-between gap-3 flex-wrap mb-5">
            <div>
              <h2 className="text-xl font-extrabold text-[var(--color-text)] flex items-center gap-2">
                <Stethoscope className="w-5 h-5 text-blue-700 dark:text-blue-300" />
                {currentLang === "ar" ? "التخصصات والروسترات" : "Categories & Rosters"}
              </h2>

              <p className="text-sm text-[var(--color-text-muted)] mt-1">
                {currentLang === "ar"
                  ? "اضغط على أي روستر لفتح تقويم القسم التفصيلي."
                  : "Click any roster to open the detailed department calendar."}
              </p>
            </div>

            <span className="text-sm font-bold text-[var(--color-text-muted)]">
              {currentLang === "ar" ? "عدد الروسترات" : "Roster IDs"}:{" "}
              {getRosterIds().length}
            </span>
          </div>

          {categories.length === 0 ? (
            <EmptyState
              title={
                currentLang === "ar"
                  ? "لا توجد تخصصات لهذا الشهر"
                  : "No categories for this month"
              }
              description={
                currentLang === "ar"
                  ? "لا توجد بيانات تخصصات أو روسترات لهذا الشهر."
                  : "There are no categories or rosters for this month."
              }
            />
          ) : (
            <div className="space-y-4">
              {categories.map((category, categoryIndex) => {
                const categoryCompletion = category.completionPercentage || 0
                const categoryTone = getCompletionTone(categoryCompletion)
                const rosters = Array.isArray(category.rosters)
                  ? category.rosters
                  : []

                return (
                  <div
                    key={category.categoryId || category.id || categoryIndex}
                    className={`${theme.cardSoft} p-5`}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 mb-4">
                      <div>
                        <h3 className="text-lg font-extrabold text-[var(--color-text)]">
                          {getCategoryName(category)}
                        </h3>

                        <p className="text-xs text-[var(--color-text-muted)] mt-1">
                          {currentLang === "ar" ? "عدد الروسترات" : "Rosters"}:{" "}
                          {rosters.length}
                        </p>
                      </div>

                      <div className="min-w-[220px]">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold text-[var(--color-text-muted)]">
                            {currentLang === "ar" ? "إكتمال التخصص" : "Category Completion"}
                          </span>
                          <span className={`text-xs font-extrabold ${categoryTone.text}`}>
                            {categoryCompletion}%
                          </span>
                        </div>

                        <div className="w-full h-2 rounded-full bg-[var(--color-bg-soft)] overflow-hidden">
                          <div
                            className={`h-full rounded-full ${categoryTone.bar}`}
                            style={{
                              width: `${Math.min(categoryCompletion, 100)}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                      <MiniStat
                        label={currentLang === "ar" ? "شفتات" : "Shifts"}
                        value={category.shiftsCount || 0}
                      />
                      <MiniStat
                        label={currentLang === "ar" ? "مطلوب" : "Required"}
                        value={category.requiredDoctors || 0}
                      />
                      <MiniStat
                        label={currentLang === "ar" ? "معين" : "Assigned"}
                        value={category.assignedDoctors || 0}
                      />
                      <MiniStat
                        label={currentLang === "ar" ? "حد أقصى" : "Max"}
                        value={category.maxDoctors || 0}
                      />
                    </div>

                    {rosters.length === 0 ? (
                      <div className="text-sm text-[var(--color-text-muted)] p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]">
                        {currentLang === "ar"
                          ? "لا توجد روسترات داخل هذا التخصص."
                          : "No rosters are available in this category."}
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
                        {rosters.map((roster) => {
                          const rosterId = roster.rosterId || roster.id
                          const rosterCompletion =
                            roster.completionPercentage || 0
                          const rosterTone = getCompletionTone(rosterCompletion)

                          return (
                            <button
                              type="button"
                              key={rosterId}
                              onClick={() => openRosterCalendar(rosterId)}
                              className="text-start p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] hover:bg-[var(--color-bg-soft)] transition-colors"
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <h4 className="font-extrabold text-[var(--color-text)]">
                                    {getRosterTitle(roster)}
                                  </h4>

                                  <div className="flex flex-wrap gap-2 mt-2">
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-[var(--color-bg-soft)] text-[var(--color-text-muted)] border border-[var(--color-border)]">
                                      {getRosterStatusLabel(roster.rosterStatus)}
                                    </span>

                                    {Number(roster.shortfallDoctors || 0) > 0 && (
                                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-300 dark:bg-red-900/50 dark:text-red-200 dark:border-red-700">
                                        {currentLang === "ar" ? "نقص" : "Shortfall"}:{" "}
                                        {roster.shortfallDoctors}
                                      </span>
                                    )}
                                  </div>
                                </div>

                                <Eye className="w-5 h-5 text-blue-700 dark:text-blue-300" />
                              </div>

                              <div className="grid grid-cols-3 gap-2 mt-4">
                                <MiniStat
                                  label={currentLang === "ar" ? "شفتات" : "Shifts"}
                                  value={roster.shiftsCount || 0}
                                />
                                <MiniStat
                                  label={currentLang === "ar" ? "معين" : "Assigned"}
                                  value={`${roster.assignedDoctors || 0}/${
                                    roster.requiredDoctors || 0
                                  }`}
                                />
                                <MiniStat
                                  label={currentLang === "ar" ? "إكتمال" : "Completion"}
                                  value={`${rosterCompletion}%`}
                                  valueClass={rosterTone.text}
                                />
                              </div>

                              <div className="w-full h-2 rounded-full bg-[var(--color-bg-soft)] overflow-hidden mt-4">
                                <div
                                  className={`h-full rounded-full ${rosterTone.bar}`}
                                  style={{
                                    width: `${Math.min(rosterCompletion, 100)}%`,
                                  }}
                                />
                              </div>
                            </button>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function BuildingIcon() {
  return <CalendarDays className="w-7 h-7" />
}

function StatCard({ icon: Icon, title, value, tone = "blue" }) {
  const toneMap = {
    blue: "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300",
    green:
      "bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300",
    red: "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300",
    yellow:
      "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300",
    purple:
      "bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300",
    orange:
      "bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300",
  }

  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl shadow-sm p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm text-[var(--color-text-muted)]">{title}</p>
          <p className="text-2xl font-extrabold text-[var(--color-text)]">
            {value ?? 0}
          </p>
        </div>

        <div
          className={`w-11 h-11 rounded-xl flex items-center justify-center ${
            toneMap[tone] || toneMap.blue
          }`}
        >
          <Icon className="w-5 h-5" />
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
      <p className={`text-sm font-extrabold ${valueClass}`}>{value}</p>
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

export default DepartmentMonth