'use client'

import { useState } from 'react'
import { Clock } from 'lucide-react'
import AppointmentStatusSelect from './AppointmentStatusSelect'
import RescheduleAppointmentDialog from './RescheduleAppointmentDialog'
import PatientQuickView from './PatientQuickView'

type Appointment = {
  id: string
  patient_id: string
  scheduled_at: string
  duration_minutes: number
  status: string
  patients?: { full_name: string; phone?: string; date_of_birth?: string; gender?: string }
  clinic_services?: { name?: string; price?: number }
  clinic_staff_memberships?: { staff_members?: { full_name?: string } }
}

export default function AppointmentsTable({
  appointments,
  clinicId,
  clinicSlug,
  locale,
  isAr,
  targetDate,
}: {
  appointments: Appointment[]
  clinicId: string
  clinicSlug: string
  locale: string
  isAr: boolean
  targetDate: string
}) {
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)

  return (
    <>
      <table className="w-full">
        <thead>
          <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <th className="px-3 md:px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">{isAr ? 'الوقت' : 'Time'}</th>
            <th className="px-3 md:px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">{isAr ? 'المريض' : 'Patient'}</th>
            <th className="hidden md:table-cell px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">{isAr ? 'العمر' : 'Age'}</th>
            <th className="hidden lg:table-cell px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">{isAr ? 'الطبيب' : 'Doctor'}</th>
            <th className="hidden sm:table-cell px-3 md:px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">{isAr ? 'الخدمة' : 'Service'}</th>
            <th className="hidden md:table-cell px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">{isAr ? 'السعر' : 'Price'}</th>
            <th className="px-3 md:px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">{isAr ? 'الحالة' : 'Status'}</th>
          </tr>
        </thead>
        <tbody>
          {!appointments?.length ? (
            <tr>
              <td colSpan={7} className="text-center py-16 text-slate-500 text-sm">
                {isAr ? 'لا توجد مواعيد اليوم' : 'No appointments today'}
              </td>
            </tr>
          ) : appointments.map((app, i) => {
            const time = new Date(app.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            const patientDob = app.patients?.date_of_birth
            let age = '—'
            if (patientDob) {
              const dob = new Date(patientDob)
              const today = new Date()
              let y = today.getFullYear() - dob.getFullYear()
              const m = today.getMonth() - dob.getMonth()
              if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) y--
              age = y.toString()
            }
            return (
              <tr
                key={app.id}
                className="hover:bg-white/[0.03] transition-colors cursor-pointer"
                style={{ borderBottom: i < appointments.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}
                onClick={() => setSelectedAppointment(app)}
              >
                <td className="px-3 md:px-5 py-4">
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-slate-600" />
                    <span className="text-sm font-semibold text-slate-200">{time}</span>
                  </div>
                </td>
                <td className="px-3 md:px-5 py-4">
                  <div>
                    <span
                      className="text-sm font-semibold"
                      style={{ color: 'hsl(168 100% 52%)' }}
                    >
                      {app.patients?.full_name || '—'}
                    </span>
                    {app.patients?.phone && (
                      <p className="text-[11px] text-slate-500 mt-0.5 hidden sm:block">{app.patients.phone}</p>
                    )}
                  </div>
                </td>
                <td className="hidden md:table-cell px-5 py-4 text-sm text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <span>{age}</span>
                    {app.patients?.gender && (
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${app.patients.gender === 'male' ? 'bg-blue-500/15 text-blue-400' : 'bg-pink-500/15 text-pink-400'}`}>
                        {app.patients.gender === 'male' ? (isAr ? 'ذكر' : 'M') : (isAr ? 'أنثى' : 'F')}
                      </span>
                    )}
                  </div>
                </td>
                <td className="hidden lg:table-cell px-5 py-4 text-sm text-slate-400" onClick={e => e.stopPropagation()}>
                  {app.clinic_staff_memberships?.staff_members?.full_name || '—'}
                </td>
                <td className="hidden sm:table-cell px-3 md:px-5 py-4 text-sm text-slate-500">
                  {app.clinic_services?.name || '—'}
                </td>
                <td className="hidden md:table-cell px-5 py-4 text-sm font-medium text-teal-400">
                  {app.clinic_services?.price ? `${app.clinic_services.price.toLocaleString()} EGP` : '—'}
                </td>
                <td className="px-3 md:px-5 py-4" onClick={e => e.stopPropagation()}>
                  <div className="flex items-center gap-2">
                    <AppointmentStatusSelect
                      appointmentId={app.id}
                      clinicId={clinicId}
                      locale={locale}
                      initialStatus={app.status}
                    />
                    {app.status === 'scheduled' && (
                      <RescheduleAppointmentDialog
                        appointmentId={app.id}
                        clinicId={clinicId}
                        locale={locale}
                        initialDate={targetDate}
                        initialTime={new Date(app.scheduled_at).toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' })}
                      />
                    )}
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>

      {/* Patient Quick View Modal */}
      {selectedAppointment && (
        <PatientQuickView
          appointment={selectedAppointment}
          clinicSlug={clinicSlug}
          locale={locale}
          isAr={isAr}
          onClose={() => setSelectedAppointment(null)}
        />
      )}
    </>
  )
}
