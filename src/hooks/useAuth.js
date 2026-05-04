import useAuthStore from '../store/authStore'
import { useNavigate, useLocation } from 'react-router-dom'
import authService from '../services/auth.service'

const useAuth = () => {
    const { login, logout, user, token } = useAuthStore()
    const navigate = useNavigate()
    const location = useLocation()

    const handleLogin = async (credentials) => {
        const response = await authService.login(credentials)
        const { token, ...userData } = response.data
        login(token, userData)
        const destination = location.state?.from?.pathname || '/dashboard'
        navigate(destination, { replace: true })
    }

    const handleLogout = () => {
        logout()
        navigate('/login')
    }

    return {
        user,
        token,
        handleLogin,
        handleLogout,
        isAuthenticated: !!token,
    }
}

export default useAuth