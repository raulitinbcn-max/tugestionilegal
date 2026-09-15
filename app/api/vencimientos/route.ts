import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    const tramiteId = req.nextUrl.searchParams.get('tramiteId')

    if (tramiteId) {
      // Si hay tramiteId, devolver solo los vencimientos de ese trámite
      const vencimientos = await db.vencimiento.findMany({
        where: { tramiteId },
        orderBy: { numeroVencimiento: 'asc' },
      })
      return NextResponse.json(vencimientos)
    } else {
      // Si no hay tramiteId, devolver todos los vencimientos con info del trámite
      const vencimientos = await db.vencimiento.findMany({
        include: {
          tramite: {
            include: {
              cliente: true,
            },
          },
        },
        orderBy: { fechaVencimiento: 'asc' },
      })
      return NextResponse.json(vencimientos)
    }
  } catch (error) {
    console.error('Error fetching vencimientos:', error)
    return NextResponse.json(
      { error: 'Error al obtener vencimientos' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const { tramiteId, vencimientos } = await req.json()

    if (!tramiteId || !Array.isArray(vencimientos)) {
      return NextResponse.json(
        { error: 'tramiteId y vencimientos requeridos' },
        { status: 400 }
      )
    }

    // Eliminar vencimientos anteriores
    await db.vencimiento.deleteMany({
      where: { tramiteId },
    })

    // Crear nuevos vencimientos
    const created = await Promise.all(
      vencimientos.map((v: any) =>
        db.vencimiento.create({
          data: {
            tramiteId,
            numeroVencimiento: v.numeroVencimiento,
            importe: parseFloat(v.importe),
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
