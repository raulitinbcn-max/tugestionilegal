import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    console.log('[check-tramites] Checking DB for tramites')
    const count = await db.tramiteConfiguracion.count()
    console.log('[check-tramites] Count:', count)

    const tramites = await db.tramiteConfiguracion.findMany({
      select: { id: true, tipoTramite: true, nombre: true, descripcion: true },
      orderBy: { nombre: 'asc' },
    })

    console.log('[check-tramites] Found tramites:', JSON.stringify(tramites))

    return NextResponse.json({
      success: true,
      count,
      tramites,
    })
  } catch (error: any) {
    console.error('[check-tramites] Error:', error)
    return NextResponse.json({ error: error?.message }, { status: 500 })
  }
}
