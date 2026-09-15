import type { Metadata } from 'next'
import { Toaster } from 'react-hot-toast'
import { Providers } from './providers'
import './globals.css'

export const metadata: Metadata = {
  title: 'TuGestiónLegal - Despacho López-Iglesias',
  description: 'Aplicación web para la gestión de trámites en Despacho López-Iglesias',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body>
        <Providers>
          {children}
        </Providers>
        <Toaster position="top-right" />
      </body>
    </html>
  )
}
