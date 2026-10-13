import { useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth.jsx'
import { iniciarSesion as autenticar } from '../services/api.js'

function Login() {
  const { usuario, iniciarSesion } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [cargando, setCargando] = useState(false)

  if (usuario) return <Navigate to="/dashboard" replace />

  async function manejarLogin(event) {
    event.preventDefault()
    setMensaje('')

    if (!username.trim() || !password) {
      setMensaje('Escribe tu usuario y contraseña.')
      return
    }

    setCargando(true)
    try {
      const datos = await autenticar(username.trim(), password)
      iniciarSesion({ username: datos.username })
      navigate(location.state?.from || '/dashboard', { replace: true })
    } catch (error) {
      setMensaje(error.message)
    } finally {
      setCargando(false)
    }
  }

  return (
    <main className="login-page">
      <section className="login-intro">
        <p className="eyebrow">CONTROL Y SEGUIMIENTO</p>
        <h1>Servicios Técnicos</h1>
        <p>Administra clientes, técnicos y servicios desde un solo lugar.</p>
      </section>
      <section className="login-card card" aria-labelledby="login-title">
        <span className="brand-mark login-mark" aria-hidden="true">ST</span>
        <h2 id="login-title">Iniciar sesión</h2>
        <p className="muted">Ingresa tus credenciales para continuar.</p>
        <form className="form-stack" onSubmit={manejarLogin}>
          <label htmlFor="username">Usuario</label>
          <input
            id="username"
            autoComplete="username"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            placeholder="Escribe tu usuario"
            required
          />
          <label htmlFor="password">Contraseña</label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Escribe tu contraseña"
            required
          />
          <button className="button button-primary button-wide" type="submit" disabled={cargando}>
            {cargando ? 'Validando…' : 'Ingresar'}
          </button>
        </form>
        {mensaje && <p className="notice notice-error" role="alert">{mensaje}</p>}
      </section>
    </main>
  )
}

export default Login
