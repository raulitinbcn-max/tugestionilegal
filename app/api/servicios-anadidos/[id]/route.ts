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

    await db.servicioAnadidoEnExpediente.delete({
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

    let updateData: any = {}

    // Si cambian precios, recalcular total
    if (body.precioBase !== undefined || body.porcentajeIVA !== undefined || body.suplicosBase !== undefined) {
      const servicioActual = await db.servicioAnadidoEnExpediente.findUnique({
        where: { id: params.id },
      })

      if (!servicioActual) {
        return NextResponse.json({ error: 'Servicio no encontrado' }, { status: 404 })
      }

      const precioBase = body.precioBase !== undefined ? body.precioBase : servicioActual.precioBase
      const porcentajeIVA = body.porcentajeIVA !== undefined ? body.porcentajeIVA : servicioActual.porcentajeIVA
      const suplicosBase = body.suplicosBase !== undefined ? body.suplicosBase : servicioActual.suplicosBase

      const montoIVA = Math.round((precioBase * porcentajeIVA / 100) * 100) / 100
      const total = precioBase + montoIVA + suplicosBase

      updateData = {
        precioBase,
        porcentajeIVA,
        suplicosBase,
        montoIVA,
        suplicosTotales: suplicosBase,
        total,
      }
    }

    const servicioAnadido = await db.servicioAnadidoEnExpediente.update({
      where: { id: params.id },
      data: updateData,
    })

    return NextResponse.json(servicioAnadido)
  } catch (error) {
    console.error('Error updating servicio anadido:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error al actualizar' },
      { status: 500 }
    )
  }
}
