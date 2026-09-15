'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'

interface Props {
  tramiteId: string
  documentosGenerados: any[]
  onDocumentoGenerado: () => void
}

export default function BotonesGenerarDocumentos({
  tramiteId,
  documentosGenerados,
  onDocumentoGenerado,
}: Props) {
  const [isGenerating, setIsGenerating] = useState(false)

  const generarDocumento = async (tipo: string) => {
    // Verificar si ya existe un documento de este tipo
    const yaExiste = documentosGenerados.some((doc) => doc.plantilla.tipo === tipo)

    if (yaExiste) {
      const confirmado = confirm(
        `El archivo ${tipo} ya existe. ¿Seguro que quieres crear otro?\n\n(El anterior no se borrará, puedes verlo haciendo click en "Ver todos")`
      )
      if (!confirmado) return
    }

    setIsGenerating(true)
    try {
      const response = await fetch(`/api/tramites/generar-documento`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tramiteId,
          tipoDocumento: tipo,
        }),
      })

      if (!response.ok) {
        const error = await response.text()
        throw new Error(error)
      }

      toast.success(`✅ ${tipo} generado exitosamente`)
      onDocumentoGenerado()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : `Error al generar ${tipo}`)
    } finally {
      setIsGenerating(false)
    }
  }

  const botones = [
    { tipo: 'mandato', label: '📋 Mandato', color: 'bg-blue-600 hover:bg-blue-700' },
    { tipo: 'contrato', label: '📄 Contrato', color: 'bg-green-600 hover:bg-green-700' },
    { tipo: 'fraccionamiento', label: '📅 Fraccionar', color: 'bg-indigo-600 hover:bg-indigo-700' },
    { tipo: 'factura', label: '💵 Factura', color: 'bg-purple-600 hover:bg-purple-700' },
    { tipo: 'otros', label: '📎 Otros', color: 'bg-gray-600 hover:bg-gray-700' },
  ]

  return (
    <div className="space-y-3">
      {Array.from({ length: Math.ceil(botones.length / 2) }).map((_, i) => (
        <div key={i} className="grid grid-cols-2 gap-2">
          {botones.slice(i * 2, i * 2 + 2).map((btn) => (
            <button
              key={btn.tipo}
              onClick={() => generarDocumento(btn.tipo)}
              disabled={isGenerating}
              className={`px-3 py-2 text-xs font-semibold text-white rounded-lg transition disabled:bg-gray-400 ${btn.color}`}
            >
              {isGenerating ? 'Gen...' : btn.label}
            </button>
          ))}
        </div>
      ))}
    </div>
  )
}
