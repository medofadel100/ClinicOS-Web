import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { requireClinicId } from '@/lib/utils/clinic'
import { Activity, FileText, Wallet } from 'lucide-react'
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
      treatment_plans (
        total_price_egp, status,
        patient_payments ( amount_egp )
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

  // 3. Debt summary
  const plans = patient.treatment_plans || []
  const totalBilled = plans.reduce((s: number, p: any) => s + Number(p.total_price_egp || 0), 0)
  const totalPaid = plans.reduce((s: number, p: any) => s + (p.patient_payments || []).reduce((x: number, y: any) => x + Number(y.amount_egp || 0), 0), 0)
  const debt = Math.max(0, totalBilled - totalPaid)

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

      {/* Debt Card */}
      <Link
        href={`/${locale}/${clinicSlug}/patients/${patient.display_id || patient.id}/billing`}
        className="md:col-span-2 block rounded-2xl p-5 transition-all hover:bg-white/[0.03]"
        style={{ background: debt > 0 ? 'rgba(239,68,68,0.04)' : 'rgba(0,212,170,0.04)', border: debt > 0 ? '1px solid rgba(239,68,68,0.18)' : '1px solid rgba(0,212,170,0.14)' }}
      >
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: debt > 0 ? 'rgba(239,68,68,0.12)' : 'rgba(0,212,170,0.1)' }}>
              <Wallet className="w-5 h-5" style={{ color: debt > 0 ? 'hsl(0 84% 65%)' : 'hsl(168 100% 52%)' }} />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">{isAr ? 'المديونية' : 'Debt Summary'}</h3>
              <p className="text-xs text-slate-400">
                {isAr ? 'إجمالي المطلوب' : 'Total Billed'}: {totalBilled.toLocaleString()} EGP · {isAr ? 'المدفوع' : 'Paid'}: {totalPaid.toLocaleString()} EGP
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold" style={{ color: debt > 0 ? 'hsl(0 84% 65%)' : 'hsl(168 100% 52%)' }}>
              {debt > 0 ? `${debt.toLocaleString()} EGP` : (isAr ? 'مدفوع بالكامل' : 'Fully Paid')}
            </div>
            <div className="text-xs text-slate-500">{isAr ? 'المتبقي' : 'Remaining'} →</div>
          </div>
        </div>
      </Link>

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
