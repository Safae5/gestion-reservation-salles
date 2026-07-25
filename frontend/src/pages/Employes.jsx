import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios'

export default function Employes() {
  const [employes, setEmployes] = useState([])
  const [form, setForm] = useState({ numero: '', nom: '', prenom: '', departement: '' })
  const [error, setError] = useState('')

  function load() { api.get('/employes').then((res) => setEmployes(res.data)) }
  useEffect(() => { load() }, [])

  async function handleSubmit(e) {
    e.preventDefault(); setError('')
    try {
      await api.post('/employes', form)
      setForm({ numero: '', nom: '', prenom: '', departement: '' })
      load()
    } catch (err) {
      const errors = err.response?.data?.errors
      setError(errors ? Object.values(errors).flat().join(' ') : 'Erreur.')
    }
  }

  async function handleDelete(id) {
    if (!confirm('Supprimer cet employé ?')) return
    await api.delete(`/employes/${id}`)
    load()
  }

  return (
    <div className="min-h-screen">
      <nav className="bg-navy text-white px-6 py-4">
        <Link to="/dashboard" className="text-sm">&larr; Retour au tableau de bord</Link>
      </nav>
      <main className="p-8 max-w-4xl mx-auto">
        <h2 className="text-2xl font-semibold mb-6">Gestion des employés</h2>
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow mb-8 grid grid-cols-2 gap-4">
          {error && <p className="col-span-2 text-red-600 text-sm">{error}</p>}
          <input placeholder="Numéro employé" required className="border rounded px-3 py-2"
            value={form.numero} onChange={(e) => setForm({ ...form, numero: e.target.value })} />
          <input placeholder="Département" required className="border rounded px-3 py-2"
            value={form.departement} onChange={(e) => setForm({ ...form, departement: e.target.value })} />
          <input placeholder="Nom" required className="border rounded px-3 py-2"
            value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} />
          <input placeholder="Prénom" required className="border rounded px-3 py-2"
            value={form.prenom} onChange={(e) => setForm({ ...form, prenom: e.target.value })} />
          <button type="submit" className="col-span-2 bg-blue text-white rounded py-2 font-medium">
            Ajouter l'employé
          </button>
        </form>
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-100">
              <tr><th className="p-3 text-left">Numéro</th><th className="p-3 text-left">Nom</th>
                <th className="p-3 text-left">Département</th><th className="p-3"></th></tr>
            </thead>
            <tbody>
              {employes.map((e) => (
                <tr key={e.id} className="border-t">
                  <td className="p-3">{e.numero}</td>
                  <td className="p-3">{e.nom} {e.prenom}</td>
                  <td className="p-3">{e.departement}</td>
                  <td className="p-3 text-right">
                    <button onClick={() => handleDelete(e.id)} className="text-red-600 text-xs">Supprimer</button>
                  </td>
                </tr>
              ))}
              {employes.length === 0 && (
                <tr><td colSpan="4" className="p-4 text-center text-gray-400">Aucun employé pour le moment.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  )
}
