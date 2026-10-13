from datetime import date

from flask import Blueprint, current_app, jsonify, request
from mysql.connector import Error, IntegrityError

from app.services.database import DatabaseUnavailableError, cursor_de_bd

servicios_bp = Blueprint("servicios", __name__)
ESTADOS = {"Pendiente", "En proceso", "Terminado", "Cancelado"}


def validar_servicio(datos):
    if not isinstance(datos, dict):
        return None, (jsonify({"success": False, "message": "JSON válido requerido"}), 400)

    cliente_id = datos.get("cliente_id")
    tecnico_id = datos.get("tecnico_id")
    descripcion = datos.get("descripcion")
    estado = datos.get("estado")
    fecha = datos.get("fecha")

    if not isinstance(cliente_id, int) or isinstance(cliente_id, bool) or cliente_id < 1:
        return None, (jsonify({"success": False, "message": "Selecciona un cliente válido"}), 400)
    if not isinstance(tecnico_id, int) or isinstance(tecnico_id, bool) or tecnico_id < 1:
        return None, (jsonify({"success": False, "message": "Selecciona un técnico válido"}), 400)
    if not isinstance(descripcion, str) or not descripcion.strip():
        return None, (jsonify({"success": False, "message": "La descripción es obligatoria"}), 400)
    if not isinstance(estado, str) or estado not in ESTADOS:
        return None, (jsonify({"success": False, "message": "Selecciona un estado válido"}), 400)
    if not isinstance(fecha, str):
        return None, (jsonify({"success": False, "message": "La fecha es obligatoria"}), 400)

    try:
        fecha_validada = date.fromisoformat(fecha)
    except ValueError:
        return None, (jsonify({"success": False, "message": "La fecha debe tener formato AAAA-MM-DD"}), 400)

    return {
        "cliente_id": cliente_id,
        "tecnico_id": tecnico_id,
        "descripcion": descripcion.strip(),
        "estado": estado,
        "fecha": fecha_validada,
    }, None


@servicios_bp.route("/api/servicios", methods=["GET"])
def obtener_servicios():
    consulta = """
        SELECT s.id, s.cliente_id, c.nombre AS cliente_nombre,
               s.tecnico_id, t.nombre AS tecnico_nombre,
               s.descripcion, s.estado, s.fecha
        FROM servicio AS s
        INNER JOIN cliente AS c ON c.id = s.cliente_id
        INNER JOIN tecnico AS t ON t.id = s.tecnico_id
        ORDER BY s.id DESC
    """
    try:
        with cursor_de_bd(dictionary=True) as (_, cursor):
            cursor.execute(consulta)
            servicios = cursor.fetchall()
            for servicio in servicios:
                if isinstance(servicio["fecha"], date):
                    servicio["fecha"] = servicio["fecha"].isoformat()
            return jsonify({"success": True, "servicios": servicios}), 200
    except DatabaseUnavailableError:
        return jsonify({"success": False, "message": "No se pudo conectar a la base de datos"}), 500
    except Error:
        current_app.logger.exception("Error al consultar servicios")
        return jsonify({"success": False, "message": "No se pudieron consultar los servicios"}), 500


@servicios_bp.route("/api/servicios", methods=["POST"])
def crear_servicio():
    datos, error = validar_servicio(request.get_json(silent=True))
    if error:
        return error

    try:
        with cursor_de_bd() as (conexion, cursor):
            cursor.execute(
                """INSERT INTO servicio
                   (cliente_id, tecnico_id, descripcion, estado, fecha)
                   VALUES (%s, %s, %s, %s, %s)""",
                (
                    datos["cliente_id"],
                    datos["tecnico_id"],
                    datos["descripcion"],
                    datos["estado"],
                    datos["fecha"],
                ),
            )
            conexion.commit()
            return jsonify({
                "success": True,
                "message": "Servicio creado",
                "id": cursor.lastrowid,
            }), 201
    except DatabaseUnavailableError:
        return jsonify({"success": False, "message": "No se pudo conectar a la base de datos"}), 500
    except IntegrityError:
        return jsonify({"success": False, "message": "El cliente o el técnico seleccionado no existe"}), 400
    except Error:
        current_app.logger.exception("Error al crear servicio")
        return jsonify({"success": False, "message": "No se pudo crear el servicio"}), 500


@servicios_bp.route("/api/servicios/<int:servicio_id>", methods=["PUT"])
def actualizar_servicio(servicio_id):
    datos, error = validar_servicio(request.get_json(silent=True))
    if error:
        return error

    try:
        with cursor_de_bd() as (conexion, cursor):
            cursor.execute(
                """UPDATE servicio
                   SET cliente_id = %s, tecnico_id = %s, descripcion = %s,
                       estado = %s, fecha = %s
                   WHERE id = %s""",
                (
                    datos["cliente_id"],
                    datos["tecnico_id"],
                    datos["descripcion"],
                    datos["estado"],
                    datos["fecha"],
                    servicio_id,
                ),
            )
            if cursor.rowcount == 0:
                return jsonify({"success": False, "message": "Servicio no encontrado o sin cambios"}), 404
            conexion.commit()
            return jsonify({"success": True, "message": "Servicio actualizado"}), 200
    except DatabaseUnavailableError:
        return jsonify({"success": False, "message": "No se pudo conectar a la base de datos"}), 500
    except IntegrityError:
        return jsonify({"success": False, "message": "El cliente o el técnico seleccionado no existe"}), 400
    except Error:
        current_app.logger.exception("Error al actualizar servicio")
        return jsonify({"success": False, "message": "No se pudo actualizar el servicio"}), 500


@servicios_bp.route("/api/servicios/<int:servicio_id>", methods=["DELETE"])
def eliminar_servicio(servicio_id):
    try:
        with cursor_de_bd() as (conexion, cursor):
            cursor.execute("DELETE FROM servicio WHERE id = %s", (servicio_id,))
            if cursor.rowcount == 0:
                return jsonify({"success": False, "message": "Servicio no encontrado"}), 404
            conexion.commit()
            return jsonify({"success": True, "message": "Servicio eliminado"}), 200
    except DatabaseUnavailableError:
        return jsonify({"success": False, "message": "No se pudo conectar a la base de datos"}), 500
    except Error:
        current_app.logger.exception("Error al eliminar servicio")
        return jsonify({"success": False, "message": "No se pudo eliminar el servicio"}), 500
