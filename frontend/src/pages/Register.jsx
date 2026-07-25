import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', password_confirmation: '', role: 'employe' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  function update(field, value) { setForm((f) => ({ ...f, [field]: value })) }

  async function handleSubmit(e) {
    e.preventDefault()
    setError(''); setLoading(true)
    try {
      await register(form)
      navigate('/dashboard')
    } catch (err) {
      const errors = err.response?.data?.errors
      setError(errors ? Object.values(errors).flat().join(' ') : "Erreur lors de l'inscription.")
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm">
        <h1 className="text-2xl font-bold text-navy mb-6 text-center">Créer un compte</h1>
        {error && <p className="text-red-600 text-sm mb-3">{error}</p>}
        <label className="block mb-2 text-sm font-medium">Nom complet</label>
        <input className="w-full border rounded px-3 py-2 mb-4" required
          value={form.name} onChange={(e) => update('name', e.target.value)} />
        <label className="block mb-2 text-sm font-medium">Email</label>
        <input type="email" className="w-full border rounded px-3 py-2 mb-4" required
          value={form.email} onChange={(e) => update('email', e.target.value)} />
        <label className="block mb-2 text-sm font-medium">Rôle</label>
        <select className="w-full border rounded px-3 py-2 mb-4"
          value={form.role} onChange={(e) => update('role', e.target.value)}>
          <option value="admin">Administrateur</option>
          <option value="employe">Employé</option>
        </select>
        <label className="block mb-2 text-sm font-medium">Mot de passe</label>
        <input type="password" className="w-full border rounded px-3 py-2 mb-4" required
          value={form.password} onChange={(e) => update('password', e.target.value)} />
        <label className="block mb-2 text-sm font-medium">Confirmer le mot de passe</label>
        <input type="password" className="w-full border rounded px-3 py-2 mb-6" required
          value={form.password_confirmation} onChange={(e) => update('password_confirmation', e.target.value)} />
        <button type="submit" disabled={loading}
          className="w-full bg-blue text-white rounded py-2 font-medium hover:opacity-90 disabled:opacity-50">
          {loading ? 'Création...' : "S'inscrire"}
        </button>
        <p className="text-sm text-center mt-4">
          Déjà un compte ? <Link to="/login" className="text-blue underline">Se connecter</Link>
        </p>
      </form>
    </div>
  )
}
