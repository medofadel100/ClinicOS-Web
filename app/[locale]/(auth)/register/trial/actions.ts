'use server'

import { createClient } from '@supabase/supabase-js'

export async function linkClinicOwner(data: {
  userId: string;
  fullName: string;
  clinicId: string;
}) {
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  try {
    // 1. Create Staff Member
    const { data: staff, error: staffError } = await supabaseAdmin
      .from('staff_members')
      .insert({
        auth_user_id: data.userId,
        full_name: data.fullName,
      })
      .select('id')
      .single()

    if (staffError) throw new Error(`Staff error: ${staffError.message}`)

    // 2. Create Membership
    const { error: membershipError } = await supabaseAdmin
      .from('clinic_staff_memberships')
      .insert({
        staff_member_id: staff.id,
        clinic_id: data.clinicId,
        role: 'owner',
      })

    if (membershipError) throw new Error(`Membership error: ${membershipError.message}`)

    return { success: true }
  } catch (err: any) {
    console.error('Failed to link clinic owner:', err)
    return { success: false, error: err.message }
  }
}
