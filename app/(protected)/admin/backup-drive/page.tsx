'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'

export default function BackupDrivePage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  const handleBackup = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/backup-clientes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error en backup')
      }

      setResult(data)
      toast.success('✅ Backup completado en Google Drive')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Backup en Google Drive</h1>

        <div className="bg-white rounded-lg shadow p-8 space-y-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-green-800 text-sm font-semibold">✅ Protección Total de Datos</p>
            <p className="text-green-700 text-xs mt-2">
              Esta función guarda copias de todos tus clientes y trámites en Google Drive.
            </p>
          </div>

          <div className="space-y-2">
            <h2 className="font-semibold text-gray-900">¿Qué se guarda?</h2>
            <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm">
              <li>📁 <span className="font-semibold">Por cliente:</span> JSON en carpeta de cliente</li>
              <li>📋 <span className="font-semibold">Por trámite:</span> JSON en carpeta de trámite</li>
              <li>💾 <span className="font-semibold">Del sistema:</span> Backup completo en carpeta Backups</li>
              <li>🔄 Se actualiza automáticamente si ya existe</li>
            </ul>
          </div>

          <button
            onClick={handleBackup}
            disabled={loading}
            className={`w-full py-3 px-4 rounded-lg font-semibold transition ${
              loading
                ? 'bg-gray-400 text-white cursor-not-allowed'
                : 'bg-green-600 hover:bg-green-700 text-white'
            }`}
          >
            {loading ? '⏳ Haciendo backup...' : '💾 Hacer Backup Ahora'}
          </button>

          {result && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-2">
              <h3 className="font-semibold text-green-900">✅ Backup Completado</h3>
              <div className="text-sm text-green-800 space-y-1">
                <p>Clientes guardados: <span className="font-bold">{result.clientesBackup}</span></p>
                <p>Trámites guardados: <span className="font-bold">{result.tramitesBackup}</span></p>
                <p>Backup del sistema: <span className="font-bold">{result.sistemaBackup}</span></p>
                <p className="text-xs text-gray-600 mt-2">📅 {new Date(result.timestamp).toLocaleString('es-ES')}</p>
              </div>
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-xs text-blue-700 space-y-2">
            <p className="font-semibold">💡 Recomendación:</p>
            <p>Haz backup regularmente para proteger tus datos. Los archivos se guardan en:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Carpeta de cada cliente (backup individual)</li>
              <li>Carpeta de cada trámite (backup individual)</li>
              <li>Carpeta Backups (backup del sistema completo)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
