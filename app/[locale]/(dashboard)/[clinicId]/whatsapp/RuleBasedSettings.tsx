'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Trash2 } from 'lucide-react'
import { addMenuOption, deleteMenuOption } from './actions'

export type MenuOption = {
  id: string
  option_number: number
  label_ar: string
  label_en: string
  response_type: string
  static_response: string | null
}

export default function RuleBasedSettings({
  clinicId,
  locale,
  options
}: {
  clinicId: string
  locale: string
  options: MenuOption[]
}) {
  const [loading, setLoading] = useState(false)
  const [newEn, setNewEn] = useState('')
  const [newAr, setNewAr] = useState('')
  const [newResponse, setNewResponse] = useState('')

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newEn || !newAr || !newResponse) return
    setLoading(true)
    try {
      await addMenuOption(clinicId, locale, newAr, newEn, newResponse)
      setNewEn('')
      setNewAr('')
      setNewResponse('')
    } catch (err) {
      console.error(err)
      alert('Failed to add option')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    setLoading(true)
    try {
      await deleteMenuOption(clinicId, locale, id)
    } catch (err) {
      console.error(err)
      alert('Failed to delete option')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Menu Options</CardTitle>
        <CardDescription>Customize the numeric menu your patients see.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          {options.length === 0 ? (
            <p className="text-sm text-muted-foreground">Default options will be generated automatically when the first patient messages the bot.</p>
          ) : (
            options.map(opt => (
              <div key={opt.id} className="flex items-center justify-between p-4 border rounded-lg bg-slate-50">
                <div>
                  <p className="font-semibold">{opt.option_number}. {opt.label_en} / {opt.label_ar}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Action: <span className="font-medium text-foreground">{opt.response_type.replace('action_', '')}</span>
                  </p>
                  {opt.static_response && (
                    <p className="text-sm italic mt-2">"{opt.static_response}"</p>
                  )}
                </div>
                {opt.response_type === 'static_text' && (
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(opt.id)} disabled={loading}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                )}
              </div>
            ))
          )}
        </div>

        <div className="pt-4 border-t">
          <h4 className="font-medium mb-4">Add Custom Response Option</h4>
          <form onSubmit={handleAdd} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Label (English)</Label>
                <Input value={newEn} onChange={e => setNewEn(e.target.value)} placeholder="e.g. Directions" required />
              </div>
              <div className="space-y-2">
                <Label>Label (Arabic)</Label>
                <Input value={newAr} onChange={e => setNewAr(e.target.value)} placeholder="e.g. العنوان" required />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Response Message</Label>
              <Input value={newResponse} onChange={e => setNewResponse(e.target.value)} placeholder="The message sent when they choose this option" required />
            </div>
            <Button type="submit" disabled={loading}>Add Option</Button>
          </form>
        </div>
      </CardContent>
    </Card>
  )
}
