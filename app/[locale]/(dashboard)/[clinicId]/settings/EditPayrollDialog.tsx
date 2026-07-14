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
  currentConfig
}: {
  clinicId: string
  membershipId: string
  staffName: string
  currentConfig: PayrollConfig | null
}) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [salaryType, setSalaryType] = useState(currentConfig?.salary_type || 'fixed')

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
      console.error(err)
      alert(err instanceof Error ? err.message : 'Failed to update payroll config')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {/* @ts-expect-error Types mismatch */}
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">Manage Pay</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Payroll config: {staffName}</DialogTitle>
          <DialogDescription>
            Set up the pay structure for this staff member.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="salary_type">Salary Type</Label>
            <Select 
              name="salary_type" 
              value={salaryType} 
              onValueChange={(val) => setSalaryType(val as 'fixed' | 'commission' | 'fixed_plus_commission')}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fixed">Fixed Base Salary</SelectItem>
                <SelectItem value="commission">Commission Only</SelectItem>
                <SelectItem value="fixed_plus_commission">Base + Commission</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {(salaryType === 'fixed' || salaryType === 'fixed_plus_commission') && (
            <div className="space-y-2">
              <Label htmlFor="base_salary">Base Salary (EGP)</Label>
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
              <Label htmlFor="commission">Commission Percentage (%)</Label>
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
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Save Config'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
