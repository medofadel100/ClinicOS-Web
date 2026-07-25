'use client'

import { useState, useEffect } from 'react'
import { Plus, X, Baby } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useTranslations } from 'next-intl'
import { upsertPediatricsNote } from './actions'

interface Record {
  id: string;
  date: string;
  ageMonths: number | null;
  weightKg: number | null;
  heightCm: number | null;
  headCircCm: number | null;
  vaccinesGiven: string;
  milestones: string;
  diagnosis: string;
  plan: string;
}

export default function PediatricsChart({
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
  
  const getRecords = (entries: any[]) => {
    const notes = entries.find(n => n.note_type === 'pediatrics_tracker')
    return (notes?.content?.records as Record[]) || []
  }
  
  const [entries, setEntries] = useState<any[]>(initialEntries)
  const [records, setRecords] = useState<Record[]>(getRecords(initialEntries))
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const isOwnerOrDoctor = true 

  useEffect(() => {
    setRecords(getRecords(entries))
  }, [entries])

  const handleSaveRecord = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    
    const formData = new FormData(e.currentTarget)
    
    const newRecord: Record = {
      id: Math.random().toString(36).substring(7),
      date: (formData.get('date') as string) ? new Date(formData.get('date') as string).toISOString() : new Date().toISOString(),
      ageMonths: formData.get('ageMonths') ? parseInt(formData.get('ageMonths') as string) : null,
      weightKg: formData.get('weightKg') ? parseFloat(formData.get('weightKg') as string) : null,
      heightCm: formData.get('heightCm') ? parseFloat(formData.get('heightCm') as string) : null,
      headCircCm: formData.get('headCircCm') ? parseFloat(formData.get('headCircCm') as string) : null,
      vaccinesGiven: formData.get('vaccinesGiven') as string,
      milestones: formData.get('milestones') as string,
      diagnosis: formData.get('diagnosis') as string,
      plan: formData.get('plan') as string,
    }

    const updatedRecords = [...records, newRecord].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    try {
      const updatedNotes = await upsertPediatricsNote(clinicId, locale, patientId, updatedRecords)
      setEntries(updatedNotes)
      setIsDialogOpen(false)
    } catch (err) {
      console.error(err)
      alert('Failed to save')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteRecord = async (id: string) => {
    if (!isOwnerOrDoctor) return;
    setLoading(true)
    const updatedRecords = records.filter(r => r.id !== id)
    try {
      const updatedNotes = await upsertPediatricsNote(clinicId, locale, patientId, updatedRecords)
      setEntries(updatedNotes)
    } catch (err) {
      console.error(err)
      alert('Failed to delete')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <span className="text-xl">👶</span> Pediatrics Tracker
          </h3>
          <p className="text-sm text-slate-400">Record Growth Parameters, Milestones, and Vaccinations.</p>
        </div>
        {isOwnerOrDoctor && (
          <button
            onClick={() => setIsDialogOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-lg text-sm font-medium transition-all shadow-lg shadow-pink-500/25"
          >
            <Plus className="w-4 h-4" />
            New Visit Record
          </button>
        )}
      </div>

      <div className="bg-[#0f172a]/50 rounded-2xl border border-white/10 p-5 flex flex-col min-h-[600px]">
        <h4 className="text-sm font-semibold text-slate-200 mb-6 uppercase tracking-wider flex items-center gap-2">
          <Baby className="w-4 h-4 text-pink-400" /> Visit History
        </h4>
        
        <div className="flex-1 space-y-4">
          {records.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 opacity-60 min-h-[300px]">
              <p className="text-sm">No visits recorded yet.</p>
            </div>
          ) : (
            [...records].reverse().map(record => (
              <div key={record.id} className="bg-white/5 border border-white/10 rounded-xl p-5 relative group overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-pink-500/50"></div>
                {isOwnerOrDoctor && (
                  <button 
                    onClick={() => handleDeleteRecord(record.id)}
                    className="absolute top-4 right-4 text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
                
                <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/10">
                  <div className="font-mono text-sm text-pink-400 bg-pink-500/10 px-3 py-1 rounded-full">
                    {new Date(record.date).toLocaleDateString(locale === 'ar' ? 'ar-EG' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </div>
                  
                  {record.ageMonths !== null && (
                    <div className="text-xs font-bold px-2 py-1 rounded bg-black/30 border border-white/5 text-slate-300">
                      Age: {record.ageMonths} months
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6 text-center">
                  <div className="bg-black/20 p-3 rounded-lg border border-white/5">
                    <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Weight</div>
                    <div className="font-bold text-slate-200 text-lg">{record.weightKg || '-'} <span className="text-xs font-normal text-slate-500">kg</span></div>
                  </div>
                  <div className="bg-black/20 p-3 rounded-lg border border-white/5">
                    <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Height/Length</div>
                    <div className="font-bold text-slate-200 text-lg">{record.heightCm || '-'} <span className="text-xs font-normal text-slate-500">cm</span></div>
                  </div>
                  <div className="bg-black/20 p-3 rounded-lg border border-white/5">
                    <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Head Circ.</div>
                    <div className="font-bold text-slate-200 text-lg">{record.headCircCm || '-'} <span className="text-xs font-normal text-slate-500">cm</span></div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 text-sm">
                  {record.vaccinesGiven && (
                    <div className="bg-pink-500/5 p-3 rounded border border-pink-500/10">
                      <span className="block text-pink-400/80 mb-1 uppercase tracking-wider text-xs font-semibold">Vaccinations Given</span>
                      <div className="text-slate-200 whitespace-pre-wrap">{record.vaccinesGiven}</div>
                    </div>
                  )}
                  {record.milestones && (
                    <div className="bg-indigo-500/5 p-3 rounded border border-indigo-500/10">
                      <span className="block text-indigo-400/80 mb-1 uppercase tracking-wider text-xs font-semibold">Milestones / Development</span>
                      <div className="text-slate-200 whitespace-pre-wrap">{record.milestones}</div>
                    </div>
                  )}
                </div>

                {(record.diagnosis || record.plan) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-white/10 text-sm">
                    {record.diagnosis && (
                      <div>
                        <span className="block text-slate-400 mb-1 uppercase tracking-wider text-xs font-semibold">Diagnosis / Notes</span>
                        <div className="text-slate-200">{record.diagnosis}</div>
                      </div>
                    )}
                    {record.plan && (
                      <div>
                        <span className="block text-slate-400 mb-1 uppercase tracking-wider text-xs font-semibold">Plan / Rx / Referrals</span>
                        <div className="text-slate-200 whitespace-pre-wrap">{record.plan}</div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-[#0a0f1e] border border-white/10 text-white sm:max-w-[700px] max-h-[90vh] overflow-y-auto custom-scrollbar">
          <DialogHeader>
            <DialogTitle>New Pediatrics Visit</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveRecord} className="space-y-6 mt-4">
            
            <div className="flex flex-col md:flex-row gap-4">
              <div className="space-y-2 flex-1">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Date</label>
                <input 
                  type="date" 
                  name="date"
                  required
                  defaultValue={new Date().toISOString().split('T')[0]}
                  className="w-full h-10 px-3 rounded-lg text-sm bg-black/20 border border-white/10 text-white focus:outline-none focus:border-pink-500/50 [color-scheme:dark]"
                />
              </div>
              <div className="space-y-2 flex-1">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Age (Months)</label>
                <input type="number" name="ageMonths" placeholder="e.g. 12" className="w-full h-10 px-3 rounded-lg text-sm bg-black/20 border border-white/10 text-white focus:outline-none focus:border-pink-500/50" />
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-4">
              <h3 className="font-bold text-pink-400 border-b border-pink-400/20 pb-2">Growth Parameters</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-400">Weight (kg)</label>
                  <input type="number" step="0.1" name="weightKg" placeholder="kg" className="w-full h-10 px-3 rounded-lg text-sm bg-black/40 border border-white/10 text-white focus:outline-none focus:border-pink-500/50" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-400">Height/Length (cm)</label>
                  <input type="number" step="0.5" name="heightCm" placeholder="cm" className="w-full h-10 px-3 rounded-lg text-sm bg-black/40 border border-white/10 text-white focus:outline-none focus:border-pink-500/50" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-400">Head Circ. (cm)</label>
                  <input type="number" step="0.5" name="headCircCm" placeholder="cm" className="w-full h-10 px-3 rounded-lg text-sm bg-black/40 border border-white/10 text-white focus:outline-none focus:border-pink-500/50" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Vaccinations Administered</label>
                <textarea name="vaccinesGiven" placeholder="e.g. MMR, Varicella, DTaP..." className="w-full h-24 p-3 rounded-lg text-sm bg-black/20 border border-white/10 text-white placeholder:text-slate-600 focus:outline-none focus:border-pink-500/50 resize-none" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Developmental Milestones</label>
                <textarea name="milestones" placeholder="e.g. Walking alone, pointing, saying 3 words..." className="w-full h-24 p-3 rounded-lg text-sm bg-black/20 border border-white/10 text-white placeholder:text-slate-600 focus:outline-none focus:border-pink-500/50 resize-none" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-white/10">
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Diagnosis / Notes</label>
                <textarea name="diagnosis" placeholder="e.g. Well-child check, healthy. Mild URI." className="w-full h-20 p-3 rounded-lg text-sm bg-black/20 border border-white/10 text-white placeholder:text-slate-600 focus:outline-none focus:border-pink-500/50 resize-none" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Plan / Next Visit</label>
                <textarea name="plan" placeholder="e.g. RTC in 3 months for 15-month checkup." className="w-full h-20 p-3 rounded-lg text-sm bg-black/20 border border-white/10 text-white placeholder:text-slate-600 focus:outline-none focus:border-pink-500/50 resize-none" />
              </div>
            </div>

            <div className="pt-4 mt-6 border-t border-white/10">
              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-pink-500 hover:bg-pink-600 text-white rounded-lg text-base font-bold transition-all shadow-lg shadow-pink-500/25"
              >
                {loading ? 'Saving Record...' : 'Save Visit Record'}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
