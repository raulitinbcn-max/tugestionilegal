import { db } from '@/lib/db'
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

    const plantillas = await db.plantilla.findMany()
    return NextResponse.json(plantillas)
  } catch (error) {
    console.error('Error fetching plantillas:', error)
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

    // Validate required fields
    if (!body.tipo || !body.nombre || !body.driveFileId || !body.tipoTramite) {
      return NextResponse.json(
        { error: 'tipo, nombre, tipoTramite y driveFileId son requeridos' },
        { status: 400 }
      )
    }

    console.log('[plantillas-registradas POST] Creating plantilla with data:', { nombre: body.nombre, tipo: body.tipo, tipoTramite: body.tipoTramite })

    const plantilla = await db.plantilla.create({
      data: {
        nombre: body.nombre,
        tipo: body.tipo,
        tipoTramite: body.tipoTramite,
        driveFileId: body.driveFileId,
      },
    })

    console.log('[plantillas-registradas POST] Successfully created plantilla:', plantilla.id)
    return NextResponse.json(plantilla)
  } catch (error: any) {
    console.error('[plantillas-registradas POST] Error:', error?.message || error)
    return NextResponse.json({ error: error?.message || 'Error interno' }, { status: 500 })
  }
}
