'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { updateWhatsAppConfig } from './actions'
import LockedFeature from '@/components/LockedFeature'

export default function BotModeSettings({
  clinicId,
  locale,
  hasAIBot,
  initialMode
}: {
  clinicId: string
  locale: string
  hasAIBot: boolean
  initialMode: 'none' | 'rule_based' | 'ai'
}) {
  const handleModeChange = async (newMode: 'none' | 'rule_based' | 'ai') => {
    try {
      await updateWhatsAppConfig(clinicId, locale, { mode: newMode })
    } catch (err) {
      console.error(err)
      alert('Failed to update bot mode.')
    }
  }

  const isRuleBased = initialMode === 'rule_based'
  const isAI = initialMode === 'ai'

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Rule-Based Auto-Replies</CardTitle>
          <CardDescription>Configure standard responses to common patient inquiries.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch 
              id="rule-based" 
              checked={isRuleBased} 
              onCheckedChange={(checked) => handleModeChange(checked ? 'rule_based' : 'none')}
            />
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
              <Switch 
                id="ai-mode" 
                checked={isAI}
                onCheckedChange={(checked) => handleModeChange(checked ? 'ai' : 'none')}
              />
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
