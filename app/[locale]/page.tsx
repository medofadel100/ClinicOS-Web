import { createClient } from '@/lib/supabase/server'
import LandingPageContent from './_components/LandingPageContent'

export default async function LandingPage({ params: { locale } }: { params: { locale: string } }) {
  const supabase = createClient()
  const { data: plans } = await supabase
    .from('plans')
    .select(`
      id, name_en, name_ar, price_egp, billing_cycle, code,
      plan_features ( features ( name_en, name_ar ) ),
      plan_limits ( limit_type, max_value )
    `)
    .eq('is_active', true)
    .order('price_egp', { ascending: true })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onlinePlans = (plans ?? []).filter((p: any) => !p.code.startsWith('offline-'))
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const offlinePlans = (plans ?? []).filter((p: any) => p.code.startsWith('offline-'))

  const { data: clinicTypes } = await supabase
    .from('clinic_types')
    .select('id, name_en, name_ar, code')
    .eq('is_active', true)
    .order('name_en', { ascending: true })

  return (
    <LandingPageContent 
      locale={locale} 
      onlinePlans={onlinePlans} 
      offlinePlans={offlinePlans} 
      clinicTypes={clinicTypes ?? []} 
    />
  )
}
