import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios'

export default function Salles() {
  const [salles, setSalles] = useState([])
  const [form, setForm] = useState({ numero: '', capacite: '', type: 'salle_conference' })
  const [error, setError] = useState('')

  function load() { api.get('/salles').then((res) => setSalles(res.data)) }
  useEffect(() => { load() }, [])

  async function handleSubmit(e) {
    e.preventDefault(); setError('')
    try {
      await api.post('/salles', form)
      setForm({ numero: '', capacite: '', type: 'salle_conference' })
      load()
    } catch (err) {
      const errors = err.response?.data?.errors
      setError(errors ? Object.values(errors).flat().join(' ') : 'Erreur.')
    }
  }

  async function handleDelete(id) {
    if (!confirm('Supprimer cette salle ?')) return
    await api.delete(`/salles/${id}`)
    load()
  }

  return (
    <div className="min-h-screen">
      <nav className="bg-navy text-white px-6 py-4">
        <Link to="/dashboard" className="text-sm">&larr; Retour au tableau de bord</Link>
      </nav>
      <main className="p-8 max-w-4xl mx-auto">
        <h2 className="text-2xl font-semibold mb-6">Gestion des salles</h2>
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow mb-8 grid grid-cols-2 gap-4">
          {error && <p className="col-span-2 text-red-600 text-sm">{error}</p>}
          <input placeholder="Numéro (ex. 101)" required className="border rounded px-3 py-2"
            value={form.numero} onChange={(e) => setForm({ ...form, numero: e.target.value })} />
          <input placeholder="Capacité (personnes)" type="number" required className="border rounded px-3 py-2"
            value={form.capacite} onChange={(e) => setForm({ ...form, capacite: e.target.value })} />
          <select className="border rounded px-3 py-2 col-span-2"
            value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
            <option value="salle_conference">Salle de conférence</option>
            <option value="bureau">Bureau</option>
            <option value="salle_formation">Salle de formation</option>
          </select>
          <button type="submit" className="col-span-2 bg-blue text-white rounded py-2 font-medium">
            Ajouter la salle
          </button>
        </form>
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-100">
              <tr><th className="p-3 text-left">Numéro</th><th className="p-3 text-left">Capacité</th>
                <th className="p-3 text-left">Type</th><th className="p-3"></th></tr>
            </thead>
            <tbody>
              {salles.map((s) => (
                <tr key={s.id} className="border-t">
                  <td className="p-3">{s.numero}</td>
                  <td className="p-3">{s.capacite} pers.</td>
                  <td className="p-3">{s.type}</td>
                  <td className="p-3 text-right">
                    <button onClick={() => handleDelete(s.id)} className="text-red-600 text-xs">Supprimer</button>
                  </td>
                </tr>
              ))}
              {salles.length === 0 && (
                <tr><td colSpan="4" className="p-4 text-center text-gray-400">Aucune salle pour le moment.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  )
}
