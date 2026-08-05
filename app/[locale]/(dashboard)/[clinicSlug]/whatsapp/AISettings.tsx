'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { PremiumCard } from '@/components/layout/PageComponents'
import { Label } from '@/components/ui/label'
import { Loader2, Save } from 'lucide-react'
import { updateAIConfig } from './actions'

const PERSONALITIES = [
  { value: 'friendly', ar: 'ودود', en: 'Friendly' },
  { value: 'formal', ar: 'رسمي', en: 'Formal' },
  { value: 'playful', ar: 'مرح', en: 'Playful' }
] as const

export default function AISettings({
  clinicId,
  locale,
  initialConfig
}: {
  clinicId: string
  locale: string
  initialConfig?: { personality: string | null; custom_instructions: string | null } | null
}) {
  const [personality, setPersonality] = useState<string>(initialConfig?.personality || 'friendly')
  const [instructions, setInstructions] = useState<string>(initialConfig?.custom_instructions || '')
  const [saving, setSaving] = useState(false)
  const isAr = locale === 'ar'

  const handleSave = async () => {
    setSaving(true)
    try {
      await updateAIConfig(clinicId, locale, { personality: personality as any, custom_instructions: instructions })
      toast.success(isAr ? 'تم حفظ إعدادات الذكاء الاصطناعي' : 'AI settings saved.')
    } catch {
      toast.error(isAr ? 'فشل في حفظ إعدادات الذكاء الاصطناعي' : 'Failed to save AI settings.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <PremiumCard>
      <div className="mb-5 pb-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <h2 className="text-base font-semibold text-slate-200">{isAr ? 'إعدادات الذكاء الاصطناعي' : 'AI Settings'}</h2>
        <p className="text-sm text-slate-500 mt-0.5">{isAr ? 'خصص شخصية المساعد والتعليمات التي يتبعها.' : 'Customize the assistant\'s personality and the instructions it follows.'}</p>
      </div>
      <div className="space-y-5">
        <div className="space-y-2">
          <Label className="text-slate-200">{isAr ? 'الشخصية' : 'Personality'}</Label>
          <div className="flex gap-3 flex-wrap">
            {PERSONALITIES.map(p => (
              <button
                key={p.value}
                type="button"
                onClick={() => setPersonality(p.value)}
                className="h-9 px-4 rounded-lg text-sm font-medium transition-all"
                style={
                  personality === p.value
                    ? { background: 'rgba(0,212,170,0.15)', color: '#00d4aa', border: '1px solid rgba(0,212,170,0.4)' }
                    : { background: 'rgba(255,255,255,0.03)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.1)' }
                }
              >
                {isAr ? p.ar : p.en}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-slate-200">{isAr ? 'تعليمات مخصصة' : 'Custom Instructions'}</Label>
          <textarea
            rows={5}
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            placeholder={isAr ? 'مثال: تحويل المرضى لفرع المعادي، ساعات العمل من 10 صباحاً حتى 9 مساءً...' : 'e.g. Direct patients to the downtown branch, working hours 10am-9pm...'}
            className="w-full p-3 rounded-xl text-sm bg-black/20 border border-white/10 text-white placeholder:text-slate-600 focus:outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/50 transition-all resize-none"
          />
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 h-10 px-5 rounded-xl text-sm font-semibold transition-all disabled:opacity-50"
            style={{ background: '#00d4aa', color: '#0a0f1e' }}
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {isAr ? 'حفظ الإعدادات' : 'Save Settings'}
          </button>
        </div>
      </div>
    </PremiumCard>
  )
}
