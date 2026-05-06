import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuthStore from '../store/authStore'
import useAuth from '../hooks/useAuth'
import groupeService from '../services/groupe.service'
import BottomNav from '../components/layout/BottomNav'

const Dashboard = () => {
    const { user } = useAuthStore()
    const { handleLogout } = useAuth()
    const navigate = useNavigate()
    const [groupes, setGroupes] = useState([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [form, setForm] = useState({
        nom: '',
        montantCotisation: '',
        devise: 'XOF',
        nombreMembres: '',
        dateDebut: '',
    })
    const [error, setError] = useState(null)
    const [creating, setCreating] = useState(false)

    useEffect(() => {
        fetchGroupes()
        const interval = setInterval(fetchGroupes, 30000)
        return () => clearInterval(interval)
    }, [])

    const fetchGroupes = async () => {
        try {
            const response = await groupeService.getMesGroupes()
            setGroupes(response.data || [])
        } catch {
            // silencieux — la liste reste vide
        } finally {
            setLoading(false)
        }
    }

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value })
    }

    const handleCreerGroupe = async (e) => {
        e.preventDefault()
        setError(null)
        setCreating(true)
        try {
            await groupeService.creerGroupe({
                ...form,
                montantCotisation: parseInt(form.montantCotisation),
                nombreMembres: parseInt(form.nombreMembres),
            })
            setShowForm(false)
            setForm({ nom: '', montantCotisation: '', devise: 'XOF', nombreMembres: '', dateDebut: '' })
            fetchGroupes()
        } catch (err) {
            setError(err.response?.data?.message || 'Erreur lors de la création')
        } finally {
            setCreating(false)
        }
    }

    const devises = ['XOF', 'XAF', 'MAD', 'EUR', 'USD', 'GNF', 'SLL']

    return (
        <div className="min-h-screen bg-amber-50">

            {/* Navbar */}
            <nav className="bg-white border-b border-amber-100 px-4 py-3 flex items-center justify-between sticky top-0 z-20">
                <h1 className="text-xl font-bold text-amber-700">Koto</h1>
                {/* Desktop: user info + logout */}
                <div className="hidden md:flex items-center gap-4">
                    <span className="text-sm text-gray-600">
                        Bonjour, <span className="font-medium">{user?.prenom}</span>
                    </span>
                    <button
                        onClick={handleLogout}
                        className="text-sm text-gray-500 hover:text-red-500 transition-colors"
                    >
                        Déconnexion
                    </button>

                </div>
                {/* Desktop: new group button */}
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="hidden md:block bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors ml-4"
                >
                    + Nouveau groupe
                </button>
            </nav>

            <div className="max-w-4xl mx-auto px-4 py-6 pb-28 md:pb-8">

                {/* Header */}
                <div className="flex items-center justify-between mb-5">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-800">Mes groupes</h2>
                        <p className="text-sm text-gray-500 mt-0.5">
                            {groupes.length} groupe{groupes.length !== 1 ? 's' : ''}
                        </p>
                    </div>
                </div>

                {/* Formulaire création */}
                {showForm && (
                    <div className="bg-white rounded-2xl border border-amber-100 p-5 mb-5">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-base font-semibold text-gray-800">Créer un groupe</h3>
                            <button
                                onClick={() => setShowForm(false)}
                                className="text-gray-400 hover:text-gray-600 p-1 -mr-1"
                                aria-label="Fermer"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-4">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleCreerGroupe} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nom du groupe</label>
                                <input
                                    type="text"
                                    name="nom"
                                    value={form.nom}
                                    onChange={handleChange}
                                    placeholder="Ex: Tontine Famille Coulibaly"
                                    required
                                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Montant cotisation</label>
                                    <input
                                        type="number"
                                        name="montantCotisation"
                                        value={form.montantCotisation}
                                        onChange={handleChange}
                                        placeholder="10000"
                                        required
                                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Devise</label>
                                    <select
                                        name="devise"
                                        value={form.devise}
                                        onChange={handleChange}
                                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white"
                                    >
                                        {devises.map(d => (
                                            <option key={d} value={d}>{d}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de membres</label>
                                    <input
                                        type="number"
                                        name="nombreMembres"
                                        value={form.nombreMembres}
                                        onChange={handleChange}
                                        placeholder="6"
                                        min="2"
                                        required
                                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Date de début</label>
                                    <input
                                        type="date"
                                        name="dateDebut"
                                        value={form.dateDebut}
                                        onChange={handleChange}
                                        required
                                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={creating}
                                className="w-full bg-amber-600 hover:bg-amber-700 disabled:bg-amber-300 text-white font-medium py-3.5 rounded-xl text-sm transition-colors active:scale-[0.99]"
                            >
                                {creating ? 'Création...' : 'Créer le groupe'}
                            </button>
                        </form>
                    </div>
                )}

                {/* Liste des groupes */}
                {loading ? (
                    <div className="text-center py-12 text-gray-400 text-sm">Chargement...</div>
                ) : groupes.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-2xl border border-amber-100">
                        <div className="text-4xl mb-3">🤝</div>
                        <p className="text-gray-500 font-medium text-sm">Aucun groupe pour l'instant</p>
                        <p className="text-gray-400 text-xs mt-1">Créez votre premier groupe de tontine</p>
                        <button
                            onClick={() => setShowForm(true)}
                            className="mt-4 bg-amber-600 text-white text-sm font-medium px-5 py-2.5 rounded-xl"
                        >
                            + Créer un groupe
                        </button>
                    </div>
                ) : (
                    <div className="grid gap-3">
                        {groupes.map((groupe) => (
                            <div
                                key={groupe.id}
                                onClick={() => navigate(`/groupes/${groupe.id}`)}
                                className="bg-white rounded-2xl border border-amber-100 p-5 cursor-pointer hover:border-amber-300 hover:shadow-sm active:scale-[0.99] transition-all touch-manipulation"
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <h3 className="font-semibold text-gray-800 truncate">{groupe.nom}</h3>
                                        <p className="text-sm text-gray-500 mt-0.5 truncate">
                                            Admin : {groupe.adminPrenom} {groupe.adminNom}
                                        </p>
                                    </div>
                                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full flex-shrink-0 ${
                                        groupe.statut === 'ACTIF'
                                            ? 'bg-green-50 text-green-700'
                                            : 'bg-gray-100 text-gray-500'
                                    }`}>
                                        {groupe.statut}
                                    </span>
                                </div>

                                <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-gray-50">
                                    <div>
                                        <p className="text-xs text-gray-400">Cotisation</p>
                                        <p className="text-sm font-medium text-gray-800 mt-0.5">
                                            {groupe.montantCotisation.toLocaleString()} <span className="text-xs text-gray-500">{groupe.devise}</span>
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-400">Membres</p>
                                        <p className="text-sm font-medium text-gray-800 mt-0.5">{groupe.nombreMembres}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-400">Début</p>
                                        <p className="text-sm font-medium text-gray-800 mt-0.5">
                                            {new Date(groupe.dateDebut).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Bottom navigation (mobile only) */}
            <BottomNav
                onAction={() => setShowForm(true)}
                actionLabel="Nouveau groupe"
            />
        </div>
    )
}

export default Dashboard
