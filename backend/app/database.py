import os 
from  pathlib import Path
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from sqlalchemy.engine import URL

#localizar el archivo .env dentro del backend
BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")

if os.getenv("DB_HOST"):
    # Configuración para Docker
    DATABASE_URL = URL.create(
        drivername="postgresql+psycopg",
        username=os.environ["DB_USER"],
        password=os.environ["DB_PASSWORD"],
        host=os.environ["DB_HOST"],
        port=int(os.getenv("DB_PORT", "5432")),
        database=os.environ["DB_NAME"],
    )
else:
    # Configuración local existente
    DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL no está configurada en el archivo .env")
# Motor de conexión a la base de datos
engine = create_engine(DATABASE_URL, pool_pre_ping=True)

#fabrica de seciones de la base de datos
SessionLocal = sessionmaker(
    bind=engine,
    autocommit=False,
    expire_on_commit=False)

#clase base para los modelos de la base de datos
class Base(DeclarativeBase):
    pass

#depedencias para los endpoints de la fastAPI
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
