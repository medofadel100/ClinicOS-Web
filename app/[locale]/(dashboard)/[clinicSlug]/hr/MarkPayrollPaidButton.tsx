'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { markPayrollRunPaid } from './actions'

export default function MarkPayrollPaidButton({
  clinicId,
  locale,
  payrollRunId,
  isAr,
}: {
  clinicId: string
  locale: string
  payrollRunId: string
  isAr: boolean
}) {
  const [loading, setLoading] = useState(false)

  const handleClick = async () => {
    if (!confirm(isAr ? 'تأكيد دفع هذا الراتب وإضافته كمصروف؟' : 'Confirm paying this salary and adding it as an expense?')) return
    setLoading(true)
    try {
      await markPayrollRunPaid(clinicId, locale, payrollRunId)
      toast.success(isAr ? 'تم تسجيل الدفع كمصروف رواتب' : 'Salary marked as paid and added to expenses')
    } catch (err) {
      const error = err as Error
      toast.error(error.message || (isAr ? 'فشل في تسجيل الدفع' : 'Failed to mark as paid'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold transition-all duration-200 disabled:opacity-50"
      style={{
        background: 'rgba(0,212,170,0.08)',
        border: '1px solid rgba(0,212,170,0.2)',
        color: 'hsl(168 100% 52%)',
      }}
    >
      {loading ? (isAr ? 'جاري الحفظ...' : 'Saving...') : (isAr ? 'تم الدفع' : 'Mark Paid')}
    </button>
  )
}
