import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { requireClinicId } from "@/lib/utils/clinic"
import BillingTab from '../billing/BillingTab'
import { PremiumCard, PageHeader } from '@/components/layout/PageComponents'
import { Wallet } from 'lucide-react'

export default async function PatientBillingPage({
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
      treatment_plans (
        *,
        treatment_plan_sessions (*),
        patient_payments (*)
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

  const { data: clinic } = await supabase
    .from('clinics')
    .select('name, owner_full_name')
    .eq('id', clinicId)
    .single()

  const { data: clinicSettings } = await supabase
    .from('clinic_settings')
    .select('address, contact_email, contact_phone')
    .eq('clinic_id', clinicId)
    .single()

  const { data: clinicServices } = await supabase
    .from('clinic_services')
    .select('id, name, price')
    .eq('clinic_id', clinicId)
    .order('name', { ascending: true })

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <PageHeader
        title={isAr ? `فواتير ${patient.full_name}` : `${patient.full_name}'s Billing & Plans`}
        description={isAr ? 'إدارة خطط العلاج والجلاسات والمدفوعات.' : 'Manage treatment plans, sessions, and payments.'}
        icon={Wallet}
        iconColor="text-emerald-400"
        iconBg="rgba(16,185,129,0.12)"
      />
      
      <PremiumCard className="p-6">
        <BillingTab 
          patientId={patient.id} 
          clinicId={clinicId} 
          locale={locale} 
          plans={patient.treatment_plans || []}
          patientName={patient.full_name}
          patientPhone={patient.phone}
          patientDisplayId={patient.display_id}
          clinicName={clinic?.name || ''}
          clinicAddress={clinicSettings?.address ?? null}
          clinicPhone={clinicSettings?.contact_phone ?? null}
          clinicEmail={clinicSettings?.contact_email ?? null}
          clinicOwnerName={clinic?.owner_full_name ?? null}
          services={clinicServices || []}
        />
      </PremiumCard>
    </div>
  )
}
