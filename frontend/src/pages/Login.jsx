import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError(''); setLoading(true)
    try {
      await login(email, password)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur de connexion.')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm">
        <h1 className="text-2xl font-bold text-navy mb-6 text-center">Gestion Réservation Salles</h1>
        <h2 className="text-lg mb-4 text-center text-gray-600">Connexion</h2>
        {error && <p className="text-red-600 text-sm mb-3">{error}</p>}
        <label className="block mb-2 text-sm font-medium">Email</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
          className="w-full border rounded px-3 py-2 mb-4" required />
        <label className="block mb-2 text-sm font-medium">Mot de passe</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
          className="w-full border rounded px-3 py-2 mb-6" required />
        <button type="submit" disabled={loading}
          className="w-full bg-blue text-white rounded py-2 font-medium hover:opacity-90 disabled:opacity-50">
          {loading ? 'Connexion...' : 'Se connecter'}
        </button>
        <p className="text-sm text-center mt-4">
          Pas encore de compte ? <Link to="/register" className="text-blue underline">S'inscrire</Link>
        </p>
      </form>
    </div>
  )
}
