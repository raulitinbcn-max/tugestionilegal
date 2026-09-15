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
    const plantilla = await db.plantilla.create({
      data: body,
    })

    return NextResponse.json(plantilla)
  } catch (error) {
    console.error('Error creating plantilla:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
