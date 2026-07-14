'use server'

import { createClient } from '@supabase/supabase-js'

export async function initializeClinic(data: {
  userId: string;
  fullName: string;
  clinicName: string;
  planName: string;
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

    // 2. Create Clinic
    const { data: clinic, error: clinicError } = await supabaseAdmin
      .from('clinics')
      .insert({
        name: data.clinicName,
      })
      .select('id')
      .single()

    if (clinicError) throw new Error(`Clinic error: ${clinicError.message}`)

    // 3. Create Membership
    const { error: membershipError } = await supabaseAdmin
      .from('clinic_staff_memberships')
      .insert({
        staff_member_id: staff.id,
        clinic_id: clinic.id,
        role: 'owner',
      })

    if (membershipError) throw new Error(`Membership error: ${membershipError.message}`)

    // 4. Create Subscription
    const isTrial = data.planName === 'trial'
    
    // Default 7 days trial if trial
    const trialEndsAt = isTrial ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() : null

    const { error: subError } = await supabaseAdmin
      .from('clinic_subscriptions')
      .insert({
        clinic_id: clinic.id,
        plan_name: data.planName,
        status: isTrial ? 'active' : 'pending_payment',
        trial_ends_at: trialEndsAt
      })

    if (subError) throw new Error(`Subscription error: ${subError.message}`)

    return { success: true, clinicId: clinic.id }

  } catch (err: any) {
    console.error('Failed to initialize clinic:', err)
    return { success: false, error: err.message }
  }
}
