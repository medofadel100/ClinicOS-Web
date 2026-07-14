'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function upsertCampaign(
  clinicId: string,
  locale: string,
  id: string | null,
  name: string,
  platform: string,
  startDate: string | null,
  endDate: string | null,
  budgetEgp: number | null,
  isActive: boolean
) {
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

  if (!membership || (membership.role !== 'owner' && membership.role !== 'admin')) {
    throw new Error('Forbidden')
  }

  const payload = {
    clinic_id: clinicId,
    name,
    platform,
    start_date: startDate || null,
    end_date: endDate || null,
    budget_egp: budgetEgp,
    is_active: isActive
  }

  if (id) {
    const { error } = await supabase
      .from('marketing_campaigns')
      .update(payload)
      .eq('id', id)
      .eq('clinic_id', clinicId)
      
    if (error) throw new Error('Failed to update campaign')
  } else {
    const { error } = await supabase
      .from('marketing_campaigns')
      .insert(payload)
      
    if (error) throw new Error('Failed to create campaign')
  }

  revalidatePath(`/${locale}/${clinicId}/marketing`)
}
