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
        {/* Main Content */}
        <main>
          {children}
        </main>
      </body>
    </html>
  )
}
