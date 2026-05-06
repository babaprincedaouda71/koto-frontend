import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import membreService from '../services/membre.service'

const Rejoindre = () => {
    const { token } = useParams()
    const navigate = useNavigate()
    const [groupe, setGroupe] = useState(null)
    const [statut, setStatut] = useState('chargement')
    const [message, setMessage] = useState('')
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        const chargerPreview = async () => {
            try {
                const res = await membreService.previewGroupe(token)
                setGroupe(res.data.data)
                setStatut('preview')
            } catch (err) {
                setMessage(err.response?.data?.message || 'Lien invalide ou expiré')
                setStatut('erreur')
            }
        }
        chargerPreview()
    }, [token])

    const handleDemander = async () => {
        setLoading(true)
        try {
            await membreService.demanderRejoindre(token)
            setStatut('succes')
            setTimeout(() => navigate('/dashboard'), 2500)
        } catch (err) {
            setMessage(err.response?.data?.message || 'Impossible de rejoindre ce groupe')
            setStatut('erreur')
            setTimeout(() => navigate('/dashboard'), 2500)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-amber-50 flex items-center justify-center px-4">
            <div className="bg-white rounded-2xl border border-amber-100 p-8 max-w-sm w-full">

                {statut === 'chargement' && (
                    <p className="text-center text-gray-400 text-sm">Chargement...</p>
                )}

                {statut === 'preview' && groupe && (
                    <>
                        <div className="text-center mb-6">
                            <div className="w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-3">
                                <span className="text-2xl">🤝</span>
                            </div>
                            <h2 className="text-lg font-bold text-gray-800">{groupe.nom}</h2>
                            <p className="text-sm text-gray-500 mt-1">
                                Groupe créé par <span className="font-medium">{groupe.adminPrenom} {groupe.adminNom}</span>
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-3 mb-6">
                            <div className="bg-amber-50 rounded-xl p-3 text-center">
                                <p className="text-xs text-gray-400 mb-0.5">Cotisation</p>
                                <p className="text-sm font-semibold text-amber-700">
                                    {groupe.montantCotisation?.toLocaleString()} <span className="text-xs font-normal">{groupe.devise}</span>
                                </p>
                            </div>
                            <div className="bg-amber-50 rounded-xl p-3 text-center">
                                <p className="text-xs text-gray-400 mb-0.5">Membres</p>
                                <p className="text-sm font-semibold text-gray-800">
                                    {groupe.membresActifs} / {groupe.nombreMembres}
                                </p>
                            </div>
                            <div className="bg-amber-50 rounded-xl p-3 text-center col-span-2">
                                <p className="text-xs text-gray-400 mb-0.5">Début</p>
                                <p className="text-sm font-semibold text-gray-800">
                                    {new Date(groupe.dateDebut).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}
                                </p>
                            </div>
                        </div>

                        <p className="text-xs text-gray-400 text-center mb-4">
                            Votre demande sera examinée par l'administrateur du groupe.
                        </p>

                        <button
                            onClick={handleDemander}
                            disabled={loading || groupe.membresActifs >= groupe.nombreMembres}
                            className="w-full bg-amber-600 hover:bg-amber-700 disabled:bg-amber-300 text-white font-semibold py-3.5 rounded-xl text-sm transition-colors"
                        >
                            {loading ? 'Envoi...' : groupe.membresActifs >= groupe.nombreMembres ? 'Groupe complet' : 'Demander à rejoindre'}
                        </button>

                        <button
                            onClick={() => navigate('/dashboard')}
                            className="w-full mt-2 text-sm text-gray-400 hover:text-gray-600 py-2"
                        >
                            Annuler
                        </button>
                    </>
                )}

                {statut === 'succes' && (
                    <div className="text-center">
                        <div className="text-4xl mb-4">✅</div>
                        <p className="font-semibold text-gray-800">Demande envoyée !</p>
                        <p className="text-sm text-gray-400 mt-2">
                            L'administrateur va examiner votre demande. Redirection...
                        </p>
                    </div>
                )}

                {statut === 'erreur' && (
                    <div className="text-center">
                        <div className="text-4xl mb-4">⚠️</div>
                        <p className="font-semibold text-gray-800">{message}</p>
                        <p className="text-sm text-gray-400 mt-2">Redirection vers le dashboard...</p>
                    </div>
                )}
            </div>
        </div>
    )
}

export default Rejoindre
