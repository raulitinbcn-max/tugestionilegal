import { db } from '@/lib/db'
import { createFolderWithSession } from '@/lib/drive'
import { generateTramiteCode } from '@/lib/utils'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
// Removed: TRAMITE_CONFIGS - now using database for configuration
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    // Verificar sesión del usuario
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json(
        { message: 'Usuario no autenticado' },
        { status: 401 }
      )
    }

    const body = await req.json()

    const {
      nombreCompleto,
      fechaNacimiento,
      nacionalidad,
      numeroPasaporte,
      direccion,
      codigoPostal,
      poblacion,
      provincia,
      email,
      telefono,
      situacionActual,
      tipoTramite,
      honorarios,
      formaPago,
      tasas,
    } = body

    // Validar datos requeridos
    if (!nombreCompleto || !tipoTramite) {
      return NextResponse.json(
        { message: 'Nombre y tipo de trámite son requeridos' },
        { status: 400 }
      )
    }

    // Crear o actualizar cliente
    let cliente = await db.cliente.findFirst({
      where: { email },
    })

    if (!cliente) {
      cliente = await db.cliente.create({
        data: {
          nombreCompleto,
          fechaNacimiento: fechaNacimiento ? new Date(fechaNacimiento) : null,
          nacionalidad: nacionalidad || null,
          numeroPasaporte: numeroPasaporte || null,
          direccion: direccion || null,
          codigoPostal: codigoPostal || null,
          poblacion: poblacion || null,
          provincia: provincia || null,
          email: email || null,
          telefono: telefono || null,
          situacionActual: situacionActual || null,
        },
      })
    } else {
      // Actualizar cliente si ya existe
      await db.cliente.update({
        where: { id: cliente.id },
        data: {
          nombreCompleto,
          fechaNacimiento: fechaNacimiento ? new Date(fechaNacimiento) : null,
          nacionalidad: nacionalidad || null,
          numeroPasaporte: numeroPasaporte || null,
          direccion: direccion || null,
          codigoPostal: codigoPostal || null,
          poblacion: poblacion || null,
          provincia: provincia || null,
          telefono: telefono || null,
          situacionActual: situacionActual || null,
        },
      })
    }

    // Generar código único para el trámite
    let codigo = generateTramiteCode()
    let codigoExists = await db.tramite.findUnique({
      where: { codigo },
    })

    while (codigoExists) {
      codigo = generateTramiteCode()
      codigoExists = await db.tramite.findUnique({
        where: { codigo },
      })
    }

    // Crear carpeta en Google Drive
    const clientesFolderId = process.env.DRIVE_FOLDER_CLIENTES_ID
    if (!clientesFolderId) {
      throw new Error('DRIVE_FOLDER_CLIENTES_ID not configured')
    }

    const folderName = `${codigo}_${nombreCompleto.replace(/\s+/g, '_')}`
    let driveFolderId: string | null = null
    let driveFolderPendiente = false
    try {
      driveFolderId = await createFolderWithSession(folderName, clientesFolderId, session)
    } catch (driveError) {
      console.error('Error creating Drive folder:', driveError)
      // Marcar como pendiente si falla Drive
      driveFolderPendiente = true
    }

    // Calcular suplidos (suma de tasas)
    const suplidos = tasas?.reduce((sum: number, t: any) => sum + (parseFloat(t.importe) || 0), 0) || 0

    // Obtener tipo de trámite desde la BD
    const tramiteConfig = await db.tramiteConfiguracion.findFirst({
      where: { tipoTramite },
    })

    if (!tramiteConfig) {
      return NextResponse.json(
        { message: `Tipo de trámite "${tipoTramite}" no encontrado` },
        { status: 400 }
      )
    }

    let categoriaId: string | null = null
    if (tramiteConfig.categoria) {
      const categoria = await db.categoriasTramite.findUnique({
        where: { clave: tramiteConfig.categoria },
      })
      categoriaId = categoria?.id || null
    }

    // Crear trámite
    const tramite = await db.tramite.create({
      data: {
        codigo,
        clienteId: cliente.id,
        tramiteConfigId: tramiteConfig.id,
        categoriaId,
        honorarios: honorarios ? parseFloat(honorarios) : null,
        formaPago: formaPago || null,
        suplidos,
        driveFolderId,
        driveFolderPendiente,
        estado: 'Borrador',
      },
    })

    // Crear tasas asociadas
    if (tasas && Array.isArray(tasas) && tasas.length > 0) {
      await Promise.all(
        tasas.map((tasa: any) =>
          db.tasa.create({
            data: {
              tramiteId: tramite.id,
              nombre: tasa.nombre,
              importe: parseFloat(tasa.importe),
            },
          })
        )
      )
    }

    // Registrar en historial
    await db.historialEstado.create({
      data: {
        tramiteId: tramite.id,
        estadoAnterior: null,
        estadoNuevo: 'pendiente',
        usuario: 'sistema',
        notas: 'Trámite creado',
      },
    })

    return NextResponse.json(
      { tramite, cliente },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating tramite:', error)
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Error al crear el trámite' },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  try {
    const tramites = await db.tramite.findMany({
      include: {
        cliente: true,
        tramiteConfig: true,
        categoria: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(tramites)
  } catch (error) {
    console.error('Error fetching tramites:', error)
    return NextResponse.json(
      { message: 'Error al obtener trámites' },
      { status: 500 }
    )
  }
}
