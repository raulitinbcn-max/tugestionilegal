import { db } from '@/lib/db'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { formatDate, formatCurrency } from '@/lib/utils'
import ClienteDetail from '@/components/ClienteDetail'

export default async function ClienteDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const cliente = await db.cliente.findUnique({
    where: { id: params.id },
    include: {
      tramites: {
        include: {
          tramiteConfig: true,
          documentos: true,
          documentosGenerados: true,
          historialEstados: {
            orderBy: { createdAt: 'desc' },
          },
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  })

  if (!cliente) {
    notFound()
  }

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{cliente.nombreCompleto}</h1>
          <p className="text-gray-600 mt-2">ID: {cliente.id}</p>
        </div>
        <Link
          href={`/clientes/${cliente.id}/editar`}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition"
        >
          ✏️ Editar Cliente
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <ClienteDetail cliente={cliente} />
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Información Personal</h3>
            <dl className="space-y-4">
              <div>
                <dt className="text-sm font-medium text-gray-600">Nacionalidad</dt>
                <dd className="text-sm text-gray-900 mt-1">{cliente.nacionalidad || '—'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-600">Pasaporte</dt>
                <dd className="text-sm text-gray-900 mt-1">{cliente.numeroPasaporte || '—'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-600">Fecha de Nacimiento</dt>
                <dd className="text-sm text-gray-900 mt-1">{formatDate(cliente.fechaNacimiento)}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-600">Situación Actual</dt>
                <dd className="text-sm text-gray-900 mt-1">{cliente.situacionActual || '—'}</dd>
              </div>
            </dl>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Contacto</h3>
            <dl className="space-y-4">
              <div>
                <dt className="text-sm font-medium text-gray-600">Email</dt>
                <dd className="text-sm text-gray-900 mt-1">
                  {cliente.email ? (
                    <a href={`mailto:${cliente.email}`} className="text-blue-600 hover:text-blue-700">
                      {cliente.email}
                    </a>
                  ) : (
                    '—'
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-600">Teléfono</dt>
                <dd className="text-sm text-gray-900 mt-1">
                  {cliente.telefono ? (
                    <a href={`tel:${cliente.telefono}`} className="text-blue-600 hover:text-blue-700">
                      {cliente.telefono}
                    </a>
                  ) : (
                    '—'
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-600">Dirección</dt>
                <dd className="text-sm text-gray-900 mt-1">{cliente.direccion || '—'}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  )
}
