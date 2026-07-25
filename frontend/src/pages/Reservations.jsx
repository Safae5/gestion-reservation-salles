import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios'

export default function Reservations() {
  const [reservations, setReservations] = useState([])
  const [salles, setSalles] = useState([])
  const [employes, setEmployes] = useState([])
  const [form, setForm] = useState({ employe_id: '', salle_id: '', date: '', heure_debut: '', duree_minutes: 60 })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  function load() {
    api.get('/reservations').then((res) => setReservations(res.data))
    api.get('/salles').then((res) => setSalles(res.data))
    api.get('/employes').then((res) => setEmployes(res.data))
  }
  useEffect(() => { load() }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    setError(''); setSuccess('')
    try {
      await api.post('/reservations', form)
      setSuccess('Réservation confirmée avec succès.')
      setForm({ employe_id: '', salle_id: '', date: '', heure_debut: '', duree_minutes: 60 })
      load()
    } catch (err) {
      if (err.response?.status === 409) {
        // Conflit détecté par la règle métier DisponibiliteService
        setError(err.response.data.message)
      } else {
        const errors = err.response?.data?.errors
        setError(errors ? Object.values(errors).flat().join(' ') : 'Erreur.')
      }
    }
  }

  async function handleAnnuler(id) {
    if (!confirm('Annuler cette réservation ?')) return
    await api.put(`/reservations/${id}`, { statut: 'annulee' })
    load()
  }

  return (
    <div className="min-h-screen">
      <nav className="bg-navy text-white px-6 py-4">
        <Link to="/dashboard" className="text-sm">&larr; Retour au tableau de bord</Link>
      </nav>
      <main className="p-8 max-w-4xl mx-auto">
        <h2 className="text-2xl font-semibold mb-6">Réservations de salles</h2>

        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow mb-8 grid grid-cols-2 gap-4">
          {error && <p className="col-span-2 text-red-600 text-sm bg-red-50 p-2 rounded">⚠️ {error}</p>}
          {success && <p className="col-span-2 text-green text-sm bg-green-50 p-2 rounded">✅ {success}</p>}

          <select required className="border rounded px-3 py-2"
            value={form.employe_id} onChange={(e) => setForm({ ...form, employe_id: e.target.value })}>
            <option value="">-- Choisir l'employé --</option>
            {employes.map((emp) => <option key={emp.id} value={emp.id}>{emp.nom} {emp.prenom}</option>)}
          </select>

          <select required className="border rounded px-3 py-2"
            value={form.salle_id} onChange={(e) => setForm({ ...form, salle_id: e.target.value })}>
            <option value="">-- Choisir la salle --</option>
            {salles.map((s) => <option key={s.id} value={s.id}>Salle {s.numero} ({s.capacite} pers.)</option>)}
          </select>

          <input type="date" required className="border rounded px-3 py-2"
            value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />

          <input type="time" required className="border rounded px-3 py-2"
            value={form.heure_debut} onChange={(e) => setForm({ ...form, heure_debut: e.target.value })} />

          <select className="border rounded px-3 py-2 col-span-2"
            value={form.duree_minutes} onChange={(e) => setForm({ ...form, duree_minutes: Number(e.target.value) })}>
            <option value={30}>30 minutes</option>
            <option value={60}>1 heure</option>
            <option value={90}>1h30</option>
            <option value={120}>2 heures</option>
            <option value={180}>3 heures</option>
          </select>

          <button type="submit" className="col-span-2 bg-blue text-white rounded py-2 font-medium">
            Réserver la salle
          </button>
        </form>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 text-left">Salle</th><th className="p-3 text-left">Employé</th>
                <th className="p-3 text-left">Date</th><th className="p-3 text-left">Créneau</th>
                <th className="p-3 text-left">Statut</th><th className="p-3"></th>
              </tr>
            </thead>
            <tbody>
              {reservations.map((r) => (
                <tr key={r.id} className="border-t">
                  <td className="p-3">Salle {r.salle?.numero}</td>
                  <td className="p-3">{r.employe?.nom} {r.employe?.prenom}</td>
                  <td className="p-3">{r.date}</td>
                  <td className="p-3">{r.heure_debut} - {r.heure_fin}</td>
                  <td className="p-3">
                    <span className={r.statut === 'confirmee' ? 'text-green' : 'text-gray-400'}>
                      {r.statut === 'confirmee' ? 'Confirmée' : 'Annulée'}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    {r.statut === 'confirmee' && (
                      <button onClick={() => handleAnnuler(r.id)} className="text-red-600 text-xs">Annuler</button>
                    )}
                  </td>
                </tr>
              ))}
              {reservations.length === 0 && (
                <tr><td colSpan="6" className="p-4 text-center text-gray-400">Aucune réservation pour le moment.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  )
}
