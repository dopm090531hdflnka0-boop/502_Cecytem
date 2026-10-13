import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/useAuth.jsx'

function RutaProtegida() {
  const { usuario } = useAuth()
  return usuario ? <Outlet /> : <Navigate to="/login" replace />
}

export default RutaProtegida
