'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { upsertDoctorProfile } from './actions'

interface StaffMember {
  id: string;
  full_name: string;
}

interface DoctorProfile {
  id: string;
  specialty: string;
  bio: string;
  staff_members?: StaffMember | null;
}

export default function DoctorsTab({ clinicId, initialData, availableStaff }: { clinicId: string, initialData: DoctorProfile[], availableStaff: StaffMember[] }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    try {
      await upsertDoctorProfile(clinicId, formData)
      setOpen(false)
    } catch (err) {
      console.error(err)
      alert('Failed to save doctor profile')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Doctors</CardTitle>
          <CardDescription>Manage doctors practicing at this clinic.</CardDescription>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          {/* @ts-expect-error shadcn primitive issue */}
          <DialogTrigger asChild>
            <Button>Add Doctor</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Doctor Profile</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="staff_member_id">Staff Member</Label>
                <select id="staff_member_id" name="staff_member_id" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background" required>
                  <option value="">Select a staff member</option>
                  {availableStaff.map(staff => (
                    <option key={staff.id} value={staff.id}>{staff.full_name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="specialty">Specialty</Label>
                <Input id="specialty" name="specialty" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Input id="bio" name="bio" />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Saving...' : 'Save Profile'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {initialData.length === 0 ? (
          <p className="text-sm text-muted-foreground">No doctors added yet.</p>
        ) : (
          <div className="space-y-4">
            {initialData.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between p-4 border rounded-md">
                <div>
                  <p className="font-medium">{doc.staff_members?.full_name}</p>
                  <p className="text-sm text-muted-foreground">{doc.specialty}</p>
                </div>
                <Button variant="outline" size="sm" onClick={() => alert('Editing coming soon')}>Edit Hours</Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
