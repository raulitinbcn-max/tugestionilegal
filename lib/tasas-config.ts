export interface TasaConfig {
  nombre: string
  importe: number
}

export const TASAS_POR_TRAMITE: Record<string, TasaConfig[]> = {
  "Arraigo Sociolaboral": [
    {
      "nombre": "Tasa Arraigo Sociolaboral",
      "importe": 38.28
    }
  ],
  "Nacionalidad por residencia": [
    {
      "nombre": "Tasa Nacionalidad",
      "importe": 104.05
    }
  ]
}

export function getTasasPorTramite(tipoTramite: string): TasaConfig[] {
  return TASAS_POR_TRAMITE[tipoTramite] || []
}
