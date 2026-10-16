import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const usuarios = await db.usuarioAutorizado.findMany({
      orderBy: { createdAt: 'asc' },
    })
    return NextResponse.json(usuarios)
  } catch (error) {
    console.error('Error fetching usuarios:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await req.json()
    const email = typeof body.email === 'string' ? body.email.toLowerCase().trim() : ''
    const nombre = typeof body.nombre === 'string' ? body.nombre.trim() || null : null

    if (!email || !email.includes('@') || !email.includes('.')) {
      return NextResponse.json({ error: 'Email no válido' }, { status: 400 })
    }

    const existe = await db.usuarioAutorizado.findUnique({ where: { email } })
    if (existe) {
      return NextResponse.json({ error: 'Ese email ya está autorizado' }, { status: 400 })
    }

    const usuario = await db.usuarioAutorizado.create({
      data: { email, nombre },
    })
    return NextResponse.json(usuario, { status: 201 })
  } catch (error) {
    console.error('Error creating usuario:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
