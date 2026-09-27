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
        asignacionesTramites: {
          include: { tramiteConfig: true },
        },
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

    const servicio = await db.servicioAdicional.create({
      data: {
        nombre: body.nombre,
        descripcion: body.descripcion || null,
        precioBase: parseFloat(body.precioBase),
        porcentajeIVA: body.porcentajeIVA || 21,
        suplicosBase: body.suplicosBase || 0,
        documentosRequeridos: body.documentosRequeridos || null,
        activo: body.activo !== false,
      },
    })

    // Si hay tramiteConfigIds (array), crear asignaciones
    if (body.tramiteConfigIds && Array.isArray(body.tramiteConfigIds) && body.tramiteConfigIds.length > 0) {
      for (const tramiteConfigId of body.tramiteConfigIds) {
        await db.servicioAsignado.create({
          data: {
            servicioId: servicio.id,
            tramiteConfigId,
          },
        })
      }
    }

    // Volver a cargar con asignaciones
    const servicioConAsignaciones = await db.servicioAdicional.findUnique({
      where: { id: servicio.id },
      include: {
        asignacionesTramites: {
          include: { tramiteConfig: true },
        },
      },
    })

    return NextResponse.json(servicioConAsignaciones, { status: 201 })
  } catch (error) {
    console.error('Error creating servicio adicional:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error al crear servicio' },
      { status: 500 }
    )
  }
}
