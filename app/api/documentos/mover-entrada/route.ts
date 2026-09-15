import { db } from '@/lib/db'
import { moveFile, getFileMetadata } from '@/lib/drive'
import { NextRequest, NextResponse } from 'next/server'

interface Movimiento {
  documentoId: string
  tramiteId: string
}

export async function POST(req: NextRequest) {
  try {
    const { movimientos } = await req.json() as { movimientos: Movimiento[] }

    if (!Array.isArray(movimientos) || movimientos.length === 0) {
      return NextResponse.json(
        { error: 'Movimientos requeridos' },
        { status: 400 }
      )
    }

    const entradaFolderId = process.env.DRIVE_FOLDER_ENTRADA_ID

    if (!entradaFolderId) {
      return NextResponse.json(
        { error: 'DRIVE_FOLDER_ENTRADA_ID no configurado' },
        { status: 500 }
      )
    }

    let movidos = 0
    const errores: string[] = []

    for (const { documentoId, tramiteId } of movimientos) {
      try {
        // Obtener trámite con su carpeta en Drive
        const tramite = await db.tramite.findUnique({
          where: { id: tramiteId },
        })

        if (!tramite || !tramite.driveFolderId) {
          errores.push(`Trámite ${tramiteId} no encontrado o sin carpeta`)
          continue
        }

        // Mover archivo en Drive
        await moveFile(documentoId, tramite.driveFolderId, entradaFolderId)

        // Obtener metadata del archivo
        const fileMetadata = await getFileMetadata(documentoId)

        // Buscar documento existente por driveFileId
        const existingDoc = await db.documento.findFirst({
          where: { driveFileId: documentoId },
        })

        if (existingDoc) {
          // Actualizar si existe
          await db.documento.update({
            where: { id: existingDoc.id },
            data: { tramiteId },
          })
        } else {
          // Crear si no existe
          await db.documento.create({
            data: {
              driveFileId: documentoId,
              nombre: fileMetadata.name || 'documento',
              origen: 'manual',
              tramiteId,
            },
          })
        }

        movidos++
      } catch (error) {
        errores.push(`Error moviendo ${documentoId}: ${error instanceof Error ? error.message : 'desconocido'}`)
      }
    }

    return NextResponse.json({
      success: true,
      movidos,
      total: movimientos.length,
      errores: errores.length > 0 ? errores : undefined,
    })
  } catch (error) {
    console.error('Error moviendo documentos:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error al mover documentos' },
      { status: 500 }
    )
  }
}
