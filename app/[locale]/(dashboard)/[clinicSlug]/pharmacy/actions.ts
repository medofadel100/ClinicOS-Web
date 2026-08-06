'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

async function verifyAccess(clinicId: string) {
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

  if (!membership) throw new Error('Forbidden')

  return { supabase, staffMember, membership }
}

export async function searchGlobalMedications(query: string) {
  const supabase = createClient()
  const { data, error } = (await supabase
    .rpc('search_medications', { p_query: query })) as { data: any[] | null, error: any }

  if (error) throw error
  return data || []
}

export async function addClinicMedication(clinicId: string, medicationData: any) {
  const { supabase } = await verifyAccess(clinicId)

  const { data, error } = await supabase
    .from('clinic_medications')
    .insert([{
      clinic_id: clinicId,
      ...medicationData
    }])
    .select()

  if (error) throw error
  
  revalidatePath('/[locale]/(dashboard)/[clinicSlug]/pharmacy', 'page')
  return data
}

export async function updateClinicMedication(clinicId: string, medicationId: string, updates: any) {
  const { supabase } = await verifyAccess(clinicId)

  const { data, error } = await supabase
    .from('clinic_medications')
    .update(updates)
    .eq('id', medicationId)
    .eq('clinic_id', clinicId)
    .select()

  if (error) throw error
  
  revalidatePath('/[locale]/(dashboard)/[clinicSlug]/pharmacy', 'page')
  return data
}

export async function deleteClinicMedication(clinicId: string, medicationId: string) {
  const { supabase } = await verifyAccess(clinicId)

  const { error } = await supabase
    .from('clinic_medications')
    .delete()
    .eq('id', medicationId)
    .eq('clinic_id', clinicId)

  if (error) throw error
  
  revalidatePath('/[locale]/(dashboard)/[clinicSlug]/pharmacy', 'page')
  return true
}
