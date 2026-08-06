import { createAdminClient } from '@/lib/supabase/admin'

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

export async function buildSystemPrompt(clinicId: string, patientName: string, patientPhone?: string) {
  const supabase = createAdminClient()

  // 0. Fetch the clinic so the assistant can name it correctly
  const { data: clinic } = await supabase
    .from('clinics')
    .select('name')
    .eq('id', clinicId)
    .single()
  const clinicName = clinic?.name?.trim() || 'the clinic'

  // 1. Fetch clinic bot config
  const { data: config } = await supabase
    .from('whatsapp_bot_config')
    .select('bot_name, personality, custom_instructions')
    .eq('clinic_id', clinicId)
    .single()

  // 2. Fetch doctors
  const { data: doctors } = await supabase
    .from('clinic_staff_memberships')
    .select(`
      id,
      staff_members ( full_name ),
      doctor_profiles ( id, specialty, bio )
    `)
    .eq('clinic_id', clinicId)
    .in('role', ['doctor', 'owner'])
    .eq('is_active', true)

  // 2b. Fetch working hours for each doctor
  const doctorHoursByProfile: Record<string, string[]> = {}
  if (doctors && doctors.length > 0) {
    const profileIds = doctors
      .map((d: any) => d.doctor_profiles?.[0]?.id)
      .filter(Boolean)

    if (profileIds.length > 0) {
      const { data: hours } = await supabase
        .from('doctor_working_hours')
        .select('doctor_profile_id, day_of_week, start_time, end_time')
        .in('doctor_profile_id', profileIds)
        .eq('is_active', true)

      for (const h of hours || []) {
        if (!doctorHoursByProfile[h.doctor_profile_id]) doctorHoursByProfile[h.doctor_profile_id] = []
        const day = DAY_NAMES[h.day_of_week] ?? String(h.day_of_week)
        doctorHoursByProfile[h.doctor_profile_id].push(
          `${day}: ${String(h.start_time).slice(0, 5)} - ${String(h.end_time).slice(0, 5)}`
        )
      }
    }
  }

  // 3. Fetch services
  const { data: services } = await supabase
    .from('clinic_services')
    .select('id, name, duration_minutes, price')
    .eq('clinic_id', clinicId)

  const botName = config?.bot_name?.trim() || 'the clinic assistant'

  let prompt = `You are ${botName}, the WhatsApp assistant of ${clinicName} clinic (عيادة ${clinicName}). You are chatting with a patient named ${patientName}.
Always respond in the same language the patient writes in (Arabic or English).
Your goal is to help the patient book appointments, answer basic questions about the clinic, and provide excellent service.
The patient is ALREADY identified and registered${patientPhone ? ` (phone ${patientPhone})` : ''}. NEVER ask them for their phone number or name, and never ask them to verify their identity.
When you need to refer to the clinic, use its real name ${clinicName} - NEVER write placeholder text like "[اسم العيادة]", "[clinic name]", or any text inside square brackets.
You may access the patient's own medical history and upcoming appointments to answer their questions. Never share a patient's data with anyone else.
You are NOT a doctor. For urgent medical problems, advise the patient to come to the clinic or call emergency services.
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
      const profile = d.doctor_profiles?.[0]
      const spec = profile?.specialty || 'General'
      const bio = profile?.bio || 'No specific bio provided.'
      const hours = profile ? (doctorHoursByProfile[profile.id] || []) : []
      prompt += `- Dr. ${name} (ID: ${d.id})\n  Specialty: ${spec}\n  Bio: ${bio}\n`
      if (hours.length > 0) {
        prompt += `  Working hours:\n    ${hours.join('\n    ')}\n`
      } else {
        prompt += `  Working hours: not configured\n`
      }
    })
    prompt += `\n*Note on recommending doctors*: If a patient describes symptoms, use the doctor bios and specialties above to recommend the most appropriate doctor.`
  } else {
    prompt += `No doctors found.\n`
  }

  prompt += `\n--- CLINIC SERVICES ---\n`
  if (services && services.length > 0) {
    services.forEach(s => {
      prompt += `- ${s.name} (ID: ${s.id}, Duration: ${s.duration_minutes}m${s.price ? `, Price: ${s.price} EGP` : ''})\n`
    })
  } else {
    prompt += `No services listed.\n`
  }

  prompt += `\n--- TOOLS AVAILABLE ---\n`
  prompt += `You have these tools:
- lookup_patient_info: get the patient's upcoming appointments.
- lookup_medical_history: get the patient's medical history, allergies, current medications and recent clinical notes.
- get_available_slots (args: doctorId, date "YYYY-MM-DD"): check free times for a doctor on a date.
- book_appointment (args: doctorId, serviceId, datetimeStr ISO): book a slot for the patient.
- cancel_appointment (args: appointmentId): cancel one of the patient's appointments.

When you need a tool, reply with a single line exactly in this format and nothing else:
TOOL_CALL: {"tool":"tool_name","args":{...}}
The system will execute it and send you the result, then you continue normally. Never make up slot times, appointment ids, or dates - always use the tools.
`

  prompt += `\nBooking flow:
1. Ask them to describe their problem (so you can recommend a doctor) OR ask which doctor they want to see.
2. Ask which service they need (if not obvious).
3. Use 'get_available_slots' to find free times for the doctor.
4. Present 2-3 slot options with the exact dates/times from the tool result.
5. After the patient picks one, use 'book_appointment' to confirm.
6. Confirm the booking with the returned appointment id and date.

Cancellation flow:
1. Use 'lookup_patient_info' to list their upcoming appointments.
2. Ask which one to cancel.
3. Use 'cancel_appointment' with the returned appointment_id.
4. Confirm the cancellation.
`

  return prompt
}
