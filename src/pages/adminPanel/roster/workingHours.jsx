// workingHours.jsx
import { useEffect, useState } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import { getWorkingHours } from "../../../state/act/actRosterManagement"
import { useTranslation } from "react-i18next"
import LoadingGetData from "../../../components/LoadingGetData"
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  Clock,
  Search,
  AlertCircle,
  TrendingUp,
  RefreshCw,
  Timer,
  UserCheck,
  Download,
  Filter,
  Rows3,
  CalendarDays,
  Building,
  Briefcase,
  Users,
  CheckCircle,
} from "lucide-react"
import { getDepartments } from "../../../state/act/actDepartment"
import CollapsibleDateCard from "./collapsWorkingHour"
import * as ExcelJS from "exceljs"
import { formatDate } from "../../../utils/formtDate"
import { getPageTheme } from "../../../utils/themeClasses"

function WorkingHours() {
  const { rosterId } = useParams()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { t, i18n } = useTranslation()
  const theme = getPageTheme()

  const rosterTitle = localStorage.getItem("rosterTitle")

  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    departmentId: "",
  })

  const [showFilters, setShowFilters] = useState(false)
  const [viewMode, setViewMode] = useState("rows")
  const [selectedCalendarDate, setSelectedCalendarDate] = useState(null)

  const { workingHours, loading, errors } = useSelector(
    (state) => state.rosterManagement
  )

  const { departments } = useSelector((state) => state.department)

  const isRTL = i18n.language === "ar"
  const currentLang = i18n.language || "ar"

  useEffect(() => {
    if (rosterId) {
      dispatch(getWorkingHours({ rosterId, params: filters }))
      dispatch(getDepartments())
    }
  }, [dispatch, rosterId])

  const iconColors = {
    calendar: "text-blue-600 dark:text-blue-400",
    clock: "text-purple-600 dark:text-purple-400",
    timer: "text-blue-600 dark:text-blue-400",
    doctors: "text-green-600 dark:text-green-400",
    days: "text-orange-600 dark:text-orange-400",
    progress: "text-purple-600 dark:text-purple-400",
    building: "text-green-600 dark:text-green-400",
    briefcase: "text-purple-600 dark:text-purple-400",
    users: "text-blue-600 dark:text-blue-400",
    danger: "text-red-600 dark:text-red-400",
    success: "text-green-600 dark:text-green-400",
    filter: "text-blue-600 dark:text-blue-400",
    excel: "text-green-600 dark:text-green-400",
  }

  const iconBg = {
    clock: "bg-purple-100 dark:bg-purple-900/30",
    timer: "bg-blue-100 dark:bg-blue-900/30",
    doctors: "bg-green-100 dark:bg-green-900/30",
    days: "bg-orange-100 dark:bg-orange-900/30",
    progress: "bg-purple-100 dark:bg-purple-900/30",
    calendar: "bg-blue-100 dark:bg-blue-900/30",
  }

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  const applyFilters = () => {
    dispatch(getWorkingHours({ rosterId, params: filters }))
  }

  const clearFilters = () => {
    const clearedFilters = {
      startDate: "",
      endDate: "",
      departmentId: "",
    }

    setFilters(clearedFilters)
    dispatch(getWorkingHours({ rosterId, params: clearedFilters }))
  }

  const formatTime = (timeString) => {
    if (!timeString) return "-"

    const time = new Date(timeString)

    return time.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })
  }

  const getFillColor = (percentage) => {
    if (percentage >= 80) return "text-green-600 dark:text-green-400"
    if (percentage >= 50) return "text-yellow-600 dark:text-yellow-400"
    if (percentage >= 25) return "text-orange-600 dark:text-orange-400"
    return "text-red-600 dark:text-red-400"
  }

  const getFillBgColor = (percentage) => {
    if (percentage >= 80) return "bg-green-500"
    if (percentage >= 50) return "bg-yellow-500"
    if (percentage >= 25) return "bg-orange-500"
    return "bg-red-500"
  }

  const getWorkingHoursByDate = () => {
    if (!workingHours?.data?.departments) return {}

    const groupedByDate = {}

    workingHours.data.departments.forEach((department) => {
      department.shifts.forEach((shift) => {
        shift.contractingTypes.forEach((contractingType) => {
          contractingType.workingHoursDetails.forEach((detail) => {
            const dateKey = detail.shiftDate

            if (!groupedByDate[dateKey]) {
              groupedByDate[dateKey] = {
                date: dateKey,
                dayOfWeek: detail.dayOfWeek,
                dayOfWeekName:
                  currentLang === "en"
                    ? detail.dayOfWeekNameEn
                    : detail.dayOfWeekNameAr,
                departments: [],
              }
            }

            let deptGroup = groupedByDate[dateKey].departments.find(
              (d) => d.departmentId === department.departmentId
            )

            if (!deptGroup) {
              deptGroup = {
                departmentId: department.departmentId,
                departmentName:
                  currentLang === "en"
                    ? department.departmentNameEn
                    : department.departmentNameAr,
                shifts: [],
              }

              groupedByDate[dateKey].departments.push(deptGroup)
            }

            let shiftGroup = deptGroup.shifts.find(
              (s) => s.shiftId === shift.shiftId
            )

            if (!shiftGroup) {
              shiftGroup = {
                shiftId: shift.shiftId,
                shiftName:
                  currentLang === "en" ? shift.shiftNameEn : shift.shiftNameAr,
                shiftPeriod: shift.shiftPeriod,
                startTime: shift.startTime,
                endTime: shift.endTime,
                hours: shift.hours,
                contractingTypes: [],
              }

              deptGroup.shifts.push(shiftGroup)
            }

            shiftGroup.contractingTypes.push({
              contractingTypeId: contractingType.contractingTypeId,
              contractingTypeName:
                currentLang === "en"
                  ? contractingType.contractingTypeNameEn
                  : contractingType.contractingTypeNameAr,
              contractingTypeNameEn: contractingType.contractingTypeNameEn,
              workingHourDetail: detail,
            })
          })
        })
      })
    })

    return Object.keys(groupedByDate)
      .sort()
      .reduce((sorted, key) => {
        sorted[key] = groupedByDate[key]
        return sorted
      }, {})
  }

  const getDayStats = (dayData) => {
    let shiftsCount = 0
    let contractingTypesCount = 0
    let totalAssigned = 0
    let totalRequired = 0
    let fullyBookedCount = 0
    let overBookedCount = 0
    let fillTotal = 0
    let fillItems = 0

    dayData.departments.forEach((department) => {
      shiftsCount += department.shifts.length

      department.shifts.forEach((shift) => {
        contractingTypesCount += shift.contractingTypes.length

        shift.contractingTypes.forEach((contractingType) => {
          const detail = contractingType.workingHourDetail

          totalAssigned += detail.currentAssignedDoctors || 0
          totalRequired += detail.requiredDoctors || 0
          fillTotal += detail.fillPercentage || 0
          fillItems += 1

          if (detail.isFullyBooked) fullyBookedCount += 1
          if (detail.isOverBooked) overBookedCount += 1
        })
      })
    })

    const averageFill = fillItems > 0 ? Math.round(fillTotal / fillItems) : 0

    return {
      departmentsCount: dayData.departments.length,
      shiftsCount,
      contractingTypesCount,
      totalAssigned,
      totalRequired,
      fullyBookedCount,
      overBookedCount,
      averageFill,
    }
  }

  const getCalendarWeeks = (groupedData) => {
    const days = Object.values(groupedData)

    if (days.length === 0) return []

    const dates = days.map((day) => new Date(day.date))
    const firstDate = new Date(Math.min(...dates))
    const lastDate = new Date(Math.max(...dates))

    const calendarStart = new Date(firstDate)
    calendarStart.setDate(calendarStart.getDate() - calendarStart.getDay())

    const calendarEnd = new Date(lastDate)
    calendarEnd.setDate(calendarEnd.getDate() + (6 - calendarEnd.getDay()))

    const dataByDate = new Map(days.map((day) => [day.date, day]))
    const weeks = []
    let current = new Date(calendarStart)

    while (current <= calendarEnd) {
      const week = []

      for (let i = 0; i < 7; i++) {
        const dateKey = current.toISOString().slice(0, 10)

        week.push({
          date: dateKey,
          dayNumber: current.getDate(),
          isCurrentMonth: current.getMonth() === firstDate.getMonth(),
          data: dataByDate.get(dateKey) || null,
        })

        current.setDate(current.getDate() + 1)
      }

      weeks.push(week)
    }

    return weeks
  }

  const getWeekDays = () => {
    if (currentLang === "ar") {
      return ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"]
    }

    return ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
  }

  const exportToExcel = async () => {
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet(
      currentLang === "ar" ? "جدول العمل" : "Working Hours"
    )

    const groupedData = getWorkingHoursByDate()
    const departmentsMap = new Map()
    const allDates = new Set()

    Object.values(groupedData).forEach((dayData) => {
      allDates.add(dayData.date)

      dayData.departments.forEach((dept) => {
        if (!departmentsMap.has(dept.departmentId)) {
          const shiftsMap = new Map()

          departmentsMap.set(dept.departmentId, {
            id: dept.departmentId,
            name: dept.departmentName,
            shifts: shiftsMap,
            dateData: new Map(),
          })
        }

        const deptData = departmentsMap.get(dept.departmentId)

        deptData.dateData.set(dayData.date, {
          dayOfWeekName: dayData.dayOfWeekName,
          department: dept,
        })

        dept.shifts.forEach((shift) => {
          if (!deptData.shifts.has(shift.shiftId)) {
            deptData.shifts.set(shift.shiftId, {
              id: shift.shiftId,
              name: shift.shiftName,
              contractingTypes: new Set(),
            })
          }

          shift.contractingTypes.forEach((ct) => {
            deptData.shifts
              .get(shift.shiftId)
              .contractingTypes.add(ct.contractingTypeName)
          })
        })
      })
    })

    const sortedDates = Array.from(allDates).sort()
    const departmentsData = Array.from(departmentsMap.values())

    const deptColumns = []

    departmentsData.forEach((dept) => {
      const shifts = Array.from(dept.shifts.values())
      let totalCols = 2

      shifts.forEach((shift) => {
        totalCols += shift.contractingTypes.size
      })

      deptColumns.push({
        dept,
        shifts,
        totalCols,
      })
    })

    let currentCol = 1
    const currentYear = new Date().getFullYear()

    let yearRow = worksheet.getRow(1)
    yearRow.height = 30

    deptColumns.forEach((deptCol, idx) => {
      if (idx > 0) currentCol++

      const startCol = currentCol
      const endCol = startCol + deptCol.totalCols - 1

      worksheet.mergeCells(1, startCol, 1, endCol)

      const cell = worksheet.getCell(1, startCol)
      cell.value = currentYear.toString()
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF1E40AF" },
      }
      cell.font = {
        bold: true,
        size: 16,
        color: { argb: "FFFFFFFF" },
        name: "Arial",
      }
      cell.alignment = { horizontal: "center", vertical: "middle" }

      currentCol += deptCol.totalCols
    })

    currentCol = 1
    let deptRow = worksheet.getRow(2)
    deptRow.height = 30

    deptColumns.forEach((deptCol, idx) => {
      if (idx > 0) currentCol++

      const startCol = currentCol
      const endCol = startCol + deptCol.totalCols - 1

      worksheet.mergeCells(2, startCol, 2, endCol)

      const cell = worksheet.getCell(2, startCol)
      cell.value = deptCol.dept.name
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF2563EB" },
      }
      cell.font = {
        bold: true,
        size: 13,
        color: { argb: "FFFFFFFF" },
        name: "Arial",
      }
      cell.alignment = { horizontal: "center", vertical: "middle" }

      currentCol += deptCol.totalCols
    })

    currentCol = 1
    let shiftRow = worksheet.getRow(3)
    shiftRow.height = 30

    deptColumns.forEach((deptCol, idx) => {
      if (idx > 0) currentCol++

      const startCol = currentCol

      worksheet.mergeCells(3, startCol, 5, startCol)
      const dateCell = worksheet.getCell(3, startCol)
      dateCell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF60A5FA" },
      }

      worksheet.mergeCells(3, startCol + 1, 5, startCol + 1)
      const dayCell = worksheet.getCell(3, startCol + 1)
      dayCell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF60A5FA" },
      }

      currentCol += 2

      deptCol.shifts.forEach((shift) => {
        const shiftStartCol = currentCol
        const shiftEndCol = currentCol + shift.contractingTypes.size - 1

        worksheet.mergeCells(3, shiftStartCol, 3, shiftEndCol)

        const shiftCell = worksheet.getCell(3, shiftStartCol)
        shiftCell.value = shift.name
        shiftCell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FF60A5FA" },
        }
        shiftCell.font = {
          bold: true,
          size: 11,
          color: { argb: "FFFFFFFF" },
          name: "Arial",
        }
        shiftCell.alignment = { horizontal: "center", vertical: "middle" }

        currentCol += shift.contractingTypes.size
      })
    })

    currentCol = 1
    let ctRow = worksheet.getRow(4)
    ctRow.height = 30

    deptColumns.forEach((deptCol, idx) => {
      if (idx > 0) currentCol++

      currentCol += 2

      deptCol.shifts.forEach((shift) => {
        const types = Array.from(shift.contractingTypes)

        types.forEach((typeName) => {
          const cell = worksheet.getCell(4, currentCol)
          cell.value = typeName
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FF93C5FD" },
          }
          cell.font = {
            bold: true,
            size: 10,
            color: { argb: "FF1E3A8A" },
            name: "Arial",
          }
          cell.alignment = { horizontal: "center", vertical: "middle" }
          currentCol++
        })
      })
    })

    currentCol = 1
    let subHeaderRow = worksheet.getRow(5)
    subHeaderRow.height = 25

    deptColumns.forEach((deptCol, idx) => {
      if (idx > 0) currentCol++

      const dateCell = worksheet.getCell(5, currentCol)
      dateCell.value = currentLang === "ar" ? "التاريخ" : "Date"
      currentCol++

      const dayCell = worksheet.getCell(5, currentCol)
      dayCell.value = currentLang === "ar" ? "اليوم" : "Day"
      currentCol++

      deptCol.shifts.forEach((shift) => {
        const types = Array.from(shift.contractingTypes)

        types.forEach(() => {
          const cell = worksheet.getCell(5, currentCol)
          cell.value = currentLang === "ar" ? "العدد" : "Count"
          currentCol++
        })
      })
    })

    let currentRow = 6

    sortedDates.forEach((date) => {
      const dayData = groupedData[date]

      const countRow = worksheet.getRow(currentRow)
      const doctorsRow = worksheet.getRow(currentRow + 1)
      countRow.height = 22
      doctorsRow.height = 40

      currentCol = 1

      deptColumns.forEach((deptCol, deptIdx) => {
        if (deptIdx > 0) currentCol++

        const deptDayData = deptCol.dept.dateData.get(date)

        if (deptDayData) {
          const formattedDate = new Date(date).toLocaleDateString(
            currentLang === "ar" ? "ar-EG" : "en-US",
            { month: "short", day: "numeric" }
          )

          const dateColIndex = currentCol

          worksheet.mergeCells(
            currentRow,
            dateColIndex,
            currentRow + 1,
            dateColIndex
          )

          const dateCell = worksheet.getCell(currentRow, dateColIndex)
          dateCell.value = formattedDate
          currentCol++

          worksheet.mergeCells(currentRow, currentCol, currentRow + 1, currentCol)

          const dayCell = worksheet.getCell(currentRow, currentCol)
          dayCell.value = deptDayData.dayOfWeekName
          currentCol++

          deptCol.shifts.forEach((shiftInfo) => {
            const shiftData = deptDayData.department.shifts.find(
              (s) => s.shiftId === shiftInfo.id
            )

            const types = Array.from(shiftInfo.contractingTypes)

            types.forEach((typeName) => {
              if (shiftData) {
                const ctData = shiftData.contractingTypes.find(
                  (ct) => ct.contractingTypeName === typeName
                )

                if (ctData) {
                  const assigned = ctData.workingHourDetail.currentAssignedDoctors
                  const required = ctData.workingHourDetail.requiredDoctors
                  const doctors = ctData.workingHourDetail.assignedDoctors || []

                  const countCell = worksheet.getCell(currentRow, currentCol)
                  countCell.value = `${assigned}/${required}`

                  const doctorNames = doctors
                    .map((doctor) =>
                      currentLang === "ar"
                        ? doctor.doctorNameAr
                        : doctor.doctorNameEn
                    )
                    .join(currentLang === "ar" ? " - " : " - ")

                  const doctorsCell = worksheet.getCell(
                    currentRow + 1,
                    currentCol
                  )
                  doctorsCell.value = doctorNames || ""
                }
              }

              currentCol++
            })
          })
        } else {
          for (let i = 0; i < deptCol.totalCols; i++) {
            worksheet.getCell(currentRow, currentCol).value = ""
            worksheet.getCell(currentRow + 1, currentCol).value = ""
            currentCol++
          }
        }
      })

      currentRow += 2
    })

    currentCol = 1

    deptColumns.forEach((deptCol, idx) => {
      if (idx > 0) {
        worksheet.getColumn(currentCol).width = 2
        currentCol++
      }

      worksheet.getColumn(currentCol).width = 12
      currentCol++

      worksheet.getColumn(currentCol).width = 12
      currentCol++

      deptCol.shifts.forEach((shift) => {
        shift.contractingTypes.forEach(() => {
          worksheet.getColumn(currentCol).width = 25
          currentCol++
        })
      })
    })

    await worksheet.protect("", {
      selectLockedCells: true,
      selectUnlockedCells: true,
      formatCells: true,
      formatColumns: true,
      formatRows: true,
      insertRows: true,
      insertColumns: true,
      deleteRows: true,
      deleteColumns: true,
      sort: true,
      autoFilter: true,
      pivotTables: true,
      insertHyperlinks: true,
    })

    const buffer = await workbook.xlsx.writeBuffer()
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement("a")

    link.href = url
    link.download = `${rosterTitle}.xlsx`
    link.click()

    window.URL.revokeObjectURL(url)
  }

  const groupedWorkingHours = getWorkingHoursByDate()

  const totalWorkingHoursCount = Object.values(groupedWorkingHours).reduce(
    (count, day) =>
      count +
      day.departments.reduce(
        (deptCount, dept) =>
          deptCount +
          dept.shifts.reduce(
            (shiftCount, shift) => shiftCount + shift.contractingTypes.length,
            0
          ),
        0
      ),
    0
  )

  const selectedDayData = selectedCalendarDate
    ? groupedWorkingHours[selectedCalendarDate]
    : null

  const calendarWeeks = getCalendarWeeks(groupedWorkingHours)

  if (loading.fetch) {
    return <LoadingGetData text={t("gettingData.workingHours")} />
  }

  if (errors.general) {
    return (
      <div className={theme.page} dir={isRTL ? "rtl" : "ltr"}>
        <div className="max-w-6xl mx-auto">
          <div className={`${theme.card} p-6`}>
            <div className="text-center py-12">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />

              <div className="text-red-500 text-lg mb-4">{errors.general}</div>

              <Link
                to={`/admin-panel/rosters/${rosterId}`}
                className={theme.primaryButton}
              >
                {isRTL ? <ArrowRight size={16} /> : <ArrowLeft size={16} />}
                <span className={isRTL ? "mr-2" : "ml-2"}>
                  {t("roster.actions.backToRoster")}
                </span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const CalendarView = () => {
    const weekDays = getWeekDays()

    return (
      <div className="space-y-6">
        <div className={`${theme.card} overflow-hidden`}>
          <div className="grid grid-cols-7 border-b border-[var(--color-border)] bg-[var(--color-surface-muted)]">
            {weekDays.map((day) => (
              <div
                key={day}
                className="p-3 text-center text-sm font-semibold text-[var(--color-text)] border-e border-[var(--color-border)] last:border-e-0"
              >
                {day}
              </div>
            ))}
          </div>

          <div className="divide-y divide-[var(--color-border)]">
            {calendarWeeks.map((week, weekIndex) => (
              <div key={weekIndex} className="grid grid-cols-7 min-h-[150px]">
                {week.map((day) => {
                  const dayData = day.data
                  const stats = dayData ? getDayStats(dayData) : null
                  const isSelected = selectedCalendarDate === day.date

                  return (
                    <button
                      key={day.date}
                      type="button"
                      onClick={() => {
                        if (dayData) {
                          setSelectedCalendarDate(
                            selectedCalendarDate === day.date ? null : day.date
                          )
                        }
                      }}
                      disabled={!dayData}
                      className={`min-h-[150px] p-3 text-start border-e border-[var(--color-border)] last:border-e-0 transition-colors ${
                        dayData
                          ? "hover:bg-[var(--color-bg-soft)] cursor-pointer"
                          : "bg-[var(--color-surface-muted)] opacity-50 cursor-default"
                      } ${
                        isSelected
                          ? "ring-2 ring-inset ring-[var(--color-primary)] bg-[var(--color-primary-soft)]"
                          : ""
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span
                          className={`inline-flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
                            dayData
                              ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                              : "bg-[var(--color-bg-soft)] text-[var(--color-text-muted)]"
                          }`}
                        >
                          {day.dayNumber}
                        </span>

                        {dayData && stats?.overBookedCount > 0 && (
                          <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                        )}

                        {dayData && stats?.fullyBookedCount > 0 && stats?.overBookedCount === 0 && (
                          <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                        )}
                      </div>

                      {dayData && (
                        <div className="space-y-2">
                          <p className="text-xs font-medium text-[var(--color-text)] truncate">
                            {dayData.dayOfWeekName}
                          </p>

                          <div className="flex items-center gap-1 text-xs text-[var(--color-text-muted)]">
                            <Building className={`h-3.5 w-3.5 ${iconColors.building}`} />
                            <span>
                              {stats.departmentsCount} {t("roster.departments")}
                            </span>
                          </div>

                          <div className="flex items-center gap-1 text-xs text-[var(--color-text-muted)]">
                            <Briefcase className={`h-3.5 w-3.5 ${iconColors.progress}`} />
                            <span>
                              {stats.shiftsCount} {t("roster.shifts")}
                            </span>
                          </div>

                          <div className="flex items-center gap-1 text-xs text-[var(--color-text-muted)]">
                            <Users className={`h-3.5 w-3.5 ${iconColors.users}`} />
                            <span>
                              {stats.totalAssigned}/{stats.totalRequired}
                            </span>
                          </div>

                          <div>
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-[10px] text-[var(--color-text-muted)]">
                                {t("roster.progress")}
                              </span>
                              <span
                                className={`text-[10px] font-bold ${getFillColor(
                                  stats.averageFill
                                )}`}
                              >
                                {stats.averageFill}%
                              </span>
                            </div>

                            <div className="h-1.5 rounded-full bg-[var(--color-bg-soft)] overflow-hidden">
                              <div
                                className={`h-full rounded-full ${getFillBgColor(
                                  stats.averageFill
                                )}`}
                                style={{
                                  width: `${Math.min(stats.averageFill, 100)}%`,
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>
            ))}
          </div>
        </div>

        {selectedDayData && (
          <CollapsibleDateCard
            key={selectedDayData.date}
            dayData={selectedDayData}
            formatDate={formatDate}
            formatTime={formatTime}
            getFillColor={getFillColor}
            getFillBgColor={getFillBgColor}
          />
        )}
      </div>
    )
  }

  return (
    <div className={theme.page} dir={isRTL ? "rtl" : "ltr"}>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
            <Link
              to={`/admin-panel/rosters/${rosterId}`}
              className="inline-flex items-center px-3 py-2 text-sm font-medium text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
            >
              {isRTL ? <ArrowRight size={16} /> : <ArrowLeft size={16} />}

              <span className={isRTL ? "mr-2" : "ml-2"}>
                {t("roster.actions.backToRoster")}
              </span>
            </Link>

            <div className="flex flex-wrap items-center gap-3">
              <div className="inline-flex rounded-lg border border-[var(--color-border)] overflow-hidden">
                <button
                  type="button"
                  onClick={() => setViewMode("rows")}
                  className={`px-4 py-2 text-sm font-medium flex items-center gap-2 transition-colors ${
                    viewMode === "rows"
                      ? "bg-[var(--color-primary)] text-white"
                      : "bg-[var(--color-surface)] text-[var(--color-text)] hover:bg-[var(--color-bg-soft)]"
                  }`}
                >
                  <Rows3 size={16} />
                  {currentLang === "ar" ? "صفوف" : "Rows"}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setViewMode("calendar")
                    if (!selectedCalendarDate) {
                      const firstDate = Object.keys(groupedWorkingHours)[0]
                      if (firstDate) setSelectedCalendarDate(firstDate)
                    }
                  }}
                  className={`px-4 py-2 text-sm font-medium flex items-center gap-2 transition-colors border-s border-[var(--color-border)] ${
                    viewMode === "calendar"
                      ? "bg-[var(--color-primary)] text-white"
                      : "bg-[var(--color-surface)] text-[var(--color-text)] hover:bg-[var(--color-bg-soft)]"
                  }`}
                >
                  <CalendarDays size={16} />
                  {currentLang === "ar" ? "تقويم" : "Calendar"}
                </button>
              </div>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`px-4 py-2 rounded-lg cursor-pointer text-sm font-medium transition-colors flex items-center gap-2 ${
                  showFilters
                    ? "bg-[var(--color-primary)] text-white"
                    : "bg-[var(--color-surface)] text-[var(--color-text)] hover:bg-[var(--color-bg-soft)] border border-[var(--color-border)]"
                }`}
                type="button"
              >
                <Filter size={16} />
                {t("common.filters")}
              </button>

              <button
                onClick={exportToExcel}
                disabled={Object.keys(groupedWorkingHours).length === 0}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                  Object.keys(groupedWorkingHours).length === 0
                    ? "bg-gray-400 cursor-not-allowed text-white"
                    : "bg-green-600 hover:bg-green-700 text-white"
                }`}
                type="button"
              >
                <Download size={16} />
                {currentLang === "ar" ? "تحميل Excel" : "Download Excel"}
              </button>

              <button
                onClick={applyFilters}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                type="button"
              >
                <RefreshCw size={16} />
                {t("common.refresh")}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-4 mb-4">
            <div className={`p-3 rounded-xl ${iconBg.clock}`}>
              <Clock className={`h-8 w-8 ${iconColors.clock}`} />
            </div>

            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-[var(--color-text)] mb-2">
                {t("roster.workingHours.title")}
              </h1>

              <p className="text-sm text-[var(--color-text-muted)]">
                {t("roster.workingHours.description")}
              </p>
            </div>
          </div>
        </div>

        {showFilters && (
          <div className={`${theme.card} p-6 mb-6`}>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                  {t("common.startDate")}
                </label>

                <input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) =>
                    handleFilterChange("startDate", e.target.value)
                  }
                  className={`w-full px-3 py-2 ${theme.input}`}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                  {t("common.endDate")}
                </label>

                <input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) =>
                    handleFilterChange("endDate", e.target.value)
                  }
                  className={`w-full px-3 py-2 ${theme.input}`}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                  {t("common.department")}
                </label>

                <select
                  value={filters.departmentId}
                  onChange={(e) =>
                    handleFilterChange("departmentId", e.target.value)
                  }
                  className={`w-full px-3 py-2 ${theme.input}`}
                >
                  <option value="">{t("common.allDepartments")}</option>

                  {departments?.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {currentLang === "en"
                        ? dept?.nameEnglish
                        : dept?.nameArabic}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-end gap-2">
                <button
                  onClick={applyFilters}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors"
                  type="button"
                >
                  <Search size={16} />
                  {t("common.apply")}
                </button>

                <button
                  onClick={clearFilters}
                  className={theme.secondaryButton}
                  type="button"
                >
                  {t("common.clear")}
                </button>
              </div>
            </div>
          </div>
        )}

        {workingHours?.data?.summary && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className={`${theme.card} p-6`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-[var(--color-text)]">
                    {totalWorkingHoursCount}
                  </p>
                  <p className="text-sm text-[var(--color-text-muted)]">
                    {t("roster.totalShifts")}
                  </p>
                </div>

                <div className={`p-3 rounded-xl ${iconBg.timer}`}>
                  <Timer className={`h-8 w-8 ${iconColors.timer}`} />
                </div>
              </div>
            </div>

            <div className={`${theme.card} p-6`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-[var(--color-text)]">
                    {workingHours.data.summary.totalAssignedDoctors}
                  </p>
                  <p className="text-sm text-[var(--color-text-muted)]">
                    {t("roster.assignedDoctors")}
                  </p>
                </div>

                <div className={`p-3 rounded-xl ${iconBg.doctors}`}>
                  <UserCheck className={`h-8 w-8 ${iconColors.doctors}`} />
                </div>
              </div>
            </div>

            <div className={`${theme.card} p-6`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-[var(--color-text)]">
                    {Object.keys(groupedWorkingHours).length}
                  </p>
                  <p className="text-sm text-[var(--color-text-muted)]">
                    {t("roster.totalDays")}
                  </p>
                </div>

                <div className={`p-3 rounded-xl ${iconBg.days}`}>
                  <Calendar className={`h-8 w-8 ${iconColors.days}`} />
                </div>
              </div>
            </div>

            <div className={`${theme.card} p-6`}>
              <div className="flex items-center justify-between">
                <div>
                  <p
                    className={`text-2xl font-bold ${getFillColor(
                      workingHours.data.summary.overallFillPercentage
                    )}`}
                  >
                    {Math.round(
                      workingHours.data.summary.overallFillPercentage
                    )}
                    %
                  </p>
                  <p className="text-sm text-[var(--color-text-muted)]">
                    {t("roster.averageFill")}
                  </p>
                </div>

                <div className={`p-3 rounded-xl ${iconBg.progress}`}>
                  <TrendingUp
                    className={`h-8 w-8 ${getFillColor(
                      workingHours.data.summary.overallFillPercentage
                    )}`}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-6">
          {Object.keys(groupedWorkingHours).length === 0 ? (
            <div className={`${theme.card} p-12 text-center`}>
              <Clock className="h-12 w-12 mx-auto mb-4 text-[var(--color-text-muted)]" />

              <p className="text-lg text-[var(--color-text-muted)]">
                {t("roster.noWorkingHours")}
              </p>
            </div>
          ) : viewMode === "calendar" ? (
            <CalendarView />
          ) : (
            Object.values(groupedWorkingHours).map((dayData) => (
              <CollapsibleDateCard
                key={dayData.date}
                dayData={dayData}
                formatDate={formatDate}
                formatTime={formatTime}
                getFillColor={getFillColor}
                getFillBgColor={getFillBgColor}
              />
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default WorkingHours