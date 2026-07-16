'use client'

import { useState } from 'react'
import { PremiumCard } from '@/components/layout/PageComponents'
import { Trash2 } from 'lucide-react'
import { addMenuOption, deleteMenuOption } from './actions'

export type MenuOption = {
  id: string
  option_number: number
  label_ar: string
  label_en: string
  response_type: string
  static_response: string | null
}

export default function RuleBasedSettings({
  clinicId,
  locale,
  options
}: {
  clinicId: string
  locale: string
  options: MenuOption[]
}) {
  const [loading, setLoading] = useState(false)
  const [newEn, setNewEn] = useState('')
  const [newAr, setNewAr] = useState('')
  const [newResponse, setNewResponse] = useState('')

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newEn || !newAr || !newResponse) return
    setLoading(true)
    try {
      await addMenuOption(clinicId, locale, newAr, newEn, newResponse)
      setNewEn('')
      setNewAr('')
      setNewResponse('')
    } catch (err) {
      console.error(err)
      alert('Failed to add option')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    setLoading(true)
    try {
      await deleteMenuOption(clinicId, locale, id)
    } catch (err) {
      console.error(err)
      alert('Failed to delete option')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mt-6">
      <PremiumCard>
        <div className="mb-5 pb-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <h2 className="text-base font-semibold text-slate-200">Menu Options</h2>
          <p className="text-sm text-slate-500 mt-0.5">Customize the numeric menu your patients see.</p>
        </div>
        <div className="space-y-6">
          <div className="space-y-4">
            {options.length === 0 ? (
              <p className="text-sm text-slate-500">Default options will be generated automatically when the first patient messages the bot.</p>
            ) : (
              options.map(opt => (
                <div key={opt.id} className="flex items-center justify-between p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div>
                    <p className="font-semibold text-slate-200">{opt.option_number}. {opt.label_en} / {opt.label_ar}</p>
                    <p className="text-sm text-slate-400 mt-1">
                      Action: <span className="font-medium text-teal-400">{opt.response_type.replace('action_', '')}</span>
                    </p>
                    {opt.static_response && (
                      <p className="text-sm italic mt-2 text-slate-500">"{opt.static_response}"</p>
                    )}
                  </div>
                  {opt.response_type === 'static_text' && (
                    <button
                      onClick={() => handleDelete(opt.id)}
                      disabled={loading}
                      className="w-8 h-8 flex items-center justify-center rounded-lg text-red-400 hover:bg-red-400/10 transition-colors disabled:opacity-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>

          <div className="pt-6 mt-6" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <h4 className="font-medium text-slate-200 mb-4">Add Custom Response Option</h4>
            <form onSubmit={handleAdd} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Label (English)</label>
                  <input
                    value={newEn}
                    onChange={e => setNewEn(e.target.value)}
                    placeholder="e.g. Directions"
                    required
                    className="w-full h-10 px-3 rounded-lg text-sm bg-black/20 border border-white/10 text-white placeholder:text-slate-600 focus:outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/50 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Label (Arabic)</label>
                  <input
                    value={newAr}
                    onChange={e => setNewAr(e.target.value)}
                    placeholder="e.g. العنوان"
                    required
                    className="w-full h-10 px-3 rounded-lg text-sm bg-black/20 border border-white/10 text-white placeholder:text-slate-600 focus:outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/50 transition-all"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Response Message</label>
                <input
                  value={newResponse}
                  onChange={e => setNewResponse(e.target.value)}
                  placeholder="The message sent when they choose this option"
                  required
                  className="w-full h-10 px-3 rounded-lg text-sm bg-black/20 border border-white/10 text-white placeholder:text-slate-600 focus:outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/50 transition-all"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="h-10 px-4 rounded-lg text-sm font-medium transition-all disabled:opacity-50"
                style={{ background: 'rgba(0,212,170,0.1)', color: '#00d4aa', border: '1px solid rgba(0,212,170,0.2)' }}
              >
                Add Option
              </button>
            </form>
          </div>
        </div>
      </PremiumCard>
    </div>
  )
}
