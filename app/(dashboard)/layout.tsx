'use client'

import { SessionProvider } from 'next-auth/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { Toaster } from 'sonner'
import { useState } from 'react'
import { Sidebar } from '@/components/layout/Sidebar'
import { Header } from '@/components/layout/Header'
import { useAppStore } from '@/stores/useAppStore'
import { cn } from '@/lib/utils'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 1 minute
        refetchOnWindowFocus: false,
      },
    },
  }))
  const { sidebarOpen } = useAppStore()

  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        <div className="min-h-screen bg-background relative">
          {/* Gradient Backgrounds - matching landing page */}
          <div className="fixed inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
            <div className="absolute top-1/3 -left-40 w-80 h-80 bg-violet-500/10 rounded-full blur-3xl" />
            <div className="absolute bottom-1/4 right-1/4 w-60 h-60 bg-cyan-500/5 rounded-full blur-3xl" />
          </div>

          {/* Sidebar - hidden on mobile */}
          <div className="hidden md:block relative z-20">
            <Sidebar />
          </div>

          {/* Header */}
          <Header />

          {/* Main content */}
          <main
            className={cn(
              'min-h-screen pt-16 transition-all duration-300 relative z-10',
              sidebarOpen ? 'md:pl-64' : 'md:pl-16'
            )}
          >
            <div className="container mx-auto p-4 md:p-6">
              {children}
            </div>
          </main>
        </div>

        {/* Toast notifications */}
        <Toaster position="top-right" richColors />

        {/* React Query devtools */}
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </SessionProvider>
  )
}
