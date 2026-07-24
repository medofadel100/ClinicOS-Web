'use client'

import { useState } from 'react'
import { PremiumCard } from '@/components/layout/PageComponents'
import { addSession, deleteSession } from './actions'

type SessionEntry = {
  id: string; session_date: string; session_number?: number; session_type?: string
  chief_complaint?: string; mood_scale?: number; anxiety_scale?: number
  observations?: string; interventions?: string; treatment_plan?: string
  next_session_date?: string; notes?: string
}

export default function SessionNotes({ clinicId, locale, patientId, initialEntries }: {
  clinicId: string; locale: string; patientId: string; initialEntries: SessionEntry[]
}) {
  const [entries, setEntries] = useState<SessionEntry[]>(initialEntries)
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    session_number: '', chief_complaint: '', mood_scale: '5', anxiety_scale: '5',
    observations: '', interventions: '', treatment_plan: '', notes: ''
  })

  const ic = "w-full bg-black/30 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-teal-500/50 transition-all"
  const lc = "text-xs font-medium text-slate-400 mb-1.5 block"

  const handleSubmit = async () => {
    setLoading(true)
    try {
      await addSession(clinicId, locale, patientId, {
        session_number: form.session_number ? parseInt(form.session_number) : undefined,
        chief_complaint: form.chief_complaint || undefined, mood_scale: parseInt(form.mood_scale),
        anxiety_scale: parseInt(form.anxiety_scale), observations: form.observations || undefined,
        interventions: form.interventions || undefined, treatment_plan: form.treatment_plan || undefined,
        notes: form.notes || undefined,
      })
      const { createClient } = await import('@/lib/supabase/client')
      const { data } = await createClient().from('psychology_sessions').select('*').eq('patient_id', patientId).eq('clinic_id', clinicId).order('session_date', { ascending: false })
      if (data) setEntries(data as SessionEntry[])
      setShowForm(false)
      setForm({ session_number: '', chief_complaint: '', mood_scale: '5', anxiety_scale: '5', observations: '', interventions: '', treatment_plan: '', notes: '' })
    } catch (err) { console.error(err); alert('Failed') }
    finally { setLoading(false) }
  }

  const getScaleColor = (val: number) => val <= 3 ? 'text-green-400' : val <= 6 ? 'text-yellow-400' : 'text-red-400'

  return (
    <PremiumCard>
      <div className="mb-6 pb-4 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div>
          <h2 className="text-base font-semibold text-slate-200">Session Notes</h2>
          <p className="text-sm text-slate-500 mt-0.5">Track therapy sessions, mood, and treatment progress.</p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 rounded-xl text-sm font-medium bg-teal-500/20 text-teal-400 border border-teal-500/30 hover:bg-teal-500/30 transition-all">
          {showForm ? 'Cancel' : '+ New Session'}
        </button>
      </div>

      {showForm && (
        <div className="p-4 rounded-xl bg-black/20 border border-white/5 mb-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className={lc}>Chief Complaint</label><input type="text" value={form.chief_complaint} onChange={e => setForm(p => ({...p, chief_complaint: e.target.value}))} className={ic} placeholder="Patient's main concern" /></div>
            <div><label className={lc}>Session #</label><input type="number" value={form.session_number} onChange={e => setForm(p => ({...p, session_number: e.target.value}))} className={ic} /></div>
            <div>
              <label className={lc}>Mood Scale (1-10): <span className={`font-bold ${getScaleColor(parseInt(form.mood_scale))}`}>{form.mood_scale}</span></label>
              <input type="range" min="1" max="10" value={form.mood_scale} onChange={e => setForm(p => ({...p, mood_scale: e.target.value}))} className="w-full accent-teal-500" />
            </div>
            <div>
              <label className={lc}>Anxiety Scale (1-10): <span className={`font-bold ${getScaleColor(parseInt(form.anxiety_scale))}`}>{form.anxiety_scale}</span></label>
              <input type="range" min="1" max="10" value={form.anxiety_scale} onChange={e => setForm(p => ({...p, anxiety_scale: e.target.value}))} className="w-full accent-teal-500" />
            </div>
            <div className="md:col-span-2"><label className={lc}>Observations</label><textarea value={form.observations} onChange={e => setForm(p => ({...p, observations: e.target.value}))} rows={2} className={ic} placeholder="Clinical observations..." /></div>
            <div className="md:col-span-2"><label className={lc}>Interventions</label><textarea value={form.interventions} onChange={e => setForm(p => ({...p, interventions: e.target.value}))} rows={2} className={ic} placeholder="Therapeutic interventions used..." /></div>
            <div className="md:col-span-2"><label className={lc}>Treatment Plan</label><textarea value={form.treatment_plan} onChange={e => setForm(p => ({...p, treatment_plan: e.target.value}))} rows={2} className={ic} placeholder="Plan for ongoing treatment..." /></div>
          </div>
          <div className="flex justify-end">
            <button onClick={handleSubmit} disabled={loading} className="px-6 py-2.5 rounded-xl text-sm font-semibold bg-teal-500/20 text-teal-400 border border-teal-500/30 hover:bg-teal-500/30 transition-all disabled:opacity-50">{loading ? 'Saving...' : 'Save Session'}</button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {entries.map(entry => (
          <div key={entry.id} className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05]">
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs text-slate-500">
                Session #{entry.session_number || '?'} — {new Date(entry.session_date).toLocaleDateString()}
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs">Mood: <span className={`font-bold ${getScaleColor(entry.mood_scale || 5)}`}>{entry.mood_scale}/10</span></span>
                <span className="text-xs">Anxiety: <span className={`font-bold ${getScaleColor(entry.anxiety_scale || 5)}`}>{entry.anxiety_scale}/10</span></span>
                <button onClick={async () => { await deleteSession(clinicId, locale, patientId, entry.id); setEntries(p => p.filter(x => x.id !== entry.id)) }} className="text-xs text-red-400 hover:text-red-300">Delete</button>
              </div>
            </div>
            {entry.chief_complaint && <div className="text-sm text-slate-300"><span className="text-slate-500">Complaint:</span> {entry.chief_complaint}</div>}
            {entry.observations && <div className="text-sm text-slate-400 mt-1"><span className="text-slate-500">Obs:</span> {entry.observations}</div>}
            {entry.interventions && <div className="text-sm text-slate-400 mt-1"><span className="text-slate-500">Interventions:</span> {entry.interventions}</div>}
            {entry.treatment_plan && <div className="text-sm text-teal-400/80 mt-1"><span className="text-slate-500">Plan:</span> {entry.treatment_plan}</div>}
          </div>
        ))}
        {entries.length === 0 && <p className="text-slate-500 text-sm text-center py-8">No sessions recorded yet.</p>}
      </div>
    </PremiumCard>
  )
}
