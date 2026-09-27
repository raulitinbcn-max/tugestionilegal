import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { listFiles } from '@/lib/drive'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const sessionAny = session as any

    if (!session) {
      return NextResponse.json({ error: 'No autorizado', status: 401 })
    }

    if (!sessionAny.accessToken) {
      return NextResponse.json({
        error: 'No hay accessToken en la sesión',
        session: {
          user: sessionAny.user?.email,
          keys: Object.keys(sessionAny || {})
        }
      })
    }

    const plantillasFolderId = process.env.DRIVE_FOLDER_PLANTILLAS_ID
    if (!plantillasFolderId) {
      return NextResponse.json({ error: 'DRIVE_FOLDER_PLANTILLAS_ID no configurado' })
    }

    console.log('[DEBUG] Listando TODOS los archivos en carpeta:', plantillasFolderId)

    // Listar todos los archivos sin filtro
    const allFiles = await listFiles(plantillasFolderId)

    console.log('[DEBUG] Total de archivos encontrados:', allFiles.length)
    allFiles.forEach((f: any) => {
      console.log(`[DEBUG] - ${f.name} (${f.mimeType}) - ID: ${f.id}`)
    })

    return NextResponse.json({
      success: true,
      folderId: plantillasFolderId,
      totalFiles: allFiles.length,
      files: allFiles.map((f: any) => ({
        id: f.id,
        name: f.name,
        mimeType: f.mimeType,
        createdTime: f.createdTime,
        modifiedTime: f.modifiedTime
      })),
      user: sessionAny.user?.email,
      hasAccessToken: !!sessionAny.accessToken
    })
  } catch (error: any) {
    console.error('[DEBUG] Error:', error?.message || error)
    return NextResponse.json({
      error: error?.message || 'Error',
      details: error?.toString?.(),
      stack: error?.stack
    }, { status: 500 })
  }
}
