import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendMessage } from '@/lib/whatsapp-client'

export async function GET(req: Request) {
  // Validate standard Vercel CRON secret if deployed
  const authHeader = req.headers.get('authorization')
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 })
  }

  const supabase = createClient() // uses service role internally

  try {
    // 1. Fetch all active clinics with any automations enabled
    const { data: configs } = await supabase
      .from('whatsapp_automation_settings')
      .select('*')
      .or('pre_appointment_reminder_enabled.eq.true,morning_summary_enabled.eq.true,no_show_followup_enabled.eq.true')

    if (!configs) return NextResponse.json({ success: true, processed: 0 })

    const now = new Date()

    for (const config of configs) {
      // A. Pre-Appointment Reminders
      if (config.pre_appointment_reminder_enabled && config.pre_appointment_reminder_minutes_before) {
        const threshold = new Date(now.getTime() + config.pre_appointment_reminder_minutes_before * 60000)
        // Find appointments roughly around the threshold
        const windowEnd = new Date(threshold.getTime() + 15 * 60000) // 15 min window

        const { data: apps } = await supabase
          .from('appointments')
          .select('id, scheduled_at, patients(phone, full_name)')
          .eq('clinic_id', config.clinic_id)
          .eq('status', 'scheduled')
          .gte('scheduled_at', threshold.toISOString())
          .lt('scheduled_at', windowEnd.toISOString())
        
        for (const app of apps || []) {
          if (app.patients?.phone) {
            await sendMessage(
              config.clinic_id, 
              app.patients.phone, 
              `Friendly reminder: You have an appointment at ${new Date(app.scheduled_at).toLocaleTimeString()}. See you soon!`
            )
          }
        }
      }

      // B. Morning Summaries
      if (config.morning_summary_enabled && config.morning_summary_time) {
        // Parse time
        const [hr, min] = config.morning_summary_time.split(':').map(Number)
        // Check if current hour matches (assuming cron runs hourly)
        if (now.getHours() === hr) {
          // Find all active doctors
          const { data: doctors } = await supabase
            .from('clinic_staff_memberships')
            .select('id, staff_members(phone, full_name)')
            .eq('clinic_id', config.clinic_id)
            .eq('role', 'doctor')
            .eq('is_active', true)

          for (const doc of doctors || []) {
            const docPhone = (doc.staff_members as any)?.phone
            if (!docPhone) continue

            // Count today's appointments
            const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
            const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).toISOString()
            
            const { count } = await supabase
              .from('appointments')
              .select('*', { count: 'exact', head: true })
              .eq('clinic_id', config.clinic_id)
              .eq('membership_id', doc.id)
              .gte('scheduled_at', startOfDay)
              .lt('scheduled_at', endOfDay)
              .in('status', ['scheduled', 'confirmed'])

            await sendMessage(
              config.clinic_id,
              docPhone,
              `Good morning Dr. ${(doc.staff_members as any)?.full_name}! You have ${count || 0} appointments scheduled for today.`
            )
          }
        }
      }

      // C. No-show Follow-ups (Simplified: scan recent no-shows from the last hour)
      if (config.no_show_followup_enabled) {
        const anHourAgo = new Date(now.getTime() - 60 * 60000).toISOString()
        const { data: apps } = await supabase
          .from('appointments')
          .select('id, patients(phone, full_name)')
          .eq('clinic_id', config.clinic_id)
          .eq('status', 'no_show')
          .gte('scheduled_at', anHourAgo)

        for (const app of apps || []) {
          if (app.patients?.phone) {
            await sendMessage(
              config.clinic_id, 
              app.patients.phone, 
              `We missed you at your appointment today! Please reply to this message to reschedule.`
            )
          }
        }
      }
    }

    return NextResponse.json({ success: true, processed: configs.length })
  } catch (error) {
    console.error('Cron error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
