'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import toast from 'react-hot-toast'
import { formatEuro } from '@/lib/format'
import { getLocationFromPostalCode } from '@/lib/postal-codes'

const FORMAS_PAGO = ['Efectivo', 'Transferencia', 'Tarjeta', 'Cheque']

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

interface TramiteOption {
  tipoTramite: string
  nombre: string
  descripcion?: string
}

interface FormData {
  nombreCompleto: string
  fechaNacimiento: string
  nacionalidad: string
  tipoDocumento: string
  numeroDocumento: string
  paisDocumento?: string
  tipoOtroDocumento?: string
  numeroPasaporte: string
  direccionEnEspana: boolean
  direccion: string
  codigoPostal: string
  poblacion: string
  provincia: string
  email: string
  telefono: string
  profesion: string
  situacionActual: string
  tipoTramite: string
  honorarios: string
  porcentajeIVA: string
  formaPago: string
}

interface Pais {
  id: string
  nombre: string
  codigo?: string
}

export default function TramiteForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const clienteId = searchParams.get('clienteId')

  const [loading, setLoading] = useState(false)
  const [tramitesLoading, setTramitesLoading] = useState(true)
  const [tasas, setTasas] = useState<Tasa[]>([])
  const [servicios, setServicios] = useState<ServicioAnadido[]>([])
  const [serviciosDisponibles, setServiciosDisponibles] = useState<ServicioAdicional[]>([])
  const [tramitesOptions, setTramitesOptions] = useState<TramiteOption[]>([])
  const [nuevaTasa, setNuevaTasa] = useState({ nombre: '', importe: '' })
  const [mostrarFormTasa, setMostrarFormTasa] = useState(false)
  const [servicioSeleccionado, setServicioSeleccionado] = useState('')
  const [precioServicio, setPrecioServicio] = useState('')
  const [mostrarFormServicio, setMostrarFormServicio] = useState(false)
  const [paisesDisponibles, setPaisesDisponibles] = useState<Pais[]>([])
  const [paisesFiltered, setPaisesFiltered] = useState<Pais[]>([])
  const [showPaisesDropdown, setShowPaisesDropdown] = useState(false)
  const [busquedaNacionalidad, setBusquedaNacionalidad] = useState('')
  const [showPaisesDropdownDocumento, setShowPaisesDropdownDocumento] = useState(false)
  const [busquedaPaisDocumento, setBusquedaPaisDocumento] = useState('')
  const [paisesDocumentoFiltered, setPaisesDocumentoFiltered] = useState<Pais[]>([])

  const [formData, setFormData] = useState<FormData>({
    nombreCompleto: '',
    fechaNacimiento: '',
    nacionalidad: '',
    tipoDocumento: '',
    numeroDocumento: '',
    numeroPasaporte: '',
    direccionEnEspana: true,
    direccion: '',
    codigoPostal: '',
    poblacion: '',
    provincia: '',
    email: '',
    telefono: '',
    profesion: '',
    situacionActual: '',
    tipoTramite: '',
    honorarios: '',
    porcentajeIVA: '21',
    formaPago: '',
  })

  // Load tramites list and paises on mount
  useEffect(() => {
    loadTramites()
    loadPaises()
  }, [])

  const loadPaises = async () => {
    try {
      const response = await fetch('/api/paises')
      if (response.ok) {
        const data = await response.json()
        setPaisesDisponibles(data)
        setPaisesFiltered(data)
        setPaisesDocumentoFiltered(data)
      }
    } catch (error) {
      console.error('Error loading paises:', error)
    }
  }

  // Load cliente data when clienteId changes
  useEffect(() => {
    if (clienteId) {
      loadCliente(clienteId)
    }
  }, [clienteId])

  // Load tasas when tipoTramite changes
  useEffect(() => {
    if (formData.tipoTramite) {
      loadTasas(formData.tipoTramite)
      loadServiciosDisponibles(formData.tipoTramite)
    }
  }, [formData.tipoTramite])

  const loadTramites = async () => {
    try {
      setTramitesLoading(true)
      const response = await fetch('/api/admin/tramites-list')
      if (response.ok) {
        const data = await response.json()
        const tramites = data.tramites || []
        setTramitesOptions(tramites)

        // Set first tramite as default
        if (tramites.length > 0) {
          setFormData((prev) => ({
            ...prev,
            tipoTramite: tramites[0].tipoTramite,
          }))
        }
      } else {
        console.error('Failed to load tramites:', response.status)
        toast.error('Error cargando trámites')
      }
    } catch (error) {
      console.error('Error loading tramites:', error)
      toast.error('Error cargando trámites')
    } finally {
      setTramitesLoading(false)
    }
  }

  const loadCliente = async (id: string) => {
    try {
      const response = await fetch(`/api/clientes/${id}`)
      if (response.ok) {
        const cliente = await response.json()
        setFormData((prev) => ({
          ...prev,
          nombreCompleto: cliente.nombreCompleto || '',
          fechaNacimiento: cliente.fechaNacimiento ? cliente.fechaNacimiento.split('T')[0] : '',
          nacionalidad: cliente.nacionalidad || '',
          tipoDocumento: cliente.tipoDocumento || '',
          numeroDocumento: cliente.numeroDocumento || '',
          paisDocumento: cliente.paisDocumento || '',
          tipoOtroDocumento: cliente.tipoOtroDocumento || '',
          numeroPasaporte: cliente.numeroPasaporte || '',
          direccion: cliente.direccion || '',
          codigoPostal: cliente.codigoPostal || '',
          poblacion: cliente.poblacion || '',
          provincia: cliente.provincia || '',
          email: cliente.email || '',
          telefono: cliente.telefono || '',
          profesion: cliente.profesion || '',
          situacionActual: cliente.situacionActual || '',
        }))
        // Establecer búsqueda de nacionalidad si existe
        if (cliente.nacionalidad) {
          setBusquedaNacionalidad(cliente.nacionalidad)
        }
        // Establecer búsqueda de país del documento si es Pasaporte
        if (cliente.paisDocumento && cliente.tipoDocumento === 'Pasaporte') {
          setBusquedaPaisDocumento(cliente.paisDocumento)
        }
      }
    } catch (error) {
      console.error('Error loading cliente:', error)
    }
  }

  const loadTasas = async (tipoTramite: string) => {
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
      console.error('Error loading tasas:', error)
    }
  }

  const loadServiciosDisponibles = async (tipoTramiteId: string) => {
    try {
      const response = await fetch('/api/admin/servicios-adicionales-config')
      if (response.ok) {
        const data = await response.json()
        // Filtrar servicios genéricos o asignados a este tipo de trámite
        const filtered = data.filter((s: any) => {
          if (!s.asignacionesTramites || s.asignacionesTramites.length === 0) {
            return true // Genérico, disponible para todos
          }
          return s.asignacionesTramites.some(
            (a: any) => a.tramiteConfig.id === tipoTramiteId
          )
        })
        setServiciosDisponibles(filtered)
      }
    } catch (error) {
      console.error('Error loading servicios disponibles:', error)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
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

    // Autocompletar población y provincia según código postal (solo si "Dirección en España" está marcado)
    if (name === 'codigoPostal' && value.length === 5 && formData.direccionEnEspana) {
      const location = getLocationFromPostalCode(value)
      if (location) {
        setFormData((prev) => ({
          ...prev,
          [name]: processedValue,
          poblacion: location.poblacion,
          provincia: location.provincia,
        }))
        return
      }
    }

    setFormData((prev) => ({
      ...prev,
      [name]: processedValue,
    }))
  }

  const validateEmail = (email: string): boolean => {
    return email.includes('@') && email.includes('.')
  }

  const handleCheckboxChange = (name: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      [name]: checked,
      // Si se desmarca, limpiar código postal, población y provincia
      ...(name === 'direccionEnEspana' && !checked && {
        codigoPostal: '',
        poblacion: '',
        provincia: '',
      }),
    }))
  }

  const handleNacionalidadChange = (value: string) => {
    setBusquedaNacionalidad(value)
    setShowPaisesDropdown(true)
    setFormData((prev) => ({
      ...prev,
      nacionalidad: value,
    }))

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
    setFormData((prev) => ({
      ...prev,
      nacionalidad: pais.nombre,
    }))
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

    // Agregar como servicio adicional (no como tasa)
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

    // Validar email si está presente
    if (formData.email && !validateEmail(formData.email)) {
      toast.error('Email inválido. Debe contener @ y .')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/tramites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          tasas,
          servicios,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Error al crear el trámite')
      }

      const { tramite } = data
      toast.success('Trámite creado exitosamente')
      router.push(`/tramites/${tramite.id}`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al crear el trámite')
    } finally {
      setLoading(false)
    }
  }

  const honorarios = parseFloat(formData.honorarios) || 0
  const porcentajeIVA = parseFloat(formData.porcentajeIVA) || 21
  const totalServicios = servicios.reduce((sum, s) => sum + s.precioBase, 0)
  const totalSuplidos = tasas.reduce((sum, t) => sum + t.importe, 0)
  const subtotal = honorarios + totalServicios
  const iva = Math.round(subtotal * (porcentajeIVA / 100) * 100) / 100
  const total = subtotal + iva + totalSuplidos

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Datos Personales */}
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Escribir para filtrar..."
            />
            {showPaisesDropdown && paisesFiltered.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                {paisesFiltered.map((pais) => (
                  <button
                    key={pais.id}
                    type="button"
                    onClick={() => selectNacionalidad(pais)}
                    className="w-full text-left px-4 py-2 hover:bg-blue-50 border-b border-gray-100 last:border-b-0 text-sm"
                  >
                    {pais.nombre}
                    {pais.codigo && <span className="text-gray-500 ml-2">({pais.codigo})</span>}
                  </button>
                ))}
              </div>
            )}
            {showPaisesDropdown && busquedaNacionalidad && paisesFiltered.length === 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-3 text-gray-500 text-sm z-10">
                No se encontraron países
              </div>
            )}
          </div>

          <div className="md:col-span-2">
            <label htmlFor="tipoDocumento" className="block text-sm font-medium text-gray-700 mb-1">
              Tipo, País y Número de Documento
            </label>
            {/* Tipo de Documento */}
            <select
              id="tipoDocumento"
              name="tipoDocumento"
              value={formData.tipoDocumento || ''}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4"
            >
              <option value="">Selecciona Tipo de Documento</option>
              <option value="DNI">DNI</option>
              <option value="NIF/CIF">NIF/CIF</option>
              <option value="NIE">NIE</option>
              <option value="Pasaporte">Pasaporte</option>
              <option value="Otro">Otro</option>
            </select>

            {/* País del Pasaporte - Solo mostrar si Pasaporte está seleccionado */}
            {formData.tipoDocumento === 'Pasaporte' && (
              <div className="relative mb-4">
                <label htmlFor="paisDocumento" className="block text-sm font-medium text-gray-700 mb-1">
                  País del Pasaporte *
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Escribir para filtrar..."
                />
                {showPaisesDropdownDocumento && paisesDocumentoFiltered.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                    {paisesDocumentoFiltered.map((pais) => (
                      <button
                        key={pais.id}
                        type="button"
                        onClick={() => selectPaisDocumento(pais)}
                        className="w-full text-left px-4 py-2 hover:bg-blue-50 border-b border-gray-100 last:border-b-0 text-sm"
                      >
                        {pais.nombre}
                        {pais.codigo && <span className="text-gray-500 ml-2">({pais.codigo})</span>}
                      </button>
                    ))}
                  </div>
                )}
                {showPaisesDropdownDocumento && busquedaPaisDocumento && paisesDocumentoFiltered.length === 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-3 text-gray-500 text-sm z-10">
                    No se encontraron países
                  </div>
                )}
              </div>
            )}

            {/* Descripción para Otro */}
            {formData.tipoDocumento === 'Otro' && (
              <div className="mb-4">
                <label htmlFor="tipoOtroDocumento" className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción del Documento *
                </label>
                <input
                  type="text"
                  id="tipoOtroDocumento"
                  name="tipoOtroDocumento"
                  value={formData.tipoOtroDocumento || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ej: Licencia de conducir"
                />
              </div>
            )}
          </div>

          {/* Número de Documento */}
          <div>
            <label htmlFor="numeroDocumento" className="block text-sm font-medium text-gray-700 mb-1">
              Número de Documento
            </label>
            <input
              type="text"
              id="numeroDocumento"
              name="numeroDocumento"
              value={formData.numeroDocumento || ''}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ej: 12345678X"
            />
          </div>

          <div className="md:col-span-2">
            <h3 className="text-base font-semibold text-gray-900 mb-3">Dirección</h3>
            <div className="flex items-center mb-4">
              <input
                type="checkbox"
                id="direccionEnEspana"
                checked={formData.direccionEnEspana}
                onChange={(e) => handleCheckboxChange('direccionEnEspana', e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
              />
              <label htmlFor="direccionEnEspana" className="ml-2 block text-sm font-medium text-gray-700">
                Dirección en España
              </label>
            </div>
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
              maxLength={5}
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
              readOnly={formData.direccionEnEspana && formData.codigoPostal.length === 5}
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
              readOnly={formData.direccionEnEspana && formData.codigoPostal.length === 5}
            />
          </div>

          <div>
            <label htmlFor="profesion" className="block text-sm font-medium text-gray-700 mb-1">
              Profesión
            </label>
            <input
              type="text"
              id="profesion"
              name="profesion"
              value={formData.profesion}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Campo libre"
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

      {/* Datos de Contacto */}
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

      {/* Información del Trámite */}
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
              disabled={tramitesLoading}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
            >
              <option value="">
                {tramitesLoading ? 'Cargando...' : tramitesOptions.length === 0 ? 'Sin trámites disponibles' : 'Seleccionar tipo...'}
              </option>
              {tramitesOptions.map((tramite) => (
                <option key={tramite.tipoTramite} value={tramite.tipoTramite}>
                  {tramite.nombre}
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
        </div>
      </div>

      {/* Suplidos */}
      <div>
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
      <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-300 rounded-lg p-6">
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
