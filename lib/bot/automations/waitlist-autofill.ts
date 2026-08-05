import { createAdminClient } from '@/lib/supabase/admin'
import { sendMessage } from '@/lib/whatsapp-client'

/**
 * Triggered when an appointment is cancelled.
 * Looks for patients on the waitlist (patient_waitlist) for this doctor and date,
 * and offers them the freed slot.
 */
export async function processWaitlistCancellation(
  clinicId: string,
  cancelledAppointment: {
    membership_id: string
    scheduled_at: string
  }
) {
  const supabase = createAdminClient()

  // 1. Check if autofill is enabled
  const { data: config } = await supabase
    .from('whatsapp_automation_settings')
    .select('waitlist_autofill_enabled')
    .eq('clinic_id', clinicId)
    .single()

  if (!config?.waitlist_autofill_enabled) return

  const dateStr = cancelledAppointment.scheduled_at.split('T')[0] // YYYY-MM-DD

  // 2. Find waiting patients whose desired date range covers the freed slot
  const { data: waiting } = await supabase
    .from('patient_waitlist')
    .select('id, patients(id, phone, full_name)')
    .eq('clinic_id', clinicId)
    .eq('membership_id', cancelledAppointment.membership_id)
    .eq('status', 'waiting')
    .lte('desired_from', dateStr)
    .gte('desired_to', dateStr)
    .order('created_at', { ascending: true }) // First come, first served
    .limit(1)

  if (waiting && waiting.length > 0) {
    const waitlistEntry = waiting[0]
    const patient = (Array.isArray(waitlistEntry.patients) ? waitlistEntry.patients[0] : waitlistEntry.patients) as { phone?: string; full_name?: string } | null;
    const patientPhone = patient?.phone;

    if (patientPhone) {
      const timeStr = new Date(cancelledAppointment.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

      // Send offer
      await sendMessage(
        clinicId,
        patientPhone,
        `Hello ${patient?.full_name}! An earlier appointment just opened up on ${dateStr} at ${timeStr}. Reply "YES" to claim this slot, or "NO" to pass.`
      )

      // Update waitlist status to notified to prevent double-offering
      await supabase
        .from('patient_waitlist')
        .update({ status: 'notified' })
        .eq('id', waitlistEntry.id)
    }
  }
}
