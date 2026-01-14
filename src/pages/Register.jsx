import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { createUserWithEmailAndPassword } from "firebase/auth"
import { doc, setDoc } from "firebase/firestore"

import { auth, db } from "../firebase/firebase"
import Navbar from "../components/Navbar"
import PrimaryButton from "../components/PrimaryButton"
import InputField from "../components/InputField"
import studyImg from "../assets/Studying-rafiki.svg"

function Register() {
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    studentId: "",
    mobile: "",
    password: "",
    confirmPassword: "",
  })

  const [error, setError] = useState("")
  const [showSuccess, setShowSuccess] = useState(false)
  const [countdown, setCountdown] = useState(3)

  // Countdown + redirect
  useEffect(() => {
    if (showSuccess) {
      const timer = setInterval(() => {
        setCountdown((prev) => prev - 1)
      }, 1000)

      setTimeout(() => {
        navigate("/login")
      }, 3000)

      return () => clearInterval(timer)
    }
  }, [showSuccess, navigate])

  const handleChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    setError("")


    const { fullName, email, studentId, mobile, password, confirmPassword } =
      formData

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    try {
      // 1️⃣ Create Firebase Auth user
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      )

      const user = userCredential.user

      // 2️⃣ Store extra profile info in Firestore
      await setDoc(doc(db, "users", user.uid), {
        fullName,
        email,
        studentId,
        mobile,
        createdAt: new Date(),
      })

      // 3️⃣ Show success popup
      setShowSuccess(true)
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-slate-50 to-orange-50">
      <Navbar showAction actionText="Register" />

      <div className="flex items-center justify-center px-6 mt-12">
        <div className="grid md:grid-cols-2 gap-12 items-center max-w-5xl w-full">

          {/* Register Card */}
          <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
            <h1 className="text-2xl font-bold text-slate-800 mb-2">
              Create Account
            </h1>
            <p className="text-slate-600 mb-6">
              Register to access CUSAT Library Seat Booking
            </p>

            {error && (
              <p className="mb-4 text-sm text-red-600 bg-red-50 p-2 rounded">
                {error}
              </p>
            )}

            <form className="space-y-4" onSubmit={handleRegister}>
              <InputField
                label="Full Name"
                placeholder="Enter your full name"
                onChange={(e) => handleChange("fullName", e.target.value)}
              />

              <InputField
                label="Email"
                type="email"
                placeholder="Enter your email"
                onChange={(e) => handleChange("email", e.target.value)}
              />

              <InputField
                label="Student ID"
                placeholder="Enter your Student ID"
                onChange={(e) => handleChange("studentId", e.target.value)}
              />

              <InputField
                label="Mobile Number"
                placeholder="Enter your mobile number"
                onChange={(e) => handleChange("mobile", e.target.value)}
              />

              <InputField
                label="Password"
                type="password"
                placeholder="Create a password"
                onChange={(e) => handleChange("password", e.target.value)}
              />

              <InputField
                label="Confirm Password"
                type="password"
                placeholder="Re-enter password"
                onChange={(e) => handleChange("confirmPassword", e.target.value)}
              />

              <PrimaryButton type="submit" fullWidth>
                Register
              </PrimaryButton>
            </form>

            <p className="text-sm text-slate-500 mt-4 text-center">
              Already have an account?{" "}
              <Link to="/login" className="text-blue-500 font-medium hover:underline">
                Login
              </Link>
            </p>
          </div>

          {/* Illustration */}
          <img
            src={studyImg}
            alt="Student studying"
            className="hidden md:block max-w-sm opacity-90"
          />
        </div>
      </div>

      {/* SUCCESS POPUP */}
      {showSuccess && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-sm text-center shadow-2xl">
            <h2 className="text-xl font-bold text-green-600 mb-2">
              🎉 Registration Successful!
            </h2>
            <p className="text-slate-600 mb-4">
              You are now a member of <b>CUSAT Library</b>.
            </p>
            <p className="text-slate-500">
              Redirecting to Login page in{" "}
              <span className="font-bold text-blue-500">{countdown}</span> seconds…
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default Register
