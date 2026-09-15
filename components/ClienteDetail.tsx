'use client'

import { Cliente, Tramite, Documento, DocumentoGenerado, HistorialEstado, TramiteConfiguracion } from '@prisma/client'
import { formatDate, formatCurrency } from '@/lib/utils'
import Link from 'next/link'

interface ClienteWithTramites extends Cliente {
  tramites: Array<
    Tramite & {
      tramiteConfig: TramiteConfiguracion
      documentos: Documento[]
      documentosGenerados: DocumentoGenerado[]
      historialEstados: HistorialEstado[]
    }
  >
}

export default function ClienteDetail({ cliente }: { cliente: ClienteWithTramites }) {
  if (cliente.tramites.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-600 text-center py-8">No hay trámites registrados para este cliente</p>
        <div className="text-center">
          <Link
            href={`/tramites/nuevo?clienteId=${cliente.id}`}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Crear un nuevo trámite
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {cliente.tramites.map((tramite) => (
        <div key={tramite.id} className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{tramite.codigo}</h3>
              <p className="text-sm text-gray-600 mt-1">{tramite.tramiteConfig?.nombre}</p>
            </div>
            <span
              className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                tramite.estado === 'completado'
                  ? 'bg-green-100 text-green-800'
                  : tramite.estado === 'en_proceso'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              {tramite.estado}
            </span>
          </div>

          <dl className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <dt className="text-sm font-medium text-gray-600">Honorarios</dt>
              <dd className="text-sm text-gray-900 mt-1">{formatCurrency(tramite.honorarios)}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-600">Forma de Pago</dt>
              <dd className="text-sm text-gray-900 mt-1">{tramite.formaPago || '—'}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-600">Creado</dt>
              <dd className="text-sm text-gray-900 mt-1">{formatDate(tramite.createdAt)}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-600">Actualizado</dt>
              <dd className="text-sm text-gray-900 mt-1">{formatDate(tramite.updatedAt)}</dd>
            </div>
          </dl>

          <div className="border-t pt-4">
            <h4 className="font-medium text-gray-900 mb-3">Documentos</h4>
            {tramite.documentos.length === 0 && tramite.documentosGenerados.length === 0 ? (
              <p className="text-sm text-gray-600">No hay documentos asociados</p>
            ) : (
              <div className="flex flex-wrap gap-2 text-sm">
                {tramite.documentos.map((doc) => (
                  <a
                    key={doc.id}
                    href={`https://drive.google.com/file/d/${doc.driveFileId}/view`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    {doc.nombre}
                  </a>
                ))}
                {tramite.documentosGenerados.map((doc) => (
                  <a
                    key={doc.id}
                    href={`https://docs.google.com/document/d/${doc.driveFileId}/edit`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    {doc.nombreGenerado}
                  </a>
                ))}
              </div>
            )}
          </div>

          <div className="mt-4">
            <Link
              href={`/tramites/${tramite.id}`}
              className="text-blue-600 hover:text-blue-700 font-medium text-sm"
            >
              Ver detalles del trámite →
            </Link>
          </div>
        </div>
      ))}
    </div>
  )
}
