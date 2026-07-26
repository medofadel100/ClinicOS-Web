'use client'

import { useState } from 'react'
import { Plus, Syringe, CheckCircle2, Clock, XCircle, Trash2, ChevronDown, ChevronUp } from 'lucide-react'
import type { InjectableRecord } from './types'

const INJECTABLE_TYPES = [
  { value: 'botox', label: 'Botox', labelAr: 'البوتوكس', icon: '💉' },
  { value: 'filler', label: 'Filler', labelAr: 'الفيلر', icon: '💧' },
  { value: 'prp', label: 'PRP (Vampire Facial)', labelAr: 'بلازما الدم', icon: '🩸' },
  { value: 'mesotherapy', label: 'Mesotherapy', labelAr: 'الميزوثيرابي', icon: '🧪' },
  { value: 'biorevitalization', label: 'Biorevitalization', labelAr: 'البيوري فيتاليزيشن', icon: '✨' },
  { value: 'skin_booster', label: 'Skin Booster', labelAr: 'سكين بوستر', icon: '💎' },
  { value: 'other', label: 'Other', labelAr: 'أخرى', icon: '📋' },
]

const BOTOX_AREAS = [
  'Forehead', 'Glabella (Between Brows)', 'Crow\'s Feet', 'Bunny Lines',
  'Brow Lift', 'Lip Flip', 'Gummy Smile', 'Chin Dimple', 'Jawline (Masseter)',
  'Neck Bands (Platysma)', 'Underarms (Hyperhidrosis)', 'Hands', 'Full Face'
]

const FILLER_AREAS = [
  'Lips', 'Nasolabial Folds', 'Cheeks (Midface)', 'Under Eye (Tear Trough)',
  'Jawline', 'Chin', 'Temple', 'Nose (Non-Surgical Rhinoplasty)', 'Marionette Lines',
  'Acne Scars', 'Hands', 'Full Face Rejuvenation'
]

const COMMON_PRODUCTS = {
  botox: ['Botox (OnabotulinumtoxinA)', 'Dysport (AbobotulinumtoxinA)', 'Xeomin (IncobotulinumtoxinA)', 'Nuceiva (PrabotulinumtoxinA)'],
  filler: ['Juvederm Voluma', 'Juvederm Ultra', 'Restylane', 'Restylane Lyft', 'Belotero Balance', 'RHA Collection', 'Teoxane RHA'],
  prp: ['Standard PRP', 'A-PRP (Leukocyte-poor)', 'L-PRP (Leukocyte-rich)', 'PRF (Platelet-Rich Fibrin)'],
  mesotherapy: ['Cocktail Vitamins', 'NCTF 135HA (Filorga)', 'SkinLab', 'Revitacare', 'Custom Meso'],
  biorevitalization: ['Profhilo', 'Restylane Vital', 'Juvederm Volite', 'Neauvia Hydro Deluxe'],
  skin_booster: ['Profhilo', 'Restylane Skinboosters', 'MCCM', 'Rejuran'],
  other: ['Custom']
}

const INJECTION_DEPTHS = ['Intradermal', 'Subdermal', 'Deep Dermis', 'Supraperiosteal', 'Intramuscular', 'Subcutaneous']

interface Props {
  records: InjectableRecord[]
  onUpdate: (records: InjectableRecord[]) => void
  isAr: boolean
  loading: boolean
}

export default function Injectables({ records, onUpdate, isAr, loading }: Props) {
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [form, setForm] = useState<Partial<InjectableRecord>>({
    type: 'botox',
    status: 'scheduled',
  })

  const resetForm = () => {
    setForm({ type: 'botox', status: 'scheduled' })
    setEditingId(null)
    setShowForm(false)
  }

  const getAreas = () => {
    if (form.type === 'botox') return BOTOX_AREAS
    if (form.type === 'filler') return FILLER_AREAS
    return [...BOTOX_AREAS.slice(0, 5), 'Custom Area']
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    const id = editingId || crypto.randomUUID()
    const record: InjectableRecord = {
      id,
      type: form.type || 'botox',
      product_name: form.product_name || '',
      product_brand: form.product_brand,
      quantity_ml: form.quantity_ml,
      units: form.units,
      treatment_area: form.treatment_area || '',
      injection_sites: form.injection_sites,
      injection_depth: form.injection_depth,
      session_date: form.session_date || new Date().toISOString().split('T')[0],
      next_session_date: form.next_session_date,
      dilution: form.dilution,
      reconstitution_ratio: form.reconstitution_ratio,
      needle_gauge: form.needle_gauge,
      notes: form.notes,
      complications: form.complications,
      status: form.status || 'scheduled',
    }

    let updated: InjectableRecord[]
    if (editingId) {
      updated = records.map(r => r.id === editingId ? record : r)
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

  const startEdit = (r: InjectableRecord) => {
    setForm(r)
    setEditingId(r.id)
    setShowForm(true)
  }

  const typeInfo = (type: string) => INJECTABLE_TYPES.find(t => t.value === type) || INJECTABLE_TYPES[6]
  const counts = {
    completed: records.filter(r => r.status === 'completed').length,
    scheduled: records.filter(r => r.status === 'scheduled').length,
    total: records.length,
  }

  return (
    <div className="space-y-4">
      {/* Stats */}
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

      {/* Type Summary */}
      {records.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {INJECTABLE_TYPES.map(t => {
            const count = records.filter(r => r.type === t.value).length
            if (count === 0) return null
            return (
              <span key={t.value} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 text-xs text-slate-400 border border-white/5">
                <span>{t.icon}</span> {t.label}: <span className="text-slate-200 font-medium">{count}</span>
              </span>
            )
          })}
        </div>
      )}

      <button onClick={() => { resetForm(); setShowForm(true) }}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 hover:bg-purple-500/20 transition-all text-sm font-medium">
        <Plus className="w-4 h-4" />
        {isAr ? 'إضافة حقن' : 'Add Injectable'}
      </button>

      {/* Form */}
      {showForm && (
        <form onSubmit={handleSave} className="bg-white/5 rounded-2xl border border-white/10 p-5 space-y-4">
          <h4 className="text-sm font-semibold text-slate-200">
            {editingId ? (isAr ? 'تعديل الحقن' : 'Edit Injectable') : (isAr ? 'حقن جديد' : 'New Injectable')}
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Type */}
            <div>
              <label className="text-[11px] text-slate-500 uppercase tracking-wider">{isAr ? 'النوع' : 'Type'}</label>
              <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value as InjectableRecord['type'] })}
                className="w-full h-10 px-3 mt-1 rounded-lg text-sm bg-black/30 border border-white/10 text-white focus:outline-none focus:border-purple-500/50">
                {INJECTABLE_TYPES.map(t => <option key={t.value} value={t.value}>{t.icon} {isAr ? t.labelAr : t.label}</option>)}
              </select>
            </div>

            {/* Product */}
            <div>
              <label className="text-[11px] text-slate-500 uppercase tracking-wider">{isAr ? 'المنتج' : 'Product'}</label>
              <select value={form.product_name || ''} onChange={e => setForm({ ...form, product_name: e.target.value })}
                className="w-full h-10 px-3 mt-1 rounded-lg text-sm bg-black/30 border border-white/10 text-white focus:outline-none focus:border-purple-500/50">
                <option value="">{isAr ? '-- اختر --' : '-- Select --'}</option>
                {(COMMON_PRODUCTS[form.type as keyof typeof COMMON_PRODUCTS] || COMMON_PRODUCTS.other).map(p =>
                  <option key={p} value={p}>{p}</option>
                )}
              </select>
            </div>

            {/* Treatment Area */}
            <div>
              <label className="text-[11px] text-slate-500 uppercase tracking-wider">{isAr ? 'منطقة العلاج' : 'Area'}</label>
              <select value={form.treatment_area || ''} onChange={e => setForm({ ...form, treatment_area: e.target.value })}
                className="w-full h-10 px-3 mt-1 rounded-lg text-sm bg-black/30 border border-white/10 text-white focus:outline-none focus:border-purple-500/50">
                <option value="">{isAr ? '-- اختر --' : '-- Select --'}</option>
                {getAreas().map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>

            {/* Units (Botox) */}
            {(form.type === 'botox') && (
              <div>
                <label className="text-[11px] text-slate-500 uppercase tracking-wider">{isAr ? 'الوحدات' : 'Units'}</label>
                <input type="number" min="0" value={form.units || ''} onChange={e => setForm({ ...form, units: +e.target.value })}
                  placeholder="e.g. 20"
                  className="w-full h-10 px-3 mt-1 rounded-lg text-sm bg-black/30 border border-white/10 text-white placeholder:text-slate-600 focus:outline-none focus:border-purple-500/50" />
              </div>
            )}

            {/* Volume (Filler) */}
            {(form.type === 'filler') && (
              <div>
                <label className="text-[11px] text-slate-500 uppercase tracking-wider">{isAr ? 'الحجم (مل)' : 'Volume (ml)'}</label>
                <input type="number" step="0.1" min="0" value={form.quantity_ml || ''} onChange={e => setForm({ ...form, quantity_ml: +e.target.value })}
                  placeholder="e.g. 1.0"
                  className="w-full h-10 px-3 mt-1 rounded-lg text-sm bg-black/30 border border-white/10 text-white placeholder:text-slate-600 focus:outline-none focus:border-purple-500/50" />
              </div>
            )}

            {/* Injection Depth */}
            <div>
              <label className="text-[11px] text-slate-500 uppercase tracking-wider">{isAr ? 'عمق الحقن' : 'Depth'}</label>
              <select value={form.injection_depth || ''} onChange={e => setForm({ ...form, injection_depth: e.target.value })}
                className="w-full h-10 px-3 mt-1 rounded-lg text-sm bg-black/30 border border-white/10 text-white focus:outline-none focus:border-purple-500/50">
                <option value="">--</option>
                {INJECTION_DEPTHS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>

            {/* Dilution */}
            <div>
              <label className="text-[11px] text-slate-500 uppercase tracking-wider">{isAr ? 'التخفيف' : 'Dilution'}</label>
              <input value={form.dilution || ''} onChange={e => setForm({ ...form, dilution: e.target.value })}
                placeholder="e.g. 2ml saline per 100u"
                className="w-full h-10 px-3 mt-1 rounded-lg text-sm bg-black/30 border border-white/10 text-white placeholder:text-slate-600 focus:outline-none focus:border-purple-500/50" />
            </div>

            {/* Needle Gauge */}
            <div>
              <label className="text-[11px] text-slate-500 uppercase tracking-wider">{isAr ? 'قطر الإبرة' : 'Needle Gauge'}</label>
              <input value={form.needle_gauge || ''} onChange={e => setForm({ ...form, needle_gauge: e.target.value })}
                placeholder="e.g. 30G"
              className="w-full h-10 px-3 mt-1 rounded-lg text-sm bg-black/30 border border-white/10 text-white placeholder:text-slate-600 focus:outline-none focus:border-purple-500/50" />
            </div>

            {/* Injection Sites */}
            <div>
              <label className="text-[11px] text-slate-500 uppercase tracking-wider">{isAr ? 'نقاط الحقن' : 'Injection Sites'}</label>
              <input value={form.injection_sites || ''} onChange={e => setForm({ ...form, injection_sites: e.target.value })}
                placeholder="e.g. 5 units x 4 sites"
                className="w-full h-10 px-3 mt-1 rounded-lg text-sm bg-black/30 border border-white/10 text-white placeholder:text-slate-600 focus:outline-none focus:border-purple-500/50" />
            </div>

            {/* Session Date */}
            <div>
              <label className="text-[11px] text-slate-500 uppercase tracking-wider">{isAr ? 'التاريخ' : 'Date'}</label>
              <input type="date" value={form.session_date || ''} onChange={e => setForm({ ...form, session_date: e.target.value })}
                className="w-full h-10 px-3 mt-1 rounded-lg text-sm bg-black/30 border border-white/10 text-white focus:outline-none focus:border-purple-500/50" />
            </div>

            {/* Next Session */}
            <div>
              <label className="text-[11px] text-slate-500 uppercase tracking-wider">{isAr ? 'الجلسة القادمة' : 'Next Session'}</label>
              <input type="date" value={form.next_session_date || ''} onChange={e => setForm({ ...form, next_session_date: e.target.value })}
                className="w-full h-10 px-3 mt-1 rounded-lg text-sm bg-black/30 border border-white/10 text-white focus:outline-none focus:border-purple-500/50" />
            </div>

            {/* Status */}
            <div>
              <label className="text-[11px] text-slate-500 uppercase tracking-wider">{isAr ? 'الحالة' : 'Status'}</label>
              <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value as InjectableRecord['status'] })}
                className="w-full h-10 px-3 mt-1 rounded-lg text-sm bg-black/30 border border-white/10 text-white focus:outline-none focus:border-purple-500/50">
                <option value="scheduled">{isAr ? 'مجدول' : 'Scheduled'}</option>
                <option value="completed">{isAr ? 'منجز' : 'Completed'}</option>
                <option value="cancelled">{isAr ? 'ملغي' : 'Cancelled'}</option>
              </select>
            </div>
          </div>

          {/* Notes & Complications */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] text-slate-500 uppercase tracking-wider">{isAr ? 'ملاحظات' : 'Notes'}</label>
              <textarea value={form.notes || ''} onChange={e => setForm({ ...form, notes: e.target.value })}
                rows={2} className="w-full p-3 mt-1 rounded-lg text-sm bg-black/30 border border-white/10 text-white placeholder:text-slate-600 focus:outline-none focus:border-purple-500/50 resize-none" />
            </div>
            <div>
              <label className="text-[11px] text-slate-500 uppercase tracking-wider">{isAr ? 'المضاعفات' : 'Complications'}</label>
              <textarea value={form.complications || ''} onChange={e => setForm({ ...form, complications: e.target.value })}
                rows={2} className="w-full p-3 mt-1 rounded-lg text-sm bg-black/30 border border-white/10 text-white placeholder:text-slate-600 focus:outline-none focus:border-purple-500/50 resize-none" />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={resetForm} className="px-4 py-2 rounded-lg text-sm text-slate-400 hover:text-white border border-white/10 hover:bg-white/5 transition-all">
              {isAr ? 'إلغاء' : 'Cancel'}
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 h-10 bg-purple-500 hover:bg-purple-600 text-white rounded-lg text-sm font-medium transition-all disabled:opacity-50">
              {loading ? (isAr ? 'جاري الحفظ...' : 'Saving...') : (editingId ? (isAr ? 'تحديث' : 'Update') : (isAr ? 'حفظ' : 'Save'))}
            </button>
          </div>
        </form>
      )}

      {/* Records List */}
      <div className="space-y-2">
        {records.length === 0 && !showForm && (
          <div className="text-center py-12 text-slate-500">
            <Syringe className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p className="text-sm">{isAr ? 'لا توجد حقن مسجلة' : 'No injectables recorded yet'}</p>
          </div>
        )}

        {[...records].sort((a, b) => new Date(b.session_date).getTime() - new Date(a.session_date).getTime()).map(r => {
          const ti = typeInfo(r.type)
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
                    <span className="text-lg">{ti.icon}</span>
                    <span className="text-sm font-medium text-slate-200">{isAr ? ti.labelAr : ti.label}</span>
                    <span className="text-[11px] text-slate-500">|</span>
                    <span className="text-xs text-purple-400">{r.product_name}</span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    {r.treatment_area} &middot; {new Date(r.session_date).toLocaleDateString()}
                    {r.units && ` · ${r.units}u`}
                    {r.quantity_ml && ` · ${r.quantity_ml}ml`}
                  </div>
                </div>
                <button onClick={(e) => { e.stopPropagation(); startEdit(r) }}
                  className="text-[11px] text-slate-500 hover:text-purple-400 px-2 py-1 rounded transition-colors">
                  {isAr ? 'تعديل' : 'Edit'}
                </button>
                {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
              </div>

              {isExpanded && (
                <div className="px-3 pb-3 pt-1 border-t border-white/5 space-y-2 text-xs">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {r.injection_depth && <div><span className="text-slate-500">{isAr ? 'العمق:' : 'Depth:'}</span> <span className="text-slate-300">{r.injection_depth}</span></div>}
                    {r.injection_sites && <div><span className="text-slate-500">{isAr ? 'النقاط:' : 'Sites:'}</span> <span className="text-slate-300">{r.injection_sites}</span></div>}
                    {r.dilution && <div><span className="text-slate-500">{isAr ? 'التخفيف:' : 'Dilution:'}</span> <span className="text-slate-300">{r.dilution}</span></div>}
                    {r.needle_gauge && <div><span className="text-slate-500">{isAr ? 'الإبرة:' : 'Needle:'}</span> <span className="text-slate-300">{r.needle_gauge}</span></div>}
                    {r.next_session_date && <div><span className="text-slate-500">{isAr ? 'القادم:' : 'Next:'}</span> <span className="text-blue-400">{new Date(r.next_session_date).toLocaleDateString()}</span></div>}
                  </div>
                  {r.notes && <div><span className="text-slate-500">{isAr ? 'ملاحظات:' : 'Notes:'}</span> <span className="text-slate-300">{r.notes}</span></div>}
                  {r.complications && <div><span className="text-amber-500 font-medium">{isAr ? 'مضاعفات:' : 'Complications:'}</span> <span className="text-amber-400">{r.complications}</span></div>}
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
