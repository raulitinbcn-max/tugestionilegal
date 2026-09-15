import { db } from '@/lib/db'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'

export default async function ClientesPage() {
  const clientes = await db.cliente.findMany({
    include: {
      tramites: {
        include: {
          tramiteConfig: {
            select: {
              tipoTramite: true,
              nombre: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Clientes</h1>
        <Link
          href="/tramites/nuevo"
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition"
        >
          + Nuevo Cliente
        </Link>
      </div>

      {clientes.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 text-lg">No hay clientes registrados</p>
          <Link href="/tramites/nuevo" className="text-blue-600 hover:text-blue-700 mt-2 inline-block">
            Crear el primer cliente
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Nombre</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Email</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Teléfono</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Trámites</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {clientes.map((cliente) => (
                <tr key={cliente.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{cliente.nombreCompleto}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{cliente.email || '—'}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{cliente.telefono || '—'}</td>
                  <td className="px-6 py-4 text-sm">
                    {cliente.tramites.length === 0 ? (
                      <span className="text-gray-400">—</span>
                    ) : cliente.tramites.length === 1 ? (
                      <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-semibold">
                        {cliente.tramites[0].tramiteConfig?.nombre || 'Trámite'}
                      </span>
                    ) : (
                      <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-semibold">
                        {cliente.tramites.length} trámites
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm space-x-2 flex">
                    <Link
                      href={`/clientes/${cliente.id}`}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition"
                    >
                      👁️ Ver
                    </Link>
                    <Link
                      href={`/clientes/${cliente.id}/editar`}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold rounded-lg transition"
                    >
                      ✏️ Editar
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
