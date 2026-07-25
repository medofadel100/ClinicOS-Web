'use client'

import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="max-w-md">
        <p className="text-6xl font-bold text-primary/30 mb-4">404</p>
        <h1 className="text-2xl font-bold text-slate-200 mb-3">Page Not Found</h1>
        <p className="text-slate-400 mb-8">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link
          href="/"
          className="inline-flex items-center px-8 py-3 rounded-xl text-sm font-semibold bg-primary text-black hover:bg-primary/90 transition-all"
        >
          Go Home
        </Link>
      </div>
    </div>
  )
}
