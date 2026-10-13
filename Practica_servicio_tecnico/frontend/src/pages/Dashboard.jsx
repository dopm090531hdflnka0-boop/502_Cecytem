import { Link } from 'react-router-dom'
import { useAuth } from '../context/useAuth.jsx'

const modulos = [
  {
    to: '/clientes',
    title: 'Clientes',
    description: 'Registra, consulta y actualiza la información de tus clientes.',
    icon: 'CL',
  },
  {
    to: '/tecnicos',
    title: 'Técnicos',
    description: 'Organiza el equipo técnico y sus especialidades.',
    icon: 'TE',
  },
  {
    to: '/servicios',
    title: 'Servicios',
    description: 'Relaciona clientes y técnicos para dar seguimiento al trabajo.',
    icon: 'SE',
  },
]

function Dashboard() {
  const { usuario } = useAuth()

  return (
    <section>
      <div className="welcome-banner">
        <div>
          <p className="eyebrow">PANEL PRINCIPAL</p>
          <h1>Hola, {usuario?.username}</h1>
          <p>Selecciona un módulo para continuar con la administración.</p>
        </div>
        <span className="welcome-symbol" aria-hidden="true">ST</span>
      </div>
      <div className="section-heading">
        <div>
          <h2>Módulos del sistema</h2>
          <p className="muted">Accede a la información y operaciones del proyecto.</p>
        </div>
      </div>
      <div className="module-grid">
        {modulos.map((modulo) => (
          <Link className="module-card card" to={modulo.to} key={modulo.to}>
            <span className="module-icon" aria-hidden="true">{modulo.icon}</span>
            <h3>{modulo.title}</h3>
            <p>{modulo.description}</p>
            <span className="module-link">Abrir módulo <span aria-hidden="true">→</span></span>
          </Link>
        ))}
      </div>
    </section>
  )
}

export default Dashboard
