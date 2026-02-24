'use client'

import { cn } from '@/lib/utils'
import { FileQuestion, Upload, BarChart3, MessageSquare, FileText, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface EmptyStateProps {
  type: 'statements' | 'reports' | 'chat' | 'dashboard'
  title?: string
  description?: string
  actionLabel?: string
  actionHref?: string
  className?: string
}

const defaultConfig = {
  statements: {
    icon: Upload,
    title: 'No statements yet',
    description: 'Upload your first M-Pesa statement to get started with AI-powered insights.',
    actionLabel: 'Upload Statement',
    actionHref: '/statements',
  },
  reports: {
    icon: FileText,
    title: 'No reports generated',
    description: 'Generate reports from your analyzed statements to download and share.',
    actionLabel: 'View Statements',
    actionHref: '/statements',
  },
  chat: {
    icon: MessageSquare,
    title: 'No statements to chat about',
    description: 'Upload a statement first to start chatting with the AI advisor.',
    actionLabel: 'Upload Statement',
    actionHref: '/statements',
  },
  dashboard: {
    icon: BarChart3,
    title: 'No data to display',
    description: 'Upload your M-Pesa statement to see your business analytics.',
    actionLabel: 'Upload Statement',
    actionHref: '/statements',
  },
}

export function EmptyState({
  type,
  title,
  description,
  actionLabel,
  actionHref,
  className,
}: EmptyStateProps) {
  const config = defaultConfig[type]
  const Icon = config.icon

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-12 px-4 text-center',
        className
      )}
    >
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-violet-500/20 flex items-center justify-center mb-6">
        <Icon className="h-8 w-8 text-primary" />
      </div>
      <h3 className="text-xl font-semibold mb-2">
        {title || config.title}
      </h3>
      <p className="text-muted-foreground mb-6 max-w-sm">
        {description || config.description}
      </p>
      {(actionLabel || config.actionLabel) && (
        <Button asChild className="rounded-full shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all">
          <Link href={actionHref || config.actionHref || '#'}>
            {actionLabel || config.actionLabel}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      )}
    </div>
  )
}
