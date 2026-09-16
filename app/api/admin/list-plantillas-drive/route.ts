import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { listFiles } from '@/lib/drive'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const plantillasFolderId = process.env.DRIVE_FOLDER_PLANTILLAS_ID
    if (!plantillasFolderId) {
      console.warn('DRIVE_FOLDER_PLANTILLAS_ID no configurado')
      return NextResponse.json({
        plantillas: [],
        message: 'DRIVE_FOLDER_PLANTILLAS_ID no configurado en variables de entorno'
      })
    }

    console.log('[PLANTILLAS] Buscando en carpeta:', plantillasFolderId)

    // Listar archivos de Google Docs en la carpeta de plantillas
    const files = await listFiles(plantillasFolderId, "mimeType = 'application/vnd.google-apps.document'")

    console.log('[PLANTILLAS] Encontradas:', files.length, 'documentos')

    const plantillas = files.map((file: any) => ({
      id: file.id,
      nombre: file.name,
      driveFileId: file.id,
    }))

    return NextResponse.json({
      plantillas,
      count: plantillas.length,
      folderId: plantillasFolderId
    })
  } catch (error: any) {
    console.error('[PLANTILLAS] Error:', error?.message || error)
    return NextResponse.json({
      plantillas: [],
      error: error?.message || 'Error al conectar con Google Drive',
      details: error?.message
    }, { status: 200 })
  }
}
