function PrimaryButton({ children, type = "button", fullWidth = false }) {
  return (
    <button
      type={type}
      className={`
        ${fullWidth ? "w-full" : ""}
        bg-blue-500 hover:bg-blue-600
        text-white font-semibold
        py-2.5 rounded-lg
        transition duration-200
      `}
    >
      {children}
    </button>
  )
}

export default PrimaryButton
