'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { createWhatsAppCampaign } from './actions'

export default function NewWhatsAppCampaignDialog({ clinicId, locale }: { clinicId: string, locale: string }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  
  const [name, setName] = useState('')
  const [template, setTemplate] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [filterValue, setFilterValue] = useState('')

  const handleCreate = async () => {
    setLoading(true)
    try {
      await createWhatsAppCampaign(clinicId, locale, name, template, filterType, filterValue)
      setOpen(false)
      setName('')
      setTemplate('')
      setFilterType('all')
      setFilterValue('')
    } catch (err) {
      console.error(err)
      alert("Failed to create campaign")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>New Broadcast</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create WhatsApp Broadcast</DialogTitle>
          <DialogDescription>Send a mass message to targeted patients.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Campaign Name</Label>
            <Input 
              value={name} 
              onChange={e => setName(e.target.value)} 
              placeholder="e.g. Eid Discount 2026" 
            />
          </div>
          
          <div className="space-y-2">
            <Label>Target Audience</Label>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger>
                <SelectValue placeholder="Select Audience" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Patients</SelectItem>
                <SelectItem value="not_visited_months">Haven't visited in X months</SelectItem>
                <SelectItem value="has_disease">Patients with specific medical condition</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {filterType === 'not_visited_months' && (
            <div className="space-y-2">
              <Label>Months since last visit</Label>
              <Input 
                type="number" 
                value={filterValue} 
                onChange={e => setFilterValue(e.target.value)} 
                placeholder="e.g. 6" 
              />
            </div>
          )}

          {filterType === 'has_disease' && (
            <div className="space-y-2">
              <Label>Condition / Disease</Label>
              <Input 
                value={filterValue} 
                onChange={e => setFilterValue(e.target.value)} 
                placeholder="e.g. Diabetes" 
              />
            </div>
          )}

          <div className="space-y-2">
            <Label>Message Template</Label>
            <Textarea 
              value={template} 
              onChange={e => setTemplate(e.target.value)} 
              placeholder="Hello! We are offering a 20% discount this week..." 
              rows={5}
            />
            <p className="text-xs text-muted-foreground">
              An automated "Reply STOP to unsubscribe" will be appended to your message.
            </p>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleCreate} disabled={loading || !name || !template}>
            {loading ? 'Queuing...' : 'Launch Campaign'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
