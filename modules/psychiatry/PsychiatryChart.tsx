'use client'

import { useState, useEffect } from 'react'
import { Plus, X, BrainCircuit } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useTranslations } from 'next-intl'
import { upsertPsychiatryNote } from './actions'

interface Record {
  id: string;
  date: string;
  mse: {
    appearance: string;
    behavior: string;
    speech: string;
    mood: string;
    affect: string;
    thoughtProcess: string;
    thoughtContent: string;
    cognition: string;
    insight: string;
  };
  phq9_score: number | null;
  gad7_score: number | null;
  diagnosis: string;
  plan: string;
}

export default function PsychiatryChart({
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
    const notes = entries.find(n => n.note_type === 'psychiatry_tracker')
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
      mse: {
        appearance: formData.get('mse_appearance') as string,
        behavior: formData.get('mse_behavior') as string,
        speech: formData.get('mse_speech') as string,
        mood: formData.get('mse_mood') as string,
        affect: formData.get('mse_affect') as string,
        thoughtProcess: formData.get('mse_tp') as string,
        thoughtContent: formData.get('mse_tc') as string,
        cognition: formData.get('mse_cognition') as string,
        insight: formData.get('mse_insight') as string,
      },
      phq9_score: formData.get('phq9') ? parseInt(formData.get('phq9') as string) : null,
      gad7_score: formData.get('gad7') ? parseInt(formData.get('gad7') as string) : null,
      diagnosis: formData.get('diagnosis') as string,
      plan: formData.get('plan') as string,
    }

    const updatedRecords = [...records, newRecord].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    try {
      const updatedNotes = await upsertPsychiatryNote(clinicId, locale, patientId, updatedRecords)
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
      const updatedNotes = await upsertPsychiatryNote(clinicId, locale, patientId, updatedRecords)
      setEntries(updatedNotes)
    } catch (err) {
      console.error(err)
      alert('Failed to delete')
    } finally {
      setLoading(false)
    }
  }

  const getScoreColor = (score: number, max: number) => {
    const ratio = score / max;
    if (ratio >= 0.7) return 'text-red-400 bg-red-400/10'
    if (ratio >= 0.4) return 'text-amber-400 bg-amber-400/10'
    return 'text-emerald-400 bg-emerald-400/10'
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <span className="text-xl">🧠</span> Psychiatry & Behavioral Health
          </h3>
          <p className="text-sm text-slate-400">Record Mental Status Exams (MSE) and Depression/Anxiety Scores.</p>
        </div>
        {isOwnerOrDoctor && (
          <button
            onClick={() => setIsDialogOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg text-sm font-medium transition-all shadow-lg shadow-purple-500/25"
          >
            <Plus className="w-4 h-4" />
            New Psychiatric Note
          </button>
        )}
      </div>

      <div className="bg-[#0f172a]/50 rounded-2xl border border-white/10 p-5 flex flex-col min-h-[600px]">
        <h4 className="text-sm font-semibold text-slate-200 mb-6 uppercase tracking-wider flex items-center gap-2">
          <BrainCircuit className="w-4 h-4 text-purple-400" /> Assessment History
        </h4>
        
        <div className="flex-1 space-y-4">
          {records.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 opacity-60 min-h-[300px]">
              <p className="text-sm">No notes recorded yet.</p>
            </div>
          ) : (
            [...records].reverse().map(record => (
              <div key={record.id} className="bg-white/5 border border-white/10 rounded-xl p-5 relative group overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-purple-500/50"></div>
                {isOwnerOrDoctor && (
                  <button 
                    onClick={() => handleDeleteRecord(record.id)}
                    className="absolute top-4 right-4 text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
                
                <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/10">
                  <div className="font-mono text-sm text-purple-400 bg-purple-500/10 px-3 py-1 rounded-full">
                    {new Date(record.date).toLocaleDateString(locale === 'ar' ? 'ar-EG' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </div>
                  
                  <div className="flex gap-3">
                    {record.phq9_score !== null && (
                      <div className={`text-xs font-bold px-2 py-1 rounded ${getScoreColor(record.phq9_score, 27)}`}>
                        PHQ-9: {record.phq9_score}/27
                      </div>
                    )}
                    {record.gad7_score !== null && (
                      <div className={`text-xs font-bold px-2 py-1 rounded ${getScoreColor(record.gad7_score, 21)}`}>
                        GAD-7: {record.gad7_score}/21
                      </div>
                    )}
                  </div>
                </div>

                <div className="mb-4">
                  <h5 className="font-bold text-slate-300 border-b border-white/10 pb-2 mb-3 uppercase text-xs tracking-wider">Mental Status Exam (MSE)</h5>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                    {Object.entries(record.mse).map(([key, value]) => value && (
                      <div key={key} className="bg-black/20 p-2 rounded border border-white/5">
                        <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </div>
                        <div className="text-slate-200">{value}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-white/10 text-sm">
                  {record.diagnosis && (
                    <div>
                      <span className="block text-slate-400 mb-1 uppercase tracking-wider text-xs font-semibold">Diagnosis (DSM-5 / ICD)</span>
                      <div className="text-slate-200">{record.diagnosis}</div>
                    </div>
                  )}
                  {record.plan && (
                    <div>
                      <span className="block text-slate-400 mb-1 uppercase tracking-wider text-xs font-semibold">Plan & Rx</span>
                      <div className="text-slate-200 whitespace-pre-wrap">{record.plan}</div>
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
            <DialogTitle>New Psychiatric Note</DialogTitle>
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
                  className="w-full h-10 px-3 rounded-lg text-sm bg-black/20 border border-white/10 text-white focus:outline-none focus:border-purple-500/50 [color-scheme:dark]"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">PHQ-9 Score (0-27)</label>
                <input type="number" name="phq9" min="0" max="27" placeholder="e.g. 15" className="w-full h-10 px-3 rounded-lg text-sm bg-black/20 border border-white/10 text-white focus:outline-none focus:border-purple-500/50" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">GAD-7 Score (0-21)</label>
                <input type="number" name="gad7" min="0" max="21" placeholder="e.g. 10" className="w-full h-10 px-3 rounded-lg text-sm bg-black/20 border border-white/10 text-white focus:outline-none focus:border-purple-500/50" />
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-4">
              <h3 className="font-bold text-purple-400 border-b border-purple-400/20 pb-2">Mental Status Exam (MSE)</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-400">Appearance</label>
                  <input name="mse_appearance" defaultValue="Well groomed, appropriate for age" className="w-full h-9 px-3 rounded text-sm bg-black/40 border border-white/10 text-white focus:outline-none focus:border-purple-500/50" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-400">Behavior</label>
                  <input name="mse_behavior" defaultValue="Cooperative, normal motor activity" className="w-full h-9 px-3 rounded text-sm bg-black/40 border border-white/10 text-white focus:outline-none focus:border-purple-500/50" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-400">Speech</label>
                  <input name="mse_speech" defaultValue="Normal rate, tone, and volume" className="w-full h-9 px-3 rounded text-sm bg-black/40 border border-white/10 text-white focus:outline-none focus:border-purple-500/50" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-400">Mood</label>
                  <input name="mse_mood" defaultValue='"Euthymic"' className="w-full h-9 px-3 rounded text-sm bg-black/40 border border-white/10 text-white focus:outline-none focus:border-purple-500/50" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-400">Affect</label>
                  <input name="mse_affect" defaultValue="Full range, congruent with mood" className="w-full h-9 px-3 rounded text-sm bg-black/40 border border-white/10 text-white focus:outline-none focus:border-purple-500/50" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-400">Thought Process</label>
                  <input name="mse_tp" defaultValue="Logical, goal-directed" className="w-full h-9 px-3 rounded text-sm bg-black/40 border border-white/10 text-white focus:outline-none focus:border-purple-500/50" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-400">Thought Content</label>
                  <input name="mse_tc" defaultValue="No SI/HI, no delusions" className="w-full h-9 px-3 rounded text-sm bg-black/40 border border-white/10 text-white focus:outline-none focus:border-purple-500/50" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-400">Cognition</label>
                  <input name="mse_cognition" defaultValue="A&O x 3, intact memory" className="w-full h-9 px-3 rounded text-sm bg-black/40 border border-white/10 text-white focus:outline-none focus:border-purple-500/50" />
                </div>
                <div className="space-y-1 md:col-span-2">
                  <label className="text-xs font-semibold text-slate-400">Insight & Judgment</label>
                  <input name="mse_insight" defaultValue="Fair to good" className="w-full h-9 px-3 rounded text-sm bg-black/40 border border-white/10 text-white focus:outline-none focus:border-purple-500/50" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Diagnosis (DSM-5)</label>
                <textarea name="diagnosis" placeholder="e.g. Major Depressive Disorder, recurrent, moderate" className="w-full h-20 p-3 rounded-lg text-sm bg-black/20 border border-white/10 text-white placeholder:text-slate-600 focus:outline-none focus:border-purple-500/50 resize-none" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Plan / Medications</label>
                <textarea name="plan" placeholder="e.g. Start Sertraline 50mg PO daily. Therapy referral." className="w-full h-20 p-3 rounded-lg text-sm bg-black/20 border border-white/10 text-white placeholder:text-slate-600 focus:outline-none focus:border-purple-500/50 resize-none" />
              </div>
            </div>

            <div className="pt-4 mt-6 border-t border-white/10">
              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-purple-500 hover:bg-purple-600 text-white rounded-lg text-base font-bold transition-all shadow-lg shadow-purple-500/25"
              >
                {loading ? 'Saving Note...' : 'Save Psychiatric Note'}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
