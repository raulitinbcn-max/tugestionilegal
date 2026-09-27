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

    const tramiteId = req.nextUrl.searchParams.get('tramiteId')

    if (!tramiteId) {
      return NextResponse.json(
        { error: 'tramiteId requerido' },
        { status: 400 }
      )
    }

    const servicios = await db.servicioAnadido.findMany({
      where: { tramiteId },
      include: { servicioConfig: true },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(servicios)
  } catch (error) {
    console.error('Error fetching servicios anadidos:', error)
    return NextResponse.json(
      { error: 'Error al obtener servicios' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await req.json()

    if (!body.tramiteId || !body.servicioConfigId) {
      return NextResponse.json(
        { error: 'tramiteId y servicioConfigId requeridos' },
        { status: 400 }
      )
    }

    // Obtener config del servicio
    const servicioConfig = await db.servicioAdicionalConfig.findUnique({
      where: { id: body.servicioConfigId },
    })

    if (!servicioConfig) {
      return NextResponse.json(
        { error: 'Servicio no encontrado' },
        { status: 404 }
      )
    }

    // Calcular montos
    const precioBase = body.precioBase || servicioConfig.precioBase
    const porcentajeIVA = body.porcentajeIVA || servicioConfig.porcentajeIVA
    const suplicosBase = body.suplicosBase !== undefined ? body.suplicosBase : servicioConfig.suplicosBase

    const montoIVA = Math.round((precioBase * porcentajeIVA / 100) * 100) / 100
    const suplicosTotales = suplicosBase
    const total = precioBase + montoIVA + suplicosTotales

    const servicio = await db.servicioAnadido.create({
      data: {
        tramiteId: body.tramiteId,
        servicioConfigId: body.servicioConfigId,
        nombre: servicioConfig.nombre,
        precioBase,
        porcentajeIVA,
        suplicosBase,
        montoIVA,
        suplicosTotales,
        total,
        documentosRequeridos: servicioConfig.documentosRequeridos,
      },
    })

    return NextResponse.json(servicio, { status: 201 })
  } catch (error) {
    console.error('Error creating servicio anadido:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error al crear servicio' },
      { status: 500 }
    )
  }
}
