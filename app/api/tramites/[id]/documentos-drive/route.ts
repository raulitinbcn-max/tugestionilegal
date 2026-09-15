import { db } from '@/lib/db'
import { listFiles } from '@/lib/drive'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const tramite = await db.tramite.findUnique({
      where: { id: params.id },
    })

    if (!tramite) {
      return NextResponse.json(
        { error: 'Trámite no encontrado' },
        { status: 404 }
      )
    }

    if (!tramite.driveFolderId) {
      return NextResponse.json([])
    }

    // Listar archivos de la carpeta del trámite en Drive (solo archivos, no carpetas, sin backups)
    const files = await listFiles(
      tramite.driveFolderId,
      "mimeType != 'application/vnd.google-apps.folder' and not name contains 'backup-' and name != 'sistema-backup'"
    )

    return NextResponse.json(files || [])
  } catch (error: any) {
    console.error('Error fetching documentos de Drive:', error)

    // Detectar errores de autenticación
    if (error?.message?.includes('Invalid Credentials') || error?.message?.includes('invalid_token')) {
      return NextResponse.json(
        { error: 'Invalid Credentials - Por favor, cierra sesión y vuelve a iniciar sesión para renovar la autenticación con Google' },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error al obtener documentos' },
      { status: 500 }
    )
  }
}
