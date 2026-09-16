import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await req.json()
    const categoria = await db.categoriasTramite.update({
      where: { id: params.id },
      data: body,
    })

    return NextResponse.json(categoria)
  } catch (error: any) {
    console.error('Error updating categoria:', error)
    if (error?.code === 'P2025') {
      return NextResponse.json({ error: 'Categoría no encontrada' }, { status: 404 })
    }
    if (error?.code === 'P2002') {
      const field = error?.meta?.target?.[0] || 'clave/codigo'
      return NextResponse.json({ error: `Ya existe una categoría con este ${field}` }, { status: 400 })
    }
    return NextResponse.json({ error: error?.message || 'Error interno' }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    await db.categoriasTramite.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error deleting categoria:', error)
    if (error?.code === 'P2025') {
      return NextResponse.json({ error: 'Categoría no encontrada' }, { status: 404 })
    }
    return NextResponse.json({ error: error?.message || 'Error interno' }, { status: 500 })
  }
}
