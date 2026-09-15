'use client'

import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'

interface Tramite {
  id: string
  codigo: string
  estado: string
  cliente: { nombreCompleto: string }
}

interface TipoDocumento {
  id: string
  nombre: string
  icono?: string
  color?: string
  orden: number
}

interface DocumentoEntrada {
  id: string
  name: string
  createdTime?: string
}

interface DocumentoConDestino extends DocumentoEntrada {
  tramiteId?: string
  tipoDocumentoId?: string
}

export default function DocumentosPendientes({
  tramites: todosTramites,
  tiposDocumento = [],
}: {
  tramites: Tramite[]
  tiposDocumento?: TipoDocumento[]
}) {
  const [documentos, setDocumentos] = useState<DocumentoConDestino[]>([])
  const [loading, setLoading] = useState(true)
  const [moviendo, setMoviendo] = useState(false)
  const [filtrosBusqueda, setFiltrosBusqueda] = useState<Record<string, string>>({})
  const [filtrosTipo, setFiltrosTipo] = useState<Record<string, string>>({})
  const [dropdownsAbiertos, setDropdownsAbiertos] = useState<Record<string, boolean>>({})
  const [dropdownsTipoAbiertos, setDropdownsTipoAbiertos] = useState<Record<string, boolean>>({})

  // Filtrar trámites activos (no completados)
  const tramites = todosTramites.filter((t) => t.estado !== 'Completado' && t.estado !== 'completado')

  useEffect(() => {
    loadDocumentos()
  }, [])

  const loadDocumentos = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/documentos/entrada')
      if (!response.ok) {
        const errorData = await response.json()
        // Verificar si es error de autenticación
        if (response.status === 401 || errorData.error?.includes('Invalid Credentials') || errorData.error?.includes('invalid_token')) {
          toast.error(
            'Error de autenticación con Google. Por favor, cierra sesión y vuelve a iniciar sesión.',
            { duration: 5000 }
          )
        } else {
          toast.error('Error al cargar documentos de entrada')
        }
        throw new Error(errorData.error || 'Error al cargar documentos')
      }
      const data = await response.json()

      // Auto-asignar trámite si el nombre contiene TR-XXXXX
      const documentosConDestino = data.map((doc: DocumentoEntrada) => {
        const codigoMatch = doc.name?.match(/^(TR-\d+)/i)
        if (codigoMatch) {
          const codigo = codigoMatch[1].toUpperCase()
          const tramite = tramites.find((t) => t.codigo === codigo)
          return { ...doc, tramiteId: tramite?.id }
        }
        return { ...doc, tramiteId: undefined }
      })

      setDocumentos(documentosConDestino)
      setFiltrosBusqueda({})
      setDropdownsAbiertos({})
    } catch (error) {
      console.error('Error:', error)
      // El toast ya se mostró arriba si es error de autenticación
    } finally {
      setLoading(false)
    }
  }

  const asignarTramite = (docId: string, tramiteId: string) => {
    setDocumentos((prev) =>
      prev.map((doc) =>
        doc.id === docId ? { ...doc, tramiteId: tramiteId || undefined } : doc
      )
    )
    setDropdownsAbiertos((prev) => ({ ...prev, [docId]: false }))
  }

  const asignarTipo = (docId: string, tipoId: string) => {
    setDocumentos((prev) =>
      prev.map((doc) =>
        doc.id === docId ? { ...doc, tipoDocumentoId: tipoId || undefined } : doc
      )
    )
    setDropdownsTipoAbiertos((prev) => ({ ...prev, [docId]: false }))
  }

  const handleBusqueda = (docId: string, valor: string) => {
    setFiltrosBusqueda((prev) => ({ ...prev, [docId]: valor }))
  }

  const handleBusquedaTipo = (docId: string, valor: string) => {
    setFiltrosTipo((prev) => ({ ...prev, [docId]: valor }))
  }

  const obtenerOpciones = (docId: string) => {
    const busqueda = (filtrosBusqueda[docId] || '').toLowerCase()
    if (!busqueda) return tramites

    return tramites.filter((t) =>
      t.codigo.toLowerCase().includes(busqueda) ||
      t.cliente.nombreCompleto.toLowerCase().includes(busqueda)
    )
  }

  const obtenerOpcionesTipo = (docId: string) => {
    const busqueda = (filtrosTipo[docId] || '').toLowerCase()
    if (!busqueda) return tiposDocumento

    return tiposDocumento.filter((t) =>
      t.nombre.toLowerCase().includes(busqueda)
    )
  }

  const moverDocumentosAsignados = async () => {
    const conDestino = documentos.filter((doc) => doc.tramiteId)
    if (conDestino.length === 0) {
      toast.error('No hay documentos con destino asignado')
      return
    }

    setMoviendo(true)
    try {
      const response = await fetch('/api/documentos/mover-entrada', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          movimientos: conDestino.map((doc) => ({
            documentoId: doc.id,
            tramiteId: doc.tramiteId,
          })),
        }),
      })

      if (!response.ok) throw new Error('Error al mover documentos')

      const result = await response.json()
      toast.success(`✅ ${result.movidos} documento(s) movido(s) correctamente`)
      await loadDocumentos()
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error moviendo documentos')
    } finally {
      setMoviendo(false)
    }
  }

  const moverASinClasificar = async () => {
    const sinDestino = documentos.filter((doc) => !doc.tramiteId)
    if (sinDestino.length === 0) {
      toast.error('No hay documentos sin destino')
      return
    }

    setMoviendo(true)
    try {
      const response = await fetch('/api/documentos/mover-sin-clasificar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentoIds: sinDestino.map((doc) => doc.id),
        }),
      })

      if (!response.ok) throw new Error('Error al mover documentos')

      const result = await response.json()
      toast.success(`✅ ${result.movidos} documento(s) movido(s) a Sin clasificar`)
      await loadDocumentos()
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error moviendo documentos a Sin clasificar')
    } finally {
      setMoviendo(false)
    }
  }

  if (loading) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">⏳ Cargando documentos de entrada...</p>
      </div>
    )
  }

  if (documentos.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">No hay documentos en la carpeta de entrada</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Tabla de documentos */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 border-b border-gray-300">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Documento</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Destino (Trámite)</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Tipo de Documento</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {documentos.map((doc) => {
              const tramiteSeleccionado = tramites.find((t) => t.id === doc.tramiteId)
              const tipoSeleccionado = tiposDocumento.find((t) => t.id === doc.tipoDocumentoId)

              return (
                <tr key={doc.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span>📄</span>
                      <span className="font-medium text-gray-900 truncate">{doc.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="relative">
                      <input
                        type="text"
                        value={
                          tramiteSeleccionado
                            ? `${tramiteSeleccionado.codigo} - ${tramiteSeleccionado.cliente.nombreCompleto}`
                            : filtrosBusqueda[doc.id] || ''
                        }
                        onClick={() => !tramiteSeleccionado && setDropdownsAbiertos((prev) => ({ ...prev, [doc.id]: !prev[doc.id] }))}
                        onChange={(e) => handleBusqueda(doc.id, e.target.value)}
                        onFocus={() => !tramiteSeleccionado && setDropdownsAbiertos((prev) => ({ ...prev, [doc.id]: true }))}
                        placeholder="Buscar trámite..."
                        readOnly={!!tramiteSeleccionado}
                        className="w-full px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                      />
                      {dropdownsAbiertos[doc.id] && !tramiteSeleccionado && (
                        <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-lg mt-1 max-h-48 overflow-y-auto z-10">
                          {obtenerOpciones(doc.id).length > 0 ? (
                            obtenerOpciones(doc.id).map((t) => (
                              <button
                                key={t.id}
                                onClick={() => asignarTramite(doc.id, t.id)}
                                className="w-full text-left px-3 py-2 hover:bg-blue-50 text-sm border-b last:border-b-0"
                              >
                                {t.codigo} - {t.cliente.nombreCompleto}
                              </button>
                            ))
                          ) : (
                            <div className="px-3 py-2 text-gray-600 text-sm">No hay trámites disponibles</div>
                          )}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="relative">
                      <input
                        type="text"
                        value={
                          tipoSeleccionado
                            ? `${tipoSeleccionado.icono || ''} ${tipoSeleccionado.nombre}`.trim()
                            : filtrosTipo[doc.id] || ''
                        }
                        onClick={() => !tipoSeleccionado && setDropdownsTipoAbiertos((prev) => ({ ...prev, [doc.id]: !prev[doc.id] }))}
                        onChange={(e) => handleBusquedaTipo(doc.id, e.target.value)}
                        onFocus={() => !tipoSeleccionado && setDropdownsTipoAbiertos((prev) => ({ ...prev, [doc.id]: true }))}
                        placeholder="Buscar tipo..."
                        readOnly={!!tipoSeleccionado}
                        className="w-full px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500"
                      />
                      {dropdownsTipoAbiertos[doc.id] && !tipoSeleccionado && (
                        <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-lg mt-1 max-h-48 overflow-y-auto z-10">
                          {obtenerOpcionesTipo(doc.id).length > 0 ? (
                            obtenerOpcionesTipo(doc.id).map((tipo) => (
                              <button
                                key={tipo.id}
                                onClick={() => asignarTipo(doc.id, tipo.id)}
                                className="w-full text-left px-3 py-2 hover:bg-purple-50 text-sm border-b last:border-b-0 flex items-center gap-2"
                              >
                                {tipo.icono && <span>{tipo.icono}</span>}
                                <span>{tipo.nombre}</span>
                              </button>
                            ))
                          ) : (
                            <div className="px-3 py-2 text-gray-600 text-sm">No hay tipos disponibles</div>
                          )}
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Botones de movimiento */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={moverDocumentosAsignados}
          disabled={moviendo || documentos.every((d) => !d.tramiteId)}
          className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition"
        >
          {moviendo ? '⏳ Moviendo...' : `✅ Mover ${documentos.filter((d) => d.tramiteId).length} Documentos`}
        </button>
        <button
          onClick={moverASinClasificar}
          disabled={moviendo || documentos.every((d) => d.tramiteId)}
          className="flex-1 bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition"
        >
          {moviendo ? '⏳ Moviendo...' : `📦 Archivar ${documentos.filter((d) => !d.tramiteId).length} a Sin Clasificar`}
        </button>
        <button
          onClick={loadDocumentos}
          disabled={loading}
          className="px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition"
        >
          🔄 Recargar
        </button>
      </div>
    </div>
  )
}
