
import pytest

from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session
from sqlalchemy.pool import StaticPool

from app.database import Base, get_db
from app.main import app
from app.models import Categoria, Producto, Usuario
from app.security import get_current_user, require_admin


@pytest.fixture
def client():
    engine = create_engine(
        "sqlite+pysqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )

    Base.metadata.create_all(bind=engine)

    with Session(engine) as db:
        admin = Usuario(
            nombre="Administrador Test",
            email="admin@test.local",
            password_hash="NO_LOGIN_TEST",
            rol="admin"
        )
        db.add(admin)

        categoria = Categoria(
            nombre="Computadoras",
            descripcion="Equipos de prueba"
        )
        db.add(categoria)
        db.commit()

        db.refresh(admin)

        admin_id = admin.id

    def override_db():
        with Session(engine) as db:
            yield db

    def override_user():
        with Session(engine) as db:
            return db.get(Usuario, admin_id)

    app.dependency_overrides[get_db] = override_db
    app.dependency_overrides[get_current_user] = override_user
    app.dependency_overrides[require_admin] = override_user

    try:
        with TestClient(app) as test_client:
            yield test_client
    finally:
        app.dependency_overrides.clear()
        engine.dispose()


def test_listar_categorias(client):
    response = client.get("/api/categorias")

    assert response.status_code == 200
    assert len(response.json()) == 1
    assert response.json()[0]["nombre"] == "Computadoras"


def test_crear_producto_stock_cero(client):
    response = client.post(
        "/api/productos",
        json={
            "sku": "TEST-001",
            "nombre": "Laptop de prueba",
            "descripcion": "Producto para testing",
            "precio": "12000.00",
            "stock_minimo": 3,
            "categoria_id": 1
        }
    )

    assert response.status_code == 201
    assert response.json()["stock"] == 0


def test_no_permitir_stock_directo(client):
    response = client.post(
        "/api/productos",
        json={
            "sku": "TEST-002",
            "nombre": "Monitor de prueba",
            "precio": "3000.00",
            "stock": 100,
            "stock_minimo": 2,
            "categoria_id": 1
        }
    )

    assert response.status_code == 422



def test_rechazar_salida_sin_stock(client):
    crear = client.post(
        "/api/productos",
        json={
            "sku": "TEST-003",
            "nombre": "Producto sin existencias",
            "precio": "500.00",
            "stock_minimo": 2,
            "categoria_id": 1
        }
    )

    assert crear.status_code == 201

    producto_id = crear.json()["id"]

    salida = client.post(
        "/api/movimientos",
        json={
            "producto_id": producto_id,
            "tipo": "salida",
            "cantidad": 5
        }
    )

    assert salida.status_code == 409

    consulta = client.get(f"/api/productos/{producto_id}")

    assert consulta.status_code == 200
    assert consulta.json()["stock"] == 0
