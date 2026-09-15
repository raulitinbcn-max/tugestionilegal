function convertirNumeroALetras(num: number): string {
  const unidades = ['', 'uno', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve']
  const decenas = ['', '', 'veinte', 'treinta', 'cuarenta', 'cincuenta', 'sesenta', 'setenta', 'ochenta', 'noventa']
  const especiales = ['diez', 'once', 'doce', 'trece', 'catorce', 'quince', 'dieciséis', 'diecisiete', 'dieciocho', 'diecinueve']
  const centenas = ['', 'ciento', 'doscientos', 'trescientos', 'cuatrocientos', 'quinientos', 'seiscientos', 'setecientos', 'ochocientos', 'novecientos']

  if (num === 0) return 'cero'

  let resultado = ''

  if (num === 1) {
    resultado = 'uno'
  } else if (num < 10) {
    resultado = unidades[num]
  } else if (num < 20) {
    resultado = especiales[num - 10]
  } else if (num < 100) {
    const dec = Math.floor(num / 10)
    const uni = num % 10
    if (uni === 0) {
      resultado = decenas[dec]
    } else {
      resultado = decenas[dec] + ' y ' + unidades[uni]
    }
  } else if (num < 1000) {
    const cent = Math.floor(num / 100)
    const resto = num % 100
    resultado = centenas[cent]
    if (resto > 0) {
      if (resto < 10) {
        resultado += ' ' + unidades[resto]
      } else if (resto < 20) {
        resultado += ' ' + especiales[resto - 10]
      } else {
        const dec = Math.floor(resto / 10)
        const uni = resto % 10
        if (uni === 0) {
          resultado += ' ' + decenas[dec]
        } else {
          resultado += ' ' + decenas[dec] + ' y ' + unidades[uni]
        }
      }
    }
  } else if (num < 1000000) {
    const miles = Math.floor(num / 1000)
    const resto = num % 1000
    if (miles === 1) {
      resultado = 'mil'
    } else {
      resultado = convertirNumeroALetras(miles) + ' mil'
    }
    if (resto > 0) {
      resultado += ' ' + convertirNumeroALetras(resto)
    }
  }

  return resultado
}

export function numeroALetras(numero: number): string {
  // Separar euros y céntimos
  const euros = Math.floor(numero)
  const centimos = Math.round((numero - euros) * 100)

  let resultado = ''

  // Procesar euros
  if (euros > 0) {
    resultado = convertirNumeroALetras(euros) + ' euros'
  } else if (centimos > 0) {
    resultado = ''
  } else {
    return 'cero euros'
  }

  // Procesar céntimos en letras
  if (centimos > 0) {
    resultado += ' con ' + convertirNumeroALetras(centimos) + ' céntimos'
  }

  // Retornar todo en minúsculas
  return resultado.toLowerCase()
}
