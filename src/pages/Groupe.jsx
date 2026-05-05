import { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import useAuthStore from '../store/authStore'
import groupeService from '../services/groupe.service'
import cycleService from '../services/cycle.service'
import paiementService from '../services/paiement.service'
import Toast from '../components/ui/Toast'

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
    const [toast, setToast] = useState(null)

    const showToast = useCallback((message, type = 'success') => {
        setToast({ message, type })
    }, [])

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
        } finally {
            setLoading(false)
        }
    }

    const fetchPaiements = async () => {
        try {
            const res = await paiementService.getPaiementsCycleActif(id)
            setPaiements(res.data || [])
        } catch {
            // silencieux — l'UI reste cohérente sans paiements
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
        } catch {
            showToast('Impossible de générer le lien', 'error')
        }
    }

    const handleConfirmerPaiement = async (paiementId) => {
        try {
            await paiementService.confirmerPaiement(paiementId, null)
            fetchPaiements()
        } catch {
            showToast('Impossible de confirmer le paiement', 'error')
        }
    }

    const handleDeclarerPaiement = async (paiementId) => {
        try {
            await paiementService.declarerPaiement(paiementId)
            fetchPaiements()
            showToast('Paiement déclaré, en attente de validation')
        } catch {
            showToast('Impossible de déclarer le paiement', 'error')
        }
    }

    const handleInvaliderPaiement = async (paiementId) => {
        try {
            await paiementService.invaliderPaiement(paiementId)
            fetchPaiements()
        } catch {
            showToast('Impossible d\'invalider le paiement', 'error')
        }
    }

    const handleRappel = async (paiementId) => {
        try {
            const res = await paiementService.envoyerRappel(paiementId)
            window.open(res.data, '_blank')
        } catch {
            showToast('Impossible d\'envoyer le rappel', 'error')
        }
    }

    const copierLien = async () => {
        try {
            await navigator.clipboard.writeText(lienInvitation)
            showToast('Lien copié !')
        } catch {
            showToast('Copie impossible, copiez le lien manuellement', 'error')
        }
    }

    const isAdmin = groupe?.adminId === user?.id
    const impayes = paiements.filter(p => p.statut !== 'PAYE')
    const payes = paiements.filter(p => p.statut === 'PAYE')
    const monPaiement = paiements.find(p => p.userId === user?.id)
    const peutPayer = monPaiement && (monPaiement.statut === 'EN_ATTENTE' || monPaiement.statut === 'EN_RETARD')

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

            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}

            {/* Header sticky */}
            <nav className="bg-white border-b border-amber-100 px-4 py-3 flex items-center gap-3 sticky top-0 z-20">
                <button
                    onClick={() => navigate('/dashboard')}
                    className="p-1.5 -ml-1.5 text-gray-400 hover:text-gray-600 rounded-lg active:bg-gray-100 transition-colors"
                    aria-label="Retour"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                </button>
                <h1 className="text-base font-semibold text-gray-800 truncate flex-1">{groupe.nom}</h1>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                    {isAdmin && (
                        <span className="text-xs font-medium px-2 py-1 rounded-full bg-amber-100 text-amber-800">
                            Admin
                        </span>
                    )}
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                        groupe.statut === 'ACTIF' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'
                    }`}>
                        {groupe.statut}
                    </span>
                </div>
            </nav>

            {/* Content — bottom padding accounts for sticky pay button on mobile */}
            <div className={`max-w-4xl mx-auto px-4 py-5 space-y-4 ${cycleActif && !isAdmin && peutPayer ? 'pb-28' : 'pb-6'}`}>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-2.5">
                    <div className="bg-white rounded-2xl border border-amber-100 p-4">
                        <p className="text-xs text-gray-400">Cotisation</p>
                        <p className="text-base font-semibold text-gray-800 mt-1 leading-tight">
                            {groupe.montantCotisation?.toLocaleString()}
                            <span className="text-xs font-normal text-gray-500 ml-0.5">{groupe.devise}</span>
                        </p>
                    </div>
                    <div className="bg-white rounded-2xl border border-amber-100 p-4">
                        <p className="text-xs text-gray-400">Membres</p>
                        <p className="text-base font-semibold text-gray-800 mt-1">{groupe.nombreMembres}</p>
                    </div>
                    <div className="bg-white rounded-2xl border border-amber-100 p-4">
                        <p className="text-xs text-gray-400">Pot total</p>
                        <p className="text-base font-semibold text-amber-700 mt-1 leading-tight">
                            {(groupe.montantCotisation * groupe.nombreMembres)?.toLocaleString()}
                            <span className="text-xs font-normal text-amber-600 ml-0.5">{groupe.devise}</span>
                        </p>
                    </div>
                </div>

                {/* Cycle actif */}
                {cycleActif ? (
                    <div className="bg-white rounded-2xl border border-amber-100 p-5">
                        <div className="flex items-start justify-between gap-3 mb-4">
                            <div>
                                <h2 className="font-semibold text-gray-800">Cycle {cycleActif.numeroCycle} en cours</h2>
                                <p className="text-sm text-gray-500 mt-0.5">
                                    Bénéficiaire : <span className="font-medium text-amber-700">
                                        {cycleActif.beneficiairePrenom} {cycleActif.beneficiaireNom}
                                    </span>
                                </p>
                            </div>
                            <div className="text-right flex-shrink-0">
                                <p className="text-xs text-gray-400">Échéance</p>
                                <p className="text-sm font-medium text-gray-800">
                                    {new Date(cycleActif.dateFin).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
                                </p>
                            </div>
                        </div>
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
                ) : isAdmin ? (
                    <div className="bg-white rounded-2xl border border-amber-100 p-6 text-center">
                        <p className="text-gray-500 text-sm mb-4">Aucun cycle en cours</p>
                        {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
                        <button
                            onClick={handleDemarrerCycle}
                            disabled={demarrage}
                            className="bg-amber-600 hover:bg-amber-700 disabled:bg-amber-300 text-white font-medium px-6 py-3 rounded-xl text-sm transition-colors"
                        >
                            {demarrage ? 'Démarrage...' : 'Démarrer le premier cycle'}
                        </button>
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl border border-amber-100 p-6 text-center">
                        <p className="text-gray-500 text-sm">En attente du démarrage du prochain cycle.</p>
                        <p className="text-xs text-gray-400 mt-1">L'administrateur lancera bientôt le cycle.</p>
                    </div>
                )}

                {/* Mon paiement (vue membre) */}
                {cycleActif && !isAdmin && monPaiement && (
                    <div className={`rounded-2xl border p-4 ${
                        monPaiement.statut === 'PAYE'
                            ? 'bg-green-50 border-green-200'
                            : monPaiement.statut === 'EN_RETARD'
                                ? 'bg-red-50 border-red-200'
                                : 'bg-amber-50 border-amber-200'
                    }`}>
                        <p className="text-xs font-medium text-gray-500 mb-1">Mon paiement ce cycle</p>
                        <div className="flex items-center justify-between">
                            <p className={`text-lg font-semibold ${
                                monPaiement.statut === 'PAYE' ? 'text-green-700'
                                    : monPaiement.statut === 'EN_RETARD' ? 'text-red-700'
                                    : 'text-amber-700'
                            }`}>
                                {monPaiement.statut === 'PAYE' ? 'Payé ✓'
                                    : monPaiement.statut === 'EN_RETARD' ? 'En retard'
                                    : monPaiement.statut === 'DECLARE' ? 'Déclaré'
                                    : 'En attente'}
                            </p>
                            <p className="text-sm font-medium text-gray-700">
                                {monPaiement.montant?.toLocaleString()} {groupe.devise}
                            </p>
                        </div>
                        {monPaiement.statut === 'PAYE' && monPaiement.datePaiement && (
                            <p className="text-xs text-green-600 mt-1">
                                Confirmé le {new Date(monPaiement.datePaiement).toLocaleDateString('fr-FR')}
                            </p>
                        )}
                        {monPaiement.statut === 'DECLARE' && (
                            <p className="text-xs text-blue-600 mt-1">En attente de validation par l'admin</p>
                        )}
                        {/* Desktop pay button (mobile has sticky button at bottom) */}
                        {peutPayer && (
                            <button
                                onClick={() => handleDeclarerPaiement(monPaiement.id)}
                                className="hidden md:block mt-3 w-full bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium py-2.5 rounded-xl transition-colors"
                            >
                                J'ai payé
                            </button>
                        )}
                    </div>
                )}

                {/* Onglets */}
                {cycleActif && (
                    <div>
                        <div className="flex bg-white border border-amber-100 rounded-xl p-1">
                            {[
                                { key: 'apercu', label: 'Aperçu' },
                                { key: 'impayes', label: `Impayés (${impayes.length})` },
                                { key: 'payes', label: `Payés (${payes.length})` },
                            ].map(tab => (
                                <button
                                    key={tab.key}
                                    onClick={() => setOnglet(tab.key)}
                                    className={`flex-1 px-2 py-2.5 rounded-lg text-sm font-medium transition-colors ${
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
                            <div className="mt-3 grid gap-2.5">
                                {paiements.map(p => {
                                    const estMoi = p.userId === user?.id
                                    return (
                                        <div key={p.id} className={`bg-white rounded-xl border px-4 py-3.5 flex items-center justify-between gap-3 ${
                                            estMoi ? 'border-amber-300 ring-1 ring-amber-200' : 'border-amber-100'
                                        }`}>
                                            <div className="min-w-0">
                                                <div className="flex items-center gap-1.5 flex-wrap">
                                                    <p className="font-medium text-gray-800 text-sm">
                                                        {p.membrePrenom} {p.membreNom}
                                                    </p>
                                                    {estMoi && (
                                                        <span className="text-xs font-medium px-1.5 py-0.5 rounded bg-amber-100 text-amber-700">Vous</span>
                                                    )}
                                                </div>
                                                <p className="text-xs text-gray-400 mt-0.5 truncate">{p.telephone}</p>
                                            </div>
                                            <div className="flex items-center gap-2 flex-shrink-0">
                                                <span className="text-sm font-medium text-gray-700 whitespace-nowrap">
                                                    {p.montant?.toLocaleString()} <span className="text-xs text-gray-400">{groupe.devise}</span>
                                                </span>
                                                <span className={`text-xs font-medium px-2 py-1 rounded-full whitespace-nowrap ${
                                                    p.statut === 'PAYE' ? 'bg-green-50 text-green-700'
                                                        : p.statut === 'EN_RETARD' ? 'bg-red-50 text-red-700'
                                                        : p.statut === 'DECLARE' ? 'bg-blue-50 text-blue-700'
                                                        : 'bg-amber-50 text-amber-700'
                                                }`}>
                                                    {p.statut === 'PAYE' ? 'Payé'
                                                        : p.statut === 'EN_RETARD' ? 'Retard'
                                                        : p.statut === 'DECLARE' ? 'Déclaré'
                                                        : 'Attente'}
                                                </span>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        )}

                        {/* Impayés */}
                        {onglet === 'impayes' && (
                            <div className="mt-3 space-y-2.5">
                                {impayes.length === 0 ? (
                                    <div className="bg-white rounded-xl border border-amber-100 p-8 text-center">
                                        <p className="text-green-600 font-medium text-sm">Tout le monde a payé !</p>
                                    </div>
                                ) : (
                                    impayes.map(p => {
                                        const estMoi = p.userId === user?.id
                                        return (
                                            <div key={p.id} className="bg-white rounded-xl border border-red-100 px-4 py-4">
                                                <div className="flex items-center justify-between gap-3">
                                                    <div className="min-w-0">
                                                        <div className="flex items-center gap-1.5 flex-wrap">
                                                            <p className="font-medium text-gray-800 text-sm">
                                                                {p.membrePrenom} {p.membreNom}
                                                            </p>
                                                            {estMoi && (
                                                                <span className="text-xs font-medium px-1.5 py-0.5 rounded bg-amber-100 text-amber-700">Vous</span>
                                                            )}
                                                        </div>
                                                        <p className="text-xs text-gray-400 mt-0.5">
                                                            {p.telephone} · {p.nombreRappels} rappel(s)
                                                        </p>
                                                    </div>
                                                    <p className="text-sm font-semibold text-gray-800 whitespace-nowrap flex-shrink-0">
                                                        {p.montant?.toLocaleString()} {groupe.devise}
                                                    </p>
                                                </div>
                                                {isAdmin && (
                                                    <div className="grid grid-cols-2 gap-2 mt-3">
                                                        {p.statut === 'DECLARE' ? (
                                                            <>
                                                                <button
                                                                    onClick={() => handleConfirmerPaiement(p.id)}
                                                                    className="bg-green-600 hover:bg-green-700 text-white text-xs font-medium py-2.5 rounded-xl transition-colors active:scale-95"
                                                                >
                                                                    Valider
                                                                </button>
                                                                <button
                                                                    onClick={() => handleInvaliderPaiement(p.id)}
                                                                    className="bg-red-50 hover:bg-red-100 text-red-700 text-xs font-medium py-2.5 rounded-xl transition-colors active:scale-95"
                                                                >
                                                                    Invalider
                                                                </button>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <button
                                                                    onClick={() => handleConfirmerPaiement(p.id)}
                                                                    className="bg-green-600 hover:bg-green-700 text-white text-xs font-medium py-2.5 rounded-xl transition-colors active:scale-95"
                                                                >
                                                                    Confirmer
                                                                </button>
                                                                <button
                                                                    onClick={() => handleRappel(p.id)}
                                                                    className="bg-amber-50 hover:bg-amber-100 text-amber-700 text-xs font-medium py-2.5 rounded-xl transition-colors active:scale-95"
                                                                >
                                                                    Rappel WhatsApp
                                                                </button>
                                                            </>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        )
                                    })
                                )}
                            </div>
                        )}

                        {/* Payés */}
                        {onglet === 'payes' && (
                            <div className="mt-3 space-y-2.5">
                                {payes.length === 0 ? (
                                    <div className="bg-white rounded-xl border border-amber-100 p-8 text-center">
                                        <p className="text-gray-400 text-sm">Aucun paiement confirmé</p>
                                    </div>
                                ) : (
                                    payes.map(p => {
                                        const estMoi = p.userId === user?.id
                                        return (
                                            <div key={p.id} className="bg-white rounded-xl border border-green-100 px-4 py-3.5 flex items-center justify-between gap-3">
                                                <div className="min-w-0">
                                                    <div className="flex items-center gap-1.5 flex-wrap">
                                                        <p className="font-medium text-gray-800 text-sm">
                                                            {p.membrePrenom} {p.membreNom}
                                                        </p>
                                                        {estMoi && (
                                                            <span className="text-xs font-medium px-1.5 py-0.5 rounded bg-amber-100 text-amber-700">Vous</span>
                                                        )}
                                                    </div>
                                                    <p className="text-xs text-gray-400 mt-0.5">
                                                        Payé le {p.datePaiement
                                                            ? new Date(p.datePaiement).toLocaleDateString('fr-FR')
                                                            : '—'}
                                                    </p>
                                                </div>
                                                <span className="text-sm font-semibold text-green-700 whitespace-nowrap flex-shrink-0">
                                                    {p.montant?.toLocaleString()} {groupe.devise}
                                                </span>
                                            </div>
                                        )
                                    })
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* Lien invitation */}
                {isAdmin && (
                    <div className="bg-white rounded-2xl border border-amber-100 p-5">
                        <h3 className="font-semibold text-gray-800 mb-3">Inviter des membres</h3>
                        {lienInvitation ? (
                            <div className="flex flex-col sm:flex-row gap-2">
                                <input
                                    readOnly
                                    value={lienInvitation}
                                    className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-600 bg-gray-50"
                                />
                                <button
                                    onClick={copierLien}
                                    className="bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium px-5 py-3 rounded-xl transition-colors active:scale-95"
                                >
                                    Copier
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={handleGenererInvitation}
                                className="w-full sm:w-auto bg-amber-50 hover:bg-amber-100 text-amber-700 text-sm font-medium px-5 py-3 rounded-xl transition-colors active:scale-95"
                            >
                                Générer un lien d'invitation
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Sticky pay button — mobile only, for members with pending payment */}
            {cycleActif && !isAdmin && peutPayer && (
                <div
                    className="fixed bottom-0 left-0 right-0 bg-white border-t border-amber-100 px-4 py-3 md:hidden"
                    style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 12px)' }}
                >
                    <button
                        onClick={() => handleDeclarerPaiement(monPaiement.id)}
                        className="w-full bg-amber-600 hover:bg-amber-700 text-white font-semibold py-3.5 rounded-xl text-sm transition-colors active:scale-[0.99]"
                    >
                        J'ai payé ce cycle — {monPaiement.montant?.toLocaleString()} {groupe.devise}
                    </button>
                </div>
            )}
        </div>
    )
}

export default Groupe
