'use client'

export default function Offline() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[hsl(222,47%,5%)] text-center px-4">
      <div className="max-w-md">
        <div className="w-20 h-20 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-8">
          <svg className="w-10 h-10 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.242 2.829a5 5 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-slate-200 mb-3">You&apos;re Offline</h1>
        <p className="text-slate-400 mb-8">
          It seems you&apos;ve lost your internet connection. Please check your network and try again.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-8 py-3 rounded-xl text-sm font-semibold bg-primary text-black hover:bg-primary/90 transition-all"
        >
          Retry
        </button>
      </div>
    </div>
  )
}
