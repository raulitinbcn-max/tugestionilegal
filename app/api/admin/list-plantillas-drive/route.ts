import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Por ahora, retornar lista vacía
    // Esto requeriría integración con Google Drive API
    return NextResponse.json([])
  } catch (error) {
    console.error('Error fetching plantillas from drive:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
