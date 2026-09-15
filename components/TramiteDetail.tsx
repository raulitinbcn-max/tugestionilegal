'use client'

import { useState, useEffect } from 'react'
import { Tramite, Cliente, Documento, DocumentoGenerado, Plantilla, TipoDocumento, TramiteConfiguracion } from '@prisma/client'
import toast from 'react-hot-toast'
import DocumentosClasificacion from './DocumentosClasificacion'

interface TramiteWithRelations extends Tramite {
  cliente: Cliente
  tramiteConfig: TramiteConfiguracion | null
  documentos: Array<Documento & {
    tipoDocumento: TipoDocumento | null
  }>
  documentosGenerados: Array<DocumentoGenerado & { plantilla: Plantilla }>
}

export default function TramiteDetail({ tramite }: { tramite: TramiteWithRelations }) {
  const [documentosDelDrive, setDocumentosDelDrive] = useState<Array<{ id: string; name: string }>>([])
  const [refreshKey, setRefreshKey] = useState(0)
  const [isGenerating, setIsGenerating] = useState(false)

  useEffect(() => {
    const loadData = async () => {
      try {
        const docsResponse = await fetch(`/api/tramites/${tramite.id}/documentos-drive`)

        if (docsResponse.ok) {
          const data = await docsResponse.json()
          console.log('Documentos de Drive:', data)
          setDocumentosDelDrive(Array.isArray(data) ? data : [])
        } else {
          if (docsResponse.status === 401) {
            toast.error('Error de autenticación con Google. Cierra sesión y vuelve a iniciar.')
          }
          console.error('Error en docsResponse:', docsResponse.status)
        }
      } catch (error) {
        console.error('Error cargando datos:', error)
      }
    }
    loadData()
  }, [tramite.id])

  const generarDocumento = async (tipoDocumento: string) => {
    setIsGenerating(true)
    try {
      const response = await fetch('/api/tramites/generar-documento', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tramiteId: tramite.id,
          tipoDocumento,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message)
      }

      toast.success(`${tipoDocumento} generado exitosamente`)
      window.location.reload()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : `Error al generar ${tipoDocumento}`)
    } finally {
      setIsGenerating(false)
    }
  }

return (
    <div className="space-y-6">
      {/* Sección: Documentos (Clasificación) */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">📋 Documentos</h3>
        <DocumentosClasificacion
          key={refreshKey}
          tramiteId={tramite.id}
          tipoTramite={tramite.tramiteConfig?.nombre || ''}
          documentos={tramite.documentos}
          documentosGenerados={tramite.documentosGenerados}
          documentosDrive={documentosDelDrive.filter((doc) => {
            // Excluir documentos generados
            if (tramite.documentosGenerados.some((gen) => gen.driveFileId === doc.id)) {
              return false
            }
            // Excluir documentos ya registrados en la BD
            if (tramite.documentos.some((d) => d.driveFileId === doc.id)) {
              return false
            }
            return true
          })}
          onDocumentoUpdated={() => setRefreshKey((k) => k + 1)}
        />
      </div>

      {/* Sección: Archivos en Google Drive */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">📂 Archivos en Google Drive</h3>
        {tramite.documentos.length === 0 && documentosDelDrive.length === 0 ? (
          <p className="text-sm text-gray-600">No hay documentos subidos</p>
        ) : (
          <div className="space-y-2">
            {tramite.documentos.map((doc) => (
              <a
                key={doc.id}
                href={`https://drive.google.com/file/d/${doc.driveFileId}/view`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 hover:border-gray-300 transition cursor-pointer group"
              >
                <span className="text-lg group-hover:scale-125 transition">📎</span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 group-hover:text-gray-700">{doc.nombre}</p>
                  <p className="text-xs text-gray-600">{doc.tipoDocumento?.nombre || 'Sin clasificar'}</p>
                </div>
                <span className="text-gray-600 group-hover:text-gray-700 text-lg">→</span>
              </a>
            ))}
            {documentosDelDrive
              .filter((doc) =>
                // Excluir documentos generados (que tienen nombres como TR-XXXXX_tipo)
                !tramite.documentosGenerados.some((gen) => gen.driveFileId === doc.id)
              )
              .map((doc) => (
                <a
                  key={doc.id}
                  href={`https://drive.google.com/file/d/${doc.id}/view`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 hover:border-gray-300 transition cursor-pointer group"
                >
                  <span className="text-lg group-hover:scale-125 transition">📎</span>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 group-hover:text-gray-700">{doc.name}</p>
                    <p className="text-xs text-gray-600">Archivo de carpeta</p>
                  </div>
                  <span className="text-gray-600 group-hover:text-gray-700 text-lg">→</span>
                </a>
              ))}
          </div>
        )}
      </div>
    </div>
  )
}
