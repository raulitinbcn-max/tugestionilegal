import type { Metadata } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import './globals.css'

export const metadata: Metadata = {
  title: 'TuGestiónLegal',
  description: 'Plataforma de gestión de trámites legales',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  return (
    <html lang="es">
      <body className="bg-gray-50">
        {/* Navbar */}
        {session && (
          <nav className="bg-white shadow-sm border-b">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-16">
                <div className="flex items-center">
                  <h1 className="text-xl font-bold text-gray-900">TuGestiónLegal</h1>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-600">{session.user?.email}</span>
                  <form
                    action="/api/auth/signout"
                    method="POST"
                    className="inline"
                  >
                    <button
                      type="submit"
                      className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                    >
                      Cerrar sesión
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </nav>
        )}

        {/* Main Content */}
        <main className={session ? 'max-w-7xl mx-auto' : ''}>
          {children}
        </main>
      </body>
    </html>
  )
}
