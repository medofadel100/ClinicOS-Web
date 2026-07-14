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

export async function createAppointment(clinicId: string, locale: string, formData: FormData) {
  const { supabase } = await verifyAccess(clinicId)

  const patient_id = formData.get('patient_id') as string
  const membership_id = formData.get('membership_id') as string // the doctor
  const service_id = formData.get('service_id') as string
  const scheduled_at = formData.get('scheduled_at') as string
  const duration_minutes = parseInt(formData.get('duration_minutes') as string || '30')

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

  revalidatePath(`/${locale}/${clinicId}/appointments`)
  revalidatePath(`/${locale}/${clinicId}/patients/${patient_id}`)
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

  revalidatePath(`/${locale}/${clinicId}/appointments`)
  revalidatePath(`/${locale}/${clinicId}/patients/${appointment.patient_id}`)
}

export async function rescheduleAppointment(appointmentId: string, clinicId: string, locale: string, formData: FormData) {
  const { supabase } = await verifyAccess(clinicId)

  const new_scheduled_at = formData.get('scheduled_at') as string

  const { error } = await supabase
    .from('appointments')
    .update({ scheduled_at: new_scheduled_at })
    .eq('id', appointmentId)

  if (error) throw error

  revalidatePath(`/${locale}/${clinicId}/appointments`)
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

  revalidatePath(`/${locale}/${clinicId}/appointments`)
  revalidatePath(`/${locale}/${clinicId}/patients/${patient_id}`)
}
