'use client'

import dynamic from 'next/dynamic'

const ChartSkeleton = () => (
  <div className="flex items-center justify-center h-[400px]">
    <div className="h-64 w-full max-w-lg animate-pulse bg-white/5 rounded-2xl" />
  </div>
)

const DentalChart = dynamic(() => import('@/modules/dental/DentalChart'), { ssr: false, loading: ChartSkeleton })
const BodyChart = dynamic(() => import('@/modules/orthopedics/BodyChart'), { ssr: false, loading: ChartSkeleton })

const ObgynChart = dynamic(() => import('@/modules/obgyn/ObgynChart'), { ssr: false, loading: ChartSkeleton })
const VitalSigns = dynamic(() => import('@/modules/general/VitalSigns'), { ssr: false, loading: ChartSkeleton })
const DermatologyChart = dynamic(() => import('@/modules/dermatology/DermatologyChart'), { ssr: false, loading: ChartSkeleton })
const CardiologyChart = dynamic(() => import('@/modules/cardiology/CardiologyChart'), { ssr: false, loading: ChartSkeleton })
const NeurologyChart = dynamic(() => import('@/modules/neurology/NeurologyChart'), { ssr: false, loading: ChartSkeleton })
const UrologyChart = dynamic(() => import('@/modules/urology/UrologyChart'), { ssr: false, loading: ChartSkeleton })
const EndocrinologyChart = dynamic(() => import('@/modules/endocrinology/EndocrinologyChart'), { ssr: false, loading: ChartSkeleton })
const HematologyChart = dynamic(() => import('@/modules/hematology/HematologyChart'), { ssr: false, loading: ChartSkeleton })
const NephrologyChart = dynamic(() => import('@/modules/nephrology/NephrologyChart'), { ssr: false, loading: ChartSkeleton })
const PulmonologyChart = dynamic(() => import('@/modules/pulmonology/PulmonologyChart'), { ssr: false, loading: ChartSkeleton })
const OphthalmologyChart = dynamic(() => import('@/modules/ophthalmology/OphthalmologyChart'), { ssr: false, loading: ChartSkeleton })
const ENTChart = dynamic(() => import('@/modules/ent/ENTChart'), { ssr: false, loading: ChartSkeleton })
const PsychiatryChart = dynamic(() => import('@/modules/psychiatry/PsychiatryChart'), { ssr: false, loading: ChartSkeleton })
const PediatricsChart = dynamic(() => import('@/modules/pediatrics/PediatricsChart'), { ssr: false, loading: ChartSkeleton })
const GrowthTracker = dynamic(() => import('@/modules/pediatrics/GrowthTracker'), { ssr: false, loading: ChartSkeleton })
const InternalMedicineChart = dynamic(() => import('@/modules/internal-medicine/InternalMedicineChart'), { ssr: false, loading: ChartSkeleton })
const FamilyMedicineChart = dynamic(() => import('@/modules/family-medicine/FamilyMedicineChart'), { ssr: false, loading: ChartSkeleton })
const GeneralSurgeryChart = dynamic(() => import('@/modules/general-surgery/GeneralSurgeryChart'), { ssr: false, loading: ChartSkeleton })
const OncologyChart = dynamic(() => import('@/modules/oncology/OncologyChart'), { ssr: false, loading: ChartSkeleton })
const NeurosurgeryNotes = dynamic(() => import('@/modules/neurosurgery/NeurosurgeryNotes'), { ssr: false, loading: ChartSkeleton })
const NutritionPlan = dynamic(() => import('@/modules/nutrition/NutritionPlan'), { ssr: false, loading: ChartSkeleton })
const Physiotherapy = dynamic(() => import('@/modules/physical_therapy/Physiotherapy'), { ssr: false, loading: ChartSkeleton })
const SessionNotes = dynamic(() => import('@/modules/psychology/SessionNotes'), { ssr: false, loading: ChartSkeleton })
const GIExam = dynamic(() => import('@/modules/gastroenterology/GIExam'), { ssr: false, loading: ChartSkeleton })

export default function DynamicClinicalModule({ 
  clinicTypeCode, 
  patientId, 
  clinicId,
  locale,
  entitlements,
  initialData
}: { 
  clinicTypeCode: string, 
  patientId: string, 
  clinicId: string,
  locale: string,
  entitlements: any,
  initialData: any[]
}) {

  // Dynamically render modules based on clinic type
  switch (clinicTypeCode) {
    case 'dental':
      if (entitlements?.features?.includes('dental_module')) {
        return (
          <div className="h-full w-full overflow-y-auto">
            <DentalChart patientId={patientId} clinicId={clinicId} locale={locale} initialEntries={initialData} />
          </div>
        )
      }
      return <LockedModule name="Dental Chart" />
      
    case 'orthopedics':
      return (
        <div className="h-full w-full overflow-y-auto">
          <BodyChart patientId={patientId} clinicId={clinicId} locale={locale} initialEntries={initialData} />
        </div>
      )
      
    case 'ophthalmology':
      return (
        <div className="h-full w-full overflow-y-auto">
          <OphthalmologyChart patientId={patientId} clinicId={clinicId} locale={locale} initialEntries={initialData} />
        </div>
      )
    case 'obstetrics_gynecology':
      return (
        <div className="h-full w-full overflow-y-auto">
          <ObgynChart patientId={patientId} clinicId={clinicId} locale={locale} initialEntries={initialData} />
        </div>
      )
      
    case 'dermatology':
      return (
        <div className="h-full w-full overflow-y-auto">
          <DermatologyChart patientId={patientId} clinicId={clinicId} locale={locale} initialEntries={initialData} />
        </div>
      )
    case 'cardiology':
      return (
        <div className="h-full w-full overflow-y-auto">
          <CardiologyChart patientId={patientId} clinicId={clinicId} locale={locale} initialEntries={initialData} />
        </div>
      )
    case 'neurology':
      return (
        <div className="h-full w-full overflow-y-auto">
          <NeurologyChart patientId={patientId} clinicId={clinicId} locale={locale} initialEntries={initialData} />
        </div>
      )
    case 'urology':
      return (
        <div className="h-full w-full overflow-y-auto">
          <UrologyChart patientId={patientId} clinicId={clinicId} locale={locale} initialEntries={initialData} />
        </div>
      )
    case 'endocrinology':
      return (
        <div className="h-full w-full overflow-y-auto">
          <EndocrinologyChart patientId={patientId} clinicId={clinicId} locale={locale} initialEntries={initialData} />
        </div>
      )
    case 'hematology':
      return (
        <div className="h-full w-full overflow-y-auto">
          <HematologyChart patientId={patientId} clinicId={clinicId} locale={locale} initialEntries={initialData} />
        </div>
      )
    case 'nephrology':
      return (
        <div className="h-full w-full overflow-y-auto">
          <NephrologyChart patientId={patientId} clinicId={clinicId} locale={locale} initialEntries={initialData} />
        </div>
      )
    case 'pulmonology':
      return (
        <div className="h-full w-full overflow-y-auto">
          <PulmonologyChart patientId={patientId} clinicId={clinicId} locale={locale} initialEntries={initialData} />
        </div>
      )
    case 'ent':
      return (
        <div className="h-full w-full overflow-y-auto">
          <ENTChart patientId={patientId} clinicId={clinicId} locale={locale} initialEntries={initialData} />
        </div>
      )
    case 'psychiatry':
      return (
        <div className="h-full w-full overflow-y-auto">
          <PsychiatryChart patientId={patientId} clinicId={clinicId} locale={locale} initialEntries={initialData} />
        </div>
      )
    case 'pediatrics':
      return (
        <div className="h-full w-full overflow-y-auto space-y-6 pb-20">
          <PediatricsChart patientId={patientId} clinicId={clinicId} locale={locale} initialEntries={initialData} />
          <GrowthTracker patientId={patientId} clinicId={clinicId} locale={locale} initialEntries={initialData} />
        </div>
      )
    case 'internal_medicine':
      return (
        <div className="h-full w-full overflow-y-auto">
          <InternalMedicineChart patientId={patientId} clinicId={clinicId} locale={locale} initialEntries={initialData} />
        </div>
      )
    case 'family_medicine':
      return (
        <div className="h-full w-full overflow-y-auto">
          <FamilyMedicineChart patientId={patientId} clinicId={clinicId} locale={locale} initialEntries={initialData} />
        </div>
      )
    case 'general_surgery':
      return (
        <div className="h-full w-full overflow-y-auto">
          <GeneralSurgeryChart patientId={patientId} clinicId={clinicId} locale={locale} initialEntries={initialData} />
        </div>
      )
    case 'oncology':
      return (
        <div className="h-full w-full overflow-y-auto">
          <OncologyChart patientId={patientId} clinicId={clinicId} locale={locale} initialEntries={initialData} />
        </div>
      )
      
    case 'general_medicine':
    case 'general_practice':
      return (
        <div className="h-full w-full overflow-y-auto">
          <FamilyMedicineChart patientId={patientId} clinicId={clinicId} locale={locale} initialEntries={initialData} />
        </div>
      )
    case 'medical_center':
      return (
        <div className="h-full w-full overflow-y-auto space-y-6 pb-20">
          <VitalSigns patientId={patientId} clinicId={clinicId} locale={locale} initialEntries={initialData} />
          <InternalMedicineChart patientId={patientId} clinicId={clinicId} locale={locale} initialEntries={initialData} />
        </div>
      )
    case 'neurosurgery':
      return (
        <div className="h-full w-full overflow-y-auto">
          <NeurosurgeryNotes patientId={patientId} clinicId={clinicId} locale={locale} initialEntries={initialData} />
        </div>
      )
    case 'clinical_nutrition':
      return (
        <div className="h-full w-full overflow-y-auto">
          <NutritionPlan patientId={patientId} clinicId={clinicId} locale={locale} initialEntries={initialData} />
        </div>
      )
    case 'physical_therapy':
      return (
        <div className="h-full w-full overflow-y-auto">
          <Physiotherapy patientId={patientId} clinicId={clinicId} locale={locale} initialEntries={initialData} />
        </div>
      )
    case 'psychology':
      return (
        <div className="h-full w-full overflow-y-auto">
          <SessionNotes patientId={patientId} clinicId={clinicId} locale={locale} initialEntries={initialData} />
        </div>
      )
    case 'gastroenterology':
      return (
        <div className="h-full w-full overflow-y-auto">
          <GIExam patientId={patientId} clinicId={clinicId} locale={locale} initialEntries={initialData} />
        </div>
      )
    default:
      // If we don't have a specific chart yet for the JSON module, or it's just a raw note view:
      return (
        <div className="flex flex-col items-center justify-center h-[500px] text-center p-8 bg-black/20 border-t border-white/5">
          <h3 className="text-xl font-bold text-white mb-2">Module Loaded</h3>
          <p className="text-slate-400 max-w-sm">
            The {clinicTypeCode} module is active and reading JSON notes.
          </p>
        </div>
      )
  }
}

function LockedModule({ name }: { name: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-96 text-center p-8">
      <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4 border border-white/10">
        <span className="text-2xl">🔒</span>
      </div>
      <h3 className="text-xl font-bold text-white mb-2">{name} Locked</h3>
      <p className="text-slate-400 max-w-sm">
        This module requires a specialized add-on plan. Please upgrade your clinic subscription to access it.
      </p>
    </div>
  )
}

function _PlaceholderModule({ name, type }: { name: string, type: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-[500px] text-center p-8 bg-black/20 border-t border-white/5">
      <div className="w-20 h-20 bg-teal-500/10 rounded-full flex items-center justify-center mb-6 border border-teal-500/20">
        {type === 'orthopedics' ? <span className="text-3xl">🦴</span> : 
         type === 'ophthalmology' ? <span className="text-3xl">👁️</span> : 
         <span className="text-3xl">📋</span>}
      </div>
      <h3 className="text-2xl font-bold text-white mb-3">{name}</h3>
      <p className="text-slate-400 max-w-md mx-auto leading-relaxed">
        The interactive clinical workspace for {type} is currently being developed. 
        Soon you will be able to mark exact locations, track specific measurements, and record 
        specialized procedures directly in this view.
      </p>
    </div>
  )
}
