'use client'

import { Tramite, Cliente, ChecklistItem, Documento, TipoDocumento, CheckDocumento } from '@prisma/client'

interface ChecklistImprimibleProps {
  tramite: Tramite & {
    cliente: Cliente
    checklistItems: (ChecklistItem & {
      checkDocumento: CheckDocumento
      documento: (Documento & {
        tipoDocumento: TipoDocumento | null
      }) | null
    })[]
  }
}

export default function ChecklistImprimible({ tramite }: ChecklistImprimibleProps) {
  const handlePrint = () => {
    window.print()
  }

  const recibidos = tramite.checklistItems.filter((item) => item.recibido).length
  const total = tramite.checklistItems.length

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">
          📋 Checklist de Documentos
        </h3>
        <button
          onClick={handlePrint}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium print:hidden"
        >
          🖨️ Imprimir
        </button>
      </div>

      {/* Resumen */}
      <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
        <div className="text-sm font-medium text-gray-900">
          Documentos recibidos: <span className="text-blue-600">{recibidos}/{total}</span>
        </div>
        <div className="mt-2 bg-white rounded-full h-2 overflow-hidden">
          <div
            className="bg-blue-600 h-full transition-all"
            style={{ width: `${total > 0 ? (recibidos / total) * 100 : 0}%` }}
          />
        </div>
      </div>

      {/* Tabla imprimible */}
      <div className="bg-white border border-gray-200 rounded-md overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-100 border-b border-gray-200 print:bg-gray-200">
              <th className="px-4 py-3 text-left font-semibold text-gray-900">
                Documento
              </th>
              <th className="px-4 py-3 text-left font-semibold text-gray-900">
                Descripción
              </th>
              <th className="px-4 py-3 text-center font-semibold text-gray-900 w-20">
                ✓
              </th>
              <th className="px-4 py-3 text-left font-semibold text-gray-900 print:hidden">
                Tipo
              </th>
            </tr>
          </thead>
          <tbody>
            {tramite.checklistItems.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-3 text-center text-gray-500">
                  No hay documentos en el checklist
                </td>
              </tr>
            ) : (
              tramite.checklistItems.map((item, idx) => (
                <tr
                  key={item.id}
                  className={`border-b border-gray-200 ${
                    item.recibido ? 'bg-green-50' : 'bg-white'
                  } print:break-inside-avoid`}
                >
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {idx + 1}. {item.checkDocumento.nombre}
                  </td>
                  <td className="px-4 py-3 text-gray-600 text-xs">
                    {item.checkDocumento.descripcion}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {item.recibido ? (
                      <span className="text-lg">✅</span>
                    ) : (
                      <span className="text-lg text-gray-300">☐</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs print:hidden">
                    {item.documento?.tipoDocumento ? (
                      <div className="flex items-center gap-1">
                        {item.documento.tipoDocumento.icono && (
                          <span>{item.documento.tipoDocumento.icono}</span>
                        )}
                        <span
                          className="px-2 py-1 rounded text-white text-xs font-medium"
                          style={{
                            backgroundColor:
                              item.documento.tipoDocumento.color || '#6b7280',
                          }}
                        >
                          {item.documento.tipoDocumento.nombre}
                        </span>
                      </div>
                    ) : (
                      <span className="text-gray-400 text-xs">Sin asignar</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Nota de impresión */}
      <div className="hidden print:block text-xs text-gray-600 mt-4 border-t pt-4">
        <div className="font-semibold mb-2">
          Trámite: {tramite.codigo}
        </div>
        <div className="mb-1">
          Cliente: {tramite.cliente.nombreCompleto}
        </div>
        <div>
          Fecha: {new Date().toLocaleDateString('es-ES')}
        </div>
      </div>
    </div>
  )
}
