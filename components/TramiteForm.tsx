'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import toast from 'react-hot-toast'
import { formatEuro } from '@/lib/format'

const FORMAS_PAGO = [
  'Efectivo',
  'Transferencia',
  'Tarjeta',
  'Cheque',
]

interface Tasa {
  id: string
  nombre: string
  importe: number
}

interface TramiteConfig {
  nombre: string
  descripcion?: string
}

export default function TramiteForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const clienteId = searchParams.get('clienteId')
  const [loading, setLoading] = useState(false)
  const [tasas, setTasas] = useState<Tasa[]>([])
  const [nuevaTasa, setNuevaTasa] = useState({ nombre: '', importe: '' })
  const [tramitesConfig, setTramitesConfig] = useState<Record<string, TramiteConfig>>({})
  const [formData, setFormData] = useState({
    // Cliente
    nombreCompleto: '',
    fechaNacimiento: '',
    nacionalidad: '',
    numeroPasaporte: '',
    direccion: '',
    codigoPostal: '',
    poblacion: '',
    provincia: '',
    email: '',
    telefono: '',
    situacionActual: '',
    // Trámite
    tipoTramite: '',
    honorarios: '',
    formaPago: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))

    // Si cambia el tipo de trámite, cargar tasas de la BD
    if (name === 'tipoTramite') {
      loadTasasPorTramite(value)
    }
  }

  const loadTasasPorTramite = async (tipoTramite: string) => {
    try {
      const response = await fetch(`/api/admin/tasas-config?tipoTramite=${encodeURIComponent(tipoTramite)}`)
      if (response.ok) {
        const data = await response.json()
        const tasasDelTramite = data.tasasConfig?.[tipoTramite] || []
        setTasas(
          tasasDelTramite.map((t: any, i: number) => ({
            id: `default-${i}`,
            nombre: t.nombre,
            importe: t.importe,
          }))
        )
      }
    } catch (error) {
      console.error('Error cargando tasas:', error)
    }
  }

  useEffect(() => {
    const loadData = async () => {
      try {
        // Cargar configuración de trámites
        const configResponse = await fetch('/api/admin/tramites-config')
        if (configResponse.ok) {
          const configData = await configResponse.json()
          setTramitesConfig(configData.configs || {})
        }

        // Cargar datos del cliente si viene clienteId
        if (clienteId) {
          const clienteResponse = await fetch(`/api/clientes/${clienteId}`)
          if (clienteResponse.ok) {
            const cliente = await clienteResponse.json()
            setFormData((prev) => ({
              ...prev,
              nombreCompleto: cliente.nombreCompleto || '',
              fechaNacimiento: cliente.fechaNacimiento ? cliente.fechaNacimiento.split('T')[0] : '',
              nacionalidad: cliente.nacionalidad || '',
              numeroPasaporte: cliente.numeroPasaporte || '',
              direccion: cliente.direccion || '',
              codigoPostal: cliente.codigoPostal || '',
              poblacion: cliente.poblacion || '',
              provincia: cliente.provincia || '',
              email: cliente.email || '',
              telefono: cliente.telefono || '',
              situacionActual: cliente.situacionActual || '',
            }))
          }
        }

        // Cargar tasas del primer tipo de trámite por defecto
        if (configResponse.ok) {
          const configData = await configResponse.json()
          const tiposDisponibles = Object.keys(configData?.configs || {})
          if (tiposDisponibles.length > 0) {
            await loadTasasPorTramite(tiposDisponibles[0])
            setFormData((prev) => ({
              ...prev,
              tipoTramite: tiposDisponibles[0],
            }))
          }
        }
      } catch (error) {
        console.error('Error cargando datos:', error)
      }
    }

    loadData()
  }, [clienteId])

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/tramites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          tasas,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Error al crear el trámite')
      }

      const { tramite } = await response.json()
      toast.success('Trámite creado exitosamente')
      router.push(`/tramites/${tramite.id}`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al crear el trámite')
    } finally {
      setLoading(false)
    }
  }

  const totalTasas = tasas.reduce((sum, t) => sum + t.importe, 0)
  const honorarios = parseFloat(formData.honorarios) || 0
  const iva = honorarios * 0.21
  const total = honorarios + iva + totalTasas

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Sección: Datos Personales */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Datos Personales</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="nombreCompleto" className="block text-sm font-medium text-gray-700 mb-1">
              Nombre Completo *
            </label>
            <input
              type="text"
              id="nombreCompleto"
              name="nombreCompleto"
              value={formData.nombreCompleto}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Juan García López"
            />
          </div>

          <div>
            <label htmlFor="fechaNacimiento" className="block text-sm font-medium text-gray-700 mb-1">
              Fecha de Nacimiento
            </label>
            <input
              type="date"
              id="fechaNacimiento"
              name="fechaNacimiento"
              value={formData.fechaNacimiento}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label htmlFor="nacionalidad" className="block text-sm font-medium text-gray-700 mb-1">
              Nacionalidad
            </label>
            <input
              type="text"
              id="nacionalidad"
              name="nacionalidad"
              value={formData.nacionalidad}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Colombiana"
            />
          </div>

          <div className="md:col-span-2">
            <label htmlFor="numeroPasaporte" className="block text-sm font-medium text-gray-700 mb-1">
              Tipo, País y Número de Documento
            </label>
            <input
              type="text"
              id="numeroPasaporte"
              name="numeroPasaporte"
              value={formData.numeroPasaporte}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ej: Pasaporte Colombiano CC-1234567890"
            />
          </div>

          <div className="md:col-span-2">
            <label htmlFor="direccion" className="block text-sm font-medium text-gray-700 mb-1">
              Calle, Número, Piso y Portal
            </label>
            <input
              type="text"
              id="direccion"
              name="direccion"
              value={formData.direccion}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Calle Principal 123, 3º A"
            />
          </div>

          <div>
            <label htmlFor="codigoPostal" className="block text-sm font-medium text-gray-700 mb-1">
              Código Postal
            </label>
            <input
              type="text"
              id="codigoPostal"
              name="codigoPostal"
              value={formData.codigoPostal}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="08002"
            />
          </div>

          <div>
            <label htmlFor="poblacion" className="block text-sm font-medium text-gray-700 mb-1">
              Población
            </label>
            <input
              type="text"
              id="poblacion"
              name="poblacion"
              value={formData.poblacion}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Barcelona"
            />
          </div>

          <div>
            <label htmlFor="provincia" className="block text-sm font-medium text-gray-700 mb-1">
              Provincia
            </label>
            <input
              type="text"
              id="provincia"
              name="provincia"
              value={formData.provincia}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Barcelona"
            />
          </div>

          <div>
            <label htmlFor="situacionActual" className="block text-sm font-medium text-gray-700 mb-1">
              Situación Migratoria Actual
            </label>
            <input
              type="text"
              id="situacionActual"
              name="situacionActual"
              value={formData.situacionActual}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ej: Sin visado"
            />
          </div>
        </div>
      </div>

      {/* Sección: Contacto */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Datos de Contacto</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label htmlFor="telefono" className="block text-sm font-medium text-gray-700 mb-1">
              Teléfono
            </label>
            <input
              type="tel"
              id="telefono"
              name="telefono"
              value={formData.telefono}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Sección: Trámite */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Información del Trámite</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="tipoTramite" className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Trámite *
            </label>
            <select
              id="tipoTramite"
              name="tipoTramite"
              value={formData.tipoTramite}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Seleccionar tipo...</option>
              {Object.entries(tramitesConfig).map(([tipo, config]) => (
                <option key={tipo} value={tipo}>
                  {config.nombre || tipo}
                </option>
              ))}
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
              <option value="">Seleccionar forma...</option>
              {FORMAS_PAGO.map((forma) => (
                <option key={forma} value={forma}>
                  {forma}
                </option>
              ))}
            </select>
          </div>

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
              placeholder="500.00"
            />
          </div>
        </div>
      </div>

      {/* Sección: Tasas y Suplidos */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">💰 Tasas y Suplidos</h2>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de la Tasa</label>
              <input
                type="text"
                value={nuevaTasa.nombre}
                onChange={(e) => setNuevaTasa({ ...nuevaTasa, nombre: e.target.value })}
                placeholder="Ej: Tasa de registro"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Importe (€)</label>
                <input
                  type="number"
                  value={nuevaTasa.importe}
                  onChange={(e) => setNuevaTasa({ ...nuevaTasa, importe: e.target.value })}
                  step="0.01"
                  placeholder="0.00"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="pt-7">
                <button
                  type="button"
                  onClick={addTasa}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg"
                >
                  ➕ Añadir
                </button>
              </div>
            </div>
          </div>
        </div>

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
      </div>

      {/* Sección: Resumen de Precios */}
      <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-300 rounded-lg p-6">
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

      <div className="flex gap-4 pt-6 border-t">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition"
        >
          {loading ? 'Creando...' : 'Crear Trámite'}
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
