import { google } from 'googleapis'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const PLANTILLAS_FOLDER_ID = process.env.DRIVE_FOLDER_PLANTILLAS_ID || '1_04l-6YfTC3Mb5tV3YNJgW2NBMNHfH0P'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    console.log('Session:', { email: session?.user?.email, hasToken: !!session?.accessToken })

    if (!session?.accessToken) {
      console.error('No session or accessToken available')
      return NextResponse.json(
        { plantillas: [], error: 'No autenticado - necesitas iniciar sesión' },
        { status: 200 }
      )
    }

    const oauth2Client = new google.auth.OAuth2()
    oauth2Client.setCredentials({
      access_token: session.accessToken,
    })

    const drive = google.drive({ version: 'v3', auth: oauth2Client })

    try {
      console.log('Llamando a Drive API con PLANTILLAS_FOLDER_ID:', PLANTILLAS_FOLDER_ID)
      const response = await drive.files.list({
        q: `'${PLANTILLAS_FOLDER_ID}' in parents and trashed=false and mimeType='application/vnd.google-apps.document'`,
        fields: 'files(id, name)',
        pageSize: 100,
      })

      console.log('Respuesta de Drive API:', { filesCount: response.data.files?.length })
      const plantillas = response.data.files?.map((file) => ({
        id: file.id || '',
        nombre: file.name || 'Sin nombre',
        driveFileId: file.id || '',
      })) || []

      return NextResponse.json(plantillas)
    } catch (driveError: any) {
      console.error('Drive API error:', {
        message: driveError.message,
        status: driveError.status,
        code: driveError.code,
      })

      // Si es un error de permiso, retorna lista vacía pero con mensaje
      if (driveError.status === 403 || driveError.message?.includes('permission')) {
        return NextResponse.json(
          { plantillas: [], error: 'Sin permisos para acceder a Google Drive (403)' },
          { status: 200 }
        )
      }

      throw driveError
    }
  } catch (error) {
    console.error('Error listando plantillas:', error instanceof Error ? error.message : error)
    return NextResponse.json(
      {
        plantillas: [],
        error: error instanceof Error ? error.message : 'Error al listar plantillas de Google Drive'
      },
      { status: 200 }
    )
  }
}
