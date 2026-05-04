import useAuthStore from '../store/authStore'
import { useNavigate } from 'react-router-dom'
import authService from '../services/auth.service'

const useAuth = () => {
    const { login, logout, user, token } = useAuthStore()
    const navigate = useNavigate()

    const handleLogin = async (credentials) => {
        const response = await authService.login(credentials)
        const { token, ...userData } = response.data
        login(token, userData)
        navigate('/dashboard')
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