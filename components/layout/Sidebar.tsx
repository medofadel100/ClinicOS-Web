'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import {
  LayoutDashboard,
  Calendar,
  Users,
  Package,
  UserCircle,
  Megaphone,
  CircleDollarSign,
  BarChart,
  MessageCircle,
  Settings,
  Building,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface SidebarProps {
  locale: string
  clinicId: string
  role: string
}

export function Sidebar({ locale, clinicId, role }: SidebarProps) {
  const pathname = usePathname()

  const routes = [
    {
      label: 'Dashboard',
      icon: LayoutDashboard,
      href: `/${locale}/${clinicId}`,
      exact: true
    },
    {
      label: 'Appointments',
      icon: Calendar,
      href: `/${locale}/${clinicId}/appointments`
    },
    {
      label: 'Patients',
      icon: Users,
      href: `/${locale}/${clinicId}/patients`
    },
    {
      label: 'Inventory',
      icon: Package,
      href: `/${locale}/${clinicId}/inventory`
    },
    {
      label: 'My HR',
      icon: UserCircle,
      href: `/${locale}/${clinicId}/hr`
    },
  ]

  if (role === 'owner' || role === 'admin') {
    routes.push(
      {
        label: 'Marketing',
        icon: Megaphone,
        href: `/${locale}/${clinicId}/marketing`
      },
      {
        label: 'Finance',
        icon: CircleDollarSign,
        href: `/${locale}/${clinicId}/finance`
      },
      {
        label: 'Reports',
        icon: BarChart,
        href: `/${locale}/${clinicId}/reports`
      }
    )
  }

  if (role === 'owner') {
    routes.push(
      {
        label: 'WhatsApp Bot',
        icon: MessageCircle,
        href: `/${locale}/${clinicId}/whatsapp`
      },
      {
        label: 'Settings',
        icon: Settings,
        href: `/${locale}/${clinicId}/settings`
      }
    )
  }

  return (
    <aside className="w-64 border-r bg-card h-full flex flex-col shadow-sm hidden md:flex shrink-0">
      <div className="p-6">
        <div className="font-bold text-2xl text-primary tracking-tight">ClinicOS</div>
      </div>
      
      <div className="px-4 py-2 flex-1 overflow-y-auto">
        <div className="text-xs uppercase text-muted-foreground font-semibold mb-4 tracking-wider">Navigation</div>
        <nav className="space-y-1">
          {routes.map((route) => {
            const isActive = route.exact 
              ? pathname === route.href
              : pathname.startsWith(route.href)

            return (
              <Link
                key={route.href}
                href={route.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  isActive 
                    ? "bg-primary text-primary-foreground shadow-sm" 
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <route.icon className="w-4 h-4" />
                {route.label}
              </Link>
            )
          })}
        </nav>
      </div>

      <div className="mt-auto border-t p-4 bg-muted/30">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
            {role.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="text-sm font-semibold capitalize text-foreground">{role}</div>
            <div className="text-xs text-muted-foreground">Access Level</div>
          </div>
        </div>
        <Link 
          href={`/${locale}/clinic-switcher`} 
          className="flex items-center justify-center gap-2 w-full px-3 py-2 text-sm font-medium border rounded-md hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
        >
          <Building className="w-4 h-4" />
          Switch Clinic
        </Link>
      </div>
    </aside>
  )
}
