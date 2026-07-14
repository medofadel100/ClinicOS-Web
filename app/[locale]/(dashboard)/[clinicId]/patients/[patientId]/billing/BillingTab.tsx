'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Treatment Plans & Billing</h2>
        <div className="flex gap-2">
          <RecordPaymentDialog clinicId={clinicId} locale={locale} patientId={patientId} />
          <CreatePlanDialog clinicId={clinicId} locale={locale} patientId={patientId} />
        </div>
      </div>

      {plans.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center text-muted-foreground">
            No treatment plans found for this patient.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {plans.map(plan => {
            const totalPaid = plan.patient_payments.reduce((sum, p) => sum + p.amount_egp, 0)
            const remainingBalance = plan.total_price_egp - totalPaid

            return (
              <Card key={plan.id}>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>{plan.title}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      Created on {new Date(plan.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">{plan.total_price_egp.toLocaleString()} EGP</div>
                    <div className={`text-sm ${remainingBalance > 0 ? 'text-destructive font-medium' : 'text-green-600 font-medium'}`}>
                      {remainingBalance > 0 ? `${remainingBalance.toLocaleString()} EGP Remaining` : 'Fully Paid'}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  
                  {/* Sessions */}
                  <div>
                    <h3 className="text-sm font-semibold mb-3 text-slate-500 uppercase">Sessions</h3>
                    <div className="space-y-2">
                      {plan.treatment_plan_sessions.sort((a,b) => a.sequence_number - b.sequence_number).map(session => (
                        <div key={session.id} className="flex justify-between items-center p-3 border rounded-md bg-slate-50">
                          <div className="flex items-center gap-3">
                            <input 
                              type="checkbox" 
                              checked={session.status === 'completed'}
                              onChange={() => handleToggleSession(session.id, session.status)}
                              className="h-4 w-4 rounded border-gray-300"
                            />
                            <span className={session.status === 'completed' ? 'line-through text-slate-400' : 'font-medium'}>
                              Session {session.sequence_number}
                            </span>
                          </div>
                          <div className="text-sm text-slate-600">
                            {session.session_price_egp} EGP
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Payments Ledger */}
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="text-sm font-semibold text-slate-500 uppercase">Payment Ledger</h3>
                      {remainingBalance > 0 && (
                        <RecordPaymentDialog 
                          clinicId={clinicId} 
                          locale={locale} 
                          patientId={patientId} 
                          treatmentPlanId={plan.id}
                          remainingBalance={remainingBalance}
                        />
                      )}
                    </div>
                    {plan.patient_payments.length === 0 ? (
                      <p className="text-sm text-muted-foreground italic">No payments recorded yet.</p>
                    ) : (
                      <div className="space-y-2">
                        {plan.patient_payments.sort((a,b) => new Date(b.paid_at).getTime() - new Date(a.paid_at).getTime()).map(payment => (
                          <div key={payment.id} className="flex justify-between items-center p-3 border border-green-200 bg-green-50 rounded-md">
                            <div>
                              <div className="font-medium text-green-800">
                                {payment.amount_egp.toLocaleString()} EGP
                              </div>
                              <div className="text-xs text-green-600 uppercase mt-0.5">
                                {payment.payment_type.replace('_', ' ')}
                              </div>
                            </div>
                            <div className="text-sm text-green-700">
                              {new Date(payment.paid_at).toLocaleDateString()}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
