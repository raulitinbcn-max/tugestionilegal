import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { templates } = body

    if (!Array.isArray(templates)) {
      return NextResponse.json(
        { error: 'Se requiere un array de plantillas con {nombre, driveFileId, tipoTramite}' },
        { status: 400 }
      )
    }

    const results = []

    for (const template of templates) {
      const { nombre, driveFileId, tipoTramite, tipo } = template

      if (!nombre || !driveFileId) {
        results.push({
          nombre,
          status: 'error',
          error: 'Falta nombre o driveFileId',
        })
        continue
      }

      // Buscar tramiteConfigId por tipoTramite
      let tramiteConfigId: string | null = null
      if (tipoTramite) {
        const tramiteConfig = await db.tramiteConfiguracion.findFirst({
          where: { tipoTramite },
        })
        if (tramiteConfig) {
          tramiteConfigId = tramiteConfig.id
        } else {
          results.push({
            nombre,
            status: 'error',
            error: `Tipo de trámite "${tipoTramite}" no encontrado`,
          })
          continue
        }
      }

      const plantilla = await db.plantilla.create({
        data: {
          tipo: tipo || 'plantilla',
          tramiteConfigId,
          nombre,
          driveFileId,
        },
      })

      results.push({
        nombre,
        plantillaId: plantilla.id,
        status: 'success',
      })
    }

    return NextResponse.json({
      message: 'Plantillas registradas',
      results,
    })
  } catch (error) {
    console.error('Error registering templates:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error al registrar plantillas' },
      { status: 500 }
    )
  }
}
