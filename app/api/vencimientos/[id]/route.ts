import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { pagado, fechaPago, formaPago, importe, notas } = await req.json()

    const vencimiento = await db.vencimiento.update({
      where: { id: params.id },
      data: {
        pagado,
        fechaPago: fechaPago ? new Date(fechaPago) : null,
        formaPago: formaPago || undefined,
        importe: importe !== undefined ? parseFloat(importe) : undefined,
        notas: notas || null,
      },
    })

    return NextResponse.json(vencimiento)
  } catch (error) {
    console.error('Error actualizando vencimiento:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error al actualizar vencimiento' },
      { status: 500 }
    )
  }
}
