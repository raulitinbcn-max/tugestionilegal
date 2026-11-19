import { NextResponse } from 'next/server'
import codigos from '@/lib/data/codigos-postales.json'

export const dynamic = 'force-dynamic'

export async function GET(_req: Request, { params }: { params: { cp: string } }) {
  const poblacion = (codigos as Record<string, string>)[params.cp]
  if (!poblacion) {
    return NextResponse.json({ error: 'Código postal no encontrado' }, { status: 404 })
  }
  return NextResponse.json({ poblacion })
}
