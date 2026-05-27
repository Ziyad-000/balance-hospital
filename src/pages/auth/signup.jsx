"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import { useFormik } from "formik"
import * as Yup from "yup"
import { useTranslation } from "react-i18next"
import { toast } from "react-toastify"
import Swal from "sweetalert2"
import i18next from "i18next"
import {
  ArrowLeft,
  ArrowRight,
  Briefcase,
  Camera,
  CheckCircle,
  Eye,
  EyeOff,
  GraduationCap,
  IdCard,
  Lock,
  Mail,
  Phone,
  ShieldCheck,
  Stethoscope,
  User,
  UserPlus,
} from "lucide-react"

import axiosInstance from "../../utils/axiosInstance"
import { registerUser } from "../../state/act/actAuth"
import { getPageTheme } from "../../utils/themeClasses"

const getApiList = (payload) => {
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.data)) return payload.data
  if (Array.isArray(payload?.data?.items)) return payload.data.items
  if (Array.isArray(payload?.items)) return payload.items
  if (Array.isArray(payload?.result)) return payload.result
  return []
}

const getItemName = (item, currentLang) => {
  if (!item) return "-"

  if (currentLang === "ar") {
    return (
      item.nameArabic ||
      item.nameAr ||
      item.categoryNameAr ||
      item.degreeNameAr ||
      item.contractingTypeNameAr ||
      item.name ||
      item.nameEnglish ||
      item.nameEn ||
      "-"
    )
  }

  return (
    item.nameEnglish ||
    item.nameEn ||
    item.categoryNameEn ||
    item.degreeNameEn ||
    item.contractingTypeNameEn ||
    item.name ||
    item.nameArabic ||
    item.nameAr ||
    "-"
  )
}

const getErrorMessage = (error, currentLang, fallback) => {
  const data = error?.data || error?.response?.data || error?.raw?.response?.data

  if (currentLang === "ar") {
    return (
      data?.messageAr ||
      error?.message ||
      data?.message ||
      error?.response?.data?.messageAr ||
      fallback
    )
  }

  return (
    data?.messageEn ||
    error?.message ||
    data?.message ||
    error?.response?.data?.messageEn ||
    fallback
  )
}

const getApiMessage = (payload, currentLang, fallback) => {
  return currentLang === "ar"
    ? payload?.messageAr ||
        payload?.data?.messageAr ||
        payload?.message ||
        fallback
    : payload?.messageEn ||
        payload?.data?.messageEn ||
        payload?.message ||
        fallback
}

const normalizeOptionalId = (value) => {
  if (!value || value === "0" || value === 0) return null
  return Number(value)
}

const initialValues = {
  nameArabic: "",
  nameEnglish: "",
  email: "",
  mobile: "",
  nationalId: "",
  printNumber: "",
  primaryCategoryId: "",
  scientificDegreeId: "",
  contractingTypeId: "",
  password: "",
  confirmPassword: "",
  profileImage: null,
}

function SignUp() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [focusedField, setFocusedField] = useState(null)
  const [preview, setPreview] = useState(null)

  const [categories, setCategories] = useState([])
  const [scientificDegrees, setScientificDegrees] = useState([])
  const [contractingTypes, setContractingTypes] = useState([])
  const [lookupsLoading, setLookupsLoading] = useState(false)
  const [lookupsError, setLookupsError] = useState("")

  const fileInputRef = useRef(null)

  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const theme = getPageTheme()

  const { loadingAuth } = useSelector((state) => state.auth)
  const { mymode } = useSelector((state) => state.mode)

  const currentLang = i18next.language || "ar"
  const isRTL = currentLang === "ar"
  const isDark = mymode === "dark"

  const validationSchema = useMemo(() => {
    return Yup.object({
      nameArabic: Yup.string()
        .trim()
        .matches(
          /[\u0600-\u06FF]/,
          currentLang === "ar"
            ? "الاسم العربي يجب أن يحتوي على حروف عربية"
            : "Arabic name must contain Arabic letters"
        )
        .max(
          255,
          currentLang === "ar"
            ? "الاسم العربي لا يمكن أن يزيد عن 255 حرف"
            : "Arabic name cannot exceed 255 characters"
        )
        .required(
          currentLang === "ar" ? "الاسم العربي مطلوب" : "Arabic name is required"
        ),

      nameEnglish: Yup.string()
        .trim()
        .matches(
          /^[A-Za-z\s.'-]+$/,
          currentLang === "ar"
            ? "الاسم الإنجليزي يجب أن يكون بحروف إنجليزية"
            : "English name must contain English letters only"
        )
        .max(
          255,
          currentLang === "ar"
            ? "الاسم الإنجليزي لا يمكن أن يزيد عن 255 حرف"
            : "English name cannot exceed 255 characters"
        )
        .required(
          currentLang === "ar"
            ? "الاسم الإنجليزي مطلوب"
            : "English name is required"
        ),

      email: Yup.string()
        .trim()
        .email(
          currentLang === "ar"
            ? "صيغة البريد الإلكتروني غير صحيحة"
            : "Invalid email format"
        )
        .max(
          255,
          currentLang === "ar"
            ? "البريد الإلكتروني لا يمكن أن يزيد عن 255 حرف"
            : "Email cannot exceed 255 characters"
        )
        .required(
          currentLang === "ar"
            ? "البريد الإلكتروني مطلوب"
            : "Email is required"
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

      nationalId: Yup.string()
        .trim()
        .matches(
          /^[0-9]{14,20}$/,
          currentLang === "ar"
            ? "الرقم القومي يجب أن يكون من 14 إلى 20 رقم"
            : "National ID must be 14 to 20 digits"
        )
        .required(
          currentLang === "ar" ? "الرقم القومي مطلوب" : "National ID is required"
        ),

      printNumber: Yup.number()
        .typeError(
          currentLang === "ar"
            ? "رقم الطباعة يجب أن يكون رقمًا"
            : "Print number must be a number"
        )
        .integer(
          currentLang === "ar"
            ? "رقم الطباعة يجب أن يكون رقمًا صحيحًا"
            : "Print number must be an integer"
        )
        .positive(
          currentLang === "ar"
            ? "رقم الطباعة يجب أن يكون أكبر من صفر"
            : "Print number must be positive"
        )
        .required(
          currentLang === "ar" ? "رقم الطباعة مطلوب" : "Print number is required"
        ),

      primaryCategoryId: Yup.string().required(
        currentLang === "ar" ? "التخصص مطلوب" : "Category is required"
      ),

      scientificDegreeId: Yup.string().required(
        currentLang === "ar" ? "الدرجة العلمية مطلوبة" : "Scientific degree is required"
      ),

      contractingTypeId: Yup.string().required(
        currentLang === "ar" ? "نوع التعاقد مطلوب" : "Contracting type is required"
      ),

      password: Yup.string()
        .min(
          8,
          currentLang === "ar"
            ? "كلمة المرور يجب ألا تقل عن 8 أحرف"
            : "Password must be at least 8 characters"
        )
        .max(
          100,
          currentLang === "ar"
            ? "كلمة المرور لا يمكن أن تزيد عن 100 حرف"
            : "Password cannot exceed 100 characters"
        )
        .matches(
          /[A-Z]/,
          currentLang === "ar"
            ? "كلمة المرور يجب أن تحتوي على حرف كبير"
            : "Password must contain an uppercase letter"
        )
        .matches(
          /[a-z]/,
          currentLang === "ar"
            ? "كلمة المرور يجب أن تحتوي على حرف صغير"
            : "Password must contain a lowercase letter"
        )
        .matches(
          /[0-9]/,
          currentLang === "ar"
            ? "كلمة المرور يجب أن تحتوي على رقم"
            : "Password must contain a number"
        )
        .required(
          currentLang === "ar" ? "كلمة المرور مطلوبة" : "Password is required"
        ),

      confirmPassword: Yup.string()
        .oneOf(
          [Yup.ref("password")],
          currentLang === "ar"
            ? "كلمة المرور وتأكيدها غير متطابقين"
            : "Password and confirmation do not match"
        )
        .required(
          currentLang === "ar"
            ? "تأكيد كلمة المرور مطلوب"
            : "Password confirmation is required"
        ),
    })
  }, [currentLang])

  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: async (values) => {
      try {
        const payload = {
          nameArabic: values.nameArabic.trim(),
          nameEnglish: values.nameEnglish.trim(),
          email: values.email.trim(),
          mobile: values.mobile.trim(),
          nationalId: values.nationalId.trim(),
          password: values.password,
          printNumber: Number(values.printNumber),
          primaryCategoryId: normalizeOptionalId(values.primaryCategoryId),
          scientificDegreeId: normalizeOptionalId(values.scientificDegreeId),
          contractingTypeId: normalizeOptionalId(values.contractingTypeId),
        }

        const response = await dispatch(registerUser(payload)).unwrap()

        toast.success(
          getApiMessage(
            response,
            currentLang,
            currentLang === "ar"
              ? "تم إنشاء الحساب بنجاح"
              : "Account created successfully"
          ),
          {
            position: "top-right",
            autoClose: 2500,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          }
        )

        localStorage.setItem("pendingVerificationEmail", values.email.trim())
        localStorage.setItem("pendingVerificationMobile", values.mobile.trim())
        localStorage.setItem("signupEmail", values.email.trim())
        localStorage.setItem("signupMobile", values.mobile.trim())

        navigate("/verify-email", {
          state: {
            email: values.email.trim(),
            mobile: values.mobile.trim(),
          },
        })      
      }
       catch (error) {
        Swal.fire({
          title:
            currentLang === "ar"
              ? "تعذر إنشاء الحساب"
              : "Failed to create account",
          text: getErrorMessage(
            error,
            currentLang,
            currentLang === "ar"
              ? "راجع البيانات وحاول مرة أخرى"
              : "Please check your data and try again"
          ),
          icon: "error",
          confirmButtonText: t("common.ok") || "OK",
          confirmButtonColor: "#ef4444",
          background: isDark ? "#111827" : "#ffffff",
          color: isDark ? "#f9fafb" : "#111827",
        })
      }
    },
  })

  useEffect(() => {
    fetchLookups()
  }, [])

  const fetchLookups = async () => {
    try {
      setLookupsLoading(true)
      setLookupsError("")

      const [categoriesRes, degreesRes, contractingRes] = await Promise.all([
        axiosInstance.get("/api/v1/Category/categories-types"),
        axiosInstance.get("/api/v1/ScientificDegree/scientific-degrees"),
        axiosInstance.get("/api/v1/ContractingType/contracting-types"),
      ])

      setCategories(getApiList(categoriesRes.data))
      setScientificDegrees(getApiList(degreesRes.data))
      setContractingTypes(getApiList(contractingRes.data))
    } catch (error) {
      setLookupsError(
        currentLang === "ar"
          ? "تعذر تحميل القوائم. يمكنك تحديث الصفحة والمحاولة مرة أخرى."
          : "Failed to load lookup lists. Refresh the page and try again."
      )
    } finally {
      setLookupsLoading(false)
    }
  }

  const handleImageChange = (event) => {
    const file = event.target.files?.[0]

    if (!file) return

    formik.setFieldValue("profileImage", file)

    const reader = new FileReader()
    reader.onloadend = () => {
      setPreview(reader.result)
    }
    reader.readAsDataURL(file)
  }

  const fieldHasError = (field) => Boolean(formik.touched[field] && formik.errors[field])

  const getIconClass = (field, hasValue) => {
    if (fieldHasError(field)) return "text-red-500"
    if (focusedField === field) return "text-blue-500"
    if (hasValue) return "text-emerald-500"
    return "text-slate-500"
  }

  return (
    <div className={theme.page} dir={isRTL ? "rtl" : "ltr"}>
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-7xl grid grid-cols-1 xl:grid-cols-[0.9fr_1.3fr] gap-6 items-stretch">
          <div className={`${theme.card} rounded-3xl p-8 sm:p-10 relative overflow-hidden`}>
            <div className="absolute inset-0 pointer-events-none opacity-40">
              <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-blue-500/10 blur-3xl" />
              <div className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-emerald-500/10 blur-3xl" />
            </div>

            <div className="relative h-full flex flex-col justify-between">
              <div>
                <div className="w-16 h-16 rounded-3xl border-2 border-blue-500 bg-transparent flex items-center justify-center mb-6">
                  <UserPlus className="w-8 h-8 text-blue-500" />
                </div>

                <h1 className="text-3xl sm:text-4xl font-black text-[var(--color-text)]">
                  {currentLang === "ar" ? "إنشاء حساب جديد" : "Create new account"}
                </h1>

                <p className="mt-4 text-sm sm:text-base font-bold leading-7 text-[var(--color-text-muted)]">
                  {currentLang === "ar"
                    ? "أدخل بيانات الطبيب أو المستخدم الجديد بدقة. بعد التسجيل قد يحتاج الحساب إلى موافقة أو تفعيل حسب إعدادات النظام."
                    : "Enter the doctor or user details carefully. After registration, the account may require approval or verification depending on system settings."}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-8">
                <InfoCard
                  icon={Stethoscope}
                  title={currentLang === "ar" ? "التخصص" : "Category"}
                  value={currentLang === "ar" ? "مطلوب" : "Required"}
                  tone="blue"
                />

                <InfoCard
                  icon={GraduationCap}
                  title={currentLang === "ar" ? "الدرجة" : "Degree"}
                  value={currentLang === "ar" ? "مطلوبة" : "Required"}
                  tone="emerald"
                />

                <InfoCard
                  icon={ShieldCheck}
                  title={currentLang === "ar" ? "الأمان" : "Security"}
                  value={currentLang === "ar" ? "محمي" : "Protected"}
                  tone="violet"
                />
              </div>

              <div className="mt-8 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-soft)] p-4">
                <p className="text-xs font-black text-[var(--color-text-muted)]">
                  {currentLang === "ar" ? "مهم" : "Important"}
                </p>

                <p className="mt-1 text-sm font-bold text-[var(--color-text)] leading-6">
                  {currentLang === "ar"
                    ? "البريد الإلكتروني ورقم الهاتف مطلوبان في الـ backend، لذلك يجب إدخال الاثنين."
                    : "Both email and mobile are required by the backend, so both must be entered."}
                </p>
              </div>
            </div>
          </div>

          <div className={`${theme.card} rounded-3xl p-6 sm:p-8`}>
            <div className="mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl border-2 border-emerald-500 bg-transparent flex items-center justify-center">
                  <UserPlus className="w-6 h-6 text-emerald-500" />
                </div>

                <div>
                  <h2 className="text-2xl font-black text-[var(--color-text)]">
                    {currentLang === "ar" ? "بيانات الحساب" : "Account Details"}
                  </h2>

                  <p className="text-sm font-bold text-[var(--color-text-muted)] mt-1">
                    {currentLang === "ar"
                      ? "املأ البيانات المطلوبة لإنشاء الحساب"
                      : "Fill in the required data to create the account"}
                  </p>
                </div>
              </div>
            </div>

            {lookupsError && (
              <div className="mb-5 rounded-2xl border-2 border-amber-500 bg-transparent p-4">
                <p className="text-sm font-black text-amber-500">
                  {lookupsError}
                </p>
              </div>
            )}

            <form onSubmit={formik.handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <TextField
                  id="nameArabic"
                  label={currentLang === "ar" ? "الاسم العربي" : "Arabic Name"}
                  icon={User}
                  value={formik.values.nameArabic}
                  error={formik.errors.nameArabic}
                  touched={formik.touched.nameArabic}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  onFocus={() => setFocusedField("nameArabic")}
                  iconClass={getIconClass("nameArabic", formik.values.nameArabic)}
                  isRTL={isRTL}
                  placeholder={currentLang === "ar" ? "مثال: أحمد محمد" : "Example: أحمد محمد"}
                />

                <TextField
                  id="nameEnglish"
                  label={currentLang === "ar" ? "الاسم الإنجليزي" : "English Name"}
                  icon={User}
                  value={formik.values.nameEnglish}
                  error={formik.errors.nameEnglish}
                  touched={formik.touched.nameEnglish}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  onFocus={() => setFocusedField("nameEnglish")}
                  iconClass={getIconClass("nameEnglish", formik.values.nameEnglish)}
                  isRTL={isRTL}
                  placeholder="Example: Ahmed Mohamed"
                />

                <TextField
                  id="email"
                  label={currentLang === "ar" ? "البريد الإلكتروني" : "Email"}
                  icon={Mail}
                  iconClass="text-blue-500"
                  value={formik.values.email}
                  error={formik.errors.email}
                  touched={formik.touched.email}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  onFocus={() => setFocusedField("email")}
                  isRTL={isRTL}
                  placeholder="example@email.com"
                />

                <TextField
                  id="mobile"
                  label={currentLang === "ar" ? "رقم الهاتف" : "Mobile"}
                  icon={Phone}
                  iconClass="text-emerald-500"
                  value={formik.values.mobile}
                  error={formik.errors.mobile}
                  touched={formik.touched.mobile}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  onFocus={() => setFocusedField("mobile")}
                  isRTL={isRTL}
                  placeholder="010xxxxxxxx"
                />

                <TextField
                  id="nationalId"
                  label={currentLang === "ar" ? "الرقم القومي" : "National ID"}
                  icon={IdCard}
                  value={formik.values.nationalId}
                  error={formik.errors.nationalId}
                  touched={formik.touched.nationalId}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  onFocus={() => setFocusedField("nationalId")}
                  iconClass={getIconClass("nationalId", formik.values.nationalId)}
                  isRTL={isRTL}
                  placeholder={currentLang === "ar" ? "14 رقم أو أكثر حسب النظام" : "14 digits or more"}
                />

                <TextField
                  id="printNumber"
                  label={currentLang === "ar" ? "رقم الطباعة" : "Print Number"}
                  icon={IdCard}
                  type="number"
                  value={formik.values.printNumber}
                  error={formik.errors.printNumber}
                  touched={formik.touched.printNumber}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  onFocus={() => setFocusedField("printNumber")}
                  iconClass={getIconClass("printNumber", formik.values.printNumber)}
                  isRTL={isRTL}
                  placeholder="1"
                />

                <SelectField
                  id="primaryCategoryId"
                  label={currentLang === "ar" ? "التخصص" : "Category"}
                  icon={Stethoscope}
                  value={formik.values.primaryCategoryId}
                  error={formik.errors.primaryCategoryId}
                  touched={formik.touched.primaryCategoryId}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  onFocus={() => setFocusedField("primaryCategoryId")}
                  iconClass={getIconClass(
                    "primaryCategoryId",
                    formik.values.primaryCategoryId
                  )}
                  isRTL={isRTL}
                  disabled={lookupsLoading}
                  options={categories}
                  currentLang={currentLang}
                  placeholder={
                    lookupsLoading
                      ? currentLang === "ar"
                        ? "جاري التحميل..."
                        : "Loading..."
                      : currentLang === "ar"
                      ? "اختر التخصص"
                      : "Select category"
                  }
                />

                <SelectField
                  id="scientificDegreeId"
                  label={currentLang === "ar" ? "الدرجة العلمية" : "Scientific Degree"}
                  icon={GraduationCap}
                  value={formik.values.scientificDegreeId}
                  error={formik.errors.scientificDegreeId}
                  touched={formik.touched.scientificDegreeId}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  onFocus={() => setFocusedField("scientificDegreeId")}
                  iconClass={getIconClass(
                    "scientificDegreeId",
                    formik.values.scientificDegreeId
                  )}
                  isRTL={isRTL}
                  disabled={lookupsLoading}
                  options={scientificDegrees}
                  currentLang={currentLang}
                  placeholder={
                    lookupsLoading
                      ? currentLang === "ar"
                        ? "جاري التحميل..."
                        : "Loading..."
                      : currentLang === "ar"
                      ? "اختر الدرجة العلمية"
                      : "Select scientific degree"
                  }
                />

                <SelectField
                  id="contractingTypeId"
                  label={currentLang === "ar" ? "نوع التعاقد" : "Contracting Type"}
                  icon={Briefcase}
                  value={formik.values.contractingTypeId}
                  error={formik.errors.contractingTypeId}
                  touched={formik.touched.contractingTypeId}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  onFocus={() => setFocusedField("contractingTypeId")}
                  iconClass={getIconClass(
                    "contractingTypeId",
                    formik.values.contractingTypeId
                  )}
                  isRTL={isRTL}
                  disabled={lookupsLoading}
                  options={contractingTypes}
                  currentLang={currentLang}
                  placeholder={
                    lookupsLoading
                      ? currentLang === "ar"
                        ? "جاري التحميل..."
                        : "Loading..."
                      : currentLang === "ar"
                      ? "اختر نوع التعاقد"
                      : "Select contracting type"
                  }
                />

                <ImageUpload
                  preview={preview}
                  fileInputRef={fileInputRef}
                  onChange={handleImageChange}
                  currentLang={currentLang}
                />

                <PasswordField
                  id="password"
                  label={currentLang === "ar" ? "كلمة المرور" : "Password"}
                  value={formik.values.password}
                  error={formik.errors.password}
                  touched={formik.touched.password}
                  showPassword={showPassword}
                  setShowPassword={setShowPassword}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  onFocus={() => setFocusedField("password")}
                />

                <PasswordField
                  id="confirmPassword"
                  label={currentLang === "ar" ? "تأكيد كلمة المرور" : "Confirm Password"}
                  value={formik.values.confirmPassword}
                  error={formik.errors.confirmPassword}
                  touched={formik.touched.confirmPassword}
                  showPassword={showConfirmPassword}
                  setShowPassword={setShowConfirmPassword}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  onFocus={() => setFocusedField("confirmPassword")}
                />
              </div>

              <div className="flex flex-col gap-3 pt-2">
                <button
                  type="submit"
                  disabled={loadingAuth || formik.isSubmitting || lookupsLoading}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--color-success)] px-6 py-3 text-sm font-black text-white border border-emerald-500 shadow-sm transition-all hover:bg-[var(--color-success-hover)] disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loadingAuth || formik.isSubmitting ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      {currentLang === "ar" ? "جاري إنشاء الحساب..." : "Creating account..."}
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      {currentLang === "ar" ? "إنشاء الحساب" : "Create Account"}
                    </>
                  )}
                </button>

                <Link
                  to="/login"
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--color-border-strong)] bg-[var(--color-surface)] px-4 py-2.5 text-sm font-black text-[var(--color-text)] hover:bg-[var(--color-success)] hover:text-white hover:border-emerald-500 transition-colors"
                >
                  {isRTL ? (
                    <ArrowRight className="w-4 h-4 text-blue-500" />
                  ) : (
                    <ArrowLeft className="w-4 h-4 text-blue-500" />
                  )}
                  {currentLang === "ar" ? "لديك حساب؟ سجل الدخول" : "Already have an account? Login"}
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

function TextField({
  id,
  label,
  icon: Icon,
  iconClass = "text-slate-500",
  value,
  error,
  touched,
  onChange,
  onBlur,
  onFocus,
  isRTL,
  placeholder,
  type = "text",
}) {
  const hasError = Boolean(touched && error)

  return (
    <div>
      <label
        htmlFor={id}
        className="block text-sm font-black text-[var(--color-text)] mb-2"
      >
        {label}
      </label>

      <div
        className={`flex items-stretch rounded-xl border transition-all focus-within:ring-4 ${
          hasError
            ? "border-red-500 focus-within:ring-red-500/10"
            : "border-[var(--color-border)] focus-within:border-emerald-500 focus-within:ring-emerald-500/10"
        }`}
      >
        <div className="flex items-center justify-center px-3 bg-[var(--color-bg-soft)] border-e border-[var(--color-border)] rounded-s-xl shrink-0">
          <Icon className={`w-4 h-4 ${iconClass}`} />
        </div>

        <input
          id={id}
          name={id}
          type={type}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          onFocus={onFocus}
          placeholder={placeholder}
          className="flex-1 min-w-0 bg-transparent text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] text-sm font-bold outline-none px-3 py-3"
        />
      </div>

      {hasError && (
        <p className="mt-2 text-xs font-black text-red-500">{error}</p>
      )}
    </div>
  )
}

function SelectField({
  id,
  label,
  icon: Icon,
  iconClass = "text-slate-500",
  value,
  error,
  touched,
  onChange,
  onBlur,
  onFocus,
  isRTL,
  options,
  currentLang,
  placeholder,
  disabled,
}) {
  const hasError = Boolean(touched && error)

  return (
    <div>
      <label
        htmlFor={id}
        className="block text-sm font-black text-[var(--color-text)] mb-2"
      >
        {label}
      </label>

      <div
        className={`flex items-stretch rounded-xl border transition-all focus-within:ring-4 ${
          hasError
            ? "border-red-500 focus-within:ring-red-500/10"
            : "border-[var(--color-border)] focus-within:border-emerald-500 focus-within:ring-emerald-500/10"
        }`}
      >
        <div className="flex items-center justify-center px-3 bg-[var(--color-bg-soft)] border-e border-[var(--color-border)] rounded-s-xl shrink-0">
          <Icon className={`w-4 h-4 ${iconClass}`} />
        </div>

        <select
          id={id}
          name={id}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          onFocus={onFocus}
          disabled={disabled}
          className="flex-1 min-w-0 bg-[var(--color-surface)] text-[var(--color-text)] text-sm font-bold outline-none px-3 py-3 disabled:opacity-60 disabled:cursor-not-allowed rounded-e-xl"
        >
          <option value="">{placeholder}</option>

          {options.map((item) => (
            <option key={item.id} value={item.id}>
              {getItemName(item, currentLang)}
            </option>
          ))}
        </select>
      </div>

      {hasError && (
        <p className="mt-2 text-xs font-black text-red-500">{error}</p>
      )}
    </div>
  )
}

function PasswordField({
  id,
  label,
  value,
  error,
  touched,
  showPassword,
  setShowPassword,
  onChange,
  onBlur,
  onFocus,
}) {
  const hasError = Boolean(touched && error)

  return (
    <div>
      <label
        htmlFor={id}
        className="block text-sm font-black text-[var(--color-text)] mb-2"
      >
        {label}
      </label>

      <div
        className={`flex items-stretch rounded-xl border transition-all focus-within:ring-4 ${
          hasError
            ? "border-red-500 focus-within:ring-red-500/10"
            : "border-[var(--color-border)] focus-within:border-emerald-500 focus-within:ring-emerald-500/10"
        }`}
      >
        <div className="flex items-center justify-center px-3 bg-[var(--color-bg-soft)] border-e border-[var(--color-border)] rounded-s-xl shrink-0">
          <Lock className="w-4 h-4 text-slate-500" />
        </div>

        <input
          id={id}
          name={id}
          type={showPassword ? "text" : "password"}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          onFocus={onFocus}
          autoComplete="new-password"
          className="flex-1 min-w-0 bg-transparent text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] text-sm font-bold outline-none px-3 py-3"
        />

        <button
          type="button"
          onClick={() => setShowPassword((prev) => !prev)}
          className="flex items-center justify-center px-3 bg-[var(--color-bg-soft)] border-s border-[var(--color-border)] rounded-e-xl shrink-0 text-[var(--color-text-muted)] hover:text-blue-500 transition-colors"
        >
          {showPassword ? (
            <EyeOff className="w-4 h-4" />
          ) : (
            <Eye className="w-4 h-4" />
          )}
        </button>
      </div>

      {hasError && (
        <p className="mt-2 text-xs font-black text-red-500">{error}</p>
      )}
    </div>
  )
}

function ImageUpload({ preview, fileInputRef, onChange, currentLang }) {
  return (
    <div>
      <label className="block text-sm font-black text-[var(--color-text)] mb-2">
        {currentLang === "ar" ? "الصورة الشخصية" : "Profile Image"}
      </label>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={onChange}
        className="hidden"
      />

      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        className="w-full h-[118px] rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] hover:border-emerald-500 transition-all flex items-center justify-center overflow-hidden"
      >
        {preview ? (
          <img
            src={preview}
            alt="Preview"
            className="w-24 h-24 object-cover rounded-2xl border border-[var(--color-border)]"
          />
        ) : (
          <div className="text-center">
            <div className="w-11 h-11 mx-auto rounded-xl border-2 border-blue-500 bg-transparent flex items-center justify-center">
              <Camera className="w-5 h-5 text-blue-500" />
            </div>

            <p className="mt-2 text-xs font-black text-[var(--color-text-muted)]">
              {currentLang === "ar" ? "اختيار صورة" : "Choose image"}
            </p>
          </div>
        )}
      </button>

      <p className="mt-2 text-xs font-bold text-amber-500">
        {currentLang === "ar"
          ? "ملاحظة: الصورة للمعاينة فقط حاليًا، لأن register في الـ backend يستقبل JSON وليس FormData."
          : "Note: image is preview-only for now because backend register currently accepts JSON, not FormData."}
      </p>
    </div>
  )
}

function InfoCard({ icon: Icon, title, value, tone = "blue" }) {
  const toneMap = {
    blue: {
      box: "border-blue-500",
      icon: "text-blue-500",
      value: "text-blue-500",
    },
    emerald: {
      box: "border-emerald-500",
      icon: "text-emerald-500",
      value: "text-emerald-500",
    },
    violet: {
      box: "border-violet-500",
      icon: "text-violet-500",
      value: "text-violet-500",
    },
  }

  const selectedTone = toneMap[tone] || toneMap.blue

  return (
    <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
      <div
        className={`w-10 h-10 rounded-xl border-2 ${selectedTone.box} bg-transparent flex items-center justify-center mb-3`}
      >
        <Icon className={`w-5 h-5 ${selectedTone.icon}`} />
      </div>

      <p className="text-xs font-black text-[var(--color-text-muted)]">
        {title}
      </p>

      <p className={`text-sm font-black mt-1 ${selectedTone.value}`}>
        {value}
      </p>
    </div>
  )
}

export default SignUp