import { getTranslations } from 'next-intl/server'
import SerialRegistrationClient from './SerialRegistrationClient'
import { createClient } from '@/lib/supabase/server'

export default async function SerialRegistrationPage({ params: { locale } }: { params: { locale: string } }) {
  const t = await getTranslations('auth')
  const supabase = createClient()
  
  // Fetch clinic types for the dropdown
  const { data: clinicTypes } = await supabase.from('clinic_types').select('id, code, name_en, name_ar').eq('is_active', true)

  return <SerialRegistrationClient locale={locale} clinicTypes={clinicTypes || []} />
}
