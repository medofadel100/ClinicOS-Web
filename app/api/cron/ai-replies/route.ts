import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { handleAIMessage } from '@/lib/bot/ai/engine'

export const dynamic = 'force-dynamic'
export const maxDuration = 300

const BATCH_SIZE = Math.max(1, Number(process.env.AI_CRON_BATCH_SIZE) || 2)
const SPACING_MS = Math.max(0, Number(process.env.AI_CRON_SPACING_MS) || 20000)

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms))

/**
 * Processes queued AI bot messages (see /api/whatsapp/inbound).
 * Runs every minute via Vercel Cron. Spacing between replies is applied so
 * Gemini free-tier rate limits are never exceeded, and replies feel naturally paced.
 */
export async function GET(req: Request) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 })
  }

  const supabase = createAdminClient()

  try {
    // Claim messages that are still pending, plus rows stuck in 'processing'
    // for more than 5 minutes (a function that died mid-run).
    const staleSince = new Date(Date.now() - 5 * 60 * 1000).toISOString()
    const { data: queued, error: queueError } = await supabase
      .from('ai_reply_queue')
      .select('id, clinic_id, phone_number, message_body')
      .or(
        `status.eq.pending,and(status.eq.processing,created_at.lt.${staleSince})`
      )
      .order('created_at', { ascending: true })
      .limit(BATCH_SIZE)

    if (queueError) {
      console.error('AI replies queue select failed:', queueError)
      return NextResponse.json(
        { error: 'Queue query failed', detail: queueError.message },
        { status: 500 }
      )
    }

    if (!queued || queued.length === 0) {
      return NextResponse.json({ success: true, processed: 0 })
    }

    let processed = 0

    for (let i = 0; i < queued.length; i++) {
      const item = queued[i]

      // Space out the AI calls within this run.
      if (i > 0 && SPACING_MS > 0) await sleep(SPACING_MS)

      // Atomically claim the message so concurrent cron invocations don't double-process.
      const { data: claimed } = await supabase
        .from('ai_reply_queue')
        .update({ status: 'processing' })
        .eq('id', item.id)
        .eq('status', 'pending')
        .select('id')
        .single()

      if (!claimed) continue

      try {
        await handleAIMessage(item.clinic_id, item.phone_number, item.message_body || '')
        await supabase
          .from('ai_reply_queue')
          .update({ status: 'done', processed_at: new Date().toISOString() })
          .eq('id', item.id)
        processed++
      } catch (err) {
        console.error('AI reply failed:', err)
        await supabase
          .from('ai_reply_queue')
          .update({
            status: 'failed',
            error: err instanceof Error ? err.message.slice(0, 500) : 'Unknown error',
            processed_at: new Date().toISOString(),
          })
          .eq('id', item.id)
      }
    }

    return NextResponse.json({ success: true, processed })
  } catch (error) {
    console.error('AI replies cron error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
