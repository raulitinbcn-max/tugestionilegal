import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const count = await db.tramiteConfiguracion.count()
    const tramites = await db.tramiteConfiguracion.findMany({ select: { id: true, tipoTramite: true, nombre: true } })

    return NextResponse.json({
      count,
      tramites,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error?.message }, { status: 500 })
  }
}
