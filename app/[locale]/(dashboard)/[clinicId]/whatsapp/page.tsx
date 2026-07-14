import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { checkEntitlements } from '@/lib/entitlements'
import LockedFeature from '@/components/LockedFeature'

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

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">WhatsApp Bot Settings</h1>
        <p className="text-muted-foreground">Manage your clinic's WhatsApp automated assistant.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Rule-Based Auto-Replies</CardTitle>
          <CardDescription>Configure standard responses to common patient inquiries.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch id="rule-based" defaultChecked />
            <Label htmlFor="rule-based">Enable Rule-Based Bot</Label>
          </div>
          <p className="text-sm text-muted-foreground">
            Basic rule-based bot is included in all plans. More configuration options will be available here.
          </p>
        </CardContent>
      </Card>

      {hasAIBot ? (
        <Card>
          <CardHeader>
            <CardTitle>AI Assistant Mode</CardTitle>
            <CardDescription>Advanced conversational AI that understands medical context and books appointments naturally.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch id="ai-mode" />
              <Label htmlFor="ai-mode">Enable AI Assistant</Label>
            </div>
            <p className="text-sm text-muted-foreground">
              Configure your AI's personality, doctor bios, and booking rules here.
            </p>
          </CardContent>
        </Card>
      ) : (
        <LockedFeature clinicId={clinicId} featureCode="whatsapp_ai" featureName="AI WhatsApp Assistant">
          <Card>
            <CardHeader>
              <CardTitle>AI Assistant Mode</CardTitle>
              <CardDescription>Advanced conversational AI that understands medical context and books appointments naturally.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch id="ai-mode-locked" disabled />
                <Label htmlFor="ai-mode-locked">Enable AI Assistant</Label>
              </div>
              <p className="text-sm text-muted-foreground">
                Configure your AI's personality, doctor bios, and booking rules here.
              </p>
            </CardContent>
          </Card>
        </LockedFeature>
      )}
    </div>
  )
}
