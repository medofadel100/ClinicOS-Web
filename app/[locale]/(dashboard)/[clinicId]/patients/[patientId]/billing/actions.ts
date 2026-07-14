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

export async function createTreatmentPlan(
  clinicId: string,
  locale: string,
  patientId: string,
  title: string,
  totalPrice: number,
  sessionCount: number
) {
  const { supabase, staffMember } = await verifyAccess(clinicId)

  // Insert plan
  const { data: plan, error: planError } = await supabase
    .from('treatment_plans')
    .insert({
      clinic_id: clinicId,
      patient_id: patientId,
      title,
      total_price_egp: totalPrice,
      status: 'active',
      created_by: staffMember.id
    })
    .select()
    .single()

  if (planError) throw new Error('Failed to create plan')

  // Calculate session price (simple division for MVP)
  const sessionPrice = Number((totalPrice / sessionCount).toFixed(2))

  // Insert sessions
  const sessions = Array.from({ length: sessionCount }).map((_, i) => ({
    treatment_plan_id: plan.id,
    sequence_number: i + 1,
    session_price_egp: sessionPrice,
    status: 'pending'
  }))

  const { error: sessionError } = await supabase
    .from('treatment_plan_sessions')
    .insert(sessions)

  if (sessionError) throw new Error('Failed to create sessions')

  revalidatePath(`/${locale}/${clinicId}/patients/${patientId}`)
}

export async function updateSessionStatus(
  clinicId: string,
  locale: string,
  patientId: string,
  sessionId: string,
  status: 'pending' | 'completed'
) {
  const { supabase } = await verifyAccess(clinicId)

  const { error } = await supabase
    .from('treatment_plan_sessions')
    .update({ status })
    .eq('id', sessionId)

  if (error) throw new Error('Failed to update session status')

  revalidatePath(`/${locale}/${clinicId}/patients/${patientId}`)
}

export async function recordPayment(
  clinicId: string,
  locale: string,
  patientId: string,
  amount: number,
  paymentType: 'deposit' | 'session_payment' | 'full_payment' | 'other',
  paymentMethod: 'cash' | 'card' | 'bank_transfer' | 'other',
  treatmentPlanId?: string
) {
  const { supabase, staffMember } = await verifyAccess(clinicId)

  const { error } = await supabase
    .from('patient_payments')
    .insert({
      clinic_id: clinicId,
      patient_id: patientId,
      treatment_plan_id: treatmentPlanId || null,
      amount_egp: amount,
      payment_type: paymentType,
      payment_method: paymentMethod,
      recorded_by: staffMember.id
    })

  // If RLS fails (user not authorized to record payment), it will throw an error here.
  if (error) {
    console.error('Record Payment Error:', error)
    throw new Error('You are not authorized to record payments, or an error occurred.')
  }

  revalidatePath(`/${locale}/${clinicId}/patients/${patientId}`)
}
