'use client'

import { useState, useEffect } from 'react'
import { PremiumCard } from '@/components/layout/PageComponents'
import { Badge } from '@/components/ui/badge'
import { Loader2, QrCode, Smartphone, Wifi, WifiOff } from 'lucide-react'
import { initSession, getSessionStatus, disconnectSession } from '@/lib/whatsapp-client'
import { updateWhatsAppConfig } from './actions'

export default function ConnectionManager({
  clinicId,
  locale,
  initialIsConnected,
  initialPhone
}: {
  clinicId: string
  locale: string
  initialIsConnected: boolean
  initialPhone: string | null
}) {
  const [isConnected, setIsConnected] = useState(initialIsConnected)
  const [phone, setPhone] = useState(initialPhone)
  const [qrCode, setQrCode] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [polling, setPolling] = useState(false)

  // Polling for connection status when QR is showing
  useEffect(() => {
    if (!polling) return

    const interval = setInterval(async () => {
      try {
        const status = await getSessionStatus(clinicId)
        if (status.connected) {
          setPolling(false)
          setIsConnected(true)
          setPhone(status.user || null)
          setQrCode(null)
          
          // Update database
          await updateWhatsAppConfig(clinicId, locale, {
            is_connected: true,
            connected_phone_number: status.user || null
          })
        }
      } catch (err) {
        console.error('Polling error', err)
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [polling, clinicId, locale])

  const handleConnect = async () => {
    setLoading(true)
    try {
      const res = await initSession(clinicId)
      if (res.connected) {
        setIsConnected(true)
      } else if (res.qr) {
        setQrCode(res.qr)
        setPolling(true)
      }
    } catch (error) {
      console.error(error)
      alert('Failed to initialize connection to WhatsApp service.')
    } finally {
      setLoading(false)
    }
  }

  const handleDisconnect = async () => {
    setLoading(true)
    try {
      await disconnectSession(clinicId)
      setIsConnected(false)
      setPhone(null)
      
      // Update database
      await updateWhatsAppConfig(clinicId, locale, {
        is_connected: false,
        connected_phone_number: null
      })
    } catch (error) {
      console.error(error)
      alert('Failed to disconnect session.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mb-6">
      <PremiumCard>
        <div className="flex items-center justify-between mb-6 pb-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div>
            <h2 className="text-base font-semibold text-slate-200 flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-emerald-400" />
              WhatsApp Connection
            </h2>
            <p className="text-sm text-slate-500 mt-0.5">Link your clinic's WhatsApp number</p>
          </div>
          {isConnected ? (
            <span
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
              style={{ background: 'rgba(52,211,153,0.12)', color: '#34d399', border: '1px solid rgba(52,211,153,0.25)' }}
            >
              <Wifi className="w-3 h-3" /> Connected
            </span>
          ) : (
            <span
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
              style={{ background: 'rgba(255,255,255,0.06)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              <WifiOff className="w-3 h-3" /> Disconnected
            </span>
          )}
        </div>

        {isConnected ? (
          <div className="flex items-center justify-between p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div>
              <p className="font-medium text-slate-200">Active Session</p>
              <p className="text-sm text-slate-400">
                Connected Number: {phone || 'Unknown'}
              </p>
            </div>
            <button
              onClick={handleDisconnect}
              disabled={loading}
              className="flex items-center gap-2 h-9 px-4 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
              style={{ background: 'rgba(239,68,68,0.15)', color: '#f87171', border: '1px solid rgba(239,68,68,0.3)' }}
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Disconnect
            </button>
          </div>
        ) : qrCode ? (
          <div className="flex flex-col items-center justify-center p-6 rounded-xl space-y-4 text-center" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <h3 className="font-semibold text-lg text-slate-200">Scan QR Code</h3>
            <p className="text-sm text-slate-400 max-w-sm">
              Open WhatsApp on your phone, go to Linked Devices, and scan this QR code to connect your clinic's number.
            </p>
            <div className="bg-white p-4 rounded-xl border shadow-sm">
              <img src={qrCode} alt="WhatsApp QR Code" className="w-64 h-64" />
            </div>
            <div className="flex items-center gap-2 text-sm text-emerald-400">
              <Loader2 className="w-4 h-4 animate-spin" />
              Waiting for scan...
            </div>
            <button
              onClick={() => { setQrCode(null); setPolling(false) }}
              className="h-9 px-4 rounded-lg text-sm font-medium text-slate-300 hover:text-white transition-colors"
            >
              Cancel
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-8 border border-dashed rounded-xl text-center" style={{ borderColor: 'rgba(255,255,255,0.15)' }}>
            <div className="w-12 h-12 rounded-full flex items-center justify-center mb-4" style={{ background: 'rgba(52,211,153,0.1)', color: '#34d399' }}>
              <QrCode className="w-6 h-6" />
            </div>
            <h3 className="font-medium text-slate-200 mb-1">No Active Connection</h3>
            <p className="text-sm text-slate-400 mb-6 max-w-md">
              Connect your WhatsApp Business number to start sending automated reminders, responding to inquiries, and letting patients book appointments directly via chat.
            </p>
            <button
              onClick={handleConnect}
              disabled={loading}
              className="flex items-center gap-2 h-10 px-5 rounded-xl text-sm font-semibold transition-all disabled:opacity-50"
              style={{ background: '#00d4aa', color: '#0a0f1e' }}
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Connect WhatsApp
            </button>
          </div>
        )}
      </PremiumCard>
    </div>
  )
}
