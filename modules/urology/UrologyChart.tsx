'use client'

import { useState, useRef, useEffect } from 'react'
import { Plus, X, AlertCircle } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useTranslations } from 'next-intl'
import { upsertUrologyNote } from './actions'

interface Pin {
  id: string;
  x: number;
  y: number;
  condition: string;
  severity: 'mild' | 'moderate' | 'severe';
  notes: string;
  date: string;
}

export default function UrologyChart({
  patientId,
  clinicId,
  locale,
  initialEntries
}: {
  patientId: string;
  clinicId: string;
  locale: string;
  initialEntries: any[];
}) {
  const t = useTranslations('Clinical')
  
  const getPins = (entries: any[]) => {
    const notes = entries.find(n => n.note_type === 'urology_map')
    return (notes?.content?.pins as Pin[]) || []
  }
  
  const [entries, setEntries] = useState<any[]>(initialEntries)
  const [pins, setPins] = useState<Pin[]>(getPins(initialEntries))
  const [newPinCoords, setNewPinCoords] = useState<{x: number, y: number} | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedPin, setSelectedPin] = useState<Pin | null>(null)
  const [loading, setLoading] = useState(false)

  const isOwnerOrDoctor = true 

  useEffect(() => {
    setPins(getPins(entries))
  }, [entries])

  const mapRef = useRef<HTMLDivElement>(null)

  const handleMapClick = (e: React.MouseEvent) => {
    if (!isOwnerOrDoctor || selectedPin) return;
    
    if (mapRef.current) {
      const rect = mapRef.current.getBoundingClientRect()
      const x = ((e.clientX - rect.left) / rect.width) * 100
      const y = ((e.clientY - rect.top) / rect.height) * 100
      
      setNewPinCoords({ x, y })
      setSelectedPin(null)
      setIsDialogOpen(true)
    }
  }

  const handlePinClick = (e: React.MouseEvent, pin: Pin) => {
    e.stopPropagation()
    setSelectedPin(pin)
    setIsDialogOpen(true)
  }

  const handleSavePin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    
    const formData = new FormData(e.currentTarget)
    let updatedPins = [...pins]
    
    if (selectedPin) {
      updatedPins = updatedPins.map(p => p.id === selectedPin.id ? {
        ...p,
        condition: formData.get('condition') as string,
        severity: formData.get('severity') as 'mild' | 'moderate' | 'severe',
        notes: formData.get('notes') as string
      } : p)
    } else if (newPinCoords) {
      const newPin: Pin = {
        id: Math.random().toString(36).substring(7),
        x: newPinCoords.x,
        y: newPinCoords.y,
        condition: formData.get('condition') as string,
        severity: formData.get('severity') as 'mild' | 'moderate' | 'severe',
        notes: formData.get('notes') as string,
        date: new Date().toISOString()
      }
      updatedPins.push(newPin)
    }

    try {
      const updatedNotes = await upsertUrologyNote(clinicId, locale, patientId, updatedPins)
      setEntries(updatedNotes)
      setIsDialogOpen(false)
      setNewPinCoords(null)
      setSelectedPin(null)
    } catch (err) {
      console.error(err)
      alert('Failed to save')
    } finally {
      setLoading(false)
    }
  }

  const handleDeletePin = async (id: string) => {
    if (!isOwnerOrDoctor) return;
    setLoading(true)
    const updatedPins = pins.filter(p => p.id !== id)
    try {
      const updatedNotes = await upsertUrologyNote(clinicId, locale, patientId, updatedPins)
      setEntries(updatedNotes)
      setIsDialogOpen(false)
      setSelectedPin(null)
    } catch (err) {
      console.error(err)
      alert('Failed to delete')
    } finally {
      setLoading(false)
    }
  }

  const getSeverityColor = (sev: string) => {
    if (sev === 'severe') return 'bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)]'
    if (sev === 'moderate') return 'bg-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.5)]'
    return 'bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]'
  }

  const UrinaryTractSVG = () => (
    <svg viewBox="0 0 200 250" className="w-full h-full drop-shadow-xl" preserveAspectRatio="xMidYMid meet">
      {/* Right Kidney */}
      <ellipse cx="60" cy="70" rx="15" ry="25" fill="rgba(239,68,68,0.15)" stroke="rgba(239,68,68,0.4)" strokeWidth="2" transform="rotate(-15 60 70)" />
      {/* Left Kidney */}
      <ellipse cx="140" cy="70" rx="15" ry="25" fill="rgba(239,68,68,0.15)" stroke="rgba(239,68,68,0.4)" strokeWidth="2" transform="rotate(15 140 70)" />
      
      {/* Right Ureter */}
      <path d="M65 95 Q80 130 90 170" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="3" />
      {/* Left Ureter */}
      <path d="M135 95 Q120 130 110 170" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="3" />
      
      {/* Bladder */}
      <circle cx="100" cy="180" r="20" fill="rgba(147,197,253,0.15)" stroke="rgba(147,197,253,0.4)" strokeWidth="2" />
      
      {/* Urethra */}
      <rect x="97" y="200" width="6" height="25" rx="3" fill="rgba(147,197,253,0.1)" stroke="rgba(147,197,253,0.3)" strokeWidth="2" />
    </svg>
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <span className="text-xl">🩺</span> Urology Map
          </h3>
          <p className="text-sm text-slate-400">Click anywhere on the urinary tract to mark stones, tumors, or blockages.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 relative bg-[#0f172a]/50 rounded-2xl border border-white/10 overflow-hidden flex items-center justify-center p-8 min-h-[500px]">
          <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10 pointer-events-none"></div>
          
          <div 
            ref={mapRef}
            onClick={handleMapClick}
            className={`relative w-full max-w-sm aspect-[4/5] ${isOwnerOrDoctor ? 'cursor-crosshair' : ''}`}
          >
            <UrinaryTractSVG />
            
            {pins.map(pin => (
              <button
                key={pin.id}
                onClick={(e) => handlePinClick(e, pin)}
                className={`absolute w-5 h-5 -ml-2.5 -mt-2.5 rounded-full border-2 border-white shadow-lg transform transition-all hover:scale-125 ${getSeverityColor(pin.severity)}`}
                style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
              />
            ))}
            
            {newPinCoords && !selectedPin && (
              <div 
                className="absolute w-5 h-5 -ml-2.5 -mt-2.5 rounded-full bg-white animate-pulse shadow-[0_0_15px_rgba(255,255,255,0.8)] pointer-events-none"
                style={{ left: `${newPinCoords.x}%`, top: `${newPinCoords.y}%` }}
              />
            )}
          </div>

          <div className="absolute bottom-4 left-4 right-4 flex justify-between text-xs text-slate-500 font-medium uppercase tracking-wider">
            <span>Anterior View</span>
            <span>{pins.length} Records</span>
          </div>
        </div>

        <div className="bg-[#0f172a]/50 rounded-2xl border border-white/10 p-5 flex flex-col h-[500px]">
          <h4 className="text-sm font-semibold text-slate-200 mb-4 uppercase tracking-wider">Recorded Notes</h4>
          
          <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
            {pins.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 opacity-60">
                <AlertCircle className="w-10 h-10 mb-2" />
                <p className="text-sm">No records yet.</p>
                <p className="text-xs mt-1">Click the tract map to add one.</p>
              </div>
            ) : (
              pins.map(pin => (
                <div 
                  key={pin.id} 
                  onClick={(e) => handlePinClick(e, pin)}
                  className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-3 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`w-3 h-3 rounded-full ${getSeverityColor(pin.severity)}`} />
                    <span className="text-sm font-semibold text-slate-200">{pin.condition}</span>
                  </div>
                  <div className="text-xs text-slate-400 mb-2 line-clamp-1">{pin.notes || 'No notes provided'}</div>
                  <div className="text-[10px] text-slate-500 font-mono flex justify-between bg-black/20 p-2 rounded-lg">
                    <span>{new Date(pin.date).toLocaleDateString()}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <Dialog 
        open={isDialogOpen} 
        onOpenChange={(open) => {
          setIsDialogOpen(open)
          if (!open) {
            setNewPinCoords(null)
            setSelectedPin(null)
          }
        }}
      >
        <DialogContent className="bg-[#0a0f1e] border border-white/10 text-white sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{selectedPin ? 'Edit Record' : 'Record New Finding'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSavePin} className="space-y-4 mt-4">
            
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Condition / Type</label>
              <select 
                name="condition"
                defaultValue={selectedPin?.condition || 'Kidney Stone (Calculus)'}
                disabled={!isOwnerOrDoctor}
                className="w-full h-10 px-3 rounded-lg text-sm bg-black/20 border border-white/10 text-white focus:outline-none focus:border-indigo-500/50"
              >
                <option value="Kidney Stone (Calculus)">Kidney Stone (Calculus)</option>
                <option value="Ureteral Stone">Ureteral Stone</option>
                <option value="Tumor / Mass">Tumor / Mass</option>
                <option value="Stricture / Blockage">Stricture / Blockage</option>
                <option value="Infection Focus (UTI/Pyelo)">Infection Focus</option>
                <option value="Prostate Enlargement (BPH)">Prostate Enlargement</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Severity / Size</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {['mild', 'moderate', 'severe'].map((sev) => (
                  <label key={sev} className={`
                    flex items-center justify-center p-2 rounded-lg border cursor-pointer transition-all text-xs font-medium uppercase tracking-wider
                    ${selectedPin?.severity === sev || (!selectedPin && sev === 'mild') ? 'bg-indigo-500/20 border-indigo-500 text-indigo-300' : 'bg-black/20 border-white/10 text-slate-400 hover:bg-white/5'}
                  `}>
                    <input 
                      type="radio" 
                      name="severity" 
                      value={sev} 
                      defaultChecked={selectedPin?.severity === sev || (!selectedPin && sev === 'mild')}
                      disabled={!isOwnerOrDoctor}
                      className="hidden" 
                    />
                    {sev}
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Clinical Notes & Findings</label>
              <textarea 
                name="notes"
                defaultValue={selectedPin?.notes || ''}
                disabled={!isOwnerOrDoctor}
                placeholder="Describe size (e.g., 5mm), symptoms, or scan results..."
                className="w-full h-24 p-3 rounded-lg text-sm bg-black/20 border border-white/10 text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/50 resize-none"
              />
            </div>

            {isOwnerOrDoctor && (
              <div className="flex gap-3 pt-4 mt-6 border-t border-white/10">
                {selectedPin && (
                  <button
                    type="button"
                    onClick={() => handleDeletePin(selectedPin.id)}
                    disabled={loading}
                    className="flex-1 h-10 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-lg text-sm font-medium transition-all"
                  >
                    Delete
                  </button>
                )}
                <button
                  type="submit"
                  disabled={loading}
                  className={`${selectedPin ? 'flex-1' : 'w-full'} h-10 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg text-sm font-medium transition-all`}
                >
                  {loading ? 'Saving...' : 'Save Record'}
                </button>
              </div>
            )}
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
