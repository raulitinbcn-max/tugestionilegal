import { google } from 'googleapis'
import { getServerSession } from 'next-auth/next'
import { authOptions } from './auth'

let docsClient: ReturnType<typeof google.docs> | null = null

export async function getDocsClient() {
  const session = await getServerSession(authOptions)

  if (!session?.accessToken) {
    throw new Error('Usuario no autenticado - token de Google no disponible')
  }

  const oauth2Client = new google.auth.OAuth2()
  oauth2Client.setCredentials({
    access_token: session.accessToken,
  })

  docsClient = google.docs({ version: 'v1', auth: oauth2Client })
  return docsClient
}

interface ReplaceTextRequest {
  [key: string]: string
}

export async function replaceTextInDocument(
  documentId: string,
  replacements: ReplaceTextRequest
) {
  const docs = await getDocsClient()

  const requests = Object.entries(replacements).map(([find, replace]) => ({
    replaceAllText: {
      containsText: {
        text: find,
        matchCase: false,
      },
      replaceText: replace,
    },
  }))

  await docs.documents.batchUpdate({
    documentId,
    requestBody: {
      requests,
    },
  })
}

export async function getDocument(documentId: string) {
  const docs = await getDocsClient()

  const response = await docs.documents.get({
    documentId,
  })

  return response.data
}
