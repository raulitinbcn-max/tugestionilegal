'use client'

import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'

interface TramiteConfig {
  nombre: string
  descripcion?: string
  categoria?: string
}

export default function TasasConfig2Page() {
  const [tramitesConfig, setTramitesConfig] = useState<Record<string, TramiteConfig>>({})
  const [tasaNueva, setTasaNueva] = useState({ nombre: '', importe: 0, tipoTramite: '' })

  useEffect(() => {
    const loadTramites = async () => {
      try {
        const response = await fetch('/api/admin/tramites-config')
        const data = await response.json()
        console.log('Respuesta API:', data)
        setTramitesConfig(data.configs || {})
      } catch (error) {
        console.error('Error:', error)
      }
    }
    loadTramites()
  }, [])

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">💰 Tasas (Versión 2 - Prueba)</h1>

      <div className="bg-green-50 rounded-lg border border-green-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">➕ Agregar Nueva Tasa</h2>
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
                  toast.success('✅ Tasa agregada (simulado)')
                  setTasaNueva({ nombre: '', importe: 0, tipoTramite: '' })
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
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Trámites Cargados:</h2>
        <pre className="bg-gray-50 p-4 rounded text-sm overflow-auto">
          {JSON.stringify(tramitesConfig, null, 2)}
        </pre>
      </div>
    </div>
  )
}
