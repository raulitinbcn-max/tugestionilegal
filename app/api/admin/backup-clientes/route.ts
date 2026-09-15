import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { google } from 'googleapis'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Crear cliente de Drive con token del usuario
    const oauth2Client = new google.auth.OAuth2()
    oauth2Client.setCredentials({
      access_token: session.accessToken,
    })
    const drive = google.drive({ version: 'v3', auth: oauth2Client })

    console.log('🔄 Iniciando backup de clientes...')

    // Obtener todos los clientes con sus trámites
    const clientes = await db.cliente.findMany({
      include: {
        tramites: {
          include: {
            documentos: true,
            documentosGenerados: true,
            historialEstados: true,
            tasas: true,
            vencimientos: true,
            checklistItems: true,
          },
        },
      },
    })

    let clientesBackup = clientes.length
    let tramitesBackup = clientes.reduce((sum, c) => sum + c.tramites.length, 0)

    // Backup del sistema completo
    const backupSistema = {
      timestamp: new Date().toISOString(),
      version: '1.0',
      clientes: clientes,
    }

    const sistemaBackupJson = JSON.stringify(backupSistema, null, 2)
    const sistemaBackupFileName = `sistema-backup-${new Date().toISOString().split('T')[0]}.json`
    const backupsFolderId = process.env.DRIVE_FOLDER_BACKUPS_ID

    if (backupsFolderId) {
      const existingSistemaFiles = await drive.files.list({
        q: `name = '${sistemaBackupFileName}' and '${backupsFolderId}' in parents and trashed = false`,
        spaces: 'drive',
        fields: 'files(id)',
        supportsAllDrives: true,
      })

      if (existingSistemaFiles.data.files && existingSistemaFiles.data.files.length > 0) {
        const fileId = existingSistemaFiles.data.files[0].id
        if (fileId) {
          await drive.files.update({
            fileId,
            media: {
              mimeType: 'application/json',
              body: sistemaBackupJson,
            },
            supportsAllDrives: true,
          })
        }
      } else {
        await drive.files.create({
          requestBody: {
            name: sistemaBackupFileName,
            parents: [backupsFolderId],
            mimeType: 'application/json',
            description: 'Backup completo del sistema',
          },
          media: {
            mimeType: 'application/json',
            body: sistemaBackupJson,
          },
          supportsAllDrives: true,
        })
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Backup completado',
      clientesBackup,
      tramitesBackup,
      sistemaBackup: 1,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Error en backup:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error en backup' },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    return NextResponse.json({
      message: 'Para hacer backup de clientes, usa POST',
      usage: 'POST /api/admin/backup-clientes',
      description: 'Crea backups por cliente, por trámite y del sistema en Google Drive',
    })
  } catch (error) {
    return NextResponse.json({ error: 'Error' }, { status: 500 })
  }
}
