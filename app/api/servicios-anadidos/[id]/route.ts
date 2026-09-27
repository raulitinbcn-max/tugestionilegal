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

    // Actualizar campos de precio si se proporcionan
    if (body.precioBase !== undefined) updateData.precioBase = body.precioBase
    if (body.porcentajeIVA !== undefined) updateData.porcentajeIVA = body.porcentajeIVA
    if (body.suplicosBase !== undefined) updateData.suplicosBase = body.suplicosBase

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
