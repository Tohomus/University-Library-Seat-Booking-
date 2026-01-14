import { useState } from "react"
import { signInWithEmailAndPassword } from "firebase/auth"
import { Link, useNavigate } from "react-router-dom"

import { auth } from "../firebase/firebase"
import Navbar from "../components/Navbar"
import PrimaryButton from "../components/PrimaryButton"
import InputField from "../components/InputField"
import studyImg from "../assets/Studying-rafiki.svg"

function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  const handleLogin = async (e) => {
    e.preventDefault()
    setError("")

    try {
      await signInWithEmailAndPassword(auth, email, password)
      navigate("/booking")
    } catch {
      setError("Invalid email or password")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-slate-50 to-orange-50">
      <Navbar showAction actionText="Login" />

      <div className="flex items-center justify-center px-6 mt-12">
        <div className="grid md:grid-cols-2 gap-12 items-center max-w-5xl w-full">

          {/* Login Card */}
          <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
            <h1 className="text-2xl font-bold text-slate-800 mb-2">
              University Library Seat Booking
            </h1>
            <p className="text-slate-600 mb-6">
              Login to book your study seat
            </p>

            {error && (
              <p className="mb-4 text-sm text-red-600 bg-red-50 p-2 rounded">
                {error}
              </p>
            )}

            <form className="space-y-4" onSubmit={handleLogin}>
              <InputField
                label="Email"
                type="email"
                placeholder="Enter your email"
                onChange={(e) => setEmail(e.target.value)}
              />

              <InputField
                label="Password"
                type="password"
                placeholder="Enter your password"
                onChange={(e) => setPassword(e.target.value)}
              />

              <PrimaryButton type="submit" fullWidth>
                Login
              </PrimaryButton>
            </form>

            <p className="text-sm text-slate-500 mt-4 text-center">
              Don’t have an account?{" "}
              <Link to="/register" className="text-blue-500 font-medium hover:underline">
                Sign up
              </Link>
            </p>
          </div>

          {/* Illustration */}
          <img
            src={studyImg}
            alt="Student studying"
            className="hidden md:block max-w-md"
          />
        </div>
      </div>
    </div>
  )
}

export default Login
