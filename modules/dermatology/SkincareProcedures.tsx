'use client'

import { useState } from 'react'
import { Plus, Sparkles, CheckCircle2, Clock, XCircle, Trash2, ChevronDown, ChevronUp } from 'lucide-react'
import type { SkincareRecord } from './types'

const SKINCARE_TYPES = [
  { value: 'chemical_peel', label: 'Chemical Peel', labelAr: 'التقشير الكيميائي', icon: '🧪' },
  { value: 'hydrafacial', label: 'HydraFacial', labelAr: 'الهايدرافيشيال', icon: '💧' },
  { value: 'dermapen', label: 'Dermapen / Microneedling', labelAr: 'الديرمابن', icon: '🔬' },
  { value: 'microdermabrasion', label: 'Microdermabrasion', labelAr: 'الميكروديرمابرشن', icon: '✨' },
  { value: 'led_therapy', label: 'LED Light Therapy', labelAr: 'العلاج بالضوء', icon: '💡' },
  { value: 'oxygen_facial', label: 'Oxygen Facial', labelAr: 'أوكسجين الوجه', icon: '🌬️' },
  { value: 'other', label: 'Other', labelAr: 'أخرى', icon: '📋' },
]

const PEEL_TYPES = [
  'Glycolic Acid (AHA)', 'Salicylic Acid (BHA)', 'Lactic Acid', 'Mandelic Acid',
  'TCA (Trichloroacetic Acid)', 'Jessner\'s Solution', 'Phenol Peel',
  'Pyruvic Acid', 'Kojic Acid', 'Azelaic Acid', 'Custom'
]

const COMMON_PEEL_PRODUCTS = [
  'Obagi Blue Peel', 'The Ordinary AHA 30% + BHA 2%',
  'Mesoestetic Brightening Peel', 'Mesoestetic Age Peel',
  'PCA Skin Sensi Peel', 'Revision Skincare Brightening Complex',
  'ZO Skin Health 3-Step Peel', 'NeoStrata ProSystem'
]

const AREAS = [
  'Full Face', 'Forehead', 'Cheeks', 'Nose', 'Chin', 'Jawline',
  'Neck', 'Décolletage', 'Hands', 'Back', 'Acne Scars', 'Other'
]

interface Props {
  records: SkincareRecord[]
  onUpdate: (records: SkincareRecord[]) => void
  isAr: boolean
  loading: boolean
}

export default function SkincareProcedures({ records, onUpdate, isAr, loading }: Props) {
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [form, setForm] = useState<Partial<SkincareRecord>>({
    type: 'chemical_peel',
    status: 'scheduled',
    depth: 'superficial',
  })

  const resetForm = () => {
    setForm({ type: 'chemical_peel', status: 'scheduled', depth: 'superficial' })
    setEditingId(null)
    setShowForm(false)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    const id = editingId || crypto.randomUUID()
    const record: SkincareRecord = {
      id,
      type: form.type || 'chemical_peel',
      product_name: form.product_name,
      concentration: form.concentration,
      treatment_area: form.treatment_area || 'Full Face',
      session_date: form.session_date || new Date().toISOString().split('T')[0],
      session_number: form.session_number,
      total_sessions: form.total_sessions,
      depth: form.depth,
      passes: form.passes,
      needle_depth_mm: form.needle_depth_mm,
      downtime_days: form.downtime_days || 0,
      pre_care: form.pre_care,
      post_care: form.post_care,
      notes: form.notes,
      status: form.status || 'scheduled',
    }

    let updated: SkincareRecord[]
    if (editingId) {
      updated = records.map(r => r.id === id ? record : r)
    } else {
      updated = [...records, record]
    }
    onUpdate(updated)
    resetForm()
  }

  const handleDelete = async (id: string) => {
    const updated = records.filter(r => r.id !== id)
    onUpdate(updated)
  }

  const ti = (type: string) => SKINCARE_TYPES.find(t => t.value === type) || SKINCARE_TYPES[6]
  const counts = {
    completed: records.filter(r => r.status === 'completed').length,
    scheduled: records.filter(r => r.status === 'scheduled').length,
    total: records.length,
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: isAr ? 'منجز' : 'Completed', value: counts.completed, color: 'text-emerald-400' },
          { label: isAr ? 'مجدول' : 'Scheduled', value: counts.scheduled, color: 'text-blue-400' },
          { label: isAr ? 'إجمالي' : 'Total', value: counts.total, color: 'text-slate-200' },
        ].map(s => (
          <div key={s.label} className="bg-white/5 rounded-xl p-3 text-center border border-white/5">
            <div className={`text-xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-[11px] text-slate-500 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      <button onClick={() => { resetForm(); setShowForm(true) }}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 transition-all text-sm font-medium">
        <Plus className="w-4 h-4" />
        {isAr ? 'إضافة جلسة بشرة' : 'Add Skincare Session'}
      </button>

      {showForm && (
        <form onSubmit={handleSave} className="bg-white/5 rounded-2xl border border-white/10 p-5 space-y-4">
          <h4 className="text-sm font-semibold text-slate-200">
            {editingId ? (isAr ? 'تعديل' : 'Edit') : (isAr ? 'جلسة جديدة' : 'New Session')}
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="text-[11px] text-slate-500 uppercase tracking-wider">{isAr ? 'النوع' : 'Type'}</label>
              <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value as SkincareRecord['type'] })}
                className="w-full h-10 px-3 mt-1 rounded-lg text-sm bg-black/30 border border-white/10 text-white focus:outline-none focus:border-amber-500/50">
                {SKINCARE_TYPES.map(t => <option key={t.value} value={t.value}>{t.icon} {isAr ? t.labelAr : t.label}</option>)}
              </select>
            </div>

            <div>
              <label className="text-[11px] text-slate-500 uppercase tracking-wider">{isAr ? 'المنتج' : 'Product'}</label>
              <input value={form.product_name || ''} onChange={e => setForm({ ...form, product_name: e.target.value })}
                placeholder={form.type === 'chemical_peel' ? 'e.g. TCA 20%' : 'Product name'}
                className="w-full h-10 px-3 mt-1 rounded-lg text-sm bg-black/30 border border-white/10 text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-500/50" />
            </div>

            {form.type === 'chemical_peel' && (
              <div>
                <label className="text-[11px] text-slate-500 uppercase tracking-wider">{isAr ? 'التركيز' : 'Concentration'}</label>
                <select value={form.concentration || ''} onChange={e => setForm({ ...form, concentration: e.target.value })}
                  className="w-full h-10 px-3 mt-1 rounded-lg text-sm bg-black/30 border border-white/10 text-white focus:outline-none focus:border-amber-500/50">
                  <option value="">--</option>
                  {PEEL_TYPES.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
            )}

            {form.type === 'chemical_peel' && (
              <div>
                <label className="text-[11px] text-slate-500 uppercase tracking-wider">{isAr ? 'العمق' : 'Depth'}</label>
                <select value={form.depth || 'superficial'} onChange={e => setForm({ ...form, depth: e.target.value as SkincareRecord['depth'] })}
                  className="w-full h-10 px-3 mt-1 rounded-lg text-sm bg-black/30 border border-white/10 text-white focus:outline-none focus:border-amber-500/50">
                  <option value="superficial">{isAr ? 'سطحي' : 'Superficial'}</option>
                  <option value="medium">{isAr ? 'متوسط' : 'Medium'}</option>
                  <option value="deep">{isAr ? 'عميق' : 'Deep'}</option>
                </select>
              </div>
            )}

            {form.type === 'dermapen' && (
              <div>
                <label className="text-[11px] text-slate-500 uppercase tracking-wider">{isAr ? 'عمق الإبرة (مم)' : 'Needle Depth (mm)'}</label>
                <input type="number" step="0.1" min="0" value={form.needle_depth_mm || ''} onChange={e => setForm({ ...form, needle_depth_mm: +e.target.value })}
                  placeholder="e.g. 1.5"
                  className="w-full h-10 px-3 mt-1 rounded-lg text-sm bg-black/30 border border-white/10 text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-500/50" />
              </div>
            )}

            <div>
              <label className="text-[11px] text-slate-500 uppercase tracking-wider">{isAr ? 'المنطقة' : 'Area'}</label>
              <select value={form.treatment_area} onChange={e => setForm({ ...form, treatment_area: e.target.value })}
                className="w-full h-10 px-3 mt-1 rounded-lg text-sm bg-black/30 border border-white/10 text-white focus:outline-none focus:border-amber-500/50">
                {AREAS.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>

            <div>
              <label className="text-[11px] text-slate-500 uppercase tracking-wider">{isAr ? 'رقم الجلسة / الإجمالي' : 'Session # / Total'}</label>
              <div className="flex gap-2 mt-1">
                <input type="number" min="1" value={form.session_number || ''} onChange={e => setForm({ ...form, session_number: +e.target.value })}
                  className="w-1/2 h-10 px-3 rounded-lg text-sm bg-black/30 border border-white/10 text-white focus:outline-none focus:border-amber-500/50" />
                <input type="number" min="1" value={form.total_sessions || ''} onChange={e => setForm({ ...form, total_sessions: +e.target.value })}
                  className="w-1/2 h-10 px-3 rounded-lg text-sm bg-black/30 border border-white/10 text-white focus:outline-none focus:border-amber-500/50" />
              </div>
            </div>

            <div>
              <label className="text-[11px] text-slate-500 uppercase tracking-wider">{isAr ? 'عدد المرورات' : 'Passes'}</label>
              <input type="number" min="1" value={form.passes || ''} onChange={e => setForm({ ...form, passes: +e.target.value })}
                className="w-full h-10 px-3 mt-1 rounded-lg text-sm bg-black/30 border border-white/10 text-white focus:outline-none focus:border-amber-500/50" />
            </div>

            <div>
              <label className="text-[11px] text-slate-500 uppercase tracking-wider">{isAr ? 'أيام النقاهة' : 'Downtime (days)'}</label>
              <input type="number" min="0" value={form.downtime_days || 0} onChange={e => setForm({ ...form, downtime_days: +e.target.value })}
                className="w-full h-10 px-3 mt-1 rounded-lg text-sm bg-black/30 border border-white/10 text-white focus:outline-none focus:border-amber-500/50" />
            </div>

            <div>
              <label className="text-[11px] text-slate-500 uppercase tracking-wider">{isAr ? 'التاريخ' : 'Date'}</label>
              <input type="date" value={form.session_date || ''} onChange={e => setForm({ ...form, session_date: e.target.value })}
                className="w-full h-10 px-3 mt-1 rounded-lg text-sm bg-black/30 border border-white/10 text-white focus:outline-none focus:border-amber-500/50" />
            </div>

            <div>
              <label className="text-[11px] text-slate-500 uppercase tracking-wider">{isAr ? 'الحالة' : 'Status'}</label>
              <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value as SkincareRecord['status'] })}
                className="w-full h-10 px-3 mt-1 rounded-lg text-sm bg-black/30 border border-white/10 text-white focus:outline-none focus:border-amber-500/50">
                <option value="scheduled">{isAr ? 'مجدول' : 'Scheduled'}</option>
                <option value="completed">{isAr ? 'منجز' : 'Completed'}</option>
                <option value="cancelled">{isAr ? 'ملغي' : 'Cancelled'}</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-[11px] text-slate-500 uppercase tracking-wider">{isAr ? 'العناية قبل' : 'Pre-Care'}</label>
              <textarea value={form.pre_care || ''} onChange={e => setForm({ ...form, pre_care: e.target.value })}
                rows={2} className="w-full p-3 mt-1 rounded-lg text-sm bg-black/30 border border-white/10 text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-500/50 resize-none" />
            </div>
            <div>
              <label className="text-[11px] text-slate-500 uppercase tracking-wider">{isAr ? 'العناية بعد' : 'Post-Care'}</label>
              <textarea value={form.post_care || ''} onChange={e => setForm({ ...form, post_care: e.target.value })}
                rows={2} className="w-full p-3 mt-1 rounded-lg text-sm bg-black/30 border border-white/10 text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-500/50 resize-none" />
            </div>
            <div>
              <label className="text-[11px] text-slate-500 uppercase tracking-wider">{isAr ? 'ملاحظات' : 'Notes'}</label>
              <textarea value={form.notes || ''} onChange={e => setForm({ ...form, notes: e.target.value })}
                rows={2} className="w-full p-3 mt-1 rounded-lg text-sm bg-black/30 border border-white/10 text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-500/50 resize-none" />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={resetForm} className="px-4 py-2 rounded-lg text-sm text-slate-400 hover:text-white border border-white/10 hover:bg-white/5 transition-all">
              {isAr ? 'إلغاء' : 'Cancel'}
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 h-10 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-sm font-medium transition-all disabled:opacity-50">
              {loading ? (isAr ? 'جاري الحفظ...' : 'Saving...') : (editingId ? (isAr ? 'تحديث' : 'Update') : (isAr ? 'حفظ' : 'Save'))}
            </button>
          </div>
        </form>
      )}

      <div className="space-y-2">
        {records.length === 0 && !showForm && (
          <div className="text-center py-12 text-slate-500">
            <Sparkles className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p className="text-sm">{isAr ? 'لا توجد جلسات بشرة مسجلة' : 'No skincare sessions recorded yet'}</p>
          </div>
        )}

        {records.sort((a, b) => new Date(b.session_date).getTime() - new Date(a.session_date).getTime()).map(r => {
          const t = ti(r.type)
          const isExpanded = expandedId === r.id
          const statusIcon = r.status === 'completed' ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> :
            r.status === 'scheduled' ? <Clock className="w-4 h-4 text-blue-400" /> :
            <XCircle className="w-4 h-4 text-red-400" />

          return (
            <div key={r.id} className="bg-white/5 rounded-xl border border-white/5 overflow-hidden">
              <div className="flex items-center gap-3 p-3 cursor-pointer hover:bg-white/[0.03] transition-colors"
                onClick={() => setExpandedId(isExpanded ? null : r.id)}>
                {statusIcon}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-lg">{t.icon}</span>
                    <span className="text-sm font-medium text-slate-200">{isAr ? t.labelAr : t.label}</span>
                    {r.session_number && <span className="text-xs text-amber-400">#{r.session_number}/{r.total_sessions}</span>}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    {r.treatment_area} &middot; {new Date(r.session_date).toLocaleDateString()}
                    {r.product_name && ` · ${r.product_name}`}
                  </div>
                </div>
                <button onClick={(e) => { e.stopPropagation(); setForm(r); setEditingId(r.id); setShowForm(true) }}
                  className="text-[11px] text-slate-500 hover:text-amber-400 px-2 py-1 rounded transition-colors">
                  {isAr ? 'تعديل' : 'Edit'}
                </button>
                {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
              </div>

              {isExpanded && (
                <div className="px-3 pb-3 pt-1 border-t border-white/5 space-y-2 text-xs">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {r.concentration && <div><span className="text-slate-500">{isAr ? 'التركيز:' : 'Conc:'}</span> <span className="text-slate-300">{r.concentration}</span></div>}
                    {r.depth && <div><span className="text-slate-500">{isAr ? 'العمق:' : 'Depth:'}</span> <span className="text-slate-300">{r.depth}</span></div>}
                    {r.needle_depth_mm && <div><span className="text-slate-500">{isAr ? 'عمق الإبرة:' : 'Needle:'}</span> <span className="text-slate-300">{r.needle_depth_mm}mm</span></div>}
                    {r.passes && <div><span className="text-slate-500">{isAr ? 'المرورات:' : 'Passes:'}</span> <span className="text-slate-300">{r.passes}</span></div>}
                    {r.downtime_days !== undefined && r.downtime_days > 0 && <div><span className="text-amber-500 font-medium">{isAr ? 'النقاهة:' : 'Downtime:'}</span> <span className="text-amber-400">{r.downtime_days} {isAr ? 'يوم' : 'days'}</span></div>}
                  </div>
                  {r.pre_care && <div><span className="text-slate-500">{isAr ? 'قبل:' : 'Pre:'}</span> <span className="text-slate-300">{r.pre_care}</span></div>}
                  {r.post_care && <div><span className="text-slate-500">{isAr ? 'بعد:' : 'Post:'}</span> <span className="text-slate-300">{r.post_care}</span></div>}
                  {r.notes && <div><span className="text-slate-500">{isAr ? 'ملاحظات:' : 'Notes:'}</span> <span className="text-slate-300">{r.notes}</span></div>}
                  <div className="pt-2 flex justify-end">
                    <button onClick={() => handleDelete(r.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-red-400 hover:bg-red-500/10 border border-red-500/20 transition-all">
                      <Trash2 className="w-3 h-3" /> {isAr ? 'حذف' : 'Delete'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
