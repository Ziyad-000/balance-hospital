import React, { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import {
  AlertCircle,
  ArrowRight,
  Building2,
  ChevronUp,
  Clock,
  Eye,
  EyeOff,
  Pencil,
  Trash2,
  Users,
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

const iconBoxClass =
  "w-11 h-11 rounded-2xl border-2 bg-transparent flex items-center justify-center shadow-sm"

const buttonBaseClass =
  "inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border transition-colors disabled:opacity-50 disabled:cursor-not-allowed"

const secondaryButtonClass = `${buttonBaseClass} bg-[var(--color-surface)] text-[var(--color-text)] border-[var(--color-border-strong)] hover:bg-[var(--color-success)] hover:text-white hover:border-[var(--color-success)]`

const primaryButtonClass = `${buttonBaseClass} bg-[var(--color-success)] text-white border-[var(--color-success)] hover:bg-[var(--color-success-hover)] hover:border-[var(--color-success-hover)]`

const dangerButtonClass = `${buttonBaseClass} bg-transparent text-red-500 border-red-500 hover:bg-red-600 hover:text-white hover:border-red-600`

const warningButtonClass = `${buttonBaseClass} bg-transparent text-orange-500 border-orange-500 hover:bg-orange-600 hover:text-white hover:border-orange-600`

const iconActionClass =
  "p-2 rounded-xl border bg-transparent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"

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

  const safeDepartments = Array.isArray(rosterDepartments) ? rosterDepartments : []
  const safeShifts = Array.isArray(selectedDepartmentShifts)
    ? selectedDepartmentShifts
    : []

  const getDepartmentName = (department) => {
    if (!department) return "-"

    return currentLang === "ar"
      ? department.nameArabic || department.nameEnglish || "-"
      : department.nameEnglish || department.nameArabic || "-"
  }

  const getShiftName = (shift) => {
    if (!shift) return "-"

    return currentLang === "ar"
      ? shift.shiftTypeNameAr || shift.shiftTypeName || shift.shiftTypeNameEn || "-"
      : shift.shiftTypeNameEn || shift.shiftTypeName || shift.shiftTypeNameAr || "-"
  }

  const getContractingTypeName = (contractingType) => {
    if (!contractingType) return "-"

    return currentLang === "ar"
      ? contractingType.contractingTypeNameAr ||
          contractingType.contractingTypeName ||
          contractingType.contractingTypeNameEn ||
          "-"
      : contractingType.contractingTypeNameEn ||
          contractingType.contractingTypeName ||
          contractingType.contractingTypeNameAr ||
          "-"
  }

  const handleUpdateContractingType = (contractingType) => {
    setSelectedContractingType(contractingType)
    setEditModalOpen(true)
  }

  const goToRosterData = () => {
    const id = localStorage.getItem("rosterId")
    navigate(id ? `/admin-panel/rosters/${id}` : "/admin-panel/rosters")
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

    if (!storedRosterId) return

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
    if (activeDepartment?.id === department.id) return

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
    navigate("/admin-panel/rosters/working-hours/generate")
  }

  const StatusBadge = ({ active }) => (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-extrabold border-2 bg-transparent ${
        active
          ? "text-emerald-500 border-emerald-500"
          : "text-red-500 border-red-500"
      }`}
    >
      {active
        ? t("roster.departmentss.active") || "Active"
        : t("roster.departmentss.inactive") || "Inactive"}
    </span>
  )

  const InlineLoader = ({ text }) => (
    <div className={`${theme.card} p-8 text-center`}>
      <div className="w-9 h-9 mx-auto mb-4 rounded-full border-4 border-[var(--color-border)] border-t-[var(--color-success)] animate-spin" />
      <p className="text-sm font-bold text-[var(--color-text-muted)]">
        {text}
      </p>
    </div>
  )

  const EmptyState = ({ icon: Icon, title, description }) => (
    <div className={`${theme.card} text-center py-12 px-6`}>
      <div className="w-16 h-16 rounded-2xl border-2 border-slate-500 bg-transparent text-slate-500 flex items-center justify-center mx-auto mb-4">
        <Icon size={34} />
      </div>

      <h3 className="text-lg font-extrabold mb-2 text-[var(--color-text)]">
        {title}
      </h3>

      {description && <p className="text-[var(--color-text-muted)]">{description}</p>}
    </div>
  )

  if (loading.fetch) {
    return <LoadingGetData text={t("gettingData.rosterDepartments")} />
  }

  return (
    <div className={theme.page} dir={isRTL ? "rtl" : "ltr"}>
      <div className="max-w-7xl mx-auto space-y-8">
        <div className={`${theme.card} p-6`}>
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-5">
            <div className="flex items-start gap-4">
              <div className={`${iconBoxClass} text-emerald-500 border-emerald-500`}>
                <Building2 size={24} />
              </div>

              <div>
                <h1 className="text-3xl font-extrabold text-[var(--color-text)]">
                  {t("roster.departmentss.title")}
                </h1>

                <p className="text-sm text-[var(--color-text-muted)] mt-1">
                  {t("roster.departmentss.subtitle")}
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <div className="p-4 rounded-2xl border-2 bg-transparent border-emerald-500 text-emerald-500">
                <div className="flex items-start gap-3">
                  <AlertCircle className="mt-0.5 shrink-0" size={20} />

                  <p className="text-sm font-semibold mt-0.5">
                    {t("roster.changesInfo")}
                  </p>
                </div>
              </div>

              <AddDepartmentButton />
            </div>
          </div>
        </div>

        {safeDepartments.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {safeDepartments.map((department) => {
              const isActive = activeDepartment?.id === department.id

              return (
                <div key={department.id} className="flex flex-col gap-3">
                  <button
                    type="button"
                    onClick={() => handleDepartmentClick(department)}
                    className={`${theme.card} text-start p-4 transition-all duration-200 hover:border-emerald-500 hover:shadow-[var(--shadow-md)] ${
                      isActive ? "ring-2 ring-emerald-500 border-emerald-500" : ""
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`${iconBoxClass} text-emerald-500 border-emerald-500`}>
                        <Building2 size={20} />
                      </div>

                      <div className="min-w-0">
                        <h3 className="text-base font-extrabold text-[var(--color-text)] truncate">
                          {getDepartmentName(department)}
                        </h3>

                        {department.code && (
                          <p className="text-xs text-[var(--color-text-muted)] font-mono mt-1">
                            {department.code}
                          </p>
                        )}
                      </div>
                    </div>

                    {department.notes && (
                      <p className="text-xs text-[var(--color-text-muted)] line-clamp-2 mb-3">
                        {department.notes}
                      </p>
                    )}

                    <p className="text-xs text-[var(--color-text-muted)]">
                      {t("roster.departmentss.createdAt")}: {" "}
                      {department.createdAt
                        ? new Date(department.createdAt).toLocaleDateString(
                            currentLang === "ar" ? "ar-EG" : "en-US"
                          )
                        : "-"}
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => openShiftModal(department)}
                    className={`${primaryButtonClass} w-full`}
                  >
                    <Clock size={16} />
                    {t("roster.departmentss.addShiftHours")}
                  </button>
                </div>
              )
            })}
          </div>
        ) : (
          <EmptyState
            icon={Building2}
            title={t("roster.departmentss.noDepartments")}
            description={t("roster.departmentss.noDepartmentsMessage")}
          />
        )}

        {activeDepartment && (
          <div className={`${theme.card} p-6`}>
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
              <div className="flex items-start gap-3">
                <div className={`${iconBoxClass} text-violet-500 border-violet-500`}>
                  <Clock size={22} />
                </div>

                <div>
                  <h2 className="text-xl font-extrabold text-[var(--color-text)]">
                    {t("roster.departmentss.shifts") || "Department Shifts"}
                  </h2>

                  <p className="text-sm text-[var(--color-text-muted)] mt-1">
                    {t("roster.departmentss.department") || "Department"}: {" "}
                    <span className="font-bold text-[var(--color-text)]">
                      {getDepartmentName(activeDepartment)}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {loadingShifts && (
              <InlineLoader
                text={
                  t("roster.departmentss.loadingShifts") || "Loading shifts..."
                }
              />
            )}

            {!loadingShifts && safeShifts.length === 0 && (
              <EmptyState
                icon={Clock}
                title={t("roster.departmentss.noShifts") || "No shifts found"}
                description={
                  currentLang === "ar"
                    ? "لا توجد شفتات مضافة لهذا القسم حتى الآن."
                    : "No shifts have been added for this department yet."
                }
              />
            )}

            {!loadingShifts && safeShifts.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {safeShifts.map((shift, index) => (
                  <div key={shift.id || index} className={`${theme.cardSoft} p-5`}>
                    <div className="flex justify-between items-start mb-4 gap-3">
                      <div className="flex items-start gap-3 min-w-0">
                        <div className={`${iconBoxClass} w-10 h-10 text-violet-500 border-violet-500`}>
                          <Clock size={18} />
                        </div>

                        <div className="min-w-0">
                          <h3 className="font-extrabold text-lg text-[var(--color-text)] truncate">
                            {getShiftName(shift)}
                          </h3>

                          <p className="text-sm text-violet-500 font-semibold">
                            {shift.shiftPeriod || "-"}
                          </p>
                        </div>
                      </div>

                      <span className="text-sm px-3 py-1 rounded-full font-extrabold bg-transparent text-emerald-500 border-2 border-emerald-500">
                        {shift.shiftHours ?? 0}h
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
                          {t("roster.departmentss.configured") || "Configured"}:
                        </span>

                        <span className="font-bold text-[var(--color-text)]">
                          {shift.hasCompleteConfiguration
                            ? t("roster.departmentss.yes") || "Yes"
                            : t("roster.departmentss.no") || "No"}
                        </span>
                      </div>
                    </div>

                    {shiftContractingTypes?.[shift.id] &&
                      visibleContractingTypes[shift.id] && (
                        <div className="mb-4 rounded-2xl border shadow-[var(--shadow-sm)] bg-[var(--color-surface)] border-[var(--color-border)] overflow-hidden">
                          <div className="px-4 py-3 border-b border-[var(--color-border)] bg-[var(--color-surface-muted)]">
                            <div className="flex items-center justify-between gap-3">
                              <h4 className="text-sm font-extrabold text-[var(--color-text)]">
                                {t("roster.contractingTypes.title") ||
                                  "Contracting Types"}
                              </h4>

                              <button
                                type="button"
                                title={
                                  t(
                                    "roster.contractingTypes.hideContractingTypes"
                                  ) || "Hide Contracting Types"
                                }
                                onClick={() => handleViewContractingTypes(shift)}
                                className="p-1 rounded-lg text-[var(--color-text-muted)] hover:text-emerald-500 transition-colors"
                              >
                                <ChevronUp size={16} />
                              </button>
                            </div>
                          </div>

                          <div className="p-4 space-y-3">
                            {shiftContractingTypes[shift.id].map(
                              (contractingType, contractingIndex) => (
                                <div
                                  key={contractingType.id}
                                  className="p-3 rounded-xl border bg-[var(--color-bg-soft)] border-[var(--color-border)] hover:border-emerald-500 transition-colors"
                                >
                                  <div className="flex items-center justify-between gap-3">
                                    <div className="flex-1 min-w-0">
                                      <h5 className="text-sm font-extrabold truncate text-[var(--color-text)]">
                                        {getContractingTypeName(contractingType)}
                                      </h5>

                                      <p className="text-xs text-[var(--color-text-muted)] mt-1">
                                        {contractingType.defaultRequiredDoctors} - {contractingType.defaultMaxDoctors} docs
                                      </p>
                                    </div>

                                    <div className="flex items-center gap-2 shrink-0">
                                      <button
                                        type="button"
                                        onClick={() =>
                                          handleUpdateContractingType(
                                            contractingType
                                          )
                                        }
                                        className={`${iconActionClass} text-blue-500 border-blue-500 hover:bg-blue-600 hover:text-white hover:border-blue-600`}
                                        title="Update contracting type"
                                      >
                                        <Pencil size={15} />
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
                                        className={`${iconActionClass} text-red-500 border-red-500 hover:bg-red-600 hover:text-white hover:border-red-600`}
                                        title="Delete contracting type"
                                      >
                                        <Trash2 size={15} />
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      )}

                    <div className="space-y-2">
                      <button
                        type="button"
                        onClick={() => handleViewContractingTypes(shift)}
                        disabled={loadingContractingTypes[shift.id]}
                        className={`w-full ${
                          visibleContractingTypes[shift.id]
                            ? secondaryButtonClass
                            : primaryButtonClass
                        }`}
                      >
                        {loadingContractingTypes[shift.id] ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
                        ) : visibleContractingTypes[shift.id] ? (
                          <>
                            <EyeOff size={14} />
                            {t("roster.contractingTypes.hideContractingTypes") ||
                              "Hide Contracting Types"}
                          </>
                        ) : (
                          <>
                            <Eye size={14} />
                            {t("roster.contractingTypes.viewContractingTypes") ||
                              "View Contracting Types"}
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => openContractingModal(shift)}
                        className={`${warningButtonClass} w-full`}
                      >
                        <Users size={14} />
                        {t("roster.contractingTypes.addContractingTypes") ||
                          "Add Contracting Types"}
                      </button>

                      <div className="flex justify-between items-center gap-3 pt-3 border-t border-[var(--color-border)]">
                        <p className="text-xs text-[var(--color-text-muted)] truncate">
                          {t("roster.departmentss.createdBy") || "Created by"}: {" "}
                          {shift.createdByName || "-"}
                        </p>

                        <button
                          type="button"
                          onClick={() => handleDeleteShift(shift, index)}
                          className={dangerButtonClass}
                          disabled={loading.delete && deleteIdx === index}
                        >
                          <Trash2 size={14} />
                          {t("roster.departmentss.delete") || "Delete"}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={goToRosterData}
            className={secondaryButtonClass}
          >
            <Eye size={18} />
            {t("roster.actions.view") || "Roster Data"}
          </button>

          <button
            type="button"
            onClick={navigateToNextPhase}
            className={`${primaryButtonClass} flex-1`}
          >
            {t("roster.departmentss.nextPhase") || "Next Step"}
            <ArrowRight size={18} className={isRTL ? "rotate-180" : ""} />
          </button>
        </div>
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
    </div>
  )
}

export default RosterDepartments