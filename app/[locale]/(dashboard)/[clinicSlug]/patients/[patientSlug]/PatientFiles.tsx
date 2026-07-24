'use client'

import { useState } from 'react'
import { PremiumCard } from '@/components/layout/PageComponents'
import { uploadPatientFile } from '../actions'
import { Download } from 'lucide-react'

interface PatientFileData {
  id: string
  file_url: string
  category: string
  uploaded_via: string
  review_status: string
  created_at: string
}

export default function PatientFiles({ 
  clinicId, 
  patientId, 
  locale,
  initialData 
}: { 
  clinicId: string
  patientId: string
  locale: string
  initialData: PatientFileData[]
}) {
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    try {
      await uploadPatientFile(patientId, clinicId, locale, formData)
      alert('File uploaded successfully')
      // Reset form
      e.currentTarget.reset()
    } catch (err) {
      console.error(err)
      alert('Failed to upload file')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <PremiumCard>
        <div className="mb-5 pb-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <h2 className="text-base font-semibold text-slate-200">Upload File</h2>
          <p className="text-sm text-slate-500 mt-0.5">Upload an X-Ray, prescription, or other document.</p>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-end gap-4 max-w-2xl">
          <div className="space-y-2 flex-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400" htmlFor="category">Category</label>
            <select id="category" name="category" className="w-full h-10 px-3 rounded-lg text-sm bg-black/20 border border-white/10 text-white focus:outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/50 transition-all">
              <option value="xray">X-Ray</option>
              <option value="prescription">Prescription</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div className="space-y-2 flex-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400" htmlFor="file">File</label>
            <input 
              id="file" 
              name="file" 
              type="file" 
              required 
              className="w-full h-10 px-3 py-1.5 rounded-lg text-sm bg-black/20 border border-white/10 text-slate-300 focus:outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/50 transition-all file:bg-white/10 file:border-0 file:rounded file:px-2 file:py-1 file:text-slate-300 file:mr-3 hover:file:bg-white/20"
            />
          </div>
          <button 
            type="submit" 
            disabled={loading} 
            className="flex items-center gap-2 h-10 px-6 rounded-lg text-sm font-semibold transition-all disabled:opacity-50 w-full sm:w-auto"
            style={{ background: '#00d4aa', color: '#0a0f1e' }}
          >
            {loading ? 'Uploading...' : 'Upload'}
          </button>
        </form>
      </PremiumCard>

      <PremiumCard>
        <div className="mb-5 pb-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <h2 className="text-base font-semibold text-slate-200">Patient Files</h2>
          <p className="text-sm text-slate-500 mt-0.5">Documents attached to this patient&apos;s record.</p>
        </div>
        <div>
          {initialData.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-4">No files uploaded yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {initialData.map(file => (
                <div key={file.id} className="flex items-center justify-between p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div>
                    <div className="font-semibold text-slate-200 capitalize">{file.category}</div>
                    <div className="text-xs text-slate-400 flex flex-wrap gap-x-2 gap-y-1 mt-1.5">
                      <span>Via {file.uploaded_via}</span>
                      <span>•</span>
                      <span className={file.review_status === 'pending' ? 'text-amber-400' : 'text-slate-400'}>{file.review_status}</span>
                      <span>•</span>
                      <span>{new Date(file.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <button 
                    onClick={(e) => {
                      e.preventDefault();
                      window.open(file.file_url, '_blank');
                    }}
                    className="flex items-center justify-center w-10 h-10 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </PremiumCard>
    </div>
  )
}
