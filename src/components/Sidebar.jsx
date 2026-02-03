import { NavLink } from "react-router-dom"
import { Armchair, User, LogOut } from "lucide-react"

const Sidebar = ({ onLogout }) => {
  const base =
    "flex items-center gap-3 px-4 py-2 rounded-lg font-medium transition"

  return (
    <>
      {/* ================= DESKTOP SIDEBAR ================= */}
      <aside className="hidden md:flex h-screen w-64 bg-white border-r border-slate-200 px-6 py-8 flex-col">
        <h1 className="text-xl font-bold text-indigo-600 mb-10">
          CUSAT Library
        </h1>

        <nav className="flex flex-col gap-3 flex-1">
          <NavLink
            to="/booking"
            className={({ isActive }) =>
              `${base} ${
                isActive
                  ? "bg-indigo-100 text-indigo-700"
                  : "text-slate-600 hover:bg-slate-100"
              }`
            }
          >
            <Armchair size={18} />
            Booking
          </NavLink>

          <NavLink
            to="/profile"
            className={({ isActive }) =>
              `${base} ${
                isActive
                  ? "bg-indigo-100 text-indigo-700"
                  : "text-slate-600 hover:bg-slate-100"
              }`
            }
          >
            <User size={18} />
            Profile
          </NavLink>
        </nav>

        <button
          onClick={onLogout}
          className="flex items-center gap-3 px-4 py-2 rounded-lg font-medium text-red-600 hover:bg-red-50 transition mt-6"
        >
          <LogOut size={18} />
          Logout
        </button>
      </aside>

      {/* ================= MOBILE BOTTOM NAV ================= */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-lg z-50">
        <nav className="flex justify-around items-center py-2">
          <NavLink
            to="/booking"
            className={({ isActive }) =>
              `flex flex-col items-center text-xs ${
                isActive ? "text-indigo-600" : "text-slate-500"
              }`
            }
          >
            <Armchair size={22} />
            Booking
          </NavLink>

          <NavLink
            to="/profile"
            className={({ isActive }) =>
              `flex flex-col items-center text-xs ${
                isActive ? "text-indigo-600" : "text-slate-500"
              }`
            }
          >
            <User size={22} />
            Profile
          </NavLink>

          <button
            onClick={onLogout}
            className="flex flex-col items-center text-xs text-red-500"
          >
            <LogOut size={22} />
            Logout
          </button>
        </nav>
      </div>
    </>
  )
}

export default Sidebar
