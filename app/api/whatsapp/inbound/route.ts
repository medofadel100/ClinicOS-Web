import { NextResponse } from 'next/server'
import { handleIncomingMessage } from '@/lib/bot/rule-based'
import { handleAIMessage } from '@/lib/bot/ai/engine'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

export async function POST(req: Request) {
  try {
    // Validate shared webhook secret (must match WHATSAPP_WEBHOOK_SECRET)
    const secret = process.env.WHATSAPP_WEBHOOK_SECRET
    const authHeader = req.headers.get('authorization')
    const xWebhookSecret = req.headers.get('x-webhook-secret')
    if (
      !secret ||
      (authHeader !== `Bearer ${secret}` && xWebhookSecret !== secret)
    ) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await req.json()
    const { clinicId, from, message, mediaBase64 } = payload

    if (!clinicId || !from) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (!message && !mediaBase64) {
      return NextResponse.json({ error: 'Missing message or media' }, { status: 400 })
    }

    // Check clinic config to see if bot is active
    const supabase = createAdminClient()
    const { data: config } = await supabase
      .from('whatsapp_bot_config')
      .select('mode')
      .eq('clinic_id', clinicId)
      .single()

    if (!config || config.mode === 'none') {
      // Bot is disabled, ignore message
      return NextResponse.json({ success: true, ignored: true })
    }

    // Handle Media Messages
    const mimeType = payload.mimeType || payload._mimeType
    if (payload.mediaBase64 && mimeType) {
      const { handleIncomingMedia } = await import('@/lib/bot/automations/media-handler')
      await handleIncomingMedia(clinicId, from, payload.mediaBase64, mimeType, supabase)
      return NextResponse.json({ success: true })
    }

    if (config.mode === 'rule_based') {
      // Don't await if we want to respond 200 OK immediately and process in background,
      // but for Vercel serverless we generally must await otherwise the function exits.
      await handleIncomingMessage(clinicId, from, message)
    } else if (config.mode === 'ai') {
      // Queue the message (audit + fallback) then process it inline so the reply
      // arrives in seconds instead of waiting for the next cron tick.
      const { data: row } = await supabase
        .from('ai_reply_queue')
        .insert({
          clinic_id: clinicId,
          phone_number: from,
          message_body: message || null,
          status: 'pending'
        })
        .select('id')
        .single()

      const queueId = row?.id
      try {
        await handleAIMessage(clinicId, from, message || '')
        if (queueId) {
          await supabase
            .from('ai_reply_queue')
            .update({ status: 'done', processed_at: new Date().toISOString() })
            .eq('id', queueId)
        }
      } catch (err) {
        console.error('AI inline reply failed:', err)
        if (queueId) {
          await supabase
            .from('ai_reply_queue')
            .update({
              status: 'failed',
              error: err instanceof Error ? err.message.slice(0, 500) : 'Unknown error',
              processed_at: new Date().toISOString(),
            })
            .eq('id', queueId)
        }
      }
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Webhook error:', err)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
