import { google } from 'googleapis'
import { getServerSession } from 'next-auth/next'
import { authOptions } from './auth'

let driveClient: ReturnType<typeof google.drive> | null = null

export async function getDriveClient(session?: any) {
  // Si no se pasa sesión, intentar obtenerla
  if (!session) {
    session = await getServerSession(authOptions)
  }

  if (!session?.accessToken) {
    throw new Error('Usuario no autenticado - token de Google no disponible')
  }

  const oauth2Client = new google.auth.OAuth2()
  oauth2Client.setCredentials({
    access_token: session.accessToken,
  })

  driveClient = google.drive({ version: 'v3', auth: oauth2Client })
  return driveClient
}

export async function createFolderWithSession(
  folderName: string,
  parentFolderId?: string,
  session?: any
): Promise<string> {
  const drive = await getDriveClient(session)

  const response = await drive.files.create({
    requestBody: {
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder',
      parents: parentFolderId ? [parentFolderId] : undefined,
    },
    supportsAllDrives: true,
    fields: 'id',
  })

  if (!response.data.id) {
    throw new Error('Failed to create folder')
  }

  return response.data.id
}

export async function createFolder(
  folderName: string,
  parentFolderId?: string
): Promise<string> {
  const drive = await getDriveClient()

  const response = await drive.files.create({
    requestBody: {
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder',
      parents: parentFolderId ? [parentFolderId] : undefined,
    },
    supportsAllDrives: true,
    fields: 'id',
  })

  if (!response.data.id) {
    throw new Error('Failed to create folder')
  }

  return response.data.id
}

export async function listFiles(folderId: string, query?: string) {
  const drive = await getDriveClient()

  const baseQuery = `'${folderId}' in parents and trashed = false`
  const fullQuery = query ? `${baseQuery} and ${query}` : baseQuery

  const response = await drive.files.list({
    q: fullQuery,
    spaces: 'drive',
    fields: 'files(id, name, mimeType, createdTime, modifiedTime)',
    pageSize: 100,
    supportsAllDrives: true,
  })

  return response.data.files || []
}

export async function moveFile(fileId: string, newParentId: string, removeParentId?: string) {
  const drive = await getDriveClient()

  const previousParents = removeParentId ? removeParentId : undefined

  await drive.files.update({
    fileId,
    addParents: newParentId,
    removeParents: previousParents,
    supportsAllDrives: true,
    fields: 'id, parents',
  })
}

export async function copyFile(fileId: string, newName: string, newParentId: string): Promise<string> {
  const drive = await getDriveClient()

  const response = await drive.files.copy({
    fileId,
    requestBody: {
      name: newName,
      parents: [newParentId],
    },
    supportsAllDrives: true,
    fields: 'id',
  })

  if (!response.data.id) {
    throw new Error('Failed to copy file')
  }

  return response.data.id
}

export async function deleteFile(fileId: string) {
  const drive = await getDriveClient()

  await drive.files.delete({
    fileId,
    supportsAllDrives: true,
  })
}

export async function getFileMetadata(fileId: string) {
  const drive = await getDriveClient()

  const response = await drive.files.get({
    fileId,
    supportsAllDrives: true,
    fields: 'id, name, mimeType, createdTime, modifiedTime, webViewLink',
  })

  return response.data
}

// Funciones para backup en Drive
export async function uploadBackupToDriver(
  folderId: string,
  backupFileName: string,
  backupContent: string
): Promise<string> {
  const drive = await getDriveClient()

  // Crear archivo JSON en Drive
  const response = await drive.files.create({
    requestBody: {
      name: backupFileName,
      parents: [folderId],
      mimeType: 'application/json',
      properties: {
        backup: 'true',
        timestamp: new Date().toISOString(),
      },
    },
    media: {
      mimeType: 'application/json',
      body: backupContent,
    },
    supportsAllDrives: true,
    fields: 'id, name, webViewLink',
  })

  if (!response.data.id) {
    throw new Error('Failed to upload backup to Drive')
  }

  return response.data.id
}

export async function listBackupsInDrive(folderId: string) {
  const drive = await getDriveClient()

  const response = await drive.files.list({
    q: `'${folderId}' in parents and name contains 'config-backup-' and trashed = false`,
    spaces: 'drive',
    fields: 'files(id, name, createdTime, modifiedTime, size)',
    orderBy: 'modifiedTime desc',
    pageSize: 50,
    supportsAllDrives: true,
  })

  return response.data.files || []
}

export async function downloadBackupFromDrive(fileId: string): Promise<string> {
  const drive = await getDriveClient()

  const response = await drive.files.get({
    fileId,
    alt: 'media',
    supportsAllDrives: true,
  })

  return JSON.stringify(response.data)
}
