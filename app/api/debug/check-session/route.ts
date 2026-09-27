import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    return NextResponse.json({
      hasSession: !!session,
      user: session?.user,
      hasAccessToken: !!session?.accessToken,
      accessTokenLength: session?.accessToken ? session.accessToken.length : 0,
      sessionKeys: Object.keys(session || {}),
    })
  } catch (error: any) {
    return NextResponse.json({ error: error?.message }, { status: 500 })
  }
}
