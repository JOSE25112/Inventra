
from sqlalchemy import text
from app.database import engine

try:
    with engine.connect() as connection:
        result = connection.execute(
            text("SELECT current_database(), current_user")
        )

        database, usuario = result.one()

        print("Conexión exitosa con PostgreSQL")
        print(f"Base de datos: {database}")
        print(f"Usuario: {usuario}")

except Exception as error:
    print("Error al conectar con PostgreSQL")
    print(error)
