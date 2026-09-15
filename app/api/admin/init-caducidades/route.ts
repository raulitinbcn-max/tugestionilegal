import { NextResponse } from 'next/server'

export async function POST() {
  return NextResponse.json({
    message: 'Endpoint deprecado - la lógica de caducidades ha sido refactorizada',
    success: false,
  }, { status: 410 })
}
