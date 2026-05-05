import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import useAuthStore from './store/authStore'
import useAuth from './hooks/useAuth'

import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Groupe from './pages/Groupe'
import Rejoindre from './pages/Rejoindre.jsx'

const ProtectedRoute = ({ children }) => {
    const { user, isInitialized } = useAuthStore()
    const location = useLocation()

    if (!isInitialized) {
        return (
            <div className="min-h-screen bg-amber-50 flex items-center justify-center">
                <p className="text-gray-400 text-sm">Chargement...</p>
            </div>
        )
    }

    return user ? children : <Navigate to="/login" state={{ from: location }} replace />
}

const AppInit = ({ children }) => {
    const { initAuth } = useAuth()
    const { isInitialized } = useAuthStore()

    useEffect(() => {
        if (!isInitialized) initAuth()
    }, [])

    return children
}

const App = () => {
    return (
        <BrowserRouter>
            <AppInit>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/dashboard" element={
                        <ProtectedRoute><Dashboard /></ProtectedRoute>
                    } />
                    <Route path="/groupes/:id" element={
                        <ProtectedRoute><Groupe /></ProtectedRoute>
                    } />
                    <Route path="/rejoindre/:token" element={
                        <ProtectedRoute><Rejoindre /></ProtectedRoute>
                    } />
                    <Route path="*" element={<Navigate to="/login" replace />} />
                </Routes>
            </AppInit>
        </BrowserRouter>
    )
}

export default App
