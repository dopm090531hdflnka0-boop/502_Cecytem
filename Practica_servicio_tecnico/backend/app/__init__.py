from flask import Flask
from flask_cors import CORS

from app.routes.clientes import clientes_bp
from app.routes.login import login_bp
from app.routes.servicios import servicios_bp
from app.routes.tecnicos import tecnicos_bp


def create_app():
    app = Flask(__name__)
    CORS(app)
    app.register_blueprint(login_bp)
    app.register_blueprint(clientes_bp)
    app.register_blueprint(tecnicos_bp)
    app.register_blueprint(servicios_bp)
    return app
