// components/dashboard/stateCard.jsx

export const StatCard = ({ icon: Icon, label, value, color = "blue", subtitle, onClick }) => {
  const toneMap = {
    blue: {
      wrapper: "border-blue-500 text-blue-500",
      value: "text-blue-500",
    },
    green: {
      wrapper: "border-emerald-500 text-emerald-500",
      value: "text-emerald-500",
    },
    emerald: {
      wrapper: "border-emerald-500 text-emerald-500",
      value: "text-emerald-500",
    },
    purple: {
      wrapper: "border-violet-500 text-violet-500",
      value: "text-violet-500",
    },
    violet: {
      wrapper: "border-violet-500 text-violet-500",
      value: "text-violet-500",
    },
    orange: {
      wrapper: "border-orange-500 text-orange-500",
      value: "text-orange-500",
    },
    red: {
      wrapper: "border-red-500 text-red-500",
      value: "text-red-500",
    },
    yellow: {
      wrapper: "border-amber-500 text-amber-500",
      value: "text-amber-500",
    },
    amber: {
      wrapper: "border-amber-500 text-amber-500",
      value: "text-amber-500",
    },
    slate: {
      wrapper: "border-slate-500 text-slate-500",
      value: "text-slate-500",
    },
  }

  const tone = toneMap[color] || toneMap.blue

  return (
    <div
      onClick={onClick}
      className={`rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-sm transition-all duration-200 hover:shadow-lg ${
        onClick ? "cursor-pointer" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-black text-[var(--color-text-muted)]">
            {label}
          </p>

          <p className={`mt-1 truncate text-2xl font-black tracking-tight ${tone.value}`}>
            {value ?? 0}
          </p>

          {subtitle && (
            <p className="mt-1 truncate text-xs font-bold text-[var(--color-text-muted)]">
              {subtitle}
            </p>
          )}
        </div>

        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border-2 bg-transparent ${tone.wrapper}`}
        >
          {Icon && <Icon className="h-6 w-6" />}
        </div>
      </div>
    </div>
  )
}