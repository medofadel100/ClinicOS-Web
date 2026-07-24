import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PageHeader, PremiumTableWrapper, EmptyState, StatusBadge } from '@/components/layout/PageComponents'
import { Package, AlertTriangle } from 'lucide-react'
import CreateItemDialog from './CreateItemDialog'
import TransactionDialog from './TransactionDialog'
import { requireClinicId } from "@/lib/utils/clinic";

export default async function InventoryPage({
      params: { locale, clinicSlug }
    }: {
              params: { locale: string; clinicSlug: string }
            }) {
    const clinicId = await requireClinicId(clinicSlug);
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/${locale}/login`)

  const { data: items } = await supabase
    .from('medical_inventory_items')
    .select('*')
    .eq('clinic_id', clinicId)
    .order('name', { ascending: true })

  const inventoryItems = items || []
  const isAr = locale === 'ar'
  const lowStockCount = inventoryItems.filter(
    item => Number(item.quantity_on_hand) <= Number(item.min_threshold)
  ).length

  const expiryAlerts = inventoryItems.filter(item => {
    if (!item.expires_at) return false
    const days = Math.ceil((new Date(item.expires_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    return days <= 30
  }).sort((a, b) => new Date(a.expires_at!).getTime() - new Date(b.expires_at!).getTime())

  const expiredCount = expiryAlerts.filter(item => new Date(item.expires_at!) <= new Date()).length
  const criticalCount = expiryAlerts.filter(item => {
    const days = Math.ceil((new Date(item.expires_at!).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    return days > 0 && days <= 7
  }).length

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title={isAr ? 'المخزون' : 'Inventory'}
        description={isAr ? 'إدارة المستلزمات الطبية ومستويات المخزون.' : 'Manage medical supplies and stock levels.'}
        icon={Package}
        iconColor="text-amber-400"
        iconBg="rgba(245,158,11,0.12)"
        badge={
          expiryAlerts.length > 0
            ? `${expiryAlerts.length} ${isAr ? 'تنبيه انتهاء' : 'expiry alerts'}`
            : lowStockCount > 0
              ? `${lowStockCount} ${isAr ? 'مخزون منخفض' : 'low stock'}`
              : `${inventoryItems.length} ${isAr ? 'أصناف' : 'items'}`
        }
        actions={<CreateItemDialog clinicId={clinicId} locale={locale} />}
      />

      {/* Low stock warning */}
      {lowStockCount > 0 && (
        <div
          className="flex items-center gap-3 px-4 py-3.5 rounded-2xl animate-slide-in-up"
          style={{
            background: 'rgba(245,158,11,0.08)',
            border: '1px solid rgba(245,158,11,0.2)',
          }}
        >
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
          <p className="text-sm text-amber-300">
            <span className="font-semibold">{lowStockCount} {isAr ? 'صنف' : 'item'}{!isAr && lowStockCount > 1 ? 's' : ''}</span>
            {' '}{isAr ? 'أقل من الحد الأدنى للمخزون. يُنصح بإعادة التعبئة قريباً.' : 'below minimum stock threshold. Consider restocking soon.'}
          </p>
        </div>
      )}

      {/* Expiry alerts */}
      {expiryAlerts.length > 0 && (
        <div
          className="flex items-center gap-3 px-4 py-3.5 rounded-2xl animate-slide-in-up"
          style={{
            background: expiredCount > 0 ? 'rgba(239,68,68,0.08)' : 'rgba(245,158,11,0.08)',
            border: `1px solid ${expiredCount > 0 ? 'rgba(239,68,68,0.2)' : 'rgba(245,158,11,0.2)'}`,
          }}
        >
          <AlertTriangle className={`w-4 h-4 shrink-0 ${expiredCount > 0 ? 'text-red-400' : 'text-amber-400'}`} />
          <p className={`text-sm ${expiredCount > 0 ? 'text-red-300' : 'text-amber-300'}`}>
            {expiredCount > 0 && (
              <>
                <span className="font-semibold">{expiredCount} {isAr ? 'صنف منتهي' : 'expired item'}{!isAr && expiredCount > 1 ? 's' : ''}</span>
                {' — '}
              </>
            )}
            {criticalCount > 0 && (
              <>
                <span className="font-semibold">{criticalCount} {isAr ? 'ينتهي خلال أسبوع' : 'expiring within 7 days'}</span>
                {' — '}
              </>
            )}
            <span className="font-semibold">{expiryAlerts.length} {isAr ? 'إجمالي أصناف قريبة الانتهاء' : 'total items expiring within 30 days'}</span>
          </p>
        </div>
      )}

      <PremiumTableWrapper>
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              {(isAr ? ['اسم الصنف', 'الفئة', 'الكمية', 'الوحدة', 'الانتهاء', 'الحالة', 'الإجراءات'] : ['Item Name', 'Category', 'Qty on Hand', 'Unit', 'Expires', 'Status', 'Actions']).map((h, i) => (
                <th
                  key={h}
                  className={`px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500 ${i === 6 ? 'text-right' : ''}`}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {!inventoryItems.length ? (
              <tr>
                <td colSpan={7}>
                  <EmptyState
                    icon={Package}
                    title={isAr ? 'لا توجد أصناف في المخزون.' : 'No inventory items found.'}
                    description={isAr ? 'أضف صنفك الأول لتتبع المخزون.' : 'Add your first item to start tracking stock.'}
                  />
                </td>
              </tr>
            ) : inventoryItems.map((item, i) => {
              const isLowStock = Number(item.quantity_on_hand) <= Number(item.min_threshold)
              const expiryDate = item.expires_at ? new Date(item.expires_at) : null
              const daysUntilExpiry = expiryDate ? Math.ceil((expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : null
              const isExpired = daysUntilExpiry !== null && daysUntilExpiry <= 0
              const isCritical = daysUntilExpiry !== null && daysUntilExpiry > 0 && daysUntilExpiry <= 7
              const isWarning = daysUntilExpiry !== null && daysUntilExpiry > 7 && daysUntilExpiry <= 30
              return (
                <tr
                  key={item.id}
                  className="hover:bg-white/[0.02] transition-colors"
                  style={{ borderBottom: i < inventoryItems.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}
                >
                  <td className="px-5 py-4 text-sm font-semibold text-slate-200">{item.name}</td>
                  <td className="px-5 py-4 text-sm text-slate-400 capitalize">{item.category || '—'}</td>
                  <td className="px-5 py-4">
                    <span
                      className="text-lg font-bold"
                      style={{ color: isLowStock ? '#fbbf24' : '#e2e8f0' }}
                    >
                      {item.quantity_on_hand}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-sm text-slate-500">{item.unit}</td>
                  <td className="px-5 py-4">
                    {expiryDate ? (
                      <span className={`text-sm font-medium ${isExpired ? 'text-red-400' : isCritical ? 'text-red-300' : isWarning ? 'text-amber-400' : 'text-slate-400'}`}>
                        {expiryDate.toLocaleDateString(isAr ? 'ar-EG' : 'en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                        {isExpired && (
                          <span className="ml-1.5 text-[10px] font-bold uppercase tracking-wider text-red-400">
                            {isAr ? 'منتهي' : 'EXPIRED'}
                          </span>
                        )}
                        {isCritical && (
                          <span className="ml-1.5 text-[10px] font-bold uppercase tracking-wider text-red-300">
                            {isAr ? `${daysUntilExpiry} ي` : `${daysUntilExpiry}d`}
                          </span>
                        )}
                        {isWarning && (
                          <span className="ml-1.5 text-[10px] font-bold uppercase tracking-wider text-amber-400">
                            {isAr ? `${daysUntilExpiry} ي` : `${daysUntilExpiry}d`}
                          </span>
                        )}
                      </span>
                    ) : (
                      <span className="text-slate-600">—</span>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    {isLowStock ? (
                      <span
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
                        style={{ background: 'rgba(245,158,11,0.12)', color: '#fbbf24', border: '1px solid rgba(245,158,11,0.25)' }}
                      >
                        <AlertTriangle className="w-3 h-3" />
                        {isAr ? 'منخفض' : 'Low'} (≤{item.min_threshold})
                      </span>
                    ) : (
                      <StatusBadge status="active" label={isAr ? 'المخزون' : 'In Stock'} />
                    )}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <TransactionDialog
                      clinicId={clinicId}
                      locale={locale}
                      itemId={item.id}
                      itemName={item.name}
                    />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </PremiumTableWrapper>
    </div>
  )
}
