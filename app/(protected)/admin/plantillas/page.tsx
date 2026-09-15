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

export default function PlantillasAdminPage() {
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
      const response = await fetch('/api/admin/list-plantillas-drive')
      if (!response.ok) throw new Error('Error cargando plantillas')
      const data = await response.json()
      setPlantillasDisponibles(data)

      const registradasResponse = await fetch('/api/admin/plantillas-registradas')
      if (registradasResponse.ok) {
        const registradasData = await registradasResponse.json()
        setPlantillasRegistradas(registradasData)
      }
    } catch (error) {
      toast.error('Error cargando plantillas')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async () => {
    if (!selectedPlantilla) {
      toast.error('Selecciona una plantilla')
      return
    }

    setSaving(true)
    try {
      const response = await fetch('/api/admin/plantillas-registradas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: selectedPlantilla,
          tipo: selectedTipo,
          tipoTramite: selectedTramite,
          driveFileId: plantillasDisponibles.find((p) => p.nombre === selectedPlantilla)?.driveFileId,
        }),
      })

      if (!response.ok) throw new Error('Error registrando plantilla')

      toast.success('Plantilla registrada')
      setSelectedPlantilla('')
      await loadData()
    } catch (error) {
      toast.error('Error registrando plantilla')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (plantillaId: string) => {
    if (!confirm('¿Eliminar esta plantilla?')) return

    try {
      const response = await fetch(`/api/admin/plantillas-registradas/${plantillaId}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Error eliminando plantilla')

      toast.success('Plantilla eliminada')
      await loadData()
    } catch (error) {
      toast.error('Error eliminando plantilla')
    }
  }

  if (loading) return <div className="p-8">Cargando...</div>

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Gestión de Plantillas</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Sección: Asociar Plantillas */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">📋 Asociar Plantilla</h2>

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
                Total en Drive: {plantillasDisponibles.length}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tipo</label>
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
            </div>

            <button
              onClick={handleRegister}
              disabled={saving || !selectedPlantilla}
              className="w-full px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition"
            >
              {saving ? 'Registrando...' : '✅ Registrar Plantilla'}
            </button>
          </div>
        </div>

        {/* Sección: Plantillas Registradas */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">✅ Plantillas Registradas</h2>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {plantillasRegistradas.length === 0 ? (
              <p className="text-gray-600 text-center py-8">No hay plantillas registradas</p>
            ) : (
              plantillasRegistradas.map((p) => (
                <div key={p.id} className="border rounded-lg p-3 bg-gray-50 flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{p.nombre}</p>
                    <p className="text-xs text-gray-600">
                      {p.tipo} • {p.tipoTramite}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDelete(p.id)}
                    className="ml-2 text-red-600 hover:text-red-800 font-semibold text-sm"
                  >
                    🗑️
                  </button>
                </div>
              ))
            )}
          </div>

          <p className="text-xs text-gray-500 mt-4 text-center">
            Total registradas: {plantillasRegistradas.length}
          </p>
        </div>
      </div>
    </div>
  )
}
