import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'

export async function POST() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Endpoint de backup de OAuth - actualmente no implementado
    return NextResponse.json({ success: false, message: 'Backup de OAuth no implementado' }, { status: 200 })
  } catch (error) {
    console.error('Error en backup-oauth:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
