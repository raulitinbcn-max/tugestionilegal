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

interface ServicioAdicional {
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
}

interface TramiteEditData {
  honorarios: string
  porcentajeIVA: string
  formaPago: string
  notas: string
}

interface ClienteData {
  nombreCompleto: string
  fechaNacimiento: string
  nacionalidad: string
  numeroPasaporte: string
  direccion: string
  codigoPostal: string
  poblacion: string
  provincia: string
  email: string
  telefono: string
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
  const [cliente, setCliente] = useState<ClienteData | null>(null)
  const [clienteId, setClienteId] = useState('')
  const [tramiteConfigs, setTramiteConfigs] = useState<TramiteConfig[]>([])
  const [tasas, setTasas] = useState<Tasa[]>([])
  const [nuevaTasa, setNuevaTasa] = useState({ nombre: '', importe: '' })
  const [servicios, setServicios] = useState<ServicioAnadido[]>([])
  const [serviciosDisponibles, setServiciosDisponibles] = useState<ServicioAdicional[]>([])
  const [servicioSeleccionado, setServicioSeleccionado] = useState('')
  const [precioServicio, setPrecioServicio] = useState('')
  const [mostrarFormTasa, setMostrarFormTasa] = useState(false)
  const [mostrarFormServicio, setMostrarFormServicio] = useState(false)
  const [formData, setFormData] = useState<TramiteEditData>({
    honorarios: '',
    porcentajeIVA: '21',
    formaPago: '',
    notas: '',
  })

  const FORMAS_PAGO = ['Efectivo', 'Transferencia', 'Tarjeta', 'Cheque']

  useEffect(() => {
    loadData()
  }, [tramiteId])

  const loadData = async () => {
    try {
      const tramiteResponse = await fetch(`/api/tramites/${tramiteId}`)
      if (!tramiteResponse.ok) throw new Error('Error cargando trámite')
      const tramite = await tramiteResponse.json()

      setClienteId(tramite.clienteId)
      setCliente(tramite.cliente)

      if (tramite.tasas) {
        setTasas(tramite.tasas)
      }

      const serviciosResponse = await fetch(`/api/servicios-anadidos?tramiteId=${tramiteId}`)
      if (serviciosResponse.ok) {
        const serviciosData = await serviciosResponse.json()
        setServicios(serviciosData || [])
      }

      const availableResponse = await fetch('/api/admin/servicios-adicionales-config')
      if (availableResponse.ok) {
        const availableData = await availableResponse.json()
        const filtered = availableData.filter((s: any) => {
          if (!s.asignacionesTramites || s.asignacionesTramites.length === 0) {
            return true
          }
          return s.asignacionesTramites.some((a: any) => a.tramiteConfig.id === tramite.tramiteConfigId)
        })
        setServiciosDisponibles(filtered)
      }

      setFormData({
        honorarios: tramite.honorarios?.toString() || '',
        porcentajeIVA: (tramite.porcentajeIVA || 21).toString(),
        formaPago: tramite.formaPago || '',
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

  const addServicio = () => {
    if (!servicioSeleccionado) {
      toast.error('Selecciona un servicio')
      return
    }

    const servicio = serviciosDisponibles.find((s) => s.id === servicioSeleccionado)
    if (!servicio) return

    const precioBase = precioServicio ? parseFloat(precioServicio) : servicio.precioBase

    setServicios([
      ...servicios,
      {
        id: servicioSeleccionado,
        nombre: servicio.nombre,
        precioBase,
        porcentajeIVA: servicio.porcentajeIVA,
        suplicosBase: servicio.suplicosBase,
      },
    ])

    setMostrarFormServicio(false)
    setServicioSeleccionado('')
    setPrecioServicio('')
    toast.success('✅ Servicio adicional añadido')
  }

  const removeServicio = (servicioId: string) => {
    setServicios(servicios.filter((s) => s.id !== servicioId))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const response = await fetch(`/api/tramites/${tramiteId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          honorarios: formData.honorarios ? parseFloat(formData.honorarios) : null,
          porcentajeIVA: parseFloat(formData.porcentajeIVA),
          formaPago: formData.formaPago,
          notas: formData.notas,
          tasas,
          servicios,
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

  const honorarios = parseFloat(formData.honorarios) || 0
  const porcentajeIVA = parseFloat(formData.porcentajeIVA) || 21
  const totalServicios = servicios.reduce((sum, s) => sum + s.precioBase, 0)
  const totalSuplidos = tasas.reduce((sum, t) => sum + t.importe, 0)
  const subtotal = honorarios + totalServicios
  const iva = Math.round(subtotal * (porcentajeIVA / 100) * 100) / 100
  const total = subtotal + iva + totalSuplidos

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Header */}
      <div className="p-8">
        <Link href={`/tramites/${tramiteId}`} className="text-blue-600 hover:text-blue-800 text-sm font-semibold">
          ← Volver al Trámite
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 mt-4">Editar Trámite</h1>
      </div>

      {/* Datos de Cliente (Read-only con botón Editar) */}
      {cliente && (
        <div className="bg-white rounded-lg shadow p-6 mx-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">👤 Datos de Cliente</h2>
            <Link
              href={`/clientes/${clienteId}/editar`}
              className="text-xs px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded transition"
            >
              ✏️ Editar Datos Personales
            </Link>
          </div>
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <dt className="text-sm font-medium text-gray-600">Nombre</dt>
              <dd className="text-sm text-gray-900 mt-1">{cliente.nombreCompleto}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-600">Documento</dt>
              <dd className="text-sm text-gray-900 mt-1">{cliente.numeroPasaporte || '—'}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-600">Dirección</dt>
              <dd className="text-sm text-gray-900 mt-1">
                {cliente.direccion && (
                  <>
                    {cliente.direccion}
                    {cliente.codigoPostal && `, ${cliente.codigoPostal}`}
                    {cliente.poblacion && ` ${cliente.poblacion}`}
                  </>
                ) || '—'}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-600">Teléfono</dt>
              <dd className="text-sm text-gray-900 mt-1">{cliente.telefono || '—'}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-600">Email</dt>
              <dd className="text-sm text-gray-900 mt-1">{cliente.email || '—'}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-600">Nacionalidad</dt>
              <dd className="text-sm text-gray-900 mt-1">{cliente.nacionalidad || '—'}</dd>
            </div>
          </dl>
        </div>
      )}

      {/* Datos del Trámite */}
      <div className="bg-white rounded-lg shadow p-6 mx-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">📋 Datos del Trámite</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="honorarios" className="block text-sm font-medium text-gray-700 mb-1">
              Honorarios (€)
            </label>
            <input
              type="number"
              id="honorarios"
              name="honorarios"
              value={formData.honorarios}
              onChange={handleChange}
              step="0.01"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label htmlFor="porcentajeIVA" className="block text-sm font-medium text-gray-700 mb-1">
              IVA
            </label>
            <select
              id="porcentajeIVA"
              name="porcentajeIVA"
              value={formData.porcentajeIVA}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="0">Exento</option>
              <option value="4">4%</option>
              <option value="10">10%</option>
              <option value="21">21%</option>
            </select>
          </div>

          <div>
            <label htmlFor="formaPago" className="block text-sm font-medium text-gray-700 mb-1">
              Forma de Pago
            </label>
            <select
              id="formaPago"
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

          <div className="md:col-span-2">
            <label htmlFor="notas" className="block text-sm font-medium text-gray-700 mb-1">
              Notas
            </label>
            <textarea
              id="notas"
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

      {/* Suplidos */}
      <div className="bg-white rounded-lg shadow p-6 mx-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">💰 Suplidos</h2>

        {servicios.length > 0 && (
          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">Servicios Adicionales:</h3>
            <div className="space-y-2">
              {servicios.map((servicio) => (
                <div key={servicio.id} className="flex items-center justify-between bg-white p-3 rounded border border-blue-200">
                  <div>
                    <p className="font-medium text-gray-900">{servicio.nombre}</p>
                    <p className="text-sm text-gray-600">€{servicio.precioBase.toFixed(2)} (IVA: {servicio.porcentajeIVA}%)</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeServicio(servicio.id)}
                    className="text-red-600 hover:text-red-800 font-semibold"
                  >
                    🗑️
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {tasas.length > 0 && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">Tasas añadidas:</h3>
            <div className="space-y-2">
              {tasas.map((tasa) => (
                <div key={tasa.id} className="flex items-center justify-between bg-white p-3 rounded border border-gray-200">
                  <div>
                    <p className="font-medium text-gray-900">{tasa.nombre}</p>
                    <p className="text-sm text-gray-600">€{tasa.importe.toFixed(2)}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeTasa(tasa.id)}
                    className="text-red-600 hover:text-red-800 font-semibold"
                  >
                    🗑️
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-3">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setMostrarFormTasa(!mostrarFormTasa)}
              className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition text-sm"
            >
              ➕ Agregar Tasa
            </button>
            <button
              type="button"
              onClick={() => setMostrarFormServicio(!mostrarFormServicio)}
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition text-sm"
            >
              ➕ Agregar Servicio Adicional
            </button>
          </div>

          {mostrarFormTasa && (
            <div className="bg-gray-50 p-4 rounded border border-gray-200 space-y-3">
              <h3 className="font-semibold text-gray-900 text-sm">Nueva Tasa</h3>
              <input
                type="text"
                value={nuevaTasa.nombre}
                onChange={(e) => setNuevaTasa({ ...nuevaTasa, nombre: e.target.value })}
                placeholder="Nombre de tasa"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
              <input
                type="number"
                value={nuevaTasa.importe}
                onChange={(e) => setNuevaTasa({ ...nuevaTasa, importe: e.target.value })}
                placeholder="Importe"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    addTasa()
                    setMostrarFormTasa(false)
                  }}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition text-sm"
                >
                  ✅ Añadir
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMostrarFormTasa(false)
                    setNuevaTasa({ nombre: '', importe: '' })
                  }}
                  className="flex-1 px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold rounded-lg transition text-sm"
                >
                  ✕ Cancelar
                </button>
              </div>
            </div>
          )}

          {mostrarFormServicio && (
            <div className="bg-gray-50 p-4 rounded border border-gray-200 space-y-3">
              <h3 className="font-semibold text-gray-900 text-sm">Nuevo Servicio Adicional</h3>
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

              {servicioSeleccionado && (
                <input
                  type="number"
                  value={precioServicio}
                  onChange={(e) => setPrecioServicio(e.target.value)}
                  step="0.01"
                  placeholder="Precio (€) - Opcional"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              )}

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    addServicio()
                    setMostrarFormServicio(false)
                  }}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition text-sm"
                >
                  ✅ Añadir
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMostrarFormServicio(false)
                    setServicioSeleccionado('')
                    setPrecioServicio('')
                  }}
                  className="flex-1 px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold rounded-lg transition text-sm"
                >
                  ✕ Cancelar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Resumen de Precios */}
      <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-300 rounded-lg p-6 mx-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">📊 Resumen de Precios</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-white rounded p-3">
            <p className="text-xs text-gray-600">Honorarios</p>
            <p className="text-lg font-bold text-gray-900">{formatEuro(honorarios)}</p>
          </div>
          <div className="bg-white rounded p-3">
            <p className="text-xs text-gray-600">Servicios</p>
            <p className="text-lg font-bold text-gray-900">{formatEuro(totalServicios)}</p>
          </div>
          <div className="bg-white rounded p-3">
            <p className="text-xs text-gray-600">IVA</p>
            <p className="text-lg font-bold text-gray-900">{formatEuro(iva)}</p>
          </div>
          <div className="bg-white rounded p-3">
            <p className="text-xs text-gray-600">Suplidos</p>
            <p className="text-lg font-bold text-gray-900">{formatEuro(totalSuplidos)}</p>
          </div>
          <div className="bg-blue-600 rounded p-3">
            <p className="text-xs text-blue-100">TOTAL</p>
            <p className="text-lg font-bold text-white">{formatEuro(total)}</p>
          </div>
        </div>
      </div>

      {/* Botones */}
      <div className="flex gap-4 pt-6 border-t mx-8 pb-8">
        <button
          type="submit"
          disabled={saving}
          className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition"
        >
          {saving ? 'Guardando...' : 'Guardar Cambios'}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition"
        >
          Cancelar
        </button>
      </div>
    </form>
  )
}
