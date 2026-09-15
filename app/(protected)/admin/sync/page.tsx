'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'

export default function SyncPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  const handleSync = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/sync-from-drive', {
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
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800 text-sm font-semibold">
              ⚠️ IMPORTANTE: Esta función está temporalmente desactivada para evitar pérdida de datos.
            </p>
            <p className="text-red-700 text-xs mt-2">
              Los clientes y trámites se sincronizarán manualmente usando el endpoint de API.
            </p>
          </div>

          <div className="space-y-2">
            <h2 className="font-semibold text-gray-900">¿Qué hace?</h2>
            <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm">
              <li>Lee carpetas en: DRIVE_FOLDER_CLIENTES_ID</li>
              <li>Busca carpetas con formato: TR-00001 - Nombre Cliente</li>
              <li>Crea clientes y trámites automáticamente</li>
              <li>No sobrescribe datos existentes</li>
            </ul>
          </div>

          <button
            onClick={handleSync}
            disabled={true}
            className="w-full py-3 px-4 rounded-lg font-semibold transition bg-gray-400 text-white cursor-not-allowed opacity-50"
          >
            🔒 Sincronización desactivada temporalmente
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
        </div>
      </div>
    </div>
  )
}
