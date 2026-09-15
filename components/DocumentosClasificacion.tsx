'use client'

import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { Documento, DocumentoGenerado, Plantilla, TipoDocumento } from '@prisma/client'

interface DocumentoConTipo extends Documento {
  tipoDocumento?: TipoDocumento | null
}

interface DocumentoGeneradoConTipo extends DocumentoGenerado {
  plantilla: Plantilla
}

interface Props {
  tramiteId: string
  tipoTramite: string
  documentos: DocumentoConTipo[]
  documentosGenerados?: DocumentoGeneradoConTipo[]
  documentosDrive?: Array<{ id: string; name: string }>
  onDocumentoUpdated: () => void
}

export default function DocumentosClasificacion({
  tramiteId,
  tipoTramite,
  documentos,
  documentosGenerados = [],
  documentosDrive = [],
  onDocumentoUpdated,
}: Props) {
  const [tipos, setTipos] = useState<TipoDocumento[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedDocId, setExpandedDocId] = useState<string | null>(null)

  useEffect(() => {
    fetchTipos()
  }, [])

  const fetchTipos = async () => {
    try {
      const res = await fetch('/api/admin/tipos-documento')
      if (res.ok) {
        const data = await res.json()
        setTipos(data.sort((a: TipoDocumento, b: TipoDocumento) => a.orden - b.orden))
      }
    } catch (error) {
      console.error('Error al cargar tipos:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAsignarTipo = async (docId: string, tipoId: string | null) => {
    try {
      const res = await fetch(`/api/documentos/${docId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tipoDocumentoId: tipoId }),
      })

      if (!res.ok) throw new Error(await res.text())
      toast.success('✅ Tipo asignado')
      onDocumentoUpdated()
      setExpandedDocId(null)
    } catch (error) {
      toast.error('Error al asignar tipo')
      console.error(error)
    }
  }

  if (loading) {
    return <div className="text-gray-500 text-sm">Cargando tipos de documento...</div>
  }

  if (documentos.length === 0 && documentosGenerados.length === 0 && documentosDrive.length === 0) {
    return <div className="text-gray-500 text-sm">No hay documentos</div>
  }

  return (
    <div className="space-y-3">
      {documentos.map((doc) => (
        <div
          key={doc.id}
          className={`p-4 rounded-md border transition ${
            doc.tipoDocumentoId
              ? 'bg-green-50 border-green-200'
              : 'bg-yellow-50 border-yellow-200'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-900">{doc.nombre}</p>
              <a
                href={`https://drive.google.com/file/d/${doc.driveFileId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:text-blue-700"
              >
                Ver en Drive
              </a>
            </div>
            <button
              onClick={() => setExpandedDocId(expandedDocId === doc.id ? null : doc.id)}
              className="px-3 py-1 text-sm font-medium text-gray-600 hover:text-gray-900"
            >
              {expandedDocId === doc.id ? '✕' : '→'}
            </button>
          </div>

          {expandedDocId === doc.id && (
            <div className="mt-3 pt-3 border-t space-y-2">
              <div>
                <label className="text-xs font-medium text-gray-700">Tipo de Documento</label>
                <select
                  value={doc.tipoDocumentoId || ''}
                  onChange={(e) => handleAsignarTipo(doc.id, e.target.value || null)}
                  className="mt-1 block w-full text-sm border rounded px-2 py-1"
                >
                  <option value="">Sin asignar</option>
                  {tipos.map((tipo) => (
                    <option key={tipo.id} value={tipo.id}>
                      {tipo.nombre}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
