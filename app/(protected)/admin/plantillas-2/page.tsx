'use client'

import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'

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

export default function Plantillas2AdminPage() {
  const [plantillasDisponibles, setPlantillasDisponibles] = useState<PlantillaDisponible[]>([])
  const [plantillasRegistradas, setPlantillasRegistradas] = useState<PlantillaRegistrada[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPlantilla, setSelectedPlantilla] = useState<string>('')
  const [selectedTipo, setSelectedTipo] = useState<string>('contrato')
  const [selectedTramite, setSelectedTramite] = useState<string>('Residencia')
  const [saving, setSaving] = useState(false)

  const TIPOS = ['contrato', 'mandato', 'factura', 'otro']
  const TRAMITES = [
    'Residencia',
    'Trabajo',
    'Reagrupación Familiar',
    'Nacionalidad',
    'Visado',
    'Autorización de Estancia',
    'Otro',
  ]

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const plantillasResponse = await fetch('/api/admin/list-plantillas-drive')
      if (plantillasResponse.ok) {
        const plantillasData = await plantillasResponse.json()
        const plantillas = Array.isArray(plantillasData.plantillas)
          ? plantillasData.plantillas
          : (Array.isArray(plantillasData) ? plantillasData : [])
        setPlantillasDisponibles(plantillas)
      }

      const registradasResponse = await fetch('/api/admin/plantillas-registradas')
      if (registradasResponse.ok) {
        const registradasData = await registradasResponse.json()
        const registradas = Array.isArray(registradasData) ? registradasData : []
        setPlantillasRegistradas(registradas)
      }
    } catch (error) {
      console.error('[Plantillas2] Error loading data:', error)
      toast.error('Error cargando plantillas')
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async () => {
    if (!selectedPlantilla || !selectedTramite) {
      toast.error('Selecciona una plantilla y un trámite')
      return
    }

    setSaving(true)
    try {
      const plantilla = plantillasDisponibles.find((p) => p.nombre === selectedPlantilla)
      if (!plantilla) throw new Error('Plantilla no encontrada')

      const response = await fetch('/api/admin/plantillas-registradas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: selectedPlantilla,
          tipo: selectedTipo,
          tipoTramite: selectedTramite,
          driveFileId: plantilla.driveFileId,
        }),
      })

      if (!response.ok) throw new Error('Error registrando plantilla')

      toast.success('✅ Plantilla registrada')
      setSelectedPlantilla('')
      await loadData()
    } catch (error) {
      console.error('[Plantillas2] Error registering:', error)
      toast.error('Error registrando plantilla')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (plantillaId: string) => {
    if (!confirm('¿Desasociar esta plantilla?')) return

    try {
      const response = await fetch(`/api/admin/plantillas-registradas/${plantillaId}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Error eliminando plantilla')

      toast.success('✅ Plantilla desasociada')
      await loadData()
    } catch (error) {
      console.error('[Plantillas2] Error deleting:', error)
      toast.error('Error desasociando plantilla')
    }
  }

  if (loading) return <div className="p-8 text-center">Cargando plantillas...</div>

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">📄 Gestión de Plantillas v2</h1>
      <p className="text-gray-600 mb-8">Versión mejorada: carga automática de trámites desde configuración</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Sección: Asociar Plantillas */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">🔗 Asociar Plantilla</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Plantilla (Google Docs)
              </label>
              <select
                value={selectedPlantilla}
                onChange={(e) => setSelectedPlantilla(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Selecciona una plantilla...</option>
                {plantillasDisponibles.map((p) => (
                  <option key={p.id} value={p.nombre}>
                    {p.nombre}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Disponibles en Drive: <span className="font-semibold">{plantillasDisponibles.length}</span>
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Documento</label>
              <select
                value={selectedTipo}
                onChange={(e) => setSelectedTipo(e.target.value)}
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Trámite</label>
              {tramites.length === 0 ? (
                <p className="text-sm text-gray-600 bg-yellow-50 p-3 rounded">
                  ⚠️ Configura trámites primero en la pestaña "Trámites"
                </p>
              ) : (
                <select
                  value={selectedTramite}
                  onChange={(e) => setSelectedTramite(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  {TRAMITES.map((tramite) => (
                    <option key={tramite} value={tramite}>
                      {tramite}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <button
              onClick={handleRegister}
              disabled={saving || !selectedPlantilla || !selectedTramite}
              className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition"
            >
              {saving ? '⏳ Registrando...' : '✅ Registrar Plantilla'}
            </button>
          </div>
        </div>

        {/* Sección: Plantillas Registradas */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">📋 Plantillas Registradas</h2>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {plantillasRegistradas.length === 0 ? (
              <p className="text-gray-600 text-center py-8">No hay plantillas registradas</p>
            ) : (
              plantillasRegistradas.map((p) => (
                <div
                  key={p.id}
                  className="border border-gray-200 rounded-lg p-4 bg-gray-50 hover:bg-gray-100 transition flex items-center justify-between"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{p.nombre}</p>
                    <p className="text-xs text-gray-600 mt-1">
                      <span className="inline-block bg-blue-100 text-blue-700 px-2 py-1 rounded mr-2">
                        {p.tipo}
                      </span>
                      <span className="inline-block bg-green-100 text-green-700 px-2 py-1 rounded">
                        {p.tipoTramite}
                      </span>
                    </p>
                  </div>
                  <button
                    onClick={() => handleDelete(p.id)}
                    className="ml-3 text-red-600 hover:text-red-800 hover:bg-red-100 p-2 rounded transition text-lg"
                    title="Desasociar"
                  >
                    🗑️
                  </button>
                </div>
              ))
            )}
          </div>

          <p className="text-xs text-gray-500 mt-4 pt-4 border-t border-gray-200 text-center">
            Total registradas: <span className="font-semibold">{plantillasRegistradas.length}</span>
          </p>
        </div>
      </div>
    </div>
  )
}
