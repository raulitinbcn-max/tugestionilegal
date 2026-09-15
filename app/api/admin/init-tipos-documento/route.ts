import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

const TIPOS_DOCUMENTO_INICIALES = [
  {
    nombre: 'Mandato de Representación',
    icono: '📋',
    color: '#3b82f6',
    orden: 1,
  },
  {
    nombre: 'Contrato de Prestación',
    icono: '📄',
    color: '#22c55e',
    orden: 2,
  },
  {
    nombre: 'Fraccionamiento de Pago',
    icono: '📅',
    color: '#4f46e5',
    orden: 3,
  },
  {
    nombre: 'Factura Proforma',
    icono: '💵',
    color: '#a855f7',
    orden: 4,
  },
  {
    nombre: 'Autorización para Recurso',
    icono: '⚖️',
    color: '#ea580c',
    orden: 5,
  },
  {
    nombre: 'Renuncia al Trámite',
    icono: '❌',
    color: '#dc2626',
    orden: 6,
  },
  {
    nombre: 'Recibo',
    icono: '🧾',
    color: '#06b6d4',
    orden: 7,
  },
  {
    nombre: 'Resolución',
    icono: '📌',
    color: '#8b5cf6',
    orden: 8,
  },
]

export async function POST() {
  try {
    // Crear o actualizar los tipos de documento
    for (const tipo of TIPOS_DOCUMENTO_INICIALES) {
      await db.tipoDocumento.upsert({
        where: { nombre: tipo.nombre },
        update: {
          icono: tipo.icono,
          color: tipo.color,
          orden: tipo.orden,
        },
        create: {
          nombre: tipo.nombre,
          icono: tipo.icono,
          color: tipo.color,
          orden: tipo.orden,
        },
      })
    }

    return NextResponse.json({
      message: 'Tipos de documento inicializados correctamente',
      cantidad: TIPOS_DOCUMENTO_INICIALES.length,
    })
  } catch (error) {
    console.error('Error inicializando tipos de documento:', error)
    return NextResponse.json(
      { error: 'Error al inicializar tipos de documento' },
      { status: 500 }
    )
  }
}
