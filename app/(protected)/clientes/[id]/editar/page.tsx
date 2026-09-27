'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { validarDocumento, PAISES } from '@/lib/documento-validator'

interface Pais {
  id: string
  nombre: string
  codigo?: string
}

interface Cliente {
  id: string
  nombreCompleto: string
  fechaNacimiento?: string
  nacionalidad?: string
  tipoDocumento?: string
  paisDocumento?: string
  tipoOtroDocumento?: string
  numeroDocumento?: string
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

const TIPOS_DOCUMENTO = ['DNI', 'NIF/CIF', 'NIE', 'Pasaporte', 'Otro']

export default function EditarClientePage() {
  const params = useParams()
  const router = useRouter()
  const clienteId = params.id as string

  const [cliente, setCliente] = useState<Cliente | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState<Partial<Cliente>>({})
  const [validacionDocumento, setValidacionDocumento] = useState<{ valido: boolean; error?: string } | null>(null)
  const [paisesDisponibles, setPaisesDisponibles] = useState<Pais[]>([])
  const [paisesFiltered, setPaisesFiltered] = useState<Pais[]>([])
  const [showPaisesDropdown, setShowPaisesDropdown] = useState(false)
  const [busquedaNacionalidad, setBusquedaNacionalidad] = useState('')
  const [showPaisesDropdownDocumento, setShowPaisesDropdownDocumento] = useState(false)
  const [busquedaPaisDocumento, setBusquedaPaisDocumento] = useState('')
  const [paisesDocumentoFiltered, setPaisesDocumentoFiltered] = useState<Pais[]>([])

  useEffect(() => {
    loadCliente()
    loadPaises()
  }, [clienteId])

  const loadPaises = async () => {
    try {
      const response = await fetch('/api/paises')
      if (response.ok) {
        const data = await response.json()
        setPaisesDisponibles(data)
        setPaisesFiltered(data)
      }
    } catch (error) {
      console.error('Error loading paises:', error)
    }
  }

  const loadCliente = async () => {
    try {
      const response = await fetch(`/api/clientes/${clienteId}`)
      if (!response.ok) throw new Error('Error cargando cliente')
      const data = await response.json()
      setCliente(data)
      setFormData(data)

      // Validar documento al cargar
      if (data.tipoDocumento && data.numeroDocumento) {
        const resultado = validarDocumento(data.tipoDocumento, data.numeroDocumento)
        setValidacionDocumento(resultado)
      }
      // Establecer búsqueda de país del documento si es Pasaporte
      if (data.paisDocumento && data.tipoDocumento === 'Pasaporte') {
        setBusquedaPaisDocumento(data.paisDocumento)
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error cargando cliente')
    } finally {
      setLoading(false)
    }
  }

  const validateEmail = (email: string): boolean => {
    return email.includes('@') && email.includes('.')
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    let processedValue = value

    // Validar y formatear teléfono
    if (name === 'telefono') {
      if (value.startsWith('+')) {
        // Si empieza con +, permitir todos los dígitos sin límite
        processedValue = '+' + value.slice(1).replace(/\D/g, '')
      } else {
        // Sin +, limitar a 9 dígitos en bloques de 3
        const digitos = value.replace(/\D/g, '').slice(0, 9)
        processedValue = digitos
          .split('')
          .reduce((acc, digit, idx) => {
            if (idx > 0 && idx % 3 === 0) {
              return acc + ' ' + digit
            }
            return acc + digit
          }, '')
      }
    }

    const newFormData = {
      ...formData,
      [name]: processedValue,
    }

    setFormData(newFormData)

    // Validar documento cuando cambiar tipo o número
    if (name === 'tipoDocumento' || name === 'numeroDocumento') {
      if (newFormData.tipoDocumento && newFormData.numeroDocumento) {
        const resultado = validarDocumento(newFormData.tipoDocumento, newFormData.numeroDocumento)
        setValidacionDocumento(resultado)
      } else {
        setValidacionDocumento(null)
      }
    }
  }

  const handleNacionalidadChange = (value: string) => {
    setBusquedaNacionalidad(value)
    setShowPaisesDropdown(true)

    // Filtrar países según búsqueda
    if (value.trim()) {
      const filtered = paisesDisponibles.filter((p) =>
        p.nombre.toLowerCase().includes(value.toLowerCase())
      )
      setPaisesFiltered(filtered)
    } else {
      setPaisesFiltered(paisesDisponibles)
    }
  }

  const selectNacionalidad = (pais: Pais) => {
    setFormData({
      ...formData,
      nacionalidad: pais.nombre,
    })
    setBusquedaNacionalidad(pais.nombre)
    setShowPaisesDropdown(false)
  }

  const handlePaisDocumentoChange = (value: string) => {
    setBusquedaPaisDocumento(value)
    setShowPaisesDropdownDocumento(true)
    setFormData((prev) => ({
      ...prev,
      paisDocumento: value,
    }))

    // Filtrar países según búsqueda
    if (value.trim()) {
      const filtered = paisesDisponibles.filter((p) =>
        p.nombre.toLowerCase().includes(value.toLowerCase())
      )
      setPaisesDocumentoFiltered(filtered)
    } else {
      setPaisesDocumentoFiltered(paisesDisponibles)
    }
  }

  const selectPaisDocumento = (pais: Pais) => {
    setFormData((prev) => ({
      ...prev,
      paisDocumento: pais.nombre,
    }))
    setBusquedaPaisDocumento(pais.nombre)
    setShowPaisesDropdownDocumento(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validar email si está presente
    if (formData.email && !validateEmail(formData.email)) {
      toast.error('Email inválido. Debe contener @ y .')
      return
    }

    // Validar documento antes de enviar
    if (formData.tipoDocumento && formData.numeroDocumento) {
      const resultado = validarDocumento(formData.tipoDocumento, formData.numeroDocumento)
      if (!resultado.valido) {
        toast.error(`Documento inválido: ${resultado.error}`)
        return
      }
    }

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
              <label htmlFor="nombreCompleto" className="block text-sm font-medium text-gray-700 mb-1">
                Nombre Completo *
              </label>
              <input
                type="text"
                id="nombreCompleto"
                name="nombreCompleto"
                value={formData.nombreCompleto || ''}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email || ''}
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
                value={formData.telefono || ''}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                value={formData.fechaNacimiento ? formData.fechaNacimiento.split('T')[0] : ''}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="relative">
              <label htmlFor="nacionalidad" className="block text-sm font-medium text-gray-700 mb-1">
                Nacionalidad
              </label>
              <input
                type="text"
                id="nacionalidad"
                value={busquedaNacionalidad}
                onChange={(e) => handleNacionalidadChange(e.target.value)}
                onFocus={() => {
                  setShowPaisesDropdown(true)
                  // Si está vacío, mostrar todos los países
                  if (!busquedaNacionalidad) {
                    setPaisesFiltered(paisesDisponibles)
                  }
                }}
                onBlur={() => setTimeout(() => setShowPaisesDropdown(false), 200)}
                placeholder="Escribe para buscar..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />

              {showPaisesDropdown && paisesFiltered.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                  {paisesFiltered.map((pais) => (
                    <button
                      key={pais.id}
                      type="button"
                      onClick={() => selectNacionalidad(pais)}
                      className="w-full text-left px-4 py-2 hover:bg-blue-50 border-b border-gray-100 last:border-b-0"
                    >
                      {pais.nombre}
                      {pais.codigo && <span className="text-gray-500 ml-2">({pais.codigo})</span>}
                    </button>
                  ))}
                </div>
              )}

              {showPaisesDropdown && busquedaNacionalidad && paisesFiltered.length === 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-3 text-gray-500 text-sm">
                  No se encontraron países
                </div>
              )}
            </div>

            <div>
              <label htmlFor="profesion" className="block text-sm font-medium text-gray-700 mb-1">
                Profesión
              </label>
              <input
                type="text"
                id="profesion"
                name="profesion"
                value={formData.profesion || ''}
                onChange={handleChange}
                placeholder="Campo libre"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Documento */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">📄 Documento</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="tipoDocumento" className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de Documento
              </label>
              <select
                id="tipoDocumento"
                name="tipoDocumento"
                value={formData.tipoDocumento || ''}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Seleccionar...</option>
                {TIPOS_DOCUMENTO.map((tipo) => (
                  <option key={tipo} value={tipo}>
                    {tipo}
                  </option>
                ))}
              </select>
            </div>

            {formData.tipoDocumento === 'Pasaporte' && (
              <div className="relative">
                <label htmlFor="paisDocumento" className="block text-sm font-medium text-gray-700 mb-1">
                  País del Pasaporte
                </label>
                <input
                  type="text"
                  id="paisDocumento"
                  value={busquedaPaisDocumento}
                  onChange={(e) => handlePaisDocumentoChange(e.target.value)}
                  onFocus={() => {
                    setShowPaisesDropdownDocumento(true)
                    // Si está vacío, mostrar todos los países
                    if (!busquedaPaisDocumento) {
                      setPaisesDocumentoFiltered(paisesDisponibles)
                    }
                  }}
                  onBlur={() => setTimeout(() => setShowPaisesDropdownDocumento(false), 200)}
                  placeholder="Escribe para buscar..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {showPaisesDropdownDocumento && paisesDocumentoFiltered.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                    {paisesDocumentoFiltered.map((pais) => (
                      <button
                        key={pais.id}
                        type="button"
                        onClick={() => selectPaisDocumento(pais)}
                        className="w-full text-left px-4 py-2 hover:bg-blue-50 border-b border-gray-100 last:border-b-0"
                      >
                        {pais.nombre}
                        {pais.codigo && <span className="text-gray-500 ml-2">({pais.codigo})</span>}
                      </button>
                    ))}
                  </div>
                )}
                {showPaisesDropdownDocumento && busquedaPaisDocumento && paisesDocumentoFiltered.length === 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-3 text-gray-500 text-sm">
                    No se encontraron países
                  </div>
                )}
              </div>
            )}

            {formData.tipoDocumento === 'Otro' && (
              <div>
                <label htmlFor="tipoOtroDocumento" className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción del Documento
                </label>
                <input
                  type="text"
                  id="tipoOtroDocumento"
                  name="tipoOtroDocumento"
                  value={formData.tipoOtroDocumento || ''}
                  onChange={handleChange}
                  placeholder="Ej: Licencia de conducir"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            )}

            <div className={formData.tipoDocumento ? '' : 'md:col-span-2'}>
              <label htmlFor="numeroDocumento" className="block text-sm font-medium text-gray-700 mb-1">
                Número de Documento
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  id="numeroDocumento"
                  name="numeroDocumento"
                  value={formData.numeroDocumento || ''}
                  onChange={handleChange}
                  placeholder={
                    formData.tipoDocumento === 'DNI'
                      ? '12345678X'
                      : formData.tipoDocumento === 'NIE'
                      ? 'X1234567L'
                      : formData.tipoDocumento === 'NIF/CIF'
                      ? '12345678Z'
                      : formData.tipoDocumento === 'Pasaporte'
                      ? 'ABC123456'
                      : 'Número de documento'
                  }
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {validacionDocumento && formData.numeroDocumento && (
                <div
                  className={`mt-2 text-sm flex items-center gap-2 ${
                    validacionDocumento.valido ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {validacionDocumento.valido ? '✅' : '❌'} {validacionDocumento.error || 'Documento válido'}
                </div>
              )}
            </div>
          </div>

          {/* Mostrar documento completo */}
          {formData.tipoDocumento && formData.numeroDocumento && (
            <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600">
                <span className="font-medium">Documento:</span> {formData.tipoDocumento}
                {formData.paisDocumento && ` (${formData.paisDocumento})`}
                {formData.tipoOtroDocumento && ` - ${formData.tipoOtroDocumento}`} {formData.numeroDocumento}
              </p>
            </div>
          )}
        </div>

        {/* Dirección */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Dirección</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label htmlFor="direccion" className="block text-sm font-medium text-gray-700 mb-1">
                Dirección
              </label>
              <input
                type="text"
                id="direccion"
                name="direccion"
                value={formData.direccion || ''}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                value={formData.codigoPostal || ''}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                value={formData.poblacion || ''}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
            <label htmlFor="situacionActual" className="block text-sm font-medium text-gray-700 mb-1">
              Situación Actual
            </label>
            <textarea
              id="situacionActual"
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
