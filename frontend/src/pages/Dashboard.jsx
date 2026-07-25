import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Dashboard() {
  const { user, logout } = useAuth()

  return (
    <div className="min-h-screen">
      <nav className="bg-navy text-white px-6 py-4 flex justify-between items-center">
        <h1 className="font-bold text-lg">Gestion Réservation Salles</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm">{user?.name} ({user?.role})</span>
          <button onClick={logout} className="bg-red-600 px-3 py-1 rounded text-sm hover:opacity-90">
            Déconnexion
          </button>
        </div>
      </nav>
      <main className="p-8">
        <h2 className="text-2xl font-semibold mb-6">Tableau de bord</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link to="/salles" className="bg-white p-6 rounded-lg shadow hover:shadow-md transition">
            <h3 className="font-bold text-blue mb-2">🏢 Salles</h3>
            <p className="text-sm text-gray-600">Gérer les salles (numéro, capacité, type)</p>
          </Link>
          <Link to="/employes" className="bg-white p-6 rounded-lg shadow hover:shadow-md transition">
            <h3 className="font-bold text-blue mb-2">🧑‍💼 Employés</h3>
            <p className="text-sm text-gray-600">Gérer les employés et leur département</p>
          </Link>
          <Link to="/reservations" className="bg-white p-6 rounded-lg shadow hover:shadow-md transition">
            <h3 className="font-bold text-blue mb-2">📅 Réservations</h3>
            <p className="text-sm text-gray-600">Réserver une salle avec détection de conflit</p>
          </Link>
        </div>
      </main>
    </div>
  )
}
