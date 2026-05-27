import { useEffect, useMemo, useState } from "react"
import { useTranslation } from "react-i18next"
import { useNavigate, useParams } from "react-router-dom"
import { Formik, Form, Field, ErrorMessage } from "formik"
import * as Yup from "yup"
import Swal from "sweetalert2"
import { toast } from "react-toastify"
import {
  ArrowLeft,
  ArrowRight,
  Loader2,
  MapPin,
  Save,
  SlidersHorizontal,
  Wifi,
} from "lucide-react"

import LoadingGetData from "../../../../../components/LoadingGetData"
import axiosInstance from "../../../../../utils/axiosInstance"
import { getPageTheme } from "../../../../../utils/themeClasses"

const getAuthHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("token")}`,
  "Content-Type": "application/json",
})

const unwrap = (response) => response?.data?.data ?? response?.data ?? null

const buildSchema = (lang) =>
  Yup.object({
    name: Yup.string()
      .required(lang === "ar" ? "اسم السياج مطلوب" : "GeoFence name is required")
      .max(150),
    latitude: Yup.number().required().min(-90).max(90),
    longitude: Yup.number().required().min(-180).max(180),
    radiusMeters: Yup.number().required().min(50).max(5000),
    priority: Yup.number().required().min(1).max(1000),
    isActive: Yup.boolean(),
    activeFrom: Yup.string().nullable(),
    activeTo: Yup.string().nullable(),
    wifiSsid: Yup.string().max(100).nullable(),
    beaconUuid: Yup.string().max(100).nullable(),
    wifiPolicy: Yup.number().oneOf([0, 1, 2]),
    beaconPolicy: Yup.number().oneOf([0, 1, 2]),
  })

const toDatetimeLocal = (value) => {
  if (!value) return ""
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ""
  const offset = date.getTimezoneOffset()
  const localDate = new Date(date.getTime() - offset * 60 * 1000)
  return localDate.toISOString().slice(0, 16)
}

const toNullableIso = (value) => {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return date.toISOString()
}

const normalizePolicy = (value) => {
  if (value === "Ignore" || value === 0 || value === "0") return 0
  if (value === "Required" || value === 1 || value === "1") return 1
  if (value === "Optional" || value === 2 || value === "2") return 2
  return 0
}

function EditGeofence() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const params = useParams()
  const theme = getPageTheme()

  const fenceId = params.fenceId || params.departmentId || params.id

  const currentLang = i18n.language || "ar"
  const isRTL = currentLang === "ar"

  const [geoFence, setGeoFence] = useState(null)
  const [loading, setLoading] = useState(true)

  const validationSchema = useMemo(() => buildSchema(currentLang), [currentLang])

  useEffect(() => {
    let mounted = true

    const loadFence = async () => {
      setLoading(true)

      try {
        const response = await axiosInstance.get(`/api/v1/GeoFence/${fenceId}`, {
          headers: getAuthHeaders(),
        })

        if (mounted) setGeoFence(unwrap(response))
      } catch (error) {
        Swal.fire({
          title: currentLang === "ar" ? "تعذر تحميل السياج" : "Failed to load GeoFence",
          text:
            currentLang === "ar"
              ? error?.response?.data?.messageAr || error?.response?.data?.message || error?.message
              : error?.response?.data?.messageEn || error?.response?.data?.message || error?.message,
          icon: "error",
          confirmButtonColor: "#ef4444",
        })
      } finally {
        if (mounted) setLoading(false)
      }
    }

    if (fenceId) loadFence()

    return () => {
      mounted = false
    }
  }, [fenceId, currentLang])

  const initialValues = useMemo(
    () => ({
      name: geoFence?.name || "",
      latitude: geoFence?.latitude ?? "",
      longitude: geoFence?.longitude ?? "",
      radiusMeters: geoFence?.radiusMeters ?? 100,
      priority: geoFence?.priority ?? 100,
      isActive: Boolean(geoFence?.isActive),
      activeFrom: toDatetimeLocal(geoFence?.activeFromUtc),
      activeTo: toDatetimeLocal(geoFence?.activeToUtc),
      wifiSsid: geoFence?.wifiSsid || "",
      beaconUuid: geoFence?.beaconUuid || "",
      wifiPolicy: normalizePolicy(geoFence?.wifiPolicy),
      beaconPolicy: normalizePolicy(geoFence?.beaconPolicy),
    }),
    [geoFence]
  )

  const handleSubmit = async (values, { setSubmitting }) => {
    const payload = {
      name: values.name.trim(),
      latitude: Number(values.latitude),
      longitude: Number(values.longitude),
      radiusMeters: Number(values.radiusMeters),
      priority: Number(values.priority),
      isActive: Boolean(values.isActive),
      activeFrom: toNullableIso(values.activeFrom),
      activeTo: toNullableIso(values.activeTo),
      wifiSsid: values.wifiSsid?.trim() || null,
      beaconUuid: values.beaconUuid?.trim() || null,
      wifiPolicy: Number(values.wifiPolicy),
      beaconPolicy: Number(values.beaconPolicy),
    }

    try {
      await axiosInstance.put(`/api/v1/GeoFence/${fenceId}`, payload, {
        headers: getAuthHeaders(),
      })

      toast.success(currentLang === "ar" ? "تم تحديث السياج الجغرافي" : "GeoFence updated")
      navigate(-1)
    } catch (error) {
      Swal.fire({
        title: currentLang === "ar" ? "تعذر التحديث" : "Failed to update",
        text:
          currentLang === "ar"
            ? error?.response?.data?.messageAr || error?.response?.data?.message || error?.message
            : error?.response?.data?.messageEn || error?.response?.data?.message || error?.message,
        icon: "error",
        confirmButtonText: t("common.ok") || "OK",
        confirmButtonColor: "#ef4444",
      })
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <LoadingGetData text={currentLang === "ar" ? "جاري تحميل السياج..." : "Loading geofence..."} />
  }

  if (!geoFence) {
    return (
      <div className={theme.page} dir={isRTL ? "rtl" : "ltr"}>
        <div className={`${theme.card} mx-auto max-w-2xl p-8 text-center`}>
          <MapPin className="mx-auto mb-3 h-12 w-12 text-slate-500" />
          <h2 className="text-xl font-black text-[var(--color-text)]">
            {currentLang === "ar" ? "السياج غير موجود" : "GeoFence not found"}
          </h2>
        </div>
      </div>
    )
  }

  return (
    <div className={theme.page} dir={isRTL ? "rtl" : "ltr"}>
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex items-center justify-between gap-3 flex-wrap">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-sm font-black text-[var(--color-text-muted)] hover:text-[var(--color-success)] transition-colors"
          >
            {currentLang === "en" ? <ArrowLeft size={18} /> : <ArrowRight size={18} />}
            {t("common.goBack") || "Back"}
          </button>
        </div>

        <div className={`${theme.card} p-6 mb-6`}>
          <div className="flex items-start gap-4">
            <IconBox icon={MapPin} tone="blue" />
            <div>
              <h1 className="text-3xl font-black text-[var(--color-text)]">
                {t("geoFenceForm.editTitle") || (currentLang === "ar" ? "تعديل السياج الجغرافي" : "Edit GeoFence")}
              </h1>
              <p className="mt-1 text-sm font-semibold text-[var(--color-text-muted)]">
                {geoFence.name}
              </p>
            </div>
          </div>
        </div>

        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {({ isSubmitting, values, setFieldValue }) => (
            <Form className={`${theme.card} p-6 space-y-6`}>
              <FormSection icon={MapPin} title={currentLang === "ar" ? "بيانات الموقع" : "Location Details"} tone="blue">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField name="name" label={currentLang === "ar" ? "اسم السياج" : "GeoFence Name"} />
                  <FormField name="radiusMeters" type="number" label={currentLang === "ar" ? "نصف القطر بالمتر" : "Radius Meters"} />
                  <FormField name="latitude" type="number" step="0.000001" label="Latitude" />
                  <FormField name="longitude" type="number" step="0.000001" label="Longitude" />
                </div>
              </FormSection>

              <FormSection icon={SlidersHorizontal} title={currentLang === "ar" ? "الحالة والأولوية" : "Status & Priority"} tone="violet">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <FormField name="priority" type="number" label={currentLang === "ar" ? "الأولوية" : "Priority"} />

                  <div>
                    <label className="mb-1.5 block text-xs font-black text-[var(--color-text)]">
                      {currentLang === "ar" ? "الحالة" : "Status"}
                    </label>
                    <button
                      type="button"
                      onClick={() => setFieldValue("isActive", !values.isActive)}
                      className={`w-full rounded-xl border-2 px-3 py-2 text-sm font-black ${
                        values.isActive
                          ? "border-emerald-500 text-emerald-500"
                          : "border-red-500 text-red-500"
                      }`}
                    >
                      {values.isActive
                        ? currentLang === "ar"
                          ? "مفعل"
                          : "Active"
                        : currentLang === "ar"
                        ? "غير مفعل"
                        : "Inactive"}
                    </button>
                  </div>

                  <FormField name="activeFrom" type="datetime-local" label={currentLang === "ar" ? "نشط من" : "Active From"} />
                  <FormField name="activeTo" type="datetime-local" label={currentLang === "ar" ? "نشط إلى" : "Active To"} />
                </div>
              </FormSection>

              <FormSection icon={Wifi} title={currentLang === "ar" ? "إشارات التحقق" : "Signal Verification"} tone="emerald">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField name="wifiSsid" label="WiFi SSID" />
                  <PolicyField name="wifiPolicy" label="WiFi Policy" currentLang={currentLang} />
                  <FormField name="beaconUuid" label="Beacon UUID" />
                  <PolicyField name="beaconPolicy" label="Beacon Policy" currentLang={currentLang} />
                </div>
              </FormSection>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--color-success)] bg-[var(--color-success)] px-5 py-2.5 text-sm font-black text-white transition-colors hover:bg-[var(--color-success-hover)] disabled:opacity-60"
                >
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save size={18} />}
                  {isSubmitting
                    ? currentLang === "ar"
                      ? "جاري الحفظ..."
                      : "Saving..."
                    : currentLang === "ar"
                    ? "حفظ التعديلات"
                    : "Save Changes"}
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  )
}

function FormSection({ icon: Icon, title, tone, children }) {
  return (
    <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-muted)] p-5">
      <h2 className="mb-4 flex items-center gap-3 text-lg font-black text-[var(--color-text)]">
        <IconBox icon={Icon} tone={tone} small />
        {title}
      </h2>
      {children}
    </section>
  )
}

function FormField({ name, label, type = "text", step }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-black text-[var(--color-text)]">
        {label}
      </label>
      <Field
        name={name}
        type={type}
        step={step}
        className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm font-bold text-[var(--color-text)] outline-none focus:border-emerald-500"
      />
      <ErrorMessage name={name} component="div" className="mt-1 text-xs font-bold text-red-500" />
    </div>
  )
}

function PolicyField({ name, label, currentLang }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-black text-[var(--color-text)]">
        {label}
      </label>
      <Field
        as="select"
        name={name}
        className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm font-bold text-[var(--color-text)] outline-none focus:border-emerald-500"
      >
        <option value={0}>{currentLang === "ar" ? "تجاهل" : "Ignore"}</option>
        <option value={1}>{currentLang === "ar" ? "إجباري" : "Required"}</option>
        <option value={2}>{currentLang === "ar" ? "اختياري" : "Optional"}</option>
      </Field>
      <ErrorMessage name={name} component="div" className="mt-1 text-xs font-bold text-red-500" />
    </div>
  )
}

function IconBox({ icon: Icon, tone = "blue", small = false }) {
  const toneClass = {
    blue: "text-blue-500 border-blue-500",
    emerald: "text-emerald-500 border-emerald-500",
    violet: "text-violet-500 border-violet-500",
    orange: "text-orange-500 border-orange-500",
    red: "text-red-500 border-red-500",
    slate: "text-slate-500 border-slate-500",
  }[tone] || "text-blue-500 border-blue-500"

  return (
    <span className={`${small ? "h-9 w-9 rounded-xl" : "h-12 w-12 rounded-2xl"} flex shrink-0 items-center justify-center border-2 bg-transparent ${toneClass}`}>
      <Icon className={small ? "h-4 w-4" : "h-6 w-6"} />
    </span>
  )
}

export default EditGeofence