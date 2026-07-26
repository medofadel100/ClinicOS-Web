'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export async function verifySerial(serialCode: string) {
  const supabase = createClient()

  const { data, error } = await supabase.rpc('verify_serial_code', {
    p_serial_code: serialCode.trim().toUpperCase(),
  })

  if (error) {
    throw new Error(error.message)
  }

  if (!data || data.length === 0) {
    throw new Error('Serial code not found or already used.')
  }

  const row = data[0] as Record<string, unknown>

  if (row.status !== 'unused') {
    throw new Error('This serial code has already been used or cancelled.')
  }

  return {
    id: row.id,
    code: row.code,
    status: row.status,
    plan_id: row.plan_id,
    plans: {
      id: row.plan_id,
      name_en: row.plan_name_en,
      name_ar: row.plan_name_ar,
      price_egp: row.plan_price_egp,
      billing_cycle: row.plan_billing_cycle,
    },
  }
}

export async function claimSerial(
  serialCode: string,
  email: string,
  password: string,
  fullName: string,
  clinicName: string,
  clinicTypeId: string,
  ownerPhone: string,
  locale: string
) {
  const supabase = createClient()

  // 1. Verify serial is still unused (via RPC)
  const { data: serialData } = await supabase.rpc('verify_serial_code', {
    p_serial_code: serialCode.trim().toUpperCase(),
  })

  if (!serialData || serialData.length === 0) {
    throw new Error('Serial code is no longer available.')
  }

  const serial = (serialData as Record<string, unknown>[])[0]

  // 2. Create auth user
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
      emailRedirectTo: undefined,
    },
  })

  if (authError) {
    throw new Error(authError.message)
  }

  if (!authData.user) {
    throw new Error('Failed to create user account.')
  }

  // 3. Create clinic
  const { data: clinic, error: clinicError } = await supabase
    .from('clinics')
    .insert({
      name: clinicName,
      clinic_type_id: clinicTypeId,
      owner_full_name: fullName,
      owner_email: email,
      owner_phone: ownerPhone,
      status: 'active',
    })
    .select('id')
    .single()

  if (clinicError || !clinic) {
    await supabase.auth.admin.deleteUser(authData.user.id).catch(() => {})
    throw new Error('Failed to create clinic.')
  }

  // 4. Create subscription
  const now = new Date()
  const periodEnd = new Date(now)
  const billingCycle = serial.plan_billing_cycle as string

  if (billingCycle === 'yearly') {
    periodEnd.setFullYear(periodEnd.getFullYear() + 1)
  } else {
    periodEnd.setMonth(periodEnd.getMonth() + 1)
  }

  const { error: subError } = await supabase
    .from('clinic_subscriptions')
    .insert({
      clinic_id: clinic.id,
      plan_id: serial.plan_id,
      status: 'active',
      price_locked_egp: serial.plan_price_egp,
      current_period_start: now.toISOString(),
      current_period_end: periodEnd.toISOString(),
    })

  if (subError) {
    console.error('Subscription creation error:', subError)
  }

  // 5. Mark serial as used
  const { error: serialError } = await supabase
    .from('clinic_serials')
    .update({
      status: 'used',
      clinic_id: clinic.id,
      used_at: now.toISOString(),
    })
    .eq('code', serialCode.trim().toUpperCase())

  if (serialError) {
    console.error('Serial update error:', serialError)
  }

  // 6. Link staff member if exists
  if (authData.user) {
    try {
      await supabase
        .from('staff_members')
        .update({ full_name: fullName, clinic_id: clinic.id, role: 'owner' })
        .eq('auth_user_id', authData.user.id)
    } catch {
      // staff_members update is optional
    }
  }

  revalidatePath('/')

  // Redirect to clinic dashboard
  try {
    const { data: slugData } = await supabase
      .from('clinics')
      .select('slug')
      .eq('id', clinic.id)
      .single()

    const targetSlug = slugData?.slug || clinic.id
    redirect(`/${locale}/${targetSlug}`)
  } catch {
    // If slug lookup fails, go to clinic-switcher
    redirect(`/${locale}/clinic-switcher`)
  }
}
