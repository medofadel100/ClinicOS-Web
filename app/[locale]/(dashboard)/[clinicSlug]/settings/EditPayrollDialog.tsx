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
import { toast } from 'sonner'
import { upsertPayrollConfig } from './actions'

type PayrollConfig = {
  salary_type: 'fixed' | 'commission' | 'fixed_plus_commission'
  base_salary_egp: number | null
  commission_percentage: number | null
}

export default function EditPayrollDialog({
  clinicId,
  membershipId,
  staffName,
  currentConfig,
  locale = 'en'
}: {
  clinicId: string
  membershipId: string
  staffName: string
  currentConfig: PayrollConfig | null
  locale?: string
}) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [salaryType, setSalaryType] = useState(currentConfig?.salary_type || 'fixed')
  const isAr = locale === 'ar'

  const t = {
    managePay: isAr ? 'إدارة الراتب' : 'Manage Pay',
    payrollConfig: isAr ? 'إعداد الراتب:' : 'Payroll config:',
    payrollDesc: isAr ? 'تحديد هيكل الراتب لهذا العضو.' : 'Set up the pay structure for this staff member.',
    salaryType: isAr ? 'نوع الراتب' : 'Salary Type',
    selectType: isAr ? 'اختر النوع...' : 'Select type',
    fixedBase: isAr ? 'راتب ثابت' : 'Fixed Base Salary',
    commissionOnly: isAr ? 'عمولة فقط' : 'Commission Only',
    baseCommission: isAr ? 'راتب + عمولة' : 'Base + Commission',
    baseSalary: isAr ? 'الراتب الأساسي (ج.م)' : 'Base Salary (EGP)',
    commission: isAr ? 'نسبة العمولة (%)' : 'Commission Percentage (%)',
    cancel: isAr ? 'إلغاء' : 'Cancel',
    saving: isAr ? 'جاري الحفظ...' : 'Saving...',
    saveConfig: isAr ? 'حفظ الإعداد' : 'Save Config',
    failed: isAr ? 'فشل في تحديث إعداد الراتب' : 'Failed to update payroll config',
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const type = formData.get('salary_type') as 'fixed' | 'commission' | 'fixed_plus_commission'
    const baseStr = formData.get('base_salary') as string
    const commStr = formData.get('commission') as string
    
    const baseSalary = baseStr ? Number(baseStr) : null
    const commission = commStr ? Number(commStr) : null

    try {
      await upsertPayrollConfig(clinicId, membershipId, type, baseSalary, commission)
      setOpen(false)
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : t.failed)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">{t.managePay}</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t.payrollConfig} {staffName}</DialogTitle>
          <DialogDescription>
            {t.payrollDesc}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="salary_type">{t.salaryType}</Label>
            <Select 
              name="salary_type" 
              value={salaryType} 
              onValueChange={(val) => setSalaryType(val as 'fixed' | 'commission' | 'fixed_plus_commission')}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder={t.selectType} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fixed">{t.fixedBase}</SelectItem>
                <SelectItem value="commission">{t.commissionOnly}</SelectItem>
                <SelectItem value="fixed_plus_commission">{t.baseCommission}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {(salaryType === 'fixed' || salaryType === 'fixed_plus_commission') && (
            <div className="space-y-2">
              <Label htmlFor="base_salary">{t.baseSalary}</Label>
              <Input 
                id="base_salary" 
                name="base_salary" 
                type="number" 
                step="0.01" 
                min="0"
                required 
                defaultValue={currentConfig?.base_salary_egp || ''} 
              />
            </div>
          )}

          {(salaryType === 'commission' || salaryType === 'fixed_plus_commission') && (
            <div className="space-y-2">
              <Label htmlFor="commission">{t.commission}</Label>
              <Input 
                id="commission" 
                name="commission" 
                type="number" 
                step="0.01" 
                min="0"
                max="100"
                required 
                defaultValue={currentConfig?.commission_percentage || ''} 
              />
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              {t.cancel}
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? t.saving : t.saveConfig}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
