'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'

export default function BackupTramitesPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  const handleBackup = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/backup-tramites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error en backup')
      }

      setResult(data)
      toast.success('✅ Backup de trámites completado')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Backup de Trámites en Drive</h1>

        <div className="bg-white rounded-lg shadow p-8 space-y-6">
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <p className="text-purple-800 text-sm font-semibold">💾 Guardar Datos Completos de Trámites</p>
            <p className="text-purple-700 text-xs mt-2">
              Crea un archivo JSON en cada carpeta de trámite con todos sus datos (honorarios, vencimientos, notas, checklist, etc.)
            </p>
          </div>

          <div className="space-y-2">
            <h2 className="font-semibold text-gray-900">¿Qué se guarda en cada trámite?</h2>
            <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm">
              <li>📋 Datos del trámite (código, tipo, estado, honorarios, forma de pago)</li>
              <li>👤 Datos del cliente (nombre, email, teléfono, nacionalidad, dirección, profesión)</li>
              <li>📄 Documentos asociados</li>
              <li>⏰ Vencimientos y tasas</li>
              <li>☑️ Items del checklist</li>
              <li>📝 Historial de cambios de estado</li>
            </ul>
          </div>

          <button
            onClick={handleBackup}
            disabled={loading}
            className={`w-full py-3 px-4 rounded-lg font-semibold transition ${
              loading
                ? 'bg-gray-400 text-white cursor-not-allowed'
                : 'bg-purple-600 hover:bg-purple-700 text-white'
            }`}
          >
            {loading ? '⏳ Haciendo backup...' : '💾 Hacer Backup de Trámites'}
          </button>

          {result && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-2">
              <h3 className="font-semibold text-green-900">✅ Backup Completado</h3>
              <div className="text-sm text-green-800 space-y-1">
                <p>Trámites guardados: <span className="font-bold">{result.tramitesBackup}</span></p>
                <p className="text-xs text-gray-600 mt-2">📅 {new Date(result.timestamp).toLocaleString('es-ES')}</p>
              </div>
              <div className="mt-3 text-xs text-green-700 bg-green-100 p-2 rounded">
                ℹ️ {result.details}
              </div>
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-xs text-blue-700 space-y-2">
            <p className="font-semibold">💡 Recomendación:</p>
            <p>Haz backup de trámites regularmente para proteger los datos de honorarios, vencimientos y otras configuraciones. Los archivos se guardan en la carpeta de cada trámite en Drive con nombre:</p>
            <p className="font-mono text-xs mt-2 bg-white p-2">backup-tramite-TR-XXXXX-YYYY-MM-DD.json</p>
            <p className="mt-2">Si pierdes datos de un trámite, puedes recuperarlos desde este archivo.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
