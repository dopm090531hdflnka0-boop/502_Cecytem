from app.config.conexion import conectar

conexion = conectar()

if conexion:
    print("==============================")
    print("CONEXIÓN EXITOSA")
    print("Base de datos: tecnico")
    print("==============================")
    conexion.close()
else:
    print("==============================")
    print("ERROR DE CONEXIÓN")
    print("==============================")
