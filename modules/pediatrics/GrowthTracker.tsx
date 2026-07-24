'use client'

import { useState, useEffect } from 'react'
import { PremiumCard } from '@/components/layout/PageComponents'
import { addGrowthRecord, addVaccination, deleteGrowthRecord, deleteVaccination, getPediatricsData } from './actions'

type GrowthEntry = { id: string; age_months: number; weight_kg?: number; height_cm?: number; head_circumference_cm?: number; bmi?: number; notes?: string; created_at: string }
type VaccEntry = { id: string; vaccine_name: string; dose_number?: number; given_date: string; next_due_date?: string; batch_number?: string; notes?: string; created_at: string }

export default function GrowthTracker({ clinicId, locale, patientId, initialEntries }: {
  clinicId: string; locale: string; patientId: string; initialEntries: any[]
}) {
  const getGrowth = (entries: any[]) => {
    const notes = entries.find((n: any) => n.note_type === 'pediatrics_tracker')
    return (notes?.content?.growth as GrowthEntry[]) || []
  }
  const getVaccines = (entries: any[]) => {
    const notes = entries.find((n: any) => n.note_type === 'pediatrics_tracker')
    return (notes?.content?.vaccines as VaccEntry[]) || []
  }

  const [tab, setTab] = useState<'growth' | 'vaccines'>('growth')
  const [growth, setGrowth] = useState<GrowthEntry[]>(getGrowth(initialEntries))
  const [vaccines, setVaccines] = useState<VaccEntry[]>(getVaccines(initialEntries))
  const [loading, setLoading] = useState(false)
  const [gForm, setGForm] = useState({ age_months: '', weight_kg: '', height_cm: '', head_circumference_cm: '', notes: '' })
  const [vForm, setVForm] = useState({ vaccine_name: '', dose_number: '', given_date: '', next_due_date: '', batch_number: '', notes: '' })

  const ic = "w-full bg-black/30 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/50 transition-all"
  const lc = "text-xs font-medium text-slate-400 mb-1.5 block"

  useEffect(() => {
    setGrowth(getGrowth(initialEntries))
    setVaccines(getVaccines(initialEntries))
  }, [initialEntries])

  const refreshData = async () => {
    try {
      const data = await getPediatricsData(clinicId, patientId)
      setGrowth(data.growth || [])
      setVaccines(data.vaccines || [])
    } catch(err) {
      console.error(err)
    }
  }

  const handleGrowth = async () => {
    setLoading(true)
    try {
      await addGrowthRecord(clinicId, locale, patientId, {
        age_months: parseInt(gForm.age_months), weight_kg: gForm.weight_kg ? parseFloat(gForm.weight_kg) : undefined,
        height_cm: gForm.height_cm ? parseFloat(gForm.height_cm) : undefined,
        head_circumference_cm: gForm.head_circumference_cm ? parseFloat(gForm.head_circumference_cm) : undefined,
        notes: gForm.notes || undefined,
      })
      await refreshData()
      setGForm({ age_months: '', weight_kg: '', height_cm: '', head_circumference_cm: '', notes: '' })
    } catch (err) { console.error(err); alert('Failed') }
    finally { setLoading(false) }
  }

  const handleVaccine = async () => {
    setLoading(true)
    try {
      await addVaccination(clinicId, locale, patientId, {
        vaccine_name: vForm.vaccine_name, dose_number: vForm.dose_number ? parseInt(vForm.dose_number) : undefined,
        given_date: vForm.given_date || undefined, next_due_date: vForm.next_due_date || undefined,
        batch_number: vForm.batch_number || undefined, notes: vForm.notes || undefined,
      })
      await refreshData()
      setVForm({ vaccine_name: '', dose_number: '', given_date: '', next_due_date: '', batch_number: '', notes: '' })
    } catch (err) { console.error(err); alert('Failed') }
    finally { setLoading(false) }
  }

  const maxWeight = Math.max(...growth.filter(g => g.weight_kg).map(g => g.weight_kg!), 1)

  return (
    <PremiumCard>
      <div className="mb-6 pb-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <h2 className="text-base font-semibold text-slate-200">Growth & Development Tracker</h2>
        <p className="text-sm text-slate-500 mt-0.5">Track growth measurements and vaccination schedule.</p>
      </div>

      <div className="flex gap-2 mb-6">
        {(['growth', 'vaccines'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-5 py-2 rounded-xl text-sm font-medium transition-all ${tab === t ? 'bg-teal-500/20 text-teal-400 border border-teal-500/30' : 'bg-white/[0.03] text-slate-400 border border-white/[0.06] hover:bg-white/[0.06]'}`}>
            {t === 'growth' ? 'Growth Records' : 'Vaccinations'}
          </button>
        ))}
      </div>

      {tab === 'growth' && (
        <div className="space-y-6">
          <div className="p-4 rounded-xl bg-black/20 border border-white/5 grid grid-cols-2 md:grid-cols-5 gap-4">
            <div><label className={lc}>Age (months)</label><input type="number" value={gForm.age_months} onChange={e => setGForm(p => ({...p, age_months: e.target.value}))} className={ic} /></div>
            <div><label className={lc}>Weight (kg)</label><input type="number" step="0.1" value={gForm.weight_kg} onChange={e => setGForm(p => ({...p, weight_kg: e.target.value}))} className={ic} /></div>
            <div><label className={lc}>Height (cm)</label><input type="number" step="0.1" value={gForm.height_cm} onChange={e => setGForm(p => ({...p, height_cm: e.target.value}))} className={ic} /></div>
            <div><label className={lc}>Head Circ. (cm)</label><input type="number" step="0.1" value={gForm.head_circumference_cm} onChange={e => setGForm(p => ({...p, head_circumference_cm: e.target.value}))} className={ic} /></div>
            <div className="flex items-end"><button onClick={handleGrowth} disabled={loading || !gForm.age_months} className="w-full py-2.5 rounded-xl text-sm font-semibold bg-teal-500/20 text-teal-400 border border-teal-500/30 hover:bg-teal-500/30 transition-all disabled:opacity-50">{loading ? '...' : 'Add'}</button></div>
          </div>

          {growth.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Weight Trend</h3>
              <div className="flex items-end gap-1 h-32">
                {growth.map(g => (
                  <div key={g.id} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-[10px] text-slate-500">{g.weight_kg || '-'}</span>
                    <div className="w-full rounded-t-md bg-teal-500/30 transition-all" style={{ height: `${g.weight_kg ? (g.weight_kg / maxWeight) * 100 : 0}%`, minHeight: g.weight_kg ? '4px' : '0' }} />
                    <span className="text-[9px] text-slate-600">{g.age_months}m</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-2">
            {growth.map(g => (
              <div key={g.id} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                <div className="text-sm text-slate-300">
                  <span className="text-slate-500">{g.age_months}m:</span> {g.weight_kg ? `${g.weight_kg}kg` : ''} {g.height_cm ? `/ ${g.height_cm}cm` : ''} {g.bmi ? `/ BMI ${g.bmi}` : ''}
                </div>
                <button onClick={async () => { await deleteGrowthRecord(clinicId, locale, patientId, g.id); await refreshData() }} className="text-xs text-red-400 hover:text-red-300">Delete</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'vaccines' && (
        <div className="space-y-6">
          <div className="p-4 rounded-xl bg-black/20 border border-white/5 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div><label className={lc}>Vaccine Name</label><input type="text" value={vForm.vaccine_name} onChange={e => setVForm(p => ({...p, vaccine_name: e.target.value}))} className={ic} placeholder="e.g. BCG" /></div>
            <div><label className={lc}>Dose #</label><input type="number" value={vForm.dose_number} onChange={e => setVForm(p => ({...p, dose_number: e.target.value}))} className={ic} /></div>
            <div><label className={lc}>Given Date</label><input type="date" value={vForm.given_date} onChange={e => setVForm(p => ({...p, given_date: e.target.value}))} className={ic} /></div>
            <div><label className={lc}>Next Due</label><input type="date" value={vForm.next_due_date} onChange={e => setVForm(p => ({...p, next_due_date: e.target.value}))} className={ic} /></div>
            <div className="md:col-span-4 flex justify-end"><button onClick={handleVaccine} disabled={loading || !vForm.vaccine_name} className="px-6 py-2.5 rounded-xl text-sm font-semibold bg-teal-500/20 text-teal-400 border border-teal-500/30 hover:bg-teal-500/30 transition-all disabled:opacity-50">{loading ? '...' : 'Add Vaccination'}</button></div>
          </div>
          <div className="space-y-2">
            {vaccines.map(v => {
              const isOverdue = v.next_due_date && new Date(v.next_due_date) < new Date()
              return (
                <div key={v.id} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                  <div className="text-sm text-slate-300">
                    <span className="font-medium">{v.vaccine_name}</span> {v.dose_number ? `#${v.dose_number}` : ''} — {v.given_date}
                    {v.next_due_date && <span className={`ml-2 text-xs ${isOverdue ? 'text-red-400' : 'text-slate-500'}`}>Next: {v.next_due_date}</span>}
                  </div>
                  <button onClick={async () => { await deleteVaccination(clinicId, locale, patientId, v.id); await refreshData() }} className="text-xs text-red-400 hover:text-red-300">Delete</button>
                </div>
              )
            })}
            {vaccines.length === 0 && <p className="text-slate-500 text-sm text-center py-6">No vaccinations recorded.</p>}
          </div>
        </div>
      )}
    </PremiumCard>
  )
}
