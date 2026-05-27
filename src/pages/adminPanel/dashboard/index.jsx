import { useEffect, useMemo, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Bell,
  Briefcase,
  Building,
  Calendar,
  CheckCircle,
  Clock,
  ClipboardList,
  Eye,
  FileText,
  Mail,
  MapPin,
  RefreshCw,
  Search,
  Settings,
  Shield,
  Stethoscope,
  TrendingUp,
  UserCheck,
  Users,
  X,
  XCircle,
} from "lucide-react"

import LoadingGetData from "../../../components/LoadingGetData"
import { DashboardCharts } from "../../../components/dashboard/charts"
import { StatCard } from "../../../components/dashboard/stateCard"
import { getDashboardData } from "../../../state/act/actReports"
import { clearDashboardError } from "../../../state/slices/reports"
import { formatDate } from "../../../utils/formtDate"

const isArabic = (lang) => String(lang || "").toLowerCase().startsWith("ar")

const safeArray = (value) => {
  if (Array.isArray(value)) return value
  if (Array.isArray(value?.items)) return value.items
  if (Array.isArray(value?.rows)) return value.rows
  if (Array.isArray(value?.data)) return value.data
  if (Array.isArray(value?.data?.items)) return value.data.items
  return []
}

const numberValue = (value) => {
  const n = Number(value ?? 0)
  return Number.isNaN(n) ? 0 : n
}

const percent = (value) => `${numberValue(value).toFixed(1)}%`

const getLocalized = (item, lang, base = "name", fallback = "-") => {
  if (!item) return fallback

  const ar = isArabic(lang)
  const arKeys = [
    `${base}Ar`,
    `${base}Arabic`,
    `${base}NameAr`,
    "nameAr",
    "nameArabic",
    "titleAr",
    "messageAr",
    "descriptionAr",
    "roleNameAr",
    "categoryNameAr",
    "departmentNameAr",
    "alertTypeNameAr",
    "severityNameAr",
    "healthStatusAr",
    "managersCoverageText",
    "geoFenceCoverageText",
  ]
  const enKeys = [
    `${base}En`,
    `${base}English`,
    `${base}NameEn`,
    "nameEn",
    "nameEnglish",
    "titleEn",
    "messageEn",
    "descriptionEn",
    "roleNameEn",
    "categoryNameEn",
    "departmentNameEn",
    "alertTypeNameEn",
    "severityNameEn",
    "healthStatusEn",
    "managersCoverageText",
    "geoFenceCoverageText",
  ]
  const directKeys = [base, `${base}Name`, "name", "title", "message", "description", "roleName", "categoryName", "departmentName"]

  for (const key of ar ? arKeys : enKeys) if (item[key]) return item[key]
  for (const key of ar ? enKeys : arKeys) if (item[key]) return item[key]
  for (const key of directKeys) if (item[key]) return item[key]

  return fallback
}

const getSeverityTone = (severity) => {
  const value = String(severity || "").toLowerCase()
  if (value.includes("critical") || value.includes("danger") || value.includes("high") || value.includes("حرج")) return "red"
  if (value.includes("warning") || value.includes("medium") || value.includes("تحذير")) return "yellow"
  if (value.includes("info") || value.includes("معلومات")) return "blue"
  return "blue"
}

const getRateTone = (value) => {
  const n = numberValue(value)
  if (n >= 80) return "green"
  if (n >= 50) return "yellow"
  return "red"
}

const routeMap = {
  users: "/admin-panel/users",
  categories: "/admin-panel/categories",
  category: (id) => `/admin-panel/category/${id}`,
  departments: "/admin-panel/departments",
  department: (id) => `/admin-panel/department/${id}`,
  rosters: "/admin-panel/roster",
  roster: (id) => `/admin-panel/rosters/${id}`,
  notifications: "/admin-panel/notifications",
  reports: "/admin-panel/reports",
}

const Card = ({ children, className = "", onClick }) => (
  <div
    onClick={onClick}
    className={`rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm ${className} ${
      onClick ? "cursor-pointer transition-all hover:shadow-lg" : ""
    }`}
  >
    {children}
  </div>
)

const toneClasses = {
  blue: "border-blue-500 text-blue-500",
  green: "border-emerald-500 text-emerald-500",
  emerald: "border-emerald-500 text-emerald-500",
  red: "border-red-500 text-red-500",
  yellow: "border-amber-500 text-amber-500",
  amber: "border-amber-500 text-amber-500",
  orange: "border-orange-500 text-orange-500",
  purple: "border-violet-500 text-violet-500",
  violet: "border-violet-500 text-violet-500",
  slate: "border-slate-500 text-slate-500",
}

const ToneIcon = ({ icon: Icon, tone = "blue", size = 20 }) => (
  <span className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border-2 bg-transparent ${toneClasses[tone] || toneClasses.blue}`}>
    <Icon size={size} />
  </span>
)

const Badge = ({ children, tone = "blue" }) => (
  <span className={`inline-flex items-center rounded-full border-2 px-2.5 py-1 text-xs font-black ${toneClasses[tone] || toneClasses.blue}`}>
    {children}
  </span>
)

const ActionButton = ({ children, icon: Icon, onClick, disabled }) => (
  <button
    type="button"
    disabled={disabled}
    onClick={onClick}
    className="inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--color-border-strong)] bg-[var(--color-surface)] px-4 py-2 text-sm font-black text-[var(--color-text)] shadow-sm transition-colors hover:border-[var(--color-success)] hover:bg-[var(--color-success)] hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
  >
    {Icon && <Icon size={16} />}
    {children}
  </button>
)

const SectionHeader = ({ icon: Icon, title, subtitle, tone = "blue", action }) => (
  <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
    <div className="flex items-start gap-3">
      <ToneIcon icon={Icon} tone={tone} />
      <div>
        <h2 className="text-xl font-black text-[var(--color-text)]">{title}</h2>
        {subtitle && <p className="mt-1 text-sm font-semibold text-[var(--color-text-muted)]">{subtitle}</p>}
      </div>
    </div>
    {action}
  </div>
)

const TabButton = ({ active, icon: Icon, label, count, tone = "blue", onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-black transition-colors ${
      active
        ? "border-[var(--color-success)] bg-[var(--color-success)] text-white"
        : "border-[var(--color-border-strong)] bg-[var(--color-surface)] text-[var(--color-text)] hover:border-[var(--color-success)] hover:bg-[var(--color-success)] hover:text-white"
    }`}
  >
    <Icon size={16} className={active ? "text-white" : (toneClasses[tone] || toneClasses.blue).split(" ")[1]} />
    {label}
    {count !== undefined && (
      <span className={`rounded-full px-2 py-0.5 text-[11px] ${active ? "bg-white/20 text-white" : "bg-[var(--color-surface-muted)] text-[var(--color-text-muted)]"}`}>
        {count}
      </span>
    )}
  </button>
)

const ListItem = ({ icon: Icon, title, subtitle, meta, badge, tone = "blue", onClick }) => (
  <div
    onClick={onClick}
    className={`flex items-center justify-between gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-muted)] p-3 ${
      onClick ? "cursor-pointer hover:border-[var(--color-success)]" : ""
    }`}
  >
    <div className="flex min-w-0 items-center gap-3">
      {Icon && <ToneIcon icon={Icon} tone={tone} size={18} />}
      <div className="min-w-0">
        <p className="truncate text-sm font-black text-[var(--color-text)]">{title}</p>
        {subtitle && <p className="mt-0.5 truncate text-xs font-semibold text-[var(--color-text-muted)]">{subtitle}</p>}
      </div>
    </div>
    <div className="flex shrink-0 items-center gap-2">
      {meta && <span className="text-xs font-bold text-[var(--color-text-muted)]">{meta}</span>}
      {badge}
    </div>
  </div>
)

const EmptyState = ({ icon: Icon = FileText, title, description }) => (
  <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-muted)] p-8 text-center">
    <Icon className="mx-auto mb-3 h-12 w-12 text-[var(--color-text-muted)]" />
    <h3 className="font-black text-[var(--color-text)]">{title}</h3>
    {description && <p className="mt-1 text-sm font-semibold text-[var(--color-text-muted)]">{description}</p>}
  </div>
)

const ProgressBar = ({ value }) => {
  const v = Math.max(0, Math.min(100, numberValue(value)))
  const tone = getRateTone(v)
  const bar = tone === "green" ? "bg-emerald-500" : tone === "yellow" ? "bg-amber-500" : "bg-red-500"

  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--color-surface-muted)]">
      <div className={`h-full rounded-full ${bar}`} style={{ width: `${v}%` }} />
    </div>
  )
}

export default function Dashboard() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { t, i18n } = useTranslation()
  const currentLang = i18n.language || "ar"
  const rtl = isArabic(currentLang)
  const { mymode } = useSelector((state) => state.mode)
  const isDark = mymode === "dark"

  const { dashboardData, loadingGetDashboardData, dashboardError, lastUpdated } = useSelector((state) => state.reports)
  const [activeTab, setActiveTab] = useState("overview")
  const [quickSearch, setQuickSearch] = useState("")

  useEffect(() => {
    dispatch(getDashboardData())
  }, [dispatch])

  const data = dashboardData || {}

  const recentRequests = safeArray(data.pendingRequests?.recentRequests)
  const recentNotifications = safeArray(data.notifications?.recentNotifications)
  const systemAlerts = safeArray(data.systemAlerts?.recentAlerts)
  const categoryAlerts = safeArray(data.categories?.categoryAlerts)
  const departmentAlerts = safeArray(data.departments?.departmentAlerts)
  const rosterAlerts = safeArray(data.rosters?.alerts)
  const topCategories = safeArray(data.categories?.topActiveCategories)
  const topDepartments = safeArray(data.departments?.topActiveDepartments)
  const activeRosters = safeArray(data.rosters?.activeRosters?.items)
  const incompleteRosters = safeArray(data.rosters?.incompleteRosters?.items)
  const upcomingRosters = safeArray(data.rosters?.upcomingRosters)
  const roleDistribution = safeArray(data.roles?.distribution)
  const recentRoleChanges = safeArray(data.roles?.recentChanges)
  const contractingTypes = safeArray(data.configurationSummary?.contractingTypes)
  const shiftTypes = safeArray(data.configurationSummary?.shiftTypes)
  const degrees = safeArray(data.configurationSummary?.topDegreesByUsers)

  const allAlerts = useMemo(() => {
    return [
      ...systemAlerts.map((item) => ({ ...item, source: "system" })),
      ...categoryAlerts.map((item) => ({ ...item, source: "category" })),
      ...departmentAlerts.map((item) => ({ ...item, source: "department" })),
      ...rosterAlerts.map((item) => ({ ...item, source: "roster" })),
    ]
  }, [systemAlerts, categoryAlerts, departmentAlerts, rosterAlerts])

  const criticalAlerts = numberValue(data.systemAlerts?.criticalAlerts) + allAlerts.filter((item) => getSeverityTone(item.severity) === "red").length
  const warningAlerts = numberValue(data.systemAlerts?.warningAlerts) + allAlerts.filter((item) => getSeverityTone(item.severity) === "yellow").length

  const kpis = [
    {
      label: currentLang === "ar" ? "إجمالي المستخدمين" : "Total Users",
      value: data.users?.totalUsers ?? 0,
      subtitle: `${currentLang === "ar" ? "نشط" : "Active"}: ${data.users?.activeUsers ?? 0}`,
      icon: Users,
      color: "blue",
      onClick: () => navigate(routeMap.users),
    },
    {
      label: currentLang === "ar" ? "الأطباء" : "Doctors",
      value: data.users?.doctorsCount ?? 0,
      subtitle: `${currentLang === "ar" ? "جدد هذا الشهر" : "New this month"}: ${data.users?.newUsersThisMonth ?? 0}`,
      icon: Stethoscope,
      color: "green",
      onClick: () => navigate(routeMap.users),
    },
    {
      label: currentLang === "ar" ? "طلبات معلقة" : "Pending Requests",
      value: data.pendingRequests?.totalPendingRequests ?? 0,
      subtitle: `${currentLang === "ar" ? "متأخرة" : "Overdue"}: ${data.pendingRequests?.overdueRequests ?? 0}`,
      icon: ClipboardList,
      color: data.pendingRequests?.overdueRequests > 0 ? "red" : "yellow",
      onClick: () => setActiveTab("requests"),
    },
    {
      label: currentLang === "ar" ? "إشعارات غير مقروءة" : "Unread Notifications",
      value: data.notifications?.unreadNotifications ?? 0,
      subtitle: `${currentLang === "ar" ? "عاجلة" : "Urgent"}: ${data.notifications?.urgentNotifications ?? 0}`,
      icon: Bell,
      color: data.notifications?.urgentNotifications > 0 ? "red" : "purple",
      onClick: () => navigate(routeMap.notifications),
    },
    {
      label: currentLang === "ar" ? "شيفتات اليوم" : "Today Shifts",
      value: data.shiftInsights?.todayTotalShifts ?? 0,
      subtitle: `${currentLang === "ar" ? "ليلي" : "Night"}: ${data.shiftInsights?.nightShiftsToday ?? 0}`,
      icon: Clock,
      color: "orange",
      onClick: () => setActiveTab("operations"),
    },
    {
      label: currentLang === "ar" ? "تغطية GeoFence" : "GeoFence Coverage",
      value: percent(data.departments?.geoFenceCoverageRate),
      subtitle: `${data.departments?.departmentsWithGeoFence ?? 0}/${data.departments?.totalDepartments ?? 0}`,
      icon: MapPin,
      color: getRateTone(data.departments?.geoFenceCoverageRate),
      onClick: () => setActiveTab("structure"),
    },
    {
      label: currentLang === "ar" ? "إكمال الروستر" : "Roster Completion",
      value: percent(data.rosters?.currentRoster?.completionPercent),
      subtitle: data.rosters?.currentRoster?.title || "-",
      icon: Calendar,
      color: getRateTone(data.rosters?.currentRoster?.completionPercent),
      onClick: () => data.rosters?.currentRoster?.id ? navigate(routeMap.roster(data.rosters.currentRoster.id)) : setActiveTab("rosters"),
    },
    {
      label: currentLang === "ar" ? "إيميلات فاشلة" : "Failed Emails",
      value: data.emailQueue?.failed ?? 0,
      subtitle: `${currentLang === "ar" ? "مرسلة" : "Sent"}: ${data.emailQueue?.sent ?? 0}`,
      icon: Mail,
      color: data.emailQueue?.failed > 0 ? "red" : "green",
      onClick: () => setActiveTab("system"),
    },
  ]

  const quickJumpItems = useMemo(() => {
    const items = [
      ...topCategories.map((cat) => ({
        id: `cat-${cat.id}`,
        type: currentLang === "ar" ? "تخصص" : "Category",
        title: getLocalized(cat, currentLang, "name"),
        subtitle: `${cat.code || "-"} • ${cat.doctorsCount ?? 0} ${currentLang === "ar" ? "طبيب" : "doctors"}`,
        icon: Briefcase,
        tone: "purple",
        onClick: () => navigate(routeMap.category(cat.id)),
      })),
      ...topDepartments.map((dept) => ({
        id: `dept-${dept.id}`,
        type: currentLang === "ar" ? "قسم" : "Department",
        title: getLocalized(dept, currentLang, "name"),
        subtitle: `${dept.code || "-"} • ${dept.assignedDoctorsCount ?? 0} ${currentLang === "ar" ? "طبيب" : "doctors"}`,
        icon: Building,
        tone: "green",
        onClick: () => navigate(routeMap.department(dept.id)),
      })),
      ...activeRosters.map((roster) => ({
        id: `roster-${roster.id}`,
        type: currentLang === "ar" ? "روستر" : "Roster",
        title: roster.title || roster.categoryName || "-",
        subtitle: `${percent(roster.completionPercent)} • ${roster.daysRemaining ?? 0} ${currentLang === "ar" ? "يوم" : "days"}`,
        icon: Calendar,
        tone: getRateTone(roster.completionPercent),
        onClick: () => navigate(routeMap.roster(roster.id)),
      })),
    ]

    const q = quickSearch.trim().toLowerCase()
    if (!q) return items

    return items.filter((item) => `${item.title} ${item.subtitle} ${item.type}`.toLowerCase().includes(q))
  }, [topCategories, topDepartments, activeRosters, currentLang, navigate, quickSearch])

  const tabs = [
    { id: "overview", label: currentLang === "ar" ? "نظرة عامة" : "Overview", icon: BarChart3, tone: "blue" },
    { id: "operations", label: currentLang === "ar" ? "التشغيل" : "Operations", icon: Activity, tone: "orange" },
    { id: "structure", label: currentLang === "ar" ? "الهيكل" : "Structure", icon: Building, tone: "green", count: topCategories.length + topDepartments.length },
    { id: "rosters", label: currentLang === "ar" ? "الروسترات" : "Rosters", icon: Calendar, tone: "purple", count: activeRosters.length },
    { id: "requests", label: currentLang === "ar" ? "الطلبات والتنبيهات" : "Requests & Alerts", icon: AlertTriangle, tone: "red", count: recentRequests.length + allAlerts.length },
    { id: "people", label: currentLang === "ar" ? "الأفراد" : "People", icon: Users, tone: "blue", count: data.users?.totalUsers },
    { id: "charts", label: currentLang === "ar" ? "التحليلات" : "Charts", icon: TrendingUp, tone: "violet" },
    { id: "system", label: currentLang === "ar" ? "النظام" : "System", icon: Settings, tone: "slate", count: recentNotifications.length },
  ]

  const refreshDashboard = () => dispatch(getDashboardData())

  if (loadingGetDashboardData && !dashboardData) {
    return (
      <div className="min-h-screen bg-[var(--color-bg)] p-6">
        <LoadingGetData text={currentLang === "ar" ? "جاري تحميل لوحة التحكم..." : "Loading dashboard..."} />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)] p-4 md:p-6" dir={rtl ? "rtl" : "ltr"}>
      <div className="mx-auto max-w-[1800px] space-y-6">
        <Card className="p-5 md:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-3">
              <ToneIcon icon={BarChart3} tone="blue" size={26} />
              <div>
                <h1 className="text-3xl font-black text-[var(--color-text)]">
                  {currentLang === "ar" ? "لوحة التحكم" : "Dashboard"}
                </h1>
                <p className="mt-1 text-sm font-semibold text-[var(--color-text-muted)]">
                  {currentLang === "ar" ? "متابعة مباشرة للنظام، الحضور، الروسترات، التخصصات، الأقسام، والتنبيهات." : "Live overview for system, attendance, rosters, categories, departments, and alerts."}
                </p>
                {(data.lastUpdated || lastUpdated) && (
                  <p className="mt-2 text-xs font-bold text-[var(--color-text-muted)]">
                    {currentLang === "ar" ? "آخر تحديث" : "Last updated"}: {formatDate(data.lastUpdated || lastUpdated)}
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <ActionButton icon={RefreshCw} onClick={refreshDashboard} disabled={loadingGetDashboardData}>
                {loadingGetDashboardData ? (currentLang === "ar" ? "جاري التحديث..." : "Refreshing...") : currentLang === "ar" ? "تحديث" : "Refresh"}
              </ActionButton>
              <ActionButton icon={Bell} onClick={() => navigate(routeMap.notifications)}>
                {currentLang === "ar" ? "الإشعارات" : "Notifications"}
              </ActionButton>
              <ActionButton icon={FileText} onClick={() => navigate(routeMap.reports)}>
                {currentLang === "ar" ? "التقارير" : "Reports"}
              </ActionButton>
            </div>
          </div>
        </Card>

        {dashboardError && (
          <Card className="border-red-500 p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-bold text-red-500">{dashboardError.message || String(dashboardError)}</p>
              <button type="button" onClick={() => dispatch(clearDashboardError())}>
                <X className="text-red-500" size={18} />
              </button>
            </div>
          </Card>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-8">
          {kpis.map((item) => (
            <StatCard key={item.label} {...item} />
          ))}
        </div>

        <Card className="p-5">
          <SectionHeader
            icon={Search}
            title={currentLang === "ar" ? "قفز سريع" : "Quick Jump"}
            subtitle={currentLang === "ar" ? "افتح التخصص، القسم، أو الروستر مباشرة من مكان واحد." : "Open categories, departments, or rosters directly from one place."}
            tone="blue"
          />

          <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="relative flex-1">
              <Search size={18} className={`absolute top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] ${rtl ? "right-3" : "left-3"}`} />
              <input
                value={quickSearch}
                onChange={(e) => setQuickSearch(e.target.value)}
                placeholder={currentLang === "ar" ? "ابحث عن تخصص، قسم، أو روستر..." : "Search category, department, or roster..."}
                className={`w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] py-3 text-sm font-semibold text-[var(--color-text)] outline-none focus:border-[var(--color-success)] ${rtl ? "pr-10 pl-4" : "pl-10 pr-4"}`}
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <ActionButton icon={Briefcase} onClick={() => navigate(routeMap.categories)}>{currentLang === "ar" ? "التخصصات" : "Categories"}</ActionButton>
              <ActionButton icon={Building} onClick={() => navigate(routeMap.departments)}>{currentLang === "ar" ? "الأقسام" : "Departments"}</ActionButton>
              <ActionButton icon={Users} onClick={() => navigate(routeMap.users)}>{currentLang === "ar" ? "المستخدمين" : "Users"}</ActionButton>
            </div>
          </div>

          {quickJumpItems.length === 0 ? (
            <EmptyState icon={Search} title={currentLang === "ar" ? "لا توجد نتائج" : "No results"} />
          ) : (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
              {quickJumpItems.slice(0, 16).map((item) => (
                <ListItem
                  key={item.id}
                  icon={item.icon}
                  tone={item.tone}
                  title={item.title}
                  subtitle={item.subtitle}
                  badge={<Badge tone={item.tone}>{item.type}</Badge>}
                  onClick={item.onClick}
                />
              ))}
            </div>
          )}
        </Card>

        <Card className="sticky top-2 z-20 p-3">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {tabs.map((tab) => (
              <TabButton key={tab.id} active={activeTab === tab.id} {...tab} onClick={() => setActiveTab(tab.id)} />
            ))}
          </div>
        </Card>

        {activeTab === "overview" && (
          <OverviewTab data={data} currentLang={currentLang} navigate={navigate} recentRequests={recentRequests} recentNotifications={recentNotifications} systemAlerts={systemAlerts} />
        )}

        {activeTab === "operations" && <OperationsTab data={data} currentLang={currentLang} />}

        {activeTab === "structure" && (
          <StructureTab data={data} currentLang={currentLang} navigate={navigate} topCategories={topCategories} topDepartments={topDepartments} categoryAlerts={categoryAlerts} departmentAlerts={departmentAlerts} />
        )}

        {activeTab === "rosters" && (
          <RostersTab data={data} currentLang={currentLang} navigate={navigate} activeRosters={activeRosters} incompleteRosters={incompleteRosters} upcomingRosters={upcomingRosters} rosterAlerts={rosterAlerts} />
        )}

        {activeTab === "requests" && <RequestsTab currentLang={currentLang} navigate={navigate} recentRequests={recentRequests} allAlerts={allAlerts} />}

        {activeTab === "people" && <PeopleTab data={data} currentLang={currentLang} recentRoleChanges={recentRoleChanges} roleDistribution={roleDistribution} />}

        {activeTab === "charts" && <DashboardCharts dashboardData={data} isDark={isDark} t={t} />}

        {activeTab === "system" && <SystemTab data={data} currentLang={currentLang} recentNotifications={recentNotifications} />}
      </div>
    </div>
  )
}

function OverviewTab({ data, currentLang, navigate, recentRequests, recentNotifications, systemAlerts }) {
  const currentRoster = data.rosters?.currentRoster

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
      <Card className="p-5 xl:col-span-2">
        <SectionHeader
          icon={Calendar}
          title={currentLang === "ar" ? "الروستر الحالي" : "Current Roster"}
          subtitle={currentLang === "ar" ? "ملخص سريع عن الروستر النشط." : "Quick summary of the active roster."}
          tone="purple"
          action={currentRoster?.id && <ActionButton icon={Eye} onClick={() => navigate(routeMap.roster(currentRoster.id))}>{currentLang === "ar" ? "فتح الروستر" : "Open Roster"}</ActionButton>}
        />

        {!currentRoster ? (
          <EmptyState icon={Calendar} title={currentLang === "ar" ? "لا يوجد روستر حالي" : "No current roster"} />
        ) : (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-black text-[var(--color-text)]">{currentRoster.title}</h3>
              <p className="text-sm font-semibold text-[var(--color-text-muted)]">{currentRoster.categoryName} • {currentRoster.month}/{currentRoster.year}</p>
            </div>
            <ProgressBar value={currentRoster.completionPercent} />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard icon={Users} label={currentLang === "ar" ? "أطباء" : "Doctors"} value={currentRoster.totalAssignedDoctors} color="green" />
              <StatCard icon={Clock} label={currentLang === "ar" ? "ساعات مطلوبة" : "Required Hours"} value={currentRoster.totalRequiredHours} color="blue" />
              <StatCard icon={CheckCircle} label={currentLang === "ar" ? "ساعات مسندة" : "Assigned Hours"} value={currentRoster.totalAssignedHours} color="purple" />
              <StatCard icon={AlertTriangle} label={currentLang === "ar" ? "شيفتات حرجة" : "Critical Shifts"} value={currentRoster.criticalShiftsCount} color={currentRoster.criticalShiftsCount > 0 ? "red" : "green"} />
            </div>
          </div>
        )}
      </Card>

      <PanelList
        title={currentLang === "ar" ? "آخر الطلبات" : "Recent Requests"}
        icon={ClipboardList}
        tone="yellow"
        items={recentRequests.slice(0, 6).map((request) => ({
          key: `${request.requestType}-${request.id}`,
          title: getLocalized(request, currentLang, "description"),
          subtitle: request.requesterName,
          meta: formatDate(request.requestDate),
          badge: <Badge tone={getSeverityTone(request.priority)}>{getLocalized(request, currentLang, "priority", request.priority)}</Badge>,
        }))}
        emptyText={currentLang === "ar" ? "لا توجد طلبات" : "No requests"}
      />

      <PanelList
        className="xl:col-span-2"
        title={currentLang === "ar" ? "آخر الإشعارات" : "Recent Notifications"}
        icon={Bell}
        tone="blue"
        grid
        items={recentNotifications.map((n) => ({
          key: n.id,
          title: getLocalized(n, currentLang, "title"),
          subtitle: getLocalized(n, currentLang, "typeName", n.type),
          meta: formatDate(n.createdAt),
          badge: <Badge tone={n.isRead ? "green" : "yellow"}>{n.isRead ? (currentLang === "ar" ? "مقروء" : "Read") : (currentLang === "ar" ? "جديد" : "New")}</Badge>,
        }))}
        emptyText={currentLang === "ar" ? "لا توجد إشعارات" : "No notifications"}
      />

      <PanelList
        title={currentLang === "ar" ? "تنبيهات النظام" : "System Alerts"}
        icon={AlertTriangle}
        tone="red"
        items={systemAlerts.map((alert, index) => ({
          key: index,
          title: getLocalized(alert, currentLang, "message"),
          subtitle: getLocalized(alert, currentLang, "alertType", alert.alertType),
          meta: formatDate(alert.timestamp),
          badge: <Badge tone={getSeverityTone(alert.severity)}>{getLocalized(alert, currentLang, "severity", alert.severity)}</Badge>,
        }))}
        emptyText={currentLang === "ar" ? "لا توجد تنبيهات" : "No alerts"}
      />
    </div>
  )
}

function OperationsTab({ data, currentLang }) {
  const quick = data.quickStats || {}
  const shift = data.shiftInsights || {}
  const email = data.emailQueue || {}
  const shiftTypes = safeArray(data.configurationSummary?.shiftTypes)

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard icon={Activity} label={currentLang === "ar" ? "معدل الحضور" : "Attendance Rate"} value={percent(quick.dailyAttendanceRate)} color={getRateTone(quick.dailyAttendanceRate)} />
        <StatCard icon={CheckCircle} label={currentLang === "ar" ? "إكمال المهام" : "Task Completion"} value={percent(quick.taskCompletionRate)} color={getRateTone(quick.taskCompletionRate)} />
        <StatCard icon={Clock} label={currentLang === "ar" ? "متوسط الاستجابة" : "Avg Response"} value={`${quick.averageResponseTime ?? 0}m`} color="blue" />
        <StatCard icon={Users} label={currentLang === "ar" ? "رضا المستخدمين" : "User Satisfaction"} value={percent(quick.userSatisfactionRate)} color={getRateTone(quick.userSatisfactionRate)} />
        <StatCard icon={Mail} label={currentLang === "ar" ? "إيميلات اليوم" : "Emails Today"} value={quick.emailsSentToday ?? 0} color="purple" />
        <StatCard icon={Calendar} label={currentLang === "ar" ? "شيفتات اليوم" : "Today Shifts"} value={shift.todayTotalShifts ?? 0} color="orange" />
      </div>

      <Card className="p-5">
        <SectionHeader icon={Clock} title={currentLang === "ar" ? "تحليل الشيفتات" : "Shift Insights"} tone="orange" />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <StatCard icon={Calendar} label={currentLang === "ar" ? "إجمالي الشيفتات" : "Total Shifts"} value={shift.todayTotalShifts} color="blue" />
          <StatCard icon={Clock} label={currentLang === "ar" ? "شيفتات ليلية" : "Night Shifts"} value={shift.nightShiftsToday} color="purple" />
          <StatCard icon={TrendingUp} label={currentLang === "ar" ? "متوسط الساعات" : "Average Hours"} value={shift.averageShiftHours} color="green" />
          <StatCard icon={AlertTriangle} label={currentLang === "ar" ? "أوفر تايم" : "Overtime"} value={shift.todayOvertimeShifts} color="yellow" />
        </div>

        <div className="mt-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-muted)] p-4">
          <p className="text-sm font-bold text-[var(--color-text-muted)]">{currentLang === "ar" ? "أكثر نوع شيفت استخدامًا" : "Most common shift type"}</p>
          <p className="mt-1 text-lg font-black text-[var(--color-text)]">{currentLang === "ar" ? shift.mostCommonShiftTypeNameAr : shift.mostCommonShiftTypeNameEn}</p>
        </div>
      </Card>

      <PanelList
        title={currentLang === "ar" ? "أنواع الشيفتات" : "Shift Types"}
        icon={Clock}
        tone="purple"
        grid
        items={shiftTypes.map((item) => ({
          key: item.id,
          title: getLocalized(item, currentLang, "name"),
          subtitle: `${item.period || "-"} • ${item.totalTime ?? 0}h`,
          badge: <Badge tone={item.usageToday > 0 ? "green" : "slate"}>{item.usageToday ?? 0}</Badge>,
        }))}
        emptyText={currentLang === "ar" ? "لا توجد أنواع شيفتات" : "No shift types"}
      />
    </div>
  )
}

function StructureTab({ data, currentLang, navigate, topCategories, topDepartments, categoryAlerts, departmentAlerts }) {
  const categories = data.categories || {}
  const departments = data.departments || {}
  const managers = data.managers || {}

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-8">
        <StatCard icon={Briefcase} label={currentLang === "ar" ? "تخصصات" : "Categories"} value={categories.totalCategories} color="purple" onClick={() => navigate(routeMap.categories)} />
        <StatCard icon={CheckCircle} label={currentLang === "ar" ? "تخصصات نشطة" : "Active Categories"} value={categories.activeCategories} color="green" />
        <StatCard icon={UserCheck} label={currentLang === "ar" ? "تخصصات بمدير" : "Categories With Managers"} value={categories.categoriesWithManagers} color="blue" />
        <StatCard icon={XCircle} label={currentLang === "ar" ? "تخصصات بدون مدير" : "No Manager"} value={categories.categoriesWithoutManagers} color={categories.categoriesWithoutManagers > 0 ? "red" : "green"} />
        <StatCard icon={Building} label={currentLang === "ar" ? "أقسام" : "Departments"} value={departments.totalDepartments} color="blue" onClick={() => navigate(routeMap.departments)} />
        <StatCard icon={MapPin} label="GeoFence" value={departments.departmentsWithGeoFence} subtitle={percent(departments.geoFenceCoverageRate)} color={getRateTone(departments.geoFenceCoverageRate)} />
        <StatCard icon={AlertTriangle} label={currentLang === "ar" ? "غير مرتبطة" : "Unlinked"} value={departments.unlinkedDepartments} color={departments.unlinkedDepartments > 0 ? "yellow" : "green"} />
        <StatCard icon={Users} label={currentLang === "ar" ? "مديرين" : "Managers"} value={(managers.categoryManagers?.totalActive || 0) + (managers.departmentManagers?.totalActive || 0)} color="green" />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <PanelList
          title={currentLang === "ar" ? "أعلى التخصصات نشاطًا" : "Top Active Categories"}
          icon={Briefcase}
          tone="purple"
          items={topCategories.map((cat) => ({
            key: cat.id,
            title: getLocalized(cat, currentLang, "name"),
            subtitle: `${cat.code || "-"} • ${cat.doctorsCount ?? 0} ${currentLang === "ar" ? "طبيب" : "doctors"} • ${cat.departmentsCount ?? 0} ${currentLang === "ar" ? "قسم" : "departments"}`,
            badge: <Badge tone="purple">{cat.activeRostersCount ?? 0}</Badge>,
            onClick: () => navigate(routeMap.category(cat.id)),
          }))}
          emptyText={currentLang === "ar" ? "لا توجد تخصصات" : "No categories"}
        />

        <PanelList
          title={currentLang === "ar" ? "أعلى الأقسام نشاطًا" : "Top Active Departments"}
          icon={Building}
          tone="green"
          items={topDepartments.map((dept) => ({
            key: dept.id,
            title: getLocalized(dept, currentLang, "name"),
            subtitle: `${dept.code || "-"} • ${dept.assignedDoctorsCount ?? 0} ${currentLang === "ar" ? "طبيب" : "doctors"} • ${dept.activeSchedulesCount ?? 0} ${currentLang === "ar" ? "جدول" : "schedules"}`,
            badge: <Badge tone={dept.hasGeoFence ? "green" : "yellow"}>{dept.hasGeoFence ? "Geo" : "No Geo"}</Badge>,
            onClick: () => navigate(routeMap.department(dept.id)),
          }))}
          emptyText={currentLang === "ar" ? "لا توجد أقسام" : "No departments"}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <AlertsPanel title={currentLang === "ar" ? "تنبيهات التخصصات" : "Category Alerts"} alerts={categoryAlerts} currentLang={currentLang} navigate={navigate} />
        <AlertsPanel title={currentLang === "ar" ? "تنبيهات الأقسام" : "Department Alerts"} alerts={departmentAlerts} currentLang={currentLang} navigate={navigate} />
      </div>
    </div>
  )
}

function RostersTab({ data, currentLang, navigate, activeRosters, incompleteRosters, upcomingRosters, rosterAlerts }) {
  const general = data.rosters?.generalStats || {}
  const currentRoster = data.rosters?.currentRoster

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard icon={Calendar} label={currentLang === "ar" ? "كل الروسترات" : "Total Rosters"} value={general.totalRosters} color="blue" />
        <StatCard icon={CheckCircle} label={currentLang === "ar" ? "معدل الإكمال" : "Completion"} value={percent(general.overallCompletionRate)} color={getRateTone(general.overallCompletionRate)} />
        <StatCard icon={Clock} label={currentLang === "ar" ? "قادمة" : "Upcoming"} value={general.upcomingRostersCount} color="purple" />
        <StatCard icon={XCircle} label={currentLang === "ar" ? "منتهية" : "Expired"} value={general.expiredRosters} color="yellow" />
        <StatCard icon={AlertTriangle} label={currentLang === "ar" ? "غير مكتملة" : "Incomplete"} value={data.rosters?.incompleteRosters?.count || incompleteRosters.length} color={incompleteRosters.length > 0 ? "red" : "green"} />
        <StatCard icon={Activity} label={currentLang === "ar" ? "نشطة" : "Active"} value={data.rosters?.activeRosters?.count || activeRosters.length} color="green" />
      </div>

      {currentRoster && (
        <Card className="p-5" onClick={() => navigate(routeMap.roster(currentRoster.id))}>
          <SectionHeader icon={Calendar} title={currentLang === "ar" ? "الروستر الحالي" : "Current Roster"} tone="purple" />
          <div className="space-y-3">
            <h3 className="text-xl font-black text-[var(--color-text)]">{currentRoster.title}</h3>
            <p className="text-sm font-semibold text-[var(--color-text-muted)]">{currentRoster.categoryName} • {formatDate(currentRoster.startDate)} → {formatDate(currentRoster.endDate)}</p>
            <ProgressBar value={currentRoster.completionPercent} />
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <RosterPanel title={currentLang === "ar" ? "روسترات نشطة" : "Active Rosters"} items={activeRosters} currentLang={currentLang} navigate={navigate} />
        <RosterPanel title={currentLang === "ar" ? "روسترات غير مكتملة" : "Incomplete Rosters"} items={incompleteRosters} currentLang={currentLang} navigate={navigate} danger />
      </div>

      <PanelList
        title={currentLang === "ar" ? "روسترات قادمة" : "Upcoming Rosters"}
        icon={Clock}
        tone="purple"
        grid
        items={upcomingRosters.map((roster) => ({
          key: roster.id,
          title: roster.title || roster.categoryName,
          subtitle: `${formatDate(roster.startDate)} • ${roster.daysUntilStart ?? 0} ${currentLang === "ar" ? "يوم" : "days"}`,
          badge: <Badge tone={roster.isReady ? "green" : "yellow"}>{roster.status || "-"}</Badge>,
          onClick: () => navigate(routeMap.roster(roster.id)),
        }))}
        emptyText={currentLang === "ar" ? "لا توجد روسترات قادمة" : "No upcoming rosters"}
      />

      <AlertsPanel title={currentLang === "ar" ? "تنبيهات الروسترات" : "Roster Alerts"} alerts={rosterAlerts} currentLang={currentLang} navigate={navigate} />
    </div>
  )
}

function RequestsTab({ currentLang, navigate, recentRequests, allAlerts }) {
  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
      <PanelList
        title={currentLang === "ar" ? "الطلبات الحديثة" : "Recent Requests"}
        icon={ClipboardList}
        tone="yellow"
        items={recentRequests.map((request) => ({
          key: `${request.requestType}-${request.id}`,
          title: getLocalized(request, currentLang, "description"),
          subtitle: `${getLocalized(request, currentLang, "requestType", request.requestType)} • ${request.requesterName}`,
          meta: formatDate(request.requestDate),
          badge: <Badge tone={getSeverityTone(request.priority)}>{getLocalized(request, currentLang, "priority", request.priority)}</Badge>,
        }))}
        emptyText={currentLang === "ar" ? "لا توجد طلبات" : "No requests"}
      />

      <AlertsPanel title={currentLang === "ar" ? "كل التنبيهات" : "All Alerts"} alerts={allAlerts} currentLang={currentLang} navigate={navigate} />
    </div>
  )
}

function PeopleTab({ data, currentLang, recentRoleChanges, roleDistribution }) {
  const rolesKpis = data.roles?.kpis || {}
  const degrees = safeArray(data.configurationSummary?.topDegreesByUsers)
  const contractingTypes = safeArray(data.configurationSummary?.contractingTypes)

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
        <StatCard icon={Users} label={currentLang === "ar" ? "نشطين" : "Active Users"} value={rolesKpis.totalActiveUsers ?? data.users?.activeUsers} color="blue" />
        <StatCard icon={Shield} label={currentLang === "ar" ? "بدون أدوار" : "No Roles"} value={rolesKpis.usersWithoutRoles} color={rolesKpis.usersWithoutRoles > 0 ? "red" : "green"} />
        <StatCard icon={Clock} label={currentLang === "ar" ? "أدوار مؤقتة" : "Temporary Roles"} value={rolesKpis.temporaryRoles} color="yellow" />
        <StatCard icon={CheckCircle} label={currentLang === "ar" ? "أدوار دائمة" : "Permanent Roles"} value={rolesKpis.permanentRoles} color="green" />
        <StatCard icon={XCircle} label={currentLang === "ar" ? "منتهية" : "Expired"} value={rolesKpis.expiredRoles} color={rolesKpis.expiredRoles > 0 ? "red" : "green"} />
        <StatCard icon={AlertTriangle} label={currentLang === "ar" ? "ملغية" : "Revoked"} value={rolesKpis.revokedRoles} color={rolesKpis.revokedRoles > 0 ? "orange" : "green"} />
        <StatCard icon={UserCheck} label={currentLang === "ar" ? "أطباء" : "Doctors"} value={data.users?.doctorsCount} color="green" />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <PanelList
          title={currentLang === "ar" ? "توزيع الأدوار" : "Role Distribution"}
          icon={Shield}
          tone="purple"
          items={roleDistribution.map((role) => ({
            key: role.roleType,
            title: getLocalized(role, currentLang, "roleName"),
            subtitle: role.roleType,
            badge: <Badge tone={role.activeUsersCount > 0 ? "purple" : "slate"}>{role.activeUsersCount ?? 0}</Badge>,
          }))}
          emptyText={currentLang === "ar" ? "لا توجد أدوار" : "No roles"}
        />

        <PanelList
          title={currentLang === "ar" ? "الدرجات العلمية" : "Scientific Degrees"}
          icon={Stethoscope}
          tone="orange"
          items={degrees.map((degree) => ({
            key: degree.id,
            title: getLocalized(degree, currentLang, "name"),
            badge: <Badge tone="orange">{degree.usersCount ?? 0}</Badge>,
          }))}
          emptyText={currentLang === "ar" ? "لا توجد درجات" : "No degrees"}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <PanelList
          title={currentLang === "ar" ? "أنواع التعاقد" : "Contracting Types"}
          icon={Briefcase}
          tone="green"
          items={contractingTypes.map((type) => ({
            key: type.id,
            title: getLocalized(type, currentLang, "name"),
            subtitle: `${currentLang === "ar" ? "حد أسبوعي" : "Max weekly"}: ${type.maxHoursPerWeek ?? 0}h`,
            badge: <Badge tone={type.allowOvertimeHours ? "green" : "yellow"}>{type.usersCount ?? 0}</Badge>,
          }))}
          emptyText={currentLang === "ar" ? "لا توجد أنواع تعاقد" : "No contracting types"}
        />

        <PanelList
          title={currentLang === "ar" ? "آخر تغييرات الأدوار" : "Recent Role Changes"}
          icon={Shield}
          tone="blue"
          items={recentRoleChanges.slice(0, 10).map((change) => ({
            key: change.id,
            title: `${change.oldRoleName || "-"} → ${change.newRoleName || "-"}`,
            subtitle: `${change.changedByName || "-"} • ${getLocalized(change, currentLang, "notes", change.notesAr || change.notesEn || "")}`,
            meta: formatDate(change.changedAt),
            badge: <Badge tone={String(change.changeTypeEn || change.changeType).toLowerCase().includes("revoke") || String(change.changeType).includes("إلغاء") ? "red" : "green"}>{getLocalized(change, currentLang, "changeType", change.changeType)}</Badge>,
          }))}
          emptyText={currentLang === "ar" ? "لا توجد تغييرات" : "No changes"}
        />
      </div>
    </div>
  )
}

function SystemTab({ data, currentLang, recentNotifications }) {
  const email = data.emailQueue || {}

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
        <StatCard icon={Mail} label="Pending" value={email.pending} color="yellow" />
        <StatCard icon={Activity} label="Processing" value={email.processing} color="blue" />
        <StatCard icon={CheckCircle} label="Sent" value={email.sent} color="green" />
        <StatCard icon={XCircle} label="Failed" value={email.failed} color={email.failed > 0 ? "red" : "green"} />
        <StatCard icon={Clock} label="Expired" value={email.expired} color="orange" />
        <StatCard icon={Mail} label="Sent Today" value={email.sentToday} color="green" />
        <StatCard icon={AlertTriangle} label="Failed Today" value={email.failedToday} color={email.failedToday > 0 ? "red" : "green"} />
      </div>

      <PanelList
        title={currentLang === "ar" ? "الإشعارات" : "Notifications"}
        icon={Bell}
        tone="blue"
        grid
        items={recentNotifications.map((n) => ({
          key: n.id,
          title: getLocalized(n, currentLang, "title"),
          subtitle: getLocalized(n, currentLang, "typeName", n.type),
          meta: formatDate(n.createdAt),
          badge: <Badge tone={n.isRead ? "green" : "yellow"}>{n.isRead ? "Read" : "New"}</Badge>,
        }))}
        emptyText={currentLang === "ar" ? "لا توجد إشعارات" : "No notifications"}
      />
    </div>
  )
}

function RosterPanel({ title, items, currentLang, navigate, danger = false }) {
  return (
    <Card className="p-5">
      <SectionHeader icon={Calendar} title={title} tone={danger ? "red" : "purple"} />
      <div className="space-y-3">
        {items.length === 0 ? (
          <EmptyState icon={Calendar} title={currentLang === "ar" ? "لا توجد بيانات" : "No data"} />
        ) : (
          items.map((roster) => (
            <div key={roster.id} onClick={() => navigate(routeMap.roster(roster.id))} className="cursor-pointer rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-muted)] p-4 hover:border-[var(--color-success)]">
              <div className="mb-3 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate font-black text-[var(--color-text)]">{roster.title || roster.categoryName}</p>
                  <p className="mt-1 text-xs font-semibold text-[var(--color-text-muted)]">{roster.categoryName} • {formatDate(roster.startDate)} → {formatDate(roster.endDate)}</p>
                </div>
                <Badge tone={danger ? "red" : getRateTone(roster.completionPercent)}>{percent(roster.completionPercent)}</Badge>
              </div>
              <ProgressBar value={roster.completionPercent} />
              <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
                <MiniNumber label={currentLang === "ar" ? "أطباء" : "Doctors"} value={roster.assignedDoctorsCount} />
                <MiniNumber label={currentLang === "ar" ? "فارغة" : "Empty"} value={roster.emptyShiftsCount ?? roster.emptyShifts} />
                <MiniNumber label={currentLang === "ar" ? "أيام" : "Days"} value={roster.daysRemaining} />
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  )
}

function MiniNumber({ label, value }) {
  return (
    <div className="rounded-lg bg-[var(--color-surface)] p-2">
      <b className="text-[var(--color-text)]">{value ?? 0}</b>
      <p className="text-[var(--color-text-muted)]">{label}</p>
    </div>
  )
}

function PanelList({ title, icon: Icon, tone = "blue", items, emptyText, grid = false, className = "" }) {
  return (
    <Card className={`p-5 ${className}`}>
      <SectionHeader icon={Icon} title={title} tone={tone} />
      <div className={grid ? "grid grid-cols-1 gap-2 md:grid-cols-2" : "space-y-2"}>
        {items.length === 0 ? (
          <EmptyState icon={Icon} title={emptyText} />
        ) : (
          items.map((item) => (
            <ListItem
              key={item.key}
              icon={item.icon || Icon}
              tone={item.tone || tone}
              title={item.title}
              subtitle={item.subtitle}
              meta={item.meta}
              badge={item.badge}
              onClick={item.onClick}
            />
          ))
        )}
      </div>
    </Card>
  )
}

function AlertsPanel({ title, alerts, currentLang, navigate }) {
  return (
    <PanelList
      title={title}
      icon={AlertTriangle}
      tone="red"
      items={alerts.map((alert, index) => ({
        key: alert.id || `${alert.alertType}-${index}`,
        title: getLocalized(alert, currentLang, "message"),
        subtitle: getLocalized(alert, currentLang, "alertType", alert.alertType) || getLocalized(alert, currentLang, "categoryName") || getLocalized(alert, currentLang, "departmentName"),
        meta: alert.createdAt ? formatDate(alert.createdAt) : undefined,
        badge: <Badge tone={getSeverityTone(alert.severity)}>{getLocalized(alert, currentLang, "severity", alert.severity)}</Badge>,
        onClick: alert.categoryId
          ? () => navigate(routeMap.category(alert.categoryId))
          : alert.departmentId
          ? () => navigate(routeMap.department(alert.departmentId))
          : alert.rosterId
          ? () => navigate(routeMap.roster(alert.rosterId))
          : undefined,
      }))}
      emptyText={currentLang === "ar" ? "لا توجد تنبيهات" : "No alerts"}
    />
  )
}