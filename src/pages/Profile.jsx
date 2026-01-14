import { useEffect, useState } from "react"
import { UserCircle } from "lucide-react"
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
} from "firebase/firestore"

import { db } from "../firebase/firebase"
import { useAuth } from "../context/AuthContext"

const Profile = () => {
  const { user } = useAuth()

  const [profile, setProfile] = useState(null)
  const [currentBooking, setCurrentBooking] = useState(null)
  const [bookingHistory, setBookingHistory] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      if (!user) return

      try {
        // Load profile
        const userSnap = await getDocs(
          query(collection(db, "users"), where("__name__", "==", user.uid))
        )
        userSnap.forEach((doc) => setProfile(doc.data()))

        // Load bookings
        const bookingQuery = query(
          collection(db, "bookings"),
          where("userId", "==", user.uid)
        )

        const bookingSnap = await getDocs(bookingQuery)

        const active = []
        const history = []

        bookingSnap.forEach((doc) => {
          const data = doc.data()
          if (data.status === "active") active.push(data)
          else history.push(data)
        })

        setCurrentBooking(active[0] || null)
        setBookingHistory(history)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [user])

  const cancelBooking = async () => {
    if (!currentBooking) return

    try {
      const activeQuery = query(
        collection(db, "bookings"),
        where("userId", "==", user.uid),
        where("status", "==", "active")
      )

      const snap = await getDocs(activeQuery)

      snap.forEach(async (docSnap) => {
        await updateDoc(doc(db, "bookings", docSnap.id), {
          status: "cancelled",
        })
      })

      await updateDoc(doc(db, "seats", currentBooking.seatId), {
        status: "available",
        bookedBy: "",
      })

      setBookingHistory((prev) => [
        { ...currentBooking, status: "cancelled" },
        ...prev,
      ])
      setCurrentBooking(null)

      alert("Booking cancelled successfully")
    } catch (error) {
      console.error(error)
      alert("Failed to cancel booking")
    }
  }

  if (loading) {
    return <p className="text-center text-slate-500">Loading profile...</p>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-slate-50 to-indigo-50 p-6">
      <div className="max-w-6xl mx-auto">

        <h1 className="text-3xl font-bold text-slate-800 mb-6">
          Hello, <span className="text-indigo-600">{profile?.fullName}</span>!
        </h1>

        <div className="bg-white rounded-2xl shadow-lg p-6 flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center">
              <UserCircle size={40} className="text-indigo-600" />
            </div>

            <div>
              <h2 className="text-lg font-semibold">{profile?.fullName}</h2>
              <p className="text-slate-600 text-sm">{profile?.email}</p>
              <p className="text-slate-500 text-sm">
                Student ID: {profile?.studentId}
              </p>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Current Booking</h3>

            {currentBooking ? (
              <>
                <p><b>Seat:</b> {currentBooking.seatId}</p>
                <p><b>Date:</b> {currentBooking.date}</p>
                <p><b>Time:</b> {currentBooking.timeSlot}</p>

                <span className="inline-block mt-2 px-3 py-1 rounded-full bg-green-100 text-green-700">
                  Active
                </span>

                <button
                  onClick={cancelBooking}
                  className="mt-4 w-full py-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200"
                >
                  Cancel Booking
                </button>
              </>
            ) : (
              <p className="text-slate-500">No active booking</p>
            )}
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Booking History</h3>

            {bookingHistory.length === 0 ? (
              <p className="text-slate-500">No past bookings</p>
            ) : (
              <ul className="space-y-4">
                {bookingHistory.map((b, i) => (
                  <li key={i} className="flex justify-between">
                    <div>
                      <p className="font-medium">Seat {b.seatId}</p>
                      <p className="text-sm text-slate-500">
                        {b.date} · {b.timeSlot}
                      </p>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-red-100 text-red-600 text-sm">
                      {b.status}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile
