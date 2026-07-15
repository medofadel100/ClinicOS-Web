import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const adminAuthClient = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

const anonClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function runTest() {
  const randomStr = Math.random().toString(36).substring(2, 7)
  const email = `manager${randomStr}@gmail.com`
  const password = 'TestPassword123!'
  const clinicName = `Test Clinic ${randomStr}`
  
  console.log(`1. Signing up clinic manager: ${email}`)
  // Using admin client to bypass email rate limits for testing
  const { data: signUpData, error: signUpError } = await adminAuthClient.auth.admin.createUser({
    email,
    password,
    user_metadata: { full_name: 'Test Manager' },
    email_confirm: true
  })

  if (signUpError) {
    console.error('Sign up error:', signUpError)
    return
  }
  
  const userId = signUpData.user!.id
  console.log('User created and confirmed with ID:', userId)

  console.log('3. Logging in as manager to get session')
  const { data: loginData, error: loginError } = await anonClient.auth.signInWithPassword({
    email,
    password
  })

  if (loginError) {
    console.error('Login error:', loginError)
    return
  }

  // Set the session for our admin client so we can call the RPC securely as the user
  await anonClient.auth.setSession(loginData.session!)

  // We need clinic types to pass to rpc
  const { data: clinicTypes } = await anonClient.from('clinic_types').select('id').limit(1)
  const clinicTypeId = clinicTypes?.[0]?.id

  if (!clinicTypeId) {
    console.error('No clinic types found')
    return
  }

  console.log('4. Calling create_clinic_self_signup RPC')
  const { data: clinicId, error: rpcError } = await anonClient.rpc('create_clinic_self_signup', {
    clinic_name: clinicName,
    clinic_type_id: clinicTypeId,
    owner_full_name: 'Test Manager',
    owner_phone: '01000000000',
    chosen_plan_id: null
  })

  if (rpcError) {
    console.error('RPC Error:', rpcError)
    return
  }
  
  console.log('Clinic created with ID:', clinicId)

  console.log('5. Creating staff_members and memberships for the manager')
  const { data: staffMember, error: smError } = await anonClient
    .from('staff_members')
    .insert({ auth_user_id: userId, full_name: 'Test Manager', phone: '01000000000' })
    .select().single()
    
  if (smError) {
    console.error('Staff Member Error:', smError)
    return
  }
  
  const { data: membership, error: memError } = await anonClient
    .from('clinic_staff_memberships')
    .insert({
      staff_member_id: staffMember.id,
      clinic_id: clinicId,
      role: 'owner',
      is_active: true,
      joined_at: new Date().toISOString()
    })
    .select().single()

  if (memError) {
    console.error('Membership Error:', memError)
    return
  }

  console.log('Manager successfully setup with membership ID:', membership.id)

  console.log('6. Generating Doctor Invite')
  // Simulating the server action
  const token = Array.from(crypto.getRandomValues(new Uint8Array(24)))
    .map(b => b.toString(16).padStart(2, '0')).join('')

  const { error: inviteError } = await anonClient
    .from('staff_invites')
    .insert({
      clinic_id: clinicId,
      invited_role: 'doctor',
      invite_token: token,
      created_by_membership_id: membership.id,
      status: 'pending',
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    })

  if (inviteError) {
    console.error('Invite generation error:', inviteError)
    return
  }
  console.log('Invite generated with token:', token)

  console.log('7. Accepting Invite via API (Simulating POST /api/invite/accept)')
  const doctorEmail = `test.doctor.${Date.now()}@example.com`
  
  const acceptRes = await fetch('http://localhost:3000/api/invite/accept', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      token,
      fullName: 'Test Doctor',
      email: doctorEmail,
      password: 'DoctorPassword123!',
      specialtyTitle: 'Dentist',
      bioEn: 'Hello world'
    })
  })

  const acceptData = await acceptRes.json()
  
  if (!acceptRes.ok) {
    console.error('Accept invite error:', acceptData)
    return
  }
  console.log('Invite successfully accepted!', acceptData)

  console.log('8. Verifying Doctor can login immediately without email confirmation')
  
  const { data: docLoginData, error: docLoginError } = await anonClient.auth.signInWithPassword({
    email: doctorEmail,
    password: 'DoctorPassword123!'
  })

  if (docLoginError) {
    console.error('Doctor login error:', docLoginError)
    return
  }

  console.log('Doctor logged in successfully! User ID:', docLoginData.user?.id)
  
  console.log('--- TEST PASSED SUCCESSFULLY ---')
}

runTest().catch(console.error)
