'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, ActivitySquare, Pill, FolderOpen, Calendar, Wallet } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function PatientTabs({ locale, clinicSlug, patientSlug }: { locale: string, clinicSlug: string, patientSlug: string }) {
  const pathname = usePathname()
  const isAr = locale === 'ar'
  
  const baseUrl = `/${locale}/${clinicSlug}/patients/${patientSlug}`

  const tabs = [
    {
      label: isAr ? 'نظرة عامة' : 'Overview',
      href: baseUrl,
      icon: LayoutDashboard,
      exact: true
    },
    {
      label: isAr ? 'العيادة' : 'Clinical',
      href: `${baseUrl}/clinical`,
      icon: ActivitySquare,
    },
    {
      label: isAr ? 'الروشتات' : 'Prescriptions',
      href: `${baseUrl}/prescriptions`,
      icon: Pill,
    },
    {
      label: isAr ? 'الملفات' : 'Files',
      href: `${baseUrl}/files`,
      icon: FolderOpen,
    },
    {
      label: isAr ? 'المواعيد' : 'Appointments',
      href: `${baseUrl}/appointments`,
      icon: Calendar,
    },
    {
      label: isAr ? 'الفواتير' : 'Billing',
      href: `${baseUrl}/billing`,
      icon: Wallet,
    }
  ]

  return (
    <div className="flex items-center gap-1 p-1 bg-white/[0.02] border border-white/5 rounded-2xl overflow-x-auto custom-scrollbar">
      {tabs.map(tab => {
        const isActive = tab.exact 
          ? pathname === tab.href 
          : pathname.startsWith(tab.href)

        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap",
              isActive 
                ? "bg-teal-500/10 text-teal-400 border border-teal-500/20" 
                : "text-slate-400 hover:text-white hover:bg-white/5 border border-transparent"
            )}
          >
            <tab.icon className={cn("w-4 h-4", isActive ? "text-teal-400" : "text-slate-500")} />
            {tab.label}
          </Link>
        )
      })}
    </div>
  )
}
