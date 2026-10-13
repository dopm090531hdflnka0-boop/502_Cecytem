from flask import Blueprint, current_app, jsonify, request
from mysql.connector import Error, IntegrityError

from app.services.database import DatabaseUnavailableError, cursor_de_bd

clientes_bp = Blueprint("clientes", __name__)


def validar_cliente(datos):
    if not isinstance(datos, dict):
        return None, (jsonify({"success": False, "message": "JSON válido requerido"}), 400)

    nombre = datos.get("nombre")
    if not isinstance(nombre, str) or not nombre.strip():
        return None, (jsonify({"success": False, "message": "El nombre es obligatorio"}), 400)

    return {"nombre": nombre.strip()}, None


@clientes_bp.route("/api/clientes", methods=["GET"])
def obtener_clientes():
    try:
        with cursor_de_bd(dictionary=True) as (_, cursor):
            cursor.execute("SELECT id, nombre FROM cliente ORDER BY id DESC")
            return jsonify({"success": True, "clientes": cursor.fetchall()}), 200
    except DatabaseUnavailableError:
        return jsonify({"success": False, "message": "No se pudo conectar a la base de datos"}), 500
    except Error:
        current_app.logger.exception("Error al consultar clientes")
        return jsonify({"success": False, "message": "No se pudieron consultar los clientes"}), 500


@clientes_bp.route("/api/clientes/catalogo", methods=["GET"])
def catalogo_clientes():
    try:
        with cursor_de_bd(dictionary=True) as (_, cursor):
            cursor.execute("SELECT id, nombre FROM cliente ORDER BY nombre")
            return jsonify({"success": True, "clientes": cursor.fetchall()}), 200
    except DatabaseUnavailableError:
        return jsonify({"success": False, "message": "No se pudo conectar a la base de datos"}), 500
    except Error:
        current_app.logger.exception("Error al consultar catálogo de clientes")
        return jsonify({"success": False, "message": "No se pudieron consultar los clientes"}), 500


@clientes_bp.route("/api/clientes", methods=["POST"])
def crear_cliente():
    datos, error = validar_cliente(request.get_json(silent=True))
    if error:
        return error

    try:
        with cursor_de_bd() as (conexion, cursor):
            cursor.execute(
                "INSERT INTO cliente (nombre) VALUES (%s)",
                (datos["nombre"],),
            )
            conexion.commit()
            return jsonify({
                "success": True,
                "message": "Cliente creado",
                "id": cursor.lastrowid,
            }), 201
    except DatabaseUnavailableError:
        return jsonify({"success": False, "message": "No se pudo conectar a la base de datos"}), 500
    except Error:
        current_app.logger.exception("Error al crear cliente")
        return jsonify({"success": False, "message": "No se pudo crear el cliente"}), 500


@clientes_bp.route("/api/clientes/<int:cliente_id>", methods=["PUT"])
def actualizar_cliente(cliente_id):
    datos, error = validar_cliente(request.get_json(silent=True))
    if error:
        return error

    try:
        with cursor_de_bd() as (conexion, cursor):
            cursor.execute(
                "UPDATE cliente SET nombre = %s WHERE id = %s",
                (datos["nombre"], cliente_id),
            )
            if cursor.rowcount == 0:
                return jsonify({"success": False, "message": "Cliente no encontrado o sin cambios"}), 404
            conexion.commit()
            return jsonify({"success": True, "message": "Cliente actualizado"}), 200
    except DatabaseUnavailableError:
        return jsonify({"success": False, "message": "No se pudo conectar a la base de datos"}), 500
    except Error:
        current_app.logger.exception("Error al actualizar cliente")
        return jsonify({"success": False, "message": "No se pudo actualizar el cliente"}), 500


@clientes_bp.route("/api/clientes/<int:cliente_id>", methods=["DELETE"])
def eliminar_cliente(cliente_id):
    try:
        with cursor_de_bd() as (conexion, cursor):
            cursor.execute("DELETE FROM cliente WHERE id = %s", (cliente_id,))
            if cursor.rowcount == 0:
                return jsonify({"success": False, "message": "Cliente no encontrado"}), 404
            conexion.commit()
            return jsonify({"success": True, "message": "Cliente eliminado"}), 200
    except DatabaseUnavailableError:
        return jsonify({"success": False, "message": "No se pudo conectar a la base de datos"}), 500
    except IntegrityError:
        return jsonify({
            "success": False,
            "message": "No se puede eliminar este cliente porque tiene servicios asociados",
        }), 409
    except Error:
        current_app.logger.exception("Error al eliminar cliente")
        return jsonify({"success": False, "message": "No se pudo eliminar el cliente"}), 500
