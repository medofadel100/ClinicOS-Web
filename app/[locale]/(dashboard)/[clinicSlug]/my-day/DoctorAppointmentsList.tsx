'use client'

import { useState } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'
import { Clock, ChevronRight, Calendar, CreditCard } from 'lucide-react'
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

export default function DoctorAppointmentsList({
  appointments,
  clinicId,
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
  const [filter, setFilter] = useState<'all' | 'scheduled' | 'completed' | 'needs_payment'>('all')
  const [loadingId, setLoadingId] = useState<string | null>(null)

  const filtered = filter === 'all' ? appointments : appointments.filter(a => a.status === filter)

  const statusConfig: Record<string, { color: string; bg: string; label: string }> = {
    scheduled: { color: 'text-blue-400', bg: 'rgba(59,130,246,0.12)', label: isAr ? 'مجدول' : 'Scheduled' },
    confirmed: { color: 'text-teal-400', bg: 'rgba(0,212,170,0.12)', label: isAr ? 'مؤكد' : 'Confirmed' },
    completed: { color: 'text-green-400', bg: 'rgba(34,197,94,0.12)', label: isAr ? 'مكتمل' : 'Completed' },
    needs_payment: { color: 'text-amber-400', bg: 'rgba(245,158,11,0.12)', label: isAr ? 'بانتظار الدفع' : 'Needs Payment' },
    cancelled: { color: 'text-red-400', bg: 'rgba(239,68,68,0.12)', label: isAr ? 'ملغي' : 'Cancelled' },
    no_show: { color: 'text-amber-400', bg: 'rgba(245,158,11,0.12)', label: isAr ? 'لم يحضر' : 'No Show' },
  }

  const handleCompleteAndBill = async (appId: string) => {
    setLoadingId(appId)
    try {
      await updateAppointmentStatus(appId, clinicId, locale, 'needs_payment')
    } catch {
      toast.error(isAr ? 'فشل في تحديث الحالة' : 'Failed to update status')
    } finally {
      setLoadingId(null)
    }
  }

  return (
    <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
          <Clock className="w-4 h-4 text-cyan-400" />
          {isAr ? 'مواعيدي اليوم' : "Today's Appointments"}
        </h3>
        <div className="flex gap-1">
          {(['all', 'scheduled', 'needs_payment', 'completed'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors ${
                filter === f
                  ? 'text-white bg-white/10'
                  : 'text-slate-500 hover:text-slate-300 hover:bg-white/[0.04]'
              }`}
            >
              {f === 'all' ? (isAr ? 'الكل' : 'All') : statusConfig[f]?.label || f}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-8">
          <Calendar className="w-8 h-8 text-slate-600 mx-auto mb-2" />
          <p className="text-sm text-slate-500">{isAr ? 'لا توجد مواعيد' : 'No appointments'}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(app => {
            const time = new Date(app.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            const end = new Date(new Date(app.scheduled_at).getTime() + app.duration_minutes * 60000)
            const endTime = end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            const st = statusConfig[app.status] || statusConfig.scheduled
            const canComplete = ['scheduled', 'confirmed'].includes(app.status)

            return (
              <div
                key={app.id}
                className="flex items-center justify-between p-3.5 rounded-xl transition-all"
                style={{ border: '1px solid rgba(255,255,255,0.04)' }}
              >
                <Link
                  href={`/${locale}/${clinicSlug}/patients/${app.patient_id}`}
                  className="flex items-center gap-3 flex-1 min-w-0 group"
                >
                  <div className="flex flex-col items-center justify-center min-w-[48px] py-1 rounded-lg" style={{ background: st.bg }}>
                    <span className="text-xs font-bold text-slate-200">{time}</span>
                    <span className="text-[10px] text-slate-500">{endTime}</span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-200 group-hover:text-teal-400 transition-colors truncate">
                      {app.patients?.full_name || '—'}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5 truncate">
                      {app.clinic_services?.name || '—'}
                      {app.clinic_services?.price ? ` — ${app.clinic_services.price} EGP` : ''}
                    </p>
                  </div>
                </Link>

                <div className="flex items-center gap-2 shrink-0 ml-2">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${st.color}`} style={{ background: st.bg }}>
                    {st.label}
                  </span>
                  {canComplete && (
                    <button
                      onClick={() => handleCompleteAndBill(app.id)}
                      disabled={loadingId === app.id}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all disabled:opacity-50"
                      style={{ background: 'rgba(245,158,11,0.15)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.25)' }}
                    >
                      <CreditCard className="w-3 h-3" />
                      {loadingId === app.id ? '...' : (isAr ? 'إنهاء وفوترة' : 'Complete & Bill')}
                    </button>
                  )}
                  <Link href={`/${locale}/${clinicSlug}/patients/${app.patient_id}`}>
                    <ChevronRight className="w-4 h-4 text-slate-600 hover:text-teal-400 transition-colors" />
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
