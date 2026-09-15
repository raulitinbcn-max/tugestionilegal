import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    const vencimientos = await db.vencimiento.findMany({
      where: { tramiteId: id },
      orderBy: { numeroVencimiento: 'asc' },
    })

    return NextResponse.json(vencimientos)
  } catch (error) {
    console.error('Error fetching vencimientos:', error)
    return NextResponse.json(
      { error: 'Error al obtener vencimientos' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const { vencimientos } = await req.json()

    if (!Array.isArray(vencimientos)) {
      return NextResponse.json(
        { error: 'Vencimientos debe ser un array' },
        { status: 400 }
      )
    }

    // Eliminar vencimientos anteriores
    await db.vencimiento.deleteMany({
      where: { tramiteId: id },
    })

    // Crear nuevos vencimientos
    const created = await Promise.all(
      vencimientos.map((v: any) =>
        db.vencimiento.create({
          data: {
            tramiteId: id,
            numeroVencimiento: v.numeroVencimiento,
            importe: v.importe,
            formaPago: v.formaPago,
            fechaVencimiento: new Date(v.fechaVencimiento),
            pagado: v.pagado || false,
            notas: v.notas || null,
          },
        })
      )
    )

    return NextResponse.json(created, { status: 201 })
  } catch (error) {
    console.error('Error creating vencimientos:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error al crear vencimientos' },
      { status: 500 }
    )
  }
}
