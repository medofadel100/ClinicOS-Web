import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { requireClinicId } from '@/lib/utils/clinic'
import FocusMode from '../FocusMode'

export default async function FocusModePage({
  params: { locale, clinicSlug }
}: {
  params: { locale: string; clinicSlug: string }
}) {
  const clinicId = await requireClinicId(clinicSlug)
  const isAr = locale === 'ar'
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/${locale}/login`)

  const { data: staffMember } = await supabase
    .from('staff_members')
    .select('id, full_name')
    .eq('auth_user_id', user.id)
    .single()
  if (!staffMember) redirect(`/${locale}/${clinicSlug}`)

  const { data: membership } = await supabase
    .from('clinic_staff_memberships')
    .select('id')
    .eq('staff_member_id', staffMember.id)
    .eq('clinic_id', clinicId)
    .eq('is_active', true)
    .single()
  if (!membership) redirect(`/${locale}/${clinicSlug}`)

  const today = new Date()
  const startOfDay = new Date(today)
  startOfDay.setUTCHours(0, 0, 0, 0)
  const endOfDay = new Date(today)
  endOfDay.setUTCHours(23, 59, 59, 999)

  const { data: appointments } = await supabase
    .from('appointments')
    .select(`*, patients ( full_name, phone ), clinic_services ( name, price )`)
    .eq('clinic_id', clinicId)
    .eq('membership_id', membership.id)
    .gte('scheduled_at', startOfDay.toISOString())
    .lte('scheduled_at', endOfDay.toISOString())
    .order('scheduled_at', { ascending: true })

  return (
    <FocusMode
      appointments={(appointments || []) as any[]}
      clinicId={clinicId}
      clinicSlug={clinicSlug}
      locale={locale}
      isAr={isAr}
      doctorName={staffMember.full_name}
    />
  )
}
