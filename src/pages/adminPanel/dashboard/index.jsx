import { useEffect, useMemo } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"
import {
  Activity,
  AlertTriangle,
  Award,
  BarChart3,
  Briefcase,
  Building,
  Calendar,
  CheckCircle2,
  Clock,
  FileText,
  Mail,
  MapPin,
  RefreshCw,
  Shield,
  TrendingUp,
  UserCheck,
  Users,
  XCircle,
} from "lucide-react"

import LoadingGetData from "../../../components/LoadingGetData"
import { StatCard } from "../../../components/dashboard/stateCard"
import { DashboardCharts } from "../../../components/dashboard/charts"
import { getDashboardData } from "../../../state/act/actReports"
import { clearDashboardError } from "../../../state/slices/reports"
import { formatDate } from "../../../utils/formtDate"

const getName = (item, lang) => {
  if (!item) return ""
  return lang === "ar"
    ? item.nameArabic || item.nameAr || item.roleNameAr || item.categoryName || item.departmentName || item.nameEnglish || item.nameEn
    : item.nameEnglish || item.nameEn || item.roleNameEn || item.categoryName || item.departmentName || item.nameArabic || item.nameAr
}

const getSeverityClasses = (severity, isDark) => {
  const value = String(severity || "").toLowerCase()

  if (value.includes("critical") || value.includes("high") || value.includes("red")) {
    return isDark
      ? "bg-red-900/25 border-red-500/60 text-red-300"
      : "bg-red-50 border-red-300 text-red-700"
  }

  if (value.includes("warning") || value.includes("medium") || value.includes("yellow")) {
    return isDark
      ? "bg-yellow-900/20 border-yellow-500/60 text-yellow-300"
      : "bg-yellow-50 border-yellow-300 text-yellow-700"
  }

  return isDark
    ? "bg-blue-900/20 border-blue-500/60 text-blue-300"
    : "bg-blue-50 border-blue-300 text-blue-700"
}

const Card = ({ children, isDark, className = "" }) => {
  return (
    <div
      className={`rounded-2xl shadow-xl border ${
        isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"
      } ${className}`}
    >
      {children}
    </div>
  )
}

const SectionHeader = ({ icon: Icon, title, subtitle, isDark, action }) => {
  return (
    <div className="flex items-start justify-between gap-4 mb-5">
      <div className="flex items-start gap-3">
        {Icon && (
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              isDark ? "bg-blue-900/30" : "bg-blue-100"
            }`}
          >
            <Icon className={isDark ? "text-blue-300" : "text-blue-600"} size={20} />
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
}

const ProgressBar = ({ value = 0, isDark }) => {
  const safeValue = Math.max(0, Math.min(100, Number(value) || 0))

  return (
    <div className={`w-full h-2 rounded-full overflow-hidden ${isDark ? "bg-gray-700" : "bg-gray-100"}`}>
      <div
        className={`h-full rounded-full ${
          safeValue >= 80 ? "bg-green-500" : safeValue >= 50 ? "bg-yellow-500" : "bg-red-500"
        }`}
        style={{ width: `${safeValue}%` }}
      />
    </div>
  )
}

const Badge = ({ children, tone = "blue", isDark }) => {
  const classes = {
    blue: isDark ? "bg-blue-900/30 text-blue-300" : "bg-blue-100 text-blue-700",
    green: isDark ? "bg-green-900/30 text-green-300" : "bg-green-100 text-green-700",
    red: isDark ? "bg-red-900/30 text-red-300" : "bg-red-100 text-red-700",
    yellow: isDark ? "bg-yellow-900/30 text-yellow-300" : "bg-yellow-100 text-yellow-700",
    purple: isDark ? "bg-purple-900/30 text-purple-300" : "bg-purple-100 text-purple-700",
    gray: isDark ? "bg-gray-700 text-gray-300" : "bg-gray-100 text-gray-700",
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${classes[tone] || classes.blue}`}>
      {children}
    </span>
  )
}

const DashboardHeader = ({ isDark, title, lastUpdated, loading, onRefresh }) => {
  return (
    <Card isDark={isDark} className="p-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent pb-1">
            {title}
          </h1>

          {lastUpdated && (
            <p className={`text-sm mt-2 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
              آخر تحديث: {formatDate(lastUpdated)}
            </p>
          )}
        </div>

        <button
          onClick={onRefresh}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white px-5 py-3 rounded-xl font-semibold transition-all shadow-lg"
        >
          <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
          تحديث البيانات
        </button>
      </div>
    </Card>
  )
}

const OverviewStats = ({ data, isDark }) => {
  const currentRoster = data.rosters?.currentRoster

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-6 gap-4">
      <StatCard
        icon={Users}
        label="إجمالي المستخدمين"
        value={data.users?.totalUsers ?? 0}
        color="blue"
        isDark={isDark}
      />

      <StatCard
        icon={Clock}
        label="طلبات معلقة"
        value={data.pendingRequests?.totalPendingRequests ?? 0}
        color="orange"
        isDark={isDark}
      />

      <StatCard
        icon={AlertTriangle}
        label="تنبيهات حرجة"
        value={data.systemAlerts?.criticalAlerts ?? 0}
        color="red"
        isDark={isDark}
      />

      <StatCard
        icon={Calendar}
        label="شيفتات اليوم"
        value={data.shiftInsights?.todayTotalShifts ?? 0}
        color="purple"
        isDark={isDark}
      />

      <StatCard
        icon={BarChart3}
        label="إكمال الروستر"
        value={`${currentRoster?.completionPercent ?? 0}%`}
        color="green"
        isDark={isDark}
      />

      <StatCard
        icon={MapPin}
        label="تغطية GeoFence"
        value={`${data.departments?.geoFenceCoverageRate ?? 0}%`}
        color="blue"
        isDark={isDark}
      />
    </div>
  )
}

const useAttentionItems = (data) => {
  return useMemo(() => {
    const systemAlerts =
      data.systemAlerts?.recentAlerts?.map((item, index) => ({
        id: `system-${index}`,
        source: "System",
        title: item.alertType || "System Alert",
        message: item.message,
        date: item.timestamp,
        severity: item.severity || "Warning",
        icon: AlertTriangle,
      })) || []

    const requests =
      data.pendingRequests?.recentRequests?.map((item) => ({
        id: `request-${item.id}`,
        source: item.requestType || "Request",
        title: item.requesterName,
        message: item.description,
        date: item.requestDate,
        severity: item.priority,
        icon: Clock,
      })) || []

    const categoryAlerts =
      data.categories?.categoryAlerts?.map((item) => ({
        id: `category-${item.categoryId}`,
        source: "Category",
        title: item.categoryName,
        message: item.message,
        severity: item.severity,
        icon: Briefcase,
      })) || []

    const departmentAlerts =
      data.departments?.departmentAlerts?.map((item) => ({
        id: `department-${item.departmentId}`,
        source: "Department",
        title: item.departmentName,
        message: item.message,
        severity: item.severity,
        icon: Building,
      })) || []

    const rosterAlerts =
      data.rosters?.alerts?.map((item, index) => ({
        id: `roster-${index}`,
        source: "Roster",
        title: item.rosterTitle || item.title || "Roster Alert",
        message: item.message,
        date: item.createdAt,
        severity: item.severity || item.statusColor,
        icon: Calendar,
      })) || []

    return [
      ...systemAlerts,
      ...requests,
      ...rosterAlerts,
      ...categoryAlerts,
      ...departmentAlerts,
    ].slice(0, 12)
  }, [data])
}

const NeedsAttention = ({ data, isDark }) => {
  const items = useAttentionItems(data)

  return (
    <Card isDark={isDark} className="p-6">
      <SectionHeader
        icon={AlertTriangle}
        title="محتاج متابعة"
        subtitle="أهم الطلبات والتنبيهات اللي لازم تظهر فورًا بدل ما تبقى مستخبية"
        isDark={isDark}
      />

      {items.length === 0 ? (
        <div
          className={`p-6 rounded-xl text-center ${
            isDark ? "bg-gray-700 text-gray-300" : "bg-gray-50 text-gray-600"
          }`}
        >
          لا توجد تنبيهات أو طلبات تحتاج متابعة حاليًا.
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
                      <Badge tone="gray" isDark={isDark}>
                        {item.source}
                      </Badge>
                    </div>

                    <p className="text-sm leading-6 opacity-90">{item.message}</p>

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

const RosterOverview = ({ data, isDark }) => {
  const roster = data.rosters?.currentRoster
  const activeRosters = data.rosters?.activeRosters?.items || []

  if (!roster && activeRosters.length === 0) return null

  return (
    <Card isDark={isDark} className="p-6">
      <SectionHeader
        icon={Calendar}
        title="الروسترات والشيفتات"
        subtitle="ملخص سريع عن اكتمال الجداول والشيفتات الفارغة"
        isDark={isDark}
      />

      {roster && (
        <div
          className={`p-5 rounded-2xl mb-5 ${
            isDark ? "bg-gray-700/70" : "bg-gradient-to-r from-blue-50 to-indigo-50"
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
            <MiniMetric title="نسبة الإكمال" value={`${roster.completionPercent ?? 0}%`} isDark={isDark} />
            <MiniMetric title="الأيام المتبقية" value={roster.daysRemaining ?? 0} isDark={isDark} />
            <MiniMetric title="الساعات المطلوبة" value={roster.totalRequiredHours ?? 0} isDark={isDark} />
            <MiniMetric title="الساعات المسندة" value={roster.totalAssignedHours ?? 0} isDark={isDark} />
            <MiniMetric title="شيفتات فارغة" value={roster.emptyShiftsCount ?? 0} isDark={isDark} danger />
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
                <h4 className={`font-bold text-sm leading-6 ${isDark ? "text-white" : "text-gray-900"}`}>
                  {item.categoryName}
                </h4>

                <Badge tone={item.statusColor === "red" ? "red" : "green"} isDark={isDark}>
                  {item.completionPercent}%
                </Badge>
              </div>

              <ProgressBar value={item.completionPercent} isDark={isDark} />

              <div className="grid grid-cols-3 gap-2 mt-4 text-center">
                <MiniMetric title="أطباء" value={item.assignedDoctorsCount ?? 0} isDark={isDark} compact />
                <MiniMetric title="فارغ" value={item.emptyShiftsCount ?? 0} isDark={isDark} compact danger />
                <MiniMetric title="متبقي" value={item.daysRemaining ?? 0} isDark={isDark} compact />
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}

const MiniMetric = ({ title, value, isDark, danger = false, compact = false }) => {
  return (
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
}

const OperationsOverview = ({ data, isDark }) => {
  const shift = data.shiftInsights
  const email = data.emailQueue
  const quick = data.quickStats

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      <Card isDark={isDark} className="p-6">
        <SectionHeader icon={Activity} title="تشغيل اليوم" isDark={isDark} />

        <div className="space-y-4">
          <InfoRow label="إجمالي الشيفتات اليوم" value={shift?.todayTotalShifts ?? 0} isDark={isDark} />
          <InfoRow label="الشيفتات الليلية" value={shift?.nightShiftsToday ?? 0} isDark={isDark} />
          <InfoRow label="متوسط ساعات الشيفت" value={shift?.averageShiftHours ?? 0} isDark={isDark} />
          <InfoRow label="أكثر شيفت استخدامًا" value={shift?.mostCommonShiftTypeNameAr || shift?.mostCommonShiftTypeNameEn || "-"} isDark={isDark} />
        </div>
      </Card>

      <Card isDark={isDark} className="p-6">
        <SectionHeader icon={Mail} title="الإيميلات والإشعارات" isDark={isDark} />

        <div className="space-y-4">
          <InfoRow label="إيميلات مرسلة اليوم" value={email?.sentToday ?? quick?.emailsSentToday ?? 0} isDark={isDark} />
          <InfoRow label="فشل اليوم" value={email?.failedToday ?? 0} isDark={isDark} danger={(email?.failedToday ?? 0) > 0} />
          <InfoRow label="إشعارات غير مقروءة" value={data.notifications?.unreadNotifications ?? 0} isDark={isDark} />
          <InfoRow label="إشعارات عاجلة" value={data.notifications?.urgentNotifications ?? 0} isDark={isDark} danger={(data.notifications?.urgentNotifications ?? 0) > 0} />
        </div>
      </Card>

      <Card isDark={isDark} className="p-6">
        <SectionHeader icon={MapPin} title="GeoFence" isDark={isDark} />

        <div className="space-y-4">
          <InfoRow label="أقسام بها GeoFence" value={data.departments?.departmentsWithGeoFence ?? 0} isDark={isDark} />
          <InfoRow label="GeoFences نشطة" value={data.departments?.activeGeoFences ?? 0} isDark={isDark} />
          <InfoRow label="نسبة التغطية" value={`${data.departments?.geoFenceCoverageRate ?? 0}%`} isDark={isDark} />
          <InfoRow label="حالة الصحة" value={data.departments?.healthStatus || "-"} isDark={isDark} />
        </div>
      </Card>
    </div>
  )
}

const InfoRow = ({ label, value, isDark, danger = false }) => {
  return (
    <div
      className={`flex items-center justify-between gap-4 p-3 rounded-xl ${
        isDark ? "bg-gray-700/70" : "bg-gray-50"
      }`}
    >
      <span className={`text-sm ${isDark ? "text-gray-300" : "text-gray-600"}`}>{label}</span>
      <span className={`font-bold text-sm ${danger ? "text-red-500" : isDark ? "text-white" : "text-gray-900"}`}>
        {value}
      </span>
    </div>
  )
}

const ManagementCoverage = ({ data, isDark, lang, navigate }) => {
  const categories = data.categories?.topActiveCategories || []
  const departments = data.departments?.topActiveDepartments || []
  const roles = data.roles?.distribution || []

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
      <Card isDark={isDark} className="p-6">
        <SectionHeader
          icon={Briefcase}
          title="التخصصات النشطة"
          subtitle={`${data.categories?.categoriesWithoutManagers ?? 0} تخصص بدون مدير`}
          isDark={isDark}
        />

        <div className="space-y-3">
          {categories.slice(0, 5).map((category) => (
            <button
              key={category.id}
              onClick={() => {
                window.scrollTo({ top: 0 })
                navigate(`/admin-panel/category/${category.id}`)
              }}
              className={`w-full text-start p-4 rounded-xl border transition-colors ${
                isDark
                  ? "bg-gray-700 border-gray-600 hover:bg-gray-600"
                  : "bg-gray-50 border-gray-200 hover:bg-gray-100"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge tone="green" isDark={isDark}>
                      {category.code}
                    </Badge>

                    {!category.managerName && (
                      <Badge tone="yellow" isDark={isDark}>
                        بدون مدير
                      </Badge>
                    )}
                  </div>

                  <p className={`font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                    {getName(category, lang)}
                  </p>
                </div>

                <div className="text-end">
                  <p className={`text-xl font-bold ${isDark ? "text-blue-300" : "text-blue-600"}`}>
                    {category.doctorsCount}
                  </p>
                  <p className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>أطباء</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </Card>

      <Card isDark={isDark} className="p-6">
        <SectionHeader
          icon={Building}
          title="الأقسام النشطة"
          subtitle={`${data.departments?.departmentsWithoutManagers ?? 0} قسم بدون مدير`}
          isDark={isDark}
        />

        <div className="space-y-3">
          {departments.slice(0, 5).map((department) => (
            <div
              key={department.id}
              className={`p-4 rounded-xl border ${
                isDark ? "bg-gray-700 border-gray-600" : "bg-gray-50 border-gray-200"
              }`}
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge tone="blue" isDark={isDark}>
                      {department.code}
                    </Badge>

                    {department.hasGeoFence ? (
                      <Badge tone="green" isDark={isDark}>
                        GeoFence
                      </Badge>
                    ) : (
                      <Badge tone="red" isDark={isDark}>
                        No GeoFence
                      </Badge>
                    )}
                  </div>

                  <p className={`font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                    {getName(department, lang)}
                  </p>

                  <p className={`text-xs mt-1 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                    {department.location}
                  </p>
                </div>

                <div className="text-end">
                  <p className={`text-xl font-bold ${isDark ? "text-purple-300" : "text-purple-600"}`}>
                    {department.activeSchedulesCount}
                  </p>
                  <p className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>جداول</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center">
                <MiniMetric title="أطباء" value={department.assignedDoctorsCount ?? 0} isDark={isDark} compact />
                <MiniMetric title="تخصصات" value={department.categoriesCount ?? 0} isDark={isDark} compact />
                <MiniMetric title="نشاط" value={department.activityLevelText || department.activityLevel} isDark={isDark} compact />
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card isDark={isDark} className="p-6 xl:col-span-2">
        <SectionHeader icon={Shield} title="الأدوار والصلاحيات" isDark={isDark} />

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-5">
          <StatCard icon={UserCheck} label="مستخدمين نشطين" value={data.roles?.kpis?.totalActiveUsers ?? 0} color="green" isDark={isDark} />
          <StatCard icon={Shield} label="أدوار دائمة" value={data.roles?.kpis?.permanentRoles ?? 0} color="blue" isDark={isDark} />
          <StatCard icon={Clock} label="أدوار مؤقتة" value={data.roles?.kpis?.temporaryRoles ?? 0} color="orange" isDark={isDark} />
          <StatCard icon={XCircle} label="بدون أدوار" value={data.roles?.kpis?.usersWithoutRoles ?? 0} color="red" isDark={isDark} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
          {roles.map((role) => (
            <div
              key={role.roleType}
              className={`p-4 rounded-xl ${isDark ? "bg-gray-700" : "bg-gray-50"}`}
            >
              <p className={`font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                {lang === "ar" ? role.roleNameAr : role.roleNameEn}
              </p>
              <p className={`text-2xl font-black mt-2 ${isDark ? "text-blue-300" : "text-blue-600"}`}>
                {role.activeUsersCount}
              </p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

const ConfigurationSummary = ({ data, isDark, lang }) => {
  const degrees = data.configurationSummary?.topDegreesByUsers || []
  const contractingTypes = data.configurationSummary?.contractingTypes || []
  const shiftTypes = data.configurationSummary?.shiftTypes || []

  if (!data.configurationSummary) return null

  return (
    <Card isDark={isDark} className="p-6">
      <SectionHeader
        icon={FileText}
        title="إعدادات التشغيل"
        subtitle="الدرجات العلمية، أنواع التعاقد، وأنواع الشيفتات الأكثر استخدامًا"
        isDark={isDark}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ListBlock
          title="الدرجات العلمية"
          items={degrees.map((item) => ({
            id: item.id,
            name: getName(item, lang),
            value: `${item.usersCount} مستخدم`,
          }))}
          isDark={isDark}
        />

        <ListBlock
          title="أنواع التعاقد"
          items={contractingTypes.slice(0, 6).map((item) => ({
            id: item.id,
            name: getName(item, lang),
            value: `${item.usersCount} مستخدم / ${item.maxHoursPerWeek} ساعة`,
          }))}
          isDark={isDark}
        />

        <ListBlock
          title="أنواع الشيفتات"
          items={shiftTypes.slice(0, 6).map((item) => ({
            id: item.id,
            name: getName(item, lang),
            value: `${item.usageToday} اليوم / ${item.totalTime} ساعات`,
          }))}
          isDark={isDark}
        />
      </div>
    </Card>
  )
}

const ListBlock = ({ title, items, isDark }) => {
  return (
    <div>
      <h3 className={`font-bold mb-3 ${isDark ? "text-white" : "text-gray-900"}`}>{title}</h3>

      <div className="space-y-2">
        {items.length === 0 ? (
          <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>لا توجد بيانات</p>
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
}

const RecentActivity = ({ data, isDark }) => {
  const notifications = data.notifications?.recentNotifications || []
  const roleChanges = data.roles?.recentChanges || []

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
      <Card isDark={isDark} className="p-6">
        <SectionHeader icon={Mail} title="آخر الإشعارات" isDark={isDark} />

        <div className="space-y-3">
          {notifications.slice(0, 5).map((item) => (
            <div
              key={item.id}
              className={`p-4 rounded-xl flex items-start justify-between gap-3 ${
                isDark ? "bg-gray-700" : "bg-gray-50"
              }`}
            >
              <div>
                <p className={`font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                  {item.title}
                </p>
                <p className={`text-xs mt-1 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                  {formatDate(item.createdAt)}
                </p>
              </div>

              <Badge tone={item.isRead ? "gray" : "blue"} isDark={isDark}>
                {item.type}
              </Badge>
            </div>
          ))}
        </div>
      </Card>

      <Card isDark={isDark} className="p-6">
        <SectionHeader icon={Shield} title="آخر تغييرات الأدوار" isDark={isDark} />

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

                <Badge tone="purple" isDark={isDark}>
                  {item.changeType}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

const DashboardError = ({ isDark, error, onRetry }) => {
  return (
    <div
      className={`min-h-screen p-6 flex items-center justify-center ${
        isDark ? "bg-gray-900" : "bg-red-50"
      }`}
    >
      <Card isDark={isDark} className="p-8 max-w-xl w-full text-center">
        <div
          className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5 ${
            isDark ? "bg-red-900/30" : "bg-red-100"
          }`}
        >
          <AlertTriangle className="text-red-500" size={36} />
        </div>

        <h2 className={`text-2xl font-bold mb-3 ${isDark ? "text-white" : "text-gray-900"}`}>
          حدث خطأ أثناء تحميل الداشبورد
        </h2>

        <p className={`mb-6 ${isDark ? "text-gray-300" : "text-gray-600"}`}>
          {error?.message || "تعذر جلب البيانات"}
        </p>

        <button
          onClick={onRetry}
          className="inline-flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-semibold"
        >
          <RefreshCw size={18} />
          إعادة المحاولة
        </button>
      </Card>
    </div>
  )
}

const Dashboard = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { t, i18n } = useTranslation()
  const { mymode } = useSelector((state) => state.mode)

  const {
    dashboardData,
    loadingGetDashboardData,
    dashboardError,
    lastUpdated,
  } = useSelector((state) => state.reports)

  const isDark = mymode === "dark"
  const isRTL = i18n.language === "ar"

  useEffect(() => {
    dispatch(getDashboardData())

    return () => {
      dispatch(clearDashboardError())
    }
  }, [dispatch])

  const handleRefresh = () => {
    dispatch(getDashboardData())
  }

  if (loadingGetDashboardData && !dashboardData) {
    return <LoadingGetData text={t("dashboard.loading")} />
  }

  if (dashboardError && !dashboardData) {
    return (
      <DashboardError
        isDark={isDark}
        error={dashboardError}
        onRetry={handleRefresh}
      />
    )
  }

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
          loading={loadingGetDashboardData}
          onRefresh={handleRefresh}
        />

        <OverviewStats data={dashboardData} isDark={isDark} />

        <NeedsAttention data={dashboardData} isDark={isDark} />

        <RosterOverview data={dashboardData} isDark={isDark} />

        <OperationsOverview data={dashboardData} isDark={isDark} />

        <ManagementCoverage
          data={dashboardData}
          isDark={isDark}
          lang={i18n.language}
          navigate={navigate}
        />

        <ConfigurationSummary
          data={dashboardData}
          isDark={isDark}
          lang={i18n.language}
        />

        <RecentActivity data={dashboardData} isDark={isDark} />

        <DashboardCharts
          dashboardData={dashboardData}
          isDark={isDark}
          t={t}
        />
      </div>
    </div>
  )
}

export default Dashboard