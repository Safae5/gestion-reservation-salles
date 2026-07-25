import { createContext, useContext, useState, useEffect } from 'react'
import api from '../api/axios'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('reservation_token')
    if (!token) { setLoading(false); return }
    api.get('/me')
      .then((res) => setUser(res.data))
      .catch(() => localStorage.removeItem('reservation_token'))
      .finally(() => setLoading(false))
  }, [])

  async function login(email, password) {
    const res = await api.post('/login', { email, password })
    localStorage.setItem('reservation_token', res.data.token)
    setUser(res.data.user)
    return res.data.user
  }

  async function register(payload) {
    const res = await api.post('/register', payload)
    localStorage.setItem('reservation_token', res.data.token)
    setUser(res.data.user)
    return res.data.user
  }

  async function logout() {
    try { await api.post('/logout') } finally {
      localStorage.removeItem('reservation_token')
      setUser(null)
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() { return useContext(AuthContext) }
