'use client'

import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { TRAMITE_CONFIGS } from '@/lib/tramite-config'
import EditarTramiteModal from './EditarTramiteModal'
import EditarCategoriaModal from './EditarCategoriaModal'

interface Categoria {
  id: string
  clave: string
  codigo: string
  nombre: string
  icono?: string
  color?: string
}

interface TramiteConfig {
  nombre: string
  descripcion: string
  categoria: string
  plantillasDisponibles: string[]
  camposRequeridos: string[]
  activo?: boolean
}

interface TramitesConfigMap {
  [key: string]: TramiteConfig
}

export default function TramitesConfigTab() {
  const [configs, setConfigs] = useState<TramitesConfigMap>({})
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [loadingCategorias, setLoadingCategorias] = useState(true)
  const [loadingConfigs, setLoadingConfigs] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedTramite, setSelectedTramite] = useState<string | null>(null)
  const [modalCategoriaOpen, setModalCategoriaOpen] = useState(false)
  const [selectedCategoria, setSelectedCategoria] = useState<Categoria | null>(null)

  useEffect(() => {
    loadCategorias()
    loadConfigs()
  }, [])

  const loadConfigs = async () => {
    try {
      const response = await fetch('/api/admin/tramites-config')
      if (response.ok) {
        const data = await response.json()
        if (data.configs && Object.keys(data.configs).length > 0) {
          setConfigs(data.configs)
        }
      }
    } catch (error) {
      console.error('Error loading configs:', error)
    } finally {
      setLoadingConfigs(false)
    }
  }

  const loadCategorias = async () => {
    try {
      const response = await fetch('/api/admin/categorias-tramite')
      if (response.ok) {
        const data = await response.json()
        setCategorias(data)
      }
    } catch (error) {
      console.error('Error loading categorias:', error)
    } finally {
      setLoadingCategorias(false)
    }
  }

  const handleEditarClick = (tramite: string) => {
    setSelectedTramite(tramite)
    setModalOpen(true)
  }

  const handleSaveConfig = async (tramite: string, config: TramiteConfig) => {
    // Detectar si cambió el nombre
    const oldNombre = configs[tramite]?.nombre
    const newNombre = config.nombre
    const nombreCambio = oldNombre && newNombre && oldNombre !== newNombre

    // Si cambió el nombre del tramite (tipoTramite), actualizar la clave del objeto
    if (nombreCambio) {
      setConfigs((prev) => {
        const updated = { ...prev }
        delete updated[tramite]
        updated[newNombre] = config
        return updated
      })

      // Llamar al endpoint PATCH para renombrar
      try {
        const patchResponse = await fetch('/api/admin/tramites-config', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            oldTipoTramite: tramite,
            newTipoTramite: newNombre,
          }),
        })

        if (!patchResponse.ok) throw new Error('Error al renombrar')
      } catch (error) {
        console.error('Error renombrando:', error)
        toast.error('Error al renombrar trámite')
        return
      }
    } else {
      setConfigs((prev) => ({
        ...prev,
        [tramite]: config,
      }))
    }

    try {
      const response = await fetch(`/api/admin/tramites-config/${newNombre || tramite}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      })

      if (!response.ok) throw new Error('Error al guardar')

      toast.success('✅ Configuración guardada automáticamente')
      // Recargar datos desde BD para asegurar sincronización
      await loadConfigs()
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error al guardar configuración')
    }
  }

  const handleDuplicar = async (tramite: string) => {
    const newName = `${tramite} (Copia)`
    const newConfig = { ...configs[tramite] }

    setConfigs((prev) => ({
      ...prev,
      [newName]: newConfig,
    }))

    toast.success(`✅ Trámite duplicado: ${newName}`)
  }

  const handleArchivar = async (tramite: string) => {
    const isCurrentlyActive = configs[tramite]?.activo !== false

    try {
      const response = await fetch('/api/admin/tramites-config/toggle-activo', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tipoTramite: tramite,
          activo: !isCurrentlyActive,
        }),
      })

      if (!response.ok) throw new Error('Error al cambiar estado')

      setConfigs((prev) => ({
        ...prev,
        [tramite]: {
          ...prev[tramite],
          activo: !isCurrentlyActive,
        },
      }))

      if (isCurrentlyActive) {
        toast.success(`📦 ${tramite} archivado`)
      } else {
        toast.success(`✅ ${tramite} restaurado`)
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error al cambiar estado de trámite')
    }
  }

  const handleNuevoTramite = async () => {
    const nombre = prompt('Nombre del nuevo trámite:')
    if (!nombre) return

    const newConfig: TramiteConfig = {
      nombre,
      descripcion: '',
      categoria: '',
      plantillasDisponibles: [],
      camposRequeridos: [],
    }

    setConfigs((prev) => ({
      ...prev,
      [nombre]: newConfig,
    }))

    try {
      await fetch('/api/admin/tramites-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ configs: { [nombre]: newConfig } }),
      })
      toast.success('✅ Nuevo trámite creado')
      // Recargar datos desde BD
      await loadConfigs()
    } catch (error) {
      toast.error('Error al crear trámite')
    }
  }

  const handleEditarCategoria = (categoria: Categoria) => {
    setSelectedCategoria(categoria)
    setModalCategoriaOpen(true)
  }

  const handleGuardarCategoria = async (categoria: Categoria) => {
    try {
      // Si es nueva (ID temporal), ya fue creada en el modal, solo agregar a la lista local
      if (categoria.id.startsWith('new-')) {
        // La categoría retornada del modal ya tiene el ID real
        setCategorias((prev) => [...prev, categoria])
      } else {
        // Actualizar categoría existente
        const response = await fetch(`/api/admin/categorias-tramite/${categoria.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(categoria),
        })

        if (!response.ok) throw new Error('Error al guardar')

        setCategorias((prev) =>
          prev.map((c) => (c.id === categoria.id ? categoria : c))
        )
      }
      setModalCategoriaOpen(false)
      setSelectedCategoria(null)
    } catch (error) {
      console.error('Error:', error)
      throw error
    }
  }

  const handleEliminarCategoria = async (categoria: Categoria) => {
    if (!confirm(`¿Eliminar la categoría "${categoria.nombre}"?`)) return

    try {
      const response = await fetch(`/api/admin/categorias-tramite/${categoria.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Error al eliminar')

      setCategorias((prev) => prev.filter((c) => c.id !== categoria.id))
      toast.success('✅ Categoría eliminada')
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error al eliminar categoría')
    }
  }

  const handleNuevaCategoria = () => {
    const newCategoria: Categoria = {
      id: `new-${Date.now()}`,
      clave: '',
      codigo: '',
      nombre: '',
      icono: '📌',
      color: '#3B82F6',
    }
    setSelectedCategoria(newCategoria)
    setModalCategoriaOpen(true)
  }

  const tramitesActivos = Object.entries(configs).filter(
    ([_, config]) => config.activo !== false
  )

  const tramitesArchivados = Object.entries(configs).filter(
    ([_, config]) => config.activo === false
  )

  const getCategoriaInfo = (categoriaClave: string) => {
    return categorias.find((cat) => cat.clave === categoriaClave)
  }

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">⚙️ Configuración de Trámites</h2>
          <p className="text-gray-600 text-sm mt-1">Gestiona los tipos de trámite disponibles</p>
        </div>
        <button
          onClick={handleNuevoTramite}
          className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition"
        >
          ➕ Nuevo Trámite
        </button>
      </div>

      {/* Tabla de Trámites */}
      <div className="bg-white rounded-lg shadow overflow-hidden mb-8">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Categoría</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Nombre del Trámite</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Descripción</th>
              <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {tramitesActivos.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                  No hay trámites configurados
                </td>
              </tr>
            ) : (
              tramitesActivos.map(([key, config]) => {
                const categoriaInfo = getCategoriaInfo(config.categoria)
                return (
                  <tr key={key} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      {categoriaInfo ? (
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{categoriaInfo.icono}</span>
                          <p className="text-sm font-semibold text-gray-900">{categoriaInfo.nombre}</p>
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">Sin categoría</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-gray-900">{config.nombre}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-600 truncate max-w-xs">{config.descripcion || '—'}</p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => handleEditarClick(key)}
                          className="px-3 py-1 text-sm bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-lg font-semibold transition"
                          title="Editar"
                        >
                          ✏️ Editar
                        </button>
                        <button
                          onClick={() => handleDuplicar(key)}
                          className="px-3 py-1 text-sm bg-purple-100 text-purple-700 hover:bg-purple-200 rounded-lg font-semibold transition"
                          title="Duplicar"
                        >
                          📋 Duplicar
                        </button>
                        <button
                          onClick={() => handleArchivar(key)}
                          className="px-3 py-1 text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg font-semibold transition"
                          title="Archivar"
                        >
                          📦 Archivar
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Sección de Configuración de Categorías */}
      <div className="bg-blue-50 rounded-lg border border-blue-200 p-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">🏷️ Categorías Disponibles</h3>
            <p className="text-sm text-gray-600">
              Las 7 categorías disponibles para clasificar los trámites
            </p>
          </div>
          <button
            onClick={handleNuevaCategoria}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition text-sm"
          >
            ➕ Nueva
          </button>
        </div>

        <div className="bg-white rounded-lg p-6 border border-gray-200 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {categorias.map((cat) => (
              <div
                key={cat.id}
                className="flex items-center justify-between gap-3 p-4 bg-gradient-to-r from-gray-50 to-white rounded-lg border border-gray-100 hover:shadow-md transition"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <span className="text-2xl flex-shrink-0">{cat.icono || '📌'}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-gray-900 truncate">{cat.nombre}</p>
                    <p className="text-xs text-gray-500 font-mono">{cat.codigo}</p>
                  </div>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <button
                    onClick={() => handleEditarCategoria(cat)}
                    className="px-2 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded font-semibold transition"
                    title="Editar"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleEliminarCategoria(cat)}
                    className="px-2 py-1 text-sm text-red-600 hover:bg-red-50 rounded font-semibold transition"
                    title="Eliminar"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {tramitesArchivados.length > 0 && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">📦 Trámites Archivados ({tramitesArchivados.length})</h4>
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="space-y-2">
                {tramitesArchivados.map(([key, config]) => (
                  <div key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-medium text-gray-700">{key}</span>
                      <p className="text-xs text-gray-500">{config.descripcion || '—'}</p>
                    </div>
                    <button
                      onClick={() => handleArchivar(key)}
                      className="ml-3 flex-shrink-0 text-xs px-3 py-1 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded font-semibold transition"
                    >
                      ↩️ Restaurar
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal de Edición de Trámite */}
      <EditarTramiteModal
        isOpen={modalOpen}
        tramite={selectedTramite}
        config={selectedTramite ? configs[selectedTramite] : null}
        categorias={categorias}
        onClose={() => {
          setModalOpen(false)
          setSelectedTramite(null)
        }}
        onSave={handleSaveConfig}
      />

      {/* Modal de Edición de Categoría */}
      <EditarCategoriaModal
        isOpen={modalCategoriaOpen}
        categoria={selectedCategoria}
        onClose={() => {
          setModalCategoriaOpen(false)
          setSelectedCategoria(null)
        }}
        onSave={handleGuardarCategoria}
      />
    </div>
  )
}
