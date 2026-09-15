import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams
    const categoriaId = searchParams.get('categoriaId')

    const tipos = await db.tipoDocumento.findMany({
      where: categoriaId ? { categoriaId } : {},
      orderBy: { orden: 'asc' },
    })

    return NextResponse.json(tipos)
  } catch (error) {
    console.error('Error fetching tipos documento:', error)
    return NextResponse.json(
      { error: 'Error al obtener tipos de documento' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const { nombre, descripcion, icono, color, orden, categoriaId } = await req.json()

    if (!nombre) {
      return NextResponse.json(
        { error: 'nombre requerido' },
        { status: 400 }
      )
    }

    const tipo = await db.tipoDocumento.create({
      data: {
        nombre,
        descripcion: descripcion || null,
        icono: icono || null,
        color: color || null,
        orden: orden || 0,
        categoriaId: categoriaId || null,
      },
    })

    return NextResponse.json(tipo, { status: 201 })
  } catch (error) {
    console.error('Error creating tipo documento:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error al crear tipo de documento' },
      { status: 500 }
    )
  }
}
