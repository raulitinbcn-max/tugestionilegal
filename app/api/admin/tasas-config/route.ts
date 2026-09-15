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

    const tasas = await db.tasaConfig.findMany()
    return NextResponse.json(tasas)
  } catch (error) {
    console.error('Error fetching tasas:', error)
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
    const tasa = await db.tasaConfig.create({
      data: body,
    })

    return NextResponse.json(tasa)
  } catch (error) {
    console.error('Error creating tasa:', error)
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
    const tasa = await db.tasaConfig.update({
      where: { id: body.id },
      data: body,
    })

    return NextResponse.json(tasa)
  } catch (error) {
    console.error('Error updating tasa:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
