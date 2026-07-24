'use client'

import { useState } from 'react'
import Link from 'next/link'
import { X, User, Phone, Calendar, Stethoscope, FileText, Clock, CreditCard, ArrowRight } from 'lucide-react'

type Appointment = {
  id: string
  patient_id: string
  scheduled_at: string
  duration_minutes: number
  status: string
  patients?: { full_name: string; phone?: string; date_of_birth?: string; gender?: string }
  clinic_services?: { name?: string; price?: number; duration_minutes?: number }
  clinic_staff_memberships?: { staff_members?: { full_name?: string } }
}

export default function PatientQuickView({
  appointment,
  clinicSlug,
  locale,
  isAr,
  onClose,
}: {
  appointment: Appointment
  clinicSlug: string
  locale: string
  isAr: boolean
  onClose: () => void
}) {
  const patient = appointment.patients
  const service = appointment.clinic_services
  const doctor = appointment.clinic_staff_memberships?.staff_members?.full_name
  const time = new Date(appointment.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

  let age = '—'
  if (patient?.date_of_birth) {
    const dob = new Date(patient.date_of_birth)
    const today = new Date()
    let y = today.getFullYear() - dob.getFullYear()
    const m = today.getMonth() - dob.getMonth()
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) y--
    age = y.toString()
  }

  const statusMap: Record<string, { en: string; ar: string; color: string }> = {
    scheduled: { en: 'Scheduled', ar: 'مجدول', color: 'text-blue-400 bg-blue-500/15' },
    confirmed: { en: 'Confirmed', ar: 'مؤكد', color: 'text-emerald-400 bg-emerald-500/15' },
    in_progress: { en: 'In Progress', ar: 'جاري', color: 'text-amber-400 bg-amber-500/15' },
    completed: { en: 'Completed', ar: 'مكتمل', color: 'text-green-400 bg-green-500/15' },
    cancelled: { en: 'Cancelled', ar: 'ملغي', color: 'text-red-400 bg-red-500/15' },
    needs_payment: { en: 'Needs Payment', ar: 'بانتظار الدفع', color: 'text-purple-400 bg-purple-500/15' },
    no_show: { en: 'No Show', ar: 'لم يحضر', color: 'text-slate-400 bg-slate-500/15' },
  }
  const status = statusMap[appointment.status] || statusMap.scheduled

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-2xl overflow-hidden"
        style={{ background: 'linear-gradient(135deg, hsl(222 47% 8%) 0%, hsl(222 47% 6%) 100%)', border: '1px solid rgba(255,255,255,0.08)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 pb-0">
          <h3 className="text-base font-bold text-white">{isAr ? 'تفاصيل الموعد' : 'Appointment Details'}</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/[0.06] transition-colors">
            <X className="w-4 h-4 text-slate-400" />
          </button>
        </div>

        {/* Patient Info */}
        <div className="p-5 space-y-4">
          {/* Patient Name & Status */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'rgba(0,212,170,0.12)' }}>
                <User className="w-6 h-6 text-teal-400" />
              </div>
              <div>
                <Link
                  href={`/${locale}/${clinicSlug}/patients/${appointment.patient_id}`}
                  className="text-lg font-bold hover:underline"
                  style={{ color: 'hsl(168 100% 52%)' }}
                >
                  {patient?.full_name || '—'}
                </Link>
                <p className="text-xs text-slate-500 mt-0.5">{isAr ? 'اضغط للملف الكامل' : 'Click for full profile'}</p>
              </div>
            </div>
            <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${status.color}`}>
              {isAr ? status.ar : status.en}
            </span>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-3">
            {patient?.phone && (
              <div className="flex items-center gap-2.5 p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <Phone className="w-4 h-4 text-slate-500 shrink-0" />
                <div>
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider">{isAr ? 'الهاتف' : 'Phone'}</p>
                  <p className="text-sm font-medium text-slate-200">{patient.phone}</p>
                </div>
              </div>
            )}

            <div className="flex items-center gap-2.5 p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <User className="w-4 h-4 text-slate-500 shrink-0" />
              <div>
                <p className="text-[10px] text-slate-500 uppercase tracking-wider">{isAr ? 'العمر والجنس' : 'Age & Gender'}</p>
                <div className="flex items-center gap-1.5">
                  <p className="text-sm font-medium text-slate-200">{age}{isAr ? ' سنة' : ' yrs'}</p>
                  {patient?.gender && (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${patient.gender === 'male' ? 'bg-blue-500/15 text-blue-400' : 'bg-pink-500/15 text-pink-400'}`}>
                      {patient.gender === 'male' ? (isAr ? '♂ ذكر' : '♂ M') : (isAr ? '♀ أنثى' : '♀ F')}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2.5 p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <Clock className="w-4 h-4 text-slate-500 shrink-0" />
              <div>
                <p className="text-[10px] text-slate-500 uppercase tracking-wider">{isAr ? 'الوقت' : 'Time'}</p>
                <p className="text-sm font-medium text-slate-200">{time}</p>
              </div>
            </div>

            {service && (
              <div className="flex items-center gap-2.5 p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <Stethoscope className="w-4 h-4 text-violet-400 shrink-0" />
                <div>
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider">{isAr ? 'الخدمة المطلوبة' : 'Requested Service'}</p>
                  <p className="text-sm font-medium text-slate-200">{service.name}</p>
                </div>
              </div>
            )}

            {service?.price && (
              <div className="flex items-center gap-2.5 p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <CreditCard className="w-4 h-4 text-amber-400 shrink-0" />
                <div>
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider">{isAr ? 'السعر' : 'Price'}</p>
                  <p className="text-sm font-bold text-teal-400">{service.price.toLocaleString()} EGP</p>
                </div>
              </div>
            )}

            {doctor && (
              <div className="flex items-center gap-2.5 p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <FileText className="w-4 h-4 text-cyan-400 shrink-0" />
                <div>
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider">{isAr ? 'الطبيب المعالج' : 'Doctor'}</p>
                  <p className="text-sm font-medium text-slate-200">{doctor}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="px-5 pb-5 flex gap-3">
          <Link
            href={`/${locale}/${clinicSlug}/patients/${appointment.patient_id}/clinical`}
            className="flex-1 flex items-center justify-center gap-2 h-11 rounded-xl text-sm font-bold transition-all"
            style={{ background: 'linear-gradient(135deg, hsl(168 100% 42%), hsl(195 100% 50%))', color: '#0a0f1e' }}
          >
            <Stethoscope className="w-4 h-4" />
            {isAr ? 'مساحة العمل' : 'Clinical'}
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href={`/${locale}/${clinicSlug}/patients/${appointment.patient_id}/prescriptions`}
            className="flex items-center justify-center gap-2 h-11 px-4 rounded-xl text-sm font-medium transition-all bg-violet-500/15 text-violet-400 border border-violet-500/25 hover:bg-violet-500/25"
          >
            <FileText className="w-4 h-4" />
            {isAr ? 'روشتة' : 'Rx'}
          </Link>
        </div>
      </div>
    </div>
  )
}
