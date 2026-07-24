'use client'

import { useState } from 'react'
import { PremiumCard } from '@/components/layout/PageComponents'
import { upsertExamination, deleteExamination } from './actions'

type ExamEntry = {
  id: string
  examination_date: string
  pregnancy_week?: number
  last_menstrual_period?: string
  fundal_height?: number
  fetal_heart_rate?: number
  blood_pressure_systolic?: number
  blood_pressure_diastolic?: number
  weight_kg?: number
  urine_protein?: string
  urine_glucose?: string
  edema?: string
  diagnosis?: string
  notes?: string
}

export default function ObgynChart({ clinicId, locale, patientId, initialEntries }: {
  clinicId: string; locale: string; patientId: string; initialEntries: ExamEntry[]
}) {
  const [entries, setEntries] = useState<ExamEntry[]>(initialEntries)
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    pregnancy_week: '', last_menstrual_period: '', fundal_height: '', fetal_heart_rate: '',
    bp_sys: '', bp_dia: '', weight_kg: '', urine_protein: 'negative', urine_glucose: 'negative',
    edema: 'none', diagnosis: '', notes: ''
  })

  const ic = "w-full bg-black/30 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/50 transition-all"
  const lc = "text-xs font-medium text-slate-400 mb-1.5 block"

  const handleSubmit = async () => {
    setLoading(true)
    try {
      await upsertExamination(clinicId, locale, patientId, {
        pregnancy_week: form.pregnancy_week ? parseInt(form.pregnancy_week) : undefined,
        last_menstrual_period: form.last_menstrual_period || undefined,
        fundal_height: form.fundal_height ? parseFloat(form.fundal_height) : undefined,
        fetal_heart_rate: form.fetal_heart_rate ? parseInt(form.fetal_heart_rate) : undefined,
        blood_pressure_systolic: form.bp_sys ? parseInt(form.bp_sys) : undefined,
        blood_pressure_diastolic: form.bp_dia ? parseInt(form.bp_dia) : undefined,
        weight_kg: form.weight_kg ? parseFloat(form.weight_kg) : undefined,
        urine_protein: form.urine_protein !== 'negative' ? form.urine_protein : undefined,
        urine_glucose: form.urine_glucose !== 'negative' ? form.urine_glucose : undefined,
        edema: form.edema !== 'none' ? form.edema : undefined,
        diagnosis: form.diagnosis || undefined,
        notes: form.notes || undefined,
      })
      const { createClient } = await import('@/lib/supabase/client')
      const { data } = await createClient().from('obgyn_examinations')
        .select('*').eq('patient_id', patientId).eq('clinic_id', clinicId).order('examination_date', { ascending: false })
      if (data) setEntries(data as ExamEntry[])
      setForm({ pregnancy_week: '', last_menstrual_period: '', fundal_height: '', fetal_heart_rate: '',
        bp_sys: '', bp_dia: '', weight_kg: '', urine_protein: 'negative', urine_glucose: 'negative',
        edema: 'none', diagnosis: '', notes: '' })
      setShowForm(false)
    } catch (err) { console.error(err); alert('Failed to save') }
    finally { setLoading(false) }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this examination?')) return
    setLoading(true)
    try {
      await deleteExamination(clinicId, locale, patientId, id)
      setEntries(prev => prev.filter(e => e.id !== id))
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  return (
    <PremiumCard>
      <div className="mb-6 pb-4 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div>
          <h2 className="text-base font-semibold text-slate-200">OB/GYN Examination</h2>
          <p className="text-sm text-slate-500 mt-0.5">Track prenatal visits, vitals, and fetal monitoring.</p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 rounded-xl text-sm font-medium bg-teal-500/20 text-teal-400 border border-teal-500/30 hover:bg-teal-500/30 transition-all">
          {showForm ? 'Cancel' : '+ New Exam'}
        </button>
      </div>

      {showForm && (
        <div className="p-4 rounded-xl bg-black/20 border border-white/5 mb-6 space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div><label className={lc}>Pregnancy Week</label><input type="number" value={form.pregnancy_week} onChange={e => setForm(p => ({...p, pregnancy_week: e.target.value}))} className={ic} placeholder="32" /></div>
            <div><label className={lc}>LMP</label><input type="date" value={form.last_menstrual_period} onChange={e => setForm(p => ({...p, last_menstrual_period: e.target.value}))} className={ic} /></div>
            <div><label className={lc}>Fundal Height (cm)</label><input type="number" step="0.1" value={form.fundal_height} onChange={e => setForm(p => ({...p, fundal_height: e.target.value}))} className={ic} placeholder="30" /></div>
            <div><label className={lc}>Fetal Heart Rate</label><input type="number" value={form.fetal_heart_rate} onChange={e => setForm(p => ({...p, fetal_heart_rate: e.target.value}))} className={ic} placeholder="140" /></div>
            <div><label className={lc}>BP Systolic</label><input type="number" value={form.bp_sys} onChange={e => setForm(p => ({...p, bp_sys: e.target.value}))} className={ic} placeholder="110" /></div>
            <div><label className={lc}>BP Diastolic</label><input type="number" value={form.bp_dia} onChange={e => setForm(p => ({...p, bp_dia: e.target.value}))} className={ic} placeholder="70" /></div>
            <div><label className={lc}>Weight (kg)</label><input type="number" step="0.1" value={form.weight_kg} onChange={e => setForm(p => ({...p, weight_kg: e.target.value}))} className={ic} /></div>
            <div>
              <label className={lc}>Edema</label>
              <select value={form.edema} onChange={e => setForm(p => ({...p, edema: e.target.value}))} className={ic}>
                <option value="none">None</option><option value="mild">Mild</option><option value="moderate">Moderate</option><option value="severe">Severe</option>
              </select>
            </div>
            <div>
              <label className={lc}>Urine Protein</label>
              <select value={form.urine_protein} onChange={e => setForm(p => ({...p, urine_protein: e.target.value}))} className={ic}>
                <option value="negative">Negative</option><option value="+">+</option><option value="++">++</option><option value="+++">+++</option>
              </select>
            </div>
            <div>
              <label className={lc}>Urine Glucose</label>
              <select value={form.urine_glucose} onChange={e => setForm(p => ({...p, urine_glucose: e.target.value}))} className={ic}>
                <option value="negative">Negative</option><option value="+">+</option><option value="++">++</option><option value="+++">+++</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className={lc}>Diagnosis</label><input type="text" value={form.diagnosis} onChange={e => setForm(p => ({...p, diagnosis: e.target.value}))} className={ic} placeholder="Diagnosis" /></div>
            <div><label className={lc}>Notes</label><input type="text" value={form.notes} onChange={e => setForm(p => ({...p, notes: e.target.value}))} className={ic} placeholder="Additional notes" /></div>
          </div>
          <div className="flex justify-end">
            <button onClick={handleSubmit} disabled={loading}
              className="px-6 py-2.5 rounded-xl text-sm font-semibold bg-teal-500/20 text-teal-400 border border-teal-500/30 hover:bg-teal-500/30 transition-all disabled:opacity-50">
              {loading ? 'Saving...' : 'Save Examination'}
            </button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {entries.map(entry => (
          <div key={entry.id} className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05]">
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs text-slate-500">
                {new Date(entry.examination_date).toLocaleDateString()}
                {entry.pregnancy_week && <span className="ml-2 text-teal-400 font-medium">Week {entry.pregnancy_week}</span>}
              </div>
              <button onClick={() => handleDelete(entry.id)} className="text-xs text-red-400 hover:text-red-300">Delete</button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-1 text-sm">
              {entry.fundal_height && <div className="text-slate-400">FH: <span className="text-slate-300">{entry.fundal_height} cm</span></div>}
              {entry.fetal_heart_rate && <div className="text-slate-400">FHR: <span className="text-slate-300">{entry.fetal_heart_rate} bpm</span></div>}
              {entry.blood_pressure_systolic && entry.blood_pressure_diastolic && <div className="text-slate-400">BP: <span className="text-slate-300">{entry.blood_pressure_systolic}/{entry.blood_pressure_diastolic}</span></div>}
              {entry.weight_kg && <div className="text-slate-400">Wt: <span className="text-slate-300">{entry.weight_kg} kg</span></div>}
              {entry.edema && entry.edema !== 'none' && <div className="text-slate-400">Edema: <span className="text-yellow-400">{entry.edema}</span></div>}
              {entry.urine_protein && entry.urine_protein !== 'negative' && <div className="text-slate-400">Protein: <span className="text-yellow-400">{entry.urine_protein}</span></div>}
            </div>
            {entry.diagnosis && <div className="text-sm text-teal-400 mt-2">{entry.diagnosis}</div>}
          </div>
        ))}
        {entries.length === 0 && <p className="text-slate-500 text-sm text-center py-8">No examinations recorded yet.</p>}
      </div>
    </PremiumCard>
  )
}
