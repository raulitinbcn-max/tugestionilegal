import { db } from '@/lib/db'
import { copyFile } from '@/lib/drive'
import { replaceTextInDocument } from '@/lib/docs'
import { numeroALetras } from '@/lib/numero-a-letras'
import { getTramiteConfig } from '@/lib/tramite-config'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { tramiteId, tipoDocumento } = body

    if (!tramiteId || !tipoDocumento) {
      return NextResponse.json(
        { message: 'tramiteId y tipoDocumento son requeridos' },
        { status: 400 }
      )
    }

    const tramite = await db.tramite.findUnique({
      where: { id: tramiteId },
      include: { cliente: true, tramiteConfig: true },
    })

    if (!tramite) {
      return NextResponse.json(
        { message: 'Trámite no encontrado' },
        { status: 404 }
      )
    }

    const plantilla = await db.plantilla.findFirst({
      where: {
        tipo: tipoDocumento,
        tramiteConfigId: tramite.tramiteConfigId,
      },
    })

    if (!plantilla) {
      return NextResponse.json(
        { message: `No hay plantilla del tipo '${tipoDocumento}' para este trámite` },
        { status: 404 }
      )
    }

    if (!tramite.driveFolderId) {
      return NextResponse.json(
        { message: 'El trámite no tiene carpeta en Drive' },
        { status: 400 }
      )
    }

    // Verificar si ya existe un documento generado con ese nombre
    const existentes = await db.documentoGenerado.findMany({
      where: {
        tramiteId,
        nombreGenerado: {
          startsWith: `${tramite.codigo}_${tipoDocumento}`,
        },
      },
    })

    let nombreGenerado = `${tramite.codigo}_${tipoDocumento}`
    if (existentes.length > 0) {
      // Agregar número correlativo: _2, _3, etc.
      nombreGenerado = `${tramite.codigo}_${tipoDocumento}_${existentes.length + 1}`
    }

    const driveFileId = await copyFile(
      plantilla.driveFileId,
      nombreGenerado,
      tramite.driveFolderId
    )

    const importe = tramite.honorarios || 0
    const suplidos = tramite.suplidos || 0
    const porcentajeIVA = 21
    const montoIVA = importe * (porcentajeIVA / 100)
    const total = importe + montoIVA + suplidos

    const hoy = new Date()
    const fechaFormato = hoy.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })

    const vencimientos = await db.vencimiento.findMany({
      where: { tramiteId },
      orderBy: { numeroVencimiento: 'asc' },
    })

    const detalleVencimientos = vencimientos
      .map((v) => `Vencimiento ${v.numeroVencimiento}: €${v.importe.toFixed(2)} - ${v.formaPago} - ${new Date(v.fechaVencimiento).toLocaleDateString('es-ES')}`)
      .join('\n') || 'Pendiente de definir'

    // Construir descripción de suplidos a partir de las tasas
    const tasas = await db.tasa.findMany({
      where: { tramiteId },
    })
    const detalleSuplidos = tasas
      .map((t) => `${t.nombre}: ${t.importe.toFixed(2).replace('.', ',')} €`)
      .join('\n') || 'Sin suplidos'

    const formatearImporte = (valor: number) => `${valor.toFixed(2).replace('.', ',')} €`
    const formatearImporteLetras = (valor: number) => `${numeroALetras(valor)} €`

    // Crear placeholders individuales para cada vencimiento (hasta 12)
    const vencimientosPlaceholders: Record<string, string> = {}
    vencimientos.forEach((v) => {
      vencimientosPlaceholders[`{{VENCIMIENTO_${v.numeroVencimiento}_IMPORTE}}`] = formatearImporte(v.importe)
      vencimientosPlaceholders[`{{VENCIMIENTO_${v.numeroVencimiento}_IMPORTE_LETRAS}}`] = formatearImporteLetras(v.importe)
      vencimientosPlaceholders[`{{VENCIMIENTO_${v.numeroVencimiento}_FORMA_PAGO}}`] = v.formaPago
      vencimientosPlaceholders[`{{VENCIMIENTO_${v.numeroVencimiento}_FECHA}}`] = new Date(v.fechaVencimiento).toLocaleDateString('es-ES')
    })

    // Crear tabla de vencimientos para Google Docs (texto plano)
    const tablaVencimientos = vencimientos.length > 0
      ? `Nº Vencimiento | Fecha | Importe\n${'-'.repeat(60)}\n${vencimientos
        .map(
          (v) =>
            `${v.numeroVencimiento.toString().padStart(2)} | ${new Date(v.fechaVencimiento)
              .toLocaleDateString('es-ES')
              .padEnd(10)} | ${formatearImporte(v.importe).padStart(12)}`
        )
        .join('\n')}`
      : 'Sin vencimientos definidos'

    // Construir dirección completa
    const direccionCompleta = [
      tramite.cliente.direccion,
      tramite.cliente.codigoPostal,
      tramite.cliente.poblacion,
      tramite.cliente.provincia,
    ]
      .filter(Boolean)
      .join(', ')

    // Obtener nombre del trámite desde la configuración
    const nombreTramite = tramite.tramiteConfig?.nombre || 'Trámite'

    const replacements: Record<string, string> = {
      '{{NOMBRE DEL TRÁMITE}}': nombreTramite,
      '{{NÚMERO DE EXPEDIENTE}}': tramite.codigo,
      '{{NOMBRE Y APELLIDOS}}': (tramite.cliente.nombreCompleto || '').toUpperCase(),
      '{{TIPO, PAÍS Y NÚMERO DE DOCUMENTO}}': tramite.cliente.numeroPasaporte || '',
      '{{CALLE, NÚMERO, PISO Y PORTAL}}': tramite.cliente.direccion || '',
      '{{CÓDIGO POSTAL}}': tramite.cliente.codigoPostal || '',
      '{{POBLACIÓN}}': tramite.cliente.poblacion || '',
      '{{PROVINCIA}}': tramite.cliente.provincia || '',
      '{{DIRECCIÓN COMPLETA}}': direccionCompleta,
      '{{DIRECCIÓN}}': tramite.cliente.direccion || '',
      '{{TELÉFONO}}': tramite.cliente.telefono || '',
      '{{E-MAIL}}': tramite.cliente.email || '',
      '{{FECHA}}': fechaFormato,
      '{{IMPORTE SIN IMPUESTO}}': formatearImporte(importe),
      '{{IMPORTE SIN IMPUESTO EN LETRAS}}': formatearImporteLetras(importe),
      '{{PORCENTAJE IVA}}': porcentajeIVA.toString(),
      '{{IMPORTE IVA}}': formatearImporte(montoIVA),
      '{{IMPORTE IVA EN LETRAS}}': formatearImporteLetras(montoIVA),
      '{{TOTAL A PAGAR}}': formatearImporte(total),
      '{{TOTAL A PAGAR EN LETRAS}}': formatearImporteLetras(total),
      '{{SUPLIDOS}}': formatearImporte(suplidos),
      '{{SUPLIDOS EN LETRAS}}': formatearImporteLetras(suplidos),
      '{{DETALLE SUPLIDOS}}': detalleSuplidos,
      '{{FORMA DE PAGO}}': tramite.formaPago || 'Pendiente',
      '{{PLAN DE PAGO}}': tramite.planoPago || 'Contado',
      '{{DETALLE VENCIMIENTOS}}': detalleVencimientos,
      '{{TABLA_VENCIMIENTOS}}': tablaVencimientos,
      ...vencimientosPlaceholders,
    }

    await replaceTextInDocument(driveFileId, replacements)

    const documentoGenerado = await db.documentoGenerado.create({
      data: {
        tramiteId,
        plantillaId: plantilla.id,
        driveFileId,
        nombreGenerado,
      },
    })

    return NextResponse.json(
      { documentoGenerado, driveFileId },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error generando documento:', error)
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Error al generar documento' },
      { status: 500 }
    )
  }
}
