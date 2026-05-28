import { useDispatch, useSelector } from "react-redux"
import { changeMode } from "../../state/slices/mode"

const SunIcon = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2" />
    <path d="M12 20v2" />
    <path d="m4.93 4.93 1.41 1.41" />
    <path d="m17.66 17.66 1.41 1.41" />
    <path d="M2 12h2" />
    <path d="M20 12h2" />
    <path d="m6.34 17.66-1.41 1.41" />
    <path d="m19.07 4.93-1.41 1.41" />
  </svg>
)

const MoonIcon = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
  </svg>
)

function Mode() {
  const { mymode } = useSelector((state) => state.mode)
  const dispatch = useDispatch()

  return (
    <button
      type="button"
      onClick={() => dispatch(changeMode())}
      className="
        group
        inline-flex items-center justify-center
        w-10 h-10
        rounded-xl
        border border-white
        bg-white
        text-gray-900
        shadow-sm
        transition-all duration-300
        hover:border-emerald-500
        hover:bg-emerald-500
        hover:text-white
        hover:shadow-lg
        hover:shadow-emerald-500/20
        active:scale-95
        focus:outline-none
        focus:ring-2
        focus:ring-emerald-500
        focus:ring-offset-2
        dark:border-white
        dark:bg-white
        dark:text-gray-900
        cursor-pointer
      "
      aria-label="Toggle theme"
      title={mymode === "light" ? "Switch to dark mode" : "Switch to light mode"}
    >
      {mymode === "light" ? (
        <SunIcon className="h-5 w-5 transition-transform duration-300 group-hover:rotate-45" />
      ) : (
        <MoonIcon className="h-5 w-5 transition-transform duration-300 group-hover:-rotate-12" />
      )}
    </button>
  )
}

export default Mode