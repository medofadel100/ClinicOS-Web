'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { createPatient } from './actions'

export default function AddPatientDialog({ clinicId, clinicSlug, locale }: { clinicId: string, clinicSlug: string, locale: string }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const isAr = locale === 'ar'

  const t = {
    newPatient: isAr ? 'مريض جديد' : 'New Patient',
    title: isAr ? 'إضافة مريض جديد' : 'Add New Patient',
    fullName: isAr ? 'الاسم الكامل' : 'Full Name',
    phone: isAr ? 'رقم الهاتف' : 'Phone Number',
    gender: isAr ? 'الجنس' : 'Gender',
    selectGender: isAr ? 'اختر الجنس...' : 'Select...',
    male: isAr ? 'ذكر' : 'Male',
    female: isAr ? 'أنثى' : 'Female',
    dob: isAr ? 'تاريخ الميلاد' : 'Date of Birth',
    notes: isAr ? 'ملاحظات' : 'Notes',
    create: isAr ? 'إنشاء المريض' : 'Add Patient',
    creating: isAr ? 'جاري الإنشاء...' : 'Adding...',
    error: isAr ? 'فشل في إضافة المريض' : 'Failed to add patient',
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    try {
      await createPatient(clinicId, clinicSlug, locale, formData)
      setOpen(false)
    } catch {
      toast.error(t.error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        className="flex items-center gap-2 h-10 px-6 rounded-lg text-sm font-semibold transition-all hover:opacity-90"
        style={{ background: '#00d4aa', color: '#0a0f1e' }}
      >
        {t.newPatient}
      </DialogTrigger>
      <DialogContent className="bg-[#0a0f1e] border-white/10 text-white sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t.title}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400" htmlFor="full_name">{t.fullName} *</label>
            <input 
              id="full_name"
              name="full_name" 
              required
              className="w-full h-10 px-3 rounded-lg text-sm bg-black/20 border border-white/10 text-white placeholder:text-slate-600 focus:outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/50 transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400" htmlFor="phone">{t.phone}</label>
            <input 
              id="phone"
              name="phone" 
              type="tel"
              className="w-full h-10 px-3 rounded-lg text-sm bg-black/20 border border-white/10 text-white placeholder:text-slate-600 focus:outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/50 transition-all"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400" htmlFor="gender">{t.gender}</label>
              <select 
                id="gender"
                name="gender" 
                className="w-full h-10 px-3 rounded-lg text-sm bg-black/20 border border-white/10 text-white focus:outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/50 transition-all"
              >
                <option value="">{t.selectGender}</option>
                <option value="male">{t.male}</option>
                <option value="female">{t.female}</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400" htmlFor="date_of_birth">{t.dob}</label>
              <input 
                id="date_of_birth"
                name="date_of_birth" 
                type="date"
                className="w-full h-10 px-3 rounded-lg text-sm bg-black/20 border border-white/10 text-white focus:outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/50 transition-all [color-scheme:dark]"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400" htmlFor="notes">{t.notes}</label>
            <textarea 
              id="notes"
              name="notes" 
              className="w-full min-h-[80px] p-3 rounded-lg text-sm bg-black/20 border border-white/10 text-white placeholder:text-slate-600 focus:outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/50 transition-all resize-y"
            />
          </div>
          <div className="flex justify-end pt-4 border-t border-white/10">
            <button 
              type="submit" 
              disabled={loading}
              className="flex items-center gap-2 h-10 px-6 rounded-lg text-sm font-semibold transition-all disabled:opacity-50"
              style={{ background: '#00d4aa', color: '#0a0f1e' }}
            >
              {loading ? t.creating : t.create}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
