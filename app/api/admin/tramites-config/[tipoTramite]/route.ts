import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function PUT(
  req: NextRequest,
  { params }: { params: { tipoTramite: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await req.json()
    const paramValue = params.tipoTramite

    // Try to find by tipoTramite first (unique field), then by nombre (non-unique)
    let tramiteId: string | null = null

    try {
      // First try with tipoTramite (unique)
      const found = await db.tramiteConfiguracion.findUnique({
        where: { tipoTramite: paramValue },
      })
      if (found) {
        tramiteId = found.id
      }
    } catch {
      // tipoTramite not found, try by nombre
    }

    if (!tramiteId) {
      // Try to find by nombre
      const found = await db.tramiteConfiguracion.findFirst({
        where: { nombre: paramValue },
      })
      if (found) {
        tramiteId = found.id
      }
    }

    if (!tramiteId) {
      return NextResponse.json({ error: 'Trámite no encontrado' }, { status: 404 })
    }

    // Convert arrays to JSON strings for storage
    const data = {
      ...body,
      plantillasDisponibles: Array.isArray(body.plantillasDisponibles)
        ? JSON.stringify(body.plantillasDisponibles)
        : body.plantillasDisponibles,
      camposRequeridos: Array.isArray(body.camposRequeridos)
        ? JSON.stringify(body.camposRequeridos)
        : body.camposRequeridos,
    }

    const tramite = await db.tramiteConfiguracion.update({
      where: { id: tramiteId },
      data,
    })

    return NextResponse.json(tramite)
  } catch (error: any) {
    console.error('Error updating tramite:', error)
    if (error?.code === 'P2025') {
      return NextResponse.json({ error: 'Trámite no encontrado' }, { status: 404 })
    }
    return NextResponse.json({ error: error?.message || 'Error interno' }, { status: 500 })
  }
}
