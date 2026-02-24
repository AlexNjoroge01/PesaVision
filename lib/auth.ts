import { NextAuthOptions } from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { prisma } from './prisma'
import type { Plan, UserRole } from '@/types'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  session: {
    strategy: 'jwt',
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.log('Missing credentials')
          return null
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        })

        if (!user) {
          console.log('User not found:', credentials.email)
          return null
        }

        if (!user.password) {
          console.log('User has no password set (OAuth user?):', credentials.email)
          return null
        }

        const passwordMatch = await bcrypt.compare(
          credentials.password,
          user.password
        )

        if (!passwordMatch) {
          console.log('Password mismatch for user:', credentials.email)
          return null
        }

        console.log('User authenticated successfully:', credentials.email)

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          plan: user.plan as Plan,
          role: user.role as UserRole,
          businessName: user.businessName,
        }
      },
    }),
  ],
  pages: {
    signIn: '/login',
    error: '/login',
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id!
        token.plan = (user as { plan: Plan }).plan
        token.role = (user as { role: UserRole }).role
        token.businessName = (user as { businessName: string | null }).businessName
      }

      // Handle session update from client
      if (trigger === 'update' && session) {
        token.name = session.name
        token.businessName = session.businessName
      }

      // Fetch latest user data from DB to keep plan and role in sync
      if (token.id) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { plan: true, role: true, businessName: true },
        })
        if (dbUser) {
          token.plan = dbUser.plan as Plan
          token.role = dbUser.role as UserRole
          token.businessName = dbUser.businessName
        }
      }

      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.plan = token.plan as Plan
        session.user.role = token.role as UserRole
        session.user.businessName = token.businessName as string | null
      }
      return session
    },
  },
  events: {
    async createUser({ user }) {
      // Create a default subscription for new users
      if (user.id) {
        await prisma.subscription.create({
          data: {
            userId: user.id,
            plan: 'FREE',
            status: 'ACTIVE',
            currentPeriodStart: new Date(),
            currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
          },
        })
      }
    },
  },
  debug: process.env.NODE_ENV === 'development',
}
