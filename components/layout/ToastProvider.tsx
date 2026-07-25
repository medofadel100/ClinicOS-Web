'use client'

import { Toaster } from 'sonner'

export default function ToastProvider() {
  return (
    <Toaster
      position="top-center"
      richColors
      closeButton
      toastOptions={{
        style: {
          background: '#0a0f1e',
          border: '1px solid rgba(255,255,255,0.1)',
          color: '#e2e8f0',
        },
      }}
    />
  )
}
