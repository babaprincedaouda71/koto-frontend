import api from '../utils/api'

const groupeService = {
    creerGroupe: async (data) => {
        const response = await api.post('/api/groupes', data)
        return response.data
    },

    getMesGroupes: async () => {
        const response = await api.get('/api/groupes')
        return response.data
    },

    getGroupe: async (id) => {
        const response = await api.get(`/api/groupes/${id}`)
        return response.data
    },

    genererInvitation: async (id) => {
        const response = await api.get(`/api/groupes/${id}/invite`)
        return response.data
    },
}

export default groupeService