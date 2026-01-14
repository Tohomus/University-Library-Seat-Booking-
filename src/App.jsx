import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"

import Login from "./pages/Login"
import Register from "./pages/Register"
import Booking from "./pages/Booking"
import Profile from "./pages/Profile"

import DashboardLayout from "./layout/DashboardLayout"
import ProtectedRoute from "./components/ProtectedRoute"
import AdminDashboard from "./pages/admin/AdminDashboard"

function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Public */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected */}
        <Route
          path="/booking"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <Booking />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <Profile />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
  path="/admin"
  element={
    <DashboardLayout>
      <AdminDashboard />
    </DashboardLayout>
  }
/>


        <Route path="*" element={<Navigate to="/login" replace />} />

      </Routes>
    </BrowserRouter>
  )
}

export default App
