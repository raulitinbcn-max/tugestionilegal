'use client'

import { useMemo } from 'react'

interface TramitePorEstado {
  estado: string
  _count: number
}

interface Props {
  tramitesPorEstado: TramitePorEstado[]
}

export default function DashboardCharts({ tramitesPorEstado }: Props) {
  // Colores para cada estado
  const estadoColores: Record<string, { bg: string; text: string; border: string }> = {
    'Borrador': { bg: '#e5e7eb', text: '#1f2937', border: '#d1d5db' },
    'Falta documentación': { bg: '#fca5a5', text: '#991b1b', border: '#dc2626' },
    'Pendiente respuesta': { bg: '#93c5fd', text: '#1e40af', border: '#3b82f6' },
    'Requerimiento': { bg: '#fbbf24', text: '#92400e', border: '#f59e0b' },
    'Completado': { bg: '#86efac', text: '#166534', border: '#22c55e' },
    'Recurso': { bg: '#d8b4fe', text: '#581c87', border: '#a855f7' },
  }

  const maxCount = useMemo(
    () => Math.max(...tramitesPorEstado.map(t => t._count), 1),
    [tramitesPorEstado]
  )

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Gráfico de barras horizontal */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">📊 Trámites por Estado</h3>
        <div className="space-y-4">
          {tramitesPorEstado.length === 0 ? (
            <p className="text-gray-500 text-sm">Sin datos</p>
          ) : (
            tramitesPorEstado.map((item) => {
              const colors = estadoColores[item.estado] || {
                bg: '#e5e7eb',
                text: '#1f2937',
                border: '#d1d5db',
              }
              const percentage = (item._count / maxCount) * 100

              return (
                <div key={item.estado}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">{item.estado}</span>
                    <span className="text-sm font-semibold text-gray-900">{item._count}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${percentage}%`,
                        backgroundColor: colors.bg,
                        borderColor: colors.border,
                      }}
                    />
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* Gráfico de pastel (círculo) */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">🥧 Distribución por Estado</h3>
        {tramitesPorEstado.length === 0 ? (
          <p className="text-gray-500 text-sm">Sin datos</p>
        ) : (
          <div className="flex flex-col items-center justify-center">
            <svg width="200" height="200" viewBox="0 0 200 200">
              {tramitesPorEstado.length > 0 && (
                (() => {
                  let currentAngle = -90
                  const total = tramitesPorEstado.reduce((sum, t) => sum + t._count, 0)

                  return tramitesPorEstado.map((item) => {
                    const percentage = (item._count / total) * 100
                    const sliceAngle = (percentage / 100) * 360
                    const startAngle = currentAngle
                    const endAngle = currentAngle + sliceAngle

                    const startRad = (startAngle * Math.PI) / 180
                    const endRad = (endAngle * Math.PI) / 180
                    const radius = 80

                    const x1 = 100 + radius * Math.cos(startRad)
                    const y1 = 100 + radius * Math.sin(startRad)
                    const x2 = 100 + radius * Math.cos(endRad)
                    const y2 = 100 + radius * Math.sin(endRad)

                    const largeArc = sliceAngle > 180 ? 1 : 0
                    const d = `M 100 100 L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`

                    const colors = estadoColores[item.estado] || {
                      bg: '#e5e7eb',
                      text: '#1f2937',
                      border: '#d1d5db',
                    }

                    currentAngle = endAngle

                    return (
                      <path
                        key={item.estado}
                        d={d}
                        fill={colors.bg}
                        stroke={colors.border}
                        strokeWidth="2"
                      />
                    )
                  })
                })()
              )}
            </svg>

            {/* Leyenda */}
            <div className="mt-6 w-full space-y-2">
              {tramitesPorEstado.map((item) => {
                const colors = estadoColores[item.estado] || {
                  bg: '#e5e7eb',
                  text: '#1f2937',
                  border: '#d1d5db',
                }
                const total = tramitesPorEstado.reduce((sum, t) => sum + t._count, 0)
                const percentage = ((item._count / total) * 100).toFixed(1)

                return (
                  <div key={item.estado} className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: colors.bg }}
                    />
                    <span className="text-xs text-gray-700">
                      {item.estado}: {item._count} ({percentage}%)
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
