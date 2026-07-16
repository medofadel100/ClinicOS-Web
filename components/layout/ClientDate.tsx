'use client'

import { useEffect, useState } from 'react'

export function ClientDate() {
  const [dateStr, setDateStr] = useState<string>('')

  useEffect(() => {
    setDateStr(
      new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
      })
    )
  }, [])

  if (!dateStr) return null

  return (
    <div
      className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm shrink-0"
      style={{
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.07)',
      }}
    >
      <div
        className="w-2 h-2 rounded-full animate-pulse"
        style={{
          background: 'hsl(168 100% 42%)',
          boxShadow: '0 0 6px rgba(0,212,170,0.7)',
        }}
      />
      <span className="text-slate-300 font-medium">{dateStr}</span>
    </div>
  )
}
