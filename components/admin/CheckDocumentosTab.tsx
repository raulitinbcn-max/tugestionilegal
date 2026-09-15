'use client'

import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import EditarCheckDocumentoModal from './EditarCheckDocumentoModal'

interface TramiteConfig {
  id: string
  tipoTramite: string
  nombre: string
  descripcion?: string
  categoria?: string
}

interface Categoria {
  id: string
  clave: string
  codigo: string
  nombre: string
  icono?: string
}

interface CheckDocumento {
  id: string
  nombre: string
  descripcion?: string
  tramiteConfigId: string
  orden?: number
  tipoVencimiento?: string
  diasCaducidad?: number
}

export default function CheckDocumentosTab() {
  const [tramitesConfig, setTramitesConfig] = useState<TramiteConfig[]>([])
  const [checkDocumentos, setCheckDocumentos] = useState<CheckDocumento[]>([])
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTramiteConfigId, setSelectedTramiteConfigId] = useState<string>('')
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedDocumento, setSelectedDocumento] = useState<CheckDocumento | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadTramitesConfig()
    loadCategorias()
  }, [])

  useEffect(() => {
    if (selectedTramiteConfigId) {
      loadDocumentos()
    }
  }, [selectedTramiteConfigId])

  const loadTramitesConfig = async () => {
    try {
      const response = await fetch('/api/admin/tramites-config')
      if (response.ok) {
        const data = await response.json()
        if (data.configs && data.configIds) {
          const tramitesArray = Object.entries(data.configs).map(([tipoTramite, config]: [string, any]) => ({
            id: data.configIds[tipoTramite],
            tipoTramite,
            nombre: config.nombre,
            descripcion: config.descripcion,
            categoria: config.categoria,
          }))
          setTramitesConfig(tramitesArray)
          if (tramitesArray.length > 0 && !selectedTramiteConfigId) {
            setSelectedTramiteConfigId(tramitesArray[0].id)
          }
        }
      }
    } catch (error) {
      console.error('Error cargando trámites config:', error)
      toast.error('Error cargando configuración de trámites')
    }
  }

  const loadCategorias = async () => {
    try {
      const response = await fetch('/api/admin/categorias-tramite')
      if (response.ok) {
        setCategorias(await response.json())
      }
    } catch (error) {
      console.error('Error cargando categorías:', error)
    }
  }

  const loadDocumentos = async () => {
    if (!selectedTramiteConfigId) return
    setLoading(true)
    try {
      const response = await fetch(`/api/admin/check-documentos?tramiteConfigId=${selectedTramiteConfigId}`)
      if (response.ok) {
        const data = await response.json()
        const sorted = [...data].sort((a, b) => (a.orden || 0) - (b.orden || 0))
        setCheckDocumentos(sorted)
      }
    } catch (error) {
      console.error('Error cargando:', error)
      toast.error('Error cargando checklist')
    } finally {
      setLoading(false)
    }
  }

  const getCategoriaDelTramite = (tramiteConfigId: string) => {
    const config = tramitesConfig.find((t) => t.id === tramiteConfigId)
    return categorias.find((c) => c.clave === config?.categoria)
  }

  const handleNuevoDocumento = () => {
    const newDoc: CheckDocumento = {
      id: `new-${Date.now()}`,
      nombre: '',
      descripcion: '',
      tramiteConfigId: selectedTramiteConfigId,
      orden: (checkDocumentos.length + 1) * 10,
      tipoVencimiento: '',
      diasCaducidad: 0,
    }
    setSelectedDocumento(newDoc)
    setModalOpen(true)
  }

  const handleEditarDocumento = (documento: CheckDocumento) => {
    setSelectedDocumento(documento)
    setModalOpen(true)
  }

  const handleGuardarDocumento = async (documento: CheckDocumento) => {
    setSaving(true)
    try {
      if (documento.id.startsWith('new-')) {
        const response = await fetch('/api/admin/check-documentos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nombre: documento.nombre,
            descripcion: documento.descripcion,
            tramiteConfigId: documento.tramiteConfigId,
            orden: documento.orden || 0,
            tipoVencimiento: documento.tipoVencimiento || null,
            diasCaducidad: documento.diasCaducidad ? parseInt(documento.diasCaducidad.toString()) : null,
          }),
        })

        if (!response.ok) throw new Error('Error al crear documento')
      } else {
        const response = await fetch(`/api/admin/check-documentos/${documento.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nombre: documento.nombre,
            descripcion: documento.descripcion,
            orden: documento.orden || 0,
            tipoVencimiento: documento.tipoVencimiento || null,
            diasCaducidad: documento.diasCaducidad ? parseInt(documento.diasCaducidad.toString()) : null,
          }),
        })

        if (!response.ok) throw new Error('Error al actualizar documento')
      }

      await loadDocumentos()
    } catch (error) {
      console.error('Error:', error)
      throw error
    } finally {
      setSaving(false)
    }
  }

  const handleEliminarDocumento = async (id: string) => {
    if (!confirm('¿Eliminar este documento del checklist?')) return

    try {
      const response = await fetch(`/api/admin/check-documentos/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Error eliminando')

      toast.success('✅ Documento eliminado')
      await loadDocumentos()
    } catch (error) {
      toast.error('Error eliminando documento')
    }
  }

  const tramiteActual = tramitesConfig.find((t) => t.id === selectedTramiteConfigId)
  const categoriaActual = selectedTramiteConfigId ? getCategoriaDelTramite(selectedTramiteConfigId) : null

  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">✅ Checklist de Documentos</h2>
        <p className="text-gray-600 text-sm mt-1">Define los documentos requeridos para cada tipo de trámite.</p>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-6 border-l-4 border-blue-500">
        <label className="block text-sm font-medium text-gray-700 mb-3">Filtrar por Trámite</label>
        <select
          value={selectedTramiteConfigId}
          onChange={(e) => setSelectedTramiteConfigId(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="">-- Selecciona un trámite --</option>
          {tramitesConfig.map((tramite) => {
            const categoria = categorias.find((c) => c.clave === tramite.categoria)
            return (
              <option key={tramite.id} value={tramite.id}>
                {categoria?.icono} {categoria?.nombre} - {tramite.nombre}
              </option>
            )
          })}
        </select>

        {categoriaActual && tramiteActual && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200 flex items-center gap-3">
            <span className="text-3xl">{categoriaActual.icono}</span>
            <div>
              <p className="text-sm font-semibold text-gray-900">{categoriaActual.nombre}</p>
              <p className="text-sm text-gray-600">{tramiteActual.nombre}</p>
            </div>
          </div>
        )}
      </div>

      {/* Botón Nuevo Documento */}
      <div className="mb-6">
        <button
          onClick={handleNuevoDocumento}
          className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition"
        >
          ➕ Nuevo Documento
        </button>
      </div>

      {/* Tabla de Documentos */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Nº Orden</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Nombre del Documento</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Descripción</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Tipo de Vencimiento</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Días</th>
              <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                  Cargando documentos...
                </td>
              </tr>
            ) : checkDocumentos.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                  No hay documentos configurados para este trámite
                </td>
              </tr>
            ) : (
              checkDocumentos.map((doc) => (
                <tr key={doc.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4">
                    <p className="text-sm font-semibold text-gray-900">{doc.orden || '—'}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-semibold text-gray-900">{doc.nombre}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-600 max-w-xs truncate">{doc.descripcion || '—'}</p>
                  </td>
                  <td className="px-6 py-4">
                    {doc.tipoVencimiento ? (
                      <span className="inline-block px-2 py-1 bg-orange-100 text-orange-800 rounded text-xs font-semibold">
                        {doc.tipoVencimiento === 'documento' && '📄'}
                        {doc.tipoVencimiento === 'requerimiento' && '📋'}
                        {doc.tipoVencimiento === 'accion' && '⏱️'}
                        {' '}
                        {doc.tipoVencimiento === 'documento' && 'Documento'}
                        {doc.tipoVencimiento === 'requerimiento' && 'Requerimiento'}
                        {doc.tipoVencimiento === 'accion' && 'Acción'}
                      </span>
                    ) : (
                      <span className="text-gray-400 text-sm">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-semibold text-gray-900">{doc.diasCaducidad || '—'}</p>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => handleEditarDocumento(doc)}
                        className="px-3 py-1 text-sm bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-lg font-semibold transition"
                      >
                        ✏️ Editar
                      </button>
                      <button
                        onClick={() => handleEliminarDocumento(doc.id)}
                        className="px-3 py-1 text-sm bg-red-100 text-red-700 hover:bg-red-200 rounded-lg font-semibold transition"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal de Edición */}
      <EditarCheckDocumentoModal
        isOpen={modalOpen}
        documento={selectedDocumento}
        onClose={() => {
          setModalOpen(false)
          setSelectedDocumento(null)
        }}
        onSave={handleGuardarDocumento}
      />
    </div>
  )
}
