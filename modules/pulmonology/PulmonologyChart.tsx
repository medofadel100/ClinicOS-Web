'use client'

import { useState, useEffect } from 'react'
import { Plus, X, Activity, Wind } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useTranslations } from 'next-intl'
import { upsertPulmonologyNote } from './actions'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

interface Reading {
  id: string;
  date: string;
  fev1: number | null;
  fvc: number | null;
  o2Sat: number | null;
  notes: string;
}

export default function PulmonologyChart({
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
  const _t = useTranslations('Clinical')
  
  const getReadings = (entries: any[]) => {
    const notes = entries.find(n => n.note_type === 'pulmonology_tracker')
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
    const fev1Str = formData.get('fev1') as string
    const fvcStr = formData.get('fvc') as string
    const o2Str = formData.get('o2Sat') as string
    const dateStr = formData.get('date') as string
    
    const newReading: Reading = {
      id: Math.random().toString(36).substring(7),
      date: dateStr ? new Date(dateStr).toISOString() : new Date().toISOString(),
      fev1: fev1Str ? parseFloat(fev1Str) : null,
      fvc: fvcStr ? parseFloat(fvcStr) : null,
      o2Sat: o2Str ? parseInt(o2Str) : null,
      notes: formData.get('notes') as string,
    }

    const updatedReadings = [...readings, newReading].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    try {
      const updatedNotes = await upsertPulmonologyNote(clinicId, locale, patientId, updatedReadings)
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
      const updatedNotes = await upsertPulmonologyNote(clinicId, locale, patientId, updatedReadings)
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
    FEV1: r.fev1,
    FVC: r.fvc
  }))

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <span className="text-xl">🫁</span> Pulmonology & PFT Tracker
          </h3>
          <p className="text-sm text-slate-400">Track Spirometry (FEV1, FVC) and O2 Saturation.</p>
        </div>
        {isOwnerOrDoctor && (
          <button
            onClick={() => setIsDialogOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg text-sm font-medium transition-all shadow-lg shadow-cyan-500/25"
          >
            <Plus className="w-4 h-4" />
            Add PFT Results
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 relative bg-[#0f172a]/50 rounded-2xl border border-white/10 p-6 min-h-[400px] flex flex-col">
          <h4 className="text-sm font-semibold text-slate-200 mb-6 uppercase tracking-wider flex items-center gap-2">
            <Activity className="w-4 h-4 text-cyan-400" /> 
            FEV1 & FVC Trend
          </h4>
          
          <div className="flex-1 w-full h-full min-h-[300px]">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                  <XAxis dataKey="date" stroke="rgba(255,255,255,0.5)" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="rgba(255,255,255,0.5)" fontSize={12} tickLine={false} axisLine={false} domain={['auto', 'auto']} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Legend wrapperStyle={{ paddingTop: '20px' }} />
                  <Line type="monotone" name="FEV1 (L)" dataKey="FEV1" stroke="#06b6d4" strokeWidth={3} dot={{ r: 4, fill: '#06b6d4', strokeWidth: 0 }} activeDot={{ r: 6 }} connectNulls />
                  <Line type="monotone" name="FVC (L)" dataKey="FVC" stroke="#6366f1" strokeWidth={3} dot={{ r: 4, fill: '#6366f1', strokeWidth: 0 }} activeDot={{ r: 6 }} connectNulls />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-500 opacity-60">
                <Wind className="w-10 h-10 mb-2" />
                <p className="text-sm">No PFT data available for chart.</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-[#0f172a]/50 rounded-2xl border border-white/10 p-5 flex flex-col h-[400px]">
          <h4 className="text-sm font-semibold text-slate-200 mb-4 uppercase tracking-wider">Lab History</h4>
          
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
                  <div className="text-[10px] text-slate-400 font-mono mb-2">
                    {new Date(reading.date).toLocaleDateString(locale === 'ar' ? 'ar-EG' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-2">
                    {reading.fev1 && (
                      <div className="bg-black/20 rounded p-2 text-center">
                        <div className="text-[10px] text-slate-500 uppercase">FEV1</div>
                        <div className={`text-sm font-bold text-cyan-400`}>
                          {reading.fev1}L
                        </div>
                      </div>
                    )}
                    {reading.fvc && (
                      <div className="bg-black/20 rounded p-2 text-center">
                        <div className="text-[10px] text-slate-500 uppercase">FVC</div>
                        <div className={`text-sm font-bold text-indigo-400`}>
                          {reading.fvc}L
                        </div>
                      </div>
                    )}
                    {reading.o2Sat && (
                      <div className="bg-black/20 rounded p-2 text-center">
                        <div className="text-[10px] text-slate-500 uppercase">SpO2</div>
                        <div className={`text-sm font-bold ${reading.o2Sat < 90 ? 'text-red-400' : 'text-emerald-400'}`}>
                          {reading.o2Sat}%
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
            <DialogTitle>Add PFT Results</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveReading} className="space-y-4 mt-4">
            
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Date</label>
              <input 
                type="date" 
                name="date"
                required
                defaultValue={new Date().toISOString().split('T')[0]}
                className="w-full h-10 px-3 rounded-lg text-sm bg-black/20 border border-white/10 text-white focus:outline-none focus:border-cyan-500/50 [color-scheme:dark]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">FEV1 (L)</label>
                <input 
                  type="number" 
                  step="0.01"
                  name="fev1"
                  placeholder="e.g. 2.5"
                  className="w-full h-10 px-3 rounded-lg text-sm bg-black/20 border border-white/10 text-white focus:outline-none focus:border-cyan-500/50"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">FVC (L)</label>
                <input 
                  type="number" 
                  step="0.01"
                  name="fvc"
                  placeholder="e.g. 3.5"
                  className="w-full h-10 px-3 rounded-lg text-sm bg-black/20 border border-white/10 text-white focus:outline-none focus:border-cyan-500/50"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">SpO2 (%)</label>
              <input 
                type="number" 
                name="o2Sat"
                placeholder="e.g. 98"
                className="w-full h-10 px-3 rounded-lg text-sm bg-black/20 border border-white/10 text-white focus:outline-none focus:border-cyan-500/50"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Clinical Notes</label>
              <textarea 
                name="notes"
                placeholder="Wheezing, inhaler usage, shortness of breath..."
                className="w-full h-20 p-3 rounded-lg text-sm bg-black/20 border border-white/10 text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/50 resize-none"
              />
            </div>

            <div className="pt-4 mt-6 border-t border-white/10">
              <button
                type="submit"
                disabled={loading}
                className="w-full h-10 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg text-sm font-medium transition-all"
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
