import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { requireClinicId } from "@/lib/utils/clinic"
import { PremiumCard, PageHeader } from '@/components/layout/PageComponents'
import { Pill } from 'lucide-react'
import PrescriptionBuilder from './PrescriptionBuilder'
import PrescriptionActions from './PrescriptionActions'
import { getPatientPrescriptions } from './actions'

export default async function PatientPrescriptionsPage({
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
    .select('id, full_name')
    .eq('clinic_id', clinicId)

  if (isUUID) {
    patientQuery = patientQuery.eq('id', patientSlug)
  } else {
    patientQuery = patientQuery.eq('display_id', patientSlug)
  }

  const { data: patient } = await patientQuery.single()
  if (!patient) redirect(`/${locale}/${clinicSlug}/patients`)

  // Fetch patient phone for WhatsApp
  const { data: patientFull } = await supabase
    .from('patients')
    .select('phone, full_name, date_of_birth')
    .eq('id', patient.id)
    .single()

  let patientAge: string | null = null
  if (patientFull?.date_of_birth) {
    const dob = new Date(patientFull.date_of_birth)
    const today = new Date()
    let y = today.getFullYear() - dob.getFullYear()
    const m = today.getMonth() - dob.getMonth()
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) y--
    patientAge = y.toString()
  }

  // Fetch clinic name and logo for prescription print
  const { data: clinicData } = await supabase
    .from('clinics')
    .select('name')
    .eq('id', clinicId)
    .single()

  const { data: logoSetting } = await supabase
    .from('clinic_settings')
    .select('setting_value')
    .eq('clinic_id', clinicId)
    .eq('setting_key', 'clinic_logo')
    .single()

  // Fetch past prescriptions
  const pastPrescriptions = await getPatientPrescriptions(clinicId, patient.id)

  return (
    <div className="space-y-6">
      <PageHeader
        title={isAr ? 'الروشتات' : 'Prescriptions (Rx)'}
        description={isAr ? 'كتابة وصفات جديدة وعرض سجل الأدوية السابق.' : 'Write new prescriptions and view past medication history.'}
        icon={Pill}
        iconColor="text-violet-400"
        iconBg="rgba(139,92,246,0.12)"
      />
      
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        <div className="xl:col-span-7">
          <PremiumCard className="p-6">
            <h3 className="text-lg font-bold text-white mb-6">{isAr ? 'كتابة وصفة جديدة' : 'Write New Prescription'}</h3>
            <PrescriptionBuilder clinicId={clinicId} patientId={patient.id} />
          </PremiumCard>
        </div>

        <div className="xl:col-span-5 space-y-6">
          <h3 className="text-lg font-bold text-white px-2">{isAr ? 'الروشتات السابقة' : 'Past Prescriptions'}</h3>
          {pastPrescriptions.length === 0 ? (
            <div className="text-sm text-slate-500 text-center p-6 bg-white/5 rounded-xl border border-white/5">
              {isAr ? 'لم يتم العثور على وصفات سابقة.' : 'No previous prescriptions found.'}
            </div>
          ) : (
            <div className="space-y-4">
              {pastPrescriptions.map((rx: any) => (
                <PremiumCard key={rx.id} className="p-4 border-l-2 border-l-violet-500">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm font-bold text-slate-200">
                      {new Date(rx.created_at).toLocaleDateString()}
                    </span>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-slate-400">Dr. {rx.staff_members?.full_name}</span>
                      <PrescriptionActions
                        clinicId={clinicId}
                        prescription={rx}
                        patientName={patientFull?.full_name || patient.full_name}
                        patientPhone={patientFull?.phone}
                        patientAge={patientAge}
                        doctorName={rx.staff_members?.full_name}
                        clinicName={clinicData?.name}
                        clinicLogo={logoSetting?.setting_value}
                        isAr={isAr}
                      />
                    </div>
                  </div>
                  <div className="space-y-3">
                    {rx.patient_prescription_items?.map((item: any) => {
                      const med = item.clinic_medications
                      const global = med?.medications_global
                      const brandName = global?.brand_name_en || med?.custom_brand_name
                      const genericName = global?.generic_name || med?.custom_generic_name
                      
                      return (
                        <div key={item.id} className="bg-black/20 p-3 rounded-lg border border-white/5">
                          <div className="font-semibold text-slate-200 text-sm">{brandName} <span className="text-slate-500 text-xs font-normal">({genericName})</span></div>
                          <div className="text-xs text-slate-400 mt-1 flex flex-wrap gap-x-3 gap-y-1">
                            <span><strong className="text-slate-300">Dose:</strong> {item.dosage}</span>
                            <span><strong className="text-slate-300">Freq:</strong> {item.frequency}</span>
                            {item.timing && <span><strong className="text-slate-300">Timing:</strong> {item.timing}</span>}
                            {item.duration && <span><strong className="text-slate-300">Duration:</strong> {item.duration}</span>}
                          </div>
                          {item.instructions && (
                            <div className="text-xs text-amber-200/70 mt-1 italic">Note: {item.instructions}</div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                  {rx.notes && (
                    <div className="mt-3 text-xs text-slate-400 pt-3 border-t border-white/5">
                      <strong className="text-slate-300">Rx Notes:</strong> {rx.notes}
                    </div>
                  )}
                </PremiumCard>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
