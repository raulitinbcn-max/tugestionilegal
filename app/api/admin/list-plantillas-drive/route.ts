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
      return NextResponse.json({
        plantillas: [],
        message: 'DRIVE_FOLDER_PLANTILLAS_ID no configurado'
      })
    }

    // Listar archivos de Google Docs en la carpeta de plantillas
    const files = await listFiles(plantillasFolderId, "mimeType = 'application/vnd.google-apps.document'")

    const plantillas = files.map((file: any) => ({
      id: file.id,
      nombre: file.name,
      driveFileId: file.id,
    }))

    return NextResponse.json({
      plantillas,
      count: plantillas.length
    })
  } catch (error: any) {
    console.error('Error fetching plantillas from drive:', error)
    return NextResponse.json({
      error: error?.message || 'Error interno',
      plantillas: []
    }, { status: 500 })
  }
}
