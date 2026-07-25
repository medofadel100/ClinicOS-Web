'use client'

import { useState, useEffect } from 'react'
import { Download } from 'lucide-react'

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export default function InstallPWA({ variant = 'button' }: { variant?: 'button' | 'banner' }) {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isInstallable, setIsInstallable] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)
  const [isAr, setIsAr] = useState(false)

  useEffect(() => {
    setIsAr(document.documentElement.lang === 'ar')

    // Check if already installed (standalone mode)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone
    if (isStandalone) {
      setIsInstalled(true)
      return
    }

    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setIsInstallable(true)
    }

    window.addEventListener('beforeinstallprompt', handler)

    window.addEventListener('appinstalled', () => {
      setIsInstalled(true)
      setIsInstallable(false)
      setDeferredPrompt(null)
    })

    return () => {
      window.removeEventListener('beforeinstallprompt', handler)
    }
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') {
      setIsInstallable(false)
    }
    setDeferredPrompt(null)
  }

  if (isInstalled) return null
  if (!isInstallable) return null

  if (variant === 'banner') {
    return (
      <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20">
        <Download className="w-5 h-5 text-primary shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-slate-200">
            {isAr ? 'ثبت ClinicOS على جهازك' : 'Install ClinicOS on your device'}
          </p>
          <p className="text-xs text-slate-500">
            {isAr ? 'افتحه بسرعة من الشاشة الرئيسية' : 'Quick access from your home screen'}
          </p>
        </div>
        <button
          onClick={handleInstall}
          className="shrink-0 px-4 py-2 rounded-lg text-sm font-semibold bg-primary text-black hover:bg-primary/90 transition-all"
        >
          {isAr ? 'تثبيت' : 'Install'}
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={handleInstall}
      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-all"
    >
      <Download className="w-4 h-4" />
      {isAr ? 'تثبيت التطبيق' : 'Install App'}
    </button>
  )
}
