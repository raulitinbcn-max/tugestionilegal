import { db } from '@/lib/db'
import Link from 'next/link'
import { formatDate, formatCurrency } from '@/lib/utils'

export default async function TramitesPage() {
  const tramites = await db.tramite.findMany({
    include: {
      cliente: {
        select: {
          nombreCompleto: true,
        },
      },
      tramiteConfig: {
        select: {
          tipoTramite: true,
          nombre: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Trámites</h1>
        <Link
          href="/tramites/nuevo"
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition"
        >
          + Nuevo Trámite
        </Link>
      </div>

      {tramites.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 text-lg">No hay trámites registrados</p>
          <Link href="/tramites/nuevo" className="text-blue-600 hover:text-blue-700 mt-2 inline-block">
            Crear el primer trámite
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Código</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Cliente</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Tipo</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Estado</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Honorarios</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Creado</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {tramites.map((tramite) => (
                <tr key={tramite.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{tramite.codigo}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{tramite.cliente.nombreCompleto}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{tramite.tramiteConfig?.nombre || '—'}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                      tramite.estado === 'completado'
                        ? 'bg-green-100 text-green-800'
                        : tramite.estado === 'en_proceso'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {tramite.estado}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{formatCurrency(tramite.honorarios)}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{formatDate(tramite.createdAt)}</td>
                  <td className="px-6 py-4 text-sm">
                    <Link
                      href={`/tramites/${tramite.id}`}
                      className="text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Ver detalles
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
