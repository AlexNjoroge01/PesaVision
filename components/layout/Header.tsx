'use client'

import { useSession, signOut } from 'next-auth/react'
import { useAppStore } from '@/stores/useAppStore'
import { PlanBadge } from '@/components/shared/PlanBadge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Menu, User, LogOut, Settings, CreditCard, LineChart } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

export function Header() {
  const { data: session } = useSession()
  const { sidebarOpen } = useAppStore()

  return (
    <header
      className={cn(
        'fixed top-0 right-0 z-30 h-16 border-b bg-background/80 backdrop-blur-xl transition-all duration-300',
        sidebarOpen ? 'left-64' : 'left-16'
      )}
    >
      <div className="flex h-full items-center justify-between px-4 md:px-6">
        {/* Mobile menu button and logo */}
        <div className="flex items-center gap-3 md:hidden">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="relative w-8 h-8 rounded-lg bg-gradient-to-br from-primary via-violet-500 to-cyan-500 flex items-center justify-center shadow-md shadow-primary/20">
              <LineChart className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-base">
              Pesa<span className="text-primary">Vision</span>
            </span>
          </Link>
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Spacer for desktop */}
        <div className="flex-1 hidden md:block" />

        {/* Right side */}
        <div className="flex items-center gap-3">
          {/* Plan badge */}
          {session?.user?.plan && (
            <PlanBadge plan={session.user.plan} />
          )}

          {/* User menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                className="rounded-full h-9 w-9 p-0 border border-border hover:border-primary/50 transition-colors"
              >
                <User className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">{session?.user?.name || 'User'}</p>
                  <p className="text-xs text-muted-foreground">
                    {session?.user?.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/settings" className="cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/settings#billing" className="cursor-pointer">
                  <CreditCard className="mr-2 h-4 w-4" />
                  Billing
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => signOut({ callbackUrl: '/login' })}
                className="text-red-600 focus:text-red-600 cursor-pointer"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
