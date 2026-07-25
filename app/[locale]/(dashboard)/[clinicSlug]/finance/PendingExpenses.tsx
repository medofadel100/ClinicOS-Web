'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { PremiumTableWrapper, EmptyState, StatusBadge } from '@/components/layout/PageComponents'
import { Button } from '@/components/ui/button'
import { Clock, CheckCircle } from 'lucide-react'
import { payOccurrence } from './actions'

export default function PendingExpenses({
  clinicId,
  locale,
  pendingOccurrences
}: {
  clinicId: string
  locale: string
  pendingOccurrences: any[]
}) {
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const isAr = locale === 'ar'

  const handlePay = async (occurrenceId: string) => {
    setLoadingId(occurrenceId)
    try {
      await payOccurrence(clinicId, locale, occurrenceId)
    } catch (err: any) {
      toast.error(isAr ? 'فشل في التحديد كمدفوع' : 'Failed to mark as paid')
    } finally {
      setLoadingId(null)
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-slate-200">{isAr ? 'المصروفات المعلقة' : 'Pending Expenses'}</h2>
        <StatusBadge status="pending" />
      </div>
      <PremiumTableWrapper>
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              {(isAr ? ['العنوان', 'الفئة', 'تاريخ الاستحقاق', 'المبلغ', 'الإجراء'] : ['Expense Title', 'Category', 'Due Date', 'Amount', 'Action']).map(h => (
                <th key={h} className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {!pendingOccurrences.length ? (
              <tr><td colSpan={5}><EmptyState icon={CheckCircle} title={isAr ? 'لا توجد مصروفات معلقة.' : 'All caught up!'} description={isAr ? 'لا توجد مصروفات معلقة.' : 'No pending expenses found.'} /></td></tr>
            ) : pendingOccurrences.map((occ, i) => (
              <tr key={occ.id} className="hover:bg-white/[0.02] transition-colors" style={{ borderBottom: i < pendingOccurrences.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                <td className="px-5 py-4 text-sm font-semibold text-slate-200">{occ.clinic_expenses?.title || 'Unknown'}</td>
                <td className="px-5 py-4 text-sm text-slate-400 capitalize">{occ.clinic_expenses?.category || '—'}</td>
                <td className="px-5 py-4 text-sm text-slate-400 flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5" />
                  {new Date(occ.period_date).toLocaleDateString()}
                </td>
                <td className="px-5 py-4 text-sm font-bold text-red-400">{Number(occ.amount_egp || 0).toFixed(2)} EGP</td>
                <td className="px-5 py-4">
                  <Button 
                    size="sm" 
                    variant="outline"
                    className="h-8 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 hover:text-emerald-300 transition-colors"
                    disabled={loadingId === occ.id}
                    onClick={() => handlePay(occ.id)}
                  >
                    {loadingId === occ.id ? (isAr ? 'جاري التحديد...' : 'Marking...') : (isAr ? 'تحديد كمدفوع' : 'Mark as Paid')}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </PremiumTableWrapper>
    </div>
  )
}
