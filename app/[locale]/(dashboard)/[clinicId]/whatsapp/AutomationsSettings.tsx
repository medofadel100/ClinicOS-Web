'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { updateAutomationSettings } from './actions'

export default function AutomationsSettings({
  clinicId,
  locale,
  initialSettings
}: {
  clinicId: string
  locale: string
  initialSettings: any
}) {
  const [settings, setSettings] = useState(initialSettings || {
    pre_appointment_reminder_enabled: false,
    pre_appointment_reminder_minutes_before: 1440,
    no_show_followup_enabled: false,
    morning_summary_enabled: false,
    morning_summary_time: '08:00',
    waitlist_autofill_enabled: false
  })

  const updateToggle = async (key: string, value: boolean) => {
    const newSettings = { ...settings, [key]: value }
    setSettings(newSettings)
    await updateAutomationSettings(clinicId, locale, { [key]: value })
  }

  const updateValue = async (key: string, value: any) => {
    const newSettings = { ...settings, [key]: value }
    setSettings(newSettings)
    await updateAutomationSettings(clinicId, locale, { [key]: value })
  }

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Automations</CardTitle>
        <CardDescription>Configure automated WhatsApp workflows for your clinic.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Reminders */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Pre-Appointment Reminders</Label>
              <p className="text-sm text-muted-foreground">Automatically remind patients before their scheduled time.</p>
            </div>
            <Switch 
              checked={settings.pre_appointment_reminder_enabled}
              onCheckedChange={(c) => updateToggle('pre_appointment_reminder_enabled', c)}
            />
          </div>
          {settings.pre_appointment_reminder_enabled && (
            <div className="flex items-center gap-4 ml-6">
              <Label className="text-sm">Minutes before appointment:</Label>
              <Input 
                type="number" 
                className="w-24" 
                value={settings.pre_appointment_reminder_minutes_before || ''}
                onChange={(e) => updateValue('pre_appointment_reminder_minutes_before', parseInt(e.target.value))}
              />
            </div>
          )}
        </div>

        {/* Waitlist Autofill */}
        <div className="space-y-4 pt-4 border-t">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Waitlist Autofill</Label>
              <p className="text-sm text-muted-foreground">Instantly message waiting patients when an appointment is cancelled.</p>
            </div>
            <Switch 
              checked={settings.waitlist_autofill_enabled}
              onCheckedChange={(c) => updateToggle('waitlist_autofill_enabled', c)}
            />
          </div>
        </div>

        {/* No Shows */}
        <div className="space-y-4 pt-4 border-t">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>No-Show Follow-up</Label>
              <p className="text-sm text-muted-foreground">Message patients who missed their appointment to reschedule.</p>
            </div>
            <Switch 
              checked={settings.no_show_followup_enabled}
              onCheckedChange={(c) => updateToggle('no_show_followup_enabled', c)}
            />
          </div>
        </div>

        {/* Morning Summary */}
        <div className="space-y-4 pt-4 border-t">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Morning Schedule Summary for Doctors</Label>
              <p className="text-sm text-muted-foreground">Send a daily WhatsApp message to your doctors with their appointment count.</p>
            </div>
            <Switch 
              checked={settings.morning_summary_enabled}
              onCheckedChange={(c) => updateToggle('morning_summary_enabled', c)}
            />
          </div>
          {settings.morning_summary_enabled && (
            <div className="flex items-center gap-4 ml-6">
              <Label className="text-sm">Send at:</Label>
              <Input 
                type="time" 
                className="w-32" 
                value={settings.morning_summary_time || '08:00'}
                onChange={(e) => updateValue('morning_summary_time', e.target.value)}
              />
            </div>
          )}
        </div>
        {/* Patient File Uploads */}
        <div className="space-y-4 pt-4 border-t">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Patient File Uploads via WhatsApp</Label>
              <p className="text-sm text-muted-foreground">Allow patients to send images or PDFs to the bot to attach to their medical file.</p>
            </div>
            <Switch 
              checked={settings.patient_upload_intake_enabled}
              onCheckedChange={(c) => updateToggle('patient_upload_intake_enabled', c)}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
