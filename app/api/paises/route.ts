import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams
    const search = searchParams.get('search') || ''

    const paises = await db.pais.findMany({
      where: {
        activo: true,
        nombre: {
          contains: search,
          mode: 'insensitive',
        },
      },
      orderBy: { nombre: 'asc' },
      select: {
        id: true,
        nombre: true,
        codigo: true,
      },
    })

    return NextResponse.json(paises)
  } catch (error) {
    console.error('Error fetching paises:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error al obtener países' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { nombre, codigo } = body

    if (!nombre) {
      return NextResponse.json(
        { error: 'Nombre de país requerido' },
        { status: 400 }
      )
    }

    // Verificar si ya existe
    const existe = await db.pais.findUnique({
      where: { nombre },
    })

    if (existe) {
      return NextResponse.json(
        { error: 'País ya existe' },
        { status: 400 }
      )
    }

    const pais = await db.pais.create({
      data: {
        nombre,
        codigo: codigo || null,
      },
    })

    return NextResponse.json(pais, { status: 201 })
  } catch (error) {
    console.error('Error creating pais:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error al crear país' },
      { status: 500 }
    )
  }
}
