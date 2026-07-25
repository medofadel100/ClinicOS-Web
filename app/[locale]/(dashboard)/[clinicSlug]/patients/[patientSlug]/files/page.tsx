import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { requireClinicId } from "@/lib/utils/clinic"
import PatientFiles from '../PatientFiles'
import { PremiumCard, PageHeader } from '@/components/layout/PageComponents'
import { FileText } from 'lucide-react'

export default async function PatientFilesPage({
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
    .select('*, patient_uploaded_files(*)')
    .eq('clinic_id', clinicId)

  if (isUUID) {
    patientQuery = patientQuery.eq('id', patientSlug)
  } else {
    patientQuery = patientQuery.eq('display_id', patientSlug)
  }

  const { data: patient } = await patientQuery.single()

  if (!patient) redirect(`/${locale}/${clinicSlug}/patients`)

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <PageHeader
        title={isAr ? `ملفات ${patient.full_name}` : `${patient.full_name}'s Files`}
        description={isAr ? 'إدارة المستندات ونتائج الفحوصات والصور الطبية.' : 'Manage documents, test results, and medical images.'}
        icon={FileText}
        iconColor="text-blue-400"
        iconBg="rgba(59,130,246,0.12)"
      />
      
      <PremiumCard className="p-6">
        <PatientFiles initialData={patient.patient_uploaded_files || []} patientId={patient.id} clinicId={clinicId} locale={locale} />
      </PremiumCard>
    </div>
  )
}
