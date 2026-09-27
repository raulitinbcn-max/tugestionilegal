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
    console.log('[PLANTILLAS] Sesión:', { user: (session as any).user?.email, hasAccessToken: !!(session as any).accessToken })

    // Listar archivos: Google Docs, PDFs, Word, etc.
    // Accept Google Docs, PDFs, Word documents, and Google Sheets
    const mimeTypes = [
      "'application/vnd.google-apps.document'",
      "'application/pdf'",
      "'application/vnd.openxmlformats-officedocument.wordprocessingml.document'",
      "'application/vnd.google-apps.spreadsheet'"
    ]
    const mimeTypeQuery = mimeTypes.map(m => `mimeType = ${m}`).join(' or ')
    const files = await listFiles(plantillasFolderId, mimeTypeQuery)

    console.log('[PLANTILLAS] Encontradas:', files.length, 'documentos')
    if (files.length === 0) {
      console.log('[PLANTILLAS] Listando TODOS los archivos en la carpeta para debug...')
      const allFiles = await listFiles(plantillasFolderId)
      console.log('[PLANTILLAS] Archivos totales en carpeta:', allFiles.length)
      allFiles.forEach((f: any) => {
        console.log(`[PLANTILLAS] - ${f.name} (${f.mimeType})`)
      })
    }

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
