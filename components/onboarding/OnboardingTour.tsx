'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Users, Calendar, Stethoscope, CreditCard, ChevronRight, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'

const steps = [
  {
    title: 'Patients Module',
    description: 'Manage patient files, medical history, and treatment plans in one centralized place.',
    icon: Users,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10'
  },
  {
    title: 'Appointments',
    description: 'Schedule, reschedule, and manage your daily clinic calendar with ease.',
    icon: Calendar,
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-500/10'
  },
  {
    title: 'Services & Treatments',
    description: 'Define your clinic services, pricing, and specialized modules like Dental Charting.',
    icon: Stethoscope,
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10'
  },
  {
    title: 'Billing & Finance',
    description: 'Track patient payments, manage clinic expenses, and view comprehensive financial reports.',
    icon: CreditCard,
    color: 'text-amber-500',
    bgColor: 'bg-amber-500/10'
  }
]

export function OnboardingTour() {
  const [isOpen, setIsOpen] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)

  useEffect(() => {
    // Check if the user has seen the onboarding tour
    const hasSeenOnboarding = localStorage.getItem('clinicos_has_seen_onboarding')
    if (!hasSeenOnboarding) {
      // Small delay for better UX
      const timer = setTimeout(() => setIsOpen(true), 1000)
      return () => clearTimeout(timer)
    }
  }, [])

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
        className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
      >
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="relative w-full max-w-md overflow-hidden rounded-2xl border bg-card p-6 shadow-xl"
        >
          {/* Progress Indicators */}
          <div className="mb-8 flex justify-center gap-2">
            {steps.map((_, idx) => (
              <div
                key={idx}
                className={`h-2 rounded-full transition-all duration-300 ${
                  idx === currentStep ? 'w-8 bg-primary' : 'w-2 bg-muted'
                }`}
              />
            ))}
          </div>

          <div className="flex flex-col items-center text-center">
            <div className={`mb-6 flex h-20 w-20 items-center justify-center rounded-full ${step.bgColor}`}>
              <Icon className={`h-10 w-10 ${step.color}`} />
            </div>

            <h2 className="mb-2 text-2xl font-bold tracking-tight">{step.title}</h2>
            <p className="mb-8 text-muted-foreground">{step.description}</p>

            <div className="flex w-full gap-3">
              <Button variant="ghost" className="w-full" onClick={handleComplete}>
                Skip Tour
              </Button>
              <Button className="w-full" onClick={handleNext}>
                {currentStep === steps.length - 1 ? (
                  <>
                    <Check className="mr-2 h-4 w-4" /> Get Started
                  </>
                ) : (
                  <>
                    Next <ChevronRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
