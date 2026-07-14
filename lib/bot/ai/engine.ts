import OpenAI from 'openai'
import { createClient } from '@/lib/supabase/server'
import { sendMessage } from '@/lib/whatsapp-client'
import { buildSystemPrompt } from './prompt-builder'
import { lookupPatientInfo, getAvailableSlots, bookAppointment, cancelAppointment } from './tools'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

export async function handleAIMessage(clinicId: string, from: string, messageBody: string) {
  const supabase = createClient()
  
  // 1. Lookup Patient
  const { data: patient } = await supabase
    .from('patients')
    .select('id, full_name')
    .eq('clinic_id', clinicId)
    .eq('phone', from)
    .single()

  if (!patient) {
    await sendMessage(
      clinicId, 
      from, 
      "Welcome to the clinic! We don't have your number registered. Please call the clinic to register your file before using the automated assistant."
    )
    return
  }

  // 2. Fetch Conversation State (History)
  const { data: stateData } = await supabase
    .from('whatsapp_conversation_states')
    .select('state')
    .eq('clinic_id', clinicId)
    .eq('phone_number', from)
    .single()

  let messages: any[] = stateData?.state?.messages || []

  // If no history, we inject the dynamic system prompt
  if (messages.length === 0) {
    const systemPrompt = await buildSystemPrompt(clinicId, patient.full_name)
    messages.push({ role: 'system', content: systemPrompt })
  }

  // Add user message
  messages.push({ role: 'user', content: messageBody.trim() })

  // Define tools
  const tools: OpenAI.Chat.ChatCompletionTool[] = [
    {
      type: 'function',
      function: {
        name: 'lookup_patient_info',
        description: 'Get the upcoming appointments for the current patient.',
        parameters: { type: 'object', properties: {} }
      }
    },
    {
      type: 'function',
      function: {
        name: 'get_available_slots',
        description: 'Check available time slots for a specific doctor on a specific date.',
        parameters: {
          type: 'object',
          properties: {
            doctorId: { type: 'string', description: 'The UUID of the doctor' },
            date: { type: 'string', description: 'The date to check in YYYY-MM-DD format' }
          },
          required: ['doctorId', 'date']
        }
      }
    },
    {
      type: 'function',
      function: {
        name: 'book_appointment',
        description: 'Book an appointment for the patient.',
        parameters: {
          type: 'object',
          properties: {
            doctorId: { type: 'string' },
            serviceId: { type: 'string' },
            datetimeStr: { type: 'string', description: 'The ISO datetime string for the appointment (e.g. 2026-07-15T10:00:00Z)' }
          },
          required: ['doctorId', 'serviceId', 'datetimeStr']
        }
      }
    },
    {
      type: 'function',
      function: {
        name: 'cancel_appointment',
        description: 'Cancel an upcoming appointment.',
        parameters: {
          type: 'object',
          properties: {
            appointmentId: { type: 'string', description: 'The UUID of the appointment to cancel' }
          },
          required: ['appointmentId']
        }
      }
    }
  ]

  // 3. Call LLM
  try {
    let response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages,
      tools,
      tool_choice: 'auto'
    })

    let message = response.choices[0].message
    messages.push(message)

    // Handle tool calls
    if (message.tool_calls) {
      for (const toolCall of message.tool_calls) {
        const name = toolCall.function.name
        const args = JSON.parse(toolCall.function.arguments)
        
        let toolResult: any = {}

        try {
          if (name === 'lookup_patient_info') {
            toolResult = await lookupPatientInfo(clinicId, patient.id)
          } else if (name === 'get_available_slots') {
            toolResult = await getAvailableSlots(clinicId, args.doctorId, args.date)
          } else if (name === 'book_appointment') {
            toolResult = await bookAppointment(clinicId, patient.id, args.doctorId, args.serviceId, args.datetimeStr)
          } else if (name === 'cancel_appointment') {
            toolResult = await cancelAppointment(clinicId, patient.id, args.appointmentId)
          }
        } catch (e: any) {
          toolResult = { error: e.message }
        }

        messages.push({
          role: 'tool',
          tool_call_id: toolCall.id,
          content: JSON.stringify(toolResult)
        })
      }

      // Call LLM again to get natural language response based on tool output
      response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages
      })
      
      message = response.choices[0].message
      messages.push(message)
    }

    // 4. Send the final response to WhatsApp
    if (message.content) {
      await sendMessage(clinicId, from, message.content)
    }

    // Keep only the last 20 messages to avoid context bloat
    if (messages.length > 20) {
      messages = [messages[0], ...messages.slice(messages.length - 19)]
    }

    // 5. Save State
    await supabase.from('whatsapp_conversation_states').upsert({
      clinic_id: clinicId,
      phone_number: from,
      state: { messages },
      updated_at: new Date().toISOString()
    }, { onConflict: 'clinic_id, phone_number' })

  } catch (err) {
    console.error('LLM Error:', err)
    await sendMessage(clinicId, from, "Sorry, I'm having trouble thinking right now. Please try again later or call the clinic.")
  }
}
