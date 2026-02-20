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
        <div className="min-h-screen bg-background">
          {/* Sidebar - hidden on mobile */}
          <div className="hidden md:block">
            <Sidebar />
          </div>

          {/* Header */}
          <Header />

          {/* Main content */}
          <main
            className={cn(
              'min-h-screen pt-16 transition-all duration-300',
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
