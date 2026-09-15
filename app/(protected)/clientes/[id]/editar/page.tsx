'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'

interface Cliente {
  id: string
  nombreCompleto: string
  fechaNacimiento?: string
  nacionalidad?: string
  numeroPasaporte?: string
  direccion?: string
  codigoPostal?: string
  poblacion?: string
  provincia?: string
  email?: string
  telefono?: string
  profesion?: string
  situacionActual?: string
}

export default function EditarClientePage() {
  const params = useParams()
  const router = useRouter()
  const clienteId = params.id as string

  const [cliente, setCliente] = useState<Cliente | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState<Partial<Cliente>>({})

  useEffect(() => {
    loadCliente()
  }, [clienteId])

  const loadCliente = async () => {
    try {
      const response = await fetch(`/api/clientes/${clienteId}`)
      if (!response.ok) throw new Error('Error cargando cliente')
      const data = await response.json()
      setCliente(data)
      setFormData(data)
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error cargando cliente')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const response = await fetch(`/api/clientes/${clienteId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Error al guardar')
      }

      toast.success('✅ Cliente actualizado correctamente')
      router.push(`/clientes/${clienteId}`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al guardar cliente')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="p-8">Cargando...</div>
  if (!cliente) return <div className="p-8">Cliente no encontrado</div>

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="mb-8">
        <Link href={`/clientes/${clienteId}`} className="text-blue-600 hover:text-blue-800 text-sm font-semibold">
          ← Volver al Cliente
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 mt-4">Editar Cliente</h1>
        <p className="text-gray-600 mt-2">{cliente.nombreCompleto}</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-8 space-y-6">
        {/* Datos Personales */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Datos Personales</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo *</label>
              <input
                type="text"
                name="nombreCompleto"
                value={formData.nombreCompleto || ''}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email || ''}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
              <input
                type="tel"
                name="telefono"
                value={formData.telefono || ''}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Nacimiento</label>
              <input
                type="date"
                name="fechaNacimiento"
                value={formData.fechaNacimiento ? formData.fechaNacimiento.split('T')[0] : ''}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nacionalidad</label>
              <input
                type="text"
                name="nacionalidad"
                value={formData.nacionalidad || ''}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Número de Pasaporte</label>
              <input
                type="text"
                name="numeroPasaporte"
                value={formData.numeroPasaporte || ''}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Profesión</label>
              <input
                type="text"
                name="profesion"
                value={formData.profesion || ''}
                onChange={handleChange}
                placeholder="Campo libre"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Dirección */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Dirección</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
              <input
                type="text"
                name="direccion"
                value={formData.direccion || ''}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Código Postal</label>
              <input
                type="text"
                name="codigoPostal"
                value={formData.codigoPostal || ''}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Población</label>
              <input
                type="text"
                name="poblacion"
                value={formData.poblacion || ''}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Provincia</label>
              <input
                type="text"
                name="provincia"
                value={formData.provincia || ''}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Situación Actual */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Información Adicional</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Situación Actual</label>
            <textarea
              name="situacionActual"
              value={formData.situacionActual || ''}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Notas sobre la situación actual del cliente"
            />
          </div>
        </div>

        {/* Botones */}
        <div className="flex gap-4 mt-8">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition"
          >
            {saving ? 'Guardando...' : '✅ Guardar Cambios'}
          </button>
          <Link
            href={`/clientes/${clienteId}`}
            className="px-6 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold rounded-lg transition"
          >
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  )
}
