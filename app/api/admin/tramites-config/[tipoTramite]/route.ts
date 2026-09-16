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

    // Try to find by tipoTramite first, then by nombre
    let whereClause: any = { tipoTramite: paramValue }

    try {
      // First try with tipoTramite
      await db.tramiteConfiguracion.findUniqueOrThrow({ where: whereClause })
    } catch {
      // If not found, try with nombre
      whereClause = { nombre: paramValue }
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
      where: whereClause,
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
