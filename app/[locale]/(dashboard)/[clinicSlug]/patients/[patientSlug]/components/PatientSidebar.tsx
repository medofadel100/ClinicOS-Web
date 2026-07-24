import { PremiumCard } from '@/components/layout/PageComponents'
import { Activity, AlertTriangle, Pill, Stethoscope, FileText, Calendar, Wallet } from 'lucide-react'
import Link from 'next/link'

export default function PatientSidebar({ patient, medicalHistory, locale, clinicSlug }: { patient: any, medicalHistory: any, locale: string, clinicSlug: string }) {
  const isAr = locale === 'ar'
  
  return (
    <div className="space-y-6">
      {/* Medical Context */}
      <PremiumCard className="p-5">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5 text-teal-400" />
          {isAr ? 'السياق الطبي' : 'Medical Context'}
        </h3>
        
        <div className="space-y-5">
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
              {isAr ? 'الحساسية' : 'Allergies'}
            </div>
            {medicalHistory.allergies ? (
              <div className="flex flex-wrap gap-2">
                {medicalHistory.allergies.split(',').map((a: string) => (
                  <span key={a} className="px-2.5 py-1 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-md text-xs font-medium">
                    {a.trim()}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-400">{isAr ? 'لا توجد حساسية معروفة' : 'No known allergies'}</p>
            )}
          </div>

          <div className="h-px bg-white/5" />

          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Stethoscope className="w-3.5 h-3.5 text-orange-400" />
              {isAr ? 'الأمراض المزمنة' : 'Chronic Conditions'}
            </div>
            {medicalHistory.systemic_diseases ? (
              <p className="text-sm text-slate-300 leading-relaxed">
                {medicalHistory.systemic_diseases}
              </p>
            ) : (
              <p className="text-sm text-slate-400">{isAr ? 'لم يتم الإبلاغ' : 'None reported'}</p>
            )}
          </div>

          <div className="h-px bg-white/5" />

          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Pill className="w-3.5 h-3.5 text-violet-400" />
              {isAr ? 'الأدوية الحالية' : 'Current Medications'}
            </div>
            {medicalHistory.current_medications ? (
              <p className="text-sm text-slate-300 leading-relaxed">
                {medicalHistory.current_medications}
              </p>
            ) : (
              <p className="text-sm text-slate-400">{isAr ? 'لم يتم الإبلاغ' : 'None reported'}</p>
            )}
          </div>
        </div>
      </PremiumCard>

      {/* Quick Links */}
      <PremiumCard className="p-3">
        <div className="space-y-1">
          <SidebarLink 
            href={`/${locale}/${clinicSlug}/patients/${patient.display_id || patient.id}/files`} 
            icon={<FileText className="w-4 h-4" />} 
            label={isAr ? 'الملفات والمستندات' : 'Files & Documents'}
            count={patient.patient_uploaded_files?.length || 0}
          />
          <SidebarLink 
            href={`/${locale}/${clinicSlug}/patients/${patient.display_id || patient.id}/appointments`} 
            icon={<Calendar className="w-4 h-4" />} 
            label={isAr ? 'المواعيد' : 'Appointments'}
            count={patient.appointments?.length || 0}
          />
          <SidebarLink 
            href={`/${locale}/${clinicSlug}/patients/${patient.display_id || patient.id}/billing`} 
            icon={<Wallet className="w-4 h-4" />} 
            label={isAr ? 'الفواتير والخطط' : 'Billing & Plans'}
          />
        </div>
      </PremiumCard>
    </div>
  )
}

function SidebarLink({ href, icon, label, count }: { href: string, icon: React.ReactNode, label: string, count?: number }) {
  return (
    <Link href={href} className="flex items-center justify-between p-3 rounded-xl hover:bg-white/[0.04] transition-colors group">
      <div className="flex items-center gap-3 text-sm font-medium text-slate-300 group-hover:text-white transition-colors">
        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-slate-400 group-hover:text-teal-400 group-hover:bg-teal-500/10 transition-all">
          {icon}
        </div>
        {label}
      </div>
      {count !== undefined && count > 0 && (
        <span className="bg-white/10 text-xs font-semibold px-2 py-0.5 rounded-full text-slate-300">
          {count}
        </span>
      )}
    </Link>
  )
}
