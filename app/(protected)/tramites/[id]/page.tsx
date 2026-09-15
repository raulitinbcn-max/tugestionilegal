import { db } from '@/lib/db'
import { notFound } from 'next/navigation'
import { formatDate, formatCurrency } from '@/lib/utils'
import TramiteDetail from '@/components/TramiteDetail'
import TituloConEstado from '@/components/TituloConEstado'
import DocumentosGenerados from '@/components/DocumentosGenerados'
import NotasInternas from '@/components/NotasInternas'
import ClientDocumentoButtons from '@/components/ClientDocumentoButtons'
import HistorialCambios from '@/components/HistorialCambios'
import AlertaCarpetaDrivePendiente from '@/components/AlertaCarpetaDrivePendiente'

export default async function TramiteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const tramite = await db.tramite.findUnique({
    where: { id },
    include: {
      cliente: true,
      tramiteConfig: true,
      categoria: true,
      documentos: {
        include: {
          tipoDocumento: true,
        },
        orderBy: { createdAt: 'desc' },
      },
      documentosGenerados: {
        include: { plantilla: true },
        orderBy: { createdAt: 'desc' },
      },
      historialEstados: {
        orderBy: { createdAt: 'desc' },
      },
    },
  })

  if (!tramite) {
    notFound()
  }

  return (
    <div className="p-8">
      <TituloConEstado
        titulo={`${tramite.cliente.nombreCompleto} - ${tramite.tramiteConfig?.nombre || 'Trámite'} - ${tramite.codigo}`}
        subtitulo={tramite.categoria?.descripcion || 'Trámite de ' + tramite.tramiteConfig?.nombre}
        tramiteId={tramite.id}
        estado={tramite.estado}
      />

      {/* Alerta de carpeta Drive pendiente */}
      <AlertaCarpetaDrivePendiente
        tramiteId={tramite.id}
        visible={tramite.driveFolderPendiente}
      />

      {/* Notas Internas bajo el título */}
      <div className="mb-8">
        <NotasInternas tramiteId={tramite.id} notasIniciales={tramite.notas} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Columna izquierda: Documentos (más ancha - 7/12) */}
        <div className="lg:col-span-7">
          <TramiteDetail tramite={tramite} />
        </div>

        {/* Columna derecha: Datos cliente, Botones, Datos trámite, Vencimientos, Documentos, Notas (sticky) */}
        <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-8">
          {/* 1. Datos de Cliente */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">👤 Datos de Cliente</h3>
            <dl className="space-y-3">
              <div>
                <dt className="text-xs font-medium text-gray-600 uppercase">Nombre</dt>
                <dd className="text-sm text-gray-900 mt-1">{tramite.cliente.nombreCompleto}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-gray-600 uppercase">Nacionalidad</dt>
                <dd className="text-sm text-gray-900 mt-1">{tramite.cliente.nacionalidad || '—'}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-gray-600 uppercase">Documento</dt>
                <dd className="text-sm text-gray-900 mt-1">{tramite.cliente.numeroPasaporte || '—'}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-gray-600 uppercase">Dirección</dt>
                <dd className="text-sm text-gray-900 mt-1">
                  {tramite.cliente.direccion && (
                    <>
                      {tramite.cliente.direccion}
                      {tramite.cliente.codigoPostal && `, ${tramite.cliente.codigoPostal}`}
                      {tramite.cliente.poblacion && ` ${tramite.cliente.poblacion}`}
                      {tramite.cliente.provincia && `, ${tramite.cliente.provincia}`}
                    </>
                  ) || '—'}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-gray-600 uppercase">Teléfono</dt>
                <dd className="text-sm text-gray-900 mt-1">
                  {tramite.cliente.telefono ? (
                    <a
                      href={`https://wa.me/${tramite.cliente.telefono.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-700"
                      title="Abrir WhatsApp Web"
                    >
                      {tramite.cliente.telefono} 💬
                    </a>
                  ) : (
                    '—'
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-gray-600 uppercase">Correo</dt>
                <dd className="text-sm text-gray-900 mt-1">
                  {tramite.cliente.email ? (
                    <a href={`mailto:${tramite.cliente.email}`} className="text-blue-600 hover:text-blue-700">
                      {tramite.cliente.email}
                    </a>
                  ) : (
                    '—'
                  )}
                </dd>
              </div>
            </dl>
          </div>

          {/* 2. Botones para generar documentos (2x2) */}
          <ClientDocumentoButtons
            tramiteId={tramite.id}
            documentosGenerados={tramite.documentosGenerados}
          />

          {/* 3. Datos del Trámite */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">📋 Datos del Trámite</h3>
              <a
                href={`/tramites/${tramite.id}/factura`}
                className="text-xs px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded transition"
              >
                Editar
              </a>
            </div>
            <dl className="space-y-3">
              <div>
                <dt className="text-sm font-medium text-gray-600">Honorarios</dt>
                <dd className="text-sm text-gray-900 mt-1">{formatCurrency(tramite.honorarios)}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-600">Suplidos</dt>
                <dd className="text-sm text-gray-900 mt-1">{formatCurrency(tramite.suplidos)}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-600">Forma de Pago</dt>
                <dd className="text-sm text-gray-900 mt-1">{tramite.formaPago || '—'}</dd>
              </div>
            </dl>
          </div>

          {/* 4. Vencimientos */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">📅 Vencimientos</h3>
            <p className="text-sm text-gray-600 mb-4">Resumen de pagos pendientes</p>
            <a
              href={`/tramites/${tramite.id}/vencimientos`}
              className="inline-block px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-lg transition"
            >
              Ver más
            </a>
          </div>

          {/* 6. Documentos Generados */}
          <DocumentosGenerados documentosGenerados={tramite.documentosGenerados} />
        </div>
      </div>

      {/* Historial de cambios - Full width al final */}
      <div className="mt-12">
        <HistorialCambios historialEstados={tramite.historialEstados} />
      </div>
    </div>
  )
}
