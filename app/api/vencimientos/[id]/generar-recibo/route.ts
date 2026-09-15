import { db } from '@/lib/db'
import { copyFile } from '@/lib/drive'
import { replaceTextInDocument } from '@/lib/docs'
import { numeroALetras } from '@/lib/numero-a-letras'
import { getTramiteConfig } from '@/lib/tramite-config'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const vencimientoId = params.id

    const vencimiento = await db.vencimiento.findUnique({
      where: { id: vencimientoId },
      include: {
        tramite: {
          include: { cliente: true, tramiteConfig: true },
        },
      },
    })

    if (!vencimiento) {
      return NextResponse.json(
        { message: 'Vencimiento no encontrado' },
        { status: 404 }
      )
    }

    if (!vencimiento.pagado) {
      return NextResponse.json(
        { message: 'El vencimiento no está marcado como pagado' },
        { status: 400 }
      )
    }

    const tramite = vencimiento.tramite
    const cliente = tramite.cliente

    // Buscar plantilla de recibo
    const plantilla = await db.plantilla.findFirst({
      where: {
        tipo: 'recibo',
        tramiteConfigId: tramite.tramiteConfigId,
      },
    })

    if (!plantilla) {
      return NextResponse.json(
        { message: 'No hay plantilla de recibo para este trámite' },
        { status: 404 }
      )
    }

    if (!tramite.driveFolderId) {
      return NextResponse.json(
        { message: 'El trámite no tiene carpeta en Drive' },
        { status: 400 }
      )
    }

    // Verificar si ya existe un recibo para este vencimiento
    const reciboExistente = await db.documentoGenerado.findFirst({
      where: {
        tramiteId: tramite.id,
        nombreGenerado: {
          contains: `recibo_vencimiento_${vencimiento.numeroVencimiento}`,
        },
      },
    })

    if (reciboExistente) {
      // Si ya existe, retornar el existente
      return NextResponse.json(
        { documentoGenerado: reciboExistente, driveFileId: reciboExistente.driveFileId },
        { status: 200 }
      )
    }

    // Generar nombre único para el recibo
    const nombreGenerado = `${tramite.codigo}_recibo_vencimiento_${vencimiento.numeroVencimiento}`

    const driveFileId = await copyFile(
      plantilla.driveFileId,
      nombreGenerado,
      tramite.driveFolderId
    )

    // Preparar fecha actual
    const hoy = new Date()
    const fechaFormato = hoy.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })

    const formatearImporte = (valor: number) => `${valor.toFixed(2).replace('.', ',')}`
    const formatearImporteConEuro = (valor: number) => `${valor.toFixed(2).replace('.', ',')} €`
    const formatearImporteLetras = (valor: number) => `${numeroALetras(valor)}`

    // Obtener nombre del trámite desde la configuración
    const nombreTramite = tramite.tramiteConfig?.nombre || 'Trámite'

    // Función para capitalizar cada palabra
    const capitalizarPalabras = (texto: string) => {
      return texto
        .toLowerCase()
        .split(' ')
        .map((palabra) => palabra.charAt(0).toUpperCase() + palabra.slice(1))
        .join(' ')
    }

    // Placeholders específicos para el recibo
    const replacements: Record<string, string> = {
      '{{NOMBRE DEL TRÁMITE}}': nombreTramite,
      '{{NÚMERO DE EXPEDIENTE}}': tramite.codigo,
      '{{NOMBRE Y APELLIDOS}}': capitalizarPalabras(cliente.nombreCompleto || ''),
      '{{TIPO, PAÍS Y NÚMERO DE DOCUMENTO}}': cliente.numeroPasaporte || '',
      '{{DIRECCIÓN}}': cliente.direccion || '',
      '{{CÓDIGO POSTAL}}': cliente.codigoPostal || '',
      '{{POBLACIÓN}}': cliente.poblacion || '',
      '{{PROVINCIA}}': cliente.provincia || '',
      '{{E-MAIL}}': cliente.email || '',
      '{{TELÉFONO}}': cliente.telefono || '',
      '{{FECHA}}': fechaFormato,
      '{{NÚMERO_VENCIMIENTO}}': vencimiento.numeroVencimiento.toString(),
      '{{IMPORTE_VENCIMIENTO}}': formatearImporte(vencimiento.importe),
      '{{IMPORTE_VENCIMIENTO_EURO}}': formatearImporteConEuro(vencimiento.importe),
      '{{IMPORTE_VENCIMIENTO_LETRAS}}': formatearImporteLetras(vencimiento.importe),
      '{{FECHA_VENCIMIENTO}}': new Date(vencimiento.fechaVencimiento).toLocaleDateString('es-ES'),
      '{{FECHA_PAGO}}': vencimiento.fechaPago
        ? new Date(vencimiento.fechaPago).toLocaleDateString('es-ES')
        : fechaFormato,
      '{{FORMA_PAGO}}': vencimiento.formaPago || 'No especificada',
      '{{NOTAS_PAGO}}': vencimiento.notas || '',
    }

    await replaceTextInDocument(driveFileId, replacements)

    const documentoGenerado = await db.documentoGenerado.create({
      data: {
        tramiteId: tramite.id,
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
    console.error('Error generando recibo:', error)
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Error al generar recibo' },
      { status: 500 }
    )
  }
}
