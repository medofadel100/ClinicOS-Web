'use client'

import { useState, useEffect } from 'react'
import { Plus, X, Ear } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useTranslations } from 'next-intl'
import { upsertENTNote } from './actions'

interface Record {
  id: string;
  date: string;
  ear_right: string;
  ear_left: string;
  nose: string;
  throat: string;
  hearing_test: string;
  diagnosis: string;
  plan: string;
}

export default function ENTChart({
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
    const notes = entries.find(n => n.note_type === 'ent_tracker')
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
      ear_right: formData.get('ear_right') as string,
      ear_left: formData.get('ear_left') as string,
      nose: formData.get('nose') as string,
      throat: formData.get('throat') as string,
      hearing_test: formData.get('hearing_test') as string,
      diagnosis: formData.get('diagnosis') as string,
      plan: formData.get('plan') as string,
    }

    const updatedRecords = [...records, newRecord].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    try {
      const updatedNotes = await upsertENTNote(clinicId, locale, patientId, updatedRecords)
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
      const updatedNotes = await upsertENTNote(clinicId, locale, patientId, updatedRecords)
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
            <span className="text-xl">👂</span> ENT (Otolaryngology) Exam
          </h3>
          <p className="text-sm text-slate-400">Record Otoscopy, Rhinoscopy, Throat exam, and Hearing tests.</p>
        </div>
        {isOwnerOrDoctor && (
          <button
            onClick={() => setIsDialogOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-sm font-medium transition-all shadow-lg shadow-amber-500/25"
          >
            <Plus className="w-4 h-4" />
            New ENT Exam
          </button>
        )}
      </div>

      <div className="bg-[#0f172a]/50 rounded-2xl border border-white/10 p-5 flex flex-col min-h-[600px]">
        <h4 className="text-sm font-semibold text-slate-200 mb-6 uppercase tracking-wider flex items-center gap-2">
          <Ear className="w-4 h-4 text-amber-400" /> Exam History
        </h4>
        
        <div className="flex-1 space-y-4">
          {records.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 opacity-60 min-h-[300px]">
              <p className="text-sm">No exams recorded yet.</p>
            </div>
          ) : (
            [...records].reverse().map(record => (
              <div key={record.id} className="bg-white/5 border border-white/10 rounded-xl p-5 relative group overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-amber-500/50"></div>
                {isOwnerOrDoctor && (
                  <button 
                    onClick={() => handleDeleteRecord(record.id)}
                    className="absolute top-4 right-4 text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
                
                <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/10">
                  <div className="font-mono text-sm text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full">
                    {new Date(record.date).toLocaleDateString(locale === 'ar' ? 'ar-EG' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="space-y-4">
                    <div className="bg-black/20 p-3 rounded-lg border border-white/5">
                      <div className="text-xs font-bold text-slate-400 uppercase mb-1">Right Ear (AD)</div>
                      <div className="text-sm text-slate-200 whitespace-pre-wrap">{record.ear_right || '-'}</div>
                    </div>
                    <div className="bg-black/20 p-3 rounded-lg border border-white/5">
                      <div className="text-xs font-bold text-slate-400 uppercase mb-1">Left Ear (AS)</div>
                      <div className="text-sm text-slate-200 whitespace-pre-wrap">{record.ear_left || '-'}</div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-black/20 p-3 rounded-lg border border-white/5">
                      <div className="text-xs font-bold text-slate-400 uppercase mb-1">Nose / Sinuses</div>
                      <div className="text-sm text-slate-200 whitespace-pre-wrap">{record.nose || '-'}</div>
                    </div>
                    <div className="bg-black/20 p-3 rounded-lg border border-white/5">
                      <div className="text-xs font-bold text-slate-400 uppercase mb-1">Throat / Oral Cavity</div>
                      <div className="text-sm text-slate-200 whitespace-pre-wrap">{record.throat || '-'}</div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-white/10 text-sm">
                  {record.hearing_test && (
                    <div>
                      <span className="block text-slate-400 mb-1 uppercase tracking-wider text-xs font-semibold">Hearing Tests</span>
                      <div className="text-slate-200">{record.hearing_test}</div>
                    </div>
                  )}
                  {record.diagnosis && (
                    <div>
                      <span className="block text-slate-400 mb-1 uppercase tracking-wider text-xs font-semibold">Diagnosis</span>
                      <div className="text-slate-200">{record.diagnosis}</div>
                    </div>
                  )}
                  {record.plan && (
                    <div>
                      <span className="block text-slate-400 mb-1 uppercase tracking-wider text-xs font-semibold">Plan / Rx</span>
                      <div className="text-slate-200">{record.plan}</div>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-[#0a0f1e] border border-white/10 text-white sm:max-w-[700px] max-h-[90vh] overflow-y-auto custom-scrollbar">
          <DialogHeader>
            <DialogTitle>New ENT Exam</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveRecord} className="space-y-6 mt-4">
            
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Date of Exam</label>
              <input 
                type="date" 
                name="date"
                required
                defaultValue={new Date().toISOString().split('T')[0]}
                className="w-full md:w-1/3 h-10 px-3 rounded-lg text-sm bg-black/20 border border-white/10 text-white focus:outline-none focus:border-amber-500/50 [color-scheme:dark]"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-amber-400">Right Ear (Otoscopy)</label>
                <textarea name="ear_right" defaultValue="EAC: Clear\nTM: Intact, pearly gray\nCone of light: Present" className="w-full h-24 p-3 rounded-lg text-sm bg-black/40 border border-white/10 text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-500/50 resize-none" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-amber-400">Left Ear (Otoscopy)</label>
                <textarea name="ear_left" defaultValue="EAC: Clear\nTM: Intact, pearly gray\nCone of light: Present" className="w-full h-24 p-3 rounded-lg text-sm bg-black/40 border border-white/10 text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-500/50 resize-none" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-amber-400">Nose / Rhinoscopy</label>
                <textarea name="nose" defaultValue="Septum: Midline\nTurbinates: Normal, no hypertrophy\nMucosa: Pink, moist" className="w-full h-24 p-3 rounded-lg text-sm bg-black/40 border border-white/10 text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-500/50 resize-none" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-amber-400">Throat / Larynx</label>
                <textarea name="throat" defaultValue="Tonsils: Grade 1, no exudate\nPharynx: Normal\nUvula: Midline" className="w-full h-24 p-3 rounded-lg text-sm bg-black/40 border border-white/10 text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-500/50 resize-none" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Hearing / Tuning Fork (Weber/Rinne)</label>
              <textarea name="hearing_test" placeholder="Weber midline, Rinne AC > BC bilaterally" className="w-full h-16 p-3 rounded-lg text-sm bg-black/20 border border-white/10 text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-500/50 resize-none" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-white/10">
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Assessment / Diagnosis</label>
                <textarea name="diagnosis" placeholder="e.g. Acute Otitis Media, Allergic Rhinitis" className="w-full h-20 p-3 rounded-lg text-sm bg-black/20 border border-white/10 text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-500/50 resize-none" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Plan / Rx</label>
                <textarea name="plan" placeholder="e.g. Amoxicillin 500mg BID, Fluticasone spray" className="w-full h-20 p-3 rounded-lg text-sm bg-black/20 border border-white/10 text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-500/50 resize-none" />
              </div>
            </div>

            <div className="pt-4 mt-6 border-t border-white/10">
              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-base font-bold transition-all shadow-lg shadow-amber-500/25"
              >
                {loading ? 'Saving Exam...' : 'Save ENT Exam'}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
