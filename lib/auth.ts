import { type NextAuthOptions, type Session } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { db } from './db'

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      allowDangerousEmailAccountLinking: true,
      authorization: {
        params: {
          scope: 'openid email profile https://www.googleapis.com/auth/drive',
        },
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      console.log('[AUTH] signIn called with user:', { email: user.email, name: user.name })

      if (!user.email) {
        console.log('[AUTH] No email provided')
        return false
      }

      try {
        const email = user.email.toLowerCase().trim()
        console.log('[AUTH] Buscando usuario con email:', email)

        // Use findUnique with direct email match (case-sensitive in DB)
        const authorizedUser = await db.usuarioAutorizado.findUnique({
          where: { email },
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
        session.accessToken = token.accessToken
        console.log('[AUTH] Session callback - accessToken present:', !!token.accessToken)
      }
      return session
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id
      }
      // Store access token when account is provided (initial login)
      if (account) {
        token.accessToken = account.access_token
      }
      // If we already have an accessToken, keep it (for subsequent requests)
      // This ensures the token persists across session refreshes
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

      // Por defecto ir al dashboard
      console.log('[AUTH] Redirigiendo al dashboard')
      return `${baseUrl}/`
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
