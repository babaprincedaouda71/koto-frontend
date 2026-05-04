import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../utils/api'

const Rejoindre = () => {
    const { token } = useParams()
    const navigate = useNavigate()
    const [statut, setStatut] = useState('chargement')
    const [message, setMessage] = useState('')

    useEffect(() => {
        const rejoindre = async () => {
            try {
                await api.post(`/api/rejoindre/${token}`)
                setStatut('succes')
                setTimeout(() => navigate('/dashboard'), 2000)
            } catch (err) {
                const msg = err.response?.data?.message || 'Lien invalide ou expiré'
                if (msg.includes('déjà membre')) {
                    setStatut('succes')
                } else {
                    setMessage(msg)
                    setStatut('erreur')
                }
                setTimeout(() => navigate('/dashboard'), 2000)
            }
        }
        rejoindre()
    }, [token])

    return (
        <div className="min-h-screen bg-amber-50 flex items-center justify-center px-4">
            <div className="bg-white rounded-2xl border border-amber-100 p-8 text-center max-w-sm w-full">
                {statut === 'chargement' && (
                    <>
                        <p className="text-gray-500 text-sm">Rejoindre le groupe...</p>
                    </>
                )}
                {statut === 'succes' && (
                    <>
                        <div className="text-4xl mb-4">🎉</div>
                        <p className="font-semibold text-gray-800">Vous avez rejoint le groupe !</p>
                        <p className="text-sm text-gray-400 mt-2">Redirection en cours...</p>
                    </>
                )}
                {statut === 'erreur' && (
                    <>
                        <div className="text-4xl mb-4">⚠️</div>
                        <p className="font-semibold text-gray-800">{message}</p>
                        <p className="text-sm text-gray-400 mt-2">Redirection vers le dashboard...</p>
                    </>
                )}
            </div>
        </div>
    )
}

export default Rejoindre