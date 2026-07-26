export default function DashboardLoading() {
  return (
    <div className="flex items-center justify-center min-h-screen" style={{ background: 'hsl(222 47% 5%)' }}>
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 rounded-xl animate-pulse" style={{ background: 'linear-gradient(135deg, hsl(168 100% 42%), hsl(195 100% 50%))' }} />
        <div className="flex gap-1">
          {[0, 1, 2].map(i => (
            <div
              key={i}
              className="w-2 h-2 rounded-full bg-teal-400 animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
