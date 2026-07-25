import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { requireClinicId } from '@/lib/utils/clinic'
import { PageHeader } from '@/components/layout/PageComponents'
import { Stethoscope, FileText, ChevronRight } from 'lucide-react'
import DoctorAppointmentsList from './DoctorAppointmentsList'
import WorkRecorder from './WorkRecorder'
import DutyStatus from './DutyStatus'
import FocusModeButton from './FocusModeButton'

export default async function MyDayPage({
  params: { locale, clinicSlug }
}: {
  params: { locale: string; clinicSlug: string }
}) {
  const clinicId = await requireClinicId(clinicSlug)
  const isAr = locale === 'ar'
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/${locale}/login`)

  const { data: staffMember } = await supabase
    .from('staff_members')
    .select('id, full_name')
    .eq('auth_user_id', user.id)
    .single()
  if (!staffMember) redirect(`/${locale}/${clinicSlug}`)

  const { data: membership } = await supabase
    .from('clinic_staff_memberships')
    .select('id, role')
    .eq('staff_member_id', staffMember.id)
    .eq('clinic_id', clinicId)
    .eq('is_active', true)
    .single()
  if (!membership) redirect(`/${locale}/${clinicSlug}`)

  const { data: doctorProfile } = await supabase
    .from('doctor_profiles')
    .select('id, bio, specialty')
    .eq('staff_member_id', staffMember.id)
    .eq('clinic_id', clinicId)
    .single()

  const today = new Date()
  const dayOfWeek = today.getDay()

  const { data: workingHours } = await supabase
    .from('doctor_working_hours')
    .select('start_time, end_time, is_active')
    .eq('doctor_profile_id', doctorProfile?.id || '')
    .eq('day_of_week', dayOfWeek)
    .eq('is_active', true)
    .single()

  const startOfDay = new Date(today)
  startOfDay.setUTCHours(0, 0, 0, 0)
  const endOfDay = new Date(today)
  endOfDay.setUTCHours(23, 59, 59, 999)

  const { data: appointments } = await supabase
    .from('appointments')
    .select(`*, patients ( full_name, phone, display_id ), clinic_services ( name, price )`)
    .eq('clinic_id', clinicId)
    .eq('membership_id', membership.id)
    .gte('scheduled_at', startOfDay.toISOString())
    .lte('scheduled_at', endOfDay.toISOString())
    .order('scheduled_at', { ascending: true })

  const formattedDate = today.toLocaleDateString(isAr ? 'ar-EG' : 'en-US', {
    weekday: 'long', month: 'long', day: 'numeric'
  })

  const now = new Date()
  const currentTime = now.toTimeString().slice(0, 5)

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title={isAr ? 'يومي' : 'My Day'}
        description={isAr ? `مرحباً ${staffMember.full_name} — ${formattedDate}` : `Hello ${staffMember.full_name} — ${formattedDate}`}
        icon={Stethoscope}
        iconColor="text-cyan-400"
        iconBg="rgba(34,211,238,0.12)"
        badge={isAr ? `${appointments?.length ?? 0} موعد` : `${appointments?.length ?? 0} appointments`}
        actions={
          <FocusModeButton
            appointments={(appointments || []) as any[]}
            clinicId={clinicId}
            clinicSlug={clinicSlug}
            locale={locale}
            isAr={isAr}
          />
        }
      />

      {/* Duty Status + Quick Stats */}
      <DutyStatus
        isAr={isAr}
        workingHours={workingHours ? { start_time: workingHours.start_time, end_time: workingHours.end_time } : null}
        currentTime={currentTime}
        appointmentCount={appointments?.length ?? 0}
        specialty={doctorProfile?.specialty || null}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Appointments */}
        <div className="lg:col-span-2">
          <DoctorAppointmentsList
            appointments={(appointments || []) as any[]}
            clinicId={clinicId}
            clinicSlug={clinicSlug}
            locale={locale}
            isAr={isAr}
          />
        </div>

        {/* Quick Actions Panel */}
        <div className="space-y-4">
          {/* Work Recorder */}
          <WorkRecorder
            clinicId={clinicId}
            clinicSlug={clinicSlug}
            locale={locale}
            isAr={isAr}
            staffMemberId={staffMember.id}
            doctorProfileId={doctorProfile?.id || null}
            appointments={(appointments || []) as any[]}
          />

          {/* Patient Files Quick Access */}
          <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <h3 className="text-sm font-semibold text-slate-200 mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4 text-violet-400" />
              {isAr ? 'ملفات المرضى' : 'Patient Files'}
            </h3>
            {appointments && appointments.length > 0 ? (
              <div className="space-y-2">
                {appointments.slice(0, 5).map((app: any) => (
                  <Link
                    key={app.id}
                    href={`/${locale}/${clinicSlug}/patients/${app.patient_id}`}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-white/[0.04] transition-colors"
                  >
                    <span className="text-sm text-slate-300">{app.patients?.full_name || '—'}</span>
                    <ChevronRight className="w-4 h-4 text-slate-500" />
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500">{isAr ? 'لا توجد مواعيد اليوم' : 'No appointments today'}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
