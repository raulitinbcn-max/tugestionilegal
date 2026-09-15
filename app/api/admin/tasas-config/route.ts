import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { tasasConfig } = await req.json()

    if (!tasasConfig || typeof tasasConfig !== 'object') {
      return NextResponse.json(
        { error: 'Configuración de tasas inválida' },
        { status: 400 }
      )
    }

    // Guardar cada tasa por tipo de trámite
    for (const [tipoTramite, tasas] of Object.entries(tasasConfig)) {
      const tasasArray = tasas as Array<{ nombre: string; importe: number }>

      // Obtener tramiteConfigId
      const tramiteConfig = await db.tramiteConfiguracion.findFirst({
        where: { tipoTramite },
      })

      if (!tramiteConfig) {
        console.warn(`⚠️ Tipo de trámite "${tipoTramite}" no encontrado`)
        continue
      }

      // Eliminar tasas existentes para este trámite
      await db.tasaConfiguracion.deleteMany({
        where: { tramiteConfigId: tramiteConfig.id },
      })

      // Crear nuevas tasas
      for (const tasa of tasasArray) {
        await db.tasaConfiguracion.create({
          data: {
            tramiteConfigId: tramiteConfig.id,
            nombre: tasa.nombre,
            importe: tasa.importe,
          },
        })
      }
    }

    return NextResponse.json({
      message: 'Configuración de tasas guardada correctamente',
      success: true,
    })
  } catch (error) {
    console.error('Error guardando configuración de tasas:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error al guardar configuración' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const tramitesConfig = await db.tramiteConfiguracion.findMany({
      include: {
        tasasConfiguracion: true,
      },
    })

    const tasasConfig: Record<string, Array<{ nombre: string; importe: number }>> = {}
    for (const tramite of tramitesConfig) {
      tasasConfig[tramite.tipoTramite] = tramite.tasasConfiguracion.map(t => ({
        nombre: t.nombre,
        importe: t.importe,
      }))
    }

    return NextResponse.json({ tasasConfig })
  } catch (error) {
    console.error('Error leyendo configuración de tasas:', error)
    return NextResponse.json({ tasasConfig: {} })
  }
}
