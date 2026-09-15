import { clasificarDocumentosAutomaticamente } from '@/lib/clasificacion'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    // Validar que la solicitud viene de un cron job autorizado
    // (Implementar verificación de token si es necesario)
    const authHeader = req.headers.get('authorization')
    const expectedToken = process.env.CRON_SECRET

    if (expectedToken && authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const result = await clasificarDocumentosAutomaticamente()
    return NextResponse.json(result, { status: 200 })
  } catch (error) {
    console.error('Error in clasificacion-automatica:', error)
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : 'Error en clasificación automática',
      },
      { status: 500 }
    )
  }
}
