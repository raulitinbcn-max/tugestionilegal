import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  try {
    const plantillas = await db.plantilla.findMany()
    return NextResponse.json(plantillas)
  } catch (error) {
    console.error('Error fetching plantillas:', error)
    return NextResponse.json(
      { error: 'Error al obtener plantillas' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const { nombre, tipo, tipoTramite, driveFileId } = await req.json()

    if (!nombre || !driveFileId) {
      return NextResponse.json(
        { error: 'nombre y driveFileId son requeridos' },
        { status: 400 }
      )
    }

    let tramiteConfigId: string | undefined = undefined

    // Convertir tipoTramite a tramiteConfigId si se proporciona
    if (tipoTramite) {
      const tramiteConfig = await db.tramiteConfiguracion.findFirst({
        where: { tipoTramite },
      })
      if (!tramiteConfig) {
        return NextResponse.json(
          { error: `Tipo de trámite "${tipoTramite}" no encontrado` },
          { status: 400 }
        )
      }
      tramiteConfigId = tramiteConfig.id
    }

    // Verificar si ya existe una plantilla con este nombre
    const existente = await db.plantilla.findFirst({
      where: {
        nombre,
      },
    })

    if (existente && tramiteConfigId) {
      // Si existe y estamos agregando un trámite, verificar que no exista esa combinación
      const yaAsociado = await db.plantilla.findFirst({
        where: {
          nombre,
          tramiteConfigId,
        },
      })
      if (yaAsociado) {
        return NextResponse.json(yaAsociado, { status: 200 })
      }

      // Si existe pero con diferente tipo de documento, error
      if (existente.tipo !== tipo) {
        return NextResponse.json(
          { error: `Esta plantilla ya está asociada al tipo de documento "${existente.tipo}". No se puede cambiar a "${tipo}".` },
          { status: 400 }
        )
      }
    }

    // Verificar si ya existe esta combinación exacta (nombre + tramiteConfigId)
    if (tramiteConfigId) {
      const existe = await db.plantilla.findFirst({
        where: {
          nombre,
          tramiteConfigId,
        },
      })

      if (existe) {
        return NextResponse.json(existe, { status: 200 })
      }
    }

    // Crear nueva plantilla (permite múltiples trámites del mismo tipo de documento)
    const plantilla = await db.plantilla.create({
      data: {
        nombre,
        tipo: tipo || 'genérica',
        tramiteConfigId: tramiteConfigId || null,
        driveFileId,
      },
    })
    return NextResponse.json(plantilla, { status: 201 })
  } catch (error) {
    console.error('Error creating plantilla:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error al registrar plantilla' },
      { status: 500 }
    )
  }
}
