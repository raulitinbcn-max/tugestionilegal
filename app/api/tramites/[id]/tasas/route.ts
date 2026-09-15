import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const tasas = await db.tasa.findMany({
      where: { tramiteId: id },
      orderBy: { createdAt: 'asc' },
    })

    return NextResponse.json(tasas)
  } catch (error) {
    console.error('Error fetching tasas:', error)
    return NextResponse.json(
      { message: 'Error al obtener tasas' },
      { status: 500 }
    )
  }
}
