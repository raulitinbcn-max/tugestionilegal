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

    // Get all tramites config first
    const tramites = await db.tramiteConfiguracion.findMany()

    // Get all tasas config
    const tasas = await db.tasaConfiguracion.findMany({
      include: { tramiteConfig: true },
    })

    // Group tasas by tipoTramite
    const tasasGrouped: Record<string, any[]> = {}
    tasas.forEach((tasa) => {
      const tipoTramite = tasa.tramiteConfig?.tipoTramite || 'unknown'
      if (!tasasGrouped[tipoTramite]) {
        tasasGrouped[tipoTramite] = []
      }
      tasasGrouped[tipoTramite].push({
        id: tasa.id,
        nombre: tasa.nombre,
        importe: tasa.importe,
        tramiteConfigId: tasa.tramiteConfigId,
      })
    })

    return NextResponse.json({
      tasasConfig: tasasGrouped,
      tramites: tramites.map(t => ({ tipoTramite: t.tipoTramite, nombre: t.nombre }))
    })
  } catch (error) {
    console.error('Error fetching tasas:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await req.json()

    // Validate required fields
    if (!body.tramiteConfigId || !body.nombre || body.importe === undefined) {
      return NextResponse.json(
        { error: 'tramiteConfigId, nombre e importe son requeridos' },
        { status: 400 }
      )
    }

    // Ensure importe is a number
    const data = {
      ...body,
      importe: parseFloat(body.importe),
    }

    const tasa = await db.tasaConfiguracion.create({
      data,
    })

    return NextResponse.json(tasa)
  } catch (error: any) {
    console.error('Error creating tasa:', error)
    return NextResponse.json({ error: error?.message || 'Error interno' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await req.json()
    const tasa = await db.tasaConfiguracion.update({
      where: { id: body.id },
      data: body,
    })

    return NextResponse.json(tasa)
  } catch (error) {
    console.error('Error updating tasa:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
