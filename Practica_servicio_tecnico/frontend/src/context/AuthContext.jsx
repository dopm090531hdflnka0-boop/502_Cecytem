import { useMemo, useState } from 'react'
import { AuthContext } from './authContext.js'

const STORAGE_KEY = 'serviciosTecnicosUsuario'

function leerUsuarioGuardado() {
  try {
    const guardado = localStorage.getItem(STORAGE_KEY)
    if (!guardado) return null

    const usuario = JSON.parse(guardado)
    if (typeof usuario?.username === 'string' && usuario.username.trim()) {
      return { username: usuario.username }
    }
  } catch {
    localStorage.removeItem(STORAGE_KEY)
  }

  return null
}

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(leerUsuarioGuardado)

  const value = useMemo(() => ({
    usuario,
    iniciarSesion(datosUsuario) {
      const sesion = { username: datosUsuario.username }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sesion))
      setUsuario(sesion)
    },
    cerrarSesion() {
      localStorage.removeItem(STORAGE_KEY)
      setUsuario(null)
    },
  }), [usuario])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
