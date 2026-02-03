import { useEffect, useState, useMemo } from "react"
import { CheckCircle, Armchair, XCircle, Clock } from "lucide-react"
import {
  collection,
  onSnapshot,
  updateDoc,
  doc
} from "firebase/firestore"
import { db } from "../firebase/firebase"

const AdminDashboard = () => {
  const [bookings, setBookings] = useState([])
  const [seats, setSeats] = useState({})

  /* 🔴 LIVE BOOKINGS */
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "bookings"), (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      data.sort((a, b) => {
        const aTime = a.createdAt?.seconds || 0
        const bTime = b.createdAt?.seconds || 0
        return bTime - aTime
      })
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

  /* ⏳ FILTER EXPIRED BOOKINGS */
  const isBookingActiveTime = (b) => {
    if (!b.endTime) return true
    const now = new Date()
    const [h, m] = b.endTime.split(":").map(Number)
    const end = new Date()
    end.setHours(h, m, 0, 0)
    return now < end
  }

  const activeBookings = useMemo(() => {
    return bookings.filter(
      b => (b.status === "pending" || b.status === "confirmed") && isBookingActiveTime(b)
    )
  }, [bookings])

  /* ⚡ PERFORMANCE MAP */
  const seatBookingMap = useMemo(() => {
    const map = {}
    activeBookings.forEach(b => map[b.seatId] = b.status)
    return map
  }, [activeBookings])

  /* 🎨 SEAT COLOR LOGIC */
  const seatColor = (seatId) => {
    const status = seatBookingMap[seatId]
    if (!status) return "#22c55e"
    if (status === "pending") return "#2563eb"
    if (status === "confirmed") return "#ef4444"
    return "#22c55e"
  }

  /* ✅ CONFIRM BOOKING */
  const confirmBooking = async (booking) => {
    try {
      await updateDoc(doc(db, "bookings", booking.id), { status: "confirmed" })
      await updateDoc(doc(db, "seats", booking.seatId), { status: "booked", approved: true })
    } catch (error) {
      console.error("Error confirming booking:", error)
      alert("Failed to confirm booking")
    }
  }

  /* ❌ REJECT BOOKING */
  const rejectBooking = async (booking) => {
    try {
      await updateDoc(doc(db, "bookings", booking.id), { status: "rejected", closedAt: new Date() })
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
        <rect
          x={x - size / 2}
          y={y - size / 2}
          width={size}
          height={size}
          rx={6}
          fill={seatColor(id)}
          fillOpacity={0.18}
          stroke={seatColor(id)}
          strokeWidth={2.5}
        />
        <text
          x={x}
          y={y + 5}
          fontSize="10"
          textAnchor="middle"
          dominantBaseline="middle"
          fill={seatColor(id)}
          fontWeight="700"
        >
          {id}
        </text>
      </g>
    )
  }

  const pendingBookings = activeBookings.filter(b => b.status === "pending")
  const confirmedBookings = activeBookings.filter(b => b.status === "confirmed")

  /* ─── Inner & Outer seat coordinate arrays ─── */
  const innerSeats = [
    [380, 350], [440, 350], [500, 350], [560, 350], [620, 350],
    [680, 440], [680, 500], [680, 560],
    [620, 650], [560, 650], [500, 650], [440, 650], [380, 650],
    [320, 560], [320, 500], [320, 440],
  ]

  const outerSeats = [
    [140, 150], [220, 150], [300, 150], [380, 150], [460, 150],
    [540, 150], [620, 150], [700, 150], [780, 150], [860, 150],
    [900, 240], [900, 340], [900, 440], [900, 540], [900, 640], [900, 740], [900, 840],
    [860, 900], [780, 900], [700, 900], [620, 900], [540, 900],
    [460, 900], [380, 900], [300, 900], [220, 900], [140, 900],
    [100, 840], [100, 740], [100, 640], [100, 540], [100, 440], [100, 340], [100, 240],
  ]

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #ede9fe 0%, #f8fafc 40%, #fdf2f8 100%)", padding: "16px" }}>
      <style>{`
        /* ── Utility ── */
        .admin-wrap { max-width: 1200px; margin: 0 auto; }

        /* ── Header ── */
        .admin-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          flex-wrap: wrap;
        }
        .admin-header h1 {
          font-size: 1.75rem;
          font-weight: 700;
          color: #4f46e5;
          margin: 0;
        }
        .stats-row { display: flex; gap: 10px; }
        .stat-card {
          background: #fff;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
          padding: 10px 18px;
          text-align: center;
          min-width: 80px;
        }
        .stat-card .label { font-size: 0.75rem; color: #94a3b8; margin: 0; }
        .stat-card .value { font-size: 1.6rem; font-weight: 700; margin: 2px 0 0; }

        /* ── Card shell ── */
        .card {
          background: #fff;
          border-radius: 18px;
          box-shadow: 0 4px 16px rgba(0,0,0,0.07);
          padding: 20px;
        }
        .card h2 { font-size: 1.15rem; font-weight: 600; color: #1e293b; margin: 0 0 16px; }

        /* ── Booking item ── */
        .booking-item {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 12px;
          padding: 14px 16px;
          border-radius: 14px;
          border: 2px solid;
        }
        .booking-item.pending  { border-color: #bfdbfe; background: #eff6ff; }
        .booking-item.confirmed { border-color: #bbf7d0; background: #f0fdf4; }

        .booking-info { flex: 1; min-width: 0; }
        .booking-top { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin-bottom: 6px; }
        .booking-top .seat-id { font-size: 1.1rem; font-weight: 700; color: #1e293b; }
        .badge {
          font-size: 0.7rem;
          font-weight: 600;
          padding: 2px 10px;
          border-radius: 20px;
        }
        .badge.pending   { background: #dbeafe; color: #1d4ed8; }
        .badge.confirmed { background: #dcfce7; color: #15803d; }

        .booking-detail { font-size: 0.82rem; color: #64748b; margin: 3px 0; }
        .booking-detail .key { font-weight: 600; color: #475569; }
        .time-row { display: flex; align-items: center; gap: 6px; font-size: 0.82rem; color: #64748b; margin-top: 4px; }

        /* ── Action buttons ── */
        .btn-row { display: flex; gap: 8px; flex-shrink: 0; }
        .btn {
          display: flex; align-items: center; gap: 6px;
          font-size: 0.82rem; font-weight: 600;
          padding: 8px 14px;
          border: none; border-radius: 10px;
          cursor: pointer; color: #fff;
          transition: background 0.15s;
          white-space: nowrap;
        }
        .btn-confirm  { background: #16a34a; }
        .btn-confirm:hover { background: #15803d; }
        .btn-reject   { background: #dc2626; }
        .btn-reject:hover  { background: #b91c1c; }
        .approved-text { color: #16a34a; font-weight: 600; font-size: 0.85rem; padding: 8px 0; white-space: nowrap; }

        /* ── Empty state ── */
        .empty-state { text-align: center; padding: 40px 0; color: #94a3b8; }
        .empty-state p { margin: 8px 0 0; font-size: 0.9rem; }

        /* ── Legend ── */
        .legend { display: flex; justify-content: center; gap: 20px; flex-wrap: wrap; margin-bottom: 14px; }
        .legend-item { display: flex; align-items: center; gap: 6px; font-size: 0.82rem; color: #475569; }
        .legend-dot { width: 14px; height: 14px; border-radius: 50%; }

        /* ── SVG map ── */
        .svg-scroll { width: 100%; overflow-x: auto; -webkit-overflow-scrolling: touch; }
        .svg-scroll svg { display: block; min-width: 320px; width: 100%; max-width: 860px; margin: 0 auto; }

        /* ════════════════════════════════════════
           📱  MOBILE  (< 480 px)
           ════════════════════════════════════════ */
        @media (max-width: 480px) {
          .admin-wrap { padding: 0; }
          .admin-header { flex-direction: column; align-items: flex-start; }
          .admin-header h1 { font-size: 1.35rem; }
          .stat-card { padding: 8px 14px; min-width: 70px; }
          .stat-card .value { font-size: 1.35rem; }
          .card { padding: 14px; border-radius: 14px; }
          .card h2 { font-size: 1rem; }

          /* Stack action row below info on mobile */
          .booking-item { flex-direction: column; }
          .btn-row { width: 100%; }
          .btn { flex: 1; justify-content: center; padding: 10px 8px; font-size: 0.8rem; }
          .approved-text { width: 100%; text-align: center; }

          .legend { gap: 12px; }
        }

        /* ════════════════════════════════════════
           📲  SMALL TABLET  (481 – 768 px)
           ════════════════════════════════════════ */
        @media (min-width: 481px) and (max-width: 768px) {
          .admin-header h1 { font-size: 1.55rem; }
          .booking-item { flex-direction: column; }
          .btn-row { width: 100%; justify-content: flex-end; }
        }

        /* ════════════════════════════════════════
           🖥️  DESKTOP  (> 768 px)
           ════════════════════════════════════════ */
        @media (min-width: 769px) {
          .admin-wrap { padding: 0; }
          .card { padding: 24px; }
        }
      `}</style>

      <div className="admin-wrap" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

        {/* ───── HEADER + STATS ───── */}
        <div className="admin-header">
          <h1>Admin Dashboard</h1>
          <div className="stats-row">
            <div className="stat-card">
              <p className="label">Pending</p>
              <p className="value" style={{ color: "#2563eb" }}>{pendingBookings.length}</p>
            </div>
            <div className="stat-card">
              <p className="label">Confirmed</p>
              <p className="value" style={{ color: "#16a34a" }}>{confirmedBookings.length}</p>
            </div>
          </div>
        </div>

        {/* ───── BOOKING LIST ───── */}
        <div className="card">
          <h2>Booking Requests</h2>
          {activeBookings.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {activeBookings.map(b => (
                <div key={b.id} className={`booking-item ${b.status}`}>
                  <div className="booking-info">
                    <div className="booking-top">
                      <Armchair size={18} color="#64748b" />
                      <span className="seat-id">{b.seatId}</span>
                      <span className={`badge ${b.status}`}>
                        {b.status === "pending" ? "Pending" : "Confirmed"}
                      </span>
                    </div>
                    <p className="booking-detail">
                      <span className="key">User: </span>{b.userEmail || b.userId}
                    </p>
                    <p className="booking-detail">
                      <span className="key">Date: </span>{b.date}
                    </p>
                    <div className="time-row">
                      <Clock size={13} color="#94a3b8" />
                      <span>{b.startTime} – {b.endTime}</span>
                      <span style={{ color: "#94a3b8" }}>({b.hours}h)</span>
                    </div>
                  </div>

                  <div className="btn-row">
                    {b.status === "pending" ? (
                      <>
                        <button className="btn btn-confirm" onClick={() => confirmBooking(b)}>
                          <CheckCircle size={16} /> Confirm
                        </button>
                        <button className="btn btn-reject" onClick={() => rejectBooking(b)}>
                          <XCircle size={16} /> Reject
                        </button>
                      </>
                    ) : (
                      <span className="approved-text">✓ Approved</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <Armchair size={44} color="#cbd5e1" />
              <p>No pending or active bookings</p>
            </div>
          )}
        </div>

        {/* ───── LIVE SEAT MAP ───── */}
        <div className="card">
          <h2>Live Seat Layout</h2>

          <div className="legend">
            <div className="legend-item"><div className="legend-dot" style={{ background: "#22c55e" }}></div> Available</div>
            <div className="legend-item"><div className="legend-dot" style={{ background: "#2563eb" }}></div> Pending</div>
            <div className="legend-item"><div className="legend-dot" style={{ background: "#ef4444" }}></div> Confirmed</div>
          </div>

          <div className="svg-scroll">
            <svg viewBox="50 50 900 900" preserveAspectRatio="xMidYMid meet">
              {/* Outer border */}
              <rect x="55" y="55" width="890" height="890" rx="36" fill="none" stroke="#e2e8f0" strokeWidth="3" />

              {/* Study table */}
              <rect x="350" y="400" width="300" height="200" rx="28" fill="#fef3c7" stroke="#d97706" strokeWidth="5" />
              <text x="500" y="510" textAnchor="middle" fontSize="17" fill="#92400e" fontWeight="700">STUDY TABLE</text>

              {/* Inner ring */}
              {innerSeats.map(([x, y], i) => (
                <Seat key={`I${i + 1}`} id={`I${i + 1}`} x={x} y={y} />
              ))}

              {/* Outer ring */}
              {outerSeats.map(([x, y], i) => (
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