import { Navigate, Route, Routes } from 'react-router-dom'
import RutaProtegida from './components/RutaProtegida.jsx'
import Layout from './components/Layout.jsx'
import { useAuth } from './context/useAuth.jsx'
import Clientes from './pages/Clientes.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Login from './pages/Login.jsx'
import Servicios from './pages/Servicios.jsx'
import Tecnicos from './pages/Tecnicos.jsx'
import './App.css'

function Inicio() {
  const { usuario } = useAuth()
  return <Navigate to={usuario ? '/dashboard' : '/login'} replace />
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Inicio />} />
      <Route path="/login" element={<Login />} />
      <Route element={<RutaProtegida />}>
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/clientes" element={<Clientes />} />
          <Route path="/tecnicos" element={<Tecnicos />} />
          <Route path="/servicios" element={<Servicios />} />
        </Route>
      </Route>
      <Route path="*" element={<Inicio />} />
    </Routes>
  )
}

export default App
