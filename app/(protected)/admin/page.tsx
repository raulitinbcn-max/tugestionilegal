'use client'

import { useState } from 'react'
import Link from 'next/link'
import PlantillasTab from '@/components/admin/PlantillasTab'
import TramitesConfigTab from '@/components/admin/TramitesConfigTab'
import TasasConfigTab from '@/components/admin/TasasConfigTab'
import CheckDocumentosTab from '@/components/admin/CheckDocumentosTab'
import TiposDocumentoTab from '@/components/admin/TiposDocumentoTab'

type ActiveTab = 'tramites' | 'plantillas' | 'tasas' | 'check-documentos' | 'tipos-documento' | 'usuarios'

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('tramites')

  const tabs = [
    { id: 'tramites' as const, label: 'Trámites', icon: '⚙️' },
    { id: 'plantillas' as const, label: 'Plantillas', icon: '📄' },
    { id: 'tasas' as const, label: 'Tasas', icon: '💰' },
    { id: 'check-documentos' as const, label: 'Checklist', icon: '✅' },
    { id: 'tipos-documento' as const, label: 'Tipos Documento', icon: '📋' },
    { id: 'usuarios' as const, label: 'Usuarios', icon: '👥' },
  ]

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Configuración</h1>

      {/* Pestañas */}
      <div className="bg-white rounded-t-lg shadow border-b border-gray-200">
        <div className="flex gap-2 p-4 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 font-semibold rounded-t-lg transition whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Contenido */}
      <div className="bg-white rounded-b-lg shadow">
        {activeTab === 'tramites' && <TramitesConfigTab />}
        {activeTab === 'plantillas' && <PlantillasTab />}
        {activeTab === 'tasas' && <TasasConfigTab />}
        {activeTab === 'check-documentos' && <CheckDocumentosTab />}
        {activeTab === 'tipos-documento' && <TiposDocumentoTab />}
        {activeTab === 'usuarios' && (
          <div className="p-8 text-center text-gray-600">
            <p className="text-lg font-semibold">👥 Gestión de Usuarios</p>
            <p className="text-sm mt-2">Por implementar</p>
          </div>
        )}
      </div>
    </div>
  )
}
