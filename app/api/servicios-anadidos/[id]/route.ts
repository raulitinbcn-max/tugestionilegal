import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    await db.servicioAnadido.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting servicio anadido:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error al eliminar' },
      { status: 500 }
    )
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await req.json()

    const servicio = await db.servicioAnadido.update({
      where: { id: params.id },
      data: {
        precioBase: body.precioBase !== undefined ? parseFloat(body.precioBase) : undefined,
        porcentajeIVA: body.porcentajeIVA !== undefined ? body.porcentajeIVA : undefined,
        suplicosBase: body.suplicosBase !== undefined ? body.suplicosBase : undefined,
      },
    })

    // Recalcular totales
    const montoIVA = Math.round((servicio.precioBase * servicio.porcentajeIVA / 100) * 100) / 100
    const total = servicio.precioBase + montoIVA + servicio.suplicosBase

    const actualizado = await db.servicioAnadido.update({
      where: { id: params.id },
      data: {
        montoIVA,
        suplicosTotales: servicio.suplicosBase,
        total,
      },
    })

    return NextResponse.json(actualizado)
  } catch (error) {
    console.error('Error updating servicio anadido:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error al actualizar' },
      { status: 500 }
    )
  }
}
