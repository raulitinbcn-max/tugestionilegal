import { type NextAuthOptions, type Session } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { db } from './db'

const baseUrl = process.env.NEXTAUTH_URL || 'https://tugestionilegal-4192.vercel.app'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      allowDangerousEmailAccountLinking: true,
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      // Check if user is authorized (whitelist)
      if (!user.email) {
        console.log('[AUTH] No email provided')
        return false
      }

      try {
        const authorizedUser = await db.usuarioAutorizado.findUnique({
          where: { email: user.email.toLowerCase() },
        })

        console.log('[AUTH] User lookup:', { email: user.email, found: !!authorizedUser, activo: authorizedUser?.activo })

        if (!authorizedUser) {
          console.log('[AUTH] User not found in whitelist')
          return false
        }

        if (!authorizedUser.activo) {
          console.log('[AUTH] User is inactive')
          return false
        }

        return true
      } catch (error) {
        console.error('[AUTH] Error checking user:', error)
        return false
      }
    },
    async session({ session }: { session: Session }) {
      return session
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET,
}
