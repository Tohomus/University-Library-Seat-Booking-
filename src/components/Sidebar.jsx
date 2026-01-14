import { NavLink } from "react-router-dom"
import { Armchair, User, LogOut } from "lucide-react"

const Sidebar = () => {
  return (
    <aside className="h-screen w-64 bg-white border-r border-slate-200 px-6 py-8">
      {/* App / Library Name */}
      <h1 className="text-xl font-bold text-indigo-600 mb-10">
        CUSAT Library
      </h1>

      {/* Navigation */}
      <nav className="flex flex-col gap-3">
        <NavLink
          to="/booking"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-2 rounded-lg font-medium transition ${
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
            `flex items-center gap-3 px-4 py-2 rounded-lg font-medium transition ${
              isActive
                ? "bg-indigo-100 text-indigo-700"
                : "text-slate-600 hover:bg-slate-100"
            }`
          }
        >
          <User size={18} />
          Profile
        </NavLink>

        {/* Logout (logic later) */}
        <button
          className="flex items-center gap-3 px-4 py-2 rounded-lg font-medium text-red-600 hover:bg-red-50 transition mt-6"
        >
          <LogOut size={18} />
          Logout
        </button>
      </nav>
    </aside>
  )
}

export default Sidebar
