import { createClient } from '@/lib/supabase/server'

export async function buildSystemPrompt(clinicId: string, patientName: string) {
  const supabase = createClient()

  // 1. Fetch clinic bot config
  const { data: config } = await supabase
    .from('whatsapp_bot_config')
    .select('personality, custom_instructions')
    .eq('clinic_id', clinicId)
    .single()

  // 2. Fetch doctors
  const { data: doctors } = await supabase
    .from('clinic_staff_memberships')
    .select(`
      id,
      staff_members ( full_name ),
      doctor_profiles ( specialty_title, bio_en, bio_ar )
    `)
    .eq('clinic_id', clinicId)
    .eq('role', 'doctor')
    .eq('is_active', true)

  // 3. Fetch services
  const { data: services } = await supabase
    .from('services')
    .select('id, name_en, name_ar, duration_minutes')
    .eq('clinic_id', clinicId)
    .eq('is_active', true)

  let prompt = `You are a helpful WhatsApp medical assistant for a clinic. You are chatting with a patient named ${patientName}.
Your goal is to help the patient book appointments, answer basic questions about the clinic, and provide excellent service.
`

  if (config?.personality === 'formal') {
    prompt += `\nMaintain a very formal, professional, and respectful tone.`
  } else if (config?.personality === 'playful') {
    prompt += `\nMaintain a warm, friendly, and slightly playful tone, using emojis occasionally.`
  } else {
    prompt += `\nMaintain a friendly, welcoming, and helpful tone.`
  }

  if (config?.custom_instructions) {
    prompt += `\n\nAdditional Instructions from Clinic:\n${config.custom_instructions}`
  }

  prompt += `\n\n--- CLINIC DOCTORS ---\n`
  if (doctors && doctors.length > 0) {
    doctors.forEach((d: any) => {
      const name = d.staff_members?.full_name
      const spec = d.doctor_profiles?.[0]?.specialty_title || 'General'
      const bio = d.doctor_profiles?.[0]?.bio_en || 'No specific bio provided.'
      prompt += `- Dr. ${name} (ID: ${d.id})\n  Specialty: ${spec}\n  Bio: ${bio}\n`
    })
    prompt += `\n*Note on recommending doctors*: If a patient describes symptoms, use the doctor bios and specialties above to recommend the most appropriate doctor.`
  } else {
    prompt += `No doctors found.\n`
  }

  prompt += `\n--- CLINIC SERVICES ---\n`
  if (services && services.length > 0) {
    services.forEach(s => {
      prompt += `- ${s.name_en} / ${s.name_ar} (ID: ${s.id}, Duration: ${s.duration_minutes}m)\n`
    })
  } else {
    prompt += `No services listed.\n`
  }

  prompt += `\n--- TOOLS AVAILABLE ---\n`
  prompt += `You have tools to check available slots, book appointments, and cancel appointments. 
If a patient wants to book:
1. Ask them to describe their problem (so you can recommend a doctor) OR ask which doctor they want to see.
2. Ask which service they need (if not obvious).
3. Use the 'get_available_slots' tool to find available times for the doctor.
4. Ask the patient to choose a time from the available slots.
5. Use the 'book_appointment' tool to finalize the booking.

If a patient wants to cancel:
1. Use the 'lookup_patient_info' tool to see their upcoming appointments.
2. Ask which appointment they want to cancel.
3. Use the 'cancel_appointment' tool to cancel it.
`

  return prompt
}
