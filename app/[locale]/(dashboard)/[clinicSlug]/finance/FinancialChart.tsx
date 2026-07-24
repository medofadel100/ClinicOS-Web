'use client'

import { PremiumCard } from '@/components/layout/PageComponents'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts'

export interface ChartDataPoint {
  month: string
  revenue: number
  expenses: number
}

export default function FinancialChart({ data }: { data: ChartDataPoint[] }) {
  if (!data || data.length === 0) {
    return (
      <PremiumCard>
        <div className="h-[300px] flex items-center justify-center text-slate-500 text-sm">
          No financial data available for the chart yet.
        </div>
      </PremiumCard>
    )
  }

  return (
    <PremiumCard>
      <h3 className="text-base font-semibold text-slate-200 mb-6">Revenue vs Expenses (Last 6 Months)</h3>
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis 
              dataKey="month" 
              stroke="#64748b" 
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              stroke="#64748b" 
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${value}`}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'rgba(15,23,42,0.9)', 
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px',
                color: '#f1f5f9'
              }}
              itemStyle={{ color: '#e2e8f0' }}
              formatter={(value: any) => [`${Number(value || 0).toFixed(2)} EGP`, '']}
            />
            <Legend wrapperStyle={{ paddingTop: '20px', fontSize: '13px' }} />
            <Bar dataKey="revenue" name="Revenue" fill="rgba(34,197,94,0.8)" radius={[4, 4, 0, 0]} barSize={32} />
            <Bar dataKey="expenses" name="Expenses" fill="rgba(239,68,68,0.8)" radius={[4, 4, 0, 0]} barSize={32} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </PremiumCard>
  )
}
