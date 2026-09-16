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

    const tipos = await db.tipoDocumento.findMany()
    return NextResponse.json(tipos)
  } catch (error) {
    console.error('Error fetching tipos:', error)
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
    if (!body.nombre) {
      return NextResponse.json(
        { error: 'nombre es requerido' },
        { status: 400 }
      )
    }

    const tipo = await db.tipoDocumento.create({
      data: body,
    })

    return NextResponse.json(tipo)
  } catch (error: any) {
    console.error('Error creating tipo:', error)
    if (error?.code === 'P2002') {
      return NextResponse.json(
        { error: 'Ya existe un tipo de documento con este nombre' },
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
    const tipo = await db.tipoDocumento.update({
      where: { id: body.id },
      data: body,
    })

    return NextResponse.json(tipo)
  } catch (error) {
    console.error('Error updating tipo:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
