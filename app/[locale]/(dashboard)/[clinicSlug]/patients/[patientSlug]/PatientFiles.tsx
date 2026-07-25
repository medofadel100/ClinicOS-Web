'use client'

import { useState, useRef, useEffect } from 'react'
import { toast } from 'sonner'
import { uploadPatientFile } from '../actions'
import {
  Upload, Camera, X, FileImage, FileText, Pill,
  Trash2, Eye, Loader2, Image as ImageIcon, Folder, Download
} from 'lucide-react'

interface PatientFileData {
  id: string
  file_url: string
  file_name?: string
  file_size?: number
  mime_type?: string
  category: string
  storage_provider?: string
  gdrive_folder_type?: string
  uploaded_via: string
  review_status: string
  created_at: string
  google_drive_web_view_link?: string
}

type FolderTab = 'xray' | 'lab' | 'prescription'

const FOLDER_CONFIG: Record<FolderTab, { label: string; labelAr: string; icon: typeof FileImage; accept: string }> = {
  xray: { label: 'X-Rays', labelAr: 'أشعة', icon: FileImage, accept: 'image/*,.pdf,.dcm' },
  lab: { label: 'Lab Results', labelAr: 'تحاليل', icon: FileText, accept: 'image/*,.pdf' },
  prescription: { label: 'Prescriptions', labelAr: 'روشتات', icon: Pill, accept: 'image/*,.pdf' },
}

function formatFileSize(bytes?: number): string {
  if (!bytes || bytes === 0) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
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
  const [activeTab, setActiveTab] = useState<FolderTab>('xray')
  const [dragOver, setDragOver] = useState(false)
  const [cameraMode, setCameraMode] = useState(false)
  const [previewFile, setPreviewFile] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)

  const isAr = locale === 'ar'

  const files = initialData.filter(f => {
    if (f.gdrive_folder_type) return f.gdrive_folder_type === activeTab
    if (f.category === 'xray') return activeTab === 'xray'
    if (f.category === 'lab') return activeTab === 'lab'
    if (f.category === 'prescription') return activeTab === 'prescription'
    return false
  })

  const sortedFiles = [...files].sort((a, b) =>
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )

  // Cleanup camera stream
  useEffect(() => {
    return () => {
      if (stream) stream.getTracks().forEach(t => t.stop())
    }
  }, [stream])

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      })
      setStream(mediaStream)
      setCameraMode(true)
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
      }
    } catch {
      toast.error(isAr ? 'لا يمكن الوصول للكاميرا' : 'Cannot access camera')
    }
  }

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return
    const video = videoRef.current
    const canvas = canvasRef.current
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.drawImage(video, 0, 0)
    canvas.toBlob((blob) => {
      if (!blob) return
      const file = new File([blob], `capture_${Date.now()}.jpg`, { type: 'image/jpeg' })
      uploadFile(file)
      stopCamera()
    }, 'image/jpeg', 0.9)
  }

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(t => t.stop())
      setStream(null)
    }
    setCameraMode(false)
  }

  const uploadFile = async (file: File) => {
    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('category', activeTab)
      await uploadPatientFile(patientId, clinicId, locale, formData)
      toast.success(isAr ? 'تم رفع الملف بنجاح' : 'File uploaded successfully')
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Upload failed'
      if (msg.includes('quota')) {
        toast.error(isAr ? 'تم تجاوز حد التخزين' : 'Storage quota exceeded')
      } else {
        toast.error(isAr ? 'فشل رفع الملف' : 'Failed to upload file')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) uploadFile(file)
    e.target.value = ''
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) uploadFile(file)
  }

  const config = FOLDER_CONFIG[activeTab]
  const Icon = config.icon

  return (
    <div className="space-y-6">
      {/* Folder Tabs */}
      <div className="flex gap-2 p-1 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
        {(Object.keys(FOLDER_CONFIG) as FolderTab[]).map(tab => {
          const cfg = FOLDER_CONFIG[tab]
          const TabIcon = cfg.icon
          const count = initialData.filter(f => {
            if (f.gdrive_folder_type) return f.gdrive_folder_type === tab
            if (tab === 'xray') return f.category === 'xray'
            if (tab === 'lab') return f.category === 'lab'
            return f.category === 'prescription'
          }).length
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab
                  ? 'bg-primary/15 text-primary border border-primary/20'
                  : 'text-slate-400 hover:text-slate-300 hover:bg-white/5'
              }`}
            >
              <TabIcon className="w-4 h-4" />
              <span className="hidden sm:inline">{isAr ? cfg.labelAr : cfg.label}</span>
              {count > 0 && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${activeTab === tab ? 'bg-primary/20 text-primary' : 'bg-white/10 text-slate-500'}`}>
                  {count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Camera Mode */}
      {cameraMode && (
        <div className="rounded-xl overflow-hidden" style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)' }}>
          <video ref={videoRef} autoPlay playsInline className="w-full max-h-96 object-contain" />
          <canvas ref={canvasRef} className="hidden" />
          <div className="flex items-center justify-center gap-4 p-4">
            <button
              onClick={capturePhoto}
              className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold bg-primary text-black hover:bg-primary/90 transition-all"
            >
              <Camera className="w-4 h-4" />
              {isAr ? 'تصوير' : 'Capture'}
            </button>
            <button
              onClick={stopCamera}
              className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold bg-white/10 text-slate-300 hover:bg-white/15 transition-all"
            >
              <X className="w-4 h-4" />
              {isAr ? 'إلغاء' : 'Cancel'}
            </button>
          </div>
        </div>
      )}

      {/* Upload Area */}
      {!cameraMode && (
        <div
          className={`relative rounded-xl p-6 transition-all cursor-pointer ${
            dragOver ? 'border-primary bg-primary/5' : ''
          }`}
          style={{
            background: dragOver ? 'rgba(0,212,170,0.05)' : 'rgba(255,255,255,0.02)',
            border: `2px dashed ${dragOver ? 'rgba(0,212,170,0.4)' : 'rgba(255,255,255,0.08)'}`,
          }}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={config.accept}
            className="hidden"
            onChange={handleFileSelect}
          />
          <div className="flex flex-col items-center gap-3 text-center">
            {loading ? (
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            ) : (
              <Icon className="w-8 h-8 text-slate-500" />
            )}
            <div>
              <p className="text-sm text-slate-300">
                {loading
                  ? (isAr ? 'جاري الرفع...' : 'Uploading...')
                  : (isAr ? `اسحب ملف هنا أو انقر لاختيار` : 'Drop file here or click to browse')
                }
              </p>
              <p className="text-xs text-slate-500 mt-1">
                {isAr ? `ملفات ${config.labelAr}` : `${config.label} files`}
                {' • '}Max 50MB
              </p>
            </div>
            <div className="flex items-center gap-3 mt-2">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  fileInputRef.current?.click()
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium bg-white/5 text-slate-300 hover:bg-white/10 transition-all"
              >
                <Upload className="w-3.5 h-3.5" />
                {isAr ? 'اختيار ملف' : 'Browse'}
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  startCamera()
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium bg-primary/10 text-primary hover:bg-primary/15 transition-all"
              >
                <Camera className="w-3.5 h-3.5" />
                {isAr ? 'تصوير بالكاميرا' : 'Take Photo'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* File List */}
      <div className="space-y-2">
        {sortedFiles.length === 0 ? (
          <div className="text-center py-12">
            <Folder className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-sm text-slate-500">
              {isAr ? `لا توجد ملفات في ${config.labelAr}` : `No ${config.label} files yet`}
            </p>
          </div>
        ) : (
          sortedFiles.map((file, index) => {
            const fileDate = new Date(file.created_at)
            const dateStr = fileDate.toLocaleDateString()
            return (
              <div
                key={file.id}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/[0.03] transition-colors group"
                style={{ border: '1px solid rgba(255,255,255,0.04)' }}
              >
                {/* Serial Number */}
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/5 text-xs font-bold text-slate-500 shrink-0">
                  {sortedFiles.length - index}
                </div>

                {/* File icon */}
                <div className="flex items-center justify-center w-10 h-10 rounded-lg shrink-0"
                  style={{ background: 'rgba(0,212,170,0.08)', border: '1px solid rgba(0,212,170,0.15)' }}
                >
                  <ImageIcon className="w-5 h-5 text-primary" />
                </div>

                {/* File info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-200 truncate font-medium">
                    {file.file_name || `${config.label}_${fileDate.toISOString().split('T')[0]}`}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                    <span>{dateStr}</span>
                    {file.file_size ? <span>• {formatFileSize(file.file_size)}</span> : null}
                    <span>•</span>
                    <span className={file.storage_provider === 'gdrive' ? 'text-emerald-500' : 'text-blue-500'}>
                      {file.storage_provider === 'gdrive' ? 'Drive' : 'Cloud'}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => setPreviewFile(file.google_drive_web_view_link || file.file_url)}
                    className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-white/10 text-slate-400 transition-colors"
                    title={isAr ? 'عرض' : 'Preview'}
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => window.open(file.google_drive_web_view_link || file.file_url, '_blank')}
                    className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-white/10 text-slate-400 transition-colors"
                    title={isAr ? 'تحميل' : 'Download'}
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* File Preview Modal */}
      {previewFile && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={() => setPreviewFile(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] w-full mx-4" onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setPreviewFile(null)}
              className="absolute -top-12 right-0 flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            <iframe
              src={previewFile}
              className="w-full h-[80vh] rounded-xl border border-white/10"
              title="File Preview"
            />
          </div>
        </div>
      )}
    </div>
  )
}
