import { useEffect, useState } from "react"
import { Armchair, CheckCircle } from "lucide-react"
import {
  collection,
  doc,
  serverTimestamp,
  query,
  where,
  getDocs,
  onSnapshot,
  runTransaction,
} from "firebase/firestore"
import { db } from "../firebase/firebase"
import { useAuth } from "../context/AuthContext"

const Booking = () => {
  const { user } = useAuth()

  const [selectedSeats, setSelectedSeats] = useState([])
  const [bookedSeats, setBookedSeats] = useState([])
  const [loading, setLoading] = useState(true)

  const [hours, setHours] = useState(2)
  const [startTime, setStartTime] = useState("")
  const [endTime, setEndTime] = useState("")

  /* ---------------- LIBRARY TIME RULES ---------------- */
  const openHour = 9
  const closeHour = 23
  const closeMinute = 30

  const isWeekend = () => {
    const day = new Date().getDay() // 0 Sun → 6 Sat
    return day === 0 || day === 6
  }

  const pad = (n) => n.toString().padStart(2, "0")

  const calculateEndTime = (start, duration) => {
    const [h, m] = start.split(":").map(Number)
    const end = new Date()
    end.setHours(h)
    end.setMinutes(m)
    end.setMinutes(end.getMinutes() + duration * 60) // Safe calculation
    
    return `${pad(end.getHours())}:${pad(end.getMinutes())}`
  }

  useEffect(() => {
    const now = new Date()
    let currentHour = now.getHours()
    let currentMinute = now.getMinutes()

    if (currentHour < openHour) {
      currentHour = openHour
      currentMinute = 0
    }

    const start = `${pad(currentHour)}:${pad(currentMinute)}`
    setStartTime(start)
    setEndTime(calculateEndTime(start, hours))
  }, [hours])

  /* ---------------- REAL-TIME SEAT LISTENER ---------------- */
  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "seats"),
      (snapshot) => {
        const booked = []
        snapshot.forEach((docSnap) => {
          const seatData = docSnap.data()
          
          // Check if seat is booked (includes both pending and confirmed)
          if (seatData.status === "booked") {
            // If there's an endTime, check if it's still valid
            if (seatData.endTime) {
              const now = new Date()
              const [endH, endM] = seatData.endTime.split(":").map(Number)
              const endDateTime = new Date()
              endDateTime.setHours(endH, endM, 0, 0)
              
              // Only mark as booked if booking hasn't expired
              if (now < endDateTime) {
                booked.push(docSnap.id)
              }
            } else {
              // Legacy bookings without endTime
              booked.push(docSnap.id)
            }
          }
        })
        setBookedSeats(booked)
        setLoading(false)
      },
      (error) => {
        console.error("Seat listener error:", error)
        setLoading(false)
      }
    )
    return () => unsubscribe()
  }, [])

  /* ---------------- SEAT LOGIC ---------------- */
  const toggleSeat = (seatId) => {
    if (bookedSeats.includes(seatId)) return
    setSelectedSeats((prev) =>
      prev.includes(seatId)
        ? prev.filter((s) => s !== seatId)
        : [...prev, seatId]
    )
  }

  const seatColor = (seatId) => {
    if (bookedSeats.includes(seatId)) return "#ef4444"
    if (selectedSeats.includes(seatId)) return "#2563eb"
    return "#22c55e"
  }

  /* ---------------- CONFIRM BOOKING ---------------- */
  const confirmBooking = async () => {
    if (!selectedSeats.length || !user) return

    // Get fresh date when booking is confirmed (not when component loads)
    const today = new Date()

    if (isWeekend()) {
      alert("Student lounge is closed on weekends.")
      return
    }

    const [endH, endM] = endTime.split(":").map(Number)
    if (endH > closeHour || (endH === closeHour && endM > closeMinute)) {
      alert("Booking exceeds closing time (11:30 PM).")
      return
    }

    // Check for pending or active bookings
    const activeQuery = query(
      collection(db, "bookings"),
      where("userId", "==", user.uid),
      where("status", "in", ["pending", "confirmed"])
    )

    const activeSnap = await getDocs(activeQuery)
    if (!activeSnap.empty) {
      alert("You already have a pending or active booking. Wait for approval or cancel it first.")
      return
    }

    try {
      await runTransaction(db, async (transaction) => {
        for (const seatId of selectedSeats) {
          const seatRef = doc(db, "seats", seatId)
          const seatSnap = await transaction.get(seatRef)

          if (!seatSnap.exists()) {
            throw new Error(`Seat ${seatId} does not exist`)
          }

          if (seatSnap.data().status === "booked") {
            throw new Error(`Seat ${seatId} already booked`)
          }

          // Lock seat with pending status
          transaction.update(seatRef, {
            status: "booked",
            bookedBy: user.uid,
            bookedAt: serverTimestamp(),
            endTime: endTime, // Store end time for expiration checking
          })

          // Create booking record with PENDING status
          const bookingRef = doc(collection(db, "bookings"))
          transaction.set(bookingRef, {
            userId: user.uid,
            userEmail: user.email,
            seatId,
            date: today.toDateString(),
            startTime,
            endTime,
            hours,
            status: "pending", // ⭐ CHANGED: Set initial status to "pending"
            createdAt: serverTimestamp(),
          })
        }
      })

      setSelectedSeats([])
      alert("Booking request submitted! Waiting for admin approval.")
    } catch (err) {
      console.error("Transaction failed:", err.message)
      alert(err.message || "Booking failed. Try again.")
    }
  }

  /* ---------- SEAT COMPONENT (SVG) ---------- */
  const Seat = ({ id, x, y }) => {
    const size = 32
    const hitSize = 44

    return (
      <g
        onClick={() => toggleSeat(id)}
        className={bookedSeats.includes(id) ? "cursor-not-allowed" : "cursor-pointer"}
      >
        <rect
          x={x - hitSize / 2}
          y={y - hitSize / 2}
          width={hitSize}
          height={hitSize}
          fill="transparent"
        />

        <Armchair
          x={x - size / 2}
          y={y - size / 2}
          width={size}
          height={size}
          stroke={seatColor(id)}
          fill={selectedSeats.includes(id) ? seatColor(id) : "none"}
          strokeWidth="2"
        />

        <text
          x={x}
          y={y + 28}
          textAnchor="middle"
          fontSize="10"
          fill="#475569"
          fontWeight="600"
        >
          {id}
        </text>
      </g>
    )
  }

  if (loading) {
    return <p className="text-center text-slate-500">Loading seats…</p>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-slate-50 to-orange-50 p-6">
      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-xl p-6">

        <h1 className="text-2xl font-bold text-center text-slate-800 mb-4">
          Student Lounge Seat Booking
        </h1>

        {/* Time Selection Controls */}
        <div className="flex gap-6 mb-6 justify-center items-center bg-slate-50 p-4 rounded-xl">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Stay Duration (hours)
            </label>
            <select
              value={hours}
              onChange={(e) => setHours(Number(e.target.value))}
              className="border border-slate-300 p-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              {[1, 2, 3, 4, 5].map((h) => (
                <option key={h} value={h}>
                  {h} hour{h > 1 ? 's' : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="bg-white p-3 rounded-lg border border-slate-200">
            <p className="text-sm text-slate-600">
              Start: <span className="font-bold text-slate-800">{startTime}</span>
            </p>
            <p className="text-sm text-slate-600">
              End: <span className="font-bold text-slate-800">{endTime}</span>
            </p>
          </div>
        </div>

        {/* Legend */}
        <div className="flex justify-center gap-6 mb-6">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-green-500"></div>
            <span className="text-sm text-gray-700">Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-blue-600"></div>
            <span className="text-sm text-gray-700">Selected</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-red-500"></div>
            <span className="text-sm text-gray-700">Booked</span>
          </div>
        </div>

        {/* SVG MAP — COMPLETE LAYOUT */}
        <div className="w-full overflow-x-auto">
          <svg viewBox="0 0 1000 1000" className="mx-auto w-full max-w-3xl">
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

        <button
          onClick={confirmBooking}
          disabled={!selectedSeats.length}
          className={`mt-6 w-full py-3 rounded-xl font-semibold flex justify-center items-center gap-2 transition-all ${
            selectedSeats.length
              ? "bg-blue-600 text-white hover:bg-blue-700 shadow-lg"
              : "bg-slate-300 text-slate-500 cursor-not-allowed"
          }`}
        >
          <CheckCircle size={20} />
          Submit Booking Request ({selectedSeats.length} seat{selectedSeats.length !== 1 ? 's' : ''})
        </button>
      </div>
    </div>
  )
}

export default Booking