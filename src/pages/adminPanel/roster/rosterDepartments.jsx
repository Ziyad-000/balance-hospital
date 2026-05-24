import React, { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"

import { useTranslation } from "react-i18next"
import {
  Clock,
  ArrowRight,
  Building2,
  Eye,
  Users,
  AlertCircle,
  EyeOff,
  ChevronUp,
} from "lucide-react"
import {
  getRosterDepartments,
  getDepartmentShifts,
  deleteDepartmentShift,
  getShiftContractingTypes,
  deleteShiftContractingType,
} from "../../../state/act/actRosterManagement"
import LoadingGetData from "../../../components/LoadingGetData"
import ModalShiftsDepartment from "../../../components/modals/ModalShiftsDepartment"
import ModalContractingTypesDepartment from "../../../components/modals/ModalContractingTypeShift"
import ModalEditContractingTypeModal from "../../../components/modals/ModalUpdateContractingTypeShift"
import { AddDepartmentButton } from "../../../components/modals/AddDepartment"
import { toast } from "react-toastify"
import Swal from "sweetalert2"
import { getPageTheme, swalTheme } from "../../../utils/themeClasses"

function RosterDepartments() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { t, i18n } = useTranslation()
  const theme = getPageTheme()

  const currentLang = i18n.language
  const isRTL = currentLang === "ar"

  const [deleteIdx, setDeleteIdx] = useState(false)
  const [deleteContractingIdx, setdDleteContractingIdx] = useState(false)

  const {
    rosterDepartments,
    loading,
    selectedDepartmentShifts,
    shiftContractingTypes,
  } = useSelector((state) => state.rosterManagement)

  const [selectedContractingType, setSelectedContractingType] = useState(null)
  const [editModalOpen, setEditModalOpen] = useState(false)

  const [selectedDepartment, setSelectedDepartment] = useState(null)
  const [activeDepartment, setActiveDepartment] = useState(null)
  const [selectedShift, setSelectedShift] = useState(null)
  const [isShiftModalOpen, setIsShiftModalOpen] = useState(false)
  const [isContractingModalOpen, setIsContractingModalOpen] = useState(false)
  const [loadingShifts, setLoadingShifts] = useState(false)
  const [loadingContractingTypes, setLoadingContractingTypes] = useState({})
  const [visibleContractingTypes, setVisibleContractingTypes] = useState({})

  const iconColors = {
    building: "text-green-600 dark:text-green-400",
    clock: "text-purple-600 dark:text-purple-400",
    view: "text-blue-600 dark:text-blue-400",
    users: "text-orange-600 dark:text-orange-400",
    success: "text-green-600 dark:text-green-400",
    danger: "text-red-600 dark:text-red-400",
    warning: "text-yellow-600 dark:text-yellow-400",
    muted: "text-[var(--color-text-muted)]",
  }

  const iconBg = {
    building: "bg-green-100 dark:bg-green-900/30",
    clock: "bg-purple-100 dark:bg-purple-900/30",
    view: "bg-blue-100 dark:bg-blue-900/30",
    success: "bg-green-100 dark:bg-green-900/30",
  }

  const handleUpdateContractingType = (contractingType) => {
    setSelectedContractingType(contractingType)
    setEditModalOpen(true)
  }

  const goToRosterData = () => {
    const id = localStorage.getItem("rosterId")

    if (id) {
      navigate(`/admin-panel/rosters/${id}`)
    } else {
      navigate("/admin-panel/rosters")
    }
  }

  const handleDeleteContractingType = (contractingTypeId, index) => {
    dispatch(deleteShiftContractingType({ contractingId: contractingTypeId }))
      .unwrap()
      .then(() => {
        toast.success(t("roster.success.removeContracting"), {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        })

        setdDleteContractingIdx(index)
      })
      .catch((error) => {
        Swal.fire({
          title: t("roster.contractingTypes.error.removeTitle"),
          text:
            currentLang === "en"
              ? error?.response?.data?.messageEn ||
                error?.message ||
                t("roster.contractingTypes.error.renoveMessage")
              : error?.response?.data?.messageAr ||
                error?.message ||
                t("roster.contractingTypes.error.renoveMessage"),
          icon: "error",
          confirmButtonText: t("common.ok"),
          ...swalTheme,
          confirmButtonColor: "var(--color-danger)",
        })
      })
  }

  useEffect(() => {
    const storedRosterId = localStorage.getItem("rosterId") || ""

    if (storedRosterId) {
      dispatch(getRosterDepartments({ rosterId: storedRosterId }))
        .unwrap()
        .then((response) => {
          const firstDepartment = response.data?.[0]

          if (firstDepartment) {
            dispatch(
              getDepartmentShifts({
                rosterDepartmentId: firstDepartment.id,
              })
            )

            setActiveDepartment(firstDepartment)
          }
        })
        .catch(() => {})
    }
  }, [dispatch])

  const openShiftModal = (department) => {
    setSelectedDepartment(department)
    setIsShiftModalOpen(true)
  }

  const closeShiftModal = () => {
    setSelectedDepartment(null)
    setIsShiftModalOpen(false)
  }

  const openContractingModal = (shift) => {
    setSelectedShift(shift)
    setIsContractingModalOpen(true)
  }

  const closeContractingModal = () => {
    setSelectedShift(null)
    setIsContractingModalOpen(false)
  }

  const closeEditContractingModal = () => {
    setSelectedContractingType(null)
    setEditModalOpen(false)
  }

  const handleDepartmentClick = async (department) => {
    if (activeDepartment && activeDepartment.id === department.id) {
      return
    }

    setActiveDepartment(department)
    setLoadingShifts(true)

    try {
      await dispatch(
        getDepartmentShifts({ rosterDepartmentId: department.id })
      ).unwrap()
    } catch {
      // handled by redux state/toasts if configured
    } finally {
      setLoadingShifts(false)
    }
  }

  const handleViewContractingTypes = async (shift) => {
    localStorage.setItem("currentShiftId", shift.id)

    const isCurrentlyVisible = visibleContractingTypes[shift.id]

    if (isCurrentlyVisible) {
      setVisibleContractingTypes((prev) => ({ ...prev, [shift.id]: false }))
      return
    }

    setLoadingContractingTypes((prev) => ({ ...prev, [shift.id]: true }))

    try {
      await dispatch(
        getShiftContractingTypes({ departmentShiftId: shift.id })
      ).unwrap()

      setVisibleContractingTypes((prev) => ({ ...prev, [shift.id]: true }))
    } catch {
      // handled by redux state/toasts if configured
    } finally {
      setLoadingContractingTypes((prev) => ({ ...prev, [shift.id]: false }))
    }
  }

  const handleDeleteShift = (shift, index) => {
    setDeleteIdx(index)
    dispatch(deleteDepartmentShift(shift.id))
  }

  const navigateToNextPhase = () => {
    navigate(`/admin-panel/rosters/working-hours/generate`)
  }

  const StatusBadge = ({ active }) => (
    <span
      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
        active
          ? "bg-[var(--color-success-soft)] text-[var(--color-success)] border border-[var(--color-success)]/20"
          : "bg-[var(--color-danger-soft)] text-[var(--color-danger)] border border-[var(--color-danger)]/20"
      }`}
    >
      {active
        ? t("roster.departmentss.active") || "Active"
        : t("roster.departmentss.inactive") || "Inactive"}
    </span>
  )

  if (loading.fetch) {
    return <LoadingGetData text={t("gettingData.rosterDepartments")} />
  }

  return (
    <div className={theme.page} dir={isRTL ? "rtl" : "ltr"}>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6 gap-4">
            <div>
              <h1 className="text-3xl font-bold text-[var(--color-text)]">
                {t("roster.departmentss.title")}
              </h1>

              <p className="text-sm text-[var(--color-text-muted)] mt-1">
                {t("roster.departmentss.subtitle")}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <div className="p-4 rounded-xl border bg-[var(--color-success-soft)] border-[var(--color-success)]/20">
                <div className="flex items-start">
                  <AlertCircle
                    className={`mt-0.5 ${iconColors.success} ${
                      isRTL ? "ml-3" : "mr-3"
                    }`}
                    size={20}
                  />

                  <div>
                    <p className="text-sm text-[var(--color-success)] mt-1">
                      {t("roster.changesInfo")}
                    </p>
                  </div>
                </div>
              </div>

              <AddDepartmentButton />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {rosterDepartments?.map((department) => {
            const isActive =
              activeDepartment && activeDepartment.id === department.id

            return (
              <div key={department.id} className="flex flex-col">
                <div
                  onClick={() => handleDepartmentClick(department)}
                  className={`${theme.card} ${
                    isActive
                      ? "ring-2 ring-[var(--color-primary)] border-[var(--color-primary)]"
                      : ""
                  } transition-all duration-200 hover:shadow-[var(--shadow-lg)] cursor-pointer hover:scale-[1.02]`}
                >
                  <div className="p-4">
                    <div className="flex items-center mb-3">
                      <div className={`p-2 rounded-xl ${iconBg.building}`}>
                        <Building2
                          size={20}
                          className={iconColors.building}
                        />
                      </div>

                      <div className={isRTL ? "mr-3" : "ml-3"}>
                        <h3 className="text-base font-semibold text-[var(--color-text)]">
                          {currentLang === "ar"
                            ? department.nameArabic || department.nameEnglish
                            : department.nameEnglish || department.nameArabic}
                        </h3>
                      </div>
                    </div>

                    {department.notes && (
                      <div className="mb-3">
                        <p className="text-xs text-[var(--color-text-muted)] line-clamp-2">
                          {department.notes}
                        </p>
                      </div>
                    )}

                    <div className="mb-3">
                      <p className="text-xs text-[var(--color-text-muted)]">
                        {t("roster.departmentss.createdAt")}:{" "}
                        {new Date(department.createdAt).toLocaleDateString(
                          currentLang === "ar" ? "ar-EG" : "en-US"
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4">
                  <button
                    type="button"
                    onClick={() => openShiftModal(department)}
                    className="w-full inline-flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
                  >
                    <Clock size={16} className={isRTL ? "ml-2" : "mr-2"} />
                    {t("roster.departmentss.addShiftHours")}
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        {activeDepartment && (
          <div className={`${theme.card} mt-8`}>
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4 text-[var(--color-text)]">
                {t("roster.departmentss.shifts") || "Department Shifts"}
              </h2>

              <h3 className="mb-6">
                <span className="text-[var(--color-text-muted)]">
                  {t("roster.departmentss.department") || "Department"}{" "}
                </span>

                <span className="text-[var(--color-text)]">
                  {currentLang === "ar"
                    ? activeDepartment.nameArabic || activeDepartment.nameEnglish
                    : activeDepartment.nameEnglish ||
                      activeDepartment.nameArabic}
                </span>
              </h3>

              {loadingShifts && (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--color-primary)]" />

                  <span
                    className={`${
                      isRTL ? "mr-3" : "ml-3"
                    } text-[var(--color-text-muted)]`}
                  >
                    {t("roster.departmentss.loadingShifts") ||
                      "Loading shifts..."}
                  </span>
                </div>
              )}

              {!loadingShifts &&
                (!selectedDepartmentShifts ||
                  selectedDepartmentShifts.length === 0) && (
                  <div className="text-center py-6 text-[var(--color-text-muted)]">
                    <Clock
                      size={32}
                      className="mx-auto mb-2 text-[var(--color-text-soft)]"
                    />

                    <p className="text-sm">
                      {t("roster.departmentss.noShifts") ||
                        "No shifts found for this department"}
                    </p>
                  </div>
                )}

              {!loadingShifts &&
                selectedDepartmentShifts &&
                selectedDepartmentShifts.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {selectedDepartmentShifts.map((shift, index) => (
                      <div key={shift.id || index} className={`${theme.cardSoft} p-6`}>
                        <div className="flex justify-between items-start mb-4 gap-3">
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg text-[var(--color-text)]">
                              {currentLang === "ar"
                                ? shift.shiftTypeNameAr || shift.shiftTypeName
                                : shift.shiftTypeNameEn || shift.shiftTypeName}
                            </h3>

                            <p className="text-sm text-[var(--color-primary)]">
                              {shift.shiftPeriod}
                            </p>
                          </div>

                          <span className="text-sm px-3 py-1 rounded-full font-semibold bg-[var(--color-success-soft)] text-[var(--color-success)] border border-[var(--color-success)]/20">
                            {shift.shiftHours}h
                          </span>
                        </div>

                        <div className="space-y-3 mb-4">
                          <div className="flex justify-between text-sm gap-3">
                            <span className="text-[var(--color-text-muted)]">
                              {t("roster.departmentss.status") || "Status"}:
                            </span>

                            <StatusBadge active={shift.isActive} />
                          </div>

                          <div className="flex justify-between text-sm gap-3">
                            <span className="text-[var(--color-text-muted)]">
                              {t("roster.departmentss.configured") ||
                                "Configured"}
                              :
                            </span>

                            <span className="text-[var(--color-text)]">
                              {shift.hasCompleteConfiguration
                                ? t("roster.departmentss.yes") || "Yes"
                                : t("roster.departmentss.no") || "No"}
                            </span>
                          </div>
                        </div>

                        {shiftContractingTypes[shift.id] &&
                          visibleContractingTypes[shift.id] && (
                            <div className="mb-4 rounded-xl border shadow-[var(--shadow-sm)] transition-all duration-300 bg-[var(--color-surface)] border-[var(--color-border)]">
                              <div className="px-4 py-3 border-b border-[var(--color-border)] bg-[var(--color-surface-muted)]">
                                <div className="flex items-center justify-between">
                                  <h4 className="text-sm font-semibold text-[var(--color-text)]">
                                    {t("roster.contractingTypes.title") ||
                                      "Contracting Types"}
                                  </h4>

                                  <ChevronUp
                                    title={
                                      t(
                                        "roster.contractingTypes.hideContractingTypes"
                                      ) || "Hide Contracting Types"
                                    }
                                    onClick={() =>
                                      handleViewContractingTypes(shift)
                                    }
                                    size={16}
                                    className="cursor-pointer text-[var(--color-text-muted)]"
                                  />
                                </div>
                              </div>

                              <div className="p-4">
                                <div className="space-y-3">
                                  {shiftContractingTypes[shift.id].map(
                                    (contractingType, contractingIndex) => (
                                      <div
                                        key={contractingType.id}
                                        className="p-3 rounded-lg border transition-colors bg-[var(--color-bg-soft)] border-[var(--color-border)] hover:bg-[var(--color-surface-muted)]"
                                      >
                                        <div className="flex items-center justify-between gap-3">
                                          <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between mb-1">
                                              <h5 className="text-sm font-semibold truncate text-[var(--color-text)]">
                                                {currentLang === "ar"
                                                  ? contractingType.contractingTypeNameAr ||
                                                    contractingType.contractingTypeName
                                                  : contractingType.contractingTypeNameEn ||
                                                    contractingType.contractingTypeName}
                                              </h5>
                                            </div>

                                            <p className="text-xs text-[var(--color-text-muted)]">
                                              <span>
                                                {
                                                  contractingType.defaultRequiredDoctors
                                                }
                                                -
                                                {
                                                  contractingType.defaultMaxDoctors
                                                }{" "}
                                                docs
                                              </span>
                                            </p>
                                          </div>

                                          <div
                                            className={`flex items-center gap-2 ${
                                              isRTL ? "mr-3" : "ml-3"
                                            }`}
                                          >
                                            <button
                                              type="button"
                                              onClick={() =>
                                                handleUpdateContractingType(
                                                  contractingType
                                                )
                                              }
                                              className="p-2 rounded-md transition-all duration-200 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                                              title="Update contracting type"
                                            >
                                              <svg
                                                className="w-4 h-4"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                              >
                                                <path
                                                  strokeLinecap="round"
                                                  strokeLinejoin="round"
                                                  strokeWidth={2}
                                                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                                />
                                              </svg>
                                            </button>

                                            <button
                                              type="button"
                                              onClick={() =>
                                                handleDeleteContractingType(
                                                  contractingType.id,
                                                  contractingIndex
                                                )
                                              }
                                              disabled={
                                                loading.deleteShiftContractingType &&
                                                deleteContractingIdx ===
                                                  contractingIndex
                                              }
                                              className="p-2 rounded-md transition-all duration-200 disabled:opacity-50 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                                              title="Delete contracting type"
                                            >
                                              <svg
                                                className="w-4 h-4"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                              >
                                                <path
                                                  strokeLinecap="round"
                                                  strokeLinejoin="round"
                                                  strokeWidth={2}
                                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                                />
                                              </svg>
                                            </button>
                                          </div>
                                        </div>
                                      </div>
                                    )
                                  )}
                                </div>
                              </div>
                            </div>
                          )}

                        <div className="space-y-2">
                          <button
                            type="button"
                            onClick={() => handleViewContractingTypes(shift)}
                            disabled={loadingContractingTypes[shift.id]}
                            className={`w-full inline-flex items-center justify-center px-3 py-2 text-white text-sm rounded-lg transition-colors disabled:opacity-50 ${
                              visibleContractingTypes[shift.id]
                                ? "bg-gray-600 hover:bg-gray-700"
                                : "bg-blue-600 hover:bg-blue-700"
                            }`}
                          >
                            {loadingContractingTypes[shift.id] ? (
                              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white" />
                            ) : (
                              <>
                                {visibleContractingTypes[shift.id] ? (
                                  <>
                                    <EyeOff
                                      size={14}
                                      className={isRTL ? "ml-1" : "mr-1"}
                                    />
                                    {t(
                                      "roster.contractingTypes.hideContractingTypes"
                                    ) || "Hide Contracting Types"}
                                  </>
                                ) : (
                                  <>
                                    <Eye
                                      size={14}
                                      className={isRTL ? "ml-1" : "mr-1"}
                                    />
                                    {t(
                                      "roster.contractingTypes.viewContractingTypes"
                                    ) || "View Contracting Types"}
                                  </>
                                )}
                              </>
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={() => openContractingModal(shift)}
                            className="w-full inline-flex items-center justify-center px-3 py-2 bg-orange-600 text-white text-sm rounded-lg hover:bg-orange-700 transition-colors"
                          >
                            <Users
                              size={14}
                              className={isRTL ? "ml-1" : "mr-1"}
                            />
                            {t("roster.contractingTypes.addContractingTypes") ||
                              "Add Contracting Types"}
                          </button>

                          <div className="flex justify-between items-center gap-3 pt-2 border-t border-[var(--color-border)]">
                            <p className="text-xs text-[var(--color-text-muted)]">
                              {t("roster.departmentss.createdBy") ||
                                "Created by"}
                              : {shift.createdByName}
                            </p>

                            <button
                              type="button"
                              onClick={() => handleDeleteShift(shift, index)}
                              className="inline-flex items-center px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition-colors disabled:opacity-50"
                              disabled={loading.delete && deleteIdx === index}
                            >
                              {t("roster.departmentss.delete") || "Delete"}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
            </div>
          </div>
        )}

        {!rosterDepartments || rosterDepartments.length === 0 ? (
          <div className={`${theme.card} text-center py-12`}>
            <Building2
              size={48}
              className="mx-auto mb-4 text-[var(--color-text-soft)]"
            />

            <h3 className="text-lg font-semibold mb-2 text-[var(--color-text)]">
              {t("roster.departmentss.noDepartments")}
            </h3>

            <p className="text-[var(--color-text-muted)]">
              {t("roster.departmentss.noDepartmentsMessage")}
            </p>
          </div>
        ) : null}
      </div>

      {isShiftModalOpen && (
        <ModalShiftsDepartment
          selectedDepartment={selectedDepartment}
          onClose={closeShiftModal}
        />
      )}

      {isContractingModalOpen && (
        <ModalContractingTypesDepartment
          selectedShift={selectedShift}
          onClose={closeContractingModal}
        />
      )}

      {editModalOpen && (
        <ModalEditContractingTypeModal
          selectedShift={selectedShift}
          selectedContractingType={selectedContractingType}
          onClose={closeEditContractingModal}
        />
      )}

      <div className="max-w-7xl mx-auto mt-10">
        <div
          className={`flex flex-col sm:flex-row ${
            isRTL
              ? "space-y-3 sm:space-y-0 sm:space-x-reverse sm:space-x-3"
              : "space-y-3 sm:space-y-0 sm:space-x-3"
          }`}
        >
          <button
            type="button"
            onClick={goToRosterData}
            className={theme.secondaryButton}
          >
            <Eye size={18} className={isRTL ? "ml-2" : "mr-2"} />
            {t("roster.actions.view") || "Roster Data"}
          </button>

          <button
            type="button"
            onClick={navigateToNextPhase}
            className="flex-1 inline-flex items-center justify-center px-5 py-3 rounded-lg font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors"
          >
            {t("roster.departmentss.nextPhase") || "Next Step"}
            <ArrowRight
              size={18}
              className={isRTL ? "mr-2 rotate-180" : "ml-2"}
            />
          </button>
        </div>
      </div>
    </div>
  )
}

export default RosterDepartments