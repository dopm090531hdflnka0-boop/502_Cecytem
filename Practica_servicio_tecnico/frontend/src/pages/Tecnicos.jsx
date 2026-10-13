import { useCallback, useEffect, useState } from 'react'
import {
  actualizarTecnico,
  crearTecnico,
  eliminarTecnico,
  obtenerTecnicos,
} from '../services/api.js'

function Tecnicos() {
  const [tecnicos, setTecnicos] = useState([])
  const [nombre, setNombre] = useState('')
  const [especialidad, setEspecialidad] = useState('')
  const [editandoId, setEditandoId] = useState(null)
  const [mensaje, setMensaje] = useState('')
  const [tipoMensaje, setTipoMensaje] = useState('success')
  const [cargando, setCargando] = useState(true)
  const [guardando, setGuardando] = useState(false)

  const cargarTecnicos = useCallback(async () => {
    setCargando(true)
    try {
      const datos = await obtenerTecnicos()
      setTecnicos(datos.tecnicos)
    } catch (error) {
      setMensaje(error.message)
      setTipoMensaje('error')
    } finally {
      setCargando(false)
    }
  }, [])

  useEffect(() => {
    let vigente = true
    obtenerTecnicos()
      .then((datos) => {
        if (vigente) setTecnicos(datos.tecnicos)
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
    setEspecialidad('')
    setEditandoId(null)
  }

  async function guardar(event) {
    event.preventDefault()
    if (!nombre.trim() || !especialidad.trim()) {
      setTipoMensaje('error')
      setMensaje('Nombre y especialidad son obligatorios.')
      return
    }

    setGuardando(true)
    try {
      const tecnico = { nombre: nombre.trim(), especialidad: especialidad.trim() }
      const respuesta = editandoId
        ? await actualizarTecnico(editandoId, tecnico)
        : await crearTecnico(tecnico)
      setTipoMensaje('success')
      setMensaje(respuesta.message)
      limpiarFormulario()
      await cargarTecnicos()
    } catch (error) {
      setTipoMensaje('error')
      setMensaje(error.message)
    } finally {
      setGuardando(false)
    }
  }

  function editar(tecnico) {
    setEditandoId(tecnico.id)
    setNombre(tecnico.nombre)
    setEspecialidad(tecnico.especialidad)
    setMensaje('')
  }

  async function eliminar(tecnico) {
    if (!window.confirm(`¿Deseas eliminar al técnico "${tecnico.nombre}"?`)) return

    setGuardando(true)
    try {
      const respuesta = await eliminarTecnico(tecnico.id)
      setTipoMensaje('success')
      setMensaje(respuesta.message)
      if (editandoId === tecnico.id) limpiarFormulario()
      await cargarTecnicos()
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
          <h1>Técnicos</h1>
          <p className="muted">Administra el equipo técnico y sus especialidades.</p>
        </div>
        <span className="record-count">{tecnicos.length} registros</span>
      </div>

      <div className="card form-card">
        <h2>{editandoId ? 'Editar técnico' : 'Registrar técnico'}</h2>
        <form className="inline-form two-fields" onSubmit={guardar}>
          <div className="field">
            <label htmlFor="tecnico-nombre">Nombre del técnico</label>
            <input
              id="tecnico-nombre"
              value={nombre}
              onChange={(event) => setNombre(event.target.value)}
              maxLength={100}
              placeholder="Ej. Luis Hernández"
              required
            />
          </div>
          <div className="field">
            <label htmlFor="tecnico-especialidad">Especialidad</label>
            <input
              id="tecnico-especialidad"
              value={especialidad}
              onChange={(event) => setEspecialidad(event.target.value)}
              maxLength={100}
              placeholder="Ej. Redes"
              required
            />
          </div>
          <button className="button button-primary" type="submit" disabled={guardando}>
            {guardando ? 'Guardando…' : editandoId ? 'Guardar cambios' : 'Registrar técnico'}
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
            <h2>Listado de técnicos</h2>
            <p className="muted">Técnicos disponibles para asignar servicios.</p>
          </div>
          <button className="button button-outline" type="button" onClick={cargarTecnicos} disabled={cargando}>
            {cargando ? 'Actualizando…' : 'Actualizar lista'}
          </button>
        </div>
        {cargando ? <p className="empty-state">Cargando técnicos…</p> : (
          <div className="table-wrap">
            <table className="data-table">
              <thead><tr><th>ID</th><th>Nombre</th><th>Especialidad</th><th>Acciones</th></tr></thead>
              <tbody>
                {tecnicos.map((tecnico) => (
                  <tr key={tecnico.id}>
                    <td>{tecnico.id}</td>
                    <td className="primary-cell">{tecnico.nombre}</td>
                    <td>{tecnico.especialidad}</td>
                    <td className="actions-cell">
                      <button className="button button-small button-outline" type="button" onClick={() => editar(tecnico)} disabled={guardando}>Editar</button>
                      <button className="button button-small button-danger-outline" type="button" onClick={() => eliminar(tecnico)} disabled={guardando}>Eliminar</button>
                    </td>
                  </tr>
                ))}
                {tecnicos.length === 0 && (
                  <tr><td colSpan="4" className="empty-state">Aún no hay técnicos registrados.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  )
}

export default Tecnicos
