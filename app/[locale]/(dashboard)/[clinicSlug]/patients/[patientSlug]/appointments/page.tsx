import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { requireClinicId } from "@/lib/utils/clinic"
import { PremiumCard, PageHeader, EmptyState } from '@/components/layout/PageComponents'
import { Calendar } from 'lucide-react'

export default async function PatientAppointmentsPage({
  params: { locale, clinicSlug, patientSlug }
}: {
  params: { locale: string; clinicSlug: string; patientSlug: string }
}) {
  const clinicId = await requireClinicId(clinicSlug);
  const supabase = createClient()
  const isAr = locale === 'ar'
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/${locale}/login`)

  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(patientSlug)
  
  let patientQuery = supabase
    .from('patients')
    .select(`
      *,
      appointments (
        *,
        clinic_services ( name ),
        clinic_staff_memberships (
          staff_members ( full_name )
        )
      )
    `)
    .eq('clinic_id', clinicId)

  if (isUUID) {
    patientQuery = patientQuery.eq('id', patientSlug)
  } else {
    patientQuery = patientQuery.eq('display_id', patientSlug)
  }

  const { data: patient } = await patientQuery.single()

  if (!patient) redirect(`/${locale}/${clinicSlug}/patients`)

  const appointments = patient.appointments || []

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <PageHeader
        title={isAr ? `مواعيد ${patient.full_name}` : `${patient.full_name}'s Appointments`}
        description={isAr ? 'عرض المواعيد السابقة والقادمة.' : 'View past and upcoming appointments.'}
        icon={Calendar}
        iconColor="text-violet-400"
        iconBg="rgba(139,92,246,0.12)"
      />
      
      <PremiumCard className="p-6">
        {appointments.length === 0 ? (
          <EmptyState 
            icon={Calendar} 
            title={isAr ? 'لا توجد مواعيد' : 'No Appointments'} 
            description={isAr ? 'لم يتم تسجيل أي مواعيد لهذا المريض.' : 'This patient has no recorded appointments.'} 
          />
        ) : (
          <div className="space-y-4">
            {appointments.map((apt: any) => (
              <div key={apt.id} className="p-4 rounded-xl border border-white/5 bg-white/[0.02] flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-white">
                    {new Date(apt.start_time).toLocaleDateString()} at {new Date(apt.start_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </h4>
                  <p className="text-sm text-slate-400 mt-1">
                    {apt.clinic_services?.name || 'General Visit'} • Dr. {apt.clinic_staff_memberships?.staff_members?.full_name || 'Staff'}
                  </p>
                </div>
                <div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
                    apt.status === 'scheduled' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                    apt.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                    apt.status === 'cancelled' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                    'bg-slate-500/10 text-slate-400 border-slate-500/20'
                  }`}>
                    {apt.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </PremiumCard>
    </div>
  )
}
