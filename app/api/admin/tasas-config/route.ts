import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const tipoTramite = req.nextUrl.searchParams.get('tipoTramite')

    if (tipoTramite) {
      const asignaciones = await db.tasaAsignada.findMany({
        where: { tramiteConfig: { tipoTramite } },
        include: { tasa: true },
        orderBy: { tasa: { nombre: 'asc' } },
      })
      return NextResponse.json({
        tasasConfig: {
          [tipoTramite]: asignaciones.map((a) => ({
            id: a.tasa.id,
            nombre: a.tasa.nombre,
            importe: a.tasa.importe,
          })),
        },
      })
    }

    const tasas = await db.tasaConfiguracion.findMany({
      include: { asignaciones: { select: { tramiteConfigId: true } } },
      orderBy: { nombre: 'asc' },
    })
    return NextResponse.json({
      tasas: tasas.map((t) => ({
        id: t.id,
        nombre: t.nombre,
        importe: t.importe,
        categoriaId: t.categoriaId,
        tramiteConfigIds: t.asignaciones.map((a) => a.tramiteConfigId),
      })),
    })
  } catch (error) {
    console.error('Error fetching tasas:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await req.json()
    if (!body.categoriaId || !body.nombre?.trim() || body.importe === undefined) {
      return NextResponse.json(
        { error: 'categoriaId, nombre e importe son requeridos' },
        { status: 400 }
      )
    }

    const tasa = await db.tasaConfiguracion.create({
      data: {
        nombre: body.nombre.trim(),
        importe: parseFloat(body.importe),
        categoriaId: body.categoriaId,
      },
    })
    return NextResponse.json(tasa, { status: 201 })
  } catch (error: any) {
    console.error('Error creating tasa:', error)
    return NextResponse.json({ error: 'Error al crear la tasa' }, { status: 500 })
  }
}
