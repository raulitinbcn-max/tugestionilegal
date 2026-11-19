import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await req.json()
    const check = await db.checkDocumento.update({
      where: { id: params.id },
      data: {
        nombre: body.nombre || '',
        descripcion: body.descripcion || null,
        tipoDocumentoId: body.tipoDocumentoId || null,
        orden: body.orden || 0,
        tipoVencimiento: body.tipoVencimiento || null,
        diasCaducidad: body.diasCaducidad || null,
      },
      include: { tipoDocumento: true },
    })
    return NextResponse.json(check)
  } catch (error: any) {
    if (error?.code === 'P2025') {
      return NextResponse.json({ error: 'Documento no encontrado' }, { status: 404 })
    }
    if (error?.code === 'P2002') {
      return NextResponse.json({ error: 'Ya existe un checklist con este nombre para este trámite' }, { status: 400 })
    }
    console.error('Error updating check:', error)
    return NextResponse.json({ error: 'Error al actualizar documento' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    await db.checkDocumento.delete({ where: { id: params.id } })
    return NextResponse.json({ ok: true })
  } catch (error: any) {
    if (error?.code === 'P2025') {
      return NextResponse.json({ error: 'Documento no encontrado' }, { status: 404 })
    }
    console.error('Error deleting check:', error)
    return NextResponse.json({ error: 'Error al eliminar documento' }, { status: 500 })
  }
}
