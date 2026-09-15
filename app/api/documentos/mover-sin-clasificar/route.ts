import { moveFile, getFileMetadata } from '@/lib/drive'
import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { documentoIds } = await req.json() as { documentoIds: string[] }

    if (!Array.isArray(documentoIds) || documentoIds.length === 0) {
      return NextResponse.json(
        { error: 'DocumentoIds requeridos' },
        { status: 400 }
      )
    }

    const entradaFolderId = process.env.DRIVE_FOLDER_ENTRADA_ID
    const sinClasificarFolderId = process.env.DRIVE_FOLDER_SIN_CLASIFICAR_ID

    if (!entradaFolderId || !sinClasificarFolderId) {
      return NextResponse.json(
        { error: 'Carpetas de Drive no configuradas' },
        { status: 500 }
      )
    }

    let movidos = 0
    const errores: string[] = []

    for (const documentoId of documentoIds) {
      try {
        // Mover archivo en Drive de entrada a sin_clasificar
        await moveFile(documentoId, sinClasificarFolderId, entradaFolderId)

        // Obtener metadata del archivo
        const fileMetadata = await getFileMetadata(documentoId)

        // Buscar documento existente por driveFileId
        const existingDoc = await db.documento.findFirst({
          where: { driveFileId: documentoId },
        })

        // Nota: tramiteId no es nullable, así que solo movemos en Drive
        // Los documentos sin clasificar se verán reflejados en la carpeta sin clasificar

        movidos++
      } catch (error) {
        errores.push(`Error moviendo ${documentoId}: ${error instanceof Error ? error.message : 'desconocido'}`)
      }
    }

    return NextResponse.json({
      success: true,
      movidos,
      total: documentoIds.length,
      errores: errores.length > 0 ? errores : undefined,
    })
  } catch (error) {
    console.error('Error moviendo a sin clasificar:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error al mover documentos' },
      { status: 500 }
    )
  }
}
