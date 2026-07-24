'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Clock, ChevronRight, CreditCard, FileText, Stethoscope, ArrowLeft } from 'lucide-react'
import { updateAppointmentStatus } from '../appointments/actions'

type Appointment = {
  id: string
  patient_id: string
  scheduled_at: string
  duration_minutes: number
  status: string
  patients?: { full_name: string; phone?: string }
  clinic_services?: { name?: string; price?: number }
}

export default function FocusMode({
  appointments,
  clinicId,
  clinicSlug,
  locale,
  isAr,
  doctorName
}: {
  appointments: Appointment[]
  clinicId: string
  clinicSlug: string
  locale: string
  isAr: boolean
  doctorName: string
}) {
  const [currentIdx, setCurrentIdx] = useState(0)
  const [loadingId, setLoadingId] = useState<string | null>(null)

  const activeAppointments = appointments.filter(a => ['scheduled', 'confirmed'].includes(a.status))
  const current = activeAppointments[currentIdx]

  const handleComplete = async (appId: string) => {
    setLoadingId(appId)
    try {
      await updateAppointmentStatus(appId, clinicId, locale, 'needs_payment')
      if (currentIdx >= activeAppointments.length - 1) {
        setCurrentIdx(Math.max(0, currentIdx - 1))
      }
    } catch (err) {
      alert(isAr ? 'فشل' : 'Failed')
    } finally {
      setLoadingId(null)
    }
  }

  if (!current) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6">
        <div className="w-16 h-16 rounded-2xl bg-green-500/15 flex items-center justify-center mb-4">
          <Stethoscope className="w-8 h-8 text-green-400" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">{isAr ? 'انتهيت!' : 'All Done!'}</h2>
        <p className="text-slate-400 text-sm">{isAr ? 'لا يوجد مرضى في الانتظار' : 'No patients waiting'}</p>
        <Link
          href={`/${locale}/${clinicSlug}/my-day`}
          className="mt-4 px-4 py-2 rounded-lg text-sm font-medium bg-white/5 text-slate-300 hover:bg-white/10 transition-colors"
        >
          {isAr ? 'العودة' : 'Back'}
        </Link>
      </div>
    )
  }

  const time = new Date(current.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

  return (
    <div className="min-h-[60vh] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/[0.06]">
        <Link
          href={`/${locale}/${clinicSlug}/my-day`}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">{isAr ? 'رجوع' : 'Back'}</span>
        </Link>
        <span className="text-xs text-slate-500">
          {currentIdx + 1} / {activeAppointments.length}
        </span>
      </div>

      {/* Patient Card - Large & Focused */}
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-sm">
          {/* Time badge */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/15 text-cyan-400">
              <Clock className="w-4 h-4" />
              <span className="text-lg font-bold">{time}</span>
            </div>
          </div>

          {/* Patient Name - Large */}
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-white mb-2">{current.patients?.full_name || '—'}</h1>
            {current.patients?.phone && (
              <p className="text-slate-400 text-sm">{current.patients.phone}</p>
            )}
          </div>

          {/* Service */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.04] border border-white/[0.06]">
              <FileText className="w-4 h-4 text-violet-400" />
              <span className="text-sm text-slate-300">{current.clinic_services?.name || '—'}</span>
              {current.clinic_services?.price && (
                <span className="text-sm font-bold text-teal-400">{current.clinic_services.price} EGP</span>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-3">
            <Link
              href={`/${locale}/${clinicSlug}/patients/${current.patient_id}/clinical`}
              className="flex items-center justify-center gap-3 w-full h-14 rounded-xl text-base font-medium transition-all bg-teal-500/15 text-teal-400 border border-teal-500/25 hover:bg-teal-500/25"
            >
              <Stethoscope className="w-5 h-5" />
              {isAr ? 'مساحة العمل السريرية' : 'Clinical Workspace'}
            </Link>

            <Link
              href={`/${locale}/${clinicSlug}/patients/${current.patient_id}/prescriptions`}
              className="flex items-center justify-center gap-3 w-full h-14 rounded-xl text-base font-medium transition-all bg-violet-500/15 text-violet-400 border border-violet-500/25 hover:bg-violet-500/25"
            >
              <FileText className="w-5 h-5" />
              {isAr ? 'كتابة وصفة' : 'Write Prescription'}
            </Link>

            <button
              onClick={() => handleComplete(current.id)}
              disabled={loadingId === current.id}
              className="flex items-center justify-center gap-3 w-full h-14 rounded-xl text-base font-medium transition-all bg-amber-500/15 text-amber-400 border border-amber-500/25 hover:bg-amber-500/25 disabled:opacity-50"
            >
              <CreditCard className="w-5 h-5" />
              {loadingId === current.id ? '...' : (isAr ? 'إنهاء — بانتظار الدفع' : 'Complete — Needs Payment')}
            </button>
          </div>

          {/* Next patient arrow */}
          {activeAppointments.length > 1 && (
            <div className="flex justify-center mt-6">
              <button
                onClick={() => setCurrentIdx((currentIdx + 1) % activeAppointments.length)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-white/[0.05] transition-all"
              >
                {isAr ? 'المريض التالي' : 'Next Patient'}
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
