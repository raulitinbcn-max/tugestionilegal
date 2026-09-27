'use client'

import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'

interface ServicioAdicional {
  id: string
  nombre: string
  descripcion?: string
  precioBase: number
  porcentajeIVA: number
  suplicosBase: number
  asignacionesTramites: Array<{
    id: string
    tramiteConfig: {
      id: string
      nombre: string
    }
  }>
  activo: boolean
}

const calcularTotal = (precioBase: number, porcentajeIVA: number, suplicosBase: number) => {
  const montoIVA = Math.round((precioBase * porcentajeIVA / 100) * 100) / 100
  return precioBase + montoIVA + suplicosBase
}

interface TramiteConfig {
  id: string
  tipoTramite: string
  nombre: string
}

export default function ServiciosAdicionalesTab() {
  const [tramitesConfig, setTramitesConfig] = useState<TramiteConfig[]>([])
  const [servicios, setServicios] = useState<ServicioAdicional[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<Partial<ServicioAdicional> & { tramiteConfigIds?: string[] }>({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const response = await fetch('/api/admin/servicios-adicionales-config')
      if (response.ok) {
        const data = await response.json()
        setServicios(data || [])
      }

      const tramitesResponse = await fetch('/api/admin/tramites-list')
      if (tramitesResponse.ok) {
        const tramitesData = await tramitesResponse.json()
        setTramitesConfig(tramitesData.tramites || [])
      }
    } catch (error) {
      console.error('Error cargando datos:', error)
      toast.error('Error cargando datos')
    } finally {
      setLoading(false)
    }
  }

  const handleNuevo = () => {
    setEditingId('nuevo')
    setFormData({
      nombre: '',
      descripcion: '',
      precioBase: 0,
      porcentajeIVA: 21,
      suplicosBase: 0,
      tramiteConfigIds: [],
      activo: true,
    })
  }

  const handleEditar = (servicio: ServicioAdicional) => {
    setEditingId(servicio.id)
    const tramiteIds = servicio.asignacionesTramites?.map((a) => a.tramiteConfig.id) || []
    setFormData({
      ...servicio,
      tramiteConfigIds: tramiteIds,
    })
  }

  const handleCancelar = () => {
    setEditingId(null)
    setFormData({})
  }

  const handleGuardar = async () => {
    if (!formData.nombre || formData.precioBase === undefined) {
      toast.error('Nombre y precio base requeridos')
      return
    }

    setSaving(true)
    try {
      const { tramiteConfigIds, ...dataToSend } = formData
      const tramiteConfigId = tramiteConfigIds && tramiteConfigIds.length > 0 ? tramiteConfigIds[0] : null

      if (editingId === 'nuevo') {
        const response = await fetch('/api/admin/servicios-adicionales-config', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...dataToSend, tramiteConfigId }),
        })

        if (!response.ok) throw new Error('Error al crear')
        toast.success('✅ Servicio creado')
      } else {
        const response = await fetch(`/api/admin/servicios-adicionales-config/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...dataToSend, tramiteConfigId }),
        })

        if (!response.ok) throw new Error('Error al actualizar')
        toast.success('✅ Servicio actualizado')
      }

      setEditingId(null)
      setFormData({})
      await loadData()
    } catch (error) {
      toast.error('Error al guardar servicio')
    } finally {
      setSaving(false)
    }
  }

  const handleEliminar = async (id: string) => {
    if (!confirm('¿Eliminar este servicio?')) return

    try {
      const response = await fetch(`/api/admin/servicios-adicionales-config/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Error al eliminar')
      toast.success('✅ Servicio eliminado')
      await loadData()
    } catch (error) {
      toast.error('Error al eliminar')
    }
  }

  if (loading) return <div className="p-8">Cargando...</div>

  return (
    <div className="p-8">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">🛠️ Servicios Adicionales</h2>
        <p className="text-gray-600 text-sm">Configura servicios adicionales genéricos o asociados a tipos de trámites específicos</p>
      </div>

      {/* Tabla de servicios */}
      <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Nombre</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Precio</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">IVA</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Suplidos</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Total</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Trámite</th>
              <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {editingId === 'nuevo' && (
              <tr className="bg-blue-50">
                <td className="px-6 py-3">
                  <input
                    type="text"
                    value={formData.nombre || ''}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    placeholder="Nombre"
                    className="w-full px-2 py-1 border border-gray-300 rounded"
                  />
                </td>
                <td className="px-6 py-3">
                  <input
                    type="number"
                    step="0.01"
                    value={formData.precioBase || ''}
                    onChange={(e) => setFormData({ ...formData, precioBase: parseFloat(e.target.value) })}
                    placeholder="0.00"
                    className="w-24 px-2 py-1 border border-gray-300 rounded"
                  />
                </td>
                <td className="px-6 py-3">
                  <input
                    type="number"
                    value={formData.porcentajeIVA || 21}
                    onChange={(e) => setFormData({ ...formData, porcentajeIVA: parseFloat(e.target.value) })}
                    className="w-16 px-2 py-1 border border-gray-300 rounded"
                  />
                </td>
                <td className="px-6 py-3">
                  <input
                    type="number"
                    step="0.01"
                    value={formData.suplicosBase || ''}
                    onChange={(e) => setFormData({ ...formData, suplicosBase: parseFloat(e.target.value) })}
                    placeholder="0.00"
                    className="w-24 px-2 py-1 border border-gray-300 rounded"
                  />
                </td>
                <td className="px-6 py-3 text-sm font-semibold">
                  {formData.precioBase !== undefined
                    ? (
                        formData.precioBase +
                        (formData.precioBase * (formData.porcentajeIVA || 21)) / 100 +
                        (formData.suplicosBase || 0)
                      ).toFixed(2)
                    : '0.00'}
                  €
                </td>
                <td className="px-6 py-3">
                  <select
                    value={(formData.tramiteConfigIds && formData.tramiteConfigIds[0]) || ''}
                    onChange={(e) => setFormData({ ...formData, tramiteConfigIds: e.target.value ? [e.target.value] : [] })}
                    className="px-2 py-1 border border-gray-300 rounded text-sm"
                  >
                    <option value="">Genérico (todos)</option>
                    {tramitesConfig.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.nombre}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-6 py-3 text-right">
                  <button
                    onClick={handleGuardar}
                    disabled={saving}
                    className="px-3 py-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white text-sm rounded mr-2"
                  >
                    ✅
                  </button>
                  <button onClick={handleCancelar} className="px-3 py-1 bg-gray-300 hover:bg-gray-400 text-gray-800 text-sm rounded">
                    ✕
                  </button>
                </td>
              </tr>
            )}

            {servicios.map((servicio) =>
              editingId === servicio.id ? (
                <tr key={servicio.id} className="bg-blue-50">
                  <td className="px-6 py-3">
                    <input
                      type="text"
                      value={formData.nombre || ''}
                      onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                      className="w-full px-2 py-1 border border-gray-300 rounded"
                    />
                  </td>
                  <td className="px-6 py-3">
                    <input
                      type="number"
                      step="0.01"
                      value={formData.precioBase || ''}
                      onChange={(e) => setFormData({ ...formData, precioBase: parseFloat(e.target.value) })}
                      className="w-24 px-2 py-1 border border-gray-300 rounded"
                    />
                  </td>
                  <td className="px-6 py-3">
                    <input
                      type="number"
                      value={formData.porcentajeIVA || 21}
                      onChange={(e) => setFormData({ ...formData, porcentajeIVA: parseFloat(e.target.value) })}
                      className="w-16 px-2 py-1 border border-gray-300 rounded"
                    />
                  </td>
                  <td className="px-6 py-3">
                    <input
                      type="number"
                      step="0.01"
                      value={formData.suplicosBase || ''}
                      onChange={(e) => setFormData({ ...formData, suplicosBase: parseFloat(e.target.value) })}
                      className="w-24 px-2 py-1 border border-gray-300 rounded"
                    />
                  </td>
                  <td className="px-6 py-3 text-sm font-semibold">
                    {calcularTotal(
                      formData.precioBase || servicio.precioBase,
                      formData.porcentajeIVA || servicio.porcentajeIVA,
                      formData.suplicosBase || servicio.suplicosBase
                    ).toFixed(2)}
                    €
                  </td>
                  <td className="px-6 py-3">
                    <select
                      value={(formData.tramiteConfigIds && formData.tramiteConfigIds[0]) || ''}
                      onChange={(e) => setFormData({ ...formData, tramiteConfigIds: e.target.value ? [e.target.value] : [] })}
                      className="px-2 py-1 border border-gray-300 rounded text-sm"
                    >
                      <option value="">Genérico (todos)</option>
                      {tramitesConfig.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.nombre}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-6 py-3 text-right">
                    <button
                      onClick={handleGuardar}
                      disabled={saving}
                      className="px-3 py-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white text-sm rounded mr-2"
                    >
                      ✅
                    </button>
                    <button
                      onClick={handleCancelar}
                      className="px-3 py-1 bg-gray-300 hover:bg-gray-400 text-gray-800 text-sm rounded"
                    >
                      ✕
                    </button>
                  </td>
                </tr>
              ) : (
                <tr key={servicio.id}>
                  <td className="px-6 py-3 text-gray-900 font-medium">{servicio.nombre}</td>
                  <td className="px-6 py-3">{servicio.precioBase}€</td>
                  <td className="px-6 py-3">{servicio.porcentajeIVA}%</td>
                  <td className="px-6 py-3">{servicio.suplicosBase}€</td>
                  <td className="px-6 py-3 font-semibold">
                    {calcularTotal(servicio.precioBase, servicio.porcentajeIVA, servicio.suplicosBase).toFixed(2)}€
                  </td>
                  <td className="px-6 py-3">
                    {servicio.asignacionesTramites?.length > 0 ? (
                      <div className="flex flex-col gap-1">
                        {servicio.asignacionesTramites.map((asignacion) => (
                          <span key={asignacion.id} className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm">
                            {asignacion.tramiteConfig.nombre}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-gray-500 text-sm">Genérico</span>
                    )}
                  </td>
                  <td className="px-6 py-3 text-right">
                    <button
                      onClick={() => handleEditar(servicio)}
                      className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded mr-2"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleEliminar(servicio.id)}
                      className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded"
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>

        {servicios.length === 0 && editingId !== 'nuevo' && (
          <div className="p-8 text-center text-gray-500">
            <p>No hay servicios configurados</p>
          </div>
        )}
      </div>

      {editingId !== 'nuevo' && (
        <button
          onClick={handleNuevo}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition"
        >
          ➕ Nuevo Servicio
        </button>
      )}
    </div>
  )
}
