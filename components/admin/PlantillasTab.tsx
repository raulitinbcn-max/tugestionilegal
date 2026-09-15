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
  descripcion?: string
  categoria?: string
}

interface PlantillaDisponible {
  id: string
  nombre: string
  driveFileId: string
}

interface PlantillaRegistrada {
  id: string
  nombre: string
  tipo: string
  tipoTramite: string
  driveFileId: string
}

interface PlantillaAgrupada {
  nombre: string
  driveFileId: string
  tipo: string // Un único tipo de documento por plantilla
  asociaciones: PlantillaRegistrada[] // Todos los trámites asociados
}

export default function PlantillasTab() {
  const [plantillasDisponibles, setPlantillasDisponibles] = useState<PlantillaDisponible[]>([])
  const [plantillasRegistradas, setPlantillasRegistradas] = useState<PlantillaRegistrada[]>([])
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [tramitesConfig, setTramitesConfig] = useState<Record<string, TramiteConfig>>({})
  const [loading, setLoading] = useState(true)
  const [selectedPlantilla, setSelectedPlantilla] = useState<string>('')
  const [selectedTipo, setSelectedTipo] = useState<string>('mandato')
  const [selectedTramites, setSelectedTramites] = useState<Set<string>>(new Set())
  const [saving, setSaving] = useState(false)
  const [editingAsociacion, setEditingAsociacion] = useState<PlantillaRegistrada | null>(null)
  const [editFormData, setEditFormData] = useState<Partial<PlantillaRegistrada> | null>(null)

  const TIPOS = ['mandato', 'contrato', 'fraccionamiento', 'factura', 'autorizacion', 'renuncia', 'recibo']

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/list-plantillas-drive')
      const data = await response.json()

      if (data.error) {
        console.warn('Aviso al cargar plantillas de Drive:', data.error)
      }

      setPlantillasDisponibles(data.plantillas || data || [])

      const registradasResponse = await fetch('/api/admin/plantillas-registradas')
      if (registradasResponse.ok) {
        const registradasData = await registradasResponse.json()
        setPlantillasRegistradas(registradasData)
      }

      const categoriasResponse = await fetch('/api/admin/categorias-tramite')
      if (categoriasResponse.ok) {
        const categoriasData = await categoriasResponse.json()
        setCategorias(categoriasData)
      }

      const tramitesResponse = await fetch('/api/admin/tramites-config')
      if (tramitesResponse.ok) {
        const tramitesData = await tramitesResponse.json()
        setTramitesConfig(tramitesData.configs || {})
      }
    } catch (error) {
      console.error('Error cargando:', error)
      toast.error('Error cargando plantillas')
    } finally {
      setLoading(false)
    }
  }

  const getCategoriaDelTramite = (tipoTramite: string) => {
    const config = tramitesConfig[tipoTramite]
    return categorias.find((c) => c.clave === config?.categoria)
  }

  // Agrupar plantillas registradas por nombre (un único tipo de documento por plantilla)
  const plantillasAgrupadas: PlantillaAgrupada[] = Array.from(
    plantillasRegistradas.reduce((map, p) => {
      if (!map.has(p.nombre)) {
        map.set(p.nombre, {
          nombre: p.nombre,
          driveFileId: p.driveFileId,
          tipo: p.tipo,
          asociaciones: [],
        })
      }
      map.get(p.nombre)!.asociaciones.push(p)
      return map
    }, new Map<string, PlantillaAgrupada>())
  ).map(([_, v]) => v)

  // Combinar plantillas disponibles (de Drive) con asociadas, mostrando todas
  const todasLasPlantillas: PlantillaAgrupada[] = plantillasDisponibles.map((p) => {
    const existente = plantillasAgrupadas.find((a) => a.nombre === p.nombre)
    return existente || {
      nombre: p.nombre,
      driveFileId: p.driveFileId,
      tipo: '',
      asociaciones: [],
    }
  })

  const toggleTramite = (tramite: string) => {
    setSelectedTramites((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(tramite)) {
        newSet.delete(tramite)
      } else {
        newSet.add(tramite)
      }
      return newSet
    })
  }

  const handleAsociarPlantilla = async () => {
    if (!selectedPlantilla) {
      toast.error('Selecciona una plantilla')
      return
    }

    setSaving(true)
    try {
      const plantilla = plantillasDisponibles.find((p) => p.nombre === selectedPlantilla)
      if (!plantilla) throw new Error('Plantilla no encontrada')

      if (selectedTramites.size === 0) {
        // Guardar sin asociación
        toast.success('✅ Plantilla guardada sin asociaciones')
        setSelectedPlantilla('')
        setSelectedTramites(new Set())
        setSelectedTipo('mandato')
        await loadData()
        setSaving(false)
        return
      }

      const promises = Array.from(selectedTramites).map((tipoTramite) =>
        fetch('/api/admin/plantillas-registradas', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nombre: selectedPlantilla,
            tipo: selectedTipo,
            tipoTramite,
            driveFileId: plantilla.driveFileId,
          }),
        })
      )

      const results = await Promise.all(promises)
      if (!results.every((r) => r.ok)) throw new Error('Error registrando plantilla')

      toast.success(`✅ Plantilla asociada a ${selectedTramites.size} trámite(s)`)
      setSelectedPlantilla('')
      setSelectedTramites(new Set())
      setSelectedTipo('mandato')
      await loadData()
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error registrando plantilla')
    } finally {
      setSaving(false)
    }
  }

  const handleEditarAsociacion = (asociacion: PlantillaRegistrada) => {
    setEditingAsociacion(asociacion)
    setEditFormData({ ...asociacion })
    // Inicializar los trámites seleccionados con los actuales
    const plantillaAgrupada = plantillasAgrupadas.find((p) => p.nombre === asociacion.nombre)
    if (plantillaAgrupada) {
      const tramitesAsociados = new Set<string>()
      plantillaAgrupada.asociaciones.forEach((a) => {
        tramitesAsociados.add(a.tipoTramite)
      })
      setSelectedTramites(tramitesAsociados)
    }
  }

  const handleGuardarEdicion = async () => {
    if (!editFormData || !editingAsociacion) return

    setSaving(true)
    try {
      // Obtener todas las asociaciones actuales de esta plantilla
      const plantillaAgrupada = plantillasAgrupadas.find((p) => p.nombre === editingAsociacion.nombre)

      // Eliminar todas las asociaciones anteriores (si las hay)
      if (plantillaAgrupada && plantillaAgrupada.asociaciones.length > 0) {
        await Promise.all(
          plantillaAgrupada.asociaciones.map((a) =>
            fetch(`/api/admin/plantillas-registradas/${a.id}`, { method: 'DELETE' })
          )
        )
      }

      // Crear nuevas asociaciones con los trámites seleccionados
      if (selectedTramites.size > 0) {
        const promises = Array.from(selectedTramites).map((tipoTramite) =>
          fetch('/api/admin/plantillas-registradas', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              nombre: editFormData.nombre,
              tipo: editFormData.tipo,
              tipoTramite,
              driveFileId: editFormData.driveFileId,
            }),
          })
        )

        const results = await Promise.all(promises)
        if (!results.every((r) => r.ok)) throw new Error('Error al guardar')
      }

      toast.success(`✅ Plantilla actualizada${selectedTramites.size > 0 ? ` a ${selectedTramites.size} trámite(s)` : ' sin asociaciones'}`)
      setEditingAsociacion(null)
      setEditFormData(null)
      setSelectedTramites(new Set())
      await loadData()
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error al guardar asociaciones')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteAsociacion = async (plantillaId: string) => {
    if (!confirm('¿Desasociar esta plantilla?')) return

    try {
      const response = await fetch(`/api/admin/plantillas-registradas/${plantillaId}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Error eliminando plantilla')

      toast.success('✅ Plantilla desasociada')
      await loadData()
    } catch (error) {
      toast.error('Error desasociando plantilla')
    }
  }

  if (loading) return <div className="p-8 text-center">Cargando plantillas...</div>

  return (
    <div className="p-8">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">📄 Gestión de Plantillas</h2>
        <p className="text-gray-600 text-sm">Administra las asociaciones entre plantillas de Google Docs y los tipos de trámite.</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Tabla de Plantillas */}
        <div>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Plantilla</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Tipo Documento</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Trámites</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {todasLasPlantillas.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                      No hay plantillas en Google Drive
                    </td>
                  </tr>
                ) : (
                  todasLasPlantillas.map((plantilla) => (
                    <tr key={plantilla.nombre} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 font-semibold text-gray-900">
                        {plantilla.nombre}
                      </td>
                      <td className="px-6 py-4">
                        {plantilla.tipo ? (
                          <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                            {plantilla.tipo}
                          </span>
                        ) : (
                          <span className="text-gray-400 text-sm">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {plantilla.asociaciones.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {plantilla.asociaciones.map((a) => {
                              const categoria = getCategoriaDelTramite(a.tipoTramite)
                              return (
                                <div
                                  key={`${plantilla.nombre}-${a.tipoTramite}`}
                                  className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold"
                                >
                                  {categoria && <span>{categoria.icono}</span>}
                                  <span>{tramitesConfig[a.tipoTramite]?.nombre || a.tipoTramite}</span>
                                </div>
                              )
                            })}
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => {
                            // Crear un objeto de referencia siempre (incluso si no hay asociaciones)
                            const referencia = plantilla.asociaciones[0] || {
                              id: `ref-${plantilla.nombre}`,
                              nombre: plantilla.nombre,
                              tipo: plantilla.tipo || 'mandato',
                              tipoTramite: Object.keys(tramitesConfig)[0] || '',
                              driveFileId: plantilla.driveFileId,
                            }
                            setEditingAsociacion(referencia)
                            setEditFormData({ ...referencia })

                            // Inicializar trámites seleccionados
                            const tramitesAsociados = new Set<string>()
                            plantilla.asociaciones.forEach((a) => {
                              tramitesAsociados.add(a.tipoTramite)
                            })
                            setSelectedTramites(tramitesAsociados)
                          }}
                          className="px-3 py-1 text-sm bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-lg font-semibold transition"
                        >
                          ✏️ Editar
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal de Edición */}
      {editingAsociacion && editFormData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 p-8 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Editar Plantilla: {editFormData.nombre}</h2>

            <div className="space-y-6 mb-8">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Documento</label>
                <select
                  value={editFormData.tipo}
                  onChange={(e) => setEditFormData({ ...editFormData, tipo: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  {TIPOS.map((tipo) => (
                    <option key={tipo} value={tipo}>
                      {tipo.charAt(0).toUpperCase() + tipo.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Tipos de Trámite Asociados
                </label>
                <div className="space-y-2 border border-gray-200 rounded-lg p-4 bg-gray-50">
                  {Object.keys(tramitesConfig).length === 0 ? (
                    <p className="text-gray-500 text-sm">Configura trámites primero en la pestaña "Trámites"</p>
                  ) : (
                    Object.keys(tramitesConfig).map((tramite) => (
                      <label key={tramite} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedTramites.has(tramite)}
                        onChange={() => {
                          const newSet = new Set(selectedTramites)
                          if (newSet.has(tramite)) {
                            newSet.delete(tramite)
                          } else {
                            newSet.add(tramite)
                          }
                          setSelectedTramites(newSet)
                        }}
                        className="w-4 h-4 text-blue-600 rounded"
                      />
                      <span className="text-sm text-gray-700">{tramitesConfig[tramite]?.nombre || tramite}</span>
                    </label>
                    ))
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {selectedTramites.size} trámite(s) seleccionado(s)
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => {
                  setEditingAsociacion(null)
                  setEditFormData(null)
                  setSelectedTramites(new Set())
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition"
              >
                Cancelar
              </button>
              <button
                onClick={handleGuardarEdicion}
                disabled={saving}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition"
              >
                {saving ? 'Guardando...' : '✅ Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
