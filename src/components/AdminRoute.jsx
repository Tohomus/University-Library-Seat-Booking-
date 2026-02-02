import { useAuth } from "../context/AuthContext"
import { Navigate } from "react-router-dom"
import { doc, getDoc } from "firebase/firestore"
import { db } from "../firebase/firebase"
import { useEffect, useState } from "react"

const AdminRoute = ({ children }) => {
  const { user } = useAuth()
  const [isAdmin, setIsAdmin] = useState(null)

  useEffect(() => {
    const checkRole = async () => {
      if (!user) return setIsAdmin(false)
      const snap = await getDoc(doc(db, "users", user.uid))
      setIsAdmin(snap.data()?.role === "admin")
    }
    checkRole()
  }, [user])

  if (isAdmin === null) return <p>Loading...</p>

  return isAdmin ? children : <Navigate to="/booking" />
}

export default AdminRoute
