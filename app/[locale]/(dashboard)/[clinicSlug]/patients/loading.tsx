export default function PatientsLoading() {
  return (
    <div className="space-y-4 p-6">
      <div className="flex items-center justify-between">
        <div className="h-8 w-48 rounded-lg animate-pulse bg-white/5" />
        <div className="h-10 w-32 rounded-xl animate-pulse bg-white/5" />
      </div>
      <div className="flex gap-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-8 w-20 rounded-full animate-pulse bg-white/5" />
        ))}
      </div>
      <div className="space-y-2">
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="h-16 rounded-xl animate-pulse bg-white/5" />
        ))}
      </div>
    </div>
  )
}
