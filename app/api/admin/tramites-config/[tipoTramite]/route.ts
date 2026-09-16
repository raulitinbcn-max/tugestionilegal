import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function PUT(
  req: NextRequest,
  { params }: { params: { tipoTramite: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await req.json()
    const tipoTramite = params.tipoTramite

    const tramite = await db.tramiteConfiguracion.update({
      where: { nombre: tipoTramite },
      data: body,
    })

    return NextResponse.json(tramite)
  } catch (error: any) {
    console.error('Error updating tramite:', error)
    if (error?.code === 'P2025') {
      return NextResponse.json({ error: 'Trámite no encontrado' }, { status: 404 })
    }
    return NextResponse.json({ error: error?.message || 'Error interno' }, { status: 500 })
  }
}
