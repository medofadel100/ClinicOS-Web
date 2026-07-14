'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

export default function InviteAcceptForm({
  locale,
  invite
}: {
  locale: string
  invite: any
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    specialtyTitle: '',
    bioAr: '',
    bioEn: ''
  })

  const isDoctor = invite.invited_role === 'doctor'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/invite/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: invite.invite_token,
          ...formData
        })
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to accept invitation')
      }

      // Automatically login
      const loginRes = await fetch('/auth/login', { // Or whatever the actual login route logic is if handled by Supabase Client directly
        // Instead of fetch, let's just use supabase client here to sign in
      })
      // Actually, let's just use supabase client to sign in here
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password
      })

      if (signInError) {
        throw new Error('Account created, but failed to log in automatically. Please go to the login page.')
      }

      router.push(`/${locale}/clinic-switcher`)
      router.refresh()
    } catch (err: any) {
      setError(err.message)
      setLoading(false)
    }
  }

  return (
    <div className="bg-card text-card-foreground rounded-xl border shadow-lg p-6 space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-semibold tracking-tight">Join {invite.clinics?.name}</h2>
        <p className="text-muted-foreground text-sm">
          You have been invited to join as a <span className="font-semibold capitalize">{invite.invited_role}</span>.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="fullName">Full Name</Label>
          <Input
            id="fullName"
            placeholder="John Doe"
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="name@example.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
            minLength={6}
          />
        </div>

        {isDoctor && (
          <>
            <div className="space-y-2">
              <Label htmlFor="specialtyTitle">Specialty Title</Label>
              <Input
                id="specialtyTitle"
                placeholder="e.g. Orthodontist"
                value={formData.specialtyTitle}
                onChange={(e) => setFormData({ ...formData, specialtyTitle: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bioEn">Bio (English)</Label>
              <Textarea
                id="bioEn"
                placeholder="Brief professional biography in English..."
                value={formData.bioEn}
                onChange={(e) => setFormData({ ...formData, bioEn: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bioAr">Bio (Arabic)</Label>
              <Textarea
                id="bioAr"
                placeholder="نبذة مهنية قصيرة..."
                value={formData.bioAr}
                onChange={(e) => setFormData({ ...formData, bioAr: e.target.value })}
              />
            </div>
          </>
        )}

        {error && (
          <div className="p-3 text-sm text-destructive-foreground bg-destructive/10 border border-destructive/20 rounded-md">
            {error}
          </div>
        )}

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Creating Account...' : 'Accept Invitation & Join'}
        </Button>
      </form>
    </div>
  )
}
