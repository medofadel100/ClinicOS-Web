export default function SettingsLoading() {
  return (
    <div className="space-y-6 p-6">
      <div className="h-8 w-40 rounded-lg animate-pulse bg-white/5" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-48 rounded-2xl animate-pulse bg-white/5" />
        ))}
      </div>
      <div className="space-y-4">
        {[1, 2].map(i => (
          <div key={i} className="h-32 rounded-2xl animate-pulse bg-white/5" />
        ))}
      </div>
    </div>
  )
}
