'use client'

import { useState, useRef } from 'react'
import { Upload, X, Image, Loader2 } from 'lucide-react'
import { saveClinicLogo } from './actions'

export default function LogoUpload({
  clinicId,
  locale,
  currentLogoUrl,
}: {
  clinicId: string
  locale: string
  currentLogoUrl?: string | null
}) {
  const [logoUrl, setLogoUrl] = useState(currentLogoUrl || '')
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState(currentLogoUrl || '')
  const fileRef = useRef<HTMLInputElement>(null)
  const isAr = locale === 'ar'

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 2 * 1024 * 1024) {
      alert(isAr ? 'الحجم الأقصى 2 ميجا' : 'Max size 2MB')
      return
    }

    setUploading(true)
    try {
      const reader = new FileReader()
      reader.onload = async () => {
        const dataUrl = reader.result as string
        setPreview(dataUrl)
        await saveClinicLogo(clinicId, dataUrl)
        setLogoUrl(dataUrl)
      }
      reader.readAsDataURL(file)
    } catch (err) {
      console.error('Logo upload failed:', err)
      alert(isAr ? 'فشل الرفع' : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const handleRemove = async () => {
    setPreview('')
    setLogoUrl('')
    if (fileRef.current) fileRef.current.value = ''
    await saveClinicLogo(clinicId, '')
  }

  return (
    <div className="flex items-center gap-4">
      {/* Preview */}
      <div
        className="relative w-20 h-20 rounded-xl overflow-hidden flex items-center justify-center shrink-0"
        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
      >
        {preview ? (
          <>
            <img src={preview} alt="Clinic Logo" className="w-full h-full object-contain p-1" />
            <button
              onClick={handleRemove}
              className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-black/60 flex items-center justify-center hover:bg-red-500/80 transition-colors"
            >
              <X className="w-3 h-3 text-white" />
            </button>
          </>
        ) : (
          <Image className="w-8 h-8 text-slate-600" />
        )}
      </div>

      {/* Upload button */}
      <div>
        <input
          ref={fileRef}
          type="file"
          accept="image/png,image/jpeg,image/svg+xml"
          className="hidden"
          onChange={handleFileChange}
        />
        <button
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all bg-white/[0.04] hover:bg-white/[0.07] text-slate-300 border border-white/[0.07] disabled:opacity-50"
        >
          {uploading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Upload className="w-4 h-4" />
          )}
          {isAr ? 'رفع شعار العيادة' : 'Upload Clinic Logo'}
        </button>
        <p className="text-[11px] text-slate-500 mt-1">
          {isAr ? 'PNG/JPG — حد أقصى 2MB — يظهر في الروشتات والفواتير' : 'PNG/JPG — Max 2MB — Shows on prescriptions & receipts'}
        </p>
      </div>
    </div>
  )
}
