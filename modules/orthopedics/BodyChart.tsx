'use client'

import { useState } from 'react'
import { PremiumCard } from '@/components/layout/PageComponents'
import { upsertExamination, deleteExamination } from './actions'

type InjuryType = 'fracture' | 'sprain' | 'dislocation' | 'chronic_pain' | 'strain'
type Severity = 'mild' | 'moderate' | 'severe'

type ExaminationEntry = {
  id: string
  body_region: string
  injury_type: InjuryType
  severity: Severity
  diagnosis: string
  treatment_plan: string
  notes: string
  created_at: string
}

const BODY_REGIONS = [
  { id: 'head', label: 'Head', emoji: '🧠' },
  { id: 'neck', label: 'Neck', emoji: '🦴' },
  { id: 'shoulder', label: 'Shoulder', emoji: '💪' },
  { id: 'arm', label: 'Arm', emoji: '🦾' },
  { id: 'elbow', label: 'Elbow', emoji: '🦴' },
  { id: 'wrist', label: 'Wrist', emoji: '✋' },
  { id: 'hand', label: 'Hand', emoji: '🤚' },
  { id: 'hip', label: 'Hip', emoji: '🦴' },
  { id: 'knee', label: 'Knee', emoji: '🦵' },
  { id: 'ankle', label: 'Ankle', emoji: '🦶' },
  { id: 'foot', label: 'Foot', emoji: '👟' },
  { id: 'spine', label: 'Spine', emoji: '🦴' },
  { id: 'chest', label: 'Chest', emoji: '🫁' },
  { id: 'abdomen', label: 'Abdomen', emoji: '🩺' }
]

const INJURY_TYPES: { value: InjuryType; label: string }[] = [
  { value: 'fracture', label: 'Fracture' },
  { value: 'sprain', label: 'Sprain' },
  { value: 'dislocation', label: 'Dislocation' },
  { value: 'chronic_pain', label: 'Chronic Pain' },
  { value: 'strain', label: 'Strain' }
]

const SEVERITIES: { value: Severity; label: string; color: string }[] = [
  { value: 'mild', label: 'Mild', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50' },
  { value: 'moderate', label: 'Moderate', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50' },
  { value: 'severe', label: 'Severe', color: 'bg-red-500/20 text-red-400 border-red-500/50' }
]

const inputClass = 'w-full bg-black/40 text-slate-300 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/50 placeholder:text-slate-600'
const selectClass = inputClass + ' appearance-none cursor-pointer'

function getRegionBadge(region: string, entries: ExaminationEntry[]) {
  const count = entries.filter(e => e.body_region === region).length
  if (count === 0) return null
  return (
    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center text-[10px] font-bold rounded-full bg-teal-500 text-white px-1">
      {count}
    </span>
  )
}

function getSeverityStyle(severity: Severity) {
  return SEVERITIES.find(s => s.value === severity)?.color || ''
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}

export default function BodyChart({
  clinicId,
  locale,
  patientId,
  initialEntries
}: {
  clinicId: string
  locale: string
  patientId: string
  initialEntries: ExaminationEntry[]
}) {
  const [entries, setEntries] = useState<ExaminationEntry[]>(initialEntries)
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const [injuryType, setInjuryType] = useState<InjuryType>('fracture')
  const [severity, setSeverity] = useState<Severity>('mild')
  const [diagnosis, setDiagnosis] = useState('')
  const [treatmentPlan, setTreatmentPlan] = useState('')
  const [notes, setNotes] = useState('')

  const selectedEntries = selectedRegion
    ? entries.filter(e => e.body_region === selectedRegion)
    : []

  const handleSelectRegion = (regionId: string) => {
    setSelectedRegion(prev => prev === regionId ? null : regionId)
    resetForm()
  }

  const resetForm = () => {
    setEditingId(null)
    setInjuryType('fracture')
    setSeverity('mild')
    setDiagnosis('')
    setTreatmentPlan('')
    setNotes('')
  }

  const handleEdit = (entry: ExaminationEntry) => {
    setEditingId(entry.id)
    setSelectedRegion(entry.body_region)
    setInjuryType(entry.injury_type)
    setSeverity(entry.severity)
    setDiagnosis(entry.diagnosis)
    setTreatmentPlan(entry.treatment_plan)
    setNotes(entry.notes)
  }

  const handleDelete = async (examId: string) => {
    if (!confirm('Delete this examination?')) return
    setLoading(true)
    try {
      await deleteExamination(clinicId, locale, patientId, examId)
      setEntries(prev => prev.filter(e => e.id !== examId))
    } catch (err) {
      console.error(err)
      alert('Failed to delete examination')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async () => {
    if (!selectedRegion) return
    setLoading(true)
    try {
      await upsertExamination(
        clinicId,
        locale,
        patientId,
        selectedRegion,
        injuryType,
        severity,
        diagnosis,
        treatmentPlan,
        notes,
        editingId || undefined
      )

      const entry: ExaminationEntry = {
        id: editingId || crypto.randomUUID(),
        body_region: selectedRegion,
        injury_type: injuryType,
        severity,
        diagnosis,
        treatment_plan: treatmentPlan,
        notes,
        created_at: new Date().toISOString()
      }

      if (editingId) {
        setEntries(prev => prev.map(e => e.id === editingId ? { ...entry, created_at: e.created_at } : e))
      } else {
        setEntries(prev => [...prev, entry])
      }

      resetForm()
    } catch (err) {
      console.error(err)
      alert('Failed to save examination')
    } finally {
      setLoading(false)
    }
  }

  return (
    <PremiumCard>
      <div className="mb-6 pb-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <h2 className="text-base font-semibold text-slate-200">Orthopedic Body Chart</h2>
        <p className="text-sm text-slate-500 mt-0.5">Track musculoskeletal injuries and treatments by body region.</p>
      </div>

      {/* Region Selector Grid */}
      <div className="grid grid-cols-4 sm:grid-cols-7 gap-2 sm:gap-3 mb-8">
        {BODY_REGIONS.map(region => {
          const isActive = selectedRegion === region.id
          const hasData = entries.some(e => e.body_region === region.id)
          return (
            <button
              key={region.id}
              onClick={() => handleSelectRegion(region.id)}
              className={`relative flex flex-col items-center gap-1.5 p-2.5 sm:p-3 rounded-xl border transition-all ${
                isActive
                  ? 'bg-teal-500/15 border-teal-500/50 shadow-[0_0_20px_rgba(20,184,166,0.1)]'
                  : hasData
                    ? 'bg-white/[0.03] border-white/10 hover:border-white/20'
                    : 'bg-white/[0.02] border-white/5 hover:border-white/15'
              }`}
            >
              {getRegionBadge(region.id, entries)}
              <span className="text-lg sm:text-xl">{region.emoji}</span>
              <span className={`text-[10px] sm:text-xs font-medium ${isActive ? 'text-teal-400' : 'text-slate-400'}`}>
                {region.label}
              </span>
            </button>
          )
        })}
      </div>

      {/* Form */}
      {selectedRegion && (
        <div className="bg-black/20 rounded-xl border border-white/5 p-4 sm:p-5 mb-6 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-slate-300">
              {editingId ? 'Edit' : 'New'} Examination — <span className="text-teal-400 capitalize">{selectedRegion}</span>
            </h3>
            {editingId && (
              <button onClick={resetForm} className="text-xs text-slate-500 hover:text-slate-300 transition-colors">
                Cancel Edit
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Injury Type</label>
              <select value={injuryType} onChange={e => setInjuryType(e.target.value as InjuryType)} className={selectClass}>
                {INJURY_TYPES.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Severity</label>
              <div className="flex gap-2">
                {SEVERITIES.map(s => (
                  <button
                    key={s.value}
                    onClick={() => setSeverity(s.value)}
                    className={`flex-1 py-2 rounded-lg text-xs font-medium border transition-all ${
                      severity === s.value ? s.color : 'bg-white/[0.02] text-slate-500 border-white/5 hover:border-white/10'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Diagnosis</label>
            <input
              type="text"
              value={diagnosis}
              onChange={e => setDiagnosis(e.target.value)}
              placeholder="e.g. ACL tear, rotator cuff injury..."
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Treatment Plan</label>
            <textarea
              value={treatmentPlan}
              onChange={e => setTreatmentPlan(e.target.value)}
              placeholder="Describe the treatment plan..."
              rows={3}
              className={inputClass + ' resize-none'}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Notes</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Additional notes..."
              rows={2}
              className={inputClass + ' resize-none'}
            />
          </div>

          <div className="flex justify-end pt-1">
            <button
              onClick={handleSubmit}
              disabled={loading || !diagnosis.trim()}
              className="px-5 py-2 rounded-lg bg-teal-600 hover:bg-teal-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium transition-colors"
            >
              {loading ? 'Saving...' : editingId ? 'Update Examination' : 'Save Examination'}
            </button>
          </div>
        </div>
      )}

      {/* Previous Examinations */}
      <div>
        <h3 className="text-sm font-semibold text-slate-300 mb-3">Previous Examinations</h3>
        {entries.length === 0 ? (
          <p className="text-xs text-slate-600 bg-black/20 rounded-xl border border-white/5 p-8 text-center">
            No examinations recorded yet. Select a body region above to begin.
          </p>
        ) : (
          <div className="space-y-2">
            {entries.map(entry => (
              <div
                key={entry.id}
                className="bg-black/20 rounded-xl border border-white/5 p-4 flex flex-col sm:flex-row sm:items-center gap-3"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold text-teal-400 capitalize">{entry.body_region}</span>
                    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded border ${getSeverityStyle(entry.severity)}`}>
                      {entry.severity}
                    </span>
                    <span className="text-[10px] text-slate-600">{formatDate(entry.created_at)}</span>
                  </div>
                  <p className="text-xs text-slate-400">
                    <span className="text-slate-500 capitalize">{entry.injury_type.replace('_', ' ')}</span>
                    {entry.diagnosis && <> — {entry.diagnosis}</>}
                  </p>
                  {entry.treatment_plan && (
                    <p className="text-[11px] text-slate-600 mt-1 truncate">{entry.treatment_plan}</p>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleEdit(entry)}
                    className="text-xs text-slate-500 hover:text-teal-400 transition-colors px-2 py-1"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(entry.id)}
                    className="text-xs text-slate-500 hover:text-red-400 transition-colors px-2 py-1"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </PremiumCard>
  )
}
