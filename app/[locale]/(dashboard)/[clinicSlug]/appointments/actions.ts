'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

async function verifyAccess(clinicId: string) {
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

  if (!membership) {
    throw new Error('Forbidden')
  }

  return { supabase, staffMember, membership }
}

export async function getAvailableSlots(clinicId: string, doctorId: string, date: string, durationMinutes: number) {
  const { supabase } = await verifyAccess(clinicId)
  
  const startOfDay = new Date(date)
  startOfDay.setUTCHours(0, 0, 0, 0)
  const endOfDay = new Date(date)
  endOfDay.setUTCHours(23, 59, 59, 999)

  const { data: existingApps } = await supabase
    .from('appointments')
    .select('scheduled_at, duration_minutes')
    .eq('clinic_id', clinicId)
    .eq('membership_id', doctorId)
    .in('status', ['scheduled', 'confirmed'])
    .gte('scheduled_at', startOfDay.toISOString())
    .lte('scheduled_at', endOfDay.toISOString())

  const START_HOUR = 8
  const END_HOUR = 20
  const slots: string[] = []

  let current = new Date(date)
  current.setHours(START_HOUR, 0, 0, 0)
  
  const endTime = new Date(date)
  endTime.setHours(END_HOUR, 0, 0, 0)

  while (current < endTime) {
    const slotStart = new Date(current)
    const slotEnd = new Date(current.getTime() + durationMinutes * 60000)
    
    // Check if it overlaps with any existing app
    const hasConflict = existingApps?.some(app => {
      const appStart = new Date(app.scheduled_at)
      const appEnd = new Date(appStart.getTime() + app.duration_minutes * 60000)
      return slotStart < appEnd && slotEnd > appStart
    })

    if (!hasConflict && slotEnd <= endTime) {
      slots.push(slotStart.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }))
    }

    // Move to next 30-min block for evaluation (you can step by duration, but 30min is standard)
    current.setMinutes(current.getMinutes() + 30)
  }

  return slots
}

export async function createAppointment(clinicId: string, locale: string, formData: FormData) {
  const { supabase } = await verifyAccess(clinicId)

  const patient_id = formData.get('patient_id') as string
  const membership_id = formData.get('membership_id') as string // the doctor
  const service_id = formData.get('service_id') as string
  const scheduled_at = formData.get('scheduled_at') as string
  const duration_minutes = parseInt(formData.get('duration_minutes') as string || '30')

  // Conflict Checking Logic
  const newStart = new Date(scheduled_at)
  const newEnd = new Date(newStart.getTime() + duration_minutes * 60000)

  // Fetch today's appointments for this doctor to check for overlaps
  const startOfDay = new Date(newStart)
  startOfDay.setUTCHours(0, 0, 0, 0)
  const endOfDay = new Date(newStart)
  endOfDay.setUTCHours(23, 59, 59, 999)

  const { data: existingApps } = await supabase
    .from('appointments')
    .select('id, scheduled_at, duration_minutes, status')
    .eq('clinic_id', clinicId)
    .eq('membership_id', membership_id)
    .in('status', ['scheduled', 'confirmed'])
    .gte('scheduled_at', startOfDay.toISOString())
    .lte('scheduled_at', endOfDay.toISOString())

  if (existingApps) {
    const hasConflict = existingApps.some(app => {
      const existingStart = new Date(app.scheduled_at)
      const existingEnd = new Date(existingStart.getTime() + app.duration_minutes * 60000)
      
      // Two intervals [S1, E1] and [S2, E2] overlap if S1 < E2 and E1 > S2
      return newStart < existingEnd && newEnd > existingStart
    })

    if (hasConflict) {
      throw new Error('CONFLICT: This time slot overlaps with an existing appointment.')
    }
  }

  const { error } = await supabase
    .from('appointments')
    .insert({
      clinic_id: clinicId,
      patient_id,
      membership_id,
      service_id,
      scheduled_at,
      duration_minutes,
      status: 'scheduled',
      created_via: 'staff'
    })

  if (error) throw error

  revalidatePath('/[locale]/(dashboard)/[clinicSlug]/appointments', 'page')
  revalidatePath('/[locale]/(dashboard)/[clinicSlug]/appointments/waitlist', 'page')
}

export async function bookWalkIn(clinicId: string, locale: string, patientId: string, serviceId: string) {
  const { supabase, membership } = await verifyAccess(clinicId)

  const { data: service } = await supabase
    .from('clinic_services')
    .select('duration_minutes')
    .eq('id', serviceId)
    .single()

  if (!service) throw new Error('Service not found')

  // Find the next available slot for this doctor (owner) right now
  const now = new Date()
  const slots = await getAvailableSlots(clinicId, membership.id, now.toISOString().split('T')[0], service.duration_minutes)

  let scheduledAt: string
  if (slots.length > 0) {
    scheduledAt = new Date(`${now.toISOString().split('T')[0]}T${slots[0]}`).toISOString()
  } else {
    // If no slots today, book for now (will show as in-progress)
    scheduledAt = now.toISOString()
  }

  const { error } = await supabase
    .from('appointments')
    .insert({
      clinic_id: clinicId,
      patient_id: patientId,
      membership_id: membership.id,
      service_id: serviceId,
      scheduled_at: scheduledAt,
      duration_minutes: service.duration_minutes,
      status: 'confirmed',
      created_via: 'staff'
    })

  if (error) throw error

  revalidatePath('/[locale]/(dashboard)/[clinicSlug]/appointments', 'page')
  revalidatePath('/[locale]/(dashboard)/[clinicSlug]/my-day', 'page')
}

export async function updateAppointmentStatus(appointmentId: string, clinicId: string, locale: string, newStatus: string) {
  const { supabase } = await verifyAccess(clinicId)

  // 1. Get the current appointment details before changing status
  const { data: appointment, error: fetchError } = await supabase
    .from('appointments')
    .select('patient_id, scheduled_at, membership_id')
    .eq('id', appointmentId)
    .single()

  if (fetchError || !appointment) throw new Error('Appointment not found')

  // 2. Update status
  const { error: updateError } = await supabase
    .from('appointments')
    .update({ status: newStatus })
    .eq('id', appointmentId)

  if (updateError) throw updateError

  // 3. If cancelling, check waitlist
  if (newStatus === 'cancelled') {
    const scheduledDateStr = appointment.scheduled_at.split('T')[0] // extract date part YYYY-MM-DD
    
    // Find waitlist entries that overlap with this date, and optionally match this doctor
    const { data: waitlistMatches } = await supabase
      .from('patient_waitlist')
      .select('id, membership_id')
      .eq('clinic_id', clinicId)
      .eq('status', 'waiting')
      .lte('desired_from', scheduledDateStr)
      .gte('desired_to', scheduledDateStr)

    if (waitlistMatches && waitlistMatches.length > 0) {
      // Filter those who either don't care about the doctor, or want this specific doctor
      const validMatches = waitlistMatches.filter(w => !w.membership_id || w.membership_id === appointment.membership_id)
      
      if (validMatches.length > 0) {
        // Just flag them as notified for now (Actual WhatsApp notification in CP12)
        const matchIds = validMatches.map(m => m.id)
        await supabase
          .from('patient_waitlist')
          .update({ status: 'notified' })
          .in('id', matchIds)
      }
    }
  }

  revalidatePath('/[locale]/(dashboard)/[clinicSlug]/appointments', 'page')
}

export async function rescheduleAppointment(appointmentId: string, clinicId: string, locale: string, formData: FormData) {
  const { supabase } = await verifyAccess(clinicId)

  const new_scheduled_at = formData.get('scheduled_at') as string

  // Fetch the appointment to get doctor and duration
  const { data: appointment } = await supabase
    .from('appointments')
    .select('membership_id, duration_minutes')
    .eq('id', appointmentId)
    .single()

  if (!appointment) throw new Error('Appointment not found')

  const membership_id = appointment.membership_id
  const duration_minutes = appointment.duration_minutes

  // Conflict Checking Logic
  const newStart = new Date(new_scheduled_at)
  const newEnd = new Date(newStart.getTime() + duration_minutes * 60000)

  const startOfDay = new Date(newStart)
  startOfDay.setUTCHours(0, 0, 0, 0)
  const endOfDay = new Date(newStart)
  endOfDay.setUTCHours(23, 59, 59, 999)

  const { data: existingApps } = await supabase
    .from('appointments')
    .select('id, scheduled_at, duration_minutes, status')
    .eq('clinic_id', clinicId)
    .eq('membership_id', membership_id)
    .in('status', ['scheduled', 'confirmed'])
    .gte('scheduled_at', startOfDay.toISOString())
    .lte('scheduled_at', endOfDay.toISOString())
    .neq('id', appointmentId) // ignore the current appointment

  if (existingApps) {
    const hasConflict = existingApps.some(app => {
      const existingStart = new Date(app.scheduled_at)
      const existingEnd = new Date(existingStart.getTime() + app.duration_minutes * 60000)
      return newStart < existingEnd && newEnd > existingStart
    })

    if (hasConflict) {
      throw new Error('CONFLICT: This new time slot overlaps with an existing appointment.')
    }
  }

  const { error } = await supabase
    .from('appointments')
    .update({ scheduled_at: new_scheduled_at })
    .eq('id', appointmentId)

  if (error) throw error

  revalidatePath('/[locale]/(dashboard)/[clinicSlug]/appointments', 'page')
}

export async function addToWaitlist(clinicId: string, locale: string, formData: FormData) {
  const { supabase } = await verifyAccess(clinicId)

  const patient_id = formData.get('patient_id') as string
  const membership_id = formData.get('membership_id') as string || null // optional doctor
  const desired_from = formData.get('desired_from') as string
  const desired_to = formData.get('desired_to') as string

  const { error } = await supabase
    .from('patient_waitlist')
    .insert({
      clinic_id: clinicId,
      patient_id,
      membership_id,
      desired_from,
      desired_to,
      status: 'waiting'
    })

  if (error) throw error

  revalidatePath('/[locale]/(dashboard)/[clinicSlug]/appointments', 'page')
}
