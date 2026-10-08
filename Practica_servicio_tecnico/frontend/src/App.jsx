import { useState } from 'react'
import './App.css'

function App() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [exito, setExito] = useState(false)

  const iniciarSesion = async (e) => {
    e.preventDefault()
    setMensaje('')

    if (!username || !password) {
      setMensaje('Username y contraseña son obligatorios')
      setExito(false)
      return
    }

    try {
      const respuesta = await fetch('http://127.0.0.1:5000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          password,
        }),
      })

      const datos = await respuesta.json()
      setMensaje(datos.message)
      setExito(datos.success)
    } catch (error) {
      setMensaje('No se pudo conectar con el servidor')
      setExito(false)
    }
  }

  return (
    <div className="contenedor">
      <div className="login">
        <h1>Servicios Técnicos</h1>
        <h2>Iniciar sesión</h2>

        <form onSubmit={iniciarSesion}>
          <label>Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Ingrese su username"
          />

          <label>Contraseña</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Ingrese su contraseña"
          />

          <button type="submit">Ingresar</button>
        </form>

        {mensaje && (
          <p className={exito ? 'mensaje exito' : 'mensaje error'}>{mensaje}</p>
        )}
      </div>
    </div>
  )
}

export default App
