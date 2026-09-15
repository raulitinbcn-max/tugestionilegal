'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'

export default function SincronizarPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  const handleSync = async () => {
    if (!confirm('⚠️ ¿Sincronizar clientes y trámites desde Drive? Esto NO eliminará datos existentes.')) {
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/admin/sync-clientes-seguro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error en sincronización')
      }

      setResult(data)
      toast.success('✅ Sincronización completada')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Sincronizar desde Google Drive</h1>

        <div className="bg-white rounded-lg shadow p-8 space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-blue-800 text-sm font-semibold">ℹ️ Sincronización Segura</p>
            <p className="text-blue-700 text-xs mt-2">
              Lee las carpetas de clientes en Drive y crea los registros en la BD.
              NO borra ni modifica datos existentes.
            </p>
          </div>

          <div className="space-y-2">
            <h2 className="font-semibold text-gray-900">¿Qué hace?</h2>
            <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm">
              <li>Lee carpetas de clientes en Drive (formato: TR-00001 - Nombre)</li>
              <li>Crea clientes si no existen</li>
              <li>Crea trámites asociados</li>
              <li>No modifica clientes/trámites existentes</li>
            </ul>
          </div>

          <button
            onClick={handleSync}
            disabled={loading}
            className={`w-full py-3 px-4 rounded-lg font-semibold transition ${
              loading
                ? 'bg-gray-400 text-white cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {loading ? '⏳ Sincronizando...' : '🔄 Sincronizar desde Drive'}
          </button>

          {result && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-2">
              <h3 className="font-semibold text-green-900">✅ Sincronización Completada</h3>
              <div className="text-sm text-green-800 space-y-1">
                <p>Clientes creados: <span className="font-bold">{result.clientesCreados}</span></p>
                <p>Trámites creados: <span className="font-bold">{result.tramitesCreados}</span></p>
                <p className="text-xs text-gray-600 mt-2">{result.timestamp}</p>
              </div>
            </div>
          )}

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-xs text-yellow-700 space-y-2">
            <p className="font-semibold">📋 Nota:</p>
            <p>Los clientes y trámites se crean automáticamente si no existen. Si ejecutas de nuevo, solo se crearán los nuevos que encuentre en Drive.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
