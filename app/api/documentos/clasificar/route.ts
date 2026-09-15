import { db } from '@/lib/db'
import { moveFile, getFileMetadata } from '@/lib/drive'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { documentoId, tramiteId } = body

    if (!documentoId || !tramiteId) {
      return NextResponse.json(
        { message: 'documentoId y tramiteId son requeridos' },
        { status: 400 }
      )
    }

    // Obtener trámite para saber su carpeta en Drive
    const tramite = await db.tramite.findUnique({
      where: { id: tramiteId },
    })

    if (!tramite || !tramite.driveFolderId) {
      return NextResponse.json(
        { message: 'Trámite no encontrado o sin carpeta en Drive' },
        { status: 404 }
      )
    }

    // Mover archivo en Drive de sin_clasificar a carpeta del trámite
    const sinClasificarFolderId = process.env.DRIVE_FOLDER_SIN_CLASIFICAR_ID

    if (sinClasificarFolderId) {
      await moveFile(documentoId, tramite.driveFolderId, sinClasificarFolderId)
    }

    // Obtener metadata del archivo para guardar en BD
    const fileMetadata = await getFileMetadata(documentoId)

    // Buscar documento existente por driveFileId
    const existingDoc = await db.documento.findFirst({
      where: { driveFileId: documentoId },
    })

    let documento
    if (existingDoc) {
      // Actualizar si existe
      documento = await db.documento.update({
        where: { id: existingDoc.id },
        data: { tramiteId },
      })
    } else {
      // Crear si no existe
      documento = await db.documento.create({
        data: {
          driveFileId: documentoId,
          nombre: fileMetadata.name || 'documento',
          origen: 'clasificado',
          tramiteId,
        },
      })
    }

    return NextResponse.json(documento)
  } catch (error) {
    console.error('Error classifying documento:', error)
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Error al clasificar documento' },
      { status: 500 }
    )
  }
}
