'use client'

import { useState } from 'react'
import UsuariosContent from './usuarios/content'

const tabs = [
  { id: 'tramites', name: 'Trámites', icon: '📋' },
  { id: 'plantillas', name: 'Plantillas', icon: '📄' },
  { id: 'tasas', name: 'Tasas', icon: '💰' },
  { id: 'checklist', name: 'Checklist', icon: '✅' },
  { id: 'tipos-documento', name: 'Tipos Documento', icon: '📑' },
  { id: 'usuarios', name: 'Usuarios', icon: '👥' },
]

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('tramites')

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Configuración</h1>

      {/* Tabs */}
      <div className="flex gap-2 mb-8 overflow-x-auto pb-4">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
              activeTab === tab.id
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            }`}
          >
            {tab.icon} {tab.name}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="bg-white rounded-lg shadow p-6">
        {activeTab === 'usuarios' && <UsuariosContent />}
        {activeTab === 'tramites' && <div className="text-gray-600 py-8">Configuración de Trámites - Próximamente</div>}
        {activeTab === 'plantillas' && <div className="text-gray-600 py-8">Gestión de Plantillas - Próximamente</div>}
        {activeTab === 'tasas' && <div className="text-gray-600 py-8">Configuración de Tasas - Próximamente</div>}
        {activeTab === 'checklist' && <div className="text-gray-600 py-8">Configuración de Checklist - Próximamente</div>}
        {activeTab === 'tipos-documento' && <div className="text-gray-600 py-8">Tipos de Documento - Próximamente</div>}
      </div>
    </div>
  )
}
