export interface TramiteConfig {
  nombre: string
  descripcion: string
  plantillasDisponibles: string[]
  camposRequeridos: string[]
  categoria?: string
}

export const TRAMITE_CONFIGS: Record<string, TramiteConfig> = {
  "Arraigo Sociolaboral": {
    "nombre": "Arraigo Sociolaboral",
    "descripcion": "Solicitud de arraigo social o laboral en España",
    "plantillasDisponibles": [],
    "camposRequeridos": [],
    "categoria": "trabajo"
  },
  "Nacionalidad por residencia": {
    "nombre": "Nacionalidad por residencia",
    "descripcion": "Solicitud de nacionalidad española por residencia",
    "plantillasDisponibles": [],
    "camposRequeridos": [],
    "categoria": "nacionalidad"
  },
  "Cambio de nombre": {
    "nombre": "Cambio de nombre",
    "descripcion": "Trámite de cambio de nombre",
    "plantillasDisponibles": [],
    "camposRequeridos": [],
    "categoria": "dgt"
  }
}

export const TIPOS_TRAMITE = Object.keys(TRAMITE_CONFIGS)

export function getTramiteConfig(tipoTramite: string): TramiteConfig {
  return TRAMITE_CONFIGS[tipoTramite] || TRAMITE_CONFIGS['Otro']
}

export function getPlantillasDisponibles(tipoTramite: string): string[] {
  const config = getTramiteConfig(tipoTramite)
  return config.plantillasDisponibles
}
