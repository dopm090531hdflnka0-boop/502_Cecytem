from flask import Blueprint, current_app, jsonify, request
from mysql.connector import Error, IntegrityError

from app.services.database import DatabaseUnavailableError, cursor_de_bd

tecnicos_bp = Blueprint("tecnicos", __name__)


def validar_tecnico(datos):
    if not isinstance(datos, dict):
        return None, (jsonify({"success": False, "message": "JSON válido requerido"}), 400)

    nombre = datos.get("nombre")
    especialidad = datos.get("especialidad")
    if not isinstance(nombre, str) or not nombre.strip():
        return None, (jsonify({"success": False, "message": "El nombre es obligatorio"}), 400)
    if not isinstance(especialidad, str) or not especialidad.strip():
        return None, (jsonify({"success": False, "message": "La especialidad es obligatoria"}), 400)

    return {"nombre": nombre.strip(), "especialidad": especialidad.strip()}, None


@tecnicos_bp.route("/api/tecnicos", methods=["GET"])
def obtener_tecnicos():
    try:
        with cursor_de_bd(dictionary=True) as (_, cursor):
            cursor.execute("SELECT id, nombre, especialidad FROM tecnico ORDER BY id DESC")
            return jsonify({"success": True, "tecnicos": cursor.fetchall()}), 200
    except DatabaseUnavailableError:
        return jsonify({"success": False, "message": "No se pudo conectar a la base de datos"}), 500
    except Error:
        current_app.logger.exception("Error al consultar técnicos")
        return jsonify({"success": False, "message": "No se pudieron consultar los técnicos"}), 500


@tecnicos_bp.route("/api/tecnicos/catalogo", methods=["GET"])
def catalogo_tecnicos():
    try:
        with cursor_de_bd(dictionary=True) as (_, cursor):
            cursor.execute("SELECT id, nombre FROM tecnico ORDER BY nombre")
            return jsonify({"success": True, "tecnicos": cursor.fetchall()}), 200
    except DatabaseUnavailableError:
        return jsonify({"success": False, "message": "No se pudo conectar a la base de datos"}), 500
    except Error:
        current_app.logger.exception("Error al consultar catálogo de técnicos")
        return jsonify({"success": False, "message": "No se pudieron consultar los técnicos"}), 500


@tecnicos_bp.route("/api/tecnicos", methods=["POST"])
def crear_tecnico():
    datos, error = validar_tecnico(request.get_json(silent=True))
    if error:
        return error

    try:
        with cursor_de_bd() as (conexion, cursor):
            cursor.execute(
                "INSERT INTO tecnico (nombre, especialidad) VALUES (%s, %s)",
                (datos["nombre"], datos["especialidad"]),
            )
            conexion.commit()
            return jsonify({
                "success": True,
                "message": "Técnico creado",
                "id": cursor.lastrowid,
            }), 201
    except DatabaseUnavailableError:
        return jsonify({"success": False, "message": "No se pudo conectar a la base de datos"}), 500
    except Error:
        current_app.logger.exception("Error al crear técnico")
        return jsonify({"success": False, "message": "No se pudo crear el técnico"}), 500


@tecnicos_bp.route("/api/tecnicos/<int:tecnico_id>", methods=["PUT"])
def actualizar_tecnico(tecnico_id):
    datos, error = validar_tecnico(request.get_json(silent=True))
    if error:
        return error

    try:
        with cursor_de_bd() as (conexion, cursor):
            cursor.execute(
                "UPDATE tecnico SET nombre = %s, especialidad = %s WHERE id = %s",
                (datos["nombre"], datos["especialidad"], tecnico_id),
            )
            if cursor.rowcount == 0:
                return jsonify({"success": False, "message": "Técnico no encontrado o sin cambios"}), 404
            conexion.commit()
            return jsonify({"success": True, "message": "Técnico actualizado"}), 200
    except DatabaseUnavailableError:
        return jsonify({"success": False, "message": "No se pudo conectar a la base de datos"}), 500
    except Error:
        current_app.logger.exception("Error al actualizar técnico")
        return jsonify({"success": False, "message": "No se pudo actualizar el técnico"}), 500


@tecnicos_bp.route("/api/tecnicos/<int:tecnico_id>", methods=["DELETE"])
def eliminar_tecnico(tecnico_id):
    try:
        with cursor_de_bd() as (conexion, cursor):
            cursor.execute("DELETE FROM tecnico WHERE id = %s", (tecnico_id,))
            if cursor.rowcount == 0:
                return jsonify({"success": False, "message": "Técnico no encontrado"}), 404
            conexion.commit()
            return jsonify({"success": True, "message": "Técnico eliminado"}), 200
    except DatabaseUnavailableError:
        return jsonify({"success": False, "message": "No se pudo conectar a la base de datos"}), 500
    except IntegrityError:
        return jsonify({
            "success": False,
            "message": "No se puede eliminar este técnico porque tiene servicios asociados",
        }), 409
    except Error:
        current_app.logger.exception("Error al eliminar técnico")
        return jsonify({"success": False, "message": "No se pudo eliminar el técnico"}), 500
