import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await req.json()

    const servicio = await db.servicioAdicional.update({
      where: { id: params.id },
      data: {
        nombre: body.nombre !== undefined ? body.nombre : undefined,
        descripcion: body.descripcion !== undefined ? body.descripcion : undefined,
        precioBase: body.precioBase !== undefined ? parseFloat(body.precioBase) : undefined,
        porcentajeIVA: body.porcentajeIVA !== undefined ? body.porcentajeIVA : undefined,
        suplicosBase: body.suplicosBase !== undefined ? body.suplicosBase : undefined,
        documentosRequeridos: body.documentosRequeridos !== undefined ? body.documentosRequeridos : undefined,
        activo: body.activo !== undefined ? body.activo : undefined,
      },
      include: {
        asignacionesTramites: {
          include: { tramiteConfig: true },
        },
      },
    })

    // Manejar cambios en tramiteConfigIds (array)
    if (body.tramiteConfigIds !== undefined) {
      // Eliminar todas las asignaciones existentes
      await db.servicioAsignado.deleteMany({
        where: { servicioId: params.id },
      })

      // Crear nuevas asignaciones si se proporciona tramiteConfigIds
      if (Array.isArray(body.tramiteConfigIds) && body.tramiteConfigIds.length > 0) {
        for (const tramiteConfigId of body.tramiteConfigIds) {
          await db.servicioAsignado.create({
            data: {
              servicioId: params.id,
              tramiteConfigId,
            },
          })
        }
      }
    }

    // Volver a cargar con asignaciones actualizadas
    const servicioActualizado = await db.servicioAdicional.findUnique({
      where: { id: params.id },
      include: {
        asignacionesTramites: {
          include: { tramiteConfig: true },
        },
      },
    })

    return NextResponse.json(servicioActualizado)
  } catch (error) {
    console.error('Error updating servicio:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error al actualizar' },
      { status: 500 }
    )
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    await db.servicioAdicional.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting servicio:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error al eliminar' },
      { status: 500 }
    )
  }
}
