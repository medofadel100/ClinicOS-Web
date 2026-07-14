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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { recordPayment } from './actions'

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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const amount = Number(formData.get('amount'))
    const paymentType = formData.get('paymentType') as 'deposit' | 'session_payment' | 'full_payment' | 'other'
    const paymentMethod = formData.get('paymentMethod') as 'cash' | 'card' | 'bank_transfer' | 'other'

    try {
      await recordPayment(clinicId, locale, patientId, amount, paymentType, paymentMethod, treatmentPlanId)
      setOpen(false)
    } catch (err) {
      const error = err as Error
      console.error(error)
      alert(error.message || 'Failed to record payment. You may not be authorized.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {/* @ts-expect-error DialogTrigger types might not fully support asChild in this version */}
      <DialogTrigger asChild>
        <Button variant={treatmentPlanId ? "default" : "secondary"}>
          Record Payment
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Record Payment</DialogTitle>
          <DialogDescription>
            {treatmentPlanId 
              ? `Recording payment for plan. Remaining balance: ${remainingBalance} EGP` 
              : 'Record a general payment for this patient.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Amount (EGP)</Label>
            <Input id="amount" name="amount" type="number" step="0.01" required min="0.01" max={remainingBalance} defaultValue={remainingBalance || ''} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="paymentType">Payment Type</Label>
            <Select name="paymentType" defaultValue={treatmentPlanId ? 'session_payment' : 'other'} required>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="deposit">Deposit</SelectItem>
                <SelectItem value="session_payment">Session Payment</SelectItem>
                <SelectItem value="full_payment">Full Payment</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="paymentMethod">Payment Method</Label>
            <Select name="paymentMethod" defaultValue="cash" required>
              <SelectTrigger>
                <SelectValue placeholder="Select method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="card">Card</SelectItem>
                <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Recording...' : 'Record Payment'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
