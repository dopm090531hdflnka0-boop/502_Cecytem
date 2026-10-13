import { useCallback, useEffect, useState } from 'react'
import {
  actualizarCliente,
  crearCliente,
  eliminarCliente,
  obtenerClientes,
} from '../services/api.js'

function Clientes() {
  const [clientes, setClientes] = useState([])
  const [nombre, setNombre] = useState('')
  const [editandoId, setEditandoId] = useState(null)
  const [mensaje, setMensaje] = useState('')
  const [tipoMensaje, setTipoMensaje] = useState('success')
  const [cargando, setCargando] = useState(true)
  const [guardando, setGuardando] = useState(false)

  const cargarClientes = useCallback(async () => {
    setCargando(true)
    try {
      const datos = await obtenerClientes()
      setClientes(datos.clientes)
    } catch (error) {
      setMensaje(error.message)
      setTipoMensaje('error')
    } finally {
      setCargando(false)
    }
  }, [])

  useEffect(() => {
    let vigente = true
    obtenerClientes()
      .then((datos) => {
        if (vigente) setClientes(datos.clientes)
      })
      .catch((error) => {
        if (vigente) {
          setMensaje(error.message)
          setTipoMensaje('error')
        }
      })
      .finally(() => {
        if (vigente) setCargando(false)
      })
    return () => { vigente = false }
  }, [])

  function limpiarFormulario() {
    setNombre('')
    setEditandoId(null)
  }

  async function guardar(event) {
    event.preventDefault()
    if (!nombre.trim()) {
      setTipoMensaje('error')
      setMensaje('El nombre del cliente es obligatorio.')
      return
    }

    setGuardando(true)
    try {
      const respuesta = editandoId
        ? await actualizarCliente(editandoId, { nombre: nombre.trim() })
        : await crearCliente({ nombre: nombre.trim() })
      setTipoMensaje('success')
      setMensaje(respuesta.message)
      limpiarFormulario()
      await cargarClientes()
    } catch (error) {
      setTipoMensaje('error')
      setMensaje(error.message)
    } finally {
      setGuardando(false)
    }
  }

  function editar(cliente) {
    setEditandoId(cliente.id)
    setNombre(cliente.nombre)
    setMensaje('')
  }

  async function eliminar(cliente) {
    if (!window.confirm(`¿Deseas eliminar al cliente "${cliente.nombre}"?`)) return

    setGuardando(true)
    try {
      const respuesta = await eliminarCliente(cliente.id)
      setTipoMensaje('success')
      setMensaje(respuesta.message)
      if (editandoId === cliente.id) limpiarFormulario()
      await cargarClientes()
    } catch (error) {
      setTipoMensaje('error')
      setMensaje(error.message)
    } finally {
      setGuardando(false)
    }
  }

  return (
    <section>
      <div className="page-heading">
        <div>
          <p className="eyebrow">CATÁLOGO</p>
          <h1>Clientes</h1>
          <p className="muted">Registra y administra los clientes del servicio técnico.</p>
        </div>
        <span className="record-count">{clientes.length} registros</span>
      </div>

      <div className="card form-card">
        <h2>{editandoId ? 'Editar cliente' : 'Registrar cliente'}</h2>
        <form className="inline-form" onSubmit={guardar}>
          <div className="field">
            <label htmlFor="cliente-nombre">Nombre del cliente</label>
            <input
              id="cliente-nombre"
              value={nombre}
              onChange={(event) => setNombre(event.target.value)}
              maxLength={100}
              placeholder="Ej. María López"
              required
            />
          </div>
          <button className="button button-primary" type="submit" disabled={guardando}>
            {guardando ? 'Guardando…' : editandoId ? 'Guardar cambios' : 'Registrar cliente'}
          </button>
          {editandoId && (
            <button className="button button-secondary" type="button" onClick={limpiarFormulario} disabled={guardando}>
              Cancelar
            </button>
          )}
        </form>
        {mensaje && <p className={`notice notice-${tipoMensaje}`} role="status">{mensaje}</p>}
      </div>

      <div className="card table-card">
        <div className="section-heading">
          <div>
            <h2>Listado de clientes</h2>
            <p className="muted">Clientes registrados en la base de datos.</p>
          </div>
          <button className="button button-outline" type="button" onClick={cargarClientes} disabled={cargando}>
            {cargando ? 'Actualizando…' : 'Actualizar lista'}
          </button>
        </div>
        {cargando ? <p className="empty-state">Cargando clientes…</p> : (
          <div className="table-wrap">
            <table className="data-table">
              <thead><tr><th>ID</th><th>Nombre</th><th>Acciones</th></tr></thead>
              <tbody>
                {clientes.map((cliente) => (
                  <tr key={cliente.id}>
                    <td>{cliente.id}</td>
                    <td className="primary-cell">{cliente.nombre}</td>
                    <td className="actions-cell">
                      <button className="button button-small button-outline" type="button" onClick={() => editar(cliente)} disabled={guardando}>Editar</button>
                      <button className="button button-small button-danger-outline" type="button" onClick={() => eliminar(cliente)} disabled={guardando}>Eliminar</button>
                    </td>
                  </tr>
                ))}
                {clientes.length === 0 && (
                  <tr><td colSpan="3" className="empty-state">Aún no hay clientes registrados.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  )
}

export default Clientes
