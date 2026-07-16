import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PageHeader, PremiumTableWrapper, EmptyState, StatusBadge } from '@/components/layout/PageComponents'
import { Package, AlertTriangle } from 'lucide-react'
import CreateItemDialog from './CreateItemDialog'
import TransactionDialog from './TransactionDialog'

export default async function InventoryPage({
  params: { locale, clinicId }
}: {
  params: { locale: string; clinicId: string }
}) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/${locale}/login`)

  const { data: items } = await supabase
    .from('medical_inventory_items')
    .select('*')
    .eq('clinic_id', clinicId)
    .order('name', { ascending: true })

  const inventoryItems = items || []
  const lowStockCount = inventoryItems.filter(
    item => Number(item.quantity_on_hand) <= Number(item.min_threshold)
  ).length

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Inventory"
        description="Manage your clinic's medical supplies and stock levels."
        icon={Package}
        iconColor="text-amber-400"
        iconBg="rgba(245,158,11,0.12)"
        badge={lowStockCount > 0 ? `${lowStockCount} low stock` : `${inventoryItems.length} items`}
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
            <span className="font-semibold">{lowStockCount} item{lowStockCount > 1 ? 's' : ''}</span>
            {' '}below minimum stock threshold. Consider restocking soon.
          </p>
        </div>
      )}

      <PremiumTableWrapper>
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              {['Item Name', 'Category', 'Qty on Hand', 'Unit', 'Status', 'Actions'].map((h, i) => (
                <th
                  key={h}
                  className={`px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500 ${i === 5 ? 'text-right' : ''}`}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {!inventoryItems.length ? (
              <tr>
                <td colSpan={6}>
                  <EmptyState
                    icon={Package}
                    title="No inventory items found"
                    description="Add your first item to start tracking stock"
                  />
                </td>
              </tr>
            ) : inventoryItems.map((item, i) => {
              const isLowStock = Number(item.quantity_on_hand) <= Number(item.min_threshold)
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
                    {isLowStock ? (
                      <span
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
                        style={{ background: 'rgba(245,158,11,0.12)', color: '#fbbf24', border: '1px solid rgba(245,158,11,0.25)' }}
                      >
                        <AlertTriangle className="w-3 h-3" />
                        Low (≤{item.min_threshold})
                      </span>
                    ) : (
                      <StatusBadge status="active" label="In Stock" />
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
