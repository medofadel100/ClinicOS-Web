'use client'

import { toast } from 'sonner'
import { PremiumCard } from '@/components/layout/PageComponents'
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
    } catch {
      toast.error(isAr ? 'فشل في تحديث وضع البوت' : 'Failed to update bot mode.')
    }
  }

  const isRuleBased = initialMode === 'rule_based'
  const isAI = initialMode === 'ai'
  const isAr = locale === 'ar'

  return (
    <div className="space-y-6">
      <PremiumCard>
        <div className="mb-5 pb-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <h2 className="text-base font-semibold text-slate-200">{isAr ? 'وضع البوت' : 'Bot Mode'}</h2>
          <p className="text-sm text-slate-500 mt-0.5">{isAr ? 'اختر كيف يرد البوت على الرسائل.' : 'Choose how the bot responds to messages.'}</p>
        </div>
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch 
              id="rule-based" 
              checked={isRuleBased} 
              onCheckedChange={(checked) => handleModeChange(checked ? 'rule_based' : 'none')}
            />
            <Label htmlFor="rule-based" className="text-slate-200">{isAr ? 'قائم على القواعد' : 'Rule-Based'}</Label>
          </div>
          <p className="text-sm text-slate-500">
            {isAr ? 'الردود التلقائية للاستفسارات الشائعة.' : 'Configure automated responses for common queries.'}
          </p>
        </div>
      </PremiumCard>

      {hasAIBot ? (
        <PremiumCard>
          <div className="mb-5 pb-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <h2 className="text-base font-semibold text-slate-200">{isAr ? 'مدعوم بالذكاء الاصطناعي' : 'AI Powered'}</h2>
            <p className="text-sm text-slate-500 mt-0.5">{isAr ? 'مساعد ذكاء اصطناعي متقدم يفهم السياق الطبي ويحجز المواعيد بشكل طبيعي.' : 'Advanced conversational AI that understands medical context and books appointments naturally.'}</p>
          </div>
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch 
                id="ai-mode" 
                checked={isAI}
                onCheckedChange={(checked) => handleModeChange(checked ? 'ai' : 'none')}
              />
              <Label htmlFor="ai-mode" className="text-slate-200">{isAr ? 'تفعيل' : 'Enable'}</Label>
            </div>
            <p className="text-sm text-slate-500">
              {isAr ? 'إعداد شخصية الذكاء الاصطناعي وسير الدكتور وقواعد الحجز هنا.' : 'Configure your AI\'s personality, doctor bios, and booking rules here.'}
            </p>
          </div>
        </PremiumCard>
      ) : (
        <LockedFeature clinicId={clinicId} featureCode="whatsapp_ai" featureName="AI WhatsApp Assistant">
          <PremiumCard>
            <div className="mb-5 pb-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <h2 className="text-base font-semibold text-slate-200">{isAr ? 'مدعوم بالذكاء الاصطناعي' : 'AI Powered'}</h2>
              <p className="text-sm text-slate-500 mt-0.5">{isAr ? 'مساعد ذكاء اصطناعي متقدم يفهم السياق الطبي ويحجز المواعيد بشكل طبيعي.' : 'Advanced conversational AI that understands medical context and books appointments naturally.'}</p>
            </div>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch id="ai-mode-locked" disabled />
                <Label htmlFor="ai-mode-locked" className="text-slate-200">{isAr ? 'تفعيل' : 'Enable'}</Label>
              </div>
              <p className="text-sm text-slate-500">
                {isAr ? 'إعداد شخصية الذكاء الاصطناعي وسير الدكتور وقواعد الحجز هنا.' : 'Configure your AI\'s personality, doctor bios, and booking rules here.'}
              </p>
            </div>
          </PremiumCard>
        </LockedFeature>
      )}
    </div>
  )
}
