'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { searchGlobalMedications, addClinicMedication, deleteClinicMedication } from './actions'
import { Plus, Search, Trash2, Globe, Pill, AlertCircle } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'

export default function PharmacyClient({ clinicId, initialMeds, locale }: { clinicId: string; initialMeds: any[]; locale: string }) {
  const [meds, setMeds] = useState(initialMeds)
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [loadingSearch, setLoadingSearch] = useState(false)
  const [addingMed, setAddingMed] = useState(false)
  const isAr = locale === 'ar'

  const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value
    setSearchQuery(query)
    if (query.length < 2) {
      setSearchResults([])
      return
    }
    setLoadingSearch(true)
    try {
      const results = await searchGlobalMedications(query)
      setSearchResults(results)
    } catch (err) {
      toast.error(isAr ? 'فشل في البحث عن الأدوية' : 'Failed to search medications')
    } finally {
      setLoadingSearch(false)
    }
  }

  const handleAddGlobal = async (globalMed: any) => {
    setAddingMed(true)
    try {
      const newMed = await addClinicMedication(clinicId, {
        medication_global_id: globalMed.id,
      })
      
      const addedMed = {
        ...newMed[0],
        medications_global: globalMed
      }
      setMeds([addedMed, ...meds])
      setIsAddOpen(false)
      setSearchQuery('')
      setSearchResults([])
    } catch (err) {
      toast.error(isAr ? 'فشل في إضافة الدواء' : 'Failed to add medication')
    } finally {
      setAddingMed(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Remove this medication from your clinic pharmacy?')) return
    try {
      await deleteClinicMedication(clinicId, id)
      setMeds(meds.filter(m => m.id !== id))
    } catch (err) {
      toast.error(isAr ? 'فشل في الحذف' : 'Failed to delete. It might be linked to a patient prescription.')
    }
  }

  const handleAddCustom = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setAddingMed(true)
    const formData = new FormData(e.currentTarget)
    try {
      const newMed = await addClinicMedication(clinicId, {
        custom_brand_name: formData.get('brandName'),
        custom_generic_name: formData.get('genericName'),
        concentration: formData.get('concentration'),
        form: formData.get('form'),
      })
      setMeds([newMed[0], ...meds])
      setIsAddOpen(false)
    } catch (err) {
      toast.error(isAr ? 'فشل في إضافة الدواء' : 'Failed to add custom medication')
    } finally {
      setAddingMed(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input 
            type="text" 
            placeholder={isAr ? 'بحث عن أدوية...' : 'Search medications...'}
            className="w-full h-10 pl-10 pr-4 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-violet-500/50"
          />
        </div>
        <button 
          onClick={() => setIsAddOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-sm font-medium transition-all shadow-lg shadow-violet-600/20"
        >
          <Plus className="w-4 h-4" />
          {isAr ? 'إضافة دواء' : 'Add Medication'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {meds.map(med => {
          const global = med.medications_global
          const brandName = global?.brand_name_en || med.custom_brand_name
          const brandNameAr = global?.brand_name_ar
          const genericName = global?.generic_name || med.custom_generic_name
          const concentration = global?.concentration || med.concentration
          const form = global?.form || med.form
          const manufacturer = global?.manufacturer
          
          return (
            <div key={med.id} className="p-4 bg-white/5 border border-white/10 rounded-xl flex items-start justify-between group hover:bg-white/10 transition-colors">
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-xl bg-violet-500/10 flex items-center justify-center text-violet-400 flex-shrink-0">
                  <Pill className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-200 flex items-center gap-2">
                    {brandName} {concentration}
                    {global && <span title="Global Drug Index"><Globe className="w-3.5 h-3.5 text-blue-400" /></span>}
                  </h3>
                  {brandNameAr && <div className="text-xs text-slate-400 font-arabic">{brandNameAr}</div>}
                  <p className="text-sm text-slate-400 mt-1">{genericName}</p>
                  <div className="flex gap-2 mt-2">
                    <span className="px-2 py-0.5 bg-white/5 text-slate-300 rounded text-xs">{form}</span>
                    {manufacturer && <span className="px-2 py-0.5 bg-white/5 text-slate-300 rounded text-xs">{manufacturer}</span>}
                  </div>
                </div>
              </div>
              <button 
                onClick={() => handleDelete(med.id)}
                className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )
        })}
      </div>

      {meds.length === 0 && (
        <div className="text-center py-12 border border-dashed border-white/10 rounded-2xl bg-white/[0.02]">
          <Pill className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-300">{isAr ? 'لم يتم إعداد أي أدوية بعد.' : 'Your Pharmacy is Empty'}</h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto mt-2">
            {isAr ? 'فهرس الأدوية العام' : 'Build your clinic\'s frequently prescribed medications list to easily write prescriptions later.'}
          </p>
        </div>
      )}

      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="bg-[#0a0f1e] border border-white/10 text-white sm:max-w-xl max-h-[90vh] overflow-y-auto custom-scrollbar">
          <DialogHeader>
            <DialogTitle>{isAr ? 'إضافة دواء' : 'Add Medication'}</DialogTitle>
            <DialogDescription className="text-slate-400">
              {isAr ? 'بحث من فهرس الأدوية المصري.' : 'Search from the global Egypt drug index or add a custom medication.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 mt-4">
            <div className="space-y-3">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">{isAr ? 'فهرس الأدوية العام' : 'Search Global Index'}</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={handleSearch}
                  placeholder={isAr ? 'بحث عن أدوية...' : 'Type active ingredient or brand name...'}
                  className="w-full h-10 pl-10 pr-4 bg-black/40 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-violet-500/50"
                />
              </div>

              {searchQuery.length > 0 && (
                <div className="bg-black/40 border border-white/10 rounded-lg overflow-hidden mt-2 max-h-60 overflow-y-auto custom-scrollbar">
                  {loadingSearch ? (
                    <div className="p-4 text-center text-sm text-slate-500">{isAr ? 'جاري البحث...' : 'Searching...'}</div>
                  ) : searchResults.length === 0 ? (
                    <div className="p-4 text-center text-sm text-slate-500">{isAr ? 'لم يتم العثور على أدوية.' : 'No medications found.'}</div>
                  ) : (
                    searchResults.map(result => (
                      <div key={result.id} className="p-3 border-b border-white/5 hover:bg-white/5 flex items-center justify-between cursor-pointer transition-colors" onClick={() => handleAddGlobal(result)}>
                        <div>
                          <div className="font-semibold text-slate-200">{result.brand_name_en} {result.concentration}</div>
                          <div className="text-xs text-slate-400">{result.generic_name} • {result.form}</div>
                        </div>
                        <Plus className="w-4 h-4 text-violet-400" />
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center gap-4 py-2">
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-xs text-slate-500 uppercase font-semibold">{isAr ? 'إضافة مخصص' : 'Or Add Custom'}</span>
              <div className="flex-1 h-px bg-white/10" />
            </div>

            <form onSubmit={handleAddCustom} className="space-y-4">
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-200 text-xs flex items-start gap-3">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-400" />
                <p>{isAr ? 'الأدوية المتاحة في عيادتك.' : 'Use custom medications only if you cannot find the drug in the global index. Custom drugs will not benefit from global updates.'}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-400">{isAr ? 'الاسم التجاري' : 'Brand Name'}</label>
                  <input required name="brandName" className="w-full h-10 px-3 bg-black/40 border border-white/10 rounded-lg text-sm text-white" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-400">{isAr ? 'الاسم العلمي' : 'Generic Name'}</label>
                  <input required name="genericName" className="w-full h-10 px-3 bg-black/40 border border-white/10 rounded-lg text-sm text-white" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-400">{isAr ? 'الجرعة' : 'Dosage'}</label>
                  <input name="concentration" className="w-full h-10 px-3 bg-black/40 border border-white/10 rounded-lg text-sm text-white" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-400">{isAr ? 'التكرار' : 'Frequency'}</label>
                  <input name="form" className="w-full h-10 px-3 bg-black/40 border border-white/10 rounded-lg text-sm text-white" />
                </div>
              </div>

              <button
                type="submit"
                disabled={addingMed}
                className="w-full h-10 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm font-bold transition-all border border-white/10"
              >
                {isAr ? 'إضافة مخصص' : 'Add Custom Medication'}
              </button>
            </form>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
