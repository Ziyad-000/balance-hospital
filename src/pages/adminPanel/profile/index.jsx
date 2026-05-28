"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useFormik } from "formik"
import * as Yup from "yup"
import { toast } from "react-toastify"
import Swal from "sweetalert2"
import i18next from "i18next"
import {
  Activity,
  BadgeCheck,
  Briefcase,
  Camera,
  CheckCircle,
  Clock,
  Edit3,
  Eye,
  EyeOff,
  GraduationCap,
  Lock,
  Mail,
  Phone,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Trash2,
  User,
  UserCircle,
} from "lucide-react"

import axiosInstance from "../../../utils/axiosInstance"
import { getPageTheme } from "../../../utils/themeClasses"

import {
  changeMyPassword,
  getMyDataForEditing,
  getMyProfile,
  getMyStatistics,
  getMySummary,
  removeMyPicture,
  updateMyPicture,
  updateMyProfileData,
} from "../../../state/act/actProfile"

import { clearProfileFlags } from "../../../state/slices/profile"

const getApiList = (payload) => {
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.data)) return payload.data
  if (Array.isArray(payload?.data?.items)) return payload.data.items
  if (Array.isArray(payload?.items)) return payload.items
  if (Array.isArray(payload?.result)) return payload.result
  return []
}

const getName = (item, currentLang) => {
  if (!item) return "-"

  if (currentLang === "ar") {
    return (
      item.nameArabic ||
      item.nameAr ||
      item.categoryNameAr ||
      item.degreeNameAr ||
      item.contractingTypeNameAr ||
      item.fullNameAr ||
      item.roleAr ||
      item.name ||
      "-"
    )
  }

  return (
    item.nameEnglish ||
    item.nameEn ||
    item.categoryNameEn ||
    item.degreeNameEn ||
    item.contractingTypeNameEn ||
    item.fullNameEn ||
    item.roleEn ||
    item.name ||
    "-"
  )
}

const getProfileName = (profile, currentLang) => {
  if (!profile) return "-"

  return currentLang === "ar"
    ? profile.fullNameAr || profile.nameArabic || profile.fullNameEn || "-"
    : profile.fullNameEn || profile.nameEnglish || profile.fullNameAr || "-"
}

const getNestedName = (obj, currentLang) => {
  if (!obj) return "-"
  return getName(obj, currentLang)
}

const getRoleName = (profile, currentLang) => {
  if (!profile) return "-"

  return currentLang === "ar"
    ? profile.roleAr || profile.roleEn || "-"
    : profile.roleEn || profile.roleAr || "-"
}

const formatActiveTime = (value, currentLang) => {
  if (!value) return "-"

  if (typeof value === "string") {
    return value
  }

  return currentLang === "ar" ? "غير محدد" : "Not specified"
}

const getCurrentMonthYear = () => {
  const now = new Date()

  return {
    month: now.getMonth() + 1,
    year: now.getFullYear(),
  }
}

const getToneClasses = (tone = "blue") => {
  const tones = {
    blue: {
      text: "text-blue-500",
      border: "border-blue-500",
      bg: "bg-blue-500/10",
      hover: "hover:border-blue-500",
    },
    emerald: {
      text: "text-emerald-500",
      border: "border-emerald-500",
      bg: "bg-emerald-500/10",
      hover: "hover:border-emerald-500",
    },
    violet: {
      text: "text-violet-500",
      border: "border-violet-500",
      bg: "bg-violet-500/10",
      hover: "hover:border-violet-500",
    },
    amber: {
      text: "text-amber-500",
      border: "border-amber-500",
      bg: "bg-amber-500/10",
      hover: "hover:border-amber-500",
    },
    red: {
      text: "text-red-500",
      border: "border-red-500",
      bg: "bg-red-500/10",
      hover: "hover:border-red-500",
    },
  }

  return tones[tone] || tones.blue
}

function MyProfilePage() {
  const dispatch = useDispatch()
  const theme = getPageTheme()

  const currentLang = i18next.language || "ar"
  const isRTL = currentLang === "ar"

  const fileInputRef = useRef(null)

  const {
    loadingProfile,
    loadingProfileAction,
    loadingProfileEdit,
    loadingProfileStats,
    myProfile,
    myEditData,
    mySummary,
    myStatistics,
    updateSuccess,
    changePasswordSuccess,
    updatePictureSuccess,
    removePictureSuccess,
  } = useSelector((state) => state.profile)

  const [activeTab, setActiveTab] = useState("overview")
  const [showOldPassword, setShowOldPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [scientificDegrees, setScientificDegrees] = useState([])
  const [contractingTypes, setContractingTypes] = useState([])
  const [lookupsLoading, setLookupsLoading] = useState(false)

  const { month, year } = getCurrentMonthYear()

  useEffect(() => {
    dispatch(getMyProfile())
    dispatch(getMyDataForEditing())
    dispatch(getMySummary({ month, year }))
    dispatch(getMyStatistics({ month, year }))
    fetchLookups()
  }, [dispatch])

  useEffect(() => {
    if (updateSuccess) {
      toast.success(
        currentLang === "ar"
          ? "تم تحديث بيانات البروفايل بنجاح"
          : "Profile updated successfully"
      )

      dispatch(getMyProfile())
      dispatch(getMyDataForEditing())
      dispatch(clearProfileFlags())
    }

    if (changePasswordSuccess) {
      toast.success(
        currentLang === "ar"
          ? "تم تغيير كلمة المرور بنجاح"
          : "Password changed successfully"
      )

      passwordFormik.resetForm()
      dispatch(clearProfileFlags())
    }

    if (updatePictureSuccess) {
      toast.success(
        currentLang === "ar"
          ? "تم تحديث الصورة بنجاح"
          : "Picture updated successfully"
      )

      dispatch(getMyProfile())
      dispatch(clearProfileFlags())
    }

    if (removePictureSuccess) {
      toast.success(
        currentLang === "ar"
          ? "تم حذف الصورة بنجاح"
          : "Picture removed successfully"
      )

      dispatch(getMyProfile())
      dispatch(clearProfileFlags())
    }
  }, [
    updateSuccess,
    changePasswordSuccess,
    updatePictureSuccess,
    removePictureSuccess,
    dispatch,
    currentLang,
  ])

  const fetchLookups = async () => {
    try {
      setLookupsLoading(true)

      const [degreesRes, contractingRes] = await Promise.all([
        axiosInstance.get("/api/v1/ScientificDegree/scientific-degrees"),
        axiosInstance.get("/api/v1/ContractingType/contracting-types"),
      ])

      setScientificDegrees(getApiList(degreesRes.data))
      setContractingTypes(getApiList(contractingRes.data))
    } finally {
      setLookupsLoading(false)
    }
  }

  const editValidationSchema = useMemo(() => {
    return Yup.object({
      nameAr: Yup.string()
        .trim()
        .required(
          currentLang === "ar" ? "الاسم العربي مطلوب" : "Arabic name is required"
        ),
      nameEn: Yup.string()
        .trim()
        .required(
          currentLang === "ar"
            ? "الاسم الإنجليزي مطلوب"
            : "English name is required"
        ),
      mobile: Yup.string()
        .trim()
        .matches(
          /^01[0-9]{9}$/,
          currentLang === "ar"
            ? "رقم الهاتف يجب أن يكون 11 رقم ويبدأ بـ 01"
            : "Mobile must be 11 digits and start with 01"
        )
        .required(
          currentLang === "ar" ? "رقم الهاتف مطلوب" : "Mobile is required"
        ),
      email: Yup.string()
        .trim()
        .email(currentLang === "ar" ? "صيغة البريد غير صحيحة" : "Invalid email")
        .required(currentLang === "ar" ? "البريد مطلوب" : "Email is required"),
      contractorTypeId: Yup.string().required(
        currentLang === "ar"
          ? "نوع التعاقد مطلوب"
          : "Contracting type is required"
      ),
      scientificDegreeId: Yup.string().required(
        currentLang === "ar"
          ? "الدرجة العلمية مطلوبة"
          : "Scientific degree is required"
      ),
    })
  }, [currentLang])

  const editFormik = useFormik({
    enableReinitialize: true,
    initialValues: {
      nameAr: myEditData?.nameAr || myProfile?.fullNameAr || "",
      nameEn: myEditData?.nameEn || myProfile?.fullNameEn || "",
      mobile: myEditData?.mobile || myProfile?.mobile || "",
      email: myEditData?.email || myProfile?.email || "",
      contractorTypeId: "",
      scientificDegreeId: "",
    },
    validationSchema: editValidationSchema,
    onSubmit: async (values) => {
      await dispatch(
        updateMyProfileData({
          nameAr: values.nameAr.trim(),
          nameEn: values.nameEn.trim(),
          mobile: values.mobile.trim(),
          email: values.email.trim(),
          contractorTypeId: Number(values.contractorTypeId),
          scientificDegreeId: Number(values.scientificDegreeId),
        })
      )
    },
  })

  const passwordValidationSchema = useMemo(() => {
    return Yup.object({
      oldPassword: Yup.string().required(
        currentLang === "ar"
          ? "كلمة المرور الحالية مطلوبة"
          : "Old password is required"
      ),
      newPassword: Yup.string()
        .min(
          8,
          currentLang === "ar"
            ? "كلمة المرور يجب ألا تقل عن 8 أحرف"
            : "Password must be at least 8 characters"
        )
        .required(
          currentLang === "ar"
            ? "كلمة المرور الجديدة مطلوبة"
            : "New password is required"
        ),
      confirmPassword: Yup.string()
        .oneOf(
          [Yup.ref("newPassword")],
          currentLang === "ar"
            ? "كلمة المرور وتأكيدها غير متطابقين"
            : "Passwords do not match"
        )
        .required(
          currentLang === "ar"
            ? "تأكيد كلمة المرور مطلوب"
            : "Confirm password is required"
        ),
    })
  }, [currentLang])

  const passwordFormik = useFormik({
    initialValues: {
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
    validationSchema: passwordValidationSchema,
    onSubmit: async (values) => {
      await dispatch(
        changeMyPassword({
          oldPassword: values.oldPassword,
          newPassword: values.newPassword,
          confirmPassword: values.confirmPassword,
        })
      )
    },
  })

  const handlePictureChange = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    await dispatch(updateMyPicture(file))
    event.target.value = ""
  }

  const handleRemovePicture = async () => {
    const result = await Swal.fire({
      title: currentLang === "ar" ? "حذف الصورة؟" : "Remove picture?",
      text:
        currentLang === "ar"
          ? "هل تريد حذف صورة البروفايل الحالية؟"
          : "Do you want to remove the current profile picture?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: currentLang === "ar" ? "نعم، حذف" : "Yes, remove",
      cancelButtonText: currentLang === "ar" ? "إلغاء" : "Cancel",
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#64748b",
    })

    if (result.isConfirmed) {
      await dispatch(removeMyPicture())
    }
  }

  const refreshProfile = () => {
    dispatch(getMyProfile())
    dispatch(getMyDataForEditing())
    dispatch(getMySummary({ month, year }))
    dispatch(getMyStatistics({ month, year }))
  }

  const profileImage = myProfile?.userProfile

  const tabs = [
    {
      id: "overview",
      label: currentLang === "ar" ? "نظرة عامة" : "Overview",
      description: currentLang === "ar" ? "بيانات الحساب" : "Account info",
      icon: UserCircle,
      tone: "blue",
    },
    {
      id: "edit",
      label: currentLang === "ar" ? "تعديل البيانات" : "Edit Profile",
      description: currentLang === "ar" ? "تحديث بياناتك" : "Update your data",
      icon: Edit3,
      tone: "emerald",
    },
    {
      id: "security",
      label: currentLang === "ar" ? "الأمان" : "Security",
      description: currentLang === "ar" ? "كلمة المرور" : "Password",
      icon: ShieldCheck,
      tone: "violet",
    },
    {
      id: "stats",
      label: currentLang === "ar" ? "الإحصائيات" : "Statistics",
      description: currentLang === "ar" ? "الأداء والحضور" : "Performance",
      icon: Activity,
      tone: "amber",
    },
  ]

  return (
    <div className={theme.page} dir={isRTL ? "rtl" : "ltr"}>
      <div className="p-4 sm:p-6 space-y-6">
        <ProfileHero
          profile={myProfile}
          profileImage={profileImage}
          currentLang={currentLang}
          loadingProfileAction={loadingProfileAction}
          fileInputRef={fileInputRef}
          onPictureChange={handlePictureChange}
          onRemovePicture={handleRemovePicture}
          onRefresh={refreshProfile}
        />

        <div className="grid grid-cols-1 xl:grid-cols-[300px_1fr] gap-6">
          <ProfileSidebar
            profile={myProfile}
            summary={mySummary}
            currentLang={currentLang}
            tabs={tabs}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />

          <main className="space-y-6">
            <TabHeader
              tabs={tabs}
              activeTab={activeTab}
              currentLang={currentLang}
            />

            {loadingProfile ? (
              <LoadingCard
                text={
                  currentLang === "ar"
                    ? "جاري تحميل البروفايل..."
                    : "Loading profile..."
                }
              />
            ) : (
              <>
                {activeTab === "overview" && (
                  <OverviewTab
                    profile={myProfile}
                    summary={mySummary}
                    currentLang={currentLang}
                  />
                )}

                {activeTab === "edit" && (
                  <EditProfileTab
                    formik={editFormik}
                    currentLang={currentLang}
                    isRTL={isRTL}
                    loading={loadingProfileAction || loadingProfileEdit}
                    lookupsLoading={lookupsLoading}
                    scientificDegrees={scientificDegrees}
                    contractingTypes={contractingTypes}
                  />
                )}

                {activeTab === "security" && (
                  <SecurityTab
                    formik={passwordFormik}
                    currentLang={currentLang}
                    isRTL={isRTL}
                    loading={loadingProfileAction}
                    showOldPassword={showOldPassword}
                    showNewPassword={showNewPassword}
                    showConfirmPassword={showConfirmPassword}
                    setShowOldPassword={setShowOldPassword}
                    setShowNewPassword={setShowNewPassword}
                    setShowConfirmPassword={setShowConfirmPassword}
                  />
                )}

                {activeTab === "stats" && (
                  <StatisticsTab
                    statistics={myStatistics}
                    summary={mySummary}
                    currentLang={currentLang}
                    loading={loadingProfileStats}
                  />
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}

function ProfileHero({
  profile,
  profileImage,
  currentLang,
  loadingProfileAction,
  fileInputRef,
  onPictureChange,
  onRemovePicture,
  onRefresh,
}) {
  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-[var(--color-border-strong)] bg-[var(--color-surface)] shadow-sm">
      <div className="absolute inset-0 pointer-events-none opacity-60">
        <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl" />
      </div>

      <div className="relative p-6 sm:p-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-5">
            <div className="relative shrink-0">
              <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-[2rem] border-2 border-blue-500 bg-[var(--color-bg-soft)] overflow-hidden flex items-center justify-center shadow-inner">
                {profileImage ? (
                  <img
                    src={profileImage}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-12 h-12 text-blue-500" />
                )}
              </div>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={loadingProfileAction}
                className="absolute -bottom-2 -right-2 w-11 h-11 rounded-2xl border-2 border-emerald-500 bg-[var(--color-surface)] flex items-center justify-center text-emerald-500 hover:bg-emerald-500 hover:text-white transition-colors disabled:opacity-60"
              >
                <Camera className="w-5 h-5" />
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={onPictureChange}
              />
            </div>

            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500 bg-emerald-500/10 px-3 py-1 text-xs font-black text-emerald-500 mb-3">
                <Sparkles size={14} />
                {currentLang === "ar" ? "حساب مفعّل داخل النظام" : "Active system profile"}
              </div>

              <h1 className="text-3xl sm:text-4xl font-black text-[var(--color-text)]">
                {getProfileName(profile, currentLang)}
              </h1>

              <p className="mt-2 text-sm font-bold text-[var(--color-text-muted)] break-all">
                {profile?.email || "-"}
              </p>

              <div className="flex flex-wrap gap-2 mt-4">
                <Badge tone="blue">{getRoleName(profile, currentLang)}</Badge>
                <Badge tone="emerald">
                  {getNestedName(profile?.primaryCategory, currentLang)}
                </Badge>
                <Badge tone="violet">
                  {getNestedName(profile?.scientificDegree, currentLang)}
                </Badge>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={onRefresh}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--color-border-strong)] bg-[var(--color-surface)] px-4 py-2 text-sm font-black text-[var(--color-text)] hover:bg-[var(--color-success)] hover:text-white hover:border-emerald-500 transition-colors"
            >
              <RefreshCw size={16} className="text-blue-500" />
              {currentLang === "ar" ? "تحديث" : "Refresh"}
            </button>

            {profileImage && (
              <button
                type="button"
                onClick={onRemovePicture}
                disabled={loadingProfileAction}
                className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-red-500 bg-transparent px-4 py-2 text-sm font-black text-red-500 hover:bg-red-500 hover:text-white transition-colors disabled:opacity-60"
              >
                <Trash2 size={16} />
                {currentLang === "ar" ? "حذف الصورة" : "Remove Photo"}
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

function ProfileSidebar({
  profile,
  summary,
  currentLang,
  tabs,
  activeTab,
  setActiveTab,
}) {
  return (
    <aside className="space-y-6">
      <div className="rounded-[2rem] border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
        <h2 className="text-sm font-black text-[var(--color-text-muted)] mb-4">
          {currentLang === "ar" ? "التنقل داخل البروفايل" : "Profile Navigation"}
        </h2>

        <div className="space-y-2">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const active = activeTab === tab.id
            const tone = getToneClasses(tab.tone)

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 rounded-2xl border p-3 text-start transition-all ${
                  active
                    ? `${tone.border} ${tone.bg}`
                    : "border-[var(--color-border)] bg-[var(--color-surface)] hover:border-emerald-500"
                }`}
              >
                <span
                  className={`w-11 h-11 rounded-xl border-2 bg-transparent flex items-center justify-center shrink-0 ${
                    active ? tone.border : "border-[var(--color-border-strong)]"
                  }`}
                >
                  <Icon
                    size={20}
                    className={active ? tone.text : "text-[var(--color-text-muted)]"}
                  />
                </span>

                <span className="min-w-0">
                  <span className="block text-sm font-black text-[var(--color-text)]">
                    {tab.label}
                  </span>
                  <span className="block text-xs font-bold text-[var(--color-text-muted)] mt-0.5">
                    {tab.description}
                  </span>
                </span>
              </button>
            )
          })}
        </div>
      </div>

      <div className="rounded-[2rem] border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
        <h2 className="text-sm font-black text-[var(--color-text-muted)] mb-4">
          {currentLang === "ar" ? "مختصر الحساب" : "Account Snapshot"}
        </h2>

        <div className="space-y-3">
          <MiniStat
            label={currentLang === "ar" ? "مرات الدخول" : "Logins"}
            value={profile?.totalLoginCount ?? 0}
            tone="blue"
          />

          <MiniStat
            label={currentLang === "ar" ? "أيام الحضور" : "Present Days"}
            value={summary?.attendance?.onTimeDays ?? 0}
            tone="emerald"
          />

          <MiniStat
            label={currentLang === "ar" ? "ساعات العمل" : "Worked Hours"}
            value={summary?.hours?.totalWorkedHours ?? 0}
            tone="violet"
          />
        </div>
      </div>
    </aside>
  )
}

function TabHeader({ tabs, activeTab, currentLang }) {
  const active = tabs.find((tab) => tab.id === activeTab)
  const Icon = active?.icon || User
  const tone = getToneClasses(active?.tone || "blue")

  return (
    <div className="rounded-[2rem] border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
      <div className="flex items-center gap-4">
        <div
          className={`w-14 h-14 rounded-2xl border-2 bg-transparent flex items-center justify-center ${tone.border}`}
        >
          <Icon className={`w-7 h-7 ${tone.text}`} />
        </div>

        <div>
          <h2 className="text-2xl font-black text-[var(--color-text)]">
            {active?.label}
          </h2>

          <p className="text-sm font-bold text-[var(--color-text-muted)] mt-1">
            {active?.description ||
              (currentLang === "ar" ? "إدارة البروفايل" : "Manage profile")}
          </p>
        </div>
      </div>
    </div>
  )
}

function OverviewTab({ profile, summary, currentLang }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <HeroMetric
          icon={BadgeCheck}
          label={currentLang === "ar" ? "الدور" : "Role"}
          value={getRoleName(profile, currentLang)}
          tone="blue"
        />

        <HeroMetric
          icon={Stethoscope}
          label={currentLang === "ar" ? "التخصص" : "Category"}
          value={getNestedName(profile?.primaryCategory, currentLang)}
          tone="emerald"
        />

        <HeroMetric
          icon={GraduationCap}
          label={currentLang === "ar" ? "الدرجة" : "Degree"}
          value={getNestedName(profile?.scientificDegree, currentLang)}
          tone="violet"
        />

        <HeroMetric
          icon={Clock}
          label={currentLang === "ar" ? "النشاط" : "Active Time"}
          value={formatActiveTime(profile?.totalActiveTime, currentLang)}
          tone="amber"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 rounded-[2rem] border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
          <SectionTitle
            icon={User}
            title={currentLang === "ar" ? "بيانات الحساب" : "Account Information"}
            subtitle={
              currentLang === "ar"
                ? "البيانات الأساسية المرتبطة بحسابك"
                : "Basic information linked to your account"
            }
            tone="blue"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
            <InfoRow
              icon={User}
              label={currentLang === "ar" ? "الاسم" : "Name"}
              value={getProfileName(profile, currentLang)}
              tone="blue"
            />

            <InfoRow
              icon={Mail}
              label={currentLang === "ar" ? "البريد الإلكتروني" : "Email"}
              value={profile?.email || "-"}
              tone="emerald"
            />

            <InfoRow
              icon={Phone}
              label={currentLang === "ar" ? "رقم الهاتف" : "Mobile"}
              value={profile?.mobile || "-"}
              tone="violet"
            />

            <InfoRow
              icon={ShieldCheck}
              label={currentLang === "ar" ? "الدور" : "Role"}
              value={getRoleName(profile, currentLang)}
              tone="amber"
            />

            <InfoRow
              icon={Stethoscope}
              label={currentLang === "ar" ? "التخصص" : "Primary Category"}
              value={getNestedName(profile?.primaryCategory, currentLang)}
              tone="blue"
            />

            <InfoRow
              icon={GraduationCap}
              label={currentLang === "ar" ? "الدرجة العلمية" : "Scientific Degree"}
              value={getNestedName(profile?.scientificDegree, currentLang)}
              tone="emerald"
            />

            <InfoRow
              icon={Briefcase}
              label={currentLang === "ar" ? "نوع التعاقد" : "Contracting Type"}
              value={getNestedName(profile?.contractingType, currentLang)}
              tone="violet"
            />

            <InfoRow
              icon={Clock}
              label={currentLang === "ar" ? "إجمالي وقت النشاط" : "Total Active Time"}
              value={formatActiveTime(profile?.totalActiveTime, currentLang)}
              tone="amber"
            />
          </div>
        </div>

        <div className="rounded-[2rem] border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
          <SectionTitle
            icon={Activity}
            title={currentLang === "ar" ? "ملخص سريع" : "Quick Summary"}
            subtitle={
              currentLang === "ar"
                ? "أرقام مختصرة من نشاطك"
                : "Quick numbers from your activity"
            }
            tone="emerald"
          />

          <div className="space-y-3 mt-5">
            <MiniStat
              label={currentLang === "ar" ? "مرات تسجيل الدخول" : "Login Count"}
              value={profile?.totalLoginCount ?? 0}
              tone="blue"
            />

            <MiniStat
              label={currentLang === "ar" ? "أيام الحضور" : "Present Days"}
              value={summary?.attendance?.onTimeDays ?? 0}
              tone="emerald"
            />

            <MiniStat
              label={currentLang === "ar" ? "أيام التأخير" : "Late Days"}
              value={summary?.attendance?.lateDays ?? 0}
              tone="amber"
            />

            <MiniStat
              label={currentLang === "ar" ? "إجمالي الساعات" : "Worked Hours"}
              value={summary?.hours?.totalWorkedHours ?? 0}
              tone="violet"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

function EditProfileTab({
  formik,
  currentLang,
  isRTL,
  loading,
  lookupsLoading,
  scientificDegrees,
  contractingTypes,
}) {
  return (
    <form
      onSubmit={formik.handleSubmit}
      className="rounded-[2rem] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 space-y-6"
    >
      <SectionTitle
        icon={Edit3}
        title={currentLang === "ar" ? "تعديل بيانات البروفايل" : "Edit Profile Data"}
        subtitle={
          currentLang === "ar"
            ? "حدث بياناتك الأساسية داخل النظام"
            : "Update your basic data inside the system"
        }
        tone="emerald"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TextField
          id="nameAr"
          label={currentLang === "ar" ? "الاسم العربي" : "Arabic Name"}
          icon={User}
          formik={formik}
          isRTL={isRTL}
        />

        <TextField
          id="nameEn"
          label={currentLang === "ar" ? "الاسم الإنجليزي" : "English Name"}
          icon={User}
          formik={formik}
          isRTL={isRTL}
        />

        <TextField
          id="email"
          label={currentLang === "ar" ? "البريد الإلكتروني" : "Email"}
          icon={Mail}
          formik={formik}
          isRTL={isRTL}
        />

        <TextField
          id="mobile"
          label={currentLang === "ar" ? "رقم الهاتف" : "Mobile"}
          icon={Phone}
          formik={formik}
          isRTL={isRTL}
        />

        <SelectField
          id="scientificDegreeId"
          label={currentLang === "ar" ? "الدرجة العلمية" : "Scientific Degree"}
          icon={GraduationCap}
          formik={formik}
          isRTL={isRTL}
          options={scientificDegrees}
          currentLang={currentLang}
          disabled={lookupsLoading}
        />

        <SelectField
          id="contractorTypeId"
          label={currentLang === "ar" ? "نوع التعاقد" : "Contracting Type"}
          icon={Briefcase}
          formik={formik}
          isRTL={isRTL}
          options={contractingTypes}
          currentLang={currentLang}
          disabled={lookupsLoading}
        />
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--color-success)] px-6 py-3 text-sm font-black text-white border border-emerald-500 hover:bg-[var(--color-success-hover)] disabled:opacity-60"
        >
          {loading ? (
            <>
              <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              {currentLang === "ar" ? "جاري الحفظ..." : "Saving..."}
            </>
          ) : (
            <>
              <CheckCircle size={16} />
              {currentLang === "ar" ? "حفظ التعديلات" : "Save Changes"}
            </>
          )}
        </button>
      </div>
    </form>
  )
}

function SecurityTab({
  formik,
  currentLang,
  isRTL,
  loading,
  showOldPassword,
  showNewPassword,
  showConfirmPassword,
  setShowOldPassword,
  setShowNewPassword,
  setShowConfirmPassword,
}) {
  return (
    <form
      onSubmit={formik.handleSubmit}
      className="rounded-[2rem] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 space-y-6 max-w-4xl"
    >
      <SectionTitle
        icon={ShieldCheck}
        title={currentLang === "ar" ? "الأمان وكلمة المرور" : "Security & Password"}
        subtitle={
          currentLang === "ar"
            ? "غيّر كلمة المرور الخاصة بحسابك"
            : "Change the password for your account"
        }
        tone="violet"
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <PasswordField
          id="oldPassword"
          label={currentLang === "ar" ? "كلمة المرور الحالية" : "Old Password"}
          formik={formik}
          isRTL={isRTL}
          showPassword={showOldPassword}
          setShowPassword={setShowOldPassword}
        />

        <PasswordField
          id="newPassword"
          label={currentLang === "ar" ? "كلمة المرور الجديدة" : "New Password"}
          formik={formik}
          isRTL={isRTL}
          showPassword={showNewPassword}
          setShowPassword={setShowNewPassword}
        />

        <PasswordField
          id="confirmPassword"
          label={currentLang === "ar" ? "تأكيد كلمة المرور" : "Confirm Password"}
          formik={formik}
          isRTL={isRTL}
          showPassword={showConfirmPassword}
          setShowPassword={setShowConfirmPassword}
        />
      </div>

      <div className="rounded-2xl border border-amber-500 bg-amber-500/10 p-4">
        <p className="text-sm font-bold text-amber-500 leading-6">
          {currentLang === "ar"
            ? "استخدم كلمة مرور قوية ولا تشاركها مع أي شخص. بعد تغيير كلمة المرور، يفضل تسجيل الدخول مرة أخرى على أجهزتك."
            : "Use a strong password and never share it. After changing it, consider logging in again on your devices."}
        </p>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--color-success)] px-6 py-3 text-sm font-black text-white border border-emerald-500 hover:bg-[var(--color-success-hover)] disabled:opacity-60"
      >
        {loading ? (
          <>
            <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            {currentLang === "ar" ? "جاري التغيير..." : "Changing..."}
          </>
        ) : (
          <>
            <Lock size={16} />
            {currentLang === "ar" ? "تغيير كلمة المرور" : "Change Password"}
          </>
        )}
      </button>
    </form>
  )
}

function StatisticsTab({ statistics, summary, currentLang, loading }) {
  if (loading) {
    return (
      <LoadingCard
        text={
          currentLang === "ar"
            ? "جاري تحميل الإحصائيات..."
            : "Loading statistics..."
        }
      />
    )
  }

  const data = statistics || summary

  return (
    <div className="space-y-6">
      <div className="rounded-[2rem] border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
        <SectionTitle
          icon={Activity}
          title={currentLang === "ar" ? "الإحصائيات الشخصية" : "Personal Statistics"}
          subtitle={
            currentLang === "ar"
              ? "ملخص الحضور والساعات والالتزام"
              : "Attendance, hours, and performance summary"
          }
          tone="amber"
        />

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-5">
          <HeroMetric
            icon={Clock}
            label={currentLang === "ar" ? "أيام العمل" : "Scheduled Days"}
            value={data?.attendance?.totalScheduledDays ?? 0}
            tone="blue"
          />

          <HeroMetric
            icon={CheckCircle}
            label={currentLang === "ar" ? "حضور في الموعد" : "On Time Days"}
            value={data?.attendance?.onTimeDays ?? 0}
            tone="emerald"
          />

          <HeroMetric
            icon={Activity}
            label={currentLang === "ar" ? "أيام التأخير" : "Late Days"}
            value={data?.attendance?.lateDays ?? 0}
            tone="amber"
          />

          <HeroMetric
            icon={ShieldCheck}
            label={currentLang === "ar" ? "أيام الغياب" : "Absent Days"}
            value={data?.attendance?.absentDays ?? 0}
            tone="red"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MiniStat
          label={currentLang === "ar" ? "الساعات المجدولة" : "Scheduled Hours"}
          value={data?.hours?.totalScheduledHours ?? 0}
          tone="blue"
        />

        <MiniStat
          label={currentLang === "ar" ? "الساعات المنجزة" : "Worked Hours"}
          value={data?.hours?.totalWorkedHours ?? 0}
          tone="emerald"
        />

        <MiniStat
          label={currentLang === "ar" ? "نسبة الإنجاز" : "Completion Rate"}
          value={`${data?.hours?.completionRate ?? 0}%`}
          tone="violet"
        />
      </div>
    </div>
  )
}

function SectionTitle({ icon: Icon, title, subtitle, tone = "blue" }) {
  const toneClass = getToneClasses(tone)

  return (
    <div className="flex items-start gap-3">
      <div
        className={`w-12 h-12 rounded-2xl border-2 bg-transparent flex items-center justify-center shrink-0 ${toneClass.border}`}
      >
        <Icon className={`w-6 h-6 ${toneClass.text}`} />
      </div>

      <div>
        <h2 className="text-xl font-black text-[var(--color-text)]">
          {title}
        </h2>

        {subtitle && (
          <p className="mt-1 text-sm font-bold text-[var(--color-text-muted)]">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  )
}

function HeroMetric({ icon: Icon, label, value, tone = "blue" }) {
  const toneClass = getToneClasses(tone)

  return (
    <div
      className={`rounded-[1.5rem] border border-[var(--color-border)] bg-[var(--color-surface)] p-4 transition-all hover:-translate-y-0.5 ${toneClass.hover}`}
    >
      <div
        className={`w-11 h-11 rounded-xl border-2 bg-transparent flex items-center justify-center mb-4 ${toneClass.border}`}
      >
        <Icon className={`w-5 h-5 ${toneClass.text}`} />
      </div>

      <p className="text-xs font-black text-[var(--color-text-muted)]">
        {label}
      </p>

      <p className={`mt-2 text-lg font-black ${toneClass.text} break-words`}>
        {value || "-"}
      </p>
    </div>
  )
}

function TextField({ id, label, icon: Icon, formik, isRTL }) {
  const hasError = Boolean(formik.touched[id] && formik.errors[id])

  return (
    <div>
      <label className="block text-sm font-black text-[var(--color-text)] mb-2">
        {label}
      </label>

      <div className="relative">
        <span
          className={`absolute top-1/2 -translate-y-1/2 ${
            isRTL ? "right-4" : "left-4"
          }`}
        >
          <Icon className={`w-4 h-4 ${hasError ? "text-red-500" : "text-blue-500"}`} />
        </span>

        <input
          id={id}
          name={id}
          value={formik.values[id]}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          className={`w-full rounded-xl border bg-[var(--color-surface)] text-[var(--color-text)] text-sm font-bold outline-none transition-all focus:ring-4 py-3 ${
            isRTL ? "pr-11 pl-4" : "pl-11 pr-4"
          } ${
            hasError
              ? "border-red-500 focus:ring-red-500/10"
              : "border-[var(--color-border)] focus:border-emerald-500 focus:ring-emerald-500/10"
          }`}
        />
      </div>

      {hasError && (
        <p className="mt-2 text-xs font-black text-red-500">
          {formik.errors[id]}
        </p>
      )}
    </div>
  )
}

function SelectField({
  id,
  label,
  icon: Icon,
  formik,
  isRTL,
  options,
  currentLang,
  disabled,
}) {
  const hasError = Boolean(formik.touched[id] && formik.errors[id])

  return (
    <div>
      <label className="block text-sm font-black text-[var(--color-text)] mb-2">
        {label}
      </label>

      <div className="relative">
        <span
          className={`absolute top-1/2 -translate-y-1/2 ${
            isRTL ? "right-4" : "left-4"
          }`}
        >
          <Icon className={`w-4 h-4 ${hasError ? "text-red-500" : "text-blue-500"}`} />
        </span>

        <select
          id={id}
          name={id}
          value={formik.values[id]}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          disabled={disabled}
          className={`w-full rounded-xl border bg-[var(--color-surface)] text-[var(--color-text)] text-sm font-bold outline-none transition-all focus:ring-4 py-3 disabled:opacity-60 ${
            isRTL ? "pr-11 pl-4" : "pl-11 pr-4"
          } ${
            hasError
              ? "border-red-500 focus:ring-red-500/10"
              : "border-[var(--color-border)] focus:border-emerald-500 focus:ring-emerald-500/10"
          }`}
        >
          <option value="">
            {currentLang === "ar" ? "اختر" : "Select"}
          </option>

          {options.map((item) => (
            <option key={item.id} value={item.id}>
              {getName(item, currentLang)}
            </option>
          ))}
        </select>
      </div>

      {hasError && (
        <p className="mt-2 text-xs font-black text-red-500">
          {formik.errors[id]}
        </p>
      )}
    </div>
  )
}

function PasswordField({
  id,
  label,
  formik,
  isRTL,
  showPassword,
  setShowPassword,
}) {
  const hasError = Boolean(formik.touched[id] && formik.errors[id])

  return (
    <div>
      <label className="block text-sm font-black text-[var(--color-text)] mb-2">
        {label}
      </label>

      <div className="relative">
        <span
          className={`absolute top-1/2 -translate-y-1/2 ${
            isRTL ? "right-4" : "left-4"
          }`}
        >
          <Lock className={`w-4 h-4 ${hasError ? "text-red-500" : "text-blue-500"}`} />
        </span>

        <input
          id={id}
          name={id}
          type={showPassword ? "text" : "password"}
          value={formik.values[id]}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          className={`w-full rounded-xl border bg-[var(--color-surface)] text-[var(--color-text)] text-sm font-bold outline-none transition-all focus:ring-4 py-3 ${
            isRTL ? "pr-11 pl-11" : "pl-11 pr-11"
          } ${
            hasError
              ? "border-red-500 focus:ring-red-500/10"
              : "border-[var(--color-border)] focus:border-emerald-500 focus:ring-emerald-500/10"
          }`}
        />

        <button
          type="button"
          onClick={() => setShowPassword((prev) => !prev)}
          className={`absolute top-1/2 -translate-y-1/2 ${
            isRTL ? "left-4" : "right-4"
          } text-[var(--color-text-muted)] hover:text-blue-500 transition-colors`}
        >
          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>

      {hasError && (
        <p className="mt-2 text-xs font-black text-red-500">
          {formik.errors[id]}
        </p>
      )}
    </div>
  )
}

function InfoRow({ icon: Icon, label, value, tone = "blue" }) {
  const toneClass = getToneClasses(tone)

  return (
    <div
      className={`rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-soft)] p-4 transition-all ${toneClass.hover}`}
    >
      <div
        className={`w-10 h-10 rounded-xl border-2 bg-transparent flex items-center justify-center mb-3 ${toneClass.border}`}
      >
        <Icon className={`w-5 h-5 ${toneClass.text}`} />
      </div>

      <p className="text-xs font-black text-[var(--color-text-muted)]">
        {label}
      </p>

      <p className="mt-1 text-sm font-black text-[var(--color-text)] break-all">
        {value || "-"}
      </p>
    </div>
  )
}

function MiniStat({ label, value, tone = "blue" }) {
  const toneClass = getToneClasses(tone)

  return (
    <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-soft)] p-4">
      <p className="text-xs font-black text-[var(--color-text-muted)]">
        {label}
      </p>

      <p className={`mt-2 text-2xl font-black ${toneClass.text}`}>
        {value}
      </p>
    </div>
  )
}

function Badge({ children, tone = "blue" }) {
  const toneClass = getToneClasses(tone)

  return (
    <span
      className={`inline-flex items-center rounded-full border-2 px-3 py-1 text-xs font-black bg-transparent ${toneClass.text} ${toneClass.border}`}
    >
      {children}
    </span>
  )
}

function LoadingCard({ text }) {
  return (
    <div className="rounded-[2rem] border border-[var(--color-border)] bg-[var(--color-surface)] p-10 text-center">
      <div className="w-10 h-10 mx-auto border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />

      <p className="mt-4 text-sm font-black text-[var(--color-text-muted)]">
        {text}
      </p>
    </div>
  )
}

export default MyProfilePage