import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    // Primero, eliminar todos los documentos generados que usan esta plantilla
    await db.documentoGenerado.deleteMany({
      where: { plantillaId: id },
    })

    // Luego, eliminar la plantilla
    await db.plantilla.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Plantilla eliminada' })
  } catch (error) {
    console.error('Error deleting plantilla:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error al eliminar plantilla' },
      { status: 500 }
    )
  }
}
