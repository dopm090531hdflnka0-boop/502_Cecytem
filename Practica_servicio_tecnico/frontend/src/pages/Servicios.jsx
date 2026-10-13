import { useCallback, useEffect, useState } from 'react'
import {
  actualizarServicio,
  crearServicio,
  eliminarServicio,
  obtenerClientesCatalogo,
  obtenerServicios,
  obtenerTecnicosCatalogo,
} from '../services/api.js'

const ESTADOS = ['Pendiente', 'En proceso', 'Terminado', 'Cancelado']

function fechaActual() {
  const fecha = new Date()
  const zonaHoraria = fecha.getTimezoneOffset() * 60000
  return new Date(fecha.getTime() - zonaHoraria).toISOString().slice(0, 10)
}

function Servicios() {
  const [servicios, setServicios] = useState([])
  const [clientes, setClientes] = useState([])
  const [tecnicos, setTecnicos] = useState([])
  const [clienteId, setClienteId] = useState('')
  const [tecnicoId, setTecnicoId] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [estado, setEstado] = useState('Pendiente')
  const [fecha, setFecha] = useState(fechaActual)
  const [editandoId, setEditandoId] = useState(null)
  const [mensaje, setMensaje] = useState('')
  const [tipoMensaje, setTipoMensaje] = useState('success')
  const [cargando, setCargando] = useState(true)
  const [guardando, setGuardando] = useState(false)

  const cargarDatos = useCallback(async () => {
    setCargando(true)
    try {
      const [serviciosDatos, clientesDatos, tecnicosDatos] = await Promise.all([
        obtenerServicios(),
        obtenerClientesCatalogo(),
        obtenerTecnicosCatalogo(),
      ])
      setServicios(serviciosDatos.servicios)
      setClientes(clientesDatos.clientes)
      setTecnicos(tecnicosDatos.tecnicos)
    } catch (error) {
      setMensaje(error.message)
      setTipoMensaje('error')
    } finally {
      setCargando(false)
    }
  }, [])

  useEffect(() => {
    let vigente = true
    Promise.all([
      obtenerServicios(),
      obtenerClientesCatalogo(),
      obtenerTecnicosCatalogo(),
    ])
      .then(([serviciosDatos, clientesDatos, tecnicosDatos]) => {
        if (!vigente) return
        setServicios(serviciosDatos.servicios)
        setClientes(clientesDatos.clientes)
        setTecnicos(tecnicosDatos.tecnicos)
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
    setClienteId('')
    setTecnicoId('')
    setDescripcion('')
    setEstado('Pendiente')
    setFecha(fechaActual())
    setEditandoId(null)
  }

  async function guardar(event) {
    event.preventDefault()
    if (!clienteId || !tecnicoId || !descripcion.trim() || !estado || !fecha) {
      setTipoMensaje('error')
      setMensaje('Completa cliente, técnico, descripción, estado y fecha.')
      return
    }

    setGuardando(true)
    try {
      const servicio = {
        cliente_id: Number(clienteId),
        tecnico_id: Number(tecnicoId),
        descripcion: descripcion.trim(),
        estado,
        fecha,
      }
      const respuesta = editandoId
        ? await actualizarServicio(editandoId, servicio)
        : await crearServicio(servicio)
      setTipoMensaje('success')
      setMensaje(respuesta.message)
      limpiarFormulario()
      await cargarDatos()
    } catch (error) {
      setTipoMensaje('error')
      setMensaje(error.message)
    } finally {
      setGuardando(false)
    }
  }

  function editar(servicio) {
    setEditandoId(servicio.id)
    setClienteId(String(servicio.cliente_id))
    setTecnicoId(String(servicio.tecnico_id))
    setDescripcion(servicio.descripcion)
    setEstado(servicio.estado)
    setFecha(String(servicio.fecha).slice(0, 10))
    setMensaje('')
  }

  async function eliminar(servicio) {
    if (!window.confirm(`¿Deseas eliminar el servicio #${servicio.id}?`)) return

    setGuardando(true)
    try {
      const respuesta = await eliminarServicio(servicio.id)
      setTipoMensaje('success')
      setMensaje(respuesta.message)
      if (editandoId === servicio.id) limpiarFormulario()
      await cargarDatos()
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
          <p className="eyebrow">ORDENES DE TRABAJO</p>
          <h1>Servicios</h1>
          <p className="muted">Relaciona a cada cliente con el técnico que atenderá su servicio.</p>
        </div>
        <span className="record-count">{servicios.length} registros</span>
      </div>

      <div className="card form-card">
        <h2>{editandoId ? 'Editar servicio' : 'Registrar servicio'}</h2>
        {(clientes.length === 0 || tecnicos.length === 0) && (
          <p className="notice notice-warning">
            Para registrar servicios necesitas al menos un cliente y un técnico. Agrégalos en sus módulos.
          </p>
        )}
        <form className="service-form" onSubmit={guardar}>
          <div className="field">
            <label htmlFor="servicio-cliente">Cliente</label>
            <select id="servicio-cliente" value={clienteId} onChange={(event) => setClienteId(event.target.value)} required>
              <option value="">Selecciona un cliente</option>
              {clientes.map((cliente) => <option key={cliente.id} value={cliente.id}>{cliente.nombre}</option>)}
            </select>
          </div>
          <div className="field">
            <label htmlFor="servicio-tecnico">Técnico</label>
            <select id="servicio-tecnico" value={tecnicoId} onChange={(event) => setTecnicoId(event.target.value)} required>
              <option value="">Selecciona un técnico</option>
              {tecnicos.map((tecnico) => <option key={tecnico.id} value={tecnico.id}>{tecnico.nombre}</option>)}
            </select>
          </div>
          <div className="field field-wide">
            <label htmlFor="servicio-descripcion">Descripción</label>
            <textarea
              id="servicio-descripcion"
              value={descripcion}
              onChange={(event) => setDescripcion(event.target.value)}
              rows="3"
              maxLength={500}
              placeholder="Describe el trabajo solicitado"
              required
            />
          </div>
          <div className="field">
            <label htmlFor="servicio-estado">Estado</label>
            <select id="servicio-estado" value={estado} onChange={(event) => setEstado(event.target.value)} required>
              {ESTADOS.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </div>
          <div className="field">
            <label htmlFor="servicio-fecha">Fecha</label>
            <input id="servicio-fecha" type="date" value={fecha} onChange={(event) => setFecha(event.target.value)} required />
          </div>
          <div className="form-actions field-wide">
            <button className="button button-primary" type="submit" disabled={guardando || clientes.length === 0 || tecnicos.length === 0}>
              {guardando ? 'Guardando…' : editandoId ? 'Guardar cambios' : 'Registrar servicio'}
            </button>
            {editandoId && (
              <button className="button button-secondary" type="button" onClick={limpiarFormulario} disabled={guardando}>
                Cancelar
              </button>
            )}
          </div>
        </form>
        {mensaje && <p className={`notice notice-${tipoMensaje}`} role="status">{mensaje}</p>}
      </div>

      <div className="card table-card">
        <div className="section-heading">
          <div>
            <h2>Listado de servicios</h2>
            <p className="muted">La tabla muestra los nombres relacionados de clientes y técnicos.</p>
          </div>
          <button className="button button-outline" type="button" onClick={cargarDatos} disabled={cargando}>
            {cargando ? 'Actualizando…' : 'Actualizar lista'}
          </button>
        </div>
        {cargando ? <p className="empty-state">Cargando servicios…</p> : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr><th>ID</th><th>Cliente</th><th>Técnico</th><th>Descripción</th><th>Estado</th><th>Fecha</th><th>Acciones</th></tr>
              </thead>
              <tbody>
                {servicios.map((servicio) => (
                  <tr key={servicio.id}>
                    <td>{servicio.id}</td>
                    <td className="primary-cell">{servicio.cliente_nombre}</td>
                    <td>{servicio.tecnico_nombre}</td>
                    <td>{servicio.descripcion}</td>
                    <td><span className={`status status-${servicio.estado.toLowerCase().replaceAll(' ', '-')}`}>{servicio.estado}</span></td>
                    <td>{String(servicio.fecha).slice(0, 10)}</td>
                    <td className="actions-cell">
                      <button className="button button-small button-outline" type="button" onClick={() => editar(servicio)} disabled={guardando}>Editar</button>
                      <button className="button button-small button-danger-outline" type="button" onClick={() => eliminar(servicio)} disabled={guardando}>Eliminar</button>
                    </td>
                  </tr>
                ))}
                {servicios.length === 0 && (
                  <tr><td colSpan="7" className="empty-state">Aún no hay servicios registrados.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  )
}

export default Servicios
