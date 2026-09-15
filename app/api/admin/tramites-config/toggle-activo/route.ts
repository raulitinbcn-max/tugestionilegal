import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function PATCH(req: NextRequest) {
  try {
    const { tipoTramite, activo } = await req.json()

    if (!tipoTramite || activo === undefined) {
      return NextResponse.json(
        { error: 'tipoTramite y activo son requeridos' },
        { status: 400 }
      )
    }

    await db.tramiteConfiguracion.update({
      where: { tipoTramite },
      data: { activo },
    })

    return NextResponse.json({
      message: 'Estado de trámite actualizado correctamente',
      success: true,
    })
  } catch (error) {
    console.error('Error actualizando estado de trámite:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error al actualizar estado de trámite' },
      { status: 500 }
    )
  }
}
