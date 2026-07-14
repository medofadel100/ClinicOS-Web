import { createClient } from '@/lib/supabase/server'
import { sendMessage } from '@/lib/whatsapp-client'

/**
 * Triggered when an appointment is cancelled.
 * Looks for patients on the waitlist for this doctor and date, and offers them the slot.
 */
export async function processWaitlistCancellation(
  clinicId: string,
  cancelledAppointment: {
    membership_id: string
    scheduled_at: string
  }
) {
  const supabase = createClient()

  // 1. Check if autofill is enabled
  const { data: config } = await supabase
    .from('whatsapp_automation_settings')
    .select('waitlist_autofill_enabled')
    .eq('clinic_id', clinicId)
    .single()

  if (!config?.waitlist_autofill_enabled) return

  const dateStr = cancelledAppointment.scheduled_at.split('T')[0] // YYYY-MM-DD

  // 2. Find waiting patients
  const { data: waiting } = await supabase
    .from('appointments_waitlist')
    .select('id, patients(id, phone, full_name)')
    .eq('clinic_id', clinicId)
    .eq('membership_id', cancelledAppointment.membership_id)
    .eq('preferred_date', dateStr)
    .eq('status', 'waiting')
    .order('created_at', { ascending: true }) // First come, first served
    .limit(1)

  if (waiting && waiting.length > 0) {
    const waitlistEntry = waiting[0]
    const patientPhone = waitlistEntry.patients?.phone
    
    if (patientPhone) {
      const timeStr = new Date(cancelledAppointment.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      
      // Send offer
      await sendMessage(
        clinicId,
        patientPhone,
        `Hello ${waitlistEntry.patients?.full_name}! An earlier appointment just opened up on ${dateStr} at ${timeStr}. Reply "YES" to claim this slot, or "NO" to pass.`
      )

      // Update waitlist status to notified to prevent double-offering
      await supabase
        .from('appointments_waitlist')
        .update({ status: 'notified' })
        .eq('id', waitlistEntry.id)
        
      // We would theoretically also update conversation state here to expect a YES/NO, 
      // but for Checkpoint 14 we just prove the outgoing automation triggers.
    }
  }
}
