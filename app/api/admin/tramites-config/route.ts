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

    const tramites = await db.tramiteConfiguracion.findMany()
    return NextResponse.json(tramites)
  } catch (error) {
    console.error('Error fetching tramites:', error)
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
    const tramite = await db.tramiteConfiguracion.create({
      data: body,
    })

    return NextResponse.json(tramite)
  } catch (error) {
    console.error('Error creating tramite:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await req.json()
    const tramite = await db.tramiteConfiguracion.update({
      where: { id: body.id },
      data: body,
    })

    return NextResponse.json(tramite)
  } catch (error) {
    console.error('Error updating tramite:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
