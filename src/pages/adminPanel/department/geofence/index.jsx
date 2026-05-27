import { useCallback, useEffect, useMemo, useState } from "react"
import { useTranslation } from "react-i18next"
import { useNavigate, useParams } from "react-router-dom"
import Swal from "sweetalert2"
import { toast } from "react-toastify"
import {
  Activity,
  AlertCircle,
  ArrowUpDown,
  BadgeCheck,
  Building,
  CheckCircle,
  Crosshair,
  Edit,
  Globe2,
  ListChecks,
  Loader2,
  MapPin,
  Navigation,
  Plus,
  Radio,
  RefreshCw,
  Save,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Target,
  Trash2,
  Wifi,
  XCircle,
} from "lucide-react"

import LoadingGetData from "../../../../components/LoadingGetData"
import axiosInstance from "../../../../utils/axiosInstance"
import { getPageTheme } from "../../../../utils/themeClasses"

const getAuthHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("token")}`,
  "Content-Type": "application/json",
})

const unwrap = (response) => response?.data?.data ?? response?.data ?? null

const safeArray = (value) => {
  if (Array.isArray(value)) return value
  if (Array.isArray(value?.items)) return value.items
  if (Array.isArray(value?.data)) return value.data
  if (Array.isArray(value?.data?.items)) return value.data.items
  if (Array.isArray(value?.rows)) return value.rows
  return []
}

const getErrorMessage = (error, currentLang, fallbackAr, fallbackEn) => {
  return currentLang === "ar"
    ? error?.response?.data?.messageAr ||
        error?.response?.data?.message ||
        error?.message ||
        fallbackAr
    : error?.response?.data?.messageEn ||
        error?.response?.data?.message ||
        error?.message ||
        fallbackEn
}

const toNumber = (value, fallback = 0) => {
  const n = Number(value)
  return Number.isNaN(n) ? fallback : n
}

const normalizePolicy = (value) => {
  if (value === "Ignore" || value === 0 || value === "0") return 0
  if (value === "Required" || value === 1 || value === "1") return 1
  if (value === "Optional" || value === 2 || value === "2") return 2
  return 0
}

const formatDateTime = (value, lang) => {
  if (!value) return "-"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return String(value)
  return date.toLocaleString(lang || "ar", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  })
}

const GeoFenceApi = {
  createDepartmentFence: (departmentId, data) =>
    axiosInstance.post(`/api/v1/GeoFence/department/${departmentId}`, data, {
      headers: getAuthHeaders(),
    }),

  getDepartmentFences: (departmentId) =>
    axiosInstance.get(`/api/v1/GeoFence/department/${departmentId}`, {
      headers: getAuthHeaders(),
    }),

  getActiveDepartmentFence: (departmentId) =>
    axiosInstance.get(`/api/v1/GeoFence/department/${departmentId}/active`, {
      headers: getAuthHeaders(),
    }),

  getFenceById: (fenceId) =>
    axiosInstance.get(`/api/v1/GeoFence/${fenceId}`, {
      headers: getAuthHeaders(),
    }),

  updateFence: (fenceId, data) =>
    axiosInstance.put(`/api/v1/GeoFence/${fenceId}`, data, {
      headers: getAuthHeaders(),
    }),

  deleteFence: (fenceId) =>
    axiosInstance.delete(`/api/v1/GeoFence/${fenceId}`, {
      headers: getAuthHeaders(),
    }),

  testFence: (fenceId, data) =>
    axiosInstance.post(`/api/v1/GeoFence/test/${fenceId}`, data, {
      headers: getAuthHeaders(),
    }),

  getNearbyFences: (data) =>
    axiosInstance.post("/api/v1/GeoFence/nearby", data, {
      headers: getAuthHeaders(),
    }),

  patchStatus: (fenceId, isActive) =>
    axiosInstance.patch(
      `/api/v1/GeoFence/${fenceId}/status`,
      { isActive },
      { headers: getAuthHeaders() }
    ),

  patchPriority: (fenceId, priority) =>
    axiosInstance.patch(
      `/api/v1/GeoFence/${fenceId}/priority`,
      { priority },
      { headers: getAuthHeaders() }
    ),

  reorderDepartment: (departmentId, items) =>
    axiosInstance.post(
      `/api/v1/GeoFence/department/${departmentId}/reorder`,
      { items },
      { headers: getAuthHeaders() }
    ),

  testDepartmentWithSignals: (departmentId, data) =>
    axiosInstance.post(`/api/v1/GeoFence/department/${departmentId}/test`, data, {
      headers: getAuthHeaders(),
    }),

  getAllGeoFences: () =>
    axiosInstance.get("/api/v1/GeoFence/all", {
      headers: getAuthHeaders(),
    }),
}

function DepartmentGeoFences({
  geofences: externalGeofences,
  loadingGetDepartmentGeofences: externalLoading,
  departmentId: departmentIdProp,
  isRTL,
  currentLang,
  loginRoleResponseDto,
  onNavigate,
}) {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const params = useParams()
  const theme = getPageTheme()

  const lang = currentLang || i18n.language || "ar"
  const rtl = isRTL ?? lang === "ar"
  const departmentId = departmentIdProp || params.depId || params.departmentId || params.id

  const isAdmin = loginRoleResponseDto?.roleNameEn === "System Administrator"

  const [activeTab, setActiveTab] = useState("fences")
  const [fences, setFences] = useState([])
  const [activeFence, setActiveFence] = useState(null)
  const [allFences, setAllFences] = useState([])
  const [nearbyFences, setNearbyFences] = useState([])
  const [selectedFence, setSelectedFence] = useState(null)
  const [testResult, setTestResult] = useState(null)
  const [departmentTestResult, setDepartmentTestResult] = useState(null)
  const [loading, setLoading] = useState({
    list: false,
    active: false,
    all: false,
    action: false,
    test: false,
    nearby: false,
  })
  const [error, setError] = useState(null)

  const [locationForm, setLocationForm] = useState({
    latitude: "",
    longitude: "",
    wifiSsid: "",
    beaconUuid: "",
  })

  const visibleFences = useMemo(() => {
    const base = fences.length ? fences : safeArray(externalGeofences)
    return [...base].sort((a, b) => toNumber(a.priority, 9999) - toNumber(b.priority, 9999))
  }, [fences, externalGeofences])

  const loadDepartmentFences = useCallback(async () => {
    if (!departmentId) return

    setLoading((prev) => ({ ...prev, list: true }))
    setError(null)

    try {
      const response = await GeoFenceApi.getDepartmentFences(departmentId)
      setFences(safeArray(unwrap(response)))
    } catch (err) {
      setError(getErrorMessage(err, lang, "تعذر تحميل السياجات الجغرافية", "Failed to load geofences"))
    } finally {
      setLoading((prev) => ({ ...prev, list: false }))
    }
  }, [departmentId, lang])

  const loadActiveFence = useCallback(async () => {
    if (!departmentId) return

    setLoading((prev) => ({ ...prev, active: true }))

    try {
      const response = await GeoFenceApi.getActiveDepartmentFence(departmentId)
      setActiveFence(unwrap(response))
    } catch {
      setActiveFence(null)
    } finally {
      setLoading((prev) => ({ ...prev, active: false }))
    }
  }, [departmentId])

  const loadAllGeoFences = useCallback(async () => {
    if (!isAdmin) return

    setLoading((prev) => ({ ...prev, all: true }))

    try {
      const response = await GeoFenceApi.getAllGeoFences()
      setAllFences(safeArray(unwrap(response)))
    } catch (err) {
      toast.error(getErrorMessage(err, lang, "تعذر تحميل كل السياجات", "Failed to load all geofences"))
    } finally {
      setLoading((prev) => ({ ...prev, all: false }))
    }
  }, [isAdmin, lang])

  const refreshAll = useCallback(() => {
    loadDepartmentFences()
    loadActiveFence()
    if (isAdmin) loadAllGeoFences()
  }, [loadDepartmentFences, loadActiveFence, loadAllGeoFences, isAdmin])

  useEffect(() => {
    refreshAll()
  }, [refreshAll])

  const goTo = (url) => {
    if (onNavigate) onNavigate(url)
    else navigate(url)
  }

  const getPayloadLocation = () => ({
    latitude: toNumber(locationForm.latitude),
    longitude: toNumber(locationForm.longitude),
    wifiSsid: locationForm.wifiSsid || null,
    beaconUuid: locationForm.beaconUuid || null,
  })

  const validateLocation = () => {
    const lat = toNumber(locationForm.latitude, null)
    const lng = toNumber(locationForm.longitude, null)

    if (lat === null || lng === null || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      toast.error(lang === "ar" ? "أدخل Latitude و Longitude بشكل صحيح" : "Enter a valid Latitude and Longitude")
      return false
    }

    return true
  }

  const handleDelete = async (fence) => {
    const result = await Swal.fire({
      title: lang === "ar" ? "حذف السياج الجغرافي؟" : "Delete GeoFence?",
      text: fence?.name || "",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: lang === "ar" ? "حذف" : "Delete",
      cancelButtonText: lang === "ar" ? "إلغاء" : "Cancel",
      confirmButtonColor: "#ef4444",
    })

    if (!result.isConfirmed) return

    setLoading((prev) => ({ ...prev, action: true }))

    try {
      await GeoFenceApi.deleteFence(fence.id)
      toast.success(lang === "ar" ? "تم حذف السياج الجغرافي" : "GeoFence deleted")
      refreshAll()
    } catch (err) {
      toast.error(getErrorMessage(err, lang, "فشل حذف السياج", "Failed to delete geofence"))
    } finally {
      setLoading((prev) => ({ ...prev, action: false }))
    }
  }

  const handleToggleStatus = async (fence) => {
    setLoading((prev) => ({ ...prev, action: true }))

    try {
      await GeoFenceApi.patchStatus(fence.id, !fence.isActive)
      toast.success(lang === "ar" ? "تم تحديث الحالة" : "Status updated")
      refreshAll()
    } catch (err) {
      toast.error(getErrorMessage(err, lang, "فشل تحديث الحالة", "Failed to update status"))
    } finally {
      setLoading((prev) => ({ ...prev, action: false }))
    }
  }

  const handlePriorityChange = (fenceId, value) => {
    setFences((prev) =>
      prev.map((item) =>
        item.id === fenceId ? { ...item, priority: toNumber(value, item.priority) } : item
      )
    )
  }

  const handleSavePriority = async (fence) => {
    const priority = Math.max(1, Math.min(1000, toNumber(fence.priority, 100)))

    setLoading((prev) => ({ ...prev, action: true }))

    try {
      await GeoFenceApi.patchPriority(fence.id, priority)
      toast.success(lang === "ar" ? "تم تحديث الأولوية" : "Priority updated")
      refreshAll()
    } catch (err) {
      toast.error(getErrorMessage(err, lang, "فشل تحديث الأولوية", "Failed to update priority"))
    } finally {
      setLoading((prev) => ({ ...prev, action: false }))
    }
  }

  const handleSaveReorder = async () => {
    const items = visibleFences.map((fence) => ({
      fenceId: fence.id,
      priority: Math.max(1, Math.min(1000, toNumber(fence.priority, 100))),
    }))

    setLoading((prev) => ({ ...prev, action: true }))

    try {
      await GeoFenceApi.reorderDepartment(departmentId, items)
      toast.success(lang === "ar" ? "تم حفظ ترتيب الأولويات" : "Priorities reordered")
      refreshAll()
    } catch (err) {
      toast.error(getErrorMessage(err, lang, "فشل ترتيب الأولويات", "Failed to reorder priorities"))
    } finally {
      setLoading((prev) => ({ ...prev, action: false }))
    }
  }

  const handleTestFence = async (fence) => {
    if (!validateLocation()) return

    setSelectedFence(fence)
    setLoading((prev) => ({ ...prev, test: true }))
    setTestResult(null)

    try {
      const response = await GeoFenceApi.testFence(fence.id, getPayloadLocation())
      setTestResult(unwrap(response))
      setActiveTab("test")
    } catch (err) {
      toast.error(getErrorMessage(err, lang, "فشل اختبار الموقع", "Failed to test location"))
    } finally {
      setLoading((prev) => ({ ...prev, test: false }))
    }
  }

  const handleDepartmentTest = async () => {
    if (!validateLocation()) return

    setLoading((prev) => ({ ...prev, test: true }))
    setDepartmentTestResult(null)

    try {
      const response = await GeoFenceApi.testDepartmentWithSignals(departmentId, getPayloadLocation())
      setDepartmentTestResult(unwrap(response))
      setActiveTab("test")
    } catch (err) {
      toast.error(getErrorMessage(err, lang, "فشل اختبار القسم", "Failed to test department"))
    } finally {
      setLoading((prev) => ({ ...prev, test: false }))
    }
  }

  const handleNearby = async () => {
    if (!validateLocation()) return

    setLoading((prev) => ({ ...prev, nearby: true }))

    try {
      const response = await GeoFenceApi.getNearbyFences(getPayloadLocation())
      setNearbyFences(safeArray(unwrap(response)))
      setActiveTab("nearby")
    } catch (err) {
      toast.error(getErrorMessage(err, lang, "فشل البحث عن السياجات القريبة", "Failed to search nearby geofences"))
    } finally {
      setLoading((prev) => ({ ...prev, nearby: false }))
    }
  }

  const isBusy = loading.list || loading.action || externalLoading

  const tabs = [
    { id: "fences", labelAr: "سياجات القسم", labelEn: "Department Fences", icon: MapPin, tone: "blue" },
    { id: "active", labelAr: "السياج النشط", labelEn: "Active Fence", icon: ShieldCheck, tone: "emerald" },
    { id: "test", labelAr: "اختبار الموقع", labelEn: "Location Test", icon: Crosshair, tone: "violet" },
    { id: "nearby", labelAr: "القريبة / الكل", labelEn: "Nearby / All", icon: Globe2, tone: "orange" },
  ]

  return (
    <div className={`${theme.card} p-5 space-y-5`}>
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-start gap-3">
          <IconBox icon={MapPin} tone="blue" />
          <div>
            <h2 className="text-2xl font-black text-[var(--color-text)]">
              {t("geoFence.title") || (lang === "ar" ? "السياجات الجغرافية" : "GeoFences")}
            </h2>
            <p className="text-sm font-semibold text-[var(--color-text-muted)] mt-1">
              {lang === "ar"
                ? "إدارة الموقع، الإشارة، الأولوية، الحالة، والاختبار الجغرافي للقسم."
                : "Manage department location, signals, priority, status, and geofence testing."}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <ActionButton icon={RefreshCw} onClick={refreshAll} disabled={isBusy} iconClass="text-slate-500">
            {lang === "ar" ? "تحديث" : "Refresh"}
          </ActionButton>

          {isAdmin && (
            <ActionButton
              icon={Plus}
              onClick={() => goTo(`/admin-panel/department/geofence/${departmentId}`)}
              iconClass="text-emerald-500"
            >
              {lang === "ar" ? "إضافة سياج" : "Create GeoFence"}
            </ActionButton>
          )}
        </div>
      </div>

      {error && (
        <div className="rounded-xl border-2 border-red-500 bg-transparent p-4 text-red-500 font-bold flex items-start gap-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className={`${theme.cardSoft} p-4 border border-[var(--color-border)]`}>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-3">
          <InputBox
            label={lang === "ar" ? "Latitude" : "Latitude"}
            value={locationForm.latitude}
            onChange={(value) => setLocationForm((prev) => ({ ...prev, latitude: value }))}
            placeholder="27.180900"
          />
          <InputBox
            label={lang === "ar" ? "Longitude" : "Longitude"}
            value={locationForm.longitude}
            onChange={(value) => setLocationForm((prev) => ({ ...prev, longitude: value }))}
            placeholder="31.183700"
          />
          <InputBox
            label={lang === "ar" ? "WiFi SSID" : "WiFi SSID"}
            value={locationForm.wifiSsid}
            onChange={(value) => setLocationForm((prev) => ({ ...prev, wifiSsid: value }))}
            placeholder="Hospital-WiFi"
          />
          <InputBox
            label={lang === "ar" ? "Beacon UUID" : "Beacon UUID"}
            value={locationForm.beaconUuid}
            onChange={(value) => setLocationForm((prev) => ({ ...prev, beaconUuid: value }))}
            placeholder="uuid..."
          />
          <div className="flex items-end gap-2">
            <ActionButton icon={Search} onClick={handleNearby} disabled={loading.nearby} iconClass="text-orange-500">
              {lang === "ar" ? "بحث قريب" : "Nearby"}
            </ActionButton>
            <ActionButton icon={Target} onClick={handleDepartmentTest} disabled={loading.test} iconClass="text-violet-500">
              {lang === "ar" ? "اختبار القسم" : "Test Dept"}
            </ActionButton>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <SubTab
            key={tab.id}
            active={activeTab === tab.id}
            icon={tab.icon}
            label={lang === "ar" ? tab.labelAr : tab.labelEn}
            tone={tab.tone}
            onClick={() => setActiveTab(tab.id)}
          />
        ))}
      </div>

      {activeTab === "fences" && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Metric icon={MapPin} title={lang === "ar" ? "الإجمالي" : "Total"} value={visibleFences.length} tone="blue" />
            <Metric icon={CheckCircle} title={lang === "ar" ? "نشط" : "Active"} value={visibleFences.filter((x) => x.isActive).length} tone="emerald" />
            <Metric icon={Activity} title={lang === "ar" ? "نشط الآن" : "Currently Active"} value={visibleFences.filter((x) => x.isCurrentlyActive).length} tone="violet" />
            <Metric icon={Radio} title={lang === "ar" ? "بإشارات" : "With Signals"} value={visibleFences.filter((x) => x.wifiSsid || x.beaconUuid).length} tone="orange" />
          </div>

          {isBusy ? (
            <LoadingGetData text={lang === "ar" ? "جاري تحميل السياجات..." : "Loading geofences..."} />
          ) : visibleFences.length === 0 ? (
            <EmptyState
              icon={MapPin}
              title={lang === "ar" ? "لا توجد سياجات جغرافية" : "No geofences"}
              description={lang === "ar" ? "ابدأ بإضافة سياج جغرافي للقسم." : "Start by creating a department geofence."}
            />
          ) : (
            <>
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                {visibleFences.map((fence) => (
                  <FenceCard
                    key={fence.id}
                    fence={fence}
                    lang={lang}
                    rtl={rtl}
                    onEdit={() => goTo(`/admin-panel/department/geofence/edit/${fence.id}`)}
                    onDelete={() => handleDelete(fence)}
                    onToggle={() => handleToggleStatus(fence)}
                    onTest={() => handleTestFence(fence)}
                    onPriorityChange={(value) => handlePriorityChange(fence.id, value)}
                    onSavePriority={() => handleSavePriority(fence)}
                    loading={loading.action || loading.test}
                  />
                ))}
              </div>

              {isAdmin && (
                <div className="flex justify-end">
                  <ActionButton icon={ArrowUpDown} onClick={handleSaveReorder} disabled={loading.action} iconClass="text-violet-500">
                    {lang === "ar" ? "حفظ ترتيب الأولويات" : "Save Priority Order"}
                  </ActionButton>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {activeTab === "active" && (
        <div>
          {loading.active ? (
            <LoadingGetData text={lang === "ar" ? "جاري تحميل السياج النشط..." : "Loading active fence..."} />
          ) : activeFence ? (
            <FenceCard
              fence={activeFence}
              lang={lang}
              rtl={rtl}
              onEdit={() => goTo(`/admin-panel/department/geofence/edit/${activeFence.id}`)}
              onDelete={() => handleDelete(activeFence)}
              onToggle={() => handleToggleStatus(activeFence)}
              onTest={() => handleTestFence(activeFence)}
              onPriorityChange={() => {}}
              onSavePriority={() => {}}
              loading={loading.action || loading.test}
            />
          ) : (
            <EmptyState
              icon={ShieldCheck}
              title={lang === "ar" ? "لا يوجد سياج نشط حاليًا" : "No active fence now"}
              description={lang === "ar" ? "قد تكون كل السياجات غير مفعلة أو خارج فترة النشاط." : "All fences may be inactive or outside their active time window."}
            />
          )}
        </div>
      )}

      {activeTab === "test" && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <ResultPanel
            title={lang === "ar" ? "نتيجة اختبار السياج المحدد" : "Selected Fence Test Result"}
            icon={Crosshair}
            result={testResult}
            selectedFence={selectedFence}
            lang={lang}
          />
          <ResultPanel
            title={lang === "ar" ? "نتيجة اختبار القسم بالإشارات" : "Department Signal Test Result"}
            icon={Target}
            result={departmentTestResult}
            lang={lang}
          />
        </div>
      )}

      {activeTab === "nearby" && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <ListPanel
            title={lang === "ar" ? "السياجات القريبة" : "Nearby GeoFences"}
            icon={Navigation}
            items={nearbyFences}
            lang={lang}
          />

          {isAdmin && (
            <ListPanel
              title={lang === "ar" ? "كل السياجات" : "All GeoFences"}
              icon={Globe2}
              items={allFences}
              lang={lang}
              loading={loading.all}
            />
          )}
        </div>
      )}
    </div>
  )
}

function FenceCard({
  fence,
  lang,
  onEdit,
  onDelete,
  onToggle,
  onTest,
  onPriorityChange,
  onSavePriority,
  loading,
}) {
  const active = Boolean(fence.isActive)
  const current = Boolean(fence.isCurrentlyActive)

  return (
    <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <IconBox icon={MapPin} tone={current ? "emerald" : active ? "blue" : "slate"} />
          <div className="min-w-0">
            <h3 className="text-lg font-black text-[var(--color-text)] truncate">
              {fence.name || "-"}
            </h3>
            <p className="text-xs font-semibold text-[var(--color-text-muted)] mt-1">
              {fence.latitude}, {fence.longitude} • {fence.radiusMeters}m
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 justify-end">
          <StatusBadge active={active} current={current} lang={lang} />
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
        <MiniInfo icon={SlidersHorizontal} label={lang === "ar" ? "الأولوية" : "Priority"} value={fence.priority} tone="violet" />
        <MiniInfo icon={Wifi} label="WiFi" value={fence.wifiSsid || "-"} tone="blue" />
        <MiniInfo icon={Radio} label="Beacon" value={fence.beaconUuid || "-"} tone="orange" />
        <MiniInfo icon={CalendarIcon} label={lang === "ar" ? "أُنشئ" : "Created"} value={formatDateTime(fence.createdAt, lang)} tone="slate" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
        <PolicyBox icon={Wifi} title="WiFi Policy" value={normalizePolicy(fence.wifiPolicy)} lang={lang} />
        <PolicyBox icon={Radio} title="Beacon Policy" value={normalizePolicy(fence.beaconPolicy)} lang={lang} />
      </div>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <p className="text-xs font-black text-[var(--color-text-muted)] mb-1">
            {lang === "ar" ? "من" : "Active From"}
          </p>
          <p className="text-sm font-bold text-[var(--color-text)]">{formatDateTime(fence.activeFromUtc, lang)}</p>
        </div>
        <div>
          <p className="text-xs font-black text-[var(--color-text-muted)] mb-1">
            {lang === "ar" ? "إلى" : "Active To"}
          </p>
          <p className="text-sm font-bold text-[var(--color-text)]">{formatDateTime(fence.activeToUtc, lang)}</p>
        </div>
      </div>

      <div className="mt-4 flex flex-col xl:flex-row gap-3 xl:items-center xl:justify-between">
        <div className="flex items-center gap-2">
          <input
            type="number"
            min="1"
            max="1000"
            value={fence.priority ?? 100}
            onChange={(e) => onPriorityChange(e.target.value)}
            className="w-28 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm font-bold text-[var(--color-text)] outline-none focus:border-emerald-500"
          />
          <ActionButton icon={Save} onClick={onSavePriority} disabled={loading} iconClass="text-emerald-500">
            {lang === "ar" ? "حفظ" : "Save"}
          </ActionButton>
        </div>

        <div className="flex flex-wrap gap-2">
          <ActionButton icon={Target} onClick={onTest} disabled={loading} iconClass="text-violet-500">
            {lang === "ar" ? "اختبار" : "Test"}
          </ActionButton>
          <ActionButton icon={BadgeCheck} onClick={onToggle} disabled={loading} iconClass={active ? "text-red-500" : "text-emerald-500"}>
            {active ? (lang === "ar" ? "تعطيل" : "Disable") : lang === "ar" ? "تفعيل" : "Enable"}
          </ActionButton>
          <ActionButton icon={Edit} onClick={onEdit} disabled={loading} iconClass="text-blue-500">
            {lang === "ar" ? "تعديل" : "Edit"}
          </ActionButton>
          <ActionButton icon={Trash2} onClick={onDelete} disabled={loading} iconClass="text-red-500">
            {lang === "ar" ? "حذف" : "Delete"}
          </ActionButton>
        </div>
      </div>
    </div>
  )
}

function PolicyBox({ icon: Icon, title, value, lang }) {
  const policy = {
    0: { labelAr: "تجاهل", labelEn: "Ignore", tone: "slate" },
    1: { labelAr: "إجباري", labelEn: "Required", tone: "red" },
    2: { labelAr: "اختياري", labelEn: "Optional", tone: "blue" },
  }[value] || { labelAr: "غير معروف", labelEn: "Unknown", tone: "slate" }

  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-muted)] p-3 flex items-center justify-between gap-3">
      <div className="flex items-center gap-2 min-w-0">
        <Icon className={`w-4 h-4 shrink-0 ${toneText(policy.tone)}`} />
        <span className="text-xs font-black text-[var(--color-text-muted)] truncate">{title}</span>
      </div>
      <span className={`rounded-full border px-2 py-1 text-xs font-black ${toneBorder(policy.tone)}`}>
        {lang === "ar" ? policy.labelAr : policy.labelEn}
      </span>
    </div>
  )
}

function ResultPanel({ title, icon: Icon, result, selectedFence, lang }) {
  const booleanValue =
    typeof result === "boolean"
      ? result
      : result?.withinFence ?? result?.isInside ?? result?.isAllowed ?? result?.success

  return (
    <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
      <h3 className="text-lg font-black text-[var(--color-text)] mb-4 flex items-center gap-2">
        <IconBox icon={Icon} tone="violet" small />
        {title}
      </h3>

      {!result ? (
        <EmptyState
          icon={Icon}
          title={lang === "ar" ? "لا توجد نتيجة اختبار بعد" : "No test result yet"}
          description={lang === "ar" ? "أدخل الموقع ثم اختر اختبار سياج أو اختبار القسم." : "Enter a location then test a fence or the department."}
        />
      ) : (
        <div className="space-y-3">
          {selectedFence && (
            <MiniInfo icon={MapPin} label={lang === "ar" ? "السياج" : "Fence"} value={selectedFence.name} tone="blue" />
          )}

          <div className={`rounded-xl border-2 p-4 ${booleanValue ? "border-emerald-500 text-emerald-500" : "border-red-500 text-red-500"}`}>
            <div className="flex items-center gap-2">
              {booleanValue ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
              <p className="font-black">
                {booleanValue
                  ? lang === "ar"
                    ? "داخل النطاق / مسموح"
                    : "Inside / Allowed"
                  : lang === "ar"
                  ? "خارج النطاق / غير مسموح"
                  : "Outside / Not allowed"}
              </p>
            </div>
          </div>

          <pre className="max-h-64 overflow-auto rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-muted)] p-3 text-xs text-[var(--color-text)]">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}

function ListPanel({ title, icon: Icon, items, lang, loading }) {
  return (
    <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
      <h3 className="text-lg font-black text-[var(--color-text)] mb-4 flex items-center gap-2">
        <IconBox icon={Icon} tone="orange" small />
        {title}
      </h3>

      {loading ? (
        <div className="flex items-center gap-2 text-[var(--color-text-muted)] font-bold">
          <Loader2 className="w-4 h-4 animate-spin" />
          {lang === "ar" ? "جاري التحميل..." : "Loading..."}
        </div>
      ) : !items?.length ? (
        <EmptyState
          icon={Icon}
          title={lang === "ar" ? "لا توجد نتائج" : "No results"}
        />
      ) : (
        <div className="space-y-2 max-h-[520px] overflow-auto">
          {items.map((item) => (
            <div key={item.id} className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-muted)] p-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-black text-[var(--color-text)]">{item.name}</p>
                  <p className="text-xs font-bold text-[var(--color-text-muted)]">
                    {item.latitude}, {item.longitude} • {item.radiusMeters}m
                  </p>
                </div>
                <StatusBadge active={item.isActive} current={item.isCurrentlyActive} lang={lang} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function StatusBadge({ active, current, lang }) {
  if (!active) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border-2 border-red-500 px-2.5 py-1 text-xs font-black text-red-500">
        <XCircle className="w-3 h-3" />
        {lang === "ar" ? "غير مفعل" : "Inactive"}
      </span>
    )
  }

  return (
    <span className={`inline-flex items-center gap-1 rounded-full border-2 px-2.5 py-1 text-xs font-black ${
      current ? "border-emerald-500 text-emerald-500" : "border-amber-500 text-amber-500"
    }`}>
      <CheckCircle className="w-3 h-3" />
      {current ? (lang === "ar" ? "نشط الآن" : "Active now") : lang === "ar" ? "مفعل" : "Enabled"}
    </span>
  )
}

function Metric({ icon: Icon, title, value, tone }) {
  return (
    <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-black text-[var(--color-text-muted)]">{title}</p>
          <p className={`mt-1 text-2xl font-black ${toneText(tone)}`}>{value ?? 0}</p>
        </div>
        <IconBox icon={Icon} tone={tone} />
      </div>
    </div>
  )
}

function MiniInfo({ icon: Icon, label, value, tone }) {
  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-muted)] p-3 min-w-0">
      <div className="flex items-center gap-2 mb-1">
        <Icon className={`w-4 h-4 shrink-0 ${toneText(tone)}`} />
        <p className="text-xs font-black text-[var(--color-text-muted)] truncate">{label}</p>
      </div>
      <p className="text-sm font-black text-[var(--color-text)] truncate" title={String(value ?? "-")}>
        {value ?? "-"}
      </p>
    </div>
  )
}

function InputBox({ label, value, onChange, placeholder }) {
  return (
    <div>
      <label className="block text-xs font-black text-[var(--color-text)] mb-1.5">
        {label}
      </label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm font-bold text-[var(--color-text)] outline-none focus:border-emerald-500"
      />
    </div>
  )
}

function ActionButton({ icon: Icon, children, onClick, disabled, iconClass = "text-blue-500" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--color-border-strong)] bg-[var(--color-surface)] px-3 py-2 text-sm font-black text-[var(--color-text)] transition-colors hover:border-[var(--color-success)] hover:bg-[var(--color-success)] hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
    >
      <Icon className={`w-4 h-4 shrink-0 ${iconClass}`} />
      {children}
    </button>
  )
}

function SubTab({ active, icon: Icon, label, tone, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-black transition-colors ${
        active
          ? "border-[var(--color-success)] bg-[var(--color-success)] text-white"
          : "border-[var(--color-border-strong)] bg-[var(--color-surface)] text-[var(--color-text)] hover:border-[var(--color-success)] hover:bg-[var(--color-success)] hover:text-white"
      }`}
    >
      <Icon className={`w-4 h-4 ${active ? "text-white" : toneText(tone)}`} />
      {label}
    </button>
  )
}

function IconBox({ icon: Icon, tone = "blue", small = false }) {
  return (
    <span className={`${small ? "w-8 h-8 rounded-lg" : "w-11 h-11 rounded-2xl"} shrink-0 border-2 bg-transparent flex items-center justify-center ${toneBorder(tone)}`}>
      <Icon className={`${small ? "w-4 h-4" : "w-5 h-5"} ${toneText(tone)}`} />
    </span>
  )
}

function EmptyState({ icon: Icon, title, description }) {
  return (
    <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-muted)] p-8 text-center">
      <Icon className="mx-auto mb-3 h-12 w-12 text-slate-500" />
      <h3 className="font-black text-[var(--color-text)]">{title}</h3>
      {description && (
        <p className="mt-1 text-sm font-semibold text-[var(--color-text-muted)]">{description}</p>
      )}
    </div>
  )
}

function toneText(tone) {
  const map = {
    blue: "text-blue-500",
    emerald: "text-emerald-500",
    green: "text-emerald-500",
    violet: "text-violet-500",
    purple: "text-violet-500",
    amber: "text-amber-500",
    yellow: "text-amber-500",
    orange: "text-orange-500",
    red: "text-red-500",
    slate: "text-slate-500",
  }
  return map[tone] || map.blue
}

function toneBorder(tone) {
  const map = {
    blue: "border-blue-500",
    emerald: "border-emerald-500",
    green: "border-emerald-500",
    violet: "border-violet-500",
    purple: "border-violet-500",
    amber: "border-amber-500",
    yellow: "border-amber-500",
    orange: "border-orange-500",
    red: "border-red-500",
    slate: "border-slate-500",
  }
  return map[tone] || map.blue
}

function CalendarIcon(props) {
  return <ListChecks {...props} />
}

export default DepartmentGeoFences