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
        return false
      }

      const authorizedUser = await db.usuarioAutorizado.findUnique({
        where: { email: user.email },
      })

      if (!authorizedUser || !authorizedUser.activo) {
        return false
      }

      return true
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
