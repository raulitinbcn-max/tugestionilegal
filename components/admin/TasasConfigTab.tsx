'use client'

import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'

interface Categoria {
  id: string
  clave: string
  nombre: string
  icono?: string
}

interface Tramite {
  id: string
  tipoTramite: string
  nombre: string
  categoria?: string
}

interface Tasa {
  id: string
  nombre: string
  importe: number
  categoriaId: string | null
  tramiteConfigIds: string[]
}

export default function TasasConfigTab() {
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [tramites, setTramites] = useState<Tramite[]>([])
  const [tasas, setTasas] = useState<Tasa[]>([])
  const [categoriaId, setCategoriaId] = useState('')
  const [loading, setLoading] = useState(true)
  const [nueva, setNueva] = useState({ nombre: '', importe: '' })

  const cargar = async () => {
    try {
      const [catRes, tramRes, tasasRes] = await Promise.all([
        fetch('/api/admin/categorias-tramite'),
        fetch('/api/admin/tramites-list'),
        fetch('/api/admin/tasas-config'),
      ])
      if (!catRes.ok || !tramRes.ok || !tasasRes.ok) throw new Error('Error al cargar datos')

      const cats: Categoria[] = await catRes.json()
      const tramData = await tramRes.json()
      const tasasData = await tasasRes.json()

      setCategorias(cats)
      setTramites(tramData.tramites || [])
      setTasas(tasasData.tasas || [])
      setCategoriaId((prev) => prev || cats[0]?.id || '')
    } catch (error) {
      toast.error('Error cargando tasas')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    cargar()
  }, [])

  const categoriaActual = categorias.find((c) => c.id === categoriaId)
  const tramitesDeCategoria = categoriaActual
    ? tramites.filter((t) => t.categoria === categoriaActual.clave)
    : []
  const tasasDeCategoria = tasas.filter((t) => t.categoriaId === categoriaId)

  const crearTasa = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!categoriaId || !nueva.nombre.trim() || !nueva.importe) {
      toast.error('Completa nombre e importe')
      return
    }

    try {
      const res = await fetch('/api/admin/tasas-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          categoriaId,
          nombre: nueva.nombre,
          importe: parseFloat(nueva.importe),
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error al crear la tasa')

      toast.success('Tasa creada')
      setNueva({ nombre: '', importe: '' })
      await cargar()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al crear la tasa')
    }
  }

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Cargando tasas...</div>
  }

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">💰 Tasas por Categoría</h2>
      <p className="text-gray-600 mb-6">
        Crea las tasas de una categoría y después asígnalas a los trámites concretos.
      </p>

      {categorias.length === 0 ? (
        <p className="text-gray-600">No hay categorías. Créalas en la pestaña de categorías.</p>
      ) : (
        <>
          <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <label htmlFor="categoriaTasas" className="block text-sm font-semibold text-gray-900 mb-2">
              Categoría
            </label>
            <select
              id="categoriaTasas"
              name="categoriaTasas"
              value={categoriaId}
              onChange={(e) => setCategoriaId(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm"
            >
              {categorias.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.icono} {cat.nombre}
                </option>
              ))}
            </select>
          </div>

          <form onSubmit={crearTasa} className="mb-8 p-6 bg-green-50 rounded-lg border border-green-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">➕ Nueva tasa en {categoriaActual?.nombre}</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label htmlFor="nuevaTasaNombre" className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                <input
                  type="text"
                  id="nuevaTasaNombre"
                  name="nuevaTasaNombre"
                  value={nueva.nombre}
                  onChange={(e) => setNueva({ ...nueva, nombre: e.target.value })}
                  placeholder="Ej: Tasa de Tramitación"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
              <div>
                <label htmlFor="nuevaTasaImporte" className="block text-sm font-medium text-gray-700 mb-1">Importe (€)</label>
                <input
                  type="number"
                  id="nuevaTasaImporte"
                  name="nuevaTasaImporte"
                  value={nueva.importe}
                  onChange={(e) => setNueva({ ...nueva, importe: e.target.value })}
                  step="0.01"
                  placeholder="0.00"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg text-sm"
                >
                  ✅ Crear tasa
                </button>
              </div>
            </div>
          </form>

          {tasasDeCategoria.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Esta categoría todavía no tiene tasas.</p>
          ) : (
            <div className="space-y-4">
              {tasasDeCategoria.map((tasa) => (
                <TasaFila
                  key={tasa.id}
                  tasa={tasa}
                  tramitesDeCategoria={tramitesDeCategoria}
                  onCambio={cargar}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}

function TasaFila({
  tasa,
  tramitesDeCategoria,
  onCambio,
}: {
  tasa: Tasa
  tramitesDeCategoria: Tramite[]
  onCambio: () => Promise<void>
}) {
  const [nombre, setNombre] = useState(tasa.nombre)
  const [importe, setImporte] = useState(String(tasa.importe))
  const [seleccion, setSeleccion] = useState<string[]>(tasa.tramiteConfigIds)
  const [guardando, setGuardando] = useState(false)

  const toggleTramite = (id: string) => {
    setSeleccion((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }

  const guardar = async () => {
    setGuardando(true)
    try {
      const res = await fetch(`/api/admin/tasas-config/${tasa.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre,
          importe: parseFloat(importe),
          categoriaId: tasa.categoriaId,
          tramiteConfigIds: seleccion,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error al guardar la tasa')
      toast.success('Tasa guardada')
      await onCambio()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al guardar la tasa')
    } finally {
      setGuardando(false)
    }
  }

  const eliminar = async () => {
    if (!confirm(`¿Eliminar la tasa "${tasa.nombre}"?`)) return
    try {
      const res = await fetch(`/api/admin/tasas-config/${tasa.id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Error al eliminar la tasa')
      toast.success('Tasa eliminada')
      await onCambio()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al eliminar la tasa')
    }
  }

  return (
    <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
        <div>
          <label htmlFor={`nombre-${tasa.id}`} className="block text-xs font-medium text-gray-700 mb-1">Nombre</label>
          <input
            type="text"
            id={`nombre-${tasa.id}`}
            name={`nombre-${tasa.id}`}
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
          />
        </div>
        <div>
          <label htmlFor={`importe-${tasa.id}`} className="block text-xs font-medium text-gray-700 mb-1">Importe (€)</label>
          <input
            type="number"
            id={`importe-${tasa.id}`}
            name={`importe-${tasa.id}`}
            value={importe}
            step="0.01"
            onChange={(e) => setImporte(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
          />
        </div>
        <div className="flex items-end gap-2">
          <button
            type="button"
            onClick={guardar}
            disabled={guardando}
            className="flex-1 px-3 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold rounded text-sm"
          >
            💾 Guardar
          </button>
          <button
            type="button"
            onClick={eliminar}
            className="px-3 py-2 bg-red-100 hover:bg-red-200 text-red-700 font-semibold rounded text-sm"
          >
            🗑️
          </button>
        </div>
      </div>

      <div>
        <p className="text-xs font-medium text-gray-700 mb-2">Trámites a los que se asigna</p>
        {tramitesDeCategoria.length === 0 ? (
          <p className="text-sm text-gray-500">
            No hay trámites en esta categoría. Asígnales la categoría en la pestaña Trámites.
          </p>
        ) : (
          <div className="flex flex-wrap gap-4">
            {tramitesDeCategoria.map((t) => (
              <label key={t.id} className="flex items-center gap-2 text-sm text-gray-800">
                <input
                  type="checkbox"
                  name={`asignar-${tasa.id}`}
                  checked={seleccion.includes(t.id)}
                  onChange={() => toggleTramite(t.id)}
                  className="w-4 h-4 rounded border-gray-300 text-blue-600"
                />
                {t.tipoTramite}
              </label>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
