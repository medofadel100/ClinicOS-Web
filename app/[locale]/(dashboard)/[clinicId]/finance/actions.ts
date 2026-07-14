'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

async function verifyFinanceAccess(clinicId: string) {
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
    throw new Error('Forbidden: Finance Access Requires Owner or Admin Role')
  }

  return { supabase, staffMember, membership }
}

export async function logExpense(
  clinicId: string,
  locale: string,
  title: string,
  category: 'rent' | 'salaries' | 'installment' | 'utilities' | 'supplies' | 'other',
  amount: number,
  recurrence: 'one_time' | 'weekly' | 'monthly' | 'yearly',
  startDate: string,
  endDate?: string
) {
  const { supabase, staffMember } = await verifyFinanceAccess(clinicId)

  // 1. Insert the parent expense
  const { data: expense, error: expenseError } = await supabase
    .from('clinic_expenses')
    .insert({
      clinic_id: clinicId,
      title,
      category,
      amount_egp: amount,
      recurrence,
      start_date: startDate,
      end_date: endDate || null,
      created_by: staffMember.id
    })
    .select()
    .single()

  if (expenseError) {
    console.error('Expense Error:', expenseError)
    throw new Error('Failed to create expense')
  }

  // 2. Insert the initial occurrence
  // For one_time, we immediately mark it as paid.
  // For recurring, we mark it as pending.
  const isOneTime = recurrence === 'one_time'
  
  const { error: occurrenceError } = await supabase
    .from('expense_occurrences')
    .insert({
      expense_id: expense.id,
      period_date: startDate,
      amount_egp: amount,
      status: isOneTime ? 'paid' : 'pending',
      paid_at: isOneTime ? new Date().toISOString() : null
    })

  if (occurrenceError) {
    console.error('Occurrence Error:', occurrenceError)
    throw new Error('Failed to create initial occurrence')
  }

  revalidatePath(`/${locale}/${clinicId}/finance`)
}

export async function payOccurrence(
  clinicId: string,
  locale: string,
  occurrenceId: string
) {
  const { supabase } = await verifyFinanceAccess(clinicId)

  const { error } = await supabase
    .from('expense_occurrences')
    .update({ 
      status: 'paid',
      paid_at: new Date().toISOString()
    })
    .eq('id', occurrenceId)

  if (error) {
    console.error('Pay Occurrence Error:', error)
    throw new Error('Failed to mark occurrence as paid')
  }

  revalidatePath(`/${locale}/${clinicId}/finance`)
}
