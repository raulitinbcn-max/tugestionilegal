'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'

interface Categoria {
  id: string
  clave: string
  codigo: string
  nombre: string
  icono?: string
  color?: string
}

const EMOJI_ICONS = [
  '📌', '🏷️', '📋', '📂', '📑', '📊', '📈', '📉', '💼', '👔',
  '📚', '🎓', '🏛️', '🏢', '🏠', '🌍', '✈️', '🚗', '🚢', '🎯',
  '⚖️', '💰', '📞', '📧', '🔒', '🔑', '🎁', '💳', '🧑', '👨‍⚖️'
]

interface Props {
  isOpen: boolean
  categoria: Categoria | null
  onClose: () => void
  onSave: (categoria: Categoria) => Promise<void>
}

export default function EditarCategoriaModal({ isOpen, categoria, onClose, onSave }: Props) {
  const [formData, setFormData] = useState<Categoria | null>(null)
  const [saving, setSaving] = useState(false)

  if (!isOpen || !categoria) return null

  const current = formData || categoria

  const handleSave = async () => {
    if (!current.nombre || !current.codigo) {
      toast.error('Nombre y código son requeridos')
      return
    }

    setSaving(true)
    try {
      // Si es nueva categoría (ID empieza con 'new-'), crear en lugar de actualizar
      if (current.id.startsWith('new-')) {
        // Generar clave automática desde el código (sin guión)
        const clave = current.codigo.replace('-', '')
        const categoryData = {
          ...current,
          clave,
        }
        delete (categoryData as any).id // No enviar el ID temporal

        const response = await fetch('/api/admin/categorias-tramite', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(categoryData),
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || 'Error al crear categoría')
        }

        const newCategoria = await response.json()
        await onSave(newCategoria)
        toast.success('✅ Categoría creada')
      } else {
        await onSave(current)
        toast.success('✅ Categoría actualizada')
      }
      onClose()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al guardar categoría'
      toast.error(message)
    } finally {
      setSaving(false)
    }
  }

  const handleClose = () => {
    setFormData(null)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 p-8 max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Editar Categoría: {current.nombre}</h2>

        <div className="space-y-6 mb-8">
          {/* Nombre */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Nombre</label>
            <input
              type="text"
              value={current.nombre}
              onChange={(e) => setFormData({ ...current, nombre: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Ej: Extranjería"
            />
          </div>

          {/* Código */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Código</label>
            <input
              type="text"
              value={current.codigo}
              onChange={(e) => setFormData({ ...current, codigo: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono uppercase"
              placeholder="Ej: EX-"
              maxLength={10}
            />
            <p className="text-xs text-gray-500 mt-1">Ej: EX-, MI-, NE-, DGT-, LAB-, FIS-, TR-</p>
          </div>

          {/* Clave (Solo lectura) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Clave (Solo lectura)</label>
            <input
              type="text"
              value={current.clave}
              disabled
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 font-mono uppercase"
            />
            <p className="text-xs text-gray-500 mt-1">Identificador único del sistema</p>
          </div>

          {/* Emoji/Icono */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Icono</label>
            <div className="flex items-center gap-3 mb-4">
              <div className="text-4xl">{current.icono || '📌'}</div>
              <input
                type="text"
                value={current.icono || ''}
                onChange={(e) => setFormData({ ...current, icono: e.target.value })}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Pega un emoji aquí"
                maxLength={2}
              />
            </div>
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <p className="text-xs font-semibold text-gray-700 mb-3">Emojis sugeridos:</p>
              <div className="grid grid-cols-6 gap-2">
                {EMOJI_ICONS.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => setFormData({ ...current, icono: emoji })}
                    className="text-2xl p-2 rounded hover:bg-gray-200 transition text-center"
                    title={emoji}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Color (Opcional) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Color (Opcional)</label>
            <input
              type="color"
              value={current.color || '#3B82F6'}
              onChange={(e) => setFormData({ ...current, color: e.target.value })}
              className="w-12 h-10 border border-gray-300 rounded-lg cursor-pointer"
            />
            <p className="text-xs text-gray-500 mt-1">Usado para identificar visualmente la categoría</p>
          </div>
        </div>

        <div className="flex gap-4">
          <button
            onClick={handleClose}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition"
          >
            {saving ? 'Guardando...' : '✅ Guardar'}
          </button>
        </div>
      </div>
    </div>
  )
}
