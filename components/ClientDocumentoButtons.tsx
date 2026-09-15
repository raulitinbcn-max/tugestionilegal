'use client'

import { DocumentoGenerado, Plantilla } from '@prisma/client'
import BotonesGenerarDocumentos from './BotonesGenerarDocumentos'

interface Props {
  tramiteId: string
  documentosGenerados: Array<DocumentoGenerado & { plantilla: Plantilla }>
}

export default function ClientDocumentoButtons({
  tramiteId,
  documentosGenerados,
}: Props) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">📄 Generar Documentos</h3>
      <BotonesGenerarDocumentos
        tramiteId={tramiteId}
        documentosGenerados={documentosGenerados}
        onDocumentoGenerado={() => window.location.reload()}
      />
    </div>
  )
}
