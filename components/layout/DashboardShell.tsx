'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { Menu, X } from 'lucide-react'
import { Sidebar } from './Sidebar'
import InstallPWA from './InstallPWA'

interface DashboardShellProps {
  children: React.ReactNode
  locale: string
  clinicSlug: string
  role: string
  specialty?: string
  clinicName: string
  userInitials: string
  roleLabel: string
  userEmail: string
  headerActions: React.ReactNode
}

export function DashboardShell({
  children,
  locale,
  clinicSlug,
  role,
  specialty,
  clinicName,
  userInitials: _userInitials,
  roleLabel: _roleLabel,
  userEmail: _userEmail,
  headerActions,
}: DashboardShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  return (
    <>
      {/* Mobile hamburger button */}
      <button
        className="fixed top-4 left-4 z-50 md:hidden flex items-center justify-center w-10 h-10 rounded-xl text-slate-400 hover:text-white transition-all duration-200"
        style={{
          background: 'rgba(10, 15, 30, 0.9)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255,255,255,0.08)',
        }}
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
      >
        {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden transition-opacity duration-300"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile sidebar overlay */}
      <div
        className={`fixed inset-y-0 left-0 z-50 md:hidden transition-transform duration-300 ease-out ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <Sidebar
          locale={locale}
          clinicId={clinicSlug}
          role={role}
          specialty={specialty}
          mobile
          onMobileClose={() => setMobileOpen(false)}
        />
      </div>

      {/* Desktop sidebar */}
      <div className="hidden md:block">
        <Sidebar
          locale={locale}
          clinicId={clinicSlug}
          role={role}
          specialty={specialty}
        />
      </div>

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Header */}
        <header
          className="relative z-30 h-16 flex items-center justify-between px-4 md:px-6 shrink-0 min-w-0"
          style={{
            background: 'rgba(10, 15, 30, 0.85)',
            backdropFilter: 'blur(20px) saturate(180%)',
            WebkitBackdropFilter: 'blur(20px) saturate(180%)',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
            boxShadow: '0 1px 0 rgba(0,0,0,0.4)',
          }}
        >
          <div className="flex items-center gap-4">
            {/* Spacer for mobile hamburger (button is fixed positioned) */}
            <div className="w-10 md:hidden" />

            <div className="hidden md:flex items-center gap-2">
              <div
                className="flex items-center justify-center w-7 h-7 rounded-lg text-[10px] font-bold"
                style={{
                  background: 'linear-gradient(135deg, rgba(0,212,170,0.2) 0%, rgba(0,212,170,0.06) 100%)',
                  border: '1px solid rgba(0,212,170,0.2)',
                  color: 'hsl(168 100% 52%)',
                }}
              >
                {clinicName.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm font-semibold text-slate-200 tracking-tight">
                {clinicName}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <InstallPWA />
            {headerActions}
          </div>
        </header>

        {/* Main Content */}
        <main
          className="flex-1 overflow-auto relative"
          style={{
            background: 'linear-gradient(135deg, hsl(222 47% 5%) 0%, hsl(222 47% 4%) 100%)',
          }}
        >
          <div
            className="pointer-events-none absolute top-0 right-0 w-[600px] h-[600px] rounded-full blur-[120px] opacity-[0.04]"
            aria-hidden="true"
            style={{ background: 'hsl(168 100% 42%)' }}
          />
          <div
            className="pointer-events-none absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full blur-[100px] opacity-[0.03]"
            aria-hidden="true"
            style={{ background: 'hsl(258 60% 55%)' }}
          />

          <div className="relative z-10 p-6 md:p-8 max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </>
  )
}
