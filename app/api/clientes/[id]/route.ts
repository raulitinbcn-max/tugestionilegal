import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const CAMPOS_TEXTO = [
  'nacionalidad',
  'tipoDocumento',
  'numeroDocumento',
  'paisDocumento',
  'tipoOtroDocumento',
  'direccion',
  'codigoPostal',
  'poblacion',
  'provincia',
  'email',
  'telefono',
  'profesion',
  'situacionActual',
] as const

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const cliente = await db.cliente.findUnique({
      where: { id: params.id },
    })

    if (!cliente) {
      return NextResponse.json(
        { error: 'Cliente no encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json(cliente)
  } catch (error) {
    console.error('Error fetching cliente:', error)
    return NextResponse.json(
      { error: 'Error al obtener cliente' },
      { status: 500 }
    )
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json()
    const data: Record<string, unknown> = {}

    if ('nombreCompleto' in body) {
      if (!body.nombreCompleto?.trim()) {
        return NextResponse.json({ error: 'El nombre es obligatorio' }, { status: 400 })
      }
      data.nombreCompleto = body.nombreCompleto.trim()
    }

    if ('fechaNacimiento' in body) {
      data.fechaNacimiento = body.fechaNacimiento ? new Date(body.fechaNacimiento) : null
    }

    for (const campo of CAMPOS_TEXTO) {
      if (campo in body) data[campo] = body[campo] || null
    }

    const cliente = await db.cliente.update({
      where: { id: params.id },
      data,
    })

    return NextResponse.json(cliente)
  } catch (error: any) {
    if (error?.code === 'P2025') {
      return NextResponse.json({ error: 'Cliente no encontrado' }, { status: 404 })
    }
    if (error?.code === 'P2002') {
      return NextResponse.json({ error: 'Ya existe un cliente con ese email' }, { status: 400 })
    }
    console.error('Error updating cliente:', error)
    return NextResponse.json({ error: 'Error al guardar cliente' }, { status: 500 })
  }
}
