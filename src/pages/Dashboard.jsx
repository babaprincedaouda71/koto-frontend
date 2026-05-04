import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuthStore from '../store/authStore'
import groupeService from '../services/groupe.service'

const Dashboard = () => {
    const { user, logout } = useAuthStore()
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
    }, [])

    const fetchGroupes = async () => {
        try {
            const response = await groupeService.getMesGroupes()
            setGroupes(response.data || [])
        } catch (err) {
            console.error(err)
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

    const handleLogout = () => {
        logout()
        navigate('/login')
    }

    const devises = ['XOF', 'XAF', 'MAD', 'EUR', 'USD', 'GNF', 'SLL']

    return (
        <div className="min-h-screen bg-amber-50">

            {/* Navbar */}
            <nav className="bg-white border-b border-amber-100 px-6 py-4 flex items-center justify-between">
                <h1 className="text-2xl font-bold text-amber-700">Koto</h1>
                <div className="flex items-center gap-4">
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
            </nav>

            <div className="max-w-4xl mx-auto px-6 py-8">

                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-800">Mes groupes</h2>
                        <p className="text-sm text-gray-500 mt-0.5">
                            {groupes.length} groupe{groupes.length > 1 ? 's' : ''}
                        </p>
                    </div>
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
                    >
                        + Nouveau groupe
                    </button>
                </div>

                {/* Formulaire création */}
                {showForm && (
                    <div className="bg-white rounded-2xl border border-amber-100 p-6 mb-6">
                        <h3 className="text-base font-semibold text-gray-800 mb-4">Créer un groupe</h3>

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
                                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Montant cotisation</label>
                                    <input
                                        type="number"
                                        name="montantCotisation"
                                        value={form.montantCotisation}
                                        onChange={handleChange}
                                        placeholder="10000"
                                        required
                                        className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Devise</label>
                                    <select
                                        name="devise"
                                        value={form.devise}
                                        onChange={handleChange}
                                        className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                                    >
                                        {devises.map(d => (
                                            <option key={d} value={d}>{d}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
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
                                        className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
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
                                        className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="submit"
                                    disabled={creating}
                                    className="flex-1 bg-amber-600 hover:bg-amber-700 disabled:bg-amber-300 text-white font-medium py-2.5 rounded-lg text-sm transition-colors"
                                >
                                    {creating ? 'Création...' : 'Créer le groupe'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowForm(false)}
                                    className="flex-1 border border-gray-200 text-gray-600 hover:bg-gray-50 font-medium py-2.5 rounded-lg text-sm transition-colors"
                                >
                                    Annuler
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Liste des groupes */}
                {loading ? (
                    <div className="text-center py-12 text-gray-400 text-sm">Chargement...</div>
                ) : groupes.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-2xl border border-amber-100">
                        <p className="text-gray-400 text-sm">Aucun groupe pour l'instant</p>
                        <p className="text-gray-300 text-xs mt-1">Créez votre premier groupe de tontine</p>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {groupes.map((groupe) => (
                            <div
                                key={groupe.id}
                                onClick={() => navigate(`/groupes/${groupe.id}`)}
                                className="bg-white rounded-2xl border border-amber-100 p-6 cursor-pointer hover:border-amber-300 hover:shadow-sm transition-all"
                            >
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h3 className="font-semibold text-gray-800">{groupe.nom}</h3>
                                        <p className="text-sm text-gray-500 mt-1">
                                            Admin : {groupe.adminPrenom} {groupe.adminNom}
                                        </p>
                                    </div>
                                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                                        groupe.statut === 'ACTIF'
                                            ? 'bg-green-50 text-green-700'
                                            : 'bg-gray-100 text-gray-500'
                                    }`}>
                    {groupe.statut}
                  </span>
                                </div>

                                <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-50">
                                    <div>
                                        <p className="text-xs text-gray-400">Cotisation</p>
                                        <p className="text-sm font-medium text-gray-800 mt-0.5">
                                            {groupe.montantCotisation.toLocaleString()} {groupe.devise}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-400">Membres</p>
                                        <p className="text-sm font-medium text-gray-800 mt-0.5">
                                            {groupe.nombreMembres}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-400">Début</p>
                                        <p className="text-sm font-medium text-gray-800 mt-0.5">
                                            {new Date(groupe.dateDebut).toLocaleDateString('fr-FR')}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

export default Dashboard