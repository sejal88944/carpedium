import NextAuth, { type DefaultSession } from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { authConfig } from '@/lib/auth.config'
import { connectMongo, isMongoConfigured } from '@/lib/mongoose'
import { User } from '@/models'

const FALLBACK_ADMIN_EMAIL = 'admin@gmail.com'
const FALLBACK_ADMIN_PASSWORD = 'pass12345'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      role: 'admin' | 'user'
    } & DefaultSession['user']
  }
  interface User {
    id: string
    role?: 'admin' | 'user'
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role?: 'admin' | 'user'
    id?: string
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: 'Admin Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const rawEmail = String(credentials?.email || '').trim().toLowerCase()
        const password = String(credentials?.password || '')
        if (!rawEmail || !password) return null

        if (isMongoConfigured()) {
          try {
            await connectMongo()
            const user = await User.findOne({ email: rawEmail }).lean()
            if (user?.passwordHash) {
              const ok = await bcrypt.compare(password, user.passwordHash)
              if (ok) {
                return {
                  id: String(user._id),
                  email: user.email,
                  name: user.name || 'Admin',
                  role: user.role || 'admin',
                }
              }
            }
          } catch (e) {
            console.warn('[auth] Mongo lookup failed, falling back to env admin:', (e as Error).message)
          }
        }

        if (
          rawEmail === FALLBACK_ADMIN_EMAIL &&
          password === FALLBACK_ADMIN_PASSWORD
        ) {
          return {
            id: 'env-admin',
            email: FALLBACK_ADMIN_EMAIL,
            name: 'AASHA Admin',
            role: 'admin',
          }
        }

        return null
      },
    }),
  ],
})
