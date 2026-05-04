import api from '../utils/api'

const paiementService = {
    getImpayes: async (groupeId) => {
        const response = await api.get(`/api/groupes/${groupeId}/cycles/actif/impayes`)
        return response.data
    },

    getPaiementsCycleActif: async (groupeId) => {
        const response = await api.get(`/api/groupes/${groupeId}/cycles/actif/paiements`)
        return response.data
    },

    confirmerPaiement: async (paiementId, note) => {
        const response = await api.patch(`/api/paiements/${paiementId}/confirmer`, { note })
        return response.data
    },

    envoyerRappel: async (paiementId) => {
        const response = await api.post(`/api/paiements/${paiementId}/rappel`)
        return response.data
    },

    declarerPaiement: async (paiementId) => {
        const response = await api.patch(`/api/paiements/${paiementId}/declarer`)
        return response.data
    },

    invaliderPaiement: async (paiementId) => {
        const response = await api.patch(`/api/paiements/${paiementId}/invalider`)
        return response.data
    },

    getPaiementsMembre: async (membreId) => {
        const response = await api.get(`/api/membres/${membreId}/paiements`)
        return response.data
    },
}

export default paiementService