'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { changeClinicType, fetchClinicTypes } from './actions'
import { RefreshCw } from 'lucide-react'

export default function ChangeClinicTypeDialog({
  clinicId,
  locale,
  currentTypeId,
  currentTypeName,
}: {
  clinicId: string
  locale: string
  currentTypeId: string
  currentTypeName: string
}) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [types, setTypes] = useState<{ id: string; code: string; name_en: string; name_ar: string }[]>([])
  const [selectedTypeId, setSelectedTypeId] = useState(currentTypeId)
  const [fetching, setFetching] = useState(false)
  const isAr = locale === 'ar'

  useEffect(() => {
    if (open && types.length === 0) {
      setFetching(true)
      fetchClinicTypes(locale)
        .then(setTypes)
        .catch(() => toast.error(isAr ? 'فشل في تحميل الأنواع' : 'Failed to load clinic types'))
        .finally(() => setFetching(false))
    }
  }, [open, types.length, locale, isAr])

  const handleSubmit = async () => {
    if (selectedTypeId === currentTypeId) {
      setOpen(false)
      return
    }
    setLoading(true)
    try {
      await changeClinicType(clinicId, locale, selectedTypeId)
      setOpen(false)
      window.location.reload()
    } catch {
      toast.error(isAr ? 'فشل في تغيير نوع العيادة' : 'Failed to change clinic type')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-teal-400 hover:text-teal-300 transition-colors cursor-pointer"
        >
          <RefreshCw className="w-3 h-3" />
          {isAr ? 'تغيير' : 'Change'}
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>{isAr ? 'تغيير نوع العيادة' : 'Change Clinic Type'}</DialogTitle>
          <DialogDescription>
            {isAr
              ? 'اختر نوع العيادة الجديد. سيتم تغيير القسم الرئيسي والخدمات المقترحة.'
              : 'Select a new clinic type. This will change the main department and suggested services.'}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label>{isAr ? 'النوع الحالي' : 'Current Type'}</Label>
            <div
              className="px-3 py-2.5 rounded-xl text-sm text-slate-400 font-medium"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
            >
              {currentTypeName}
            </div>
          </div>
          <div className="space-y-2">
            <Label>{isAr ? 'اختر النوع الجديد' : 'Select New Type'}</Label>
            {fetching ? (
              <div className="px-3 py-6 text-center text-sm text-slate-500">
                {isAr ? 'جارٍ التحميل...' : 'Loading...'}
              </div>
            ) : (
              <div className="max-h-[320px] overflow-y-auto space-y-1.5 pr-1" style={{ scrollbarWidth: 'thin' }}>
                {types.map((t) => {
                  const isSelected = t.id === selectedTypeId
                  const isCurrent = t.id === currentTypeId
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setSelectedTypeId(t.id)}
                      className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                        isSelected
                          ? 'text-teal-300'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
                      }`}
                      style={{
                        background: isSelected ? 'rgba(20,184,166,0.1)' : 'rgba(255,255,255,0.02)',
                        border: `1px solid ${isSelected ? 'rgba(20,184,166,0.3)' : 'rgba(255,255,255,0.05)'}`,
                      }}
                    >
                      {isAr ? t.name_ar : t.name_en}
                      {isCurrent && (
                        <span className="ml-2 text-[10px] text-slate-600 uppercase tracking-wider">
                          {isAr ? 'الحالي' : 'current'}
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
            {isAr ? 'إلغاء' : 'Cancel'}
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading || selectedTypeId === currentTypeId || fetching}
          >
            {loading
              ? (isAr ? 'جارٍ التغيير...' : 'Changing...')
              : (isAr ? 'تغيير النوع' : 'Change Type')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
