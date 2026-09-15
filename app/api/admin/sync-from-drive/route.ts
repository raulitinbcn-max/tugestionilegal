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
{ listFiles } from '@/lib/drive'
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
    // Permitir sincronizaciÃ³n sin autenticaciÃ³n (temporal para recuperar datos)
export const dynamic = 'force-dynamic'

    // const session = await getServerSession(authOptions)
export const dynamic = 'force-dynamic'

    // if (!session) 
export const dynamic = 'force-dynamic'
{
    //   return NextResponse.json(
export const dynamic = 'force-dynamic'
{ error: 'Unauthorized' }, { status: 401 })
    // }
export const dynamic = 'force-dynamic'


export const dynamic = 'force-dynamic'

    const clientesFolderId = process.env.DRIVE_FOLDER_CLIENTES_ID
export const dynamic = 'force-dynamic'

    if (!clientesFolderId) 
export const dynamic = 'force-dynamic'
{
      return NextResponse.json(
export const dynamic = 'force-dynamic'

        
export const dynamic = 'force-dynamic'
{ error: 'DRIVE_FOLDER_CLIENTES_ID no configurado' },
        
export const dynamic = 'force-dynamic'
{ status: 400 }
      )
export const dynamic = 'force-dynamic'

    }
export const dynamic = 'force-dynamic'


export const dynamic = 'force-dynamic'

    console.log('ðŸ”„ Iniciando sincronizaciÃ³n desde Drive...')
export const dynamic = 'force-dynamic'


export const dynamic = 'force-dynamic'

    // Obtener sesiÃ³n del usuario autenticado
export const dynamic = 'force-dynamic'

    const session = await getServerSession(authOptions)
export const dynamic = 'force-dynamic'

    if (!session?.accessToken) 
export const dynamic = 'force-dynamic'
{
      return NextResponse.json(
export const dynamic = 'force-dynamic'

        
export const dynamic = 'force-dynamic'
{ error: 'Debes estar autenticado. Inicia sesiÃ³n primero.' },
        
export const dynamic = 'force-dynamic'
{ status: 401 }
      )
export const dynamic = 'force-dynamic'

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

    // Listar todas las carpetas en la carpeta de clientes
export const dynamic = 'force-dynamic'

    const listResponse = await drive.files.list(
export const dynamic = 'force-dynamic'
{
      q: `'$
export const dynamic = 'force-dynamic'
{clientesFolderId}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
      spaces: 'drive',
export const dynamic = 'force-dynamic'

      fields: 'files(id, name, mimeType)',
export const dynamic = 'force-dynamic'

      pageSize: 100,
export const dynamic = 'force-dynamic'

      supportsAllDrives: true,
export const dynamic = 'force-dynamic'

    })
export const dynamic = 'force-dynamic'


export const dynamic = 'force-dynamic'

    const carpetas = listResponse.data.files || []
export const dynamic = 'force-dynamic'


export const dynamic = 'force-dynamic'

    let clientesCreados = 0
export const dynamic = 'force-dynamic'

    let tramitesCreados = 0
export const dynamic = 'force-dynamic'


export const dynamic = 'force-dynamic'

    for (const carpeta of carpetas) 
export const dynamic = 'force-dynamic'
{
      if (carpeta.mimeType !== 'application/vnd.google-apps.folder') 
export const dynamic = 'force-dynamic'
{
        continue
export const dynamic = 'force-dynamic'

      }
export const dynamic = 'force-dynamic'


export const dynamic = 'force-dynamic'

      // Intentar extraer datos del nombre de la carpeta
export const dynamic = 'force-dynamic'

      // Formato esperado: "TR-00001 - NombreCliente" o similar
export const dynamic = 'force-dynamic'

      const match = carpeta.name?.match(/TR-(\d+)\s*-?\s*(.+)/i)
export const dynamic = 'force-dynamic'


export const dynamic = 'force-dynamic'

      if (!match) 
export const dynamic = 'force-dynamic'
{
        console.log(`âš ï¸  No se pudo parsear: $
export const dynamic = 'force-dynamic'
{carpeta.name}`)
        continue
export const dynamic = 'force-dynamic'

      }
export const dynamic = 'force-dynamic'


export const dynamic = 'force-dynamic'

      const [, codigo, nombreCliente] = match
export const dynamic = 'force-dynamic'

      const codigoTramite = `TR-$
export const dynamic = 'force-dynamic'
{codigo.padStart(5, '0')}`

export const dynamic = 'force-dynamic'

      // Buscar o crear cliente
export const dynamic = 'force-dynamic'

      const clienteTrim = nombreCliente.trim()
export const dynamic = 'force-dynamic'

      let cliente = await db.cliente.findFirst(
export const dynamic = 'force-dynamic'
{
        where: 
export const dynamic = 'force-dynamic'
{
          nombreCompleto: 
export const dynamic = 'force-dynamic'
{
            contains: clienteTrim,
export const dynamic = 'force-dynamic'

          },
export const dynamic = 'force-dynamic'

        },
export const dynamic = 'force-dynamic'

      })
export const dynamic = 'force-dynamic'


export const dynamic = 'force-dynamic'

      if (!cliente) 
export const dynamic = 'force-dynamic'
{
        cliente = await db.cliente.create(
export const dynamic = 'force-dynamic'
{
          data: 
export const dynamic = 'force-dynamic'
{
            nombreCompleto: clienteTrim,
export const dynamic = 'force-dynamic'

            email: 'contacto@example.com',
export const dynamic = 'force-dynamic'

            nacionalidad: 'EspaÃ±a',
export const dynamic = 'force-dynamic'

            direccion: 'Sincronizado desde Drive',
export const dynamic = 'force-dynamic'

            telefono: '000000000',
export const dynamic = 'force-dynamic'

          },
export const dynamic = 'force-dynamic'

        })
export const dynamic = 'force-dynamic'

        clientesCreados++
export const dynamic = 'force-dynamic'

      }
export const dynamic = 'force-dynamic'


export const dynamic = 'force-dynamic'

      // Crear un trÃ¡mite por cada cliente encontrado
export const dynamic = 'force-dynamic'

      // Usar el tipo de trÃ¡mite del nombre de la carpeta o valor por defecto
export const dynamic = 'force-dynamic'

      const tipoMatch = carpeta.name?.match(/([A-Za-z\s]+?)(?:\s*-|$)/)
export const dynamic = 'force-dynamic'

      const tipoTramiteDefault = tipoMatch ? tipoMatch[1].trim() : 'TrÃ¡mite'
export const dynamic = 'force-dynamic'


export const dynamic = 'force-dynamic'

      const tramiteExiste = await db.tramite.findFirst(
export const dynamic = 'force-dynamic'
{
        where: 
export const dynamic = 'force-dynamic'
{
          codigo: codigoTramite,
export const dynamic = 'force-dynamic'

          clienteId: cliente.id,
export const dynamic = 'force-dynamic'

        },
export const dynamic = 'force-dynamic'

      })
export const dynamic = 'force-dynamic'


export const dynamic = 'force-dynamic'

      if (!tramiteExiste) 
export const dynamic = 'force-dynamic'
{
        // Obtener tramiteConfigId por tipoTramite
export const dynamic = 'force-dynamic'

        const tramiteConfig = await db.tramiteConfiguracion.findFirst(
export const dynamic = 'force-dynamic'
{
          where: 
export const dynamic = 'force-dynamic'
{ tipoTramite: tipoTramiteDefault },
        })
export const dynamic = 'force-dynamic'


export const dynamic = 'force-dynamic'

        if (!tramiteConfig) 
export const dynamic = 'force-dynamic'
{
          console.warn(`âš ï¸ Tipo de trÃ¡mite "$
export const dynamic = 'force-dynamic'
{tipoTramiteDefault}" no encontrado`)
          continue
export const dynamic = 'force-dynamic'

        }
export const dynamic = 'force-dynamic'


export const dynamic = 'force-dynamic'

        await db.tramite.create(
export const dynamic = 'force-dynamic'
{
          data: 
export const dynamic = 'force-dynamic'
{
            codigo: codigoTramite,
export const dynamic = 'force-dynamic'

            clienteId: cliente.id,
export const dynamic = 'force-dynamic'

            tramiteConfigId: tramiteConfig.id,
export const dynamic = 'force-dynamic'

            estado: 'en_proceso',
export const dynamic = 'force-dynamic'

            honorarios: 0,
export const dynamic = 'force-dynamic'

            driveFolderId: carpeta.id,
export const dynamic = 'force-dynamic'

            notas: `Sincronizado desde Drive: $
export const dynamic = 'force-dynamic'
{carpeta.name}`,
          },
export const dynamic = 'force-dynamic'

        })
export const dynamic = 'force-dynamic'

        tramitesCreados++
export const dynamic = 'force-dynamic'

        console.log(`   âœ… TrÃ¡mite creado: $
export const dynamic = 'force-dynamic'
{codigoTramite}`)
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

      message: 'SincronizaciÃ³n completada',
export const dynamic = 'force-dynamic'

      clientesCreados,
export const dynamic = 'force-dynamic'

      tramitesCreados,
export const dynamic = 'force-dynamic'

      timestamp: new Date().toISOString(),
export const dynamic = 'force-dynamic'

    })
export const dynamic = 'force-dynamic'

  } catch (error) 
export const dynamic = 'force-dynamic'
{
    console.error('Error en sincronizaciÃ³n:', error)
export const dynamic = 'force-dynamic'

    return NextResponse.json(
export const dynamic = 'force-dynamic'

      
export const dynamic = 'force-dynamic'
{ error: error instanceof Error ? error.message : 'Error en sincronizaciÃ³n' },
      
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
      message: 'Para sincronizar desde Drive, usa POST',
export const dynamic = 'force-dynamic'

      usage: 'POST /api/admin/sync-from-drive',
export const dynamic = 'force-dynamic'

      description: 'Sincroniza clientes y trÃ¡mites desde carpetas en Google Drive',
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

