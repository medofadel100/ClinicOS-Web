import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: Request) {
  try {
    const { token, fullName, email, password, specialtyTitle, bioAr, bioEn } = await request.json()

    if (!token || !fullName || !email || !password) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const supabase = createAdminClient()

    // 1. Validate invite
    const { data: invite, error: inviteError } = await supabase
      .from('staff_invites')
      .select('*')
      .eq('invite_token', token)
      .single()

    if (inviteError || !invite) {
      return NextResponse.json({ error: 'Invalid invite link' }, { status: 400 })
    }

    if (invite.status !== 'pending') {
      return NextResponse.json({ error: 'Invite is no longer valid' }, { status: 400 })
    }

    if (new Date(invite.expires_at) < new Date()) {
      await supabase.from('staff_invites').update({ status: 'expired' }).eq('id', invite.id)
      return NextResponse.json({ error: 'Invite has expired' }, { status: 400 })
    }

    // 2. Create Auth User bypassing email confirmation
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName }
    })

    if (authError || !authData.user) {
      return NextResponse.json({ error: authError?.message || 'Failed to create user' }, { status: 400 })
    }

    const userId = authData.user.id

    // 3. Create staff_member
    const { data: staffMember, error: staffMemberError } = await supabase
      .from('staff_members')
      .insert({
        auth_user_id: userId,
        full_name: fullName,
        phone: null, // can be added later
      })
      .select()
      .single()

    if (staffMemberError) {
      return NextResponse.json({ error: 'Failed to create staff record' }, { status: 500 })
    }

    // 4. Create clinic_staff_memberships
    const { data: membership, error: membershipError } = await supabase
      .from('clinic_staff_memberships')
      .insert({
        staff_member_id: staffMember.id,
        clinic_id: invite.clinic_id,
        role: invite.invited_role,
        is_active: true,
        joined_at: new Date().toISOString()
      })
      .select()
      .single()

    if (membershipError) {
      return NextResponse.json({ error: 'Failed to create clinic membership' }, { status: 500 })
    }

    // 5. If doctor, create doctor_profiles
    if (invite.invited_role === 'doctor') {
      await supabase
        .from('doctor_profiles')
        .insert({
          membership_id: membership.id,
          specialty_title: specialtyTitle || null,
          bio_ar: bioAr || null,
          bio_en: bioEn || null
        })
    }

    // 6. Mark invite as accepted
    await supabase
      .from('staff_invites')
      .update({
        status: 'accepted',
        accepted_by_staff_member_id: staffMember.id
      })
      .eq('id', invite.id)

    return NextResponse.json({ success: true })

  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 })
  }
}
