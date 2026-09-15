'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'

const ESTADOS = ['pendiente', 'en_proceso', 'completado', 'archivado']

const ESTADO_COLORES: Record<string, string> = {
  pendiente: 'bg-gray-100 text-gray-800 hover:bg-gray-200',
  en_proceso: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200',
  completado: 'bg-green-100 text-green-800 hover:bg-green-200',
  archivado: 'bg-red-100 text-red-800 hover:bg-red-200',
}

const ESTADO_LABELS: Record<string, string> = {
  pendiente: 'Pendiente',
  en_proceso: 'En Proceso',
  completado: 'Completado',
  archivado: 'Archivado',
}

interface Props {
  tramiteId: string
  estado: string
}

export default function EstadoTramiteSelector({ tramiteId, estado }: Props) {
  const [estadoActual, setEstadoActual] = useState(estado)
  const [isOpen, setIsOpen] = useState(false)
  const [isChanging, setIsChanging] = useState(false)

  const handleChangeEstado = async (nuevoEstado: string) => {
    if (nuevoEstado === estadoActual) {
      setIsOpen(false)
      return
    }

    setIsChanging(true)
    try {
      const response = await fetch(`/api/tramites/${tramiteId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: nuevoEstado }),
      })

      if (!response.ok) throw new Error('Error al actualizar')

      setEstadoActual(nuevoEstado)
      toast.success('✅ Estado actualizado')
      setIsOpen(false)
    } catch (error) {
      toast.error('Error al cambiar estado')
      console.error(error)
    } finally {
      setIsChanging(false)
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isChanging}
        className={`inline-block px-4 py-2 rounded-full text-sm font-semibold cursor-pointer transition ${ESTADO_COLORES[estadoActual]} disabled:opacity-50`}
      >
        {isChanging ? 'Actualizando...' : ESTADO_LABELS[estadoActual]}
      </button>

      {isOpen && (
        <div className="absolute top-full mt-2 bg-white rounded-lg shadow-lg border border-gray-200 z-50 min-w-max">
          {ESTADOS.map((est) => (
            <button
              key={est}
              onClick={() => handleChangeEstado(est)}
              disabled={isChanging}
              className={`block w-full text-left px-4 py-2 text-sm ${
                est === estadoActual
                  ? 'bg-gray-100 font-semibold'
                  : 'hover:bg-gray-50'
              } ${est === ESTADOS[0] ? 'rounded-t-lg' : ''} ${
                est === ESTADOS[ESTADOS.length - 1] ? 'rounded-b-lg' : ''
              } border-b border-gray-100 last:border-b-0 disabled:opacity-50`}
            >
              {ESTADO_LABELS[est]}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
