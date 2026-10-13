from contextlib import contextmanager

from app.config.conexion import conectar


class DatabaseUnavailableError(RuntimeError):
    pass


@contextmanager
def cursor_de_bd(dictionary=False):
    conexion = conectar()
    if conexion is None:
        raise DatabaseUnavailableError

    cursor = None
    try:
        cursor = conexion.cursor(dictionary=dictionary)
        yield conexion, cursor
    except Exception:
        conexion.rollback()
        raise
    finally:
        if cursor is not None:
            cursor.close()
        conexion.close()
