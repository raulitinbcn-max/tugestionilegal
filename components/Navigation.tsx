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
    <nav className="w-64 h-screen bg-gray-900 text-white shadow-lg flex flex-col overflow-hidden">
      <div className="p-4 border-b border-gray-800 flex-shrink-0">
        <h2 className="text-lg font-bold">TuGestiónLegal</h2>
        <p className="text-xs text-gray-400 mt-0.5">Despacho López-Iglesias</p>
      </div>

      <div className="flex-1 py-6 overflow-hidden">
        <ul className="space-y-1 px-4">
          {navigationItems.map((item) => {
            // Activar solo si la ruta coincide exactamente o es una subruta directa
            const isActive = pathname === item.href ||
              (pathname.startsWith(item.href + '/') &&
               item.href !== '/tramites') // Excepción: /tramites/nuevo es independiente
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-1.5 rounded-lg transition text-sm ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:bg-gray-800'
                  }`}
                >
                  <span className="text-base">{item.icon}</span>
                  <span className="truncate">{item.label}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </div>

      <div className="border-t border-gray-800 p-3 flex-shrink-0">
        <div className="text-xs mb-3">
          <p className="text-gray-400 text-xs">Conectado como</p>
          <p className="text-white font-medium truncate text-xs">{session?.user?.email}</p>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-1.5 px-3 rounded text-sm transition"
        >
          Cerrar sesión
        </button>
      </div>
    </nav>
  )
}
