'use client'

import { signIn } from 'next-auth/react'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function LoginContent() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  const handleSignIn = async () => {
    await signIn('google', { redirect: true })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-600 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white rounded-lg p-8 shadow-lg">
        <div>
          <h1 className="text-center text-3xl font-bold text-gray-900">
            TuGestiónLegal
          </h1>
          <p className="mt-2 text-center text-sm text-gray-600">
            Gestión de Trámites de Extranjería
          </p>
        </div>

        {error === 'AccessDenied' && (
          <div className="rounded-md bg-red-50 p-4 border border-red-200">
            <div className="text-sm text-red-800">
              Error al iniciar sesión
            </div>
          </div>
        )}

        {error && error !== 'AccessDenied' && (
          <div className="rounded-md bg-red-50 p-4 border border-red-200">
            <div className="text-sm text-red-800">
              Error de autenticación. Por favor, intenta de nuevo.
            </div>
          </div>
        )}

        <button
          onClick={handleSignIn}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
        >
          🔐 Iniciar sesión con Google
        </button>

        <p className="text-center text-xs text-gray-600">
          Acceso restringido a gestores autorizados
        </p>

        <div className="text-center text-xs text-gray-500 pt-4 border-t">
          <p>Created by Alpha Lima Romeo - 2026 (RPC)</p>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-blue-600">
      <div className="text-white">Cargando...</div>
    </div>}>
      <LoginContent />
    </Suspense>
  )
}
