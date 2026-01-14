function Navbar({ showAction = false, actionText = "Login" }) {
  return (
    <nav className="w-full flex justify-between items-center px-6 py-4">
      <div className="flex items-center gap-2 text-blue-600 font-semibold text-lg">
        🏛️ University Library
      </div>

      {showAction && (
        <button className="px-4 py-2 rounded-lg bg-blue-500 text-white font-medium hover:bg-blue-600 transition">
          {actionText}
        </button>
      )}
    </nav>
  )
}

export default Navbar
