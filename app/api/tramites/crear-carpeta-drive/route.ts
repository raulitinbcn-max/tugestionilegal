import { db } from '@/lib/db'
import { createFolderWithSession } from '@/lib/drive'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    // Verificar sesión del usuario
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json(
        { message: 'Usuario no autenticado' },
        { status: 401 }
      )
    }

    const { tramiteId } = await req.json()

    if (!tramiteId) {
      return NextResponse.json(
        { message: 'tramiteId es requerido' },
        { status: 400 }
      )
    }

    // Obtener trámite
    const tramite = await db.tramite.findUnique({
      where: { id: tramiteId },
      include: { cliente: true },
    })

    if (!tramite) {
      return NextResponse.json(
        { message: 'Trámite no encontrado' },
        { status: 404 }
      )
    }

    // Si ya tiene carpeta, no hacer nada
    if (tramite.driveFolderId && !tramite.driveFolderPendiente) {
      return NextResponse.json({
        message: 'El trámite ya tiene carpeta en Drive',
        success: true,
        driveFolderId: tramite.driveFolderId,
      })
    }

    // Crear carpeta
    const clientesFolderId = process.env.DRIVE_FOLDER_CLIENTES_ID
    if (!clientesFolderId) {
      return NextResponse.json(
        { message: 'DRIVE_FOLDER_CLIENTES_ID not configured' },
        { status: 500 }
      )
    }

    const folderName = `${tramite.codigo}_${tramite.cliente.nombreCompleto.replace(/\s+/g, '_')}`
    const driveFolderId = await createFolderWithSession(folderName, clientesFolderId, session)

    // Actualizar trámite
    await db.tramite.update({
      where: { id: tramiteId },
      data: {
        driveFolderId,
        driveFolderPendiente: false,
      },
    })

    return NextResponse.json({
      message: 'Carpeta en Drive creada correctamente',
      success: true,
      driveFolderId,
    })
  } catch (error) {
    console.error('Error creating Drive folder:', error)
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : 'Error al crear carpeta en Drive',
        error: true
      },
      { status: 500 }
    )
  }
}
