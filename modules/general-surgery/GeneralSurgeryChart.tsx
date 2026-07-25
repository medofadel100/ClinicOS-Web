'use client'

import { useState, useEffect } from 'react'
import { Plus, X, Scissors, FileText } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useTranslations } from 'next-intl'
import { upsertGeneralSurgeryNote } from './actions'

interface SurgeryNote {
  id: string;
  date: string;
  type: 'pre-op' | 'operative' | 'post-op';
  procedureName: string;
  indications: string;
  findings: string;
  complications: string;
  plan: string;
}

export default function GeneralSurgeryChart({
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
  
  const getNotes = (entries: any[]) => {
    const notes = entries.find(n => n.note_type === 'general_surgery_notes')
    return (notes?.content?.notes as SurgeryNote[]) || []
  }
  
  const [entries, setEntries] = useState<any[]>(initialEntries)
  const [notes, setNotes] = useState<SurgeryNote[]>(getNotes(initialEntries))
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
    
    const newNote: SurgeryNote = {
      id: Math.random().toString(36).substring(7),
      date: (formData.get('date') as string) ? new Date(formData.get('date') as string).toISOString() : new Date().toISOString(),
      type: formData.get('type') as 'pre-op' | 'operative' | 'post-op',
      procedureName: formData.get('procedureName') as string,
      indications: formData.get('indications') as string,
      findings: formData.get('findings') as string,
      complications: formData.get('complications') as string,
      plan: formData.get('plan') as string,
    }

    const updatedNotes = [...notes, newNote].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    try {
      const dbNotes = await upsertGeneralSurgeryNote(clinicId, locale, patientId, updatedNotes)
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
      const dbNotes = await upsertGeneralSurgeryNote(clinicId, locale, patientId, updatedNotes)
      setEntries(dbNotes)
    } catch (err) {
      console.error(err)
      alert('Failed to delete')
    } finally {
      setLoading(false)
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'pre-op': return 'text-amber-400 bg-amber-400/10 border-amber-400/20'
      case 'operative': return 'text-rose-400 bg-rose-400/10 border-rose-400/20'
      case 'post-op': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20'
      default: return 'text-slate-400 bg-slate-400/10 border-slate-400/20'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <span className="text-xl">🔪</span> General Surgery
          </h3>
          <p className="text-sm text-slate-400">Pre-op evaluations, operative reports, and post-op follow-ups.</p>
        </div>
        {isOwnerOrDoctor && (
          <button
            onClick={() => setIsDialogOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-lg text-sm font-medium transition-all shadow-lg shadow-rose-500/25"
          >
            <Plus className="w-4 h-4" />
            New Surgery Note
          </button>
        )}
      </div>

      <div className="bg-[#0f172a]/50 rounded-2xl border border-white/10 p-5 flex flex-col min-h-[600px]">
        <h4 className="text-sm font-semibold text-slate-200 mb-6 uppercase tracking-wider flex items-center gap-2">
          <Scissors className="w-4 h-4 text-rose-400" /> Surgical Notes History
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
                <div className="absolute top-0 left-0 w-1 h-full bg-rose-500/50"></div>
                
                {/* Header / Summary */}
                <div 
                  className="p-5 cursor-pointer hover:bg-white/[0.02] flex items-center justify-between"
                  onClick={() => setExpandedNote(expandedNote === note.id ? null : note.id)}
                >
                  <div className="flex items-center gap-4">
                    <div className={`text-xs font-bold px-3 py-1 rounded border uppercase tracking-wider ${getTypeColor(note.type)}`}>
                      {note.type}
                    </div>
                    <div>
                      <div className="text-slate-200 font-semibold mb-1">{note.procedureName || 'Unnamed Procedure'}</div>
                      <div className="text-xs text-slate-400">
                        {new Date(note.date).toLocaleDateString(locale === 'ar' ? 'ar-EG' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </div>
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
                      
                      <div className="space-y-6">
                        <div>
                          <h5 className="font-bold text-slate-300 border-b border-white/10 pb-2 mb-2">Indications / Diagnosis</h5>
                          <div className="text-sm text-slate-400 whitespace-pre-wrap leading-relaxed bg-white/5 p-3 rounded-lg border border-white/5">
                            {note.indications || '-'}
                          </div>
                        </div>
                        
                        <div>
                          <h5 className="font-bold text-slate-300 border-b border-white/10 pb-2 mb-2">Findings / Procedure Details</h5>
                          <div className="text-sm text-slate-400 whitespace-pre-wrap leading-relaxed bg-white/5 p-3 rounded-lg border border-white/5">
                            {note.findings || '-'}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-6">
                        <div>
                          <h5 className="font-bold text-slate-300 border-b border-white/10 pb-2 mb-2 text-rose-400">Complications / EBL</h5>
                          <div className="text-sm text-slate-400 whitespace-pre-wrap leading-relaxed bg-white/5 p-3 rounded-lg border border-white/5">
                            {note.complications || '-'}
                          </div>
                        </div>
                        
                        <div>
                          <h5 className="font-bold text-slate-300 border-b border-white/10 pb-2 mb-2">Plan / Post-Op Care</h5>
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
            <DialogTitle>New Surgical Note</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveNote} className="space-y-6 mt-4">
            
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="space-y-2 flex-1">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Note Type</label>
                <select name="type" className="w-full h-10 px-3 rounded-lg text-sm bg-black/20 border border-white/10 text-white focus:outline-none focus:border-rose-500/50">
                  <option value="pre-op">Pre-Op Evaluation</option>
                  <option value="operative">Operative Report</option>
                  <option value="post-op">Post-Op Follow-up</option>
                </select>
              </div>
              <div className="space-y-2 flex-1">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Date of Note</label>
                <input 
                  type="date" 
                  name="date"
                  required
                  defaultValue={new Date().toISOString().split('T')[0]}
                  className="w-full h-10 px-3 rounded-lg text-sm bg-black/20 border border-white/10 text-white focus:outline-none focus:border-rose-500/50 [color-scheme:dark]"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300">Procedure / Surgery Name</label>
              <input 
                name="procedureName" 
                placeholder="e.g. Laparoscopic Appendectomy" 
                className="w-full h-10 px-3 rounded-lg text-sm bg-black/40 border border-white/10 text-white placeholder:text-slate-600 focus:outline-none focus:border-rose-500/50" 
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300">Indications / Pre-Op Diagnosis</label>
                <textarea 
                  name="indications" 
                  placeholder="e.g. Acute appendicitis with localized peritonitis..." 
                  className="w-full h-32 p-3 rounded-lg text-sm bg-black/40 border border-white/10 text-white placeholder:text-slate-600 focus:outline-none focus:border-rose-500/50 resize-y" 
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300">Findings / Details</label>
                <textarea 
                  name="findings" 
                  placeholder="e.g. Suppurative appendix, no perforation. Copious irrigation performed..." 
                  className="w-full h-32 p-3 rounded-lg text-sm bg-black/40 border border-white/10 text-white placeholder:text-slate-600 focus:outline-none focus:border-rose-500/50 resize-y" 
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300">Complications / EBL / Fluids</label>
                <textarea 
                  name="complications" 
                  placeholder="e.g. None. EBL: 10cc. Fluids: 1000cc LR." 
                  className="w-full h-32 p-3 rounded-lg text-sm bg-black/40 border border-white/10 text-white placeholder:text-slate-600 focus:outline-none focus:border-rose-500/50 resize-y" 
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300">Plan / Disposition</label>
                <textarea 
                  name="plan" 
                  placeholder="e.g. Admit to floor for pain control and IV antibiotics. Advance diet as tolerated..." 
                  className="w-full h-32 p-3 rounded-lg text-sm bg-black/40 border border-white/10 text-white placeholder:text-slate-600 focus:outline-none focus:border-rose-500/50 resize-y" 
                />
              </div>
            </div>

            <div className="pt-4 mt-6 border-t border-white/10">
              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-rose-500 hover:bg-rose-600 text-white rounded-lg text-base font-bold transition-all shadow-lg shadow-rose-500/25"
              >
                {loading ? 'Saving Note...' : 'Save Surgical Note'}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
