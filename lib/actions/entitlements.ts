'use server'

import { createClient } from '@/lib/supabase/server'

export async function requestUpgrade(clinicId: string, featureCode: string) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: staffMember } = await supabase
    .from('staff_members')
    .select('id')
    .eq('auth_user_id', user.id)
    .single()

  if (!staffMember) throw new Error('Unauthorized')

  const { data: membership } = await supabase
    .from('clinic_staff_memberships')
    .select('role')
    .eq('staff_member_id', staffMember.id)
    .eq('clinic_id', clinicId)
    .eq('is_active', true)
    .single()

  if (!membership) {
    throw new Error('Forbidden')
  }

  const { data: feature } = await supabase
    .from('features')
    .select('id')
    .eq('code', featureCode)
    .single()

  const { error } = await supabase
    .from('upgrade_requests')
    .insert({
      clinic_id: clinicId,
      feature_id: feature?.id || null,
      requested_by_name: user.email,
      message: `Upgrade request for feature: ${featureCode}`,
      status: 'open',
    })

  if (error) {
    console.error('Failed to request upgrade:', error)
    throw new Error('Failed to request upgrade')
  }
}
