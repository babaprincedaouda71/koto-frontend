import api from '../utils/api'

const cycleService = {
    demarrerCycle: async (groupeId) => {
        const response = await api.post(`/api/groupes/${groupeId}/cycles`)
        return response.data
    },

    getCycles: async (groupeId) => {
        const response = await api.get(`/api/groupes/${groupeId}/cycles`)
        return response.data
    },

    getCycleActif: async (groupeId) => {
        const response = await api.get(`/api/groupes/${groupeId}/cycles/actif`)
        return response.data
    },

    cloturerCycle: async (groupeId, cycleId) => {
        const response = await api.post(`/api/groupes/${groupeId}/cycles/${cycleId}/cloturer`)
        return response.data
    },
}

export default cycleService