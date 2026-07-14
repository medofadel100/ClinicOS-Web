import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendMessage } from '@/lib/whatsapp-client'

export async function GET(req: Request) {
  // Validate standard Vercel CRON secret if deployed
  const authHeader = req.headers.get('authorization')
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 })
  }

  const supabase = createClient()

  try {
    // 1. Fetch campaigns that are currently processing
    const { data: campaigns } = await supabase
      .from('whatsapp_campaigns')
      .select('id, clinic_id, message_template')
      .eq('status', 'processing')

    if (!campaigns || campaigns.length === 0) {
      return NextResponse.json({ success: true, processed: 0 })
    }

    let totalProcessed = 0

    // Process campaigns
    for (const campaign of campaigns) {
      // Fetch up to 50 pending recipients per run to avoid rate limits
      const { data: recipients } = await supabase
        .from('whatsapp_campaign_recipients')
        .select('id, patient_id, patients(phone)')
        .eq('campaign_id', campaign.id)
        .eq('status', 'pending')
        .limit(50)

      if (!recipients || recipients.length === 0) {
        // If no pending recipients left, mark campaign as completed
        await supabase
          .from('whatsapp_campaigns')
          .update({ status: 'completed' })
          .eq('id', campaign.id)
        continue
      }

      for (const recipient of recipients) {
        const phone = recipient.patients?.phone
        
        if (!phone) {
          await supabase
            .from('whatsapp_campaign_recipients')
            .update({ status: 'failed', error_message: 'No phone number' })
            .eq('id', recipient.id)
          continue
        }

        try {
          // Send message
          const fullMessage = `${campaign.message_template}\n\n_Reply STOP to unsubscribe from offers._`
          await sendMessage(campaign.clinic_id, phone, fullMessage)
          
          await supabase
            .from('whatsapp_campaign_recipients')
            .update({ status: 'sent', sent_at: new Date().toISOString() })
            .eq('id', recipient.id)
            
          totalProcessed++
        } catch (err: any) {
          await supabase
            .from('whatsapp_campaign_recipients')
            .update({ status: 'failed', error_message: err.message || 'Unknown error' })
            .eq('id', recipient.id)
        }
      }
    }

    return NextResponse.json({ success: true, processed: totalProcessed })
  } catch (error) {
    console.error('Marketing Cron error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
