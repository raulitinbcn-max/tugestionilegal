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

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [loading, setLoading] = useState(true)
  const [email, setEmail] = useState('')
  const [nombre, setNombre] = useState('')

  useEffect(() => {
    cargarUsuarios()
  }, [])

  const cargarUsuarios = async () => {
    try {
      const res = await fetch('/api/admin/usuarios')
      if (!res.ok) throw new Error('Error al cargar usuarios')
      const data = await res.json()
      setUsuarios(data)
    } catch (error) {
      toast.error('Error al cargar usuarios')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const agregarUsuario = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) {
      toast.error('Email requerido')
      return
    }

    try {
      const res = await fetch('/api/admin/usuarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), nombre: nombre.trim() || null }),
      })
      if (!res.ok) throw new Error('Error al agregar usuario')

      toast.success('Usuario agregado')
      setEmail('')
      setNombre('')
      await cargarUsuarios()
    } catch (error) {
      toast.error('Error al agregar usuario')
      console.error(error)
    }
  }

  const bloquearUsuario = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/usuarios/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activo: false }),
      })
      if (!res.ok) throw new Error('Error al bloquear usuario')

      toast.success('Usuario bloqueado')
      await cargarUsuarios()
    } catch (error) {
      toast.error('Error al bloquear usuario')
      console.error(error)
    }
  }

  const desbloquearUsuario = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/usuarios/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activo: true }),
      })
      if (!res.ok) throw new Error('Error al desbloquear usuario')

      toast.success('Usuario desbloqueado')
      await cargarUsuarios()
    } catch (error) {
      toast.error('Error al desbloquear usuario')
      console.error(error)
    }
  }

  if (loading) {
    return <div className="p-8">Cargando usuarios...</div>
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Gestión de Usuarios</h1>

      {/* Formulario de agregar usuario */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Agregar nuevo usuario</h2>
        <form onSubmit={agregarUsuario} className="flex gap-4 flex-wrap">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1 min-w-[200px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <input
            type="text"
            placeholder="Nombre (opcional)"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className="flex-1 min-w-[200px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Agregar usuario
          </button>
        </form>
      </div>

      {/* Tabla de usuarios */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold">Email</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Nombre</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Rol</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Estado</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                  No hay usuarios agregados
                </td>
              </tr>
            ) : (
              usuarios.map((usuario) => (
                <tr key={usuario.id} className="border-b hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm">{usuario.email}</td>
                  <td className="px-6 py-4 text-sm">{usuario.nombre || '-'}</td>
                  <td className="px-6 py-4 text-sm capitalize">{usuario.rol}</td>
                  <td className="px-6 py-4 text-sm">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                        usuario.activo
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {usuario.activo ? 'Activo' : 'Bloqueado'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {usuario.activo ? (
                      <button
                        onClick={() => bloquearUsuario(usuario.id)}
                        className="text-red-600 hover:text-red-800 font-semibold"
                      >
                        Bloquear
                      </button>
                    ) : (
                      <button
                        onClick={() => desbloquearUsuario(usuario.id)}
                        className="text-green-600 hover:text-green-800 font-semibold"
                      >
                        Desbloquear
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
