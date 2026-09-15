'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { formatEuro } from '@/lib/format'

interface Vencimiento {
  id: string
  numeroVencimiento: number
  importe: number
  formaPago: string
  fechaVencimiento: string
  pagado: boolean
  notas?: string
}

interface TramiteData {
  id: string
  codigo: string
  honorarios: number
  suplidos: number
  formaPago: string
  planoPago: string
}

const FORMAS_PAGO = ['Efectivo', 'Transferencia', 'Tarjeta', 'Cheque']

export default function VencimientosPage() {
  const params = useParams()
  const router = useRouter()
  const tramiteId = params.id as string

  const [tramite, setTramite] = useState<TramiteData | null>(null)
  const [vencimientos, setVencimientos] = useState<Vencimiento[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [modoTabla, setModoTabla] = useState(false)
  const [numCuotas, setNumCuotas] = useState(1)

  useEffect(() => {
    loadData()
  }, [tramiteId])

  const loadData = async () => {
    try {
      const tramiteResponse = await fetch(`/api/tramites/${tramiteId}`)
      if (!tramiteResponse.ok) throw new Error('Error cargando trámite')
      const tramiteData = await tramiteResponse.json()
      setTramite(tramiteData)

      const vencimientosResponse = await fetch(`/api/vencimientos?tramiteId=${tramiteId}`)
      if (vencimientosResponse.ok) {
        const vencimientosData = await vencimientosResponse.json()
        setVencimientos(vencimientosData || [])
      }
    } catch (error) {
      console.error('Error cargando datos:', error)
      toast.error('Error cargando datos')
    } finally {
      setLoading(false)
    }
  }

  const generateVencimientos = () => {
    if (!tramite) return

    const total = tramite.honorarios + tramite.suplidos
    const importePorCuota = Math.round((total / numCuotas) * 100) / 100
    const hoy = new Date()

    const nuevosVencimientos: Vencimiento[] = []

    for (let i = 1; i <= numCuotas; i++) {
      const fecha = new Date(hoy)
      fecha.setMonth(fecha.getMonth() + (i - 1))

      nuevosVencimientos.push({
        id: `new-${i}`,
        numeroVencimiento: i,
        importe: importePorCuota,
        formaPago: tramite.formaPago || 'Transferencia',
        fechaVencimiento: fecha.toISOString().split('T')[0],
        pagado: false,
        notas: '',
      })
    }

    setVencimientos(nuevosVencimientos)
    setModoTabla(true)
    toast.success(`${numCuotas} vencimiento(s) generado(s)`)
  }

  const updateVencimiento = (index: number, field: string, value: any) => {
    const updated = [...vencimientos]
    updated[index] = { ...updated[index], [field]: value }
    setVencimientos(updated)
  }

  const removeVencimiento = (index: number) => {
    setVencimientos(vencimientos.filter((_, i) => i !== index))
  }

  const saveVencimientos = async () => {
    setSaving(true)
    try {
      const response = await fetch(`/api/vencimientos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tramiteId, vencimientos }),
      })

      if (!response.ok) throw new Error('Error al guardar')

      // Actualizar plan de pago automáticamente: si hay >1 vencimiento, es fraccionado
      const planoPago = vencimientos.length > 1 ? 'Fraccionado' : 'Contado'
      const updateResponse = await fetch(`/api/tramites/${tramiteId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planoPago }),
      })

      if (!updateResponse.ok) console.warn('No se pudo actualizar plan de pago')

      toast.success('✅ Vencimientos guardados')
      await loadData()
    } catch (error) {
      toast.error('Error al guardar vencimientos')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="p-8">Cargando...</div>
  if (!tramite) return <div className="p-8">Trámite no encontrado</div>

  const total = tramite.honorarios + tramite.suplidos

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Gestión de Vencimientos</h1>
        <p className="text-gray-600 mt-2">Trámite: {tramite.codigo}</p>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div>
            <p className="text-sm text-gray-600">Honorarios</p>
            <p className="text-2xl font-bold text-gray-900">{formatEuro(tramite.honorarios || 0)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Suplidos</p>
            <p className="text-2xl font-bold text-gray-900">{formatEuro(tramite.suplidos || 0)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Total</p>
            <p className="text-2xl font-bold text-blue-600">{formatEuro((tramite.honorarios || 0) + (tramite.suplidos || 0))}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Forma de Pago</p>
            <p className="text-lg font-semibold text-gray-900">{tramite.formaPago || '—'}</p>
          </div>
        </div>
      </div>

      {vencimientos.length === 0 ? (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 mb-8 text-center">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">No hay vencimientos definidos</h3>
          <p className="text-blue-700 mb-6">Define cómo se divide el pago</p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Número de cuotas (1-12)
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  min="1"
                  max="12"
                  value={numCuotas}
                  onChange={(e) => setNumCuotas(Math.min(12, Math.max(1, parseInt(e.target.value) || 1)))}
                  className="w-20 px-4 py-2 border border-gray-300 rounded-lg"
                />
                <button
                  onClick={generateVencimientos}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition"
                >
                  Generar Vencimientos
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Vencimientos ({vencimientos.length})</h2>
            <button
              onClick={() => setModoTabla(!modoTabla)}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-lg transition"
            >
              {modoTabla ? '👁️ Vista' : '✏️ Editar'}
            </button>
          </div>

          {!modoTabla ? (
            <div className="space-y-3">
              {vencimientos.map((v, idx) => (
                <div key={v.id} className="border rounded-lg p-4 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-900">
                        Vencimiento {v.numeroVencimiento}: {formatEuro(v.importe)}
                      </p>
                      <p className="text-sm text-gray-600">
                        {new Date(v.fechaVencimiento).toLocaleDateString('es-ES')} • {v.formaPago}
                        {v.pagado && ' ✅'}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-2 text-left text-gray-700 font-semibold">Nº</th>
                    <th className="px-4 py-2 text-left text-gray-700 font-semibold">Importe (€)</th>
                    <th className="px-4 py-2 text-left text-gray-700 font-semibold">Forma de Pago</th>
                    <th className="px-4 py-2 text-left text-gray-700 font-semibold">Fecha Vencimiento</th>
                    <th className="px-4 py-2 text-left text-gray-700 font-semibold">Pagado</th>
                    <th className="px-4 py-2 text-left text-gray-700 font-semibold">Notas</th>
                    <th className="px-4 py-2">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {vencimientos.map((v, idx) => (
                    <tr key={v.id} className="hover:bg-gray-50">
                      <td className="px-4 py-2 text-gray-900 font-medium">{v.numeroVencimiento}</td>
                      <td className="px-4 py-2">
                        <input
                          type="number"
                          step="0.01"
                          value={v.importe}
                          onChange={(e) => updateVencimiento(idx, 'importe', parseFloat(e.target.value))}
                          className="w-24 px-2 py-1 border border-gray-300 rounded"
                        />
                      </td>
                      <td className="px-4 py-2">
                        <select
                          value={v.formaPago}
                          onChange={(e) => updateVencimiento(idx, 'formaPago', e.target.value)}
                          className="px-2 py-1 border border-gray-300 rounded"
                        >
                          {FORMAS_PAGO.map((forma) => (
                            <option key={forma} value={forma}>
                              {forma}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-2">
                        <input
                          type="date"
                          value={v.fechaVencimiento}
                          onChange={(e) => updateVencimiento(idx, 'fechaVencimiento', e.target.value)}
                          className="px-2 py-1 border border-gray-300 rounded"
                        />
                      </td>
                      <td className="px-4 py-2 text-center">
                        <input
                          type="checkbox"
                          checked={v.pagado}
                          onChange={(e) => updateVencimiento(idx, 'pagado', e.target.checked)}
                          className="w-4 h-4 rounded"
                        />
                      </td>
                      <td className="px-4 py-2">
                        <input
                          type="text"
                          value={v.notas || ''}
                          onChange={(e) => updateVencimiento(idx, 'notas', e.target.value)}
                          placeholder="Notas"
                          className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                        />
                      </td>
                      <td className="px-4 py-2 text-center">
                        <button
                          onClick={() => removeVencimiento(idx)}
                          className="text-red-600 hover:text-red-800 font-semibold"
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="mt-6 flex gap-3">
            <button
              onClick={saveVencimientos}
              disabled={saving}
              className="px-6 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition"
            >
              {saving ? 'Guardando...' : '💾 Guardar Vencimientos'}
            </button>
            <button
              onClick={() => setVencimientos([])}
              className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition"
            >
              🗑️ Limpiar
            </button>
            <button
              onClick={() => router.push(`/tramites/${tramiteId}`)}
              className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg transition ml-auto"
            >
              ← Volver al Trámite
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
