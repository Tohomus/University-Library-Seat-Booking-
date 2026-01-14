import { useEffect, useState } from "react"
import {
  Users,
  Armchair,
  ClipboardList,
} from "lucide-react"
import {
  collection,
  getDocs,
  query,
  orderBy,
  limit,
} from "firebase/firestore"

import { db } from "../../firebase/firebase"
import StatCard from "../../components/StatCard"

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalSeats: 0,
    bookedSeats: 0,
    availableSeats: 0,
    totalUsers: 0,
  })

  const [recentBookings, setRecentBookings] = useState([])

  useEffect(() => {
    const loadDashboard = async () => {
      const seatSnap = await getDocs(collection(db, "seats"))
      const usersSnap = await getDocs(collection(db, "users"))

      let booked = 0
      seatSnap.forEach((doc) => {
        if (doc.data().status === "booked") booked++
      })

      const bookingQuery = query(
        collection(db, "bookings"),
        orderBy("createdAt", "desc"),
        limit(5)
      )
      const bookingSnap = await getDocs(bookingQuery)

      setStats({
        totalSeats: seatSnap.size,
        bookedSeats: booked,
        availableSeats: seatSnap.size - booked,
        totalUsers: usersSnap.size,
      })

      setRecentBookings(
        bookingSnap.docs.map((d) => ({ id: d.id, ...d.data() }))
      )
    }

    loadDashboard()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-slate-50 to-indigo-50 px-4 py-6 sm:px-6">
      <div className="max-w-7xl mx-auto">

        {/* HEADER */}
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-6">
          Welcome <span className="text-indigo-600">Admin</span>
        </h1>

        {/* STATS (RESPONSIVE GRID) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          <StatCard title="Total Seats" value={stats.totalSeats} color="from-indigo-500 to-indigo-600" />
          <StatCard title="Booked Seats" value={stats.bookedSeats} color="from-rose-500 to-red-500" />
          <StatCard title="Available Seats" value={stats.availableSeats} color="from-emerald-500 to-green-500" />
          <StatCard title="Total Users" value={stats.totalUsers} color="from-violet-500 to-purple-500" />
        </div>

        {/* QUICK ACTIONS */}
        <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <ActionButton icon={<Armchair />} label="Manage Seats" />
            <ActionButton icon={<ClipboardList />} label="View Bookings" />
            <ActionButton icon={<Users />} label="User Management" />
          </div>
        </div>

        {/* RECENT BOOKINGS */}
        <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-semibold text-slate-800 mb-4">
            Recent Bookings
          </h2>

          <div className="overflow-x-auto">
            <table className="min-w-[600px] w-full text-sm">
              <thead>
                <tr className="text-slate-500 border-b">
                  <th className="text-left py-2">User</th>
                  <th className="text-left py-2">Seat</th>
                  <th className="text-left py-2">Date & Time</th>
                  <th className="text-left py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentBookings.map((b) => (
                  <tr key={b.id} className="border-b last:border-none">
                    <td className="py-3">{b.userId}</td>
                    <td className="py-3">{b.seatId}</td>
                    <td className="py-3">{b.date} · {b.timeSlot}</td>
                    <td className="py-3">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          b.status === "active"
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {b.status}
                      </span>
                    </td>
                  </tr>
                ))}

                {recentBookings.length === 0 && (
                  <tr>
                    <td colSpan="4" className="text-center py-6 text-slate-500">
                      No bookings yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  )
}

/* 🔹 Action Button Component */
const ActionButton = ({ icon, label }) => (
  <button className="flex items-center gap-4 p-4 rounded-xl bg-indigo-50 hover:bg-indigo-100 transition">
    <span className="text-indigo-600">{icon}</span>
    <span className="font-medium text-slate-700">{label}</span>
  </button>
)

export default AdminDashboard
