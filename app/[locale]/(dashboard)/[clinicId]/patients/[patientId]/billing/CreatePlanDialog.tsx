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
import { createTreatmentPlan } from './actions'

export default function CreatePlanDialog({
  clinicId,
  locale,
  patientId,
}: {
  clinicId: string
  locale: string
  patientId: string
}) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const title = formData.get('title') as string
    const totalPrice = Number(formData.get('totalPrice'))
    const sessionCount = Number(formData.get('sessionCount'))

    try {
      await createTreatmentPlan(clinicId, locale, patientId, title, totalPrice, sessionCount)
      setOpen(false)
    } catch (err) {
      console.error(err)
      alert('Failed to create treatment plan.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {/* @ts-expect-error DialogTrigger types might not fully support asChild in this version */}
      <DialogTrigger asChild>
        <Button>Create Treatment Plan</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>New Treatment Plan</DialogTitle>
          <DialogDescription>
            Outline a multi-session treatment and its total cost.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="title">Plan Title</Label>
            <Input id="title" name="title" required placeholder="e.g. Invisalign Ortho" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="totalPrice">Total Price (EGP)</Label>
            <Input id="totalPrice" name="totalPrice" type="number" step="0.01" required min="0" placeholder="0.00" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sessionCount">Number of Sessions</Label>
            <Input id="sessionCount" name="sessionCount" type="number" required min="1" max="100" defaultValue="1" />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Plan'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
