'use client'

import { useState } from 'react'
import { DocumentoGenerado, Plantilla } from '@prisma/client'

interface DocumentoGeneradoConTipo extends DocumentoGenerado {
  plantilla: Plantilla
}

interface Props {
  documentosGenerados: DocumentoGeneradoConTipo[]
}

export default function DocumentosGenerados({ documentosGenerados }: Props) {
  const [showAllDocumentos, setShowAllDocumentos] = useState(false)

  return (
    <div className="bg-white rounded-lg shadow p-6 sticky top-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">📑 Generados</h3>
        {documentosGenerados.length > 0 && (
          <button
            onClick={() => setShowAllDocumentos(!showAllDocumentos)}
            className="text-xs text-blue-600 hover:text-blue-700 font-medium"
          >
            {showAllDocumentos ? 'Ocultar' : 'Ver'} ({documentosGenerados.length})
          </button>
        )}
      </div>
      {documentosGenerados.length === 0 ? (
        <p className="text-sm text-gray-600">No hay documentos generados</p>
      ) : (
        <div className="space-y-2">
          {(() => {
            if (showAllDocumentos) {
              // Mostrar todos los documentos
              return documentosGenerados.map((doc) => {
                const nombreTipo = doc.plantilla.tipo
                return (
                  <a
                    key={doc.id}
                    href={`https://docs.google.com/document/d/${doc.driveFileId}/edit`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 hover:border-blue-300 transition cursor-pointer group"
                  >
                    <span className="text-lg group-hover:scale-125 transition">📑</span>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 group-hover:text-blue-600">{nombreTipo}</p>
                      <p className="text-xs text-gray-600">{doc.nombreGenerado}</p>
                    </div>
                    <span className="text-blue-600 group-hover:text-blue-700 text-lg">→</span>
                  </a>
                )
              })
            } else {
              // Mostrar solo la última versión de cada tipo
              const ultimasPorTipo = new Map<string, typeof documentosGenerados[0]>()
              documentosGenerados.forEach((doc) => {
                const tipoBase = doc.plantilla.tipo
                const existente = ultimasPorTipo.get(tipoBase)
                if (!existente || new Date(doc.createdAt) > new Date(existente.createdAt)) {
                  ultimasPorTipo.set(tipoBase, doc)
                }
              })
              return Array.from(ultimasPorTipo.values()).map((doc) => {
                const nombreTipo = doc.plantilla.tipo
                return (
                  <a
                    key={doc.id}
                    href={`https://docs.google.com/document/d/${doc.driveFileId}/edit`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 hover:border-blue-300 transition cursor-pointer group"
                  >
                    <span className="text-lg group-hover:scale-125 transition">📑</span>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 group-hover:text-blue-600">{nombreTipo}</p>
                      <p className="text-xs text-gray-600">{doc.nombreGenerado}</p>
                    </div>
                    <span className="text-blue-600 group-hover:text-blue-700 text-lg">→</span>
                  </a>
                )
              })
            }
          })()}
        </div>
      )}
    </div>
  )
}
