import mysql.connector
from mysql.connector import Error


HOST = "localhost"
USER = "root"
PASSWORD = ""
DATABASE = "tecnico"

def conectar():
    try:
        conexion = mysql.connector.connect(
            host=HOST,
            user=USER,
            password=PASSWORD,
            database=DATABASE
        )
        if conexion.is_connected():
            print("Conexión exitosa a la base de datos")
            return conexion
    except Error as e:
        print(f"Error al conectar a la base de datos: {e}")
    return None
        