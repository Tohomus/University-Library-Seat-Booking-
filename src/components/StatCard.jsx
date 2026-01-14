const StatCard = ({ title, value, color }) => {
  return (
    <div
      className={`rounded-xl p-6 text-white shadow-md bg-gradient-to-br ${color}`}
    >
      <p className="text-sm opacity-90">{title}</p>
      <p className="text-3xl font-bold mt-2">{value}</p>
    </div>
  )
}

export default StatCard
