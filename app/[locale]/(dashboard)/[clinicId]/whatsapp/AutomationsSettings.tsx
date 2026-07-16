'use client'

import { useState } from 'react'
import { PremiumCard } from '@/components/layout/PageComponents'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
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
    <div className="mt-6 pb-12">
      <PremiumCard>
        <div className="mb-5 pb-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <h2 className="text-base font-semibold text-slate-200">Automations</h2>
          <p className="text-sm text-slate-500 mt-0.5">Configure automated WhatsApp workflows for your clinic.</p>
        </div>
        <div className="space-y-8">
          {/* Reminders */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-slate-200">Pre-Appointment Reminders</Label>
                <p className="text-sm text-slate-500">Automatically remind patients before their scheduled time.</p>
              </div>
              <Switch 
                checked={settings.pre_appointment_reminder_enabled}
                onCheckedChange={(c) => updateToggle('pre_appointment_reminder_enabled', c)}
              />
            </div>
            {settings.pre_appointment_reminder_enabled && (
              <div className="flex items-center gap-4 ml-6 p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                <Label className="text-sm text-slate-400">Minutes before appointment:</Label>
                <input 
                  type="number" 
                  className="w-24 h-9 px-3 rounded-lg text-sm bg-black/20 border border-white/10 text-white focus:outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/50 transition-all" 
                  value={settings.pre_appointment_reminder_minutes_before || ''}
                  onChange={(e) => updateValue('pre_appointment_reminder_minutes_before', parseInt(e.target.value))}
                />
              </div>
            )}
          </div>

          {/* Waitlist Autofill */}
          <div className="space-y-4 pt-6" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-slate-200">Waitlist Autofill</Label>
                <p className="text-sm text-slate-500">Instantly message waiting patients when an appointment is cancelled.</p>
              </div>
              <Switch 
                checked={settings.waitlist_autofill_enabled}
                onCheckedChange={(c) => updateToggle('waitlist_autofill_enabled', c)}
              />
            </div>
          </div>

          {/* No Shows */}
          <div className="space-y-4 pt-6" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-slate-200">No-Show Follow-up</Label>
                <p className="text-sm text-slate-500">Message patients who missed their appointment to reschedule.</p>
              </div>
              <Switch 
                checked={settings.no_show_followup_enabled}
                onCheckedChange={(c) => updateToggle('no_show_followup_enabled', c)}
              />
            </div>
          </div>

          {/* Morning Summary */}
          <div className="space-y-4 pt-6" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-slate-200">Morning Schedule Summary for Doctors</Label>
                <p className="text-sm text-slate-500">Send a daily WhatsApp message to your doctors with their appointment count.</p>
              </div>
              <Switch 
                checked={settings.morning_summary_enabled}
                onCheckedChange={(c) => updateToggle('morning_summary_enabled', c)}
              />
            </div>
            {settings.morning_summary_enabled && (
              <div className="flex items-center gap-4 ml-6 p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                <Label className="text-sm text-slate-400">Send at:</Label>
                <input 
                  type="time" 
                  className="w-32 h-9 px-3 rounded-lg text-sm bg-black/20 border border-white/10 text-white focus:outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/50 transition-all" 
                  value={settings.morning_summary_time || '08:00'}
                  onChange={(e) => updateValue('morning_summary_time', e.target.value)}
                />
              </div>
            )}
          </div>
          
          {/* Patient File Uploads */}
          <div className="space-y-4 pt-6" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-slate-200">Patient File Uploads via WhatsApp</Label>
                <p className="text-sm text-slate-500">Allow patients to send images or PDFs to the bot to attach to their medical file.</p>
              </div>
              <Switch 
                checked={settings.patient_upload_intake_enabled}
                onCheckedChange={(c) => updateToggle('patient_upload_intake_enabled', c)}
              />
            </div>
          </div>
        </div>
      </PremiumCard>
    </div>
  )
}
