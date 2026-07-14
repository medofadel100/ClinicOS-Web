'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

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

  if (!membership) {
    throw new Error('Forbidden')
  }

  return { supabase, staffMember, membership }
}

export async function updateToothCondition(
  clinicId: string, 
  locale: string, 
  patientId: string, 
  toothNumber: number, 
  condition: string
) {
  const { supabase, staffMember } = await verifyAccess(clinicId)

  // Upsert the tooth condition
  // We rely on the composite unique constraint (patient_id, tooth_number)
  // to ensure only the latest state is kept. Wait, Supabase `upsert` requires the unique columns
  // to be specified if they aren't the primary key.
  
  // Since we don't have the primary key (id), we can do a select then insert/update, 
  // or use postgres upsert syntax. Supabase upsert requires specifying the constraint.
  const { error } = await supabase
    .from('dental_chart_entries')
    .upsert({
      clinic_id: clinicId,
      patient_id: patientId,
      tooth_number: toothNumber,
      condition: condition,
      updated_by: staffMember.id,
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'patient_id, tooth_number'
    })

  if (error) {
    console.error('Error updating tooth condition:', error)
    throw new Error('Failed to update tooth condition')
  }

  revalidatePath(`/${locale}/${clinicId}/patients/${patientId}`)
}
