import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { checkEntitlements } from '@/lib/entitlements'
import { PageHeader } from '@/components/layout/PageComponents'
import { MessageCircle } from 'lucide-react'
import ConnectionManager from './ConnectionManager'
import BotModeSettings from './BotModeSettings'
import RuleBasedSettings from './RuleBasedSettings'
import AutomationsSettings from './AutomationsSettings'

export default async function WhatsAppSettingsPage({
  params: { locale, clinicId }
}: {
  params: { locale: string; clinicId: string }
}) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/${locale}/login`)

  const entitlements = await checkEntitlements(clinicId)
  const hasAIBot = entitlements.features.includes('whatsapp_ai')

  const { data: config } = await supabase
    .from('whatsapp_bot_config')
    .select('*')
    .eq('clinic_id', clinicId)
    .single()

  const { data: options } = await supabase
    .from('whatsapp_menu_options')
    .select('*')
    .eq('clinic_id', clinicId)
    .order('option_number', { ascending: true })

  const { data: automations } = await supabase
    .from('whatsapp_automation_settings')
    .select('*')
    .eq('clinic_id', clinicId)
    .single()

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      <PageHeader
        title="WhatsApp Bot"
        description="Manage your clinic's WhatsApp automated assistant and messaging rules."
        icon={MessageCircle}
        iconColor="text-emerald-400"
        iconBg="rgba(52,211,153,0.12)"
      />

      <ConnectionManager
        clinicId={clinicId}
        locale={locale}
        initialIsConnected={config?.is_connected || false}
        initialPhone={config?.connected_phone_number || null}
      />

      <BotModeSettings
        clinicId={clinicId}
        locale={locale}
        hasAIBot={hasAIBot}
        initialMode={config?.mode || 'none'}
      />

      {config?.mode === 'rule_based' && (
        <RuleBasedSettings
          clinicId={clinicId}
          locale={locale}
          options={options || []}
        />
      )}

      <AutomationsSettings
        clinicId={clinicId}
        locale={locale}
        initialSettings={automations}
      />
    </div>
  )
}
