import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'

export const dynamic = 'force-dynamic'

const CATEGORIAS_INICIALES = [
  { clave: 'mercantil', codigo: 'MER', nombre: 'Mercantil', color: '#3b82f6' },
  { clave: 'laboral', codigo: 'LAB', nombre: 'Laboral', color: '#ef4444' },
  { clave: 'civil', codigo: 'CIV', nombre: 'Civil', color: '#10b981' },
  { clave: 'administrativo', codigo: 'ADM', nombre: 'Administrativo', color: '#f59e0b' },
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
        db.categoriasTramite.create({
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
