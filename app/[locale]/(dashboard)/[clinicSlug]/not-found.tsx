'use client'

import Link from 'next/link'

export default function ClinicNotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="max-w-md">
        <p className="text-6xl font-bold text-primary/30 mb-4">404</p>
        <h1 className="text-2xl font-bold text-slate-200 mb-3">Clinic Not Found</h1>
        <p className="text-slate-400 mb-8">
          This clinic doesn&apos;t exist or you don&apos;t have access to it.
        </p>
        <Link
          href="/clinic-switcher"
          className="inline-flex items-center px-8 py-3 rounded-xl text-sm font-semibold bg-primary text-black hover:bg-primary/90 transition-all"
        >
          Switch Clinic
        </Link>
      </div>
    </div>
  )
}
