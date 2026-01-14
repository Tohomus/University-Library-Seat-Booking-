import { useNavigate } from "react-router-dom"
import { signOut } from "firebase/auth"
import { auth } from "../firebase/firebase"

function DashboardLayout({ children }) {
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      await signOut(auth)
      navigate("/login")
    } catch (error) {
      console.error("Logout failed:", error)
    }
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      
      {/* SIDEBAR */}
      <aside className="w-64 bg-white shadow-lg flex flex-col p-6">
        <h2 className="text-xl font-bold text-indigo-600 mb-8">
          CUSAT Library
        </h2>

        <nav className="flex flex-col gap-4 flex-1">
          <button
            onClick={() => navigate("/booking")}
            className="text-left px-4 py-2 rounded-lg hover:bg-indigo-50"
          >
            📚 Booking
          </button>

          <button
            onClick={() => navigate("/profile")}
            className="text-left px-4 py-2 rounded-lg hover:bg-indigo-50"
          >
            👤 Profile
          </button>
        </nav>

        {/* LOGOUT BUTTON */}
        <button
          onClick={handleLogout}
          className="mt-auto px-4 py-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100"
        >
          🚪 Logout
        </button>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-6">
        {children}
      </main>
    </div>
  )
}

export default DashboardLayout
