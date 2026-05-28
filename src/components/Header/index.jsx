import { Link, useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { useDispatch, useSelector } from "react-redux"
import { LogOut, UserCircle } from "lucide-react"
import i18next from "i18next"

import LanguageToggle from "./lang"
import logo from "../../assets/logo.jpg"
import Mode from "./mode"
import { AnimatedLogo } from "./AnimatedLogo"
import { logOut } from "../../state/slices/auth"
import NotificationBell from "../notifications/notificationBell"

const Header = () => {
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const token = useSelector((state) => state.auth.token)

  const language = i18next.language
  const isRTL = language === "ar"

  const handleLogOut = () => {
    dispatch(logOut())
    navigate("/login")
  }

  return (
    <header
      className="sticky top-0 z-50 w-full"
      style={{
        background: "var(--color-surface)",
        borderBottom: "1px solid var(--color-border)",
        boxShadow: "var(--shadow-sm)",
      }}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* ── Logo ── */}
          <div className="flex-shrink-0">
            <Link
              to={token ? "/admin-panel" : "/"}
              className="block rounded-xl transition-all duration-200 focus:outline-none"
              style={{ outline: "none" }}
              onFocus={(e) =>
                (e.currentTarget.style.boxShadow =
                  "0 0 0 3px var(--color-ring)")
              }
              onBlur={(e) => (e.currentTarget.style.boxShadow = "none")}
            >
              <AnimatedLogo
                showText={true}
                text="Balance"
                size="medium"
                logoSrc={logo}
                alt="Balance Logo"
                useImage={true}
                className="py-1 px-2 -mx-2 rounded-xl"
              />
            </Link>
          </div>

          {/* ── Actions ── */}
          <div className="flex items-center gap-2 sm:gap-3">
            {token ? (
              <>
                {/* Notifications */}
                <NotificationBell />

                {/* Profile */}
                <Link
                  to="/admin-panel/profile"
                  title={language === "ar" ? "البروفايل" : "Profile"}
                  className="group inline-flex items-center justify-center gap-2 rounded-xl px-3 sm:px-4 py-2 text-sm font-semibold transition-all duration-200 active:scale-95"
                  style={{
                    background: "var(--color-surface-muted)",
                    color: "var(--color-text)",
                    border: "1px solid var(--color-border-strong)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "var(--color-primary)"
                    e.currentTarget.style.color = "#fff"
                    e.currentTarget.style.borderColor = "var(--color-primary)"
                    e.currentTarget.style.boxShadow =
                      "0 4px 14px rgba(37,99,235,0.25)"
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background =
                      "var(--color-surface-muted)"
                    e.currentTarget.style.color = "var(--color-text)"
                    e.currentTarget.style.borderColor =
                      "var(--color-border-strong)"
                    e.currentTarget.style.boxShadow = "none"
                  }}
                >
                  <UserCircle
                    size={18}
                    className="transition-transform duration-200 group-hover:scale-110"
                  />
                  <span className="hidden sm:inline">
                    {language === "ar" ? "البروفايل" : "Profile"}
                  </span>
                </Link>

                {/* Logout */}
                <button
                  type="button"
                  onClick={handleLogOut}
                  className="group inline-flex items-center justify-center gap-2 rounded-xl px-3 sm:px-5 py-2 text-sm font-semibold transition-all duration-200 active:scale-95 min-w-[44px] sm:min-w-[120px]"
                  style={{
                    background: "var(--color-danger-soft)",
                    color: "var(--color-danger)",
                    border: "1px solid var(--color-danger-border)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "var(--color-danger)"
                    e.currentTarget.style.color = "#fff"
                    e.currentTarget.style.borderColor = "var(--color-danger)"
                    e.currentTarget.style.boxShadow =
                      "0 4px 14px rgba(220,38,38,0.3)"
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background =
                      "var(--color-danger-soft)"
                    e.currentTarget.style.color = "var(--color-danger)"
                    e.currentTarget.style.borderColor =
                      "var(--color-danger-border)"
                    e.currentTarget.style.boxShadow = "none"
                  }}
                >
                  <LogOut
                    size={18}
                    className={`transition-transform duration-200 group-hover:translate-x-0.5 ${
                      isRTL ? "ml-1 rotate-180" : "mr-1"
                    }`}
                  />
                  <span className="hidden sm:inline tracking-wide">
                    {t("logOut") || (language === "ar" ? "خروج" : "Logout")}
                  </span>
                </button>
              </>
            ) : (
              <Link to="/login">
                <button
                  type="button"
                  className="inline-flex items-center justify-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold text-white transition-all duration-200 active:scale-95"
                  style={{
                    background: "var(--color-primary)",
                    border: "1px solid var(--color-primary)",
                    boxShadow: "0 2px 8px var(--color-ring)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background =
                      "var(--color-primary-hover)"
                    e.currentTarget.style.boxShadow =
                      "0 4px 16px var(--color-ring)"
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "var(--color-primary)"
                    e.currentTarget.style.boxShadow =
                      "0 2px 8px var(--color-ring)"
                  }}
                >
                  {t("get-started") ||
                    (language === "ar" ? "ابدأ الآن" : "Get Started")}
                </button>
              </Link>
            )}

            {/* ── Divider ── */}
            <div
              className="hidden sm:block h-6 w-px"
              style={{ background: "var(--color-border)" }}
            />

            {/* Language Toggle */}
            <LanguageToggle variant="icon" />

            {/* Dark / Light Mode */}
            <Mode />
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header