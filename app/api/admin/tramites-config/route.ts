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

    const tramites = await db.tramiteConfiguracion.findMany()
    return NextResponse.json(tramites)
  } catch (error) {
    console.error('Error fetching tramites:', error)
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

    // Handle both formats: direct config or nested in 'configs' object
    const config = body.configs ? Object.values(body.configs)[0] : body
    const tipoTramite = body.tipoTramite || (body.nombre && body.nombre.toLowerCase().replace(/\s+/g, '-'))

    if (!tipoTramite) {
      return NextResponse.json({ error: 'tipoTramite es requerido' }, { status: 400 })
    }

    // Convert arrays to JSON strings
    const data = {
      ...config,
      tipoTramite,
      plantillasDisponibles: Array.isArray(config.plantillasDisponibles)
        ? JSON.stringify(config.plantillasDisponibles)
        : config.plantillasDisponibles,
      camposRequeridos: Array.isArray(config.camposRequeridos)
        ? JSON.stringify(config.camposRequeridos)
        : config.camposRequeridos,
    }

    const tramite = await db.tramiteConfiguracion.create({
      data,
    })

    return NextResponse.json(tramite)
  } catch (error: any) {
    console.error('Error creating tramite:', error)
    if (error?.code === 'P2002') {
      return NextResponse.json({ error: 'Este tipoTramite ya existe' }, { status: 400 })
    }
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
    const tramite = await db.tramiteConfiguracion.update({
      where: { id: body.id },
      data: body,
    })

    return NextResponse.json(tramite)
  } catch (error) {
    console.error('Error updating tramite:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
