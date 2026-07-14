'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { upsertCampaign } from './actions'
import { Switch } from '@/components/ui/switch'

type Campaign = {
  id: string
  name: string
  platform: string
  start_date: string | null
  end_date: string | null
  budget_egp: number | null
  is_active: boolean
}

export default function CampaignDialog({
  clinicId,
  locale,
  campaign
}: {
  clinicId: string
  locale: string
  campaign?: Campaign
}) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const isEditing = !!campaign

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const name = formData.get('name') as string
    const platform = formData.get('platform') as string
    const startDate = formData.get('start_date') as string
    const endDate = formData.get('end_date') as string
    const budgetStr = formData.get('budget_egp') as string
    const budgetEgp = budgetStr ? Number(budgetStr) : null
    const isActive = formData.get('is_active') === 'on'

    try {
      await upsertCampaign(
        clinicId, 
        locale, 
        campaign?.id || null, 
        name, 
        platform, 
        startDate, 
        endDate, 
        budgetEgp, 
        isActive
      )
      setOpen(false)
    } catch (err: unknown) {
      console.error(err)
      alert(err instanceof Error ? err.message : 'Failed to save campaign')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {/* @ts-expect-error Types mismatch */}
      <DialogTrigger asChild>
        <Button variant={isEditing ? 'outline' : 'default'} size={isEditing ? 'sm' : 'default'}>
          {isEditing ? 'Edit' : 'New Campaign'}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Campaign' : 'Create Campaign'}</DialogTitle>
          <DialogDescription>
            Configure marketing campaign details to track ROI.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="name">Campaign Name</Label>
            <Input id="name" name="name" required defaultValue={campaign?.name} placeholder="e.g. Summer Special 2026" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="platform">Platform</Label>
            <Select name="platform" defaultValue={campaign?.platform || 'Facebook'}>
              <SelectTrigger>
                <SelectValue placeholder="Select platform" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Facebook">Facebook</SelectItem>
                <SelectItem value="Instagram">Instagram</SelectItem>
                <SelectItem value="Google">Google Ads</SelectItem>
                <SelectItem value="TikTok">TikTok</SelectItem>
                <SelectItem value="Offline">Offline / Print</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_date">Start Date</Label>
              <Input id="start_date" name="start_date" type="date" defaultValue={campaign?.start_date || ''} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end_date">End Date</Label>
              <Input id="end_date" name="end_date" type="date" defaultValue={campaign?.end_date || ''} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="budget_egp">Budget (EGP)</Label>
            <Input id="budget_egp" name="budget_egp" type="number" step="0.01" min="0" defaultValue={campaign?.budget_egp || ''} />
          </div>

          <div className="flex items-center space-x-2 pt-2">
            <Switch id="is_active" name="is_active" defaultChecked={campaign ? campaign.is_active : true} />
            <Label htmlFor="is_active">Campaign is Active</Label>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Save Campaign'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
