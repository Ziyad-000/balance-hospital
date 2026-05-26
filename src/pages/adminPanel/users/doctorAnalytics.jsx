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
} from "lucide-react"

import {
  getDoctorAttendance,
  getDoctorLeaves,
  getDoctorReport,
  getDoctorRosters,
  getDoctorSwaps,
  clearDoctorAnalytics,
} from "../../../state/slices/users"

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
    dateFrom: "",
    dateTo: "",
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

  const loadAllData = (filterState = filters) => {
    if (!doctorId) return

    const cleanFilter = cleanFilters(filterState)

    dispatch(getDoctorReport({ doctorId, filter: cleanFilter, useCache: true }))
    dispatch(getDoctorRosters({ doctorId, filter: cleanFilter, page: 1, pageSize: 10 }))
    dispatch(getDoctorAttendance({ doctorId, filter: cleanFilter, page: 1, pageSize: 10 }))
    dispatch(getDoctorLeaves({ doctorId, filter: cleanFilter, page: 1, pageSize: 10 }))
    dispatch(getDoctorSwaps({ doctorId, filter: cleanFilter, page: 1, pageSize: 10 }))
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
      dateFrom: "",
      dateTo: "",
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

  const summaryCards = useMemo(
    () => [
      {
        title: currentLang === "ar" ? "الشفتات المجدولة" : "Scheduled Shifts",
        value: workStats.totalScheduledShifts ?? 0,
        icon: CalendarDays,
        tone: "blue",
      },
      {
        title: currentLang === "ar" ? "الشفتات المكتملة" : "Completed Shifts",
        value: workStats.totalCompletedShifts ?? 0,
        icon: CheckCircle,
        tone: "green",
      },
      {
        title: currentLang === "ar" ? "إجمالي الساعات" : "Total Hours",
        value: workStats.totalWorkHours ?? 0,
        icon: Clock,
        tone: "purple",
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
        title: currentLang === "ar" ? "طلبات تبديل" : "Swap Requests",
        value: swapStats.totalSent ?? 0,
        icon: Repeat,
        tone: "blue",
      },
      {
        title: currentLang === "ar" ? "طلبات إجازة" : "Leave Requests",
        value: leaveStats.totalLeaves ?? 0,
        icon: FileText,
        tone: "yellow",
      },
    ],
    [currentLang, workStats, attendanceSummary, swapStats, leaveStats]
  )

  const loadingOverview = loadingGetDoctorReport
  const overviewError = doctorReportError

  return (
    <div className={theme.page} dir={isRTL ? "rtl" : "ltr"}>
      <div className="max-w-7xl mx-auto space-y-6">

        {/* ── Header ── */}
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

        {/* ── Doctor hero card ── */}
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
                {/* Icon — same transparent-border style as SpecificUser */}
                <div className="w-16 h-16 rounded-2xl bg-transparent text-blue-500 border-2 border-blue-500 flex items-center justify-center shadow-sm">
                  <Stethoscope className="w-8 h-8" />
                </div>

                <div>
                  <h1 className="text-3xl font-extrabold text-[var(--color-text)]">
                    {doctorName}
                  </h1>

                  <p className="text-sm text-[var(--color-text-muted)] mt-2">
                    {currentLang === "ar"
                      ? "لوحة تحليلات شاملة للدكتور تشمل العمل، الحضور، الروسترات، الإجازات، والتبديلات."
                      : "Comprehensive doctor analytics including work, attendance, rosters, leaves, and swaps."}
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

        {/* ── Filters ── */}
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
              onChange={(value) => handleFilterChange("scientificDegreeId", value)}
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

        {/* ── Stat cards ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-4">
          {summaryCards.map((card) => (
            <StatCard key={card.title} {...card} />
          ))}
        </div>

        {/* ── Tabs ── */}
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

        {/* ── Tab content ── */}
        {activeTab === "overview" && (
          <OverviewTab
            currentLang={currentLang}
            workStats={workStats}
            attendanceSummary={attendanceSummary}
            swapStats={swapStats}
            leaveStats={leaveStats}
            activeRosters={activeRosters}
          />
        )}

        {activeTab === "rosters" && (
          <DataTableSection
            title={currentLang === "ar" ? "روسترات الدكتور" : "Doctor Rosters"}
            icon={CalendarDays}
            currentLang={currentLang}
            loading={loadingGetDoctorRosters}
            error={doctorRostersError}
            data={doctorRosters}
            pagination={doctorRostersPagination}
            type="rosters"
          />
        )}

        {activeTab === "attendance" && (
          <DataTableSection
            title={currentLang === "ar" ? "سجل الحضور" : "Attendance Records"}
            icon={UserCheck}
            currentLang={currentLang}
            loading={loadingGetDoctorAttendance}
            error={doctorAttendanceError}
            data={doctorAttendance}
            pagination={doctorAttendancePagination}
            type="attendance"
          />
        )}

        {activeTab === "leaves" && (
          <DataTableSection
            title={currentLang === "ar" ? "الإجازات" : "Leave Records"}
            icon={FileText}
            currentLang={currentLang}
            loading={loadingGetDoctorLeaves}
            error={doctorLeavesError}
            data={doctorLeaves}
            pagination={doctorLeavesPagination}
            type="leaves"
          />
        )}

        {activeTab === "swaps" && (
          <DataTableSection
            title={currentLang === "ar" ? "طلبات التبديل" : "Swap Requests"}
            icon={Repeat}
            currentLang={currentLang}
            loading={loadingGetDoctorSwaps}
            error={doctorSwapsError}
            data={doctorSwaps}
            pagination={doctorSwapsPagination}
            type="swaps"
          />
        )}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

function cleanFilters(filters) {
  const result = {}
  Object.entries(filters || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      result[key] = value
    }
  })
  return result
}

function getDoctorName(doctor, currentLang) {
  if (!doctor) return "-"
  return currentLang === "ar"
    ? doctor.nameArabic || doctor.nameAr || doctor.fullNameAr || doctor.nameEnglish || doctor.nameEn || "-"
    : doctor.nameEnglish || doctor.nameEn || doctor.fullNameEn || doctor.nameArabic || doctor.nameAr || "-"
}

function getCategoryName(doctor, currentLang) {
  if (!doctor) return "-"
  return currentLang === "ar"
    ? doctor.primaryCategory?.nameArabic || doctor.primaryCategoryNameAr || doctor.categoryNameAr || "-"
    : doctor.primaryCategory?.nameEnglish || doctor.primaryCategoryNameEn || doctor.categoryNameEn || "-"
}

function getScientificDegreeName(doctor, currentLang) {
  if (!doctor) return "-"
  return currentLang === "ar"
    ? doctor.scientificDegree?.nameArabic || doctor.scientificDegreeNameAr || "-"
    : doctor.scientificDegree?.nameEnglish || doctor.scientificDegreeNameEn || "-"
}

function getContractingTypeName(doctor, currentLang) {
  if (!doctor) return "-"
  return currentLang === "ar"
    ? doctor.contractingType?.nameArabic || doctor.contractingTypeNameAr || "-"
    : doctor.contractingType?.nameEnglish || doctor.contractingTypeNameEn || "-"
}

// ─────────────────────────────────────────────
// Tab content
// ─────────────────────────────────────────────

function OverviewTab({ currentLang, workStats, attendanceSummary, swapStats, leaveStats, activeRosters }) {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
      <SectionCard
        title={currentLang === "ar" ? "إحصائيات العمل" : "Work Statistics"}
        icon={Stethoscope}
        tone="blue"
      >
        <InfoGrid>
          <MiniInfo label={currentLang === "ar" ? "الشفتات المجدولة" : "Scheduled Shifts"} value={workStats.totalScheduledShifts ?? 0} />
          <MiniInfo label={currentLang === "ar" ? "الشفتات المكتملة" : "Completed Shifts"} value={workStats.totalCompletedShifts ?? 0} />
          <MiniInfo label={currentLang === "ar" ? "إجمالي ساعات العمل" : "Total Work Hours"} value={workStats.totalWorkHours ?? 0} />
          <MiniInfo label={currentLang === "ar" ? "شفتات الشهر الحالي" : "Current Month Shifts"} value={workStats.currentMonthShifts ?? 0} />
          <MiniInfo label={currentLang === "ar" ? "ساعات الشهر الحالي" : "Current Month Hours"} value={workStats.currentMonthHours ?? 0} />
          <MiniInfo label={currentLang === "ar" ? "الشفتات القادمة" : "Upcoming Shifts"} value={workStats.currentMonthUpcoming ?? 0} />
        </InfoGrid>
      </SectionCard>

      <SectionCard
        title={currentLang === "ar" ? "ملخص الحضور" : "Attendance Summary"}
        icon={UserCheck}
        tone="green"
      >
        <InfoGrid>
          <MiniInfo label={currentLang === "ar" ? "أيام الحضور" : "Present Days"} value={attendanceSummary.totalDaysPresent ?? 0} />
          <MiniInfo label={currentLang === "ar" ? "أيام الغياب" : "Absent Days"} value={attendanceSummary.totalDaysAbsent ?? 0} />
          <MiniInfo label={currentLang === "ar" ? "مرات التأخير" : "Late Arrivals"} value={attendanceSummary.totalLateArrivals ?? 0} />
          <MiniInfo label={currentLang === "ar" ? "انصراف مبكر" : "Early Departures"} value={attendanceSummary.totalEarlyDepartures ?? 0} />
          <MiniInfo label={currentLang === "ar" ? "نسبة الحضور" : "Attendance Rate"} value={`${attendanceSummary.attendanceRate ?? 0}%`} />
        </InfoGrid>
      </SectionCard>

      <SectionCard
        title={currentLang === "ar" ? "طلبات التبديل" : "Swap Requests"}
        icon={Repeat}
        tone="purple"
      >
        <InfoGrid>
          <MiniInfo label={currentLang === "ar" ? "مرسلة" : "Sent"} value={swapStats.totalSent ?? 0} />
          <MiniInfo label={currentLang === "ar" ? "مستلمة" : "Received"} value={swapStats.totalReceived ?? 0} />
          <MiniInfo label={currentLang === "ar" ? "مقبولة كمرسل" : "Approved Sender"} value={swapStats.sentApproved ?? 0} />
          <MiniInfo label={currentLang === "ar" ? "مرفوضة كمرسل" : "Rejected Sender"} value={swapStats.sentRejected ?? 0} />
          <MiniInfo label={currentLang === "ar" ? "معلقة كمرسل" : "Pending Sender"} value={swapStats.sentPending ?? 0} />
          <MiniInfo label={currentLang === "ar" ? "نسبة القبول" : "Approval Rate"} value={`${swapStats.approvalRateAsSender ?? 0}%`} />
        </InfoGrid>
      </SectionCard>

      <SectionCard
        title={currentLang === "ar" ? "طلبات الإجازة" : "Leave Requests"}
        icon={FileText}
        tone="orange"
      >
        <InfoGrid>
          <MiniInfo label={currentLang === "ar" ? "إجمالي الإجازات" : "Total Leaves"} value={leaveStats.totalLeaves ?? 0} />
          <MiniInfo label={currentLang === "ar" ? "مقبولة" : "Approved"} value={leaveStats.approvedLeaves ?? 0} />
          <MiniInfo label={currentLang === "ar" ? "معلقة" : "Pending"} value={leaveStats.pendingLeaves ?? 0} />
          <MiniInfo label={currentLang === "ar" ? "مرفوضة" : "Rejected"} value={leaveStats.rejectedLeaves ?? 0} />
          <MiniInfo label={currentLang === "ar" ? "ملغاة" : "Cancelled"} value={leaveStats.cancelledLeaves ?? 0} />
          <MiniInfo label={currentLang === "ar" ? "أيام الإجازة" : "Leave Days"} value={leaveStats.totalLeaveDays ?? 0} />
        </InfoGrid>
      </SectionCard>

      <SectionCard
        title={currentLang === "ar" ? "الروسترات النشطة" : "Active Rosters"}
        icon={CalendarDays}
        tone="blue"
      >
        {activeRosters.length === 0 ? (
          <EmptyState
            title={currentLang === "ar" ? "لا توجد روسترات" : "No rosters"}
            description={
              currentLang === "ar"
                ? "لا توجد روسترات نشطة لهذا الدكتور."
                : "No active rosters found for this doctor."
            }
          />
        ) : (
          <div className="space-y-3">
            {activeRosters.map((roster) => (
              <div
                key={roster.rosterId}
                className="p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-soft)]"
              >
                <h3 className="font-extrabold text-[var(--color-text)]">
                  {currentLang === "ar"
                    ? roster.rosterNameAr || roster.rosterNameEn
                    : roster.rosterNameEn || roster.rosterNameAr}
                </h3>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
                  <MiniInfo label={currentLang === "ar" ? "الشهر" : "Month"} value={`${roster.month}/${roster.year}`} />
                  <MiniInfo label={currentLang === "ar" ? "الحالة" : "Status"} value={roster.status || "-"} />
                  <MiniInfo label={currentLang === "ar" ? "الشفتات" : "Shifts"} value={roster.totalShiftsInRoster ?? 0} />
                  <MiniInfo label={currentLang === "ar" ? "الساعات" : "Hours"} value={roster.totalHoursInRoster ?? 0} />
                </div>
              </div>
            ))}
          </div>
        )}
      </SectionCard>
    </div>
  )
}

function DataTableSection({ title, icon: Icon, currentLang, loading, error, data, pagination, type }) {
  return (
    <SectionCard title={title} icon={Icon} tone="blue">
      {loading ? (
        <InlineLoader text={currentLang === "ar" ? "جاري تحميل البيانات..." : "Loading data..."} />
      ) : error ? (
        <ErrorBox title={currentLang === "ar" ? "حدث خطأ" : "Error"} message={error?.message} />
      ) : !Array.isArray(data) || data.length === 0 ? (
        <EmptyState
          title={currentLang === "ar" ? "لا توجد بيانات" : "No data"}
          description={currentLang === "ar" ? "لا توجد بيانات متاحة للعرض." : "No data available to display."}
        />
      ) : (
        <div className="space-y-3">
          {data.map((item, index) => (
            <RecordCard
              key={item.id || item.rosterId || item.attendanceId || index}
              item={item}
              type={type}
              currentLang={currentLang}
            />
          ))}

          {pagination && (
            <div className="pt-4 border-t border-[var(--color-border)] text-sm text-[var(--color-text-muted)] flex items-center justify-between gap-3 flex-wrap">
              <span>
                {currentLang === "ar"
                  ? `صفحة ${pagination.page} من ${pagination.totalPages}`
                  : `Page ${pagination.page} of ${pagination.totalPages}`}
              </span>
              <span>
                {currentLang === "ar"
                  ? `الإجمالي: ${pagination.totalCount}`
                  : `Total: ${pagination.totalCount}`}
              </span>
            </div>
          )}
        </div>
      )}
    </SectionCard>
  )
}

function RecordCard({ item, type, currentLang }) {
  if (type === "rosters") {
    return (
      <div className="p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-soft)]">
        <h3 className="font-extrabold text-[var(--color-text)]">
          {currentLang === "ar"
            ? item.rosterNameAr || item.rosterTitleAr || item.rosterNameEn || item.rosterTitleEn || "-"
            : item.rosterNameEn || item.rosterTitleEn || item.rosterNameAr || item.rosterTitleAr || "-"}
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
          <MiniInfo
            label={currentLang === "ar" ? "الشهر" : "Month"}
            value={item.month && item.year ? `${item.month}/${item.year}` : item.date || "-"}
          />
          <MiniInfo label={currentLang === "ar" ? "الحالة" : "Status"} value={item.status || item.rosterStatus || "-"} />
          <MiniInfo label={currentLang === "ar" ? "من" : "From"} value={item.startDate ? formatDate(item.startDate) : "-"} />
          <MiniInfo label={currentLang === "ar" ? "إلى" : "To"} value={item.endDate ? formatDate(item.endDate) : "-"} />
        </div>
      </div>
    )
  }

  if (type === "attendance") {
    return (
      <div className="p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-soft)]">
        <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
          <h3 className="font-extrabold text-[var(--color-text)]">
            {item.date ? formatDate(item.date) : item.attendanceDate ? formatDate(item.attendanceDate) : "-"}
          </h3>
          <AttendanceBadge
            status={
              currentLang === "ar"
                ? item.statusAr || item.attendanceStatusAr || item.status || "-"
                : item.statusEn || item.attendanceStatusEn || item.status || "-"
            }
          />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <MiniInfo label={currentLang === "ar" ? "الدخول" : "Check In"} value={item.checkInTime || item.actualCheckInTime || "-"} />
          <MiniInfo label={currentLang === "ar" ? "الخروج" : "Check Out"} value={item.checkOutTime || item.actualCheckOutTime || "-"} />
          <MiniInfo label={currentLang === "ar" ? "تأخير" : "Late"} value={item.lateMinutes ?? 0} />
          <MiniInfo
            label={currentLang === "ar" ? "القسم" : "Department"}
            value={
              currentLang === "ar"
                ? item.departmentNameAr || item.departmentNameEn || "-"
                : item.departmentNameEn || item.departmentNameAr || "-"
            }
          />
        </div>
      </div>
    )
  }

  if (type === "leaves") {
    return (
      <div className="p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-soft)]">
        <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
          <h3 className="font-extrabold text-[var(--color-text)]">
            {currentLang === "ar"
              ? item.leaveTypeAr || item.leaveTypeNameAr || item.leaveTypeEn || "-"
              : item.leaveTypeEn || item.leaveTypeNameEn || item.leaveTypeAr || "-"}
          </h3>
          <AttendanceBadge status={item.status || item.requestStatus || "-"} />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <MiniInfo label={currentLang === "ar" ? "من" : "From"} value={item.startDate ? formatDate(item.startDate) : "-"} />
          <MiniInfo label={currentLang === "ar" ? "إلى" : "To"} value={item.endDate ? formatDate(item.endDate) : "-"} />
          <MiniInfo label={currentLang === "ar" ? "الأيام" : "Days"} value={item.daysCount ?? item.totalDays ?? "-"} />
          <MiniInfo label={currentLang === "ar" ? "السبب" : "Reason"} value={item.reason || "-"} />
        </div>
      </div>
    )
  }

  if (type === "swaps") {
    return (
      <div className="p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-soft)]">
        <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
          <h3 className="font-extrabold text-[var(--color-text)]">
            {currentLang === "ar" ? "طلب تبديل" : "Swap Request"}
          </h3>
          <AttendanceBadge status={item.status || item.requestStatus || "-"} />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <MiniInfo
            label={currentLang === "ar" ? "من" : "From"}
            value={
              currentLang === "ar"
                ? item.fromDoctorNameAr || item.fromDoctorNameEn || "-"
                : item.fromDoctorNameEn || item.fromDoctorNameAr || "-"
            }
          />
          <MiniInfo
            label={currentLang === "ar" ? "إلى" : "To"}
            value={
              currentLang === "ar"
                ? item.toDoctorNameAr || item.toDoctorNameEn || "-"
                : item.toDoctorNameEn || item.toDoctorNameAr || "-"
            }
          />
          <MiniInfo
            label={currentLang === "ar" ? "التاريخ" : "Date"}
            value={item.date || item.shiftDate ? formatDate(item.date || item.shiftDate) : "-"}
          />
          <MiniInfo label={currentLang === "ar" ? "السبب" : "Reason"} value={item.reason || "-"} />
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-soft)]">
      <pre className="text-xs text-[var(--color-text)] whitespace-pre-wrap">
        {JSON.stringify(item, null, 2)}
      </pre>
    </div>
  )
}

// ─────────────────────────────────────────────
// Shared UI primitives — identical to SpecificUser
// ─────────────────────────────────────────────

function SelectFilter({ label, value, onChange, options, currentLang, theme, loading }) {
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
            ? currentLang === "ar" ? "جاري التحميل..." : "Loading..."
            : currentLang === "ar" ? "الكل" : "All"}
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

/**
 * SectionCard — transparent border style matching SpecificUser
 */
function SectionCard({ title, icon: Icon, children, tone = "blue" }) {
  const toneClass =
    tone === "green"
      ? "bg-transparent text-emerald-500 border-emerald-500"
      : tone === "red"
      ? "bg-transparent text-red-500 border-red-500"
      : tone === "orange"
      ? "bg-transparent text-orange-500 border-orange-500"
      : tone === "yellow"
      ? "bg-transparent text-amber-500 border-amber-500"
      : tone === "purple"
      ? "bg-transparent text-violet-500 border-violet-500"
      : tone === "neutral"
      ? "bg-transparent text-slate-500 border-slate-500"
      : "bg-transparent text-blue-500 border-blue-500"

  return (
    <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-sm)] p-5">
      <h2 className="text-xl font-extrabold text-[var(--color-text)] mb-5 flex items-center gap-2">
        <span
          className={`w-9 h-9 rounded-xl border flex items-center justify-center shadow-sm ${toneClass}`}
        >
          <Icon className="w-5 h-5" />
        </span>
        {title}
      </h2>
      {children}
    </div>
  )
}

function InfoGrid({ children }) {
  return <div className="grid grid-cols-1 md:grid-cols-2 gap-3">{children}</div>
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

/**
 * StatCard — transparent border style matching SpecificUser
 */
function StatCard({ title, value, icon: Icon, tone = "blue" }) {
  const toneMap = {
    blue:   { bg: "bg-transparent", text: "text-blue-500",    border: "border-blue-500" },
    green:  { bg: "bg-transparent", text: "text-emerald-500", border: "border-emerald-500" },
    red:    { bg: "bg-transparent", text: "text-red-500",     border: "border-red-500" },
    orange: { bg: "bg-transparent", text: "text-orange-500",  border: "border-orange-500" },
    purple: { bg: "bg-transparent", text: "text-violet-500",  border: "border-violet-500" },
    yellow: { bg: "bg-transparent", text: "text-amber-500",   border: "border-amber-500" },
    neutral:{ bg: "bg-transparent", text: "text-slate-500",   border: "border-slate-500" },
  }

  const toneStyle = toneMap[tone] || toneMap.blue

  return (
    <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-[var(--shadow-sm)]">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-[var(--color-text-muted)]">{title}</p>
          <p className="mt-2 text-2xl font-extrabold text-[var(--color-text)]">{value ?? 0}</p>
        </div>
        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center border-2 shadow-sm ${toneStyle.bg} ${toneStyle.text} ${toneStyle.border}`}
        >
          <Icon size={22} />
        </div>
      </div>
    </div>
  )
}

function MiniInfo({ label, value }) {
  return (
    <div className="p-4 rounded-xl bg-[var(--color-surface-muted)] border border-[var(--color-border)]">
      <p className="text-xs font-bold text-[var(--color-text-muted)] mb-2">{label}</p>
      <p className="text-sm md:text-base font-extrabold text-[var(--color-text)] break-words">
        {value ?? "-"}
      </p>
    </div>
  )
}

/**
 * Badge — transparent border style matching SpecificUser
 */
function Badge({ text, tone = "blue" }) {
  const toneMap = {
    blue:    "bg-transparent text-blue-500 border-blue-500",
    green:   "bg-transparent text-emerald-500 border-emerald-500",
    red:     "bg-transparent text-red-500 border-red-500",
    orange:  "bg-transparent text-orange-500 border-orange-500",
    purple:  "bg-transparent text-violet-500 border-violet-500",
    neutral: "bg-transparent text-slate-500 border-slate-500",
  }

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border-2 shadow-sm ${
        toneMap[tone] || toneMap.neutral
      }`}
    >
      {text || "-"}
    </span>
  )
}

/**
 * TabButton — green active state matching SpecificUser
 */
function TabButton({ id, activeTab, setActiveTab, icon: Icon, label, count }) {
  const isActive = activeTab === id

  return (
    <button
      type="button"
      onClick={() => setActiveTab(id)}
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold border transition-colors ${
        isActive
          ? "bg-[var(--color-success)] text-white border-[var(--color-success)]"
          : "bg-[var(--color-surface)] text-[var(--color-text)] border-[var(--color-border-strong)] hover:bg-[var(--color-success)] hover:text-white hover:border-[var(--color-success)] active:bg-[var(--color-success-hover)]"
      }`}
    >
      <Icon size={16} />
      {label}
      {count !== undefined && (
        <span
          className={`px-2 py-0.5 rounded-full text-[11px] border ${
            isActive
              ? "bg-white/20 text-white border-white/20"
              : "bg-[var(--color-surface-muted)] text-[var(--color-text-muted)] border-[var(--color-border)]"
          }`}
        >
          {count}
        </span>
      )}
    </button>
  )
}

function InlineLoader({ text }) {
  return (
    <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-8 text-center">
      <div className="w-9 h-9 mx-auto mb-4 rounded-full border-4 border-[var(--color-border)] border-t-[var(--color-primary)] animate-spin" />
      <p className="text-sm font-bold text-[var(--color-text-muted)]">{text}</p>
    </div>
  )
}

function EmptyState({ title, description }) {
  return (
    <div className="p-8 text-center rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)]">
      <Stethoscope className="w-12 h-12 mx-auto mb-3 text-slate-500" />
      <h3 className="text-lg font-extrabold text-[var(--color-text)]">{title}</h3>
      <p className="text-sm text-[var(--color-text-muted)] mt-2">{description}</p>
    </div>
  )
}

/**
 * ErrorBox — transparent border style matching SpecificUser
 */
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

/**
 * AttendanceBadge — transparent border style matching SpecificUser
 */
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

export default DoctorAnalytics