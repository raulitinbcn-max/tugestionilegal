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

    const servicios = await db.servicioAnadidoEnExpediente.findMany({
      where: { tramiteId },
      include: { servicio: true },
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

    if (!body.tramiteId || !body.servicioId) {
      return NextResponse.json(
        { error: 'tramiteId y servicioId requeridos' },
        { status: 400 }
      )
    }

    // Obtener servicio
    const servicio = await db.servicioAdicional.findUnique({
      where: { id: body.servicioId },
    })

    if (!servicio) {
      return NextResponse.json(
        { error: 'Servicio no encontrado' },
        { status: 404 }
      )
    }

    // Copiar valores del servicio
    const precioBase = body.precioBase || servicio.precioBase
    const porcentajeIVA = body.porcentajeIVA !== undefined ? body.porcentajeIVA : servicio.porcentajeIVA
    const suplicosBase = body.suplicosBase !== undefined ? body.suplicosBase : servicio.suplicosBase

    const servicioAnadido = await db.servicioAnadidoEnExpediente.create({
      data: {
        tramiteId: body.tramiteId,
        servicioId: body.servicioId,
        nombre: servicio.nombre,
        precioBase,
        porcentajeIVA,
        suplicosBase,
      },
    })

    return NextResponse.json(servicioAnadido, { status: 201 })
  } catch (error) {
    console.error('Error creating servicio anadido:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error al crear servicio' },
      { status: 500 }
    )
  }
}
