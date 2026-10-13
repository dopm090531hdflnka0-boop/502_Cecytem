# Proyecto Servicios Técnicos

Aplicación de práctica con React, Flask y MySQL: inicio de sesión, rutas protegidas y operaciones CRUD para clientes, técnicos y servicios.

## Requisitos

- Python 3.10 o posterior
- Node.js y npm
- MySQL

## Preparar MySQL

Ejecuta `database/tecnico.sql` en MySQL Workbench o en la consola de MySQL. El script crea la base `tecnico`, usuarios de práctica y las tablas `cliente`, `tecnico` y `servicio` con sus relaciones.

Usuario para probar el login: `admin` / `12345`.

Si MySQL no usa `root` sin contraseña, define estas variables de entorno antes de iniciar Flask:

- `DB_HOST` (predeterminado `localhost`)
- `DB_USER` (predeterminado `root`)
- `DB_PASSWORD` (predeterminado vacío)
- `DB_NAME` (predeterminado `tecnico`)

## Iniciar el backend

Desde `backend`:

```powershell
.\venv\Scripts\Activate.ps1
python -m app.main
```

La API queda en `http://127.0.0.1:5000`.

## Iniciar React

En otra terminal, desde `frontend`:

```powershell
npm install
npm run dev
```

Abre la URL que muestre Vite, normalmente `http://localhost:5173`.

## Rutas de la API

| Método | Ruta | Uso |
| --- | --- | --- |
| POST | `/api/login` | Validar usuario |
| GET, POST | `/api/clientes` | Consultar y crear clientes |
| PUT, DELETE | `/api/clientes/<id>` | Actualizar y eliminar clientes |
| GET | `/api/clientes/catalogo` | Catálogo para servicios |
| GET, POST | `/api/tecnicos` | Consultar y crear técnicos |
| PUT, DELETE | `/api/tecnicos/<id>` | Actualizar y eliminar técnicos |
| GET | `/api/tecnicos/catalogo` | Catálogo para servicios |
| GET, POST | `/api/servicios` | Consultar y crear servicios |
| PUT, DELETE | `/api/servicios/<id>` | Actualizar y eliminar servicios |

Las rutas de la interfaz `/dashboard`, `/clientes`, `/tecnicos` y `/servicios` requieren iniciar sesión.

## Consideraciones

La contraseña en texto plano se conserva únicamente para ajustarse a la práctica introductoria. No debe usarse así en una aplicación real. La protección de rutas de React es del lado del cliente y no sustituye la autenticación/autorización del backend.
