import { createContext, useContext, useState, useLayoutEffect } from 'react'
import api from '../api/axios'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        try {
            const stored = localStorage.getItem('user')
            return stored ? JSON.parse(stored) : null
        } catch {
            localStorage.removeItem('user')
            localStorage.removeItem('token')
            return null
        }
    })
    const [loading, setLoading] = useState(true)

    useLayoutEffect(() => {
        const token = localStorage.getItem('token')
        if (token) api.defaults.headers.common['Authorization'] = `Bearer ${token}`
        setLoading(false)
    }, [])

    const saveSession = (token, user) => {
        localStorage.setItem('token', token)
        localStorage.setItem('user', JSON.stringify(user))
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`
        setUser(user)
    }

    const login = async (email, password) => {
        const { data } = await api.post('/auth/login', { email, password })
        saveSession(data.token, data.user)
        return data.user
    }

    const register = async (name, email, password) => {
        const { data } = await api.post('/auth/register', { name, email, password })
        saveSession(data.token, data.user)
        return data.user
    }

    const loginWithFirebase = async (firebaseToken) => {
        const { data } = await api.post('/auth/firebase', { firebaseToken })
        saveSession(data.token, data.user)
        return data.user
    }

    const logout = () => {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        delete api.defaults.headers.common['Authorization']
        setUser(null)
    }

    const updateUser = (updated) => {
        setUser(updated)
        localStorage.setItem('user', JSON.stringify(updated))
    }

    return (
        <AuthContext.Provider value={{ user, loading, login, register, loginWithFirebase, logout, updateUser }}>
            {!loading && children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    return useContext(AuthContext)
}