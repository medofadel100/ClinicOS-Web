import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { requireClinicId } from '@/lib/utils/clinic'
import { PremiumCard } from '@/components/layout/PageComponents'
import { Activity, FileText } from 'lucide-react'
import Link from 'next/link'
import PatientTimeline, { TimelineEvent } from './components/PatientTimeline'
import VitalsWidget from './components/VitalsWidget'

export default async function PatientOverviewPage({
  params: { locale, clinicSlug, patientSlug }
}: {
  params: { locale: string; clinicSlug: string; patientSlug: string }
}) {
  const isAr = locale === 'ar'
  const clinicId = await requireClinicId(clinicSlug);
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/${locale}/login`)

  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(patientSlug)
  
  let patientQuery = supabase
    .from('patients')
    .select(`
      *,
      appointments (
        id, scheduled_at, status,
        clinic_services ( name )
      ),
      patient_payments (
        id, amount_egp, payment_method, paid_at
      ),
      patient_clinical_notes (
        id, note_type, created_at, content
      )
    `)
    .eq('clinic_id', clinicId)

  if (isUUID) {
    patientQuery = patientQuery.eq('id', patientSlug)
  } else {
    patientQuery = patientQuery.eq('display_id', patientSlug)
  }

  const { data: patient, error: patientError } = await patientQuery.single()

  if (patientError) {
    console.error('Patient load error:', patientError)
  }

  if (!patient) redirect(`/${locale}/${clinicSlug}/patients`)

  // 1. Prepare Vitals
  const clinicalNotes = patient.patient_clinical_notes || []
  const vitalsNotes = clinicalNotes.filter((n: any) => n.note_type === 'vitals')
  const latestVitals = vitalsNotes.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0]

  // 2. Prepare Timeline Events
  const events: TimelineEvent[] = []
  
  ;(patient.appointments || []).forEach((apt: any) => {
    events.push({
      id: apt.id,
      type: 'appointment',
      date: apt.scheduled_at,
      title: apt.clinic_services?.name || (isAr ? 'زيارة عامة' : 'General Visit'),
      subtitle: `Status: ${apt.status}`,
      status: apt.status
    })
  })

  ;(patient.patient_payments || []).forEach((pay: any) => {
    events.push({
      id: pay.id,
      type: 'payment',
      date: pay.paid_at,
      title: isAr ? 'تم استلام الدفعة' : 'Payment Received',
      subtitle: `${pay.amount_egp} EGP via ${pay.payment_method?.replace('_', ' ')}`
    })
  })

  clinicalNotes.forEach((note: any) => {
    if (note.note_type === 'vitals') return // don't show vitals in timeline or maybe do? We'll skip for now.
    events.push({
      id: note.id,
      type: 'clinical_note',
      date: note.created_at,
      title: isAr ? 'تمت إضافة ملاحظة سريرية' : 'Clinical Note Added',
      subtitle: `Type: ${note.note_type}`
    })
  })

  // Sort descending
  events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      
      {/* Quick Actions */}
      <div className="md:col-span-2 flex flex-col sm:flex-row gap-4">
        <Link 
          href={`/${locale}/${clinicSlug}/patients/${patient.id}/clinical`}
          className="flex-1 p-4 bg-gradient-to-r from-teal-500/20 to-teal-500/5 hover:from-teal-500/30 hover:to-teal-500/10 border border-teal-500/20 rounded-2xl flex items-center gap-4 transition-all group"
        >
          <div className="w-12 h-12 rounded-xl bg-teal-500/20 flex items-center justify-center text-teal-400 group-hover:scale-110 transition-transform">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-white text-lg">{isAr ? 'بدء الاستشارة' : 'Start Consultation'}</h3>
            <p className="text-sm text-teal-200/70">{isAr ? 'فتح مساحة العمل السريرية' : 'Open the clinical workspace'}</p>
          </div>
        </Link>
        <Link 
          href={`/${locale}/${clinicSlug}/patients/${patient.id}/prescriptions`}
          className="flex-1 p-4 bg-gradient-to-r from-violet-500/20 to-violet-500/5 hover:from-violet-500/30 hover:to-violet-500/10 border border-violet-500/20 rounded-2xl flex items-center gap-4 transition-all group"
        >
          <div className="w-12 h-12 rounded-xl bg-violet-500/20 flex items-center justify-center text-violet-400 group-hover:scale-110 transition-transform">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-white text-lg">{isAr ? 'كتابة وصفة طبية' : 'Write Prescription'}</h3>
            <p className="text-sm text-violet-200/70">{isAr ? 'إنشاء وصفة جديدة' : 'Create a new Rx'}</p>
          </div>
        </Link>
      </div>

      <PatientTimeline events={events} />

      <VitalsWidget 
        latestVitals={latestVitals} 
        clinicId={clinicId} 
        locale={locale} 
        patientId={patient.id} 
      />
    </div>
  )
}
