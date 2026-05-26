import { useEffect, useMemo } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Briefcase,
  Building,
  Calendar,
  Clock,
  FileText,
  Mail,
  MapPin,
  RefreshCw,
  Shield,
  UserCheck,
  Users,
  XCircle,
} from "lucide-react"

import LoadingGetData from "../../../components/LoadingGetData"
import { DashboardCharts } from "../../../components/dashboard/charts"
import { getDashboardData } from "../../../state/act/actReports"
import { clearDashboardError } from "../../../state/slices/reports"
import { formatDate } from "../../../utils/formtDate"

// ─── Helpers ─────────────────────────────────────────────────────────────────

const getName = (item, lang) => {
  if (!item) return ""
  if (lang === "ar") {
    return (
      item.nameArabic ||
      item.nameAr ||
      item.roleNameAr ||
      item.nameEnglish ||
      item.nameEn ||
      item.roleNameEn ||
      item.categoryName ||
      item.departmentName ||
      ""
    )
  }
  return (
    item.nameEnglish ||
    item.nameEn ||
    item.roleNameEn ||
    item.nameArabic ||
    item.nameAr ||
    item.roleNameAr ||
    item.categoryName ||
    item.departmentName ||
    ""
  )
}

const getSeverityClasses = (severity, isDark) => {
  const v = String(severity || "").toLowerCase()

  if (v.includes("critical") || v.includes("high") || v.includes("red")) {
    return "bg-transparent border-2 border-red-500 text-red-500 dark:bg-transparent dark:border-red-500 dark:text-red-500"
  }

  if (v.includes("warning") || v.includes("medium") || v.includes("yellow")) {
    return "bg-transparent border-2 border-amber-500 text-amber-500 dark:bg-transparent dark:border-amber-500 dark:text-amber-500"
  }

  return "bg-transparent border-2 border-blue-500 text-blue-500 dark:bg-transparent dark:border-blue-500 dark:text-blue-500"
}

// ─── Primitive UI ─────────────────────────────────────────────────────────────

const Card = ({ children, isDark, className = "" }) => (
  <div
    className={`rounded-2xl shadow-xl border ${
      isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"
    } ${className}`}
  >
    {children}
  </div>
)

const getTone500 = (tone = "blue") => {
  const toneMap = {
    blue: "bg-transparent text-blue-500 border-blue-500 dark:bg-transparent dark:text-blue-500 dark:border-blue-500",
    green: "bg-transparent text-emerald-500 border-emerald-500 dark:bg-transparent dark:text-emerald-500 dark:border-emerald-500",
    emerald: "bg-transparent text-emerald-500 border-emerald-500 dark:bg-transparent dark:text-emerald-500 dark:border-emerald-500",
    red: "bg-transparent text-red-500 border-red-500 dark:bg-transparent dark:text-red-500 dark:border-red-500",
    yellow: "bg-transparent text-amber-500 border-amber-500 dark:bg-transparent dark:text-amber-500 dark:border-amber-500",
    amber: "bg-transparent text-amber-500 border-amber-500 dark:bg-transparent dark:text-amber-500 dark:border-amber-500",
    orange: "bg-transparent text-orange-500 border-orange-500 dark:bg-transparent dark:text-orange-500 dark:border-orange-500",
    purple: "bg-transparent text-violet-500 border-violet-500 dark:bg-transparent dark:text-violet-500 dark:border-violet-500",
    violet: "bg-transparent text-violet-500 border-violet-500 dark:bg-transparent dark:text-violet-500 dark:border-violet-500",
    gray: "bg-transparent text-slate-500 border-slate-500 dark:bg-transparent dark:text-slate-500 dark:border-slate-500",
    slate: "bg-transparent text-slate-500 border-slate-500 dark:bg-transparent dark:text-slate-500 dark:border-slate-500",
  }

  return toneMap[tone] || toneMap.blue
}

const getValueTone500 = (tone = "blue") => {
  const toneMap = {
    blue: "text-blue-500 dark:text-blue-500",
    green: "text-emerald-500 dark:text-emerald-500",
    emerald: "text-emerald-500 dark:text-emerald-500",
    red: "text-red-500 dark:text-red-500",
    yellow: "text-amber-500 dark:text-amber-500",
    amber: "text-amber-500 dark:text-amber-500",
    orange: "text-orange-500 dark:text-orange-500",
    purple: "text-violet-500 dark:text-violet-500",
    violet: "text-violet-500 dark:text-violet-500",
    gray: "text-slate-500 dark:text-slate-500",
    slate: "text-slate-500 dark:text-slate-500",
  }

  return toneMap[tone] || toneMap.blue
}

const StatCard = ({ icon: Icon, label, value, color = "blue" }) => (
  <Card isDark={false} className="p-4 bg-[var(--color-surface)] border-[var(--color-border)] shadow-sm">
    <div className="flex items-center justify-between gap-4">
      <div className="min-w-0">
        <p className={`text-2xl font-black tracking-tight ${getValueTone500(color)}`}>
          {value ?? 0}
        </p>
        <p className="text-sm font-bold text-[var(--color-text-muted)] mt-1">
          {label}
        </p>
      </div>

      <div
        className={`w-12 h-12 rounded-2xl border-2 flex items-center justify-center shrink-0 shadow-sm ${getTone500(color)}`}
      >
        <Icon className="w-6 h-6" />
      </div>
    </div>
  </Card>
)

const SectionHeader = ({ icon: Icon, title, subtitle, isDark, action }) => (
  <div className="flex items-start justify-between gap-4 mb-5">
    <div className="flex items-start gap-3">
      {Icon && (
        <div className="w-10 h-10 rounded-xl border-2 flex items-center justify-center flex-shrink-0 bg-transparent text-blue-500 border-blue-500 dark:bg-transparent dark:text-blue-500 dark:border-blue-500 shadow-sm">
          <Icon className="text-blue-500 dark:text-blue-500" size={20} />
        </div>
      )}
      <div>
        <h2 className={`text-xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
          {title}
        </h2>
        {subtitle && (
          <p className={`text-sm mt-1 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
            {subtitle}
          </p>
        )}
      </div>
    </div>
    {action}
  </div>
)

const ProgressBar = ({ value = 0, isDark }) => {
  const v = Math.max(0, Math.min(100, Number(value) || 0))
  return (
    <div
      className={`w-full h-2 rounded-full overflow-hidden ${
        isDark ? "bg-gray-700" : "bg-gray-100"
      }`}
    >
      <div
        className={`h-full rounded-full transition-all ${
          v >= 80 ? "bg-emerald-500" : v >= 50 ? "bg-amber-500" : "bg-red-500"
        }`}
        style={{ width: `${v}%` }}
      />
    </div>
  )
}

const Badge = ({ children, tone = "blue", isDark }) => {
  const cls = {
    blue: "bg-transparent text-blue-500 border-blue-500 dark:bg-transparent dark:text-blue-500 dark:border-blue-500",
    green: "bg-transparent text-emerald-500 border-emerald-500 dark:bg-transparent dark:text-emerald-500 dark:border-emerald-500",
    red: "bg-transparent text-red-500 border-red-500 dark:bg-transparent dark:text-red-500 dark:border-red-500",
    yellow: "bg-transparent text-amber-500 border-amber-500 dark:bg-transparent dark:text-amber-500 dark:border-amber-500",
    orange: "bg-transparent text-orange-500 border-orange-500 dark:bg-transparent dark:text-orange-500 dark:border-orange-500",
    purple: "bg-transparent text-violet-500 border-violet-500 dark:bg-transparent dark:text-violet-500 dark:border-violet-500",
    gray: "bg-transparent text-slate-500 border-slate-500 dark:bg-transparent dark:text-slate-500 dark:border-slate-500",
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border-2 shadow-sm ${
        cls[tone] || cls.blue
      }`}
    >
      {children}
    </span>
  )
}

const MiniMetric = ({ title, value, isDark, danger = false, compact = false }) => (
  <div>
    <p
      className={`${compact ? "text-lg" : "text-2xl"} font-bold ${
        danger ? "text-red-500" : isDark ? "text-white" : "text-gray-900"
      }`}
    >
      {value}
    </p>
    <p className={`text-xs mt-1 ${isDark ? "text-gray-400" : "text-gray-600"}`}>{title}</p>
  </div>
)

const InfoRow = ({ label, value, isDark, danger = false }) => (
  <div
    className={`flex items-center justify-between gap-4 p-3 rounded-xl ${
      isDark ? "bg-gray-700/70" : "bg-gray-50"
    }`}
  >
    <span className={`text-sm ${isDark ? "text-gray-300" : "text-gray-600"}`}>{label}</span>
    <span
      className={`font-bold text-sm ${
        danger ? "text-red-500" : isDark ? "text-white" : "text-gray-900"
      }`}
    >
      {value}
    </span>
  </div>
)

const ListBlock = ({ title, items, isDark, emptyText }) => (
  <div>
    <h3 className={`font-bold mb-3 ${isDark ? "text-white" : "text-gray-900"}`}>{title}</h3>
    <div className="space-y-2">
      {items.length === 0 ? (
        <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>{emptyText}</p>
      ) : (
        items.map((item) => (
          <div
            key={item.id}
            className={`flex items-center justify-between gap-3 p-3 rounded-xl ${
              isDark ? "bg-gray-700" : "bg-gray-50"
            }`}
          >
            <span className={`text-sm font-medium ${isDark ? "text-gray-200" : "text-gray-700"}`}>
              {item.name}
            </span>
            <span className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>
              {item.value}
            </span>
          </div>
        ))
      )}
    </div>
  </div>
)

// ─── Section Components ───────────────────────────────────────────────────────

const DashboardHeader = ({ isDark, title, lastUpdated, lastUpdatedLabel, refreshLabel, loading, onRefresh }) => (
  <Card isDark={isDark} className="p-6">
    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
      <div>
        <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent pb-1">
          {title}
        </h1>
        {lastUpdated && (
          <p className={`text-sm mt-2 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
            {lastUpdatedLabel}: {formatDate(lastUpdated)}
          </p>
        )}
      </div>
      <button
        onClick={onRefresh}
        disabled={loading}
        className="inline-flex items-center justify-center gap-2 bg-[var(--color-success)] hover:bg-[var(--color-success-hover)] disabled:opacity-60 disabled:cursor-not-allowed text-white px-5 py-3 rounded-xl font-extrabold transition-all shadow-lg"
      >
        <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
        {refreshLabel}
      </button>
    </div>
  </Card>
)

const OverviewStats = ({ data, isDark, t }) => {
  const currentRoster = data.rosters?.currentRoster
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-4">
      <StatCard
        icon={Users}
        label={t("dashboard.overview.totalUsers")}
        value={data.users?.totalUsers ?? 0}
        color="blue"
        isDark={isDark}
      />
      <StatCard
        icon={Clock}
        label={t("dashboard.overview.pendingRequests")}
        value={data.pendingRequests?.totalPendingRequests ?? 0}
        color="orange"
        isDark={isDark}
      />
      <StatCard
        icon={AlertTriangle}
        label={t("dashboard.overview.criticalAlerts")}
        value={data.systemAlerts?.criticalAlerts ?? 0}
        color="red"
        isDark={isDark}
      />
      <StatCard
        icon={Calendar}
        label={t("dashboard.overview.todayShifts")}
        value={data.shiftInsights?.todayTotalShifts ?? 0}
        color="purple"
        isDark={isDark}
      />
      <StatCard
        icon={BarChart3}
        label={t("dashboard.overview.rosterCompletion")}
        value={`${currentRoster?.completionPercent ?? 0}%`}
        color="green"
        isDark={isDark}
      />
      <StatCard
        icon={MapPin}
        label={t("dashboard.overview.geoFenceCoverage")}
        value={`${data.departments?.geoFenceCoverageRate ?? 0}%`}
        color="blue"
        isDark={isDark}
      />
    </div>
  )
}

// dedup roster alerts: one entry per rosterId, pick highest severity
const dedupeRosterAlerts = (alerts) => {
  const map = new Map()
  for (const a of alerts) {
    const key = a.rosterId ?? a.id ?? Math.random()
    const existing = map.get(key)
    if (!existing) { map.set(key, a); continue }
    const isCrit = (s) => String(s || "").toLowerCase().includes("critical")
    if (isCrit(a.severity) && !isCrit(existing.severity)) map.set(key, a)
  }
  return [...map.values()]
}

const useAttentionItems = (data, t) =>
  useMemo(() => {
    const systemAlerts =
      data.systemAlerts?.recentAlerts?.map((item, i) => ({
        id: `system-${i}`,
        source: t("dashboard.sources.system"),
        title: item.alertType || t("dashboard.sources.systemAlert"),
        message: item.message,
        date: item.timestamp,
        severity: item.severity || t("dashboard.sources.warning"),
        icon: AlertTriangle,
      })) ?? []

    const requests =
      data.pendingRequests?.recentRequests?.map((item) => ({
        id: `request-${item.id}`,
        source: item.requestType || t("dashboard.sources.request"),
        title: item.requesterName,
        message: item.description,
        date: item.requestDate,
        severity: item.priority,
        icon: Clock,
      })) ?? []

    const categoryAlerts =
      data.categories?.categoryAlerts?.map((item) => ({
        id: `category-${item.categoryId}`,
        source: t("dashboard.sources.category"),
        title: item.categoryName,
        message: item.message,
        severity: item.severity,
        icon: Briefcase,
      })) ?? []

    const departmentAlerts =
      data.departments?.departmentAlerts?.map((item) => ({
        id: `department-${item.departmentId}`,
        source: t("dashboard.sources.department"),
        title: item.departmentName,
        message: item.message,
        severity: item.severity,
        icon: Building,
      })) ?? []

    const rosterAlerts = dedupeRosterAlerts(
      data.rosters?.alerts ?? []
    ).map((item, i) => ({
      id: `roster-${item.rosterId ?? i}`,
      source: t("dashboard.sources.roster"),
      title: item.rosterTitle || item.title || t("dashboard.sources.rosterAlert"),
      message: item.message,
      date: item.createdAt,
      severity: item.severity || item.statusColor,
      icon: Calendar,
    }))

    return [
      ...systemAlerts,
      ...requests,
      ...rosterAlerts,
      ...categoryAlerts,
      ...departmentAlerts,
    ].slice(0, 12)
  }, [data, t])

const NeedsAttention = ({ data, isDark, t }) => {
  const items = useAttentionItems(data, t)
  return (
    <Card isDark={isDark} className="p-6">
      <SectionHeader
        icon={AlertTriangle}
        title={t("dashboard.attention.title")}
        subtitle={t("dashboard.attention.subtitle")}
        isDark={isDark}
      />
      {items.length === 0 ? (
        <div
          className={`p-6 rounded-xl text-center ${
            isDark ? "bg-gray-700 text-gray-300" : "bg-gray-50 text-gray-600"
          }`}
        >
          {t("dashboard.attention.empty")}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {items.map((item) => {
            const Icon = item.icon
            return (
              <div
                key={item.id}
                className={`p-4 rounded-xl border ${getSeverityClasses(item.severity, isDark)}`}
              >
                <div className="flex items-start gap-3">
                  <Icon size={20} className="mt-0.5 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <p className="font-bold truncate">{item.title}</p>
                      <Badge tone="gray" isDark={isDark}>{item.source}</Badge>
                    </div>
                    <p className="text-sm leading-relaxed opacity-90">{item.message}</p>
                    {item.date && (
                      <p className="text-xs mt-2 opacity-70">{formatDate(item.date)}</p>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </Card>
  )
}

const RosterOverview = ({ data, isDark, t }) => {
  const roster = data.rosters?.currentRoster
  const activeRosters = data.rosters?.activeRosters?.items || []
  if (!roster && activeRosters.length === 0) return null

  return (
    <Card isDark={isDark} className="p-6">
      <SectionHeader
        icon={Calendar}
        title={t("dashboard.rosters.title")}
        subtitle={t("dashboard.rosters.subtitle")}
        isDark={isDark}
      />

      {roster && (
        <div
          className={`p-5 rounded-2xl mb-5 ${
            isDark
              ? "bg-gray-700/70"
              : "bg-gradient-to-r from-blue-50 to-indigo-50"
          }`}
        >
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-4">
            <div>
              <h3 className={`text-lg font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                {roster.title}
              </h3>
              <p className={`text-sm mt-1 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                {roster.startDate} → {roster.endDate}
              </p>
            </div>
            <Badge tone={roster.completionPercent >= 50 ? "green" : "red"} isDark={isDark}>
              {roster.status}
            </Badge>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
            <MiniMetric title={t("dashboard.rosters.completionPercent")} value={`${roster.completionPercent ?? 0}%`} isDark={isDark} />
            <MiniMetric title={t("dashboard.rosters.daysRemaining")} value={roster.daysRemaining ?? 0} isDark={isDark} />
            <MiniMetric title={t("dashboard.rosters.requiredHours")} value={roster.totalRequiredHours ?? 0} isDark={isDark} />
            <MiniMetric title={t("dashboard.rosters.assignedHours")} value={roster.totalAssignedHours ?? 0} isDark={isDark} />
            <MiniMetric title={t("dashboard.rosters.emptyShifts")} value={roster.emptyShiftsCount ?? 0} isDark={isDark} danger />
          </div>

          <ProgressBar value={roster.completionPercent} isDark={isDark} />
        </div>
      )}

      {activeRosters.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {activeRosters.slice(0, 6).map((item) => (
            <div
              key={item.id}
              className={`p-4 rounded-xl border ${
                isDark ? "bg-gray-700 border-gray-600" : "bg-gray-50 border-gray-200"
              }`}
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <h4 className={`font-bold text-sm leading-snug ${isDark ? "text-white" : "text-gray-900"}`}>
                  {item.categoryName}
                </h4>
                <Badge tone={item.statusColor === "red" ? "red" : "green"} isDark={isDark}>
                  {item.completionPercent}%
                </Badge>
              </div>

              <ProgressBar value={item.completionPercent} isDark={isDark} />

              <div className="grid grid-cols-3 gap-2 mt-4 text-center">
                <MiniMetric title={t("dashboard.common.doctors")} value={item.assignedDoctorsCount ?? 0} isDark={isDark} compact />
                <MiniMetric title={t("dashboard.common.empty")} value={item.emptyShiftsCount ?? 0} isDark={isDark} compact danger />
                <MiniMetric title={t("dashboard.common.remaining")} value={item.daysRemaining ?? 0} isDark={isDark} compact />
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}

const OperationsOverview = ({ data, isDark, t }) => {
  const shift = data.shiftInsights
  const email = data.emailQueue
  const quick = data.quickStats

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      <Card isDark={isDark} className="p-6">
        <SectionHeader icon={Activity} title={t("dashboard.operations.todayOperations")} isDark={isDark} />
        <div className="space-y-4">
          <InfoRow label={t("dashboard.operations.todayTotalShifts")}  value={shift?.todayTotalShifts ?? 0}     isDark={isDark} />
          <InfoRow label={t("dashboard.operations.nightShiftsToday")}        value={shift?.nightShiftsToday ?? 0}      isDark={isDark} />
          <InfoRow label={t("dashboard.operations.averageShiftHours")}      value={shift?.averageShiftHours ?? 0}     isDark={isDark} />
          <InfoRow
            label={t("dashboard.operations.mostUsedShift")}
            value={shift?.mostCommonShiftTypeNameAr || shift?.mostCommonShiftTypeNameEn || "-"}
            isDark={isDark}
          />
        </div>
      </Card>

      <Card isDark={isDark} className="p-6">
        <SectionHeader icon={Mail} title={t("dashboard.operations.emailsNotifications")} isDark={isDark} />
        <div className="space-y-4">
          <InfoRow
            label={t("dashboard.operations.emailsSentToday")}
            value={email?.sentToday ?? quick?.emailsSentToday ?? 0}
            isDark={isDark}
          />
          <InfoRow
            label={t("dashboard.operations.failuresToday")}
            value={email?.failedToday ?? 0}
            isDark={isDark}
            danger={(email?.failedToday ?? 0) > 0}
          />
          <InfoRow label={t("dashboard.operations.unreadNotifications")} value={data.notifications?.unreadNotifications ?? 0} isDark={isDark} />
          <InfoRow
            label={t("dashboard.operations.urgentNotifications")}
            value={data.notifications?.urgentNotifications ?? 0}
            isDark={isDark}
            danger={(data.notifications?.urgentNotifications ?? 0) > 0}
          />
        </div>
      </Card>

      <Card isDark={isDark} className="p-6">
        <SectionHeader icon={MapPin} title="GeoFence" isDark={isDark} />
        <div className="space-y-4">
          <InfoRow label={t("dashboard.operations.departmentsWithGeoFence")} value={data.departments?.departmentsWithGeoFence ?? 0} isDark={isDark} />
          <InfoRow label={t("dashboard.operations.activeGeoFences")}     value={data.departments?.activeGeoFences ?? 0}          isDark={isDark} />
          <InfoRow label={t("dashboard.operations.coverageRate")}        value={`${data.departments?.geoFenceCoverageRate ?? 0}%`} isDark={isDark} />
          <InfoRow label={t("dashboard.operations.healthStatus")}          value={data.departments?.healthStatus || "-"}           isDark={isDark} />
        </div>
      </Card>
    </div>
  )
}

const ManagementCoverage = ({ data, isDark, lang, navigate, t }) => {
  const categories  = data.categories?.topActiveCategories  || []
  const departments = data.departments?.topActiveDepartments || []
  const roles       = data.roles?.distribution               || []

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
      {/* Categories */}
      <Card isDark={isDark} className="p-6">
        <SectionHeader
          icon={Briefcase}
          title={t("dashboard.coverage.activeCategories")}
          subtitle={t("dashboard.coverage.categoriesWithoutManagers", { count: data.categories?.categoriesWithoutManagers ?? 0 })}
          isDark={isDark}
          emptyText={t("dashboard.common.noData")}
        />
        <div className="space-y-3">
          {categories.slice(0, 5).map((cat) => (
            <button
              key={cat.id}
              onClick={() => { window.scrollTo({ top: 0 }); navigate(`/admin-panel/category/${cat.id}`) }}
              className={`w-full text-start p-4 rounded-xl border transition-colors ${
                isDark
                  ? "bg-gray-700 border-gray-600 hover:bg-gray-600"
                  : "bg-gray-50 border-gray-200 hover:bg-gray-100"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge tone="green" isDark={isDark}>{cat.code}</Badge>
                    {!cat.managerName && (
                      <Badge tone="yellow" isDark={isDark}>{t("dashboard.coverage.noManager")}</Badge>
                    )}
                  </div>
                  <p className={`font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                    {getName(cat, lang)}
                  </p>
                </div>
                <div className="text-end shrink-0">
                  <p className={`text-xl font-bold ${isDark ? "text-blue-500" : "text-blue-500"}`}>
                    {cat.doctorsCount}
                  </p>
                  <p className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>{t("dashboard.common.doctors")}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </Card>

      {/* Departments */}
      <Card isDark={isDark} className="p-6">
        <SectionHeader
          icon={Building}
          title={t("dashboard.coverage.activeDepartments")}
          subtitle={t("dashboard.coverage.departmentsWithoutManagers", { count: data.departments?.departmentsWithoutManagers ?? 0 })}
          isDark={isDark}
          emptyText={t("dashboard.common.noData")}
        />
        <div className="space-y-3">
          {departments.slice(0, 5).map((dept) => (
            <button
              key={dept.id}
              onClick={() => { window.scrollTo({ top: 0 }); navigate(`/admin-panel/department/${dept.id}`) }}
              className={`w-full text-start p-4 rounded-xl border transition-colors ${
                isDark
                  ? "bg-gray-700 border-gray-600 hover:bg-gray-600"
                  : "bg-gray-50 border-gray-200 hover:bg-gray-100"
              }`}
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge tone="blue" isDark={isDark}>{dept.code}</Badge>
                    {dept.hasGeoFence ? (
                      <Badge tone="green" isDark={isDark}>{t("dashboard.coverage.geoFence")}</Badge>
                    ) : (
                      <Badge tone="red" isDark={isDark}>{t("dashboard.coverage.noGeoFence")}</Badge>
                    )}
                  </div>
                  <p className={`font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                    {getName(dept, lang)}
                  </p>
                  <p className={`text-xs mt-1 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                    {dept.location}
                  </p>
                </div>
                <div className="text-end shrink-0">
                  <p className={`text-xl font-bold ${isDark ? "text-violet-500" : "text-violet-500"}`}>
                    {dept.activeSchedulesCount?.toLocaleString() ?? 0}
                  </p>
                  <p className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>{t("dashboard.common.schedules")}</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <MiniMetric title={t("dashboard.common.doctors")} value={dept.assignedDoctorsCount ?? 0} isDark={isDark} compact />
                <MiniMetric title={t("dashboard.common.categories")} value={dept.categoriesCount ?? 0} isDark={isDark} compact />
                <MiniMetric title={t("dashboard.common.activity")} value={dept.activityLevelText || dept.activityLevel || "-"} isDark={isDark} compact />
              </div>
            </button>
          ))}
        </div>
      </Card>

      {/* Roles */}
      <Card isDark={isDark} className="p-6 xl:col-span-2">
        <SectionHeader icon={Shield} title={t("dashboard.roles.title")} isDark={isDark} />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
          <StatCard icon={UserCheck} label={t("dashboard.roles.activeUsers")} value={data.roles?.kpis?.totalActiveUsers   ?? 0} color="green"  isDark={isDark} />
          <StatCard icon={Shield}    label={t("dashboard.roles.permanentRoles")}    value={data.roles?.kpis?.permanentRoles      ?? 0} color="blue"   isDark={isDark} />
          <StatCard icon={Clock}     label={t("dashboard.roles.temporaryRoles")}   value={data.roles?.kpis?.temporaryRoles      ?? 0} color="orange" isDark={isDark} />
          <StatCard icon={XCircle}   label={t("dashboard.roles.usersWithoutRoles")}    value={data.roles?.kpis?.usersWithoutRoles   ?? 0} color="red"    isDark={isDark} />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {roles
            .filter((r) => r.activeUsersCount > 0)
            .map((role) => (
              <div
                key={role.roleType}
                className={`p-4 rounded-xl ${isDark ? "bg-gray-700" : "bg-gray-50"}`}
              >
                <p className={`font-bold text-sm ${isDark ? "text-white" : "text-gray-900"}`}>
                  {lang === "ar" ? role.roleNameAr : role.roleNameEn}
                </p>
                <p className={`text-2xl font-black mt-2 ${isDark ? "text-blue-500" : "text-blue-500"}`}>
                  {role.activeUsersCount}
                </p>
              </div>
            ))}
        </div>
      </Card>
    </div>
  )
}

const ConfigurationSummary = ({ data, isDark, lang, t }) => {
  if (!data.configurationSummary) return null

  const degrees         = data.configurationSummary.topDegreesByUsers  || []
  const contractingTypes= data.configurationSummary.contractingTypes   || []
  const shiftTypes      = data.configurationSummary.shiftTypes         || []

  return (
    <Card isDark={isDark} className="p-6">
      <SectionHeader
        icon={FileText}
        title={t("dashboard.configuration.title")}
        subtitle={t("dashboard.configuration.subtitle")}
        isDark={isDark}
      />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ListBlock
          title={t("dashboard.configuration.scientificDegrees")}
          items={degrees.map((d) => ({
            id: d.id,
            name: getName(d, lang),
            value: t("dashboard.configuration.usersValue", { count: d.usersCount }),
          }))}
          isDark={isDark}
          emptyText={t("dashboard.common.noData")}
        />
        <ListBlock
          title={t("dashboard.configuration.contractingTypes")}
          items={contractingTypes.slice(0, 6).map((ct) => ({
            id: ct.id,
            name: getName(ct, lang),
            value: t("dashboard.configuration.contractingValue", { users: ct.usersCount, hours: ct.maxHoursPerWeek }),
          }))}
          isDark={isDark}
          emptyText={t("dashboard.common.noData")}
        />
        <ListBlock
          title={t("dashboard.configuration.shiftTypes")}
          items={shiftTypes.slice(0, 6).map((st) => ({
            id: st.id,
            name: getName(st, lang),
            value: t("dashboard.configuration.shiftValue", { usage: st.usageToday, hours: st.totalTime }),
          }))}
          isDark={isDark}
          emptyText={t("dashboard.common.noData")}
        />
      </div>
    </Card>
  )
}

const RecentActivity = ({ data, isDark, t }) => {
  const notifications = data.notifications?.recentNotifications || []
  const roleChanges   = data.roles?.recentChanges                || []

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
      <Card isDark={isDark} className="p-6">
        <SectionHeader icon={Mail} title={t("dashboard.activity.recentNotifications")} isDark={isDark} />
        <div className="space-y-3">
          {notifications.slice(0, 5).map((item) => (
            <div
              key={item.id}
              className={`p-4 rounded-xl flex items-start justify-between gap-3 ${
                isDark ? "bg-gray-700" : "bg-gray-50"
              }`}
            >
              <div>
                <p className={`font-bold ${isDark ? "text-white" : "text-gray-900"}`}>{item.title}</p>
                <p className={`text-xs mt-1 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                  {formatDate(item.createdAt)}
                </p>
              </div>
              <Badge tone={item.isRead ? "gray" : "blue"} isDark={isDark}>{item.type}</Badge>
            </div>
          ))}
        </div>
      </Card>

      <Card isDark={isDark} className="p-6">
        <SectionHeader icon={Shield} title={t("dashboard.activity.recentRoleChanges")} isDark={isDark} />
        <div className="space-y-3">
          {roleChanges.slice(0, 5).map((item) => (
            <div
              key={item.id}
              className={`p-4 rounded-xl ${isDark ? "bg-gray-700" : "bg-gray-50"}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className={`font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                    {item.newRoleName}
                  </p>
                  <p className={`text-sm mt-1 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                    {item.notes}
                  </p>
                  <p className={`text-xs mt-1 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                    {formatDate(item.changedAt)}
                  </p>
                </div>
                <Badge tone="purple" isDark={isDark}>{item.changeType}</Badge>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

const DashboardError = ({ isDark, error, onRetry, t }) => (
  <div
    className={`min-h-screen p-6 flex items-center justify-center ${
      isDark ? "bg-gray-900" : "bg-red-50"
    }`}
  >
    <Card isDark={isDark} className="p-8 max-w-xl w-full text-center">
      <div className="w-20 h-20 rounded-full border-2 flex items-center justify-center mx-auto mb-5 bg-transparent text-red-500 border-red-500 dark:bg-transparent dark:text-red-500 dark:border-red-500">
        <AlertTriangle className="text-red-500" size={36} />
      </div>
      <h2 className={`text-2xl font-bold mb-3 ${isDark ? "text-white" : "text-gray-900"}`}>
        {t("dashboard.error.title")}
      </h2>
      <p className={`mb-6 ${isDark ? "text-gray-300" : "text-gray-600"}`}>
        {error?.message || t("dashboard.error.message")}
      </p>
      <button
        onClick={onRetry}
        className="inline-flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-semibold"
      >
        <RefreshCw size={18} />
        {t("dashboard.error.retry")}
      </button>
    </Card>
  </div>
)

// ─── Root ─────────────────────────────────────────────────────────────────────

const Dashboard = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { t, i18n } = useTranslation()
  const { mymode } = useSelector((state) => state.mode)
  const { dashboardData, loadingGetDashboardData, dashboardError, lastUpdated } =
    useSelector((state) => state.reports)

  const isDark = mymode === "dark"
  const isRTL  = i18n.language === "ar"

  useEffect(() => {
    dispatch(getDashboardData())
    return () => dispatch(clearDashboardError())
  }, [dispatch])

  if (loadingGetDashboardData && !dashboardData)
    return <LoadingGetData text={t("dashboard.loading")} />

  if (dashboardError && !dashboardData)
    return (
      <DashboardError isDark={isDark} error={dashboardError} onRetry={() => dispatch(getDashboardData())} t={t} />
    )

  if (!dashboardData) return null

  return (
    <div
      className={`min-h-screen p-4 lg:p-6 ${
        isDark
          ? "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900"
          : "bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50"
      } ${isRTL ? "rtl" : "ltr"}`}
      dir={isRTL ? "rtl" : "ltr"}
    >
      <div className="max-w-7xl mx-auto space-y-6">

        <DashboardHeader
          isDark={isDark}
          title={t("dashboard.title") || "Dashboard"}
          lastUpdated={lastUpdated}
          lastUpdatedLabel={t("dashboard.lastUpdated")}
          refreshLabel={t("dashboard.refresh")}
          loading={loadingGetDashboardData}
          onRefresh={() => dispatch(getDashboardData())}
        />

        <OverviewStats data={dashboardData} isDark={isDark} t={t} />

        <DashboardCharts dashboardData={dashboardData} isDark={isDark} t={t} />

        <NeedsAttention data={dashboardData} isDark={isDark} t={t} />

        <RosterOverview data={dashboardData} isDark={isDark} t={t} />

        <OperationsOverview data={dashboardData} isDark={isDark} t={t} />

        <ManagementCoverage
          data={dashboardData}
          isDark={isDark}
          lang={i18n.language}
          navigate={navigate}
          t={t}
        />

        <ConfigurationSummary
          data={dashboardData}
          isDark={isDark}
          lang={i18n.language}
          t={t}
        />

        <RecentActivity data={dashboardData} isDark={isDark} t={t} />

      </div>
    </div>
  )
}

export default Dashboard