import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import useAuthStore from '../../store/authStore'

const BottomNav = ({ onAction, actionLabel = 'Nouveau groupe' }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuthStore()
  const [showProfile, setShowProfile] = useState(false)

  const isHome = location.pathname === '/dashboard'

  const handleLogout = () => {
    setShowProfile(false)
    logout()
    navigate('/login')
  }

  return (
    <>
      {showProfile && (
        <div
          className="fixed inset-0 z-40 bg-black/20"
          onClick={() => setShowProfile(false)}
        >
          <div
            className="absolute bottom-20 left-4 right-4 bg-white rounded-2xl border border-gray-100 p-5 shadow-xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-bold text-base">
                {user?.prenom?.[0]?.toUpperCase() ?? '?'}
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800">{user?.prenom} {user?.nom}</p>
                <p className="text-xs text-gray-400">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full text-left text-sm text-red-600 font-medium py-3 border-t border-gray-100 active:opacity-70"
            >
              Déconnexion
            </button>
          </div>
        </div>
      )}

      <nav
        className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-amber-100 md:hidden"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="flex items-center justify-around px-4 py-2">
          <button
            onClick={() => navigate('/dashboard')}
            className={`flex flex-col items-center gap-0.5 px-5 py-2 rounded-xl transition-colors active:scale-95 ${
              isHome ? 'text-amber-600' : 'text-gray-400'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={isHome ? 2.5 : 1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 22V12h6v10" />
            </svg>
            <span className="text-xs font-medium">Accueil</span>
          </button>

          {onAction && (
            <button
              onClick={onAction}
              className="w-14 h-14 bg-amber-600 rounded-full flex items-center justify-center shadow-lg -mt-5 active:scale-95 transition-transform"
              aria-label={actionLabel}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14" />
              </svg>
            </button>
          )}

          <button
            onClick={() => setShowProfile(!showProfile)}
            className="flex flex-col items-center gap-0.5 px-5 py-2 rounded-xl text-gray-400 active:scale-95 transition-transform"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            <span className="text-xs font-medium truncate max-w-[60px]">
              {user?.prenom ?? 'Compte'}
            </span>
          </button>
        </div>
      </nav>
    </>
  )
}

export default BottomNav
