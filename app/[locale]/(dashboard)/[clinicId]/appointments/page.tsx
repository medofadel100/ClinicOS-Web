import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { PageHeader, PremiumCard, PremiumTableWrapper, EmptyState, StatusBadge } from '@/components/layout/PageComponents'
import { Calendar, Clock } from 'lucide-react'
import BookAppointmentDialog from './BookAppointmentDialog'
import WaitlistManagement from './WaitlistManagement'
import AppointmentStatusSelect from './AppointmentStatusSelect'
import RescheduleAppointmentDialog from './RescheduleAppointmentDialog'
import AppointmentFilters from './AppointmentFilters'

export default async function AppointmentsPage({
  params: { locale, clinicId },
  searchParams
}: {
  params: { locale: string; clinicId: string },
  searchParams: { date?: string; doctor?: string }
}) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/${locale}/login`)

  const targetDate = searchParams.date || new Date().toISOString().split('T')[0]

  const startOfDay = new Date(targetDate)
  startOfDay.setUTCHours(0, 0, 0, 0)
  const endOfDay = new Date(targetDate)
  endOfDay.setUTCHours(23, 59, 59, 999)

  let query = supabase
    .from('appointments')
    .select(`*, patients ( full_name, phone ), clinic_staff_memberships ( staff_members ( full_name ) ), clinic_services ( name )`)
    .eq('clinic_id', clinicId)
    .gte('scheduled_at', startOfDay.toISOString())
    .lte('scheduled_at', endOfDay.toISOString())
    .order('scheduled_at', { ascending: true })

  if (searchParams.doctor) {
    query = query.eq('membership_id', searchParams.doctor)
  }

  const { data: appointments } = await query

  const { data: doctors } = await supabase
    .from('clinic_staff_memberships')
    .select(`id, staff_members(full_name)`)
    .eq('clinic_id', clinicId)
    .eq('role', 'doctor')
    .eq('is_active', true)

  const { data: services } = await supabase
    .from('clinic_services')
    .select('id, name, duration_minutes')
    .eq('clinic_id', clinicId)

  const { data: patients } = await supabase
    .from('patients')
    .select('id, full_name')
    .eq('clinic_id', clinicId)

  const { data: waitlist } = await supabase
    .from('patient_waitlist')
    .select(`*, patients(full_name), clinic_staff_memberships(staff_members(full_name))`)
    .eq('clinic_id', clinicId)
    .order('created_at', { ascending: false })

  type Doctor = { id: string; staff_members: { full_name: string } }
  type Service = { id: string; name: string; duration_minutes: number }
  type Patient = { id: string; full_name: string }
  type WaitlistEntry = {
    id: string; status: string; desired_from: string; desired_to: string;
    patients?: { full_name: string }
    clinic_staff_memberships?: { staff_members?: { full_name: string } }
  }

  const typedDoctors = (doctors || []) as unknown as Doctor[]
  const typedServices = (services || []) as unknown as Service[]
  const typedPatients = (patients || []) as unknown as Patient[]
  const typedWaitlist = (waitlist || []) as unknown as WaitlistEntry[]

  const formattedDate = new Date(targetDate + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'
  })

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Appointments"
        description={`Schedule for ${formattedDate}`}
        icon={Calendar}
        iconColor="text-blue-400"
        iconBg="rgba(59,130,246,0.12)"
        badge={`${appointments?.length ?? 0} today`}
        actions={
          <div className="flex items-center gap-2">
            <AppointmentFilters
              targetDate={targetDate}
              doctors={typedDoctors}
              selectedDoctor={searchParams.doctor || ''}
            />
            <BookAppointmentDialog
              clinicId={clinicId}
              locale={locale}
              doctors={typedDoctors}
              services={typedServices}
              patients={typedPatients}
            />
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main appointments table */}
        <div className="lg:col-span-2 space-y-3">
          <PremiumTableWrapper>
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  {['Time', 'Patient', 'Doctor', 'Service', 'Status'].map(h => (
                    <th key={h} className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {!appointments?.length ? (
                  <tr>
                    <td colSpan={5}>
                      <EmptyState
                        icon={Calendar}
                        title="No appointments today"
                        description="Book a new appointment using the button above"
                      />
                    </td>
                  </tr>
                ) : appointments.map((app, i) => {
                  const time = new Date(app.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  return (
                    <tr
                      key={app.id}
                      className="hover:bg-white/[0.02] transition-colors"
                      style={{ borderBottom: i < appointments.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5 text-slate-600" />
                          <span className="text-sm font-semibold text-slate-200">{time}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <Link
                          href={`/${locale}/${clinicId}/patients/${app.patient_id}`}
                          className="text-sm font-semibold transition-colors"
                          style={{ color: 'hsl(168 100% 52%)' }}
                        >
                          {app.patients?.full_name || '—'}
                        </Link>
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-400">
                        {app.clinic_staff_memberships?.staff_members?.full_name || '—'}
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-500">
                        {app.clinic_services?.name || '—'}
                      </td>
                      <td className="px-5 py-4">
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
          </PremiumTableWrapper>
        </div>

        {/* Waitlist */}
        <div>
          <WaitlistManagement
            clinicId={clinicId}
            locale={locale}
            waitlist={typedWaitlist}
            patients={typedPatients}
            doctors={typedDoctors}
          />
        </div>
      </div>
    </div>
  )
}
