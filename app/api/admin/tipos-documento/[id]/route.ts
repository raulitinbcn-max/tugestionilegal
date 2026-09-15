import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const { nombre, descripcion, icono, color, orden, categoriaId } = await req.json()

    const tipo = await db.tipoDocumento.update({
      where: { id },
      data: {
        ...(nombre && { nombre }),
        ...(descripcion !== undefined && { descripcion }),
        ...(icono !== undefined && { icono }),
        ...(color !== undefined && { color }),
        ...(orden !== undefined && { orden }),
        ...(categoriaId !== undefined && { categoriaId }),
      },
    })

    return NextResponse.json(tipo)
  } catch (error) {
    console.error('Error updating tipo documento:', error)
    return NextResponse.json(
      { error: 'Error al actualizar tipo de documento' },
      { status: 500 }
    )
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    await db.tipoDocumento.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Tipo de documento eliminado' })
  } catch (error) {
    console.error('Error deleting tipo documento:', error)
    return NextResponse.json(
      { error: 'Error al eliminar tipo de documento' },
      { status: 500 }
    )
  }
}
