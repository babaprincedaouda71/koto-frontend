import { useState } from 'react'
import { Link } from 'react-router-dom'
import useAuth from '../hooks/useAuth'

const Login = () => {
    const { handleLogin } = useAuth()
    const [form, setForm] = useState({ email: '', motDePasse: '' })
    const [error, setError] = useState(null)
    const [loading, setLoading] = useState(false)

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError(null)
        setLoading(true)
        try {
            await handleLogin(form)
        } catch (err) {
            setError(err.response?.data?.message || 'Erreur de connexion')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-amber-50 flex items-center justify-center px-4">
            <div className="w-full max-w-md">

                {/* Logo */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-amber-700">Koto</h1>
                    <p className="text-amber-600 mt-1">Gérez votre tontine simplement</p>
                </div>

                {/* Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-amber-100 p-8">
                    <h2 className="text-xl font-semibold text-gray-800 mb-6">Connexion</h2>

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-4">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Email
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={form.email}
                                onChange={handleChange}
                                placeholder="vous@exemple.com"
                                required
                                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Mot de passe
                            </label>
                            <input
                                type="password"
                                name="motDePasse"
                                value={form.motDePasse}
                                onChange={handleChange}
                                placeholder="••••••••"
                                required
                                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-amber-600 hover:bg-amber-700 disabled:bg-amber-300 text-white font-medium py-2.5 rounded-lg text-sm transition-colors"
                        >
                            {loading ? 'Connexion...' : 'Se connecter'}
                        </button>
                    </form>

                    <p className="text-center text-sm text-gray-500 mt-6">
                        Pas encore de compte ?{' '}
                        <Link to="/register" className="text-amber-600 hover:underline font-medium">
                            S'inscrire
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}

export default Login