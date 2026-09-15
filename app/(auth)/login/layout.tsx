import { Suspense } from 'react'

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center">
      <p className="text-white">Cargando...</p>
    </div>}>
      {children}
    </Suspense>
  )
}
