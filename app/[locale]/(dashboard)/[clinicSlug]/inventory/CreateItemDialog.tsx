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
import { toast } from 'sonner'
import { createInventoryItem } from './actions'

export default function CreateItemDialog({
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
    const name = formData.get('name') as string
    const unit = formData.get('unit') as string
    const minThreshold = Number(formData.get('minThreshold'))
    const category = formData.get('category') as string
    const expiresAt = formData.get('expiresAt') as string || null

    try {
      await createInventoryItem(clinicId, locale, name, unit, minThreshold, category, expiresAt)
      setOpen(false)
    } catch (err) {
      toast.error(isAr ? 'فشل في إضافة الصنف' : 'Failed to create inventory item')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      
      <DialogTrigger asChild>
        <Button>{isAr ? 'إضافة صنف' : 'Add New Item'}</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isAr ? 'إضافة صنف جديد' : 'Add New Item'}</DialogTitle>
          <DialogDescription>
            {isAr ? 'إنشاء صنف جديد في مخزون العيادة.' : 'Create a new tracked item in your clinic\'s inventory.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="name">{isAr ? 'اسم الصنف' : 'Item Name'}</Label>
            <Input id="name" name="name" required placeholder={isAr ? 'مثال: قفازات جراحية' : 'e.g. Surgical Gloves'} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">{isAr ? 'الفئة (اختياري)' : 'Category (Optional)'}</Label>
            <Input id="category" name="category" placeholder={isAr ? 'مثال: مستهلكات' : 'e.g. Consumables'} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="expiresAt">{isAr ? 'تاريخ الانتهاء (اختياري)' : 'Expiry Date (Optional)'}</Label>
            <Input id="expiresAt" name="expiresAt" type="date" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="unit">{isAr ? 'الوحدة' : 'Unit'}</Label>
              <Input id="unit" name="unit" required placeholder={isAr ? 'مثال: علبة، قطعة' : 'e.g. Box, Piece'} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="minThreshold">{isAr ? 'الحد الأدنى' : 'Min Threshold'}</Label>
              <Input id="minThreshold" name="minThreshold" type="number" min="0" required defaultValue="5" />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              {isAr ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (isAr ? 'جارٍ الإضافة...' : 'Adding...') : (isAr ? 'إضافة صنف' : 'Add Item')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
