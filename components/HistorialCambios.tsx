import { formatDate } from '@/lib/utils'

interface HistorialItem {
  id: string
  tramiteId: string
  estadoAnterior: string | null
  estadoNuevo: string
  usuario: string
  notas: string | null
  createdAt: Date
}

interface HistorialCambiosProps {
  historialEstados: HistorialItem[]
}

export default function HistorialCambios({ historialEstados }: HistorialCambiosProps) {
  if (!historialEstados || historialEstados.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">📝 Historial de Cambios</h3>
        <p className="text-sm text-gray-600">No hay cambios registrados</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">📝 Historial de Cambios</h3>

      <div className="space-y-4">
        {historialEstados.map((cambio, index) => (
          <div key={cambio.id} className="flex gap-4">
            {/* Timeline dot */}
            <div className="flex flex-col items-center">
              <div className="w-3 h-3 bg-blue-600 rounded-full mt-1"></div>
              {index !== historialEstados.length - 1 && (
                <div className="w-0.5 h-12 bg-gray-300 my-2"></div>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 pb-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    {cambio.estadoAnterior && cambio.estadoNuevo && (
                      <>
                        <span className="inline-block px-2 py-1 bg-red-100 text-red-700 text-xs rounded mr-2">
                          {cambio.estadoAnterior}
                        </span>
                        <span className="text-gray-500 text-xs mx-1">→</span>
                        <span className="inline-block px-2 py-1 bg-green-100 text-green-700 text-xs rounded">
                          {cambio.estadoNuevo}
                        </span>
                      </>
                    ) || (
                      <span className="inline-block px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                        {cambio.estadoNuevo}
                      </span>
                    )}
                  </p>
                  {cambio.notas && (
                    <p className="text-sm text-gray-600 mt-2 italic">💬 {cambio.notas}</p>
                  )}
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                <span className="font-medium">{cambio.usuario}</span>
                {' · '}
                {formatDate(new Date(cambio.createdAt))}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
