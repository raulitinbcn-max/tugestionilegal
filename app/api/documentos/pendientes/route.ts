import { NextRequest, NextResponse } from 'next/server'
import { listFiles } from '@/lib/drive'

export async function GET(req: NextRequest) {
  try {
    const sinClasificarFolderId = process.env.DRIVE_FOLDER_SIN_CLASIFICAR_ID

    if (!sinClasificarFolderId) {
      return NextResponse.json(
        { error: 'DRIVE_FOLDER_SIN_CLASIFICAR_ID no configurado' },
        { status: 500 }
      )
    }

    // Listar archivos de la carpeta sin clasificar (solo archivos, no carpetas)
    const files = await listFiles(sinClasificarFolderId, "mimeType != 'application/vnd.google-apps.folder'")

    return NextResponse.json(files)
  } catch (error) {
    console.error('Error fetching pending documentos:', error)
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Error al obtener documentos pendientes' },
      { status: 500 }
    )
  }
}
