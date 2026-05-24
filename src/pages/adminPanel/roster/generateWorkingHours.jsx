import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { Formik, Form, Field } from "formik"
import { toast } from "react-toastify"
import Swal from "sweetalert2"
import i18next from "i18next"
import * as Yup from "yup"
import {
  ArrowLeft,
  RefreshCw,
  Info,
  ArrowRight,
  AlertCircle,
  CheckCircle,
  Building2,
  Clock,
  GraduationCap,
  ChevronDown,
  ChevronRight,
} from "lucide-react"
import {
  addWorkingHours,
  getRosterById,
  getRosterTree,
} from "../../../state/act/actRosterManagement"
import LoadingGetData from "../../../components/LoadingGetData"
import { getPageTheme, swalTheme } from "../../../utils/themeClasses"

function GenerateWorkingHours() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const theme = getPageTheme()

  const currentLang = i18next.language
  const isRTL = currentLang === "ar"

  const [rosterId, setRosterId] = useState(null)
  const [expandedDepartments, setExpandedDepartments] = useState(new Set())
  const [expandedShifts, setExpandedShifts] = useState(new Set())

  const [selectedDepartments, setSelectedDepartments] = useState(new Set())
  const [selectedShifts, setSelectedShifts] = useState(new Set())
  const [selectedDegrees, setSelectedDegrees] = useState(new Set())

  const { selectedRoster, rosterTree, loading } = useSelector(
    (state) => state.rosterManagement
  )

  const iconColors = {
    info: "text-blue-600 dark:text-blue-400",
    refresh: "text-blue-600 dark:text-blue-400",
    building: "text-green-600 dark:text-green-400",
    clock: "text-purple-600 dark:text-purple-400",
    degree: "text-orange-600 dark:text-orange-400",
    success: "text-green-600 dark:text-green-400",
    warning: "text-yellow-600 dark:text-yellow-400",
    danger: "text-red-600 dark:text-red-400",
    muted: "text-[var(--color-text-muted)]",
  }

  const iconBg = {
    info: "bg-blue-100 dark:bg-blue-900/30",
    building: "bg-green-100 dark:bg-green-900/30",
    clock: "bg-purple-100 dark:bg-purple-900/30",
    degree: "bg-orange-100 dark:bg-orange-900/30",
  }

  useEffect(() => {
    const storedRosterId = localStorage.getItem("rosterId")

    if (storedRosterId) {
      setRosterId(storedRosterId)
      dispatch(getRosterById({ rosterId: storedRosterId }))
      dispatch(getRosterTree({ rosterId: storedRosterId }))
    }
  }, [dispatch])

  const validationSchema = Yup.object({
    overwriteExisting: Yup.boolean(),
  })

  const initialValues = {
    overwriteExisting: false,
  }

  const toggleDepartment = (deptId) => {
    const newExpanded = new Set(expandedDepartments)

    if (newExpanded.has(deptId)) {
      newExpanded.delete(deptId)
    } else {
      newExpanded.add(deptId)
    }

    setExpandedDepartments(newExpanded)
  }

  const toggleShift = (shiftId) => {
    const newExpanded = new Set(expandedShifts)

    if (newExpanded.has(shiftId)) {
      newExpanded.delete(shiftId)
    } else {
      newExpanded.add(shiftId)
    }

    setExpandedShifts(newExpanded)
  }

  const handleDepartmentToggle = (departmentId) => {
    const newSelectedDepartments = new Set(selectedDepartments)
    const newSelectedShifts = new Set(selectedShifts)
    const newSelectedDegrees = new Set(selectedDegrees)

    if (newSelectedDepartments.has(departmentId)) {
      newSelectedDepartments.delete(departmentId)

      const dept = rosterTree?.departments?.find(
        (department) => department.departmentId === departmentId
      )

      dept?.shifts?.forEach((shift) => {
        newSelectedShifts.delete(shift.shiftHoursTypeId)

        shift.scientificDegrees?.forEach((degree) => {
          newSelectedDegrees.delete(degree.scientificDegreeId)
        })
      })
    } else {
      newSelectedDepartments.add(departmentId)
    }

    setSelectedDepartments(newSelectedDepartments)
    setSelectedShifts(newSelectedShifts)
    setSelectedDegrees(newSelectedDegrees)
  }

  const handleShiftToggle = (shiftHoursTypeId, departmentId) => {
    const newSelectedDepartments = new Set(selectedDepartments)
    const newSelectedShifts = new Set(selectedShifts)
    const newSelectedDegrees = new Set(selectedDegrees)

    if (newSelectedShifts.has(shiftHoursTypeId)) {
      newSelectedShifts.delete(shiftHoursTypeId)

      const dept = rosterTree?.departments?.find(
        (department) => department.departmentId === departmentId
      )

      const shift = dept?.shifts?.find(
        (item) => item.shiftHoursTypeId === shiftHoursTypeId
      )

      shift?.scientificDegrees?.forEach((degree) => {
        newSelectedDegrees.delete(degree.scientificDegreeId)
      })
    } else {
      newSelectedShifts.add(shiftHoursTypeId)
      newSelectedDepartments.add(departmentId)
    }

    setSelectedDepartments(newSelectedDepartments)
    setSelectedShifts(newSelectedShifts)
    setSelectedDegrees(newSelectedDegrees)
  }

  const handleDegreeToggle = (
    scientificDegreeId,
    shiftHoursTypeId,
    departmentId
  ) => {
    const newSelectedDepartments = new Set(selectedDepartments)
    const newSelectedShifts = new Set(selectedShifts)
    const newSelectedDegrees = new Set(selectedDegrees)

    if (newSelectedDegrees.has(scientificDegreeId)) {
      newSelectedDegrees.delete(scientificDegreeId)
    } else {
      newSelectedDegrees.add(scientificDegreeId)
      newSelectedShifts.add(shiftHoursTypeId)
      newSelectedDepartments.add(departmentId)
    }

    setSelectedDepartments(newSelectedDepartments)
    setSelectedShifts(newSelectedShifts)
    setSelectedDegrees(newSelectedDegrees)
  }

  const calculateTotals = () => {
    if (!rosterTree?.departments) {
      return { generated: 0, expected: 0, percent: 0 }
    }

    const totals = rosterTree.departments.reduce(
      (acc, dept) => ({
        generated: acc.generated + dept.generatedCells,
        expected: acc.expected + dept.expectedCells,
      }),
      { generated: 0, expected: 0 }
    )

    return {
      ...totals,
      percent:
        totals.expected > 0 ? (totals.generated / totals.expected) * 100 : 0,
    }
  }

  const getProgressColor = (percent) => {
    if (percent === 100) {
      return {
        text: "text-green-600 dark:text-green-400",
        bg: "bg-green-500",
        badge:
          "bg-[var(--color-success-soft)] text-[var(--color-success)] border border-[var(--color-success)]/20",
      }
    }

    if (percent > 50) {
      return {
        text: "text-yellow-600 dark:text-yellow-400",
        bg: "bg-yellow-500",
        badge:
          "bg-[var(--color-warning-soft)] text-[var(--color-warning)] border border-[var(--color-warning)]/20",
      }
    }

    if (percent > 0) {
      return {
        text: "text-red-600 dark:text-red-400",
        bg: "bg-red-500",
        badge:
          "bg-[var(--color-danger-soft)] text-[var(--color-danger)] border border-[var(--color-danger)]/20",
      }
    }

    return {
      text: "text-[var(--color-text-muted)]",
      bg: "bg-[var(--color-text-muted)]",
      badge:
        "bg-[var(--color-bg-soft)] text-[var(--color-text-muted)] border border-[var(--color-border)]",
    }
  }

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      if (!rosterId) {
        throw new Error(t("roster.workingHourss.error.noRosterId"))
      }

      const generateData = {
        rosterId: parseInt(rosterId),
        departmentIds:
          selectedDepartments.size > 0 ? Array.from(selectedDepartments) : null,
        shiftHoursTypeIds:
          selectedShifts.size > 0 ? Array.from(selectedShifts) : null,
        scientificDegreeIds:
          selectedDegrees.size > 0 ? Array.from(selectedDegrees) : null,
        overwriteExisting: values.overwriteExisting,
      }

      const result = await dispatch(addWorkingHours(generateData)).unwrap()

      await dispatch(getRosterTree({ rosterId }))

      toast.success(
        currentLang === "en"
          ? result.messageEn
          : result.message || t("roster.workingHourss.success.generated"),
        {
          position: "top-right",
          autoClose: 3000,
        }
      )

      if (result.data) {
        Swal.fire({
          title:
            t("roster.workingHourss.success.summaryTitle") ||
            "Generation Complete",
          html: `
            <div style="text-align: ${
              currentLang === "ar" ? "right" : "left"
            }">
              <p><strong>${
                t("roster.workingHourss.summary.added") || "Added"
              }:</strong> ${result.data.addedCount}</p>
              <p><strong>${
                t("roster.workingHourss.summary.updated") || "Updated"
              }:</strong> ${result.data.updatedCount}</p>
              <p><strong>${
                t("roster.workingHourss.summary.skipped") || "Skipped"
              }:</strong> ${result.data.skippedCount}</p>
              <p><strong>${
                t("roster.workingHourss.summary.completion") || "Completion"
              }:</strong> ${result.data.completionPercentage.toFixed(1)}%</p>
            </div>
          `,
          icon: "success",
          confirmButtonText: t("common.ok"),
          ...swalTheme,
          confirmButtonColor: "var(--color-success)",
        })
      }

      navigate(`/admin-panel/rosters/${rosterId}`)
    } catch (error) {
      Swal.fire({
        title: t("roster.workingHourss.error.title"),
        text:
          currentLang === "en"
            ? error?.messageEn ||
              error?.message ||
              t("roster.workingHourss.error.message")
            : error?.message || t("roster.workingHourss.error.message"),
        icon: "error",
        confirmButtonText: t("common.ok"),
        ...swalTheme,
        confirmButtonColor: "var(--color-danger)",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const navigateBack = () => {
    if (rosterId) {
      navigate(`/admin-panel/rosters/departments`)
    } else {
      navigate(`/admin-panel/rosters`)
    }
  }

  if (loading.fetch || loading.getRosterTree) {
    return <LoadingGetData text={t("gettingData.roster")} />
  }

  const totals = calculateTotals()
  const hasExistingData = totals.generated > 0
  const progressColor = getProgressColor(totals.percent)

  return (
    <div className={theme.page} dir={isRTL ? "rtl" : "ltr"}>
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center mb-6">
            <button
              onClick={navigateBack}
              className={`p-2 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg-soft)] transition-colors ${
                isRTL ? "ml-4" : "mr-4"
              }`}
              type="button"
            >
              {currentLang === "en" ? (
                <ArrowLeft size={20} />
              ) : (
                <ArrowRight size={20} />
              )}
            </button>

            <div>
              <h1 className="text-3xl font-bold text-[var(--color-text)]">
                {t("roster.workingHourss.generateTitle") ||
                  "Generate Working Hours"}
              </h1>

              {selectedRoster && (
                <div className="mt-2">
                  <p className="text-lg text-[var(--color-primary)]">
                    {selectedRoster.title}
                  </p>

                  <p className="text-sm text-[var(--color-text-muted)]">
                    {selectedRoster.categoryName} • {selectedRoster.month}/
                    {selectedRoster.year}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {hasExistingData && (
          <div className={`${theme.card} mb-6 p-6`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-[var(--color-text)]">
                {t("roster.workingHourss.overallProgress") ||
                  "Overall Progress"}
              </h3>

              <span className={`text-2xl font-bold ${progressColor.text}`}>
                {totals.percent.toFixed(1)}%
              </span>
            </div>

            <div className="w-full bg-[var(--color-bg-soft)] rounded-full h-4 overflow-hidden">
              <div
                className={`h-4 rounded-full transition-all ${progressColor.bg}`}
                style={{ width: `${Math.min(totals.percent, 100)}%` }}
              />
            </div>

            <p className="text-sm mt-2 text-[var(--color-text-muted)]">
              {totals.generated} / {totals.expected}{" "}
              {t("roster.workingHourss.cellsGenerated") || "cells generated"}
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className={`${theme.card} p-6`}>
            <h2 className="text-xl font-semibold mb-4 text-[var(--color-text)]">
              {t("roster.workingHourss.selectStructure") ||
                "Select Structure to Generate"}
            </h2>

            <div className="mb-4 p-3 rounded-lg border-s-4 border-blue-500 bg-[var(--color-info-soft)]">
              <div className="flex items-start gap-2">
                <Info className={`${iconColors.info} mt-0.5`} size={14} />

                <p className="text-xs text-[var(--color-info)]">
                  {t("roster.workingHourss.hierarchyInfo") ||
                    "Select departments, then shifts, then scientific degrees. Leave empty to generate for all."}
                </p>
              </div>
            </div>

            {rosterTree?.departments?.length === 0 ? (
              <div className="text-center py-8 text-[var(--color-text-muted)]">
                <Info size={48} className="mx-auto mb-4 opacity-50" />

                <p>
                  {t("roster.workingHourss.noStructure") ||
                    "No roster structure found"}
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
                {rosterTree?.departments?.map((dept) => {
                  const deptProgress = getProgressColor(dept.completionPercent)

                  return (
                    <div key={dept.departmentId}>
                      <div className={`${theme.cardSoft} p-3`}>
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2 flex-1">
                            <input
                              type="checkbox"
                              checked={selectedDepartments.has(
                                dept.departmentId
                              )}
                              onChange={() =>
                                handleDepartmentToggle(dept.departmentId)
                              }
                              className="rounded text-blue-600 focus:ring-blue-500"
                            />

                            <button
                              onClick={() =>
                                toggleDepartment(dept.departmentId)
                              }
                              className="flex items-center gap-2 flex-1 text-start text-[var(--color-text)]"
                              type="button"
                            >
                              {expandedDepartments.has(dept.departmentId) ? (
                                <ChevronDown
                                  size={16}
                                  className={iconColors.muted}
                                />
                              ) : (
                                <ChevronRight
                                  size={16}
                                  className={iconColors.muted}
                                />
                              )}

                              <Building2
                                size={16}
                                className={iconColors.building}
                              />

                              <span className="font-semibold">
                                {currentLang === "ar"
                                  ? dept.nameArabic
                                  : dept.nameEnglish}
                              </span>
                            </button>
                          </div>

                          <span
                            className={`text-xs px-2 py-1 rounded-full font-semibold ${deptProgress.badge}`}
                          >
                            {dept.completionPercent.toFixed(0)}%
                          </span>
                        </div>
                      </div>

                      {expandedDepartments.has(dept.departmentId) && (
                        <div
                          className={`${
                            isRTL ? "mr-6" : "ml-6"
                          } mt-2 space-y-2`}
                        >
                          {dept.shifts?.map((shift) => {
                            const shiftProgress = getProgressColor(
                              shift.completionPercent
                            )

                            return (
                              <div key={shift.shiftHoursTypeId}>
                                <div className={`${theme.cardSoft} p-2`}>
                                  <div className="flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-2 flex-1">
                                      <input
                                        type="checkbox"
                                        checked={selectedShifts.has(
                                          shift.shiftHoursTypeId
                                        )}
                                        onChange={() =>
                                          handleShiftToggle(
                                            shift.shiftHoursTypeId,
                                            dept.departmentId
                                          )
                                        }
                                        className="rounded text-blue-600 focus:ring-blue-500"
                                      />

                                      <button
                                        onClick={() =>
                                          toggleShift(shift.shiftHoursTypeId)
                                        }
                                        className="flex items-center gap-2 flex-1 text-start text-[var(--color-text)]"
                                        type="button"
                                      >
                                        {expandedShifts.has(
                                          shift.shiftHoursTypeId
                                        ) ? (
                                          <ChevronDown
                                            size={14}
                                            className={iconColors.muted}
                                          />
                                        ) : (
                                          <ChevronRight
                                            size={14}
                                            className={iconColors.muted}
                                          />
                                        )}

                                        <Clock
                                          size={14}
                                          className={iconColors.clock}
                                        />

                                        <span className="text-sm font-medium">
                                          {currentLang === "ar"
                                            ? shift.nameArabic
                                            : shift.nameEnglish}
                                        </span>
                                      </button>
                                    </div>

                                    <span
                                      className={`text-xs px-2 py-0.5 rounded-full font-semibold ${shiftProgress.badge}`}
                                    >
                                      {shift.completionPercent.toFixed(0)}%
                                    </span>
                                  </div>
                                </div>

                                {expandedShifts.has(
                                  shift.shiftHoursTypeId
                                ) && (
                                  <div
                                    className={`${
                                      isRTL ? "mr-6" : "ml-6"
                                    } mt-1 space-y-1`}
                                  >
                                    {shift.scientificDegrees?.map((degree) => (
                                      <div
                                        key={degree.scientificDegreeId}
                                        className="p-2 rounded-lg text-sm bg-[var(--color-bg-soft)] text-[var(--color-text)] border border-[var(--color-border)]"
                                      >
                                        <div className="flex items-center justify-between gap-3">
                                          <div className="flex items-center gap-2 flex-1">
                                            <input
                                              type="checkbox"
                                              checked={selectedDegrees.has(
                                                degree.scientificDegreeId
                                              )}
                                              onChange={() =>
                                                handleDegreeToggle(
                                                  degree.scientificDegreeId,
                                                  shift.shiftHoursTypeId,
                                                  dept.departmentId
                                                )
                                              }
                                              className="rounded text-blue-600 focus:ring-blue-500"
                                            />

                                            <GraduationCap
                                              size={12}
                                              className={iconColors.degree}
                                            />

                                            <span className="text-xs">
                                              {currentLang === "ar"
                                                ? degree.nameArabic
                                                : degree.nameEnglish}
                                            </span>
                                          </div>

                                          <div className="flex items-center gap-2 text-xs text-[var(--color-text-muted)]">
                                            {degree.hasWorkingHours ? (
                                              <CheckCircle
                                                size={12}
                                                className={iconColors.success}
                                              />
                                            ) : (
                                              <AlertCircle
                                                size={12}
                                                className={iconColors.muted}
                                              />
                                            )}

                                            <span>
                                              {degree.generatedDays}/
                                              {degree.totalDays}
                                            </span>
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          <div className={`${theme.card} p-6`}>
            <h2 className="text-xl font-semibold mb-4 text-[var(--color-text)]">
              {t("roster.workingHourss.generateSettings") ||
                "Generation Settings"}
            </h2>

            <Formik
              initialValues={initialValues}
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
              enableReinitialize
            >
              {({ isSubmitting, values, setFieldValue }) => (
                <Form className="space-y-6">
                  <div className={`${theme.cardSoft} p-4`}>
                    <h3 className="text-sm font-semibold mb-3 text-[var(--color-text)]">
                      {t("roster.workingHourss.selectionSummary") ||
                        "Selection Summary"}
                    </h3>

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between gap-3">
                        <span className="text-[var(--color-text-muted)]">
                          {t("roster.workingHourss.departments") ||
                            "Departments"}
                          :
                        </span>

                        <span className="font-semibold text-[var(--color-text)]">
                          {selectedDepartments.size === 0
                            ? t("common.all") || "All"
                            : selectedDepartments.size}
                        </span>
                      </div>

                      <div className="flex justify-between gap-3">
                        <span className="text-[var(--color-text-muted)]">
                          {t("roster.workingHourss.shifts") || "Shifts"}:
                        </span>

                        <span className="font-semibold text-[var(--color-text)]">
                          {selectedShifts.size === 0
                            ? t("common.all") || "All"
                            : selectedShifts.size}
                        </span>
                      </div>

                      <div className="flex justify-between gap-3">
                        <span className="text-[var(--color-text-muted)]">
                          {t("roster.workingHourss.degrees") ||
                            "Scientific Degrees"}
                          :
                        </span>

                        <span className="font-semibold text-[var(--color-text)]">
                          {selectedDegrees.size === 0
                            ? t("common.all") || "All"
                            : selectedDegrees.size}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className={`${theme.cardSoft} p-4`}>
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <label
                          htmlFor="overwriteExisting"
                          className="text-sm font-semibold text-[var(--color-text)]"
                        >
                          {t("roster.workingHourss.overwriteExisting") ||
                            "Overwrite Existing"}
                        </label>

                        <p className="text-xs mt-1 text-[var(--color-text-muted)]">
                          {t("roster.workingHourss.overwriteHelp") ||
                            "Replace existing working hours with defaults"}
                        </p>
                      </div>

                      <Field
                        type="checkbox"
                        id="overwriteExisting"
                        name="overwriteExisting"
                        className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  {values.overwriteExisting && (
                    <div className="p-4 rounded-lg border-s-4 border-red-500 bg-[var(--color-danger-soft)]">
                      <div className="flex items-start gap-2">
                        <AlertCircle
                          className="text-red-500 mt-0.5"
                          size={16}
                        />

                        <div>
                          <p className="text-sm font-semibold text-[var(--color-danger)]">
                            {t("roster.workingHourss.warningTitle") ||
                              "Warning"}
                          </p>

                          <p className="text-sm mt-1 text-[var(--color-danger)]">
                            {t("roster.workingHourss.overwriteWarning") ||
                              "This will remove all doctor assignments!"}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between pt-6 border-t border-[var(--color-border)]">
                    <button
                      type="button"
                      onClick={navigateBack}
                      className={theme.secondaryButton}
                    >
                      {currentLang === "en" ? (
                        <ArrowLeft size={16} className="mr-2" />
                      ) : (
                        <ArrowRight size={16} className="ml-2" />
                      )}
                      {t("common.back") || "Back"}
                    </button>

                    <button
                      type="submit"
                      disabled={
                        isSubmitting ||
                        loading.addWorkingHours ||
                        rosterTree?.departments?.length === 0
                      }
                      className="inline-flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting || loading.addWorkingHours ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2 rtl:mr-0 rtl:ml-2" />
                          {t("common.generating") || "Generating..."}
                        </>
                      ) : (
                        <>
                          <RefreshCw
                            size={16}
                            className={isRTL ? "ml-2" : "mr-2"}
                          />
                          {t("roster.workingHourss.buttons.generate") ||
                            "Generate Working Hours"}
                        </>
                      )}
                    </button>
                  </div>
                </Form>
              )}
            </Formik>
          </div>
        </div>
      </div>
    </div>
  )
}

export default GenerateWorkingHours