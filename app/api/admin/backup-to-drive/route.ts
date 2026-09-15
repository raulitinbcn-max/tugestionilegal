import 
export const dynamic = 'force-dynamic'
{ db } from '@/lib/db'
import 
export const dynamic = 'force-dynamic'
{ NextRequest, NextResponse } from 'next/server'
import 
export const dynamic = 'force-dynamic'
{ getServerSession } from 'next-auth/next'
import 
export const dynamic = 'force-dynamic'
{ authOptions } from '@/lib/auth'
import 
export const dynamic = 'force-dynamic'
{ uploadBackupToDriver } from '@/lib/drive'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) 
export const dynamic = 'force-dynamic'
{
  try 
export const dynamic = 'force-dynamic'
{
    const session = await getServerSession(authOptions)
export const dynamic = 'force-dynamic'

    if (!session) 
export const dynamic = 'force-dynamic'
{
      return NextResponse.json(
export const dynamic = 'force-dynamic'
{ error: 'Unauthorized' }, { status: 401 })
    }
export const dynamic = 'force-dynamic'


export const dynamic = 'force-dynamic'

    const 
export const dynamic = 'force-dynamic'
{ driveFolderId } = await req.json()

export const dynamic = 'force-dynamic'

    if (!driveFolderId) 
export const dynamic = 'force-dynamic'
{
      return NextResponse.json(
export const dynamic = 'force-dynamic'

        
export const dynamic = 'force-dynamic'
{ error: 'driveFolderId requerido' },
        
export const dynamic = 'force-dynamic'
{ status: 400 }
      )
export const dynamic = 'force-dynamic'

    }
export const dynamic = 'force-dynamic'


export const dynamic = 'force-dynamic'

    // Crear backup en memoria
export const dynamic = 'force-dynamic'

    const backup = 
export const dynamic = 'force-dynamic'
{
      timestamp: new Date().toISOString(),
export const dynamic = 'force-dynamic'

      categorias: await db.categoriasTramite.findMany(),
export const dynamic = 'force-dynamic'

      tramites: await db.tramiteConfiguracion.findMany(),
export const dynamic = 'force-dynamic'

      tiposDocumento: await db.tipoDocumento.findMany(),
export const dynamic = 'force-dynamic'

      checkDocumentos: await db.checkDocumento.findMany(),
export const dynamic = 'force-dynamic'

      plantillas: await db.plantilla.findMany(),
export const dynamic = 'force-dynamic'

      tasas: await db.tasaConfiguracion.findMany(),
export const dynamic = 'force-dynamic'

      documentosGenerados: await db.documentoGenerado.findMany(),
export const dynamic = 'force-dynamic'

    }
export const dynamic = 'force-dynamic'


export const dynamic = 'force-dynamic'

    const backupJson = JSON.stringify(backup, null, 2)
export const dynamic = 'force-dynamic'

    const today = new Date().toISOString().split('T')[0]
export const dynamic = 'force-dynamic'

    const backupFileName = `config-backup-$
export const dynamic = 'force-dynamic'
{today}.json`

export const dynamic = 'force-dynamic'

    // Subir a Drive
export const dynamic = 'force-dynamic'

    const fileId = await uploadBackupToDriver(
export const dynamic = 'force-dynamic'

      driveFolderId,
export const dynamic = 'force-dynamic'

      backupFileName,
export const dynamic = 'force-dynamic'

      backupJson
export const dynamic = 'force-dynamic'

    )
export const dynamic = 'force-dynamic'


export const dynamic = 'force-dynamic'

    return NextResponse.json(
export const dynamic = 'force-dynamic'
{
      message: 'Backup subido a Google Drive exitosamente',
export const dynamic = 'force-dynamic'

      success: true,
export const dynamic = 'force-dynamic'

      fileId,
export const dynamic = 'force-dynamic'

      fileName: backupFileName,
export const dynamic = 'force-dynamic'

      timestamp: backup.timestamp,
export const dynamic = 'force-dynamic'

      summary: 
export const dynamic = 'force-dynamic'
{
        categorias: backup.categorias.length,
export const dynamic = 'force-dynamic'

        tramites: backup.tramites.length,
export const dynamic = 'force-dynamic'

        tiposDocumento: backup.tiposDocumento.length,
export const dynamic = 'force-dynamic'

        checkDocumentos: backup.checkDocumentos.length,
export const dynamic = 'force-dynamic'

        plantillas: backup.plantillas.length,
export const dynamic = 'force-dynamic'

        tasas: backup.tasas.length,
export const dynamic = 'force-dynamic'

      },
export const dynamic = 'force-dynamic'

    })
export const dynamic = 'force-dynamic'

  } catch (error) 
export const dynamic = 'force-dynamic'
{
    console.error('Error subiendo backup a Drive:', error)
export const dynamic = 'force-dynamic'

    return NextResponse.json(
export const dynamic = 'force-dynamic'

      
export const dynamic = 'force-dynamic'
{ error: error instanceof Error ? error.message : 'Error al subir backup' },
      
export const dynamic = 'force-dynamic'
{ status: 500 }
    )
export const dynamic = 'force-dynamic'

  }
export const dynamic = 'force-dynamic'

}
export const dynamic = 'force-dynamic'


export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) 
export const dynamic = 'force-dynamic'
{
  try 
export const dynamic = 'force-dynamic'
{
    const session = await getServerSession(authOptions)
export const dynamic = 'force-dynamic'

    if (!session) 
export const dynamic = 'force-dynamic'
{
      return NextResponse.json(
export const dynamic = 'force-dynamic'
{ error: 'Unauthorized' }, { status: 401 })
    }
export const dynamic = 'force-dynamic'


export const dynamic = 'force-dynamic'

    return NextResponse.json(
export const dynamic = 'force-dynamic'
{
      message: 'Para subir backup a Drive, usa POST con driveFolderId',
export const dynamic = 'force-dynamic'

      example: 
export const dynamic = 'force-dynamic'
{
        method: 'POST',
export const dynamic = 'force-dynamic'

        body: 
export const dynamic = 'force-dynamic'
{
          driveFolderId: 'ID-DE-TU-CARPETA-EN-DRIVE',
export const dynamic = 'force-dynamic'

        },
export const dynamic = 'force-dynamic'

      },
export const dynamic = 'force-dynamic'

    })
export const dynamic = 'force-dynamic'

  } catch (error) 
export const dynamic = 'force-dynamic'
{
    return NextResponse.json(
export const dynamic = 'force-dynamic'

      
export const dynamic = 'force-dynamic'
{ error: 'Error' },
      
export const dynamic = 'force-dynamic'
{ status: 500 }
    )
export const dynamic = 'force-dynamic'

  }
export const dynamic = 'force-dynamic'

}
export const dynamic = 'force-dynamic'

