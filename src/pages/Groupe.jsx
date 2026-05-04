import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import useAuthStore from '../store/authStore'
import groupeService from '../services/groupe.service'
import cycleService from '../services/cycle.service'
import paiementService from '../services/paiement.service'

const Groupe = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const { user } = useAuthStore()

    const [groupe, setGroupe] = useState(null)
    const [cycleActif, setCycleActif] = useState(null)
    const [paiements, setPaiements] = useState([])
    const [lienInvitation, setLienInvitation] = useState(null)
    const [loading, setLoading] = useState(true)
    const [demarrage, setDemarrage] = useState(false)
    const [error, setError] = useState(null)
    const [onglet, setOnglet] = useState('apercu')

    useEffect(() => {
        fetchData()
    }, [id])

    const fetchData = async () => {
        try {
            const [groupeRes, cycleRes] = await Promise.allSettled([
                groupeService.getGroupe(id),
                cycleService.getCycleActif(id),
            ])
            if (groupeRes.status === 'fulfilled') setGroupe(groupeRes.value.data)
            if (cycleRes.status === 'fulfilled') {
                setCycleActif(cycleRes.value.data)
                fetchPaiements()
            }
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    const fetchPaiements = async () => {
        try {
            const res = await paiementService.getPaiementsCycleActif(id)
            setPaiements(res.data || [])
        } catch (err) {
            console.error(err)
        }
    }

    const handleDemarrerCycle = async () => {
        setDemarrage(true)
        setError(null)
        try {
            const res = await cycleService.demarrerCycle(id)
            setCycleActif(res.data)
            fetchPaiements()
        } catch (err) {
            setError(err.response?.data?.message || 'Erreur lors du démarrage')
        } finally {
            setDemarrage(false)
        }
    }

    const handleGenererInvitation = async () => {
        try {
            const res = await groupeService.genererInvitation(id)
            setLienInvitation(res.data)
        } catch (err) {
            console.error(err)
        }
    }

    const handleConfirmerPaiement = async (paiementId) => {
        try {
            await paiementService.confirmerPaiement(paiementId, null)
            fetchPaiements()
        } catch (err) {
            console.error(err)
        }
    }

    const handleRappel = async (paiementId) => {
        try {
            const res = await paiementService.envoyerRappel(paiementId)
            window.open(res.data, '_blank')
        } catch (err) {
            console.error(err)
        }
    }

    const copierLien = () => {
        navigator.clipboard.writeText(lienInvitation)
        alert('Lien copié !')
    }

    const isAdmin = groupe?.adminNom && user &&
        groupe.adminPrenom === user.prenom && groupe.adminNom === user.nom

    const impayes = paiements.filter(p => p.statut !== 'PAYE')
    const payes = paiements.filter(p => p.statut === 'PAYE')

    if (loading) {
        return (
            <div className="min-h-screen bg-amber-50 flex items-center justify-center">
                <p className="text-gray-400 text-sm">Chargement...</p>
            </div>
        )
    }

    if (!groupe) {
        return (
            <div className="min-h-screen bg-amber-50 flex items-center justify-center">
                <p className="text-gray-400 text-sm">Groupe non trouvé</p>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-amber-50">

            {/* Navbar */}
            <nav className="bg-white border-b border-amber-100 px-6 py-4 flex items-center gap-4">
                <button
                    onClick={() => navigate('/dashboard')}
                    className="text-gray-400 hover:text-gray-600 text-sm transition-colors"
                >
                    ← Retour
                </button>
                <h1 className="text-lg font-semibold text-gray-800">{groupe.nom}</h1>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ml-auto ${
                    groupe.statut === 'ACTIF' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'
                }`}>
          {groupe.statut}
        </span>
            </nav>

            <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">

                {/* Infos groupe */}
                <div className="grid grid-cols-3 gap-4">
                    <div className="bg-white rounded-2xl border border-amber-100 p-5">
                        <p className="text-xs text-gray-400">Cotisation</p>
                        <p className="text-xl font-semibold text-gray-800 mt-1">
                            {groupe.montantCotisation?.toLocaleString()} {groupe.devise}
                        </p>
                    </div>
                    <div className="bg-white rounded-2xl border border-amber-100 p-5">
                        <p className="text-xs text-gray-400">Membres prévus</p>
                        <p className="text-xl font-semibold text-gray-800 mt-1">{groupe.nombreMembres}</p>
                    </div>
                    <div className="bg-white rounded-2xl border border-amber-100 p-5">
                        <p className="text-xs text-gray-400">Pot total</p>
                        <p className="text-xl font-semibold text-amber-700 mt-1">
                            {(groupe.montantCotisation * groupe.nombreMembres)?.toLocaleString()} {groupe.devise}
                        </p>
                    </div>
                </div>

                {/* Cycle actif */}
                {cycleActif ? (
                    <div className="bg-white rounded-2xl border border-amber-100 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h2 className="font-semibold text-gray-800">Cycle {cycleActif.numeroCycle} en cours</h2>
                                <p className="text-sm text-gray-500 mt-0.5">
                                    Bénéficiaire : <span className="font-medium text-amber-700">
                    {cycleActif.beneficiairePrenom} {cycleActif.beneficiaireNom}
                  </span>
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-gray-400">Échéance</p>
                                <p className="text-sm font-medium text-gray-800">
                                    {new Date(cycleActif.dateFin).toLocaleDateString('fr-FR')}
                                </p>
                            </div>
                        </div>

                        {/* Barre de progression */}
                        <div className="flex items-center gap-3">
                            <div className="flex-1 bg-gray-100 rounded-full h-2">
                                <div
                                    className="bg-amber-500 h-2 rounded-full transition-all"
                                    style={{
                                        width: cycleActif.totalMembres > 0
                                            ? `${(cycleActif.nombrePaie / (cycleActif.totalMembres - 1)) * 100}%`
                                            : '0%'
                                    }}
                                />
                            </div>
                            <span className="text-sm text-gray-500 whitespace-nowrap">
                {cycleActif.nombrePaie} / {cycleActif.totalMembres - 1} payé(s)
              </span>
                        </div>
                    </div>
                ) : (
                    isAdmin && (
                        <div className="bg-white rounded-2xl border border-amber-100 p-6 text-center">
                            <p className="text-gray-500 text-sm mb-4">Aucun cycle en cours</p>
                            {error && (
                                <p className="text-red-500 text-sm mb-3">{error}</p>
                            )}
                            <button
                                onClick={handleDemarrerCycle}
                                disabled={demarrage}
                                className="bg-amber-600 hover:bg-amber-700 disabled:bg-amber-300 text-white font-medium px-6 py-2.5 rounded-lg text-sm transition-colors"
                            >
                                {demarrage ? 'Démarrage...' : 'Démarrer le premier cycle'}
                            </button>
                        </div>
                    )
                )}

                {/* Onglets */}
                {cycleActif && (
                    <div>
                        <div className="flex gap-1 bg-white border border-amber-100 rounded-xl p-1 w-fit">
                            {[
                                { key: 'apercu', label: 'Aperçu' },
                                { key: 'impayes', label: `Impayés (${impayes.length})` },
                                { key: 'payes', label: `Payés (${payes.length})` },
                            ].map(tab => (
                                <button
                                    key={tab.key}
                                    onClick={() => setOnglet(tab.key)}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                        onglet === tab.key
                                            ? 'bg-amber-600 text-white'
                                            : 'text-gray-500 hover:text-gray-700'
                                    }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* Aperçu */}
                        {onglet === 'apercu' && (
                            <div className="mt-4 grid gap-3">
                                {paiements.map(p => (
                                    <div key={p.id} className="bg-white rounded-xl border border-amber-100 px-5 py-4 flex items-center justify-between">
                                        <div>
                                            <p className="font-medium text-gray-800 text-sm">
                                                {p.membrePrenom} {p.membreNom}
                                            </p>
                                            <p className="text-xs text-gray-400 mt-0.5">{p.telephone}</p>
                                        </div>
                                        <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-gray-700">
                        {p.montant?.toLocaleString()} {groupe.devise}
                      </span>
                                            <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                                                p.statut === 'PAYE'
                                                    ? 'bg-green-50 text-green-700'
                                                    : p.statut === 'EN_RETARD'
                                                        ? 'bg-red-50 text-red-700'
                                                        : 'bg-amber-50 text-amber-700'
                                            }`}>
                        {p.statut === 'PAYE' ? 'Payé' : p.statut === 'EN_RETARD' ? 'En retard' : 'En attente'}
                      </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Impayés */}
                        {onglet === 'impayes' && (
                            <div className="mt-4 space-y-3">
                                {impayes.length === 0 ? (
                                    <div className="bg-white rounded-xl border border-amber-100 p-8 text-center">
                                        <p className="text-green-600 font-medium text-sm">Tout le monde a payé !</p>
                                    </div>
                                ) : (
                                    impayes.map(p => (
                                        <div key={p.id} className="bg-white rounded-xl border border-red-100 px-5 py-4">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="font-medium text-gray-800 text-sm">
                                                        {p.membrePrenom} {p.membreNom}
                                                    </p>
                                                    <p className="text-xs text-gray-400 mt-0.5">
                                                        {p.telephone} · {p.nombreRappels} rappel(s) envoyé(s)
                                                    </p>
                                                </div>
                                                <p className="text-sm font-semibold text-gray-800">
                                                    {p.montant?.toLocaleString()} {groupe.devise}
                                                </p>
                                            </div>
                                            {isAdmin && (
                                                <div className="flex gap-2 mt-3">
                                                    <button
                                                        onClick={() => handleConfirmerPaiement(p.id)}
                                                        className="flex-1 bg-green-600 hover:bg-green-700 text-white text-xs font-medium py-2 rounded-lg transition-colors"
                                                    >
                                                        Confirmer paiement
                                                    </button>
                                                    <button
                                                        onClick={() => handleRappel(p.id)}
                                                        className="flex-1 bg-amber-50 hover:bg-amber-100 text-amber-700 text-xs font-medium py-2 rounded-lg transition-colors"
                                                    >
                                                        Rappel WhatsApp
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        )}

                        {/* Payés */}
                        {onglet === 'payes' && (
                            <div className="mt-4 space-y-3">
                                {payes.length === 0 ? (
                                    <div className="bg-white rounded-xl border border-amber-100 p-8 text-center">
                                        <p className="text-gray-400 text-sm">Aucun paiement confirmé pour l'instant</p>
                                    </div>
                                ) : (
                                    payes.map(p => (
                                        <div key={p.id} className="bg-white rounded-xl border border-green-100 px-5 py-4 flex items-center justify-between">
                                            <div>
                                                <p className="font-medium text-gray-800 text-sm">
                                                    {p.membrePrenom} {p.membreNom}
                                                </p>
                                                <p className="text-xs text-gray-400 mt-0.5">
                                                    Payé le {p.datePaiement
                                                    ? new Date(p.datePaiement).toLocaleDateString('fr-FR')
                                                    : '—'}
                                                </p>
                                            </div>
                                            <span className="text-sm font-semibold text-green-700">
                        {p.montant?.toLocaleString()} {groupe.devise}
                      </span>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* Lien invitation */}
                {isAdmin && (
                    <div className="bg-white rounded-2xl border border-amber-100 p-6">
                        <h3 className="font-semibold text-gray-800 mb-3">Inviter des membres</h3>
                        {lienInvitation ? (
                            <div className="flex gap-2">
                                <input
                                    readOnly
                                    value={lienInvitation}
                                    className="flex-1 border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-600 bg-gray-50"
                                />
                                <button
                                    onClick={copierLien}
                                    className="bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors"
                                >
                                    Copier
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={handleGenererInvitation}
                                className="bg-amber-50 hover:bg-amber-100 text-amber-700 text-sm font-medium px-4 py-2.5 rounded-lg transition-colors"
                            >
                                Générer un lien d'invitation
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}

export default Groupe