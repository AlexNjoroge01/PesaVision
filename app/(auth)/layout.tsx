'use client'

import { SessionProvider } from 'next-auth/react'
import { Toaster } from 'sonner'
import Link from 'next/link'
import { LineChart, Shield, TrendingUp, PieChart, BarChart3, FileText, Sparkles, CheckCircle } from 'lucide-react'

const features = [
  {
    icon: FileText,
    title: 'Statement Analysis',
    description: 'Upload M-Pesa PDF statements and get instant insights',
  },
  {
    icon: PieChart,
    title: 'Transaction Categorization',
    description: 'AI-powered categorization of all your transactions',
  },
  {
    icon: BarChart3,
    title: 'Visual Reports',
    description: 'Beautiful charts and graphs for your financial data',
  },
  {
    icon: Sparkles,
    title: 'AI Insights',
    description: 'Get personalized recommendations to improve your finances',
  },
]

const stats = [
  { value: '100', label: 'Statements Analyzed' },
  { value: 'KES 250+', label: 'Transactions Processed' },
  { value: '99.9%', label: 'Accuracy Rate' },
]

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SessionProvider>
      <div className="min-h-screen flex flex-col relative">
        {/* Gradient Backgrounds - matching landing page */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/20 rounded-full blur-3xl" />
          <div className="absolute top-1/3 -left-40 w-80 h-80 bg-violet-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-60 h-60 bg-cyan-500/10 rounded-full blur-3xl" />
        </div>

        {/* Header */}
        <header className="relative border-b bg-background/80 backdrop-blur-xl lg:hidden">
          <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-primary via-violet-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-primary/25 group-hover:shadow-xl group-hover:shadow-primary/30 transition-shadow">
                <LineChart className="h-4 w-4 text-white" />
                <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-cyan-400 border-2 border-background" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-lg tracking-tight">
                  Pesa<span className="text-primary">Vision</span>
                </span>
              </div>
            </Link>
            
            <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
              <TrendingUp className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">AI-Powered Analytics</span>
            </div>
          </div>
        </header>

        {/* Main content - Split layout on desktop */}
        <main className="flex-1 flex relative">
          {/* Left side - Marketing Panel (hidden on mobile) */}
          <div className="hidden lg:flex lg:w-1/2 xl:w-[55%] flex-col justify-center p-12 relative">
            <div className="max-w-xl">
              {/* Logo */}
              <Link href="/" className="flex items-center gap-3 group mb-8">
                <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-primary via-violet-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-primary/25 group-hover:shadow-xl group-hover:shadow-primary/30 transition-shadow">
                  <LineChart className="h-6 w-6 text-white" />
                  <div className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-cyan-400 border-2 border-background" />
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-2xl tracking-tight">
                    Pesa<span className="text-primary">Vision</span>
                  </span>
                </div>
              </Link>

              {/* Hero Text */}
              <h1 className="text-4xl xl:text-5xl font-bold tracking-tight mb-4">
                Transform Your{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-violet-500">
                  M-Pesa Statements
                </span>{' '}
                Into Actionable Insights
              </h1>
              <p className="text-lg text-muted-foreground mb-8">
                Upload your M-Pesa PDF statements and get AI-powered analysis, 
                beautiful visualizations, and personalized financial recommendations.
              </p>

              {/* Features Grid */}
              <div className="grid grid-cols-2 gap-4 mb-8">
                {features.map((feature, index) => (
                  <div 
                    key={index} 
                    className="flex items-start gap-3 p-4 rounded-2xl bg-background/50 backdrop-blur-sm border border-border/50"
                  >
                    <div className="p-2 rounded-xl bg-primary/10">
                      <feature.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm">{feature.title}</h3>
                      <p className="text-xs text-muted-foreground">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Stats */}
              <div className="flex gap-8">
                {stats.map((stat, index) => (
                  <div key={index}>
                    <p className="text-2xl font-bold text-primary">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Decorative elements */}
            <div className="absolute top-20 right-10 w-32 h-32 bg-gradient-to-br from-primary/20 to-violet-500/20 rounded-full blur-2xl" />
            <div className="absolute bottom-20 left-10 w-40 h-40 bg-gradient-to-br from-cyan-500/10 to-primary/10 rounded-full blur-2xl" />
          </div>

          {/* Right side - Auth Form */}
          <div className="flex-1 flex items-center justify-center p-4 lg:p-8">
            <div className="w-full max-w-md">
              {children}
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="relative border-t bg-background/80 backdrop-blur-xl py-4">
          <div className="container mx-auto px-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-sm text-muted-foreground">
                © {new Date().getFullYear()} PesaVision. All rights reserved.
              </p>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Shield className="h-4 w-4 text-primary" />
                  <span>Secure & Encrypted</span>
                </div>
                <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Privacy First</span>
                </div>
              </div>
            </div>
          </div>
        </footer>
      </div>

      <Toaster position="top-right" richColors />
    </SessionProvider>
  )
}
