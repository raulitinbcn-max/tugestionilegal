import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    const tramiteId = req.nextUrl.searchParams.get('tramiteId')

    if (!tramiteId) {
      return NextResponse.json(
        { message: 'tramiteId es requerido' },
        { status: 400 }
      )
    }

    const documentos = await db.documento.findMany({
      where: { tramiteId },
    })

    return NextResponse.json(documentos)
  } catch (error) {
    console.error('Error fetching documentos:', error)
    return NextResponse.json(
      { message: 'Error al obtener documentos' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { tramiteId, nombre, tipoDocumento, driveFileId } = body

    if (!tramiteId || !driveFileId) {
      return NextResponse.json(
        { message: 'tramiteId y driveFileId son requeridos' },
        { status: 400 }
      )
    }

    const documento = await db.documento.create({
      data: {
        tramiteId,
        nombre,
        tipoDocumento,
        driveFileId,
        origen: 'manual',
      },
    })

    return NextResponse.json(documento, { status: 201 })
  } catch (error) {
    console.error('Error creating documento:', error)
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Error al crear documento' },
      { status: 500 }
    )
  }
}
