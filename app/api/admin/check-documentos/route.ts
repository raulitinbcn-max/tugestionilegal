import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    const tramiteConfigId = req.nextUrl.searchParams.get('tramiteConfigId')

    if (!tramiteConfigId) {
      return NextResponse.json(
        { error: 'tramiteConfigId requerido' },
        { status: 400 }
      )
    }

    const documentos = await db.checkDocumento.findMany({
      where: { tramiteConfigId },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(documentos)
  } catch (error) {
    console.error('Error fetching check documentos:', error)
    return NextResponse.json(
      { error: 'Error al obtener documentos' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const { nombre, descripcion, tramiteConfigId, orden, tipoVencimiento, diasCaducidad } = await req.json()

    if (!nombre || !tramiteConfigId) {
      return NextResponse.json(
        { error: 'nombre y tramiteConfigId requeridos' },
        { status: 400 }
      )
    }

    const documento = await db.checkDocumento.create({
      data: {
        nombre,
        descripcion: descripcion || null,
        tramiteConfigId,
        orden: orden || 0,
        tipoVencimiento: tipoVencimiento || null,
        diasCaducidad: diasCaducidad ? parseInt(diasCaducidad) : null,
      },
    })

    return NextResponse.json(documento, { status: 201 })
  } catch (error) {
    console.error('Error creating check documento:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error al crear documento' },
      { status: 500 }
    )
  }
}
