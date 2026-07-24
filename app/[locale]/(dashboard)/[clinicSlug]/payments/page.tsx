import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { requireClinicId } from '@/lib/utils/clinic'
import { PageHeader } from '@/components/layout/PageComponents'
import { CreditCard, Clock, CheckCircle } from 'lucide-react'
import PaymentConfirmCard from './PaymentConfirmCard'

export default async function PaymentsPage({
  params: { locale, clinicSlug }
}: {
  params: { locale: string; clinicSlug: string }
}) {
  const clinicId = await requireClinicId(clinicSlug)
  const isAr = locale === 'ar'
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/${locale}/login`)

  const { data: pendingPayments } = await supabase
    .from('appointments')
    .select(`*, patients ( full_name, phone ), clinic_staff_memberships ( staff_members ( full_name ) ), clinic_services ( name, price )`)
    .eq('clinic_id', clinicId)
    .eq('status', 'needs_payment')
    .order('scheduled_at', { ascending: false })

  const today = new Date()
  const startOfDay = new Date(today)
  startOfDay.setUTCHours(0, 0, 0, 0)
  const endOfDay = new Date(today)
  endOfDay.setUTCHours(23, 59, 59, 999)

  const { data: todayCompleted } = await supabase
    .from('appointments')
    .select(`*, patients ( full_name ), clinic_services ( name, price )`)
    .eq('clinic_id', clinicId)
    .eq('status', 'completed')
    .gte('scheduled_at', startOfDay.toISOString())
    .lte('scheduled_at', endOfDay.toISOString())

  const todayRevenue = todayCompleted?.reduce((sum, a) => sum + (a.clinic_services?.price || 0), 0) || 0

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title={isAr ? 'الدفعات' : 'Payments'}
        description={isAr ? 'تأكيد مدفوعات المرضى' : 'Confirm patient payments'}
        icon={CreditCard}
        iconColor="text-amber-400"
        iconBg="rgba(245,158,11,0.12)"
        badge={isAr ? `${pendingPayments?.length ?? 0} بانتظار التأكيد` : `${pendingPayments?.length ?? 0} pending`}
      />

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-2xl p-4 flex items-center gap-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-center justify-center w-10 h-10 rounded-xl" style={{ background: 'rgba(245,158,11,0.12)' }}>
            <Clock className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <p className="text-[11px] text-slate-500 font-medium">{isAr ? 'بانتظار الدفع' : 'Pending'}</p>
            <p className="text-sm font-bold text-slate-200">{pendingPayments?.length ?? 0}</p>
          </div>
        </div>
        <div className="rounded-2xl p-4 flex items-center gap-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-center justify-center w-10 h-10 rounded-xl" style={{ background: 'rgba(34,197,94,0.12)' }}>
            <CheckCircle className="w-5 h-5 text-green-400" />
          </div>
          <div>
            <p className="text-[11px] text-slate-500 font-medium">{isAr ? 'مكتملة اليوم' : 'Completed Today'}</p>
            <p className="text-sm font-bold text-slate-200">{todayCompleted?.length ?? 0}</p>
          </div>
        </div>
        <div className="rounded-2xl p-4 flex items-center gap-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-center justify-center w-10 h-10 rounded-xl" style={{ background: 'rgba(34,211,238,0.12)' }}>
            <CreditCard className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <p className="text-[11px] text-slate-500 font-medium">{isAr ? 'إيرادات اليوم' : "Today's Revenue"}</p>
            <p className="text-sm font-bold text-teal-400">{todayRevenue.toLocaleString()} EGP</p>
          </div>
        </div>
      </div>

      {/* Pending Payments List */}
      <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
        <h3 className="text-sm font-semibold text-slate-200 mb-4 flex items-center gap-2">
          <Clock className="w-4 h-4 text-amber-400" />
          {isAr ? 'مدفوعات بانتظار التأكيد' : 'Pending Payment Confirmations'}
        </h3>
        {!pendingPayments?.length ? (
          <div className="text-center py-8">
            <CheckCircle className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p className="text-sm text-slate-500">{isAr ? 'لا توجد مدفوعات بانتظار التأكيد' : 'No pending payments'}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {pendingPayments.map(app => (
              <PaymentConfirmCard
                key={app.id}
                appointment={app}
                clinicId={clinicId}
                locale={locale}
                isAr={isAr}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
