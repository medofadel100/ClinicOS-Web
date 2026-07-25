'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export async function verifySerial(serialCode: string) {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .rpc('verify_serial_code', { p_serial_code: serialCode })
    
  if (error) {
    throw new Error(error.message)
  }
  
  if (!data || data.length === 0) {
    throw new Error('Invalid serial code or could not retrieve clinic info.')
  }
  
  return data[0]
}

export async function claimSerial(
  serialCode: string,
  email: string,
  password: string,
  fullName: string,
  clinicName: string,
  clinicTypeId: string,
  locale: string
) {
  const supabase = createClient()
  
  // 1. Sign up the user (or log them in if they somehow already exist, though we assume new for this flow)
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      }
    }
  })
  
  if (authError) {
    throw new Error(authError.message)
  }
  
  // Note: if email confirmation is enabled, signUp might return a user but no session yet.
  // Assuming email confirmation is OFF for seamless flow, or user gets logged in immediately.
  
  // 2. Claim the clinic
  const { data: claimData, error: claimError } = await supabase.rpc('claim_clinic_with_serial', {
    p_serial_code: serialCode,
    p_full_name: fullName
  })
  
  if (claimError) {
    throw new Error(claimError.message)
  }
  
  const clinicId = claimData[0]?.clinic_id
  if (!clinicId) {
    throw new Error('Failed to retrieve claimed clinic ID.')
  }
  
  // 3. Update the claimed clinic's name and type if the user changed them
  const { error: updateError } = await supabase
    .from('clinics')
    .update({ 
      name: clinicName,
      type_id: clinicTypeId 
    })
    .eq('id', clinicId)
    
  if (updateError) {
    console.error('Failed to update clinic details after claim:', updateError)
    // We don't throw here, the claim was successful.
  }
  
  // 4. Update the staff member's full name just in case trigger didn't catch it
  if (authData.user) {
    await supabase.from('staff_members')
      .update({ full_name: fullName })
      .eq('auth_user_id', authData.user.id)
  }

  // Find the new clinic slug to redirect properly
  const { data: slugData } = await supabase.from('clinics').select('slug').eq('id', clinicId).single()
  
  const targetSlug = slugData?.slug || clinicId
  
  revalidatePath('/')
  redirect(`/${locale}/${targetSlug}`)
}
