import React, { useEffect, useMemo, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate, useParams } from "react-router-dom"
import { useTranslation } from "react-i18next"
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  BarChart3,
  CalendarDays,
  CheckCircle,
  Clock,
  FileText,
  RefreshCw,
  Repeat,
  Stethoscope,
  UserCheck,
  XCircle,
  Activity,
  Briefcase,
  Timer,
  TrendingUp,
  ShieldAlert,
  Layers,
  Search,
} from "lucide-react"

import {
  getDoctorAttendance,
  getDoctorLeaves,
  getDoctorReport,
  getDoctorRosters,
  getDoctorSwaps,
  clearDoctorAnalytics,
} from "../../../state/slices/users"

import {
  getDoctorWorkloadAnalytics,
} from "../../../state/act/actRosterManagement"

import axiosInstance from "../../../utils/axiosInstance"
import { formatDate } from "../../../utils/formtDate"
import { getPageTheme } from "../../../utils/themeClasses"

const getAuthHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("token")}`,
  "Content-Type": "application/json",
})

const getApiList = (payload) => {
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.data)) return payload.data
  if (Array.isArray(payload?.data?.items)) return payload.data.items
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

const today = new Date()

const getMonthStart = () => {
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, "0")
  return `${year}-${month}-01`
}

const getMonthEnd = () => {
  const year = today.getFullYear()
  const month = today.getMonth()
  const lastDay = new Date(year, month + 1, 0).getDate()

  return `${year}-${String(month + 1).padStart(2, "0")}-${String(lastDay).padStart(
    2,
    "0"
  )}`
}

function DoctorAnalytics() {
  const { doctorId } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { i18n } = useTranslation()
  const theme = getPageTheme()

  const currentLang = i18n.language || "ar"
  const isRTL = currentLang === "ar"

  const [activeTab, setActiveTab] = useState("overview")

  const [lookupsLoading, setLookupsLoading] = useState(false)
  const [lookupsError, setLookupsError] = useState(null)
  const [categories, setCategories] = useState([])
  const [scientificDegrees, setScientificDegrees] = useState([])
  const [contractingTypes, setContractingTypes] = useState([])

  const [filters, setFilters] = useState({
    dateFrom: getMonthStart(),
    dateTo: getMonthEnd(),
    categoryId: "",
    scientificDegreeId: "",
    contractingTypeId: "",
  })

  const {
    doctorReport,
    loadingGetDoctorReport,
    doctorReportError,

    doctorRosters,
    doctorRostersPagination,
    loadingGetDoctorRosters,
    doctorRostersError,

    doctorAttendance,
    doctorAttendancePagination,
    loadingGetDoctorAttendance,
    doctorAttendanceError,

    doctorLeaves,
    doctorLeavesPagination,
    loadingGetDoctorLeaves,
    doctorLeavesError,

    doctorSwaps,
    doctorSwapsPagination,
    loadingGetDoctorSwaps,
    doctorSwapsError,
  } = useSelector((state) => state.users)

  const {
    doctorWorkloadAnalytics,
    loading: rosterLoading,
    errors: rosterErrors,
  } = useSelector((state) => state.rosterManagement)

  useEffect(() => {
    fetchLookups()
  }, [])

  useEffect(() => {
    if (!doctorId) return

    loadAllData(filters)

    return () => {
  dispatch(clearDoctorAnalytics())
}
  }, [dispatch, doctorId])

  const fetchLookups = async () => {
    try {
      setLookupsLoading(true)
      setLookupsError(null)

      const [categoriesRes, degreesRes, contractingRes] = await Promise.all([
        axiosInstance.get("/api/v1/Category/categories-types", {
          headers: getAuthHeaders(),
        }),
        axiosInstance.get("/api/v1/ScientificDegree/scientific-degrees", {
          headers: getAuthHeaders(),
        }),
        axiosInstance.get("/api/v1/ContractingType/contracting-types", {
          headers: getAuthHeaders(),
        }),
      ])

      setCategories(getApiList(categoriesRes.data))
      setScientificDegrees(getApiList(degreesRes.data))
      setContractingTypes(getApiList(contractingRes.data))
    } catch (error) {
      setLookupsError(
        error.response?.data?.messageAr ||
          error.response?.data?.messageEn ||
          error.message ||
          "Failed to load filter lists"
      )
    } finally {
      setLookupsLoading(false)
    }
  }

  const cleanFilters = (filterState) => {
    const clean = {}

    Object.entries(filterState || {}).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        clean[key] = value
      }
    })

    return clean
  }

  const getWorkloadRange = (filterState = filters) => {
    return {
      startDate: filterState.dateFrom || getMonthStart(),
      endDate: filterState.dateTo || getMonthEnd(),
    }
  }

  const loadDoctorWorkload = (filterState = filters) => {
    if (!doctorId) return

    const { startDate, endDate } = getWorkloadRange(filterState)

    dispatch(
      getDoctorWorkloadAnalytics({
        doctorId,
        startDate,
        endDate,
      })
    )
  }

  const loadAllData = (filterState = filters) => {
    if (!doctorId) return

    const cleanFilter = cleanFilters(filterState)

    dispatch(getDoctorReport({ doctorId, filter: cleanFilter, useCache: true }))

    dispatch(
      getDoctorRosters({
        doctorId,
        filter: cleanFilter,
        page: 1,
        pageSize: 10,
      })
    )

    dispatch(
      getDoctorAttendance({
        doctorId,
        filter: cleanFilter,
        page: 1,
        pageSize: 10,
      })
    )

    dispatch(
      getDoctorLeaves({
        doctorId,
        filter: cleanFilter,
        page: 1,
        pageSize: 10,
      })
    )

    dispatch(
      getDoctorSwaps({
        doctorId,
        filter: cleanFilter,
        page: 1,
        pageSize: 10,
      })
    )

    loadDoctorWorkload(filterState)
  }

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }))
  }

  const handleApplyFilters = (event) => {
    event.preventDefault()
    loadAllData(filters)
  }

  const handleResetFilters = () => {
    const emptyFilters = {
      dateFrom: getMonthStart(),
      dateTo: getMonthEnd(),
      categoryId: "",
      scientificDegreeId: "",
      contractingTypeId: "",
    }

    setFilters(emptyFilters)
    loadAllData(emptyFilters)
  }

  const handleRefresh = () => {
    loadAllData(filters)
  }

  const workStats = doctorReport?.workStatistics || {}
  const attendanceSummary = workStats?.attendanceSummary || {}
  const requestsStats = doctorReport?.requestsStatistics || {}
  const swapStats = requestsStats?.swapRequests || {}
  const leaveStats = requestsStats?.leaveRequests || {}
  const activityInfo = doctorReport?.activityInfo || {}

  const activeRosters = Array.isArray(doctorReport?.activeRosters)
    ? doctorReport.activeRosters
    : []

  const doctorName = getDoctorName(doctorReport, currentLang)
  const categoryName = getCategoryName(doctorReport, currentLang)
  const degreeName = getScientificDegreeName(doctorReport, currentLang)
  const contractingName = getContractingTypeName(doctorReport, currentLang)

  const workload = doctorWorkloadAnalytics || {}

  const workloadTotalHours = getNumber(
    workload.totalHours,
    workload.totalWorkHours,
    workload.totalAssignedHours,
    workStats.totalWorkHours
  )

  const workloadRegularHours = getNumber(
    workload.regularHours,
    workload.normalHours,
    workload.totalRegularHours
  )

  const workloadOvertimeHours = getNumber(
    workload.overtimeHours,
    workload.extraHours,
    workload.totalOvertimeHours
  )

  const workloadScheduledShifts = getNumber(
    workload.scheduledShifts,
    workload.totalScheduledShifts,
    workStats.totalScheduledShifts
  )

  const workloadCompletedShifts = getNumber(
    workload.completedShifts,
    workload.totalCompletedShifts,
    workStats.totalCompletedShifts
  )

  const workloadBalanceRate =
    workloadTotalHours > 0
      ? Math.max(
          0,
          Math.min(100, ((workloadRegularHours / workloadTotalHours) * 100).toFixed(1))
        )
      : 0

  const summaryCards = useMemo(
    () => [
      {
        title: currentLang === "ar" ? "الشفتات المجدولة" : "Scheduled Shifts",
        value: workloadScheduledShifts,
        icon: CalendarDays,
        tone: "blue",
      },
      {
        title: currentLang === "ar" ? "الشفتات المكتملة" : "Completed Shifts",
        value: workloadCompletedShifts,
        icon: CheckCircle,
        tone: "green",
      },
      {
        title: currentLang === "ar" ? "إجمالي الساعات" : "Total Hours",
        value: workloadTotalHours,
        icon: Clock,
        tone: "purple",
      },
      {
        title: currentLang === "ar" ? "ساعات إضافية" : "Overtime Hours",
        value: workloadOvertimeHours,
        icon: Timer,
        tone: workloadOvertimeHours > 0 ? "yellow" : "green",
      },
      {
        title: currentLang === "ar" ? "الحضور" : "Attendance",
        value: `${attendanceSummary.attendanceRate ?? 0}%`,
        icon: BarChart3,
        tone: "orange",
      },
      {
        title: currentLang === "ar" ? "أيام حضور" : "Present Days",
        value: attendanceSummary.totalDaysPresent ?? 0,
        icon: UserCheck,
        tone: "green",
      },
      {
        title: currentLang === "ar" ? "أيام غياب" : "Absent Days",
        value: attendanceSummary.totalDaysAbsent ?? 0,
        icon: XCircle,
        tone: "red",
      },
      {
        title: currentLang === "ar" ? "طلبات إجازة" : "Leave Requests",
        value: leaveStats.totalLeaves ?? 0,
        icon: FileText,
        tone: "yellow",
      },
    ],
    [
      currentLang,
      workloadScheduledShifts,
      workloadCompletedShifts,
      workloadTotalHours,
      workloadOvertimeHours,
      attendanceSummary,
      leaveStats,
    ]
  )

  const loadingOverview = loadingGetDoctorReport
  const overviewError = doctorReportError

  return (
    <div className={theme.page} dir={isRTL ? "rtl" : "ltr"}>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <button
            type="button"
            onClick={() => navigate(`/admin-panel/users/${doctorId}`)}
            className="inline-flex items-center gap-2 text-sm font-bold text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
          >
            {isRTL ? <ArrowRight size={16} /> : <ArrowLeft size={16} />}
            {currentLang === "ar" ? "رجوع لبيانات الدكتور" : "Back to Doctor"}
          </button>

          <button
            type="button"
            onClick={handleRefresh}
            className={theme.secondaryButton}
          >
            <RefreshCw size={16} />
            {currentLang === "ar" ? "تحديث" : "Refresh"}
          </button>
        </div>

        {lookupsError && <ErrorBox message={lookupsError} />}

        {/* Doctor Hero */}
        <div className={`${theme.card} p-6`}>
          {loadingOverview ? (
            <InlineLoader
              text={
                currentLang === "ar"
                  ? "جاري تحميل تحليلات الدكتور..."
                  : "Loading doctor analytics..."
              }
            />
          ) : overviewError ? (
            <ErrorBox
              title={
                currentLang === "ar"
                  ? "تعذر تحميل تقرير الدكتور"
                  : "Failed to load doctor report"
              }
              message={overviewError?.message}
            />
          ) : (
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-2xl bg-transparent text-blue-500 border-2 border-blue-500 flex items-center justify-center shadow-sm">
                  <Stethoscope className="w-8 h-8" />
                </div>

                <div>
                  <h1 className="text-3xl font-extrabold text-[var(--color-text)]">
                    {doctorName}
                  </h1>

                  <p className="text-sm text-[var(--color-text-muted)] mt-2">
                    {currentLang === "ar"
                      ? "لوحة تحليلات شاملة للدكتور تشمل العمل، الحضور، الروسترات، الإجازات، التبديلات، وعبء العمل."
                      : "Comprehensive doctor analytics including work, attendance, rosters, leaves, swaps, and workload."}
                  </p>

                  <div className="flex flex-wrap gap-2 mt-4">
                    <Badge text={categoryName} tone="blue" />
                    <Badge text={degreeName} tone="green" />
                    <Badge text={contractingName} tone="purple" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 min-w-full xl:min-w-[520px]">
                <MiniInfo
                  label={currentLang === "ar" ? "البريد" : "Email"}
                  value={doctorReport?.email || "-"}
                />
                <MiniInfo
                  label={currentLang === "ar" ? "الموبايل" : "Mobile"}
                  value={doctorReport?.mobile || "-"}
                />
                <MiniInfo
                  label={currentLang === "ar" ? "رقم الطباعة" : "Print Number"}
                  value={doctorReport?.printNumber || "-"}
                />
                <MiniInfo
                  label={currentLang === "ar" ? "آخر دخول" : "Last Login"}
                  value={
                    doctorReport?.lastLoginAt
                      ? formatDate(doctorReport.lastLoginAt)
                      : "-"
                  }
                />
                <MiniInfo
                  label={currentLang === "ar" ? "عدد مرات الدخول" : "Login Count"}
                  value={activityInfo.totalLoginCount ?? 0}
                />
                <MiniInfo
                  label={currentLang === "ar" ? "وقت النشاط" : "Active Time"}
                  value={activityInfo.totalActiveTime || "-"}
                />
              </div>
            </div>
          )}
        </div>

        {/* Filters */}
        <div className={`${theme.card} p-5`}>
          <form
            onSubmit={handleApplyFilters}
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4"
          >
            <FormInput
              type="date"
              label={currentLang === "ar" ? "من تاريخ" : "From Date"}
              value={filters.dateFrom}
              onChange={(value) => handleFilterChange("dateFrom", value)}
              theme={theme}
            />

            <FormInput
              type="date"
              label={currentLang === "ar" ? "إلى تاريخ" : "To Date"}
              value={filters.dateTo}
              onChange={(value) => handleFilterChange("dateTo", value)}
              theme={theme}
            />

            <SelectFilter
              label={currentLang === "ar" ? "التخصص" : "Category"}
              value={filters.categoryId}
              onChange={(value) => handleFilterChange("categoryId", value)}
              options={categories}
              currentLang={currentLang}
              theme={theme}
              loading={lookupsLoading}
            />

            <SelectFilter
              label={currentLang === "ar" ? "الدرجة العلمية" : "Scientific Degree"}
              value={filters.scientificDegreeId}
              onChange={(value) =>
                handleFilterChange("scientificDegreeId", value)
              }
              options={scientificDegrees}
              currentLang={currentLang}
              theme={theme}
              loading={lookupsLoading}
            />

            <SelectFilter
              label={currentLang === "ar" ? "نوع التعاقد" : "Contract Type"}
              value={filters.contractingTypeId}
              onChange={(value) => handleFilterChange("contractingTypeId", value)}
              options={contractingTypes}
              currentLang={currentLang}
              theme={theme}
              loading={lookupsLoading}
            />

            <div className="xl:col-span-5 flex justify-end gap-3 flex-wrap">
              <button
                type="button"
                onClick={handleResetFilters}
                className={theme.secondaryButton}
              >
                {currentLang === "ar" ? "مسح الفلاتر" : "Clear Filters"}
              </button>

              <button type="submit" className={theme.primaryButton}>
                <BarChart3 size={16} />
                {currentLang === "ar" ? "تطبيق الفلاتر" : "Apply Filters"}
              </button>
            </div>
          </form>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-4">
          {summaryCards.map((card) => (
            <StatCard key={card.title} {...card} />
          ))}
        </div>

        {/* Tabs */}
        <div className={`${theme.card} p-4`}>
          <div className="flex flex-wrap gap-2">
            <TabButton
              id="overview"
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              icon={BarChart3}
              label={currentLang === "ar" ? "نظرة عامة" : "Overview"}
            />
            <TabButton
              id="workload"
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              icon={Activity}
              label={currentLang === "ar" ? "عبء العمل" : "Workload"}
            />
            <TabButton
              id="rosters"
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              icon={CalendarDays}
              label={currentLang === "ar" ? "الروسترات" : "Rosters"}
            />
            <TabButton
              id="attendance"
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              icon={UserCheck}
              label={currentLang === "ar" ? "الحضور" : "Attendance"}
            />
            <TabButton
              id="leaves"
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              icon={FileText}
              label={currentLang === "ar" ? "الإجازات" : "Leaves"}
            />
            <TabButton
              id="swaps"
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              icon={Repeat}
              label={currentLang === "ar" ? "التبديلات" : "Swaps"}
            />
          </div>
        </div>

        {/* Content */}
        {activeTab === "overview" && (
          <OverviewTab
            theme={theme}
            currentLang={currentLang}
            doctorReport={doctorReport}
            workStats={workStats}
            attendanceSummary={attendanceSummary}
            requestsStats={requestsStats}
            activeRosters={activeRosters}
            workload={workload}
          />
        )}

        {activeTab === "workload" && (
          <WorkloadTab
            theme={theme}
            currentLang={currentLang}
            workload={workload}
            loading={rosterLoading?.doctorWorkloadAnalytics}
            error={rosterErrors?.doctorWorkloadAnalytics}
            workloadTotalHours={workloadTotalHours}
            workloadRegularHours={workloadRegularHours}
            workloadOvertimeHours={workloadOvertimeHours}
            workloadBalanceRate={workloadBalanceRate}
          />
        )}

        {activeTab === "rosters" && (
          <DataListTab
            title={currentLang === "ar" ? "روسترات الدكتور" : "Doctor Rosters"}
            loading={loadingGetDoctorRosters}
            error={doctorRostersError}
            rows={doctorRosters}
            pagination={doctorRostersPagination}
            currentLang={currentLang}
            emptyText={currentLang === "ar" ? "لا توجد روسترات" : "No rosters"}
            renderRow={(item) => (
              <GenericRow
                icon={CalendarDays}
                title={item.rosterTitle || item.title || item.name || "-"}
                subtitle={`${item.categoryName || item.categoryNameAr || ""} • ${
                  item.status || "-"
                }`}
                meta={formatDate(item.startDate || item.createdAt)}
                badge={<AttendanceBadge status={item.status} />}
              />
            )}
          />
        )}

        {activeTab === "attendance" && (
          <DataListTab
            title={currentLang === "ar" ? "سجل الحضور" : "Attendance Records"}
            loading={loadingGetDoctorAttendance}
            error={doctorAttendanceError}
            rows={doctorAttendance}
            pagination={doctorAttendancePagination}
            currentLang={currentLang}
            emptyText={
              currentLang === "ar" ? "لا توجد سجلات حضور" : "No attendance records"
            }
            renderRow={(item) => (
              <GenericRow
                icon={UserCheck}
                title={formatDate(item.date || item.attendanceDate || item.createdAt)}
                subtitle={`${item.departmentNameAr || item.departmentNameEn || "-"} • ${
                  item.shiftNameAr || item.shiftNameEn || "-"
                }`}
                meta={`${item.checkInTime || "-"} - ${item.checkOutTime || "-"}`}
                badge={<AttendanceBadge status={item.status || item.attendanceStatus} />}
              />
            )}
          />
        )}

        {activeTab === "leaves" && (
          <DataListTab
            title={currentLang === "ar" ? "الإجازات" : "Leaves"}
            loading={loadingGetDoctorLeaves}
            error={doctorLeavesError}
            rows={doctorLeaves}
            pagination={doctorLeavesPagination}
            currentLang={currentLang}
            emptyText={currentLang === "ar" ? "لا توجد إجازات" : "No leaves"}
            renderRow={(item) => (
              <GenericRow
                icon={FileText}
                title={item.reason || item.leaveType || "-"}
                subtitle={`${formatDate(item.startDate)} - ${formatDate(item.endDate)}`}
                meta={formatDate(item.createdAt)}
                badge={<AttendanceBadge status={item.status} />}
              />
            )}
          />
        )}

        {activeTab === "swaps" && (
          <DataListTab
            title={currentLang === "ar" ? "طلبات التبديل" : "Swap Requests"}
            loading={loadingGetDoctorSwaps}
            error={doctorSwapsError}
            rows={doctorSwaps}
            pagination={doctorSwapsPagination}
            currentLang={currentLang}
            emptyText={
              currentLang === "ar" ? "لا توجد طلبات تبديل" : "No swap requests"
            }
            renderRow={(item) => (
              <GenericRow
                icon={Repeat}
                title={item.requestTitle || item.description || "-"}
                subtitle={`${item.fromDoctorName || ""} ${
                  item.toDoctorName ? `→ ${item.toDoctorName}` : ""
                }`}
                meta={formatDate(item.createdAt)}
                badge={<AttendanceBadge status={item.status} />}
              />
            )}
          />
        )}
      </div>
    </div>
  )
}

function OverviewTab({
  theme,
  currentLang,
  doctorReport,
  workStats,
  attendanceSummary,
  requestsStats,
  activeRosters,
  workload,
}) {
  const swapStats = requestsStats?.swapRequests || {}
  const leaveStats = requestsStats?.leaveRequests || {}

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      <div className={`${theme.card} p-5 xl:col-span-2`}>
        <SectionTitle
          icon={BarChart3}
          title={currentLang === "ar" ? "ملخص الأداء" : "Performance Summary"}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <MiniPanel
            title={currentLang === "ar" ? "إجمالي الشفتات" : "Total Shifts"}
            value={workStats.totalScheduledShifts ?? 0}
            icon={CalendarDays}
            tone="blue"
          />
          <MiniPanel
            title={currentLang === "ar" ? "معدل الحضور" : "Attendance Rate"}
            value={`${attendanceSummary.attendanceRate ?? 0}%`}
            icon={UserCheck}
            tone="green"
          />
          <MiniPanel
            title={currentLang === "ar" ? "إجمالي الساعات" : "Total Hours"}
            value={
              workload?.totalHours ??
              workload?.totalWorkHours ??
              workStats.totalWorkHours ??
              0
            }
            icon={Clock}
            tone="purple"
          />
        </div>

        <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
          <InfoLine
            label={currentLang === "ar" ? "أيام الحضور" : "Present Days"}
            value={attendanceSummary.totalDaysPresent ?? 0}
          />
          <InfoLine
            label={currentLang === "ar" ? "أيام الغياب" : "Absent Days"}
            value={attendanceSummary.totalDaysAbsent ?? 0}
          />
          <InfoLine
            label={currentLang === "ar" ? "طلبات التبديل" : "Swap Requests"}
            value={swapStats.totalSent ?? 0}
          />
          <InfoLine
            label={currentLang === "ar" ? "طلبات الإجازة" : "Leave Requests"}
            value={leaveStats.totalLeaves ?? 0}
          />
        </div>
      </div>

      <div className={`${theme.card} p-5`}>
        <SectionTitle
          icon={CalendarDays}
          title={currentLang === "ar" ? "روسترات نشطة" : "Active Rosters"}
        />

        <div className="space-y-3">
          {activeRosters.length === 0 ? (
            <EmptyState
              title={currentLang === "ar" ? "لا توجد روسترات نشطة" : "No active rosters"}
            />
          ) : (
            activeRosters.slice(0, 6).map((roster, index) => (
              <GenericRow
                key={roster.id || index}
                icon={CalendarDays}
                title={roster.title || roster.rosterTitle || "-"}
                subtitle={roster.categoryName || "-"}
                meta={formatDate(roster.startDate)}
                badge={<AttendanceBadge status={roster.status} />}
              />
            ))
          )}
        </div>
      </div>
    </div>
  )
}

function WorkloadTab({
  theme,
  currentLang,
  workload,
  loading,
  error,
  workloadTotalHours,
  workloadRegularHours,
  workloadOvertimeHours,
  workloadBalanceRate,
}) {
  const detectedPatterns = Array.isArray(workload?.detectedPatterns)
    ? workload.detectedPatterns
    : []

  const recommendations = Array.isArray(workload?.recommendations)
    ? workload.recommendations
    : workload?.recommendedAction
    ? [workload.recommendedAction]
    : []

  return (
    <div className="space-y-6">
      {loading && (
        <InlineLoader
          text={
            currentLang === "ar"
              ? "جاري تحميل عبء العمل..."
              : "Loading workload analytics..."
          }
        />
      )}

      {error && (
        <ErrorBox
          title={
            currentLang === "ar"
              ? "تعذر تحميل عبء العمل"
              : "Failed to load workload"
          }
          message={typeof error === "string" ? error : error?.message}
        />
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title={currentLang === "ar" ? "إجمالي الساعات" : "Total Hours"}
          value={workloadTotalHours}
          icon={Clock}
          tone="blue"
        />
        <StatCard
          title={currentLang === "ar" ? "ساعات عادية" : "Regular Hours"}
          value={workloadRegularHours}
          icon={Timer}
          tone="green"
        />
        <StatCard
          title={currentLang === "ar" ? "ساعات إضافية" : "Overtime Hours"}
          value={workloadOvertimeHours}
          icon={ShieldAlert}
          tone={workloadOvertimeHours > 0 ? "yellow" : "green"}
        />
        <StatCard
          title={currentLang === "ar" ? "اتزان العبء" : "Balance"}
          value={`${workloadBalanceRate}%`}
          icon={TrendingUp}
          tone={workloadBalanceRate >= 80 ? "green" : "yellow"}
        />
      </div>

      <div className={`${theme.card} p-5`}>
        <SectionTitle
          icon={Activity}
          title={currentLang === "ar" ? "تفاصيل عبء العمل" : "Workload Details"}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          <InfoLine
            label={currentLang === "ar" ? "اسم الطبيب" : "Doctor Name"}
            value={valueOrDash(workload?.doctorNameAr, workload?.doctorName)}
          />
          <InfoLine
            label={currentLang === "ar" ? "الدرجة العلمية" : "Scientific Degree"}
            value={valueOrDash(workload?.degreeNameAr, workload?.degreeName)}
          />
          <InfoLine
            label={currentLang === "ar" ? "عدد الشفتات" : "Shifts Count"}
            value={valueOrDash(
              workload?.scheduledShifts,
              workload?.totalScheduledShifts
            )}
          />
          <InfoLine
            label={currentLang === "ar" ? "شفتات مكتملة" : "Completed Shifts"}
            value={valueOrDash(
              workload?.completedShifts,
              workload?.totalCompletedShifts
            )}
          />
          <InfoLine
            label={currentLang === "ar" ? "متوسط الساعات" : "Average Hours"}
            value={valueOrDash(workload?.averageHours, workload?.avgHours)}
          />
          <InfoLine
            label={currentLang === "ar" ? "مستوى العبء" : "Workload Level"}
            value={valueOrDash(workload?.workloadLevel, workload?.level)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className={`${theme.card} p-5`}>
          <SectionTitle
            icon={Layers}
            title={currentLang === "ar" ? "أنماط مكتشفة" : "Detected Patterns"}
          />

          {detectedPatterns.length === 0 ? (
            <EmptyState
              title={currentLang === "ar" ? "لا توجد أنماط واضحة" : "No clear patterns"}
            />
          ) : (
            <div className="space-y-2">
              {detectedPatterns.map((item, index) => (
                <GenericRow
                  key={index}
                  icon={Activity}
                  title={item}
                  subtitle={currentLang === "ar" ? "نمط عمل" : "Work pattern"}
                  badge={<Badge text="Pattern" tone="blue" />}
                />
              ))}
            </div>
          )}
        </div>

        <div className={`${theme.card} p-5`}>
          <SectionTitle
            icon={ShieldAlert}
            title={currentLang === "ar" ? "توصيات" : "Recommendations"}
          />

          {recommendations.length === 0 ? (
            <EmptyState
              title={currentLang === "ar" ? "لا توجد توصيات" : "No recommendations"}
            />
          ) : (
            <div className="space-y-2">
              {recommendations.map((item, index) => (
                <GenericRow
                  key={index}
                  icon={ShieldAlert}
                  title={item}
                  subtitle={currentLang === "ar" ? "توصية تشغيلية" : "Operational recommendation"}
                  badge={<Badge text="Action" tone="yellow" />}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function DataListTab({
  title,
  loading,
  error,
  rows,
  pagination,
  currentLang,
  emptyText,
  renderRow,
}) {
  const safeRows = Array.isArray(rows) ? rows : []

  return (
    <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden">
      <div className="p-5 border-b border-[var(--color-border)]">
        <h2 className="text-xl font-extrabold text-[var(--color-text)]">
          {title}
        </h2>
        <p className="text-sm text-[var(--color-text-muted)] mt-1">
          {currentLang === "ar"
            ? `إجمالي النتائج: ${pagination?.totalCount ?? safeRows.length}`
            : `Total results: ${pagination?.totalCount ?? safeRows.length}`}
        </p>
      </div>

      {loading ? (
        <InlineLoader
          text={currentLang === "ar" ? "جاري تحميل البيانات..." : "Loading data..."}
        />
      ) : error ? (
        <ErrorBox message={error?.message || String(error)} />
      ) : safeRows.length === 0 ? (
        <EmptyState title={emptyText} />
      ) : (
        <div className="p-4 space-y-3">{safeRows.map((row, index) => renderRow(row, index))}</div>
      )}
    </div>
  )
}

function SectionTitle({ icon: Icon, title }) {
  return (
    <h2 className="text-xl font-extrabold text-[var(--color-text)] mb-5 flex items-center gap-2">
      <span className="w-10 h-10 rounded-xl bg-transparent text-blue-500 border-2 border-blue-500 flex items-center justify-center">
        <Icon size={20} />
      </span>
      {title}
    </h2>
  )
}

function GenericRow({ icon: Icon, title, subtitle, meta, badge }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-muted)] p-3">
      <div className="flex items-center gap-3 min-w-0">
        <span className="w-10 h-10 rounded-xl bg-transparent text-blue-500 border-2 border-blue-500 flex items-center justify-center shrink-0">
          <Icon size={18} />
        </span>

        <div className="min-w-0">
          <p className="font-extrabold text-[var(--color-text)] truncate">
            {title}
          </p>
          {subtitle && (
            <p className="text-xs text-[var(--color-text-muted)] truncate mt-1">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {meta && (
          <span className="text-xs font-bold text-[var(--color-text-muted)]">
            {meta}
          </span>
        )}
        {badge}
      </div>
    </div>
  )
}

function FormInput({ label, value, onChange, theme, type = "text" }) {
  return (
    <div>
      <label className="text-xs font-bold text-[var(--color-text-muted)] block mb-1">
        {label}
      </label>

      <input
        type={type}
        value={value || ""}
        onChange={(event) => onChange(event.target.value)}
        className={theme.input}
      />
    </div>
  )
}

function SelectFilter({
  label,
  value,
  onChange,
  options,
  currentLang,
  theme,
  loading,
}) {
  return (
    <div>
      <label className="text-xs font-bold text-[var(--color-text-muted)] block mb-1">
        {label}
      </label>

      <select
        value={value || ""}
        disabled={loading}
        onChange={(event) => onChange(event.target.value)}
        className={theme.input}
      >
        <option value="">
          {loading
            ? currentLang === "ar"
              ? "جاري التحميل..."
              : "Loading..."
            : currentLang === "ar"
            ? "الكل"
            : "All"}
        </option>

        {options.map((item) => (
          <option key={item.id} value={String(item.id)}>
            {currentLang === "ar"
              ? item.nameArabic || item.nameAr || item.nameEnglish || item.nameEn
              : item.nameEnglish || item.nameEn || item.nameArabic || item.nameAr}
          </option>
        ))}
      </select>
    </div>
  )
}

function StatCard({ title, value, icon: Icon, tone = "blue" }) {
  const toneMap = {
    blue: {
      text: "text-blue-500",
      border: "border-blue-500",
    },
    green: {
      text: "text-emerald-500",
      border: "border-emerald-500",
    },
    yellow: {
      text: "text-amber-500",
      border: "border-amber-500",
    },
    purple: {
      text: "text-violet-500",
      border: "border-violet-500",
    },
    red: {
      text: "text-red-500",
      border: "border-red-500",
    },
    orange: {
      text: "text-orange-500",
      border: "border-orange-500",
    },
  }

  const toneStyle = toneMap[tone] || toneMap.blue

  return (
    <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-[var(--shadow-sm)]">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-[var(--color-text-muted)]">
            {title}
          </p>
          <p className={`mt-2 text-2xl font-extrabold ${toneStyle.text}`}>
            {value ?? 0}
          </p>
        </div>

        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center border-2 bg-transparent ${toneStyle.text} ${toneStyle.border}`}
        >
          <Icon size={22} />
        </div>
      </div>
    </div>
  )
}

function TabButton({ id, activeTab, setActiveTab, icon: Icon, label }) {
  const isActive = activeTab === id

  return (
    <button
      type="button"
      onClick={() => setActiveTab(id)}
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold border transition-colors ${
        isActive
          ? "bg-emerald-500 text-white border-emerald-500"
          : "bg-[var(--color-surface)] text-[var(--color-text)] border-[var(--color-border-strong)] hover:bg-emerald-500 hover:text-white hover:border-emerald-500 active:bg-emerald-600"
      }`}
    >
      <Icon size={16} />
      {label}
    </button>
  )
}

function Badge({ text, tone = "blue" }) {
  const toneMap = {
    blue: "text-blue-500 border-blue-500",
    green: "text-emerald-500 border-emerald-500",
    yellow: "text-amber-500 border-amber-500",
    purple: "text-violet-500 border-violet-500",
    red: "text-red-500 border-red-500",
    orange: "text-orange-500 border-orange-500",
    slate: "text-slate-500 border-slate-500",
  }

  return (
    <span
      className={`px-3 py-1 rounded-full border-2 text-xs font-bold bg-transparent shadow-sm ${
        toneMap[tone] || toneMap.blue
      }`}
    >
      {text || "-"}
    </span>
  )
}

function AttendanceBadge({ status }) {
  const normalized = String(status || "").toLowerCase()

  let cls = "bg-transparent text-blue-500 border-blue-500"

  if (normalized.includes("حاضر") || normalized.includes("present")) {
    cls = "bg-transparent text-emerald-500 border-emerald-500"
  }
  if (normalized.includes("غائب") || normalized.includes("absent")) {
    cls = "bg-transparent text-red-500 border-red-500"
  }
  if (normalized.includes("متأخر") || normalized.includes("late")) {
    cls = "bg-transparent text-amber-500 border-amber-500"
  }
  if (normalized.includes("مقبول") || normalized.includes("approved")) {
    cls = "bg-transparent text-emerald-500 border-emerald-500"
  }
  if (normalized.includes("مرفوض") || normalized.includes("rejected")) {
    cls = "bg-transparent text-red-500 border-red-500"
  }
  if (normalized.includes("معلق") || normalized.includes("pending")) {
    cls = "bg-transparent text-amber-500 border-amber-500"
  }
  if (normalized.includes("ملغ") || normalized.includes("cancel")) {
    cls = "bg-transparent text-slate-500 border-slate-500"
  }

  return (
    <span className={`px-3 py-1 rounded-full border-2 text-xs font-bold shadow-sm ${cls}`}>
      {status || "-"}
    </span>
  )
}

function MiniInfo({ label, value }) {
  return (
    <div className="p-4 rounded-xl bg-[var(--color-surface-muted)] border border-[var(--color-border)]">
      <p className="text-xs font-bold text-[var(--color-text-muted)] mb-2">
        {label}
      </p>
      <p className="text-sm md:text-base font-extrabold text-[var(--color-text)] break-words">
        {value ?? "-"}
      </p>
    </div>
  )
}

function MiniPanel({ title, value, icon: Icon, tone = "blue" }) {
  return <StatCard title={title} value={value} icon={Icon} tone={tone} />
}

function InfoLine({ label, value }) {
  return (
    <div className="p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-muted)] flex items-center justify-between gap-4">
      <span className="text-sm font-bold text-[var(--color-text-muted)]">
        {label}
      </span>
      <span className="text-sm font-extrabold text-[var(--color-text)]">
        {value ?? "-"}
      </span>
    </div>
  )
}

function InlineLoader({ text }) {
  return (
    <div className="p-8 text-center">
      <div className="w-9 h-9 mx-auto mb-4 rounded-full border-4 border-[var(--color-border)] border-t-[var(--color-primary)] animate-spin" />
      <p className="text-sm font-bold text-[var(--color-text-muted)]">{text}</p>
    </div>
  )
}

function EmptyState({ title, description }) {
  return (
    <div className="p-8 text-center rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)]">
      <Stethoscope className="w-12 h-12 mx-auto mb-3 text-[var(--color-text-muted)]" />
      <h3 className="text-lg font-extrabold text-[var(--color-text)]">
        {title}
      </h3>
      {description && (
        <p className="text-sm text-[var(--color-text-muted)] mt-2">
          {description}
        </p>
      )}
    </div>
  )
}

function ErrorBox({ title, message }) {
  return (
    <div className="p-5 rounded-2xl bg-transparent text-red-500 border-2 border-red-500 shadow-sm">
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 mt-0.5 text-red-500" />
        <div>
          {title && <h3 className="font-extrabold mb-1">{title}</h3>}
          <p className="text-sm font-bold">{message || "Error"}</p>
        </div>
      </div>
    </div>
  )
}

function getDoctorName(report, currentLang) {
  if (!report) return "-"

  return currentLang === "ar"
    ? report.nameArabic ||
        report.nameAr ||
        report.fullNameAr ||
        report.doctorNameAr ||
        report.nameEnglish ||
        report.nameEn ||
        report.fullNameEn ||
        report.doctorNameEn ||
        "-"
    : report.nameEnglish ||
        report.nameEn ||
        report.fullNameEn ||
        report.doctorNameEn ||
        report.nameArabic ||
        report.nameAr ||
        report.fullNameAr ||
        report.doctorNameAr ||
        "-"
}

function getCategoryName(report, currentLang) {
  if (!report) return "-"

  return currentLang === "ar"
    ? report.primaryCategoryNameAr ||
        report.categoryNameAr ||
        report.categoryNameArabic ||
        report.primaryCategory?.nameArabic ||
        report.primaryCategoryNameEn ||
        "-"
    : report.primaryCategoryNameEn ||
        report.categoryNameEn ||
        report.categoryNameEnglish ||
        report.primaryCategory?.nameEnglish ||
        report.primaryCategoryNameAr ||
        "-"
}

function getScientificDegreeName(report, currentLang) {
  if (!report) return "-"

  return currentLang === "ar"
    ? report.scientificDegreeNameAr ||
        report.scientificDegree?.nameArabic ||
        report.scientificDegreeNameEn ||
        report.scientificDegree?.nameEnglish ||
        "-"
    : report.scientificDegreeNameEn ||
        report.scientificDegree?.nameEnglish ||
        report.scientificDegreeNameAr ||
        report.scientificDegree?.nameArabic ||
        "-"
}

function getContractingTypeName(report, currentLang) {
  if (!report) return "-"

  return currentLang === "ar"
    ? report.contractingTypeNameAr ||
        report.contractingType?.nameArabic ||
        report.contractingTypeNameEn ||
        report.contractingType?.nameEnglish ||
        "-"
    : report.contractingTypeNameEn ||
        report.contractingType?.nameEnglish ||
        report.contractingTypeNameAr ||
        report.contractingType?.nameArabic ||
        "-"
}

export default DoctorAnalytics