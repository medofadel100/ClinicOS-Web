import React from 'react'
import { LucideIcon } from 'lucide-react'

interface PageHeaderProps {
  title: string
  description?: string
  icon?: LucideIcon
  iconColor?: string
  iconBg?: string
  actions?: React.ReactNode
  badge?: string
  badgeColor?: string
}

export function PageHeader({
  title,
  description,
  icon: Icon,
  iconColor = 'text-teal-400',
  iconBg = 'rgba(0,212,170,0.12)',
  actions,
  badge,
  badgeColor = 'rgba(0,212,170,0.15)',
}: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
      <div className="flex items-start gap-4">
        {Icon && (
          <div
            className="flex items-center justify-center w-11 h-11 rounded-2xl shrink-0 mt-0.5"
            style={{
              background: iconBg,
              border: `1px solid ${iconBg.replace('0.12', '0.25')}`,
            }}
          >
            <Icon className={`w-5 h-5 ${iconColor}`} />
          </div>
        )}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1
              className="text-2xl sm:text-3xl font-bold tracking-tight"
              style={{
                background: 'linear-gradient(135deg, #e2e8f0 30%, #94a3b8 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              {title}
            </h1>
            {badge && (
              <span
                className="text-xs font-semibold px-2.5 py-1 rounded-full"
                style={{
                  background: badgeColor,
                  border: `1px solid ${badgeColor.replace('0.15', '0.3')}`,
                  color: '#e2e8f0',
                }}
              >
                {badge}
              </span>
            )}
          </div>
          {description && (
            <p className="text-sm text-slate-500">{description}</p>
          )}
        </div>
      </div>

      {actions && (
        <div className="flex items-center gap-2 shrink-0">
          {actions}
        </div>
      )}
    </div>
  )
}

/* ── Reusable Premium Card ── */
interface PremiumCardProps {
  children: React.ReactNode
  className?: string
  glowColor?: string
  style?: React.CSSProperties
}

export function PremiumCard({ children, className = '', glowColor, style }: PremiumCardProps) {
  return (
    <div
      className={`rounded-2xl p-6 ${className}`}
      style={{
        background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
        border: glowColor
          ? `1px solid ${glowColor.replace(/[\d.]+\)$/, '0.15)').replace('rgba', 'rgba')}`
          : '1px solid rgba(255,255,255,0.07)',
        ...style,
      }}
    >
      {children}
    </div>
  )
}

/* ── Premium Table Wrapper ── */
export function PremiumTableWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        border: '1px solid rgba(255,255,255,0.07)',
        background: 'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)',
      }}
    >
      {children}
    </div>
  )
}

/* ── Empty State ── */
interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description?: string
}

export function EmptyState({ icon: Icon, title, description }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div
        className="flex items-center justify-center w-14 h-14 rounded-2xl mb-4"
        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
      >
        <Icon className="w-7 h-7 text-slate-600" />
      </div>
      <p className="text-sm font-semibold text-slate-500">{title}</p>
      {description && <p className="text-xs text-slate-700 mt-1">{description}</p>}
    </div>
  )
}

/* ── Status Badge ── */
interface StatusBadgeProps {
  status: 'active' | 'inactive' | 'pending' | 'paid' | 'cancelled' | 'scheduled' | string
  label?: string
}

const statusMap: Record<string, { bg: string; text: string; border: string }> = {
  active:    { bg: 'rgba(34,197,94,0.12)', text: '#4ade80', border: 'rgba(34,197,94,0.2)' },
  paid:      { bg: 'rgba(34,197,94,0.12)', text: '#4ade80', border: 'rgba(34,197,94,0.2)' },
  scheduled: { bg: 'rgba(59,130,246,0.12)', text: '#60a5fa', border: 'rgba(59,130,246,0.2)' },
  pending:   { bg: 'rgba(245,158,11,0.12)', text: '#fbbf24', border: 'rgba(245,158,11,0.2)' },
  inactive:  { bg: 'rgba(148,163,184,0.1)', text: '#94a3b8', border: 'rgba(148,163,184,0.15)' },
  cancelled: { bg: 'rgba(239,68,68,0.12)', text: '#f87171', border: 'rgba(239,68,68,0.2)' },
  ended:     { bg: 'rgba(148,163,184,0.1)', text: '#94a3b8', border: 'rgba(148,163,184,0.15)' },
}

export function StatusBadge({ status, label }: StatusBadgeProps) {
  const styles = statusMap[status.toLowerCase()] || statusMap.inactive
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold capitalize"
      style={{ background: styles.bg, color: styles.text, border: `1px solid ${styles.border}` }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full"
        style={{ background: styles.text }}
      />
      {label || status}
    </span>
  )
}
