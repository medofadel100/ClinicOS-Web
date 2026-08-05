'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { PremiumCard } from '@/components/layout/PageComponents'
import { Label } from '@/components/ui/label'
import { Loader2, Plus, Trash2, RefreshCw } from 'lucide-react'
import { addFollowupRule, deleteFollowupRule, getFollowupRules, toggleFollowupRule } from './actions'

type Rule = {
  id: string
  service_id: string
  followup_after_value: number
  followup_after_unit: 'hours' | 'days' | 'months'
  message_template: string
  is_active: boolean
  clinic_services?: { name?: string } | { name?: string }[] | null
}

const UNIT_LABELS: Record<string, { ar: string; en: string }> = {
  hours: { ar: 'ساعة', en: 'Hours' },
  days: { ar: 'يوم', en: 'Days' },
  months: { ar: 'شهر', en: 'Months' },
}

export default function ServiceFollowupRules({
  clinicId,
  locale,
  services
}: {
  clinicId: string
  locale: string
  services: { id: string; name: string }[]
}) {
  const [rules, setRules] = useState<Rule[] | null>(null)
  const [loaded, setLoaded] = useState(false)
  const [loading, setLoading] = useState(false)
  const [serviceId, setServiceId] = useState('')
  const [value, setValue] = useState('1')
  const [unit, setUnit] = useState<'hours' | 'days' | 'months'>('days')
  const [template, setTemplate] = useState('')
  const isAr = locale === 'ar'

  const loadRules = async () => {
    setLoading(true)
    try {
      const data = await getFollowupRules(clinicId)
      setRules(data)
    } catch {
      toast.error(isAr ? 'فشل تحميل القواعد' : 'Failed to load rules.')
    } finally {
      setLoading(false)
      setLoaded(true)
    }
  }

  const handleAdd = async () => {
    if (!serviceId || !value || !template.trim()) {
      toast.error(isAr ? 'املأ جميع الحقول' : 'Please fill all fields.')
      return
    }
    setLoading(true)
    try {
      await addFollowupRule(clinicId, locale, serviceId, Number(value), unit, template.trim())
      toast.success(isAr ? 'تمت إضافة القاعدة' : 'Rule added.')
      setServiceId('')
      setValue('1')
      setUnit('days')
      setTemplate('')
      await loadRules()
    } catch {
      toast.error(isAr ? 'فشل إضافة القاعدة' : 'Failed to add rule.')
    } finally {
      setLoading(false)
    }
  }

  const handleToggle = async (rule: Rule, checked: boolean) => {
    try {
      await toggleFollowupRule(clinicId, locale, rule.id, checked)
      setRules(prev => (prev || []).map(r => (r.id === rule.id ? { ...r, is_active: checked } : r)))
    } catch {
      toast.error(isAr ? 'فشل التحديث' : 'Failed to update rule.')
    }
  }

  const handleDelete = async (ruleId: string) => {
    try {
      await deleteFollowupRule(clinicId, locale, ruleId)
      setRules(prev => (prev || []).filter(r => r.id !== ruleId))
      toast.success(isAr ? 'تم حذف القاعدة' : 'Rule deleted.')
    } catch {
      toast.error(isAr ? 'فشل حذف القاعدة' : 'Failed to delete rule.')
    }
  }

  const serviceNameOf = (rule: Rule) => {
    const s = Array.isArray(rule.clinic_services) ? rule.clinic_services[0] : rule.clinic_services
    return s?.name || rule.service_id
  }

  return (
    <div className="mt-6 pb-12">
      <PremiumCard>
        <div className="mb-5 pb-4 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div>
            <h2 className="text-base font-semibold text-slate-200">{isAr ? 'متابعة الخدمات (منبهات ما بعد العلاج)' : 'Service Follow-ups'}</h2>
            <p className="text-sm text-slate-500 mt-0.5">{isAr ? 'رسائل تلقائية للمريض بعد إتمام خدمة/علاج بفترة محددة (مثال: متابعة ضرس العصب بعد 7 أيام).' : 'Automatic messages sent to a patient some time after they complete a service (e.g. follow up 7 days after a root canal).'}</p>
          </div>
          {!loaded ? (
            <button onClick={loadRules} className="flex items-center gap-2 h-9 px-3 rounded-lg text-sm text-teal-400 border border-teal-500/30 hover:bg-teal-500/10 transition-all">
              <RefreshCw className="w-4 h-4" /> {isAr ? 'تحميل' : 'Load'}
            </button>
          ) : (
            <button onClick={loadRules} className="flex items-center gap-2 h-9 px-3 rounded-lg text-sm text-slate-400 border border-white/10 hover:bg-white/5 transition-all">
              <RefreshCw className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Add rule form */}
        <div className="space-y-4 rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="space-y-1.5">
              <Label className="text-sm text-slate-400">{isAr ? 'الخدمة' : 'Service'}</Label>
              <select
                value={serviceId}
                onChange={(e) => setServiceId(e.target.value)}
                className="w-full h-9 px-3 rounded-lg text-sm bg-black/20 border border-white/10 text-white focus:outline-none focus:border-teal-500/50 transition-all"
              >
                <option value="">{isAr ? 'اختر خدمة' : 'Select service'}</option>
                {services.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm text-slate-400">{isAr ? 'بعد' : 'After'}</Label>
              <input
                type="number"
                min={1}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="w-full h-9 px-3 rounded-lg text-sm bg-black/20 border border-white/10 text-white focus:outline-none focus:border-teal-500/50 transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm text-slate-400">{isAr ? 'الوحدة' : 'Unit'}</Label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value as any)}
                className="w-full h-9 px-3 rounded-lg text-sm bg-black/20 border border-white/10 text-white focus:outline-none focus:border-teal-500/50 transition-all"
              >
                {Object.entries(UNIT_LABELS).map(([u, lbl]) => (
                  <option key={u} value={u}>{isAr ? lbl.ar : lbl.en}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm text-slate-400">{isAr ? 'الرسالة' : 'Message'}</Label>
              <input
                value={template}
                onChange={(e) => setTemplate(e.target.value)}
                placeholder={isAr ? 'مثال: أهلاً {patient_name}، اطمن عليك بعد جلسة {service_name}...' : 'e.g. Hi {patient_name}, checking in after your {service_name}...'}
                className="w-full h-9 px-3 rounded-lg text-sm bg-black/20 border border-white/10 text-white placeholder:text-slate-600 focus:outline-none focus:border-teal-500/50 transition-all"
              />
            </div>
          </div>
          <div className="flex justify-end">
            <button
              onClick={handleAdd}
              disabled={loading}
              className="flex items-center gap-2 h-9 px-4 rounded-lg text-sm font-semibold transition-all disabled:opacity-50"
              style={{ background: '#00d4aa', color: '#0a0f1e' }}
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              {isAr ? 'إضافة قاعدة' : 'Add Rule'}
            </button>
          </div>
        </div>

        {/* Rules list */}
        {loaded && (
          <div className="mt-4 space-y-2">
            {rules && rules.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-6">{isAr ? 'لا توجد قواعد بعد.' : 'No follow-up rules yet.'}</p>
            ) : (
              (rules || []).map(rule => (
                <div key={rule.id} className="flex items-center justify-between gap-3 p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-200 truncate">{serviceNameOf(rule)}</p>
                    <p className="text-xs text-slate-500 mt-0.5 truncate">{rule.message_template}</p>
                    <p className="text-xs text-teal-400/80 mt-1">
                      {isAr ? 'بعد' : 'After'} {rule.followup_after_value} {isAr ? UNIT_LABELS[rule.followup_after_unit]?.ar : UNIT_LABELS[rule.followup_after_unit]?.en}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <input
                      type="checkbox"
                      checked={rule.is_active}
                      onChange={(e) => handleToggle(rule, e.target.checked)}
                      className="w-4 h-4 accent-teal-500"
                    />
                    <button
                      onClick={() => handleDelete(rule.id)}
                      className="p-2 rounded-lg text-red-400/80 hover:bg-red-500/10 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </PremiumCard>
    </div>
  )
}
