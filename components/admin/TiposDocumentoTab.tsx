'use client'

import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import EditarTipoDocumentoModal from './EditarTipoDocumentoModal'

interface Categoria {
  id: string
  clave: string
  codigo: string
  nombre: string
  icono?: string
  color?: string
}

interface TipoDocumento {
  id: string
  nombre: string
  descripcion?: string
  icono?: string
  color?: string
  orden: number
  categoriaId?: string
}

export default function TiposDocumentoTab() {
  const [tipos, setTipos] = useState<TipoDocumento[]>([])
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [selectedCategoria, setSelectedCategoria] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [loadingCategorias, setLoadingCategorias] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedTipo, setSelectedTipo] = useState<TipoDocumento | null>(null)

  useEffect(() => {
    fetchCategorias()
    fetchTipos()
  }, [])

  useEffect(() => {
    fetchTipos()
  }, [selectedCategoria])

  const fetchCategorias = async () => {
    try {
      const response = await fetch('/api/admin/categorias-tramite')
      if (response.ok) {
        const data = await response.json()
        setCategorias(data)
        if (data.length > 0) {
          setSelectedCategoria(data[0].id)
        }
      }
    } catch (error) {
      console.error('Error loading categorias:', error)
    } finally {
      setLoadingCategorias(false)
    }
  }

  const fetchTipos = async () => {
    try {
      const res = await fetch('/api/admin/tipos-documento')
      const data = await res.json()

      // Filtrar: mostrar tipos globales (sin categoría) + tipos de la categoría seleccionada
      const filtered = data.filter((tipo: TipoDocumento) =>
        !tipo.categoriaId || tipo.categoriaId === selectedCategoria
      )

      setTipos(filtered.sort((a: TipoDocumento, b: TipoDocumento) => a.orden - b.orden))
    } catch (error) {
      toast.error('Error al cargar tipos de documento')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleNuevoTipo = () => {
    const newTipo: TipoDocumento = {
      id: `new-${Date.now()}`,
      nombre: '',
      descripcion: '',
      icono: '📄',
      color: '#3B82F6',
      orden: tipos.length,
      categoriaId: selectedCategoria,
    }
    setSelectedTipo(newTipo)
    setModalOpen(true)
  }

  const handleEditarTipo = (tipo: TipoDocumento) => {
    setSelectedTipo(tipo)
    setModalOpen(true)
  }

  const handleGuardarTipo = async (tipo: TipoDocumento) => {
    try {
      const payload = {
        nombre: tipo.nombre,
        descripcion: tipo.descripcion || null,
        icono: tipo.icono || null,
        color: tipo.color || null,
        orden: tipo.orden || 0,
        categoriaId: tipo.categoriaId || null,
      }

      let res
      if (tipo.id.startsWith('new-')) {
        res = await fetch('/api/admin/tipos-documento', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      } else {
        res = await fetch(`/api/admin/tipos-documento/${tipo.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      }

      if (!res.ok) {
        throw new Error(await res.text())
      }

      toast.success(tipo.id.startsWith('new-') ? '✅ Tipo creado' : '✅ Tipo actualizado')
      setModalOpen(false)
      setSelectedTipo(null)
      await fetchTipos()
    } catch (error) {
      toast.error('Error al guardar tipo')
      console.error(error)
      throw error
    }
  }

  const handleEliminarTipo = async (id: string) => {
    if (!confirm('¿Eliminar este tipo de documento?')) return

    try {
      const res = await fetch(`/api/admin/tipos-documento/${id}`, {
        method: 'DELETE',
      })

      if (!res.ok) throw new Error(await res.text())

      toast.success('✅ Tipo eliminado')
      await fetchTipos()
    } catch (error) {
      toast.error('Error al eliminar tipo')
      console.error(error)
    }
  }

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Cargando tipos de documento...</div>
  }

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">📄 Tipos de Documento</h2>
          <p className="text-gray-600 text-sm mt-1">Gestiona los tipos de documentos disponibles en el sistema</p>
        </div>
        <button
          onClick={handleNuevoTipo}
          className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition"
        >
          ➕ Nuevo Tipo
        </button>
      </div>

      {/* Filtro de Categoría */}
      {!loadingCategorias && categorias.length > 0 && (
        <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <label className="block text-sm font-semibold text-gray-900 mb-2">Filtrar por Categoría</label>
          <select
            value={selectedCategoria}
            onChange={(e) => setSelectedCategoria(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm"
          >
            {categorias.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.icono} {cat.nombre}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Tabla de Tipos */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Icono</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Nombre</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Descripción</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Color</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Orden</th>
              <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {tipos.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                  No hay tipos de documento configurados
                </td>
              </tr>
            ) : (
              tipos.map((tipo) => (
                <tr key={tipo.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4">
                    <span className="text-2xl">{tipo.icono || '📄'}</span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-semibold text-gray-900">{tipo.nombre}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-600 max-w-xs truncate">{tipo.descripcion || '—'}</p>
                  </td>
                  <td className="px-6 py-4">
                    {tipo.color ? (
                      <div className="flex items-center gap-2">
                        <div
                          className="w-6 h-6 rounded border border-gray-300"
                          style={{ backgroundColor: tipo.color }}
                        />
                        <span className="text-xs text-gray-600 font-mono">{tipo.color}</span>
                      </div>
                    ) : (
                      <span className="text-gray-400 text-sm">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-semibold text-gray-900">{tipo.orden}</p>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => handleEditarTipo(tipo)}
                        className="px-3 py-1 text-sm bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-lg font-semibold transition"
                      >
                        ✏️ Editar
                      </button>
                      <button
                        onClick={() => handleEliminarTipo(tipo.id)}
                        className="px-3 py-1 text-sm bg-red-100 text-red-700 hover:bg-red-200 rounded-lg font-semibold transition"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal de Edición/Creación */}
      <EditarTipoDocumentoModal
        isOpen={modalOpen}
        tipo={selectedTipo}
        onClose={() => {
          setModalOpen(false)
          setSelectedTipo(null)
        }}
        onSave={handleGuardarTipo}
      />
    </div>
  )
}
