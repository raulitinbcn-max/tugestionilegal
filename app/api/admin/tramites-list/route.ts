import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    console.log('[tramites-list] GET called, fetching tramites from DB')
    // Get all tramites and return as array with id field
    const tramites = await db.tramiteConfiguracion.findMany({
      orderBy: { nombre: 'asc' },
    })
    console.log('[tramites-list] Found tramites:', tramites.length)

    // Convert to array format that components expect
    const tramitesArray = tramites.map(t => ({
      id: t.id,
      tipoTramite: t.tipoTramite,
      nombre: t.nombre,
      descripcion: t.descripcion,
      categoria: t.categoria,
      activo: t.activo,
    }))

    // Also return as map for easier lookup by tipoTramite
    const tramitesMap: Record<string, any> = {}
    tramites.forEach(t => {
      tramitesMap[t.tipoTramite] = {
        id: t.id,
        nombre: t.nombre,
        descripcion: t.descripcion,
        categoria: t.categoria,
        activo: t.activo,
      }
    })

    return NextResponse.json({
      tramites: tramitesArray,
      tramitesMap,
      count: tramites.length,
    })
  } catch (error: any) {
    console.error('Error fetching tramites list:', error)
    return NextResponse.json({ error: error?.message || 'Error interno' }, { status: 500 })
  }
}
