'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { useParams } from 'next/navigation'
import { PremiumCard } from '@/components/layout/PageComponents'
import CreatePlanDialog from './CreatePlanDialog'
import RecordPaymentDialog from './RecordPaymentDialog'
import { updateSessionStatus } from './actions'
import { generateInvoicePDF } from '@/lib/invoice-pdf'
import { Download } from 'lucide-react'

type TreatmentPlan = {
  id: string
  title: string
  total_price_egp: number
  status: string
  created_at: string
  treatment_plan_sessions: {
    id: string
    sequence_number: number
    session_price_egp: number
    status: 'pending' | 'completed'
  }[]
  patient_payments: {
    id: string
    amount_egp: number
    payment_type: string
    payment_method: string
    paid_at: string
  }[]
}

const methodLabels = (isAr: boolean): Record<string, string> => ({
  cash: isAr ? 'نقداً' : 'Cash',
  bank_transfer: isAr ? 'تحويل بنكي' : 'Bank Transfer',
  vodafone_cash: isAr ? 'فودافون كاش' : 'Vodafone Cash',
  instapay: isAr ? 'انستا باي' : 'InstaPay',
  other: isAr ? 'أخرى' : 'Other',
})

export default function BillingTab({
  clinicId,
  locale,
  patientId,
  plans: initialPlans,
  patientName,
  patientPhone,
  patientDisplayId,
  clinicName,
  clinicAddress,
  clinicPhone,
  clinicEmail,
  clinicOwnerName,
  services,
}: {
  clinicId: string
  locale: string
  patientId: string
  plans: TreatmentPlan[]
  patientName: string
  patientPhone: string | null
  patientDisplayId: string | null
  clinicName: string
  clinicAddress: string | null
  clinicPhone: string | null
  clinicEmail: string | null
  clinicOwnerName: string | null
  services: { id: string; name: string; price: number }[]
}) {
  const _params = useParams()
  const [plans, _setPlans] = useState(initialPlans)
  const [downloadingPlanId, setDownloadingPlanId] = useState<string | null>(null)
  const isAr = locale === 'ar'

  const totalBilled = plans.reduce((sum, plan) => sum + Number(plan.total_price_egp || 0), 0)
  const totalPaid = plans.reduce(
    (sum, plan) => sum + plan.patient_payments.reduce((s, p) => s + Number(p.amount_egp || 0), 0),
    0
  )
  const totalDebt = Math.max(0, totalBilled - totalPaid)
  const methods = methodLabels(isAr)

  const handleToggleSession = async (sessionId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'pending' ? 'completed' : 'pending'
    try {
      await updateSessionStatus(clinicId, locale, patientId, sessionId, newStatus)
    } catch {
      toast.error(isAr ? 'فشل في تحديث حالة الجلسة' : 'Failed to update session status')
    }
  }

  const handleDownloadInvoice = async (plan: TreatmentPlan) => {
    setDownloadingPlanId(plan.id)
    try {
      const invoiceNumber = `INV-${plan.id.slice(0, 8).toUpperCase()}`
      const doc = generateInvoicePDF({
        patient: {
          id: patientId,
          full_name: patientName,
          phone: patientPhone,
          display_id: patientDisplayId,
        },
        clinic: {
          name: clinicName,
          address: clinicAddress,
          contact_phone: clinicPhone,
          contact_email: clinicEmail,
          owner_full_name: clinicOwnerName,
        },
        plan,
        invoiceNumber,
        isAr,
      })
      doc.save(`${invoiceNumber}.pdf`)
      toast.success(isAr ? 'تم تحميل الفاتورة' : 'Invoice downloaded')
    } catch {
      toast.error(isAr ? 'فشل في إنشاء الفاتورة' : 'Failed to generate invoice')
    } finally {
      setDownloadingPlanId(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Debt summary card */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="text-xs font-medium text-slate-500">{isAr ? 'إجمالي المبالغ المطلوبة' : 'Total Billed'}</div>
          <div className="mt-1.5 text-2xl font-bold text-slate-200">{totalBilled.toLocaleString()} <span className="text-sm font-medium text-slate-500">EGP</span></div>
        </div>
        <div className="rounded-2xl p-5" style={{ background: 'rgba(0,212,170,0.04)', border: '1px solid rgba(0,212,170,0.12)' }}>
          <div className="text-xs font-medium text-slate-500">{isAr ? 'إجمالي المدفوع' : 'Total Paid'}</div>
          <div className="mt-1.5 text-2xl font-bold" style={{ color: 'hsl(168 100% 52%)' }}>{totalPaid.toLocaleString()} <span className="text-sm font-medium text-slate-500">EGP</span></div>
        </div>
        <div className="rounded-2xl p-5" style={{ background: totalDebt > 0 ? 'rgba(239,68,68,0.06)' : 'rgba(0,212,170,0.04)', border: totalDebt > 0 ? '1px solid rgba(239,68,68,0.2)' : '1px solid rgba(0,212,170,0.12)' }}>
          <div className="text-xs font-medium text-slate-500">{isAr ? 'المديونية المتبقية' : 'Remaining Debt'}</div>
          <div className="mt-1.5 text-2xl font-bold" style={{ color: totalDebt > 0 ? 'hsl(0 84% 65%)' : 'hsl(168 100% 52%)' }}>
            {totalDebt.toLocaleString()} <span className="text-sm font-medium text-slate-500">EGP</span>
          </div>
        </div>
      </div>

      <PremiumCard>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-5 pb-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div>
            <h2 className="text-base font-semibold text-slate-200">{isAr ? 'خطط العلاج والفواتير' : 'Treatment Plans & Billing'}</h2>
            <p className="text-sm text-slate-500 mt-0.5">{isAr ? 'إدارة مالية المريض والجلاسات.' : 'Manage patient finances and sessions.'}</p>
          </div>
          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            <RecordPaymentDialog clinicId={clinicId} locale={locale} patientId={patientId} />
            <CreatePlanDialog clinicId={clinicId} locale={locale} patientId={patientId} services={services} />
          </div>
        </div>

        {plans.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-slate-500">{isAr ? 'لم يتم العثور على خطط علاج لهذا المريض.' : 'No treatment plans found for this patient.'}</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {plans.map(plan => {
              const planPaid = plan.patient_payments.reduce((sum, p) => sum + Number(p.amount_egp || 0), 0)
              const remainingBalance = Number(plan.total_price_egp || 0) - planPaid

              return (
                <div key={plan.id} className="rounded-xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div className="flex flex-col md:flex-row md:items-center justify-between p-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <div>
                      <h3 className="text-lg font-bold text-slate-200">{plan.title}</h3>
                      <p className="text-sm text-slate-500 mt-1">
                        {isAr ? 'تم الإنشاء في' : 'Created on'} {new Date(plan.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="mt-4 md:mt-0 flex items-center gap-3">
                      <RecordPaymentDialog
                        clinicId={clinicId}
                        locale={locale}
                        patientId={patientId}
                        treatmentPlanId={plan.id}
                        remainingBalance={Math.max(0, remainingBalance)}
                      />
                      <button
                        onClick={() => handleDownloadInvoice(plan)}
                        disabled={downloadingPlanId === plan.id}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-teal-500/10 text-teal-400 hover:bg-teal-500/20 transition-colors disabled:opacity-50"
                      >
                        <Download className="w-3.5 h-3.5" />
                        {downloadingPlanId === plan.id ? (isAr ? 'جاري التحميل...' : 'Generating...') : (isAr ? 'تحميل الفاتورة' : 'Invoice')}
                      </button>
                      <div className="text-left md:text-right bg-black/20 p-3 rounded-lg border border-white/5">
                        <div className="text-xl font-bold text-slate-200">{Number(plan.total_price_egp || 0).toLocaleString()} EGP</div>
                        <div className={`text-sm mt-1 px-2 py-0.5 rounded inline-flex ${remainingBalance > 0 ? 'bg-red-500/10 text-red-400' : 'bg-teal-500/10 text-teal-400'}`}>
                          {remainingBalance > 0 ? `${remainingBalance.toLocaleString()} EGP ${isAr ? 'متبقي' : 'Remaining'}` : (isAr ? 'مدفوع بالكامل' : 'Fully Paid')}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-5 space-y-8">
                    {/* Sessions */}
                    <div>
                      <h4 className="text-xs font-semibold mb-3 tracking-wider text-slate-400 uppercase flex items-center gap-2">
                        <span className="w-4 h-px bg-slate-700"></span> {isAr ? 'الجلاسات' : 'Sessions'}
                      </h4>
                      <div className="grid gap-2">
                        {[...plan.treatment_plan_sessions].sort((a,b) => a.sequence_number - b.sequence_number).map(session => (
                          <label key={session.id} className="flex justify-between items-center p-3 rounded-lg bg-black/20 border border-white/5 hover:bg-white/[0.02] transition-colors cursor-pointer group">
                            <div className="flex items-center gap-4">
                              <div className="relative flex items-center justify-center">
                                <input 
                                  type="checkbox" 
                                  checked={session.status === 'completed'}
                                  onChange={() => handleToggleSession(session.id, session.status)}
                                  className="peer appearance-none w-5 h-5 border border-white/20 rounded bg-black/40 checked:bg-teal-500 checked:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500/50 transition-all cursor-pointer"
                                />
                                <svg className="absolute w-3 h-3 pointer-events-none opacity-0 peer-checked:opacity-100 text-[#0a0f1e]" viewBox="0 0 14 10" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 5L4.5 8.5L13 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                              </div>
                              <span className={`text-sm font-medium transition-colors ${session.status === 'completed' ? 'text-slate-500 line-through' : 'text-slate-300 group-hover:text-white'}`}>
                                {isAr ? 'جلسة' : 'Session'} #{session.sequence_number}
                              </span>
                            </div>
                            <span className={`text-sm font-semibold ${session.status === 'completed' ? 'text-slate-500' : 'text-slate-300'}`}>
                              {Number(session.session_price_egp || 0).toLocaleString()} EGP
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Payments */}
                    <div>
                      <h4 className="text-xs font-semibold mb-3 tracking-wider text-slate-400 uppercase flex items-center gap-2">
                        <span className="w-4 h-px bg-slate-700"></span> {isAr ? 'سجل المدفوعات' : 'Payments History'}
                      </h4>
                      {plan.patient_payments.length === 0 ? (
                        <p className="text-sm text-slate-500 italic p-3 bg-black/20 rounded-lg border border-white/5">{isAr ? 'لم يتم تسجيل مدفوعات بعد.' : 'No payments recorded yet.'}</p>
                      ) : (
                        <div className="space-y-2">
                          {plan.patient_payments.map(payment => (
                            <div key={payment.id} className="flex justify-between items-center p-3 rounded-lg bg-black/20 border border-white/5">
                              <div>
                                <div className="text-sm font-medium text-slate-300 capitalize flex items-center gap-2">
                                  {payment.payment_type.replace('_', ' ')}
                                  <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wide"
                                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'hsl(168 100% 52%)' }}>
                                    {methods[payment.payment_method] || payment.payment_method?.replace('_', ' ')}
                                  </span>
                                </div>
                                <div className="text-xs text-slate-500 mt-1">
                                  {new Date(payment.paid_at).toLocaleString()}
                                </div>
                              </div>
                              <span className="text-sm font-bold text-teal-400">
                                +{Number(payment.amount_egp || 0).toLocaleString()} EGP
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </PremiumCard>
    </div>
  )
}
