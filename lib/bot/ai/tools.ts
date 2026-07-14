import { createClient } from '@/lib/supabase/server'

export async function lookupPatientInfo(clinicId: string, patientId: string) {
  const supabase = createClient()
  const { data: apps } = await supabase
    .from('appointments')
    .select('id, scheduled_at, status, clinic_services(name_en), clinic_staff_memberships(staff_members(full_name))')
    .eq('clinic_id', clinicId)
    .eq('patient_id', patientId)
    .in('status', ['scheduled', 'confirmed'])
    .gte('scheduled_at', new Date().toISOString())
  
  if (!apps || apps.length === 0) {
    return { upcoming_appointments: [] }
  }
  
  return {
    upcoming_appointments: apps.map(a => ({
      appointment_id: a.id,
      date_time: a.scheduled_at,
      status: a.status,
      service: a.clinic_services?.name_en,
      doctor: (a.clinic_staff_memberships as any)?.staff_members?.full_name
    }))
  }
}

export async function getAvailableSlots(clinicId: string, doctorId: string, dateStr: string) {
  // In a real app, this would check doctor_working_hours and existing appointments.
  // For Checkpoint 13, we mock some available slots for the given date.
  const targetDate = new Date(dateStr)
  if (isNaN(targetDate.getTime())) {
    return { error: 'Invalid date format. Please provide a YYYY-MM-DD string.' }
  }

  // Generate 3 mock slots for that day
  return {
    slots: [
      `${dateStr}T10:00:00.000Z`,
      `${dateStr}T13:30:00.000Z`,
      `${dateStr}T15:00:00.000Z`
    ]
  }
}

export async function bookAppointment(clinicId: string, patientId: string, doctorId: string, serviceId: string, datetimeStr: string) {
  const supabase = createClient()
  
  const { data, error } = await supabase.from('appointments').insert({
    clinic_id: clinicId,
    patient_id: patientId,
    membership_id: doctorId,
    service_id: serviceId,
    scheduled_at: datetimeStr,
    duration_minutes: 30,
    status: 'scheduled',
    created_via: 'whatsapp_bot'
  }).select('id').single()

  if (error) {
    console.error('Booking error:', error)
    return { success: false, error: 'Failed to book appointment in database.' }
  }

  return { success: true, appointment_id: data.id }
}

export async function cancelAppointment(clinicId: string, patientId: string, appointmentId: string) {
  const supabase = createClient()
  
  // Need to fetch details first for the autofill trigger
  const { data: appToCancel } = await supabase.from('appointments')
    .select('membership_id, scheduled_at')
    .eq('id', appointmentId)
    .single()

  const { error } = await supabase.from('appointments')
    .update({ status: 'cancelled' })
    .eq('id', appointmentId)
    .eq('clinic_id', clinicId)
    .eq('patient_id', patientId)

  if (error) {
    console.error('Cancel error:', error)
    return { success: false, error: 'Failed to cancel appointment.' }
  }

  // Trigger Waitlist Autofill automation
  if (appToCancel) {
    // Dynamic import to avoid circular dependencies if any, or just import at top
    const { processWaitlistCancellation } = await import('../automations/waitlist-autofill')
    await processWaitlistCancellation(clinicId, appToCancel)
  }

  return { success: true, message: 'Appointment cancelled successfully.' }
}
