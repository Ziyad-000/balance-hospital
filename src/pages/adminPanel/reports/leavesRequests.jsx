// leavesRequests.jsx

import React, { useState } from "react"
import {
  Calendar,
  ChevronDown,
  ChevronRight,
  Clock,
  FileText,
  User,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react"
import { getPageTheme } from "../../../utils/themeClasses"

const CollapsibleLeaveCard = ({ leave, currentLang, t, formatDate }) => {
  const theme = getPageTheme()
  const [isCollapsed, setIsCollapsed] = useState(true)

  const getStatusConfig = (status = "") => {
    switch (status.toLowerCase()) {
      case "approved":
        return {
          color:
            "bg-transparent text-emerald-500 border border-emerald-500 dark:bg-transparent dark:text-emerald-500 dark:border-emerald-500",
          icon: CheckCircle,
          iconClass: "text-emerald-500 dark:text-emerald-500",
          text: t("doctorReport.leaveRecords.approved"),
        }
      case "pending":
        return {
          color:
            "bg-transparent text-amber-500 border border-amber-500 dark:bg-transparent dark:text-amber-500 dark:border-amber-500",
          icon: AlertCircle,
          iconClass: "text-amber-500 dark:text-amber-500",
          text: t("doctorReport.leaveRecords.pending"),
        }
      case "rejected":
        return {
          color:
            "bg-transparent text-red-500 border border-red-500 dark:bg-transparent dark:text-red-500 dark:border-red-500",
          icon: XCircle,
          iconClass: "text-red-500 dark:text-red-500",
          text: t("doctorReport.leaveRecords.rejected"),
        }
      default:
        return {
          color:
            "bg-[var(--color-bg-soft)] text-[var(--color-text-muted)] border border-[var(--color-border)]",
          icon: Clock,
          iconClass: "text-slate-500 dark:text-slate-500",
          text: status,
        }
    }
  }

  const getLocalized = (arValue, enValue) => {
    return currentLang === "en" ? enValue || arValue : arValue || enValue
  }

  const statusConfig = getStatusConfig(leave.status)
  const StatusIcon = statusConfig.icon

  return (
    <div className={`${theme.cardSoft} overflow-hidden`}>
      <button
        type="button"
        className={`w-full p-4 ${theme.hoverRow}`}
        onClick={() => setIsCollapsed((prev) => !prev)}
      >
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <Calendar className="w-5 h-5 text-blue-500 dark:text-blue-500 flex-shrink-0" />

            <div className="flex-1 min-w-0 text-start">
              <div className="font-bold text-[var(--color-text)] truncate">
                {getLocalized(leave.leaveTypeAr, leave.leaveTypeEn)}
              </div>

              <div className="text-xs text-[var(--color-text-muted)]">
                {formatDate(leave.leaveDate)} - {formatDate(leave.leaveEndDate)}{" "}
                ({leave.leaveDays} {t("doctorReport.leaveRecords.days")})
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-shrink-0">
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${statusConfig.color}`}
            >
              <StatusIcon className="w-4 h-4" />
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
              label={t("doctorReport.leaveRecords.startDate")}
              value={formatDate(leave.leaveDate)}
            />

            <InfoBox
              icon={Calendar}
              iconClass="text-emerald-500 dark:text-emerald-500"
              label={t("doctorReport.leaveRecords.endDate")}
              value={formatDate(leave.leaveEndDate)}
            />
          </div>

          <InfoBox
            icon={Clock}
            iconClass="text-violet-500 dark:text-violet-500"
            label={t("doctorReport.leaveRecords.duration")}
            value={`${leave.leaveDays} ${t("doctorReport.leaveRecords.days")}`}
          />

          {leave.reason && (
            <InfoBox
              icon={FileText}
              iconClass="text-orange-500 dark:text-orange-500"
              label={t("doctorReport.leaveRecords.reason")}
              value={leave.reason}
              multiline
            />
          )}

          {leave.status?.toLowerCase() === "approved" && leave.approvedAt && (
            <div className="p-3 rounded-xl bg-transparent dark:bg-transparent border border-emerald-500 dark:border-emerald-500">
              <div className="flex items-center gap-2 mb-1">
                <User className="w-4 h-4 text-emerald-500 dark:text-emerald-500" />
                <span className="text-xs font-bold text-emerald-500 dark:text-emerald-500">
                  {t("doctorReport.leaveRecords.approvedBy")}
                </span>
              </div>

              <div className="text-sm font-bold text-emerald-500 dark:text-emerald-500">
                {getLocalized(leave.approvedByNameAr, leave.approvedByName)}
              </div>

              <div className="text-xs mt-1 text-emerald-500 dark:text-emerald-500">
                {new Date(leave.approvedAt).toLocaleDateString(
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

          <div className="text-xs text-[var(--color-text-muted)]">
            {t("doctorReport.leaveRecords.requestedAt")}:{" "}
            {new Date(leave.requestedAt).toLocaleDateString(
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

export const LeaveRecordsSection = ({
  report,
  currentLang,
  t,
  formatDate,
}) => {
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
          <Calendar className="w-5 h-5 text-blue-500 dark:text-blue-500" />

          <h3 className="text-lg font-extrabold text-[var(--color-text)]">
            {t("doctorReport.leaveRecords.title")}
          </h3>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatBox
            value={report.stats.totalLeaveRequests}
            label={t("doctorReport.leaveRecords.total")}
            tone="total"
          />
          <StatBox
            value={report.stats.approvedLeaves}
            label={t("doctorReport.leaveRecords.approved")}
            tone="approved"
          />
          <StatBox
            value={report.stats.pendingLeaves}
            label={t("doctorReport.leaveRecords.pending")}
            tone="pending"
          />
          <StatBox
            value={report.stats.rejectedLeaves}
            label={t("doctorReport.leaveRecords.rejected")}
            tone="rejected"
          />
        </div>
      </div>

      {report.leaveRecords && report.leaveRecords.length > 0 ? (
        <div className="space-y-3">
          {report.leaveRecords.map((leave) => (
            <CollapsibleLeaveCard
              key={leave.leaveId}
              leave={leave}
              currentLang={currentLang}
              t={t}
              formatDate={formatDate}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <Calendar className="w-12 h-12 mx-auto mb-3 text-slate-5000 dark:text-slate-500" />
          <p className="text-sm text-[var(--color-text-muted)]">
            {t("doctorReport.leaveRecords.noRecords")}
          </p>
        </div>
      )}
    </div>
  )
}

export default LeaveRecordsSection