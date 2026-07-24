'use client'

import { useState } from 'react'
import DynamicClinicalModule from './DynamicClinicalModule'
import FreeTextReport from '@/modules/general/FreeTextReport'

export default function ClinicalWorkspaceTabs({
  clinicTypeCode,
  clinicTypeName,
  isAr,
  patientId,
  clinicId,
  locale,
  entitlements,
  clinicalData,
  freeNotesData
}: {
  clinicTypeCode: string
  clinicTypeName: string
  isAr: boolean
  patientId: string
  clinicId: string
  locale: string
  entitlements: any
  clinicalData: any[]
  freeNotesData: any[]
}) {
  const [activeTab, setActiveTab] = useState<'module' | 'free'>('module')

  return (
    <div className="flex flex-col h-full">
      <div className="border-b border-white/5 px-4 flex items-center gap-1">
        <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-emerald-400 mr-4">
          {clinicTypeName} {isAr ? 'مساحة العمل السريرية' : 'Clinical Workspace'}
        </h2>
        <div className="flex gap-1 ml-auto">
          <button
            onClick={() => setActiveTab('module')}
            className={`px-3 py-2.5 text-sm font-medium transition-colors rounded-t-lg ${
              activeTab === 'module'
                ? 'text-teal-300 border-b-2 border-teal-400'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            {isAr ? 'المساحة السريرية' : 'Clinical Module'}
          </button>
          <button
            onClick={() => setActiveTab('free')}
            className={`px-3 py-2.5 text-sm font-medium transition-colors rounded-t-lg ${
              activeTab === 'free'
                ? 'text-teal-300 border-b-2 border-teal-400'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            {isAr ? 'تقرير حر' : 'Free Notes'}
          </button>
        </div>
      </div>

      <div className="flex-1 relative overflow-hidden">
        {activeTab === 'module' ? (
          <div className="h-full w-full overflow-y-auto">
            <DynamicClinicalModule
              clinicTypeCode={clinicTypeCode}
              patientId={patientId}
              clinicId={clinicId}
              locale={locale}
              entitlements={entitlements}
              initialData={clinicalData}
            />
          </div>
        ) : (
          <div className="h-full w-full overflow-y-auto">
            <FreeTextReport
              patientId={patientId}
              clinicId={clinicId}
              locale={locale}
              initialData={freeNotesData}
            />
          </div>
        )}
      </div>
    </div>
  )
}
