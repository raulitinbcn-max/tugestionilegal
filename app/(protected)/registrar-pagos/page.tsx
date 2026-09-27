'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { formatDate } from '@/lib/utils'
import { formatEuro } from '@/lib/format'

interface Vencimiento {
  id: string
  tramiteId: string
  numeroVencimiento: number
  importe: number
  formaPago: string
  fechaVencimiento: string
  pagado: boolean
  fechaPago: string | null
  notas?: string
  tramite: {
    codigo: string
    cliente: { nombreCompleto: string }
  }
}

const FORMAS_PAGO = ['Efectivo', 'Transferencia', 'Tarjeta', 'Cheque']

export default function RegistrarPagosPage() {
  const router = useRouter()
  const [vencimientos, setVencimientos] = useState<Vencimiento[]>([])
  const [vencimientosFiltratos, setVencimientosFiltratos] = useState<Vencimiento[]>([])
  const [loading, setLoading] = useState(true)
  const [registrandoId, setRegistrandoId] = useState<string | null>(null)
  const [editData, setEditData] = useState<Partial<Vencimiento>>({})
  const [saving, setSaving] = useState(false)

  // Filtros
  const [searchTerm, setSearchTerm] = useState('')
  const [estadoFiltro, setEstadoFiltro] = useState<'todos' | 'pendientes' | 'vencidos' | 'pagados'>('pendientes')
  const [formaPagoFiltro, setFormaPagoFiltro] = useState('')
  const [fechaDesdeFiltro, setFechaDesdeFiltro] = useState('')
  const [fechaHastaFiltro, setFechaHastaFiltro] = useState('')
  const [categoriaFiltro, setCategoriaFiltro] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const params = new URLSearchParams()
      if (searchTerm) params.append('search', searchTerm)
      if (estadoFiltro !== 'todos') params.append('estado', estadoFiltro)
      if (formaPagoFiltro) params.append('formaPago', formaPagoFiltro)
      if (fechaDesdeFiltro) params.append('fechaDesde', fechaDesdeFiltro)
      if (fechaHastaFiltro) params.append('fechaHasta', fechaHastaFiltro)
      if (categoriaFiltro) params.append('categoria', categoriaFiltro)

      const response = await fetch(`/api/vencimientos?${params.toString()}`)
      if (!response.ok) throw new Error('Error cargando vencimientos')
      const data = await response.json()
      setVencimientos(data || [])
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error cargando vencimientos')
    } finally {
      setLoading(false)
    }
  }

  // Recargar cuando cambian los filtros
  useEffect(() => {
    setLoading(true)
    loadData()
  }, [searchTerm, estadoFiltro, formaPagoFiltro, fechaDesdeFiltro, fechaHastaFiltro, categoriaFiltro])

  const iniciarRegistroPago = (vencimiento: Vencimiento) => {
    setRegistrandoId(vencimiento.id)
    setEditData({
      pagado: true,
      fechaPago: new Date().toISOString().split('T')[0],
      formaPago: vencimiento.formaPago,
      importe: vencimiento.importe,
      notas: vencimiento.notas || '',
    })
  }

  const cancelarRegistro = () => {
    setRegistrandoId(null)
    setEditData({})
  }

  const guardarPago = async (vencimientoId: string) => {
    setSaving(true)
    try {
      const response = await fetch(`/api/vencimientos/${vencimientoId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editData),
      })

      if (!response.ok) throw new Error('Error al guardar')

      toast.success('✅ Pago registrado')
      setRegistrandoId(null)
      await loadData()
    } catch (error) {
      toast.error('Error registrando pago')
    } finally {
      setSaving(false)
    }
  }

  const generarRecibo = async (vencimientoId: string) => {
    try {
      // Obtener vencimiento para saber el tramiteId
      const vencimiento = vencimientos.find((v) => v.id === vencimientoId)
      if (!vencimiento) return

      // Buscar recibo existente
      const searchResponse = await fetch(`/api/vencimientos/${vencimientoId}/recibo-existente`)

      if (searchResponse.ok) {
        const recibo = await searchResponse.json()
        if (recibo && recibo.driveFileId) {
          // Abrir recibo existente en Google Docs
          window.open(`https://docs.google.com/document/d/${recibo.driveFileId}/edit`, '_blank')
          toast.success('✅ Abriendo recibo existente')
          return
        }
      }

      // Si no existe, generar nuevo
      const response = await fetch(`/api/vencimientos/${vencimientoId}/generar-recibo`, {
        method: 'POST',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Error al generar recibo')
      }

      const data = await response.json()
      window.open(`https://docs.google.com/document/d/${data.driveFileId}/edit`, '_blank')
      toast.success('✅ Recibo generado y abierto')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error con el recibo')
    }
  }

  if (loading) return <div className="p-8">Cargando...</div>

  const vencimientosFiltrados = filtro === 'pendientes'
    ? vencimientos.filter((v) => !v.pagado)
    : vencimientos

  const vencidosPendientes = vencimientosFiltrados.filter(
    (v) => !v.pagado && new Date(v.fechaVencimiento) < new Date()
  ).length

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Registrar Pagos</h1>
        <p className="text-gray-600 mt-2">Gestiona los pagos de todos los trámites</p>
      </div>

      {/* Buscador y Filtros */}
      <div className="mb-8 bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">🔍 Búsqueda y Filtros</h2>

        <div className="space-y-4">
          {/* Búsqueda de texto libre */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Cliente o Expediente</label>
            <input
              type="text"
              placeholder="Buscar por nombre del cliente o código de expediente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Filtros en grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Estado */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
              <select
                value={estadoFiltro}
                onChange={(e) => setEstadoFiltro(e.target.value as any)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="todos">Todos</option>
                <option value="pendientes">Pendientes</option>
                <option value="vencidos">Vencidos</option>
                <option value="pagados">Pagados</option>
              </select>
            </div>

            {/* Forma de Pago */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Forma de Pago</label>
              <select
                value={formaPagoFiltro}
                onChange={(e) => setFormaPagoFiltro(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todas</option>
                {FORMAS_PAGO.map((forma) => (
                  <option key={forma} value={forma}>{forma}</option>
                ))}
              </select>
            </div>

            {/* Fecha Desde */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Desde</label>
              <input
                type="date"
                value={fechaDesdeFiltro}
                onChange={(e) => setFechaDesdeFiltro(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Fecha Hasta */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Hasta</label>
              <input
                type="date"
                value={fechaHastaFiltro}
                onChange={(e) => setFechaHastaFiltro(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Categoría */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Categoría</label>
              <select
                value={categoriaFiltro}
                onChange={(e) => setCategoriaFiltro(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todas</option>
                <option value="residencia">Residencia</option>
                <option value="trabajo">Trabajo</option>
                <option value="nacionalidad">Nacionalidad</option>
                <option value="visado">Visado</option>
              </select>
            </div>
          </div>

          {/* Resultados */}
          <div className="pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              <span className="font-semibold">{vencimientos.length}</span> vencimiento(s) encontrado(s)
              {vencidosPendientes > 0 && (
                <span className="ml-4 text-red-600 font-semibold">⚠️ {vencidosPendientes} vencido(s)</span>
              )}
            </p>
          </div>
        </div>
      </div>

      {vencimientos.length === 0 ? (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 text-center">
          <p className="text-blue-900 font-semibold">No hay pagos con estos filtros</p>
        </div>
      ) : (
        <div className="space-y-4">
          {vencimientos.map((v) => (
            <div
              key={v.id}
              className={`border rounded-lg p-4 ${
                v.pagado ? 'bg-green-50 border-green-300' : 'bg-white border-gray-300'
              }`}
            >
              {registrandoId === v.id ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Marcado como pagado</label>
                      <input
                        type="checkbox"
                        checked={editData.pagado || false}
                        onChange={(e) => setEditData({ ...editData, pagado: e.target.checked })}
                        className="w-4 h-4 rounded"
                      />
                    </div>
                    {editData.pagado && (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Pago</label>
                          <input
                            type="date"
                            value={editData.fechaPago || ''}
                            onChange={(e) => setEditData({ ...editData, fechaPago: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Forma Pago</label>
                          <select
                            value={editData.formaPago || ''}
                            onChange={(e) => setEditData({ ...editData, formaPago: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                          >
                            <option value="">Seleccionar...</option>
                            {FORMAS_PAGO.map((forma) => (
                              <option key={forma} value={forma}>
                                {forma}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Importe (€)</label>
                          <input
                            type="number"
                            value={editData.importe || ''}
                            onChange={(e) => setEditData({ ...editData, importe: parseFloat(e.target.value) })}
                            step="0.01"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                          />
                        </div>
                      </>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
                    <textarea
                      value={editData.notas || ''}
                      onChange={(e) => setEditData({ ...editData, notas: e.target.value })}
                      placeholder="Notas adicionales"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm"
                      rows={2}
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => guardarPago(v.id)}
                      disabled={saving}
                      className="px-6 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition"
                    >
                      {saving ? 'Guardando...' : '✅ Guardar Pago'}
                    </button>
                    {editData.pagado && (
                      <button
                        onClick={() => generarRecibo(v.id)}
                        disabled={saving}
                        className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition"
                      >
                        🧾 Generar Recibo
                      </button>
                    )}
                    <button
                      onClick={cancelarRegistro}
                      className="px-6 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold rounded-lg transition"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <Link
                        href={`/tramites/${v.tramiteId}`}
                        className="text-lg font-semibold text-blue-600 hover:text-blue-800"
                      >
                        {v.tramite.codigo}
                      </Link>
                      <span className="text-gray-600">{v.tramite.cliente.nombreCompleto}</span>
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                          v.pagado
                            ? 'bg-green-200 text-green-800'
                            : new Date(v.fechaVencimiento) < new Date()
                            ? 'bg-red-200 text-red-800'
                            : 'bg-blue-200 text-blue-800'
                        }`}
                      >
                        {v.pagado ? '✓ Pagado' : new Date(v.fechaVencimiento) < new Date() ? 'Vencido' : 'Pendiente'}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Vencimiento</p>
                        <p className="font-semibold">{v.numeroVencimiento}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Importe</p>
                        <p className="font-semibold">{formatEuro(v.importe)}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Fecha</p>
                        <p className="font-semibold">{formatDate(v.fechaVencimiento)}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Forma Pago</p>
                        <p className="font-semibold">{v.formaPago || '—'}</p>
                      </div>
                      {v.pagado && v.fechaPago && (
                        <div>
                          <p className="text-gray-600">Pagado</p>
                          <p className="font-semibold">{formatDate(v.fechaPago)}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="ml-4 flex gap-2">
                    {v.pagado && (
                      <button
                        onClick={() => generarRecibo(v.id)}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition text-sm whitespace-nowrap"
                      >
                        🧾 Ver Recibo
                      </button>
                    )}
                    {!v.pagado && (
                      <button
                        onClick={() => iniciarRegistroPago(v)}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition text-sm whitespace-nowrap"
                      >
                        💳 Registrar Pago
                      </button>
                    )}
                    {v.pagado && (
                      <button
                        onClick={() => iniciarRegistroPago(v)}
                        className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg transition text-sm whitespace-nowrap"
                      >
                        ✏️ Editar
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
