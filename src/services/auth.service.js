import api from '../utils/api'

const authService = {
    register: async (data) => {
        const response = await api.post('/api/auth/register', data)
        return response.data
    },

    login: async (data) => {
        const response = await api.post('/api/auth/login', data)
        return response.data
    },

    logout: async () => {
        await api.post('/api/auth/logout')
    },

    me: async () => {
        const response = await api.get('/api/auth/me')
        return response.data
    },
}

export default authService
