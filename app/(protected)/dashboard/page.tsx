import { db } from '@/lib/db'
import Link from 'next/link'
import DashboardCharts from '@/components/DashboardCharts'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { getFraseDelDia } from '@/lib/frases'
import { formatEuro } from '@/lib/format'

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  const fraseDelDia = getFraseDelDia()

  const hoy = new Date()
  const hora = hoy.getHours()
  let saludo = 'Buenos días'
  if (hora >= 13 && hora < 19) saludo = 'Buenas tardes'
  else if (hora >= 19) saludo = 'Buenas noches'

  // KPIs principales
  const clientesCount = await db.cliente.count()
  const tramitesTotal = await db.tramite.count()
  const tramitesCompletados = await db.tramite.count({
    where: { estado: 'Completado' },
  })
  const tramitesEnCurso = tramitesTotal - tramitesCompletados

  // Vencimientos pendientes de pago
  const vencimientosPendientes = await db.vencimiento.findMany({
    where: { pagado: false },
    include: {
      tramite: {
        include: { cliente: true },
      },
    },
  })

  const ingresosPendientes = vencimientosPendientes.reduce((sum, v) => sum + v.importe, 0)

  // Documentos pendientes de clasificar
  const documentosSinClasificar = await db.documento.count({
    where: { tipoDocumentoId: null },
  })

  // Trámites por estado
  const tramitesPorEstado = await db.tramite.groupBy({
    by: ['estado'],
    _count: true,
  })

  // Últimos 5 trámites actualizados
  const ultimosTramites = await db.tramite.findMany({
    take: 5,
    orderBy: { updatedAt: 'desc' },
    include: {
      cliente: true,
      vencimientos: true,
    },
  })

  // Últimos 5 pagos registrados
  const ultimosPagos = await db.vencimiento.findMany({
    take: 5,
    where: { pagado: true },
    orderBy: { fechaPago: 'desc' },
    include: {
      tramite: {
        include: { cliente: true },
      },
    },
  })

  // Vencimientos próximos (próximos 14 días)
  const en14Dias = new Date(hoy.getTime() + 14 * 24 * 60 * 60 * 1000)
  const vencimientosProximos = await db.vencimiento.findMany({
    where: {
      fechaVencimiento: {
        gte: hoy,
        lte: en14Dias,
      },
      pagado: false,
    },
    include: {
      tramite: {
        include: { cliente: true },
      },
    },
    orderBy: { fechaVencimiento: 'asc' },
  })

  // Vencimientos vencidos sin pagar
  const vencidosSinPagar = await db.vencimiento.findMany({
    where: {
      fechaVencimiento: {
        lt: hoy,
      },
      pagado: false,
    },
    include: {
      tramite: {
        include: { cliente: true },
      },
    },
    orderBy: { fechaVencimiento: 'asc' },
  })

  // Documentos pendientes en trámites
  const tramitesConDocPendiente = await db.tramite.count({
    where: {
      checklistItems: {
        some: {
          recibido: false,
        },
      },
    },
  })

  // Documentos próximos a caducar - temporal hasta implementar lógica completa
  const docsProximosCaducar: any[] = []

  // Documentos ya caducados - temporal hasta implementar lógica completa
  const docsCaducados: any[] = []

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">{saludo} {session?.user?.name || 'Usuario'}</h1>
        <p className="text-gray-600 mb-4 italic">&quot;{fraseDelDia.texto}&quot; — {fraseDelDia.autor}</p>

        {/* Accesos rápidos - Top */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Link
            href="/tramites/nuevo"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition text-center"
          >
            ➕ Nuevo Trámite
          </Link>
          <Link
            href="/registrar-pagos"
            className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg transition text-center"
          >
            💸 Registrar Pago
          </Link>
          <Link
            href="/documentos-pendientes"
            className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-4 rounded-lg transition text-center"
          >
            📦 Documentos Pendientes
          </Link>
          <Link
            href="/clientes"
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-lg transition text-center"
          >
            👥 Gestionar Clientes
          </Link>
        </div>
      </div>

      {/* KPIs Principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Clientes */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg shadow-sm border border-blue-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Clientes Activos</p>
              <p className="text-4xl font-bold text-blue-600 mt-2">{clientesCount}</p>
            </div>
            <span className="text-4xl">👥</span>
          </div>
        </div>

        {/* Trámites en Curso */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg shadow-sm border border-green-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">En Curso</p>
              <p className="text-4xl font-bold text-green-600 mt-2">{tramitesEnCurso}</p>
              <p className="text-xs text-gray-500 mt-1">de {tramitesTotal} total</p>
            </div>
            <span className="text-4xl">📋</span>
          </div>
        </div>

        {/* Ingresos Pendientes */}
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg shadow-sm border border-orange-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Pendiente de Cobrar</p>
              <p className="text-2xl font-bold text-orange-600 mt-2">
                {formatEuro(ingresosPendientes)}
              </p>
              <p className="text-xs text-gray-500 mt-1">{vencimientosPendientes.length} vencimientos</p>
            </div>
            <span className="text-4xl">💰</span>
          </div>
        </div>

        {/* Documentos Pendientes */}
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg shadow-sm border border-purple-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Sin Clasificar</p>
              <p className="text-4xl font-bold text-purple-600 mt-2">{documentosSinClasificar}</p>
              <p className="text-xs text-gray-500 mt-1">documentos</p>
            </div>
            <span className="text-4xl">📄</span>
          </div>
        </div>
      </div>

      {/* Alertas críticas */}
      {(vencidosSinPagar.length > 0 || tramitesConDocPendiente > 0 || docsCaducados.length > 0 || docsProximosCaducar.length > 0) && (
        <div className="mb-8 space-y-3">
          {docsCaducados.length > 0 && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
              <p className="text-red-800 font-semibold">
                🔴 {docsCaducados.length} documento{docsCaducados.length > 1 ? 's' : ''} caducado{docsCaducados.length > 1 ? 's' : ''}
              </p>
              <p className="text-red-700 text-xs mt-1">
                {docsCaducados.slice(0, 3).map(d => `${d.tramite.cliente.nombreCompleto} (${d.nombre})`).join(', ')}
              </p>
            </div>
          )}
          {docsProximosCaducar.length > 0 && (
            <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded-r-lg">
              <p className="text-orange-800 font-semibold">
                ⏰ {docsProximosCaducar.length} documento{docsProximosCaducar.length > 1 ? 's' : ''} próximo{docsProximosCaducar.length > 1 ? 's' : ''} a caducar
              </p>
              <p className="text-orange-700 text-xs mt-1">
                en los próximos 7 días
              </p>
            </div>
          )}
          {vencidosSinPagar.length > 0 && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
              <p className="text-red-800 font-semibold">
                ⚠️ {vencidosSinPagar.length} vencimiento{vencidosSinPagar.length > 1 ? 's' : ''} vencido{vencidosSinPagar.length > 1 ? 's' : ''} sin pagar
              </p>
              <p className="text-red-700 text-sm mt-1">
                Total: {formatEuro(vencidosSinPagar.reduce((sum, v) => sum + v.importe, 0))}
              </p>
            </div>
          )}
          {tramitesConDocPendiente > 0 && (
            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-r-lg">
              <p className="text-yellow-800 font-semibold">
                🟡 {tramitesConDocPendiente} trámite{tramitesConDocPendiente > 1 ? 's' : ''} con documentación pendiente
              </p>
            </div>
          )}
        </div>
      )}

      {/* Gráficos y Charts */}
      <div className="mb-8">
        <DashboardCharts tramitesPorEstado={tramitesPorEstado} />
      </div>

      <div className="grid grid-cols-1 gap-8">
        {/* Documentos próximos a caducar - Próximamente */}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
        {/* Vencimientos próximos */}
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">📅 Vencimientos Próximos (14 días)</h3>
          {vencimientosProximos.length === 0 ? (
            <p className="text-gray-500 text-sm">No hay vencimientos próximos</p>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {vencimientosProximos.map((v) => (
                <div key={v.id} className="flex items-center justify-between p-2 bg-blue-50 rounded">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {v.tramite.cliente.nombreCompleto}
                    </p>
                    <p className="text-xs text-gray-600">
                      {new Date(v.fechaVencimiento).toLocaleDateString('es-ES')}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">
                    {formatEuro(v.importe)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Últimos pagos */}
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">✅ Últimos Pagos Registrados</h3>
          {ultimosPagos.length === 0 ? (
            <p className="text-gray-500 text-sm">Sin pagos registrados</p>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {ultimosPagos.map((v) => (
                <div key={v.id} className="flex items-center justify-between p-2 bg-green-50 rounded">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {v.tramite.cliente.nombreCompleto}
                    </p>
                    <p className="text-xs text-gray-600">
                      {new Date(v.fechaPago!).toLocaleDateString('es-ES')}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-green-600">
                    +{formatEuro(v.importe)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Vencimientos y pagos - segunda fila */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
        {/* Trámites recientes */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">📋 Trámites Actualizados Recientemente</h3>
          {ultimosTramites.length === 0 ? (
            <p className="text-gray-500 text-sm">Sin trámites</p>
          ) : (
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {ultimosTramites.map((t) => (
                <Link
                  key={t.id}
                  href={`/tramites/${t.id}`}
                  className="block p-3 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{t.cliente.nombreCompleto}</p>
                      <p className="text-xs text-gray-600">{t.codigo}</p>
                    </div>
                    <span
                      className={`text-xs px-2 py-1 rounded font-medium ${
                        t.estado === 'Completado'
                          ? 'bg-green-100 text-green-800'
                          : t.estado === 'Borrador'
                          ? 'bg-gray-200 text-gray-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {t.estado}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Resumen financiero */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">📊 Resumen Financiero</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded">
              <span className="text-sm text-gray-700">Total Pagado</span>
              <span className="font-semibold text-blue-600">
                {formatEuro(ultimosPagos.reduce((sum, p) => sum + p.importe, 0))}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-orange-50 rounded">
              <span className="text-sm text-gray-700">Pendiente de Cobrar</span>
              <span className="font-semibold text-orange-600">
                {formatEuro(ingresosPendientes)}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-red-50 rounded">
              <span className="text-sm text-gray-700">Vencidos sin Pagar</span>
              <span className="font-semibold text-red-600">
                {formatEuro(vencidosSinPagar.reduce((sum, v) => sum + v.importe, 0))}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
