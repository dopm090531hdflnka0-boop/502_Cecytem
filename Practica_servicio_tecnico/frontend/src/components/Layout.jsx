import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth.jsx'

function Layout() {
  const { usuario, cerrarSesion } = useAuth()
  const navigate = useNavigate()

  function salir() {
    cerrarSesion()
    navigate('/login', { replace: true })
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <NavLink className="brand" to="/dashboard">
          <span className="brand-mark" aria-hidden="true">ST</span>
          <span>
            <strong>Servicios Técnicos</strong>
            <small>Administración de servicios</small>
          </span>
        </NavLink>
        <nav className="main-nav" aria-label="Navegación principal">
          <NavLink to="/dashboard">Inicio</NavLink>
          <NavLink to="/clientes">Clientes</NavLink>
          <NavLink to="/tecnicos">Técnicos</NavLink>
          <NavLink to="/servicios">Servicios</NavLink>
        </nav>
        <div className="user-actions">
          <span className="user-name">{usuario?.username}</span>
          <button className="button button-outline button-small" type="button" onClick={salir}>
            Cerrar sesión
          </button>
        </div>
      </header>
      <main className="page-container">
        <Outlet />
      </main>
      <footer className="app-footer">Sistema de Servicios Técnicos</footer>
    </div>
  )
}

export default Layout
