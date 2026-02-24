'use client'

import { SessionProvider } from 'next-auth/react'
import { Toaster } from 'sonner'
import Link from 'next/link'
import { LineChart, Shield, TrendingUp } from 'lucide-react'

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
        <header className="relative border-b bg-background/80 backdrop-blur-xl">
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

        {/* Main content */}
        <main className="flex-1 flex items-center justify-center p-4 relative">
          {children}
        </main>

        {/* Footer */}
        <footer className="relative border-t bg-background/80 backdrop-blur-xl py-6">
          <div className="container mx-auto px-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-sm text-muted-foreground">
                © {new Date().getFullYear()} PesaVision. All rights reserved.
              </p>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Shield className="h-4 w-4 text-primary" />
                <span>Secure & Encrypted</span>
              </div>
            </div>
          </div>
        </footer>
      </div>

      <Toaster position="top-right" richColors />
    </SessionProvider>
  )
}
