import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { configs } = await req.json()

    if (!configs || typeof configs !== 'object') {
      return NextResponse.json(
        { error: 'Configuración de trámites inválida' },
        { status: 400 }
      )
    }

    // Guardar cada configuración en la base de datos
    for (const [tipoTramite, config] of Object.entries(configs)) {
      const cfg = config as any

      await db.tramiteConfiguracion.upsert({
        where: { tipoTramite },
        update: {
          nombre: cfg.nombre,
          descripcion: cfg.descripcion,
          categoria: cfg.categoria,
          plantillasDisponibles: JSON.stringify(cfg.plantillasDisponibles || []),
          camposRequeridos: JSON.stringify(cfg.camposRequeridos || []),
        },
        create: {
          tipoTramite,
          nombre: cfg.nombre,
          descripcion: cfg.descripcion,
          categoria: cfg.categoria,
          plantillasDisponibles: JSON.stringify(cfg.plantillasDisponibles || []),
          camposRequeridos: JSON.stringify(cfg.camposRequeridos || []),
        },
      })
    }

    return NextResponse.json({
      message: 'Configuración de trámites guardada correctamente',
      success: true,
    })
  } catch (error) {
    console.error('Error guardando configuración de trámites:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error al guardar configuración' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const tramitesConfig = await db.tramiteConfiguracion.findMany()

    const configs: Record<string, any> = {}
    const configIds: Record<string, string> = {}
    for (const tramite of tramitesConfig) {
      configs[tramite.tipoTramite] = {
        nombre: tramite.nombre,
        descripcion: tramite.descripcion || '',
        categoria: tramite.categoria || '',
        plantillasDisponibles: tramite.plantillasDisponibles ? JSON.parse(tramite.plantillasDisponibles) : [],
        camposRequeridos: tramite.camposRequeridos ? JSON.parse(tramite.camposRequeridos) : [],
        activo: tramite.activo !== false,
      }
      configIds[tramite.tipoTramite] = tramite.id
    }

    return NextResponse.json({ configs, configIds })
  } catch (error) {
    console.error('Error leyendo configuración de trámites:', error)
    return NextResponse.json({ configs: {}, configIds: {} })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { oldTipoTramite, newTipoTramite } = await req.json()

    if (!oldTipoTramite || !newTipoTramite) {
      return NextResponse.json(
        { error: 'oldTipoTramite y newTipoTramite son requeridos' },
        { status: 400 }
      )
    }

    // Obtener tramiteConfiguracion existente
    const tramiteConfig = await db.tramiteConfiguracion.findFirst({
      where: { tipoTramite: oldTipoTramite },
    })

    if (!tramiteConfig) {
      return NextResponse.json(
        { error: 'Tipo de trámite no encontrado' },
        { status: 404 }
      )
    }

    // Actualizar el nombre del trámite
    await db.tramiteConfiguracion.update({
      where: { tipoTramite: oldTipoTramite },
      data: { tipoTramite: newTipoTramite },
    })

    return NextResponse.json({
      message: 'Tipo de trámite actualizado correctamente',
      success: true,
    })
  } catch (error) {
    console.error('Error actualizando tipo de trámite:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error al actualizar' },
      { status: 500 }
    )
  }
}
