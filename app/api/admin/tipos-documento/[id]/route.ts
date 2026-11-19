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
    if (!body.nombre) {
      return NextResponse.json({ error: 'nombre es requerido' }, { status: 400 })
    }

    const tipo = await db.tipoDocumento.update({
      where: { id: params.id },
      data: {
        nombre: body.nombre,
        descripcion: body.descripcion ?? null,
        icono: body.icono ?? null,
        color: body.color ?? null,
        orden: body.orden ?? 0,
        categoriaId: body.categoriaId ?? null,
      },
    })
    return NextResponse.json(tipo)
  } catch (error: any) {
    if (error?.code === 'P2025') {
      return NextResponse.json({ error: 'Tipo de documento no encontrado' }, { status: 404 })
    }
    if (error?.code === 'P2002') {
      return NextResponse.json({ error: 'Ya existe un tipo de documento con este nombre' }, { status: 400 })
    }
    console.error('Error updating tipo:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    await db.tipoDocumento.delete({ where: { id: params.id } })
    return NextResponse.json({ ok: true })
  } catch (error: any) {
    if (error?.code === 'P2025') {
      return NextResponse.json({ error: 'Tipo de documento no encontrado' }, { status: 404 })
    }
    console.error('Error deleting tipo:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
