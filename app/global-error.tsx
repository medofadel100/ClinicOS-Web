'use client'

import { useEffect } from 'react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[Global Error]', error)
  }, [error])

  return (
    <html lang="en">
      <body className="bg-[hsl(222,47%,5%)] min-h-screen flex items-center justify-center">
        <div className="text-center px-4 max-w-md">
          <div className="w-20 h-20 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-8">
            <svg className="w-10 h-10 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-200 mb-3">Something went wrong</h1>
          <p className="text-slate-400 mb-8">
            A critical error occurred. Please try again or contact support.
          </p>
          <button
            onClick={reset}
            className="px-8 py-3 rounded-xl text-sm font-semibold bg-primary text-black hover:bg-primary/90 transition-all"
          >
            Try Again
          </button>
        </div>
      </body>
    </html>
  )
}
