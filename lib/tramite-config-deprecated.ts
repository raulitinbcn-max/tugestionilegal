// ⚠️ DEPRECATED: Archivo de compatibilidad temporal
// Este archivo proporciona un stub para TRAMITE_CONFIGS que se usaba antes
// Los datos reales ahora vienen de la BD

export const TRAMITE_CONFIGS: Record<string, any> = {
  'Arraigo Sociolaboral': {
    tipo: 'Arraigo Sociolaboral',
    categoria: 'trabajo',
  },
  'Nacionalidad por residencia': {
    tipo: 'Nacionalidad por residencia',
    categoria: 'nacionalidad',
  },
  'Cambio de nombre': {
    tipo: 'Cambio de nombre',
    categoria: 'dgt',
  },
  'Trámite General': {
    tipo: 'Trámite General',
    categoria: null,
  },
}

export const TIPOS_TRAMITE = Object.keys(TRAMITE_CONFIGS)

export function getTramiteConfig(tipoTramite: string) {
  return TRAMITE_CONFIGS[tipoTramite] || TRAMITE_CONFIGS['Trámite General']
}
