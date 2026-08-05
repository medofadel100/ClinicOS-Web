import { createAdminClient } from '@/lib/supabase/admin'
import { sendMessage } from '@/lib/whatsapp-client'

const UNIT_MS: Record<string, number> = {
  hours: 60 * 60 * 1000,
  days: 24 * 60 * 60 * 1000,
  months: 30 * 24 * 60 * 60 * 1000,
}

/**
 * Service follow-up reminders. Reads active rules from service_followup_rules.
 * For each completed procedure on a matching service whose follow-up date has
 * arrived (and was not already sent), it sends the rule's message_template to the
 * patient via WhatsApp and logs the delivery in patient_followup_deliveries.
 */
export async function runServiceFollowups(): Promise<{ sent: number; scanned: number }> {
  const supabase = createAdminClient()

  const { data: rules } = await supabase
    .from('service_followup_rules')
    .select('id, clinic_id, service_id, followup_after_value, followup_after_unit, message_template')
    .eq('is_active', true)

  if (!rules || rules.length === 0) {
    return { sent: 0, scanned: 0 }
  }

  const now = Date.now()
  const SLACK_MS = 24 * 60 * 60 * 1000 // scan procedures that came due within the last day
  let sent = 0
  let scanned = 0

  for (const rule of rules) {
    const delayMs = UNIT_MS[rule.followup_after_unit] || 0
    if (!delayMs) continue

    const dueBefore = new Date(now - delayMs).toISOString()
    const dueAfter = new Date(now - delayMs - SLACK_MS).toISOString()

    // 1. Completed procedures for this service that have come due.
    const { data: procedures } = await supabase
      .from('patient_procedures')
      .select('id, service_name, created_at, patient_encounters(patient_id, clinic_id)')
      .eq('clinic_service_id', rule.service_id)
      .eq('status', 'completed')
      .eq('patient_encounters.clinic_id', rule.clinic_id)
      .gte('created_at', dueAfter)
      .lte('created_at', dueBefore)

    if (!procedures || procedures.length === 0) continue

    const procedureIds = procedures.map(p => p.id)

    // 2. Skip procedures we already processed for this rule.
    const { data: existing } = await supabase
      .from('patient_followup_deliveries')
      .select('procedure_id')
      .eq('rule_id', rule.id)
      .in('procedure_id', procedureIds)

    const existingIds = new Set((existing || []).map(e => e.procedure_id))

    // 3. Service name for template substitution.
    const { data: service } = await supabase
      .from('clinic_services')
      .select('name')
      .eq('id', rule.service_id)
      .single()

    const serviceName = service?.name || ''

    for (const proc of procedures) {
      if (existingIds.has(proc.id)) continue
      scanned++

      const encounter = Array.isArray(proc.patient_encounters) ? proc.patient_encounters[0] : proc.patient_encounters
      const patientId = encounter?.patient_id
      if (!patientId) continue

      const { data: patient } = await supabase
        .from('patients')
        .select('full_name, phone')
        .eq('id', patientId)
        .single()

      const template = (rule.message_template || '')
        .replace(/\{patient_name\}/g, patient?.full_name || '')
        .replace(/\{service_name\}/g, proc.service_name || serviceName)

      const scheduledDate = new Date(new Date(proc.created_at).getTime() + delayMs).toISOString()

      if (patient?.phone && template) {
        try {
          await sendMessage(rule.clinic_id, patient.phone, template)
          await supabase.from('patient_followup_deliveries').insert({
            clinic_id: rule.clinic_id,
            rule_id: rule.id,
            patient_id: patientId,
            procedure_id: proc.id,
            scheduled_date: scheduledDate,
            sent_at: new Date().toISOString(),
            status: 'sent',
          })
          sent++
        } catch (err) {
          console.error('Follow-up send failed:', err)
          await supabase.from('patient_followup_deliveries').insert({
            clinic_id: rule.clinic_id,
            rule_id: rule.id,
            patient_id: patientId,
            procedure_id: proc.id,
            scheduled_date: scheduledDate,
            status: 'failed',
            error: err instanceof Error ? err.message.slice(0, 500) : 'Send failed',
          })
        }
      } else {
        await supabase.from('patient_followup_deliveries').insert({
          clinic_id: rule.clinic_id,
          rule_id: rule.id,
          patient_id: patientId,
          procedure_id: proc.id,
          scheduled_date: scheduledDate,
          status: 'failed',
          error: patient?.phone ? 'Empty message template' : 'Patient has no phone number',
        })
      }
    }
  }

  return { sent, scanned }
}
