'use client'

import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'

interface Categoria {
  id: string
  clave: string
  codigo: string
  nombre: string
  descripcion?: string
  icono?: string
  color?: string
  orden: number
}

const EMOJIS = ['🌍', '✈️', '🇪🇸', '🚗', '💼', '💰', '📌', '📋', '🏛️', '⚖️', '🔐', '🎓']
const COLORES = [
  '#3b82f6', '#06b6d4', '#ec4899', '#f59e0b', '#8b5cf6', '#10b981',
  '#6b7280', '#ef4444', '#f97316', '#6366f1', '#14b8a6', '#d97706'
]

export default function CategoriasTab() {
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [nuevaCategoria, setNuevaCategoria] = useState({
    clave: '',
    codigo: '',
    nombre: '',
    descripcion: '',
    icono: '📌',
    color: '#3b82f6',
    orden: 0,
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadCategorias()
    // Intentar inicializar si no hay categorías
    checkAndInitialize()
  }, [])

  const checkAndInitialize = async () => {
    try {
      const response = await fetch('/api/admin/categorias-tramite')
      if (response.ok) {
        const data = await response.json()
        if (data.length === 0) {
          // Si no hay categorías, inicializar automáticamente
          await fetch('/api/admin/init-categorias', { method: 'POST' })
          await loadCategorias()
        }
      }
    } catch (error) {
      console.error('Error checking categorias:', error)
    }
  }

  const loadCategorias = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/categorias-tramite')
      if (response.ok) {
        const data = await response.json()
        setCategorias(data)
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error cargando categorías')
    } finally {
      setLoading(false)
    }
  }

  const agregarCategoria = async () => {
    if (!nuevaCategoria.nombre || !nuevaCategoria.codigo || !nuevaCategoria.clave) {
      toast.error('Completa los campos requeridos')
      return
    }

    setSaving(true)
    try {
      const response = await fetch('/api/admin/categorias-tramite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...nuevaCategoria,
          orden: parseInt(nuevaCategoria.orden.toString()),
        }),
      })

      if (!response.ok) throw new Error('Error agregando')

      toast.success('✅ Categoría agregada')
      setNuevaCategoria({
        clave: '',
        codigo: '',
        nombre: '',
        descripcion: '',
        icono: '📌',
        color: '#3b82f6',
        orden: 0,
      })
      await loadCategorias()
    } catch (error) {
      toast.error('Error agregando categoría')
    } finally {
      setSaving(false)
    }
  }

  const actualizarCategoria = async (id: string, updates: Partial<Categoria>) => {
    try {
      const response = await fetch(`/api/admin/categorias-tramite/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })

      if (!response.ok) throw new Error('Error actualizando')

      toast.success('✅ Actualizado')
      setEditingId(null)
      await loadCategorias()
    } catch (error) {
      toast.error('Error actualizando categoría')
    }
  }

  const eliminarCategoria = async (id: string) => {
    if (!confirm('¿Eliminar esta categoría?')) return

    try {
      const response = await fetch(`/api/admin/categorias-tramite/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Error eliminando')

      toast.success('✅ Eliminado')
      await loadCategorias()
    } catch (error) {
      toast.error('Error eliminando categoría')
    }
  }

  const inicializarCategorias = async () => {
    setSaving(true)
    try {
      const response = await fetch('/api/admin/init-categorias', {
        method: 'POST',
      })

      if (!response.ok) throw new Error('Error inicializando')

      const data = await response.json()
      toast.success(`✅ ${data.created} categorías creadas`)
      await loadCategorias()
    } catch (error) {
      toast.error('Error inicializando categorías')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="p-8 text-center">Cargando...</div>

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">🏷️ Categorías de Trámites</h2>
          <p className="text-gray-600 text-sm">Gestiona las 7 categorías principales de trámites.</p>
        </div>
        {categorias.length === 0 && (
          <button
            onClick={inicializarCategorias}
            disabled={saving}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition"
          >
            {saving ? 'Inicializando...' : '🚀 Crear 7 Categorías'}
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Panel: Agregar */}
        <div className="lg:col-span-1 bg-gradient-to-b from-blue-50 to-white rounded-lg shadow p-6 border-l-4 border-blue-500 h-fit">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Agregar Categoría</h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Clave (ID)</label>
              <input
                type="text"
                value={nuevaCategoria.clave}
                onChange={(e) => setNuevaCategoria({ ...nuevaCategoria, clave: e.target.value.toUpperCase() })}
                placeholder="Ej: EXTRANJERIA"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Código (Prefijo)</label>
              <input
                type="text"
                value={nuevaCategoria.codigo}
                onChange={(e) => setNuevaCategoria({ ...nuevaCategoria, codigo: e.target.value.toUpperCase() })}
                placeholder="Ej: EX-"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nombre</label>
              <input
                type="text"
                value={nuevaCategoria.nombre}
                onChange={(e) => setNuevaCategoria({ ...nuevaCategoria, nombre: e.target.value })}
                placeholder="Ej: Extranjería General"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Descripción (opcional)</label>
              <textarea
                value={nuevaCategoria.descripcion}
                onChange={(e) => setNuevaCategoria({ ...nuevaCategoria, descripcion: e.target.value })}
                placeholder="Detalles"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                rows={2}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Emoji</label>
              <div className="grid grid-cols-6 gap-2">
                {EMOJIS.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => setNuevaCategoria({ ...nuevaCategoria, icono: emoji })}
                    className={`text-2xl p-2 rounded-lg transition ${
                      nuevaCategoria.icono === emoji
                        ? 'bg-blue-600 ring-2 ring-blue-400'
                        : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
              <div className="grid grid-cols-6 gap-2">
                {COLORES.map((color) => (
                  <button
                    key={color}
                    onClick={() => setNuevaCategoria({ ...nuevaCategoria, color })}
                    className={`w-full h-10 rounded-lg transition ring-offset-2 ${
                      nuevaCategoria.color === color ? 'ring-2 ring-gray-400' : ''
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              <input
                type="text"
                value={nuevaCategoria.color}
                onChange={(e) => setNuevaCategoria({ ...nuevaCategoria, color: e.target.value })}
                className="w-full mt-2 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-sm"
              />
            </div>

            <button
              onClick={agregarCategoria}
              disabled={saving}
              className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition"
            >
              {saving ? 'Agregando...' : '✅ Agregar'}
            </button>
          </div>
        </div>

        {/* Panel: Listado */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Categorías ({categorias.length})
          </h3>

          {categorias.length === 0 ? (
            <p className="text-gray-600 text-center py-8">No hay categorías configuradas</p>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {categorias.map((cat) => (
                <div
                  key={cat.id}
                  className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white rounded-lg border border-gray-200 hover:shadow-md transition"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div
                      className="text-2xl flex-shrink-0"
                      title={cat.nombre}
                    >
                      {cat.icono || '📌'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 truncate">{cat.nombre}</p>
                      <div className="flex items-center gap-2 flex-wrap mt-1">
                        <span className="text-xs px-2 py-1 bg-gray-200 text-gray-700 rounded font-mono">
                          {cat.clave}
                        </span>
                        <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-800 rounded font-mono font-bold">
                          {cat.codigo}
                        </span>
                        <span
                          className="text-xs px-2 py-1 rounded text-white font-mono"
                          style={{ backgroundColor: cat.color || '#3b82f6' }}
                        >
                          #{cat.color?.slice(1).toUpperCase()}
                        </span>
                      </div>
                      {cat.descripcion && (
                        <p className="text-xs text-gray-600 mt-1">{cat.descripcion}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0 ml-4">
                    <button
                      onClick={() => eliminarCategoria(cat.id)}
                      className="px-3 py-1 text-red-600 hover:bg-red-50 rounded font-semibold text-sm transition"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
