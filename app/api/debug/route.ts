import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const usuariosCount = await db.usuarioAutorizado.count()
    const categoriasCount = await db.categoriasTramite.count()

    const usuarios = await db.usuarioAutorizado.findMany()

    return NextResponse.json({
      status: 'ok',
      usuariosCount,
      categoriasCount,
      usuarios: usuarios.map(u => ({ email: u.email, activo: u.activo }))
    })
  } catch (error: any) {
    return NextResponse.json({
      status: 'error',
      error: error.message,
      stack: error.stack
    }, { status: 500 })
  }
}
