import api from '../utils/api'

const membreService = {
    previewGroupe: (token) => api.get(`/api/rejoindre/${token}`),
    demanderRejoindre: (token) => api.post(`/api/rejoindre/${token}`),
    getDemandesEnAttente: (groupeId) => api.get(`/api/groupes/${groupeId}/membres/en-attente`),
    approuver: (groupeId, membreId) => api.post(`/api/groupes/${groupeId}/membres/${membreId}/approuver`),
    rejeter: (groupeId, membreId) => api.post(`/api/groupes/${groupeId}/membres/${membreId}/rejeter`),
}

export default membreService
