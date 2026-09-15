import { type NextAuthOptions, type Session } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { db } from './db'

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      allowDangerousEmailAccountLinking: true,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
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
    async session({ session, user, token }: any) {
      if (session.user && token) {
        session.user.id = token.sub
      }
      return session
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
}
