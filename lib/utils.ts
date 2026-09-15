export function generateTramiteCode(): string {
  const timestamp = Date.now()
  const random = Math.floor(Math.random() * 10000)
  const code = String(random).padStart(5, '0')
  return `TR-${code}`
}

export function extractTramiteCodeFromFilename(filename: string): string | null {
  const match = filename.match(/^([A-Z]{2}-\d+)_/)
  return match ? match[1] : null
}

export function formatCurrency(value: number | null | undefined): string {
  if (!value) return '—'
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
  }).format(value)
}

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return '—'
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('es-ES')
}

export function capitalizeFirst(str: string): string {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}
