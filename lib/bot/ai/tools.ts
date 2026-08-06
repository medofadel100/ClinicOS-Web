import { createAdminClient } from '@/lib/supabase/admin'

export async function lookupPatientInfo(clinicId: string, patientId: string) {
  const supabase = createAdminClient()
  const { data: apps } = await supabase
    .from('appointments')
    .select('id, scheduled_at, status, clinic_services(name), clinic_staff_memberships(staff_members(full_name))')
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
      service: (a.clinic_services as { name?: string } | null)?.name,
      doctor: (a.clinic_staff_memberships as { staff_members?: { full_name?: string } } | null)?.staff_members?.full_name
    }))
  }
}

/**
 * Returns the patient's medical history, recent clinical notes and prescriptions,
 * so the AI bot can answer questions about their own file.
 */
export async function lookupMedicalHistory(clinicId: string, patientId: string) {
  const supabase = createAdminClient()

  const { data: history } = await supabase
    .from('patient_medical_history')
    .select('systemic_diseases, allergies, current_medications, notes')
    .eq('patient_id', patientId)
    .single()

  const { data: notes } = await supabase
    .from('patient_clinical_notes')
    .select('note_type, content, created_at')
    .eq('patient_id', patientId)
    .eq('clinic_id', clinicId)
    .neq('note_type', 'free_text')
    .order('created_at', { ascending: false })
    .limit(10)

  const { data: prescriptions } = await supabase
    .from('patient_prescriptions')
    .select('id, notes, created_at')
    .eq('clinic_id', clinicId)
    .eq('patient_id', patientId)
    .order('created_at', { ascending: false })
    .limit(5)

  // 4. Prescription items (the actual medicines) for each recent prescription
  const prescriptionIds = (prescriptions || []).map(p => p.id)
  const { data: items } =
    prescriptionIds.length > 0
      ? await supabase
          .from('patient_prescription_items')
          .select(
            'prescription_id, dosage, frequency, timing, duration, instructions, clinic_medications(custom_brand_name, custom_generic_name, concentration, form, medications_global(brand_name_en, brand_name_ar, generic_name))'
          )
          .in('prescription_id', prescriptionIds)
      : { data: [] }

  const itemsByPrescription: Record<string, unknown[]> = {}
  for (const item of items || []) {
    if (!itemsByPrescription[item.prescription_id]) itemsByPrescription[item.prescription_id] = []
    const med = item.clinic_medications as
      | {
          custom_brand_name?: string
          custom_generic_name?: string
          concentration?: string
          form?: string
          medications_global?: {
            brand_name_en?: string
            brand_name_ar?: string
            generic_name?: string
          }
        }
      | null
      | undefined
    const global = med?.medications_global
    const name =
      med?.custom_brand_name ||
      med?.custom_generic_name ||
      global?.brand_name_ar ||
      global?.brand_name_en ||
      global?.generic_name ||
      'Unknown medication'
    itemsByPrescription[item.prescription_id].push({
      medication: name,
      concentration: med?.concentration || null,
      form: med?.form || null,
      dosage: item.dosage || null,
      frequency: item.frequency || null,
      timing: item.timing || null,
      duration: item.duration || null,
      instructions: item.instructions || null,
    })
  }

  return {
    medical_history: history
      ? {
          systemic_diseases: history.systemic_diseases || null,
          allergies: history.allergies || null,
          current_medications: history.current_medications || null,
          notes: history.notes || null,
        }
      : null,
    recent_clinical_notes: (notes || []).map(n => ({
      note_type: n.note_type,
      content: n.content,
      created_at: n.created_at,
    })),
    recent_prescriptions: (prescriptions || []).map(p => ({
      prescription_id: p.id,
      notes: p.notes || null,
      created_at: p.created_at,
      medications: itemsByPrescription[p.id] || [],
    })),
  }
}

/** Returns real available slots for a doctor on a date, from doctor_working_hours minus booked appointments. */
export async function getAvailableSlots(clinicId: string, doctorId: string, dateStr: string) {
  const targetDate = new Date(`${dateStr}T00:00:00.000Z`)
  if (isNaN(targetDate.getTime())) {
    return { error: 'Invalid date format. Please provide a YYYY-MM-DD string.' }
  }

  // Reject dates in the past - today or later only.
  const today = new Date()
  today.setUTCHours(0, 0, 0, 0)
  if (targetDate.getTime() < today.getTime()) {
    return {
      error: `The date ${dateStr} is in the past. Please choose today or a future date, using the current date.`,
    }
  }

  const supabase = createAdminClient()

  // 1. Find the doctor profile for this membership so we can read their working hours.
  const { data: membership } = await supabase
    .from('clinic_staff_memberships')
    .select('staff_member_id')
    .eq('id', doctorId)
    .eq('clinic_id', clinicId)
    .single()

  if (!membership) return { error: 'Doctor not found for this clinic.' }

  const { data: profile } = await supabase
    .from('doctor_profiles')
    .select('id')
    .eq('clinic_id', clinicId)
    .eq('staff_member_id', membership.staff_member_id)
    .single()

  const dayOfWeek = targetDate.getUTCDay() // 0 = Sunday
  const { data: hours } = await supabase
    .from('doctor_working_hours')
    .select('start_time, end_time')
    .eq('doctor_profile_id', profile?.id)
    .eq('day_of_week', dayOfWeek)
    .eq('is_active', true)

  if (!hours || hours.length === 0) {
    return { slots: [], message: 'The doctor has no working hours configured for this day.' }
  }

  const durationMinutes = 30

  // 2. Existing appointments for that doctor on that date.
  const dayStart = `${dateStr}T00:00:00.000Z`
  const dayEnd = `${dateStr}T23:59:59.999Z`
  const { data: booked } = await supabase
    .from('appointments')
    .select('scheduled_at, duration_minutes')
    .eq('clinic_id', clinicId)
    .eq('membership_id', doctorId)
    .in('status', ['scheduled', 'confirmed'])
    .gte('scheduled_at', dayStart)
    .lte('scheduled_at', dayEnd)

  const bookedWindows = (booked || []).map(b => {
    const start = new Date(b.scheduled_at).getTime()
    const end = start + (b.duration_minutes || durationMinutes) * 60000
    return { start, end }
  })

  const now = Date.now()
  const slots: string[] = []

  for (const h of hours) {
    const [sh, sm] = String(h.start_time).split(':').map(Number)
    const [eh, em] = String(h.end_time).split(':').map(Number)
    const dayMs = targetDate.getTime()
    let cursor = dayMs + (sh * 60 + sm) * 60000
    const dayEndMs = dayMs + (eh * 60 + em) * 60000

    while (cursor + durationMinutes * 60000 <= dayEndMs) {
      const slotEnd = cursor + durationMinutes * 60000
      const overlaps = bookedWindows.some(bw => cursor < bw.end && slotEnd > bw.start)
      if (!overlaps && cursor > now) {
        slots.push(new Date(cursor).toISOString())
      }
      cursor = slotEnd
    }
  }

  return { slots }
}

export async function bookAppointment(clinicId: string, patientId: string, doctorId: string, serviceId: string, datetimeStr: string) {
  const supabase = createAdminClient()

  // Use the selected service's duration when available.
  let durationMinutes = 30
  if (serviceId) {
    const { data: service } = await supabase
      .from('clinic_services')
      .select('duration_minutes')
      .eq('id', serviceId)
      .single()
    if (service?.duration_minutes) durationMinutes = service.duration_minutes
  }

  const { data, error } = await supabase.from('appointments').insert({
    clinic_id: clinicId,
    patient_id: patientId,
    membership_id: doctorId,
    service_id: serviceId || null,
    scheduled_at: datetimeStr,
    duration_minutes: durationMinutes,
    status: 'scheduled',
    created_via: 'whatsapp_bot'
  }).select('id, scheduled_at').single()

  if (error) {
    console.error('Booking error:', error)
    return { success: false, error: 'Failed to book appointment in database.' }
  }

  return { success: true, appointment_id: data.id, date_time: data.scheduled_at }
}

export async function cancelAppointment(clinicId: string, patientId: string, appointmentId: string) {
  const supabase = createAdminClient()

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
    const { processWaitlistCancellation } = await import('../automations/waitlist-autofill')
    await processWaitlistCancellation(clinicId, appToCancel)
  }

  return { success: true, message: 'Appointment cancelled successfully.' }
}
