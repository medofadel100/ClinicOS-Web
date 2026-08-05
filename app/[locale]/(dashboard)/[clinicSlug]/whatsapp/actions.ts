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

  // Seed default menu options when enabling rule-based mode and none exist
  if (updates.mode === 'rule_based') {
    const { data: existing } = await supabase
      .from('whatsapp_menu_options')
      .select('id')
      .eq('clinic_id', clinicId)

    if (!existing || existing.length === 0) {
      const { error: seedError } = await supabase
        .from('whatsapp_menu_options')
        .insert([
          { clinic_id: clinicId, option_number: 1, label_ar: 'حجز موعد', label_en: 'Book Appointment', response_type: 'action_book', is_active: true },
          { clinic_id: clinicId, option_number: 2, label_ar: 'إلغاء موعد', label_en: 'Cancel Appointment', response_type: 'action_cancel', is_active: true },
          { clinic_id: clinicId, option_number: 3, label_ar: 'استفسار عام', label_en: 'General Inquiry', response_type: 'action_inquiry', is_active: true }
        ])

      if (seedError) {
        console.error('Failed to seed default menu options:', seedError)
      }
    }
  }

  revalidatePath('/[locale]/(dashboard)/[clinicSlug]/whatsapp', 'page')
}

export async function updateAIConfig(
  clinicId: string,
  locale: string,
  updates: {
    bot_name?: string
    personality?: 'friendly' | 'formal' | 'playful'
    custom_instructions?: string
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
    console.error('Failed to update AI config:', error)
    throw new Error('Failed to update AI config')
  }

  revalidatePath('/[locale]/(dashboard)/[clinicSlug]/whatsapp', 'page')
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
  revalidatePath('/[locale]/(dashboard)/[clinicSlug]/whatsapp', 'page')
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
  revalidatePath('/[locale]/(dashboard)/[clinicSlug]/whatsapp', 'page')
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

  revalidatePath('/[locale]/(dashboard)/[clinicSlug]/whatsapp', 'page')
}

export async function getFollowupRules(clinicId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('service_followup_rules')
    .select('*, clinic_services(name)')
    .eq('clinic_id', clinicId)
    .order('created_at', { ascending: false })

  if (error) throw new Error('Failed to load follow-up rules')
  return data || []
}

export async function addFollowupRule(
  clinicId: string,
  locale: string,
  serviceId: string,
  followupAfterValue: number,
  followupAfterUnit: 'hours' | 'days' | 'months',
  messageTemplate: string
) {
  const supabase = createClient()
  const { error } = await supabase
    .from('service_followup_rules')
    .insert({
      clinic_id: clinicId,
      service_id: serviceId,
      followup_after_value: followupAfterValue,
      followup_after_unit: followupAfterUnit,
      message_template: messageTemplate,
      is_active: true
    })

  if (error) {
    console.error(error)
    throw new Error('Failed to add follow-up rule')
  }

  revalidatePath('/[locale]/(dashboard)/[clinicSlug]/whatsapp', 'page')
}

export async function toggleFollowupRule(clinicId: string, locale: string, ruleId: string, isActive: boolean) {
  const supabase = createClient()
  const { error } = await supabase
    .from('service_followup_rules')
    .update({ is_active: isActive })
    .eq('id', ruleId)
    .eq('clinic_id', clinicId)

  if (error) throw new Error('Failed to update follow-up rule')
  revalidatePath('/[locale]/(dashboard)/[clinicSlug]/whatsapp', 'page')
}

export async function deleteFollowupRule(clinicId: string, locale: string, ruleId: string) {
  const supabase = createClient()
  const { error } = await supabase
    .from('service_followup_rules')
    .delete()
    .eq('id', ruleId)
    .eq('clinic_id', clinicId)

  if (error) throw new Error('Failed to delete follow-up rule')
  revalidatePath('/[locale]/(dashboard)/[clinicSlug]/whatsapp', 'page')
}
