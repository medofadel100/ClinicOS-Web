'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { LogOut, Bell, ChevronDown, Globe } from 'lucide-react'
import { useState } from 'react'
import Link from 'next/link'

interface HeaderActionsProps {
  userEmail: string
  userInitials: string
  roleLabel: string
  locale: string
  clinicId: string
}

export function HeaderActions({
  userEmail,
  userInitials,
  roleLabel,
  locale,
  clinicId,
}: HeaderActionsProps) {
  const router = useRouter()
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)

  const handleLogout = async () => {
    setLoggingOut(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push(`/${locale}/login`)
    router.refresh()
  }

  const otherLocale = locale === 'ar' ? 'en' : 'ar'
  const otherLocaleLabel = locale === 'ar' ? 'EN' : 'عر'

  return (
    <div className="flex items-center gap-2">
      {/* Language Switcher */}
      <Link
        href={`/${otherLocale}/${clinicId}`}
        className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-white/[0.06] transition-all duration-200 text-sm font-medium"
        title={`Switch to ${otherLocale === 'ar' ? 'Arabic' : 'English'}`}
      >
        <Globe className="w-4 h-4" />
        <span className="text-xs font-bold">{otherLocaleLabel}</span>
      </Link>

      {/* Notification bell */}
      <button
        className="relative flex items-center justify-center w-9 h-9 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-white/[0.06] transition-all duration-200"
        aria-label="Notifications"
        onClick={() => {}}
      >
        <Bell style={{ width: '18px', height: '18px' }} />
        <span
          className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full"
          style={{
            background: 'hsl(168 100% 42%)',
            boxShadow: '0 0 6px rgba(0,212,170,0.6)',
          }}
        />
      </button>

      {/* Divider */}
      <div className="w-px h-6 bg-white/[0.08] mx-1" />

      {/* User dropdown */}
      <div className="relative">
        <button
          onClick={() => setUserMenuOpen(!userMenuOpen)}
          className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl transition-all duration-200 hover:bg-white/[0.06]"
          aria-label="User menu"
        >
          <div
            className="flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold text-[#0a0f1e] shrink-0"
            style={{
              background: 'linear-gradient(135deg, hsl(168 100% 42%) 0%, hsl(195 100% 50%) 100%)',
              boxShadow: '0 0 10px rgba(0,212,170,0.35)',
            }}
          >
            {userInitials}
          </div>
          <div className="hidden sm:flex flex-col items-start">
            <span className="text-[13px] font-semibold text-slate-200 leading-none">
              {roleLabel}
            </span>
            <span className="text-[11px] text-slate-500 leading-none mt-0.5 max-w-[120px] truncate">
              {userEmail}
            </span>
          </div>
          <ChevronDown
            className={`hidden sm:block w-3.5 h-3.5 text-slate-500 transition-transform duration-200 ${userMenuOpen ? 'rotate-180' : ''}`}
          />
        </button>

        {/* Dropdown */}
        {userMenuOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setUserMenuOpen(false)}
            />
            <div
              className="absolute right-0 top-full mt-2 w-52 rounded-2xl z-50 overflow-hidden animate-slide-in-up"
              style={{
                background: 'hsl(222 47% 9%)',
                border: '1px solid rgba(255,255,255,0.08)',
                boxShadow: '0 16px 48px rgba(0,0,0,0.5)',
              }}
            >
              {/* User info header */}
              <div
                className="px-4 py-3 border-b"
                style={{ borderColor: 'rgba(255,255,255,0.06)' }}
              >
                <div className="text-[13px] font-semibold text-slate-200 capitalize">{roleLabel}</div>
                <div className="text-[11px] text-slate-500 truncate">{userEmail}</div>
              </div>

              {/* Menu items */}
              <div className="p-1.5 space-y-0.5">
                <Link
                  href={`/${locale}/clinic-switcher`}
                  onClick={() => setUserMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2 rounded-xl text-[13px] text-slate-400 hover:text-slate-200 hover:bg-white/[0.06] transition-all duration-200"
                >
                  <span>Switch Clinic</span>
                </Link>

                <div
                  className="h-px mx-1 my-1"
                  style={{ background: 'rgba(255,255,255,0.06)' }}
                />

                <button
                  onClick={handleLogout}
                  disabled={loggingOut}
                  className="flex items-center gap-3 px-3 py-2 rounded-xl text-[13px] w-full transition-all duration-200 text-red-400 hover:text-red-300 hover:bg-red-500/[0.08] disabled:opacity-50"
                >
                  <LogOut className="w-4 h-4" />
                  <span>{loggingOut ? 'Signing out...' : 'Sign Out'}</span>
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
