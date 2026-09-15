'use client'

import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'

interface Categoria {
  id: string
  clave: string
  codigo: string
  nombre: string
  icono?: string
}

interface TramiteConfig {
  nombre: string
  descripcion: string
  categoria: string
  plantillasDisponibles: string[]
  camposRequeridos: string[]
}

interface EditarTramiteModalProps {
  isOpen: boolean
  tramite: string | null
  config: TramiteConfig | null
  categorias: Categoria[]
  onClose: () => void
  onSave: (tramite: string, config: TramiteConfig) => Promise<void>
}

export default function EditarTramiteModal({
  isOpen,
  tramite,
  config,
  categorias,
  onClose,
  onSave,
}: EditarTramiteModalProps) {
  const [formData, setFormData] = useState<TramiteConfig | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (config) {
      setFormData(config)
    }
  }, [config])

  const handleSave = async () => {
    if (!formData || !tramite) return

    setSaving(true)
    try {
      await onSave(tramite, formData)
      toast.success('✅ Trámite guardado')
      onClose()
    } catch (error) {
      toast.error('Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  if (!isOpen || !formData) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Editar Trámite</h2>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Nombre del Trámite</label>
            <input
              type="text"
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Descripción</label>
            <textarea
              value={formData.descripcion}
              onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">🏷️ Categoría</label>
            <select
              value={formData.categoria || ''}
              onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Seleccionar categoría...</option>
              {categorias.map((cat) => (
                <option key={cat.id} value={cat.clave}>
                  {cat.icono} {cat.nombre} ({cat.codigo})
                </option>
              ))}
            </select>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">
              <strong>📋 Plantillas Disponibles:</strong> {formData.plantillasDisponibles.length}
            </p>
            <p className="text-xs text-gray-500 mt-1">Gestiona en la pestaña "Plantillas"</p>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">
              <strong>✅ Campos Requeridos:</strong> {formData.camposRequeridos.length}
            </p>
            <p className="text-xs text-gray-500 mt-1">Solo lectura - Edita en código</p>
          </div>
        </div>

        <div className="flex gap-4 mt-8">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition"
          >
            {saving ? 'Guardando...' : '💾 Guardar'}
          </button>
        </div>
      </div>
    </div>
  )
}
