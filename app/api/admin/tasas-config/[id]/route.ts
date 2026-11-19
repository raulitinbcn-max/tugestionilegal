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
    if (!body.nombre?.trim() || body.importe === undefined) {
      return NextResponse.json({ error: 'nombre e importe son requeridos' }, { status: 400 })
    }

    const tramiteConfigIds: string[] = Array.isArray(body.tramiteConfigIds) ? body.tramiteConfigIds : []

    const tasa = await db.$transaction(async (tx) => {
      const actualizada = await tx.tasaConfiguracion.update({
        where: { id: params.id },
        data: {
          nombre: body.nombre.trim(),
          importe: parseFloat(body.importe),
          categoriaId: body.categoriaId ?? null,
        },
      })
      await tx.tasaAsignada.deleteMany({
        where: { tasaId: params.id, tramiteConfigId: { notIn: tramiteConfigIds } },
      })
      await tx.tasaAsignada.createMany({
        data: tramiteConfigIds.map((tramiteConfigId) => ({ tasaId: params.id, tramiteConfigId })),
        skipDuplicates: true,
      })
      return actualizada
    })

    return NextResponse.json(tasa)
  } catch (error: any) {
    if (error?.code === 'P2025') {
      return NextResponse.json({ error: 'Tasa no encontrada' }, { status: 404 })
    }
    console.error('Error updating tasa:', error)
    return NextResponse.json({ error: 'Error al guardar la tasa' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    await db.tasaConfiguracion.delete({ where: { id: params.id } })
    return NextResponse.json({ ok: true })
  } catch (error: any) {
    if (error?.code === 'P2025') {
      return NextResponse.json({ error: 'Tasa no encontrada' }, { status: 404 })
    }
    console.error('Error deleting tasa:', error)
    return NextResponse.json({ error: 'Error al eliminar la tasa' }, { status: 500 })
  }
}
