'use client'

import { motion } from 'framer-motion'
import { Loader2, Upload, Brain, CheckCircle2 } from 'lucide-react'
import type { StatementStatus } from '@/types'

interface ProcessingStatusProps {
  status: StatementStatus
  className?: string
}

const statusSteps = [
  { key: 'PENDING', label: 'Uploading...', icon: Upload },
  { key: 'PROCESSING', label: 'Analyzing your transactions...', icon: Brain },
  { key: 'DONE', label: 'Analysis complete!', icon: CheckCircle2 },
]

export function ProcessingStatus({ status, className }: ProcessingStatusProps) {
  if (status === 'FAILED') {
    return (
      <div className={className}>
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
            <CheckCircle2 className="h-8 w-8 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Analysis Failed</h3>
          <p className="text-muted-foreground">
            There was an error processing your statement. Please try again.
          </p>
        </div>
      </div>
    )
  }

  const currentStepIndex = statusSteps.findIndex((s) => s.key === status)

  return (
    <div className={className}>
      <div className="max-w-md mx-auto">
        {/* Animated icon */}
        <div className="flex justify-center mb-8">
          <motion.div
            className="relative"
            animate={{ rotate: status === 'DONE' ? 0 : 360 }}
            transition={{ duration: 2, repeat: status === 'DONE' ? 0 : Infinity, ease: 'linear' }}
          >
            <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
              {status === 'DONE' ? (
                <CheckCircle2 className="h-12 w-12 text-green-600" />
              ) : (
                <Loader2 className="h-12 w-12 text-primary" />
              )}
            </div>
          </motion.div>
        </div>

        {/* Status text */}
        <motion.div
          key={status}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h3 className="text-lg font-semibold mb-2">
            {statusSteps[currentStepIndex]?.label || 'Processing...'}
          </h3>
          <p className="text-sm text-muted-foreground">
            {status === 'PENDING' && 'Preparing your statement for analysis...'}
            {status === 'PROCESSING' && 'Our AI is categorizing transactions and generating insights...'}
            {status === 'DONE' && 'Your business insights are ready!'}
          </p>
        </motion.div>

        {/* Progress steps */}
        <div className="flex items-center justify-center gap-2">
          {statusSteps.map((step, index) => {
            const isCompleted = index < currentStepIndex
            const isCurrent = index === currentStepIndex
            const Icon = step.icon

            return (
              <div key={step.key} className="flex items-center">
                <motion.div
                  className={`
                    w-8 h-8 rounded-full flex items-center justify-center
                    ${isCompleted ? 'bg-green-100 text-green-600' : ''}
                    ${isCurrent ? 'bg-primary text-primary-foreground' : ''}
                    ${!isCompleted && !isCurrent ? 'bg-muted text-muted-foreground' : ''}
                  `}
                  animate={isCurrent ? { scale: [1, 1.1, 1] } : {}}
                  transition={{ duration: 1, repeat: isCurrent ? Infinity : 0 }}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    <Icon className="h-4 w-4" />
                  )}
                </motion.div>
                {index < statusSteps.length - 1 && (
                  <div
                    className={`w-12 h-0.5 mx-1 ${
                      isCompleted ? 'bg-green-200' : 'bg-muted'
                    }`}
                  />
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
