import TramiteForm from '@/components/TramiteForm'

export default function NuevoTramitePage() {
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Crear Nuevo Trámite</h1>
      <div className="bg-white rounded-lg shadow p-8">
        <TramiteForm />
      </div>
    </div>
  )
}
