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
import { DollarSign } from 'lucide-react'
import { generatePayroll } from './actions'

export default function GeneratePayrollDialog({
  clinicId,
  locale
}: {
  clinicId: string
  locale: string
}) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  // Default to current month (YYYY-MM)
  const currentMonth = new Date().toISOString().slice(0, 7)
  const [month, setMonth] = useState(currentMonth)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    try {
      // month is "YYYY-MM", we need a date like "YYYY-MM-01" for the DB period_month
      const periodMonth = `${month}-01`
      await generatePayroll(clinicId, locale, periodMonth)
      setOpen(false)
      alert('Payroll generated successfully!')
    } catch (err: unknown) {
      console.error(err)
      alert(err instanceof Error ? err.message : 'Failed to generate payroll')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-emerald-500 hover:bg-emerald-600 text-white shadow">
          <DollarSign className="w-4 h-4 mr-2" />
          Run Payroll
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Run Payroll</DialogTitle>
          <DialogDescription>
            Generate draft payroll records for all active staff members for the selected month.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="month">Period Month</Label>
            <Input 
              id="month" 
              name="month" 
              type="month" 
              value={month} 
              onChange={e => setMonth(e.target.value)}
              required 
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-emerald-500 hover:bg-emerald-600">
              {loading ? 'Running...' : 'Generate Payroll'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
