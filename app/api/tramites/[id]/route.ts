import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const tramite = await db.tramite.findUnique({
      where: { id },
      include: {
        cliente: true,
        tramiteConfig: true,
        categoria: true,
        documentos: {
          include: {
            tipoDocumento: true,
          },
        },
        documentosGenerados: {
          include: { plantilla: true },
        },
        historialEstados: {
          orderBy: { createdAt: 'desc' },
        },
        checklistItems: {
          include: {
            documento: {
              include: {
                tipoDocumento: true,
              },
            },
            checkDocumento: true,
          },
        },
      },
    })

    if (!tramite) {
      return NextResponse.json(
        { message: 'Trámite no encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json(tramite)
  } catch (error) {
    console.error('Error fetching tramite:', error)
    return NextResponse.json(
      { message: 'Error al obtener trámite' },
      { status: 500 }
    )
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json()
    const { estado, notas, tipoTramite, honorarios, formaPago, suplidos, tasas } = body

    const tramiteActual = await db.tramite.findUnique({
      where: { id },
      include: { tasas: true },
    })

    if (!tramiteActual) {
      return NextResponse.json(
        { message: 'Trámite no encontrado' },
        { status: 404 }
      )
    }

    // Preparar datos para actualizar
    const dataUpdate: any = {}
    if (estado !== undefined) dataUpdate.estado = estado
    if (notas !== undefined) dataUpdate.notas = notas
    if (honorarios !== undefined) dataUpdate.honorarios = honorarios ? parseFloat(honorarios) : null
    if (formaPago !== undefined) dataUpdate.formaPago = formaPago || null
    if (suplidos !== undefined) dataUpdate.suplidos = suplidos ? parseFloat(suplidos) : 0

    // Si cambió el tipo de trámite, actualizar tramiteConfigId
    if (tipoTramite && tipoTramite !== tramiteActual.tramiteConfigId) {
      const tramiteConfig = await db.tramiteConfiguracion.findFirst({
        where: { tipoTramite },
      })
      if (!tramiteConfig) {
        return NextResponse.json(
          { message: `Tipo de trámite "${tipoTramite}" no encontrado` },
          { status: 400 }
        )
      }
      dataUpdate.tramiteConfigId = tramiteConfig.id
    }

    const tramiteActualizado = await db.tramite.update({
      where: { id },
      data: dataUpdate,
      include: {
        cliente: true,
        tramiteConfig: true,
        tasas: true,
      },
    })

    // Si cambió el estado, registrar en historial
    if (estado && estado !== tramiteActual.estado) {
      await db.historialEstado.create({
        data: {
          tramiteId: id,
          estadoAnterior: tramiteActual.estado,
          estadoNuevo: estado,
          usuario: 'usuario',
          notas: notas || null,
        },
      })
    }

    // Actualizar tasas si se proporcionan
    if (tasas && Array.isArray(tasas)) {
      // Eliminar tasas existentes
      await db.tasa.deleteMany({
        where: { tramiteId: id },
      })

      // Crear nuevas tasas
      await Promise.all(
        tasas.map((tasa: any) =>
          db.tasa.create({
            data: {
              tramiteId: id,
              nombre: tasa.nombre,
              importe: parseFloat(tasa.importe),
            },
          })
        )
      )
    }

    return NextResponse.json(tramiteActualizado)
  } catch (error) {
    console.error('Error updating tramite:', error)
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Error al actualizar trámite' },
      { status: 500 }
    )
  }
}
