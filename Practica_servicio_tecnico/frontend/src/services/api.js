const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000'

async function request(path, options = {}) {
  let response
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        ...(options.body ? { 'Content-Type': 'application/json' } : {}),
        ...options.headers,
      },
    })
  } catch {
    throw new Error('No se pudo conectar con el servidor. Comprueba que Flask esté activo.')
  }

  let datos
  try {
    datos = await response.json()
  } catch {
    throw new Error('El servidor respondió con un formato inesperado.')
  }

  if (!response.ok || datos.success === false) {
    throw new Error(datos.message || `La solicitud falló (HTTP ${response.status}).`)
  }

  return datos
}

function jsonBody(value) {
  return JSON.stringify(value)
}

export function iniciarSesion(username, password) {
  return request('/api/login', {
    method: 'POST',
    body: jsonBody({ username, password }),
  })
}

export function obtenerClientes() {
  return request('/api/clientes')
}

export function crearCliente(cliente) {
  return request('/api/clientes', { method: 'POST', body: jsonBody(cliente) })
}

export function actualizarCliente(id, cliente) {
  return request(`/api/clientes/${id}`, { method: 'PUT', body: jsonBody(cliente) })
}

export function eliminarCliente(id) {
  return request(`/api/clientes/${id}`, { method: 'DELETE' })
}

export function obtenerTecnicos() {
  return request('/api/tecnicos')
}

export function obtenerTecnicosCatalogo() {
  return request('/api/tecnicos/catalogo')
}

export function crearTecnico(tecnico) {
  return request('/api/tecnicos', { method: 'POST', body: jsonBody(tecnico) })
}

export function actualizarTecnico(id, tecnico) {
  return request(`/api/tecnicos/${id}`, { method: 'PUT', body: jsonBody(tecnico) })
}

export function eliminarTecnico(id) {
  return request(`/api/tecnicos/${id}`, { method: 'DELETE' })
}

export function obtenerServicios() {
  return request('/api/servicios')
}

export function obtenerClientesCatalogo() {
  return request('/api/clientes/catalogo')
}

export function crearServicio(servicio) {
  return request('/api/servicios', { method: 'POST', body: jsonBody(servicio) })
}

export function actualizarServicio(id, servicio) {
  return request(`/api/servicios/${id}`, { method: 'PUT', body: jsonBody(servicio) })
}

export function eliminarServicio(id) {
  return request(`/api/servicios/${id}`, { method: 'DELETE' })
}
