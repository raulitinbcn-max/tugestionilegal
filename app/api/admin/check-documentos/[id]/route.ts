import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const { nombre, descripcion, orden, tipoVencimiento, diasCaducidad } = await req.json()

    const documento = await db.checkDocumento.update({
      where: { id },
      data: {
        nombre,
        descripcion: descripcion || null,
        orden: orden || 0,
        tipoVencimiento: tipoVencimiento || null,
        diasCaducidad: diasCaducidad || null,
      },
    })

    return NextResponse.json(documento)
  } catch (error) {
    console.error('Error updating check documento:', error)
    return NextResponse.json(
      { error: 'Error al actualizar documento' },
      { status: 500 }
    )
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    await db.checkDocumento.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Documento eliminado' })
  } catch (error) {
    console.error('Error deleting check documento:', error)
    return NextResponse.json(
      { error: 'Error al eliminar documento' },
      { status: 500 }
    )
  }
}
