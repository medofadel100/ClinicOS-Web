'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Users, Calendar, Stethoscope, CreditCard, ChevronRight, Check, Pill, Focus, X } from 'lucide-react'

const getSteps = (isAr: boolean) => [
  {
    title: isAr ? 'إدارة المرضى' : 'Patient Management',
    description: isAr ? 'إنشاء ملفات مرضى كاملة مع التاريخ السريري، قياسات الحيوية، وخطة العلاج.' : 'Create complete patient files with clinical history, vitals, and treatment plans.',
    icon: Users,
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
  },
  {
    title: isAr ? 'جدولة المواعيد' : 'Smart Scheduling',
    description: isAr ? 'حجز مواعيد، دخول فوري للمرضى، قوائم انتظار، وتعيين تلقائي للأطباء المتاحين.' : 'Book appointments, walk-ins, waitlists, and auto-assign available doctors.',
    icon: Calendar,
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10',
  },
  {
    title: isAr ? '٢٤ وحدة تخصص' : '24 Specialty Modules',
    description: isAr ? 'فم الأسنان، العظام، العيون، الأمومة، الجلدية، والكثير — كل وحدة مصممة لاحتياجات التخصص.' : 'Dental, orthopedics, OB/GYN, ophthalmology, dermatology, and more — each module designed for its specialty.',
    icon: Stethoscope,
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/10',
  },
  {
    title: isAr ? 'الروشتات الإلكترونية' : 'E-Prescriptions',
    description: isAr ? 'كتابة وصفات طبية مع بحث ذكي عن الأدوية، وطباعتها أو إرسالها للعميل على الواتساب.' : 'Write prescriptions with smart drug search, print them, or send via WhatsApp.',
    icon: Pill,
    color: 'text-violet-400',
    bgColor: 'bg-violet-500/10',
  },
  {
    title: isAr ? 'الفواتير والمدفوعات' : 'Billing & Payments',
    description: isAr ? 'تتبع مدفوعات المرضى، خطط العلاج، والتحقق من الدفع — الطبيب ينهي والكاشير يتأكد.' : 'Track patient payments, treatment plans, and payment confirmation — doctor completes, reception confirms.',
    icon: CreditCard,
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/10',
  },
  {
    title: isAr ? 'وضع تركيز الطبيب' : 'Doctor Focus Mode',
    description: isAr ? 'عرض مبسط للطبيب على الموبايل — تركيز كامل على المريض الحالي مع وصول سريع لكل شيء.' : 'Simplified mobile view for doctors — focus on the current patient with quick access to everything.',
    icon: Focus,
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-500/10',
  },
  {
    title: isAr ? 'أنت جاهز!' : 'You\'re Ready!',
    description: isAr ? 'ابدأ بإضافة مرضى، وحجز مواعيد، واستكشاف كل الميزات. مرحباً بك في ClinicOS!' : 'Start by adding patients, booking appointments, and exploring all features. Welcome to ClinicOS!',
    icon: Check,
    color: 'text-teal-400',
    bgColor: 'bg-teal-500/10',
  },
]

export function OnboardingTour() {
  const [isOpen, setIsOpen] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [isAr, setIsAr] = useState(false)

  useEffect(() => {
    // Detect locale from URL
    const locale = window.location.pathname.split('/')[1]
    setIsAr(locale === 'ar')

    const hasSeenOnboarding = localStorage.getItem('clinicos_has_seen_onboarding')
    if (!hasSeenOnboarding) {
      const timer = setTimeout(() => setIsOpen(true), 800)
      return () => clearTimeout(timer)
    }
  }, [])

  const steps = getSteps(isAr)

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(c => c + 1)
    } else {
      handleComplete()
    }
  }

  const handleComplete = () => {
    setIsOpen(false)
    localStorage.setItem('clinicos_has_seen_onboarding', 'true')
  }

  if (!isOpen) return null

  const step = steps[currentStep]
  const Icon = step.icon

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      >
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="relative w-full max-w-md overflow-hidden rounded-2xl p-6 shadow-2xl"
          style={{ background: 'linear-gradient(135deg, hsl(222 47% 8%) 0%, hsl(222 47% 6%) 100%)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          {/* Close button */}
          <button onClick={handleComplete} className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-white/[0.06] transition-all z-10">
            <X className="w-4 h-4" />
          </button>

          {/* Step counter */}
          <div className="text-[11px] text-slate-500 font-medium mb-6">{currentStep + 1} / {steps.length}</div>

          {/* Progress bar */}
          <div className="flex gap-1.5 mb-8">
            {steps.map((_, idx) => (
              <div key={idx} className="h-1 rounded-full transition-all duration-300" style={{ flex: idx === currentStep ? 2 : 1, background: idx <= currentStep ? 'hsl(168 100% 42%)' : 'rgba(255,255,255,0.06)' }} />
            ))}
          </div>

          <div className="flex flex-col items-center text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1, type: 'spring', stiffness: 300 }}
              className={`mb-6 flex h-20 w-20 items-center justify-center rounded-2xl ${step.bgColor}`}
            >
              <Icon className={`h-10 w-10 ${step.color}`} />
            </motion.div>

            <h2 className="mb-3 text-2xl font-bold text-white tracking-tight">{step.title}</h2>
            <p className="mb-8 text-sm text-slate-400 leading-relaxed max-w-sm">{step.description}</p>

            <div className="flex w-full gap-3">
              <button onClick={handleComplete} className="flex-1 h-11 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-white/[0.05] transition-all border border-white/[0.06]">
                {isAr ? 'تخطي' : 'Skip Tour'}
              </button>
              <button onClick={handleNext} className="flex-1 h-11 rounded-xl text-sm font-bold text-[#0a0f1e] transition-all flex items-center justify-center gap-2" style={{ background: 'linear-gradient(135deg, hsl(168 100% 42%), hsl(195 100% 50%))', boxShadow: '0 0 16px rgba(0,212,170,0.3)' }}>
                {currentStep === steps.length - 1 ? (
                  <>
                    <Check className="w-4 h-4" />
                    {isAr ? 'ابدأ' : 'Get Started'}
                  </>
                ) : (
                  <>
                    {isAr ? 'التالي' : 'Next'}
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
