import type { NextAuthConfig } from 'next-auth'

export const authConfig = {
  trustHost: true,
  secret: process.env.NEXTAUTH_SECRET || 'change-me-in-production',
  pages: {
    signIn: '/admin/login',
    error: '/admin/login',
  },
  session: { strategy: 'jwt', maxAge: 60 * 60 * 24 * 7 },
  providers: [],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = (user as { role?: 'admin' | 'user' }).role || 'admin'
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = (token.id as string) || ''
        session.user.role = (token.role as 'admin' | 'user') || 'admin'
      }
      return session
    },
    authorized({ auth, request }) {
      const path = request.nextUrl.pathname
      if (!path.startsWith('/admin')) return true
      if (path.startsWith('/admin/login')) return true
      return Boolean(auth?.user)
    },
  },
} satisfies NextAuthConfig
