'use client'

import { useState } from 'react'
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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { createTreatmentPlan } from './actions'

type PlanService = {
  service_id: string
  service_name: string
  quantity: number
  unit_price_egp: number
}

export default function CreatePlanDialog({
  clinicId,
  locale,
  patientId,
  services,
}: {
  clinicId: string
  locale: string
  patientId: string
  services: { id: string; name: string; price: number }[]
}) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [planServices, setPlanServices] = useState<PlanService[]>([])
  const [selectedServiceId, setSelectedServiceId] = useState('')
  const [quantity, setQuantity] = useState('1')
  const [unitPrice, setUnitPrice] = useState('')
  const [totalOverride, setTotalOverride] = useState<string>('')
  const isAr = locale === 'ar'

  const linesTotal = planServices.reduce((sum, s) => sum + s.quantity * s.unit_price_egp, 0)
  const effectiveTotal = totalOverride !== '' ? Number(totalOverride) : linesTotal

  const addService = () => {
    if (!selectedServiceId) {
      toast.error(isAr ? 'اختر خدمة' : 'Select a service.')
      return
    }
    const service = services.find(s => s.id === selectedServiceId)
    const price = unitPrice !== '' ? Number(unitPrice) : service?.price || 0
    if (planServices.some(s => s.service_id === selectedServiceId)) {
      toast.error(isAr ? 'الخدمة مضافة بالفعل' : 'Service already added.')
      return
    }
    setPlanServices(prev => [
      ...prev,
      {
        service_id: selectedServiceId,
        service_name: service?.name || '',
        quantity: Math.max(1, Number(quantity) || 1),
        unit_price_egp: price,
      },
    ])
    setSelectedServiceId('')
    setQuantity('1')
    setUnitPrice('')
  }

  const removeService = (serviceId: string) => {
    setPlanServices(prev => prev.filter(s => s.service_id !== serviceId))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const title = formData.get('title') as string
    const sessionCount = Number(formData.get('sessionCount'))

    if (planServices.length === 0) {
      toast.error(isAr ? 'أضف خدمة واحدة على الأقل' : 'Add at least one service.')
      setLoading(false)
      return
    }

    try {
      await createTreatmentPlan(
        clinicId,
        locale,
        patientId,
        title,
        effectiveTotal,
        sessionCount,
        planServices
      )
      toast.success(isAr ? 'تم إنشاء الخطة' : 'Plan created.')
      setOpen(false)
      setPlanServices([])
      setTotalOverride('')
    } catch {
      toast.error(isAr ? 'فشل إنشاء الخطة.' : 'Failed to create treatment plan.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>{isAr ? 'إنشاء خطة علاج' : 'Create Treatment Plan'}</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[560px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isAr ? 'خطة علاج جديدة' : 'New Treatment Plan'}</DialogTitle>
          <DialogDescription>
            {isAr ? 'اختر الخدمات المكوّنة للخطة وتكلفتها الإجمالية.' : 'Select the services that make up the plan and its total cost.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="title">{isAr ? 'اسم الخطة' : 'Plan Title'}</Label>
            <Input id="title" name="title" required placeholder="e.g. Invisalign Ortho" />
          </div>

          {/* Services */}
          <div className="space-y-2">
            <Label>{isAr ? 'الخدمات' : 'Services'}</Label>
            <div className="grid grid-cols-3 gap-2">
              <select
                value={selectedServiceId}
                onChange={(e) => setSelectedServiceId(e.target.value)}
                className="h-9 px-2 rounded-lg text-sm bg-black/20 border border-white/10 text-white focus:outline-none focus:border-teal-500/50"
              >
                <option value="">{isAr ? 'خدمة' : 'Service'}</option>
                {services.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
              <Input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder={isAr ? 'كمية' : 'Qty'}
                className="h-9"
              />
              <div className="flex gap-2">
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={unitPrice}
                  onChange={(e) => setUnitPrice(e.target.value)}
                  placeholder={isAr ? 'السعر' : 'Price'}
                  className="h-9"
                />
                <Button type="button" onClick={addService} size="icon" className="h-9 w-9 shrink-0">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {planServices.length > 0 && (
              <div className="space-y-2 pt-1">
                {planServices.map(s => (
                  <div key={s.service_id} className="flex items-center justify-between gap-2 p-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <span className="text-sm text-slate-200 truncate">
                      {s.service_name} × {s.quantity}
                    </span>
                    <span className="text-sm text-teal-400">{s.quantity * s.unit_price_egp} EGP</span>
                    <Button type="button" variant="ghost" size="icon" className="h-7 w-7 text-red-400" onClick={() => removeService(s.service_id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                <div className="flex items-center justify-between text-sm pt-1">
                  <span className="text-slate-400">{isAr ? 'المجموع التلقائي:' : 'Auto total:'}</span>
                  <span className="text-slate-200 font-medium">{linesTotal} EGP</span>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="totalPrice">{isAr ? 'الإجمالي (EGP)' : 'Total (EGP)'}</Label>
              <Input
                id="totalPrice"
                type="number"
                step="0.01"
                min="0"
                value={effectiveTotal}
                onChange={(e) => setTotalOverride(e.target.value)}
                placeholder="0.00"
              />
              <p className="text-xs text-slate-500">{isAr ? 'يُحسب تلقائياً، ويمكن تعديله يدوياً.' : 'Auto-calculated; override manually if needed.'}</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="sessionCount">{isAr ? 'عدد الجلسات' : 'Sessions'}</Label>
              <Input id="sessionCount" name="sessionCount" type="number" required min="1" max="100" defaultValue="1" />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              {isAr ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (isAr ? 'جارٍ الإنشاء...' : 'Creating...') : (isAr ? 'إنشاء الخطة' : 'Create Plan')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
