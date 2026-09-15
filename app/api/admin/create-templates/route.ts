import 
export const dynamic = 'force-dynamic'
{ google } from 'googleapis'
import 
export const dynamic = 'force-dynamic'
{ getServerSession } from 'next-auth/next'
import 
export const dynamic = 'force-dynamic'
{ authOptions } from '@/lib/auth'
import 
export const dynamic = 'force-dynamic'
{ NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const PLANTILLAS_FOLDER_ID = '1LtsqemeD6qK3e3bIJQeYa5qYj9xlLzWF'
export const dynamic = 'force-dynamic'


export const dynamic = 'force-dynamic'

const TEMPLATES = [
export const dynamic = 'force-dynamic'

  
export const dynamic = 'force-dynamic'
{
    name: 'mandato_representacion',
export const dynamic = 'force-dynamic'

    title: 'Mandato de RepresentaciÃ³n',
export const dynamic = 'force-dynamic'

    content: `MANDATO DE REPRESENTACIÃ“N
export const dynamic = 'force-dynamic'


export const dynamic = 'force-dynamic'

De una parte,
export const dynamic = 'force-dynamic'

NOMBRE Y APELLIDOS: 
export const dynamic = 'force-dynamic'
{{NOMBRE Y APELLIDOS}}
TIPO, PAÃS Y NÃšMERO DE DOCUMENTO: 
export const dynamic = 'force-dynamic'
{{TIPO, PAÃS Y NÃšMERO DE DOCUMENTO}}
DIRECCIÃ“N: 
export const dynamic = 'force-dynamic'
{{DIRECCIÃ“N}}
TELÃ‰FONO: 
export const dynamic = 'force-dynamic'
{{TELÃ‰FONO}}
E-MAIL: 
export const dynamic = 'force-dynamic'
{{E-MAIL}}

export const dynamic = 'force-dynamic'

en adelante EL CLIENTE y en concepto de MANDANTE, dice y otorga:
export const dynamic = 'force-dynamic'


export const dynamic = 'force-dynamic'

Que por el presente documento confiere, con carÃ¡cter general, MANDATO de representaciÃ³n, a favor del Graduado Social debidamente colegiado y perteneciente al Colegio Oficial de Graduados Sociales de Barcelona, Girona y Lleida, para que promuevan, soliciten y realicen todos los trÃ¡mites necesarios para su actuaciÃ³n ante todos los Ã³rganos y entidades de la AdministraciÃ³n del Estado, AutonÃ³mica, Provincial y Local que resulten competentes, y especÃ­ficamente ante el Ministerio del Interior y el Ministerio de Justicia del Gobierno de EspaÃ±a.
export const dynamic = 'force-dynamic'


export const dynamic = 'force-dynamic'

Autoriza de forma expresa al mandante a la expediciÃ³n y uso de un certificado digital del cliente para la realizaciÃ³n de los trÃ¡mites que correspondan en su nombre.
export const dynamic = 'force-dynamic'


export const dynamic = 'force-dynamic'

El presente mandato, que se regirÃ¡ por los artÃ­culos 1709 a 1739 del CÃ³digo Civil, se confiere al amparo del artÃ­culo 5 de la Ley 39/2015, de 1 de Octubre, del Procedimiento Administrativo ComÃºn de las Administraciones PÃºblica.
export const dynamic = 'force-dynamic'


export const dynamic = 'force-dynamic'

El mandante autoriza a los mandatarios para que nombre sustituto, en caso de necesidad justificada, a favor de otro profesional colegiado ejerciente.
export const dynamic = 'force-dynamic'


export const dynamic = 'force-dynamic'

El mandante declara bajo su responsabilidad que cumple con los requisitos establecidos en la normativa vigente para obtener el reconocimiento de un derecho o facultad o para su ejercicio, que dispone de la documentaciÃ³n que asÃ­ lo acredita, que es autÃ©ntica y su contenido enteramente correcto.
export const dynamic = 'force-dynamic'


export const dynamic = 'force-dynamic'

En 
export const dynamic = 'force-dynamic'
{{CIUDAD}}, a {{FECHA}}

export const dynamic = 'force-dynamic'

EL MANDANTE                          EL MANDATARIO
export const dynamic = 'force-dynamic'

_____________________               _____________________`,
export const dynamic = 'force-dynamic'

  },
export const dynamic = 'force-dynamic'

  
export const dynamic = 'force-dynamic'
{
    name: 'contrato_residencia',
export const dynamic = 'force-dynamic'

    title: 'Contrato de Servicios - Solicitud de Residencia',
export const dynamic = 'force-dynamic'

    content: `CONTRATO DE SERVICIOS DE GESTORÃA
export const dynamic = 'force-dynamic'

Solicitud de AutorizaciÃ³n de Residencia en EspaÃ±a
export const dynamic = 'force-dynamic'


export const dynamic = 'force-dynamic'

Entre 
export const dynamic = 'force-dynamic'
{{nombreGestoria}} (en adelante, "GESTOR") y {{nombreCliente}} con pasaporte {{numeroPasaporte}} (en adelante, "CLIENTE").

export const dynamic = 'force-dynamic'

Se acuerda lo siguiente:
export const dynamic = 'force-dynamic'


export const dynamic = 'force-dynamic'

1. OBJETO DEL CONTRATO
export const dynamic = 'force-dynamic'

El GESTOR se compromete a prestar servicios profesionales de gestorÃ­a y asesoramiento en la tramitaciÃ³n de solicitud de AutorizaciÃ³n de Residencia en EspaÃ±a, de conformidad con la normativa vigente en materia de extranjerÃ­a.
export const dynamic = 'force-dynamic'


export const dynamic = 'force-dynamic'

2. SERVICIOS A PRESTAR
export const dynamic = 'force-dynamic'

- Asesoramiento jurÃ­dico y administrativo en el trÃ¡mite de residencia
export const dynamic = 'force-dynamic'

- RevisiÃ³n y preparaciÃ³n de documentaciÃ³n
export const dynamic = 'force-dynamic'

- PresentaciÃ³n de solicitud ante las autoridades competentes
export const dynamic = 'force-dynamic'

- Seguimiento del expediente administrativo
export const dynamic = 'force-dynamic'

- ComunicaciÃ³n periÃ³dica sobre el estado del trÃ¡mite
export const dynamic = 'force-dynamic'


export const dynamic = 'force-dynamic'

3. HONORARIOS Y FORMA DE PAGO
export const dynamic = 'force-dynamic'

Los honorarios acordados son de â‚¬
export const dynamic = 'force-dynamic'
{{honorarios}} mÃ¡s IVA (21%), totalizando â‚¬{{totalConIva}}.
Forma de pago: 
export const dynamic = 'force-dynamic'
{{formaPago}}
Plazo de pago: 
export const dynamic = 'force-dynamic'
{{plazoPago}} dÃ­as desde la factura

export const dynamic = 'force-dynamic'

4. DURACIÃ“N DEL CONTRATO
export const dynamic = 'force-dynamic'

Este contrato tendrÃ¡ una duraciÃ³n de 
export const dynamic = 'force-dynamic'
{{duracion}} meses a partir de la fecha de firma, prorrogable por acuerdo de ambas partes.

export const dynamic = 'force-dynamic'

5. OBLIGACIONES DEL GESTOR
export const dynamic = 'force-dynamic'

- Prestar los servicios con diligencia profesional
export const dynamic = 'force-dynamic'

- Mantener confidencialidad respecto a los datos e informaciÃ³n del cliente
export const dynamic = 'force-dynamic'

- Informar periÃ³dicamente sobre el estado de la tramitaciÃ³n
export const dynamic = 'force-dynamic'

- Actuar conforme a la normativa administrativa vigente
export const dynamic = 'force-dynamic'


export const dynamic = 'force-dynamic'

6. OBLIGACIONES DEL CLIENTE
export const dynamic = 'force-dynamic'

- Proporcionar toda la documentaciÃ³n requerida de forma oportuna
export const dynamic = 'force-dynamic'

- Comunicar cambios en sus datos personales o circunstancias
export const dynamic = 'force-dynamic'

- Realizar los pagos en los plazos establecidos
export const dynamic = 'force-dynamic'

- Facilitar la comunicaciÃ³n entre el gestor y las autoridades competentes
export const dynamic = 'force-dynamic'


export const dynamic = 'force-dynamic'

7. RESPONSABILIDADES
export const dynamic = 'force-dynamic'

El GESTOR no es responsable de:
export const dynamic = 'force-dynamic'

- Las resoluciones administrativas adoptadas por las autoridades competentes
export const dynamic = 'force-dynamic'

- Retrasos en la resoluciÃ³n de trÃ¡mites fuera de su control
export const dynamic = 'force-dynamic'

- Cambios en la normativa de extranjerÃ­a
export const dynamic = 'force-dynamic'


export const dynamic = 'force-dynamic'

8. RESOLUCIÃ“N DEL CONTRATO
export const dynamic = 'force-dynamic'

Cualquiera de las partes podrÃ¡ resolver este contrato mediante comunicaciÃ³n escrita con 15 dÃ­as de anticipaciÃ³n, salvo que exista causa justificada que requiera resoluciÃ³n inmediata.
export const dynamic = 'force-dynamic'


export const dynamic = 'force-dynamic'

9. JURISDICCIÃ“N
export const dynamic = 'force-dynamic'

Para cualquier controversia derivada de este contrato, las partes se someten a los juzgados y tribunales competentes.
export const dynamic = 'force-dynamic'


export const dynamic = 'force-dynamic'

Firmado en 
export const dynamic = 'force-dynamic'
{{ciudad}} a {{fecha}}

export const dynamic = 'force-dynamic'

El GESTOR                          El CLIENTE
export const dynamic = 'force-dynamic'


export const dynamic = 'force-dynamic'
{{nombreGestoria}}                 {{nombreCliente}}
NIF: 
export const dynamic = 'force-dynamic'
{{nifGestoria}}              Pasaporte: {{numeroPasaporte}}
_____________________             _____________________`,
export const dynamic = 'force-dynamic'

  },
export const dynamic = 'force-dynamic'

  
export const dynamic = 'force-dynamic'
{
    name: 'contrato_servicios_general',
export const dynamic = 'force-dynamic'

    title: 'Contrato de Servicios de GestorÃ­a - General',
export const dynamic = 'force-dynamic'

    content: `CONTRATO DE SERVICIOS DE GESTORÃA
export const dynamic = 'force-dynamic'


export const dynamic = 'force-dynamic'

Entre 
export const dynamic = 'force-dynamic'
{{nombreGestoria}} (en adelante, "GESTOR") y {{nombreCliente}} con pasaporte {{numeroPasaporte}} (en adelante, "CLIENTE").

export const dynamic = 'force-dynamic'

Se acuerda lo siguiente:
export const dynamic = 'force-dynamic'


export const dynamic = 'force-dynamic'

1. OBJETO DEL CONTRATO
export const dynamic = 'force-dynamic'

El GESTOR se compromete a prestar servicios de gestorÃ­a relacionados con 
export const dynamic = 'force-dynamic'
{{tipoTramite}}.

export const dynamic = 'force-dynamic'

2. HONORARIOS
export const dynamic = 'force-dynamic'

Los honorarios acordados son de â‚¬
export const dynamic = 'force-dynamic'
{{honorarios}} + IVA (21%).
Forma de pago: 
export const dynamic = 'force-dynamic'
{{formaPago}}

export const dynamic = 'force-dynamic'

3. DURACIÃ“N
export const dynamic = 'force-dynamic'

Este contrato tendrÃ¡ una duraciÃ³n de 
export const dynamic = 'force-dynamic'
{{duracion}} a partir de la fecha de firma.

export const dynamic = 'force-dynamic'

4. OBLIGACIONES DEL GESTOR
export const dynamic = 'force-dynamic'

- Realizar los trÃ¡mites administrativos necesarios
export const dynamic = 'force-dynamic'

- Comunicar periÃ³dicamente el estado de los trÃ¡mites
export const dynamic = 'force-dynamic'

- Mantener confidencialidad de los datos del cliente
export const dynamic = 'force-dynamic'


export const dynamic = 'force-dynamic'

5. OBLIGACIONES DEL CLIENTE
export const dynamic = 'force-dynamic'

- Proporcionar documentaciÃ³n necesaria
export const dynamic = 'force-dynamic'

- Realizar los pagos en el plazo establecido
export const dynamic = 'force-dynamic'

- Comunicar cambios en sus datos
export const dynamic = 'force-dynamic'


export const dynamic = 'force-dynamic'

Firmado en 
export const dynamic = 'force-dynamic'
{{ciudad}} a {{fecha}}

export const dynamic = 'force-dynamic'


export const dynamic = 'force-dynamic'
{{nombreGestoria}}                {{nombreCliente}}
_____________________            _____________________`,
export const dynamic = 'force-dynamic'

  },
export const dynamic = 'force-dynamic'

  
export const dynamic = 'force-dynamic'
{
    name: 'autorizacion_recurso',
export const dynamic = 'force-dynamic'

    title: 'AutorizaciÃ³n para Recurso',
export const dynamic = 'force-dynamic'

    content: `AUTORIZACIÃ“N PARA INTERPONER RECURSO
export const dynamic = 'force-dynamic'


export const dynamic = 'force-dynamic'

De una parte,
export const dynamic = 'force-dynamic'

NOMBRE Y APELLIDOS: 
export const dynamic = 'force-dynamic'
{{NOMBRE Y APELLIDOS}}
TIPO, PAÃS Y NÃšMERO DE DOCUMENTO: 
export const dynamic = 'force-dynamic'
{{TIPO, PAÃS Y NÃšMERO DE DOCUMENTO}}
DIRECCIÃ“N: 
export const dynamic = 'force-dynamic'
{{DIRECCIÃ“N}}
TELÃ‰FONO: 
export const dynamic = 'force-dynamic'
{{TELÃ‰FONO}}
E-MAIL: 
export const dynamic = 'force-dynamic'
{{E-MAIL}}

export const dynamic = 'force-dynamic'

en adelante EL CLIENTE, dice y otorga:
export const dynamic = 'force-dynamic'


export const dynamic = 'force-dynamic'

Que autoriza expresamente al Graduado Social debidamente colegiado para que interponga, en su nombre y representaciÃ³n, los recursos administrativos y/o judiciales que estime oportunos contra las resoluciones administrativas dictadas por la AdministraciÃ³n PÃºblica en relaciÃ³n con los trÃ¡mites de extranjerÃ­a.
export const dynamic = 'force-dynamic'


export const dynamic = 'force-dynamic'

El presente documento confiere poderes amplios al Graduado Social para que actÃºe en defensa de los derechos e intereses del cliente, incluyendo la facultad de interponer recursos administrativos, de reposiciÃ³n, de alzada, contencioso-administrativos, o cualquier otra acciÃ³n legal que resulte procedente.
export const dynamic = 'force-dynamic'


export const dynamic = 'force-dynamic'

El cliente se compromete a facilitar toda la informaciÃ³n y documentaciÃ³n que le sea solicitada para la correcta tramitaciÃ³n del recurso.
export const dynamic = 'force-dynamic'


export const dynamic = 'force-dynamic'

En 
export const dynamic = 'force-dynamic'
{{CIUDAD}}, a {{FECHA}}

export const dynamic = 'force-dynamic'

EL CLIENTE                          EL GRADUADO SOCIAL
export const dynamic = 'force-dynamic'

_____________________               _____________________`,
export const dynamic = 'force-dynamic'

  },
export const dynamic = 'force-dynamic'

  
export const dynamic = 'force-dynamic'
{
    name: 'renuncia_tramite',
export const dynamic = 'force-dynamic'

    title: 'Renuncia al TrÃ¡mite',
export const dynamic = 'force-dynamic'

    content: `RENUNCIA AL TRÃMITE
export const dynamic = 'force-dynamic'


export const dynamic = 'force-dynamic'

De una parte,
export const dynamic = 'force-dynamic'

NOMBRE Y APELLIDOS: 
export const dynamic = 'force-dynamic'
{{NOMBRE Y APELLIDOS}}
TIPO, PAÃS Y NÃšMERO DE DOCUMENTO: 
export const dynamic = 'force-dynamic'
{{TIPO, PAÃS Y NÃšMERO DE DOCUMENTO}}
DIRECCIÃ“N: 
export const dynamic = 'force-dynamic'
{{DIRECCIÃ“N}}
TELÃ‰FONO: 
export const dynamic = 'force-dynamic'
{{TELÃ‰FONO}}
E-MAIL: 
export const dynamic = 'force-dynamic'
{{E-MAIL}}

export const dynamic = 'force-dynamic'

en adelante EL CLIENTE, dice y otorga:
export const dynamic = 'force-dynamic'


export const dynamic = 'force-dynamic'

Que por el presente documento comunica su intenciÃ³n de renunciar al trÃ¡mite administrativo en materia de extranjerÃ­a iniciado con fecha 
export const dynamic = 'force-dynamic'
{{FECHA}}, bajo el cÃ³digo de expediente {{CÃ“DIGO_TRAMITE}}.

export const dynamic = 'force-dynamic'

El cliente es consciente de las consecuencias que puede tener esta renuncia y asume todas las responsabilidades derivadas de la misma.
export const dynamic = 'force-dynamic'


export const dynamic = 'force-dynamic'

Por este acto, se solicita formalmente la cancelaciÃ³n del expediente administrativo y la terminaciÃ³n de los servicios prestados por el Graduado Social en relaciÃ³n con el presente trÃ¡mite.
export const dynamic = 'force-dynamic'


export const dynamic = 'force-dynamic'

En 
export const dynamic = 'force-dynamic'
{{CIUDAD}}, a {{FECHA}}

export const dynamic = 'force-dynamic'

EL CLIENTE
export const dynamic = 'force-dynamic'

_____________________`,
export const dynamic = 'force-dynamic'

  },
export const dynamic = 'force-dynamic'

  
export const dynamic = 'force-dynamic'
{
    name: 'fraccionamiento_pago',
export const dynamic = 'force-dynamic'

    title: 'Adenda de Fraccionamiento de Pago',
export const dynamic = 'force-dynamic'

    content: `ADENDA AL CONTRATO PARA EL FRACCIONAMIENTO DE PAGO
export const dynamic = 'force-dynamic'


export const dynamic = 'force-dynamic'

En 
export const dynamic = 'force-dynamic'
{{CIUDAD}}, a {{FECHA}}

export const dynamic = 'force-dynamic'

REUNIDOS
export const dynamic = 'force-dynamic'


export const dynamic = 'force-dynamic'

De una parte, el Graduado Social debidamente colegiado en representaciÃ³n de Despacho Profesional, en adelante "EL PROFESIONAL".
export const dynamic = 'force-dynamic'


export const dynamic = 'force-dynamic'

Y de otra parte,
export const dynamic = 'force-dynamic'


export const dynamic = 'force-dynamic'

NOMBRE Y APELLIDOS: 
export const dynamic = 'force-dynamic'
{{NOMBRE Y APELLIDOS}}
TIPO, PAÃS Y NÃšMERO DE DOCUMENTO: 
export const dynamic = 'force-dynamic'
{{TIPO, PAÃS Y NÃšMERO DE DOCUMENTO}}

export const dynamic = 'force-dynamic'

en adelante "EL CLIENTE".
export const dynamic = 'force-dynamic'


export const dynamic = 'force-dynamic'

Ambas partes se reconocen mutuamente capacidad legal suficiente para contratar y ampliar el contrato principal con las siguientes:
export const dynamic = 'force-dynamic'


export const dynamic = 'force-dynamic'

CLÃUSULAS
export const dynamic = 'force-dynamic'


export const dynamic = 'force-dynamic'

Primera. Objeto de la adenda
export const dynamic = 'force-dynamic'


export const dynamic = 'force-dynamic'

La presente adenda regula el fraccionamiento del pago de los honorarios y suplidos pactados en el contrato principal.
export const dynamic = 'force-dynamic'


export const dynamic = 'force-dynamic'

Segunda. Importe Total
export const dynamic = 'force-dynamic'


export const dynamic = 'force-dynamic'

El importe total de los servicios es de 
export const dynamic = 'force-dynamic'
{{TOTAL A PAGAR EN LETRAS}}, desglosado de la siguiente forma:
- Honorarios: 
export const dynamic = 'force-dynamic'
{{IMPORTE SIN IMPUESTO EN LETRAS}}
- IVA (21%): 
export const dynamic = 'force-dynamic'
{{IMPORTE IVA EN LETRAS}}
- Tasas y Suplidos: 
export const dynamic = 'force-dynamic'
{{SUPLIDOS EN LETRAS}}

export const dynamic = 'force-dynamic'

Tercera. Plan de Fraccionamiento
export const dynamic = 'force-dynamic'


export const dynamic = 'force-dynamic'

El cliente se obliga al pago del importe anterior en los siguientes vencimientos:
export const dynamic = 'force-dynamic'


export const dynamic = 'force-dynamic'


export const dynamic = 'force-dynamic'
{{DETALLE VENCIMIENTOS}}

export const dynamic = 'force-dynamic'

Cuarta. Consecuencias del impago
export const dynamic = 'force-dynamic'


export const dynamic = 'force-dynamic'

En caso de incumplimiento de cualquiera de los plazos el profesional podrÃ¡:
export const dynamic = 'force-dynamic'

1. Suspender temporal o definitivamente la prestaciÃ³n del servicio
export const dynamic = 'force-dynamic'

2. Resolver el contrato, conservando los importes ya abonados
export const dynamic = 'force-dynamic'

3. Entender por desistido el procedimiento administrativo
export const dynamic = 'force-dynamic'


export const dynamic = 'force-dynamic'

Quinta. IntegraciÃ³n contractual
export const dynamic = 'force-dynamic'


export const dynamic = 'force-dynamic'

La presente adenda forma parte inseparable del contrato principal.
export const dynamic = 'force-dynamic'


export const dynamic = 'force-dynamic'

Y para que asÃ­ conste, firman el presente contrato por duplicado y a un solo efecto, en el lugar y fecha arriba indicados.
export const dynamic = 'force-dynamic'


export const dynamic = 'force-dynamic'

EL PROFESIONAL                     EL CLIENTE
export const dynamic = 'force-dynamic'

_____________________              _____________________`,
export const dynamic = 'force-dynamic'

  },
export const dynamic = 'force-dynamic'

  
export const dynamic = 'force-dynamic'
{
    name: 'factura_proforma',
export const dynamic = 'force-dynamic'

    title: 'Factura Proforma',
export const dynamic = 'force-dynamic'

    content: `FACTURA PROFORMA
export const dynamic = 'force-dynamic'


export const dynamic = 'force-dynamic'

DATOS DEL EMISOR:
export const dynamic = 'force-dynamic'

GestorÃ­a: 
export const dynamic = 'force-dynamic'
{{nombreGestoria}}
NIF/CIF: 
export const dynamic = 'force-dynamic'
{{nifGestoria}}
DirecciÃ³n: 
export const dynamic = 'force-dynamic'
{{direccionGestoria}}

export const dynamic = 'force-dynamic'

DATOS DEL CLIENTE:
export const dynamic = 'force-dynamic'

Nombre: 
export const dynamic = 'force-dynamic'
{{nombreCliente}}
Pasaporte: 
export const dynamic = 'force-dynamic'
{{numeroPasaporte}}
Email: 
export const dynamic = 'force-dynamic'
{{emailCliente}}

export const dynamic = 'force-dynamic'

NÃšMERO DE FACTURA: 
export const dynamic = 'force-dynamic'
{{numeroFactura}}
FECHA: 
export const dynamic = 'force-dynamic'
{{fecha}}

export const dynamic = 'force-dynamic'

CONCEPTO: 
export const dynamic = 'force-dynamic'
{{concepto}}
Cantidad: 
export const dynamic = 'force-dynamic'
{{cantidad}}
Precio unitario: â‚¬
export const dynamic = 'force-dynamic'
{{precioUnitario}}

export const dynamic = 'force-dynamic'

Subtotal: â‚¬
export const dynamic = 'force-dynamic'
{{subtotal}}
IVA (21%): â‚¬
export const dynamic = 'force-dynamic'
{{iva}}
TOTAL: â‚¬
export const dynamic = 'force-dynamic'
{{total}}

export const dynamic = 'force-dynamic'

NOTAS: 
export const dynamic = 'force-dynamic'
{{notas}}

export const dynamic = 'force-dynamic'

Esta es una factura proforma.`,
export const dynamic = 'force-dynamic'

  },
export const dynamic = 'force-dynamic'

]
export const dynamic = 'force-dynamic'


export const dynamic = 'force-dynamic'

async function checkAndDeleteDuplicates(drive: any, plantillaFolderId: string) 
export const dynamic = 'force-dynamic'
{
  try 
export const dynamic = 'force-dynamic'
{
    const response = await drive.files.list(
export const dynamic = 'force-dynamic'
{
      q: `'$
export const dynamic = 'force-dynamic'
{plantillaFolderId}' in parents and trashed=false and mimeType='application/vnd.google-apps.document'`,
      fields: 'files(id, name)',
export const dynamic = 'force-dynamic'

      pageSize: 100,
export const dynamic = 'force-dynamic'

    })
export const dynamic = 'force-dynamic'


export const dynamic = 'force-dynamic'

    const filesByName: 
export const dynamic = 'force-dynamic'
{ [key: string]: string[] } = {}
    for (const file of response.data.files || []) 
export const dynamic = 'force-dynamic'
{
      if (!filesByName[file.name]) 
export const dynamic = 'force-dynamic'
{
        filesByName[file.name] = []
export const dynamic = 'force-dynamic'

      }
export const dynamic = 'force-dynamic'

      filesByName[file.name].push(file.id)
export const dynamic = 'force-dynamic'

    }
export const dynamic = 'force-dynamic'


export const dynamic = 'force-dynamic'

    for (const [name, ids] of Object.entries(filesByName)) 
export const dynamic = 'force-dynamic'
{
      if (ids.length > 1) 
export const dynamic = 'force-dynamic'
{
        for (let i = 1; i < ids.length; i++) 
export const dynamic = 'force-dynamic'
{
          await drive.files.delete(
export const dynamic = 'force-dynamic'
{ fileId: ids[i] })
        }
export const dynamic = 'force-dynamic'

      }
export const dynamic = 'force-dynamic'

    }
export const dynamic = 'force-dynamic'

  } catch (error) 
export const dynamic = 'force-dynamic'
{
    console.error('Error checking duplicates:', error)
export const dynamic = 'force-dynamic'

  }
export const dynamic = 'force-dynamic'

}
export const dynamic = 'force-dynamic'


export const dynamic = 'force-dynamic'

export async function POST() 
export const dynamic = 'force-dynamic'
{
  try 
export const dynamic = 'force-dynamic'
{
    const session = await getServerSession(authOptions)
export const dynamic = 'force-dynamic'


export const dynamic = 'force-dynamic'

    if (!session?.accessToken) 
export const dynamic = 'force-dynamic'
{
      return NextResponse.json(
export const dynamic = 'force-dynamic'

        
export const dynamic = 'force-dynamic'
{ error: 'No autenticado' },
        
export const dynamic = 'force-dynamic'
{ status: 401 }
      )
export const dynamic = 'force-dynamic'

    }
export const dynamic = 'force-dynamic'


export const dynamic = 'force-dynamic'

    const oauth2Client = new google.auth.OAuth2()
export const dynamic = 'force-dynamic'

    oauth2Client.setCredentials(
export const dynamic = 'force-dynamic'
{
      access_token: session.accessToken,
export const dynamic = 'force-dynamic'

    })
export const dynamic = 'force-dynamic'


export const dynamic = 'force-dynamic'

    const drive = google.drive(
export const dynamic = 'force-dynamic'
{ version: 'v3', auth: oauth2Client })
    const docs = google.docs(
export const dynamic = 'force-dynamic'
{ version: 'v1', auth: oauth2Client })

export const dynamic = 'force-dynamic'

    await checkAndDeleteDuplicates(drive, PLANTILLAS_FOLDER_ID)
export const dynamic = 'force-dynamic'


export const dynamic = 'force-dynamic'

    const results = []
export const dynamic = 'force-dynamic'


export const dynamic = 'force-dynamic'

    for (const template of TEMPLATES) 
export const dynamic = 'force-dynamic'
{
      try 
export const dynamic = 'force-dynamic'
{
        const fileMetadata = 
export const dynamic = 'force-dynamic'
{
          name: template.name,
export const dynamic = 'force-dynamic'

          parents: [PLANTILLAS_FOLDER_ID],
export const dynamic = 'force-dynamic'

          mimeType: 'application/vnd.google-apps.document',
export const dynamic = 'force-dynamic'

        }
export const dynamic = 'force-dynamic'


export const dynamic = 'force-dynamic'

        const file = await drive.files.create(
export const dynamic = 'force-dynamic'
{
          requestBody: fileMetadata,
export const dynamic = 'force-dynamic'

          fields: 'id',
export const dynamic = 'force-dynamic'

        })
export const dynamic = 'force-dynamic'


export const dynamic = 'force-dynamic'

        const documentId = file.data.id
export const dynamic = 'force-dynamic'

        if (!documentId) throw new Error('No document ID returned from Google')
export const dynamic = 'force-dynamic'


export const dynamic = 'force-dynamic'

        await docs.documents.batchUpdate(
export const dynamic = 'force-dynamic'
{
          documentId,
export const dynamic = 'force-dynamic'

          requestBody: 
export const dynamic = 'force-dynamic'
{
            requests: [
export const dynamic = 'force-dynamic'

              
export const dynamic = 'force-dynamic'
{
                insertText: 
export const dynamic = 'force-dynamic'
{
                  text: template.content,
export const dynamic = 'force-dynamic'

                  location: 
export const dynamic = 'force-dynamic'
{ index: 1 },
                },
export const dynamic = 'force-dynamic'

              },
export const dynamic = 'force-dynamic'

            ],
export const dynamic = 'force-dynamic'

          },
export const dynamic = 'force-dynamic'

        })
export const dynamic = 'force-dynamic'


export const dynamic = 'force-dynamic'

        results.push(
export const dynamic = 'force-dynamic'
{
          name: template.name,
export const dynamic = 'force-dynamic'

          documentId,
export const dynamic = 'force-dynamic'

          status: 'success',
export const dynamic = 'force-dynamic'

        })
export const dynamic = 'force-dynamic'

      } catch (error) 
export const dynamic = 'force-dynamic'
{
        results.push(
export const dynamic = 'force-dynamic'
{
          name: template.name,
export const dynamic = 'force-dynamic'

          status: 'error',
export const dynamic = 'force-dynamic'

          error: error instanceof Error ? error.message : 'Error desconocido',
export const dynamic = 'force-dynamic'

        })
export const dynamic = 'force-dynamic'

      }
export const dynamic = 'force-dynamic'

    }
export const dynamic = 'force-dynamic'


export const dynamic = 'force-dynamic'

    return NextResponse.json(
export const dynamic = 'force-dynamic'
{
      message: 'Plantillas creadas',
export const dynamic = 'force-dynamic'

      results,
export const dynamic = 'force-dynamic'

    })
export const dynamic = 'force-dynamic'

  } catch (error) 
export const dynamic = 'force-dynamic'
{
    console.error('Error creando plantillas:', error)
export const dynamic = 'force-dynamic'

    return NextResponse.json(
export const dynamic = 'force-dynamic'

      
export const dynamic = 'force-dynamic'
{ error: error instanceof Error ? error.message : 'Error al crear plantillas' },
      
export const dynamic = 'force-dynamic'
{ status: 500 }
    )
export const dynamic = 'force-dynamic'

  }
export const dynamic = 'force-dynamic'

}
export const dynamic = 'force-dynamic'

