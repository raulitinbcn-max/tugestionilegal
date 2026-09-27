'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { formatEuro } from '@/lib/format'

interface Tasa {
  id: string
  nombre: string
  importe: number
}

interface ServicioAnadir {
  id: string
  nombre: string
  precioBase: number
  porcentajeIVA: number
  suplicosBase: number
}

interface ServicioAnadido {
  id: string
  nombre: string
  precioBase: number
  porcentajeIVA: number
  suplicosBase: number
  servicio?: {
    id: string
  }
}

interface TramiteEditData {
  tramiteConfigId: string
  honorarios: string
  formaPago: string
  suplidos: string
  notas: string
}

interface TramiteConfig {
  id: string
  tipoTramite: string
  nombre: string
}

export default function EditarTramitePage() {
  const params = useParams()
  const router = useRouter()
  const tramiteId = params.id as string

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [tramiteConfigs, setTramiteConfigs] = useState<TramiteConfig[]>([])
  const [tasas, setTasas] = useState<Tasa[]>([])
  const [nuevaTasa, setNuevaTasa] = useState({ nombre: '', importe: '' })
  const [servicios, setServicios] = useState<ServicioAnadido[]>([])
  const [serviciosDisponibles, setServiciosDisponibles] = useState<ServicioAnadir[]>([])
  const [servicioSeleccionado, setServicioSeleccionado] = useState('')
  const [mostrarModalServicio, setMostrarModalServicio] = useState(false)
  const [precioServicio, setPrecioServicio] = useState('')
  const [formData, setFormData] = useState<TramiteEditData>({
    tramiteConfigId: '',
    honorarios: '',
    formaPago: '',
    suplidos: '',
    notas: '',
  })

  const FORMAS_PAGO = ['Efectivo', 'Transferencia', 'Tarjeta', 'Cheque']

  useEffect(() => {
    loadData()
  }, [tramiteId])

  const loadData = async () => {
    try {
      // Cargar trámite
      const tramiteResponse = await fetch(`/api/tramites/${tramiteId}`)
      if (!tramiteResponse.ok) throw new Error('Error cargando trámite')
      const tramite = await tramiteResponse.json()

      // Cargar configuración de trámites
      const configResponse = await fetch('/api/admin/tramites-config')
      if (configResponse.ok) {
        const configData = await configResponse.json()
        const configs = configData.configs || {}
        const configsArray: TramiteConfig[] = Object.entries(configs).map(([key, value]: [string, any]) => ({
          id: key,
          tipoTramite: key,
          nombre: value.nombre || key,
        }))
        setTramiteConfigs(configsArray)
      }

      // Cargar tasas del trámite
      if (tramite.tasas) {
        setTasas(tramite.tasas)
      }

      // Cargar servicios adicionales del trámite
      const serviciosResponse = await fetch(`/api/servicios-anadidos?tramiteId=${tramiteId}`)
      if (serviciosResponse.ok) {
        const serviciosData = await serviciosResponse.json()
        setServicios(serviciosData || [])
      }

      // Cargar servicios disponibles (genéricos + específicos para este tipo)
      const availableResponse = await fetch('/api/admin/servicios-adicionales-config')
      if (availableResponse.ok) {
        const availableData = await availableResponse.json()
        // Filtrar servicios genéricos o asignados a este tipo de trámite
        const filtered = availableData.filter((s: any) => {
          if (!s.asignacionesTramites || s.asignacionesTramites.length === 0) {
            return true // Genérico, disponible para todos
          }
          return s.asignacionesTramites.some(
            (a: any) => a.tramiteConfig.id === tramite.tramiteConfigId
          )
        })
        setServiciosDisponibles(filtered)
      }

      // Llenar form
      setFormData({
        tramiteConfigId: tramite.tramiteConfigId || '',
        honorarios: tramite.honorarios?.toString() || '',
        formaPago: tramite.formaPago || '',
        suplidos: tramite.suplidos?.toString() || '',
        notas: tramite.notas || '',
      })
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error cargando datos')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const addTasa = () => {
    if (!nuevaTasa.nombre || !nuevaTasa.importe) {
      toast.error('Completa nombre e importe de la tasa')
      return
    }

    setTasas([
      ...tasas,
      {
        id: Date.now().toString(),
        nombre: nuevaTasa.nombre,
        importe: parseFloat(nuevaTasa.importe),
      },
    ])
    setNuevaTasa({ nombre: '', importe: '' })
    toast.success('Tasa añadida')
  }

  const removeTasa = (id: string) => {
    setTasas(tasas.filter((t) => t.id !== id))
  }

  const updateTasa = (id: string, field: string, value: any) => {
    setTasas(
      tasas.map((t) =>
        t.id === id
          ? {
              ...t,
              [field]: field === 'importe' ? parseFloat(value) : value,
            }
          : t
      )
    )
  }

  const addServicio = async () => {
    if (!servicioSeleccionado) {
      toast.error('Selecciona un servicio')
      return
    }

    const servicio = serviciosDisponibles.find((s) => s.id === servicioSeleccionado)
    if (!servicio) return

    try {
      const response = await fetch('/api/servicios-anadidos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tramiteId,
          servicioId: servicioSeleccionado,
          precioBase: precioServicio ? parseFloat(precioServicio) : undefined,
        }),
      })

      if (!response.ok) throw new Error('Error al añadir servicio')

      const nuevoServicio = await response.json()
      setServicios([...servicios, nuevoServicio])
      setMostrarModalServicio(false)
      setServicioSeleccionado('')
      setPrecioServicio('')
      toast.success('✅ Servicio añadido')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al añadir servicio')
    }
  }

  const removeServicio = async (id: string) => {
    try {
      const response = await fetch(`/api/servicios-anadidos/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Error al eliminar')

      setServicios(servicios.filter((s) => s.id !== id))
      toast.success('✅ Servicio eliminado')
    } catch (error) {
      toast.error('Error al eliminar servicio')
    }
  }

  const calcularTotalServicio = (precio: number, iva: number, suplidos: number) => {
    const montoIVA = Math.round((precio * iva / 100) * 100) / 100
    return precio + montoIVA + suplidos
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const response = await fetch(`/api/tramites/${tramiteId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tipoTramite: formData.tramiteConfigId,
          honorarios: formData.honorarios ? parseFloat(formData.honorarios) : null,
          formaPago: formData.formaPago,
          suplidos: formData.suplidos ? parseFloat(formData.suplidos) : null,
          notas: formData.notas,
          tasas,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Error al guardar')
      }

      toast.success('✅ Trámite actualizado correctamente')
      router.push(`/tramites/${tramiteId}`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al guardar trámite')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="p-8">Cargando...</div>

  const totalTasas = tasas.reduce((sum, t) => sum + t.importe, 0)
  const honorarios = parseFloat(formData.honorarios) || 0
  const iva = honorarios * 0.21
  const total = honorarios + iva + totalTasas

  return (
    <form onSubmit={handleSubmit} className="space-y-8 p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <Link href={`/tramites/${tramiteId}`} className="text-blue-600 hover:text-blue-800 text-sm font-semibold">
          ← Volver al Trámite
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 mt-4">Editar Trámite</h1>
      </div>

      {/* Datos del Trámite */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">📋 Datos del Trámite</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Trámite *</label>
            <select
              name="tramiteConfigId"
              value={formData.tramiteConfigId}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Seleccionar...</option>
              {tramiteConfigs.map((config) => (
                <option key={config.id} value={config.tipoTramite}>
                  {config.nombre}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Forma de Pago</label>
            <select
              name="formaPago"
              value={formData.formaPago}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Seleccionar...</option>
              {FORMAS_PAGO.map((forma) => (
                <option key={forma} value={forma}>
                  {forma}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Honorarios (€)</label>
            <input
              type="number"
              name="honorarios"
              value={formData.honorarios}
              onChange={handleChange}
              step="0.01"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Suplidos (€)</label>
            <input
              type="number"
              name="suplidos"
              value={formData.suplidos}
              onChange={handleChange}
              step="0.01"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
            <textarea
              name="notas"
              value={formData.notas}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Notas adicionales sobre el trámite"
            />
          </div>
        </div>
      </div>

      {/* Servicios Adicionales */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">🛠️ Servicios Adicionales</h2>

        {servicios.length > 0 && (
          <div className="mb-6 space-y-3">
            {servicios.map((servicio) => (
              <div key={servicio.id} className="flex gap-3 items-end bg-gray-50 p-3 rounded border border-gray-200">
                <div className="flex-1">
                  <label className="block text-xs font-medium text-gray-700 mb-1">Servicio</label>
                  <p className="text-sm font-medium text-gray-900">{servicio.nombre}</p>
                </div>
                <div className="w-32">
                  <label className="block text-xs font-medium text-gray-700 mb-1">Precio (€)</label>
                  <p className="text-sm font-medium text-gray-900">{servicio.precioBase}</p>
                </div>
                <div className="w-32">
                  <label className="block text-xs font-medium text-gray-700 mb-1">Total (€)</label>
                  <p className="text-sm font-bold text-blue-600">
                    {calcularTotalServicio(
                      servicio.precioBase,
                      servicio.porcentajeIVA,
                      servicio.suplicosBase
                    ).toFixed(2)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => removeServicio(servicio.id)}
                  className="px-3 py-2 bg-red-100 hover:bg-red-200 text-red-700 font-semibold rounded"
                >
                  🗑️
                </button>
              </div>
            ))}
          </div>
        )}

        <button
          type="button"
          onClick={() => setMostrarModalServicio(true)}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition text-sm"
        >
          ➕ Añadir Servicio
        </button>
      </div>

      {/* Modal para añadir servicio */}
      {mostrarModalServicio && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Añadir Servicio Adicional</h3>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Servicio *</label>
              <select
                value={servicioSeleccionado}
                onChange={(e) => setServicioSeleccionado(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="">Seleccionar servicio...</option>
                {serviciosDisponibles.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.nombre} ({s.precioBase.toFixed(2)}€)
                  </option>
                ))}
              </select>
            </div>

            {servicioSeleccionado && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Precio (€) - Opcional</label>
                <input
                  type="number"
                  value={precioServicio}
                  onChange={(e) => setPrecioServicio(e.target.value)}
                  step="0.01"
                  placeholder="Dejar en blanco para usar precio del servicio"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
            )}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={addServicio}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition"
              >
                ✅ Añadir
              </button>
              <button
                type="button"
                onClick={() => {
                  setMostrarModalServicio(false)
                  setServicioSeleccionado('')
                  setPrecioServicio('')
                }}
                className="flex-1 px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold rounded-lg transition"
              >
                ✕ Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tasas */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">💰 Tasas</h2>

        {tasas.length > 0 && (
          <div className="mb-6 space-y-3">
            {tasas.map((tasa) => (
              <div key={tasa.id} className="flex gap-3 items-end bg-gray-50 p-3 rounded border border-gray-200">
                <div className="flex-1">
                  <label className="block text-xs font-medium text-gray-700 mb-1">Nombre</label>
                  <input
                    type="text"
                    value={tasa.nombre}
                    onChange={(e) => updateTasa(tasa.id, 'nombre', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                  />
                </div>
                <div className="w-32">
                  <label className="block text-xs font-medium text-gray-700 mb-1">Importe (€)</label>
                  <input
                    type="number"
                    value={tasa.importe}
                    onChange={(e) => updateTasa(tasa.id, 'importe', e.target.value)}
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeTasa(tasa.id)}
                  className="px-3 py-2 bg-red-100 hover:bg-red-200 text-red-700 font-semibold rounded"
                >
                  🗑️
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <input
            type="text"
            value={nuevaTasa.nombre}
            onChange={(e) => setNuevaTasa({ ...nuevaTasa, nombre: e.target.value })}
            placeholder="Nombre de tasa"
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          />
          <input
            type="number"
            value={nuevaTasa.importe}
            onChange={(e) => setNuevaTasa({ ...nuevaTasa, importe: e.target.value })}
            placeholder="Importe"
            step="0.01"
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          />
          <button
            type="button"
            onClick={addTasa}
            className="col-span-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition text-sm"
          >
            ➕ Agregar Tasa
          </button>
        </div>
      </div>

      {/* Resumen de Precios */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">📊 Resumen de Precios</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded p-3">
            <p className="text-xs text-gray-600">Honorarios</p>
            <p className="text-lg font-bold text-gray-900">{formatEuro(honorarios)}</p>
          </div>
          <div className="bg-white rounded p-3">
            <p className="text-xs text-gray-600">IVA (21%)</p>
            <p className="text-lg font-bold text-gray-900">{formatEuro(iva)}</p>
          </div>
          <div className="bg-white rounded p-3">
            <p className="text-xs text-gray-600">Tasas</p>
            <p className="text-lg font-bold text-gray-900">{formatEuro(totalTasas)}</p>
          </div>
          <div className="bg-blue-600 rounded p-3">
            <p className="text-xs text-blue-100">TOTAL</p>
            <p className="text-lg font-bold text-white">{formatEuro(total)}</p>
          </div>
        </div>
      </div>

      {/* Botones */}
      <div className="flex gap-4">
        <button
          type="submit"
          disabled={saving}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition"
        >
          {saving ? 'Guardando...' : '✅ Guardar Cambios'}
        </button>
        <Link
          href={`/tramites/${tramiteId}`}
          className="px-6 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold rounded-lg transition"
        >
          Cancelar
        </Link>
      </div>
    </form>
  )
}
