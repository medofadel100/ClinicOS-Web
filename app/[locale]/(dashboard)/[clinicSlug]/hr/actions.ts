'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function recordAttendance(clinicId: string, locale: string, action: 'check_in' | 'check_out') {
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
    .select('id')
    .eq('staff_member_id', staffMember.id)
    .eq('clinic_id', clinicId)
    .eq('is_active', true)
    .single()

  if (!membership) throw new Error('Forbidden')

  const today = new Date().toISOString().split('T')[0]

  if (action === 'check_in') {
    const { error } = await supabase
      .from('staff_attendance')
      .insert({
        clinic_id: clinicId,
        membership_id: membership.id,
        work_date: today,
        check_in_at: new Date().toISOString()
      })
    if (error) throw new Error('Check in failed or already checked in today')
  } else {
    const { error } = await supabase
      .from('staff_attendance')
      .update({
        check_out_at: new Date().toISOString()
      })
      .eq('clinic_id', clinicId)
      .eq('membership_id', membership.id)
      .eq('work_date', today)
    if (error) throw new Error('Check out failed')
  }

  revalidatePath('/[locale]/(dashboard)/[clinicSlug]/hr', 'page')
}

export async function requestLeave(
  clinicId: string,
  locale: string,
  leaveType: 'annual' | 'sick' | 'unpaid',
  startDate: string,
  endDate: string,
  reason: string
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

  const { data: membership } = await supabase
    .from('clinic_staff_memberships')
    .select('id')
    .eq('staff_member_id', staffMember.id)
    .eq('clinic_id', clinicId)
    .eq('is_active', true)
    .single()

  if (!membership) throw new Error('Forbidden: Not a member of this clinic')

  const { error } = await supabase
    .from('staff_leave_requests')
    .insert({
      clinic_id: clinicId,
      membership_id: membership.id,
      leave_type: leaveType,
      start_date: startDate,
      end_date: endDate,
      status: 'pending',
      reason: reason || null
    })

  if (error) {
    console.error('Request Leave Error:', error)
    throw new Error('Failed to submit leave request')
  }

  revalidatePath('/[locale]/(dashboard)/[clinicSlug]/hr', 'page')
}

export async function reviewLeaveRequest(
  clinicId: string,
  locale: string,
  requestId: string,
  status: 'approved' | 'rejected'
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

  // verify owner/admin role for this clinic
  const { data: adminMembership } = await supabase
    .from('clinic_staff_memberships')
    .select('role')
    .eq('staff_member_id', staffMember.id)
    .eq('clinic_id', clinicId)
    .eq('is_active', true)
    .single()

  if (!adminMembership || (adminMembership.role !== 'owner' && adminMembership.role !== 'admin')) {
    throw new Error('Forbidden: Requires Owner or Admin access')
  }

  // fetch the request
  const { data: request, error: reqError } = await supabase
    .from('staff_leave_requests')
    .select('*')
    .eq('id', requestId)
    .single()

  if (reqError || !request) {
    throw new Error('Leave request not found')
  }

  if (request.status !== 'pending') {
    throw new Error('Leave request already reviewed')
  }

  // If approved, deduct days
  if (status === 'approved') {
    const start = new Date(request.start_date)
    const end = new Date(request.end_date)
    // simplistic calculation (calendar days)
    const msPerDay = 1000 * 60 * 60 * 24
    const diffTime = Math.abs(end.getTime() - start.getTime())
    const diffDays = Math.ceil(diffTime / msPerDay) + 1 // inclusive

    // Check if entitlement exists
    const { data: entitlement } = await supabase
      .from('staff_entitlements')
      .select('id, days_used')
      .eq('membership_id', request.membership_id)
      .eq('leave_type', request.leave_type)
      .single()

    if (entitlement) {
      // Update
      await supabase
        .from('staff_entitlements')
        .update({ days_used: entitlement.days_used + diffDays })
        .eq('id', entitlement.id)
    } else {
      // Insert if not exists
      await supabase
        .from('staff_entitlements')
        .insert({
          membership_id: request.membership_id,
          leave_type: request.leave_type,
          total_days_allowed: 0,
          days_used: diffDays
        })
    }
  }

  // Update request status
  const { error: updateError } = await supabase
    .from('staff_leave_requests')
    .update({ 
      status,
      reviewed_by: staffMember.id 
    })
    .eq('id', requestId)

  if (updateError) {
    throw new Error('Failed to update leave request status')
  }

  revalidatePath('/[locale]/(dashboard)/[clinicSlug]/hr', 'page')
}

export async function generatePayroll(clinicId: string, locale: string, periodMonth: string) {
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
    throw new Error('Forbidden: Requires Owner or Admin access')
  }

  // 1. Fetch all active staff configurations
  const { data: configs, error: configsErr } = await supabase
    .from('staff_payroll_config')
    .select('membership_id, salary_type, base_salary_egp, commission_percentage')

  if (configsErr || !configs || configs.length === 0) {
    throw new Error('No payroll configurations found for active staff.')
  }

  // 2. Insert or Update payroll_runs for each config
  for (const config of configs) {
    const base = Number(config.base_salary_egp || 0)
    const comm = 0 // In a full version, we would calculate commissions from payments
    const net = base + comm

    // Delete existing draft for this month/member if it exists
    await supabase
      .from('payroll_runs')
      .delete()
      .eq('clinic_id', clinicId)
      .eq('membership_id', config.membership_id)
      .eq('period_month', periodMonth)
      .eq('status', 'draft') // Only overwrite drafts

    const { error: insertErr } = await supabase
      .from('payroll_runs')
      .insert({
        clinic_id: clinicId,
        membership_id: config.membership_id,
        period_month: periodMonth,
        base_salary_egp: base,
        commission_earned_egp: comm,
        net_pay_egp: net,
        status: 'draft'
      })

    if (insertErr) {
      console.error('Error generating payroll for member', config.membership_id, insertErr)
    }
  }

  revalidatePath('/[locale]/(dashboard)/[clinicSlug]/hr', 'page')
}

export async function markPayrollRunPaid(clinicId: string, locale: string, payrollRunId: string) {
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
    throw new Error('Forbidden: Requires Owner or Admin access')
  }

  const { data: run, error: runError } = await supabase
    .from('payroll_runs')
    .select('id, period_month, net_pay_egp, status, membership_id, expense_id')
    .eq('id', payrollRunId)
    .eq('clinic_id', clinicId)
    .single()

  if (runError || !run) throw new Error('Payroll run not found')
  if (run.status === 'paid') throw new Error('This payroll run is already paid')
  if (Number(run.net_pay_egp || 0) <= 0) throw new Error('Payroll run has no net amount to pay')

  // Resolve staff name for the expense title
  let staffName = ''
  const { data: membershipData } = await supabase
    .from('clinic_staff_memberships')
    .select('staff_members ( full_name )')
    .eq('id', run.membership_id)
    .single()
  staffName = (membershipData as any)?.staff_members?.full_name || 'Staff'

  const periodLabel = String(run.period_month).substring(0, 7)
  const isAr = locale === 'ar'

  // Create the expense entry (category: salaries)
  const { data: expense, error: expenseError } = await supabase
    .from('clinic_expenses')
    .insert({
      clinic_id: clinicId,
      title: isAr ? `راتب ${staffName} - ${periodLabel}` : `Salary - ${staffName} (${periodLabel})`,
      category: 'salaries',
      amount_egp: Number(run.net_pay_egp),
      recurrence: 'one_time',
      start_date: new Date().toISOString().slice(0, 10),
      created_by: staffMember.id,
    })
    .select('id')
    .single()

  if (expenseError) {
    console.error('Error creating salary expense:', expenseError)
    throw new Error('Failed to create expense entry')
  }

  // Mark the run as paid and link the expense
  const { error: updateError } = await supabase
    .from('payroll_runs')
    .update({
      status: 'paid',
      paid_at: new Date().toISOString(),
      expense_id: expense.id,
    })
    .eq('id', payrollRunId)

  if (updateError) {
    console.error('Error marking payroll as paid:', updateError)
    throw new Error('Failed to mark payroll as paid')
  }

  revalidatePath('/[locale]/(dashboard)/[clinicSlug]/hr', 'page')
}
