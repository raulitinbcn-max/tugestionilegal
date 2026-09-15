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
{ error: 'Unauthorized' }, { status: 401 })
    }
export const dynamic = 'force-dynamic'


export const dynamic = 'force-dynamic'

    // Crear cliente de Drive con token del usuario
export const dynamic = 'force-dynamic'

    const oauth2Client = new google.auth.OAuth2()
export const dynamic = 'force-dynamic'

    oauth2Client.setCredentials(
export const dynamic = 'force-dynamic'
{
      access_token: session.accessToken,
export const dynamic = 'force-dynamic'

    })
export const dynamic = 'force-dynamic'

    const drive = google.drive(
export const dynamic = 'force-dynamic'
{ version: 'v3', auth: oauth2Client })

export const dynamic = 'force-dynamic'

    console.log('ðŸ”„ Iniciando backup de trÃ¡mites en Drive...')
export const dynamic = 'force-dynamic'


export const dynamic = 'force-dynamic'

    // Obtener todos los trÃ¡mites con sus datos
export const dynamic = 'force-dynamic'

    const tramites = await db.tramite.findMany(
export const dynamic = 'force-dynamic'
{
      include: 
export const dynamic = 'force-dynamic'
{
        cliente: true,
export const dynamic = 'force-dynamic'

        tramiteConfig: true,
export const dynamic = 'force-dynamic'

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

        checklistItems: 
export const dynamic = 'force-dynamic'
{
          include: 
export const dynamic = 'force-dynamic'
{
            documento: true,
export const dynamic = 'force-dynamic'

          },
export const dynamic = 'force-dynamic'

        },
export const dynamic = 'force-dynamic'

      },
export const dynamic = 'force-dynamic'

    })
export const dynamic = 'force-dynamic'


export const dynamic = 'force-dynamic'

    let tramitesBackup = 0
export const dynamic = 'force-dynamic'

    const today = new Date().toISOString().split('T')[0]
export const dynamic = 'force-dynamic'


export const dynamic = 'force-dynamic'

    for (const tramite of tramites) 
export const dynamic = 'force-dynamic'
{
      if (!tramite.driveFolderId) 
export const dynamic = 'force-dynamic'
{
        console.log(`âš ï¸ $
export const dynamic = 'force-dynamic'
{tramite.codigo}: No tiene carpeta en Drive`)
        continue
export const dynamic = 'force-dynamic'

      }
export const dynamic = 'force-dynamic'


export const dynamic = 'force-dynamic'

      try 
export const dynamic = 'force-dynamic'
{
        const backupTramite = 
export const dynamic = 'force-dynamic'
{
          timestamp: new Date().toISOString(),
export const dynamic = 'force-dynamic'

          tramite: 
export const dynamic = 'force-dynamic'
{
            id: tramite.id,
export const dynamic = 'force-dynamic'

            codigo: tramite.codigo,
export const dynamic = 'force-dynamic'

            tipoTramite: tramite.tramiteConfig?.tipoTramite || 'Desconocido',
export const dynamic = 'force-dynamic'

            estado: tramite.estado,
export const dynamic = 'force-dynamic'

            honorarios: tramite.honorarios,
export const dynamic = 'force-dynamic'

            formaPago: tramite.formaPago,
export const dynamic = 'force-dynamic'

            suplidos: tramite.suplidos,
export const dynamic = 'force-dynamic'

            planoPago: tramite.planoPago,
export const dynamic = 'force-dynamic'

            notas: tramite.notas,
export const dynamic = 'force-dynamic'

          },
export const dynamic = 'force-dynamic'

          cliente: 
export const dynamic = 'force-dynamic'
{
            id: tramite.cliente.id,
export const dynamic = 'force-dynamic'

            nombreCompleto: tramite.cliente.nombreCompleto,
export const dynamic = 'force-dynamic'

            email: tramite.cliente.email,
export const dynamic = 'force-dynamic'

            telefono: tramite.cliente.telefono,
export const dynamic = 'force-dynamic'

            nacionalidad: tramite.cliente.nacionalidad,
export const dynamic = 'force-dynamic'

            direccion: tramite.cliente.direccion,
export const dynamic = 'force-dynamic'

            profesion: tramite.cliente.profesion,
export const dynamic = 'force-dynamic'

          },
export const dynamic = 'force-dynamic'

          documentos: tramite.documentos,
export const dynamic = 'force-dynamic'

          vencimientos: tramite.vencimientos,
export const dynamic = 'force-dynamic'

          tasas: tramite.tasas,
export const dynamic = 'force-dynamic'

          checklistItems: tramite.checklistItems,
export const dynamic = 'force-dynamic'

          historialEstados: tramite.historialEstados,
export const dynamic = 'force-dynamic'

        }
export const dynamic = 'force-dynamic'


export const dynamic = 'force-dynamic'

        const backupJson = JSON.stringify(backupTramite, null, 2)
export const dynamic = 'force-dynamic'

        const backupFileName = `backup-tramite-$
export const dynamic = 'force-dynamic'
{tramite.codigo}-${today}.json`

export const dynamic = 'force-dynamic'

        // Verificar si ya existe el archivo
export const dynamic = 'force-dynamic'

        const existingFiles = await drive.files.list(
export const dynamic = 'force-dynamic'
{
          q: `name = '$
export const dynamic = 'force-dynamic'
{backupFileName}' and '${tramite.driveFolderId}' in parents and trashed = false`,
          spaces: 'drive',
export const dynamic = 'force-dynamic'

          fields: 'files(id)',
export const dynamic = 'force-dynamic'

          supportsAllDrives: true,
export const dynamic = 'force-dynamic'

        })
export const dynamic = 'force-dynamic'


export const dynamic = 'force-dynamic'

        if (existingFiles.data.files && existingFiles.data.files.length > 0) 
export const dynamic = 'force-dynamic'
{
          // Actualizar archivo existente
export const dynamic = 'force-dynamic'

          const fileId = existingFiles.data.files[0].id
export const dynamic = 'force-dynamic'

          if (fileId) 
export const dynamic = 'force-dynamic'
{
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

            console.log(`âœ… $
export const dynamic = 'force-dynamic'
{tramite.codigo}: Backup actualizado`)
          }
export const dynamic = 'force-dynamic'

        } else 
export const dynamic = 'force-dynamic'
{
          // Crear archivo nuevo
export const dynamic = 'force-dynamic'

          await drive.files.create(
export const dynamic = 'force-dynamic'
{
            requestBody: 
export const dynamic = 'force-dynamic'
{
              name: backupFileName,
export const dynamic = 'force-dynamic'

              parents: [tramite.driveFolderId],
export const dynamic = 'force-dynamic'

              mimeType: 'application/json',
export const dynamic = 'force-dynamic'

              description: `Backup completo del trÃ¡mite $
export const dynamic = 'force-dynamic'
{tramite.codigo} - ${tramite.cliente.nombreCompleto}`,
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

          console.log(`âœ… $
export const dynamic = 'force-dynamic'
{tramite.codigo}: Backup creado`)
        }
export const dynamic = 'force-dynamic'


export const dynamic = 'force-dynamic'

        tramitesBackup++
export const dynamic = 'force-dynamic'

      } catch (error) 
export const dynamic = 'force-dynamic'
{
        console.error(`âš ï¸ Error en backup de $
export const dynamic = 'force-dynamic'
{tramite.codigo}:`, error)
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

      message: 'Backup de trÃ¡mites completado',
export const dynamic = 'force-dynamic'

      tramitesBackup,
export const dynamic = 'force-dynamic'

      timestamp: new Date().toISOString(),
export const dynamic = 'force-dynamic'

      details: `Se guardÃ³ un JSON por cada trÃ¡mite en su carpeta de Drive con: honorarios, vencimientos, notas, checklist, historial de estados, etc.`,
export const dynamic = 'force-dynamic'

    })
export const dynamic = 'force-dynamic'

  } catch (error) 
export const dynamic = 'force-dynamic'
{
    console.error('Error en backup de trÃ¡mites:', error)
export const dynamic = 'force-dynamic'

    return NextResponse.json(
export const dynamic = 'force-dynamic'

      
export const dynamic = 'force-dynamic'
{ error: error instanceof Error ? error.message : 'Error en backup' },
      
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
      message: 'Para hacer backup de trÃ¡mites, usa POST',
export const dynamic = 'force-dynamic'

      usage: 'POST /api/admin/backup-tramites',
export const dynamic = 'force-dynamic'

      description: 'Crea un JSON con datos completos de cada trÃ¡mite en su carpeta de Drive',
export const dynamic = 'force-dynamic'

      contenido: 
export const dynamic = 'force-dynamic'
{
        tramite: 'cÃ³digo, tipo, estado, honorarios, forma de pago, suplidos, etc.',
export const dynamic = 'force-dynamic'

        cliente: 'nombre, email, telÃ©fono, nacionalidad, direcciÃ³n, profesiÃ³n',
export const dynamic = 'force-dynamic'

        documentos: 'lista de documentos',
export const dynamic = 'force-dynamic'

        vencimientos: 'lista de vencimientos',
export const dynamic = 'force-dynamic'

        tasas: 'lista de tasas',
export const dynamic = 'force-dynamic'

        checklist: 'items del checklist',
export const dynamic = 'force-dynamic'

        historial: 'historial de cambios de estado',
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
{ error: 'Error' }, { status: 500 })
  }
export const dynamic = 'force-dynamic'

}
export const dynamic = 'force-dynamic'

