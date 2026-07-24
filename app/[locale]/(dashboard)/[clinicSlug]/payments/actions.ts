'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function confirmPayment(
  appointmentId: string,
  clinicId: string,
  patientId: string,
  amount: number,
  paymentMethod: string
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

  // 1. Record the payment
  const { error: paymentError } = await supabase
    .from('patient_payments')
    .insert({
      clinic_id: clinicId,
      patient_id: patientId,
      appointment_id: appointmentId,
      amount_egp: amount,
      payment_type: 'session_payment',
      payment_method: paymentMethod,
      recorded_by: staffMember.id,
      paid_at: new Date().toISOString()
    })

  if (paymentError) throw paymentError

  // 2. Update appointment status to completed
  const { error: updateError } = await supabase
    .from('appointments')
    .update({ status: 'completed' })
    .eq('id', appointmentId)

  if (updateError) throw updateError

  revalidatePath('/[locale]/(dashboard)/[clinicSlug]/payments', 'page')
  revalidatePath('/[locale]/(dashboard)/[clinicSlug]/appointments', 'page')
}
