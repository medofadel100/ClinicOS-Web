'use client'

import { useState } from 'react'
import { Plus, Zap, Clock, CheckCircle2, XCircle, Trash2, ChevronDown, ChevronUp } from 'lucide-react'
import type { LaserSession } from './types'

const LASER_TYPES = [
  { value: 'hair_removal', label: 'Hair Removal', labelAr: 'إزالة الشعر' },
  { value: 'fractional', label: 'Fractional Laser', labelAr: 'الليزر الكسري' },
  { value: 'ipl', label: 'IPL', labelAr: 'آي بي إل' },
  { value: 'nd_yag', label: 'Nd:YAG', labelAr: 'إندياغ' },
  { value: 'co2', label: 'CO2', labelAr: 'CO2' },
  { value: 'diode', label: 'Diode', labelAr: 'الدايود' },
  { value: 'alexandrite', label: 'Alexandrite', labelAr: 'الكسندرايت' },
  { value: 'hifu', label: 'HIFU', labelAr: 'هايفو' },
  { value: 'cryo', label: 'Cryotherapy', labelAr: 'التبريد' },
  { value: 'other', label: 'Other', labelAr: 'أخرى' },
]

const TREATMENT_AREAS = [
  'Face', 'Upper Lip', 'Chin', 'Jawline', 'Cheeks', 'Forehead', 'Neck',
  'Underarms', 'Arms', 'Bikini', 'Brazilian', 'Legs', 'Thighs', 'Chest',
  'Back', 'Abdomen', 'Full Body', 'Other'
]

const STATUS_ICONS = {
  completed: <CheckCircle2 className="w-4 h-4 text-emerald-400" />,
  scheduled: <Clock className="w-4 h-4 text-blue-400" />,
  cancelled: <XCircle className="w-4 h-4 text-red-400" />,
}

interface Props {
  sessions: LaserSession[]
  onUpdate: (sessions: LaserSession[]) => void
  isAr: boolean
  loading: boolean
}

export default function LaserSessions({ sessions, onUpdate, isAr, loading }: Props) {
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [form, setForm] = useState<Partial<LaserSession>>({
    laser_type: 'hair_removal',
    status: 'scheduled',
    treatment_area: 'Face',
    skin_type_fitzpatrick: 3,
  })

  const resetForm = () => {
    setForm({ laser_type: 'hair_removal', status: 'scheduled', treatment_area: 'Face', skin_type_fitzpatrick: 3 })
    setEditingId(null)
    setShowForm(false)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    const id = editingId || crypto.randomUUID()
    const session: LaserSession = {
      id,
      session_number: form.session_number || 1,
      total_sessions: form.total_sessions || 6,
      treatment_area: form.treatment_area || 'Face',
      laser_type: form.laser_type || 'hair_removal',
      device_name: form.device_name || '',
      energy_joules: form.energy_joules,
      power_watts: form.power_watts,
      spot_size_mm: form.spot_size_mm,
      pulse_duration_ms: form.pulse_duration_ms,
      frequency_hz: form.frequency_hz,
      cooling_type: form.cooling_type,
      skin_type_fitzpatrick: form.skin_type_fitzpatrick,
      session_date: form.session_date || new Date().toISOString().split('T')[0],
      next_session_date: form.next_session_date,
      pre_treatment_notes: form.pre_treatment_notes,
      post_treatment_notes: form.post_treatment_notes,
      side_effects: form.side_effects,
      patient_satisfaction: form.patient_satisfaction,
      status: form.status || 'scheduled',
    }

    let updated: LaserSession[]
    if (editingId) {
      updated = sessions.map(s => s.id === editingId ? session : s)
    } else {
      updated = [...sessions, session]
    }
    onUpdate(updated)
    resetForm()
  }

  const handleDelete = async (id: string) => {
    const updated = sessions.filter(s => s.id !== id)
    onUpdate(updated)
  }

  const startEdit = (s: LaserSession) => {
    setForm(s)
    setEditingId(s.id)
    setShowForm(true)
  }

  const getStatusCounts = () => {
    const completed = sessions.filter(s => s.status === 'completed').length
    const scheduled = sessions.filter(s => s.status === 'scheduled').length
    return { completed, scheduled, total: sessions.length }
  }
  const counts = getStatusCounts()

  return (
    <div className="space-y-4">
      {/* Stats Bar */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: isAr ? 'منجز' : 'Completed', value: counts.completed, color: 'text-emerald-400' },
          { label: isAr ? 'مجدول' : 'Scheduled', value: counts.scheduled, color: 'text-blue-400' },
          { label: isAr ? 'إجمالي' : 'Total', value: counts.total, color: 'text-slate-200' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white/5 rounded-xl p-3 text-center border border-white/5">
            <div className={`text-xl font-bold ${stat.color}`}>{stat.value}</div>
            <div className="text-[11px] text-slate-500 mt-0.5">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Add Button */}
      <button
        onClick={() => { resetForm(); setShowForm(true) }}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20 hover:bg-teal-500/20 transition-all text-sm font-medium"
      >
        <Plus className="w-4 h-4" />
        {isAr ? 'إضافة جلسة ليزر' : 'Add Laser Session'}
      </button>

      {/* Form */}
      {showForm && (
        <form onSubmit={handleSave} className="bg-white/5 rounded-2xl border border-white/10 p-5 space-y-4">
          <h4 className="text-sm font-semibold text-slate-200">
            {editingId ? (isAr ? 'تعديل الجلسة' : 'Edit Session') : (isAr ? 'جلسة جديدة' : 'New Session')}
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Laser Type */}
            <div>
              <label className="text-[11px] text-slate-500 uppercase tracking-wider">{isAr ? 'نوع الليزر' : 'Laser Type'}</label>
              <select value={form.laser_type} onChange={e => setForm({ ...form, laser_type: e.target.value as LaserSession['laser_type'] })}
                className="w-full h-10 px-3 mt-1 rounded-lg text-sm bg-black/30 border border-white/10 text-white focus:outline-none focus:border-teal-500/50">
                {LASER_TYPES.map(lt => <option key={lt.value} value={lt.value}>{isAr ? lt.labelAr : lt.label}</option>)}
              </select>
            </div>

            {/* Device */}
            <div>
              <label className="text-[11px] text-slate-500 uppercase tracking-wider">{isAr ? 'الجهاز' : 'Device'}</label>
              <input value={form.device_name || ''} onChange={e => setForm({ ...form, device_name: e.target.value })}
                placeholder="e.g. Candela GentleLase Pro"
                className="w-full h-10 px-3 mt-1 rounded-lg text-sm bg-black/30 border border-white/10 text-white placeholder:text-slate-600 focus:outline-none focus:border-teal-500/50" />
            </div>

            {/* Treatment Area */}
            <div>
              <label className="text-[11px] text-slate-500 uppercase tracking-wider">{isAr ? 'منطقة العلاج' : 'Area'}</label>
              <select value={form.treatment_area} onChange={e => setForm({ ...form, treatment_area: e.target.value })}
                className="w-full h-10 px-3 mt-1 rounded-lg text-sm bg-black/30 border border-white/10 text-white focus:outline-none focus:border-teal-500/50">
                {TREATMENT_AREAS.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>

            {/* Session Number */}
            <div>
              <label className="text-[11px] text-slate-500 uppercase tracking-wider">{isAr ? 'رقم الجلسة' : 'Session #'} / {isAr ? 'إجمالي' : 'Total'}</label>
              <div className="flex gap-2 mt-1">
                <input type="number" min="1" value={form.session_number || 1} onChange={e => setForm({ ...form, session_number: +e.target.value })}
                  className="w-1/2 h-10 px-3 rounded-lg text-sm bg-black/30 border border-white/10 text-white focus:outline-none focus:border-teal-500/50" />
                <input type="number" min="1" value={form.total_sessions || 6} onChange={e => setForm({ ...form, total_sessions: +e.target.value })}
                  className="w-1/2 h-10 px-3 rounded-lg text-sm bg-black/30 border border-white/10 text-white focus:outline-none focus:border-teal-500/50" />
              </div>
            </div>

            {/* Skin Type Fitzpatrick */}
            <div>
              <label className="text-[11px] text-slate-500 uppercase tracking-wider">{isAr ? 'نوع البشرة' : 'Skin Type (Fitzpatrick)'}</label>
              <select value={form.skin_type_fitzpatrick || 3} onChange={e => setForm({ ...form, skin_type_fitzpatrick: +e.target.value })}
                className="w-full h-10 px-3 mt-1 rounded-lg text-sm bg-black/30 border border-white/10 text-white focus:outline-none focus:border-teal-500/50">
                {[1,2,3,4,5,6].map(n => <option key={n} value={n}>Type {n}</option>)}
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="text-[11px] text-slate-500 uppercase tracking-wider">{isAr ? 'الحالة' : 'Status'}</label>
              <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value as LaserSession['status'] })}
                className="w-full h-10 px-3 mt-1 rounded-lg text-sm bg-black/30 border border-white/10 text-white focus:outline-none focus:border-teal-500/50">
                <option value="scheduled">{isAr ? 'مجدول' : 'Scheduled'}</option>
                <option value="completed">{isAr ? 'منجز' : 'Completed'}</option>
                <option value="cancelled">{isAr ? 'ملغي' : 'Cancelled'}</option>
              </select>
            </div>

            {/* Energy */}
            <div>
              <label className="text-[11px] text-slate-500 uppercase tracking-wider">{isAr ? 'الطاقة (جول)' : 'Energy (J)'}</label>
              <input type="number" step="0.1" value={form.energy_joules || ''} onChange={e => setForm({ ...form, energy_joules: +e.target.value })}
                className="w-full h-10 px-3 mt-1 rounded-lg text-sm bg-black/30 border border-white/10 text-white focus:outline-none focus:border-teal-500/50" />
            </div>

            {/* Spot Size */}
            <div>
              <label className="text-[11px] text-slate-500 uppercase tracking-wider">{isAr ? 'حجم النقطة (مم)' : 'Spot Size (mm)'}</label>
              <input type="number" step="0.1" value={form.spot_size_mm || ''} onChange={e => setForm({ ...form, spot_size_mm: +e.target.value })}
                className="w-full h-10 px-3 mt-1 rounded-lg text-sm bg-black/30 border border-white/10 text-white focus:outline-none focus:border-teal-500/50" />
            </div>

            {/* Pulse Duration */}
            <div>
              <label className="text-[11px] text-slate-500 uppercase tracking-wider">{isAr ? 'مدة النبضة (مللي ثانية)' : 'Pulse Duration (ms)'}</label>
              <input type="number" step="0.1" value={form.pulse_duration_ms || ''} onChange={e => setForm({ ...form, pulse_duration_ms: +e.target.value })}
                className="w-full h-10 px-3 mt-1 rounded-lg text-sm bg-black/30 border border-white/10 text-white focus:outline-none focus:border-teal-500/50" />
            </div>

            {/* Frequency */}
            <div>
              <label className="text-[11px] text-slate-500 uppercase tracking-wider">{isAr ? 'التردد (هرتز)' : 'Frequency (Hz)'}</label>
              <input type="number" step="0.1" value={form.frequency_hz || ''} onChange={e => setForm({ ...form, frequency_hz: +e.target.value })}
                className="w-full h-10 px-3 mt-1 rounded-lg text-sm bg-black/30 border border-white/10 text-white focus:outline-none focus:border-teal-500/50" />
            </div>

            {/* Cooling Type */}
            <div>
              <label className="text-[11px] text-slate-500 uppercase tracking-wider">{isAr ? 'التبريد' : 'Cooling'}</label>
              <input value={form.cooling_type || ''} onChange={e => setForm({ ...form, cooling_type: e.target.value })}
                placeholder="e.g. Cryogen spray, Contact"
                className="w-full h-10 px-3 mt-1 rounded-lg text-sm bg-black/30 border border-white/10 text-white placeholder:text-slate-600 focus:outline-none focus:border-teal-500/50" />
            </div>

            {/* Session Date */}
            <div>
              <label className="text-[11px] text-slate-500 uppercase tracking-wider">{isAr ? 'تاريخ الجلسة' : 'Session Date'}</label>
              <input type="date" value={form.session_date || ''} onChange={e => setForm({ ...form, session_date: e.target.value })}
                className="w-full h-10 px-3 mt-1 rounded-lg text-sm bg-black/30 border border-white/10 text-white focus:outline-none focus:border-teal-500/50" />
            </div>

            {/* Next Session Date */}
            <div>
              <label className="text-[11px] text-slate-500 uppercase tracking-wider">{isAr ? 'الجلسة القادمة' : 'Next Session'}</label>
              <input type="date" value={form.next_session_date || ''} onChange={e => setForm({ ...form, next_session_date: e.target.value })}
                className="w-full h-10 px-3 mt-1 rounded-lg text-sm bg-black/30 border border-white/10 text-white focus:outline-none focus:border-teal-500/50" />
            </div>

            {/* Patient Satisfaction */}
            <div>
              <label className="text-[11px] text-slate-500 uppercase tracking-wider">{isAr ? 'رضا المريض' : 'Satisfaction (1-5)'}</label>
              <select value={form.patient_satisfaction || ''} onChange={e => setForm({ ...form, patient_satisfaction: +e.target.value })}
                className="w-full h-10 px-3 mt-1 rounded-lg text-sm bg-black/30 border border-white/10 text-white focus:outline-none focus:border-teal-500/50">
                <option value="">--</option>
                {[1,2,3,4,5].map(n => <option key={n} value={n}>{n} {isAr ? '/ ٥' : '/ 5'}</option>)}
              </select>
            </div>
          </div>

          {/* Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] text-slate-500 uppercase tracking-wider">{isAr ? 'ملاحظات قبل' : 'Pre-treatment Notes'}</label>
              <textarea value={form.pre_treatment_notes || ''} onChange={e => setForm({ ...form, pre_treatment_notes: e.target.value })}
                rows={2} className="w-full p-3 mt-1 rounded-lg text-sm bg-black/30 border border-white/10 text-white placeholder:text-slate-600 focus:outline-none focus:border-teal-500/50 resize-none" />
            </div>
            <div>
              <label className="text-[11px] text-slate-500 uppercase tracking-wider">{isAr ? 'ملاحظات بعد' : 'Post-treatment Notes'}</label>
              <textarea value={form.post_treatment_notes || ''} onChange={e => setForm({ ...form, post_treatment_notes: e.target.value })}
                rows={2} className="w-full p-3 mt-1 rounded-lg text-sm bg-black/30 border border-white/10 text-white placeholder:text-slate-600 focus:outline-none focus:border-teal-500/50 resize-none" />
            </div>
          </div>

          <div>
            <label className="text-[11px] text-slate-500 uppercase tracking-wider">{isAr ? 'الأعراض الجانبية' : 'Side Effects'}</label>
            <input value={form.side_effects || ''} onChange={e => setForm({ ...form, side_effects: e.target.value })}
              placeholder="e.g. Mild redness, swelling for 24h"
              className="w-full h-10 px-3 mt-1 rounded-lg text-sm bg-black/30 border border-white/10 text-white placeholder:text-slate-600 focus:outline-none focus:border-teal-500/50" />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={resetForm} className="px-4 py-2 rounded-lg text-sm text-slate-400 hover:text-white border border-white/10 hover:bg-white/5 transition-all">
              {isAr ? 'إلغاء' : 'Cancel'}
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 h-10 bg-teal-500 hover:bg-teal-600 text-white rounded-lg text-sm font-medium transition-all disabled:opacity-50">
              {loading ? (isAr ? 'جاري الحفظ...' : 'Saving...') : (editingId ? (isAr ? 'تحديث' : 'Update') : (isAr ? 'حفظ' : 'Save'))}
            </button>
          </div>
        </form>
      )}

      {/* Sessions List */}
      <div className="space-y-2">
        {sessions.length === 0 && !showForm && (
          <div className="text-center py-12 text-slate-500">
            <Zap className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p className="text-sm">{isAr ? 'لا توجد جلسات ليزر مسجلة' : 'No laser sessions recorded yet'}</p>
          </div>
        )}

        {[...sessions].sort((a, b) => new Date(b.session_date).getTime() - new Date(a.session_date).getTime()).map(s => {
          const lt = LASER_TYPES.find(l => l.value === s.laser_type)
          const isExpanded = expandedId === s.id
          return (
            <div key={s.id} className="bg-white/5 rounded-xl border border-white/5 overflow-hidden">
              <div className="flex items-center gap-3 p-3 cursor-pointer hover:bg-white/[0.03] transition-colors"
                onClick={() => setExpandedId(isExpanded ? null : s.id)}>
                {STATUS_ICONS[s.status]}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium text-slate-200">{isAr ? lt?.labelAr : lt?.label}</span>
                    <span className="text-[11px] text-slate-500">|</span>
                    <span className="text-xs text-slate-400">{s.treatment_area}</span>
                    <span className="text-[11px] text-slate-500">|</span>
                    <span className="text-xs text-teal-400 font-medium">{s.session_number}/{s.total_sessions}</span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">{s.device_name} &middot; {new Date(s.session_date).toLocaleDateString()}</div>
                </div>
                <button onClick={(e) => { e.stopPropagation(); startEdit(s) }}
                  className="text-[11px] text-slate-500 hover:text-teal-400 px-2 py-1 rounded transition-colors">
                  {isAr ? 'تعديل' : 'Edit'}
                </button>
                {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
              </div>

              {isExpanded && (
                <div className="px-3 pb-3 pt-1 border-t border-white/5 space-y-2 text-xs">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {s.energy_joules && <div><span className="text-slate-500">{isAr ? 'الطاقة:' : 'Energy:'}</span> <span className="text-slate-300">{s.energy_joules}J</span></div>}
                    {s.spot_size_mm && <div><span className="text-slate-500">{isAr ? 'النقطة:' : 'Spot:'}</span> <span className="text-slate-300">{s.spot_size_mm}mm</span></div>}
                    {s.pulse_duration_ms && <div><span className="text-slate-500">{isAr ? 'النبضة:' : 'Pulse:'}</span> <span className="text-slate-300">{s.pulse_duration_ms}ms</span></div>}
                    {s.skin_type_fitzpatrick && <div><span className="text-slate-500">{isAr ? 'البشرة:' : 'Skin:'}</span> <span className="text-slate-300">Type {s.skin_type_fitzpatrick}</span></div>}
                  </div>
                  {s.next_session_date && <div><span className="text-slate-500">{isAr ? 'الجلسة القادمة:' : 'Next:'}</span> <span className="text-blue-400">{new Date(s.next_session_date).toLocaleDateString()}</span></div>}
                  {s.side_effects && <div><span className="text-slate-500">{isAr ? 'أعراض جانبية:' : 'Side Effects:'}</span> <span className="text-amber-400">{s.side_effects}</span></div>}
                  {s.pre_treatment_notes && <div><span className="text-slate-500">{isAr ? 'قبل:' : 'Pre:'}</span> <span className="text-slate-300">{s.pre_treatment_notes}</span></div>}
                  {s.post_treatment_notes && <div><span className="text-slate-500">{isAr ? 'بعد:' : 'Post:'}</span> <span className="text-slate-300">{s.post_treatment_notes}</span></div>}
                  {s.patient_satisfaction && <div><span className="text-slate-500">{isAr ? 'الرضا:' : 'Satisfaction:'}</span> <span className="text-yellow-400">{'★'.repeat(s.patient_satisfaction)}{'☆'.repeat(5 - s.patient_satisfaction)}</span></div>}

                  <div className="pt-2 flex justify-end">
                    <button onClick={() => handleDelete(s.id)}
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
