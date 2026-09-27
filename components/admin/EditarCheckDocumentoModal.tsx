'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'

interface TipoDocumento {
  id: string
  nombre: string
  descripcion?: string
  icono?: string
  color?: string
}

interface CheckDocumento {
  id: string
  nombre: string
  descripcion?: string
  tramiteConfigId: string
  tipoDocumentoId?: string
  tipoDocumento?: TipoDocumento
  orden?: number
  tipoVencimiento?: string
  diasCaducidad?: number
}

interface Props {
  isOpen: boolean
  documento: CheckDocumento | null
  tiposDocumento: TipoDocumento[]
  onClose: () => void
  onSave: (documento: CheckDocumento) => Promise<void>
}

export default function EditarCheckDocumentoModal({ isOpen, documento, tiposDocumento, onClose, onSave }: Props) {
  const [formData, setFormData] = useState<CheckDocumento | null>(null)
  const [saving, setSaving] = useState(false)

  if (!isOpen || !documento) return null

  const current = formData || documento

  const handleSave = async () => {
    if (!current.tipoDocumentoId) {
      toast.error('Debes seleccionar un tipo de documento')
      return
    }

    setSaving(true)
    try {
      await onSave(current)
      toast.success('✅ Documento actualizado')
      onClose()
    } catch (error) {
      toast.error('Error al guardar documento')
    } finally {
      setSaving(false)
    }
  }

  const handleClose = () => {
    setFormData(null)
    onClose()
  }

  const selectedTipo = tiposDocumento.find((t) => t.id === current.tipoDocumentoId)

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 p-8 max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Editar Documento</h2>

        <div className="space-y-6 mb-8">
          {/* Tipo de Documento - Select */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Documento *</label>
            <select
              value={current.tipoDocumentoId || ''}
              onChange={(e) => {
                const tipo = tiposDocumento.find((t) => t.id === e.target.value)
                setFormData({
                  ...current,
                  tipoDocumentoId: e.target.value,
                  nombre: tipo?.nombre || current.nombre,
                  descripcion: tipo?.descripcion || current.descripcion,
                })
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- Selecciona un tipo --</option>
              {tiposDocumento.map((tipo) => (
                <option key={tipo.id} value={tipo.id}>
                  {tipo.icono} {tipo.nombre}
                </option>
              ))}
            </select>
            {selectedTipo && (
              <p className="text-xs text-gray-600 mt-2">
                <strong>{selectedTipo.nombre}</strong>
                {selectedTipo.descripcion && ` - ${selectedTipo.descripcion}`}
              </p>
            )}
          </div>

          {/* Número de Orden */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Número de Orden</label>
            <input
              type="number"
              value={current.orden || 0}
              onChange={(e) => setFormData({ ...current, orden: parseInt(e.target.value) || 0 })}
              min="0"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Ej: 1"
            />
            <p className="text-xs text-gray-500 mt-1">Posición en el checklist</p>
          </div>

          {/* Tipo de Vencimiento */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Vencimiento</label>
            <select
              value={current.tipoVencimiento || ''}
              onChange={(e) => setFormData({ ...current, tipoVencimiento: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Sin caducidad</option>
              <option value="documento">📄 Caducidad de Documento (Ej: Apostillas)</option>
              <option value="requerimiento">📋 Plazo de Requerimiento (Ej: Pago de tasas)</option>
              <option value="accion">⏱️ Plazo de Acción (Ej: Interponer recurso)</option>
            </select>
          </div>

          {/* Días de Caducidad */}
          {current.tipoVencimiento && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Días de Caducidad</label>
              <input
                type="number"
                value={current.diasCaducidad || 0}
                onChange={(e) => setFormData({ ...current, diasCaducidad: parseInt(e.target.value) || 0 })}
                min="1"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Ej: 90"
              />
              <p className="text-xs text-gray-500 mt-1">Se calcula desde la fecha de vinculación del documento</p>
            </div>
          )}
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
