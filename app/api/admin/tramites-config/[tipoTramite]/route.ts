import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ tipoTramite: string }> }
) {
  try {
    const { tipoTramite } = await params
    const { nombre, descripcion, categoria, plantillasDisponibles, camposRequeridos } = await req.json()

    const config = await db.tramiteConfiguracion.update({
      where: { tipoTramite },
      data: {
        ...(nombre && { nombre }),
        ...(descripcion !== undefined && { descripcion }),
        ...(categoria !== undefined && { categoria }),
        ...(plantillasDisponibles !== undefined && {
          plantillasDisponibles: JSON.stringify(plantillasDisponibles),
        }),
        ...(camposRequeridos !== undefined && {
          camposRequeridos: JSON.stringify(camposRequeridos),
        }),
      },
    })

    return NextResponse.json({
      message: 'Configuración de trámite actualizada correctamente',
      success: true,
      config,
    })
  } catch (error) {
    console.error('Error actualizando configuración de trámite:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error al actualizar configuración' },
      { status: 500 }
    )
  }
}
