import { db } from '@/lib/db'
import DocumentosPendientes from '@/components/DocumentosPendientes'

export default async function DocumentosPendientesPage() {
  const tramites = await db.tramite.findMany({
    include: {
      cliente: {
        select: {
          nombreCompleto: true,
        },
      },
    },
    orderBy: { codigo: 'asc' },
  })

  const rawTiposDocumento = await db.tipoDocumento.findMany({
    orderBy: { orden: 'asc' },
  })

  // Convertir null a undefined para coincidencia de tipos
  const tiposDocumento = rawTiposDocumento.map(tipo => ({
    ...tipo,
    icono: tipo.icono || undefined,
    color: tipo.color || undefined,
  }))

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Documentos de Entrada</h1>
          <p className="text-gray-600 mt-2">Clasifica y mueve documentos desde la carpeta de entrada a sus trámites correspondientes</p>
        </div>
        <a
          href="/documentos-pendientes/sin-clasificar"
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition"
        >
          📦 Ver Sin Clasificar
        </a>
      </div>
      <div className="bg-white rounded-lg shadow p-6">
        <DocumentosPendientes tramites={tramites} tiposDocumento={tiposDocumento} />
      </div>
    </div>
  )
}
