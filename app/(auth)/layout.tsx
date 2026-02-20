'use client'

import { SessionProvider } from 'next-auth/react'
import { Toaster } from 'sonner'
import Link from 'next/link'
import { BarChart3 } from 'lucide-react'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SessionProvider>
      <div className="min-h-screen flex flex-col">
        {/* Header */}
        <header className="border-b">
          <div className="container mx-auto px-4 h-16 flex items-center">
            <Link href="/" className="flex items-center gap-2">
              <BarChart3 className="h-6 w-6 text-primary" />
              <span className="font-bold text-lg">PesaVision</span>
            </Link>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 flex items-center justify-center p-4">
          {children}
        </main>

        {/* Footer */}
        <footer className="border-t py-4">
          <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
            © 2024 PesaVision. All rights reserved.
          </div>
        </footer>
      </div>

      <Toaster position="top-right" richColors />
    </SessionProvider>
  )
}
