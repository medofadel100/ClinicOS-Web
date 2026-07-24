import { createClient } from '@/lib/supabase/server'
import { requireClinicId } from '@/lib/utils/clinic'
import { PageHeader, PremiumCard } from '@/components/layout/PageComponents'
import { Pill } from 'lucide-react'
import PharmacyClient from './PharmacyClient'
import { redirect } from 'next/navigation'

export default async function PharmacyPage({
  params: { clinicSlug, locale }
}: {
  params: { clinicSlug: string; locale: string }
}) {
  const clinicId = await requireClinicId(clinicSlug)
  const isAr = locale === 'ar'
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/${locale}/login`)

  // Fetch clinic medications
  const { data: clinicMeds } = await supabase
    .from('clinic_medications')
    .select(`
      *,
      medications_global (
        brand_name_en,
        brand_name_ar,
        generic_name,
        concentration,
        form,
        manufacturer
      )
    `)
    .eq('clinic_id', clinicId)
    .order('created_at', { ascending: false })

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <PageHeader
        title={isAr ? 'الصيدلية والروشتات' : 'Pharmacy & Prescriptions'}
        description={isAr ? 'إدارة أدوية العيادة والروشتات.' : 'Manage clinic medications and prescriptions.'}
        icon={Pill}
        iconColor="text-violet-400"
        iconBg="rgba(139,92,246,0.12)"
      />
      
      <PremiumCard className="p-6">
        <PharmacyClient clinicId={clinicId} initialMeds={clinicMeds || []} locale={locale} />
      </PremiumCard>
    </div>
  )
}
