'use client'

import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'

interface UsuarioAutorizado {
  id: string
  email: string
  nombre: string | null
  rol: string
  activo: boolean
  createdAt: string
}

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<UsuarioAutorizado[]>([])
  const [loading, setLoading] = useState(true)
  const [email, setEmail] = useState('')
  const [nombre, setNombre] = useState('')
  const [isAdding, setIsAdding] = useState(false)

  useEffect(() => {
    cargarUsuarios()
  }, [])

  const cargarUsuarios = async () => {
    try {
      const res = await fetch('/api/admin/usuarios')
      if (res.ok) {
        const data = await res.json()
        setUsuarios(data)
      }
    } catch (error) {
      toast.error('Error al cargar usuarios')
    } finally {
      setLoading(false)
    }
  }

  const agregarUsuario = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) {
      toast.error('Email es requerido')
      return
    }

    setIsAdding(true)
    try {
      const res = await fetch('/api/admin/usuarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, nombre }),
      })

      if (res.ok) {
        toast.success('✅ Usuario agregado')
        setEmail('')
        setNombre('')
        cargarUsuarios()
      } else {
        const error = await res.json()
        toast.error(error.message || 'Error al agregar usuario')
      }
    } catch (error) {
      toast.error('Error al agregar usuario')
    } finally {
      setIsAdding(false)
    }
  }

  const eliminarUsuario = async (id: string) => {
    if (!confirm('¿Eliminar este usuario?')) return

    try {
      const res = await fetch(`/api/admin/usuarios/${id}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        toast.success('✅ Usuario eliminado')
        cargarUsuarios()
      } else {
        toast.error('Error al eliminar usuario')
      }
    } catch (error) {
      toast.error('Error al eliminar usuario')
    }
  }

  if (loading) {
    return <div className="p-8 text-center">Cargando...</div>
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">👥 Usuarios Autorizados</h1>

      {/* Input para agregar usuario */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <form onSubmit={agregarUsuario} className="flex gap-3">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Correo electrónico"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Nombre para mostrar (opcional)"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={isAdding}
            className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-2 px-6 rounded-lg transition"
          >
            {isAdding ? '⏳' : '➕ Agregar'}
          </button>
        </form>
      </div>

      {/* Tabla de usuarios */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                Nombre
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                Correo Electrónico
              </th>
              <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900">
                Estado
              </th>
              <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody>
            {usuarios.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-gray-600">
                  No hay usuarios agregados aún
                </td>
              </tr>
            ) : (
              usuarios.map((usuario) => (
                <tr
                  key={usuario.id}
                  className={`border-b hover:bg-gray-50 ${
                    !usuario.activo ? 'bg-gray-50 opacity-60' : ''
                  }`}
                >
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {usuario.nombre || '—'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">{usuario.email}</td>
                  <td className="px-6 py-4 text-center">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                        usuario.activo
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {usuario.activo ? '✅ Activo' : '❌ Desactivado'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => eliminarUsuario(usuario.id)}
                      className="text-red-600 hover:text-red-800 font-medium text-sm"
                    >
                      🗑️ Eliminar
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
