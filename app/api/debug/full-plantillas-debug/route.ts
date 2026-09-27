import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { listFiles } from '@/lib/drive'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const sessionAny = session as any

    const result: any = {
      timestamp: new Date().toISOString(),
      session: {
        hasSession: !!session,
        user: sessionAny?.user?.email,
        hasAccessToken: !!sessionAny?.accessToken,
        accessTokenLength: sessionAny?.accessToken?.length || 0,
      },
      drive: {},
    }

    if (!session) {
      result.drive.error = 'No session'
      return NextResponse.json(result)
    }

    if (!sessionAny.accessToken) {
      result.drive.error = 'No accessToken in session'
      return NextResponse.json(result)
    }

    const plantillasFolderId = process.env.DRIVE_FOLDER_PLANTILLAS_ID
    if (!plantillasFolderId) {
      result.drive.error = 'DRIVE_FOLDER_PLANTILLAS_ID not configured'
      return NextResponse.json(result)
    }

    result.drive.folderId = plantillasFolderId

    // Try to list files
    try {
      const mimeTypeQuery = "mimeType = 'application/vnd.google-apps.document'"
      const files = await listFiles(plantillasFolderId, mimeTypeQuery)
      result.drive.googleDocsFound = files.length
      result.drive.files = files.map((f: any) => ({ name: f.name, mimeType: f.mimeType }))
    } catch (driveError: any) {
      result.drive.error = driveError?.message || 'Unknown error'
      result.drive.details = {
        status: driveError?.status,
        code: driveError?.code,
      }
    }

    return NextResponse.json(result)
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message, stack: error?.stack },
      { status: 500 }
    )
  }
}
