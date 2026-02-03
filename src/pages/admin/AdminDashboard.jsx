import { useEffect, useState, useMemo } from "react"
import { CheckCircle, Armchair, XCircle, Clock, Users, TrendingUp } from "lucide-react"
import {
  collection,
  onSnapshot,
  updateDoc,
  doc
} from "firebase/firestore"
import { db } from "../../firebase/firebase"

const AdminDashboard = () => {
  const [bookings, setBookings] = useState([])
  const [seats, setSeats] = useState({})

  /* 🔴 LIVE BOOKINGS */
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "bookings"), (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      // Safe sort by creation date (newest first)
      data.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
      setBookings(data)
    })
    return () => unsub()
  }, [])

  /* 🔴 LIVE SEATS */
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "seats"), (snap) => {
      const map = {}
      snap.forEach(d => map[d.id] = d.data())
      setSeats(map)
    })
    return () => unsub()
  }, [])

  /* 🧠 CHECK IF BOOKING TIME IS STILL VALID */
  const isBookingActiveTime = (b) => {
    if (!b.endTime) return true
    const now = new Date()
    const [h, m] = b.endTime.split(":").map(Number)
    const end = new Date()
    end.setHours(h, m, 0, 0)
    return now < end
  }

  /* ⏳ AUTO RELEASE EXPIRED BOOKINGS */
  useEffect(() => {
    const releaseExpired = async () => {
      const now = new Date()

      const expired = bookings.filter(b =>
        b.status === "confirmed" && b.endTime && !isBookingActiveTime(b)
      )

      for (const booking of expired) {
        try {
          console.log(`Auto-release: ${booking.seatId} - expired at ${booking.endTime}`)
          
          await updateDoc(doc(db, "bookings", booking.id), {
            status: "completed",
            completedAt: now
          })

          await updateDoc(doc(db, "seats", booking.seatId), {
            status: "available",
            bookedBy: null,
            bookedAt: null,
            endTime: null,
            approved: false
          })
        } catch (err) {
          console.error(`Auto release failed for ${booking.seatId}:`, err)
        }
      }
    }

    // Run immediately on load
    releaseExpired()

    // Run every minute
    const interval = setInterval(releaseExpired, 60000)

    return () => clearInterval(interval)
  }, [bookings])

  /* ⚡ ACTIVE BOOKINGS ONLY */
  const activeBookings = useMemo(() => {
    return bookings.filter(
      b => (b.status === "pending" || b.status === "confirmed")
    )
  }, [bookings])

  /* 🚀 SEAT → BOOKING STATUS MAP (Performance optimization) */
  const seatBookingMap = useMemo(() => {
    const map = {}
    activeBookings.forEach(b => map[b.seatId] = b.status)
    return map
  }, [activeBookings])

  /* 📊 TRUE OCCUPANCY STATS */
  const stats = useMemo(() => {
    const totalSeats = Object.keys(seats).length || 50
    const pending = activeBookings.filter(b => b.status === "pending").length
    const confirmed = activeBookings.filter(b => b.status === "confirmed").length
    const occupied = confirmed
    const available = totalSeats - pending - confirmed
    const occupancyRate = ((occupied / totalSeats) * 100).toFixed(1)

    return { totalSeats, pending, confirmed, occupied, available, occupancyRate }
  }, [activeBookings, seats])

  /* 🎨 SEAT COLOR LOGIC */
  const seatColor = (seatId) => {
    const status = seatBookingMap[seatId]
    if (!status) return "#22c55e" // Green - Available
    if (status === "pending") return "#2563eb" // Blue - Pending
    if (status === "confirmed") return "#ef4444" // Red - Confirmed
    return "#22c55e"
  }

  /* ✅ CONFIRM BOOKING */
  const confirmBooking = async (booking) => {
    try {
      await updateDoc(doc(db, "bookings", booking.id), {
        status: "confirmed"
      })

      await updateDoc(doc(db, "seats", booking.seatId), {
        status: "booked",
        approved: true
      })
    } catch (error) {
      console.error("Error confirming booking:", error)
      alert("Failed to confirm booking")
    }
  }

  /* ❌ REJECT BOOKING */
  const rejectBooking = async (booking) => {
    try {
      await updateDoc(doc(db, "bookings", booking.id), {
        status: "rejected",
        closedAt: new Date()
      })
      
      // Release the seat
      await updateDoc(doc(db, "seats", booking.seatId), {
        status: "available",
        bookedBy: null,
        bookedAt: null,
        endTime: null,
        approved: false
      })
    } catch (error) {
      console.error("Error rejecting booking:", error)
      alert("Failed to reject booking")
    }
  }

  /* 🪑 SEAT COMPONENT */
  const Seat = ({ id, x, y }) => {
    const size = 32
    return (
      <g>
        <Armchair
          x={x - size / 2}
          y={y - size / 2}
          width={size}
          height={size}
          stroke={seatColor(id)}
          fill="none"
          strokeWidth="2"
        />
        <text 
          x={x} 
          y={y + 26} 
          fontSize="10" 
          textAnchor="middle"
          fill="#475569"
          fontWeight="600"
        >
          {id}
        </text>
      </g>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-slate-50 to-pink-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* HEADER */}
        <div className="flex items-center justify-between">
          <h1 className="text-4xl font-bold text-indigo-600">Admin Dashboard</h1>
        </div>

        {/* 📊 LIVE OCCUPANCY STATISTICS */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* Total Seats */}
          <div className="bg-white rounded-xl shadow-lg p-4 border-2 border-indigo-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 mb-1">Total Seats</p>
                <p className="text-3xl font-bold text-indigo-600">{stats.totalSeats}</p>
              </div>
              <Armchair size={32} className="text-indigo-300" />
            </div>
          </div>

          {/* Pending */}
          <div className="bg-white rounded-xl shadow-lg p-4 border-2 border-blue-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 mb-1">Pending</p>
                <p className="text-3xl font-bold text-blue-600">{stats.pending}</p>
              </div>
              <Clock size={32} className="text-blue-300" />
            </div>
          </div>

          {/* Confirmed */}
          <div className="bg-white rounded-xl shadow-lg p-4 border-2 border-green-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 mb-1">Confirmed</p>
                <p className="text-3xl font-bold text-green-600">{stats.confirmed}</p>
              </div>
              <CheckCircle size={32} className="text-green-300" />
            </div>
          </div>

          {/* Available */}
          <div className="bg-white rounded-xl shadow-lg p-4 border-2 border-emerald-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 mb-1">Available</p>
                <p className="text-3xl font-bold text-emerald-600">{stats.available}</p>
              </div>
              <Users size={32} className="text-emerald-300" />
            </div>
          </div>

          {/* Occupancy Rate */}
          <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl shadow-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/80 mb-1">Occupancy</p>
                <p className="text-3xl font-bold text-white">{stats.occupancyRate}%</p>
              </div>
              <TrendingUp size={32} className="text-white/80" />
            </div>
          </div>
        </div>

        {/* BOOKINGS LIST */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-slate-800 mb-4">Booking Requests</h2>
          
          {activeBookings.length > 0 ? (
            <div className="space-y-3">
              {activeBookings.map(b => (
                <div 
                  key={b.id} 
                  className={`flex justify-between items-center p-4 rounded-xl border-2 ${
                    b.status === "pending" 
                      ? "border-blue-200 bg-blue-50" 
                      : "border-green-200 bg-green-50"
                  }`}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Armchair size={20} className="text-slate-500" />
                      <p className="font-bold text-lg text-slate-800">{b.seatId}</p>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        b.status === "pending"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-green-100 text-green-700"
                      }`}>
                        {b.status === "pending" ? "Pending" : "Confirmed"}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 mb-1">
                      <span className="font-medium">User:</span> {b.userEmail || b.userId}
                    </p>
                    <p className="text-sm text-slate-600 mb-1">
                      <span className="font-medium">Date:</span> {b.date}
                    </p>
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Clock size={14} className="text-slate-400" />
                      <span>{b.startTime} – {b.endTime}</span>
                      <span className="text-slate-400">({b.hours}h)</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {b.status === "pending" && (
                      <>
                        <button
                          onClick={() => confirmBooking(b)}
                          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                        >
                          <CheckCircle size={18} />
                          Confirm
                        </button>
                        <button
                          onClick={() => rejectBooking(b)}
                          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                        >
                          <XCircle size={18} />
                          Reject
                        </button>
                      </>
                    )}
                    {b.status === "confirmed" && (
                      <span className="text-green-600 font-semibold px-4 py-2">
                        ✓ Approved
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-slate-400">
              <Armchair size={48} className="mx-auto mb-3 opacity-50" />
              <p>No pending or active bookings</p>
            </div>
          )}
        </div>

        {/* SEAT MAP */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-slate-800 mb-4">Live Seat Layout</h2>
          
          {/* Legend */}
          <div className="flex justify-center gap-6 mb-6">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-green-500"></div>
              <span className="text-sm text-gray-700">Available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-blue-600"></div>
              <span className="text-sm text-gray-700">Pending Approval</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-red-500"></div>
              <span className="text-sm text-gray-700">Confirmed</span>
            </div>
          </div>

          <div className="w-full overflow-x-auto">
            <svg viewBox="0 0 1000 1000" className="mx-auto w-full max-w-4xl">
              <rect x="50" y="50" width="900" height="900" rx="40" fill="none" stroke="#e2e8f0" strokeWidth="4" />

              <rect x="350" y="400" width="300" height="200" rx="32" fill="#fef3c7" stroke="#d97706" strokeWidth="6" />
              <text x="500" y="515" textAnchor="middle" fontSize="18" fill="#92400e" fontWeight="700">
                STUDY TABLE
              </text>

              {/* Inner seats around study table */}
              {[
                [380, 350], [440, 350], [500, 350], [560, 350], [620, 350],
                [680, 440], [680, 500], [680, 560],
                [620, 650], [560, 650], [500, 650], [440, 650], [380, 650],
                [320, 560], [320, 500], [320, 440],
              ].map(([x, y], i) => (
                <Seat key={`I${i + 1}`} id={`I${i + 1}`} x={x} y={y} />
              ))}

              {/* Outer seats along perimeter */}
              {[
                [140, 150], [220, 150], [300, 150], [380, 150], [460, 150],
                [540, 150], [620, 150], [700, 150], [780, 150], [860, 150],
                [900, 240], [900, 340], [900, 440], [900, 540], [900, 640], [900, 740], [900, 840],
                [860, 900], [780, 900], [700, 900], [620, 900], [540, 900],
                [460, 900], [380, 900], [300, 900], [220, 900], [140, 900],
                [100, 840], [100, 740], [100, 640], [100, 540], [100, 440], [100, 340], [100, 240],
              ].map(([x, y], i) => (
                <Seat key={`O${i + 1}`} id={`O${i + 1}`} x={x} y={y} />
              ))}
            </svg>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard