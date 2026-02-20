import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
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
          pathname.startsWith('/settings')
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
