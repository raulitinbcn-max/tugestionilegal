import { type NextAuthOptions, type Session } from 'next-auth'
import { type JWT } from 'next-auth/jwt'
import GoogleProvider from 'next-auth/providers/google'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { db } from './db'

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
    async signIn({ user, account }) {
      // Check if user is authorized (whitelist)
      if (!user.email) {
        return false
      }

      const authorizedUser = await db.usuarioAutorizado.findUnique({
        where: { email: user.email },
      })

      if (!authorizedUser || !authorizedUser.activo) {
        return '/login?error=AccessDenied'
      }

      return true
    },
    async session({ session }: { session: Session }) {
      return session
    },
    async redirect({ url, baseUrl }) {
      // Redirect to /admin if callback is relative
      if (url.startsWith('/')) return `${baseUrl}${url}`
      // Allow callback urls on the same domain
      if (new URL(url).origin === baseUrl) return url
      return baseUrl + '/admin'
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET,
}
