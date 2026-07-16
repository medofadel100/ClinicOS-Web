'use client'

import { PremiumCard } from '@/components/layout/PageComponents'
import CreatePlanDialog from './CreatePlanDialog'
import RecordPaymentDialog from './RecordPaymentDialog'
import { updateSessionStatus } from './actions'

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
    paid_at: string
  }[]
}

export default function BillingTab({
  clinicId,
  locale,
  patientId,
  plans,
}: {
  clinicId: string
  locale: string
  patientId: string
  plans: TreatmentPlan[]
}) {
  const handleToggleSession = async (sessionId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'pending' ? 'completed' : 'pending'
    try {
      await updateSessionStatus(clinicId, locale, patientId, sessionId, newStatus)
    } catch (err) {
      console.error(err)
      alert('Failed to update session status')
    }
  }

  return (
    <div className="space-y-6">
      <PremiumCard>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-5 pb-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div>
            <h2 className="text-base font-semibold text-slate-200">Treatment Plans & Billing</h2>
            <p className="text-sm text-slate-500 mt-0.5">Manage patient finances and sessions.</p>
          </div>
          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            <RecordPaymentDialog clinicId={clinicId} locale={locale} patientId={patientId} />
            <CreatePlanDialog clinicId={clinicId} locale={locale} patientId={patientId} />
          </div>
        </div>

        {plans.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-slate-500">No treatment plans found for this patient.</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {plans.map(plan => {
              const totalPaid = plan.patient_payments.reduce((sum, p) => sum + p.amount_egp, 0)
              const remainingBalance = plan.total_price_egp - totalPaid

              return (
                <div key={plan.id} className="rounded-xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div className="flex flex-col md:flex-row md:items-center justify-between p-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <div>
                      <h3 className="text-lg font-bold text-slate-200">{plan.title}</h3>
                      <p className="text-sm text-slate-500 mt-1">
                        Created on {new Date(plan.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="mt-4 md:mt-0 text-left md:text-right bg-black/20 p-3 rounded-lg border border-white/5">
                      <div className="text-xl font-bold text-slate-200">{plan.total_price_egp.toLocaleString()} EGP</div>
                      <div className={`text-sm mt-1 px-2 py-0.5 rounded inline-flex ${remainingBalance > 0 ? 'bg-red-500/10 text-red-400' : 'bg-teal-500/10 text-teal-400'}`}>
                        {remainingBalance > 0 ? `${remainingBalance.toLocaleString()} EGP Remaining` : 'Fully Paid'}
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-5 space-y-8">
                    {/* Sessions */}
                    <div>
                      <h4 className="text-xs font-semibold mb-3 tracking-wider text-slate-400 uppercase flex items-center gap-2">
                        <span className="w-4 h-px bg-slate-700"></span> Sessions
                      </h4>
                      <div className="grid gap-2">
                        {plan.treatment_plan_sessions.sort((a,b) => a.sequence_number - b.sequence_number).map(session => (
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
                                Session #{session.sequence_number}
                              </span>
                            </div>
                            <span className={`text-sm font-semibold ${session.status === 'completed' ? 'text-slate-500' : 'text-slate-300'}`}>
                              {session.session_price_egp.toLocaleString()} EGP
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Payments */}
                    <div>
                      <h4 className="text-xs font-semibold mb-3 tracking-wider text-slate-400 uppercase flex items-center gap-2">
                        <span className="w-4 h-px bg-slate-700"></span> Payments History
                      </h4>
                      {plan.patient_payments.length === 0 ? (
                        <p className="text-sm text-slate-500 italic p-3 bg-black/20 rounded-lg border border-white/5">No payments recorded yet.</p>
                      ) : (
                        <div className="space-y-2">
                          {plan.patient_payments.map(payment => (
                            <div key={payment.id} className="flex justify-between items-center p-3 rounded-lg bg-black/20 border border-white/5">
                              <div>
                                <div className="text-sm font-medium text-slate-300 capitalize flex items-center gap-2">
                                  {payment.payment_type}
                                </div>
                                <div className="text-xs text-slate-500 mt-1">
                                  {new Date(payment.paid_at).toLocaleDateString()}
                                </div>
                              </div>
                              <span className="text-sm font-bold text-teal-400">
                                +{payment.amount_egp.toLocaleString()} EGP
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
