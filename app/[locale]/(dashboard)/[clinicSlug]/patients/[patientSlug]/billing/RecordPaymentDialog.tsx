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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { recordPayment } from './actions'

const PAYMENT_TYPES = ['deposit', 'session_payment', 'full_payment', 'other'] as const
const PAYMENT_METHODS = ['cash', 'bank_transfer', 'vodafone_cash', 'instapay', 'other'] as const

const typeLabels = (isAr: boolean): Record<string, string> => ({
  deposit: isAr ? 'عربون' : 'Deposit',
  session_payment: isAr ? 'دفعة جلسة' : 'Session Payment',
  full_payment: isAr ? 'دفعة كاملة' : 'Full Payment',
  other: isAr ? 'أخرى' : 'Other',
})

const methodLabels = (isAr: boolean): Record<string, string> => ({
  cash: isAr ? 'نقداً' : 'Cash',
  bank_transfer: isAr ? 'تحويل بنكي' : 'Bank Transfer',
  vodafone_cash: isAr ? 'فودافون كاش' : 'Vodafone Cash',
  instapay: isAr ? 'انستا باي' : 'InstaPay',
  other: isAr ? 'أخرى' : 'Other',
})

export default function RecordPaymentDialog({
  clinicId,
  locale,
  patientId,
  treatmentPlanId,
  remainingBalance,
}: {
  clinicId: string
  locale: string
  patientId: string
  treatmentPlanId?: string
  remainingBalance?: number
}) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [isAr, setIsAr] = useState(false)

  useEffect(() => {
    setIsAr(document.documentElement.lang === 'ar')
  }, [])

  const t = {
    trigger: treatmentPlanId ? (isAr ? 'تسجيل دفعة' : 'Record Payment') : (isAr ? 'تسجيل دفعة عامة' : 'Record Payment'),
    title: isAr ? 'تسجيل دفعة' : 'Record Payment',
    description: treatmentPlanId
      ? (isAr ? `تسجيل دفعة على الخطة. المتبقي: ${remainingBalance} ج.م` : `Recording payment for plan. Remaining balance: ${remainingBalance} EGP`)
      : (isAr ? 'تسجيل دفعة عامة لهذا المريض.' : 'Record a general payment for this patient.'),
    amount: isAr ? 'المبلغ (ج.م)' : 'Amount (EGP)',
    amountPlaceholder: isAr ? 'أدخل المبلغ...' : 'Enter amount...',
    paymentType: isAr ? 'نوع الدفعة' : 'Payment Type',
    paymentMethod: isAr ? 'طريقة الدفع' : 'Payment Method',
    paymentDate: isAr ? 'تاريخ الدفع' : 'Payment Date',
    cancel: isAr ? 'إلغاء' : 'Cancel',
    save: isAr ? 'تسجيل الدفعة' : 'Record Payment',
    saving: isAr ? 'جاري التسجيل...' : 'Recording...',
    success: isAr ? 'تم تسجيل الدفعة' : 'Payment recorded',
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const amount = Number(formData.get('amount'))
    const paymentType = formData.get('paymentType') as (typeof PAYMENT_TYPES)[number]
    const paymentMethod = formData.get('paymentMethod') as (typeof PAYMENT_METHODS)[number]
    const paymentDate = formData.get('paymentDate') as string

    try {
      const paidAt = paymentDate ? new Date(`${paymentDate}T12:00:00`).toISOString() : undefined
      await recordPayment(clinicId, locale, patientId, amount, paymentType, paymentMethod, treatmentPlanId, paidAt)
      toast.success(t.success)
      setOpen(false)
    } catch (err) {
      const error = err as Error
      toast.error(error.message || (isAr ? 'فشل في تسجيل الدفع' : 'Failed to record payment. You may not be authorized.'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={treatmentPlanId ? "default" : "secondary"}>
          {t.trigger}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t.title}</DialogTitle>
          <DialogDescription>
            {t.description}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="amount">{t.amount}</Label>
            <Input id="amount" name="amount" type="number" step="0.01" required min="0.01" max={remainingBalance} defaultValue={remainingBalance || ''} placeholder={t.amountPlaceholder} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="paymentDate">{t.paymentDate}</Label>
            <Input id="paymentDate" name="paymentDate" type="date" defaultValue={new Date().toISOString().slice(0, 10)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="paymentType">{t.paymentType}</Label>
            <Select name="paymentType" defaultValue={treatmentPlanId ? 'session_payment' : 'other'} required>
              <SelectTrigger>
                <SelectValue placeholder={t.paymentType} />
              </SelectTrigger>
              <SelectContent>
                {PAYMENT_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>{typeLabels(isAr)[type]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="paymentMethod">{t.paymentMethod}</Label>
            <Select name="paymentMethod" defaultValue="cash" required>
              <SelectTrigger>
                <SelectValue placeholder={t.paymentMethod} />
              </SelectTrigger>
              <SelectContent>
                {PAYMENT_METHODS.map((method) => (
                  <SelectItem key={method} value={method}>{methodLabels(isAr)[method]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              {t.cancel}
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? t.saving : t.save}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
