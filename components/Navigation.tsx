'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import { useState } from 'react'

const navigationItems = [
  { href: '/dashboard', label: 'Panel de Control', icon: '📊' },
  { href: '/clientes', label: 'Clientes', icon: '👥' },
  { href: '/tramites', label: 'Trámites', icon: '📋' },
  { href: '/tramites/nuevo', label: 'Nuevo Trámite', icon: '➕' },
  { href: '/registrar-pagos', label: 'Registrar Pagos', icon: '💰' },
  { href: '/documentos-pendientes', label: 'Documentos Pendientes', icon: '📄' },
  { href: '/admin', label: 'Configuración', icon: '⚙️' },
  { href: '/admin/backup', label: 'Backup a Drive', icon: '☁️' },
]

export default function Navigation() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <nav className="w-64 bg-gray-900 text-white shadow-lg flex flex-col">
      <div className="p-6 border-b border-gray-800">
        <h2 className="text-xl font-bold">TuGestiónLegal</h2>
        <p className="text-xs text-gray-400 mt-1">Despacho López-Iglesias</p>
      </div>

      <div className="flex-1 py-6">
        <ul className="space-y-2 px-4">
          {navigationItems.map((item) => {
            // Activar solo si la ruta coincide exactamente o es una subruta directa
            const isActive = pathname === item.href ||
              (pathname.startsWith(item.href + '/') &&
               item.href !== '/tramites') // Excepción: /tramites/nuevo es independiente
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-2 rounded-lg transition ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:bg-gray-800'
                  }`}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </div>

      <div className="border-t border-gray-800 p-4">
        <div className="text-sm mb-4">
          <p className="text-gray-400 text-xs">Conectado como</p>
          <p className="text-white font-medium truncate">{session?.user?.email}</p>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition"
        >
          Cerrar sesión
        </button>
      </div>
    </nav>
  )
}
