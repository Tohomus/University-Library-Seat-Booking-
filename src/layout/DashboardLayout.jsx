import { useNavigate, useLocation } from "react-router-dom"
import { signOut } from "firebase/auth"
import { auth } from "../firebase/firebase"
import { Armchair, User, LogOut } from "lucide-react"

function DashboardLayout({ children }) {
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = async () => {
    try {
      await signOut(auth)
      navigate("/login")
    } catch (error) {
      console.error("Logout failed:", error)
    }
  }

  const navBtn = (path, label, Icon) => {
    const active = location.pathname === path
    return (
      <button
        onClick={() => navigate(path)}
        className={`flex items-center gap-3 px-4 py-2 rounded-lg font-medium transition w-full ${
          active
            ? "bg-indigo-100 text-indigo-700"
            : "text-slate-600 hover:bg-slate-100"
        }`}
      >
        <Icon size={18} />
        <span className="hidden md:inline">{label}</span>
      </button>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">

      {/* DESKTOP SIDEBAR */}
      <aside className="hidden md:flex md:w-64 bg-white border-r border-slate-200 flex-col p-6">
        <h2 className="text-xl font-bold text-indigo-600 mb-10">
          CUSAT Library
        </h2>

        <nav className="flex flex-col gap-3 flex-1">
          {navBtn("/booking", "Booking", Armchair)}
          {navBtn("/profile", "Profile", User)}
        </nav>

        <button
          onClick={handleLogout}
          className="mt-auto flex items-center gap-3 px-4 py-2 rounded-lg font-medium text-red-600 hover:bg-red-50 transition"
        >
          <LogOut size={18} />
          Logout
        </button>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 w-full p-4 md:p-6 pb-20 md:pb-6">
        {children}
      </main>

      {/* MOBILE BOTTOM NAV */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex justify-around py-2 md:hidden z-50">
        <button
          onClick={() => navigate("/booking")}
          className={`flex flex-col items-center text-xs ${
            location.pathname === "/booking"
              ? "text-indigo-600"
              : "text-slate-500"
          }`}
        >
          <Armchair size={22} />
          Booking
        </button>

        <button
          onClick={() => navigate("/profile")}
          className={`flex flex-col items-center text-xs ${
            location.pathname === "/profile"
              ? "text-indigo-600"
              : "text-slate-500"
          }`}
        >
          <User size={22} />
          Profile
        </button>

        <button
          onClick={handleLogout}
          className="flex flex-col items-center text-xs text-red-500"
        >
          <LogOut size={22} />
          Logout
        </button>
      </div>
    </div>
  )
}

export default DashboardLayout
