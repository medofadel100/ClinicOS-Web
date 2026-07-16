'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

async function verifyOwner(clinicId: string) {
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

  if (!membership || membership.role !== 'owner') {
    throw new Error('Forbidden')
  }

  return supabase
}

export async function updateClinicGeneralInfo(clinicId: string, locale: string, formData: FormData) {
  const supabase = await verifyOwner(clinicId)

  const name = formData.get('name') as string
  const owner_full_name = formData.get('owner_full_name') as string
  const owner_phone = formData.get('owner_phone') as string

  if (!name) throw new Error('Clinic name is required')

  const { error } = await supabase
    .from('clinics')
    .update({
      name,
      owner_full_name: owner_full_name || null,
      owner_phone: owner_phone || null
    })
    .eq('id', clinicId)

  if (error) throw error
  revalidatePath(`/[locale]/(dashboard)/[clinicId]/settings`, 'page')
}

export async function updateClinicSettings(clinicId: string, formData: FormData) {
  const supabase = await verifyOwner(clinicId)

  const address = formData.get('address') as string
  const contact_email = formData.get('contact_email') as string
  const contact_phone = formData.get('contact_phone') as string
  const currency_code = formData.get('currency_code') as string || 'EGP'
  const timezone = formData.get('timezone') as string || 'UTC'

  const { error } = await supabase
    .from('clinic_settings')
    .upsert({
      clinic_id: clinicId,
      address,
      contact_email,
      contact_phone,
      currency_code,
      timezone
    }, { onConflict: 'clinic_id' })

  if (error) throw error
  revalidatePath(`/[locale]/(dashboard)/[clinicId]/settings`, 'page')
}

export async function upsertDoctorProfile(clinicId: string, formData: FormData) {
  const supabase = await verifyOwner(clinicId)

  const id = formData.get('id') as string | null
  const staff_member_id = formData.get('staff_member_id') as string
  const bio = formData.get('bio') as string
  const specialty = formData.get('specialty') as string

  if (id) {
    const { error } = await supabase
      .from('doctor_profiles')
      .update({ bio, specialty })
      .eq('id', id)
      .eq('clinic_id', clinicId)
    if (error) throw error
  } else {
    const { error } = await supabase
      .from('doctor_profiles')
      .insert({ clinic_id: clinicId, staff_member_id, bio, specialty })
    if (error) throw error
  }

  revalidatePath(`/[locale]/(dashboard)/[clinicId]/settings`, 'page')
}

export async function upsertPayrollConfig(
  clinicId: string, 
  membershipId: string, 
  salaryType: 'fixed' | 'commission' | 'fixed_plus_commission', 
  baseSalary: number | null, 
  commissionPercentage: number | null
) {
  const supabase = await verifyOwner(clinicId)

  const { error } = await supabase
    .from('staff_payroll_config')
    .upsert({
      membership_id: membershipId,
      salary_type: salaryType,
      base_salary_egp: baseSalary,
      commission_percentage: commissionPercentage
    }, { onConflict: 'membership_id' })

  if (error) {
    console.error('Payroll Config Error:', error)
    throw new Error('Failed to save payroll config')
  }

  revalidatePath(`/[locale]/(dashboard)/[clinicId]/settings`, 'page')
}

export async function upsertWorkingHours(clinicId: string, doctorProfileId: string, hours: { day_of_week: number, start_time: string, end_time: string, is_active: boolean }[]) {
  const supabase = await verifyOwner(clinicId)

  // Clear existing hours for this profile
  const { error: deleteError } = await supabase
    .from('doctor_working_hours')
    .delete()
    .eq('doctor_profile_id', doctorProfileId)
  
  if (deleteError) throw deleteError

  if (hours.length > 0) {
    const { error: insertError } = await supabase
      .from('doctor_working_hours')
      .insert(hours.map(h => ({
        doctor_profile_id: doctorProfileId,
        day_of_week: h.day_of_week,
        start_time: h.start_time,
        end_time: h.end_time,
        is_active: h.is_active
      })))
      
    if (insertError) throw insertError
  }

  revalidatePath(`/[locale]/(dashboard)/[clinicId]/settings`, 'page')
}

export async function createServiceCategory(clinicId: string, formData: FormData) {
  const supabase = await verifyOwner(clinicId)
  const name = formData.get('name') as string
  const order_index = parseInt(formData.get('order_index') as string) || 0

  const { error } = await supabase
    .from('service_categories')
    .insert({ clinic_id: clinicId, name, order_index })

  if (error) throw error
  revalidatePath(`/[locale]/(dashboard)/[clinicId]/settings`, 'page')
}

export async function createClinicService(clinicId: string, formData: FormData) {
  const supabase = await verifyOwner(clinicId)
  
  const category_id = formData.get('category_id') as string
  const name = formData.get('name') as string
  const description = formData.get('description') as string
  const price = parseFloat(formData.get('price') as string) || 0
  const duration_minutes = parseInt(formData.get('duration_minutes') as string) || 30

  const { error } = await supabase
    .from('clinic_services')
    .insert({
      clinic_id: clinicId,
      category_id,
      name,
      description,
      price,
      duration_minutes
    })

  if (error) throw error
  revalidatePath(`/[locale]/(dashboard)/[clinicId]/settings`, 'page')
}

export async function generateStaffInvite(clinicId: string, role: string) {
  const supabase = await verifyOwner(clinicId)

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
    .select('id')
    .eq('staff_member_id', staffMember.id)
    .eq('clinic_id', clinicId)
    .eq('is_active', true)
    .single()

  if (!membership) throw new Error('Unauthorized')

  // Generate random URL-safe token
  const token = Array.from(crypto.getRandomValues(new Uint8Array(24)))
    .map(b => b.toString(16).padStart(2, '0')).join('')

  const { error } = await supabase
    .from('staff_invites')
    .insert({
      clinic_id: clinicId,
      invited_role: role,
      invite_token: token,
      created_by_membership_id: membership.id,
      status: 'pending',
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
    })

  if (error) {
    console.error('Invite generation error:', error)
    throw new Error('Failed to generate invite')
  }

  revalidatePath(`/[locale]/(dashboard)/[clinicId]/settings`, 'page')
  return token
}

export async function revokeStaffInvite(clinicId: string, inviteId: string) {
  const supabase = await verifyOwner(clinicId)

  const { error } = await supabase
    .from('staff_invites')
    .update({ status: 'revoked' })
    .eq('id', inviteId)
    .eq('clinic_id', clinicId)
    .eq('status', 'pending')

  if (error) throw error
  revalidatePath(`/[locale]/(dashboard)/[clinicId]/settings`, 'page')
}
