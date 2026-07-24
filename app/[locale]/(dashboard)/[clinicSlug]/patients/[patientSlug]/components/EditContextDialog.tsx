'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Edit2 } from "lucide-react"
import MedicalHistoryForm from '../MedicalHistoryForm'

export default function EditContextDialog({
  clinicId,
  locale,
  patientId,
  initialData
}: {
  clinicId: string
  locale: string
  patientId: string
  initialData: any
}) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="icon" variant="ghost" className="w-6 h-6 text-slate-400 hover:text-white hover:bg-white/10 rounded-full">
          <Edit2 className="w-3.5 h-3.5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] bg-[#0B1120] border-white/10 text-slate-200 p-0 overflow-hidden">
        <MedicalHistoryForm 
          clinicId={clinicId}
          locale={locale}
          patientId={patientId}
          initialData={initialData}
        />
      </DialogContent>
    </Dialog>
  )
}
