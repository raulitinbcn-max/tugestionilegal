import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'

export const dynamic = 'force-dynamic'

async function esUsuarioActual(id: string, sessionEmail: string | null | undefined) {
  if (!sessionEmail) return false
  const usuario = await db.usuarioAutorizado.findUnique({ where: { id } })
  return usuario?.email === sessionEmail.toLowerCase()
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await req.json()
    const data: { activo?: boolean; nombre?: string | null } = {}

    if (typeof body.activo === 'boolean') {
      if (body.activo === false && (await esUsuarioActual(params.id, session.user?.email))) {
        return NextResponse.json({ error: 'No puedes bloquear tu propio acceso' }, { status: 400 })
      }
      data.activo = body.activo
    }
    if (typeof body.nombre === 'string') {
      data.nombre = body.nombre.trim() || null
    }

    const usuario = await db.usuarioAutorizado.update({
      where: { id: params.id },
      data,
    })
    return NextResponse.json(usuario)
  } catch (error) {
    console.error('Error updating usuario:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    if (await esUsuarioActual(params.id, session.user?.email)) {
      return NextResponse.json({ error: 'No puedes eliminar tu propio acceso' }, { status: 400 })
    }

    await db.usuarioAutorizado.delete({ where: { id: params.id } })
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Error deleting usuario:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
