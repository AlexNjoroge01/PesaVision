'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/stores/useAppStore'
import {
  LayoutDashboard,
  FileText,
  MessageSquare,
  Settings,
  LineChart,
  FileBarChart,
  ChevronLeft,
  ChevronRight,
  Shield,
  LogOut,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Statements', href: '/statements', icon: FileText },
  { name: 'Reports', href: '/reports', icon: FileBarChart },
  { name: 'AI Chat', href: '/chat', icon: MessageSquare },
  { name: 'Settings', href: '/settings', icon: Settings },
]

const adminNavigation = {
  name: 'Admin',
  href: '/admin',
  icon: Shield,
}

export function Sidebar() {
  const pathname = usePathname()
  const { sidebarOpen, toggleSidebar } = useAppStore()
  const { data: session } = useSession()

  const isAdmin = session?.user?.role === 'SUPER_USER'

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 h-screen border-r bg-background/95 backdrop-blur-xl transition-all duration-300',
        sidebarOpen ? 'w-64' : 'w-16'
      )}
    >
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center justify-between border-b px-4">
          {sidebarOpen && (
            <Link href="/dashboard" className="flex items-center gap-3 group">
              <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-primary via-violet-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-primary/25 group-hover:shadow-xl group-hover:shadow-primary/30 transition-shadow">
                <LineChart className="h-4 w-4 text-white" />
                <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-cyan-400 border-2 border-background" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-base tracking-tight">
                  Pesa<span className="text-primary">Vision</span>
                </span>
              </div>
            </Link>
          )}
          {!sidebarOpen && (
            <div className="flex items-center justify-center w-full gap-1">
              <Link href="/dashboard" className="group">
                <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-primary via-violet-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-primary/25 group-hover:shadow-xl group-hover:shadow-primary/30 transition-shadow">
                  <LineChart className="h-4 w-4 text-white" />
                </div>
              </Link>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleSidebar}
                className="h-8 w-8 ml-1"
                title="Expand sidebar"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
          {sidebarOpen && (
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              className="ml-auto h-8 w-8"
              title="Collapse sidebar"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-primary text-white shadow-md'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                  !sidebarOpen && 'justify-center'
                )}
                title={!sidebarOpen ? item.name : undefined}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                {sidebarOpen && <span>{item.name}</span>}
              </Link>
            )
          })}

          {/* Admin Link - Only visible to SUPER_USER */}
          {isAdmin && (
            <>
              <div className="my-2 border-t border-border" />
              <Link
                href={adminNavigation.href}
                className={cn(
                  'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
                  pathname === adminNavigation.href || pathname.startsWith(adminNavigation.href + '/')
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md'
                    : 'text-amber-600 hover:bg-amber-50 hover:text-amber-700 dark:text-amber-400 dark:hover:bg-amber-950',
                  !sidebarOpen && 'justify-center'
                )}
                title={!sidebarOpen ? adminNavigation.name : undefined}
              >
                <adminNavigation.icon className="h-5 w-5 shrink-0" />
                {sidebarOpen && <span>{adminNavigation.name}</span>}
              </Link>
            </>
          )}
        </nav>

        {/* Footer with Sign Out */}
        <div className="border-t p-2">
          {sidebarOpen ? (
            <div className="space-y-3">
              {/* <div className="flex items-center gap-3 px-3 py-2">
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-violet-500 flex items-center justify-center text-white font-medium text-xs">
                  {(session?.user?.name || session?.user?.email || 'U')[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{session?.user?.name || 'User'}</p>
                  <p className="text-xs text-muted-foreground truncate">{session?.user?.email}</p>
                </div>
              </div> */}
              <Button
                variant="outline"
                className="w-full justify-start gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950"
                onClick={() => signOut({ callbackUrl: '/login' })}
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </Button>
              <p className="text-xs text-muted-foreground text-center pt-1">
                © {new Date().getFullYear()} PesaVision
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 py-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950"
                onClick={() => signOut({ callbackUrl: '/login' })}
                title="Sign Out"
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </aside>
  )
}
