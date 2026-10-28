# Inventra — Sistema de Gestión de Inventarios

Sistema web Full Stack para administrar productos, categorías, usuarios y movimientos de almacén.

## Tecnologías

**Backend**
- Python
- FastAPI
- SQLAlchemy
- PostgreSQL
- Alembic
- Autenticación JWT

**Frontend**
- React
- TypeScript
- Vite
- React Router

**Testing**
- Pytest
- FastAPI TestClient

## Funcionalidades

- Inicio de sesión con autenticación JWT.
- Gestión de usuarios con roles de administrador y empleado.
- Administración de productos y categorías.
- Registro de entradas y salidas de inventario.
- Validaciones para evitar existencias negativas.
- Historial de movimientos asociado a usuarios.
- Dashboard con estadísticas y alertas de stock.
- API REST documentada mediante Swagger.

## Arquitectura

Frontend React → API FastAPI → PostgreSQL

La aplicación utiliza SQLAlchemy para el acceso a datos y Alembic para gestionar migraciones.

## Instalación local

### Backend

```bash
cd backend
python -m venv .venv
python -m pip install -r requirements.txt
```

Configurar las variables de entorno utilizando un archivo `.env` local.

```bash
python -m alembic upgrade head
python -m uvicorn app.main:app --reload
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## Seguridad

- Contraseñas almacenadas mediante hashes Argon2.
- Autenticación JWT.
- Autorización basada en roles.
- Validación de solicitudes.
- Operaciones de inventario mediante transacciones.

## Estado del proyecto

En desarrollo. Aplicación preparada para demostraciones locales. Pendientes: pruebas de integración completas, endurecimiento de seguridad y despliegue de producción.

## Autor

Proyecto personal de desarrollo Full Stack para portafolio profesional.