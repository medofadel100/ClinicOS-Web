'use client'

import { useState } from 'react'
import { Users, Plus, Loader2, ChevronDown, Check } from 'lucide-react'
import { toast } from 'sonner'
import { createTeam, deleteTeam, getClinicTeams, setTeamMembers } from './actions'

type Team = {
  id: string
  name: string
  description?: string | null
  created_at: string
  team_members: {
    id: string
    staff_member_id: string
    staff_members?: { id: string; full_name: string } | { id: string; full_name: string }[] | null
  }[]
}

export default function TeamsManager({
  clinicId,
  isAr,
  canManage,
  staff,
  initialTeams,
}: {
  clinicId: string
  isAr: boolean
  canManage: boolean
  staff: { id: string; full_name: string }[]
  initialTeams: Team[]
}) {
  const [teams, setTeams] = useState<Team[]>(initialTeams)
  const [creating, setCreating] = useState(false)
  const [newName, setNewName] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [expanded, setExpanded] = useState<string | null>(null)
  const [editing, setEditing] = useState<Team | null>(null)
  const [selected, setSelected] = useState<string[]>([])
  const [busy, setBusy] = useState(false)

  const refresh = async () => {
    try {
      const data = await getClinicTeams(clinicId)
      setTeams(data)
    } catch {
      toast.error(isAr ? 'تعذر تحديث الفرق' : 'Failed to refresh teams')
    }
  }

  const handleCreate = async () => {
    if (!newName.trim()) return
    setBusy(true)
    try {
      await createTeam(clinicId, newName.trim(), newDesc.trim() || undefined)
      setNewName('')
      setNewDesc('')
      setCreating(false)
      toast.success(isAr ? 'تم إنشاء الفريق' : 'Team created')
      await refresh()
    } catch {
      toast.error(isAr ? 'فشل إنشاء الفريق' : 'Failed to create team')
    } finally {
      setBusy(false)
    }
  }

  const handleDelete = async (team: Team) => {
    if (!window.confirm(isAr ? `حذف فريق "${team.name}"؟` : `Delete team "${team.name}"?`)) return
    setBusy(true)
    try {
      await deleteTeam(clinicId, team.id)
      toast.success(isAr ? 'تم حذف الفريق' : 'Team deleted')
      setExpanded(null)
      setEditing(null)
      await refresh()
    } catch {
      toast.error(isAr ? 'فشل حذف الفريق' : 'Failed to delete team')
    } finally {
      setBusy(false)
    }
  }

  const memberNames = (t: Team) =>
    (Array.isArray(t.team_members) ? t.team_members : [])
      .map(m => (Array.isArray(m.staff_members) ? m.staff_members[0]?.full_name : m.staff_members?.full_name))
      .filter(Boolean)

  const openEditor = (t: Team) => {
    setEditing(t)
    setSelected(
      (Array.isArray(t.team_members) ? t.team_members : [])
        .map(m => m.staff_member_id)
        .filter(Boolean)
    )
    setExpanded(null)
  }

  const handleSaveMembers = async () => {
    if (!editing) return
    setBusy(true)
    try {
      await setTeamMembers(clinicId, editing.id, selected)
      toast.success(isAr ? 'تم تحديث الأعضاء' : 'Members updated')
      setEditing(null)
      await refresh()
    } catch {
      toast.error(isAr ? 'فشل تحديث الأعضاء' : 'Failed to update members')
    } finally {
      setBusy(false)
    }
  }

  const toggleMember = (id: string) => {
    setSelected(prev => (prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]))
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-base font-semibold text-slate-200">
            {isAr ? 'فرق العمل' : 'Staff Teams'}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {isAr
              ? 'جمّع الموظفين في فرق (مناوبات تمريض، استقبال، فنيون...).'
              : 'Group staff into teams (nursing shifts, reception, technicians...).'}
          </p>
        </div>
        {canManage && (
          <button
            onClick={() => setCreating(v => !v)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-violet-500/15 hover:bg-violet-500/25 text-violet-300 border border-violet-500/25"
          >
            <Plus className="w-3.5 h-3.5" />
            {isAr ? 'فريق جديد' : 'New Team'}
          </button>
        )}
      </div>

      {creating && canManage && (
        <div className="border border-white/10 rounded-xl bg-white/[0.03] p-4 space-y-3">
          <input
            value={newName}
            onChange={e => setNewName(e.target.value)}
            placeholder={isAr ? 'اسم الفريق (مثال: مناوبة الصباح)' : 'Team name (e.g. Morning shift)'}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-violet-400/50"
          />
          <input
            value={newDesc}
            onChange={e => setNewDesc(e.target.value)}
            placeholder={isAr ? 'وصف (اختياري)' : 'Description (optional)'}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-violet-400/50"
          />
          <div className="flex gap-2">
            <button
              onClick={handleCreate}
              disabled={busy || !newName.trim()}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-violet-500 text-white hover:bg-violet-400 disabled:opacity-50"
            >
              {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
              {isAr ? 'إنشاء' : 'Create'}
            </button>
            <button
              onClick={() => setCreating(false)}
              className="px-3 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-200"
            >
              {isAr ? 'إلغاء' : 'Cancel'}
            </button>
          </div>
        </div>
      )}

      {teams.length === 0 ? (
        <div className="text-center py-10 text-sm text-slate-500 border border-dashed border-white/10 rounded-xl">
          {isAr ? 'لا توجد فرق بعد. أنشئ فريقاً لتنظيم الموظفين.' : 'No teams yet. Create one to organize staff.'}
        </div>
      ) : (
        <div className="space-y-2">
          {teams.map(t => (
            <div key={t.id} className="border border-white/10 rounded-xl bg-white/[0.02] overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3">
                <button
                  onClick={() => canManage ? (expanded === t.id ? setExpanded(null) : setExpanded(t.id)) : undefined}
                  className="flex items-center gap-2 flex-1 min-w-0 text-left"
                >
                  <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center shrink-0">
                    <Users className="w-4 h-4 text-violet-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-200 truncate">{t.name}</p>
                    {t.description ? (
                      <p className="text-[11px] text-slate-500 truncate">{t.description}</p>
                    ) : null}
                  </div>
                  <span className="text-[11px] text-slate-500 shrink-0">
                    {memberNames(t).length} {isAr ? 'عضو' : 'members'}
                  </span>
                </button>
                {canManage && (
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => openEditor(t)}
                      className="px-2 py-1.5 rounded-lg text-[11px] text-slate-400 hover:text-teal-300 hover:bg-white/5"
                    >
                      {isAr ? 'تعديل الأعضاء' : 'Manage'}
                    </button>
                    <button
                      onClick={() => expanded === t.id ? setExpanded(null) : setExpanded(t.id)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-white/5"
                    >
                      <ChevronDown className={`w-4 h-4 transition-transform ${expanded === t.id ? 'rotate-180' : ''}`} />
                    </button>
                  </div>
                )}
              </div>

              {canManage && expanded === t.id && (
                <div className="px-4 pb-4">
                  {memberNames(t).length === 0 ? (
                    <p className="text-xs text-slate-500">{isAr ? 'لا يوجد أعضاء بعد.' : 'No members yet.'}</p>
                  ) : (
                    <div className="flex flex-wrap gap-1.5">
                      {memberNames(t).map((n, i) => (
                        <span key={i} className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-white/5 text-[11px] text-slate-300 border border-white/10">
                          {n}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => openEditor(t)}
                      className="px-3 py-1.5 rounded-lg text-[11px] font-medium text-teal-300 bg-teal-500/15 hover:bg-teal-500/25 border border-teal-500/25"
                    >
                      {isAr ? 'تعديل الأعضاء' : 'Manage Members'}
                    </button>
                    <button
                      onClick={() => handleDelete(t)}
                      disabled={busy}
                      className="px-3 py-1.5 rounded-lg text-[11px] font-medium text-red-400 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 disabled:opacity-50"
                    >
                      {isAr ? 'حذف الفريق' : 'Delete Team'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Member editor */}
      {canManage && editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0b1220] p-5 space-y-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-200">
                {isAr ? 'أعضاء الفريق' : 'Team Members'} — {editing.name}
              </h3>
              <button onClick={() => setEditing(null)} className="text-slate-500 hover:text-slate-300">✕</button>
            </div>
            <div className="space-y-1">
              {staff.length === 0 ? (
                <p className="text-sm text-slate-500">{isAr ? 'لا يوجد موظفون بعد.' : 'No staff available.'}</p>
              ) : staff.map(s => (
                <button
                  key={s.id}
                  onClick={() => toggleMember(s.id)}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg border border-white/10 hover:bg-white/5 transition-colors"
                  style={selected.includes(s.id) ? { borderColor: 'rgba(45,212,191,0.4)', background: 'rgba(45,212,191,0.06)' } : undefined}
                >
                  <span className="text-sm text-slate-200">{s.full_name}</span>
                  {selected.includes(s.id) && <Check className="w-4 h-4 text-teal-400" />}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleSaveMembers}
                disabled={busy}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-teal-500 text-white hover:bg-teal-400 disabled:opacity-50"
              >
                {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                {isAr ? 'حفظ' : 'Save'}
              </button>
              <button onClick={() => setEditing(null)} className="px-3 py-2 rounded-lg text-xs text-slate-400 hover:text-slate-200">
                {isAr ? 'إلغاء' : 'Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
