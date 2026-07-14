'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

export default function LoginForm({ locale }: { locale: string }) {
  const t = useTranslations('Login')
  const router = useRouter()
  const supabase = createClient()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push(`/${locale}/clinic-switcher`)
      router.refresh()
    }
  }

  return (
    <div className="flex flex-col space-y-8">
      <div className="flex flex-col space-y-2 text-center lg:text-start">
        <h2 className="text-3xl font-semibold tracking-tight">{t('title')}</h2>
        <p className="text-sm text-muted-foreground">{t('description')}</p>
      </div>

      <form onSubmit={handleLogin} className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">{t('email')}</Label>
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-11 px-4 bg-muted/50 focus:bg-background transition-colors"
              required
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">{t('password')}</Label>
            </div>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-11 px-4 bg-muted/50 focus:bg-background transition-colors"
              required
            />
          </div>
        </div>

        {error && (
          <div className="p-3 text-sm text-destructive-foreground bg-destructive/10 border border-destructive/20 rounded-md">
            {error}
          </div>
        )}

        <Button type="submit" className="w-full h-11 text-base font-medium shadow-sm transition-all hover:shadow-md" disabled={loading}>
          {loading ? t('loading') : t('submit')}
        </Button>
      </form>

      <div className="flex flex-col space-y-4 pt-4">
        <p className="text-center text-sm text-muted-foreground">
          Don't have an account?{' '}
          <a href={`/${locale}/register`} className="font-semibold text-primary hover:underline">
            Create one now
          </a>
        </p>
        <p className="text-center text-sm text-muted-foreground">
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  )
}
