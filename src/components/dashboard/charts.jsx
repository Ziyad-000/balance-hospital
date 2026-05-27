// src\components\dashboard\charts.jsx
import { useTranslation } from "react-i18next"
import i18next from "i18next"
import {
  Clock,
  Award,
  Building,
  FileText,
  BarChart3,
  Shield,
  Briefcase,
  PieChart as PieChartIcon,
} from "lucide-react"
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"

const CHART_COLORS = {
  primary: "#2563EB",
  secondary: "#0F766E",
  amber: "#D97706",
  danger: "#DC2626",
  violet: "#7C3AED",
  sky: "#0284C7",
  success: "#16A34A",
  slate: "#475569",
}

const DARK_CHART_COLORS = {
  primary: "#60A5FA",
  secondary: "#2DD4BF",
  amber: "#FBBF24",
  danger: "#F87171",
  violet: "#A78BFA",
  sky: "#38BDF8",
  success: "#4ADE80",
  slate: "#CBD5E1",
}

const getChartPalette = (isDark) => {
  const colors = isDark ? DARK_CHART_COLORS : CHART_COLORS

  return [
    colors.primary,
    colors.secondary,
    colors.amber,
    colors.violet,
    colors.sky,
    colors.success,
    colors.danger,
    colors.slate,
  ]
}

const getTheme = (isDark) => ({
  card: isDark
    ? "bg-slate-900/95 border border-slate-700/80 shadow-lg shadow-black/20"
    : "bg-white border border-slate-200 shadow-lg shadow-slate-200/70",
  headerCard: isDark
    ? "bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 border border-slate-700/80 shadow-lg shadow-black/20"
    : "bg-gradient-to-br from-white via-slate-50 to-blue-50 border border-slate-200 shadow-lg shadow-slate-200/70",
  title: isDark ? "text-slate-50" : "text-slate-900",
  subtitle: isDark ? "text-slate-400" : "text-slate-600",
  legend: isDark ? "text-slate-300" : "text-slate-700",
  tooltip: isDark
    ? "bg-slate-900/95 border border-slate-700 text-slate-100 shadow-xl shadow-black/30"
    : "bg-white/95 border border-slate-200 text-slate-900 shadow-xl shadow-slate-200/80",
  grid: isDark ? "#273449" : "#E2E8F0",
  axis: isDark ? "#94A3B8" : "#64748B",
})

const formatShortName = (value, max = 18) => {
  if (!value) return "-"
  return value.length > max ? `${value.substring(0, max)}...` : value
}

const getLocalizedName = (item, fallback = "-") => {
  if (!item) return fallback

  if (i18next.language === "ar") {
    return item.nameAr || item.nameArabic || item.name || item.titleAr || item.title || fallback
  }

  return item.nameEn || item.nameEnglish || item.name || item.titleEn || item.title || fallback
}

const getShortLocalizedName = (item, max = 18) => formatShortName(getLocalizedName(item), max)


export const DashboardCharts = ({ dashboardData, isDark, t }) => {
  const { i18n } = useTranslation()
  const isRTL = i18n.language === "ar" || i18n.dir() === "rtl"
  const theme = getTheme(isDark)
  const palette = getChartPalette(isDark)

  if (!dashboardData) return null

  const usersDistributionData = [
    {
      name: t("dashboard.sections.users.doctorsCount") || "Doctors",
      value: dashboardData.users?.doctorsCount || 0,
    },
    {
      name: t("dashboard.sections.users.residentsCount") || "Residents",
      value: dashboardData.users?.residentsCount || 0,
    },
    {
      name: t("dashboard.sections.users.pendingUsers") || "Pending",
      value: dashboardData.users?.pendingUsers || 0,
    },
  ].filter((item) => item.value > 0)

  const rolesDistributionData =
    dashboardData.roles?.distribution
      ?.map((role) => ({
        name: i18next.language === "ar" ? role.roleNameAr : role.roleNameEn,
        value: role.activeUsersCount,
      }))
      .filter((item) => item.value > 0) || []

  const categoriesDoctorsData =
    dashboardData.categories?.topActiveCategories?.map((cat) => ({
      name: cat.code,
      id: cat.id,
      doctors: cat.doctorsCount,
      departments: cat.departmentsCount,
      rosters: cat.activeRostersCount,
      fullName: getLocalizedName(cat),
    })) || []

  const departmentsActivityData =
    dashboardData.departments?.topActiveDepartments?.map((dept) => ({
      name: dept.code,
      schedules: dept.activeSchedulesCount,
      doctors: dept.assignedDoctorsCount,
      fullName: getLocalizedName(dept),
    })) || []

  const pendingRequestsData = [
    {
      name:
        t("dashboard.sections.pendingRequests.pendingLeaveRequests") || "Leave",
      value: dashboardData.pendingRequests?.pendingLeaveRequests || 0,
    },
    {
      name:
        t("dashboard.sections.pendingRequests.pendingSwapRequests") || "Swap",
      value: dashboardData.pendingRequests?.pendingSwapRequests || 0,
    },
    {
      name:
        t("dashboard.sections.pendingRequests.pendingDoctorJoinRequests") ||
        "Join",
      value: dashboardData.pendingRequests?.pendingDoctorJoinRequests || 0,
    },
    {
      name: t("dashboard.sections.pendingRequests.urgentRequests") || "Urgent",
      value: dashboardData.pendingRequests?.urgentRequests || 0,
    },
    {
      name:
        t("dashboard.sections.pendingRequests.overdueRequests") || "Overdue",
      value: dashboardData.pendingRequests?.overdueRequests || 0,
    },
  ].filter((item) => item.value > 0)

  const contractingTypesData =
    dashboardData.configurationSummary?.contractingTypes?.map((type) => ({
      name:
        i18next.language === "ar"
          ? getShortLocalizedName(type, 15)
          : getLocalizedName(type).split(" ")[0],
      users: type.usersCount,
      maxHours: type.maxHoursPerWeek,
      fullName: getLocalizedName(type),
    })) || []

  const shiftTypesData =
    dashboardData.configurationSummary?.shiftTypes?.map((shift) => ({
      name:
        i18next.language === "ar"
          ? getShortLocalizedName(shift, 18)
          : getLocalizedName(shift).replace(" Shift", ""),
      usage: shift.usageToday,
      hours: shift.totalTime,
      fullName: getLocalizedName(shift),
    })) || []

  const rostersCompletionData =
    dashboardData.rosters?.activeRosters?.items?.map((roster) => ({
      name:
        i18next.language === "ar"
          ? formatShortName(roster.categoryName, 15)
          : roster.categoryName?.split(" ")[0],
      completion: parseFloat(roster.completionPercent),
      emptyShifts: roster.emptyShiftsCount,
      doctors: roster.assignedDoctorsCount,
      fullName: roster.categoryName,
    })) || []

  const degreesData =
    dashboardData.configurationSummary?.topDegreesByUsers?.map((degree) => ({
      name: getLocalizedName(degree),
      users: degree.usersCount,
    })) || []

  const ChartCard = ({ children, className = "" }) => (
    <div className={`${theme.card} rounded-2xl p-5 sm:p-6 ${className}`}>
      {children}
    </div>
  )

  const ChartTitle = ({ icon: Icon, iconClassName, children }) => (
    <h3 className={`text-lg font-bold mb-5 flex items-center gap-2 ${theme.title}`}>
      <span
        className={`inline-flex h-9 w-9 items-center justify-center rounded-xl ${
          isDark ? "bg-slate-800" : "bg-slate-100"
        }`}
      >
        <Icon className={`w-5 h-5 ${iconClassName}`} />
      </span>
      <span>{children}</span>
    </h3>
  )

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null

    const displayLabel = payload[0]?.payload?.fullName || label

    return (
      <div className={`p-3 rounded-xl ${theme.tooltip}`} dir={isRTL ? "rtl" : "ltr"}>
        <p className="font-semibold mb-2">{displayLabel}</p>
        <div className="space-y-1">
          {payload.map((entry, index) => (
            <div key={`${entry.name}-${index}`} className="flex items-center gap-2 text-sm">
              <span
                className="inline-block h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className={theme.subtitle}>{entry.name}:</span>
              <span className="font-semibold">{entry.value}</span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const CustomYAxisTick = ({ x, y, payload, val = 20 }) => (
    <g transform={`translate(${x},${y})`}>
      <text
        x={isRTL ? val : -10}
        y={0}
        dy={4}
        textAnchor={isRTL ? "start" : "end"}
        fill={theme.axis}
        fontSize={12}
      >
        {payload.value}
      </text>
    </g>
  )

  const CustomXAxisTick = ({ x, y, payload }) => (
    <g transform={`translate(${x},${y})`}>
      <text
        x={0}
        y={0}
        dy={16}
        textAnchor="middle"
        fill={theme.axis}
        fontSize={12}
      >
        {payload.value}
      </text>
    </g>
  )

  const CustomLegend = ({ payload }) => {
    if (!payload?.length) return null

    return (
      <ul className="mt-4 flex flex-wrap justify-center gap-x-5 gap-y-2">
        {payload.map((entry, index) => (
          <li key={`${entry.value}-${index}`} className={`flex items-center gap-2 text-sm ${theme.legend}`}>
            <span
              className="inline-block h-3 w-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span>{entry.value}</span>
          </li>
        ))}
      </ul>
    )
  }

  const PieLegend = ({ data, valueKey = "value" }) => ({ payload }) => {
    if (!payload?.length) return null

    return (
      <ul className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
        {data.map((item, index) => (
          <li key={`${item.name}-${index}`} className={`flex items-center justify-between gap-3 rounded-xl px-3 py-2 text-sm ${isDark ? "bg-slate-800/80" : "bg-slate-50"}`}>
            <span className={`flex min-w-0 items-center gap-2 ${theme.legend}`}>
              <span
                className="inline-block h-3 w-3 shrink-0 rounded-full"
                style={{ backgroundColor: palette[index % palette.length] }}
              />
              <span className="truncate">{item.name}</span>
            </span>
            <span className={`font-bold ${theme.title}`}>{item[valueKey]}</span>
          </li>
        ))}
      </ul>
    )
  }

  const getBarChartMargins = (hasRotatedLabels = false) => {
    if (isRTL) {
      return {
        top: 16,
        right: 72,
        bottom: hasRotatedLabels ? 72 : 36,
        left: 16,
      }
    }

    return {
      top: 16,
      right: 16,
      bottom: hasRotatedLabels ? 72 : 36,
      left: 72,
    }
  }

  const renderPieChart = ({ data, dataKey = "value", height = 310 }) => (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart margin={{ top: 12, right: 12, bottom: 12, left: 12 }}>
        <Pie
          data={data}
          cx="50%"
          cy="44%"
          innerRadius={52}
          outerRadius={86}
          paddingAngle={3}
          dataKey={dataKey}
          stroke={isDark ? "#111827" : "#FFFFFF"}
          strokeWidth={3}
          label={false}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={palette[index % palette.length]} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend content={PieLegend({ data, valueKey: dataKey })} />
      </PieChart>
    </ResponsiveContainer>
  )

  const commonAxisProps = {
    stroke: theme.axis,
    tickLine: false,
    axisLine: false,
  }

  return (
    <div className="space-y-6 mb-6" dir={isRTL ? "rtl" : "ltr"}>
      <div className={`${theme.headerCard} rounded-2xl p-5 sm:p-6`}>
        <div className="flex items-start gap-3">
          <span
            className={`inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${
              isDark ? "bg-blue-500/15" : "bg-blue-100"
            }`}
          >
            <BarChart3 className="w-6 h-6 text-blue-500" />
          </span>
          <div>
            <h2 className={`text-2xl font-bold ${theme.title}`}>
              {t("dashboard.charts.title") || "Dashboard Analytics"}
            </h2>
            <p className={`mt-1 text-sm ${theme.subtitle}`}>
              {t("dashboard.charts.subtitle") ||
                "Visual insights and data analytics"}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {usersDistributionData.length > 0 && (
          <ChartCard>
            <ChartTitle icon={PieChartIcon} iconClassName="text-blue-500">
              {t("dashboard.charts.usersDistribution") || "Users Distribution"}
            </ChartTitle>
            {renderPieChart({ data: usersDistributionData })}
          </ChartCard>
        )}

        {rolesDistributionData.length > 0 && (
          <ChartCard>
            <ChartTitle icon={Shield} iconClassName="text-violet-500">
              {t("dashboard.charts.rolesDistribution") || "Roles Distribution"}
            </ChartTitle>
            {renderPieChart({ data: rolesDistributionData })}
          </ChartCard>
        )}
      </div>

      {categoriesDoctorsData.length > 0 && (
        <ChartCard>
          <ChartTitle icon={Briefcase} iconClassName="text-emerald-500">
            {t("dashboard.charts.categoriesResources") ||
              "Categories - Doctors & Resources"}
          </ChartTitle>
          <ResponsiveContainer width="100%" height={360}>
            <BarChart data={categoriesDoctorsData} margin={getBarChartMargins()}>
              <CartesianGrid strokeDasharray="3 3" stroke={theme.grid} vertical={false} />
              <XAxis dataKey="name" {...commonAxisProps} tick={<CustomXAxisTick />} />
              <YAxis
                {...commonAxisProps}
                tick={<CustomYAxisTick val={20} />}
                orientation={isRTL ? "right" : "left"}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend content={<CustomLegend />} />
              <Bar dataKey="doctors" fill={palette[0]} radius={[8, 8, 0, 0]} name={t("dashboard.charts.doctors") || "Doctors"} />
              <Bar dataKey="departments" fill={palette[1]} radius={[8, 8, 0, 0]} name={t("dashboard.charts.departments") || "Departments"} />
              <Bar dataKey="rosters" fill={palette[3]} radius={[8, 8, 0, 0]} name={t("dashboard.charts.activeRosters") || "Active Rosters"} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      )}

      {departmentsActivityData.length > 0 && (
        <ChartCard>
          <ChartTitle icon={Building} iconClassName="text-blue-500">
            {t("dashboard.charts.departmentsActivity") || "Departments Activity"}
          </ChartTitle>
          <ResponsiveContainer width="100%" height={360}>
            <BarChart data={departmentsActivityData} margin={getBarChartMargins()}>
              <CartesianGrid strokeDasharray="3 3" stroke={theme.grid} vertical={false} />
              <XAxis dataKey="name" {...commonAxisProps} tick={<CustomXAxisTick />} />
              <YAxis
                {...commonAxisProps}
                tick={<CustomYAxisTick val={30} />}
                orientation={isRTL ? "right" : "left"}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend content={<CustomLegend />} />
              <Bar dataKey="schedules" fill={palette[2]} radius={[8, 8, 0, 0]} name={t("dashboard.charts.activeSchedules") || "Active Schedules"} />
              <Bar dataKey="doctors" fill={palette[1]} radius={[8, 8, 0, 0]} name={t("dashboard.charts.assignedDoctors") || "Assigned Doctors"} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {pendingRequestsData.length > 0 && (
          <ChartCard>
            <ChartTitle icon={Clock} iconClassName="text-amber-500">
              {t("dashboard.charts.pendingRequestsBreakdown") ||
                "Pending Requests Breakdown"}
            </ChartTitle>
            {renderPieChart({ data: pendingRequestsData })}
          </ChartCard>
        )}

        {degreesData.length > 0 && (
          <ChartCard>
            <ChartTitle icon={Award} iconClassName="text-violet-500">
              {t("dashboard.charts.degreesDistribution") ||
                "Degrees Distribution"}
            </ChartTitle>
            {renderPieChart({ data: degreesData, dataKey: "users" })}
          </ChartCard>
        )}
      </div>

      {contractingTypesData.length > 0 && (
        <ChartCard>
          <ChartTitle icon={FileText} iconClassName="text-blue-500">
            {t("dashboard.charts.contractingTypes") ||
              "Contracting Types - Users & Max Hours"}
          </ChartTitle>
          <ResponsiveContainer width="100%" height={360}>
            <BarChart data={contractingTypesData} margin={getBarChartMargins(true)}>
              <CartesianGrid strokeDasharray="3 3" stroke={theme.grid} vertical={false} />
              <XAxis
                dataKey="name"
                {...commonAxisProps}
                tick={<CustomXAxisTick />}
                interval={0}
                height={70}
              />
              <YAxis
                {...commonAxisProps}
                tick={<CustomYAxisTick val={20} />}
                orientation={isRTL ? "right" : "left"}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend content={<CustomLegend />} />
              <Bar dataKey="users" fill={palette[0]} radius={[8, 8, 0, 0]} name={t("dashboard.charts.usersCount") || "Users Count"} />
              <Bar dataKey="maxHours" fill={palette[1]} radius={[8, 8, 0, 0]} name={t("dashboard.charts.maxHoursWeek") || "Max Hours/Week"} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      )}

      {shiftTypesData.length > 0 && (
        <ChartCard>
          <ChartTitle icon={Clock} iconClassName="text-amber-500">
            {t("dashboard.charts.shiftTypesUsage") ||
              "Shift Types - Today's Usage"}
          </ChartTitle>
          <ResponsiveContainer width="100%" height={360}>
            <BarChart data={shiftTypesData} margin={getBarChartMargins()}>
              <CartesianGrid strokeDasharray="3 3" stroke={theme.grid} vertical={false} />
              <XAxis dataKey="name" {...commonAxisProps} tick={<CustomXAxisTick />} />
              <YAxis
                {...commonAxisProps}
                tick={<CustomYAxisTick val={20} />}
                orientation={isRTL ? "right" : "left"}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend content={<CustomLegend />} />
              <Bar dataKey="usage" fill={palette[2]} radius={[8, 8, 0, 0]} name={t("dashboard.charts.usageToday") || "Usage Today"} />
              <Bar dataKey="hours" fill={palette[3]} radius={[8, 8, 0, 0]} name={t("dashboard.charts.shiftHours") || "Shift Hours"} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      )}

      {rostersCompletionData.length > 0 && (
        <ChartCard>
          <ChartTitle icon={BarChart3} iconClassName="text-emerald-500">
            {t("dashboard.charts.rostersCompletion") ||
              "Active Rosters - Completion Progress"}
          </ChartTitle>
          <ResponsiveContainer width="100%" height={360}>
            <BarChart data={rostersCompletionData} margin={getBarChartMargins()}>
              <CartesianGrid strokeDasharray="3 3" stroke={theme.grid} vertical={false} />
              <XAxis dataKey="name" {...commonAxisProps} tick={<CustomXAxisTick />} />
              <YAxis
                {...commonAxisProps}
                tick={<CustomYAxisTick val={20} />}
                orientation={isRTL ? "right" : "left"}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend content={<CustomLegend />} />
              <Bar dataKey="completion" fill={palette[1]} radius={[8, 8, 0, 0]} name={t("dashboard.charts.completionPercent") || "Completion %"} />
              <Bar dataKey="emptyShifts" fill={palette[6]} radius={[8, 8, 0, 0]} name={t("dashboard.charts.emptyShifts") || "Empty Shifts"} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      )}
    </div>
  )
}