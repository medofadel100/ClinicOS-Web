'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import {
  LayoutDashboard,
  Calendar,
  Users,
  Package,
  UserCircle,
  Megaphone,
  CircleDollarSign,
  BarChart3,
  MessageCircle,
  Settings,
  Building2,
  ActivitySquare,
  ChevronRight,
  Stethoscope,
  LogOut,
  Sparkles,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface SidebarProps {
  locale: string
  clinicId: string
  role: string
  specialty?: string
}

export function Sidebar({ locale, clinicId, role, specialty }: SidebarProps) {
  const pathname = usePathname()
  const t = useTranslations('Sidebar')
  const [collapsed, setCollapsed] = useState(false)

  const routes = [
    {
      label: t('dashboard'),
      icon: LayoutDashboard,
      href: `/${locale}/${clinicId}`,
      exact: true,
      color: 'text-teal-400',
      glowColor: 'rgba(0,212,170,0.3)',
    },
    {
      label: t('appointments'),
      icon: Calendar,
      href: `/${locale}/${clinicId}/appointments`,
      color: 'text-blue-400',
      glowColor: 'rgba(59,130,246,0.3)',
    },
    {
      label: t('patients'),
      icon: Users,
      href: `/${locale}/${clinicId}/patients`,
      color: 'text-violet-400',
      glowColor: 'rgba(124,58,237,0.3)',
    },
    {
      label: t('inventory'),
      icon: Package,
      href: `/${locale}/${clinicId}/inventory`,
      color: 'text-amber-400',
      glowColor: 'rgba(245,158,11,0.3)',
    },
    {
      label: t('myHr'),
      icon: UserCircle,
      href: `/${locale}/${clinicId}/hr`,
      color: 'text-pink-400',
      glowColor: 'rgba(244,63,94,0.3)',
    },
  ]

  if (specialty === 'dental') {
    routes.push({
      label: t('dentalChart'),
      icon: ActivitySquare,
      href: `/${locale}/${clinicId}/dental-chart`,
      color: 'text-cyan-400',
      glowColor: 'rgba(34,211,238,0.3)',
    })
  }

  if (role === 'owner' || role === 'admin') {
    routes.push(
      {
        label: t('marketing'),
        icon: Megaphone,
        href: `/${locale}/${clinicId}/marketing`,
        color: 'text-orange-400',
        glowColor: 'rgba(251,146,60,0.3)',
      },
      {
        label: t('finance'),
        icon: CircleDollarSign,
        href: `/${locale}/${clinicId}/finance`,
        color: 'text-green-400',
        glowColor: 'rgba(34,197,94,0.3)',
      },
      {
        label: t('reports'),
        icon: BarChart3,
        href: `/${locale}/${clinicId}/reports`,
        color: 'text-indigo-400',
        glowColor: 'rgba(99,102,241,0.3)',
      }
    )
  }

  if (role === 'owner') {
    routes.push(
      {
        label: t('whatsappBot'),
        icon: MessageCircle,
        href: `/${locale}/${clinicId}/whatsapp`,
        color: 'text-emerald-400',
        glowColor: 'rgba(52,211,153,0.3)',
      },
      {
        label: t('settings'),
        icon: Settings,
        href: `/${locale}/${clinicId}/settings`,
        color: 'text-slate-400',
        glowColor: 'rgba(148,163,184,0.3)',
      }
    )
  }

  const roleInitial = role.charAt(0).toUpperCase()
  const roleLabel = role.charAt(0).toUpperCase() + role.slice(1)

  return (
    <aside
      className={cn(
        'relative hidden md:flex flex-col shrink-0 h-screen transition-all duration-300 ease-out',
        'border-r border-white/[0.06]',
        collapsed ? 'w-[72px]' : 'w-[260px]'
      )}
      style={{
        background: 'linear-gradient(180deg, hsl(222 47% 7%) 0%, hsl(222 47% 5%) 100%)',
      }}
    >
      {/* Background orb decoration */}
      <div
        className="absolute top-0 left-0 w-full h-72 pointer-events-none overflow-hidden rounded-none opacity-40"
        aria-hidden="true"
      >
        <div
          className="absolute -top-16 -left-16 w-48 h-48 rounded-full blur-3xl"
          style={{ background: 'rgba(0,212,170,0.12)' }}
        />
        <div
          className="absolute top-32 -right-8 w-32 h-32 rounded-full blur-2xl"
          style={{ background: 'rgba(124,58,237,0.1)' }}
        />
      </div>

      {/* ── Brand Logo ── */}
      <div className={cn(
        'relative z-10 flex items-center h-16 shrink-0 px-4 border-b border-white/[0.06]',
        collapsed ? 'justify-center' : 'justify-between'
      )}>
        <Link href={`/${locale}/${clinicId}`} className="flex items-center gap-3 min-w-0">
          <div
            className="flex items-center justify-center w-9 h-9 rounded-xl shrink-0 transition-all duration-300"
            style={{
              background: 'linear-gradient(135deg, hsl(168 100% 42%) 0%, hsl(195 100% 50%) 100%)',
              boxShadow: '0 0 16px rgba(0,212,170,0.4)',
            }}
          >
            <Stethoscope className="w-5 h-5 text-[#0a0f1e]" strokeWidth={2.5} />
          </div>
          {!collapsed && (
            <span
              className="text-lg font-bold tracking-tight animate-fade-in whitespace-nowrap"
              style={{
                background: 'linear-gradient(135deg, hsl(168 100% 42%) 30%, hsl(195 100% 70%) 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              ClinicOS
            </span>
          )}
        </Link>

        {!collapsed && (
          <button
            onClick={() => setCollapsed(true)}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-white/[0.06] transition-all duration-200"
            aria-label="Collapse sidebar"
          >
            <ChevronRight className="w-4 h-4 rotate-180" />
          </button>
        )}
      </div>

      {/* Expand button when collapsed */}
      {collapsed && (
        <button
          onClick={() => setCollapsed(false)}
          className="absolute -right-3 top-[72px] z-50 flex items-center justify-center w-6 h-6 rounded-full border border-white/[0.1] text-slate-400 hover:text-teal-400 transition-colors"
          style={{ background: 'hsl(222 47% 9%)' }}
          aria-label="Expand sidebar"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      )}

      {/* ── Navigation ── */}
      <div className="relative z-10 flex-1 overflow-y-auto overflow-x-hidden py-4 px-3">
        {!collapsed && (
          <div className="mb-3 px-2">
            <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">
              Navigation
            </span>
          </div>
        )}

        <nav className="space-y-0.5">
          {routes.map((route, index) => {
            const isActive = route.exact
              ? pathname === route.href
              : pathname.startsWith(route.href)

            return (
              <Link
                key={route.href}
                href={route.href}
                title={collapsed ? route.label : undefined}
                className={cn(
                  'group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium',
                  'transition-all duration-200 ease-out',
                  'animate-slide-in-left',
                  collapsed ? 'justify-center' : '',
                  isActive
                    ? 'text-white'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.05]'
                )}
                style={{
                  animationDelay: `${index * 40}ms`,
                  animationFillMode: 'both',
                  ...(isActive
                    ? {
                        background: 'linear-gradient(135deg, rgba(0,212,170,0.18) 0%, rgba(0,212,170,0.06) 100%)',
                        boxShadow: `inset 0 0 0 1px rgba(0,212,170,0.2), 0 2px 8px rgba(0,212,170,0.1)`,
                      }
                    : {}),
                }}
              >
                {/* Active left border indicator */}
                {isActive && (
                  <span
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full"
                    style={{
                      background: 'linear-gradient(180deg, hsl(168 100% 42%), hsl(195 100% 50%))',
                      boxShadow: '0 0 8px rgba(0,212,170,0.6)',
                    }}
                  />
                )}

                {/* Icon */}
                <span
                  className={cn(
                    'flex items-center justify-center w-8 h-8 rounded-lg shrink-0 transition-all duration-200',
                    isActive ? 'text-teal-400' : route.color,
                  )}
                  style={{
                    ...(isActive
                      ? { filter: 'drop-shadow(0 0 6px rgba(0,212,170,0.5))' }
                      : {}),
                  }}
                >
                  <route.icon className="w-4.5 h-4.5" style={{ width: '18px', height: '18px' }} />
                </span>

                {/* Label */}
                {!collapsed && (
                  <span className="truncate font-[500] text-[13.5px] leading-none">
                    {route.label}
                  </span>
                )}

                {/* Tooltip when collapsed */}
                {collapsed && (
                  <div
                    className="absolute left-full ml-3 px-2.5 py-1.5 rounded-lg text-xs font-medium text-white whitespace-nowrap pointer-events-none z-50
                    opacity-0 group-hover:opacity-100 translate-x-[-4px] group-hover:translate-x-0 transition-all duration-200"
                    style={{
                      background: 'hsl(222 47% 12%)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
                    }}
                  >
                    {route.label}
                  </div>
                )}
              </Link>
            )
          })}
        </nav>
      </div>

      {/* ── User Profile Footer ── */}
      <div
        className="relative z-10 shrink-0 p-3 border-t border-white/[0.06]"
        style={{ background: 'rgba(0,0,0,0.2)' }}
      >
        {/* Clinic switcher */}
        <Link
          href={`/${locale}/clinic-switcher`}
          title={collapsed ? 'Switch Clinic' : undefined}
          className={cn(
            'group flex items-center gap-3 px-3 py-2.5 rounded-xl mb-2',
            'text-slate-400 hover:text-teal-400',
            'border border-white/[0.06] hover:border-teal-500/30',
            'transition-all duration-200 hover:bg-teal-500/[0.06]',
            collapsed ? 'justify-center' : ''
          )}
        >
          <Building2 className="w-4 h-4 shrink-0 transition-colors" />
          {!collapsed && (
            <span className="text-[13px] font-medium truncate">
              {t('switchClinic')}
            </span>
          )}
          {collapsed && (
            <div
              className="absolute left-full ml-3 px-2.5 py-1.5 rounded-lg text-xs font-medium text-white whitespace-nowrap pointer-events-none z-50
              opacity-0 group-hover:opacity-100 translate-x-[-4px] group-hover:translate-x-0 transition-all duration-200"
              style={{
                background: 'hsl(222 47% 12%)',
                border: '1px solid rgba(255,255,255,0.08)',
                boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
              }}
            >
              {t('switchClinic')}
            </div>
          )}
        </Link>

        {/* User info */}
        <div className={cn(
          'flex items-center gap-3 px-3 py-2 rounded-xl',
          'bg-white/[0.03] border border-white/[0.05]',
          collapsed ? 'justify-center' : ''
        )}>
          {/* Avatar */}
          <div
            className="relative flex items-center justify-center w-8 h-8 rounded-full shrink-0 text-sm font-bold text-[#0a0f1e]"
            style={{
              background: 'linear-gradient(135deg, hsl(168 100% 42%) 0%, hsl(195 100% 50%) 100%)',
              boxShadow: '0 0 10px rgba(0,212,170,0.3)',
            }}
          >
            {roleInitial}
            <span
              className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 bg-green-400"
              style={{ borderColor: 'hsl(222 47% 7%)' }}
            />
          </div>

          {!collapsed && (
            <div className="min-w-0 flex-1">
              <div className="text-[13px] font-semibold text-slate-200 capitalize truncate">
                {roleLabel}
              </div>
              <div className="text-[11px] text-slate-500 truncate">
                {t('accessLevel')}
              </div>
            </div>
          )}

          {!collapsed && (
            <Sparkles className="w-3.5 h-3.5 text-teal-500/60 shrink-0" />
          )}
        </div>
      </div>
    </aside>
  )
}
