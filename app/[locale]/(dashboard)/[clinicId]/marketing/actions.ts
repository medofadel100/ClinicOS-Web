'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function upsertCampaign(
  clinicId: string,
  locale: string,
  id: string | null,
  name: string,
  platform: string,
  startDate: string | null,
  endDate: string | null,
  budgetEgp: number | null,
  isActive: boolean
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

  if (!membership || (membership.role !== 'owner' && membership.role !== 'admin')) {
    throw new Error('Forbidden')
  }

  const payload = {
    clinic_id: clinicId,
    name,
    platform,
    start_date: startDate || null,
    end_date: endDate || null,
    budget_egp: budgetEgp,
    is_active: isActive
  }

  if (id) {
    const { error } = await supabase
      .from('marketing_campaigns')
      .update(payload)
      .eq('id', id)
      .eq('clinic_id', clinicId)
      
    if (error) throw new Error('Failed to update campaign')
  } else {
    const { error } = await supabase
      .from('marketing_campaigns')
      .insert(payload)
      
    if (error) throw new Error('Failed to create campaign')
  }

  revalidatePath(`/${locale}/${clinicId}/marketing`)
}

export async function createWhatsAppCampaign(
  clinicId: string,
  locale: string,
  name: string,
  messageTemplate: string,
  filterType: string,
  filterValue?: string
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

  // Create Campaign
  const { data: campaign, error: campaignError } = await supabase
    .from('whatsapp_campaigns')
    .insert({
      clinic_id: clinicId,
      name,
      message_template: messageTemplate,
      status: 'processing', // Queue immediately
      created_by: staffMember.id
    })
    .select('id')
    .single()

  if (campaignError || !campaign) {
    console.error(campaignError)
    throw new Error('Failed to create WhatsApp campaign')
  }

  // Build target patient query
  let patientQuery = supabase.from('patients').select('id').eq('clinic_id', clinicId)

  if (filterType === 'not_visited_months' && filterValue) {
    const months = parseInt(filterValue)
    const dateLimit = new Date()
    dateLimit.setMonth(dateLimit.getMonth() - months)
    
    // Select all patients, and filter locally out those who had recent appointments.
    const { data: allPatients } = await patientQuery
    const { data: recentApps } = await supabase
      .from('appointments')
      .select('patient_id')
      .eq('clinic_id', clinicId)
      .gte('scheduled_at', dateLimit.toISOString())
    
    const recentPatientIds = new Set(recentApps?.map(a => a.patient_id) || [])
    const targetPatients = allPatients?.filter(p => !recentPatientIds.has(p.id)) || []
    
    await insertRecipients(supabase, campaign.id, targetPatients)
  } else if (filterType === 'has_disease' && filterValue) {
    // Join patient_medical_history
    const { data: history } = await supabase
      .from('patient_medical_history')
      .select('patient_id, systemic_diseases')
      .ilike('systemic_diseases', `%${filterValue}%`)
      
    // Filter to those in this clinic
    const { data: allPatients } = await patientQuery
    const clinicPatientIds = new Set(allPatients?.map(p => p.id) || [])
    
    const targetPatients = history?.filter(h => clinicPatientIds.has(h.patient_id)).map(h => ({ id: h.patient_id })) || []
    await insertRecipients(supabase, campaign.id, targetPatients)
  } else {
    // All patients
    const { data: allPatients } = await patientQuery
    await insertRecipients(supabase, campaign.id, allPatients || [])
  }

  revalidatePath(`/${locale}/${clinicId}/marketing`)
}

async function insertRecipients(supabase: any, campaignId: string, patients: any[]) {
  if (!patients || patients.length === 0) return

  const inserts = patients.map(p => ({
    campaign_id: campaignId,
    patient_id: p.id,
    status: 'pending'
  }))

  // Chunk inserts if too large
  for (let i = 0; i < inserts.length; i += 100) {
    const chunk = inserts.slice(i, i + 100)
    await supabase.from('whatsapp_campaign_recipients').insert(chunk)
  }
}
