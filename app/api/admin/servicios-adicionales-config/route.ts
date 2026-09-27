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

    const tramiteConfigId = req.nextUrl.searchParams.get('tramiteConfigId')

    if (!tramiteConfigId) {
      return NextResponse.json(
        { error: 'tramiteConfigId requerido' },
        { status: 400 }
      )
    }

    const servicios = await db.servicioAdicionalConfig.findMany({
      where: { tramiteConfigId },
      orderBy: { nombre: 'asc' },
    })

    return NextResponse.json(servicios)
  } catch (error) {
    console.error('Error fetching servicios adicionales:', error)
    return NextResponse.json(
      { error: 'Error al obtener servicios adicionales' },
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

    if (!body.tramiteConfigId || !body.nombre || body.precioBase === undefined) {
      return NextResponse.json(
        { error: 'tramiteConfigId, nombre y precioBase requeridos' },
        { status: 400 }
      )
    }

    const servicio = await db.servicioAdicionalConfig.create({
      data: {
        tramiteConfigId: body.tramiteConfigId,
        nombre: body.nombre,
        descripcion: body.descripcion || null,
        precioBase: parseFloat(body.precioBase),
        porcentajeIVA: body.porcentajeIVA || 21,
        suplicosBase: body.suplicosBase || 0,
        documentosRequeridos: body.documentosRequeridos || null,
        activo: body.activo !== false,
      },
    })

    return NextResponse.json(servicio, { status: 201 })
  } catch (error) {
    console.error('Error creating servicio adicional:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error al crear servicio' },
      { status: 500 }
    )
  }
}
