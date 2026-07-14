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
import { logTransaction } from './actions'

export default function TransactionDialog({
  clinicId,
  locale,
  itemId,
  itemName
}: {
  clinicId: string
  locale: string
  itemId: string
  itemName: string
}) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [txnType, setTxnType] = useState<'restock' | 'usage' | 'adjustment'>('usage')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    let changeQuantity = Number(formData.get('changeQuantity'))
    const note = formData.get('note') as string

    // If it's usage, the change should be negative
    if (txnType === 'usage') {
      changeQuantity = -Math.abs(changeQuantity)
    } else if (txnType === 'restock') {
      changeQuantity = Math.abs(changeQuantity)
    }

    try {
      await logTransaction(clinicId, locale, itemId, changeQuantity, txnType, note)
      setOpen(false)
    } catch (err) {
      console.error(err)
      alert('Failed to log transaction')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {/* @ts-expect-error Types version mismatch */}
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">Log Transaction</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Update Stock: {itemName}</DialogTitle>
          <DialogDescription>
            Record a restock, usage, or count adjustment.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="transactionType">Transaction Type</Label>
            <Select 
              value={txnType} 
              onValueChange={(val) => setTxnType(val as 'restock' | 'usage' | 'adjustment')}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="usage">Usage (-)</SelectItem>
                <SelectItem value="restock">Restock (+)</SelectItem>
                <SelectItem value="adjustment">Adjustment (+/-)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="changeQuantity">Quantity</Label>
            <Input 
              id="changeQuantity" 
              name="changeQuantity" 
              type="number" 
              required 
              min={txnType === 'adjustment' ? undefined : 0.01} 
              step="0.01" 
              placeholder={txnType === 'usage' ? "e.g. 2" : "e.g. 50"}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="note">Note (Optional)</Label>
            <Input id="note" name="note" placeholder="e.g. Received from supplier X" />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Save Transaction'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
