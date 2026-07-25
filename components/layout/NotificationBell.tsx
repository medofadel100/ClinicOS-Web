'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Bell } from 'lucide-react'

type NotificationItem = {
  id: string
  title: string
  body: string
  notification_type: string
  link_url: string | null
  created_at: string
  read_at: string | null
}

interface NotificationBellProps {
  locale: string
}

export default function NotificationBell({ locale }: NotificationBellProps) {
  const isAr = locale === 'ar'
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [loading, setLoading] = useState(false)
  const [isPlatformAdmin, setIsPlatformAdmin] = useState(false)
  const unreadCount = notifications.filter(n => !n.read_at).length

  const fetchNotifications = useCallback(async () => {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: admin, error: adminError } = await supabase
        .from('platform_admins')
        .select('id')
        .eq('auth_user_id', user.id)
        .maybeSingle()

      if (adminError || !admin) {
        setIsPlatformAdmin(false)
        return
      }

      setIsPlatformAdmin(true)

      const { data: recipients } = await supabase
        .from('notification_recipients')
        .select('read_at, notifications ( id, title, body, notification_type, link_url, created_at )')
        .eq('admin_id', admin.id)
        .order('created_at', { foreignTable: 'notifications', ascending: false })
        .limit(20)

      if (!recipients) return

      const items: NotificationItem[] = recipients
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .map((r: any) => {
          const n = r.notifications
          if (!n) return null
          return {
            id: n.id,
            title: n.title,
            body: n.body,
            notification_type: n.notification_type,
            link_url: n.link_url,
            created_at: n.created_at,
            read_at: r.read_at,
          }
        })
        .filter(Boolean) as NotificationItem[]

      setNotifications(items)
    } catch {
      // Silently fail for non-admin users
      setIsPlatformAdmin(false)
    }
  }, [])

  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  const markAsRead = async (notifId: string) => {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: admin } = await supabase
        .from('platform_admins')
        .select('id')
        .eq('auth_user_id', user.id)
        .maybeSingle()

      if (!admin) return

      await supabase
        .from('notification_recipients')
        .update({ read_at: new Date().toISOString() })
        .eq('admin_id', admin.id)
        .eq('notification_id', notifId)
        .is('read_at', null)

      setNotifications(prev =>
        prev.map(n => n.id === notifId ? { ...n, read_at: new Date().toISOString() } : n)
      )
    } catch {
      // silently fail
    }
  }

  const markAllAsRead = async () => {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: admin } = await supabase
        .from('platform_admins')
        .select('id')
        .eq('auth_user_id', user.id)
        .maybeSingle()

      if (!admin) return

      await supabase
        .from('notification_recipients')
        .update({ read_at: new Date().toISOString() })
        .eq('admin_id', admin.id)
        .is('read_at', null)

      setNotifications(prev => prev.map(n => ({ ...n, read_at: new Date().toISOString() })))
    } catch {
      // silently fail
    }
  }

  const handleToggle = () => {
    if (!open) {
      setLoading(true)
      fetchNotifications().finally(() => setLoading(false))
    }
    setOpen(!open)
  }

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return isAr ? 'الآن' : 'Just now'
    if (mins < 60) return isAr ? `منذ ${mins} دقيقة` : `${mins}m ago`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return isAr ? `منذ ${hrs} ساعة` : `${hrs}h ago`
    const days = Math.floor(hrs / 24)
    return isAr ? `منذ ${days} يوم` : `${days}d ago`
  }

  const t = {
    notifications: isAr ? 'الإشعارات' : 'Notifications',
    markAllRead: isAr ? 'تعيين الكل كمقروء' : 'Mark all read',
    noNotifications: isAr ? 'لا توجد إشعارات' : 'No notifications',
    empty: isAr ? 'لا يمكنك قراءة أي إشعارات بعد.' : "You haven't received any notifications yet.",
  }

  if (!isPlatformAdmin && !loading) return null

  return (
    <div className="relative">
      <button
        className="relative flex items-center justify-center w-9 h-9 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-white/[0.06] transition-all duration-200"
        aria-label={t.notifications}
        onClick={handleToggle}
      >
        <Bell style={{ width: '18px', height: '18px' }} />
        {unreadCount > 0 && (
          <span
            className="absolute top-1 right-1 flex items-center justify-center min-w-[16px] h-4 px-1 rounded-full text-[10px] font-bold text-[#0a0f1e]"
            style={{
              background: 'hsl(168 100% 42%)',
              boxShadow: '0 0 6px rgba(0,212,170,0.6)',
            }}
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div
            className="absolute right-0 top-full mt-2 w-80 max-w-[calc(100vw-2rem)] max-h-96 rounded-2xl z-50 overflow-hidden animate-slide-in-up"
            style={{
              background: 'hsl(222 47% 9%)',
              border: '1px solid rgba(255,255,255,0.08)',
              boxShadow: '0 16px 48px rgba(0,0,0,0.5)',
            }}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
              <span className="text-sm font-semibold text-slate-200">{t.notifications}</span>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-[11px] text-teal-400 hover:text-teal-300 transition-colors"
                >
                  {t.markAllRead}
                </button>
              )}
            </div>

            <div className="overflow-y-auto max-h-80">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="w-5 h-5 border-2 border-teal-400 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : notifications.length === 0 ? (
                <div className="py-8 px-4 text-center">
                  <p className="text-sm font-medium text-slate-300">{t.noNotifications}</p>
                  <p className="text-xs text-slate-500 mt-1">{t.empty}</p>
                </div>
              ) : (
                <div className="p-1.5">
                  {notifications.map((notif) => (
                    <button
                      key={notif.id}
                      onClick={() => markAsRead(notif.id)}
                      className={`w-full text-left px-3 py-2.5 rounded-xl transition-all duration-200 ${
                        notif.read_at
                          ? 'hover:bg-white/[0.03]'
                          : 'bg-teal-500/[0.06] hover:bg-teal-500/[0.10]'
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        {!notif.read_at && (
                          <span className="mt-1.5 w-2 h-2 rounded-full shrink-0" style={{ background: 'hsl(168 100% 42%)' }} />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className={`text-[13px] font-medium leading-tight ${notif.read_at ? 'text-slate-400' : 'text-slate-200'}`}>
                            {notif.title}
                          </p>
                          <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">{notif.body}</p>
                          <p className="text-[10px] text-slate-600 mt-1">{timeAgo(notif.created_at)}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
