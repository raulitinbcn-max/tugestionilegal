'use client'

import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'

interface TasaConfig {
  nombre: string
  importe: number
}

interface TasasConfigState {
  [tipoTramite: string]: TasaConfig[]
}

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
  descripcion?: string
  categoria?: string
  plantillasDisponibles?: string[]
  camposRequeridos?: string[]
}

export default function TasasConfigPage() {
  const [tasasConfig, setTasasConfig] = useState<TasasConfigState>({})
  const [tramitesConfig, setTramitesConfig] = useState<Record<string, TramiteConfig>>({})
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [selectedCategoria, setSelectedCategoria] = useState<string>('ALL')
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [tasaNueva, setTasaNueva] = useState({ nombre: '', importe: 0, tipoTramite: '' })

  useEffect(() => {
    const loadData = async () => {
      try {
        const categResponse = await fetch('/api/admin/categorias-tramite')
        if (categResponse.ok) {
          const categData = await categResponse.json()
          setCategorias(categData)
        }

        const tramitesResponse = await fetch('/api/admin/tramites-config')
        if (tramitesResponse.ok) {
          const tramitesData = await tramitesResponse.json()
          setTramitesConfig(tramitesData.configs || {})
        }

        const tasasResponse = await fetch('/api/admin/tasas-config')
        if (tasasResponse.ok) {
          const tasasData = await tasasResponse.json()
          setTasasConfig(tasasData.tasasConfig || {})
        }
      } catch (error) {
        console.error('Error cargando datos:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const updateTasa = (tipoTramite: string, index: number, field: string, value: any) => {
    const updated = { ...tasasConfig }
    updated[tipoTramite][index] = {
      ...updated[tipoTramite][index],
      [field]: field === 'importe' ? parseFloat(value) : value,
    }
    setTasasConfig(updated)
  }

  const addTasa = (tipoTramite: string) => {
    const updated = { ...tasasConfig }
    if (!updated[tipoTramite]) {
      updated[tipoTramite] = []
    }
    updated[tipoTramite] = [...updated[tipoTramite], { nombre: '', importe: 0 }]
    setTasasConfig(updated)
  }

  const removeTasa = (tipoTramite: string, index: number) => {
    const updated = { ...tasasConfig }
    updated[tipoTramite] = updated[tipoTramite].filter((_, i) => i !== index)
    setTasasConfig(updated)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const response = await fetch('/api/admin/tasas-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tasasConfig }),
      })

      if (!response.ok) throw new Error('Error al guardar')

      toast.success('✅ Configuración de tasas guardada')
    } catch (error) {
      toast.error('Error al guardar configuración')
    } finally {
      setSaving(false)
    }
  }

  const calcularTotalPorTramite = (tipoTramite: string) => {
    return (tasasConfig[tipoTramite] || []).reduce((sum, tasa) => sum + tasa.importe, 0)
  }

  const getTramitesParaCategoria = (): string[] => {
    if (selectedCategoria === 'ALL') return Object.keys(tramitesConfig)
    const categInfo = categorias.find(c => c.id === selectedCategoria)
    if (!categInfo) return Object.keys(tramitesConfig)
    return Object.entries(tramitesConfig)
      .filter(([_, config]) => config.categoria === categInfo.clave)
      .map(([tipo, _]) => tipo)
  }

  const tramitesAMostrar = getTramitesParaCategoria()

  const getCategoriaInfo = (categoriaClave: string) => {
    return categorias.find(c => c.clave === categoriaClave)
  }

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Cargando configuración...</div>
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">💰 Configuración de Tasas</h1>
          <p className="text-gray-600 mt-2">Define las tasas predeterminadas para cada tipo de trámite</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-2 px-6 rounded-lg transition"
        >
          {saving ? 'Guardando...' : '💾 Guardar Configuración'}
        </button>
      </div>

      {/* Filtro de Categoría */}
      {categorias.length > 0 && (
        <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <label className="block text-sm font-semibold text-gray-900 mb-2">Filtrar por Categoría</label>
          <div className="flex gap-2">
            <select
              value={selectedCategoria}
              onChange={(e) => setSelectedCategoria(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="ALL">📋 Todas las categorías</option>
              {categorias.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.icono} {cat.nombre}
                </option>
              ))}
            </select>
          </div>
          <p className="text-xs text-gray-600 mt-2">
            Mostrando {tramitesAMostrar.length} trámite{tramitesAMostrar.length !== 1 ? 's' : ''}
          </p>
        </div>
      )}

      {/* Crear Nueva Tasa */}
      <div className="mb-6 p-6 bg-green-50 rounded-lg border border-green-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">➕ Agregar Nueva Tasa</h3>
        {Object.keys(tramitesConfig).length === 0 ? (
          <p className="text-gray-600">Configura trámites primero en la pestaña "Trámites"</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Trámite</label>
              <select
                value={tasaNueva.tipoTramite}
                onChange={(e) => setTasaNueva({ ...tasaNueva, tipoTramite: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="">-- Selecciona --</option>
                {Object.keys(tramitesConfig).map((tramite) => (
                  <option key={tramite} value={tramite}>
                    {tramite}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
              <input
                type="text"
                value={tasaNueva.nombre}
                onChange={(e) => setTasaNueva({ ...tasaNueva, nombre: e.target.value })}
                placeholder="Ej: Tasa de Tramitación"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Importe (€)</label>
              <input
                type="number"
                value={tasaNueva.importe}
                onChange={(e) => setTasaNueva({ ...tasaNueva, importe: parseFloat(e.target.value) || 0 })}
                placeholder="0.00"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>

            <div className="flex items-end">
              <button
                onClick={() => {
                  if (tasaNueva.nombre && tasaNueva.tipoTramite) {
                    addTasa(tasaNueva.tipoTramite)
                    setTasaNueva({ nombre: '', importe: 0, tipoTramite: '' })
                    setSelectedCategoria('ALL')
                    toast.success('✅ Tasa agregada')
                  } else {
                    toast.error('Completa todos los campos')
                  }
                }}
                className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg text-sm"
              >
                ✅ Agregar
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Tabla de Tasas por Trámite */}
      <div className="grid grid-cols-1 gap-6">
        {tramitesAMostrar.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 border-l-4 border-gray-300 text-center">
            <p className="text-gray-500 text-lg">No hay trámites en esta categoría</p>
            <button
              onClick={() => setSelectedCategoria('ALL')}
              className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold"
            >
              Ver todas las categorías
            </button>
          </div>
        ) : (
          tramitesAMostrar.map((tramite) => {
            const tramiteCategoria = tramitesConfig[tramite]?.categoria || ''
            const categInfo = getCategoriaInfo(tramiteCategoria)
            return (
              <div key={tramite} className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">{tramite}</h2>
                    {categInfo && (
                      <p className="text-xs text-gray-500 mt-1">
                        {categInfo.icono} {categInfo.nombre}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Total de tasas</p>
                    <p className="text-lg font-bold text-blue-600">
                      €{calcularTotalPorTramite(tramite).toFixed(2)}
                    </p>
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  {(tasasConfig[tramite] || []).map((tasa, index) => (
                    <div key={index} className="flex gap-3 items-end bg-gray-50 p-3 rounded border border-gray-200">
                      <div className="flex-1">
                        <label className="block text-xs font-medium text-gray-700 mb-1">Nombre</label>
                        <input
                          type="text"
                          value={tasa.nombre}
                          onChange={(e) => updateTasa(tramite, index, 'nombre', e.target.value)}
                          placeholder="Ej: Tasa de Tramitación"
                          className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                        />
                      </div>
                      <div className="w-32">
                        <label className="block text-xs font-medium text-gray-700 mb-1">Importe (€)</label>
                        <input
                          type="number"
                          value={tasa.importe}
                          onChange={(e) => updateTasa(tramite, index, 'importe', e.target.value)}
                          step="0.01"
                          placeholder="0.00"
                          className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                        />
                      </div>
                      <button
                        onClick={() => removeTasa(tramite, index)}
                        className="px-3 py-2 bg-red-100 hover:bg-red-200 text-red-700 font-semibold rounded"
                      >
                        🗑️
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )
          })
        )}
      </div>

      <div className="mt-8 flex gap-4">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition"
        >
          {saving ? 'Guardando...' : '💾 Guardar Configuración'}
        </button>
      </div>
    </div>
  )
}
