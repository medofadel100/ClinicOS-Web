'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Lock } from 'lucide-react'
import { requestUpgrade } from '@/lib/actions/entitlements'

export default function LockedFeature({
  children,
  clinicId,
  featureCode,
  featureName
}: {
  children: React.ReactNode
  clinicId: string
  featureCode: string
  featureName: string
}) {
  const [loading, setLoading] = useState(false)
  const [requested, setRequested] = useState(false)

  const handleUpgrade = async () => {
    setLoading(true)
    try {
      await requestUpgrade(clinicId, featureCode)
      setRequested(true)
    } catch (error) {
      console.error(error)
      alert('Failed to send upgrade request.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative overflow-hidden rounded-lg border bg-background">
      <div className="filter blur-[4px] opacity-60 pointer-events-none select-none">
        {children}
      </div>
      
      <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-10 bg-background/40">
        <div className="bg-background/95 p-8 rounded-xl shadow-lg border max-w-md w-full flex flex-col items-center">
          <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
            <Lock className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-bold mb-2">{featureName} is Locked</h3>
          <p className="text-muted-foreground text-sm mb-6">
            This feature is not included in your current plan. Contact us to upgrade your plan and unlock {featureName}.
          </p>
          
          {requested ? (
            <div className="text-sm font-medium text-green-600 bg-green-50 px-4 py-2 rounded-md border border-green-200">
              Upgrade request sent! We will contact you shortly.
            </div>
          ) : (
            <Button onClick={handleUpgrade} disabled={loading} className="w-full">
              {loading ? 'Sending Request...' : 'Upgrade to Unlock'}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
