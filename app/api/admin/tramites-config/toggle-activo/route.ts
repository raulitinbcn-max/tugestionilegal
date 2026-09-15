import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await req.json()
    const { id, activo } = body

    const tramite = await db.tramiteConfig.update({
      where: { id },
      data: { activo },
    })

    return NextResponse.json(tramite)
  } catch (error) {
    console.error('Error toggling activo:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
