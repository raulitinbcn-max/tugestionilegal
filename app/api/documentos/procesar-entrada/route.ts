import { db } from '@/lib/db'
import { listFiles, moveFile } from '@/lib/drive'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const entradaFolderId = process.env.DRIVE_FOLDER_ENTRADA_ID
    const sinClasificarFolderId = process.env.DRIVE_FOLDER_SIN_CLASIFICAR_ID

    if (!entradaFolderId || !sinClasificarFolderId) {
      return NextResponse.json(
        { error: 'Carpetas de Drive no configuradas' },
        { status: 500 }
      )
    }

    // Listar archivos en /Entrada (solo archivos, no carpetas)
    const files = await listFiles(entradaFolderId, "mimeType != 'application/vnd.google-apps.folder'")

    let procesados = 0
    let clasificados = 0
    let sinClasificar = 0
    const resultados: Array<{
      nombre: string
      estado: 'clasificado' | 'sin_clasificar'
      tramiteId?: string
      razon?: string
    }> = []

    for (const file of files) {
      try {
        // Intentar extraer código de trámite del nombre del archivo
        // Formato esperado: TR-00001_documento.pdf o similar
        const codigoMatch = file.name?.match(/^(TR-\d+)/i)

        if (codigoMatch) {
          const codigo = codigoMatch[1].toUpperCase()

          // Buscar el trámite en BD
          const tramite = await db.tramite.findFirst({
            where: { codigo },
          })

          if (tramite && tramite.driveFolderId) {
            // Mover a la carpeta del trámite
            await moveFile(file.id!, tramite.driveFolderId, entradaFolderId)

            // Buscar documento existente por driveFileId
            const existingDoc = await db.documento.findFirst({
              where: { driveFileId: file.id! },
            })

            if (existingDoc) {
              // Actualizar si existe
              await db.documento.update({
                where: { id: existingDoc.id },
                data: { tramiteId: tramite.id },
              })
            } else {
              // Crear si no existe
              await db.documento.create({
                data: {
                  driveFileId: file.id!,
                  nombre: file.name || 'documento',
                  origen: 'manual',
                  tramiteId: tramite.id,
                },
              })
            }

            clasificados++
            resultados.push({
              nombre: file.name || 'unknown',
              estado: 'clasificado',
              tramiteId: tramite.id,
            })
          } else {
            // Código encontrado pero trámite no existe
            await moveFile(file.id!, sinClasificarFolderId, entradaFolderId)
            sinClasificar++
            resultados.push({
              nombre: file.name || 'unknown',
              estado: 'sin_clasificar',
              razon: 'Código de trámite no encontrado en BD',
            })
          }
        } else {
          // No se pudo extraer código del nombre
          await moveFile(file.id!, sinClasificarFolderId, entradaFolderId)
          sinClasificar++
          resultados.push({
            nombre: file.name || 'unknown',
            estado: 'sin_clasificar',
            razon: 'No se encontró código de trámite en el nombre (esperado: TR-XXXXX_)',
          })
        }

        procesados++
      } catch (error) {
        console.error(`Error procesando archivo ${file.name}:`, error)
        resultados.push({
          nombre: file.name || 'unknown',
          estado: 'sin_clasificar',
          razon: `Error: ${error instanceof Error ? error.message : 'desconocido'}`,
        })
      }
    }

    return NextResponse.json({
      success: true,
      totalProcesados: procesados,
      clasificados,
      sinClasificar,
      resultados,
    })
  } catch (error) {
    console.error('Error procesando entrada:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error al procesar documentos' },
      { status: 500 }
    )
  }
}
