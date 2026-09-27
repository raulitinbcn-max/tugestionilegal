// Validadores de documentos españoles

export function validarDNI(dni: string): boolean {
  const dniRegex = /^[0-9]{8}[TRWAGMYFPDXBNJZSQVHLCKE]$/i
  if (!dniRegex.test(dni.toUpperCase())) return false

  const numero = parseInt(dni.substring(0, 8))
  const letras = 'TRWAGMYFPDXBNJZSQVHLCKE'
  const letraValida = letras[numero % 23]

  return dni[8].toUpperCase() === letraValida
}

export function validarNIE(nie: string): boolean {
  const nieRegex = /^[XYZ][0-9]{7}[TRWAGMYFPDXBNJZSQVHLCKE]$/i
  if (!nieRegex.test(nie.toUpperCase())) return false

  const nieUpper = nie.toUpperCase()
  let numero = nieUpper[0] === 'X' ? '0' : nieUpper[0] === 'Y' ? '1' : '2'
  numero += nieUpper.substring(1, 8)

  const letras = 'TRWAGMYFPDXBNJZSQVHLCKE'
  const letraValida = letras[parseInt(numero) % 23]

  return nieUpper[8] === letraValida
}

export function validarNIF(nif: string): boolean {
  const nifRegex = /^[0-9]{8}[TRWAGMYFPDXBNJZSQVHLCKE]$/i
  if (!nifRegex.test(nif.toUpperCase())) return false

  const numero = parseInt(nif.substring(0, 8))
  const letras = 'TRWAGMYFPDXBNJZSQVHLCKE'
  const letraValida = letras[numero % 23]

  return nif[8].toUpperCase() === letraValida
}

export function validarDocumento(
  tipo: string,
  numero: string
): { valido: boolean; error?: string } {
  if (!numero || !tipo) {
    return { valido: false, error: 'Documento incompleto' }
  }

  const numeroLimpio = numero.trim().toUpperCase()

  switch (tipo) {
    case 'DNI':
      if (!validarDNI(numeroLimpio)) {
        return { valido: false, error: 'DNI inválido (verificar letra)' }
      }
      return { valido: true }

    case 'NIE':
      if (!validarNIE(numeroLimpio)) {
        return { valido: false, error: 'NIE inválido (verificar letra)' }
      }
      return { valido: true }

    case 'NIF/CIF':
      if (!validarNIF(numeroLimpio)) {
        return { valido: false, error: 'NIF/CIF inválido (verificar letra)' }
      }
      return { valido: true }

    case 'Pasaporte':
      if (numeroLimpio.length < 5) {
        return { valido: false, error: 'Pasaporte muy corto' }
      }
      return { valido: true }

    case 'Otro':
      if (numeroLimpio.length < 3) {
        return { valido: false, error: 'Documento muy corto' }
      }
      return { valido: true }

    default:
      return { valido: false, error: 'Tipo de documento desconocido' }
  }
}

export const PAISES = [
  'Afganistán', 'Albania', 'Alemania', 'Andorra', 'Angola', 'Argentina', 'Armenia', 'Australia',
  'Austria', 'Azerbaiyán', 'Bahamas', 'Bangladés', 'Barbados', 'Baréin', 'Bélgica', 'Belice',
  'Benín', 'Bielorrusia', 'Birmania', 'Bolivia', 'Bosnia y Herzegovina', 'Botsuana', 'Brasil',
  'Brunei', 'Bulgaria', 'Burkina Faso', 'Burundi', 'Bután', 'Cabo Verde', 'Camboya', 'Camerún',
  'Canadá', 'Catar', 'Chad', 'Chile', 'China', 'Chipre', 'Colombia', 'Comoras', 'Congo',
  'Corea del Norte', 'Corea del Sur', 'Costa Rica', 'Croacia', 'Cuba', 'Dinamarca', 'Djibuti',
  'Dominica', 'República Dominicana', 'Ecuador', 'Egipto', 'Emiratos Árabes Unidos',
  'El Salvador', 'Eritrea', 'Eslovaquia', 'Eslovenia', 'España', 'Estados Unidos', 'Estonia',
  'Eswatini', 'Etiopía', 'Filipinas', 'Finlandia', 'Fiyi', 'Francia', 'Gabón', 'Gambia',
  'Georgia', 'Gibraltar', 'Grecia', 'Groenlandia', 'Guadalupe', 'Guam', 'Guatemala',
  'Guayana Francesa', 'Guayana Holandesa', 'Guernésey', 'Guinea', 'Guinea Ecuatorial',
  'Guinea-Bisáu', 'Guyana', 'Haití', 'Holanda', 'Honduras', 'Hong Kong', 'Hungría', 'Irak',
  'Irán', 'Irlanda', 'Islandia', 'Islas Åland', 'Islas Caimán', 'Islas Cocos', 'Islas Cook',
  'Islas Feroe', 'Islas Malvinas', 'Islas Marianas del Norte', 'Islas Marshall', 'Islas Salomón',
  'Islas Turcas y Caicos', 'Islas Vírgenes Británicas', 'Islas Vírgenes de EE.UU.', 'Israel',
  'Italia', 'Jamaica', 'Japón', 'Jersey', 'Jordania', 'Kazajistán', 'Kenia', 'Kirguistán',
  'Kiribati', 'Kuwait', 'Laos', 'Lesoto', 'Letonia', 'Líbano', 'Liberia', 'Libia',
  'Liechtenstein', 'Lituania', 'Luxemburgo', 'Macao', 'Macedonia del Norte', 'Madagascar',
  'Malasia', 'Malaui', 'Maldivas', 'Mali', 'Malta', 'Marruecos', 'Martinica', 'Mauricio',
  'Mauritania', 'Mayotte', 'Méjico', 'Micronesia', 'Moldavia', 'Mónaco', 'Mongolia',
  'Montenegro', 'Montserrat', 'Mozambique', 'Namibia', 'Nauru', 'Nepal', 'Nicaragua', 'Níger',
  'Nigeria', 'Niue', 'Noruega', 'Nueva Caledonia', 'Nueva Zelanda', 'Omán', 'Pakistán', 'Palaos',
  'Palestina', 'Panamá', 'Papúa Nueva Guinea', 'Paraguay', 'Países Bajos', 'Perú', 'Polinesia Francesa',
  'Polonia', 'Portugal', 'Puerto Rico', 'Qatar', 'Reino Unido', 'República Centroafricana',
  'República Checa', 'República Democrática del Congo', 'República del Congo', 'Reunión', 'Ruanda',
  'Rumania', 'Rusia', 'Sahara Occidental', 'Samoa', 'Samoa Americana', 'San Bartolomé', 'San Cristóbal y Nieves',
  'San Marino', 'San Martín', 'San Pedro y Miquelón', 'Santa Elena', 'Santa Lucía', 'Santo Tomé y Príncipe',
  'Senegal', 'Serbia', 'Seychelles', 'Sierra Leona', 'Singapur', 'Siria', 'Somalia', 'Sri Lanka',
  'Sudáfrica', 'Sudán', 'Sudán del Sur', 'Suecia', 'Suiza', 'Surinam', 'Svalbard y Jan Mayen',
  'Tailandia', 'Taiwán', 'Tanzania', 'Tayikistán', 'Timor Oriental', 'Togo', 'Tokelau', 'Tonga',
  'Trinidad y Tobago', 'Túnez', 'Turkmenistán', 'Tuvalú', 'Ucrania', 'Uganda', 'Unión Soviética',
  'Uruguay', 'Uzbekistán', 'Vanuatu', 'Vaticano', 'Venezuela', 'Vietnam', 'Wallis y Futuna',
  'Yemen', 'Yibuti', 'Zambia', 'Zimbabue'
]
