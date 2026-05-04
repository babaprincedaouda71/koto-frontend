import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import useAuthStore from './store/authStore'

import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Groupe from './pages/Groupe'
import Rejoindre from "./pages/Rejoindre.jsx";

const ProtectedRoute = ({ children }) => {
  const token = useAuthStore((state) => state.token)
  const location = useLocation()
  return token ? children : <Navigate to="/login" state={{ from: location }} replace />
}

const App = () => {
  return (
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={
            <ProtectedRoute><Dashboard /></ProtectedRoute>
          } />
          <Route path="/groupes/:id" element={
            <ProtectedRoute><Groupe /></ProtectedRoute>
          } />
          <Route path="*" element={<Navigate to="/login" replace />} />
          <Route path="/rejoindre/:token" element={
            <ProtectedRoute><Rejoindre /></ProtectedRoute>
          } />
        </Routes>
      </BrowserRouter>
  )
}

export default App