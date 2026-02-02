import { useEffect, useState } from "react"
import { UserCircle, Calendar, Clock, Armchair } from "lucide-react"
import { collection, query, where, onSnapshot } from "firebase/firestore"
import { db } from "../firebase/firebase"
import { useAuth } from "../context/AuthContext"

const Profile = () => {
  const { user } = useAuth()

  const [userBookings, setUserBookings] = useState([])
  const [activeBooking, setActiveBooking] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return

    const q = query(
      collection(db, "bookings"),
      where("userId", "==", user.uid)
    )

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const bookings = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))

        // Sort by creation date (newest first) - SAFE VERSION
        bookings.sort((a, b) => {
          const aTime = a.createdAt?.seconds || 0
          const bTime = b.createdAt?.seconds || 0
          return bTime - aTime
        })

        setUserBookings(bookings)
        setActiveBooking(bookings.find((b) => b.status === "active") || null)
        setLoading(false)
      },
      (error) => {
        console.error("Bookings listener error:", error)
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [user])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-slate-50 to-indigo-50 flex items-center justify-center">
        <p className="text-slate-500">Loading profile...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-slate-50 to-indigo-50 p-6">
      <div className="max-w-6xl mx-auto">

        <h1 className="text-3xl font-bold text-slate-800 mb-6">
          Hello, <span className="text-indigo-600">{user?.email?.split('@')[0]}</span>
        </h1>

        {/* Profile Card */}
        <div className="bg-white rounded-2xl shadow-lg p-6 flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center">
              <UserCircle size={40} className="text-indigo-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-800">
                {user?.email}
              </h2>
              <p className="text-slate-500 text-sm">CUSAT Library Member</p>
            </div>
          </div>
          
          <div className="text-right">
            <p className="text-sm text-slate-500">Total Bookings</p>
            <p className="text-2xl font-bold text-indigo-600">{userBookings.length}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Current Booking */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <Armchair size={20} className="text-indigo-600" />
              Current Booking
            </h3>

            {activeBooking ? (
              <div className="space-y-3">
                <div className="bg-indigo-50 p-4 rounded-xl">
                  <p className="text-3xl font-bold text-indigo-600 text-center">
                    {activeBooking.seatId}
                  </p>
                  <p className="text-sm text-slate-500 text-center">Seat Number</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-slate-700">
                    <Calendar size={16} className="text-slate-400" />
                    <span className="font-medium">Date:</span>
                    <span>{activeBooking.date}</span>
                  </div>

                  <div className="flex items-center gap-2 text-slate-700">
                    <Clock size={16} className="text-slate-400" />
                    <span className="font-medium">Time:</span>
                    <span>{activeBooking.startTime} – {activeBooking.endTime}</span>
                  </div>

                  <div className="flex items-center gap-2 text-slate-700">
                    <Clock size={16} className="text-slate-400" />
                    <span className="font-medium">Duration:</span>
                    <span>{activeBooking.hours} hour{activeBooking.hours > 1 ? 's' : ''}</span>
                  </div>
                </div>

                <span className="inline-block mt-3 px-4 py-2 rounded-full bg-green-100 text-green-700 text-sm font-semibold">
                  ✓ Active Booking
                </span>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3">
                  <Armchair size={32} className="text-slate-400" />
                </div>
                <p className="text-slate-500">No active booking</p>
                <p className="text-sm text-slate-400 mt-1">Book a seat to get started</p>
              </div>
            )}
          </div>

          {/* Booking History */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <Calendar size={20} className="text-indigo-600" />
              Booking History
            </h3>

            {userBookings.length > 0 ? (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {userBookings.map((booking) => (
                  <div
                    key={booking.id}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      booking.status === "active"
                        ? "border-green-200 bg-green-50"
                        : "border-slate-200 bg-slate-50"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-semibold text-slate-800 flex items-center gap-2">
                          <Armchair size={16} className="text-slate-500" />
                          Seat {booking.seatId}
                        </p>
                        
                        <div className="mt-2 space-y-1">
                          <p className="text-sm text-slate-600 flex items-center gap-2">
                            <Calendar size={14} className="text-slate-400" />
                            {booking.date}
                          </p>
                          <p className="text-sm text-slate-600 flex items-center gap-2">
                            <Clock size={14} className="text-slate-400" />
                            {booking.startTime} – {booking.endTime}
                          </p>
                          <p className="text-xs text-slate-500">
                            Duration: {booking.hours} hour{booking.hours > 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>

                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
                          booking.status === "active"
                            ? "bg-green-100 text-green-700"
                            : "bg-slate-200 text-slate-600"
                        }`}
                      >
                        {booking.status === "active" ? "Active" : "Completed"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3">
                  <Calendar size={32} className="text-slate-400" />
                </div>
                <p className="text-slate-500">No booking history</p>
                <p className="text-sm text-slate-400 mt-1">Your past bookings will appear here</p>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}

export default Profile