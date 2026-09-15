import { listFiles } from '@/lib/drive'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    const entradaFolderId = process.env.DRIVE_FOLDER_ENTRADA_ID

    if (!entradaFolderId) {
      return NextResponse.json(
        { error: 'DRIVE_FOLDER_ENTRADA_ID no configurado' },
        { status: 500 }
      )
    }

    // Listar archivos de la carpeta de entrada (solo archivos, no carpetas)
    const files = await listFiles(entradaFolderId, "mimeType != 'application/vnd.google-apps.folder'")

    return NextResponse.json(files)
  } catch (error: any) {
    console.error('Error fetching entrada documentos:', error)

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
