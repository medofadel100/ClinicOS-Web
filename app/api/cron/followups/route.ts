import { NextResponse } from 'next/server'
import { runServiceFollowups } from '@/lib/bot/automations/run-followups'

export const dynamic = 'force-dynamic'
export const maxDuration = 300

/**
 * Service follow-up reminders cron.
 * Can also be invoked from /api/cron/automations, so one hourly cron covers both.
 */
export async function GET(req: Request) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 })
  }

  try {
    const result = await runServiceFollowups()
    return NextResponse.json({ success: true, ...result })
  } catch (error) {
    console.error('Follow-ups cron error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
