'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, Save, Trash2, FileText, Clock } from 'lucide-react'

interface FreeNote {
  id: string
  title: string
  content: string
  created_at: string
}

export default function FreeTextReport({
  patientId,
  clinicId,
  locale,
  initialData
}: {
  patientId: string
  clinicId: string
  locale: string
  initialData: any[]
}) {
  const isAr = locale === 'ar'
  const [notes, setNotes] = useState<FreeNote[]>(initialData || [])
  const [editing, setEditing] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [saving, setSaving] = useState(false)
  const [showNew, setShowNew] = useState(false)

  const handleSave = async () => {
    if (!content.trim()) return
    setSaving(true)
    try {
      const res = await fetch('/api/clinical/free-note', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patient_id: patientId,
          clinic_id: clinicId,
          title: title || (isAr ? 'تقرير حر' : 'Free Note'),
          content,
          note_id: editing || undefined
        })
      })
      if (!res.ok) throw new Error('Failed')
      const saved = await res.json()

      if (editing) {
        setNotes(prev => prev.map(n => n.id === editing ? { ...n, title: title || n.title, content } : n))
      } else {
        setNotes(prev => [{ id: saved.id, title: title || (isAr ? 'تقرير حر' : 'Free Note'), content, created_at: new Date().toISOString() }, ...prev])
      }
      setTitle('')
      setContent('')
      setEditing(null)
      setShowNew(false)
    } catch (err) {
      console.error(err)
      alert(isAr ? 'فشل في الحفظ' : 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm(isAr ? 'هل أنت متأكد من الحذف؟' : 'Are you sure you want to delete?')) return
    try {
      await fetch('/api/clinical/free-note', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note_id: id, patient_id: patientId, clinic_id: clinicId })
      })
      setNotes(prev => prev.filter(n => n.id !== id))
    } catch (err) {
      console.error(err)
    }
  }

  const handleEdit = (note: FreeNote) => {
    setEditing(note.id)
    setTitle(note.title)
    setContent(note.content)
    setShowNew(true)
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-300">
          {isAr ? 'التقارير الحرة' : 'Free Notes'}
        </h3>
        {!showNew && (
          <Button size="sm" onClick={() => { setShowNew(true); setEditing(null); setTitle(''); setContent('') }}>
            <Plus className="w-4 h-4 mr-1" />
            {isAr ? 'تقرير جديد' : 'New Note'}
          </Button>
        )}
      </div>

      {showNew && (
        <div className="rounded-xl p-4 space-y-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="space-y-2">
            <Label className="text-xs text-slate-500">{isAr ? 'العنوان' : 'Title'}</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={isAr ? 'مثال: ملاحظات الكشف' : 'e.g. Examination Notes'}
              className="text-sm"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs text-slate-500">{isAr ? 'المحتوى' : 'Content'}</Label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={isAr ? 'اكتب التقرير هنا...' : 'Write your report here...'}
              rows={12}
              className="text-sm resize-y font-mono leading-relaxed"
            />
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="ghost" size="sm" onClick={() => { setShowNew(false); setEditing(null); setTitle(''); setContent('') }}>
              {isAr ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button size="sm" onClick={handleSave} disabled={saving || !content.trim()}>
              <Save className="w-4 h-4 mr-1" />
              {saving ? (isAr ? 'جاري الحفظ...' : 'Saving...') : (isAr ? 'حفظ' : 'Save')}
            </Button>
          </div>
        </div>
      )}

      {notes.length === 0 && !showNew ? (
        <div className="text-center py-12">
          <FileText className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <p className="text-sm text-slate-500">
            {isAr ? 'لا توجد تقارير بعد. اضغط "تقرير جديد" للبدء.' : 'No notes yet. Click "New Note" to start.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {notes.map((note) => (
            <div
              key={note.id}
              className="rounded-xl p-4 group hover:bg-white/[0.02] transition-colors"
              style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="text-sm font-semibold text-slate-200">{note.title}</h4>
                  <div className="flex items-center gap-1.5 mt-1">
                    <Clock className="w-3 h-3 text-slate-600" />
                    <span className="text-[11px] text-slate-600">
                      {new Date(note.created_at).toLocaleDateString(isAr ? 'ar-EG' : 'en-US', {
                        year: 'numeric', month: 'short', day: 'numeric',
                        hour: '2-digit', minute: '2-digit'
                      })}
                    </span>
                  </div>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={() => handleEdit(note)}>
                    {isAr ? 'تعديل' : 'Edit'}
                  </Button>
                  <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-red-400 hover:text-red-300" onClick={() => handleDelete(note.id)}>
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
              <pre className="text-sm text-slate-400 whitespace-pre-wrap font-mono leading-relaxed">
                {note.content}
              </pre>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
