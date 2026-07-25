'use client'

import { useState } from 'react'
import { upsertNeurosurgeryNote, deleteNeurosurgeryNote } from './actions'
import { Activity, Trash2, Plus, Loader2 } from 'lucide-react'

type FieldConfig = {
  name: string
  labelEn: string
  labelAr: string
  type: 'text' | 'number' | 'textarea'
  width?: 'full' | 'half' | 'third'
}

const fields: FieldConfig[] = [
  { name: 'neurological_exam', labelEn: 'Neurological Exam Notes', labelAr: 'ملاحظات الفحص العصبي', type: 'textarea', width: 'full' },
  { name: 'imaging_review', labelEn: 'Imaging Review (MRI, CT Scan)', labelAr: 'مراجعة الأشعة (رنين، مقطعية)', type: 'textarea', width: 'full' },
  { name: 'surgery_type', labelEn: 'Proposed Surgery Type', labelAr: 'نوع الجراحة المقترحة', type: 'text', width: 'half' },
  { name: 'surgical_risks', labelEn: 'Surgical Risks Discussed', labelAr: 'مخاطر الجراحة التي تمت مناقشتها', type: 'textarea', width: 'half' },
  { name: 'post_op_notes', labelEn: 'Post-Operative Notes', labelAr: 'ملاحظات ما بعد العملية', type: 'textarea', width: 'half' },
  { name: 'notes', labelEn: 'General Clinical Notes', labelAr: 'ملاحظات طبية عامة', type: 'textarea', width: 'half' },
]

export default function NeurosurgeryNotes({ clinicId, locale, patientId, initialEntries }: any) {
  const isAr = locale === 'ar'
  const [entries, setEntries] = useState<any[]>(initialEntries || [])
  const [loading, setLoading] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [form, setForm] = useState<Record<string, any>>({})

  const handleInputChange = (name: string, value: any, type: string) => {
    let finalValue = value
    if (type === 'number') finalValue = value === '' ? '' : Number(value)
    setForm(p => ({ ...p, [name]: finalValue }))
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const content: Record<string, any> = {}
      fields.forEach(f => {
        if (form[f.name] !== undefined && form[f.name] !== '') {
          content[f.name] = form[f.name]
        }
      })
      await upsertNeurosurgeryNote(clinicId, locale, patientId, content)
      const newEntry = { id: crypto.randomUUID(), ...content, created_at: new Date().toISOString() }
      setEntries(p => [newEntry, ...p])
      setForm({})
    } catch (err) {
      console.error(err)
      alert(isAr ? 'حدث خطأ أثناء الحفظ' : 'Failed to save')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm(isAr ? 'هل أنت متأكد من الحذف؟' : 'Are you sure?')) return
    setDeletingId(id)
    try {
      await deleteNeurosurgeryNote(clinicId, id)
      setEntries(p => p.filter(x => x.id !== id))
    } catch (err) {
      console.error(err)
      alert(isAr ? 'حدث خطأ أثناء الحذف' : 'Failed to delete')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.05]">
        <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
          <Plus className="w-4 h-4 text-primary" />
          {isAr ? 'إضافة سجل جراحة الأعصاب جديد' : 'Add New Neurosurgery Record'}
        </h3>
        <div className="flex flex-wrap -mx-2">
          {fields.map(f => {
            const widthClass = f.width === 'full' ? 'w-full' : f.width === 'half' ? 'w-full md:w-1/2' : 'w-full md:w-1/3'
            return (
              <div key={f.name} className={`px-2 mb-4 ${widthClass}`}>
                <label className="text-[11px] font-medium text-slate-400 mb-1.5 block uppercase tracking-wider">
                  {isAr ? f.labelAr : f.labelEn}
                </label>
                {f.type === 'textarea' ? (
                  <textarea
                    value={form[f.name] || ''}
                    onChange={e => handleInputChange(f.name, e.target.value, f.type)}
                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-primary/50 transition-all min-h-[100px] resize-y"
                  />
                ) : (
                  <input
                    type={f.type}
                    value={form[f.name] || ''}
                    onChange={e => handleInputChange(f.name, e.target.value, f.type)}
                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-primary/50 transition-all"
                  />
                )}
              </div>
            )
          })}
        </div>
        <div className="mt-2 flex justify-end">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold bg-primary/20 text-primary border border-primary/30 hover:bg-primary/30 transition-all disabled:opacity-50"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {isAr ? 'حفظ السجل' : 'Save Record'}
          </button>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
          <Activity className="w-4 h-4 text-secondary" />
          {isAr ? 'السجل التاريخي' : 'History'}
        </h3>
        <div className="space-y-3">
          {entries.map((e: any) => (
            <div key={e.id} className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05] relative group">
              <div className="flex justify-between items-start mb-3 border-b border-white/5 pb-2">
                <span className="text-xs font-medium text-slate-400 bg-white/5 px-3 py-1 rounded-full">
                  {new Date(e.created_at).toLocaleString(isAr ? 'ar-EG' : 'en-US')}
                </span>
                <button onClick={() => handleDelete(e.id)} disabled={deletingId === e.id} className="text-red-400/50 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100">
                  {deletingId === e.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                {fields.map(f => {
                  const val = e[f.name] || e.content?.[f.name]
                  if (val === null || val === undefined || val === '') return null
                  return (
                    <div key={f.name} className={f.type === 'textarea' ? 'col-span-1 sm:col-span-2' : ''}>
                      <span className="text-[10px] text-slate-500 uppercase block mb-0.5">{isAr ? f.labelAr : f.labelEn}</span>
                      <span className="text-sm text-slate-200 whitespace-pre-wrap">{val}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
          {entries.length === 0 && (
            <div className="text-center py-12 border border-white/5 rounded-2xl bg-white/[0.01]">
              <Activity className="w-8 h-8 text-slate-600 mx-auto mb-3 opacity-50" />
              <p className="text-sm text-slate-500">{isAr ? 'لم يتم تسجيل أي بيانات بعد.' : 'No records found yet.'}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
