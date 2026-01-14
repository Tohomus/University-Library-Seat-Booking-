import { useEffect, useState } from "react"
import { Armchair, CheckCircle } from "lucide-react"
import {
  collection,
  doc,
  addDoc,
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

  /* ---------------- REAL-TIME SEAT LISTENER ---------------- */
  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "seats"),
      (snapshot) => {
        const booked = []

        snapshot.forEach((docSnap) => {
          if (docSnap.data().status === "booked") {
            booked.push(docSnap.id)
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

  /* ---------------- CONFIRM BOOKING (TRANSACTION) ---------------- */
  const confirmBooking = async () => {
    if (!selectedSeats.length || !user) return

    try {
      // 🔐 Check active booking (outside transaction)
      const activeQuery = query(
        collection(db, "bookings"),
        where("userId", "==", user.uid),
        where("status", "==", "active")
      )

      const activeSnap = await getDocs(activeQuery)
      if (!activeSnap.empty) {
        alert("You already have an active booking. Cancel it before booking again.")
        return
      }

      // 🔥 FIRESTORE TRANSACTION
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

          // Lock seat
          transaction.update(seatRef, {
            status: "booked",
            bookedBy: user.uid,
            bookedAt: serverTimestamp(),
          })

          // Create booking (inside transaction)
          const bookingRef = doc(collection(db, "bookings"))
          transaction.set(bookingRef, {
            userId: user.uid,
            seatId,
            status: "active",
            date: new Date().toLocaleDateString(),
            timeSlot: "10:00 – 12:00",
            createdAt: serverTimestamp(),
          })
        }
      })

      setSelectedSeats([])
      alert("Booking confirmed successfully!")
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

        {/* SVG MAP — EXACT REFERENCE */}
        <div className="w-full overflow-x-auto">
          <svg viewBox="0 0 1000 1000" className="mx-auto w-full max-w-3xl">
            <rect x="50" y="50" width="900" height="900" rx="40" fill="none" stroke="#e2e8f0" strokeWidth="4" />

            <rect x="350" y="400" width="300" height="200" rx="32" fill="#fef3c7" stroke="#d97706" strokeWidth="6" />
            <text x="500" y="515" textAnchor="middle" fontSize="18" fill="#92400e" fontWeight="700">
              STUDY TABLE
            </text>

            {[
              [380,350],[440,350],[500,350],[560,350],[620,350],
              [680,440],[680,500],[680,560],
              [620,650],[560,650],[500,650],[440,650],[380,650],
              [320,560],[320,500],[320,440],
            ].map(([x,y], i) => (
              <Seat key={`I${i+1}`} id={`I${i+1}`} x={x} y={y} />
            ))}

            {[
              [140,150],[220,150],[300,150],[380,150],[460,150],
              [540,150],[620,150],[700,150],[780,150],[860,150],
              [900,240],[900,340],[900,440],[900,540],[900,640],[900,740],[900,840],
              [860,900],[780,900],[700,900],[620,900],[540,900],
              [460,900],[380,900],[300,900],[220,900],[140,900],
              [100,840],[100,740],[100,640],[100,540],[100,440],[100,340],[100,240],
            ].map(([x,y], i) => (
              <Seat key={`O${i+1}`} id={`O${i+1}`} x={x} y={y} />
            ))}
          </svg>
        </div>

        <button
          onClick={confirmBooking}
          disabled={!selectedSeats.length}
          className={`mt-6 w-full py-3 rounded-xl font-semibold flex justify-center items-center gap-2 ${
            selectedSeats.length
              ? "bg-blue-600 text-white hover:bg-blue-700 shadow-lg"
              : "bg-slate-300 text-slate-500 cursor-not-allowed"
          }`}
        >
          <CheckCircle size={20} />
          Confirm Booking
        </button>
      </div>
    </div>
  )
}

export default Booking
