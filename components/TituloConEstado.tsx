'use client'

import EstadoTramiteSelector from './EstadoTramiteSelector'

interface Props {
  titulo: string
  subtitulo: string
  tramiteId: string
  estado: string
}

export default function TituloConEstado({
  titulo,
  subtitulo,
  tramiteId,
  estado,
}: Props) {
  return (
    <div className="mb-8 flex items-start justify-between">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{titulo}</h1>
        <p className="text-gray-600 mt-2">{subtitulo}</p>
      </div>
      <div className="ml-8">
        <EstadoTramiteSelector tramiteId={tramiteId} estado={estado} />
      </div>
    </div>
  )
}
