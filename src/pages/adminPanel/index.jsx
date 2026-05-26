// Updated AdminPanel.jsx
import { useEffect, useState } from "react"
import { Outlet } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { useSelector } from "react-redux"

import DrawerComponent from "../../components/drawer"
import UseDirection from "../../hooks/use-direction"
import { withGuard } from "../../utils/withGuard"

function AdminPanel() {
  const [isDrawerExpanded, setIsDrawerExpanded] = useState(false)
  const [drawerWidth] = useState("w-60")
  const [, forceRender] = useState({})

  const { direction } = UseDirection()
  const { i18n } = useTranslation()
  const { mymode } = useSelector((state) => state.mode)

  const isDark = mymode === "dark"

  useEffect(() => {
    forceRender({})
  }, [direction.direction])

  useEffect(() => {
    const handleLanguageChange = () => {
      forceRender({})
    }

    i18n.on("languageChanged", handleLanguageChange)

    return () => {
      i18n.off("languageChanged", handleLanguageChange)
    }
  }, [i18n])

  const getMarginClass = () => {
    const iconWidth = direction.left === "left" ? "ml-16" : "mr-16"

    const widthMap = {
      "w-60": direction.left === "left" ? "ml-60" : "mr-60",
      "w-64": direction.left === "left" ? "ml-64" : "mr-64",
      "w-72": direction.left === "left" ? "ml-72" : "mr-72",
      "w-80": direction.left === "left" ? "ml-80" : "mr-80",
    }

    const fullWidth =
      widthMap[drawerWidth] || (direction.left === "left" ? "ml-60" : "mr-60")

    return `lg:${isDrawerExpanded ? fullWidth : iconWidth} ${iconWidth}`
  }

  return (
    <div
      className={`flex min-h-screen transition-colors duration-300 ${
        isDark
          ? "bg-gray-950 text-white"
          : "bg-slate-50 text-slate-950"
      }`}
      dir={direction.direction}
    >
      <DrawerComponent
        width={drawerWidth}
        isExpanded={isDrawerExpanded}
        onExpandChange={setIsDrawerExpanded}
      />

      <main
        className={`
          flex-1 min-w-0 transition-all duration-300 ease-in-out
          ${getMarginClass()}
        `}
      >
        <div className="min-h-screen p-4 lg:p-6">
          <div
            className={`
              min-h-[calc(100vh-2rem)] lg:min-h-[calc(100vh-3rem)]
              rounded-3xl transition-colors duration-300
              ${
                isDark
                  ? "bg-gray-950"
                  : "bg-slate-50"
              }
            `}
          >
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  )
}

export default withGuard(AdminPanel)