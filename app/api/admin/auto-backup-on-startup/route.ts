import { NextResponse } from 'next/server'

// Este endpoint está deprecated - usar /api/admin/backup-oauth en su lugar
// Mantener solo para compatibilidad si algo lo llama

export async function POST() {
  return NextResponse.json({
    success: true,
    message: 'Este endpoint ha sido reemplazado por /api/admin/backup-oauth (OAuth)',
  })
}
