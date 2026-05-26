// swapRequests.jsx

import React, { useState } from "react"
import {
  Users,
  ChevronDown,
  ChevronRight,
  Calendar,
  RefreshCw,
  Clock,
  Building,
  FileText,
} from "lucide-react"
import { getPageTheme } from "../../../utils/themeClasses"

const CollapsibleSwapCard = ({ swap, currentLang, t, formatDate }) => {
  const theme = getPageTheme()
  const [isCollapsed, setIsCollapsed] = useState(true)

  const getStatusConfig = (status = "") => {
    switch (status.toLowerCase()) {
      case "approved":
        return {
          color:
            "bg-transparent text-emerald-500 border border-emerald-500 dark:bg-transparent dark:text-emerald-500 dark:border-emerald-500",
          text: t("doctorReport.swapRecords.approved"),
        }
      case "pending":
        return {
          color:
            "bg-transparent text-amber-500 border border-amber-500 dark:bg-transparent dark:text-amber-500 dark:border-amber-500",
          text: t("doctorReport.swapRecords.pending"),
        }
      case "rejected":
        return {
          color:
            "bg-transparent text-red-500 border border-red-500 dark:bg-transparent dark:text-red-500 dark:border-red-500",
          text: t("doctorReport.swapRecords.rejected"),
        }
      default:
        return {
          color:
            "bg-[var(--color-bg-soft)] text-[var(--color-text-muted)] border border-[var(--color-border)]",
          text: status,
        }
    }
  }

  const getLocalized = (arValue, enValue) => {
    return currentLang === "en" ? enValue || arValue : arValue || enValue
  }

  const statusConfig = getStatusConfig(swap.status)

  return (
    <div className={`${theme.cardSoft} overflow-hidden`}>
      <button
        type="button"
        className={`w-full p-4 ${theme.hoverRow}`}
        onClick={() => setIsCollapsed((prev) => !prev)}
      >
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <RefreshCw className="w-5 h-5 text-violet-500 dark:text-violet-500 flex-shrink-0" />

            <div className="flex-1 min-w-0 text-start">
              <div className="font-bold text-[var(--color-text)] truncate">
                {getLocalized(swap.swapWith, swap.swapWithEn)}
              </div>

              <div className="text-xs text-[var(--color-text-muted)]">
                {formatDate(swap.fromDate)} - {formatDate(swap.toDate)}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-shrink-0">
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold ${statusConfig.color}`}
            >
              {statusConfig.text}
            </span>

            {isCollapsed ? (
              <ChevronRight className="h-5 w-5 text-slate-500 dark:text-slate-500" />
            ) : (
              <ChevronDown className="h-5 w-5 text-slate-500 dark:text-slate-500" />
            )}
          </div>
        </div>
      </button>

      {!isCollapsed && (
        <div className="p-4 space-y-3 border-t border-[var(--color-border)]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <InfoBox
              icon={Calendar}
              iconClass="text-blue-500 dark:text-blue-500"
              label={t("doctorReport.swapRecords.dateRange")}
              value={`${formatDate(swap.fromDate)} - ${formatDate(
                swap.toDate
              )}`}
            />

            <InfoBox
              icon={Clock}
              iconClass="text-emerald-500 dark:text-emerald-500"
              label={t("doctorReport.swapRecords.shiftType")}
              value={getLocalized(swap.shiftTypeNameAr, swap.shiftTypeNameEn)}
            />
          </div>

          <InfoBox
            icon={Building}
            iconClass="text-orange-500 dark:text-orange-500"
            label={t("doctorReport.swapRecords.department")}
            value={getLocalized(swap.departmentNameAr, swap.departmentNameEn)}
          />

          {swap.reason && (
            <InfoBox
              icon={FileText}
              iconClass="text-slate-500 dark:text-slate-500"
              label={t("doctorReport.swapRecords.reason")}
              value={swap.reason}
              multiline
            />
          )}

          <div className="text-xs text-[var(--color-text-muted)]">
            {t("doctorReport.swapRecords.createdAt")}:{" "}
            {new Date(swap.createdAt).toLocaleDateString(
              currentLang === "en" ? "en-US" : "ar-EG",
              {
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              }
            )}
          </div>
        </div>
      )}
    </div>
  )
}

const InfoBox = ({ icon: Icon, iconClass, label, value, multiline = false }) => (
  <div className="p-3 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)]">
    <div className="flex items-center gap-2 mb-1">
      <Icon className={`w-4 h-4 ${iconClass}`} />
      <span className="text-xs font-bold text-[var(--color-text-muted)]">
        {label}
      </span>
    </div>

    <div
      className={`text-sm font-semibold text-[var(--color-text)] ${
        multiline ? "leading-relaxed" : ""
      }`}
    >
      {value}
    </div>
  </div>
)

export const SwapRecordsSection = ({ report, currentLang, t, formatDate }) => {
  const theme = getPageTheme()

  const StatBox = ({ value, label, tone }) => {
    const tones = {
      total: "bg-transparent text-slate-500 dark:bg-transparent dark:text-slate-500",
      approved:
        "bg-transparent text-emerald-500 dark:bg-transparent dark:text-emerald-500",
      pending:
        "bg-transparent text-amber-500 dark:bg-transparent dark:text-amber-500",
      rejected: "bg-transparent text-red-500 dark:bg-transparent dark:text-red-500",
    }

    return (
      <div className={`p-3 rounded-xl text-center ${tones[tone]}`}>
        <div className="text-2xl font-extrabold">{value}</div>
        <div className="text-xs font-semibold opacity-80">{label}</div>
      </div>
    )
  }

  return (
    <div className={`${theme.card} p-6`}>
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-4">
          <Users className="w-5 h-5 text-violet-500 dark:text-violet-500" />

          <h3 className="text-lg font-extrabold text-[var(--color-text)]">
            {t("doctorReport.swapRecords.title")}
          </h3>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatBox
            value={report.stats.totalSwapRequests}
            label={t("doctorReport.swapRecords.total")}
            tone="total"
          />
          <StatBox
            value={report.stats.approvedSwaps}
            label={t("doctorReport.swapRecords.approved")}
            tone="approved"
          />
          <StatBox
            value={report.stats.pendingSwaps}
            label={t("doctorReport.swapRecords.pending")}
            tone="pending"
          />
          <StatBox
            value={report.stats.rejectedSwaps}
            label={t("doctorReport.swapRecords.rejected")}
            tone="rejected"
          />
        </div>
      </div>

      {report.swapRecords && report.swapRecords.length > 0 ? (
        <div className="space-y-3">
          {report.swapRecords.map((swap) => (
            <CollapsibleSwapCard
              key={swap.swapId}
              swap={swap}
              currentLang={currentLang}
              t={t}
              formatDate={formatDate}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <Users className="w-12 h-12 mx-auto mb-3 text-slate-5000 dark:text-slate-500" />
          <p className="text-sm text-[var(--color-text-muted)]">
            {t("doctorReport.swapRecords.noRecords")}
          </p>
        </div>
      )}
    </div>
  )
}

export default SwapRecordsSection