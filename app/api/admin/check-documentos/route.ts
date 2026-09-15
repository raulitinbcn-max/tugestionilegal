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

    const checks = await db.checkDocumento.findMany()
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
    const check = await db.checkDocumento.create({
      data: body,
    })

    return NextResponse.json(check)
  } catch (error) {
    console.error('Error creating check:', error)
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
