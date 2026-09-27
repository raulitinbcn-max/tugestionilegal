import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    const tramiteId = req.nextUrl.searchParams.get('tramiteId')
    const searchTerm = req.nextUrl.searchParams.get('search') // Nombre o código
    const estado = req.nextUrl.searchParams.get('estado') // 'pendiente', 'pagado', 'vencido'
    const formaPago = req.nextUrl.searchParams.get('formaPago')
    const fechaDesde = req.nextUrl.searchParams.get('fechaDesde')
    const fechaHasta = req.nextUrl.searchParams.get('fechaHasta')
    const categoria = req.nextUrl.searchParams.get('categoria')

    if (tramiteId) {
      // Si hay tramiteId, devolver solo los vencimientos de ese trámite
      const vencimientos = await db.vencimiento.findMany({
        where: { tramiteId },
        orderBy: { numeroVencimiento: 'asc' },
      })
      return NextResponse.json(vencimientos)
    } else {
      // Construir filtros dinámicos
      const where: any = {}

      // Búsqueda por nombre de cliente o código de trámite
      if (searchTerm) {
        where.tramite = {
          OR: [
            { codigo: { contains: searchTerm, mode: 'insensitive' } },
            { cliente: { nombreCompleto: { contains: searchTerm, mode: 'insensitive' } } },
          ],
        }
      }

      // Filtro por estado
      if (estado === 'pendiente') {
        where.pagado = false
        where.fechaVencimiento = { gte: new Date() }
      } else if (estado === 'vencido') {
        where.pagado = false
        where.fechaVencimiento = { lt: new Date() }
      } else if (estado === 'pagado') {
        where.pagado = true
      }

      // Filtro por forma de pago
      if (formaPago) {
        where.formaPago = formaPago
      }

      // Filtro por rango de fechas
      if (fechaDesde || fechaHasta) {
        where.fechaVencimiento = {}
        if (fechaDesde) where.fechaVencimiento.gte = new Date(fechaDesde)
        if (fechaHasta) where.fechaVencimiento.lte = new Date(fechaHasta)
      }

      // Filtro por categoría de trámite
      if (categoria) {
        where.tramite = {
          ...where.tramite,
          tramiteConfig: { categoria },
        }
      }

      // Si no hay tramiteId, devolver todos los vencimientos con info del trámite
      const vencimientos = await db.vencimiento.findMany({
        where,
        include: {
          tramite: {
            include: {
              cliente: true,
              tramiteConfig: true,
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
