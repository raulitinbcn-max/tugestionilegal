'use client'

import { signIn } from 'next-auth/react'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function LoginContent() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  const handleSignIn = async () => {
    await signIn('google', {
      redirect: true,
      callbackUrl: '/admin'
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            TuGestiónLegal
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Plataforma de gestión de trámites legales
          </p>
        </div>

        {error === 'AccessDenied' && (
          <div className="rounded-md bg-red-50 p-4">
            <div className="text-sm text-red-800">
              No tienes permiso para acceder. Solo usuarios autorizados pueden ingresar.
            </div>
          </div>
        )}

        {error && error !== 'AccessDenied' && (
          <div className="rounded-md bg-red-50 p-4">
            <div className="text-sm text-red-800">
              Error de autenticación. Por favor, intenta de nuevo.
            </div>
          </div>
        )}

        <div>
          <button
            onClick={handleSignIn}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            Inicia sesión con Google
          </button>
        </div>

        <p className="text-center text-xs text-gray-500 mt-4">
          Solo los usuarios autorizados pueden acceder
        </p>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Cargando...</div>}>
      <LoginContent />
    </Suspense>
  )
}
