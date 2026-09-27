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

    // Recalcular total si cambian precios
    let total = undefined
    if (body.precioBase !== undefined || body.porcentajeIVA !== undefined || body.suplicosBase !== undefined) {
      const servicio = await db.servicioAdicional.findUnique({ where: { id: params.id } })
      if (!servicio) {
        return NextResponse.json({ error: 'Servicio no encontrado' }, { status: 404 })
      }

      const precioBase = body.precioBase !== undefined ? body.precioBase : servicio.precioBase
      const porcentajeIVA = body.porcentajeIVA !== undefined ? body.porcentajeIVA : servicio.porcentajeIVA
      const suplicosBase = body.suplicosBase !== undefined ? body.suplicosBase : servicio.suplicosBase

      const montoIVA = Math.round((precioBase * porcentajeIVA / 100) * 100) / 100
      total = precioBase + montoIVA + suplicosBase
    }

    const servicio = await db.servicioAdicional.update({
      where: { id: params.id },
      data: {
        nombre: body.nombre,
        descripcion: body.descripcion || null,
        precioBase: body.precioBase !== undefined ? parseFloat(body.precioBase) : undefined,
        porcentajeIVA: body.porcentajeIVA !== undefined ? body.porcentajeIVA : undefined,
        suplicosBase: body.suplicosBase !== undefined ? body.suplicosBase : undefined,
        total: total,
        tramiteConfigId: body.tramiteConfigId === null ? null : (body.tramiteConfigId || undefined),
        documentosRequeridos: body.documentosRequeridos || null,
        activo: body.activo !== undefined ? body.activo : undefined,
      },
      include: { tramiteConfig: true },
    })

    return NextResponse.json(servicio)
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
