'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'

interface Props {
  tramiteId: string
  visible: boolean
  onCreated?: () => void
}

export default function AlertaCarpetaDrivePendiente({ tramiteId, visible, onCreated }: Props) {
  const [creating, setCreating] = useState(false)

  if (!visible) return null

  const crearCarpeta = async () => {
    setCreating(true)
    try {
      const response = await fetch('/api/tramites/crear-carpeta-drive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tramiteId }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Error al crear carpeta')
      }

      toast.success('✅ Carpeta en Google Drive creada correctamente')
      onCreated?.()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al crear carpeta en Drive')
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg mb-6">
      <div className="flex items-start">
        <div className="flex-1">
          <p className="text-yellow-800 font-semibold">⚠️ Carpeta en Google Drive Pendiente</p>
          <p className="text-yellow-700 text-sm mt-1">
            No se pudo crear la carpeta en Google Drive automáticamente. Haz clic en el botón para crearla ahora.
          </p>
        </div>
        <button
          onClick={crearCarpeta}
          disabled={creating}
          className="ml-4 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition whitespace-nowrap text-sm"
        >
          {creating ? 'Creando...' : '📁 Crear Carpeta'}
        </button>
      </div>
    </div>
  )
}
