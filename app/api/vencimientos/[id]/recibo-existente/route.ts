import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const vencimientoId = params.id

    const vencimiento = await db.vencimiento.findUnique({
      where: { id: vencimientoId },
    })

    if (!vencimiento) {
      return NextResponse.json(null)
    }

    // Buscar documento generado que sea un recibo para este vencimiento
    const recibo = await db.documentoGenerado.findFirst({
      where: {
        tramiteId: vencimiento.tramiteId,
        nombreGenerado: {
          contains: `recibo_vencimiento_${vencimiento.numeroVencimiento}`,
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(recibo || null)
  } catch (error) {
    console.error('Error buscando recibo:', error)
    return NextResponse.json(null)
  }
}
