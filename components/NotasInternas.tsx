'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'

interface Props {
  tramiteId: string
  notasIniciales?: string | null
}

export default function NotasInternas({ tramiteId, notasIniciales }: Props) {
  const [notas, setNotas] = useState(notasIniciales || '')
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const response = await fetch(`/api/tramites/${tramiteId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notas }),
      })

      if (!response.ok) throw new Error('Error al guardar')

      toast.success('✅ Notas guardadas')
      setIsEditing(false)
    } catch (error) {
      toast.error('Error al guardar notas')
      console.error(error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setNotas(notasIniciales || '')
    setIsEditing(false)
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">📝 Notas Internas</h3>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="text-xs px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition"
          >
            Editar
          </button>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-3">
          <textarea
            value={notas}
            onChange={(e) => setNotas(e.target.value)}
            placeholder="Añade notas internas sobre este expediente..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-32 font-sm resize-none"
          />
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition"
            >
              {isSaving ? 'Guardando...' : 'Guardar'}
            </button>
            <button
              onClick={handleCancel}
              disabled={isSaving}
              className="px-4 py-2 bg-gray-400 hover:bg-gray-500 disabled:bg-gray-300 text-white font-semibold rounded-lg transition"
            >
              Cancelar
            </button>
          </div>
        </div>
      ) : (
        <div className="text-sm text-gray-700 whitespace-pre-wrap">
          {notas ? (
            notas
          ) : (
            <p className="text-gray-500 italic">Sin notas internas</p>
          )}
        </div>
      )}
    </div>
  )
}
