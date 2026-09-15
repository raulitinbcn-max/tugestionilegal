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
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      // Check if user is authorized (whitelist)
      const authorizedUser = await db.usuarioAutorizado.findUnique({
        where: { email: user.email || '' },
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
  },
  secret: process.env.NEXTAUTH_SECRET,
}
