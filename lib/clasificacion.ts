import { db } from './db'
import { listFiles, moveFile, getFileMetadata } from './drive'
import { extractTramiteCodeFromFilename } from './utils'

export async function clasificarDocumentosAutomaticamente() {
  try {
    // NOTA: Esta función necesita OAuth2 configurado
    // Solo funciona si hay una sesión de usuario autenticado
    // Para usar en un cron job, necesitarías una cuenta de servicio

    const entradaFolderId = process.env.DRIVE_FOLDER_ENTRADA_ID
    if (!entradaFolderId) {
      throw new Error('DRIVE_FOLDER_ENTRADA_ID not configured')
    }

    // Listar archivos en /Entrada
    const files = await listFiles(entradaFolderId)

    for (const file of files) {
      if (!file.name) continue

      // Extraer código de trámite del nombre
      const tramiteCode = extractTramiteCodeFromFilename(file.name)

      if (!tramiteCode) {
        // No se pudo extraer código → mover a /Entrada/Sin clasificar
        const sinClasificarFolderId = process.env.DRIVE_FOLDER_SIN_CLASIFICAR_ID
        if (sinClasificarFolderId && file.id) {
          await moveFile(file.id, sinClasificarFolderId, entradaFolderId)
        }
        continue
      }

      // Buscar trámite por código
      const tramite = await db.tramite.findUnique({
        where: { codigo: tramiteCode },
      })

      if (!tramite || !tramite.driveFolderId) {
        // Trámite no encontrado → mover a sin clasificar
        const sinClasificarFolderId = process.env.DRIVE_FOLDER_SIN_CLASIFICAR_ID
        if (sinClasificarFolderId && file.id) {
          await moveFile(file.id, sinClasificarFolderId, entradaFolderId)
        }
        continue
      }

      // Extraer tipo de documento del nombre (después del código)
      // Ej: TR-00234_pasaporte.pdf → pasaporte
      const tipoMatch = file.name.match(/^[A-Z]{2}-\d+_(.+)\.\w+$/)
      const tipoDocumento = tipoMatch ? tipoMatch[1] : 'otro'

      // Mover archivo a carpeta del trámite
      if (file.id) {
        await moveFile(file.id, tramite.driveFolderId, entradaFolderId)

        // Registrar documento en BD
        await db.documento.create({
          data: {
            tramiteId: tramite.id,
            nombre: file.name,
            driveFileId: file.id,
            origen: 'clasificacion_automatica',
          },
        })
      }
    }

    return { success: true, message: 'Clasificación completada' }
  } catch (error) {
    console.error('Error in clasificarDocumentosAutomaticamente:', error)
    throw error
  }
}

export async function getDocumentosPendientes() {
  try {
    const sinClasificarFolderId = process.env.DRIVE_FOLDER_SIN_CLASIFICAR_ID
    if (!sinClasificarFolderId) {
      throw new Error('DRIVE_FOLDER_SIN_CLASIFICAR_ID not configured')
    }

    const files = await listFiles(sinClasificarFolderId)
    return files.map((f) => ({
      id: f.id,
      nombre: f.name,
      createdTime: f.createdTime,
    }))
  } catch (error) {
    console.error('Error fetching documentos pendientes:', error)
    throw error
  }
}
