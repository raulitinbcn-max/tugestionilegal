import 
export const dynamic = 'force-dynamic'
{ db } from '@/lib/db'
import 
export const dynamic = 'force-dynamic'
{ NextRequest, NextResponse } from 'next/server'
import 
export const dynamic = 'force-dynamic'
{ getServerSession } from 'next-auth'
import 
export const dynamic = 'force-dynamic'
{ authOptions } from '@/lib/auth'
import 
export const dynamic = 'force-dynamic'
{ google } from 'googleapis'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) 
export const dynamic = 'force-dynamic'
{
  try 
export const dynamic = 'force-dynamic'
{
    const session = await getServerSession(authOptions)
export const dynamic = 'force-dynamic'

    if (!session?.accessToken) 
export const dynamic = 'force-dynamic'
{
      return NextResponse.json(
export const dynamic = 'force-dynamic'

        
export const dynamic = 'force-dynamic'
{ error: 'No autenticado o sin acceso a Google Drive' },
        
export const dynamic = 'force-dynamic'
{ status: 401 }
      )
export const dynamic = 'force-dynamic'

    }
export const dynamic = 'force-dynamic'


export const dynamic = 'force-dynamic'

    const oauth2Client = new google.auth.OAuth2(
export const dynamic = 'force-dynamic'

      process.env.GOOGLE_CLIENT_ID,
export const dynamic = 'force-dynamic'

      process.env.GOOGLE_CLIENT_SECRET,
export const dynamic = 'force-dynamic'

      process.env.NEXTAUTH_URL + '/api/auth/callback/google'
export const dynamic = 'force-dynamic'

    )
export const dynamic = 'force-dynamic'

    oauth2Client.setCredentials(
export const dynamic = 'force-dynamic'
{ access_token: session.accessToken })

export const dynamic = 'force-dynamic'

    const drive = google.drive(
export const dynamic = 'force-dynamic'
{ version: 'v3', auth: oauth2Client })

export const dynamic = 'force-dynamic'

    // Crear backup completo
export const dynamic = 'force-dynamic'

    const backup = 
export const dynamic = 'force-dynamic'
{
      timestamp: new Date().toISOString(),
export const dynamic = 'force-dynamic'

      version: '1.0',
export const dynamic = 'force-dynamic'

      usuario: session.user?.email,
export const dynamic = 'force-dynamic'

      categorias: await db.categoriasTramite.findMany(),
export const dynamic = 'force-dynamic'

      tramites: await db.tramiteConfiguracion.findMany(),
export const dynamic = 'force-dynamic'

      tiposDocumento: await db.tipoDocumento.findMany(),
export const dynamic = 'force-dynamic'

      checkDocumentos: await db.checkDocumento.findMany(
export const dynamic = 'force-dynamic'
{
        include: 
export const dynamic = 'force-dynamic'
{ tramiteConfig: true },
      }),
export const dynamic = 'force-dynamic'

      plantillas: await db.plantilla.findMany(),
export const dynamic = 'force-dynamic'

      tasas: await db.tasaConfiguracion.findMany(),
export const dynamic = 'force-dynamic'

      clientes: await db.cliente.findMany(
export const dynamic = 'force-dynamic'
{
        include: 
export const dynamic = 'force-dynamic'
{
          tramites: 
export const dynamic = 'force-dynamic'
{
            include: 
export const dynamic = 'force-dynamic'
{
              documentos: true,
export const dynamic = 'force-dynamic'

              documentosGenerados: true,
export const dynamic = 'force-dynamic'

              historialEstados: true,
export const dynamic = 'force-dynamic'

              tasas: true,
export const dynamic = 'force-dynamic'

              vencimientos: true,
export const dynamic = 'force-dynamic'

              checklistItems: true,
export const dynamic = 'force-dynamic'

            },
export const dynamic = 'force-dynamic'

          },
export const dynamic = 'force-dynamic'

        },
export const dynamic = 'force-dynamic'

      }),
export const dynamic = 'force-dynamic'

    }
export const dynamic = 'force-dynamic'


export const dynamic = 'force-dynamic'

    const backupJson = JSON.stringify(backup, null, 2)
export const dynamic = 'force-dynamic'

    const today = new Date().toISOString().split('T')[0]
export const dynamic = 'force-dynamic'

    const backupFileName = `sistema-backup-$
export const dynamic = 'force-dynamic'
{today}.json`
    const backupsFolderId = process.env.DRIVE_FOLDER_BACKUPS_ID
export const dynamic = 'force-dynamic'


export const dynamic = 'force-dynamic'

    if (!backupsFolderId) 
export const dynamic = 'force-dynamic'
{
      return NextResponse.json(
export const dynamic = 'force-dynamic'

        
export const dynamic = 'force-dynamic'
{ error: 'DRIVE_FOLDER_BACKUPS_ID no configurado' },
        
export const dynamic = 'force-dynamic'
{ status: 500 }
      )
export const dynamic = 'force-dynamic'

    }
export const dynamic = 'force-dynamic'


export const dynamic = 'force-dynamic'

    // Verificar si ya existe backup de hoy
export const dynamic = 'force-dynamic'

    const existingFiles = await drive.files.list(
export const dynamic = 'force-dynamic'
{
      q: `'$
export const dynamic = 'force-dynamic'
{backupsFolderId}' in parents and name = '${backupFileName}' and trashed = false`,
      spaces: 'drive',
export const dynamic = 'force-dynamic'

      fields: 'files(id)',
export const dynamic = 'force-dynamic'

      supportsAllDrives: true,
export const dynamic = 'force-dynamic'

    })
export const dynamic = 'force-dynamic'


export const dynamic = 'force-dynamic'

    let fileId
export const dynamic = 'force-dynamic'

    if (existingFiles.data.files && existingFiles.data.files.length > 0) 
export const dynamic = 'force-dynamic'
{
      // Actualizar
export const dynamic = 'force-dynamic'

      fileId = existingFiles.data.files[0].id!
export const dynamic = 'force-dynamic'

      await drive.files.update(
export const dynamic = 'force-dynamic'
{
        fileId,
export const dynamic = 'force-dynamic'

        media: 
export const dynamic = 'force-dynamic'
{
          mimeType: 'application/json',
export const dynamic = 'force-dynamic'

          body: backupJson,
export const dynamic = 'force-dynamic'

        },
export const dynamic = 'force-dynamic'

        supportsAllDrives: true,
export const dynamic = 'force-dynamic'

      })
export const dynamic = 'force-dynamic'

    } else 
export const dynamic = 'force-dynamic'
{
      // Crear nuevo
export const dynamic = 'force-dynamic'

      const response = await drive.files.create(
export const dynamic = 'force-dynamic'
{
        requestBody: 
export const dynamic = 'force-dynamic'
{
          name: backupFileName,
export const dynamic = 'force-dynamic'

          parents: [backupsFolderId],
export const dynamic = 'force-dynamic'

          mimeType: 'application/json',
export const dynamic = 'force-dynamic'

          description: `Backup automÃ¡tico del sistema - $
export const dynamic = 'force-dynamic'
{new Date().toLocaleString('es-ES')}`,
        },
export const dynamic = 'force-dynamic'

        media: 
export const dynamic = 'force-dynamic'
{
          mimeType: 'application/json',
export const dynamic = 'force-dynamic'

          body: backupJson,
export const dynamic = 'force-dynamic'

        },
export const dynamic = 'force-dynamic'

        supportsAllDrives: true,
export const dynamic = 'force-dynamic'

        fields: 'id',
export const dynamic = 'force-dynamic'

      })
export const dynamic = 'force-dynamic'

      fileId = response.data.id
export const dynamic = 'force-dynamic'

    }
export const dynamic = 'force-dynamic'


export const dynamic = 'force-dynamic'

    // Limpiar backups antiguos (mantener Ãºltimos 10)
export const dynamic = 'force-dynamic'

    const allBackups = await drive.files.list(
export const dynamic = 'force-dynamic'
{
      q: `'$
export const dynamic = 'force-dynamic'
{backupsFolderId}' in parents and name contains 'sistema-backup-' and trashed = false`,
      spaces: 'drive',
export const dynamic = 'force-dynamic'

      fields: 'files(id, name, createdTime)',
export const dynamic = 'force-dynamic'

      orderBy: 'createdTime desc',
export const dynamic = 'force-dynamic'

      pageSize: 100,
export const dynamic = 'force-dynamic'

      supportsAllDrives: true,
export const dynamic = 'force-dynamic'

    })
export const dynamic = 'force-dynamic'


export const dynamic = 'force-dynamic'

    const backupFiles = allBackups.data.files || []
export const dynamic = 'force-dynamic'

    if (backupFiles.length > 10) 
export const dynamic = 'force-dynamic'
{
      const filesToDelete = backupFiles.slice(10)
export const dynamic = 'force-dynamic'

      for (const file of filesToDelete) 
export const dynamic = 'force-dynamic'
{
        await drive.files.delete(
export const dynamic = 'force-dynamic'
{
          fileId: file.id!,
export const dynamic = 'force-dynamic'

          supportsAllDrives: true,
export const dynamic = 'force-dynamic'

        })
export const dynamic = 'force-dynamic'

      }
export const dynamic = 'force-dynamic'

    }
export const dynamic = 'force-dynamic'


export const dynamic = 'force-dynamic'

    return NextResponse.json(
export const dynamic = 'force-dynamic'
{
      success: true,
export const dynamic = 'force-dynamic'

      message: 'Backup completado',
export const dynamic = 'force-dynamic'

      fileName: backupFileName,
export const dynamic = 'force-dynamic'

      timestamp: backup.timestamp,
export const dynamic = 'force-dynamic'

      backupsRemaining: Math.min(backupFiles.length + 1, 10),
export const dynamic = 'force-dynamic'

    })
export const dynamic = 'force-dynamic'

  } catch (error) 
export const dynamic = 'force-dynamic'
{
    console.error('Error en backup OAuth:', error)
export const dynamic = 'force-dynamic'

    return NextResponse.json(
export const dynamic = 'force-dynamic'

      
export const dynamic = 'force-dynamic'
{ error: 'Error al crear backup', details: String(error) },
      
export const dynamic = 'force-dynamic'
{ status: 500 }
    )
export const dynamic = 'force-dynamic'

  }
export const dynamic = 'force-dynamic'

}
export const dynamic = 'force-dynamic'

