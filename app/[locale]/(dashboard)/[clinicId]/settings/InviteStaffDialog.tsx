'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { generateStaffInvite } from './actions'
import { Copy, CheckCircle2 } from 'lucide-react'

export default function InviteStaffDialog({ clinicId }: { clinicId: string }) {
  const [open, setOpen] = useState(false)
  const [role, setRole] = useState('doctor')
  const [loading, setLoading] = useState(false)
  const [inviteLink, setInviteLink] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const handleGenerate = async () => {
    setLoading(true)
    try {
      const token = await generateStaffInvite(clinicId, role)
      const link = `${window.location.origin}/en/invite/${token}` // Simple localization handling or extract from path
      setInviteLink(link)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = () => {
    if (inviteLink) {
      navigator.clipboard.writeText(inviteLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(val) => {
      setOpen(val)
      if (!val) {
        setTimeout(() => {
          setInviteLink(null)
          setRole('doctor')
          setCopied(false)
        }, 200)
      }
    }}>
      <DialogTrigger asChild>
        <Button>Invite Team Member</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite Team Member</DialogTitle>
          <DialogDescription>
            Generate an invitation link to allow a staff member to join your clinic.
          </DialogDescription>
        </DialogHeader>

        {!inviteLink ? (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Role</Label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="doctor">Doctor</SelectItem>
                  <SelectItem value="reception">Reception</SelectItem>
                  <SelectItem value="accountant">Accountant</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button className="w-full" onClick={handleGenerate} disabled={loading}>
              {loading ? 'Generating...' : 'Generate Invite Link'}
            </Button>
          </div>
        ) : (
          <div className="space-y-4 py-4">
            <div className="p-4 rounded-md bg-muted/50 border space-y-3">
              <Label>Invitation Link</Label>
              <div className="flex space-x-2">
                <Input value={inviteLink} readOnly className="font-mono text-xs" />
                <Button variant="secondary" size="icon" onClick={handleCopy}>
                  {copied ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Share this link with the staff member. It will expire in 7 days.
              </p>
            </div>
            <Button className="w-full" variant="outline" onClick={() => setOpen(false)}>
              Close
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
