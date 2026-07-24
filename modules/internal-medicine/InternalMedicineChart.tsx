'use client'

import { useState, useEffect } from 'react'
import { Plus, X, FileText, ClipboardList } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useTranslations } from 'next-intl'
import { upsertInternalMedicineNote } from './actions'

interface SOAPNote {
  id: string;
  date: string;
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
}

export default function InternalMedicineChart({
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
  
  const getNotes = (entries: any[]) => {
    const notes = entries.find(n => n.note_type === 'internal_medicine_notes')
    return (notes?.content?.notes as SOAPNote[]) || []
  }
  
  const [entries, setEntries] = useState<any[]>(initialEntries)
  const [notes, setNotes] = useState<SOAPNote[]>(getNotes(initialEntries))
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [expandedNote, setExpandedNote] = useState<string | null>(null)

  const isOwnerOrDoctor = true 

  useEffect(() => {
    setNotes(getNotes(entries))
  }, [entries])

  const handleSaveNote = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    
    const formData = new FormData(e.currentTarget)
    
    const newNote: SOAPNote = {
      id: Math.random().toString(36).substring(7),
      date: (formData.get('date') as string) ? new Date(formData.get('date') as string).toISOString() : new Date().toISOString(),
      subjective: formData.get('subjective') as string,
      objective: formData.get('objective') as string,
      assessment: formData.get('assessment') as string,
      plan: formData.get('plan') as string,
    }

    const updatedNotes = [...notes, newNote].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    try {
      const dbNotes = await upsertInternalMedicineNote(clinicId, locale, patientId, updatedNotes)
      setEntries(dbNotes)
      setIsDialogOpen(false)
    } catch (err) {
      console.error(err)
      alert('Failed to save')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteNote = async (id: string) => {
    if (!isOwnerOrDoctor) return;
    if (!confirm('Are you sure you want to delete this note?')) return;
    setLoading(true)
    const updatedNotes = notes.filter(n => n.id !== id)
    try {
      const dbNotes = await upsertInternalMedicineNote(clinicId, locale, patientId, updatedNotes)
      setEntries(dbNotes)
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
            <span className="text-xl">🩺</span> Internal Medicine
          </h3>
          <p className="text-sm text-slate-400">Comprehensive SOAP notes and general medical history.</p>
        </div>
        {isOwnerOrDoctor && (
          <button
            onClick={() => setIsDialogOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg text-sm font-medium transition-all shadow-lg shadow-indigo-500/25"
          >
            <Plus className="w-4 h-4" />
            New SOAP Note
          </button>
        )}
      </div>

      <div className="bg-[#0f172a]/50 rounded-2xl border border-white/10 p-5 flex flex-col min-h-[600px]">
        <h4 className="text-sm font-semibold text-slate-200 mb-6 uppercase tracking-wider flex items-center gap-2">
          <ClipboardList className="w-4 h-4 text-indigo-400" /> Clinical Notes History
        </h4>
        
        <div className="flex-1 space-y-4">
          {notes.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 opacity-60 min-h-[300px]">
              <FileText className="w-12 h-12 mb-3 text-slate-600" />
              <p className="text-sm">No notes recorded yet.</p>
            </div>
          ) : (
            [...notes].reverse().map(note => (
              <div key={note.id} className="bg-white/5 border border-white/10 rounded-xl p-0 relative overflow-hidden transition-all duration-200">
                <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500/50"></div>
                
                {/* Header / Summary */}
                <div 
                  className="p-5 cursor-pointer hover:bg-white/[0.02] flex items-center justify-between"
                  onClick={() => setExpandedNote(expandedNote === note.id ? null : note.id)}
                >
                  <div>
                    <div className="font-mono text-sm text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full inline-block mb-2">
                      {new Date(note.date).toLocaleDateString(locale === 'ar' ? 'ar-EG' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </div>
                    <div className="text-slate-300 text-sm line-clamp-1 max-w-2xl">
                      <span className="font-semibold text-slate-400">A: </span> {note.assessment}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <span className="text-xs text-slate-500 uppercase tracking-wider">
                      {expandedNote === note.id ? 'Collapse' : 'Expand'}
                    </span>
                    {isOwnerOrDoctor && (
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleDeleteNote(note.id); }}
                        className="text-slate-500 hover:text-red-400 p-2 rounded-lg hover:bg-red-500/10 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Expanded Content */}
                {expandedNote === note.id && (
                  <div className="p-5 pt-0 border-t border-white/5 mt-2 bg-black/20">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                      
                      {/* S & O */}
                      <div className="space-y-6">
                        <div>
                          <h5 className="font-bold text-slate-300 border-b border-white/10 pb-2 mb-2 flex items-center gap-2">
                            <span className="bg-blue-500/20 text-blue-400 w-6 h-6 flex items-center justify-center rounded text-xs">S</span>
                            Subjective
                          </h5>
                          <div className="text-sm text-slate-400 whitespace-pre-wrap leading-relaxed bg-white/5 p-3 rounded-lg border border-white/5">
                            {note.subjective || '-'}
                          </div>
                        </div>
                        
                        <div>
                          <h5 className="font-bold text-slate-300 border-b border-white/10 pb-2 mb-2 flex items-center gap-2">
                            <span className="bg-emerald-500/20 text-emerald-400 w-6 h-6 flex items-center justify-center rounded text-xs">O</span>
                            Objective
                          </h5>
                          <div className="text-sm text-slate-400 whitespace-pre-wrap leading-relaxed bg-white/5 p-3 rounded-lg border border-white/5">
                            {note.objective || '-'}
                          </div>
                        </div>
                      </div>

                      {/* A & P */}
                      <div className="space-y-6">
                        <div>
                          <h5 className="font-bold text-slate-300 border-b border-white/10 pb-2 mb-2 flex items-center gap-2">
                            <span className="bg-amber-500/20 text-amber-400 w-6 h-6 flex items-center justify-center rounded text-xs">A</span>
                            Assessment
                          </h5>
                          <div className="text-sm text-slate-400 whitespace-pre-wrap leading-relaxed bg-white/5 p-3 rounded-lg border border-white/5">
                            {note.assessment || '-'}
                          </div>
                        </div>
                        
                        <div>
                          <h5 className="font-bold text-slate-300 border-b border-white/10 pb-2 mb-2 flex items-center gap-2">
                            <span className="bg-purple-500/20 text-purple-400 w-6 h-6 flex items-center justify-center rounded text-xs">P</span>
                            Plan
                          </h5>
                          <div className="text-sm text-slate-400 whitespace-pre-wrap leading-relaxed bg-white/5 p-3 rounded-lg border border-white/5">
                            {note.plan || '-'}
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-[#0a0f1e] border border-white/10 text-white sm:max-w-[800px] max-h-[90vh] overflow-y-auto custom-scrollbar">
          <DialogHeader>
            <DialogTitle>New SOAP Note</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveNote} className="space-y-6 mt-4">
            
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Date of Visit</label>
              <input 
                type="date" 
                name="date"
                required
                defaultValue={new Date().toISOString().split('T')[0]}
                className="w-full md:w-1/3 h-10 px-3 rounded-lg text-sm bg-black/20 border border-white/10 text-white focus:outline-none focus:border-indigo-500/50 [color-scheme:dark]"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-400">
                  <span className="bg-blue-400/20 px-2 py-0.5 rounded">S</span> Subjective (CC, HPI, ROS)
                </label>
                <textarea 
                  name="subjective" 
                  placeholder="Patient reports..." 
                  className="w-full h-32 p-3 rounded-lg text-sm bg-black/40 border border-white/10 text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50 resize-y" 
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400">
                  <span className="bg-emerald-400/20 px-2 py-0.5 rounded">O</span> Objective (Vitals, Physical Exam, Labs)
                </label>
                <textarea 
                  name="objective" 
                  placeholder="BP 120/80. Heart: RRR. Lungs: CTA bilaterally..." 
                  className="w-full h-32 p-3 rounded-lg text-sm bg-black/40 border border-white/10 text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500/50 resize-y" 
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400">
                  <span className="bg-amber-400/20 px-2 py-0.5 rounded">A</span> Assessment (Diagnoses)
                </label>
                <textarea 
                  name="assessment" 
                  placeholder="1. Essential Hypertension, well controlled. 2. Type 2 DM..." 
                  className="w-full h-32 p-3 rounded-lg text-sm bg-black/40 border border-white/10 text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-500/50 resize-y" 
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-purple-400">
                  <span className="bg-purple-400/20 px-2 py-0.5 rounded">P</span> Plan (Tx, Meds, Follow-up)
                </label>
                <textarea 
                  name="plan" 
                  placeholder="1. Continue Lisinopril 10mg. 2. Labs in 3 months..." 
                  className="w-full h-32 p-3 rounded-lg text-sm bg-black/40 border border-white/10 text-white placeholder:text-slate-600 focus:outline-none focus:border-purple-500/50 resize-y" 
                />
              </div>
            </div>

            <div className="pt-4 mt-6 border-t border-white/10">
              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg text-base font-bold transition-all shadow-lg shadow-indigo-500/25"
              >
                {loading ? 'Saving Note...' : 'Save SOAP Note'}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
