'use client'

import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'

interface UsuarioAutorizado {
  id: string
  email: string
  nombre: string | null
  activo: boolean
}

export default function UsuariosTab() {
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
      if (!res.ok) throw new Error('Error al cargar usuarios')
      setUsuarios(await res.json())
    } catch (error) {
      toast.error('Error al cargar usuarios')
    } finally {
      setLoading(false)
    }
  }

  const agregarUsuario = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsAdding(true)
    try {
      const res = await fetch('/api/admin/usuarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, nombre }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error al agregar usuario')

      toast.success('Usuario agregado')
      setEmail('')
      setNombre('')
      await cargarUsuarios()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al agregar usuario')
    } finally {
      setIsAdding(false)
    }
  }

  const cambiarActivo = async (usuario: UsuarioAutorizado) => {
    try {
      const res = await fetch(`/api/admin/usuarios/${usuario.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activo: !usuario.activo }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error al actualizar usuario')

      toast.success(usuario.activo ? 'Usuario bloqueado' : 'Usuario desbloqueado')
      await cargarUsuarios()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al actualizar usuario')
    }
  }

  const eliminarUsuario = async (usuario: UsuarioAutorizado) => {
    if (!confirm(`¿Eliminar el acceso de ${usuario.email}?`)) return

    try {
      const res = await fetch(`/api/admin/usuarios/${usuario.id}`, { method: 'DELETE' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error al eliminar usuario')

      toast.success('Usuario eliminado')
      await cargarUsuarios()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al eliminar usuario')
    }
  }

  if (loading) {
    return <div className="p-8 text-center text-gray-600">Cargando usuarios...</div>
  }

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">👥 Usuarios Autorizados</h2>
      <p className="text-sm text-gray-600 mb-6">
        Solo los correos de esta lista pueden iniciar sesión con Google.
      </p>

      <div className="bg-gray-50 rounded-lg p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Agregar usuario</h3>
        <form onSubmit={agregarUsuario} className="flex gap-3 flex-wrap">
          <input
            type="email"
            id="usuarioEmail"
            name="usuarioEmail"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Correo electrónico"
            className="flex-1 min-w-[200px] px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            id="usuarioNombre"
            name="usuarioNombre"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Nombre (opcional)"
            className="flex-1 min-w-[200px] px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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

      <div className="rounded-lg overflow-hidden border overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Email</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Nombre</th>
              <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900">Estado</th>
              <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {usuarios.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-gray-600">
                  No hay usuarios agregados aún
                </td>
              </tr>
            ) : (
              usuarios.map((usuario) => (
                <tr key={usuario.id} className={`${!usuario.activo ? 'bg-gray-50' : ''} hover:bg-gray-50`}>
                  <td className="px-6 py-4 text-sm text-gray-900">{usuario.email}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{usuario.nombre || '—'}</td>
                  <td className="px-6 py-4 text-center">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                        usuario.activo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {usuario.activo ? '✅ Activo' : '❌ Bloqueado'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center space-x-4">
                    <button
                      onClick={() => cambiarActivo(usuario)}
                      className={`font-medium text-sm ${
                        usuario.activo
                          ? 'text-orange-600 hover:text-orange-800'
                          : 'text-green-600 hover:text-green-800'
                      }`}
                    >
                      {usuario.activo ? '🔒 Bloquear' : '🔓 Desbloquear'}
                    </button>
                    <button
                      onClick={() => eliminarUsuario(usuario)}
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
