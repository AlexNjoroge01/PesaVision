import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl
    const token = req.nextauth.token

    // Protect admin routes - only SUPER_USER can access
    if (pathname.startsWith('/admin')) {
      if (token?.role !== 'SUPER_USER') {
        // Redirect non-admin users to dashboard
        return NextResponse.redirect(new URL('/dashboard', req.url))
      }
    }

    // Allow the request to proceed
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl

        // Allow public routes
        if (
          pathname === '/' ||
          pathname === '/pricing' ||
          pathname.startsWith('/api/') ||
          pathname.startsWith('/_next/') ||
          pathname.includes('/login') ||
          pathname.includes('/register')
        ) {
          return true
        }

        // Require authentication for dashboard routes
        if (
          pathname.startsWith('/dashboard') ||
          pathname.startsWith('/statements') ||
          pathname.startsWith('/reports') ||
          pathname.startsWith('/chat') ||
          pathname.startsWith('/settings') ||
          pathname.startsWith('/admin')
        ) {
          return !!token
        }

        return true
      },
    },
    pages: {
      signIn: '/login',
    },
  }
)

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (NextAuth API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico|public).*)',
  ],
}
