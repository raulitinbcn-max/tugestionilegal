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

    // Support filtering by tramiteConfigId
    const { searchParams } = new URL(req.url)
    const tramiteConfigId = searchParams.get('tramiteConfigId')

    let checks
    if (tramiteConfigId) {
      checks = await db.checkDocumento.findMany({
        where: { tramiteConfigId },
        include: { tipoDocumento: true },
        orderBy: { orden: 'asc' },
      })
    } else {
      checks = await db.checkDocumento.findMany({
        include: { tipoDocumento: true },
        orderBy: { tramiteConfigId: 'asc', orden: 'asc' },
      })
    }

    return NextResponse.json(checks)
  } catch (error) {
    console.error('Error fetching checks:', error)
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
    if (!body.tramiteConfigId || !body.tipoDocumentoId) {
      return NextResponse.json(
        { error: 'tramiteConfigId y tipoDocumentoId son requeridos' },
        { status: 400 }
      )
    }

    const check = await db.checkDocumento.create({
      data: {
        tramiteConfigId: body.tramiteConfigId,
        tipoDocumentoId: body.tipoDocumentoId,
        nombre: body.nombre || '',
        descripcion: body.descripcion || null,
        orden: body.orden || 0,
        tipoVencimiento: body.tipoVencimiento || null,
        diasCaducidad: body.diasCaducidad || null,
      },
      include: { tipoDocumento: true },
    })

    return NextResponse.json(check)
  } catch (error: any) {
    console.error('Error creating check:', error)
    if (error?.code === 'P2002') {
      return NextResponse.json(
        { error: 'Ya existe un checklist con este nombre para este trámite' },
        { status: 400 }
      )
    }
    return NextResponse.json({ error: error?.message || 'Error interno' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await req.json()
    const check = await db.checkDocumento.update({
      where: { id: body.id },
      data: body,
    })

    return NextResponse.json(check)
  } catch (error) {
    console.error('Error updating check:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
