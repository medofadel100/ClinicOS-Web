'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { updateClinicSettings } from './actions'

interface ClinicSettings {
  contact_email?: string;
  contact_phone?: string;
  address?: string;
  currency_code?: string;
  timezone?: string;
}

export default function GeneralSettingsTab({ clinicId, initialData }: { clinicId: string, initialData: ClinicSettings | null }) {
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    try {
      await updateClinicSettings(clinicId, formData)
    } catch (err) {
      console.error(err)
      alert('Failed to save settings')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>General Settings</CardTitle>
        <CardDescription>Update your clinic&apos;s basic information.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4 max-w-xl">
          <div className="space-y-2">
            <Label htmlFor="contact_email">Contact Email</Label>
            <Input id="contact_email" name="contact_email" type="email" defaultValue={initialData?.contact_email || ''} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="contact_phone">Contact Phone</Label>
            <Input id="contact_phone" name="contact_phone" defaultValue={initialData?.contact_phone || ''} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input id="address" name="address" defaultValue={initialData?.address || ''} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="currency_code">Currency Code</Label>
            <Input id="currency_code" name="currency_code" defaultValue={initialData?.currency_code || 'EGP'} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="timezone">Timezone</Label>
            <Input id="timezone" name="timezone" defaultValue={initialData?.timezone || 'UTC'} />
          </div>
          <Button type="submit" disabled={loading}>
            {loading ? 'Saving...' : 'Save Settings'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
