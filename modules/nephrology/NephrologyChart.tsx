'use client'

import { useState, useEffect } from 'react'
import { Plus, X, Activity, Droplets } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useTranslations } from 'next-intl'
import { upsertNephrologyNote } from './actions'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

interface Reading {
  id: string;
  date: string;
  egfr: number | null;
  creatinine: number | null;
  dialysisCompleted: boolean;
  notes: string;
}

export default function NephrologyChart({
  patientId,
  clinicId,
  locale,
  initialEntries
}: {
  patientId: string;
  clinicId: string;
  locale: string;
  initialEntries: any[];
}) {
  const t = useTranslations('Clinical')
  
  const getReadings = (entries: any[]) => {
    const notes = entries.find(n => n.note_type === 'nephrology_tracker')
    return (notes?.content?.readings as Reading[]) || []
  }
  
  const [entries, setEntries] = useState<any[]>(initialEntries)
  const [readings, setReadings] = useState<Reading[]>(getReadings(initialEntries))
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const isOwnerOrDoctor = true 

  useEffect(() => {
    setReadings(getReadings(entries))
  }, [entries])

  const handleSaveReading = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    
    const formData = new FormData(e.currentTarget)
    const egfrStr = formData.get('egfr') as string
    const creaStr = formData.get('creatinine') as string
    const dialysis = formData.get('dialysisCompleted') === 'on'
    const dateStr = formData.get('date') as string
    
    const newReading: Reading = {
      id: Math.random().toString(36).substring(7),
      date: dateStr ? new Date(dateStr).toISOString() : new Date().toISOString(),
      egfr: egfrStr ? parseFloat(egfrStr) : null,
      creatinine: creaStr ? parseFloat(creaStr) : null,
      dialysisCompleted: dialysis,
      notes: formData.get('notes') as string,
    }

    const updatedReadings = [...readings, newReading].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    try {
      const updatedNotes = await upsertNephrologyNote(clinicId, locale, patientId, updatedReadings)
      setEntries(updatedNotes)
      setIsDialogOpen(false)
    } catch (err) {
      console.error(err)
      alert('Failed to save')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteReading = async (id: string) => {
    if (!isOwnerOrDoctor) return;
    setLoading(true)
    const updatedReadings = readings.filter(r => r.id !== id)
    try {
      const updatedNotes = await upsertNephrologyNote(clinicId, locale, patientId, updatedReadings)
      setEntries(updatedNotes)
    } catch (err) {
      console.error(err)
      alert('Failed to delete')
    } finally {
      setLoading(false)
    }
  }

  const chartData = readings.map(r => ({
    date: new Date(r.date).toLocaleDateString(locale === 'ar' ? 'ar-EG' : 'en-US', { month: 'short', day: 'numeric' }),
    eGFR: r.egfr,
    Creatinine: r.creatinine
  }))

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <span className="text-xl">🩺</span> Nephrology & Renal Tracker
          </h3>
          <p className="text-sm text-slate-400">Track eGFR, Creatinine, and Dialysis sessions.</p>
        </div>
        {isOwnerOrDoctor && (
          <button
            onClick={() => setIsDialogOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-all shadow-lg shadow-blue-500/25"
          >
            <Plus className="w-4 h-4" />
            Add Renal Lab
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 relative bg-[#0f172a]/50 rounded-2xl border border-white/10 p-6 min-h-[400px] flex flex-col">
          <h4 className="text-sm font-semibold text-slate-200 mb-6 uppercase tracking-wider flex items-center gap-2">
            <Activity className="w-4 h-4 text-blue-400" /> 
            eGFR & Creatinine Trend
          </h4>
          
          <div className="flex-1 w-full h-full min-h-[300px]">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                  <XAxis dataKey="date" stroke="rgba(255,255,255,0.5)" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis yAxisId="left" stroke="rgba(255,255,255,0.5)" fontSize={12} tickLine={false} axisLine={false} domain={['auto', 'auto']} />
                  <YAxis yAxisId="right" orientation="right" stroke="rgba(255,255,255,0.5)" fontSize={12} tickLine={false} axisLine={false} domain={['auto', 'auto']} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Legend wrapperStyle={{ paddingTop: '20px' }} />
                  <Line yAxisId="left" type="monotone" name="eGFR (mL/min)" dataKey="eGFR" stroke="#60a5fa" strokeWidth={3} dot={{ r: 4, fill: '#60a5fa', strokeWidth: 0 }} activeDot={{ r: 6 }} connectNulls />
                  <Line yAxisId="right" type="monotone" name="Creatinine (mg/dL)" dataKey="Creatinine" stroke="#f43f5e" strokeWidth={3} dot={{ r: 4, fill: '#f43f5e', strokeWidth: 0 }} activeDot={{ r: 6 }} connectNulls />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-500 opacity-60">
                <Droplets className="w-10 h-10 mb-2" />
                <p className="text-sm">No renal data available for chart.</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-[#0f172a]/50 rounded-2xl border border-white/10 p-5 flex flex-col h-[400px]">
          <h4 className="text-sm font-semibold text-slate-200 mb-4 uppercase tracking-wider">History & Dialysis</h4>
          
          <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
            {readings.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 opacity-60">
                <p className="text-sm">No results recorded yet.</p>
              </div>
            ) : (
              [...readings].reverse().map(reading => (
                <div key={reading.id} className="bg-white/5 border border-white/10 rounded-xl p-4 relative group">
                  {isOwnerOrDoctor && (
                    <button 
                      onClick={() => handleDeleteReading(reading.id)}
                      className="absolute top-2 right-2 text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                  <div className="text-[10px] text-slate-400 font-mono mb-2 flex items-center justify-between">
                    <span>{new Date(reading.date).toLocaleDateString(locale === 'ar' ? 'ar-EG' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                    {reading.dialysisCompleted && (
                      <span className="bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded uppercase tracking-wider">Dialysis</span>
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2">
                    {reading.egfr && (
                      <div className="bg-black/20 rounded p-2 text-center">
                        <div className="text-[10px] text-slate-500 uppercase">eGFR</div>
                        <div className={`text-lg font-bold ${reading.egfr < 60 ? 'text-red-400' : 'text-blue-400'}`}>
                          {reading.egfr}
                        </div>
                      </div>
                    )}
                    {reading.creatinine && (
                      <div className="bg-black/20 rounded p-2 text-center">
                        <div className="text-[10px] text-slate-500 uppercase">Creatinine</div>
                        <div className={`text-lg font-bold ${reading.creatinine > 1.2 ? 'text-red-400' : 'text-amber-400'}`}>
                          {reading.creatinine}
                        </div>
                      </div>
                    )}
                  </div>
                  {reading.notes && (
                    <div className="text-xs text-slate-400 bg-white/5 p-2 rounded line-clamp-2">
                      {reading.notes}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-[#0a0f1e] border border-white/10 text-white sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Renal Results</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveReading} className="space-y-4 mt-4">
            
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Date</label>
              <input 
                type="date" 
                name="date"
                required
                defaultValue={new Date().toISOString().split('T')[0]}
                className="w-full h-10 px-3 rounded-lg text-sm bg-black/20 border border-white/10 text-white focus:outline-none focus:border-blue-500/50 [color-scheme:dark]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">eGFR</label>
                <input 
                  type="number" 
                  step="0.1"
                  name="egfr"
                  placeholder="mL/min"
                  className="w-full h-10 px-3 rounded-lg text-sm bg-black/20 border border-white/10 text-white focus:outline-none focus:border-blue-500/50"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Creatinine</label>
                <input 
                  type="number" 
                  step="0.1"
                  name="creatinine"
                  placeholder="mg/dL"
                  className="w-full h-10 px-3 rounded-lg text-sm bg-black/20 border border-white/10 text-white focus:outline-none focus:border-blue-500/50"
                />
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <label className="flex items-center gap-3 p-3 border border-white/10 rounded-lg cursor-pointer hover:bg-white/5 transition-colors">
                <input 
                  type="checkbox" 
                  name="dialysisCompleted"
                  className="w-4 h-4 rounded border-slate-600 bg-black/50 text-blue-500 focus:ring-blue-500/50"
                />
                <span className="text-sm font-medium text-slate-200">Dialysis Session Completed</span>
              </label>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Clinical Notes</label>
              <textarea 
                name="notes"
                placeholder="Fluid intake, urine output, symptoms..."
                className="w-full h-20 p-3 rounded-lg text-sm bg-black/20 border border-white/10 text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50 resize-none"
              />
            </div>

            <div className="pt-4 mt-6 border-t border-white/10">
              <button
                type="submit"
                disabled={loading}
                className="w-full h-10 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-all"
              >
                {loading ? 'Saving...' : 'Save Results'}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
