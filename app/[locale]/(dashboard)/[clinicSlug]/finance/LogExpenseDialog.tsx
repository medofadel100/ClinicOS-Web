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
import { logExpense } from './actions'

export default function LogExpenseDialog({
  clinicId,
  locale
}: {
  clinicId: string
  locale: string
}) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const isAr = locale === 'ar'

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const title = formData.get('title') as string
    const category = formData.get('category') as 'rent' | 'salaries' | 'installment' | 'utilities' | 'supplies' | 'other'
    const amount = Number(formData.get('amount'))
    const recurrence = formData.get('recurrence') as 'one_time' | 'weekly' | 'monthly' | 'yearly'
    const startDate = formData.get('startDate') as string

    try {
      await logExpense(clinicId, locale, title, category, amount, recurrence, startDate)
      setOpen(false)
    } catch (err: unknown) {
      console.error(err)
      alert(err instanceof Error ? err.message : 'Failed to log expense')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      
      <DialogTrigger asChild>
        <Button>{isAr ? 'تسجيل مصروف جديد' : 'Log New Expense'}</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isAr ? 'تسجيل مصروف' : 'Log Expense'}</DialogTitle>
          <DialogDescription>
            {isAr ? 'تسجيل مصروف عيادة واحد أو متكرر.' : 'Record a one-time or recurring clinic expense.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="title">{isAr ? 'العنوان' : 'Title'}</Label>
            <Input id="title" name="title" required placeholder={isAr ? 'مثال: إيجار أغسطس' : 'e.g. August Rent'} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">{isAr ? 'الفئة' : 'Category'}</Label>
              <Select name="category" defaultValue="supplies" required>
                <SelectTrigger>
                  <SelectValue placeholder={isAr ? 'اختر النوع' : 'Select type'} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rent">{isAr ? 'إيجار' : 'Rent'}</SelectItem>
                  <SelectItem value="salaries">{isAr ? 'رواتب' : 'Salaries'}</SelectItem>
                  <SelectItem value="installment">{isAr ? 'قسط' : 'Installment'}</SelectItem>
                  <SelectItem value="utilities">{isAr ? 'مرافق' : 'Utilities'}</SelectItem>
                  <SelectItem value="supplies">{isAr ? 'مستلزمات' : 'Supplies'}</SelectItem>
                  <SelectItem value="other">{isAr ? 'أخرى' : 'Other'}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount">{isAr ? 'المبلغ (ج.م)' : 'Amount (EGP)'}</Label>
              <Input id="amount" name="amount" type="number" step="0.01" required min="0.01" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="recurrence">{isAr ? 'التكرار' : 'Recurrence'}</Label>
              <Select name="recurrence" defaultValue="one_time" required>
                <SelectTrigger>
                  <SelectValue placeholder={isAr ? 'اختر التكرار' : 'Select recurrence'} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="one_time">{isAr ? 'مرة واحدة' : 'One Time'}</SelectItem>
                  <SelectItem value="weekly">{isAr ? 'أسبوعي' : 'Weekly'}</SelectItem>
                  <SelectItem value="monthly">{isAr ? 'شهري' : 'Monthly'}</SelectItem>
                  <SelectItem value="yearly">{isAr ? 'سنوي' : 'Yearly'}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="startDate">{isAr ? 'تاريخ البدء' : 'Start Date'}</Label>
              <Input id="startDate" name="startDate" type="date" required defaultValue={new Date().toISOString().split('T')[0]} />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (isAr ? 'جاري الإنشاء...' : 'Creating...') : (isAr ? 'إنشاء المصروف' : 'Create Expense')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
