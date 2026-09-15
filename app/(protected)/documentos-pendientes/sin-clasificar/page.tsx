'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import toast from 'react-hot-toast'

interface DocumentoSinClasificar {
  id: string
  name: string
  createdTime?: string
}

export default function SinClasificarPage() {
  const [documentos, setDocumentos] = useState<DocumentoSinClasificar[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDocumentos()
  }, [])

  const loadDocumentos = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/documentos/pendientes')
      if (!response.ok) throw new Error('Error al cargar documentos')
      const data = await response.json()
      setDocumentos(data)
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error al cargar documentos sin clasificar')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Documentos Sin Clasificar</h1>
        <div className="text-center py-8">
          <p className="text-gray-600">⏳ Cargando documentos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Documentos Sin Clasificar</h1>
          <p className="text-gray-600 mt-2">Archivo temporal de documentos pendientes de asignación</p>
        </div>
        <Link
          href="/documentos-pendientes"
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition"
        >
          ← Volver a Entrada
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        {documentos.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600">No hay documentos sin clasificar</p>
          </div>
        ) : (
          <div className="space-y-2">
            {documentos.map((doc) => (
              <a
                key={doc.id}
                href={`https://drive.google.com/file/d/${doc.id}/view`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-4 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 hover:border-gray-300 transition cursor-pointer group"
              >
                <span className="text-2xl group-hover:scale-125 transition">📄</span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate group-hover:text-blue-600">{doc.name}</p>
                  <p className="text-xs text-gray-600 mt-1">
                    {doc.createdTime ? new Date(doc.createdTime).toLocaleDateString('es-ES') : 'Fecha desconocida'}
                  </p>
                </div>
                <span className="text-gray-600 group-hover:text-gray-700 text-lg">→</span>
              </a>
            ))}
          </div>
        )}

        <div className="mt-6 pt-6 border-t">
          <button
            onClick={loadDocumentos}
            disabled={loading}
            className="px-6 py-2 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition"
          >
            🔄 Recargar
          </button>
        </div>
      </div>
    </div>
  )
}
