'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function updateWhatsAppConfig(
  clinicId: string,
  locale: string,
  updates: {
    mode?: 'none' | 'rule_based' | 'ai',
    is_connected?: boolean,
    connected_phone_number?: string | null
  }
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

  if (!membership || membership.role !== 'owner') {
    throw new Error('Forbidden')
  }

  // We need to upsert because the row might not exist yet
  const { error } = await supabase
    .from('whatsapp_bot_config')
    .upsert({
      clinic_id: clinicId,
      ...updates,
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'clinic_id'
    })

  if (error) {
    console.error('Failed to update WhatsApp config:', error)
    throw new Error('Failed to update WhatsApp config')
  }

  revalidatePath(`/${locale}/${clinicId}/whatsapp`)
}

export async function addMenuOption(
  clinicId: string,
  locale: string,
  label_ar: string,
  label_en: string,
  static_response: string
) {
  const supabase = createClient()
  
  // Find highest option number
  const { data: options } = await supabase
    .from('whatsapp_menu_options')
    .select('option_number')
    .eq('clinic_id', clinicId)
    .order('option_number', { ascending: false })
    .limit(1)

  const nextNumber = options && options.length > 0 ? options[0].option_number + 1 : 4

  const { error } = await supabase
    .from('whatsapp_menu_options')
    .insert({
      clinic_id: clinicId,
      option_number: nextNumber,
      label_ar,
      label_en,
      response_type: 'static_text',
      static_response,
      is_active: true
    })

  if (error) throw new Error('Failed to add menu option')
  revalidatePath(`/${locale}/${clinicId}/whatsapp`)
}

export async function deleteMenuOption(clinicId: string, locale: string, id: string) {
  const supabase = createClient()
  const { error } = await supabase
    .from('whatsapp_menu_options')
    .delete()
    .eq('id', id)
    .eq('clinic_id', clinicId)
    .eq('response_type', 'static_text') // prevent deleting defaults
    
  if (error) throw new Error('Failed to delete menu option')
  revalidatePath(`/${locale}/${clinicId}/whatsapp`)
}

export async function updateAutomationSettings(
  clinicId: string,
  locale: string,
  updates: {
    no_show_followup_enabled?: boolean
    pre_appointment_reminder_enabled?: boolean
    pre_appointment_reminder_minutes_before?: number
    morning_summary_enabled?: boolean
    morning_summary_time?: string
    waitlist_autofill_enabled?: boolean
    patient_upload_intake_enabled?: boolean
  }
) {
  const supabase = createClient()
  const { error } = await supabase
    .from('whatsapp_automation_settings')
    .upsert({
      clinic_id: clinicId,
      ...updates,
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'clinic_id'
    })

  if (error) {
    console.error(error)
    throw new Error('Failed to update automation settings')
  }

  revalidatePath(`/${locale}/${clinicId}/whatsapp`)
}
