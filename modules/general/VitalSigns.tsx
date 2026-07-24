'use client'

import { useState } from 'react'
import { PremiumCard } from '@/components/layout/PageComponents'
import { addVitalSigns, deleteVitalSigns } from './actions'

type VitalEntry = {
  id: string; recorded_at: string
  blood_pressure_systolic?: number; blood_pressure_diastolic?: number
  heart_rate?: number; temperature_c?: number; respiratory_rate?: number
  oxygen_saturation?: number; weight_kg?: number; height_cm?: number; notes?: string
}

function VitalBadge({ label, value, unit, color }: { label: string; value?: string | number | null; unit: string; color: string }) {
  return (
    <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] text-center">
      <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">{label}</div>
      <div className={`text-lg font-bold ${color}`}>{value != null ? value : '-'}</div>
      <div className="text-[10px] text-slate-600">{unit}</div>
    </div>
  )
}

export default function VitalSigns({ clinicId, locale, patientId, initialEntries }: {
  clinicId: string; locale: string; patientId: string; initialEntries: VitalEntry[]
}) {
  const [entries, setEntries] = useState<VitalEntry[]>(initialEntries)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    bp_sys: '', bp_dia: '', hr: '', temp: '', rr: '', spo2: '', weight: '', height: '', notes: ''
  })

  const ic = "w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-teal-500/50 transition-all"
  const lc = "text-[10px] font-medium text-slate-400 mb-1 block"

  const handleSubmit = async () => {
    setLoading(true)
    try {
      await addVitalSigns(clinicId, locale, patientId, {
        blood_pressure_systolic: form.bp_sys ? parseInt(form.bp_sys) : undefined,
        blood_pressure_diastolic: form.bp_dia ? parseInt(form.bp_dia) : undefined,
        heart_rate: form.hr ? parseInt(form.hr) : undefined,
        temperature_c: form.temp ? parseFloat(form.temp) : undefined,
        respiratory_rate: form.rr ? parseInt(form.rr) : undefined,
        oxygen_saturation: form.spo2 ? parseFloat(form.spo2) : undefined,
        weight_kg: form.weight ? parseFloat(form.weight) : undefined,
        height_cm: form.height ? parseFloat(form.height) : undefined,
        notes: form.notes || undefined,
      })
      const { createClient } = await import('@/lib/supabase/client')
      const { data } = await createClient().from('vital_signs_logs').select('*').eq('patient_id', patientId).eq('clinic_id', clinicId).order('recorded_at', { ascending: false })
      if (data) setEntries(data as VitalEntry[])
      setForm({ bp_sys: '', bp_dia: '', hr: '', temp: '', rr: '', spo2: '', weight: '', height: '', notes: '' })
    } catch (err) { console.error(err); alert('Failed') }
    finally { setLoading(false) }
  }

  return (
    <PremiumCard>
      <div className="mb-6 pb-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <h2 className="text-base font-semibold text-slate-200">Vital Signs</h2>
        <p className="text-sm text-slate-500 mt-0.5">Record and track patient vital signs over time.</p>
      </div>

      {/* Latest vitals display */}
      {entries.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-2 mb-6">
          <VitalBadge label="BP" value={entries[0].blood_pressure_systolic && entries[0].blood_pressure_diastolic ? `${entries[0].blood_pressure_systolic}/${entries[0].blood_pressure_diastolic}` : null} unit="mmHg" color="text-rose-400" />
          <VitalBadge label="HR" value={entries[0].heart_rate} unit="bpm" color="text-pink-400" />
          <VitalBadge label="Temp" value={entries[0].temperature_c} unit="°C" color="text-orange-400" />
          <VitalBadge label="RR" value={entries[0].respiratory_rate} unit="/min" color="text-blue-400" />
          <VitalBadge label="SpO2" value={entries[0].oxygen_saturation} unit="%" color="text-cyan-400" />
          <VitalBadge label="Weight" value={entries[0].weight_kg} unit="kg" color="text-teal-400" />
          <VitalBadge label="Height" value={entries[0].height_cm} unit="cm" color="text-violet-400" />
        </div>
      )}

      {/* Form */}
      <div className="p-4 rounded-xl bg-black/20 border border-white/5 mb-6">
        <h3 className="text-sm font-semibold text-slate-300 mb-3">Record New Vitals</h3>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-3">
          <div><label className={lc}>BP Systolic</label><input type="number" value={form.bp_sys} onChange={e => setForm(p => ({...p, bp_sys: e.target.value}))} className={ic} placeholder="120" /></div>
          <div><label className={lc}>BP Diastolic</label><input type="number" value={form.bp_dia} onChange={e => setForm(p => ({...p, bp_dia: e.target.value}))} className={ic} placeholder="80" /></div>
          <div><label className={lc}>Heart Rate</label><input type="number" value={form.hr} onChange={e => setForm(p => ({...p, hr: e.target.value}))} className={ic} placeholder="72" /></div>
          <div><label className={lc}>Temperature</label><input type="number" step="0.1" value={form.temp} onChange={e => setForm(p => ({...p, temp: e.target.value}))} className={ic} placeholder="36.5" /></div>
          <div><label className={lc}>Resp. Rate</label><input type="number" value={form.rr} onChange={e => setForm(p => ({...p, rr: e.target.value}))} className={ic} placeholder="16" /></div>
          <div><label className={lc}>SpO2</label><input type="number" step="0.1" value={form.spo2} onChange={e => setForm(p => ({...p, spo2: e.target.value}))} className={ic} placeholder="98" /></div>
          <div><label className={lc}>Weight (kg)</label><input type="number" step="0.1" value={form.weight} onChange={e => setForm(p => ({...p, weight: e.target.value}))} className={ic} /></div>
        </div>
        <div className="mt-3 flex justify-end">
          <button onClick={handleSubmit} disabled={loading} className="px-6 py-2 rounded-xl text-sm font-semibold bg-teal-500/20 text-teal-400 border border-teal-500/30 hover:bg-teal-500/30 transition-all disabled:opacity-50">{loading ? '...' : 'Record Vitals'}</button>
        </div>
      </div>

      {/* History */}
      <h3 className="text-sm font-semibold text-slate-300 mb-3">History</h3>
      <div className="space-y-2">
        {entries.map(e => (
          <div key={e.id} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/[0.05]">
            <div className="text-sm text-slate-300">
              <span className="text-slate-500 text-xs">{new Date(e.recorded_at).toLocaleString()}</span>
              <span className="ml-3">{e.blood_pressure_systolic && e.blood_pressure_diastolic ? `${e.blood_pressure_systolic}/${e.blood_pressure_diastolic}` : ''}</span>
              {e.heart_rate && <span className="ml-2">HR:{e.heart_rate}</span>}
              {e.temperature_c && <span className="ml-2">{e.temperature_c}°C</span>}
              {e.oxygen_saturation && <span className="ml-2">SpO2:{e.oxygen_saturation}%</span>}
            </div>
            <button onClick={async () => { await deleteVitalSigns(clinicId, locale, patientId, e.id); setEntries(p => p.filter(x => x.id !== e.id)) }} className="text-xs text-red-400 hover:text-red-300">Delete</button>
          </div>
        ))}
        {entries.length === 0 && <p className="text-slate-500 text-sm text-center py-6">No vital signs recorded yet.</p>}
      </div>
    </PremiumCard>
  )
}
