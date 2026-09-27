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

    const servicios = await db.servicioAdicional.findMany({
      include: {
        tramiteConfig: true,
      },
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

    if (!body.nombre || body.precioBase === undefined) {
      return NextResponse.json(
        { error: 'nombre y precioBase requeridos' },
        { status: 400 }
      )
    }

    // Calcular total
    const porcentajeIVA = body.porcentajeIVA || 21
    const suplicosBase = body.suplicosBase || 0
    const montoIVA = Math.round((body.precioBase * porcentajeIVA / 100) * 100) / 100
    const total = body.precioBase + montoIVA + suplicosBase

    const servicio = await db.servicioAdicional.create({
      data: {
        nombre: body.nombre,
        descripcion: body.descripcion || null,
        precioBase: parseFloat(body.precioBase),
        porcentajeIVA,
        suplicosBase,
        total,
        tramiteConfigId: body.tramiteConfigId || null,
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
