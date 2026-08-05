import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PremiumCard } from '@/components/layout/PageComponents'
import { requireClinicId } from "@/lib/utils/clinic"
import { checkEntitlements } from '@/lib/entitlements'
import ClinicalWorkspaceTabs from '../components/ClinicalWorkspaceTabs'

export default async function PatientClinicalPage({
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
    .select('*')
    .eq('clinic_id', clinicId)

  if (isUUID) {
    patientQuery = patientQuery.eq('id', patientSlug)
  } else {
    patientQuery = patientQuery.eq('display_id', patientSlug)
  }

  const { data: patient } = await patientQuery.single()

  if (!patient) redirect(`/${locale}/${clinicSlug}/patients`)

  const { data: clinicData } = await supabase
    .from('clinics')
    .select('name, address, contact_phone, contact_email, owner_full_name, clinic_types(code, name_en)')
    .eq('id', clinicId)
    .single()
  
  const clinicTypeCode = Array.isArray(clinicData?.clinic_types) 
    ? clinicData?.clinic_types[0]?.code 
    : (clinicData?.clinic_types as any)?.code

  const clinicTypeNameEn = Array.isArray(clinicData?.clinic_types) 
    ? clinicData?.clinic_types[0]?.name_en 
    : (clinicData?.clinic_types as any)?.name_en

  const entitlements = await checkEntitlements(clinicId)

  // Fetch initial entries for the specific clinical module
  let clinicalData: any = []
  let clinicalHistory: any = []
  
  if (clinicTypeCode === 'dental') {
    const { data } = await supabase.from('dental_chart_entries')
      .select('*')
      .eq('patient_id', patient.id)
      .eq('clinic_id', clinicId)
    clinicalData = data || []

    const { data: history } = await supabase.from('dental_chart_history')
      .select('*, staff_members(full_name)')
      .eq('patient_id', patient.id)
      .eq('clinic_id', clinicId)
    clinicalHistory = history || []
  } else if (clinicTypeCode === 'orthopedics') {
    const { data } = await supabase.from('orthopedic_examinations')
      .select('*')
      .eq('patient_id', patient.id)
      .eq('clinic_id', clinicId)
    clinicalData = data || []
  } else if (clinicTypeCode === 'ophthalmology') {
    const { data } = await supabase.from('patient_clinical_notes')
      .select('*')
      .eq('patient_id', patient.id)
      .eq('clinic_id', clinicId)
      .eq('note_type', 'ophthalmology_tracker')
      .order('created_at', { ascending: false })
    clinicalData = data || []
  } else if (clinicTypeCode === 'obstetrics_gynecology') {
    const { data } = await supabase.from('obgyn_examinations')
      .select('*')
      .eq('patient_id', patient.id)
      .eq('clinic_id', clinicId)
    clinicalData = data || []

  } else if (clinicTypeCode === 'general_medicine' || clinicTypeCode === 'general_practice') {
    const { data } = await supabase.from('patient_clinical_notes')
      .select('*')
      .eq('patient_id', patient.id)
      .eq('clinic_id', clinicId)
      .eq('note_type', 'family_medicine_notes')
      .order('created_at', { ascending: false })
    clinicalData = data || []
  } else {
    // Map clinic type to the correct note_type filter
    const noteTypeMap: Record<string, string> = {
      'cardiology': 'cardiology_map',
      'neurology': 'neurology_map',
      'dermatology': 'dermatology_map',
      'urology': 'urology_map',
      'ophthalmology_ext': 'ophthalmology_tracker',
      'pulmonology': 'pulmonology_tracker',
      'endocrinology': 'endocrinology_tracker',
      'hematology': 'hematology_tracker',
      'nephrology': 'nephrology_tracker',
      'ent': 'ent_tracker',
      'psychiatry': 'psychiatry_tracker',
      'pediatrics': 'pediatrics_tracker',
      'oncology': 'oncology_notes',
      'internal_medicine': 'internal_medicine_notes',
      'family_medicine': 'family_medicine_notes',
      'general_surgery': 'general_surgery_notes',
      'neurosurgery': 'neurosurgery_notes',
      'clinical_nutrition': 'clinical_nutrition_notes',
      'physical_therapy': 'physical_therapy_notes',
      'gastroenterology': 'gastroenterology_notes',
      'psychology': 'psychology_session',
      'general_practice': 'family_medicine_notes',
      'medical_center': 'internal_medicine_notes',
    }
    const targetNoteType = noteTypeMap[clinicTypeCode || '']

    let query = supabase.from('patient_clinical_notes')
      .select('*')
      .eq('patient_id', patient.id)
      .eq('clinic_id', clinicId)
      .order('created_at', { ascending: false })

    if (targetNoteType) {
      query = query.eq('note_type', targetNoteType)
    }

    const { data } = await query
    clinicalData = data || []
  }

  // Fetch free-text notes
  const { data: freeNotes } = await supabase.from('patient_clinical_notes')
    .select('id, content, created_at')
    .eq('patient_id', patient.id)
    .eq('clinic_id', clinicId)
    .eq('note_type', 'free_text')
    .order('created_at', { ascending: false })

  const formattedFreeNotes = (freeNotes || []).map((n: any) => ({
    id: n.id,
    title: n.content?.title || 'Free Note',
    content: n.content?.body || '',
    created_at: n.created_at
  }))

  return (
    <PremiumCard className="min-h-[50vh] md:min-h-[700px] flex flex-col">
      <ClinicalWorkspaceTabs
        clinicTypeCode={clinicTypeCode}
        clinicTypeName={clinicTypeNameEn || (isAr ? 'عام' : 'General')}
        isAr={isAr}
        patientId={patient.id}
        clinicId={clinicId}
        locale={locale}
        entitlements={entitlements}
        clinicalData={clinicalData}
        clinicalHistory={clinicalHistory}
        freeNotesData={formattedFreeNotes}
        servicesContext={{
          patientName: patient.full_name,
          patientPhone: patient.phone,
          patientDisplayId: patient.display_id,
          clinicName: clinicData?.name || '',
          clinicAddress: clinicData?.address,
          clinicPhone: clinicData?.contact_phone,
          clinicEmail: clinicData?.contact_email,
          clinicOwnerName: clinicData?.owner_full_name,
        }}
      />
    </PremiumCard>
  )
}
