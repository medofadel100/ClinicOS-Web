'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { uploadPatientFile } from '../actions'

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
      <Card>
        <CardHeader>
          <CardTitle>Upload File</CardTitle>
          <CardDescription>Upload an X-Ray, prescription, or other document.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-end gap-4 max-w-2xl">
            <div className="space-y-2 flex-1">
              <Label htmlFor="category">Category</Label>
              <select id="category" name="category" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                <option value="xray">X-Ray</option>
                <option value="prescription">Prescription</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="space-y-2 flex-1">
              <Label htmlFor="file">File</Label>
              <Input id="file" name="file" type="file" required />
            </div>
            <Button type="submit" disabled={loading} className="w-full sm:w-auto">
              {loading ? 'Uploading...' : 'Upload'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Patient Files</CardTitle>
          <CardDescription>Documents attached to this patient&apos;s record.</CardDescription>
        </CardHeader>
        <CardContent>
          {initialData.length === 0 ? (
            <p className="text-sm text-muted-foreground">No files uploaded yet.</p>
          ) : (
            <div className="space-y-3">
              {initialData.map(file => (
                <div key={file.id} className="flex items-center justify-between p-3 border rounded-md">
                  <div>
                    <div className="font-medium capitalize">{file.category}</div>
                    <div className="text-sm text-muted-foreground flex gap-2 mt-1">
                      <span>Source: {file.uploaded_via}</span>
                      <span>• Status: {file.review_status}</span>
                      <span>• {new Date(file.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={(e) => {
                      e.preventDefault()
                      alert(`Path: ${file.file_url}`)
                    }}
                  >
                    View File
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
