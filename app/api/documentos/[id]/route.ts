import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json()
    const { tipoDocumentoId, checkDocumentoId } = body

    console.log('Actualizando documento:', { id, tipoDocumentoId, checkDocumentoId })

    // Verificar que el documento existe
    const docExists = await db.documento.findUnique({
      where: { id },
    })

    if (!docExists) {
      return NextResponse.json(
        { error: 'Documento no encontrado' },
        { status: 404 }
      )
    }

    // Preparar datos a actualizar
    const dataToUpdate: any = {}

    if (tipoDocumentoId !== undefined) {
      dataToUpdate.tipoDocumentoId = tipoDocumentoId || null
    }

    if (checkDocumentoId !== undefined) {
      dataToUpdate.checkDocumentoId = checkDocumentoId || null
    }

    console.log('Datos a actualizar:', dataToUpdate)

    const documento = await db.documento.update({
      where: { id },
      data: dataToUpdate,
      include: {
        tipoDocumento: true,
      },
    })

    return NextResponse.json(documento)
  } catch (error) {
    console.error('Error updating documento:', error)
    const message = error instanceof Error ? error.message : 'Error al actualizar documento'
    return NextResponse.json(
      { error: message },
      { status: 500 }
    )
  }
}
