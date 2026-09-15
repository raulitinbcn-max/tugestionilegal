'use client'

import { useState } from 'react'
import { TRAMITE_CONFIGS } from '@/lib/tramite-config'
import toast from 'react-hot-toast'

interface TramiteConfig {
  nombre: string
  descripcion: string
  plantillasDisponibles: string[]
  camposRequeridos: string[]
}

interface EditingConfig extends TramiteConfig {
  tipoTramite: string
}

const TODAS_LAS_PLANTILLAS = ['contrato_residencia', 'contrato_servicios_general', 'factura_proforma']
const TODOS_LOS_CAMPOS = ['nombreCompleto', 'fechaNacimiento', 'nacionalidad', 'numeroPasaporte', 'direccion', 'email', 'telefono', 'situacionActual', 'tipoTramite', 'honorarios', 'formaPago']

export default function TramitesConfigPage() {
  const [configs, setConfigs] = useState<Record<string, EditingConfig>>(
    Object.entries(TRAMITE_CONFIGS).reduce((acc, [key, value]) => {
      acc[key] = { ...value, tipoTramite: key }
      return acc
    }, {} as Record<string, EditingConfig>)
  )
  const [saving, setSaving] = useState(false)

  const handleUpdateConfig = (tipoTramite: string, field: string, value: any) => {
    setConfigs((prev) => ({
      ...prev,
      [tipoTramite]: {
        ...prev[tipoTramite],
        [field]: value,
      },
    }))
  }

  const togglePlantilla = (tipoTramite: string, plantilla: string) => {
    setConfigs((prev) => ({
      ...prev,
      [tipoTramite]: {
        ...prev[tipoTramite],
        plantillasDisponibles: prev[tipoTramite].plantillasDisponibles.includes(plantilla)
          ? prev[tipoTramite].plantillasDisponibles.filter(p => p !== plantilla)
          : [...prev[tipoTramite].plantillasDisponibles, plantilla],
      },
    }))
  }

  const toggleCampo = (tipoTramite: string, campo: string) => {
    setConfigs((prev) => ({
      ...prev,
      [tipoTramite]: {
        ...prev[tipoTramite],
        camposRequeridos: prev[tipoTramite].camposRequeridos.includes(campo)
          ? prev[tipoTramite].camposRequeridos.filter(c => c !== campo)
          : [...prev[tipoTramite].camposRequeridos, campo],
      },
    }))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const response = await fetch('/api/admin/tramites-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ configs }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Error al guardar')
      }

      toast.success('✅ Configuración guardada correctamente')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Configuración de Trámites</h1>
          <p className="text-gray-600 mt-2">Personaliza las plantillas y campos requeridos para cada tipo de trámite</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-2 px-6 rounded-lg transition"
        >
          {saving ? 'Guardando...' : '💾 Guardar Cambios'}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {Object.entries(configs).map(([tipoTramite, config]) => (
          <div key={tipoTramite} className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900">{tipoTramite}</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Nombre</label>
                <input
                  type="text"
                  value={config.nombre}
                  onChange={(e) => handleUpdateConfig(tipoTramite, 'nombre', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Descripción</label>
                <input
                  type="text"
                  value={config.descripcion}
                  onChange={(e) => handleUpdateConfig(tipoTramite, 'descripcion', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Plantillas */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">📋 Plantillas Disponibles</label>
                <div className="space-y-2 bg-gray-50 p-4 rounded-lg">
                  {TODAS_LAS_PLANTILLAS.map((plantilla) => (
                    <label key={plantilla} className="flex items-center gap-3 cursor-pointer hover:bg-gray-100 p-2 rounded">
                      <input
                        type="checkbox"
                        checked={config.plantillasDisponibles.includes(plantilla)}
                        onChange={() => togglePlantilla(tipoTramite, plantilla)}
                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{plantilla}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Campos */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">✅ Campos Requeridos</label>
                <div className="space-y-2 bg-gray-50 p-4 rounded-lg max-h-64 overflow-y-auto">
                  {TODOS_LOS_CAMPOS.map((campo) => (
                    <label key={campo} className="flex items-center gap-3 cursor-pointer hover:bg-gray-100 p-2 rounded">
                      <input
                        type="checkbox"
                        checked={config.camposRequeridos.includes(campo)}
                        onChange={() => toggleCampo(tipoTramite, campo)}
                        className="w-4 h-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                      />
                      <span className="text-sm text-gray-700">{campo}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 flex gap-4">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition"
        >
          {saving ? 'Guardando...' : '💾 Guardar Cambios'}
        </button>
      </div>
    </div>
  )
}
