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
        const email = user.email.toLowerCase().trim()
        console.log('[AUTH] Buscando usuario con email:', email)

        const authorizedUser = await db.usuarioAutorizado.findFirst({
          where: {
            email: {
              equals: email,
              mode: 'insensitive'
            }
          },
        })

        console.log('[AUTH] User lookup:', { email, found: !!authorizedUser, activo: authorizedUser?.activo })

        if (!authorizedUser) {
          console.log('[AUTH] User not found in whitelist')
          return false
        }

        if (!authorizedUser.activo) {
          console.log('[AUTH] User is inactive')
          return false
        }

        console.log('[AUTH] Usuario autorizado, permitiendo login')
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
    async redirect({ url, baseUrl }) {
      console.log('[AUTH] Redirect callback:', { url, baseUrl })

      // Si la URL es relativa, usar baseUrl
      if (url.startsWith('/')) {
        return `${baseUrl}${url}`
      }

      // Si es del mismo dominio, permitir
      if (new URL(url).origin === baseUrl) {
        return url
      }

      // Por defecto ir a /admin
      console.log('[AUTH] Redirigiendo a /admin')
      return `${baseUrl}/admin`
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
