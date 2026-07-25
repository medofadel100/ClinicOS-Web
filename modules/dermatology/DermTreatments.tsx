'use client'

import { useState } from 'react'
import { Plus, Stethoscope, CheckCircle2, Clock, AlertTriangle, Trash2, ChevronDown, ChevronUp } from 'lucide-react'
import type { TreatmentRecord } from './types'

const CONDITIONS = [
  { value: 'psoriasis', label: 'Psoriasis', labelAr: 'الصدفية' },
  { value: 'vitiligo', label: 'Vitiligo', labelAr: 'البهاق' },
  { value: 'eczema', label: 'Eczema / Dermatitis', labelAr: 'الإكزيما' },
  { value: 'acne', label: 'Acne Vulgaris', labelAr: 'حب الشباب' },
  { value: 'rosacea', label: 'Rosacea', labelAr: 'الحمراء' },
  { value: 'skin_tags', label: 'Skin Tags / Acrochordons', labelAr: 'الزوائد الجلدية' },
  { value: 'seborrheic_keratosis', label: 'Seborrheic Keratosis', labelAr: 'الثعلبة الدهنية' },
  { value: 'keratosis_pilaris', label: 'Keratosis Pilaris', labelAr: 'التهاب الجريباتHair Follicles' },
  { value: 'alopecia', label: 'Alopecia (Hair Loss)', labelAr: 'تساقط الشعر' },
  { value: 'fungal', label: 'Fungal Infections', labelAr: 'العدوى الفطرية' },
  { value: 'warts', label: 'Warts / Verrucae', labelAr: 'الثآليل' },
  { value: 'melasma', label: 'Melasma / Hyperpigmentation', labelAr: 'الكلف والتصبغات' },
  { value: 'urticaria', label: 'Urticaria (Hives)', labelAr: 'الحكة القurfari' },
  { value: 'herpes', label: 'Herpes Simplex', labelAr: 'الهربس' },
  { value: 'other', label: 'Other', labelAr: 'أخرى' },
]

const TREATMENT_TYPES = [
  { value: 'topical', label: 'Topical Treatment', labelAr: 'علاج موضعي' },
  { value: 'systemic', label: 'Systemic Treatment', labelAr: 'علاج مناعي' },
  { value: 'cryotherapy', label: 'Cryotherapy (Freezing)', labelAr: 'العلاج بالتبريد' },
  { value: 'excision', label: 'Excision / Surgical', labelAr: 'استئصال جراحي' },
  { value: 'laser_surgical', label: 'Laser Surgery', labelAr: 'جراحة بالليزر' },
  { value: 'intralesional', label: 'Intralesional Injection', labelAr: 'حقن داخل الآفة' },
  { value: 'observation', label: 'Observation / Monitoring', labelAr: 'متابعة ومراقبة' },
  { value: 'other', label: 'Other', labelAr: 'أخرى' },
]

const COMMON_MEDICATIONS = [
  'Clobetasol 0.05%', 'Betamethasone 0.1%', 'Hydrocortisone 1%', 'Triamcinolone 0.1%',
  'Tacrolimus 0.1%', 'Pimecrolimus 1%', 'Retin-A (Tretinoin)', 'Adapalene 0.1%',
  'Azelaic Acid 15%', 'Clindamycin 1%', 'Permethrin 5%', 'Mupirocin 2%',
  'Isotretinoin (Accutane)', 'Methotrexate', 'Cyclosporine', 'Dupixent (Dupilumab)',
  'Cryogun (Liquid Nitrogen)', '5-Fluorouracil', 'Imiquimod 5%', 'Other'
]

const BODY_AREAS = [
  'Face', 'Forehead', 'Cheeks', 'Nose', 'Chin', 'Scalp', 'Neck', 'Ears',
  'Arms', 'Hands', 'Chest', 'Back', 'Abdomen', 'Legs', 'Feet',
  'Groin', 'Axillae (Underarms)', 'Trunk', 'Extensor Surfaces', 'Flexural Surfaces', 'Generalized', 'Other'
]

const STATUS_MAP = {
  active: { icon: <AlertTriangle className="w-4 h-4 text-amber-400" />, label: 'Active', labelAr: 'نشط' },
  resolved: { icon: <CheckCircle2 className="w-4 h-4 text-emerald-400" />, label: 'Resolved', labelAr: 'محلول' },
  follow_up: { icon: <Clock className="w-4 h-4 text-blue-400" />, label: 'Follow-up', labelAr: 'متابعة' },
  chronic: { icon: <AlertTriangle className="w-4 h-4 text-orange-400" />, label: 'Chronic', labelAr: 'مزمن' },
}

interface Props {
  records: TreatmentRecord[]
  onUpdate: (records: TreatmentRecord[]) => void
  isAr: boolean
  loading: boolean
}

export default function DermTreatments({ records, onUpdate, isAr, loading }: Props) {
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [form, setForm] = useState<Partial<TreatmentRecord>>({
    diagnosis_type: 'clinical',
    treatment_type: 'topical',
    severity: 'mild',
    status: 'active',
  })

  const resetForm = () => {
    setForm({ diagnosis_type: 'clinical', treatment_type: 'topical', severity: 'mild', status: 'active' })
    setEditingId(null)
    setShowForm(false)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    const id = editingId || crypto.randomUUID()
    const record: TreatmentRecord = {
      id,
      condition: form.condition || '',
      diagnosis_type: form.diagnosis_type || 'clinical',
      treatment_type: form.treatment_type || 'topical',
      medication_name: form.medication_name,
      medication_dosage: form.medication_dosage,
      medication_frequency: form.medication_frequency,
      medication_duration: form.medication_duration,
      area_affected: form.area_affected,
      severity: form.severity || 'mild',
      start_date: form.start_date || new Date().toISOString().split('T')[0],
      end_date: form.end_date,
      follow_up_date: form.follow_up_date,
      notes: form.notes,
      status: form.status || 'active',
    }

    let updated: TreatmentRecord[]
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

  const counts = {
    active: records.filter(r => r.status === 'active').length,
    resolved: records.filter(r => r.status === 'resolved').length,
    follow_up: records.filter(r => r.status === 'follow_up').length,
    total: records.length,
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: isAr ? 'نشط' : 'Active', value: counts.active, color: 'text-amber-400' },
          { label: isAr ? 'متابعة' : 'Follow-up', value: counts.follow_up, color: 'text-blue-400' },
          { label: isAr ? 'محلول' : 'Resolved', value: counts.resolved, color: 'text-emerald-400' },
          { label: isAr ? 'الإجمالي' : 'Total', value: counts.total, color: 'text-slate-200' },
        ].map(s => (
          <div key={s.label} className="bg-white/5 rounded-xl p-3 text-center border border-white/5">
            <div className={`text-xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-[11px] text-slate-500 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      <button onClick={() => { resetForm(); setShowForm(true) }}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-all text-sm font-medium">
        <Plus className="w-4 h-4" />
        {isAr ? 'إضافة علاج' : 'Add Treatment'}
      </button>

      {showForm && (
        <form onSubmit={handleSave} className="bg-white/5 rounded-2xl border border-white/10 p-5 space-y-4">
          <h4 className="text-sm font-semibold text-slate-200">
            {editingId ? (isAr ? 'تعديل العلاج' : 'Edit Treatment') : (isAr ? 'علاج جديد' : 'New Treatment')}
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Condition */}
            <div>
              <label className="text-[11px] text-slate-500 uppercase tracking-wider">{isAr ? 'الحالة' : 'Condition'}</label>
              <select value={form.condition || ''} onChange={e => setForm({ ...form, condition: e.target.value })}
                className="w-full h-10 px-3 mt-1 rounded-lg text-sm bg-black/30 border border-white/10 text-white focus:outline-none focus:border-red-500/50">
                <option value="">{isAr ? '-- اختر --' : '-- Select --'}</option>
                {CONDITIONS.map(c => <option key={c.value} value={c.value}>{isAr ? c.labelAr : c.label}</option>)}
              </select>
            </div>

            {/* Diagnosis Type */}
            <div>
              <label className="text-[11px] text-slate-500 uppercase tracking-wider">{isAr ? 'نوع التشخيص' : 'Diagnosis'}</label>
              <select value={form.diagnosis_type} onChange={e => setForm({ ...form, diagnosis_type: e.target.value as TreatmentRecord['diagnosis_type'] })}
                className="w-full h-10 px-3 mt-1 rounded-lg text-sm bg-black/30 border border-white/10 text-white focus:outline-none focus:border-red-500/50">
                <option value="clinical">{isAr ? 'سريري' : 'Clinical'}</option>
                <option value="dermoscopy">{isAr ? 'เดอรموسكوبية' : 'Dermoscopy'}</option>
                <option value="biopsy">{isAr ? 'خزعة' : 'Biopsy'}</option>
                <option value="visual">{isAr ? 'بصري' : 'Visual'}</option>
              </select>
            </div>

            {/* Treatment Type */}
            <div>
              <label className="text-[11px] text-slate-500 uppercase tracking-wider">{isAr ? 'نوع العلاج' : 'Treatment'}</label>
              <select value={form.treatment_type} onChange={e => setForm({ ...form, treatment_type: e.target.value as TreatmentRecord['treatment_type'] })}
                className="w-full h-10 px-3 mt-1 rounded-lg text-sm bg-black/30 border border-white/10 text-white focus:outline-none focus:border-red-500/50">
                {TREATMENT_TYPES.map(t => <option key={t.value} value={t.value}>{isAr ? t.labelAr : t.label}</option>)}
              </select>
            </div>

            {/* Severity */}
            <div>
              <label className="text-[11px] text-slate-500 uppercase tracking-wider">{isAr ? 'الشدة' : 'Severity'}</label>
              <div className="grid grid-cols-3 gap-2 mt-1">
                {(['mild', 'moderate', 'severe'] as const).map(sev => (
                  <label key={sev} className={`flex items-center justify-center p-2 rounded-lg border cursor-pointer transition-all text-xs font-medium ${
                    form.severity === sev ? 'bg-red-500/20 border-red-500 text-red-300' : 'bg-black/20 border-white/10 text-slate-400 hover:bg-white/5'
                  }`}>
                    <input type="radio" name="severity" value={sev} checked={form.severity === sev}
                      onChange={() => setForm({ ...form, severity: sev })} className="hidden" />
                    {sev === 'mild' ? (isAr ? 'خفيف' : 'Mild') : sev === 'moderate' ? (isAr ? 'متوسط' : 'Mod.') : (isAr ? 'شديد' : 'Severe')}
                  </label>
                ))}
              </div>
            </div>

            {/* Area */}
            <div>
              <label className="text-[11px] text-slate-500 uppercase tracking-wider">{isAr ? 'المنطقة' : 'Area'}</label>
              <select value={form.area_affected || ''} onChange={e => setForm({ ...form, area_affected: e.target.value })}
                className="w-full h-10 px-3 mt-1 rounded-lg text-sm bg-black/30 border border-white/10 text-white focus:outline-none focus:border-red-500/50">
                <option value="">--</option>
                {BODY_AREAS.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="text-[11px] text-slate-500 uppercase tracking-wider">{isAr ? 'الحالة' : 'Status'}</label>
              <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value as TreatmentRecord['status'] })}
                className="w-full h-10 px-3 mt-1 rounded-lg text-sm bg-black/30 border border-white/10 text-white focus:outline-none focus:border-red-500/50">
                <option value="active">{isAr ? 'نشط' : 'Active'}</option>
                <option value="resolved">{isAr ? 'محلول' : 'Resolved'}</option>
                <option value="follow_up">{isAr ? 'متابعة' : 'Follow-up'}</option>
                <option value="chronic">{isAr ? 'مزمن' : 'Chronic'}</option>
              </select>
            </div>

            {/* Medication */}
            {(form.treatment_type === 'topical' || form.treatment_type === 'systemic' || form.treatment_type === 'intralesional') && (
              <>
                <div>
                  <label className="text-[11px] text-slate-500 uppercase tracking-wider">{isAr ? 'الدواء' : 'Medication'}</label>
                  <select value={form.medication_name || ''} onChange={e => setForm({ ...form, medication_name: e.target.value })}
                    className="w-full h-10 px-3 mt-1 rounded-lg text-sm bg-black/30 border border-white/10 text-white focus:outline-none focus:border-red-500/50">
                    <option value="">--</option>
                    {COMMON_MEDICATIONS.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[11px] text-slate-500 uppercase tracking-wider">{isAr ? 'الجرعة' : 'Dosage'}</label>
                  <input value={form.medication_dosage || ''} onChange={e => setForm({ ...form, medication_dosage: e.target.value })}
                    placeholder="e.g. Apply thin layer"
                    className="w-full h-10 px-3 mt-1 rounded-lg text-sm bg-black/30 border border-white/10 text-white placeholder:text-slate-600 focus:outline-none focus:border-red-500/50" />
                </div>
                <div>
                  <label className="text-[11px] text-slate-500 uppercase tracking-wider">{isAr ? 'التكرار' : 'Frequency'}</label>
                  <input value={form.medication_frequency || ''} onChange={e => setForm({ ...form, medication_frequency: e.target.value })}
                    placeholder="e.g. BID x 2 weeks"
                    className="w-full h-10 px-3 mt-1 rounded-lg text-sm bg-black/30 border border-white/10 text-white placeholder:text-slate-600 focus:outline-none focus:border-red-500/50" />
                </div>
                <div>
                  <label className="text-[11px] text-slate-500 uppercase tracking-wider">{isAr ? 'المدة' : 'Duration'}</label>
                  <input value={form.medication_duration || ''} onChange={e => setForm({ ...form, medication_duration: e.target.value })}
                    placeholder="e.g. 4 weeks"
                    className="w-full h-10 px-3 mt-1 rounded-lg text-sm bg-black/30 border border-white/10 text-white placeholder:text-slate-600 focus:outline-none focus:border-red-500/50" />
                </div>
              </>
            )}

            {/* Dates */}
            <div>
              <label className="text-[11px] text-slate-500 uppercase tracking-wider">{isAr ? 'تاريخ البداية' : 'Start Date'}</label>
              <input type="date" value={form.start_date || ''} onChange={e => setForm({ ...form, start_date: e.target.value })}
                className="w-full h-10 px-3 mt-1 rounded-lg text-sm bg-black/30 border border-white/10 text-white focus:outline-none focus:border-red-500/50" />
            </div>
            <div>
              <label className="text-[11px] text-slate-500 uppercase tracking-wider">{isAr ? 'تاريخ المتابعة' : 'Follow-up'}</label>
              <input type="date" value={form.follow_up_date || ''} onChange={e => setForm({ ...form, follow_up_date: e.target.value })}
                className="w-full h-10 px-3 mt-1 rounded-lg text-sm bg-black/30 border border-white/10 text-white focus:outline-none focus:border-red-500/50" />
            </div>
          </div>

          <div>
            <label className="text-[11px] text-slate-500 uppercase tracking-wider">{isAr ? 'ملاحظات' : 'Notes'}</label>
            <textarea value={form.notes || ''} onChange={e => setForm({ ...form, notes: e.target.value })}
              rows={2} className="w-full p-3 mt-1 rounded-lg text-sm bg-black/30 border border-white/10 text-white placeholder:text-slate-600 focus:outline-none focus:border-red-500/50 resize-none" />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={resetForm} className="px-4 py-2 rounded-lg text-sm text-slate-400 hover:text-white border border-white/10 hover:bg-white/5 transition-all">
              {isAr ? 'إلغاء' : 'Cancel'}
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 h-10 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition-all disabled:opacity-50">
              {loading ? (isAr ? 'جاري الحفظ...' : 'Saving...') : (editingId ? (isAr ? 'تحديث' : 'Update') : (isAr ? 'حفظ' : 'Save'))}
            </button>
          </div>
        </form>
      )}

      <div className="space-y-2">
        {records.length === 0 && !showForm && (
          <div className="text-center py-12 text-slate-500">
            <Stethoscope className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p className="text-sm">{isAr ? 'لا توجد علاجات مسجلة' : 'No treatments recorded yet'}</p>
          </div>
        )}

        {records.sort((a, b) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime()).map(r => {
          const cond = CONDITIONS.find(c => c.value === r.condition)
          const tt = TREATMENT_TYPES.find(t => t.value === r.treatment_type)
          const st = STATUS_MAP[r.status]
          const isExpanded = expandedId === r.id

          return (
            <div key={r.id} className="bg-white/5 rounded-xl border border-white/5 overflow-hidden">
              <div className="flex items-center gap-3 p-3 cursor-pointer hover:bg-white/[0.03] transition-colors"
                onClick={() => setExpandedId(isExpanded ? null : r.id)}>
                {st.icon}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium text-slate-200">
                      {cond ? (isAr ? cond.labelAr : cond.label) : r.condition}
                    </span>
                    {r.area_affected && <span className="text-[11px] text-slate-500">| {r.area_affected}</span>}
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                      r.severity === 'severe' ? 'bg-red-500/20 text-red-300' :
                      r.severity === 'moderate' ? 'bg-amber-500/20 text-amber-300' :
                      'bg-blue-500/20 text-blue-300'
                    }`}>{r.severity}</span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    {tt ? (isAr ? tt.labelAr : tt.label) : r.treatment_type} &middot; {new Date(r.start_date).toLocaleDateString()}
                    {r.medication_name && ` · ${r.medication_name}`}
                  </div>
                </div>
                <button onClick={(e) => { e.stopPropagation(); setForm(r); setEditingId(r.id); setShowForm(true) }}
                  className="text-[11px] text-slate-500 hover:text-red-400 px-2 py-1 rounded transition-colors">
                  {isAr ? 'تعديل' : 'Edit'}
                </button>
                {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
              </div>

              {isExpanded && (
                <div className="px-3 pb-3 pt-1 border-t border-white/5 space-y-2 text-xs">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {r.medication_name && <div><span className="text-slate-500">{isAr ? 'الدواء:' : 'Medication:'}</span> <span className="text-slate-300">{r.medication_name}</span></div>}
                    {r.medication_dosage && <div><span className="text-slate-500">{isAr ? 'الجرعة:' : 'Dosage:'}</span> <span className="text-slate-300">{r.medication_dosage}</span></div>}
                    {r.medication_frequency && <div><span className="text-slate-500">{isAr ? 'التكرار:' : 'Freq:'}</span> <span className="text-slate-300">{r.medication_frequency}</span></div>}
                    {r.medication_duration && <div><span className="text-slate-500">{isAr ? 'المدة:' : 'Duration:'}</span> <span className="text-slate-300">{r.medication_duration}</span></div>}
                    {r.follow_up_date && <div><span className="text-blue-400 font-medium">{isAr ? 'المتابعة:' : 'Follow-up:'}</span> <span className="text-blue-400">{new Date(r.follow_up_date).toLocaleDateString()}</span></div>}
                    <div><span className="text-slate-500">{isAr ? 'التشخيص:' : 'Diagnosis:'}</span> <span className="text-slate-300">{r.diagnosis_type}</span></div>
                  </div>
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
