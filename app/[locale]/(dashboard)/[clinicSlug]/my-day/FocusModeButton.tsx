'use client'

import Link from 'next/link'
import { Focus } from 'lucide-react'

type Appointment = {
  id: string
  patient_id: string
  scheduled_at: string
  duration_minutes: number
  status: string
  patients?: { full_name: string; phone?: string }
  clinic_services?: { name?: string; price?: number }
}

export default function FocusModeButton({
  appointments,
  clinicId: _clinicId,
  clinicSlug,
  locale,
  isAr
}: {
  appointments: Appointment[]
  clinicId: string
  clinicSlug: string
  locale: string
  isAr: boolean
}) {
  const activeCount = appointments.filter(a => ['scheduled', 'confirmed'].includes(a.status)).length

  return (
    <Link
      href={`/${locale}/${clinicSlug}/my-day/focus`}
      className="flex items-center gap-2 h-10 px-4 rounded-lg text-sm font-medium transition-all bg-cyan-500/15 text-cyan-400 border border-cyan-500/25 hover:bg-cyan-500/25"
    >
      <Focus className="w-4 h-4" />
      {isAr ? 'وضع التركيز' : 'Focus Mode'}
      {activeCount > 0 && (
        <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/30 text-cyan-300">
          {activeCount}
        </span>
      )}
    </Link>
  )
}
