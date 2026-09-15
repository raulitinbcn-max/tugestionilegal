'use client'

import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'

interface Usuario {
  id: string
  email: string
  nombre: string | null
  rol: string
  activo: boolean
  createdAt: string
}

export default function UsuariosTab() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
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
        toast.error(error.error || 'Error al agregar usuario')
      }
    } catch (error) {
      toast.error('Error al agregar usuario')
    } finally {
      setIsAdding(false)
    }
  }

  const bloquearUsuario = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/usuarios/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activo: false }),
      })

      if (res.ok) {
        toast.success('✅ Usuario bloqueado')
        cargarUsuarios()
      } else {
        toast.error('Error al bloquear usuario')
      }
    } catch (error) {
      toast.error('Error al bloquear usuario')
    }
  }

  const desbloquearUsuario = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/usuarios/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activo: true }),
      })

      if (res.ok) {
        toast.success('✅ Usuario desbloqueado')
        cargarUsuarios()
      } else {
        toast.error('Error al desbloquear usuario')
      }
    } catch (error) {
      toast.error('Error al desbloquear usuario')
    }
  }

  if (loading) {
    return <div className="p-8 text-center">Cargando...</div>
  }

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">👥 Gestión de Usuarios</h2>

      {/* Formulario para agregar usuario */}
      <div className="bg-gray-50 rounded-lg p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Agregar Usuario</h3>
        <form onSubmit={agregarUsuario} className="flex gap-3 flex-wrap">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Correo electrónico"
            className="flex-1 min-w-[200px] px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
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

      {/* Tabla de usuarios */}
      <div className="rounded-lg overflow-hidden border">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Email</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Nombre</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Rol</th>
              <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900">Estado</th>
              <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {usuarios.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-600">
                  No hay usuarios agregados aún
                </td>
              </tr>
            ) : (
              usuarios.map((usuario) => (
                <tr key={usuario.id} className={`${!usuario.activo ? 'bg-gray-50' : ''} hover:bg-gray-50`}>
                  <td className="px-6 py-4 text-sm text-gray-900">{usuario.email}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{usuario.nombre || '—'}</td>
                  <td className="px-6 py-4 text-sm text-gray-700 capitalize">{usuario.rol}</td>
                  <td className="px-6 py-4 text-center">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                        usuario.activo
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {usuario.activo ? '✅ Activo' : '❌ Bloqueado'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {usuario.activo ? (
                      <button
                        onClick={() => bloquearUsuario(usuario.id)}
                        className="text-red-600 hover:text-red-800 font-medium text-sm"
                      >
                        🔒 Bloquear
                      </button>
                    ) : (
                      <button
                        onClick={() => desbloquearUsuario(usuario.id)}
                        className="text-green-600 hover:text-green-800 font-medium text-sm"
                      >
                        🔓 Desbloquear
                      </button>
                    )}
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
