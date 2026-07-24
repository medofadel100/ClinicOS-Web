'use client'

import { useState, useEffect } from 'react'
import { Plus, X, Eye } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useTranslations } from 'next-intl'
import { upsertOphthalmologyNote } from './actions'

interface EyeExam {
  visualAcuity: string;
  iop: number | null;
  slitLamp: string;
  fundus: string;
}

interface Record {
  id: string;
  date: string;
  od: EyeExam; // Right Eye
  os: EyeExam; // Left Eye
  diagnosis: string;
  plan: string;
}

export default function OphthalmologyChart({
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
    const notes = entries.find(n => n.note_type === 'ophthalmology_tracker')
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
      od: {
        visualAcuity: formData.get('od_va') as string,
        iop: formData.get('od_iop') ? parseInt(formData.get('od_iop') as string) : null,
        slitLamp: formData.get('od_slit') as string,
        fundus: formData.get('od_fundus') as string,
      },
      os: {
        visualAcuity: formData.get('os_va') as string,
        iop: formData.get('os_iop') ? parseInt(formData.get('os_iop') as string) : null,
        slitLamp: formData.get('os_slit') as string,
        fundus: formData.get('os_fundus') as string,
      },
      diagnosis: formData.get('diagnosis') as string,
      plan: formData.get('plan') as string,
    }

    const updatedRecords = [...records, newRecord].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    try {
      const updatedNotes = await upsertOphthalmologyNote(clinicId, locale, patientId, updatedRecords)
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
      const updatedNotes = await upsertOphthalmologyNote(clinicId, locale, patientId, updatedRecords)
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
            <span className="text-xl">👁️</span> Ophthalmology Exam
          </h3>
          <p className="text-sm text-slate-400">Record comprehensive eye exams (OD/OS), IOP, and Funduscopy.</p>
        </div>
        {isOwnerOrDoctor && (
          <button
            onClick={() => setIsDialogOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-sm font-medium transition-all shadow-lg shadow-emerald-500/25"
          >
            <Plus className="w-4 h-4" />
            New Eye Exam
          </button>
        )}
      </div>

      <div className="bg-[#0f172a]/50 rounded-2xl border border-white/10 p-5 flex flex-col min-h-[600px]">
        <h4 className="text-sm font-semibold text-slate-200 mb-6 uppercase tracking-wider flex items-center gap-2">
          <Eye className="w-4 h-4 text-emerald-400" /> Exam History
        </h4>
        
        <div className="flex-1 space-y-4">
          {records.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 opacity-60 min-h-[300px]">
              <p className="text-sm">No exams recorded yet.</p>
            </div>
          ) : (
            [...records].reverse().map(record => (
              <div key={record.id} className="bg-white/5 border border-white/10 rounded-xl p-5 relative group overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500/50"></div>
                {isOwnerOrDoctor && (
                  <button 
                    onClick={() => handleDeleteRecord(record.id)}
                    className="absolute top-4 right-4 text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
                
                <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/10">
                  <div className="font-mono text-sm text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full">
                    {new Date(record.date).toLocaleDateString(locale === 'ar' ? 'ar-EG' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {/* OD - Right Eye */}
                  <div className="space-y-3 bg-black/20 p-4 rounded-xl border border-white/5">
                    <h5 className="font-bold text-slate-300 border-b border-white/10 pb-2 flex justify-between">
                      <span>OD (Right Eye)</span>
                    </h5>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="text-slate-400">Visual Acuity:</div>
                      <div className="font-mono text-white">{record.od.visualAcuity || '-'}</div>
                      
                      <div className="text-slate-400">IOP (mmHg):</div>
                      <div className="font-mono text-white flex items-center gap-2">
                        {record.od.iop || '-'}
                        {record.od.iop && record.od.iop > 21 && <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" title="High IOP" />}
                      </div>
                    </div>
                    {record.od.slitLamp && (
                      <div className="text-sm">
                        <div className="text-slate-400 mb-1">Slit Lamp:</div>
                        <div className="text-slate-300 bg-black/40 p-2 rounded">{record.od.slitLamp}</div>
                      </div>
                    )}
                    {record.od.fundus && (
                      <div className="text-sm">
                        <div className="text-slate-400 mb-1">Fundus:</div>
                        <div className="text-slate-300 bg-black/40 p-2 rounded">{record.od.fundus}</div>
                      </div>
                    )}
                  </div>

                  {/* OS - Left Eye */}
                  <div className="space-y-3 bg-black/20 p-4 rounded-xl border border-white/5">
                    <h5 className="font-bold text-slate-300 border-b border-white/10 pb-2 flex justify-between">
                      <span>OS (Left Eye)</span>
                    </h5>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="text-slate-400">Visual Acuity:</div>
                      <div className="font-mono text-white">{record.os.visualAcuity || '-'}</div>
                      
                      <div className="text-slate-400">IOP (mmHg):</div>
                      <div className="font-mono text-white flex items-center gap-2">
                        {record.os.iop || '-'}
                        {record.os.iop && record.os.iop > 21 && <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" title="High IOP" />}
                      </div>
                    </div>
                    {record.os.slitLamp && (
                      <div className="text-sm">
                        <div className="text-slate-400 mb-1">Slit Lamp:</div>
                        <div className="text-slate-300 bg-black/40 p-2 rounded">{record.os.slitLamp}</div>
                      </div>
                    )}
                    {record.os.fundus && (
                      <div className="text-sm">
                        <div className="text-slate-400 mb-1">Fundus:</div>
                        <div className="text-slate-300 bg-black/40 p-2 rounded">{record.os.fundus}</div>
                      </div>
                    )}
                  </div>
                </div>

                {(record.diagnosis || record.plan) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-white/10 text-sm">
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
                )}
              </div>
            ))
          )}
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-[#0a0f1e] border border-white/10 text-white sm:max-w-[700px] max-h-[90vh] overflow-y-auto custom-scrollbar">
          <DialogHeader>
            <DialogTitle>New Ophthalmology Exam</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveRecord} className="space-y-6 mt-4">
            
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Date of Exam</label>
              <input 
                type="date" 
                name="date"
                required
                defaultValue={new Date().toISOString().split('T')[0]}
                className="w-full md:w-1/3 h-10 px-3 rounded-lg text-sm bg-black/20 border border-white/10 text-white focus:outline-none focus:border-emerald-500/50 [color-scheme:dark]"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* OD INPUTS */}
              <div className="space-y-4 p-4 bg-white/5 border border-white/10 rounded-xl">
                <h3 className="font-bold text-emerald-400 border-b border-emerald-400/20 pb-2">OD (Right Eye)</h3>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-400">Visual Acuity</label>
                    <select name="od_va" className="w-full h-10 px-3 rounded-lg text-sm bg-black/40 border border-white/10 text-white focus:outline-none focus:border-emerald-500/50">
                      <option value="">Select...</option>
                      <option value="20/20">20/20</option>
                      <option value="20/25">20/25</option>
                      <option value="20/30">20/30</option>
                      <option value="20/40">20/40</option>
                      <option value="20/50">20/50</option>
                      <option value="20/60">20/60</option>
                      <option value="20/100">20/100</option>
                      <option value="20/200">20/200</option>
                      <option value="CF">CF (Count Fingers)</option>
                      <option value="HM">HM (Hand Motion)</option>
                      <option value="LP">LP (Light Perception)</option>
                      <option value="NLP">NLP (No Light Perception)</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-400">IOP (mmHg)</label>
                    <input type="number" name="od_iop" placeholder="e.g. 15" className="w-full h-10 px-3 rounded-lg text-sm bg-black/40 border border-white/10 text-white focus:outline-none focus:border-emerald-500/50" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-400">Slit Lamp Exam</label>
                  <textarea name="od_slit" defaultValue="Lids/Lashes: Normal\nConjunctiva: Clear\nCornea: Clear\nAC: Deep & Quiet\nIris: Normal\nLens: Clear" className="w-full h-24 p-3 rounded-lg text-sm bg-black/40 border border-white/10 text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500/50 resize-none" />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-400">Fundus / Retina</label>
                  <textarea name="od_fundus" defaultValue="Disc: Sharp pink, C/D 0.3\nMacula: Flat, normal reflex\nVessels: Normal caliber\nPeriphery: Flat" className="w-full h-24 p-3 rounded-lg text-sm bg-black/40 border border-white/10 text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500/50 resize-none" />
                </div>
              </div>

              {/* OS INPUTS */}
              <div className="space-y-4 p-4 bg-white/5 border border-white/10 rounded-xl">
                <h3 className="font-bold text-emerald-400 border-b border-emerald-400/20 pb-2">OS (Left Eye)</h3>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-400">Visual Acuity</label>
                    <select name="os_va" className="w-full h-10 px-3 rounded-lg text-sm bg-black/40 border border-white/10 text-white focus:outline-none focus:border-emerald-500/50">
                      <option value="">Select...</option>
                      <option value="20/20">20/20</option>
                      <option value="20/25">20/25</option>
                      <option value="20/30">20/30</option>
                      <option value="20/40">20/40</option>
                      <option value="20/50">20/50</option>
                      <option value="20/60">20/60</option>
                      <option value="20/100">20/100</option>
                      <option value="20/200">20/200</option>
                      <option value="CF">CF (Count Fingers)</option>
                      <option value="HM">HM (Hand Motion)</option>
                      <option value="LP">LP (Light Perception)</option>
                      <option value="NLP">NLP (No Light Perception)</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-400">IOP (mmHg)</label>
                    <input type="number" name="os_iop" placeholder="e.g. 15" className="w-full h-10 px-3 rounded-lg text-sm bg-black/40 border border-white/10 text-white focus:outline-none focus:border-emerald-500/50" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-400">Slit Lamp Exam</label>
                  <textarea name="os_slit" defaultValue="Lids/Lashes: Normal\nConjunctiva: Clear\nCornea: Clear\nAC: Deep & Quiet\nIris: Normal\nLens: Clear" className="w-full h-24 p-3 rounded-lg text-sm bg-black/40 border border-white/10 text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500/50 resize-none" />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-400">Fundus / Retina</label>
                  <textarea name="os_fundus" defaultValue="Disc: Sharp pink, C/D 0.3\nMacula: Flat, normal reflex\nVessels: Normal caliber\nPeriphery: Flat" className="w-full h-24 p-3 rounded-lg text-sm bg-black/40 border border-white/10 text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500/50 resize-none" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-white/10">
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Assessment / Diagnosis</label>
                <textarea name="diagnosis" placeholder="e.g. Primary Open Angle Glaucoma, Cataract" className="w-full h-20 p-3 rounded-lg text-sm bg-black/20 border border-white/10 text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500/50 resize-none" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Plan / Rx</label>
                <textarea name="plan" placeholder="e.g. Latanoprost 0.005% qhs OU, RTC in 3 months" className="w-full h-20 p-3 rounded-lg text-sm bg-black/20 border border-white/10 text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500/50 resize-none" />
              </div>
            </div>

            <div className="pt-4 mt-6 border-t border-white/10">
              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-base font-bold transition-all shadow-lg shadow-emerald-500/25"
              >
                {loading ? 'Saving Exam...' : 'Save Ophthalmology Exam'}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
