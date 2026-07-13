'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { updateMedicalHistory } from '../actions'

interface MedicalHistoryData {
  systemic_diseases?: string | null
  allergies?: string | null
  current_medications?: string | null
  notes?: string | null
}

export default function MedicalHistoryForm({ 
  clinicId, 
  patientId, 
  locale,
  initialData 
}: { 
  clinicId: string
  patientId: string
  locale: string
  initialData: MedicalHistoryData
}) {
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    try {
      await updateMedicalHistory(patientId, clinicId, locale, formData)
      alert('Medical history updated successfully')
    } catch (err) {
      console.error(err)
      alert('Failed to update medical history')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Medical History</CardTitle>
        <CardDescription>Update the patient&apos;s basic medical conditions.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4 max-w-3xl">
          <div className="space-y-2">
            <Label htmlFor="systemic_diseases">Systemic Diseases</Label>
            <Textarea 
              id="systemic_diseases" 
              name="systemic_diseases" 
              defaultValue={initialData?.systemic_diseases || ''} 
              placeholder="e.g. Diabetes, Hypertension..."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="allergies">Allergies</Label>
            <Textarea 
              id="allergies" 
              name="allergies" 
              defaultValue={initialData?.allergies || ''} 
              placeholder="e.g. Penicillin, Latex..."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="current_medications">Current Medications</Label>
            <Textarea 
              id="current_medications" 
              name="current_medications" 
              defaultValue={initialData?.current_medications || ''} 
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">General Medical Notes</Label>
            <Textarea 
              id="notes" 
              name="notes" 
              defaultValue={initialData?.notes || ''} 
            />
          </div>
          <Button type="submit" disabled={loading}>
            {loading ? 'Saving...' : 'Save Medical History'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
