'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'

interface TipoDocumento {
  id: string
  nombre: string
  descripcion?: string
  icono?: string
  color?: string
  orden: number
  categoriaId?: string
}

const COLORES_PREDEFINIDOS = [
  { hex: '#ef4444', nombre: 'Rojo' },
  { hex: '#f97316', nombre: 'Naranja' },
  { hex: '#eab308', nombre: 'Amarillo' },
  { hex: '#22c55e', nombre: 'Verde' },
  { hex: '#06b6d4', nombre: 'Cian' },
  { hex: '#0ea5e9', nombre: 'Azul' },
  { hex: '#6366f1', nombre: 'Índigo' },
  { hex: '#a855f7', nombre: 'Púrpura' },
  { hex: '#d946ef', nombre: 'Magenta' },
  { hex: '#ec4899', nombre: 'Rosa' },
  { hex: '#64748b', nombre: 'Pizarra' },
  { hex: '#78716c', nombre: 'Marrón' },
  { hex: '#7c2d12', nombre: 'Marrón Oscuro' },
  { hex: '#1e40af', nombre: 'Azul Oscuro' },
  { hex: '#15803d', nombre: 'Verde Oscuro' },
  { hex: '#7c3aed', nombre: 'Violeta' },
  { hex: '#db2777', nombre: 'Rosado Fuerte' },
  { hex: '#0891b2', nombre: 'Cyan Oscuro' },
  { hex: '#059669', nombre: 'Esmeralda' },
  { hex: '#ea580c', nombre: 'Naranja Oscuro' },
]

const EMOTICONOS_PREDEFINIDOS = [
  '🧾', '📄', '📋', '📝', '✍️', '📑', '📃', '📰', '📊', '📈',
  '🗂️', '📁', '📂', '💼', '📇', '🗃️', '🗄️', '📦', '📮', '📬',
  '✅', '☑️', '✔️', '👍', '💯', '⭐', '🎯', '🎪', '🎨', '🎭',
]

interface Props {
  isOpen: boolean
  tipo: TipoDocumento | null
  onClose: () => void
  onSave: (tipo: TipoDocumento) => Promise<void>
}

export default function EditarTipoDocumentoModal({ isOpen, tipo, onClose, onSave }: Props) {
  const [formData, setFormData] = useState<TipoDocumento | null>(null)
  const [saving, setSaving] = useState(false)
  const [mostrarColores, setMostrarColores] = useState(false)
  const [mostrarEmoticonos, setMostrarEmoticonos] = useState(false)

  if (!isOpen) return null

  const current = formData || tipo || {
    id: `new-${Date.now()}`,
    nombre: '',
    descripcion: '',
    icono: '📄',
    color: '',
    orden: 0,
  }

  const handleSave = async () => {
    if (!current.nombre.trim()) {
      toast.error('El nombre es requerido')
      return
    }

    setSaving(true)
    try {
      await onSave(current)
      setFormData(null)
      setMostrarColores(false)
      setMostrarEmoticonos(false)
    } catch (error) {
      // Error ya manejado en onSave
    } finally {
      setSaving(false)
    }
  }

  const handleClose = () => {
    setFormData(null)
    setMostrarColores(false)
    setMostrarEmoticonos(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 p-8 max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          {tipo?.id.startsWith('new-') || !tipo ? '➕ Nuevo Tipo de Documento' : '✏️ Editar Tipo de Documento'}
        </h2>

        <div className="space-y-6 mb-8">
          {/* Nombre */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Nombre</label>
            <input
              type="text"
              value={current.nombre}
              onChange={(e) => setFormData({ ...current, nombre: e.target.value })}
              placeholder="Ej: Recibo, Resolución, Factura"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Descripción</label>
            <textarea
              value={current.descripcion || ''}
              onChange={(e) => setFormData({ ...current, descripcion: e.target.value })}
              placeholder="Descripción adicional"
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Icono */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Icono (emoji)</label>
            <div className="flex items-center gap-3 mb-4">
              <div className="text-5xl">{current.icono || '📄'}</div>
              <button
                type="button"
                onClick={() => setMostrarEmoticonos(!mostrarEmoticonos)}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg font-semibold"
              >
                {mostrarEmoticonos ? '✖️ Cerrar' : '🎨 Elegir'}
              </button>
            </div>
            {mostrarEmoticonos && (
              <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <p className="text-xs font-semibold text-gray-700 mb-3">Emojis sugeridos:</p>
                <div className="grid grid-cols-6 gap-2">
                  {EMOTICONOS_PREDEFINIDOS.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => {
                        setFormData({ ...current, icono: emoji })
                        setMostrarEmoticonos(false)
                      }}
                      className={`text-4xl p-2 rounded hover:bg-gray-200 transition ${
                        current.icono === emoji ? 'bg-blue-300' : ''
                      }`}
                      title={emoji}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Color */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Color</label>
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-16 h-12 rounded-lg border-2 border-gray-300 cursor-pointer"
                style={{
                  backgroundColor: current.color || '#e5e7eb',
                  borderColor: current.color ? current.color : '#d1d5db',
                }}
                onClick={() => setMostrarColores(!mostrarColores)}
                title="Click para abrir selector"
              />
              <button
                type="button"
                onClick={() => setMostrarColores(!mostrarColores)}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg font-semibold"
              >
                {mostrarColores ? '✖️ Cerrar' : '🎨 Elegir'}
              </button>
            </div>
            {current.color && (
              <p className="text-sm text-gray-600 mb-4">Seleccionado: {current.color}</p>
            )}
            {mostrarColores && (
              <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <p className="text-xs font-semibold text-gray-700 mb-3">Colores disponibles:</p>
                <div className="grid grid-cols-5 gap-3">
                  {COLORES_PREDEFINIDOS.map((c) => (
                    <button
                      key={c.hex}
                      type="button"
                      onClick={() => {
                        setFormData({ ...current, color: c.hex })
                        setMostrarColores(false)
                      }}
                      className={`p-4 rounded-lg border-2 transition cursor-pointer hover:scale-105 ${
                        current.color === c.hex ? 'border-gray-900 scale-110 ring-2 ring-gray-400' : 'border-gray-300'
                      }`}
                      style={{ backgroundColor: c.hex }}
                      title={c.nombre}
                    >
                      {current.color === c.hex && <span className="text-white font-bold">✓</span>}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Orden */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Número de Orden</label>
            <input
              type="number"
              value={current.orden}
              onChange={(e) => setFormData({ ...current, orden: parseInt(e.target.value) || 0 })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="0"
            />
            <p className="text-xs text-gray-500 mt-1">Determina el orden en el que aparecen en las listas</p>
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
