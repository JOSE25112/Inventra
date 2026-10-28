
from getpass import getpass

from sqlalchemy import select

from app.database import SessionLocal
from app.models import Usuario
from app.security import hash_password


def main():
    nombre = input("Nombre: ").strip()
    email = input("Correo: ").strip().lower()
    password = getpass("Contraseña: ")
    confirmacion = getpass("Confirmar contraseña: ")

    if not nombre or not email:
        print("Nombre y correo son obligatorios")
        return

    if len(password) < 12 or password != confirmacion:
        print(
            "La contraseña debe tener al menos 12 caracteres "
            "y coincidir con la confirmación"
        )
        return

    with SessionLocal() as db:
        existe = db.scalar(
            select(Usuario).where(Usuario.email == email)
        )

        if existe:
            print("Ya existe un usuario con ese correo")
            return

        usuario = Usuario(
            nombre=nombre,
            email=email,
            password_hash=hash_password(password),
            rol="admin"
        )

        db.add(usuario)
        db.commit()

        print("Administrador creado correctamente")


if __name__ == "__main__":
    main()
