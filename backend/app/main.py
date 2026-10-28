
from fastapi import FastAPI,Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from sqlalchemy.orm import Session
from app.routes import router
from app.movimientos import router as movimientos_router
from app.database import get_db
from app.auth import router as auth_router
from app.usuarios import router as usuarios_router
from app.dashboard import router as dashboard_router
app = FastAPI(
    title="Inventra API",
    description="API REST para gestión de inventarios",
    version="0.1.0"
)
app.include_router(router)

app.include_router(movimientos_router)

app.include_router(auth_router)

app.include_router(usuarios_router)

app.include_router(dashboard_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173",
    "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {
        "message": "Bienvenido a Inventra API",
        "version": "0.1.0"
    }


@app.get("/api/health")
def health_check():
    return {
        "status": "ok",
        "service": "inventra-backend"
    }

@app.get("/api/health/db")
def verificar_base_de_datos(db: Session = Depends(get_db)):
    db.execute(text("SELECT 1"))

    return{
        "status": "ok",
        "database": "conectada",
        "message": "La conexión a la base de datos es exitosa con postgreSQL"
    }