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
