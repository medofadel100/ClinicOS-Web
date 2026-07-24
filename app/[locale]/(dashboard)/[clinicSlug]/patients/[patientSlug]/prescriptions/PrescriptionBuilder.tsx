'use client'

import { useState, useEffect } from 'react'
import { smartSearchMedications, ensureClinicMedication, getMedicationAlternatives, savePrescription, savePrescriptionTemplate, getPrescriptionTemplates } from './actions'
import { Search, Plus, Trash2, Pill, Check, BookmarkPlus, FolderDown } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'

interface DraftItem {
  id: string; // temp id
  clinic_medication_id: string;
  brandName: string;
  genericName: string;
  dosage: string;
  frequency: string;
  timing: string;
  duration: string;
  instructions: string;
}

export default function PrescriptionBuilder({ clinicId, patientId }: { clinicId: string, patientId: string }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [loadingSearch, setLoadingSearch] = useState(false)
  const [draftItems, setDraftItems] = useState<DraftItem[]>([])
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  
  // Templates
  const [templates, setTemplates] = useState<any[]>([])
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false)
  const [templateName, setTemplateName] = useState('')

  // Alternatives
  const [showAlternativesFor, setShowAlternativesFor] = useState<string | null>(null)
  const [alternatives, setAlternatives] = useState<any[]>([])
  const [loadingAlternatives, setLoadingAlternatives] = useState(false)

  useEffect(() => {
    // Fetch templates on mount
    getPrescriptionTemplates(clinicId).then(setTemplates).catch(console.error)
  }, [clinicId])

  const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value
    setSearchQuery(query)
    if (query.length < 2) {
      setSearchResults([])
      return
    }
    setLoadingSearch(true)
    try {
      const results = await smartSearchMedications(clinicId, query)
      setSearchResults(results)
    } catch (err) {
      console.error(err)
    } finally {
      setLoadingSearch(false)
    }
  }

  const handleAddMed = async (med: any) => {
    let clinicMedId = med.clinic_medication_id
    if (med.type === 'new_global') {
      try {
        clinicMedId = await ensureClinicMedication(clinicId, med.medication_global_id)
      } catch (err) {
        console.error(err)
        alert('Failed to add global medication to clinic pharmacy.')
        return
      }
    }

    const newItem: DraftItem = {
      id: Math.random().toString(36).substr(2, 9),
      clinic_medication_id: clinicMedId,
      brandName: med.brandName || '',
      genericName: med.genericName || '',
      dosage: med.dosage || '',
      frequency: med.frequency || '',
      timing: '',
      duration: med.duration || '',
      instructions: ''
    }
    setDraftItems([...draftItems, newItem])
    setSearchQuery('')
    setSearchResults([])
  }

  const loadAlternatives = async (genericName: string) => {
    if (!genericName) return
    setShowAlternativesFor(genericName)
    setLoadingAlternatives(true)
    try {
      const alts = await getMedicationAlternatives(genericName)
      setAlternatives(alts)
    } catch (err) {
      console.error(err)
    } finally {
      setLoadingAlternatives(false)
    }
  }

  const loadTemplate = (template: any) => {
    if (draftItems.length > 0) {
      if (!confirm('This will overwrite your current draft. Continue?')) return
    }
    const loadedItems: DraftItem[] = template.prescription_template_items.map((item: any) => {
      const med = item.clinic_medications
      const global = med?.medications_global
      return {
        id: Math.random().toString(36).substr(2, 9),
        clinic_medication_id: item.clinic_medication_id,
        brandName: global?.brand_name_en || med?.custom_brand_name,
        genericName: global?.generic_name || med?.custom_generic_name,
        dosage: item.dosage,
        frequency: item.frequency,
        timing: item.timing || '',
        duration: item.duration || '',
        instructions: item.instructions || ''
      }
    })
    setDraftItems(loadedItems)
  }

  const handleSaveTemplate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!templateName.trim() || draftItems.length === 0) return
    try {
      const newTmpl = await savePrescriptionTemplate(clinicId, templateName, draftItems)
      alert('Template saved successfully!')
      setIsTemplateModalOpen(false)
      setTemplateName('')
      // Refresh templates
      getPrescriptionTemplates(clinicId).then(setTemplates).catch(console.error)
    } catch (err) {
      console.error(err)
      alert('Failed to save template.')
    }
  }

  const updateItem = (id: string, field: keyof DraftItem, value: string) => {
    setDraftItems(items => items.map(item => item.id === id ? { ...item, [field]: value } : item))
  }

  const removeItem = (id: string) => {
    setDraftItems(items => items.filter(item => item.id !== id))
  }

  const handleSave = async () => {
    if (draftItems.length === 0) return
    setSaving(true)
    try {
      await savePrescription(clinicId, patientId, draftItems, notes)
      setDraftItems([])
      setNotes('')
      alert('Prescription saved successfully!')
    } catch (err) {
      console.error(err)
      alert('Failed to save prescription.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input 
            type="text" 
            value={searchQuery}
            onChange={handleSearch}
            placeholder="Search clinic pharmacy (e.g. Panadol, Amoxicillin)..."
            className="w-full h-12 pl-12 pr-4 bg-black/40 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/50 transition-all"
          />
          
          {searchQuery.length > 0 && (
            <div className="absolute z-50 top-full mt-2 w-full bg-[#0a0f1e] border border-white/10 rounded-xl shadow-2xl overflow-hidden max-h-64 overflow-y-auto custom-scrollbar">
              {loadingSearch ? (
                <div className="p-4 text-center text-sm text-slate-500">Searching...</div>
              ) : searchResults.length === 0 ? (
                <div className="p-4 text-center text-sm text-slate-500">
                  Drug not found in clinic pharmacy. <br/>Go to the Pharmacy settings to add it.
                </div>
              ) : (
                searchResults.map((result: any, idx) => {
                  return (
                    <div 
                      key={idx} 
                      className="p-3 border-b border-white/5 hover:bg-white/5 flex items-center justify-between cursor-pointer transition-colors" 
                      onClick={() => handleAddMed(result)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-violet-500/10 flex items-center justify-center">
                          <Pill className="w-4 h-4 text-violet-400" />
                        </div>
                        <div>
                          <div className="font-semibold text-slate-200 text-sm flex items-center gap-2">
                            {result.brandName}
                            {result.type === 'new_global' && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400">Global</span>
                            )}
                          </div>
                          <div className="text-xs text-slate-500">{result.genericName}</div>
                        </div>
                      </div>
                      <Plus className="w-4 h-4 text-violet-400" />
                    </div>
                  )
                })
              )}
            </div>
          )}
        </div>

        {templates.length > 0 && (
          <div className="shrink-0 flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Load Template:</span>
            <div className="flex flex-wrap gap-2">
              {templates.map(tmpl => (
                <button
                  key={tmpl.id}
                  onClick={() => loadTemplate(tmpl)}
                  className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5"
                >
                  <FolderDown className="w-3.5 h-3.5 text-blue-400" />
                  {tmpl.template_name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Draft Items */}
      {draftItems.length > 0 && (
        <div className="space-y-4">
          {draftItems.map((item, index) => (
            <div key={item.id} className="p-4 bg-white/5 border border-white/10 rounded-xl relative group">
              <button 
                onClick={() => removeItem(item.id)}
                className="absolute top-4 right-4 text-slate-500 hover:text-red-400 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              
              <div className="flex items-center gap-3 mb-4 pr-8">
                <div className="w-8 h-8 rounded-full bg-violet-500/20 text-violet-400 flex items-center justify-center font-bold text-sm shrink-0">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-white flex items-center gap-2">
                    {item.brandName}
                    {item.genericName && (
                      <button 
                        onClick={() => loadAlternatives(item.genericName)}
                        className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 transition-colors"
                      >
                        Find Alternatives
                      </button>
                    )}
                  </h4>
                  <p className="text-xs text-slate-400">Active Ingredient: {item.genericName}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Dosage</label>
                  <input 
                    placeholder="e.g. 1 Tablet"
                    value={item.dosage}
                    onChange={e => updateItem(item.id, 'dosage', e.target.value)}
                    className="w-full h-9 px-3 bg-black/40 border border-white/10 rounded-lg text-sm text-white focus:border-violet-500/50" 
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Frequency</label>
                  <input 
                    placeholder="e.g. Every 8 hours"
                    value={item.frequency}
                    onChange={e => updateItem(item.id, 'frequency', e.target.value)}
                    className="w-full h-9 px-3 bg-black/40 border border-white/10 rounded-lg text-sm text-white focus:border-violet-500/50" 
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Timing</label>
                  <input 
                    placeholder="e.g. After meals"
                    value={item.timing}
                    onChange={e => updateItem(item.id, 'timing', e.target.value)}
                    className="w-full h-9 px-3 bg-black/40 border border-white/10 rounded-lg text-sm text-white focus:border-violet-500/50" 
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Duration</label>
                  <input 
                    placeholder="e.g. For 5 days"
                    value={item.duration}
                    onChange={e => updateItem(item.id, 'duration', e.target.value)}
                    className="w-full h-9 px-3 bg-black/40 border border-white/10 rounded-lg text-sm text-white focus:border-violet-500/50" 
                  />
                </div>
              </div>
              <div className="mt-3 space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Special Instructions (Optional)</label>
                <input 
                  placeholder="e.g. Take with plenty of water"
                  value={item.instructions}
                  onChange={e => updateItem(item.id, 'instructions', e.target.value)}
                  className="w-full h-9 px-3 bg-black/40 border border-white/10 rounded-lg text-sm text-white focus:border-violet-500/50" 
                />
              </div>
            </div>
          ))}

          <div className="space-y-1.5 pt-4">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Rx General Notes</label>
            <textarea 
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Any general notes for the pharmacist or patient..."
              className="w-full h-20 p-3 bg-black/40 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-violet-500/50 resize-none"
            />
          </div>

          <div className="flex justify-between items-center pt-4 border-t border-white/5">
            <button 
              onClick={() => setIsTemplateModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-slate-300 rounded-lg text-sm font-medium transition-all"
            >
              <BookmarkPlus className="w-4 h-4" />
              Save as Template
            </button>

            <button 
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-3 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-violet-600/20"
            >
              <Check className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save & Print Prescription'}
            </button>
          </div>
        </div>
      )}

      {/* Template Modal */}
      <Dialog open={isTemplateModalOpen} onOpenChange={setIsTemplateModalOpen}>
        <DialogContent className="bg-[#0a0f1e] border border-white/10 text-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Save Prescription Template</DialogTitle>
            <DialogDescription className="text-slate-400">
              Save these medications as a template to quickly load them for future patients.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveTemplate} className="space-y-4 mt-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-400">Template Name</label>
              <input 
                autoFocus
                required 
                value={templateName}
                onChange={e => setTemplateName(e.target.value)}
                placeholder="e.g. Standard Cold & Flu, Post-Op Pain..."
                className="w-full h-10 px-3 bg-black/40 border border-white/10 rounded-lg text-sm text-white focus:border-violet-500/50" 
              />
            </div>
            <button
              type="submit"
              className="w-full h-10 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-sm font-bold transition-all"
            >
              Save Template
            </button>
          </form>
        </DialogContent>
      </Dialog>
      {/* Alternatives Dialog */}
      <Dialog open={!!showAlternativesFor} onOpenChange={(o) => !o && setShowAlternativesFor(null)}>
        <DialogContent className="bg-[#0f1523] text-white border-white/10 max-w-2xl">
          <DialogHeader>
            <DialogTitle>Alternatives for {showAlternativesFor}</DialogTitle>
            <DialogDescription className="text-slate-400">
              Other medications with the same active ingredient.
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-96 overflow-y-auto custom-scrollbar space-y-2 mt-4">
            {loadingAlternatives ? (
              <div className="text-center text-slate-500 py-4">Searching...</div>
            ) : alternatives.length === 0 ? (
              <div className="text-center text-slate-500 py-4">No alternatives found in global database.</div>
            ) : (
              alternatives.map(alt => (
                <div key={alt.id} className="p-3 bg-white/5 border border-white/10 rounded-lg flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-white">{alt.brand_name_en} {alt.concentration && `(${alt.concentration})`}</div>
                    <div className="text-xs text-slate-400">{alt.manufacturer}</div>
                  </div>
                  <button 
                    onClick={() => {
                      handleAddMed({
                        type: 'new_global',
                        medication_global_id: alt.id,
                        brandName: alt.brand_name_en,
                        genericName: alt.generic_name,
                        dosage: '', frequency: '', duration: '', original: alt
                      })
                      setShowAlternativesFor(null)
                    }}
                    className="px-3 py-1 bg-violet-600 hover:bg-violet-700 text-white rounded text-xs font-medium transition-colors"
                  >
                    Add
                  </button>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
