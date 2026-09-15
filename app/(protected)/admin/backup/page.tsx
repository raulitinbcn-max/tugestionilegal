'use client'

import { useState } from 'react'
import { toast } from 'react-hot-toast'
import { CloudArrowUpIcon, CheckCircleIcon } from '@heroicons/react/24/outline'

export default function BackupPage() {
  const [loading, setLoading] = useState(false)
  const [lastBackup, setLastBackup] = useState<string | null>(null)

  const handleBackup = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/backup-oauth', {
        method: 'POST',
      })

      const data = await response.json()

      if (data.success) {
        setLastBackup(new Date(data.timestamp).toLocaleString('es-ES'))
        toast.success(
          `✅ Backup completado\n${data.fileName}\nÚltimos ${data.backupsRemaining} de 10`
        )
      } else {
        toast.error(`❌ ${data.error || 'Error en backup'}`)
      }
    } catch (error) {
      toast.error(`❌ Error al conectar: ${String(error)}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="flex items-center gap-3 mb-6">
            <CloudArrowUpIcon className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Backup a Google Drive</h1>
          </div>

          <p className="text-gray-600 mb-6">
            Crea un backup completo del sistema (configuración, clientes, trámites, documentos) en Google Drive.
          </p>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-800">
              <strong>ℹ️ Sistema automático:</strong> Los backups se crean automáticamente cada vez que inicias sesión.
              Esta página es para hacer backup manual bajo demanda.
            </p>
          </div>

          <button
            onClick={handleBackup}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-4 rounded-lg transition flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                Creando backup...
              </>
            ) : (
              <>
                <CloudArrowUpIcon className="w-5 h-5" />
                Hacer Backup Ahora
              </>
            )}
          </button>

          {lastBackup && (
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
              <CheckCircleIcon className="w-6 h-6 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-green-900">Último backup completado</p>
                <p className="text-sm text-green-700">{lastBackup}</p>
              </div>
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">¿Qué se guarda?</h2>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center gap-2">
                <span className="text-blue-600">✓</span> Categorías de trámites
              </li>
              <li className="flex items-center gap-2">
                <span className="text-blue-600">✓</span> Tipos de trámites configurados
              </li>
              <li className="flex items-center gap-2">
                <span className="text-blue-600">✓</span> Tipos de documentos
              </li>
              <li className="flex items-center gap-2">
                <span className="text-blue-600">✓</span> Checklist de documentos
              </li>
              <li className="flex items-center gap-2">
                <span className="text-blue-600">✓</span> Plantillas
              </li>
              <li className="flex items-center gap-2">
                <span className="text-blue-600">✓</span> Tasas
              </li>
              <li className="flex items-center gap-2">
                <span className="text-blue-600">✓</span> Todos los clientes
              </li>
              <li className="flex items-center gap-2">
                <span className="text-blue-600">✓</span> Todos los trámites
              </li>
              <li className="flex items-center gap-2">
                <span className="text-blue-600">✓</span> Historial de cambios
              </li>
              <li className="flex items-center gap-2">
                <span className="text-blue-600">✓</span> Documentos y documentos generados
              </li>
            </ul>

            <p className="text-xs text-gray-500 mt-4">
              Se mantienen los últimos 10 backups automáticamente.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
