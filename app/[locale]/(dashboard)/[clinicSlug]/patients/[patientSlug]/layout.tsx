import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { requireClinicId } from '@/lib/utils/clinic'
import PatientSidebarContext from './components/PatientSidebarContext'
import PatientTabs from './components/PatientTabs'

export default async function PatientLayout({
  children,
  params: { locale, clinicSlug, patientSlug }
}: {
  children: React.ReactNode
  params: { locale: string; clinicSlug: string; patientSlug: string }
}) {
  const clinicId = await requireClinicId(clinicSlug)
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/${locale}/login`)

  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(patientSlug)
  
  let patientQuery = supabase
    .from('patients')
    .select(`
      *,
      patient_medical_history (*)
    `)
    .eq('clinic_id', clinicId)

  if (isUUID) {
    patientQuery = patientQuery.eq('id', patientSlug)
  } else {
    patientQuery = patientQuery.eq('display_id', patientSlug)
  }

  const { data: patient } = await patientQuery.single()

  if (!patient) redirect(`/${locale}/${clinicSlug}/patients`)

  // The UUID is preferred for stable links within the layout to avoid issues if display_id changes or is missing
  const activeSlug = patient.id

  return (
    <div className="flex flex-col lg:flex-row gap-6 max-w-[1400px] mx-auto items-start">
      {/* Fixed-width Medical Context Sidebar */}
      <div className="w-full lg:w-80 shrink-0 lg:sticky lg:top-8">
        <PatientSidebarContext patient={patient} clinicId={clinicId} locale={locale} />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 w-full flex flex-col gap-6">
        <PatientTabs locale={locale} clinicSlug={clinicSlug} patientSlug={activeSlug} />
        <div className="relative">
          {children}
        </div>
      </div>
    </div>
  )
}
