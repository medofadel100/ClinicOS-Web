export default function ReportsLoading() {
  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-3">
        <div className="h-8 w-48 rounded-lg animate-pulse bg-white/5" />
        <div className="h-8 w-24 rounded-lg animate-pulse bg-white/5" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-72 rounded-2xl animate-pulse bg-white/5" />
        ))}
      </div>
    </div>
  )
}
