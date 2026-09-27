// Tabla simplificada de códigos postales españoles (primeros dígitos = provincia)
// Formato: { codigoPostal: string, poblacion: string, provincia: string }

export const POSTAL_CODES: Record<string, { poblacion: string; provincia: string }> = {
  // Madrid (28)
  '28001': { poblacion: 'Madrid', provincia: 'Madrid' },
  '28002': { poblacion: 'Madrid', provincia: 'Madrid' },
  '28003': { poblacion: 'Madrid', provincia: 'Madrid' },
  '28004': { poblacion: 'Madrid', provincia: 'Madrid' },
  '28005': { poblacion: 'Madrid', provincia: 'Madrid' },
  '28006': { poblacion: 'Madrid', provincia: 'Madrid' },
  '28007': { poblacion: 'Madrid', provincia: 'Madrid' },
  '28008': { poblacion: 'Madrid', provincia: 'Madrid' },
  '28009': { poblacion: 'Madrid', provincia: 'Madrid' },
  '28010': { poblacion: 'Madrid', provincia: 'Madrid' },

  // Barcelona (08)
  '08001': { poblacion: 'Barcelona', provincia: 'Barcelona' },
  '08002': { poblacion: 'Barcelona', provincia: 'Barcelona' },
  '08003': { poblacion: 'Barcelona', provincia: 'Barcelona' },
  '08004': { poblacion: 'Barcelona', provincia: 'Barcelona' },
  '08005': { poblacion: 'Barcelona', provincia: 'Barcelona' },
  '08006': { poblacion: 'Barcelona', provincia: 'Barcelona' },
  '08007': { poblacion: 'Barcelona', provincia: 'Barcelona' },
  '08008': { poblacion: 'Barcelona', provincia: 'Barcelona' },
  '08009': { poblacion: 'Barcelona', provincia: 'Barcelona' },
  '08010': { poblacion: 'Barcelona', provincia: 'Barcelona' },

  // Valencia (46)
  '46001': { poblacion: 'Valencia', provincia: 'Valencia' },
  '46002': { poblacion: 'Valencia', provincia: 'Valencia' },
  '46003': { poblacion: 'Valencia', provincia: 'Valencia' },
  '46004': { poblacion: 'Valencia', provincia: 'Valencia' },
  '46005': { poblacion: 'Valencia', provincia: 'Valencia' },
  '46006': { poblacion: 'Valencia', provincia: 'Valencia' },
  '46007': { poblacion: 'Valencia', provincia: 'Valencia' },
  '46008': { poblacion: 'Valencia', provincia: 'Valencia' },
  '46009': { poblacion: 'Valencia', provincia: 'Valencia' },
  '46010': { poblacion: 'Valencia', provincia: 'Valencia' },

  // Sevilla (41)
  '41001': { poblacion: 'Sevilla', provincia: 'Sevilla' },
  '41002': { poblacion: 'Sevilla', provincia: 'Sevilla' },
  '41003': { poblacion: 'Sevilla', provincia: 'Sevilla' },
  '41004': { poblacion: 'Sevilla', provincia: 'Sevilla' },
  '41005': { poblacion: 'Sevilla', provincia: 'Sevilla' },
  '41006': { poblacion: 'Sevilla', provincia: 'Sevilla' },
  '41007': { poblacion: 'Sevilla', provincia: 'Sevilla' },
  '41008': { poblacion: 'Sevilla', provincia: 'Sevilla' },
  '41009': { poblacion: 'Sevilla', provincia: 'Sevilla' },
  '41010': { poblacion: 'Sevilla', provincia: 'Sevilla' },

  // Bilbao (48)
  '48001': { poblacion: 'Bilbao', provincia: 'Vizcaya' },
  '48002': { poblacion: 'Bilbao', provincia: 'Vizcaya' },
  '48003': { poblacion: 'Bilbao', provincia: 'Vizcaya' },
  '48004': { poblacion: 'Bilbao', provincia: 'Vizcaya' },
  '48005': { poblacion: 'Bilbao', provincia: 'Vizcaya' },
  '48006': { poblacion: 'Bilbao', provincia: 'Vizcaya' },
  '48007': { poblacion: 'Bilbao', provincia: 'Vizcaya' },
  '48008': { poblacion: 'Bilbao', provincia: 'Vizcaya' },
  '48009': { poblacion: 'Bilbao', provincia: 'Vizcaya' },
  '48010': { poblacion: 'Bilbao', provincia: 'Vizcaya' },

  // Málaga (29)
  '29001': { poblacion: 'Málaga', provincia: 'Málaga' },
  '29002': { poblacion: 'Málaga', provincia: 'Málaga' },
  '29003': { poblacion: 'Málaga', provincia: 'Málaga' },
  '29004': { poblacion: 'Málaga', provincia: 'Málaga' },
  '29005': { poblacion: 'Málaga', provincia: 'Málaga' },
  '29006': { poblacion: 'Málaga', provincia: 'Málaga' },
  '29007': { poblacion: 'Málaga', provincia: 'Málaga' },
  '29008': { poblacion: 'Málaga', provincia: 'Málaga' },
  '29009': { poblacion: 'Málaga', provincia: 'Málaga' },
  '29010': { poblacion: 'Málaga', provincia: 'Málaga' },

  // Zaragoza (50)
  '50001': { poblacion: 'Zaragoza', provincia: 'Zaragoza' },
  '50002': { poblacion: 'Zaragoza', provincia: 'Zaragoza' },
  '50003': { poblacion: 'Zaragoza', provincia: 'Zaragoza' },
  '50004': { poblacion: 'Zaragoza', provincia: 'Zaragoza' },
  '50005': { poblacion: 'Zaragoza', provincia: 'Zaragoza' },
  '50006': { poblacion: 'Zaragoza', provincia: 'Zaragoza' },
  '50007': { poblacion: 'Zaragoza', provincia: 'Zaragoza' },
  '50008': { poblacion: 'Zaragoza', provincia: 'Zaragoza' },
  '50009': { poblacion: 'Zaragoza', provincia: 'Zaragoza' },
  '50010': { poblacion: 'Zaragoza', provincia: 'Zaragoza' },

  // Palma (07)
  '07001': { poblacion: 'Palma', provincia: 'Islas Baleares' },
  '07002': { poblacion: 'Palma', provincia: 'Islas Baleares' },
  '07003': { poblacion: 'Palma', provincia: 'Islas Baleares' },
  '07004': { poblacion: 'Palma', provincia: 'Islas Baleares' },
  '07005': { poblacion: 'Palma', provincia: 'Islas Baleares' },
  '07006': { poblacion: 'Palma', provincia: 'Islas Baleares' },
  '07007': { poblacion: 'Palma', provincia: 'Islas Baleares' },
  '07008': { poblacion: 'Palma', provincia: 'Islas Baleares' },
  '07009': { poblacion: 'Palma', provincia: 'Islas Baleares' },
  '07010': { poblacion: 'Palma', provincia: 'Islas Baleares' },

  // Murcia (30)
  '30001': { poblacion: 'Murcia', provincia: 'Murcia' },
  '30002': { poblacion: 'Murcia', provincia: 'Murcia' },
  '30003': { poblacion: 'Murcia', provincia: 'Murcia' },
  '30004': { poblacion: 'Murcia', provincia: 'Murcia' },
  '30005': { poblacion: 'Murcia', provincia: 'Murcia' },
  '30006': { poblacion: 'Murcia', provincia: 'Murcia' },
  '30007': { poblacion: 'Murcia', provincia: 'Murcia' },
  '30008': { poblacion: 'Murcia', provincia: 'Murcia' },
  '30009': { poblacion: 'Murcia', provincia: 'Murcia' },
  '30010': { poblacion: 'Murcia', provincia: 'Murcia' },

  // Alicante (03)
  '03001': { poblacion: 'Alicante', provincia: 'Alicante' },
  '03002': { poblacion: 'Alicante', provincia: 'Alicante' },
  '03003': { poblacion: 'Alicante', provincia: 'Alicante' },
  '03004': { poblacion: 'Alicante', provincia: 'Alicante' },
  '03005': { poblacion: 'Alicante', provincia: 'Alicante' },
  '03006': { poblacion: 'Alicante', provincia: 'Alicante' },
  '03007': { poblacion: 'Alicante', provincia: 'Alicante' },
  '03008': { poblacion: 'Alicante', provincia: 'Alicante' },
  '03009': { poblacion: 'Alicante', provincia: 'Alicante' },
  '03010': { poblacion: 'Alicante', provincia: 'Alicante' },

  // Córdoba (14)
  '14001': { poblacion: 'Córdoba', provincia: 'Córdoba' },
  '14002': { poblacion: 'Córdoba', provincia: 'Córdoba' },
  '14003': { poblacion: 'Córdoba', provincia: 'Córdoba' },
  '14004': { poblacion: 'Córdoba', provincia: 'Córdoba' },
  '14005': { poblacion: 'Córdoba', provincia: 'Córdoba' },
  '14006': { poblacion: 'Córdoba', provincia: 'Córdoba' },
  '14007': { poblacion: 'Córdoba', provincia: 'Córdoba' },
  '14008': { poblacion: 'Córdoba', provincia: 'Córdoba' },
  '14009': { poblacion: 'Córdoba', provincia: 'Córdoba' },
  '14010': { poblacion: 'Córdoba', provincia: 'Córdoba' },

  // Alacalá de Henares (28)
  '28801': { poblacion: 'Alcalá de Henares', provincia: 'Madrid' },
  '28802': { poblacion: 'Alcalá de Henares', provincia: 'Madrid' },
  '28803': { poblacion: 'Alcalá de Henares', provincia: 'Madrid' },
  '28804': { poblacion: 'Alcalá de Henares', provincia: 'Madrid' },
  '28805': { poblacion: 'Alcalá de Henares', provincia: 'Madrid' },
}

export function getLocationFromPostalCode(codigoPostal: string): { poblacion: string; provincia: string } | null {
  return POSTAL_CODES[codigoPostal] || null
}
