'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
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

  // 3. Atomically create clinic + subscription + staff member + membership,
  //    and mark the serial as used (SECURITY DEFINER, race-safe)
  const { data: clinicId, error: claimError } = await supabase.rpc(
    'claim_clinic_with_serial',
    {
      p_serial_code: serialCode.trim().toUpperCase(),
      p_clinic_name: clinicName,
      p_clinic_type_id: clinicTypeId,
      p_owner_full_name: fullName,
      p_owner_phone: ownerPhone,
    }
  )

  if (claimError || !clinicId) {
    const admin = createAdminClient()
    await admin.auth.admin.deleteUser(authData.user.id).catch(() => {})
    throw new Error(claimError?.message || 'Failed to create clinic.')
  }

  revalidatePath('/')

  // Redirect to clinic dashboard
  try {
    const { data: slugData } = await supabase
      .from('clinics')
      .select('slug')
      .eq('id', clinicId)
      .single()

    const targetSlug = slugData?.slug || clinicId
    redirect(`/${locale}/${targetSlug}`)
  } catch {
    // If slug lookup fails, go to clinic-switcher
    redirect(`/${locale}/clinic-switcher`)
  }
}
