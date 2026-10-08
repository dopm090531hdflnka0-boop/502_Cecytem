from flask import Blueprint, jsonify, request

from app.config.conexion import conectar

login_bp = Blueprint("login", __name__)


@login_bp.route("/api/login", methods=["POST"])
def login():
    datos = request.get_json(silent=True) or {}
    username = datos.get("username")
    password = datos.get("password")

    if not username or not password:
        return jsonify({
            "success": False,
            "message": "Username y contraseña son obligatorios"
        }), 400

    conexion = conectar()
    if conexion is None:
        return jsonify({
            "success": False,
            "message": "No se pudo conectar con la base de datos"
        }), 500

    cursor = None
    try:
        cursor = conexion.cursor()
        consulta = """
            SELECT username
            FROM usuario
            WHERE username = %s
            AND password = %s
        """
        cursor.execute(consulta, (username, password))
        usuario = cursor.fetchone()

        if usuario:
            return jsonify({
                "success": True,
                "message": "Inicio de sesión correcto",
                "username": usuario[0]
            }), 200

        return jsonify({
            "success": False,
            "message": "Usuario o contraseña incorrectos"
        }), 401

    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Error en la consulta: {str(e)}"
        }), 500

    finally:
        if cursor is not None:
            cursor.close()
        if conexion is not None:
            conexion.close()
