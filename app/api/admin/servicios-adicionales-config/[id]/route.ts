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

    const servicio = await db.servicioAdicionalConfig.update({
      where: { id: params.id },
      data: {
        nombre: body.nombre,
        descripcion: body.descripcion || null,
        precioBase: body.precioBase !== undefined ? parseFloat(body.precioBase) : undefined,
        porcentajeIVA: body.porcentajeIVA !== undefined ? body.porcentajeIVA : undefined,
        suplicosBase: body.suplicosBase !== undefined ? body.suplicosBase : undefined,
        documentosRequeridos: body.documentosRequeridos || null,
        activo: body.activo !== undefined ? body.activo : undefined,
      },
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

    await db.servicioAdicionalConfig.delete({
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
