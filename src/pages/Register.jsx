import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import authService from '../services/auth.service'
import useAuthStore from '../store/authStore'

const passwordRules = (pwd) => ({
    length: pwd.length >= 8,
    upper: /[A-Z]/.test(pwd),
    lower: /[a-z]/.test(pwd),
    digit: /\d/.test(pwd),
})

const Register = () => {
    const navigate = useNavigate()
    const { setUser } = useAuthStore()
    const [form, setForm] = useState({
        nom: '', prenom: '', telephone: '', email: '', motDePasse: '',
    })
    const [error, setError] = useState(null)
    const [loading, setLoading] = useState(false)
    const [showRules, setShowRules] = useState(false)

    const rules = passwordRules(form.motDePasse)
    const passwordValid = Object.values(rules).every(Boolean)

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!passwordValid) {
            setError('Le mot de passe ne respecte pas les critères de sécurité')
            return
        }
        setError(null)
        setLoading(true)
        try {
            const response = await authService.register(form)
            setUser(response.data)
            navigate('/dashboard', { replace: true })
        } catch (err) {
            setError(err.response?.data?.message || 'Erreur lors de l\'inscription')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-amber-50 flex items-center justify-center px-4 py-8">
            <div className="w-full max-w-md">

                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-amber-700">Koto</h1>
                    <p className="text-amber-600 mt-1">Gérez votre tontine simplement</p>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-amber-100 p-8">
                    <h2 className="text-xl font-semibold text-gray-800 mb-6">Créer un compte</h2>

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 mb-4">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                                <input
                                    type="text"
                                    name="nom"
                                    value={form.nom}
                                    onChange={handleChange}
                                    placeholder="Coulibaly"
                                    required
                                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Prénom</label>
                                <input
                                    type="text"
                                    name="prenom"
                                    value={form.prenom}
                                    onChange={handleChange}
                                    placeholder="Prince"
                                    required
                                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                            <input
                                type="tel"
                                name="telephone"
                                value={form.telephone}
                                onChange={handleChange}
                                placeholder="+22600000000"
                                required
                                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <input
                                type="email"
                                name="email"
                                value={form.email}
                                onChange={handleChange}
                                placeholder="vous@exemple.com"
                                required
                                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
                            <input
                                type="password"
                                name="motDePasse"
                                value={form.motDePasse}
                                onChange={handleChange}
                                onFocus={() => setShowRules(true)}
                                placeholder="••••••••"
                                required
                                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                            />
                            {showRules && (
                                <ul className="mt-2 space-y-1">
                                    {[
                                        { ok: rules.length, label: '8 caractères minimum' },
                                        { ok: rules.upper,  label: 'Une majuscule' },
                                        { ok: rules.lower,  label: 'Une minuscule' },
                                        { ok: rules.digit,  label: 'Un chiffre' },
                                    ].map(({ ok, label }) => (
                                        <li key={label} className={`flex items-center gap-1.5 text-xs ${ok ? 'text-green-600' : 'text-gray-400'}`}>
                                            <span>{ok ? '✓' : '○'}</span>
                                            {label}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={loading || !passwordValid}
                            className="w-full bg-amber-600 hover:bg-amber-700 disabled:bg-amber-300 text-white font-medium py-3.5 rounded-xl text-sm transition-colors mt-2"
                        >
                            {loading ? 'Inscription...' : 'Créer mon compte'}
                        </button>
                    </form>

                    <p className="text-center text-sm text-gray-500 mt-6">
                        Déjà un compte ?{' '}
                        <Link to="/login" className="text-amber-600 hover:underline font-medium">
                            Se connecter
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}

export default Register
