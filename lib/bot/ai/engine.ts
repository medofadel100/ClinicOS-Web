import { createAdminClient } from '@/lib/supabase/admin'
import { sendMessage } from '@/lib/whatsapp-client'
import { phoneOrFilter } from '@/lib/bot/phone'
import { buildSystemPrompt } from './prompt-builder'
import { generateContent, type GeminiMessage } from './gemini-client'
import {
  lookupPatientInfo,
  lookupMedicalHistory,
  getAvailableSlots,
  bookAppointment,
  cancelAppointment,
} from './tools'

const TOOL_PREFIX = 'TOOL_CALL:'
const MAX_TOOL_ROUNDS = 3

type ConversationState = {
  systemPrompt?: string
  messages: { role: 'user' | 'assistant' | 'system'; content: string }[]
  lastError?: string
}

const TOOL_FUNCTIONS: Record<string, (args: any, ctx: { clinicId: string; patientId: string }) => Promise<Record<string, unknown>>> = {
  lookup_patient_info: async (_args, ctx) => lookupPatientInfo(ctx.clinicId, ctx.patientId),
  lookup_medical_history: async (_args, ctx) => lookupMedicalHistory(ctx.clinicId, ctx.patientId),
  get_available_slots: async (args, ctx) => getAvailableSlots(ctx.clinicId, args.doctorId, args.date),
  book_appointment: async (args, ctx) => bookAppointment(ctx.clinicId, ctx.patientId, args.doctorId, args.serviceId, args.datetimeStr),
  cancel_appointment: async (args, ctx) => cancelAppointment(ctx.clinicId, ctx.patientId, args.appointmentId),
}

function parseToolCall(text: string): { tool: string; args: any } | null {
  const lines = text.split('\n')
  for (const line of lines) {
    const trimmed = line.trim()
    if (trimmed.startsWith(TOOL_PREFIX)) {
      const jsonStr = trimmed.slice(TOOL_PREFIX.length).trim()
      try {
        const parsed = JSON.parse(jsonStr)
        if (parsed && typeof parsed.tool === 'string') {
          return { tool: parsed.tool, args: parsed.args || {} }
        }
      } catch {
        return null
      }
    }
  }
  return null
}

export async function handleAIMessage(clinicId: string, from: string, messageBody: string) {
  const supabase = createAdminClient()

  // 1. Lookup Patient
  const { data: patient } = await supabase
    .from('patients')
    .select('id, full_name')
    .eq('clinic_id', clinicId)
    .or(phoneOrFilter(from))
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

  const state: ConversationState = (stateData?.state || { messages: [] }) as ConversationState

  // If no history, build and cache the system prompt
  if (!state.systemPrompt || state.messages.length === 0) {
    state.systemPrompt = await buildSystemPrompt(clinicId, patient.full_name, from)
    state.messages = []
  }

  // 3. Add the incoming user message
  state.messages.push({ role: 'user', content: messageBody.trim() })

  let finalReply: string | null = null

  try {
    // 4. Run the conversation loop with tool calls
    for (let round = 0; round <= MAX_TOOL_ROUNDS; round++) {
      const messages: GeminiMessage[] = state.messages.map(m => ({
        role: m.role === 'assistant' ? 'assistant' : 'user',
        content: m.content,
      }))

      const reply = await generateContent({
        systemPrompt: state.systemPrompt,
        messages,
        allowWait: true,
      })

      const toolCall = parseToolCall(reply)

      if (toolCall && toolCall.tool in TOOL_FUNCTIONS) {
        let result: Record<string, unknown>
        try {
          result = await TOOL_FUNCTIONS[toolCall.tool](toolCall.args, { clinicId, patientId: patient.id })
        } catch (e: unknown) {
          result = { error: e instanceof Error ? e.message : 'Unknown error' }
        }

        state.messages.push({ role: 'assistant', content: reply })
        state.messages.push({
          role: 'user',
          content: `[Tool result for ${toolCall.tool}]: ${JSON.stringify(result)}`,
        })
        continue
      }

      // No tool call - this is the final reply
      finalReply = reply
      state.messages.push({ role: 'assistant', content: reply })
      break
    }
  } catch (err) {
    console.error('Gemini Error:', err)
    state.lastError = err instanceof Error ? err.message : String(err)
    finalReply =
      "Sorry, I'm having trouble thinking right now. Please try again later or call the clinic."
  }

  // 5. Send the final response to WhatsApp
  if (finalReply) {
    await sendMessage(clinicId, from, finalReply)
  }

  // Keep only the last 24 messages to avoid context bloat
  if (state.messages.length > 24) {
    state.messages = state.messages.slice(state.messages.length - 24)
  }

  // 6. Save State
  await supabase.from('whatsapp_conversation_states').upsert({
    clinic_id: clinicId,
    phone_number: from,
    state,
    updated_at: new Date().toISOString()
  }, { onConflict: 'clinic_id, phone_number' })
}
