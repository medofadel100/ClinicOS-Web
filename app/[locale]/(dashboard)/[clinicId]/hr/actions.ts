'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

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

  revalidatePath(`/${locale}/${clinicId}/hr`)
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

  revalidatePath(`/${locale}/${clinicId}/hr`)
}
