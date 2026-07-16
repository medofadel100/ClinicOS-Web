'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { updateClinicGeneralInfo } from './actions'
import { Loader2, Edit2 } from 'lucide-react'

export default function EditClinicDialog({
  clinicId,
  locale,
  initialData
}: {
  clinicId: string
  locale: string
  initialData: {
    name: string
    owner_full_name: string | null
    owner_phone: string | null
  }
}) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    try {
      await updateClinicGeneralInfo(clinicId, locale, formData)
      setOpen(false)
    } catch (err) {
      console.error(err)
      alert('Failed to update clinic info')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        className="flex items-center gap-2 h-9 px-4 rounded-lg text-sm font-medium transition-colors"
        style={{ background: 'rgba(0,212,170,0.1)', color: '#00d4aa', border: '1px solid rgba(0,212,170,0.2)' }}
      >
        <Edit2 className="w-4 h-4" />
        Edit Details
      </DialogTrigger>
      <DialogContent className="bg-[#0a0f1e] border-white/10 text-white">
        <DialogHeader>
          <DialogTitle>Edit Clinic Details</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400" htmlFor="name">Clinic Name</label>
            <input 
              id="name"
              name="name" 
              defaultValue={initialData.name || ''} 
              required
              className="w-full h-10 px-3 rounded-lg text-sm bg-black/20 border border-white/10 text-white placeholder:text-slate-600 focus:outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/50 transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400" htmlFor="owner_full_name">Owner Name</label>
            <input 
              id="owner_full_name"
              name="owner_full_name" 
              defaultValue={initialData.owner_full_name || ''} 
              className="w-full h-10 px-3 rounded-lg text-sm bg-black/20 border border-white/10 text-white placeholder:text-slate-600 focus:outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/50 transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400" htmlFor="owner_phone">Owner Phone</label>
            <input 
              id="owner_phone"
              name="owner_phone" 
              defaultValue={initialData.owner_phone || ''} 
              className="w-full h-10 px-3 rounded-lg text-sm bg-black/20 border border-white/10 text-white placeholder:text-slate-600 focus:outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/50 transition-all"
            />
          </div>
          <div className="flex justify-end pt-4 border-t border-white/10">
            <button 
              type="submit" 
              disabled={loading}
              className="flex items-center gap-2 h-10 px-6 rounded-lg text-sm font-semibold transition-all disabled:opacity-50"
              style={{ background: '#00d4aa', color: '#0a0f1e' }}
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Save Changes
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
