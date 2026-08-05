'use client'

import { useState } from 'react'
import { PremiumCard } from '@/components/layout/PageComponents'
import { updateToothCondition, updateToothNotes } from './actions'
import { Clock, StickyNote, X, Save, History } from 'lucide-react'

type ToothCondition = 'normal' | 'cavity' | 'extracted' | 'root_canal' | 'crown' | 'implant'

type DentalChartEntry = {
  tooth_number: number
  condition: ToothCondition
  notes?: string | null
  updated_at?: string
}

type DentalHistoryEntry = {
  id: string
  tooth_number: number
  condition: ToothCondition
  notes?: string | null
  created_at: string
  staff_members?: { full_name: string | null } | null
}

const PALMER: Record<number, string> = { 1: '┘', 2: '└', 3: '┌', 4: '┐' }

function fdiToPalmer(n: number): string {
  const q = Math.floor(n / 10)
  const pos = n % 10
  const sym = PALMER[q] || '?'
  return q === 2 || q === 3 ? `${sym}${pos}` : `${pos}${sym}`
}

const POSITIONS: Record<number, { en: string; ar: string }> = {
  1: { en: 'Central Incisor', ar: 'قاطعة مركزية' },
  2: { en: 'Lateral Incisor', ar: 'قاطعة جانبية' },
  3: { en: 'Canine', ar: 'ناب' },
  4: { en: 'First Premolar', ar: 'ضاحك أول' },
  5: { en: 'Second Premolar', ar: 'ضاحك ثاني' },
  6: { en: 'First Molar', ar: 'رحى أولى' },
  7: { en: 'Second Molar', ar: 'رحى ثانية' },
  8: { en: 'Third Molar (Wisdom)', ar: 'ضرس العقل' },
}

const QUADRANTS: Record<number, { en: string; ar: string }> = {
  1: { en: 'Upper Right', ar: 'الفك العلوي يمين' },
  2: { en: 'Upper Left', ar: 'الفك العلوي يسار' },
  3: { en: 'Lower Left', ar: 'الفك السفلي يسار' },
  4: { en: 'Lower Right', ar: 'الفك السفلي يمين' },
}

const CONDITIONS: Record<ToothCondition, { en: string; ar: string }> = {
  normal: { en: 'Normal', ar: 'عادي' },
  cavity: { en: 'Cavity', ar: 'تسوس' },
  extracted: { en: 'Extracted', ar: 'خلع' },
  root_canal: { en: 'Root Canal', ar: 'عصب' },
  crown: { en: 'Crown', ar: 'تاج' },
  implant: { en: 'Implant', ar: 'زراعة' },
}

export default function DentalChart({
  clinicId,
  locale,
  patientId,
  initialEntries,
  initialHistory
}: {
  clinicId: string
  locale: string
  patientId: string
  initialEntries: DentalChartEntry[]
  initialHistory: DentalHistoryEntry[]
}) {
  const [entries, setEntries] = useState<Record<number, DentalChartEntry>>(() => {
    const map: Record<number, DentalChartEntry> = {}
    initialEntries.forEach(e => { map[e.tooth_number] = e })
    return map
  })
  const [selectedTooth, setSelectedTooth] = useState<number | null>(null)
  const [conditionDraft, setConditionDraft] = useState<ToothCondition>('normal')
  const [notesDraft, setNotesDraft] = useState('')
  const [saving, setSaving] = useState(false)
  const isAr = locale === 'ar'

  const quadrants = {
    topRight: [18, 17, 16, 15, 14, 13, 12, 11],
    topLeft: [21, 22, 23, 24, 25, 26, 27, 28],
    bottomRight: [48, 47, 46, 45, 44, 43, 42, 41],
    bottomLeft: [31, 32, 33, 34, 35, 36, 37, 38]
  }

  const historyByTooth = initialHistory.reduce<Record<number, DentalHistoryEntry[]>>((acc, h) => {
    if (!acc[h.tooth_number]) acc[h.tooth_number] = []
    acc[h.tooth_number].push(h)
    return acc
  }, {})
  const sortedHistory = (tooth: number) => (historyByTooth[tooth] || []).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  const openTooth = (toothNumber: number) => {
    const entry = entries[toothNumber]
    setSelectedTooth(toothNumber)
    setConditionDraft(entry?.condition || 'normal')
    setNotesDraft(entry?.notes || '')
  }

  const handleConditionQuickChange = async (toothNumber: number, newCondition: ToothCondition) => {
    const currentNotes = entries[toothNumber]?.notes || ''
    setEntries(prev => ({
      ...prev,
      [toothNumber]: { ...prev[toothNumber], tooth_number: toothNumber, condition: newCondition, updated_at: new Date().toISOString() }
    }))
    try {
      await updateToothCondition(clinicId, locale, patientId, toothNumber, newCondition, currentNotes)
    } catch (err) {
      console.error(err)
    }
  }

  const handleSaveTooth = async () => {
    if (selectedTooth === null) return
    setSaving(true)
    try {
      await updateToothCondition(clinicId, locale, patientId, selectedTooth, conditionDraft, notesDraft)
      setEntries(prev => ({
        ...prev,
        [selectedTooth]: { ...prev[selectedTooth], tooth_number: selectedTooth, condition: conditionDraft, notes: notesDraft, updated_at: new Date().toISOString() }
      }))
      setSelectedTooth(null)
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  const getConditionColor = (condition?: ToothCondition) => {
    switch(condition) {
      case 'cavity': return 'bg-red-500/20 text-red-400 border-red-500/50'
      case 'extracted': return 'bg-slate-800/50 text-slate-500 border-slate-700 line-through'
      case 'root_canal': return 'bg-purple-500/20 text-purple-400 border-purple-500/50'
      case 'crown': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50'
      case 'implant': return 'bg-blue-500/20 text-blue-400 border-blue-500/50'
      default: return 'bg-white/5 text-slate-300 border-white/10'
    }
  }

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return ''
    const d = new Date(dateStr)
    return d.toLocaleDateString(isAr ? 'ar-EG' : 'en-US', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  const renderTooth = (toothNumber: number) => {
    const entry = entries[toothNumber]
    const condition = entry?.condition || 'normal'
    const colorClass = getConditionColor(condition)
    const hasNotes = !!entry?.notes?.trim()
    const historyCount = (historyByTooth[toothNumber] || []).length

    return (
      <div key={toothNumber} className="flex flex-col items-center gap-1.5 relative group">
        <button
          type="button"
          onClick={() => openTooth(toothNumber)}
          className={`relative w-11 h-13 flex items-center justify-center font-bold rounded-t-xl border-2 transition-all hover:scale-105 cursor-pointer ${colorClass}`}
          style={{ minHeight: '3.25rem' }}
        >
          {fdiToPalmer(toothNumber)}
          {hasNotes && (
            <span className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 rounded-full flex items-center justify-center" style={{ background: '#00d4aa', color: '#0a0f1e' }}>
              <StickyNote className="w-2.5 h-2.5" />
            </span>
          )}
        </button>
        <select 
          value={condition} 
          onChange={(e) => handleConditionQuickChange(toothNumber, e.target.value as ToothCondition)}
          className="text-[10px] sm:text-xs max-w-full w-[60px] sm:w-20 border rounded p-1 bg-black/40 text-slate-300 border-white/10 focus:outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/50 appearance-none text-center cursor-pointer"
        >
          {(Object.keys(CONDITIONS) as ToothCondition[]).map(c => (
            <option key={c} value={c}>{isAr ? CONDITIONS[c].ar : CONDITIONS[c].en}</option>
          ))}
        </select>
        {historyCount > 0 && (
          <span className="text-[10px] text-slate-500 flex items-center gap-1">
            <History className="w-3 h-3" /> {historyCount}
          </span>
        )}
      </div>
    )
  }

  const selectedEntry = selectedTooth !== null ? entries[selectedTooth] : null
  const selectedToothName = selectedTooth !== null
    ? `${POSITIONS[selectedTooth % 10]?.en} — ${QUADRANTS[Math.floor(selectedTooth / 10)]?.en}`
    : ''
  const selectedToothNameAr = selectedTooth !== null
    ? `${POSITIONS[selectedTooth % 10]?.ar} — ${QUADRANTS[Math.floor(selectedTooth / 10)]?.ar}`
    : ''

  return (
    <PremiumCard>
      <div className="mb-6 pb-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <h2 className="text-base font-semibold text-slate-200">{isAr ? 'مخطط الأسنان' : 'Dental Chart'}</h2>
        <p className="text-sm text-slate-500 mt-0.5">
          {isAr ? 'اضغط على أي سن لتسجيل حالته، النوتات، وتاريخ العلاج.' : 'Click any tooth to record its condition, notes, and treatment history.'}
        </p>
        <p className="text-xs text-slate-600 mt-1">
          {isAr ? 'نظام بالمر (Palmer) — الترقيم القياسي المستخدم في مصر.' : 'Palmer Notation System — the standard used in Egypt.'}
        </p>
      </div>
      
      <div className="flex flex-col gap-10 items-center bg-black/20 p-4 sm:p-8 rounded-xl border border-white/5 overflow-x-auto min-w-full">
        
        {/* Upper Jaw */}
        <div className="flex flex-col items-center gap-4 min-w-max">
          <div className="text-xs font-bold tracking-wider text-slate-400 uppercase">{isAr ? 'الفك العلوي' : 'Upper Jaw'}</div>
          <div className="flex gap-2 sm:gap-4 border-b-4 border-slate-700 pb-6">
            <div className="flex gap-1 sm:gap-2 border-r-4 border-slate-700 pr-2 sm:pr-4">
              {quadrants.topRight.map(renderTooth)}
            </div>
            <div className="flex gap-1 sm:gap-2 pl-2 sm:pl-4">
              {quadrants.topLeft.map(renderTooth)}
            </div>
          </div>
        </div>

        {/* Lower Jaw */}
        <div className="flex flex-col items-center gap-4 min-w-max">
          <div className="flex gap-2 sm:gap-4 pt-6">
            <div className="flex gap-1 sm:gap-2 border-r-4 border-slate-700 pr-2 sm:pr-4">
              {quadrants.bottomRight.map(renderTooth)}
            </div>
            <div className="flex gap-1 sm:gap-2 pl-2 sm:pl-4">
              {quadrants.bottomLeft.map(renderTooth)}
            </div>
          </div>
          <div className="text-xs font-bold tracking-wider text-slate-400 uppercase mt-2">{isAr ? 'الفك السفلي' : 'Lower Jaw'}</div>
        </div>

      </div>
      
      <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 mt-8 pt-6 border-t border-white/5 text-sm">
        {(Object.keys(CONDITIONS) as ToothCondition[]).map(c => (
          <div key={c} className="flex items-center gap-2 text-slate-300">
            <div className={`w-4 h-4 rounded ${getConditionColor(c).split(' ')[0]} border`}></div>
            {isAr ? CONDITIONS[c].ar : CONDITIONS[c].en}
          </div>
        ))}
      </div>

      {/* Tooth Detail Panel */}
      {selectedTooth !== null && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm" onClick={() => setSelectedTooth(null)}>
          <div
            className="w-full max-w-md h-full bg-[#0d1424] border-l border-white/10 overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 space-y-6">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <span className={`w-14 h-16 flex items-center justify-center text-lg font-bold rounded-t-xl border-2 ${getConditionColor(selectedEntry?.condition || conditionDraft)}`}>
                      {fdiToPalmer(selectedTooth)}
                    </span>
                    <div>
                      <h3 className="text-lg font-bold text-slate-200">{isAr ? selectedToothNameAr : selectedToothName}</h3>
                      <p className="text-sm text-slate-500">
                        {isAr ? 'رقم FDI: ' : 'FDI: '}{selectedTooth} · {isAr ? 'سن رقم ' : 'Tooth #'}{selectedTooth % 10} {isAr ? 'من الوسط' : 'from midline'}
                      </p>
                    </div>
                  </div>
                </div>
                <button onClick={() => setSelectedTooth(null)} className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-white/10 text-slate-400 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">{isAr ? 'الحالة' : 'Condition'}</label>
                <div className="flex flex-wrap gap-2">
                  {(Object.keys(CONDITIONS) as ToothCondition[]).map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setConditionDraft(c)}
                      className={`h-9 px-3 rounded-lg text-sm font-medium transition-all ${
                        conditionDraft === c ? 'text-teal-300 border-teal-400/50' : 'text-slate-400 border-white/10 hover:text-slate-200'
                      } ${getConditionColor(conditionDraft === c ? c : undefined)}`}
                      style={{ border: '1px solid', background: 'rgba(255,255,255,0.03)' }}
                    >
                      {isAr ? CONDITIONS[c].ar : CONDITIONS[c].en}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">{isAr ? 'النوتات / التعليقات' : 'Notes / Comments'}</label>
                <textarea
                  rows={4}
                  value={notesDraft}
                  onChange={(e) => setNotesDraft(e.target.value)}
                  placeholder={isAr ? 'مثال: حشو عصب في الجلسة الأولى، يوجد التهابات باللثة حول السن...' : 'e.g. Root canal on first visit, gum inflammation around the tooth...'}
                  className="w-full p-3 rounded-xl text-sm bg-black/20 border border-white/10 text-white placeholder:text-slate-600 focus:outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/50 transition-all resize-none"
                />
              </div>

              <button
                onClick={handleSaveTooth}
                disabled={saving}
                className="w-full flex items-center justify-center gap-2 h-11 rounded-xl text-sm font-semibold transition-all disabled:opacity-50"
                style={{ background: '#00d4aa', color: '#0a0f1e' }}
              >
                {saving ? <Clock className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {isAr ? 'حفظ الحالة والنوتات' : 'Save Condition & Notes'}
              </button>

              <div className="pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2">
                  <History className="w-4 h-4" /> {isAr ? 'تاريخ علاج السن' : 'Tooth Treatment History'}
                </h4>
                {sortedHistory(selectedTooth).length === 0 ? (
                  <p className="text-sm text-slate-600 italic">{isAr ? 'لا يوجد تاريخ علاج بعد لهذا السن.' : 'No treatment history for this tooth yet.'}</p>
                ) : (
                  <div className="space-y-3">
                    {sortedHistory(selectedTooth).map(h => (
                      <div key={h.id} className="p-3 rounded-xl bg-black/20 border border-white/5">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded ${getConditionColor(h.condition)}`}>
                            {isAr ? CONDITIONS[h.condition]?.ar : CONDITIONS[h.condition]?.en}
                          </span>
                          <span className="text-[11px] text-slate-500 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatDate(h.created_at)}
                          </span>
                        </div>
                        {h.notes && <p className="text-sm text-slate-300">{h.notes}</p>}
                        {h.staff_members?.full_name && (
                          <p className="text-[11px] text-slate-600 mt-1.5">
                            {isAr ? 'بواسطة: ' : 'By: '}{h.staff_members.full_name}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </PremiumCard>
  )
}
