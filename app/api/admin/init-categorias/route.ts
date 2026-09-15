import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'

export const dynamic = 'force-dynamic'

const CATEGORIAS_INICIALES = [
  { nombre: 'Mercantil', color: '#3b82f6' },
  { nombre: 'Laboral', color: '#ef4444' },
  { nombre: 'Civil', color: '#10b981' },
  { nombre: 'Administrativo', color: '#f59e0b' },
]

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Crear categorías iniciales
    const categorias = await Promise.all(
      CATEGORIAS_INICIALES.map(cat =>
        db.categoriaTramite.create({
          data: cat,
        })
      )
    )

    return NextResponse.json({ success: true, categorias })
  } catch (error) {
    console.error('Error initializing categorias:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
