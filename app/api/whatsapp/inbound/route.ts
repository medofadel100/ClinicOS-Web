import { NextResponse } from 'next/server'
import { handleIncomingMessage } from '@/lib/bot/rule-based'
import { handleAIMessage } from '@/lib/bot/ai/engine'
import { createAdminClient } from '@/lib/supabase/admin'

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
    const { clinicId, from, message, mediaBase64, _mimeType } = payload

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
    if (payload.mediaBase64 && payload.mimeType) {
      const { handleIncomingMedia } = await import('@/lib/bot/automations/media-handler')
      await handleIncomingMedia(clinicId, from, payload.mediaBase64, payload.mimeType)
      return NextResponse.json({ success: true })
    }

    if (config.mode === 'rule_based') {
      // Don't await if we want to respond 200 OK immediately and process in background,
      // but for Vercel serverless we generally must await otherwise the function exits.
      await handleIncomingMessage(clinicId, from, message)
    } else if (config.mode === 'ai') {
      await handleAIMessage(clinicId, from, message)
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Webhook error:', err)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
