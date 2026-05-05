import useAuthStore from '../store/authStore'
import { useNavigate, useLocation } from 'react-router-dom'
import authService from '../services/auth.service'

const useAuth = () => {
    const { setUser, setInitialized, logout, user } = useAuthStore()
    const navigate = useNavigate()
    const location = useLocation()

    const handleLogin = async (credentials) => {
        const response = await authService.login(credentials)
        setUser(response.data)
        const destination = location.state?.from?.pathname || '/dashboard'
        navigate(destination, { replace: true })
    }

    const handleLogout = async () => {
        try {
            await authService.logout()
        } finally {
            logout()
            navigate('/login', { replace: true })
        }
    }

    const initAuth = async () => {
        try {
            const response = await authService.me()
            setUser(response.data)
        } catch {
            setInitialized()
        }
    }

    return {
        user,
        handleLogin,
        handleLogout,
        initAuth,
        isAuthenticated: !!user,
    }
}

export default useAuth
