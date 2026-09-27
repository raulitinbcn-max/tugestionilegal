import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    const sessionAny = session as any

    return NextResponse.json({
      hasSession: !!session,
      user: session?.user,
      hasAccessToken: !!sessionAny?.accessToken,
      accessTokenLength: sessionAny?.accessToken ? sessionAny.accessToken.length : 0,
      sessionKeys: Object.keys(session || {}),
    })
  } catch (error: any) {
    return NextResponse.json({ error: error?.message }, { status: 500 })
  }
}
