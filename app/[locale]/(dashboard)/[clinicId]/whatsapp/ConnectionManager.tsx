'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
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
    <Card className="mb-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="w-5 h-5" />
              WhatsApp Connection
            </CardTitle>
            <CardDescription>Link your clinic's WhatsApp number</CardDescription>
          </div>
          {isConnected ? (
            <Badge className="bg-green-100 text-green-700 border-green-200 gap-1 hover:bg-green-100">
              <Wifi className="w-3 h-3" /> Connected
            </Badge>
          ) : (
            <Badge variant="secondary" className="gap-1">
              <WifiOff className="w-3 h-3" /> Disconnected
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isConnected ? (
          <div className="flex items-center justify-between p-4 border rounded-lg bg-slate-50">
            <div>
              <p className="font-medium">Active Session</p>
              <p className="text-sm text-muted-foreground">
                Connected Number: {phone || 'Unknown'}
              </p>
            </div>
            <Button variant="destructive" onClick={handleDisconnect} disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Disconnect
            </Button>
          </div>
        ) : qrCode ? (
          <div className="flex flex-col items-center justify-center p-6 border rounded-lg bg-slate-50 space-y-4 text-center">
            <h3 className="font-semibold text-lg">Scan QR Code</h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              Open WhatsApp on your phone, go to Linked Devices, and scan this QR code to connect your clinic's number.
            </p>
            <div className="bg-white p-4 rounded-xl border shadow-sm">
              <img src={qrCode} alt="WhatsApp QR Code" className="w-64 h-64" />
            </div>
            <div className="flex items-center gap-2 text-sm text-blue-600">
              <Loader2 className="w-4 h-4 animate-spin" />
              Waiting for scan...
            </div>
            <Button variant="ghost" onClick={() => { setQrCode(null); setPolling(false) }}>
              Cancel
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-8 border border-dashed rounded-lg bg-slate-50 text-center">
            <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-4">
              <QrCode className="w-6 h-6" />
            </div>
            <h3 className="font-medium mb-1">No Active Connection</h3>
            <p className="text-sm text-muted-foreground mb-4 max-w-md">
              Connect your WhatsApp Business number to start sending automated reminders, responding to inquiries, and letting patients book appointments directly via chat.
            </p>
            <Button onClick={handleConnect} disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Connect WhatsApp
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
