'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const tabs = [
  { name: 'Trámites', href: '/admin/tramites-config', icon: '📋' },
  { name: 'Plantillas', href: '/admin/plantillas', icon: '📄' },
  { name: 'Tasas', href: '/admin/tasas-config', icon: '💰' },
  { name: 'Checklist', href: '/admin/checklist', icon: '✅' },
  { name: 'Tipos Documento', href: '/admin/tipos-documento', icon: '📑' },
  { name: 'Usuarios', href: '/admin/usuarios', icon: '👥' },
]

export default function AdminPage() {
  const pathname = usePathname()

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Configuración</h1>

      {/* Tabs */}
      <div className="flex gap-2 mb-8 overflow-x-auto pb-4">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href || pathname.startsWith(tab.href)
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}
            >
              {tab.icon} {tab.name}
            </Link>
          )
        })}
      </div>

      {/* Content */}
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-600">Selecciona una opción del menú para comenzar</p>
      </div>
    </div>
  )
}
// Force redeploy Tue Sep 15 14:56:36     2026
